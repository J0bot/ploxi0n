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

async function sha256(texte) {
  const h = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(h), b => b.toString(16).padStart(2, '0')).join('');
}

export function creerDepot({ boxion, http, source = SOURCE, compat = {}, packLocal = [], lireLocal = null }) {
  const NS = 'ploxions', META = 'marketplace';
  async function liste() { const l = await boxion.get(META, 'installes'); return Array.isArray(l) ? l : []; }
  async function garderListe(l) { await boxion.put(META, 'installes', [...new Set(l)]); }
  const valide = (js, id) => typeof js === 'string' && js.length > 0 && js.length < 8e6 && /jOSApps/.test(js) && js.includes(id);

  return {
    source,
    async catalogue({ reseau = true } = {}) {
      if (reseau) {
        try {
          const r = await http.get(source + '/px/registry.json', { headers: { Accept: 'application/json' } });
          if (r.status !== 200) throw new Error('registre : HTTP ' + r.status);
          const brut = JSON.parse(r.texte);
          const items = (Array.isArray(brut) ? brut : brut.ploxions || brut.items || []).filter(p => p && p.id && p.hasScreen && p.enabled !== false && !p.admin && p.status === 'live')
            .map(p => ({ id: p.id, nom: p.name || p.id, icone: p.icon || '▣', description: String(p.description || '').slice(0, 400), categorie: p.cat_label || 'Autres', cat_icone: p.cat_icon || '📦', compat: compat[p.id] || null }));
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
    async installer(id, meta = {}) {
      const r = await http.get(source + '/px/' + encodeURIComponent(id) + '/app.js', { headers: { Accept: 'application/javascript' } });
      if (r.status !== 200) throw new Error(`le serveur refuse ${id} (HTTP ${r.status})`);
      if (!valide(r.texte, id)) throw new Error(`${id} : ce n'est pas un ploxion installable (pas d'enregistrement jOSApps)`);
      const doc = { id, nom: meta.nom || id, icone: meta.icone || '▣', js: r.texte, hash: await sha256(r.texte), etag: (r.entetes && (r.entetes.etag || r.entetes.ETag)) || null, origine: source, installe: new Date().toISOString() };
      await boxion.put(NS, id, doc);
      await garderListe([...(await liste()), id]);
      await boxion.append('tsoins', { kind: 'marketplace', action: 'installer', id, hash: doc.hash });
      return { id, hash: doc.hash, octets: r.texte.length };
    },
    async installerLocal(id) {
      const p = packLocal.find(x => x.id === id); if (!p || !lireLocal) throw new Error(id + ' n\'est pas dans le pack hors ligne');
      const js = await lireLocal(id);
      if (!valide(js, id)) throw new Error(id + ' : bundle du pack invalide');
      await boxion.put(NS, id, { id, nom: p.nom, icone: p.icone, js, hash: await sha256(js), etag: null, origine: 'pack', installe: new Date().toISOString() });
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
    async bundle(id) { const p = await boxion.get(NS, id); return p ? p.js : null; },
  };
}

/** l'accès HTTP : CapacitorHttp (natif, sans CORS) sur l'iPhone, fetch ailleurs */
export function creerHttp(W = globalThis.window) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  return {
    async get(url, { headers = {} } = {}) {
      if (natif()) {
        const { CapacitorHttp } = await import('@capacitor/core');
        const r = await CapacitorHttp.get({ url, headers, responseType: 'text' });
        const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
        return { status: r.status, texte: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), entetes: h };
      }
      const r = await W.fetch(url, { headers });
      const h = {}; r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, texte: r.status === 304 ? '' : await r.text(), entetes: h };
    },
  };
}
