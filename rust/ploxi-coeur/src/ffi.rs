//! La porte du cœur : `px_appel(nom, json) → json`. La même pour le WASM (la WebView) et pour le C (le Swift d'iOS).
//! Mémoire : l'appelant réserve avec `px_reserver`, écrit, appelle ; la réponse vit jusqu'à `px_liberer`.
//! Format de la réponse : `{ "ok": … }` ou `{ "erreur": "…" }`.

use crate::autour::{self, Pos};
use crate::dire::Dire;
use crate::js::{champ, nombre};
use crate::proche;
use serde_json::{Value, json};
use std::cell::RefCell;

thread_local! {
    /// les dictionnaires chargés (dire.charger → une poignée)
    static DICOS: RefCell<Vec<Dire>> = const { RefCell::new(Vec::new()) };
}

fn chaines(v: Option<&Value>) -> Option<Vec<String>> {
    v.and_then(|x| x.as_array()).map(|a| a.iter().filter_map(|s| s.as_str().map(String::from)).collect())
}
fn pos(v: &Value) -> Pos {
    Pos { lat: nombre(champ(v, "lat")), lng: nombre(champ(v, "lng")) }
}
fn liste(v: Option<&Value>) -> Vec<Value> {
    v.and_then(|x| x.as_array()).cloned().unwrap_or_default()
}

/// un appel par son nom ; d = les arguments (un objet JSON)
pub fn appeler(nom: &str, d: &Value) -> Result<Value, String> {
    Ok(match nom {
        "version" => json!(env!("CARGO_PKG_VERSION")),
        "proche.partition" => proche::partition(d).json(),
        "proche.pasValides" => proche::pas_valides(Some(d)).map(|p| proche::pas_json(&p)).unwrap_or(Value::Null),
        "proche.notesEntre" => {
            let p = proche::partition(champ(d, "p").unwrap_or(&Value::Null));
            json!(proche::notes_entre(&p, nombre(champ(d, "de")), nombre(champ(d, "a"))))
        }
        "proche.ecart" => json!(proche::ecart(nombre(champ(d, "t0")), nombre(champ(d, "t1")), nombre(champ(d, "t2")), nombre(champ(d, "t3")))),
        "proche.meilleurEcart" => proche::meilleur_ecart(d),
        "autour.cellule" => {
            let p = nombre(champ(d, "pas"));
            autour::cellule(nombre(champ(d, "lat")), nombre(champ(d, "lng")), if p.is_nan() { 0.01 } else { p })
        }
        "autour.requete" => json!(autour::requete(champ(d, "c").unwrap_or(&Value::Null), chaines(champ(d, "genres")).as_deref())),
        "autour.lire" => json!(autour::lire(d)),
        "autour.lireVehicules" => json!(autour::lire_vehicules(d)),
        "autour.distance" => json!(autour::distance(pos(champ(d, "a").unwrap_or(&Value::Null)), pos(champ(d, "b").unwrap_or(&Value::Null)))),
        "autour.cap" => json!(autour::cap(pos(champ(d, "a").unwrap_or(&Value::Null)), pos(champ(d, "b").unwrap_or(&Value::Null)))),
        "autour.fleche" => json!(autour::fleche(nombre(champ(d, "deg")), { let c = nombre(champ(d, "cap0")); if c.is_nan() { 0.0 } else { c } })),
        "autour.trier" => {
            let max = nombre(champ(d, "max"));
            json!(autour::trier(&liste(champ(d, "lieux")), pos(champ(d, "pos").unwrap_or(&Value::Null)), chaines(champ(d, "genres")).as_deref(), if max.is_nan() { 60 } else { max as usize }))
        }
        "autour.proposer" => {
            let max = nombre(champ(d, "max"));
            json!(autour::proposer(&liste(champ(d, "lieux")), pos(champ(d, "pos").unwrap_or(&Value::Null)), nombre(champ(d, "heure")), champ(d, "usage").unwrap_or(&Value::Null), if max.is_nan() { 5 } else { max as usize }))
        }
        "autour.vecteurGenres" => Value::Object(autour::vecteur_genres(d)),
        "autour.capBoussole" => autour::cap_boussole(d).map(|x| json!(x)).unwrap_or(Value::Null),
        "autour.requeteVehicules" => json!(autour::requete_vehicules(champ(d, "c").unwrap_or(&Value::Null), { let o = nombre(champ(d, "offset")); if o.is_nan() { 0.0 } else { o } })),
        "autour.lireVehiculesTexte" => json!(autour::lire_vehicules(&serde_json::from_str::<Value>(d.as_str().unwrap_or("{}")).unwrap_or(Value::Null))),
        "autour.lireTexte" => json!(autour::lire(&serde_json::from_str::<Value>(d.as_str().unwrap_or("{}")).unwrap_or(Value::Null))),
        "autour.plansLien" => json!(autour::plans_lien(d)),
        "dire.langueDe" => json!(crate::dire::langue_de(champ(d, "reglage").and_then(|x| x.as_str()), &chaines(champ(d, "preferees")).unwrap_or_default())),
        "dire.charger" => DICOS.with(|l| { let mut l = l.borrow_mut(); l.push(Dire::nouveau(d)); json!(l.len() - 1) }),
        "dire.dire" => {
            let h = nombre(champ(d, "dico")) as usize;
            DICOS.with(|l| {
                let l = l.borrow();
                let di = l.get(h).ok_or("dire : dictionnaire inconnu")?;
                Ok::<Value, String>(match champ(d, "textes").and_then(|t| t.as_array()) {
                    Some(t) => Value::Array(t.iter().map(|x| x.as_str().and_then(|s| di.dire(s)).map(Value::from).unwrap_or(Value::Null)).collect()),
                    None => champ(d, "texte").and_then(|x| x.as_str()).and_then(|s| di.dire(s)).map(Value::from).unwrap_or(Value::Null),
                })
            })?
        }
        _ => return Err(format!("ploxi-coeur : « {nom} » n'existe pas")),
    })
}

/// appel depuis du texte : la réponse en texte JSON
pub fn appeler_texte(nom: &str, json: &str) -> String {
    let d: Value = match serde_json::from_str(json) {
        Ok(v) => v,
        Err(e) => return json!({ "erreur": format!("JSON : {e}") }).to_string(),
    };
    match appeler(nom, &d) {
        Ok(v) => json!({ "ok": v }).to_string(),
        Err(e) => json!({ "erreur": e }).to_string(),
    }
}

// ---- la porte C (WASM et iOS) ----

/// réserve n octets (l'appelant y écrit le nom et le JSON)
#[unsafe(no_mangle)]
pub extern "C" fn px_reserver(n: usize) -> *mut u8 {
    let mut v = Vec::<u8>::with_capacity(n.max(1));
    let p = v.as_mut_ptr();
    std::mem::forget(v);
    p
}

/// rend la mémoire réservée par px_reserver ou rendue par px_appel
///
/// # Safety
/// `p` vient de `px_reserver(n)` ou de `px_appel` (avec sa longueur), et n'est libéré qu'une fois.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn px_liberer(p: *mut u8, n: usize) {
    if !p.is_null() {
        unsafe { drop(Vec::from_raw_parts(p, 0, n.max(1))) };
    }
}

/// `px_appel(nom, json)` → (pointeur << 32) | longueur de la réponse JSON (à libérer avec px_liberer)
///
/// # Safety
/// `nom` et `json` pointent sur `nom_n` et `json_n` octets UTF-8 valides.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn px_appel(nom: *const u8, nom_n: usize, json: *const u8, json_n: usize) -> u64 {
    let lire = |p: *const u8, n: usize| -> String {
        if p.is_null() || n == 0 { return String::new(); }
        String::from_utf8_lossy(unsafe { std::slice::from_raw_parts(p, n) }).into_owned()
    };
    let r = appeler_texte(&lire(nom, nom_n), &lire(json, json_n)).into_bytes().into_boxed_slice();
    let n = r.len();
    let p = Box::into_raw(r) as *mut u8;
    ((p as usize as u64) << 32) | n as u64
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn la_porte() {
        assert_eq!(appeler_texte("autour.fleche", r#"{"deg":0,"cap0":90}"#), r#"{"ok":"←"}"#);
        assert!(appeler_texte("rien", "{}").contains("erreur"));
        let h = appeler("dire.charger", &json!({ "vitrine": "Schaufenster" })).unwrap();
        assert_eq!(appeler("dire.dire", &json!({ "dico": h, "textes": ["▦ vitrine", "x"] })).unwrap(), json!(["▦ Schaufenster", null]));
    }
}
