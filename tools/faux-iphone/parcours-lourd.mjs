// ⚠ (0.99.6, RS-7 : « avec le build actuel, quand j'ouvre l'app ça freeze, je peux rien faire ») : un iPhone CHARGÉ (N ploxions installés,
// gros, avec des bions manquants, jamais vérifiés par le changelog) ; on mesure la réactivité (le retard de la boucle d'événements) pendant
// les 35 premières secondes, réparation des bions et première vérification des mises à jour comprises
export default async function ({ page, ecrire, pont }) {
  const N = +(process.env.PX_LOURD_N || 120), TAILLE = +(process.env.PX_LOURD_KO || 600) * 1024, INDEX = process.env.PX_LOURD_INDEX !== '0', ANCIEN = process.env.PX_LOURD_ANCIEN === '1';
  await page.evaluate(async ({ N, TAILLE, INDEX, ANCIEN }) => {
    const b = window.ploxi0n.boxion, js = (id) => "window.jOSApps['" + id + "'] = { mount(h){ h.textContent='" + id + "'; jOSKnob; jOSApi; jOSCarte; } };/*" + 'x'.repeat(TAILLE) + '*/';
    const ids = []; for (let i = 0; i < N; i++) { const id = 'lourd-' + i; ids.push(id); await b.put('ploxions', id, { id, nom: id, icone: '▣', js: js(id), hash: 'h' + i, origine: 'https://labo.j0bot.ch', installe: '2026-09-01T10:00:00.000Z', bions: [], manquants: ['jOSKnob', 'jOSApi', 'jOSCarte'] }); }
    const deja = (await b.get('marketplace', 'installes')) || []; await b.put('marketplace', 'installes', [...deja, ...ids]); await b.del('marketplace', 'installes-index');
    await b.del('reglages', 'bions-v3');
    if (INDEX) { await window.ploxi0n.depot.installes(); if (ANCIEN) { const idx = await b.get('marketplace', 'installes-index'); for (const k of Object.keys(idx)) { delete idx[k].taille; delete idx[k].manq; delete idx[k].etag; delete idx[k].composes; } await b.put('marketplace', 'installes-index', idx); } }   // l'index existe (ANCIEN : celui d'avant la 0.99.6)
  }, { N, TAILLE, INDEX, ANCIEN });
  await page.reload(); const t0 = Date.now(); pont.octets = 0; pont.appels = 0; pont.par = {}; pont.t = []; pont.depuis = Date.now();
  const mesures = [];
  for (let k = 0; k < 70; k++) {
    const lag = await page.evaluate(() => new Promise(r => { const t = performance.now(); setTimeout(() => r(Math.round(performance.now() - t)), 0); })).catch(() => -1);
    mesures.push([Math.round((Date.now() - t0) / 100) / 10, lag]); await page.waitForTimeout(500);
  }
  await ecrire('01-apres-35-s');
  const pires = mesures.slice().sort((a, b) => b[1] - a[1]).slice(0, 6);
  return { N, ko: TAILLE / 1024, pontMo: Math.round(pont.octets / 1048576), pontAppels: pont.appels, top: Object.entries(pont.par || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => [k, Math.round(v / 1048576)]), gros: (pont.t || []).slice(0, 400).map(x => [Math.round(x[0] / 1000), x[1].slice(0, 70)]), pires, moyenne: Math.round(mesures.reduce((s, m) => s + Math.max(0, m[1]), 0) / mesures.length), majEtat: await page.evaluate(() => window.ploxi0n.boxion.get('reglages', 'maj-etat')).catch(() => null) };
}
