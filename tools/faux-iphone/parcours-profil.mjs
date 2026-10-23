// ⏱ (0.99.17) où le JS passe son temps : le profileur de Chromium (CDP) pendant un démarrage à froid puis un tour de l'app (la map et ses
// zooms, le neurone, les réglages, le marketplace, Autour, le synthé, une autre langue). Rend le temps propre de chaque fonction de l'app :
// c'est la liste des candidats au Rust (seul le calcul pur y gagne ; le DOM, le style et le pont natif, non)
export default async function ({ page, pont }) {
  if (process.env.PX_PROFIL_LOURD) {   // l'iPhone chargé de parcours-lourd : N gros ploxions installés
    const N = +process.env.PX_PROFIL_LOURD, TAILLE = 600 * 1024;
    await page.evaluate(async ({ N, TAILLE }) => {
      const b = window.ploxi0n.boxion, js = (id) => "window.jOSApps['" + id + "'] = { mount(h){ h.textContent='" + id + "'; jOSKnob; jOSApi; } };/*" + 'x'.repeat(TAILLE) + '*/';
      const ids = []; for (let i = 0; i < N; i++) { const id = 'lourd-' + i; ids.push(id); await b.put('ploxions', id, { id, nom: id, icone: '▣', js: js(id), hash: 'h' + i, origine: 'https://labo.j0bot.ch', installe: '2026-09-01T10:00:00.000Z', bions: [] }); }
      const deja = (await b.get('marketplace', 'installes')) || []; await b.put('marketplace', 'installes', [...deja, ...ids]); await window.ploxi0n.depot.installes();
    }, { N, TAILLE });
  }
  // qui lit un ploxion ENTIER (son code) : la pile de chaque lecture, regroupée
  await page.addInitScript(() => {
    const t = setInterval(() => { const b = window.ploxi0n && window.ploxi0n.boxion; if (!b || b.__espion) return; b.__espion = true; const g = b.get.bind(b); window.__lus = [];
      b.get = (ns, k) => { if (ns === 'ploxions') window.__lus.push((new Error().stack || '').split('\n').slice(2, 6).map(s => s.trim().replace(/\(?https?:\/\/[^/]+\//, '').replace(/\)$/, '')).join(' < ')); return g(ns, k); }; clearInterval(t); }, 1);
  });
  const pont0 = pont ? JSON.stringify(pont) : null;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  const t0 = Date.now();
  await page.reload(); await page.waitForTimeout(3500);
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  const h = () => page.evaluate(() => document.querySelector('.px-accueil .px-org-map-h'));
  for (const s of ['reseau', 'hub', 'ploxions']) { await page.evaluate((x) => { const e = document.querySelector('.px-accueil .px-org-map-h'); if (e && e.__map) e.__map.zoomer(x, {}); }, s); await page.waitForTimeout(500); }
  await page.evaluate(() => { const e = document.querySelector('.px-accueil .px-org-map-h'); const id = (window.ploxi0n.routeur.catalogue().find(p => !p.interne) || {}).id; if (e && e.__map) e.__map.zoomer('ploxion', { ploxion: id }); }); await page.waitForTimeout(1200);
  for (const id of ['reglages-app', 'marketplace', 'autour', 'synthe', 'passe', 'systeme']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(900); }
  await page.evaluate(() => window.ploxi0n.langue.appliquer('de')); await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0n.langue.appliquer('fr'));
  const lus = await page.evaluate(() => (window.__lus || []).slice()), qui = new Map(); for (const x of lus) qui.set(x, (qui.get(x) || 0) + 1);
  const { profile } = await cdp.send('Profiler.stop');
  const duree = Date.now() - t0, par = new Map(), dt = profile.timeDeltas || [], idx = new Map(profile.nodes.map(n => [n.id, n]));
  const temps = new Map(); (profile.samples || []).forEach((s, i) => temps.set(s, (temps.get(s) || 0) + (dt[i] || 0)));
  let total = 0;
  for (const [id, us] of temps) {
    const n = idx.get(id), cf = n.callFrame; total += us;
    const fichier = (cf.url || '').replace(/^https?:\/\/[^/]+\//, '').replace(/\?.*$/, '') || '(' + cf.functionName + ')';
    const k = (cf.functionName || '(anonyme)') + ' · ' + fichier + ':' + (cf.lineNumber + 1);
    par.set(k, (par.get(k) || 0) + us);
  }
  const top = [...par.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, us]) => Math.round(us / 1000) + ' ms · ' + k);
  return { lectures: lus.length, qui: [...qui.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), duree, echantillonne: Math.round(total / 1000), pont: pont ? (() => { const a = JSON.parse(pont0).par || {}, b = pont.par || {}, o = JSON.parse(pont0).octets; return { octets: pont.octets - o, top: Object.entries(b).map(([k, v]) => [k, v - (a[k] || 0)]).filter(x => x[1] > 0).sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => Math.round(v / 1024) + ' Ko · ' + k.slice(0, 140)) }; })() : null, top };
}
