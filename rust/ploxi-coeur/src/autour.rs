//! @bion autour (en Rust) : ce qu'il y a autour de moi. Les lieux d'OpenStreetMap (Overpass), les trottinettes et vélos de sharedmobility.ch,
//! la distance et le cap, le tri, les propositions selon l'heure et le vecteur xerion. Le même calcul que src/bions/autour.js.
//! Ne pas nuire : la requête part du centre d'une case d'environ 1 km, jamais de la position exacte.

use crate::js::{champ, debut, nombre, nombre_texte, texte, vrai};
use serde_json::{Map, Value, json};

/// [genre, glyphe, nom, clés OSM, valeurs OSM]
pub const CATEGORIES: &[(&str, &str, &str, &str, &str)] = &[
    ("toilettes", "WC", "toilettes", "amenity", "toilets"),
    ("eau", "≈", "eau potable", "amenity", "drinking_water"),
    ("cafe", "◡", "cafés", "amenity", "cafe"),
    ("manger", "⊓", "manger", "amenity", "restaurant|fast_food|food_court"),
    ("bar", "⊻", "bars", "amenity", "bar|pub|biergarten"),
    ("nuit", "⍟", "la nuit", "amenity", "nightclub"),
    ("glace", "◇", "glaces", "amenity", "ice_cream"),
    ("courses", "⊏", "courses", "shop", "supermarket|convenience|bakery"),
    ("art", "✶", "art", "tourism", "artwork|gallery"),
    ("vue", "◬", "points de vue", "tourism", "viewpoint"),
    ("culture", "⊞", "musées, ciné, théâtre", "tourism|amenity", "museum|attraction|cinema|theatre|library|arts_centre"),
    ("parc", "⊚", "parcs", "leisure", "park|garden|playground"),
    ("velo", "⋈", "vélos, trottinettes", "amenity", "bicycle_rental|kick-scooter_rental|charging_station"),
];

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Pos {
    pub lat: f64,
    pub lng: f64,
}

/// la case d'une position : sa clé (le cache) et son centre (la requête)
pub fn cellule(lat: f64, lng: f64, pas: f64) -> Value {
    let i = (lat / pas).floor();
    let j = (lng / pas).floor();
    let r5 = |x: f64| crate::js::arrondi(x * 1e5) / 1e5;
    json!({
        "cle": format!("{}:{}", nombre_texte(i), nombre_texte(j)),
        "lat": r5((i + 0.5) * pas), "lng": r5((j + 0.5) * pas),
        "rayon": crate::js::arrondi(pas * 111320.0 * 0.75),
    })
}

/// la requête Overpass d'une case
pub fn requete(c: &Value, genres: Option<&[String]>) -> String {
    let (lat, lng, rayon) = (nombre(champ(c, "lat")), nombre(champ(c, "lng")), nombre(champ(c, "rayon")));
    let mut parties = String::new();
    let tous: Vec<String> = CATEGORIES.iter().map(|c| c.0.to_string()).collect();
    for g in genres.unwrap_or(&tous) {
        let Some(cat) = CATEGORIES.iter().find(|c| c.0 == g) else { continue };
        for k in cat.3.split('|') {
            parties += &format!("nwr[\"{k}\"~\"^({})$\"](around:{},{},{});", cat.4, nombre_texte(rayon), nombre_texte(lat), nombre_texte(lng));
        }
    }
    format!("[out:json][timeout:20];({parties});out center 400;")
}

fn categorie(tags: &Value) -> Option<&'static (&'static str, &'static str, &'static str, &'static str, &'static str)> {
    CATEGORIES.iter().find(|c| {
        c.3.split('|').any(|k| match champ(tags, k) {
            Some(v) if vrai(Some(v)) => {
                let s = texte(Some(v));
                c.4.split('|').any(|x| x == s)
            }
            _ => false,
        })
    })
}

/// la réponse d'Overpass → des lieux { id, genre, glyphe, nom, lat, lng, gratuit, acces, horaires }
pub fn lire(j: &Value) -> Vec<Value> {
    let mut out = Vec::new();
    let mut vus = std::collections::HashSet::new();
    let Some(el) = champ(j, "elements").and_then(|e| e.as_array()) else { return out };
    for e in el.iter().take(2000) {
        let centre = champ(e, "center");
        let lat = match champ(e, "lat") {
            Some(v) if !v.is_null() => nombre(Some(v)),
            _ => centre.map(|c| if vrai(Some(c)) { nombre(champ(c, "lat")) } else { nombre(Some(c)) }).unwrap_or(f64::NAN),
        };
        let lng = match champ(e, "lon") {
            Some(v) if !v.is_null() => nombre(Some(v)),
            _ => centre.map(|c| if vrai(Some(c)) { nombre(champ(c, "lon")) } else { nombre(Some(c)) }).unwrap_or(f64::NAN),
        };
        let vide = Value::Object(Map::new());
        let t = champ(e, "tags").filter(|t| vrai(Some(t))).unwrap_or(&vide);
        if !lat.is_finite() || !lng.is_finite() {
            continue;
        }
        let Some(cat) = categorie(t) else { continue };
        let ty = match champ(e, "type") {
            Some(v) if vrai(Some(v)) => texte(Some(v)),
            _ => "n".into(),
        };
        let id = format!("{}{}", ty.chars().next().map(String::from).unwrap_or_default(), texte(champ(e, "id")));
        if !vus.insert(id.clone()) {
            continue;
        }
        let nom_v = crate::js::ou(&[champ(t, "name"), champ(t, "name:fr"), champ(t, "operator")]);
        let nom = if vrai(nom_v) { texte(nom_v) } else { cat.2.to_string() };
        let fee = champ(t, "fee");
        let horaires = champ(t, "opening_hours");
        out.push(json!({
            "id": id, "genre": cat.0, "glyphe": cat.1, "nom": debut(&nom, 60), "lat": lat, "lng": lng,
            "gratuit": fee.and_then(|f| f.as_str()) == Some("no") || (fee.is_none() && cat.0 == "eau"),
            "acces": champ(t, "wheelchair").and_then(|f| f.as_str()) == Some("yes"),
            "horaires": debut(&if vrai(horaires) { texte(horaires) } else { String::new() }, 80),
        }));
    }
    out
}

const R_TERRE: f64 = 6371008.8;
fn rad(x: f64) -> f64 {
    x * std::f64::consts::PI / 180.0
}
/// la distance en mètres (haversine)
pub fn distance(a: Pos, b: Pos) -> f64 {
    let (dlat, dlng) = (rad(b.lat - a.lat), rad(b.lng - a.lng));
    let h = (dlat / 2.0).sin().powi(2) + rad(a.lat).cos() * rad(b.lat).cos() * (dlng / 2.0).sin().powi(2);
    2.0 * R_TERRE * h.sqrt().min(1.0).asin()
}
/// le cap de a vers b, en degrés depuis le nord
pub fn cap(a: Pos, b: Pos) -> f64 {
    let y = rad(b.lng - a.lng).sin() * rad(b.lat).cos();
    let x = rad(a.lat).cos() * rad(b.lat).sin() - rad(a.lat).sin() * rad(b.lat).cos() * rad(b.lng - a.lng).cos();
    (y.atan2(x) * 180.0 / std::f64::consts::PI + 360.0) % 360.0
}
/// une flèche pour un cap (relative à la direction cap0)
pub fn fleche(deg: f64, cap0: f64) -> &'static str {
    const F: [&str; 8] = ["↑", "⇗", "→", "⇘", "↓", "⇙", "←", "⇖"];
    let x = (((deg - cap0) % 360.0) + 360.0) % 360.0;
    F[(crate::js::arrondi(x / 45.0) as usize) % 8]
}

fn pos_de(v: &Value) -> Pos {
    Pos { lat: nombre(champ(v, "lat")), lng: nombre(champ(v, "lng")) }
}

/// les lieux du plus proche au plus loin, avec d (mètres) et cap ; le tri est stable, comme celui de JS
pub fn trier(lieux: &[Value], pos: Pos, genres: Option<&[String]>, max: usize) -> Vec<Value> {
    let mut l: Vec<(f64, Value)> = lieux
        .iter()
        .filter(|l| genres.is_none_or(|g| champ(l, "genre").and_then(|x| x.as_str()).is_some_and(|x| g.iter().any(|y| y == x))))
        .map(|l| {
            let p = pos_de(l);
            let (d, c) = (distance(pos, p), cap(pos, p));
            let mut o = l.as_object().cloned().unwrap_or_default();
            o.insert("d".into(), json!(d));
            o.insert("cap".into(), json!(c));
            (d, Value::Object(o))
        })
        .collect();
    l.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    l.into_iter().take(max).map(|x| x.1).collect()
}

const HEURES: &[(&str, f64, f64)] = &[
    ("cafe", 6.0, 11.0), ("courses", 7.0, 20.0), ("manger", 11.0, 14.0), ("glace", 13.0, 19.0), ("parc", 9.0, 19.0),
    ("art", 10.0, 19.0), ("culture", 10.0, 20.0), ("vue", 7.0, 21.0), ("bar", 17.0, 2.0), ("nuit", 22.0, 5.0),
];
fn ouvert_a(g: &str, h: f64) -> f64 {
    let Some(&(_, a, b)) = HEURES.iter().find(|x| x.0 == g) else { return 0.4 };
    let ouvert = if a <= b { h >= a && h < b } else { h >= a || h < b };
    if ouvert { 1.0 } else { 0.1 }
}

/// « pas » suivi d'une fin de mot (le \b de JS : [A-Za-z0-9_])
fn pas_fin_de_mot(s: &str) -> bool {
    s.match_indices("pas").any(|(i, _)| s[i + 3..].chars().next().is_none_or(|c| !(c.is_ascii_alphanumeric() || c == '_')))
}
/// le vecteur xerion → un poids par genre de lieu (0 à 1) ; usage = { id: { opens, seconds } }
pub fn vecteur_genres(usage: &Value) -> Map<String, Value> {
    let mut v: Vec<(String, f64)> = Vec::new();
    let regles: [(&dyn Fn(&str) -> bool, [&str; 2]); 6] = [
        (&|s: &str| ["music", "son", "synth", "chill", "dj", "spotify"].iter().any(|x| s.contains(x)), ["bar", "nuit"]),
        (&|s: &str| ["cuisine", "bouffe", "frigo", "stock", "courses"].iter().any(|x| s.contains(x)), ["manger", "courses"]),
        (&|s: &str| ["art", "cre", "palette", "3d", "dessin", "galerie"].iter().any(|x| s.contains(x)), ["art", "culture"]),
        (&|s: &str| ["sant", "sport", "marche"].iter().any(|x| s.contains(x)) || pas_fin_de_mot(s), ["parc", "vue"]),
        (&|s: &str| ["wiki", "livre", "savoir", "lecture", "dico"].iter().any(|x| s.contains(x)), ["culture", "cafe"]),
        (&|s: &str| ["terrax", "map", "carte", "nexus"].iter().any(|x| s.contains(x)), ["vue", "art"]),
    ];
    if let Some(o) = usage.as_object() {
        for (id, x) in o {
            // JS : t = +(x && (x.seconds || x.temps || x.opens * 60 || x.n)) || 0
            let interne: Option<Value> = if !vrai(Some(x)) {
                None
            } else if vrai(champ(x, "seconds")) {
                champ(x, "seconds").cloned()
            } else if vrai(champ(x, "temps")) {
                champ(x, "temps").cloned()
            } else {
                let o = nombre(champ(x, "opens")) * 60.0;
                if o != 0.0 && !o.is_nan() { Some(json!(o)) } else { champ(x, "n").cloned() }
            };
            let n = nombre(interne.as_ref());
            let t = if n.is_nan() || n == 0.0 { 0.0 } else { n };
            let s = id.to_lowercase();
            for (test, gs) in regles.iter() {
                if test(&s) {
                    for g in gs {
                        match v.iter_mut().find(|e| e.0 == *g) {
                            Some(e) => e.1 += t,
                            None => v.push((g.to_string(), t)),
                        }
                    }
                }
            }
        }
    }
    let m = v.iter().map(|e| e.1).fold(1.0_f64, |a, b| if b > a { b } else { a });
    v.into_iter().map(|(k, x)| (k, json!(x / m))).collect()
}

/// 5 propositions : ouvert à cette heure, qui te ressemble, pas trop loin ; jamais deux fois le même genre
pub fn proposer(lieux: &[Value], pos: Pos, heure: f64, usage: &Value, max: usize) -> Vec<Value> {
    let v = vecteur_genres(usage);
    let mut sc: Vec<(f64, Value)> = trier(lieux, pos, None, 400)
        .into_iter()
        .filter(|l| !matches!(champ(l, "genre").and_then(|g| g.as_str()), Some("toilettes" | "eau" | "velo")))
        .map(|mut l| {
            let g = champ(&l, "genre").and_then(|g| g.as_str()).unwrap_or("").to_string();
            let d = nombre(champ(&l, "d"));
            let w = v.get(&g).and_then(|x| x.as_f64()).unwrap_or(0.0);
            let s = ouvert_a(&g, heure) * (0.5 + w) / (1.0 + d / 350.0);
            if let Some(o) = l.as_object_mut() { o.insert("score".into(), json!(s)); }
            (s, l)
        })
        .collect();
    sc.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    let mut vus = std::collections::HashSet::new();
    let mut out = Vec::new();
    for (_, l) in sc {
        let g = champ(&l, "genre").and_then(|g| g.as_str()).unwrap_or("").to_string();
        if !vus.insert(g) { continue; }
        out.push(l);
        if out.len() >= max { break; }
    }
    out
}

// ---- la boussole, les trottinettes en direct (sharedmobility.ch) ----

/// le cap de l'iPhone d'un événement deviceorientation (webkitCompassHeading, sinon alpha absolu)
pub fn cap_boussole(e: &Value) -> Option<f64> {
    if !vrai(Some(e)) { return None; }
    if let Some(h) = champ(e, "webkitCompassHeading").filter(|v| !v.is_null()) {
        let h = nombre(Some(h));
        if h.is_finite() && h >= 0.0 { return Some(((h % 360.0) + 360.0) % 360.0); }
    }
    if vrai(champ(e, "absolute")) {
        if let Some(a) = champ(e, "alpha").filter(|v| !v.is_null()) {
            let a = nombre(Some(a));
            if a.is_finite() { return Some((((360.0 - a) % 360.0) + 360.0) % 360.0); }
        }
    }
    None
}

pub const SHAREDMOBILITY: &str = "https://api.sharedmobility.ch/v1/sharedmobility/identify";
pub fn en_suisse(p: Pos) -> bool {
    p.lat > 45.8 && p.lat < 47.9 && p.lng > 5.9 && p.lng < 10.6
}
pub fn requete_vehicules(c: &Value, offset: f64) -> String {
    format!("{SHAREDMOBILITY}?Geometry={},{}&Tolerance={}&offset={}&geometryFormat=esrijson",
        texte(champ(c, "lng")), texte(champ(c, "lat")), texte(champ(c, "rayon")), nombre_texte(offset))
}
fn sorte(ty: &str) -> Option<&'static str> {
    let s = ty.to_lowercase();
    let a = |l: &[&str]| l.iter().any(|x| s.contains(x));
    if a(&["scooter", "trotti", "kick"]) { Some("trottinette") }
    else if a(&["ebike", "e-bike", "evelo", "e-velo", "électrique"]) { Some("vélo électrique") }
    else if a(&["bike", "velo", "vélo", "cargo"]) { Some("vélo") }
    else { None }
}
/// la réponse de sharedmobility.ch → des lieux « velo » (lecture tolérante ; les voitures et le pris laissés)
pub fn lire_vehicules(j: &Value) -> Vec<Value> {
    let vide: Vec<Value> = Vec::new();
    let res = match j {
        Value::Array(a) => a,
        _ => match crate::js::ou(&[champ(j, "results"), champ(j, "features")]) { Some(Value::Array(a)) => a, _ => &vide },
    };
    let mut out = Vec::new();
    let mut vus = std::collections::HashSet::new();
    let obj_vide = Value::Object(Map::new());
    for r in res.iter().take(1000) {
        let a = match crate::js::ou(&[champ(r, "attributes"), champ(r, "properties")]) { Some(x) if vrai(Some(x)) => x, _ => if vrai(Some(r)) { r } else { &obj_vide } };
        let v = |k: &str, long: &str| -> Option<&Value> {
            match champ(a, k) { Some(x) if !x.is_null() => Some(x), _ => champ(a, &format!("ch.bfe.sharedmobility.{long}")) }
        };
        let g = champ(r, "geometry").filter(|g| vrai(Some(g))).unwrap_or(&obj_vide);
        let co = champ(g, "coordinates").and_then(|c| c.as_array());
        let pris = |k: &str| champ(g, k).filter(|x| !x.is_null());
        let lng = if let Some(x) = pris("x") { nombre(Some(x)) } else if let Some(c) = co { nombre(c.first()) } else {
            match champ(a, "lon").filter(|x| !x.is_null()) { Some(x) => nombre(Some(x)), None => nombre(champ(a, "lng")) } };
        let lat = if let Some(y) = pris("y") { nombre(Some(y)) } else if let Some(c) = co { nombre(c.get(1)) } else { nombre(champ(a, "lat")) };
        if !lat.is_finite() || !lng.is_finite() || lat.abs() > 90.0 { continue; }
        let dispo = v("available", "available");
        if dispo == Some(&Value::Bool(false)) || dispo.and_then(|d| d.as_str()) == Some("false") { continue; }
        let vt = v("vehicle_type", "vehicle_type");
        let ty = match vt {
            Some(Value::Array(l)) => l.iter().map(|x| if x.is_null() { String::new() } else { texte(Some(x)) }).collect::<Vec<_>>().join(" "),
            Some(x) if vrai(Some(x)) => texte(Some(x)),
            _ => String::new(),
        };
        let Some(so) = sorte(&ty) else { continue };
        let ident = [champ(r, "id"), champ(r, "featureId"), champ(a, "id")].into_iter().flatten().find(|x| !x.is_null()).map(|x| texte(Some(x)))
            .unwrap_or_else(|| format!("{},{}", nombre_texte(lat), nombre_texte(lng)));
        let id = format!("sm-{}", debut(&ident, 80));
        if !vus.insert(id.clone()) { continue; }
        let f = crate::js::ou(&[v("provider_name", "provider.name"), v("provider_id", "provider.id")]);
        let fournisseur = debut(&if vrai(f) { texte(f) } else { String::new() }, 30);
        let station = v("station_name", "station.name");
        let nom = if vrai(station) { texte(station) } else if fournisseur.is_empty() { so.to_string() } else { format!("{so} · {fournisseur}") };
        out.push(json!({ "id": id, "genre": "velo", "glyphe": "⋈", "sorte": so, "nom": debut(&nom, 60), "lat": lat, "lng": lng, "fournisseur": fournisseur, "direct": true }));
    }
    out
}

/// y aller à pied dans Plans
pub fn plans_lien(l: &Value) -> String {
    let nom = champ(l, "nom").filter(|v| vrai(Some(v))).map(|v| texte(Some(v))).unwrap_or_default();
    let mut q = String::new();
    for b in nom.bytes() {
        if b.is_ascii_alphanumeric() || b"-_.!~*'()".contains(&b) { q.push(b as char) } else { q += &format!("%{b:02X}") }
    }
    format!("https://maps.apple.com/?daddr={},{}&dirflg=w&q={q}", texte(champ(l, "lat")), texte(champ(l, "lng")))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn autour_de_moi() {
        let c = cellule(47.3722, 8.5392, 0.01);
        assert_eq!(c["cle"], "4737:853");
        assert_eq!(c["rayon"], json!(835.0));
        let a = Pos { lat: 47.3722, lng: 8.5392 };
        assert!((distance(a, Pos { lat: 47.3732, lng: 8.5392 }) - 111.2).abs() < 0.5);
        assert_eq!(fleche(0.0, 90.0), "←");
        assert_eq!(fleche(90.0, 90.0), "↑");
        let l = lire_vehicules(&json!({ "results": [
            { "id": "a", "geometry": { "x": 8.54, "y": 47.37 }, "attributes": { "provider_id": "tier", "vehicle_type": ["E-Scooter"], "available": true } },
            { "id": "d", "geometry": { "x": 8.54, "y": 47.37 }, "attributes": { "vehicle_type": ["Car"] } } ] }));
        assert_eq!(l.len(), 1);
        assert_eq!(l[0]["nom"], "trottinette · tier");
        assert_eq!(cap_boussole(&json!({ "webkitCompassHeading": -1, "absolute": true, "alpha": 30 })), Some(330.0));
        assert!(pas_fin_de_mot("podo-pas") && !pas_fin_de_mot("passe"));
    }
}
