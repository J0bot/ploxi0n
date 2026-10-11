// L'aide des tests : une page jsdom avec boxion_local (mémoire, ou partagé pour simuler un redémarrage), le vrai jOSb du labo, le shim et le
// routeur ; des compteurs pour le « droit au silence » (minuteurs, rAF, écouteurs, blobs) ; un réseau qui refuse tout (le mode avion).
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { installerShim } from '../src/shim/jos.js';
import { creerRouteur } from '../src/app/routeur.js';

export const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const attendre = (ms) => new Promise(r => setTimeout(r, ms || 20));

/** compte ce qu'une page a d'actif : minuteurs, intervalles, rAF, écouteurs window/document, URL de blobs */
/** un faux contexte canvas (jsdom n'a pas de canvas) : tout appel réussit et rend quelque chose de plausible */
function fauxCanvas(w) {
  const rien = function () { return proxy; };
  const proxy = new Proxy(rien, {
    get(t, k) {
      if (k === 'measureText') return () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 });
      if (k === 'getImageData' || k === 'createImageData') return (x, y, l = 1, h = 1) => ({ width: l, height: h, data: new Uint8ClampedArray(Math.max(4, (l | 0) * (h | 0) * 4)) });
      if (k === 'canvas') return null;
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'then') return undefined;
      return proxy;
    },
    set() { return true; },
    apply() { return proxy; },
  });
  w.HTMLCanvasElement.prototype.getContext = function () { return proxy; };
  w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  w.HTMLCanvasElement.prototype.toBlob = (cb) => cb && cb(new w.Blob([]));
}

function compteurs(w, erreurs) {
  const garde = (fn) => (...x) => { try { if (typeof fn === 'function') fn(...x); } catch (e) { erreurs.push('minuteur : ' + (e && e.message)); } };
  const actifs = { timeout: new Map(), interval: new Map(), raf: new Map(), ecoute: new Map(), blob: new Set() };
  const st = w.setTimeout.bind(w), ct = w.clearTimeout.bind(w), si = w.setInterval.bind(w), ci = w.clearInterval.bind(w);
  w.setTimeout = (fn, ms, ...a) => { const g = garde(fn); const id = st((...x) => { actifs.timeout.delete(id); g(...x); }, ms, ...a); actifs.timeout.set(id, ms || 0); return id; };
  w.clearTimeout = (id) => { actifs.timeout.delete(id); ct(id); };
  w.setInterval = (fn, ms, ...a) => { const id = si(garde(fn), ms, ...a); actifs.interval.set(id, ms || 0); return id; };
  w.clearInterval = (id) => { actifs.interval.delete(id); ci(id); };
  let rid = 0; const rafs = new Map();
  w.requestAnimationFrame = (fn) => { const id = ++rid; const t = st(() => { actifs.raf.delete(id); rafs.delete(id); garde(fn)(Date.now()); }, 16); rafs.set(id, t); actifs.raf.set(id, 1); return id; };
  w.cancelAnimationFrame = (id) => { actifs.raf.delete(id); if (rafs.has(id)) { ct(rafs.get(id)); rafs.delete(id); } };
  for (const cible of [w, w.document]) {
    const add = cible.addEventListener.bind(cible), rem = cible.removeEventListener.bind(cible);
    cible.addEventListener = (type, fn, o) => { const k = (cible === w ? 'w:' : 'd:') + type; if (!actifs.ecoute.has(k)) actifs.ecoute.set(k, new Set()); actifs.ecoute.get(k).add(fn); return add(type, fn, o); };
    cible.removeEventListener = (type, fn, o) => { const k = (cible === w ? 'w:' : 'd:') + type; const s = actifs.ecoute.get(k); if (s) s.delete(fn); return rem(type, fn, o); };
  }
  if (w.URL) { w.URL.createObjectURL = (b) => { const u = 'blob:ploxi0n/' + Math.random().toString(36).slice(2); actifs.blob.add(u); return u; }; w.URL.revokeObjectURL = (u) => { actifs.blob.delete(u); }; }
  return {
    photo() { let e = 0; for (const s of actifs.ecoute.values()) e += s.size; return { timeout: actifs.timeout.size, interval: actifs.interval.size, raf: actifs.raf.size, ecoute: e, blob: actifs.blob.size }; },
  };
}

/** une page ploxi0n : options { boxion, avion (refuse tout le réseau), ploxions: [ids à charger depuis public/ploxions] } */
export async function page(o = {}) {
  const vc = new VirtualConsole(); const erreurs = [];
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) erreurs.push(e.message); });
  vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));
  const dom = new JSDOM('<!doctype html><html><head></head><body><main id="ploxi0n"></main></body></html>', { url: 'https://localhost/'   /* capacitor://localhost dans l'app ; jsdom traite ce schéma comme une origine opaque (pas de localStorage) */, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  if (o.ls) for (const [k, v] of Object.entries(o.ls)) w.localStorage.setItem(k, v);
  const tentatives = [];
  // le « réseau » : en mode avion, tout part en erreur (et c'est noté) ; les assets de l'app (public/) répondent depuis le disque
  w.fetch = async (u) => {
    const url = new w.URL(typeof u === 'string' ? u : u.url, w.location.href);
    if (url.origin === w.location.origin) {
      const f = path.join(RACINE, 'public', decodeURIComponent(url.pathname));
      if (existsSync(f)) return new w.Response(readFileSync(f), { status: 200 });
      return new w.Response('introuvable', { status: 404 });
    }
    tentatives.push(url.href);
    if (o.avion !== false) throw new w.TypeError('Failed to fetch (mode avion)');
    return new w.Response('{}', { status: 200 });
  };
  if (!w.Response) w.Response = globalThis.Response;
  fauxCanvas(w);
  const compte = compteurs(w, erreurs);
  w.eval(readFileSync(path.join(RACINE, 'public/vendor/jOSb.js'), 'utf8'));
  const boxion = o.boxion || creerMemoire();
  let catalogue = [];
  try { catalogue = JSON.parse(readFileSync(path.join(RACINE, 'public/ploxions/index.json'), 'utf8')).ploxions; } catch (e) { /* aucun */ }
  if (o.ploxions) catalogue = catalogue.filter(p => o.ploxions.includes(p.id));
  if (o.bundles) catalogue = o.bundles.map(b => ({ id: b.id, nom: b.nom || b.id, icone: b.icone || '▣' }));
  let routeur = null;
  const shim = await installerShim({ boxion, fenetre: w, routeur: { ouvrir: (...a) => routeur.ouvrir(...a), connait: (id) => routeur.connait(id), fermer: () => routeur.fermer() } });
  const evalBundle = (js) => { try { w.eval(js); } catch (e) { erreurs.push('évaluation : ' + e.message); } };
  if (o.bundles) for (const b of o.bundles) evalBundle(b.js);
  else for (const p of catalogue) evalBundle(readFileSync(path.join(RACINE, 'public/ploxions', p.id, 'app.js'), 'utf8'));
  routeur = creerRouteur({ fenetre: w, racine: w.document.getElementById('ploxi0n'), catalogue });
  return { w, dom, boxion, shim, routeur, catalogue, compte, tentatives, erreurs, fin() { try { routeur.fermer(); } catch (e) { /* */ } w.close(); } };
}
