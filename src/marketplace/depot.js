// Le MARKETPLACE de ploxi0n (brief v1, « Marketplace et offline ») : le réseau ne sert qu'à installer ; un ploxion installé tourne depuis
// boxion_local, jamais depuis le réseau.
//   catalogue()      le registre de xerboxion.org (/px/registry.json), filtré (écrans publics, activés), avec la compatibilité mesurée par le
//                    banc (public/marketplace/compat.json) ; mis en cache dans boxion_local → consultable en mode avion
//   installer(id)    GET /px/<id>/app.js → vérifié (s'enregistre dans jOSApps) → hash SHA-256 → boxion_local « ploxions/<id> »
//   installerLocal(id) depuis le pack hors ligne embarqué (public/ploxions/<id>/app.js) : sans réseau
//   aJour()          pour chaque ploxion installé depuis le réseau : If-None-Match (ETag) → 304 = à jour, 200 = une mise à jour
//   retirer(id), installes(), bundle(id)
// http = { get(url, { headers }) → { status, texte, entetes } } : CapacitorHttp sur l'iPhone (pas de CORS), fetch ailleurs, un faux en test.
export const SOURCE = 'https://xerboxion.org';
// les bions que l'app fournit déjà (le shim, Face ID, le pack) : jamais téléchargés
export const FOURNIS = new Set(['jOSApps', 'jOSPorts', 'jOSTsoin', 'jOSBoxion', 'jOS', 'jOSXerPrefs', 'jOSMobile', 'jOSb', 'jOSVerrou', 'jOSNatif', 'jOSRaccourcis', 'jOSEcranAccueil', 'jOSKeyboard', 'jOSUsage']);
/** les bions qu'un bundle du labo déclare attendre (window.__PLOXIONS_BIONS__[id] = [...]) */
export function bionsDuBundle(js) {
  const m = /__PLOXIONS_BIONS__[\s\S]{0,200}?\]\s*=\s*(\[[^\]]*\])/.exec(js || '');
  try { return m ? JSON.parse(m[1]).filter(b => typeof b === 'string' && /^jOS[A-Za-z0-9]{1,48}$/.test(b)) : []; } catch (e) { return []; }
}

/** les bions qu'un code TOUCHE (window.jOSX…, jOSX.f()) : beaucoup de bundles n'en déclarent aucun (RS-7 11.10 : xerkions, ultimate-social) */
export function bionsTouches(js, sauf = '') {
  return [...new Set((String(js || '').match(/\bjOS[A-Z][A-Za-z0-9]{0,47}\b/g) || []))].filter(b => b !== sauf && !FOURNIS.has(b));
}

async function sha256(texte) {
  const h = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(h), b => b.toString(16).padStart(2, '0')).join('');
}

export function creerDepot({ boxion, http, source = SOURCE, compat = {}, packLocal = [], lireLocal = null, lireBionLocal = null, estAdmin = () => false }) {
  const NS = 'ploxions', META = 'marketplace';
  async function liste() { const l = await boxion.get(META, 'installes'); return Array.isArray(l) ? l : []; }
  async function garderListe(l) { await boxion.put(META, 'installes', [...new Set(l)]); }
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
      if (!x) {
        signaler(b);
        try {
          const rb = await http.get(source + '/px/bion-app/' + b + '.js', { headers: { Accept: 'application/javascript' } });
          if (rb.status === 200 && rb.texte.includes(b)) { x = { js: rb.texte, hash: await sha256(rb.texte), le: new Date().toISOString() }; await boxion.put('bions', b, x); }
        } catch (e) { /* hors ligne : manquant */ }
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
    async completerBions() {
      const res = [];
      for (const id of await liste()) {
        const p = await boxion.get(NS, id); if (!p) continue;
        const { bions, manquants } = await resoudreBions(p.js);
        if (bions.join() !== (p.bions || []).join()) { await boxion.put(NS, id, { ...p, bions, manquants }); res.push({ id, avant: (p.bions || []).length, apres: bions.length }); }
      }
      return res;
    },
    async catalogue({ reseau = true } = {}) {
      if (reseau) {
        try {
          const r = await http.get(source + '/px/registry.json', { headers: { Accept: 'application/json' } });
          if (r.status !== 200) throw new Error('registre : HTTP ' + r.status);
          const brut = JSON.parse(r.texte);
          const items = (Array.isArray(brut) ? brut : brut.ploxions || brut.items || []).filter(p => p && p.id && p.hasScreen && p.enabled !== false && (!p.admin || estAdmin()) && p.status === 'live')
            .map(p => ({ id: p.id, nom: p.name || p.id, icone: p.icon || '▣', description: String(p.description || '').slice(0, 400), categorie: p.cat_label || 'Autres', cat: p.category || null, cat_icone: p.cat_icon || '📦', compat: compat[p.id] || null, admin: !!p.admin, mtime: +p.mtime || 0, fournit: Array.isArray(p.provides) ? p.provides.slice(0, 8).map(String) : [] }));
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
    async installes() {
      const out = [];
      for (const id of await liste()) { const p = await boxion.get(NS, id); if (p) out.push({ id, nom: p.nom, icone: p.icone, origine: p.origine, hash: p.hash, installe: p.installe, maj: p.maj || null }); }
      return out;
    },
    async installer(id, meta = {}, progres = null) {
      if (progres) progres({ etape: 'ploxion', nom: id, fait: 0, connus: 1 });
      const r = await http.get(source + '/px/' + encodeURIComponent(id) + '/app.js', { headers: { Accept: 'application/javascript' } });
      if (r.status !== 200) throw new Error(`le serveur refuse ${id} (HTTP ${r.status})`);
      if (!valide(r.texte, id)) throw new Error(`${id} : ce n'est pas un ploxion installable (pas d'enregistrement jOSApps)`);
      if (progres) progres({ etape: 'recu', nom: id, octets: r.texte.length, fait: 0, connus: 1 });
      const { bions, manquants } = await resoudreBions(r.texte, progres);
      const doc = { id, nom: meta.nom || id, icone: meta.icone || '▣', js: r.texte, hash: await sha256(r.texte), etag: (r.entetes && (r.entetes.etag || r.entetes.ETag)) || null, origine: source, installe: new Date().toISOString(), bions, manquants };
      await boxion.put(NS, id, doc);
      await garderListe([...(await liste()), id]);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'installer', id, hash: doc.hash });
      return { id, hash: doc.hash, octets: r.texte.length, bions, manquants };
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
      await boxion.put(NS, id, { id, nom: p.nom, icone: p.icone, js, hash: await sha256(js), etag: null, origine: 'pack', installe: new Date().toISOString(), bions });
      await garderListe([...(await liste()), id]);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'installer', id, origine: 'pack' });
      return { id };
    },
    async aJour() {
      const res = [];
      for (const id of await liste()) {
        const p = await boxion.get(NS, id); if (!p || p.origine === 'pack') continue;
        try {
          const r = await http.get(source + '/px/' + encodeURIComponent(id) + '/app.js', { headers: p.etag ? { 'If-None-Match': p.etag } : {} });
          if (r.status === 304) { res.push({ id, etat: 'a-jour' }); continue; }
          if (r.status !== 200 || !valide(r.texte, id)) { res.push({ id, etat: 'erreur', detail: 'HTTP ' + r.status }); continue; }
          const h = await sha256(r.texte);
          if (h === p.hash) { res.push({ id, etat: 'a-jour' }); continue; }
          await boxion.put(NS, id, { ...p, js: r.texte, hash: h, etag: (r.entetes && (r.entetes.etag || r.entetes.ETag)) || null, maj: new Date().toISOString() });
          await boxion.append('tsoins', { kind: 'marketplace', action: 'mettre-a-jour', id, hash: h });
          res.push({ id, etat: 'mis-a-jour' });
        } catch (e) { res.push({ id, etat: 'erreur', detail: e.message }); }
      }
      return res;
    },
    async retirer(id) {
      await boxion.del(NS, id);
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
      for (const id of await liste()) { const p = await boxion.get(NS, id); for (const b of (p && p.bions) || []) { if (!par.has(b)) par.set(b, []); par.get(b).push(id); } }
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
    async inventaire() {
      const bs = await this.bions(), parNom = new Map(bs.map(b => [b.nom, b])), out = [];
      for (const id of await liste()) {
        const p = await boxion.get(NS, id); if (!p) continue;
        const deps = (p.bions || []).map(n => { const b = parNom.get(n); return { nom: n, octets: b ? b.octets : 0, partage: b ? b.utilisePar.length : 1, coupe: !!(b && b.coupe) }; });
        const bundle = (p.js || '').length, seuls = deps.filter(d => d.partage <= 1).reduce((a, d) => a + d.octets, 0);
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
    /** une requête quelconque (le relais du shim) ; fetchReseau = le fetch d'origine (le shim remplace W.fetch) */
    async requete({ methode = 'GET', url, headers = {}, corps }, fetchReseau = W.fetch.bind(W)) {
      if (natif()) {
        const { CapacitorHttp } = await import('@capacitor/core');
        let data; if (corps) { try { data = JSON.parse(corps); } catch (e) { data = corps; } }
        const r = await CapacitorHttp.request({ method: methode, url, headers: { ...(await enTetes()), ...headers }, data, responseType: 'text' });
        const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
        return { status: r.status, texte: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), entetes: h };
      }
      const r = await fetchReseau(url, { method: methode, headers: { ...(await enTetes()), ...headers }, body: corps });
      const h = {}; r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, texte: await r.text(), entetes: h };
    },
  };
}
