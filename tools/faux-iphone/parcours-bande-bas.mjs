// ▭ (22.11, RS-7 coord #2234) la bande des koins collée au bas, entre les deux koins, sur le chemin iPhone : on ouvre les koins dans un ploxion
// (le format compact, celui qui faisait monter la bande), on les referme, puis l'accueil, les réglages et une bulle : la bande doit toucher le
// bas, chaque vue s'arrêter au-dessus d'elle, la bulle se poser au-dessus d'elle (jamais sur l'en-tête).
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await passer(); await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true, telecommande: true }); });
  await page.reload(); await page.waitForTimeout(3000); await passer(); await page.waitForTimeout(500);
  const mesure = () => page.evaluate(() => {
    const H = window.innerHeight, r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.height ? { haut: Math.round(b.top), bas: Math.round(b.bottom) } : null; };
    return { H, bande: r('.px-koin-barre'), koin: r('.px-koin-gauche'), ouvert: document.querySelector('.px-koins-r').getAttribute('data-ouvert') };
  });
  // un ploxion, les koins ouverts (compact) puis refermés
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('journal-tsoins')); await page.waitForTimeout(900);
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(700);
  const ouvertDansPloxion = await mesure(); await ecrire('01-koins-ouverts-compact');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(700);
  const refermeDansPloxion = await mesure();
  // l'accueil : la bande au bas, l'accueil s'arrête au-dessus
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(900);
  const accueil = await mesure();
  accueil.vue = await page.evaluate(() => { const a = document.querySelector('.px-accueil').getBoundingClientRect(); return Math.round(a.bottom); });
  await ecrire('02-accueil-apres-koins');
  // les réglages (télécommande : le champ en bas) : juste au-dessus de la bande
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1200);
  const reglages = await mesure();
  reglages.champ = await page.evaluate(() => { const t = document.querySelector('.rg-tete'), q = document.querySelector('.rg-q'); return t && q ? { tete: Math.round(t.getBoundingClientRect().bottom), champ: Math.round(q.getBoundingClientRect().bottom) } : null; });
  await ecrire('03-reglages');
  // △ : la bulle au-dessus de la bande
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(700);
  await page.click('.px-koin-barre [data-koin-a="koins"]'); await page.waitForTimeout(400);
  const bulle = await page.evaluate(() => { const b = [...document.querySelectorAll('.px-bulle')].find(x => !x.hidden && x.getBoundingClientRect().height); if (!b) return null; const r = b.getBoundingClientRect(); return { texte: b.textContent, haut: Math.round(r.top), bas: Math.round(r.bottom) }; });
  await ecrire('04-bulle-trion');
  // la map (SEPTION, nexus) : son curseur du temps au-dessus de la bande, en entier
  await page.evaluate(() => window.ploxi0n.routeur.faire('map')); await page.waitForTimeout(1500);
  const map = await page.evaluate(() => { const t = document.querySelector('.px-map-temps'), b = document.querySelector('.px-map-temps b'); if (!t) return null; const r = t.getBoundingClientRect(), rb = b.getBoundingClientRect(); return { bas: Math.round(r.bottom), etiquetteDroite: Math.round(rb.right), largeur: window.innerWidth }; });
  await ecrire('05-map');
  return { ouvertDansPloxion, refermeDansPloxion, accueil, reglages, bulle, map };
}
