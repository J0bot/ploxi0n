// ⧗ (0.86) les tsoins remontent au boxion, sur le chemin iPhone : connecté (un jeton), ⚙ › Réseau › « tsoins » ; un tsoin noté ; ↑ envoyer →
// GET /px/boxion/load puis POST /px/boxion/save (ns tsoins-iphone, le jeton en en-tête, CapacitorHttp)
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.boxion.put('compte', 'courant', { jeton: 'jeton-du-faux-iphone', compte: { nom: 'Josion' }, le: new Date().toISOString() }));
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('[data-accueil] [data-rg-aller="reseau"]').click()); await page.waitForTimeout(400);
  const avant = await page.evaluate(() => { const b = document.querySelector('[data-rt-mode].on'); return b ? b.getAttribute('data-rt-mode') : null; });
  await page.evaluate(() => document.querySelector('[data-rt-mode="tsoins"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.boxion.append('tsoins', { kind: 'tsoin', id: 'tfaux', genre: 'idee', d: 'une idée notée sur le faux iPhone', source: 'natif' }));
  await page.evaluate(() => window.ploxi0n.boxion.append('tsoins', { kind: 'action', k: 'clic', d: 'un geste (ne part pas en mode tsoins)' }));
  await ecrire('01-reseau-tsoins');
  await page.evaluate(() => document.querySelector('[data-rt-envoyer]').click()); await page.waitForTimeout(1500);
  const etat = await page.evaluate(() => (document.querySelector('[data-rt-etat]') || {}).textContent);
  await ecrire('02-envoye');
  const http = appels.filter(a => a.p === 'CapacitorHttp' && /\/px\/boxion\//.test(a.o.url || '') && /tsoins-iphone/.test((a.o.url || '') + JSON.stringify(a.o.data || ''))).map(a => a.o.method + ' ' + a.o.url.replace('https://labo.j0bot.ch', '').replace(/key=[^&]+/, 'key=…') + ((a.o.headers || {}).Authorization ? ' [Bearer]' : ' [sans jeton]') + (a.o.method === 'POST' ? ' ' + JSON.stringify((typeof a.o.data === 'string' ? JSON.parse(a.o.data) : a.o.data).data.tsoins.map(t => t.id || t.k)) : ''));
  return { avant, etat, http };
}
