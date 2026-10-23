//! @bion dire (en Rust) : toutes les langues. La phrase française est la clé (comme gettext) ; {n} = un nombre ; « a · b » se traduit
//! morceau par morceau ; les glyphes autour des mots restent. Le même calcul que src/bions/dire.js.

use serde_json::Value;

pub const LANGUES: &[(&str, &str)] = &[("fr", "français"), ("en", "English"), ("de", "Deutsch"), ("it", "italiano"), ("es", "español")];

/// la langue de l'app : le réglage, sinon la première langue connue de l'iPhone, sinon le français
pub fn langue_de(reglage: Option<&str>, preferees: &[String]) -> &'static str {
    let connue = |c: &str| LANGUES.iter().find(|l| l.0 == c).map(|l| l.0);
    if let Some(r) = reglage.filter(|r| *r != "auto") {
        if let Some(c) = connue(r) {
            return c;
        }
    }
    for p in preferees {
        let c = p.to_lowercase();
        let c = c.split(['-', '_']).next().unwrap_or("");
        if let Some(c) = connue(c) {
            return c;
        }
    }
    "fr"
}

/// un modèle « … {n} … » coupé en morceaux littéraux
struct Modele {
    morceaux: Vec<String>,
    traduction: String,
}

pub struct Dire {
    exact: std::collections::HashMap<String, String>,
    modeles: Vec<Modele>,
}

/// \d+(?:[.,]\d+)? au début de s : les longueurs possibles, de la plus longue à la plus courte (le retour arrière de la regex)
fn nombres_au_debut(s: &str) -> Vec<usize> {
    let b = s.as_bytes();
    let mut i = 0;
    while i < b.len() && b[i].is_ascii_digit() {
        i += 1;
    }
    if i == 0 {
        return vec![];
    }
    let mut out = Vec::new();
    if i < b.len() && (b[i] == b'.' || b[i] == b',') {
        let mut j = i + 1;
        while j < b.len() && b[j].is_ascii_digit() {
            j += 1;
        }
        for k in (i + 2..=j).rev() {
            out.push(k);
        }
    }
    for k in (1..=i).rev() {
        out.push(k);
    }
    out
}

fn correspond<'a>(morceaux: &[String], s: &'a str, prises: &mut Vec<&'a str>) -> bool {
    let (premier, reste) = morceaux.split_first().expect("au moins un morceau");
    let Some(apres) = s.strip_prefix(premier.as_str()) else { return false };
    if reste.is_empty() {
        return apres.is_empty();
    }
    for l in nombres_au_debut(apres) {
        prises.push(&apres[..l]);
        if correspond(reste, &apres[l..], prises) {
            return true;
        }
        prises.pop();
    }
    false
}

fn lettre(c: char) -> bool {
    c.is_alphabetic() || c.is_numeric()
}

impl Dire {
    /// dico = { « phrase française » : « traduction » }
    pub fn nouveau(dico: &Value) -> Dire {
        let mut exact = std::collections::HashMap::new();
        let mut modeles = Vec::new();
        if let Some(o) = dico.as_object() {
            for (fr, t) in o {
                let Some(t) = t.as_str().filter(|t| !t.is_empty()) else { continue };
                if fr.contains("{n}") {
                    modeles.push(Modele { morceaux: fr.split("{n}").map(String::from).collect(), traduction: t.to_string() });
                } else {
                    exact.insert(fr.clone(), t.to_string());
                }
            }
        }
        Dire { exact, modeles }
    }

    fn mot(&self, s: &str) -> Option<String> {
        if s.is_empty() {
            return None;
        }
        if let Some(t) = self.exact.get(s) {
            return Some(t.clone());
        }
        for m in &self.modeles {
            let mut prises = Vec::new();
            if correspond(&m.morceaux, s, &mut prises) {
                let mut it = prises.into_iter();
                let mut out = String::new();
                let mut parties = m.traduction.split("{n}").peekable();
                while let Some(p) = parties.next() {
                    out += p;
                    if parties.peek().is_some() {
                        out += it.next().unwrap_or("undefined");
                    }
                }
                return Some(out);
            }
        }
        None
    }

    /// les glyphes et la ponctuation autour des mots restent ; le cœur se traduit
    fn coeur(&self, s: &str) -> Option<String> {
        let debut = s.char_indices().find(|(_, c)| lettre(*c)).map(|(i, _)| i)?;
        let fin = s.char_indices().filter(|(_, c)| lettre(*c)).last().map(|(i, c)| i + c.len_utf8())?;
        let t = self.mot(&s[debut..fin])?;
        Some(format!("{}{}{}", &s[..debut], t, &s[fin..]))
    }

    /// la traduction d'un texte, ou None (on le laisse tel quel)
    pub fn dire(&self, texte: &str) -> Option<String> {
        let s = texte.trim();
        if s.is_empty() || !s.chars().any(|c| c.is_alphabetic()) {
            return None;
        }
        let i = texte.find(s).unwrap_or(0);
        let (avant, apres) = (&texte[..i], &texte[i + s.len()..]);
        let mut t = self.mot(s).or_else(|| self.coeur(s));
        if t.is_none() && s.contains(" · ") {
            let mut un = false;
            let l: Vec<String> = s
                .split(" · ")
                .map(|p| match self.mot(p).or_else(|| self.coeur(p)) {
                    Some(x) => {
                        un = true;
                        x
                    }
                    None => p.to_string(),
                })
                .collect();
            if un {
                t = Some(l.join(" · "));
            }
        }
        t.map(|t| format!("{avant}{t}{apres}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    #[test]
    fn toutes_les_langues() {
        let d = Dire::nouveau(&json!({ "vitrine": "showcase", "{n} lieux autour": "{n} places around", "{n} installé(s)": "{n} installed", "à jour tout seul": "updates itself", "web, hors ligne": "web, offline" }));
        assert_eq!(d.dire("▦ vitrine").as_deref(), Some("▦ showcase"));
        assert_eq!(d.dire("  vitrine ").as_deref(), Some("  showcase "));
        assert_eq!(d.dire("9 lieux autour").as_deref(), Some("9 places around"));
        assert_eq!(d.dire("3 installé(s) · ↻ à jour tout seul").as_deref(), Some("3 installed · ↻ updates itself"));
        assert_eq!(d.dire("iPhone · Android · web, hors ligne ›").as_deref(), Some("iPhone · Android · web, offline ›"));
        assert_eq!(d.dire("Café du Grütli"), None);
        assert_eq!(d.dire("⇗ 70 m"), None);
        assert_eq!(langue_de(Some("auto"), &["de-CH".into()]), "de");
        assert_eq!(langue_de(None, &["ja".into()]), "fr");
    }
}
