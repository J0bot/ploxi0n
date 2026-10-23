//! La sémantique de JS là où le code des bions en dépend : `+x` (ToNumber), `x || y` (vérité), `String(x)`, `s.slice(0, n)` (en unités
//! UTF-16). Le cœur Rust doit rendre EXACTEMENT ce que rendent les bions JS (tools/rust-golden.mjs le vérifie).

use serde_json::Value;

/// `+x` : un nombre, ou NaN
pub fn nombre(v: Option<&Value>) -> f64 {
    match v {
        None => f64::NAN,
        Some(Value::Null) => 0.0,
        Some(Value::Bool(b)) => {
            if *b {
                1.0
            } else {
                0.0
            }
        }
        Some(Value::Number(n)) => n.as_f64().unwrap_or(f64::NAN),
        Some(Value::String(s)) => {
            let t = s.trim();
            if t.is_empty() {
                0.0
            } else {
                t.parse::<f64>().unwrap_or(f64::NAN)
            }
        }
        Some(Value::Array(a)) => match a.len() {
            0 => 0.0,
            1 => nombre(a.first()),
            _ => f64::NAN,
        },
        Some(Value::Object(_)) => f64::NAN,
    }
}

/// la vérité de JS (`if (x)`, `x || y`) ; un absent est faux
pub fn vrai(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Number(n)) => n.as_f64().is_some_and(|x| x != 0.0 && !x.is_nan()),
        Some(Value::String(s)) => !s.is_empty(),
        Some(_) => true,
    }
}

/// `a || b || …` : la première valeur vraie, sinon la dernière
pub fn ou<'a>(vs: &[Option<&'a Value>]) -> Option<&'a Value> {
    for v in vs {
        if vrai(*v) {
            return *v;
        }
    }
    vs.last().copied().flatten()
}

/// un nombre écrit comme JS l'écrit (`String(47)` → « 47 », `String(46.52)` → « 46.52 »)
pub fn nombre_texte(x: f64) -> String {
    if x.is_nan() {
        return "NaN".into();
    }
    if x.is_infinite() {
        return if x > 0.0 { "Infinity".into() } else { "-Infinity".into() };
    }
    if x == x.trunc() && x.abs() < 1e21 {
        return format!("{}", x as i64);
    }
    format!("{}", x)
}

/// `String(x)`
pub fn texte(v: Option<&Value>) -> String {
    match v {
        None => "undefined".into(),
        Some(Value::Null) => "null".into(),
        Some(Value::Bool(b)) => b.to_string(),
        Some(Value::Number(n)) => nombre_texte(n.as_f64().unwrap_or(f64::NAN)),
        Some(Value::String(s)) => s.clone(),
        Some(Value::Array(a)) => a.iter().map(|x| match x {
            Value::Null => String::new(),
            _ => texte(Some(x)),
        }).collect::<Vec<_>>().join(","),
        Some(Value::Object(_)) => "[object Object]".into(),
    }
}

/// `s.slice(0, n)` : JS compte en unités UTF-16
pub fn debut(s: &str, n: usize) -> String {
    let u: Vec<u16> = s.encode_utf16().take(n).collect();
    String::from_utf16_lossy(&u)
}

/// `Math.round` de JS (le demi va vers +∞)
pub fn arrondi(x: f64) -> f64 {
    (x + 0.5).floor()
}

/// un champ d'un objet JSON
pub fn champ<'a>(v: &'a Value, k: &str) -> Option<&'a Value> {
    match v {
        Value::Object(o) => o.get(k),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    #[test]
    fn comme_js() {
        assert_eq!(nombre(Some(&json!("6.63"))), 6.63);
        assert_eq!(nombre(Some(&json!(""))), 0.0);
        assert!(nombre(None).is_nan());
        assert_eq!(nombre(Some(&json!(null))), 0.0);
        assert!(!vrai(Some(&json!(0))));
        assert!(vrai(Some(&json!([]))));
        assert_eq!(texte(Some(&json!(47.0))), "47");
        assert_eq!(texte(Some(&json!(46.52))), "46.52");
        assert_eq!(texte(Some(&json!(["E-Bike", null, 3]))), "E-Bike,,3");
        assert_eq!(debut("a😀b", 2), "a\u{FFFD}");
        assert_eq!(arrondi(2.5), 3.0);
        assert_eq!(arrondi(-2.5), -2.0);
    }
}
