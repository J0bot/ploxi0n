// 🏝 (0.99.43) la balade : Autour › 🏝 balade (la Live Activity de PloxiVeille), toucher un lieu = la cible, ✕ cible, finir ; les boutons du
// Centre de contrôle (ploxi0n://toilettes, ploxi0n://balade, ploxi0n://proche) ; l'activité de Proche ; l'état des contrôles (Préférences)
export default async function ({ page, ecrire, activitesFaux, emettre, prefs }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('autour')); await page.waitForTimeout(2500);
  const r = {};
  r.bouton = await page.evaluate(() => (document.querySelector('.px-autour [data-au="balade"]') || {}).textContent || null);
  await page.evaluate(() => document.querySelector('.px-autour [data-au="balade"]').click()); await page.waitForTimeout(500);
  const bal = () => activitesFaux.filter(a => a.genre === 'balade').map(a => ({ titre: a.titre, ploxion: a.ploxion, cible: a.cible ? a.cible.nom : null, finie: !!a.finie }));
  r.lancee = { activites: bal(), barre: await page.evaluate(() => document.querySelector('.px-autour [data-au-bal]').textContent), etat: await page.evaluate(() => document.querySelector('.px-autour [data-au-etat]').textContent) };
  await page.evaluate(() => document.querySelector('.px-autour .px-au-l').click()); await page.waitForTimeout(500);
  r.cible = { activites: bal(), barre: await page.evaluate(() => document.querySelector('.px-autour [data-au-bal]').textContent) };
  await ecrire('balade-01-cible');
  await page.evaluate(() => document.querySelector('.px-autour [data-au="sans"]').click()); await page.waitForTimeout(300);
  r.sansCible = bal();
  await page.evaluate(() => document.querySelector('.px-autour [data-au="balade"]').click()); await page.waitForTimeout(400);
  r.finie = { activites: bal(), bouton: await page.evaluate(() => document.querySelector('.px-autour [data-au="balade"]').textContent) };
  // 🎛 les boutons du Centre de contrôle : des liens ploxi0n:// que l'app reçoit
  emettre('App', 'appUrlOpen', { url: 'ploxi0n://toilettes' }); await page.waitForTimeout(2000);
  r.toilettes = { activites: bal().filter(a => !a.finie), ecran: await page.evaluate(() => window.ploxi0n.routeur.courant()) };
  emettre('App', 'appUrlOpen', { url: 'ploxi0n://balade' }); await page.waitForTimeout(600);   // une balade en cours (celle des toilettes) : la finir
  r.baladeCtl = bal().filter(a => !a.finie).length;
  emettre('App', 'appUrlOpen', { url: 'ploxi0n://proche' }); await page.waitForTimeout(2500);
  r.proche = { ecran: await page.evaluate(() => window.ploxi0n.routeur.courant()), activite: activitesFaux.filter(a => a.genre === 'proche').map(a => ({ titre: a.titre, sous: a.sous, glyphe: a.glyphe, compte: a.compte, finie: !!a.finie })) };
  await ecrire('balade-02-proche');
  r.controles = prefs && prefs.get('ploxi0n.controles') ? JSON.parse(prefs.get('ploxi0n.controles')) : null;
  emettre('App', 'appUrlOpen', { url: 'ploxi0n://proche' }); await page.waitForTimeout(800);
  r.procheEteint = { finie: activitesFaux.filter(a => a.genre === 'proche').every(a => a.finie), controles: prefs && prefs.get('ploxi0n.controles') ? JSON.parse(prefs.get('ploxi0n.controles')) : null };
  return r;
}
