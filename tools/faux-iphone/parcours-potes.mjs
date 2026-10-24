// ⌖ (0.99.22, RS-7 : « en soirée, savoir où sont tes potes ; une boussole pour les retrouver s'il n'y a pas de connexion, ou une map ») :
// Tom (un voisin direct) et Léa (deux sauts, relayée par Tom) font tourner le vrai maillage dans le faux iPhone, avec de vraies clés. Ils
// partagent leur position avec moi (chiffrée pour moi). Le radar les montre à l'échelle ; toucher Tom → la boussole vers lui ; ★ Tom et
// « partager avec mes potes » → ma position part, chiffrée ; /m @Tom → le code de sécurité de la paire.
export default async function ({ page, ecrire, procheEnvoyes }) {
  const r = {};
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {}); await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(1200);
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr-salle]').value = 'soiree'; h.querySelector('[data-pr="allumer"]').click(); });
  await page.waitForTimeout(6000);
  r.qui = await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-pair')].map(x => x.textContent));
  r.fil = await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-m')].map(x => x.textContent));
  r.potes = await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-pote')].map(x => x.textContent));
  r.radar = await page.evaluate(() => ({ visible: !document.querySelector('[data-pr-radar]').hidden, points: document.querySelectorAll('[data-pr-radar] g.pote').length, tuiles: document.querySelectorAll('[data-pr-tuiles] img').length, echelle: [...document.querySelectorAll('[data-pr-radar] .ech')].map(x => x.textContent) }));
  await page.evaluate(() => document.querySelector('[data-pr-radar]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
  await ecrire('potes-01-le-radar');
  // la boussole vers Tom (la boussole de l'iPhone : il regarde l'est)
  await page.evaluate(() => { const e = new Event('deviceorientation'); e.webkitCompassHeading = 90; window.dispatchEvent(e); });
  await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-pote')].find(x => /Tom/.test(x.textContent)).click()); await page.waitForTimeout(500);
  r.boussole = await page.evaluate(() => { const b = document.querySelector('[data-pr-boussole]'); const g = b.querySelector('g[transform]'); return { distance: (b.querySelector('.px-pr-bd') || {}).textContent, qui: (b.querySelector('.px-pr-bn') || {}).textContent, aiguille: g && g.getAttribute('transform') }; });
  await page.evaluate(() => document.querySelector('[data-pr-boussole]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
  await ecrire('potes-02-la-boussole');
  await page.evaluate(() => document.querySelector('[data-pr-boussole-fermer]').click()); await page.waitForTimeout(300);
  // devant en haut : le radar tourne
  await page.evaluate(() => document.querySelector('[data-pr-devant]').click()); await page.waitForTimeout(300);
  await ecrire('potes-03-devant-en-haut');
  // ★ Tom, puis partager avec mes potes
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-msg]').value = '/fav @Tom'; h.querySelector('[data-pr="envoyer"]').click(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-pr-pos-partager="potes"]').click()); await page.waitForTimeout(1500);
  r.partage = await page.evaluate(() => (document.querySelector('.px-pr-partage') || {}).textContent || null);
  r.positionsEnvoyees = procheEnvoyes.filter(o => { try { const m = JSON.parse(o.donnees); return m.m === 1 && m.k === 'pos'; } catch (e) { return false; } }).length;
  r.enClair = procheEnvoyes.some(o => /46\.52/.test(o.donnees));
  await ecrire('potes-04-je-partage');
  // une conversation privée : le code de sécurité
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-msg]').value = '/m @Tom tu es où ?'; h.querySelector('[data-pr="envoyer"]').click(); });
  await page.waitForTimeout(800);
  r.prive = await page.evaluate(() => ({ dm: (document.querySelector('[data-pr-dm]') || {}).textContent, fil: [...document.querySelectorAll('.px-proche .px-pr-m')].map(x => x.textContent) }));
  await ecrire('potes-05-le-code');
  await page.evaluate(() => document.querySelector('[data-pr-pos-stop]').click()); await page.waitForTimeout(500);
  r.arrete = await page.evaluate(() => !document.querySelector('.px-pr-partage'));
  return r;
}
