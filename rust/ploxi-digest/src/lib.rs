//! # ploxi-digest : la digestion des ploxions (0.99.17, RS-7 : « prendre tous les ploxions et les rendre natifs le plus possible ;
//! une digestion automatique des ploxions »)
//!
//! Lit le code JS d'un ploxion SANS l'exécuter et dit de quoi il est fait : les bions qu'il compose, le DOM qu'il fabrique (les balises
//! écrites dans ses gabarits, les API du DOM qu'il appelle, le CSS qu'il pose), s'il dessine (canvas, WebGL, three.js), s'il joue du son,
//! ce qu'il demande au réseau, ce qu'il garde. Puis la VOIE par laquelle il devient natif (docs/DIGESTION.md) :
//! - `compose` : son interface vient de bions → un rendu natif des bions suffit ;
//! - `dessin`  : il dessine lui-même (canvas, WebGL) → un canvas natif (wgpu / Metal) sous sa logique ;
//! - `dom`     : il fabrique son interface en HTML → un rendu natif du sous-ensemble de DOM et de CSS qu'il utilise (ce que mesure le digesteur) ;
//! - `web`     : il embarque le web (iframe) ou fabrique du code (eval) → il reste dans une vue web, dans une coquille native.

pub mod bionisation;
pub mod lexeur;

use lexeur::{Jeton, jetons};
use serde::Serialize;
use std::collections::BTreeMap;

/// les API du DOM qui fabriquent ou touchent l'interface
pub const DOM: &[&str] = &[
    "innerHTML", "outerHTML", "insertAdjacentHTML", "createElement", "createElementNS", "appendChild", "append", "prepend", "replaceChildren",
    "removeChild", "querySelector", "querySelectorAll", "getElementById", "addEventListener", "classList", "style", "setAttribute", "textContent",
    "dataset", "getBoundingClientRect", "scrollTo", "scrollIntoView", "focus", "attachShadow",
];
/// les mots du CSS qui coûtent à un rendu natif (au-delà des boîtes, du texte et du flex)
pub const CSS: &[&str] = &["display:flex", "display:grid", "position:absolute", "position:fixed", "position:sticky", "transform", "transition", "animation",
    "@keyframes", "filter", "backdrop-filter", "clip-path", "mask", "box-shadow", "gradient", "@media", "var(--", "overflow"];
/// des balises qu'un rendu natif doit savoir faire
pub const BALISES: &[&str] = &["div", "span", "button", "input", "textarea", "select", "option", "label", "a", "p", "b", "i", "small", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "img", "svg", "canvas", "video", "audio", "iframe", "table", "tr", "td", "form", "details", "summary", "progress", "pre", "code", "style"];

#[derive(Serialize, Debug, Default, Clone)]
pub struct Digestion {
    pub id: String,
    pub octets: usize,
    pub jetons: usize,
    /// le ploxion s'enregistre-t-il (jOSApps[…] = { mount }) ?
    pub enregistre: bool,
    pub bions: BTreeMap<String, u32>,
    pub dom: BTreeMap<String, u32>,
    pub balises: BTreeMap<String, u32>,
    pub css: BTreeMap<String, u32>,
    pub dessin: BTreeMap<String, u32>,
    pub son: u32,
    pub video: u32,
    pub iframe: u32,
    pub reseau: BTreeMap<String, u32>,
    pub hotes: Vec<String>,
    pub stockage: BTreeMap<String, u32>,
    pub cles: Vec<String>,
    pub dynamique: u32,
    pub natif: BTreeMap<String, u32>,
    pub voie: String,
    pub raisons: Vec<String>,
    /// 0 à 100 : la part de ce ploxion qu'un rendu natif générique couvrirait sans travail propre à lui
    pub natif_pct: u8,
    /// (bionisation) ce qui n'est PAS un bion dans ce ploxion, et le bion qui le prendrait ; vide = le ploxion est fait que de bions
    pub reste: Vec<String>,
    pub pur: bool,
}

fn plus(m: &mut BTreeMap<String, u32>, k: &str) {
    *m.entry(k.to_string()).or_insert(0) += 1;
}

/// les balises d'un texte HTML écrit dans une chaîne (« <div class=… », « <button>… »)
fn balises_du_texte(s: &str, m: &mut BTreeMap<String, u32>) {
    let b = s.as_bytes();
    let mut i = 0;
    while i + 1 < b.len() {
        if b[i] == b'<' && b[i + 1].is_ascii_alphabetic() {
            let d = i + 1;
            let mut j = d;
            while j < b.len() && (b[j].is_ascii_alphanumeric() || b[j] == b'-') {
                j += 1;
            }
            let tag = s[d..j].to_ascii_lowercase();
            if BALISES.contains(&tag.as_str()) || tag.contains('-') {
                plus(m, if tag.contains('-') { "(élément perso)" } else { &tag });
            }
            i = j;
        } else {
            i += 1;
        }
    }
}

fn hote(s: &str) -> Option<String> {
    let i = s.find("https://").map(|i| i + 8).or_else(|| s.find("http://").map(|i| i + 7))?;
    let h: String = s[i..].chars().take_while(|c| c.is_ascii_alphanumeric() || *c == '.' || *c == '-' || *c == ':').collect();
    (h.contains('.') || h.starts_with("localhost")).then_some(h)
}

pub fn digerer(id: &str, code: &str) -> Digestion {
    let j = jetons(code);
    let mut d = Digestion { id: id.to_string(), octets: code.len(), jetons: j.len(), ..Default::default() };
    let ident = |k: usize| -> Option<&str> { match j.get(k) { Some(Jeton::Ident(s)) => Some(s.as_str()), _ => None } };
    let ponct = |k: usize, c: char| j.get(k) == Some(&Jeton::Ponct(c));
    let texte = |k: usize| -> Option<&str> { match j.get(k) { Some(Jeton::Texte(s)) => Some(s.as_str()), _ => None } };
    let mut hotes = std::collections::BTreeSet::new();
    let mut cles = std::collections::BTreeSet::new();
    for k in 0..j.len() {
        match &j[k] {
            Jeton::Texte(s) => {
                balises_du_texte(s, &mut d.balises);
                if s.contains("http://") || s.contains("https://") {
                    if let Some(h) = hote(s) { hotes.insert(h); }
                }
                let compact: String = s.chars().filter(|c| !c.is_whitespace()).collect::<String>().to_ascii_lowercase();
                if compact.contains('{') || compact.contains("style") || compact.contains(':') {
                    for m in CSS { if compact.contains(m) { plus(&mut d.css, m); } }
                }
            }
            Jeton::Ident(nom) => {
                let membre = k > 0 && ponct(k - 1, '.');
                let appel = ponct(k + 1, '(');
                if nom.starts_with("jOS") && nom.len() > 3 && nom.as_bytes()[3].is_ascii_uppercase() && !membre {
                    plus(&mut d.bions, nom);
                    if (nom == "jOSBoxion" || nom == "jOSStore") && ponct(k + 1, '.') {
                        if let (Some(m), true, Some(cle)) = (ident(k + 2), ponct(k + 3, '('), texte(k + 4)) {
                            if !cle.is_empty() && cle.len() < 60 { cles.insert(format!("{nom}.{m}:{cle}")); }
                        }
                    }
                }
                if nom == "jOSApps" { d.enregistre = true; }
                if membre && DOM.contains(&nom.as_str()) { plus(&mut d.dom, nom); }
                match nom.as_str() {
                    "getContext" if appel => {
                        let t = texte(k + 2).unwrap_or("");
                        plus(&mut d.dessin, if t.starts_with("webgl") { "webgl" } else if t == "2d" { "canvas2d" } else { "contexte" });
                    }
                    "requestAnimationFrame" => plus(&mut d.dessin, "requestAnimationFrame"),
                    "THREE" if !membre => plus(&mut d.dessin, "three.js"),
                    "WebGLRenderer" | "WebGL2RenderingContext" => plus(&mut d.dessin, "webgl"),
                    "createElement" if appel => {
                        if let Some(t) = texte(k + 2) { let t = t.to_ascii_lowercase(); if BALISES.contains(&t.as_str()) { plus(&mut d.balises, &t); } }
                    }
                    "AudioContext" | "webkitAudioContext" | "OscillatorNode" => d.son += 1,
                    "Audio" if k > 0 && j.get(k - 1) == Some(&Jeton::Ident("new".into())) => d.son += 1,
                    "fetch" if appel && !membre => plus(&mut d.reseau, "fetch"),
                    "XMLHttpRequest" => plus(&mut d.reseau, "XHR"),
                    "WebSocket" => plus(&mut d.reseau, "WebSocket"),
                    "EventSource" => plus(&mut d.reseau, "EventSource"),
                    "localStorage" | "sessionStorage" | "indexedDB" => plus(&mut d.stockage, nom),
                    "eval" if appel && !membre => d.dynamique += 1,
                    "Function" if k > 0 && j.get(k - 1) == Some(&Jeton::Ident("new".into())) => d.dynamique += 1,
                    "import" if appel => d.dynamique += 1,
                    "Worker" if k > 0 && j.get(k - 1) == Some(&Jeton::Ident("new".into())) => plus(&mut d.natif, "Worker"),
                    "geolocation" => plus(&mut d.natif, "géolocalisation"),
                    "getUserMedia" => plus(&mut d.natif, "caméra / micro"),
                    "vibrate" => plus(&mut d.natif, "vibration"),
                    "bluetooth" => plus(&mut d.natif, "Bluetooth"),
                    "DeviceOrientationEvent" | "deviceorientation" | "DeviceMotionEvent" => plus(&mut d.natif, "mouvement"),
                    _ => {}
                }
            }
            _ => {}
        }
    }
    // les balises qui se trouvent dans des chaînes « deviceorientation » n'en sont pas : déjà comptées par identifiant
    d.son += d.balises.get("audio").copied().unwrap_or(0);
    d.video = d.balises.get("video").copied().unwrap_or(0);
    d.iframe = d.balises.get("iframe").copied().unwrap_or(0);
    d.hotes = hotes.into_iter().take(20).collect();
    d.cles = cles.into_iter().take(40).collect();
    classer(&mut d);
    d
}

/// la voie de digestion, ses raisons, et la part couverte par un rendu natif générique
pub fn classer(d: &mut Digestion) {
    let n = |m: &BTreeMap<String, u32>, k: &str| m.get(k).copied().unwrap_or(0);
    let fabrique = n(&d.dom, "innerHTML") + n(&d.dom, "outerHTML") + n(&d.dom, "insertAdjacentHTML") + n(&d.dom, "createElement") + n(&d.dom, "createElementNS");
    let balises: u32 = d.balises.values().sum();
    let dessine = n(&d.dessin, "canvas2d") + n(&d.dessin, "webgl") + n(&d.dessin, "three.js");
    let css_lourd = n(&d.css, "filter") + n(&d.css, "backdrop-filter") + n(&d.css, "clip-path") + n(&d.css, "mask") + n(&d.css, "@keyframes");
    let mut r = Vec::new();
    let voie = if d.iframe > 0 || d.dynamique > 0 {
        if d.iframe > 0 { r.push(format!("{} iframe : il embarque le web", d.iframe)); }
        if d.dynamique > 0 { r.push(format!("{} code fabriqué à la volée (eval, new Function, import())", d.dynamique)); }
        "web"
    } else if dessine > 0 && dessine * 4 >= fabrique.max(1) {
        r.push(format!("il dessine lui-même ({} canvas / WebGL) : un canvas natif sous sa logique", dessine));
        "dessin"
    } else if fabrique <= 6 && balises <= 25 && !d.bions.is_empty() {
        r.push(format!("son interface vient surtout de bions ({}) ; {} fabrications de DOM", d.bions.len(), fabrique));
        "compose"
    } else {
        r.push(format!("{} fabrications de DOM, {} balises écrites dans ses gabarits", fabrique, balises));
        "dom"
    };
    if css_lourd > 0 { r.push(format!("{} effets CSS lourds (filtres, masques, animations)", css_lourd)); }
    if !d.enregistre { r.push("pas d'enregistrement jOSApps trouvé".into()); }
    // la part couverte par un rendu natif générique : 100 moins ce qui demande un travail propre
    let mut pct: i32 = match voie { "compose" => 95, "dessin" => 80, "dom" => 75, _ => 30 };
    pct -= (css_lourd as i32).min(15);
    pct -= (n(&d.balises, "(élément perso)") as i32).min(10);
    pct -= (d.video as i32 * 3).min(9);
    pct -= if d.reseau.contains_key("WebSocket") { 5 } else { 0 };
    d.natif_pct = pct.clamp(0, 100) as u8;
    d.voie = voie.into();
    d.raisons = r;
    // la bionisation : ce qui reste à confier à des bions
    let mut reste = Vec::new();
    if fabrique + balises > 0 { reste.push(format!("son interface ({fabrique} fabrications de DOM, {balises} balises) → des bions d'interface")); }
    let stock: Vec<&String> = d.stockage.keys().collect();
    if !stock.is_empty() { reste.push(format!("{} → jOSBoxion", stock.iter().map(|x| x.as_str()).collect::<Vec<_>>().join(", "))); }
    if !d.reseau.is_empty() { reste.push(format!("{} → un bion réseau (jOSPorts, ou un bion de service)", d.reseau.keys().cloned().collect::<Vec<_>>().join(", "))); }
    if dessine > 0 { reste.push("son dessin (canvas / WebGL) → un bion de scène".into()); }
    if d.son > 0 { reste.push("son son (Web Audio) → un bion de son".into()); }
    if !d.natif.is_empty() { reste.push(format!("{} → jOSNatif", d.natif.keys().cloned().collect::<Vec<_>>().join(", "))); }
    if d.iframe > 0 || d.dynamique > 0 { reste.push("le web embarqué / le code fabriqué → reste web".into()); }
    d.pur = reste.is_empty();
    d.reste = reste;
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn digere() {
        let d = digerer("x", "window.jOSApps['x'] = { mount(h) { h.innerHTML = '<div class=\"a\"><button>ok</button></div>'; jOSKnob.panel(h, []); jOSBoxion.save('notes', 1); } };");
        assert!(d.enregistre);
        assert_eq!(d.bions.get("jOSKnob"), Some(&1));
        assert_eq!(d.balises.get("button"), Some(&1));
        assert_eq!(d.voie, "compose");
        assert_eq!(d.cles, vec!["jOSBoxion.save:notes".to_string()]);
        let c = digerer("c", "jOSApps.c = { mount(h) { const g = h.querySelector('canvas').getContext('2d'); requestAnimationFrame(f); } }");
        assert_eq!(c.voie, "dessin");
        let w = digerer("w", "jOSApps.w = { mount(h) { h.innerHTML = '<iframe src=\"https://exemple.ch\"></iframe>'; } }");
        assert_eq!(w.voie, "web");
        assert_eq!(w.hotes, vec!["exemple.ch".to_string()]);
    }
}
