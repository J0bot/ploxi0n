//! Un lexeur JS juste assez fidèle pour digérer : les commentaires disparaissent ; les chaînes, les gabarits (`…${…}…`) et les regex sont des
//! jetons à part (ce qui est écrit DANS une chaîne n'est pas du code) ; le reste : des identifiants, des nombres, de la ponctuation.
//! Jamais d'exécution : le code d'un ploxion est une donnée.

#[derive(Debug, Clone, PartialEq)]
pub enum Jeton {
    Ident(String),
    /// une chaîne '…' ou "…", ou un morceau littéral de gabarit
    Texte(String),
    Regex,
    Nombre,
    Ponct(char),
}

const MOTS_AVANT_REGEX: &[&str] = &["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "instanceof", "yield", "await"];

fn ident_debut(c: char) -> bool {
    c.is_alphabetic() || c == '_' || c == '$'
}
fn ident_suite(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$' || c == '\u{200c}' || c == '\u{200d}'
}

/// un '/' ici commence-t-il une regex ? (après un opérateur, une ouverture, un mot-clé ; pas après une valeur)
fn regex_possible(prec: Option<&Jeton>) -> bool {
    match prec {
        None => true,
        Some(Jeton::Ponct(c)) => !matches!(c, ')' | ']' | '}'),
        Some(Jeton::Ident(m)) => MOTS_AVANT_REGEX.contains(&m.as_str()),
        Some(Jeton::Texte(_)) | Some(Jeton::Regex) | Some(Jeton::Nombre) => false,
    }
}

pub fn jetons(src: &str) -> Vec<Jeton> {
    let c: Vec<char> = src.chars().collect();
    let n = c.len();
    let mut out: Vec<Jeton> = Vec::with_capacity(n / 4);
    let mut i = 0;
    // la pile des gabarits ouverts : pour chacun, la profondeur d'accolades de son ${ … } en cours
    let mut gabarits: Vec<usize> = Vec::new();
    // lire un morceau de gabarit à partir de i (juste après ` ou }) jusqu'à ` (fin) ou ${ (une expression)
    fn morceau(c: &[char], mut i: usize, out: &mut Vec<Jeton>) -> (usize, bool) {
        let mut s = String::new();
        while i < c.len() {
            match c[i] {
                '\\' => {
                    if i + 1 < c.len() {
                        s.push(c[i + 1]);
                    }
                    i += 2;
                }
                '`' => {
                    out.push(Jeton::Texte(s));
                    return (i + 1, false);
                }
                '$' if i + 1 < c.len() && c[i + 1] == '{' => {
                    out.push(Jeton::Texte(s));
                    return (i + 2, true);
                }
                x => {
                    s.push(x);
                    i += 1;
                }
            }
        }
        out.push(Jeton::Texte(s));
        (i, false)
    }
    while i < n {
        let x = c[i];
        if x.is_whitespace() {
            i += 1;
            continue;
        }
        // les commentaires
        if x == '/' && i + 1 < n && c[i + 1] == '/' {
            while i < n && c[i] != '\n' {
                i += 1;
            }
            continue;
        }
        if x == '/' && i + 1 < n && c[i + 1] == '*' {
            i += 2;
            while i + 1 < n && !(c[i] == '*' && c[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }
        if x == '\'' || x == '"' {
            let mut s = String::new();
            i += 1;
            while i < n && c[i] != x && c[i] != '\n' {
                if c[i] == '\\' && i + 1 < n {
                    s.push(c[i + 1]);
                    i += 2;
                } else {
                    s.push(c[i]);
                    i += 1;
                }
            }
            i += 1;
            out.push(Jeton::Texte(s));
            continue;
        }
        if x == '`' {
            let (j, expr) = morceau(&c, i + 1, &mut out);
            i = j;
            if expr {
                gabarits.push(0);
            }
            continue;
        }
        if x == '{' {
            if let Some(p) = gabarits.last_mut() {
                *p += 1;
            }
            out.push(Jeton::Ponct('{'));
            i += 1;
            continue;
        }
        if x == '}' {
            match gabarits.last_mut() {
                Some(0) => {
                    gabarits.pop();
                    let (j, expr) = morceau(&c, i + 1, &mut out);
                    i = j;
                    if expr {
                        gabarits.push(0);
                    }
                }
                Some(p) => {
                    *p -= 1;
                    out.push(Jeton::Ponct('}'));
                    i += 1;
                }
                None => {
                    out.push(Jeton::Ponct('}'));
                    i += 1;
                }
            }
            continue;
        }
        if x == '/' && regex_possible(out.last()) {
            i += 1;
            let mut classe = false;
            while i < n && c[i] != '\n' {
                match c[i] {
                    '\\' => i += 1,
                    '[' => classe = true,
                    ']' => classe = false,
                    '/' if !classe => break,
                    _ => {}
                }
                i += 1;
            }
            i += 1;
            while i < n && ident_suite(c[i]) {
                i += 1;
            }
            out.push(Jeton::Regex);
            continue;
        }
        if ident_debut(x) {
            let d = i;
            while i < n && ident_suite(c[i]) {
                i += 1;
            }
            out.push(Jeton::Ident(c[d..i].iter().collect()));
            continue;
        }
        if x.is_ascii_digit() || (x == '.' && i + 1 < n && c[i + 1].is_ascii_digit()) {
            while i < n && (c[i].is_ascii_alphanumeric() || c[i] == '.' || c[i] == '_') {
                i += 1;
            }
            out.push(Jeton::Nombre);
            continue;
        }
        out.push(Jeton::Ponct(x));
        i += 1;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn lexe() {
        let j = jetons("// jOSFaux\nconst a = '<div>' + `x ${ b + '<p>' } y` ; /* innerHTML */ el.innerHTML = s.replace(/\\/'/g, '');");
        assert!(j.contains(&Jeton::Texte("<div>".into())));
        assert!(j.contains(&Jeton::Texte("<p>".into())));
        assert!(j.contains(&Jeton::Texte(" y".into())));
        assert!(j.contains(&Jeton::Regex));
        assert!(!j.contains(&Jeton::Ident("jOSFaux".into())));
        assert_eq!(j.iter().filter(|x| **x == Jeton::Ident("innerHTML".into())).count(), 1);
    }
}
