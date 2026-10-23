// 🩺 (0.99.19, RS-7 : « certains ploxions qui tournent pas, d'autres avec un xer dégueu ») : TOUS les ploxions publics du labo, avec leur vrai
// code et leurs vrais bions (récoltés : tools/digestion/recolter.mjs, recolter-bions.mjs), ouverts un par un dans le faux iPhone. Pour chacun :
// a-t-il planté au montage, ses erreurs JS, est-il resté vide, une vignette. Résultats dans build/digestion/sante.json (au fil de l'eau).
//   PX_TOUS_DE=0 PX_TOUS_N=600 node tools/faux-iphone/faux-iphone.mjs … --script tools/faux-iphone/parcours-tous.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
export default async function ({ page }) {
  const DE = +(process.env.PX_TOUS_DE || 0), N = +(process.env.PX_TOUS_N || 600);
  const dig = JSON.parse(readFileSync('build/digestion/digestion.json', 'utf8'));
  const ids = dig.map(d => d.id).filter(id => existsSync('build/digestion/ploxions/' + id + '.js')).slice(DE, DE + N);
  const bions = Object.fromEntries(readdirSync('build/digestion/bions').filter(f => f.endsWith('.js')).map(f => [f.slice(0, -3), readFileSync('build/digestion/bions/' + f, 'utf8')]));
  mkdirSync('build/digestion/vignettes', { recursive: true });
  await page.evaluate(async (bions) => { const b = window.ploxi0n.boxion; for (const [n, js] of Object.entries(bions)) await b.put('bions', n, { js, hash: 'r', le: new Date().toISOString() }); }, bions);
  for (let i = 0; i < ids.length; i += 40) {
    const lot = ids.slice(i, i + 40).map(id => ({ id, js: readFileSync('build/digestion/ploxions/' + id + '.js', 'utf8'), bions: Object.keys((dig.find(d => d.id === id) || {}).bions || {}) }));
    await page.evaluate(async (lot) => { const b = window.ploxi0n.boxion; for (const p of lot) await b.put('ploxions', p.id, { id: p.id, nom: p.id, icone: '▣', js: p.js, hash: 'h', origine: 'https://labo.j0bot.ch', installe: new Date().toISOString(), bions: p.bions });
      const l = (await b.get('marketplace', 'installes')) || []; await b.put('marketplace', 'installes', [...new Set([...l, ...lot.map(p => p.id)])]); }, lot);
  }
  await page.reload(); await page.waitForTimeout(3500);
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  let erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e.message || e).split('\n')[0].slice(0, 200)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  const sortie = 'build/digestion/sante' + (DE ? '-' + DE : '') + '.json', res = existsSync(sortie) ? JSON.parse(readFileSync(sortie, 'utf8')) : {};
  for (const id of ids) {
    if (res[id]) continue;
    erreurs = [];
    const t0 = Date.now();
    await page.evaluate((id) => { window.ploxi0n.routeur.ouvrir(id); }, id).catch((e) => erreurs.push('ouvrir : ' + e.message));
    await page.waitForTimeout(1300);
    const m = await page.evaluate((id) => {
      const h = document.querySelector('.px-hote[data-ploxion="' + CSS.escape(id) + '"]'); if (!h) return { hote: false };
      const r = h.getBoundingClientRect(), err = h.querySelector('.px-erreur');
      const visibles = [...h.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && b.bottom > 0 && b.top < innerHeight; });
      return { hote: true, erreur: err ? err.textContent.slice(0, 200) : null, elements: h.querySelectorAll('*').length, visibles: visibles.length, texte: (h.innerText || '').trim().length, extrait: (h.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 300), haut: Math.round(r.height), large: document.documentElement.scrollWidth - innerWidth };
    }, id).catch((e) => ({ hote: false, exception: e.message }));
    await page.screenshot({ path: 'build/digestion/vignettes/' + id + '.jpg', type: 'jpeg', quality: 35 }).catch(() => {});
    res[id] = { ...m, erreurs: [...new Set(erreurs)].slice(0, 5), ms: Date.now() - t0 };
    writeFileSync(sortie, JSON.stringify(res));
    await page.evaluate((id) => { try { window.ploxi0n.routeur.tuer ? window.ploxi0n.routeur.tuer(id) : window.ploxi0n.routeur.fermer(); } catch (e) { /* */ } window.ploxi0n.routeur.faire('accueil'); }, id).catch(() => {});
    await page.waitForTimeout(150);
  }
  return { faits: Object.keys(res).length };
}
