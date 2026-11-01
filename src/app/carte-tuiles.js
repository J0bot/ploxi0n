// ◫ LA CARTE HORS LIGNE (0.99.29, RS-7 01.11 : « améliore la map pour le Bluetooth et la boussole à amis » ; en soirée, il n'y a souvent pas
// de réseau). Avec du réseau, « ⤓ garder la carte du coin » télécharge les tuiles autour de toi (src/bions/potes.js tuilesZone : 1,5 km,
// zooms 13 à 17, 450 au plus) ; ensuite la carte des potes s'affiche aussi sans connexion. Rangées dans le cache du navigateur (Cache API) ;
// s'il n'existe pas, dans boxion_local « tuiles » (en data URL). Rien n'est envoyé : on ne fait que lire des tuiles publiques (CARTO/OSM).
const NOM = 'ploxi-tuiles-v1';

export function creerCacheTuiles({ W = globalThis.window, boxion = null, charger = (u) => (W.fetch || globalThis.fetch)(u, { mode: 'cors' }), parallele = 6 } = {}) {
  const urls = new Map();   // url → l'adresse locale déjà faite (object URL ou data URL)
  let cacheApi;
  const cacheDe = async () => { if (cacheApi !== undefined) return cacheApi; try { cacheApi = W.caches ? await W.caches.open(NOM) : null; } catch (e) { cacheApi = null; } return cacheApi; };
  const enDataUrl = async (blob) => { const b = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return 'data:' + (blob.type || 'image/png') + ';base64,' + (W.btoa || globalThis.btoa)(s); };

  /** une tuile gardée → son adresse locale (pour <img src>), sinon null */
  async function src(url) {
    if (urls.has(url)) return urls.get(url);
    const c = await cacheDe();
    if (c) { const r = await c.match(url).catch(() => null); if (r) { const u = (W.URL || URL).createObjectURL(await r.blob()); urls.set(url, u); return u; } return null; }
    if (boxion) { const v = await boxion.get('tuiles', url).catch(() => null); if (v && v.d) { urls.set(url, v.d); return v.d; } }
    return null;
  }
  async function deja(url) { const c = await cacheDe(); if (c) return !!(await c.match(url).catch(() => null)); return !!(boxion && await boxion.get('tuiles', url).catch(() => null)); }
  /** garder une liste de tuiles ([{ url }]) : celles déjà là sont sautées ; surProgres({ fait, total, echecs }) */
  async function garder(liste, { surProgres = () => {}, arreter = () => false } = {}) {
    const l = liste.map(t => t.url || t), c = await cacheDe(); let fait = 0, echecs = 0, i = 0;
    async function un() {
      while (i < l.length && !arreter()) {
        const u = l[i++];
        try {
          if (!(await deja(u))) {
            const r = await charger(u); if (!r || !r.ok) throw new Error('HTTP ' + (r && r.status));
            if (c) await c.put(u, r); else if (boxion) await boxion.put('tuiles', u, { d: await enDataUrl(await r.blob()), le: Date.now() });
          }
        } catch (e) { echecs++; }
        fait++; surProgres({ fait, total: l.length, echecs });
      }
    }
    await Promise.all(Array.from({ length: Math.min(parallele, l.length) }, un));
    return { fait, total: l.length, echecs };
  }
  /** combien de tuiles d'une liste sont déjà là */
  async function combien(liste) { let n = 0; for (const t of liste) if (await deja(t.url || t)) n++; return n; }
  async function vider() { for (const u of urls.values()) if (String(u).startsWith('blob:')) try { (W.URL || URL).revokeObjectURL(u); } catch (e) { /* */ } urls.clear(); const c = await cacheDe(); if (c && W.caches) await W.caches.delete(NOM).catch(() => {}); cacheApi = undefined; if (boxion) for (const x of await boxion.list('tuiles').catch(() => [])) await boxion.del('tuiles', x.key || x.k || x).catch(() => {}); }
  return { src, garder, combien, vider, deja };
}
