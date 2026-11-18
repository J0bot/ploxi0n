// 🚗 (0.99.31, RS-7 : « ploxion sur CarPlay ») : Proche démarre (RS-3 et RS-4 partagent leur position, RS-4 un rendez-vous) ; la voiture se branche ;
// le modèle envoyé au Swift a les deux onglets (potes : les plus proches d'abord, l'itinéraire dans Plans ; ambiances) ; toucher « pluie » la
// lance sans l'écran des Ambiances (un hôte caché), le modèle le dit (« joue · 60 % ») ; « tout couper » la coupe.
export default async function ({ page }) {
  const r = {};
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); }
  r.pont = await page.evaluate(() => !!window.ploxi0n_carplay);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(1000);
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr-salle]').value = 'soiree'; h.querySelector('[data-pr="allumer"]').click(); });
  await page.waitForTimeout(7000);
  globalThis.carplayBrancher(true); await page.waitForTimeout(800);
  const modele = () => globalThis.carplayModele || null;
  const m = modele(); const [potes, amb] = (m && m.onglets) || [];
  r.onglets = m && m.onglets.map(o => o.titre);
  r.potes = potes && potes.sections.map(s => s.titre + ' : ' + s.items.map(i => i.texte + ' — ' + i.detail + (i.url ? ' ↗' : '')).join(' | '));
  r.ambiances = amb && amb.sections.map(s => s.titre + ' : ' + s.items.length);
  globalThis.carplayToucher('son:pluie'); await page.waitForTimeout(1200);
  r.apresPluie = { hoteCache: await page.evaluate(() => !!document.querySelector('[data-carplay] .px-ambiances')), modele: (modele().onglets[1].sections.find(s => s.titre === 'les sons').items.find(i => i.id === 'son:pluie') || {}).detail, enCours: modele().onglets[1].sections.map(s => s.titre) };
  globalThis.carplayToucher('sons:couper'); await page.waitForTimeout(1200);
  r.apresCouper = (modele().onglets[1].sections.find(s => s.titre === 'les sons').items.find(i => i.id === 'son:pluie') || {}).detail;
  r.poses = globalThis.carplayPoses;
  return r;
}
