// 🧭 jOSUsage DANS L'APP (RS-7 12.10, capture : « le bion d'usage (jOSUsage) se charge… » à jamais dans xp › Vecteur). Sur le web, jOSUsage
// est posé sur chaque page — aucun ploxion ne le déclare, donc l'app ne le téléchargeait jamais. Ici, la même API, nourrie par :
//   - le temps de CE téléphone (le routeur le compte : boxion_local « usage/stats » = { px, days }) ;
//   - celui du WEB, lu sur le boxion (jOSBoxion « usage/stats », le KV que le xer écrit) quand on est connecté — en LECTURE seule :
//     le téléphone n'écrase jamais l'usage du web ; les deux s'additionnent (deux appareils, deux temps).
// API : track(id) · active() · stats() · top(n) · days(n) · coDays(n) · registry() · vecteur()
const pad2 = (n) => (n < 10 ? '0' : '') + n;
export const jourCle = (t) => { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };

/** additionne deux { px, days } (même forme que le labo) */
export function fusionner(a, b) {
  const out = { px: {}, days: {} };
  for (const s of [a, b]) {
    if (!s || typeof s !== 'object') continue;
    for (const [id, p] of Object.entries(s.px || {})) { const o = out.px[id] = out.px[id] || { opens: 0, seconds: 0, lastAt: 0 }; o.opens += p.opens | 0; o.seconds += p.seconds | 0; o.lastAt = Math.max(o.lastAt, p.lastAt || 0); }
    for (const [k, d] of Object.entries(s.days || {})) {
      const o = out.days[k] = out.days[k] || { opens: 0, seconds: 0, px: {} }; o.opens += d.opens | 0; o.seconds += d.seconds | 0;
      for (const [id, x] of Object.entries(d.px || {})) { const q = o.px[id] = o.px[id] || { o: 0, s: 0 }; q.o += x.o | 0; q.s += x.s | 0; }
    }
  }
  return out;
}

export function creerUsage({ W = globalThis.window, boxion, registre = async () => ({}), distant = () => null }) {
  let local = { px: {}, days: {} }, web = null, st = local, active = null;
  const relire = async () => {
    local = (await boxion.get('usage', 'stats').catch(() => null)) || { px: {}, days: {} };
    const jb = distant();
    if (jb && jb.get) { try { const w = await jb.get('usage', 'stats'); if (w && typeof w === 'object' && w.px) web = w; } catch (e) { /* hors ligne : le dernier connu */ } }
    st = fusionner(local, web);
    return st;
  };
  const pret = relire();
  let regP = null;
  const api = {
    pret,
    relire,
    track(id) { if (typeof id === 'string' && id) active = id.slice(0, 60); },
    active: () => active,
    stats: () => st,
    top(n) { return Object.entries(st.px).map(([id, p]) => ({ id, opens: p.opens || 0, seconds: p.seconds || 0, lastAt: p.lastAt || 0 })).sort((x, y) => (y.seconds + y.opens * 30) - (x.seconds + x.opens * 30)).slice(0, n || 10); },
    days(n) { n = n || 7; const out = []; for (let i = n - 1; i >= 0; i--) { const k = jourCle(Date.now() - i * 864e5), d = st.days[k] || {}; out.push({ date: k, opens: d.opens || 0, seconds: d.seconds || 0 }); } return out; },
    coDays(n) { n = n || 14; const out = []; for (let i = 0; i < n; i++) { const k = jourCle(Date.now() - i * 864e5), d = st.days[k]; if (d && d.px) { const ids = Object.keys(d.px); if (ids.length) out.push({ date: k, ids }); } } return out; },
    registry() { if (!regP) regP = registre().catch(() => ({})); return regP; },
    async vecteur() {
      const map = await api.registry(), sc = {}; let tot = 0;
      for (const [id, p] of Object.entries(st.px)) { const w = (p.seconds || 0) + (p.opens || 0) * 30; if (!(w > 0)) continue; const c = (map[id] && map[id].c) || 'autre'; sc[c] = (sc[c] || 0) + w; tot += w; }
      const out = {}; if (tot > 0) for (const k of Object.keys(sc)) out[k] = Math.round(sc[k] / tot * 1000) / 1000;
      return out;
    },
  };
  return api;
}
