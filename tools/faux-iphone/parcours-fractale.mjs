// ◈ (0.98) une seule map, tout est fractal : l'accueil de l'organique = la map ; ses paliers (tes ploxions, le réseau, le hub) ; l'appui long
// sur un koin → son neurone (entrées, sorties, bions, synapses) ; un bion → le sien
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'organique', variante: 'xeno' }); });
  await page.reload(); await page.waitForTimeout(3500);
  const r = {};
  r.accueilMap = await page.evaluate(() => !!document.querySelector('.px-accueil .px-org-map .px-map'));
  await ecrire('01-accueil-map');
  const clic = async (sel) => { await page.evaluate((s) => document.querySelector(s).click(), sel); await page.waitForTimeout(1300); };
  await clic('.px-accueil [data-map-palier="tout"]'); r.tout = await page.evaluate(() => document.querySelectorAll('.px-accueil .px-map-tc').length); await ecrire('02-tes-ploxions');
  await clic('.px-accueil [data-map-palier="reseau"]'); r.reseau = await page.evaluate(() => document.querySelectorAll('.px-accueil .px-map-rc').length); await ecrire('03-reseau');
  await clic('.px-accueil [data-map-palier="hub"]');
  // un koin d'un ploxion installé : l'appui long → son neurone
  const k = await page.evaluate(() => { const ids = new Set(window.ploxi0n.routeur.catalogue().map(p => p.id)); const el = [...document.querySelectorAll('.px-accueil .px-map-ici [data-k]')].find(x => ids.has(x.getAttribute('data-k'))) || document.querySelector('.px-accueil .px-map-ici [data-k]'); if (!el) return null; const b = el.getBoundingClientRect(); return { id: el.getAttribute('data-k'), x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  r.koin = k && k.id;
  if (k) { await page.mouse.move(k.x, k.y); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up(); await page.waitForTimeout(1800); }
  r.neurone = await page.evaluate(() => { const n = document.querySelector('.px-accueil .px-nv'); return n ? { e: n.querySelectorAll('.px-nv-c.px-nv-e').length, s: n.querySelectorAll('.px-nv-c.px-nv-s').length, b: n.querySelectorAll('[data-nv-bion]').length, liens: n.querySelectorAll('[data-nv-vers]').length } : null; });
  await ecrire('04-neurone-ploxion');
  // le neurone du journal des tsoins (un ploxion de l'app : ses canaux déclarés, ses synapses)
  await page.evaluate(() => { const b = document.createElement('button'); b.setAttribute('data-nv-vers', 'journal-tsoins'); document.querySelector('.px-accueil .px-map').appendChild(b); b.click(); b.remove(); }); await page.waitForTimeout(1800);
  r.journal = await page.evaluate(() => { const n = document.querySelector('.px-accueil .px-nv'); return n ? { e: n.querySelectorAll('.px-nv-c.px-nv-e').length, s: n.querySelectorAll('.px-nv-c.px-nv-s').length, liens: [...n.querySelectorAll('[data-nv-vers]')].map(x => x.getAttribute('data-nv-vers')) } : null; });
  await ecrire('05-neurone-journal');
  const bi = await page.evaluate(() => { const b = document.querySelector('.px-accueil [data-nv-bion]'); return b ? b.getAttribute('data-nv-bion') : null; });
  if (bi) { await clic('.px-accueil [data-nv-bion]'); await ecrire('06-neurone-bion'); }
  r.bion = bi;
  return r;
}
