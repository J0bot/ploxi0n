//! @bion proche (sa part pure, en Rust) : la partition de la basse partagée (tempo, motif ou pas à pas, tonique, gamme, début), les notes à
//! jouer entre deux instants, l'horloge partagée à la NTP. Le même calcul que src/bions/proche.js, pour le natif (la basse qui joue écran
//! verrouillé, sans la WebView) et pour le WASM.

use crate::js::{arrondi, champ, nombre, vrai};
use serde::Serialize;
use serde_json::Value;

pub const GAMMES: &[(&str, &[i32])] = &[
    ("mineur", &[0, 2, 3, 5, 7, 8, 10]),
    ("majeur", &[0, 2, 4, 5, 7, 9, 11]),
    ("phrygien", &[0, 1, 3, 5, 7, 8, 10]),
    ("penta", &[0, 3, 5, 7, 10]),
];

/// un pas : rien, un degré, ou un degré à l'octave du dessus (« +n » en JS)
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Pas {
    Rien,
    Degre(i32),
    Haut(i32),
}

const fn d(x: i32) -> Pas {
    Pas::Degre(x)
}
const R: Pas = Pas::Rien;
pub const MOTIFS: &[(&str, [Pas; 16])] = &[
    ("pulse", [d(0), R, R, R, d(0), R, R, R, d(0), R, R, R, d(0), R, R, R]),
    ("roule", [d(0), R, d(0), R, d(0), R, d(0), d(2), d(0), R, d(0), R, d(4), R, d(3), R]),
    ("tekk", [d(0), R, R, d(0), R, R, d(0), R, R, d(0), R, R, d(4), R, d(3), R]),
    ("marche", [d(0), R, d(2), R, d(4), R, d(2), R, d(0), R, d(2), R, d(4), R, d(6), R]),
    ("dub", [d(0), R, R, R, R, R, d(0), R, Pas::Haut(0), R, R, R, d(4), R, R, R]),
];

pub fn gamme(nom: &str) -> Option<&'static [i32]> {
    GAMMES.iter().find(|(n, _)| *n == nom).map(|(_, g)| *g)
}
pub fn motif(nom: &str) -> Option<&'static [Pas; 16]> {
    MOTIFS.iter().find(|(n, _)| *n == nom).map(|(_, m)| m)
}

/// pasValides : 16 cases, chacune null, un entier 0 à 14, ou « +n » (n ≤ 14) ; sinon rien
pub fn pas_valides(v: Option<&Value>) -> Option<[Pas; 16]> {
    let a = v?.as_array()?;
    if a.len() != 16 {
        return None;
    }
    let mut out = [Pas::Rien; 16];
    for (i, x) in a.iter().enumerate() {
        out[i] = match x {
            Value::Null => Pas::Rien,
            Value::String(s) => {
                let b = s.as_bytes();
                if b.len() >= 2 && b.len() <= 3 && b[0] == b'+' && b[1..].iter().all(|c| c.is_ascii_digit()) {
                    let n: i32 = s[1..].parse().ok()?;
                    if n > 14 {
                        return None;
                    }
                    Pas::Haut(n)
                } else {
                    return None;
                }
            }
            Value::Number(n) => {
                let f = n.as_f64()?;
                if f.fract() != 0.0 || !(0.0..=14.0).contains(&f) {
                    return None;
                }
                Pas::Degre(f as i32)
            }
            _ => return None,
        };
    }
    Some(out)
}

pub fn pas_json(p: &[Pas; 16]) -> Value {
    Value::Array(
        p.iter()
            .map(|x| match x {
                Pas::Rien => Value::Null,
                Pas::Degre(n) => Value::from(*n),
                Pas::Haut(n) => Value::from(format!("+{n}")),
            })
            .collect(),
    )
}

#[derive(Clone, Debug)]
pub struct Partition {
    pub tempo: f64,
    pub motif: String,
    pub pas: Option<[Pas; 16]>,
    pub tonique: f64,
    pub gamme: String,
    pub debut: f64,
    pub volume: f64,
}

/// `Math.round(+x) || defaut` : NaN et 0 donnent le défaut ; un absent (undefined) prend le défaut avant tout
fn rond_ou(v: Option<&Value>, defaut: f64) -> f64 {
    let x = match v {
        None => defaut,
        Some(v) => arrondi(nombre(Some(v))),
    };
    if x.is_nan() || x == 0.0 { defaut } else { x }
}

/// partition : nettoyée et bornée (la même que src/bions/proche.js)
pub fn partition(o: &Value) -> Partition {
    let tempo = rond_ou(champ(o, "tempo"), 120.0).clamp(50.0, 200.0);
    let motif_brut = champ(o, "motif").and_then(|v| v.as_str()).unwrap_or(if champ(o, "motif").is_none() { "pulse" } else { "" });
    let mien = if motif_brut == "mien" { pas_valides(champ(o, "pas")) } else { None };
    let motif_nom = if mien.is_some() {
        "mien".to_string()
    } else if motif(motif_brut).is_some() {
        motif_brut.to_string()
    } else {
        "pulse".to_string()
    };
    let tonique = rond_ou(champ(o, "tonique"), 36.0).clamp(24.0, 52.0);
    let gamme_brute = champ(o, "gamme").and_then(|v| v.as_str()).unwrap_or(if champ(o, "gamme").is_none() { "mineur" } else { "" });
    let gamme_nom = if gamme(gamme_brute).is_some() { gamme_brute } else { "mineur" }.to_string();
    let debut = match champ(o, "debut") {
        None => 0.0,
        Some(v) => {
            let x = nombre(Some(v));
            if x.is_nan() { 0.0 } else { x }
        }
    };
    let volume = match champ(o, "volume") {
        None => 0.8,
        Some(v) => {
            let x = nombre(Some(v));
            if x.is_nan() { 0.0 } else { x.clamp(0.0, 1.0) }
        }
    };
    Partition { tempo, motif: motif_nom, pas: mien, tonique, gamme: gamme_nom, debut, volume }
}

impl Partition {
    pub fn json(&self) -> Value {
        serde_json::json!({
            "tempo": self.tempo, "motif": self.motif, "pas": self.pas.as_ref().map(pas_json).unwrap_or(Value::Null),
            "tonique": self.tonique, "gamme": self.gamme, "debut": self.debut, "volume": self.volume,
        })
    }
    fn note_du(&self, k: usize) -> Option<f64> {
        let seq = match &self.pas {
            Some(p) => p,
            None => motif(&self.motif)?,
        };
        let (haut, deg) = match seq[k] {
            Pas::Rien => return None,
            Pas::Degre(n) => (false, n),
            Pas::Haut(n) => (true, n),
        };
        let g = gamme(&self.gamme)?;
        let l = g.len() as i32;
        Some(self.tonique + if haut { 12.0 } else { 0.0 } + g[(deg % l) as usize] as f64 + 12.0 * (deg / l) as f64)
    }
}

#[derive(Serialize, Debug, PartialEq)]
pub struct Note {
    pub t: f64,
    pub midi: f64,
    pub duree: f64,
}

/// les notes à jouer entre de et a (heures de l'hôte, ms) ; la partition tourne en boucle depuis son début ; 256 au plus
pub fn notes_entre(p: &Partition, de: f64, a: f64) -> Vec<Note> {
    let pas = 60000.0 / p.tempo / 4.0;
    let mut out = Vec::new();
    if !(a > de) {
        return out;
    }
    let mut k = (((de - p.debut) / pas - 1e-9).ceil()).max(0.0);
    let mut t = p.debut + k * pas;
    while t < a && out.len() < 256 {
        if let Some(m) = p.note_du((k as i64 % 16) as usize) {
            out.push(Note { t, midi: m, duree: pas * 0.9 });
        }
        k += 1.0;
        t = p.debut + k * pas;
    }
    out
}

#[derive(Serialize, Debug, Clone, Copy, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Ecart {
    pub decalage: f64,
    pub aller_retour: f64,
}

/// l'horloge à la NTP : ping(t0) → reçu à t1, répondu à t2 → reçu à t3
pub fn ecart(t0: f64, t1: f64, t2: f64, t3: f64) -> Ecart {
    Ecart { decalage: ((t1 - t0) + (t2 - t3)) / 2.0, aller_retour: ((t3 - t0) - (t2 - t1)).max(0.0) }
}

/// la médiane des décalages des 3 allers-retours les plus courts
pub fn meilleur_ecart(mesures: &Value) -> Value {
    let l0: Vec<&Value> = mesures.as_array().map(|a| a.iter().collect()).unwrap_or_default();
    let mut l: Vec<(f64, f64)> = l0
        .iter()
        .filter(|m| vrai(Some(m)))
        .filter_map(|m| {
            let d = champ(m, "decalage")?.as_f64()?;
            let r = champ(m, "allerRetour")?.as_f64()?;
            (d.is_finite() && r.is_finite()).then_some((d, r))
        })
        .collect();
    l.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    l.truncate(3);
    if l.is_empty() {
        return Value::Null;
    }
    let mut d: Vec<f64> = l.iter().map(|x| x.0).collect();
    d.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    serde_json::json!({ "decalage": d[d.len() / 2], "allerRetour": l[0].1, "n": l0.len() })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    #[test]
    fn la_basse() {
        let p = partition(&json!({ "tempo": 0, "motif": "tekk", "tonique": 99, "gamme": "x" }));
        assert_eq!((p.tempo, p.motif.as_str(), p.tonique, p.gamme.as_str()), (120.0, "tekk", 52.0, "mineur"));
        let pas = json!([0, null, 2, null, 4, null, "+0", null, null, null, null, null, 7, null, null, null]);
        let p = partition(&json!({ "tempo": 120, "motif": "mien", "pas": pas, "tonique": 36, "gamme": "mineur" }));
        assert_eq!(p.motif, "mien");
        let n: Vec<f64> = notes_entre(&p, 0.0, 2000.0).iter().map(|x| x.midi).collect();
        assert_eq!(n, vec![36.0, 39.0, 43.0, 48.0, 48.0]);
        assert!(pas_valides(Some(&json!(vec![1; 15]))).is_none());
        assert!(pas_valides(Some(&json!([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "+99"]))).is_none());
        assert_eq!(ecart(0.0, 105.0, 106.0, 10.0).decalage, 100.5);
    }
}
