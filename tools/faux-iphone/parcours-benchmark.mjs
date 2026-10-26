// ⌬ (0.99.26, RS-7 26.10 : « checke le ploxion benchmark, on va tester ça sur iPhone ») : le vrai code du labo (/px/benchmark/app.js,
// PX_BENCH_JS=<fichier>), installé comme le marketplace l'installe, ouvert, lancé : chaque épreuve, les workers, l'appareil, comparer,
// envoyer ; puis quitter EN PLEINE MESURE : rien ne doit continuer à tourner (le droit au silence).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
export default async function ({ page, ecrire, appels }) {
  const js = readFileSync(process.env.PX_BENCH_JS || 'build/digestion/ploxions/benchmark.js', 'utf8');
  const dir = 'build/digestion/bions', bions = existsSync(dir) ? Object.fromEntries(readdirSync(dir).filter(f => /^jOS(Icone|Ports)\.js$/.test(f)).map(f => [f.slice(0, -3), readFileSync(dir + '/' + f, 'utf8')])) : {};
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(300); }
  await page.evaluate(async ({ js, bions }) => { const b = window.ploxi0n.boxion; for (const [n, c] of Object.entries(bions)) await b.put('bions', n, { js: c, hash: 'r', le: new Date().toISOString() });
    await b.put('ploxions', 'benchmark', { id: 'benchmark', nom: 'Benchmark', icone: '⌬', js, hash: 'h', origine: 'https://labo.j0bot.ch', installe: new Date().toISOString() });
    const l = (await b.get('marketplace', 'installes')) || []; await b.put('marketplace', 'installes', [...new Set([...l, 'benchmark'])]); }, { js, bions });
  await page.reload(); await page.waitForTimeout(3000);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(300); }
  const erreurs = []; page.on('pageerror', (e) => erreurs.push(String(e.message || e).slice(0, 200)));
  await page.evaluate(() => { window.__fini = []; const P = window.jOSPorts; if (P && P.emit) { const e = P.emit.bind(P); P.emit = (...a) => { if (a[0] === 'benchmark') window.__fini.push(a[2]); return e(...a); }; } });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('benchmark')); await page.waitForTimeout(1500);
  const monte = await page.evaluate(() => !!document.querySelector('.px-hote[data-ploxion="benchmark"] .bm'));
  await ecrire('01-benchmark');
  // ▶ lancer, et attendre le score
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="benchmark"] [data-go]').click());
  await page.waitForFunction(() => { const s = document.querySelector('.px-hote[data-ploxion="benchmark"] .bm__score'); return s && /^\d+$/.test(s.textContent.trim()); }, null, { timeout: 60000 }).catch(() => {});
  const mesures = await page.evaluate(() => { const h = document.querySelector('.px-hote[data-ploxion="benchmark"]'); return { score: h.querySelector('.bm__score').textContent, lignes: [...h.querySelectorAll('.bm__l')].map(l => l.textContent.replace(/\s+/g, ' ').trim()) }; });
  await ecrire('02-score');
  // l'appareil : ce que le ploxion lit de l'iPhone
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="benchmark"] [data-v="appareil"]').click()); await page.waitForTimeout(300);
  const appareil = await page.evaluate(() => [...document.querySelectorAll('.px-hote[data-ploxion="benchmark"] .bm__l')].map(l => l.textContent.replace(/\s+/g, ' ').trim()));
  // comparer (le labo : /px/bench/resultats) et envoyer (POST /px/bench) : par où ça passe
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="benchmark"] [data-v="comparer"]').click()); await page.waitForTimeout(2500);
  const comparer = await page.evaluate(() => (document.querySelector('.px-hote[data-ploxion="benchmark"] [data-tous]') || {}).textContent);
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="benchmark"] [data-v="mesurer"]').click()); await page.waitForTimeout(200);
  await page.evaluate(() => { const b = document.querySelector('.px-hote[data-ploxion="benchmark"] [data-envoyer]'); if (b) b.click(); }); await page.waitForTimeout(2500);
  const envoi = await page.evaluate(() => (document.querySelector('.px-hote[data-ploxion="benchmark"] [data-envoyer]') || {}).textContent);
  const routes = appels.filter(a => a.p === 'CapacitorHttp').map(a => (a.o.method || 'GET') + ' ' + String(a.o.url || '').replace(/^https?:\/\/[^/]+/, '')).filter(u => /bench/.test(u));
  // quitter en pleine mesure : la mesure doit s'arrêter (sinon le calcul et les workers tournent encore 15 s, l'accueil rame)
  const fini0 = await page.evaluate(() => window.__fini.length);
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="benchmark"] [data-go]').click()); await page.waitForTimeout(1500);
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.fermer && window.ploxi0n.routeur.fermer('benchmark')).catch(() => {});
  await page.waitForTimeout(20000);
  const apresQuitter = await page.evaluate((n) => ({ finiApresQuitter: window.__fini.length > n }), fini0);
  return { monte, mesures, appareil, comparer, envoi, routes, apresQuitter, erreurs };
}
