//! digerer <dossier des ploxions (*.js)> <sortie.json> [résumé.md] : digère tous les ploxions d'un dossier (en parallèle, sans les exécuter)

use ploxi_digest::{Digestion, digerer};
use std::collections::BTreeMap;
use std::fmt::Write as _;

fn main() {
    let a: Vec<String> = std::env::args().collect();
    let (dossier, sortie) = (a.get(1).expect("le dossier des ploxions"), a.get(2).expect("la sortie JSON"));
    let mut fichiers: Vec<_> = std::fs::read_dir(dossier).expect("dossier").filter_map(|e| e.ok()).map(|e| e.path())
        .filter(|p| p.extension().is_some_and(|x| x == "js")).collect();
    fichiers.sort();
    let t0 = std::time::Instant::now();
    let morceaux: Vec<Vec<std::path::PathBuf>> = fichiers.chunks(fichiers.len().div_ceil(8).max(1)).map(|c| c.to_vec()).collect();
    let mut paires: Vec<(Digestion, Vec<ploxi_digest::lexeur::Jeton>)> = std::thread::scope(|s| {
        let h: Vec<_> = morceaux.iter().map(|m| s.spawn(move || m.iter().filter_map(|p| {
            let code = std::fs::read(p).ok()?;
            let id = p.file_stem()?.to_string_lossy().into_owned();
            let code = String::from_utf8_lossy(&code);
            Some((digerer(&id, &code), ploxi_digest::lexeur::jetons(&code)))
        }).collect::<Vec<_>>())).collect();
        h.into_iter().flat_map(|x| x.join().unwrap()).collect()
    });
    paires.sort_by(|a, b| a.0.id.cmp(&b.0.id));
    let bz = ploxi_digest::bionisation::bioniser(&paires.iter().map(|(d, j)| (d.id.clone(), j.clone())).collect::<Vec<_>>());
    let tous: Vec<Digestion> = paires.into_iter().map(|x| x.0).collect();
    let duree = t0.elapsed();
    std::fs::write(sortie, serde_json::to_string_pretty(&tous).unwrap()).expect("écrire");
    std::fs::write(std::path::Path::new(sortie).with_file_name("bionisation.json"), serde_json::to_string_pretty(&bz).unwrap()).expect("écrire");
    let md = resume(&tous, duree) + &resume_bionisation(&tous, &bz);
    if let Some(r) = a.get(3) { std::fs::write(r, &md).expect("écrire le résumé"); } else { print!("{md}"); }
}

fn resume(t: &[Digestion], duree: std::time::Duration) -> String {
    let n = t.len().max(1);
    let pct = |x: usize| format!("{:.0} %", x as f64 * 100.0 / n as f64);
    let octets: usize = t.iter().map(|d| d.octets).sum();
    let mut s = String::new();
    let _ = writeln!(s, "# L'état de la digestion des ploxions\n\n*Généré par `npm run digerer` (rust/ploxi-digest) : ne pas éditer à la main. Le sens : docs/DIGESTION.md.*\n");
    let _ = writeln!(s, "{} ploxions digérés ({:.1} Mo de code) en {:.2} s.\n", t.len(), octets as f64 / 1048576.0, duree.as_secs_f64());
    let mut voies: BTreeMap<&str, Vec<&Digestion>> = BTreeMap::new();
    for d in t { voies.entry(d.voie.as_str()).or_default().push(d); }
    let _ = writeln!(s, "| voie | ploxions | part | couvert par un rendu natif générique (moyenne) |\n|---|---|---|---|");
    for v in ["compose", "dessin", "dom", "web"] {
        let l = voies.get(v).map(|x| x.as_slice()).unwrap_or(&[]);
        let m = if l.is_empty() { 0.0 } else { l.iter().map(|d| d.natif_pct as f64).sum::<f64>() / l.len() as f64 };
        let _ = writeln!(s, "| {v} | {} | {} | {m:.0} % |", l.len(), pct(l.len()));
    }
    let moy = t.iter().map(|d| d.natif_pct as f64).sum::<f64>() / n as f64;
    let _ = writeln!(s, "\nEn tout : un rendu natif générique couvrirait en moyenne **{moy:.0} %** de chaque ploxion sans travail propre à lui.\n");
    // combien de ploxions utilisent chaque chose
    let compter = |f: &dyn Fn(&Digestion) -> Vec<String>| { let mut m: BTreeMap<String, usize> = BTreeMap::new(); for d in t { for k in f(d) { *m.entry(k).or_default() += 1; } }
        let mut v: Vec<_> = m.into_iter().collect(); v.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0))); v };
    let table = |s: &mut String, titre: &str, v: &[(String, usize)], max: usize| {
        let _ = writeln!(s, "**{titre}** : {}\n", v.iter().take(max).map(|(k, c)| format!("{k} ({c})")).collect::<Vec<_>>().join(" · "));
    };
    let bions = compter(&|d| d.bions.keys().cloned().collect());
    table(&mut s, "Les bions, par nombre de ploxions qui les composent (les rendre natifs d'abord)", &bions, 30);
    // la couverture cumulée : si les k premiers bions sont natifs, combien de ploxions « compose » n'ont plus que des bions natifs
    let compose: Vec<&Digestion> = t.iter().filter(|d| d.voie == "compose").collect();
    let mut cum = String::new();
    for k in [5, 10, 20, 40] {
        let natifs: std::collections::HashSet<&str> = bions.iter().take(k).map(|x| x.0.as_str()).collect();
        let c = compose.iter().filter(|d| d.bions.keys().all(|b| natifs.contains(b.as_str()))).count();
        let _ = write!(cum, "{k} bions → {c} / {} ploxions « compose » entièrement natifs ; ", compose.len());
    }
    let _ = writeln!(s, "**Couverture** : {}\n", cum.trim_end_matches("; "));
    table(&mut s, "Les balises qu'un rendu natif doit savoir faire", &compter(&|d| d.balises.keys().cloned().collect()), 40);
    table(&mut s, "Les API du DOM", &compter(&|d| d.dom.keys().cloned().collect()), 30);
    table(&mut s, "Le CSS", &compter(&|d| d.css.keys().cloned().collect()), 30);
    table(&mut s, "Le dessin", &compter(&|d| d.dessin.keys().cloned().collect()), 10);
    table(&mut s, "Le réseau", &compter(&|d| d.reseau.keys().cloned().collect()), 10);
    table(&mut s, "Les hôtes appelés", &compter(&|d| d.hotes.clone()), 15);
    table(&mut s, "Le stockage hors bions", &compter(&|d| d.stockage.keys().cloned().collect()), 10);
    table(&mut s, "Le natif demandé", &compter(&|d| d.natif.keys().cloned().collect()), 10);
    let son = t.iter().filter(|d| d.son > 0).count();
    let _ = writeln!(s, "**Du son** : {son} ploxions · **de la vidéo** : {} · **pas d'enregistrement jOSApps** : {}\n", t.iter().filter(|d| d.video > 0).count(), t.iter().filter(|d| !d.enregistre).count());
    let web: Vec<String> = voies.get("web").map(|l| l.iter().map(|d| d.id.clone()).collect()).unwrap_or_default();
    let _ = writeln!(s, "**Restent web** ({}) : {}\n", web.len(), web.join(", "));
    s
}

fn resume_bionisation(t: &[Digestion], bz: &ploxi_digest::bionisation::Bionisation) -> String {
    let mut s = String::new();
    let purs = t.iter().filter(|d| d.pur).count();
    let _ = writeln!(s, "## La bionisation : que des bions\n");
    let _ = writeln!(s, "**{purs} / {} ploxions** sont déjà faits que de bions. **{:.0} %** du code de tous les ploxions est une fonction copiée telle quelle d'un autre ploxion ({} jetons en tout).\n",
        t.len(), bz.part_dupliquee * 100.0, bz.jetons_total);
    let mut reste: BTreeMap<String, usize> = BTreeMap::new();
    for d in t { for r in &d.reste { let k = r.split(" → ").nth(1).unwrap_or(r).to_string(); *reste.entry(k).or_default() += 1; } }
    let mut rv: Vec<_> = reste.into_iter().collect(); rv.sort_by(|a, b| b.1.cmp(&a.1));
    let _ = writeln!(s, "**Ce qui manque pour qu'ils soient purs** (nombre de ploxions) : {}\n", rv.iter().map(|(k, c)| format!("{k} ({c})")).collect::<Vec<_>>().join(" · "));
    let _ = writeln!(s, "### Les plus répandues : des familles de fonctions recopiées (toutes variantes réunies) → un bion chacune\n\n| fonction | ploxions | variantes | jetons |\n|---|---|---|---|");
    for f in bz.familles.iter().take(25) { let _ = writeln!(s, "| `{}` | {} | {} | {} |", f.nom, f.ploxions, f.variantes, f.jetons_max); }
    let _ = writeln!(s, "\n### Les plus grosses : du code recopié en bloc (un moteur entier → un bion, ou un cubion)\n\n| fonction | jetons | ploxions | copie | viennent avec | aussi nommée | exemples |\n|---|---|---|---|---|---|---|");
    for f in bz.fonctions.iter().take(25) {
        let _ = writeln!(s, "| `{}` | {} | {} | {} | {} | {} | {} |", f.nom, f.jetons, f.ploxions, if f.exacte { "telle quelle" } else { "renommée" }, f.avec, f.alias.join(", "), f.exemples.join(", "));
    }
    let _ = writeln!(s, "\n### Les bions d'interface : des gabarits HTML répétés (la même ossature de balises et de classes)\n\n| ossature | ploxions | exemples |\n|---|---|---|");
    for g in bz.gabarits.iter().take(30) {
        let o: String = g.nom.chars().take(110).collect();
        let _ = writeln!(s, "| `{}{}` | {} | {} |", o, if g.nom.chars().count() > 110 { "…" } else { "" }, g.ploxions, g.exemples.join(", "));
    }
    s
}
