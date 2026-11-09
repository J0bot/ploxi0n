// ⌂ (0.99.32, RS-7 : « sur Android, l'appli ploxion utilisable comme launcher ») avec --android : l'app se croit sur Android (aucun plugin Swift,
// PloxiAccueil seul). Le ploxion Applis : la grille, chercher, ouvrir une appli ; « en faire l'écran d'accueil » ; le bouton retour d'Android
// (le ploxion se ferme ; à l'accueil, l'app passe en arrière-plan tant que ploxion n'est pas l'écran d'accueil, et ne bouge plus ensuite) ;
// le bouton maison (« ploxiAccueil ») ramène à l'accueil du xer. Proche, Système, Autour s'ouvrent sans exception.
export default async function ({ page, ecrire, emettre, appels, accueilFaux }) {
  const r = {};
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {}); await page.waitForTimeout(500);
  r.plateforme = await page.evaluate(() => document.documentElement.getAttribute('data-px-plateforme'));
  r.jOSAccueil = await page.evaluate(() => !!(window.jOSAccueil && window.jOSAccueil.dispo()));
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('applis')); await page.waitForTimeout(1000);
  r.applis = await page.evaluate(() => [...document.querySelectorAll('.px-ap-a .n')].map(x => x.textContent));
  r.tete = await page.evaluate(() => (document.querySelector('[data-ap-tete]') || {}).textContent);
  await ecrire('01-applis');
  await page.evaluate(() => { const q = document.querySelector('[data-ap-q]'); q.value = 'param'; q.dispatchEvent(new Event('input')); }); await page.waitForTimeout(200);
  r.cherche = await page.evaluate(() => [...document.querySelectorAll('.px-ap-a .n')].map(x => x.textContent));
  await page.evaluate(() => document.querySelector('.px-ap-a').click()); await page.waitForTimeout(300);
  r.lance = accueilFaux.lances.slice();
  await page.evaluate(() => document.querySelector('[data-ap-choisir]').click()); await page.waitForTimeout(400);
  r.teteApres = await page.evaluate(() => document.querySelector('[data-ap-tete]').textContent);
  await ecrire('02-ecran-accueil');
  // le bouton retour : le ploxion se ferme
  emettre('App', 'backButton', { canGoBack: false }); await page.waitForTimeout(600);
  r.apresRetour = await page.evaluate(() => window.ploxi0n.routeur.courant());
  // à l'accueil, ploxion écran d'accueil : rien (pas de minimizeApp)
  await page.evaluate(() => window.ploxi0n_retour && window.ploxi0n_retour.relire()); await page.waitForTimeout(200);
  const avant = appels.filter(a => a.p === 'App' && a.m === 'minimizeApp').length;
  emettre('App', 'backButton', { canGoBack: false }); await page.waitForTimeout(300);
  r.minimiseALAccueil = appels.filter(a => a.p === 'App' && a.m === 'minimizeApp').length - avant;
  r.launcher = await page.evaluate(() => document.documentElement.getAttribute('data-px-launcher'));
  // le bouton maison depuis un ploxion
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('systeme')); await page.waitForTimeout(800);
  await page.evaluate(() => window.dispatchEvent(new Event('ploxiAccueil'))); await page.waitForTimeout(500);
  r.apresMaison = await page.evaluate(() => window.ploxi0n.routeur.courant());
  // les ploxions qui, sur l'iPhone, parlent au Swift
  r.ouverts = {};
  for (const id of ['proche', 'autour', 'systeme', 'synthe', 'banc']) {
    await page.evaluate((x) => window.ploxi0n.routeur.ouvrir(x), id); await page.waitForTimeout(900);
    r.ouverts[id] = await page.evaluate((x) => { const h = document.querySelector('.px-scene>.px-hote[data-ploxion="' + x + '"]'); return h ? h.innerText.trim().length : -1; }, id);
    emettre('App', 'backButton', { canGoBack: false }); await page.waitForTimeout(400);
  }
  await ecrire('03-fin');
  r.ploxiAppeles = [...new Set(appels.filter(a => /^Ploxi/.test(a.p)).map(a => a.p + '.' + a.m))];
  return r;
}
