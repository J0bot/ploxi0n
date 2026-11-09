// 🩺 (0.99.23, la feuille de route : « diagnostic sur tous les ploxions publics, publié comme compat.json ») : le bilan de santé du faux iPhone
// (tools/faux-iphone/parcours-tous.mjs → build/digestion/sante*.json : chaque ploxion public du labo ouvert avec son vrai code et ses vrais
// bions) versé dans public/marketplace/compat.json, à côté du banc d'avant : ip = ok | attend | casse, ipr = pourquoi (en mots), ipd = le jour.
// Le marketplace en fait un badge (« ✓ testé sur l'iPhone », ou la raison). node tools/digestion/compat-iphone.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
const D = 'build/digestion/', C = 'public/marketplace/compat.json';
const code = (id) => { try { return readFileSync(D + 'ploxions/' + id + '.js', 'utf8'); } catch (e) { return ''; } };
/** un bilan → { ip, ipr } */
export function classer(id, x, js = '') {
  const tout = [x.erreur, ...(x.erreurs || [])].filter(Boolean).join(' | ');
  if (/leaflet load failed|cdnjs|ERR_TUNNEL|Failed to fetch/i.test(tout)) return { ip: 'attend', ipr: 'a besoin du réseau' };
  if (/jOSLedger\.tail/.test(tout)) return { ip: 'casse', ipr: 'au labo : son jOSLedger porte le nom d\'un autre bion' };
  if (/describe is not defined/.test(tout)) return { ip: 'casse', ipr: 'au labo : plante au chargement' };
  if (/\b50[0-9]\b/.test(tout)) return { ip: 'attend', ipr: 'a besoin du labo en ligne' };
  if (x.erreur || !x.hote) return { ip: 'casse', ipr: 'ne s\'ouvre pas encore : ' + String(x.erreur || 'pas monté').replace(/^Ce ploxion n'a pas pu s'ouvrir : /, '').slice(0, 90) };
  if (x.visibles <= 3 && x.texte < 30) {
    if (/zone/i.test(x.extrait || '')) return { ip: 'attend', ipr: 'attend une zone' };
    if (/createElement\(['"]iframe['"]\)/.test(js) && /\bf\.src\s*=\s*url|src = url/.test(js)) return { ip: 'attend', ipr: 'une page du labo : le mode connecté' };
    return { ip: 'attend', ipr: 'reste vide hors ligne' };
  }
  return { ip: 'ok' };
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const sante = Object.assign({}, ...readdirSync(D).filter(f => /^sante.*\.json$/.test(f)).map(f => JSON.parse(readFileSync(D + f, 'utf8'))));
  const compat = existsSync(C) ? JSON.parse(readFileSync(C, 'utf8')) : {}, jour = new Date().toISOString().slice(0, 10), n = { ok: 0, attend: 0, casse: 0 };
  for (const [id, x] of Object.entries(sante)) { const r = classer(id, x, code(id)); compat[id] = { ...(compat[id] || {}), ...r, ipd: jour }; if (!r.ipr) delete compat[id].ipr; n[r.ip]++; }
  writeFileSync(C, JSON.stringify(compat));
  console.log(Object.keys(sante).length + ' ploxions testés → ' + C + ' : ' + JSON.stringify(n));
}
