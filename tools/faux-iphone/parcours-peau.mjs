// ◈ (0.99.19, RS-7 sur l'iPhone : « le changement de peau fonctionne pas » ; les tuiles de l'atelier vides) : changer de peau (⚙ › Apparence,
// puis l'atelier : une tuile, un knob) ; à chaque fois, AUCUN filter="url(#…)" ne pointe dans le vide (WebKit ne dessine pas un élément dont
// le filtre manque, et ne refait pas le lien d'un filtre remplacé sous le même id : chaque redéfinition prend un id neuf) ; la peau tient
// après un redémarrage
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(1000);
  const orphelins = () => page.evaluate(() => { const ids = new Set([...document.querySelectorAll('filter[id]')].map(f => f.id)); const l = [];
    for (const e of document.querySelectorAll('[filter]')) { const m = /url\(#([^)]+)\)/.exec(e.getAttribute('filter') || ''); if (m && !ids.has(m[1])) l.push(m[1]); } return [...new Set(l)]; });
  // le piège de WebKit : un <filter> REMPLACÉ par un autre sous le même id (l'élément qui le cite n'est pas re-lié) ; on marque chaque nœud
  const marquer = () => page.evaluate(() => { window.__filtres = new Map([...document.querySelectorAll('filter[id]')].map(f => [f.id, f])); });
  const remplaces = () => page.evaluate(() => [...document.querySelectorAll('filter[id]')].filter(f => window.__filtres && window.__filtres.has(f.id) && window.__filtres.get(f.id) !== f).map(f => f.id));
  const etat = () => page.evaluate(() => ({ variante: document.documentElement.getAttribute('data-px-variante'), memb: getComputedStyle(document.documentElement).getPropertyValue('--memb').trim() }));
  const r = { depart: { ...(await etat()), orphelins: await orphelins() } };
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-rg-aller="apparence"]').click()); await page.waitForTimeout(500);
  // (0.99.19) la peau légère par défaut : aucune couche SVG hors de l'atelier ; puis la pleine (les membranes) pour la suite
  const svgs = () => page.evaluate(() => [...document.querySelectorAll('.px-neurones')].filter(x => getComputedStyle(x).display !== 'none' && !x.closest('[data-neurones-variante]')).length);
  r.legere = { classe: await page.evaluate(() => document.documentElement.classList.contains('px-leger')), svgs: await svgs(), bord: await page.evaluate(() => { const c = document.querySelector('[data-neurone],.px-neurone'); return c ? getComputedStyle(c).boxShadow : null; }) };
  await page.evaluate(() => document.querySelector('[data-pv="peau"][data-v="pleine"]').click()); await page.waitForTimeout(800);
  await page.evaluate(() => window.ploxi0n.routeur.accueil()); await page.waitForTimeout(1200);   // l'accueil : la map, les modes
  r.pleine = { classe: await page.evaluate(() => document.documentElement.classList.contains('px-leger')), svgs: await svgs() };
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-rg-aller="apparence"]').click()); await page.waitForTimeout(500);
  for (const v of ['vaisseaux', 'cyberpunk']) { await page.evaluate((v) => document.querySelector('[data-pv="variante"][data-v="' + v + '"]').click(), v); await page.waitForTimeout(600); r[v] = { ...(await etat()), orphelins: await orphelins() }; }
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('atelier-peaux')); await page.waitForTimeout(1300);
  await marquer();
  for (let i = 0; i < 3; i++) { await page.evaluate(() => document.querySelectorAll('.px-atelier .px-at-t')[1].click()); await page.waitForTimeout(500); }
  r.atelier = { ...(await etat()), orphelins: await orphelins(), remplacesSousLeMemeId: await remplaces(), tuilesSansFiltre: await page.evaluate(() => [...document.querySelectorAll('.px-atelier .px-at-t')].filter(t => !t.querySelector('svg [filter]')).length) };
  await page.waitForTimeout(3000);   // les anciens filtres sont partis : toujours aucun orphelin
  r.apresPurge = await orphelins();
  await ecrire('peau');
  await page.reload(); await page.waitForTimeout(3000);
  r.redemarrage = { ...(await etat()), orphelins: await orphelins() };
  return r;
}
