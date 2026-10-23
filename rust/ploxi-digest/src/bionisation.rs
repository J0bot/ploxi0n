//! La bionisation (RS-7 23.10 : « des fois il faut rebâtir certaines choses quand il y a assez de bions pour que le ploxion soit uniquement
//! fait de bions ; c'est là le challenge : que les ploxions soient faits que de bions »).
//!
//! Sur TOUS les ploxions à la fois :
//! - les fonctions qui se répètent d'un ploxion à l'autre (copiées, ou recopiées en changeant les noms) = des bions déguisés, à extraire ;
//! - les gabarits HTML qui se répètent (la même ossature de balises et de classes) = des bions d'interface à créer ;
//! - pour chaque ploxion, ce qui n'est PAS un bion (le reste à bioniser).

use crate::lexeur::Jeton;
use serde::Serialize;
use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::hash::{Hash, Hasher};

const MOTS: &[&str] = &["if", "for", "while", "switch", "catch", "function", "return", "typeof", "new", "else", "do", "try", "with"];
/// une fonction trop petite n'est pas un bion (un getter, une ligne)
pub const MIN_JETONS: usize = 40;

/// une fonction : son nom et ses jetons (de l'accolade ouvrante à la fermante)
pub struct Fonction<'a> {
    pub nom: String,
    pub corps: &'a [Jeton],
}

fn fermante(j: &[Jeton], ouvre: usize) -> Option<usize> {
    let mut p = 0usize;
    for (k, x) in j.iter().enumerate().skip(ouvre) {
        match x {
            Jeton::Ponct('{') => p += 1,
            Jeton::Ponct('}') => {
                p -= 1;
                if p == 0 {
                    return Some(k);
                }
            }
            _ => {}
        }
    }
    None
}
fn apres_parentheses(j: &[Jeton], ouvre: usize) -> Option<usize> {
    let mut p = 0i32;
    for (k, x) in j.iter().enumerate().skip(ouvre) {
        match x {
            Jeton::Ponct('(') => p += 1,
            Jeton::Ponct(')') => {
                p -= 1;
                if p == 0 {
                    return Some(k + 1);
                }
            }
            _ => {}
        }
    }
    None
}

/// les fonctions d'un ploxion : function f(…) {…}, f = (…) => {…}, f = function (…) {…}, f(…) {…} (méthode)
pub fn fonctions(j: &[Jeton]) -> Vec<Fonction<'_>> {
    let mut out = Vec::new();
    let id = |k: usize| match j.get(k) { Some(Jeton::Ident(s)) => Some(s.as_str()), _ => None };
    let pc = |k: usize, c: char| j.get(k) == Some(&Jeton::Ponct(c));
    for k in 0..j.len() {
        let Some(nom) = id(k) else { continue };
        if MOTS.contains(&nom) && nom != "function" { continue; }
        // function nom ( … ) {
        let (n, par) = if nom == "function" {
            match id(k + 1) { Some(n) if pc(k + 2, '(') => (n.to_string(), k + 2), _ => continue }
        } else if pc(k + 1, '=') && !pc(k + 2, '=') {
            // nom = ( … ) => {   |   nom = x => {   |   nom = function ( … ) {   |   nom = async (…) => {
            let mut d = k + 2;
            if id(d) == Some("async") { d += 1; }
            if id(d) == Some("function") { d += 1; if id(d).is_some() { d += 1; } }
            if pc(d, '(') { (nom.to_string(), d) }
            else if id(d).is_some() && pc(d + 1, '=') && pc(d + 2, '>') && pc(d + 3, '{') {
                if let Some(f) = fermante(j, d + 3) { out.push(Fonction { nom: nom.to_string(), corps: &j[d + 3..=f] }); }
                continue;
            } else { continue }
        } else if pc(k + 1, '(') && (k == 0 || pc(k - 1, '{') || pc(k - 1, ',') || pc(k - 1, '}') || pc(k - 1, ';') || id(k - 1) == Some("async")) {
            (nom.to_string(), k + 1)   // une méthode dans un objet : nom ( … ) {
        } else { continue };
        let Some(mut a) = apres_parentheses(j, par) else { continue };
        if pc(a, '=') && pc(a + 1, '>') { a += 2; }
        if !pc(a, '{') { continue; }
        if let Some(f) = fermante(j, a) { out.push(Fonction { nom: n, corps: &j[a..=f] }); }
    }
    out
}

/// l'empreinte d'un corps : exacte, ou « renommée » (les noms locaux deviennent leur rang d'apparition ; les membres, les jOS*, les
/// globales du web restent : c'est la même fonction recopiée avec d'autres noms)
fn empreinte(corps: &[Jeton], renommee: bool) -> u64 {
    let mut h = std::collections::hash_map::DefaultHasher::new();
    let mut noms: HashMap<&str, usize> = HashMap::new();
    for (k, x) in corps.iter().enumerate() {
        match x {
            Jeton::Ident(s) => {
                let membre = k > 0 && corps[k - 1] == Jeton::Ponct('.');
                let global = s.starts_with("jOS") || matches!(s.as_str(), "document" | "window" | "Math" | "JSON" | "Date" | "Object" | "Array" | "String" | "Number" | "Promise" | "console" | "localStorage" | "navigator" | "fetch" | "setTimeout" | "requestAnimationFrame");
                if renommee && !membre && !global && !MOTS.contains(&s.as_str()) {
                    let n = noms.len();
                    let r = *noms.entry(s.as_str()).or_insert(n);
                    (0u8, r).hash(&mut h);
                } else {
                    (1u8, s).hash(&mut h);
                }
            }
            Jeton::Texte(s) => (2u8, s).hash(&mut h),
            Jeton::Regex => 3u8.hash(&mut h),
            Jeton::Nombre => 4u8.hash(&mut h),
            Jeton::Ponct(c) => (5u8, c).hash(&mut h),
        }
    }
    h.finish()
}

/// l'ossature d'un gabarit HTML : la suite des balises ouvrantes avec leurs classes (« div.carte>b>button.p »)
pub fn ossature(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut parts: Vec<String> = Vec::new();
    let mut i = 0;
    while i + 1 < b.len() {
        if b[i] == b'<' && b[i + 1].is_ascii_alphabetic() {
            let d = i + 1;
            let mut j = d;
            while j < b.len() && (b[j].is_ascii_alphanumeric() || b[j] == b'-') { j += 1; }
            let tag = s[d..j].to_ascii_lowercase();
            let fin = s[j..].find('>').map(|x| j + x).unwrap_or(b.len());
            let attrs = &s[j..fin];
            let classes = attrs.find("class=").map(|c| {
                let r = &attrs[c + 6..];
                let q = r.chars().next().unwrap_or('"');
                let r = r.trim_start_matches(['"', '\'']);
                let fin = r.find(q).unwrap_or(r.len());
                let mut l: Vec<&str> = r[..fin].split_whitespace().filter(|x| !x.contains('$') && !x.contains('{')).collect();
                l.sort();
                l.join(".")
            }).unwrap_or_default();
            parts.push(if classes.is_empty() { tag } else { format!("{tag}.{classes}") });
            i = fin;
        } else { i += 1; }
    }
    (parts.len() >= 3).then(|| parts.join(">"))
}

#[derive(Serialize, Debug, Clone)]
pub struct Partage {
    /// le nom le plus courant de cette fonction (ou l'ossature du gabarit)
    pub nom: String,
    pub jetons: usize,
    pub ploxions: usize,
    pub exemples: Vec<String>,
    /// les autres noms qu'elle porte ailleurs (recopiée en renommant)
    pub alias: Vec<String>,
    /// copiée telle quelle (true) ou recopiée en changeant les noms (false)
    pub exacte: bool,
    /// les autres fonctions partagées par EXACTEMENT les mêmes ploxions (un moteur entier recopié : elles viennent avec)
    pub avec: usize,
    #[serde(skip)]
    pub tous: Vec<String>,
}

/// une famille : toutes les variantes d'une même fonction (même nom), réunies
#[derive(Serialize, Debug, Clone)]
pub struct Famille {
    pub nom: String,
    pub ploxions: usize,
    pub variantes: usize,
    pub jetons_max: usize,
}

#[derive(Serialize, Debug, Default)]
pub struct Bionisation {
    /// les fonctions partagées par au moins 3 ploxions : des bions déguisés (les plus « rentables » d'abord : jetons × ploxions)
    pub fonctions: Vec<Partage>,
    /// les gabarits HTML partagés par au moins 3 ploxions : des bions d'interface
    pub gabarits: Vec<Partage>,
    /// les familles de fonctions recopiées (toutes variantes) : la portée d'un bion qui les remplacerait
    pub familles: Vec<Famille>,
    /// la part du code de tous les ploxions qui est une copie d'une fonction présente ailleurs (0 à 1)
    pub part_dupliquee: f64,
    pub jetons_total: usize,
}

/// la bionisation de tous les ploxions : (id, jetons)
pub fn bioniser(tous: &[(String, Vec<Jeton>)]) -> Bionisation {
    struct Acc { noms: BTreeMap<String, usize>, ploxions: BTreeSet<String>, jetons: usize, exacte: bool }
    let mut fx: HashMap<(u64, bool), Acc> = HashMap::new();
    let mut gab: HashMap<String, BTreeSet<String>> = HashMap::new();
    let mut total = 0usize;
    // les fonctions déjà comptées en exact ne le sont plus en renommé
    for (id, j) in tous {
        total += j.len();
        let mut vus = BTreeSet::new();
        for f in fonctions(j) {
            if f.corps.len() < MIN_JETONS { continue; }
            for renommee in [false, true] {
                let e = (empreinte(f.corps, renommee), renommee);
                if !vus.insert(e) { continue; }
                let a = fx.entry(e).or_insert_with(|| Acc { noms: BTreeMap::new(), ploxions: BTreeSet::new(), jetons: f.corps.len(), exacte: !renommee });
                *a.noms.entry(f.nom.clone()).or_default() += 1;
                a.ploxions.insert(id.clone());
            }
        }
        let mut gv = BTreeSet::new();
        for x in j { if let Jeton::Texte(s) = x { if s.contains('<') { if let Some(o) = ossature(s) { if gv.insert(o.clone()) { gab.entry(o).or_default().insert(id.clone()); } } } } }
    }
    let mut exactes: BTreeSet<Vec<String>> = BTreeSet::new();
    let mut l: Vec<Partage> = Vec::new();
    let mut doublons = 0usize;
    let mut accs: Vec<_> = fx.into_iter().filter(|(_, a)| a.ploxions.len() >= 3).collect();
    accs.sort_by_key(|((_, renommee), _)| *renommee);   // les exactes d'abord
    for ((_, renommee), a) in accs {
        let pl: Vec<String> = a.ploxions.iter().cloned().collect();
        if renommee && exactes.contains(&pl) && a.noms.len() == 1 { continue; }   // la même chose, déjà vue en exacte
        if !renommee { exactes.insert(pl.clone()); doublons += a.jetons * (pl.len() - 1); }
        let mut noms: Vec<(String, usize)> = a.noms.into_iter().collect();
        noms.sort_by(|x, y| y.1.cmp(&x.1).then(x.0.cmp(&y.0)));
        l.push(Partage { nom: noms[0].0.clone(), jetons: a.jetons, ploxions: pl.len(), exemples: pl.iter().take(6).cloned().collect(),
            alias: noms.iter().skip(1).take(5).map(|x| x.0.clone()).collect(), exacte: !renommee, avec: 0, tous: pl });
    }
    // les familles (par nom, toutes variantes) : avant de regrouper
    let mut fam: BTreeMap<String, (BTreeSet<String>, usize, usize)> = BTreeMap::new();
    for p in &l { for n in std::iter::once(&p.nom).chain(p.alias.iter()) { let e = fam.entry(n.clone()).or_default(); e.0.extend(p.tous.iter().cloned()); e.1 += 1; e.2 = e.2.max(p.jetons); } }
    let mut familles: Vec<Famille> = fam.into_iter().map(|(nom, (p, v, j))| Famille { nom, ploxions: p.len(), variantes: v, jetons_max: j }).collect();
    familles.sort_by(|a, b| b.ploxions.cmp(&a.ploxions).then(b.jetons_max.cmp(&a.jetons_max)));
    // un moteur recopié en entier : une ligne par groupe de ploxions (la plus grosse fonction), les autres « viennent avec »
    l.sort_by(|a, b| b.jetons.cmp(&a.jetons));
    let mut groupes: Vec<Partage> = Vec::new();
    for p in l { match groupes.iter_mut().find(|g| g.tous == p.tous) { Some(g) => g.avec += 1, None => groupes.push(p) } }
    let mut l = groupes;
    l.sort_by(|a, b| (b.jetons * b.ploxions).cmp(&(a.jetons * a.ploxions)).then(a.nom.cmp(&b.nom)));
    let mut g: Vec<Partage> = gab.into_iter().filter(|(_, p)| p.len() >= 3).map(|(o, p)| Partage { jetons: o.matches('>').count() + 1, nom: o, ploxions: p.len(),
        exemples: p.iter().take(6).cloned().collect(), alias: vec![], exacte: true, avec: 0, tous: p.into_iter().collect() }).collect();
    g.sort_by(|a, b| (b.ploxions * b.jetons).cmp(&(a.ploxions * a.jetons)).then(a.nom.cmp(&b.nom)));
    Bionisation { fonctions: l.into_iter().take(300).collect(), gabarits: g.into_iter().take(200).collect(), familles: familles.into_iter().take(200).collect(), part_dupliquee: doublons as f64 / total.max(1) as f64, jetons_total: total }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::lexeur::jetons;
    #[test]
    fn trouve_les_bions_deguises() {
        let corps = "{ const r = []; for (const x of l) { if (x && x.nom) r.push(String(x.nom).trim().toLowerCase()); } r.sort(); return r.filter((v, i) => r.indexOf(v) === i).slice(0, 50).map(v => v + '!'); }";
        let a = jetons(&format!("function tri(l) {corps}"));
        let b = jetons(&format!("const ranger = (l) => {corps};"));
        let c = jetons(&format!("jOSApps.c = {{ trier(l) {}, mount() {{}} }}", corps.replace("const r", "const out").replace("r.", "out.").replace("return r", "return out")));
        assert_eq!(fonctions(&a).len(), 1);
        assert_eq!(fonctions(&b)[0].nom, "ranger");
        let bz = bioniser(&[("a".into(), a), ("b".into(), b), ("c".into(), c)]);
        assert!(bz.fonctions.iter().any(|f| f.ploxions == 3 && !f.exacte), "{:?}", bz.fonctions);
        assert_eq!(ossature("<div class=\"carte p\"><b>x</b><button class='ok'>y</button></div>").as_deref(), Some("div.carte.p>b>button.ok"));
    }
}
