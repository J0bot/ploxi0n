// Le MARKETPLACE de ploxi0n (brief v1, « Marketplace et offline ») : le réseau ne sert qu'à installer ; un ploxion installé tourne depuis
// boxion_local, jamais depuis le réseau.
//   catalogue()      le registre de labo.j0bot.ch (/px/registry.json), filtré (écrans publics, activés), avec la compatibilité mesurée par le
//                    banc (public/marketplace/compat.json) ; mis en cache dans boxion_local → consultable en mode avion
//   installer(id)    GET /px/<id>/app.js → vérifié (s'enregistre dans jOSApps) → hash SHA-256 → boxion_local « ploxions/<id> »
//   installerLocal(id) depuis le pack hors ligne embarqué (public/ploxions/<id>/app.js) : sans réseau
//   aJour()          pour chaque ploxion installé depuis le réseau : If-None-Match (ETag) → 304 = à jour, 200 = une mise à jour
//   retirer(id), installes(), bundle(id)
// http = { get(url, { headers }) → { status, texte, entetes } } : CapacitorHttp sur l'iPhone (pas de CORS), fetch ailleurs, un faux en test.
import { ploxionsComposes } from '../shim/apps-a-la-demande.js';
export const SOURCE = 'https://labo.j0bot.ch';
// les bions que l'app fournit déjà (le shim, Face ID, le pack) : jamais téléchargés
export const FOURNIS = new Set(['jOSApps', 'jOSPorts', 'jOSTsoin', 'jOSBoxion', 'jOS', 'jOSXerPrefs', 'jOSMobile', 'jOSb', 'jOSVerrou', 'jOSNatif', 'jOSRaccourcis', 'jOSEcranAccueil', 'jOSKeyboard', 'jOSUsage', 'jOSSante', 'jOSMiniDock']);
/** les bions qu'un bundle du labo déclare attendre (window.__PLOXIONS_BIONS__[id] = [...]) */
export function bionsDuBundle(js) {
  const m = /__PLOXIONS_BIONS__[\s\S]{0,200}?\]\s*=\s*(\[[^\]]*\])/.exec(js || '');
  try { return m ? JSON.parse(m[1]).filter(b => typeof b === 'string' && /^jOS[A-Za-z0-9]{1,48}$/.test(b)) : []; } catch (e) { return []; }
}

/** les bions qu'un code TOUCHE (window.jOSX…, jOSX.f()) : beaucoup de bundles n'en déclarent aucun (RS-7 11.10 : xerkions, ultimate-social) */
export function bionsTouches(js, sauf = '') {
  const s = String(js || '');
  // (0.78) un bion que le code définit LUI-MÊME (window.jOSXerClicker = { … } dans 🎮 Jeu et le Clickion) n'est pas à télécharger : le labo
  // ne le sert pas seul, et son 404 est une page de 3,5 Mo
  const definis = new Set([...s.matchAll(/\bwindow\.(jOS[A-Z][A-Za-z0-9]{0,47})\s*=(?!=)/g)].map(m => m[1]));
  return [...new Set(s.match(/\bjOS[A-Z][A-Za-z0-9]{0,47}\b/g) || [])].filter(b => b !== sauf && !FOURNIS.has(b) && !definis.has(b));
}

/** (0.51) le code d'un ploxion servi DANS sa page (/px/<id>, sans app.js : spotify, wiki, notes, calendar…) : le dernier
 *  <style> + <script> qui enregistre jOSApps['<id>'], avant <div id="pxhost"> ; rendu comme un bundle (le style injecté par le script). */
export function bundleDeLaPage(html, id) {
  const h = String(html || ''); const fin = h.indexOf('<div id="pxhost"'); if (fin < 0) return null;
  const avant = h.slice(0, fin), re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi; let m, code = null, debut = -1;
  // (0.99.3) trois façons d'enregistrer, vues au labo : jOSApps['musique'] = … ; jOSApps[ID] = … avec ID = 'musique' (musique, chemin, agora, rs,
  // ram, youtube-music, download) ; jOSApps.calendar = … (calendar). Sans les deux dernières, ces ploxions « refusaient » de s'installer.
  const nid = id.replace(/[^a-z0-9_-]/gi, ''), q = '[\'"`]';
  const directe = new RegExp('jOSApps\\s*\\[\\s*' + q + nid + q + '\\s*\\]\\s*=(?!=)');
  const pointee = /^[a-z_$][a-z0-9_$]*$/i.test(nid) ? new RegExp('jOSApps\\s*\\.\\s*' + nid + '\\s*=(?!=)') : null;
  // jOSApps[ID] = … : ID posé ailleurs dans le script (var ID = 'x' ; var W = window, ID = 'x')
  const parNom = (c) => { for (const x of c.matchAll(/jOSApps\s*\[\s*([A-Za-z_$][\w$]*)\s*\]\s*=(?!=)/g)) if (new RegExp('(?:^|[^.\\w$])' + x[1].replace(/\$/g, '\\$') + '\\s*=\\s*' + q + nid + q).test(c)) return true; return false; };
  const enregistre = { test: (c) => directe.test(c) || !!(pointee && pointee.test(c)) || parNom(c) };
  while ((m = re.exec(avant))) if (enregistre.test(m[1])) { code = m[1]; debut = m.index; }
  if (!code) return null;
  const tete = avant.slice(0, debut), i = tete.toLowerCase().lastIndexOf('<style');   // le <style> collé juste avant ce script (pas ceux de la page)
  const st = i >= 0 ? /^<style\b[^>]*>([\s\S]*?)<\/style>\s*$/i.exec(tete.slice(i)) : null;
  const css = st ? st[1] : '';
  return '/* ' + id + ' : extrait de la page /px/' + id + ' par ploxi0n (le labo ne sert pas son app.js) */\n'
    + (css ? '(function(){try{var s=document.createElement("style");s.dataset.ploxion=' + JSON.stringify(id) + ';s.textContent=' + JSON.stringify(css) + ';document.head.appendChild(s);}catch(e){}})();\n' : '')
    + code;
}

async function sha256(texte) {
  const h = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(h), b => b.toString(16).padStart(2, '0')).join('');
}

export function creerDepot({ boxion, http, source = SOURCE, compat = {}, packLocal = [], lireLocal = null, lireBionLocal = null, estAdmin = () => false, surMisAJour = null, surInstalle = null }) {
  const NS = 'ploxions', META = 'marketplace';
  async function liste() { const l = await boxion.get(META, 'installes'); return Array.isArray(l) ? l : []; }
  async function garderListe(l) { await boxion.put(META, 'installes', [...new Set(l)]); }
  // (0.99.3) PATIENT : le labo répond 429 (trop de requêtes) quand on installe ou met à jour en rafale (6 à la fois) ; avant, un bion qui
  // recevait 429 était noté ABSENT pendant 7 jours (56 bions valides bannis, 140 ploxions installés sans leurs bions). On réessaie (Retry-After,
  // sinon 0,7 s · 1,4 s · 2,8 s) ; seul un vrai 404 / 410 veut dire « n'existe pas ».
  const dormir = (ms) => new Promise(r => setTimeout(r, ms));
  async function getPatient(url, o) {
    for (let i = 0; ; i++) {
      const r = await http.get(url, o);
      if (!(r && (r.status === 429 || r.status >= 500)) || i >= 3) return r;
      const e = r.entetes || {}, ra = +(e['retry-after'] || e['Retry-After'] || 0);
      await dormir(Math.min(8000, ra > 0 ? ra * 1000 : 700 * 2 ** i));
    }
  }
  const vraimentAbsent = (st) => st === 404 || st === 410;
  // (0.99.6) l'entrée d'index d'un ploxion (léger : jamais son code) ; majIndex la pose ou la retire SANS relire les autres
  const entreeIndex = (p) => ({ nom: p.nom, icone: p.icone, origine: p.origine, hash: p.hash, etag: p.etag || null, taille: (p.js || '').length, installe: p.installe, maj: p.maj || null, bions: Array.isArray(p.bions) ? p.bions.slice(0, 40) : [],
    manq: Array.isArray(p.manquants) ? p.manquants.length : null,   /* null = on ne sait pas : la réparation le regarde */ composes: p.js ? ploxionsComposes(p.js, p.id).slice(0, 20) : [] });
  async function majIndex(id, p) {
    const idx = await boxion.get(META, 'installes-index').catch(() => null); if (!idx) return;   // pas d'index : il se fera à la demande
    if (p) idx[id] = entreeIndex({ id, ...p }); else delete idx[id];
    await boxion.put(META, 'installes-index', idx).catch(() => {});
  }
  // (0.99.6) le labo dit 429 malgré la patience : plus aucun bion demandé pendant une minute (au lieu de marteler, et de ralentir tout le reste)
  let sature = 0; const echecs = new Set();
  let reconstruction = null;   // (0.99.6) la reconstruction de l'index en cours, partagée
  const valide = (js, id) => typeof js === 'string' && js.length > 0 && js.length < 8e6 && /jOSApps/.test(js) && js.includes(id);

  // les bions d'un code, RÉCURSIVEMENT (les bions d'un bion), dépendances d'abord ; servis seuls par le labo (/px/bion-app/<jOSNom>.js).
  // « manquants » = ceux que le bundle DÉCLARE et que personne ne sert (un bion seulement touché et introuvable : ignoré, le code teste son
  // existence). Un bion déjà dans boxion_local ne se retélécharge pas. 80 bions au plus par ploxion.
  // progres({ etape, nom, fait, connus }) : la barre d'installation (RS-7 12.10 : « une barre de chargement qui montre que le ploxion s'installe »)
  async function resoudreBions(js, progres = null) {
    const vus = new Set(), ordre = [], manquants = [], declares = new Set(bionsDuBundle(js));
    const signaler = (nom) => { if (progres) try { progres({ etape: 'bion', nom, fait: ordre.length + manquants.length, connus: Math.max(vus.size, declares.size) }); } catch (e) { /* */ } };
    async function visiter(b) {
      if (vus.has(b) || FOURNIS.has(b) || vus.size >= 80) return;
      vus.add(b);
      let x = await boxion.get('bions', b);
      // (0.51) un bion que le labo ne sert pas répond par une page HTML de 3,5 Mo (Stremio : jOSCineJournal, jOSParesseux, jOSXxx → ~10 Mo
      // par installation, en données mobiles) : noté absent, il n'est pas redemandé pendant 7 jours
      const absent = x ? null : await boxion.get('bions-absents', b).catch(() => null);
      if (!x && !(absent && vraimentAbsent(absent.status) && Date.now() - (+absent.le || 0) < 7 * 864e5) && Date.now() >= sature && !echecs.has(b)) {   // un ancien « absent » sur un 429 ne compte plus
        signaler(b);
        try {
          const rb = await getPatient(source + '/px/bion-app/' + b + '.js', { headers: { Accept: 'application/javascript' } });
          if (rb.status === 200 && rb.texte.includes(b) && !/^\s*<(!doctype|html)/i.test(rb.texte)) { x = { js: rb.texte, hash: await sha256(rb.texte), le: new Date().toISOString() }; await boxion.put('bions', b, x); }
          else if (vraimentAbsent(rb.status) || rb.status === 200) await boxion.put('bions-absents', b, { le: Date.now(), status: rb.status }).catch(() => {});
          else { echecs.add(b); if (rb.status === 429) sature = Date.now() + 60000; }
        } catch (e) { /* hors ligne : manquant (pas noté absent : on réessaiera) */ }
      }
      if (!x) { if (declares.has(b)) manquants.push(b); return; }
      for (const c of bionsTouches(x.js, b)) await visiter(c);
      ordre.push(b); signaler(b);
    }
    for (const b of [...declares, ...bionsTouches(js)]) await visiter(b);
    return { bions: ordre, manquants };
  }

  return {
    source,
    /** complète les bions des ploxions déjà installés (règle « déclarés + touchés », 0.8) : une fois, en ligne */
    async completerBions({ max = 8, pause = 300 } = {}) {
      // (0.99.6) seulement les ploxions à qui il MANQUE des bions (l'index le dit), au plus `max` par appel, une pause entre chacun ; rend
      // aussi `reste` (l'app rappelle au prochain lancement tant qu'il en reste). Avant : chaque ploxion relu et réécrit au démarrage.
      const l = await this.installes(), res = [];
      const aFaire = l.filter(x => x.manq > 0 || x.manq == null);
      for (const x of aFaire.slice(0, max)) {
        if (Date.now() < sature) break;
        const p = await boxion.get(NS, x.id); if (!p) continue;
        const { bions, manquants } = await resoudreBions(p.js);
        const doc = { ...p, bions, manquants };
        if (bions.join() !== (p.bions || []).join() || manquants.join() !== (p.manquants || []).join()) { await boxion.put(NS, x.id, doc); res.push({ id: x.id, avant: (p.bions || []).length, apres: bions.length }); }
        await majIndex(x.id, doc);
        if (pause) await dormir(pause);
      }
      const reste = (await this.installes()).filter(x => x.manq > 0 || x.manq == null).length;
      return Object.assign(res, { reste });
    },
    async catalogue({ reseau = true } = {}) {
      if (reseau) {
        try {
          const r = await http.get(source + '/px/registry.json', { headers: { Accept: 'application/json' } });
          if (r.status !== 200) throw new Error('registre : HTTP ' + r.status);
          const brut = JSON.parse(r.texte);
          const items = (Array.isArray(brut) ? brut : brut.ploxions || brut.items || []).filter(p => p && p.id && p.hasScreen && p.enabled !== false && (!p.admin || estAdmin()) && p.status === 'live')
            .map(p => ({ id: p.id, nom: p.name || p.id, icone: p.icon || '▣', description: String(p.description || '').slice(0, 400), categorie: p.cat_label || 'Autres', cat: p.category || null, cat_icone: p.cat_icon || '📦', compat: compat[p.id] || null, admin: !!p.admin, mtime: +p.mtime || 0, fournit: Array.isArray(p.provides) ? p.provides.slice(0, 8).map(String) : [], xerkion: (p.xerkion && typeof p.xerkion === 'object' && !Array.isArray(p.xerkion)) ? p.xerkion : null, type: typeof p.type === 'string' ? p.type : null }));
          // ⬡ (0.55) un xerkion a autant de côtés que de koins (ses ploxions) : /px/xerkions.json les compte (src/app/xerkion-icone.js)
          try {
            const rx = await http.get(source + '/px/xerkions.json', { headers: { Accept: 'application/json' } });
            const xk = rx.status === 200 ? new Map(((JSON.parse(rx.texte) || {}).items || []).map(x => [x.id, x])) : new Map();
            for (const it of items) { const x = xk.get(it.id); if (x) { it.koins = Array.isArray(x.koins) ? x.koins.length : 0; if (typeof x.center === 'string') it.centre = x.center; } }
          } catch (e) { /* sans les koins : l'octogone-xer */ }
          const c = { maj: new Date().toISOString(), source, items };
          await boxion.put(META, 'catalogue', c);
          return { ...c, horsLigne: false };
        } catch (e) {
          const c = await boxion.get(META, 'catalogue');
          if (c) return { ...c, horsLigne: true, erreur: e.message };
          return { maj: null, items: [], horsLigne: true, erreur: e.message };
        }
      }
      const c = await boxion.get(META, 'catalogue');
      return c ? { ...c, horsLigne: true } : { maj: null, items: [], horsLigne: true };
    },
    packLocal: () => packLocal.slice(),
    // (12.10, RS-7 : « c'est ultra lent à ouvrir ») installes() relisait CHAQUE ploxion EN ENTIER (son bundle : jusqu'à 2 Mo) pour son nom et
    // son icône, deux fois par lancement : un index léger (META « installes ») suffit ; reconstruit une fois s'il manque ou s'il diverge
    // (0.99.6, RS-7 : « quand j'ouvre l'app ça freeze ») : sur l'iPhone, lire ou écrire un ploxion = son bundle (jusqu'à 2 Mo) à travers le pont
    // natif, sérialisé sur le fil principal. Mesuré au faux iPhone (120 ploxions de 600 Ko) : 496 Mo en 35 s au démarrage. Désormais l'index
    // porte tout ce qu'il faut (dates, bions, manquants, composés) et se tient à jour ENTRÉE PAR ENTRÉE ; seuls les ploxions absents de
    // l'index sont relus, une fois.
    async installes() {
      const ids = await liste(), idx = (await boxion.get(META, 'installes-index').catch(() => null)) || {};
      const manque = ids.filter(id => !(idx[id] && idx[id].bions));
      if (!manque.length) return ids.map(id => ({ id, ...idx[id] }));   // (0.60) l'index porte aussi les bions (la face du dessus du cube)
      // une seule reconstruction à la fois : au démarrage, cinq appels simultanés relisaient chacun tous les ploxions (le gel de RS-7)
      if (!reconstruction) reconstruction = (async () => {
        for (const id of manque) { const p = await boxion.get(NS, id); if (p) idx[id] = entreeIndex(p); }
        for (const k of Object.keys(idx)) if (!ids.includes(k)) delete idx[k];
        await boxion.put(META, 'installes-index', idx).catch(() => {});
      })().finally(() => { reconstruction = null; });
      await reconstruction;
      const fini = (await boxion.get(META, 'installes-index').catch(() => null)) || idx;
      return ids.filter(id => fini[id]).map(id => ({ id, ...fini[id] }));
    },
    async installer(id, meta = {}, progres = null) {
      if (progres) progres({ etape: 'ploxion', nom: id, fait: 0, connus: 1 });
      let r = await getPatient(source + '/px/' + encodeURIComponent(id) + '/app.js', { headers: { Accept: 'application/javascript' } });
      // (0.51) pas d'app.js (le 404 du labo est une page HTML de 3,5 Mo) : le code est dans la page du ploxion → on l'en extrait
      if (r.status !== 200 || /^\s*<(!doctype|html)/i.test(r.texte || '')) {
        const pg = await getPatient(source + '/px/' + encodeURIComponent(id), { headers: { Accept: 'text/html' } }).catch(() => null);
        const js = pg && pg.status === 200 ? bundleDeLaPage(pg.texte, id) : null;
        if (!js) throw new Error(r.status === 200 || (pg && pg.status === 200) ? `${id} : ce n'est pas un ploxion installable (pas d'enregistrement jOSApps)` : `le serveur refuse ${id} (HTTP ${(pg && pg.status) || r.status})`);
        r = { status: 200, texte: js, entetes: {} };
      }
      if (!valide(r.texte, id)) throw new Error(`${id} : ce n'est pas un ploxion installable (pas d'enregistrement jOSApps)`);
      if (progres) progres({ etape: 'recu', nom: id, octets: r.texte.length, fait: 0, connus: 1 });
      const { bions, manquants } = await resoudreBions(r.texte, progres);
      const doc = { id, nom: meta.nom || id, icone: meta.icone || '▣', js: r.texte, hash: await sha256(r.texte), etag: (r.entetes && (r.entetes.etag || r.entetes.ETag)) || null, origine: source, installe: new Date().toISOString(), bions, manquants };
      await boxion.put(NS, id, doc); await majIndex(id, doc);
      await garderListe([...(await liste()), id]);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'installer', id, hash: doc.hash });
      const composes = ploxionsComposes(r.texte, id);
      if (surInstalle) try { surInstalle(id, composes); } catch (e) { /* (0.81) l'app installe ses dépendances en fond */ }
      return { id, hash: doc.hash, octets: r.texte.length, bions, manquants, composes };
    },
    async installerLocal(id) {
      const p = packLocal.find(x => x.id === id); if (!p || !lireLocal) throw new Error(id + ' n\'est pas dans le pack hors ligne');
      const js = await lireLocal(id);
      if (!valide(js, id)) throw new Error(id + ' : bundle du pack invalide');
      const bions = [];
      for (const b of p.bions || []) {
        if (await boxion.get('bions', b)) { bions.push(b); continue; }
        const bj = lireBionLocal ? await lireBionLocal(b).catch(() => null) : null;
        if (bj && bj.includes(b)) { await boxion.put('bions', b, { js: bj, hash: await sha256(bj), le: new Date().toISOString() }); bions.push(b); }
      }
      // (0.78) « labo » : embarqué pour le premier lancement, mais tenu à jour depuis le labo (↻ tout mettre à jour) ; sinon, figé avec l'app
      const docL = { id, nom: p.nom, icone: p.icone, js, hash: await sha256(js), etag: null, origine: p.labo ? source : 'pack', installe: new Date().toISOString(), bions };
      await boxion.put(NS, id, docL); await majIndex(id, docL);
      await garderListe([...(await liste()), id]);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'installer', id, origine: 'pack' });
      return { id };
    },
    /** (0.80) tout mettre à jour. RS-7 (19.10) : « des fois il y a des ploxions qui ne sont pas à jour directement ». Trois causes réparées ici :
     *  une copie gardée en cache par iOS (?maj= et Cache-Control: no-cache), les bions d'une nouvelle version jamais téléchargés (resoudreBions),
     *  les ploxions du pack figés pour toujours (ils suivent le labo dès qu'il en a une version plus récente) ; et 6 à la fois au lieu d'un par un.
     *  Un ploxion servi dans sa page (spotify, wiki : pas d'app.js) se relit dans sa page. → [{ id, etat: a-jour | mis-a-jour | erreur, detail? }] */
    /** (0.99.5) le CHANGELOG du labo (/px/changelog.json : par_ploxion { dernier, n, commits }) : une requête pour savoir ce qui a changé */
    async changelog() {
      const r = await getPatient(source + '/px/changelog.json', { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
      if (r.status !== 200) throw new Error('changelog : HTTP ' + r.status);
      const d = JSON.parse(r.texte || '{}'); if (!d || typeof d.par_ploxion !== 'object') throw new Error('changelog illisible');
      return { head: String(d.head || ''), par: d.par_ploxion };
    },
    async aJour({ concurrence = 6, ids = null, progres = null, auto = false, forcer = false } = {}) {
      // (0.80) introuvable au labo (son 404 : une page de 3,5 Mo) : l'automatique ne le redemande pas pendant 7 jours ; « vérifier » si
      const introuvables = (await boxion.get(META, 'maj-introuvables').catch(() => null)) || {};
      let tous = (ids || await liste()).filter(id => !(auto && introuvables[id] && Date.now() - introuvables[id] < 7 * 864e5)); const res = [];
      // (0.99.5, RS-7 : « si dans le changelog il n'a pas changé, ça sert à rien de le mettre à jour ; vraiment checker tous les ploxions, c'est
      // une erreur de design ») : le changelog d'abord. Un ploxion dont l'entrée n'a pas bougé depuis la dernière fois → à jour, sans rien
      // télécharger ; absent du changelog → il n'a pas changé ; la première fois : son dernier changement est-il AVANT son installation ?
      // Seuls ceux qui ont vraiment changé sont téléchargés. Sans changelog (labo en panne) : l'ancienne vérification, ploxion par ploxion.
      const jr = forcer || !tous.length ? null : await this.changelog().catch(() => null);   /* rien à vérifier : pas même une requête */
      const marqueDe = (id) => { const x = jr && jr.par[id]; return x ? (x.dernier || '') + '#' + (x.n || 0) + '#' + ((Array.isArray(x.commits) && x.commits[0]) || '') : 'aucun'; };   // un commit de plus change n
      const marques = jr ? ((await boxion.get(META, 'changelog-marques').catch(() => null)) || {}) : null;   /* (0.99.6) un petit document, pas les ploxions */
      if (jr) {
        const aVoir = [], idx = new Map((await this.installes()).map(x => [x.id, x]));
        for (const id of tous) {
          const e = idx.get(id); if (!e) continue;
          const m = marqueDe(id), x = jr.par[id], depuis = String(e.maj || e.installe || '').slice(0, 10);
          const inchange = marques[id] ? marques[id] === m : (!x || (depuis && x.dernier && String(x.dernier) < depuis));
          if (inchange) { marques[id] = m; res.push({ id, etat: 'a-jour', detail: 'changelog' }); }
          else aVoir.push(id);
        }
        tous = aVoir;
      }
      let i = 0, fait = 0;
      const idxMaj = new Map((await this.installes()).map(x => [x.id, x]));
      const un = async (id) => {
        const p = idxMaj.get(id) || await boxion.get(NS, id); if (!p) return null;   /* (0.99.6) l'index (empreinte, ETag, origine) : le ploxion n'est lu que s'il a changé */
        const pack = p.origine === 'pack';
        try {
          const casse = 'maj=' + Date.now().toString(36);
          let r = await http.get(source + '/px/' + encodeURIComponent(id) + '/app.js?' + casse, { headers: { 'Cache-Control': 'no-cache', ...(p.etag ? { 'If-None-Match': p.etag } : {}) } });
          const marquer = async () => { if (marques) marques[id] = marqueDe(id); };
          if (r.status === 304) { await marquer(); return { id, etat: 'a-jour' }; }
          if (r.status !== 200 || /^\s*<(!doctype|html)/i.test(r.texte || '')) {
            const pg = await http.get(source + '/px/' + encodeURIComponent(id) + '?' + casse, { headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' } }).catch(() => null);
            const js = pg && pg.status === 200 ? bundleDeLaPage(pg.texte, id) : null;
            if (!js) return pack ? { id, etat: 'a-jour', detail: 'pack' } : { id, etat: 'erreur', detail: 'HTTP ' + r.status };
            r = { status: 200, texte: js, entetes: {} };
          }
          if (!valide(r.texte, id)) return pack ? { id, etat: 'a-jour', detail: 'pack' } : { id, etat: 'erreur', detail: 'pas un ploxion' };
          const h = await sha256(r.texte);
          if (h === p.hash) { await marquer(); return { id, etat: 'a-jour' }; }
          const { bions, manquants } = await resoudreBions(r.texte);
          const ancien = (await boxion.get(NS, id)) || {};
          const nouveau = { ...ancien, js: r.texte, hash: h, bions: [...new Set([...(ancien.bions || []), ...bions])], manquants, origine: source, etag: (r.entetes && (r.entetes.etag || r.entetes.ETag)) || null, maj: new Date().toISOString() };
          await boxion.put(NS, id, nouveau); await majIndex(id, nouveau);
          await marquer();
          await boxion.append('tsoins', { kind: 'marketplace', action: 'mettre-a-jour', id, hash: h });
          if (surMisAJour) try { surMisAJour(id); } catch (e) { /* */ }   // (0.80) l'app décharge l'ancien code (routeur.oublier)
          return { id, etat: 'mis-a-jour' };
        } catch (e) { return { id, etat: 'erreur', detail: e.message }; }
      };
      const ouvrier = async () => { while (i < tous.length) { const id = tous[i++]; const x = await un(id); fait++; if (x) res.push(x); if (progres) try { progres({ fait, total: tous.length, id }); } catch (e) { /* */ } } };
      await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrence, tous.length)) }, ouvrier));
      if (marques) await boxion.put(META, 'changelog-marques', marques).catch(() => {});
      for (const x of res) { if (x.etat === 'erreur' && /^HTTP 404$|pas un ploxion/.test(x.detail || '')) introuvables[x.id] = Date.now(); else delete introuvables[x.id]; }
      await boxion.put(META, 'maj-introuvables', introuvables).catch(() => {});
      return res;
    },
    /** (0.81) les ploxions que les ploxions installés COMPOSENT (leurs onglets, jOSApps.monter…) et qui manquent, connus du catalogue du labo */
    async dependances() {
      const ids = await liste(), ici = new Set(ids), c = await this.catalogue({ reseau: false }).catch(() => ({ items: [] })), labo = new Set((c.items || []).map(x => x.id));
      const pack = new Set(packLocal.map(x => x.id)), out = new Map();
      for (const e of await this.installes()) {   /* (0.99.6) l'index, pas les bundles */
        for (const d of e.composes || []) if (!ici.has(d) && (labo.has(d) || pack.has(d))) { if (!out.has(d)) out.set(d, []); out.get(d).push(e.id); }
      }
      return [...out].map(([id, pour]) => ({ id, pour }));
    },
    async retirer(id) {
      await boxion.del(NS, id); await majIndex(id, null);
      await garderListe((await liste()).filter(x => x !== id));
      await boxion.append('tsoins', { kind: 'marketplace', action: 'retirer', id });
    },
    /** le bundle d'un ploxion, précédé de ses bions ; deja = les bions DÉJÀ exécutés dans la page (un seul chargement par bion pour toute l'app,
     *  RS-7 : « un seul bion pour tout ») — ils sont sautés et ceux ajoutés ici y sont notés */
    async bundle(id, { deja = null } = {}) {
      const p = await boxion.get(NS, id); if (!p) return null;
      const coupes = new Set((await boxion.get('reglages', 'bions-coupes')) || []);
      let avant = '';
      for (const b of p.bions || []) { if (coupes.has(b) || FOURNIS.has(b) || (deja && deja.has(b))) continue; if (deja) deja.add(b); const x = await boxion.get('bions', b); if (x && x.js) avant += '\n;/* bion ' + b + ' */\n' + x.js + '\n;'; }   // chaque bion se garde lui-même d'une double définition
      return avant + '\n' + p.js;
    },
    // ---- GÉRER LES BIONS (RS-7 12.10 : « on doit pouvoir manager les bions ») ----
    /** les bions installés : taille, quels ploxions les utilisent, coupés ou non */
    async bions() {
      const coupes = new Set((await boxion.get('reglages', 'bions-coupes')) || []), par = new Map();
      for (const e of await this.installes()) for (const b of e.bions || []) { if (!par.has(b)) par.set(b, []); par.get(b).push(e.id); }   /* (0.99.6) l'index, pas les bundles */
      const out = [];
      for (const { key } of await boxion.list('bions')) {
        const x = await boxion.get('bions', key); if (!x) continue;
        out.push({ nom: key, octets: (x.js || '').length, hash: x.hash || '', le: x.le || null, utilisePar: par.get(key) || [], coupe: coupes.has(key) });
      }
      return out.sort((a, b) => b.utilisePar.length - a.utilisePar.length || a.nom.localeCompare(b.nom));
    },
    /** couper un bion : il n'est plus chargé avec les ploxions (ils testent son existence) ; réversible */
    async couperBion(nom, coupe = true) {
      const l = new Set((await boxion.get('reglages', 'bions-coupes')) || []);
      if (coupe) l.add(nom); else l.delete(nom);
      await boxion.put('reglages', 'bions-coupes', [...l]);
      await boxion.append('tsoins', { kind: 'marketplace', action: coupe ? 'couper-bion' : 'rallumer-bion', id: nom });
    },
    /** retélécharger un bion depuis le labo ; rend 'a-jour' | 'mis-a-jour' */
    async majBion(nom) {
      const rb = await http.get(source + '/px/bion-app/' + encodeURIComponent(nom) + '.js', { headers: { Accept: 'application/javascript' } });
      if (rb.status !== 200 || !rb.texte.includes(nom)) throw new Error(nom + ' : HTTP ' + rb.status);
      const h = await sha256(rb.texte), x = await boxion.get('bions', nom);
      if (x && x.hash === h) return 'a-jour';
      await boxion.put('bions', nom, { js: rb.texte, hash: h, le: new Date().toISOString() });
      await boxion.append('tsoins', { kind: 'marketplace', action: 'mettre-a-jour-bion', id: nom, hash: h });
      return 'mis-a-jour';
    },
    /** retirer un bion que plus aucun ploxion n'utilise */
    async retirerBion(nom) {
      const b = (await this.bions()).find(x => x.nom === nom);
      if (b && b.utilisePar.length) throw new Error(nom + ' sert encore à ' + b.utilisePar.join(', '));
      await boxion.del('bions', nom);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'retirer-bion', id: nom });
    },
    /** LE GESTIONNAIRE (RS-7 12.10 : « voir les ploxions installés, la place qu'ils prennent et les dépendances ») : par ploxion, son bundle,
     *  ses bions (partagés avec combien d'autres), ce qu'on libérerait en le retirant (le bundle + les bions qui ne servent qu'à lui) */
    async inventaire({ tailles = false } = {}) {   /* tailles : relire le bundle de ceux dont l'index ne connaît pas la taille (le gestionnaire, à la demande) */
      const bs = await this.bions(), parNom = new Map(bs.map(b => [b.nom, b])), out = [];
      for (const p of await this.installes()) {   /* (0.99.6) l'index : le bundle n'est plus relu (dossier.js l'appelle à chaque lancement) */
        const id = p.id;
        const deps = (p.bions || []).map(n => { const b = parNom.get(n); return { nom: n, octets: b ? b.octets : 0, partage: b ? b.utilisePar.length : 1, coupe: !!(b && b.coupe) }; });
        const bundle = p.taille != null ? p.taille : (tailles ? await this.taille(id) : 0), seuls = deps.filter(d => d.partage <= 1).reduce((a, d) => a + d.octets, 0);
        out.push({ id, nom: p.nom, icone: p.icone, origine: p.origine, installe: p.installe, maj: p.maj || null, bundle, liberable: bundle + seuls, total: bundle + deps.reduce((a, d) => a + d.octets, 0), deps });
      }
      const bions = bs.reduce((a, b) => a + b.octets, 0), bundles = out.reduce((a, x) => a + x.bundle, 0);
      return { ploxions: out.sort((a, b) => b.liberable - a.liberable), bions: bs, totaux: { bundles, bions, tout: bundles + bions, orphelins: bs.filter(b => !b.utilisePar.length) } };
    },
    /** la taille d'un ploxion installé (son bundle seul) */
    async taille(id) { const p = await boxion.get(NS, id); return p ? (p.js || '').length : 0; },
    // les plus utilisés : les heures passées, tout le Nexus (labo : /px/marketplace/populaires.json), en cache pour le mode avion
    async populaires({ reseau = true } = {}) {
      if (!reseau) { const d = await boxion.get(META, 'populaires'); return d ? { ...d, horsLigne: true } : { ploxions: [], zero: [], horsLigne: true }; }
      try {
        const r = await http.get(source + '/px/marketplace/populaires.json', { headers: { Accept: 'application/json' } });
        if (r.status !== 200) throw new Error('HTTP ' + r.status);
        const d = JSON.parse(r.texte); await boxion.put(META, 'populaires', d); return { ...d, horsLigne: false };
      } catch (e) { const d = await boxion.get(META, 'populaires'); return d ? { ...d, horsLigne: true } : { ploxions: [], zero: [], horsLigne: true }; }
    },
  };
}

/** l'accès HTTP : CapacitorHttp (natif, sans CORS) sur l'iPhone, fetch ailleurs */
/** enTetes() → des en-têtes ajoutés à chaque requête (le mode connecté : X-Ploxi0n + le jeton de la personne) */
export function creerHttp(W = globalThis.window, enTetes = async () => ({})) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  return {
    async get(url, { headers = {} } = {}) {
      if (natif()) {
        const { CapacitorHttp } = await import('@capacitor/core');
        const r = await CapacitorHttp.get({ url, headers: { ...(await enTetes()), ...headers }, responseType: 'text' });
        const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
        return { status: r.status, texte: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), entetes: h };
      }
      const r = await W.fetch(url, { headers: { ...(await enTetes()), ...headers } });
      const h = {}; r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, texte: r.status === 304 ? '' : await r.text(), entetes: h };
    },
    /** (0.53) les en-têtes seuls (HEAD) : la règle d'encadrement du labo, sans télécharger la page */
    async tete(url) {
      if (natif()) {
        const { CapacitorHttp } = await import('@capacitor/core');
        const r = await CapacitorHttp.request({ url, method: 'HEAD', headers: await enTetes() });
        const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
        return { status: r.status, entetes: h };
      }
      const r = await W.fetch(url, { method: 'HEAD' }); const h = {}; r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, entetes: h };
    },
    /** une requête quelconque (le relais du shim) ; fetchReseau = le fetch d'origine (le shim remplace W.fetch) */
    async requete({ methode = 'GET', url, headers = {}, corps }, fetchReseau = W.fetch.bind(W)) {
      const fichier = corps && typeof corps === 'object' && corps.dataType ? corps : null;   // 📤 (0.85) { dataType: 'formData' | 'file', data, type, original }
      if (natif()) {
        const { CapacitorHttp } = await import('@capacitor/core');
        let data; if (corps && !fichier) { try { data = JSON.parse(corps); } catch (e) { data = corps; } }
        const he = { ...(await enTetes()), ...headers };
        if (fichier) { for (const k of Object.keys(he)) if (k.toLowerCase() === 'content-type') delete he[k]; if (fichier.dataType === 'file') he['Content-Type'] = fichier.type || 'application/octet-stream'; }
        const r = await CapacitorHttp.request({ method: methode, url, headers: he, data: fichier ? fichier.data : data, ...(fichier ? { dataType: fichier.dataType } : {}), responseType: 'text' });
        const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
        return { status: r.status, texte: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), entetes: h };
      }
      const r = await fetchReseau(url, { method: methode, headers: { ...(await enTetes()), ...headers }, body: fichier ? fichier.original : corps });
      const h = {}; r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, texte: await r.text(), entetes: h };
    },
  };
}
