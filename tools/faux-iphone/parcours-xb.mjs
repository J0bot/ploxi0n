// ▸ (0.99.33) l'agent xb par le vrai pont : Appareil xb › appairer (le code, la page d'approbation, le jeton dans le trousseau), allumer
// (le battement part, avec le jeton), puis le terminal xb du labo demande : infos, ouvrir systeme, mode kiosque autour, notifier, et une
// commande qui n'existe pas (refusée par l'appareil) ; mode aucun ramène à l'accueil ; éteindre arrête le battement.
export default async function ({ page, ecrire, xbFaux, trousseauFaux, ouvertsBrowser, appels }) {
  const r = {};
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); }
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('appareil-xb')); await page.waitForTimeout(800);
  r.avant = await page.evaluate(() => document.querySelector('.px-xba').innerText.slice(0, 120));
  await page.evaluate(() => document.querySelector('[data-xba="appairer"]').click()); await page.waitForTimeout(600);
  r.code = await page.evaluate(() => (document.querySelector('.px-xba-code b') || {}).textContent);
  await ecrire('01-xb-code');
  await page.waitForFunction(() => /allumer l'agent/.test(document.querySelector('.px-xba').innerText), null, { timeout: 15000 });
  r.droits = xbFaux.enrole && xbFaux.enrole.droits; r.nom = xbFaux.enrole && xbFaux.enrole.nom;
  r.pageApprobation = ouvertsBrowser.filter(u => /miroir\/ok/.test(u));
  r.trousseau = Object.keys(trousseauFaux);
  await page.evaluate(() => document.querySelector('[data-xba="allumer"]').click());
  await page.waitForFunction(() => /dans le labo/.test(document.querySelector('.px-xba').innerText), null, { timeout: 15000 });
  r.battement = { os: xbFaux.dernier.os, version: xbFaux.dernier.version, cmds: xbFaux.dernier.cmds, infos: xbFaux.dernier.infos };
  await ecrire('02-xb-dans-le-labo');
  xbFaux.demander('infos'); xbFaux.demander('ouvrir', ['systeme']); xbFaux.demander('shell', ['rm -rf /']); xbFaux.demander('notifier', ['le makelab ferme']);
  for (let i = 0; i < 40 && xbFaux.sorties.filter(s => s.fin).length < 4; i++) await page.waitForTimeout(250);
  r.apresOuvrir = await page.evaluate(() => window.ploxi0n.routeur.courant());
  xbFaux.demander('mode', ['kiosque', 'https://labo.j0bot.ch/px/autour']);
  for (let i = 0; i < 40 && xbFaux.sorties.filter(s => s.fin).length < 5; i++) await page.waitForTimeout(250);
  r.apresKiosque = await page.evaluate(() => ({ courant: window.ploxi0n.routeur.courant(), plein: window.ploxi0n.routeur.plein() }));
  await ecrire('03-xb-kiosque');
  xbFaux.demander('mode', ['aucun']);
  for (let i = 0; i < 40 && xbFaux.sorties.filter(s => s.fin).length < 6; i++) await page.waitForTimeout(250);
  r.apresAucun = await page.evaluate(() => window.ploxi0n.routeur.courant());
  r.sorties = xbFaux.sorties.filter(s => s.fin).map(s => ({ uid: s.uid, fin: s.fin }));
  r.textes = xbFaux.sorties.map(s => s.texte).filter(Boolean).map(t => t.slice(0, 80));
  r.notif = appels.filter(a => a.p === 'LocalNotifications' && a.m === 'schedule').length;
  // éteindre
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('appareil-xb')); await page.waitForTimeout(600);
  const n = xbFaux.battements;
  await page.evaluate(() => { const b = document.querySelector('[data-xba="eteindre"]'); if (b) b.click(); }); await page.waitForTimeout(4000);
  r.battementsApresEteint = xbFaux.battements - n;
  return r;
}
