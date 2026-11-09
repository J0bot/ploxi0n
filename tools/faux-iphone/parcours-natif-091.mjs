// 🏝 ▦ 🔔 (0.91) sur le chemin iPhone : ☾ dodo lance une Live Activity (PloxiApple.activiteDebut), réveil la finit ; un ploxion publie son
// widget (jOSWidget.publier → les Préférences « ploxi0n.px-widgets ») ; ⚙ › Notifications › « même app fermée » : la permission, le jeton
// (l'événement registration) → POST /api/app/push au labo, avec le jeton du compte
export default async function ({ page, ecrire, appels, activitesFaux, pushFaux }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.boxion.put('compte', 'courant', { jeton: 'jeton-du-faux-iphone', compte: { nom: 'Josion' }, le: new Date().toISOString() }));
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  // ☾ dodo → une activité ; réveil → finie
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('journal-tsoins')); await page.waitForTimeout(600);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /\+ tsoin/.test(x.textContent)); if (b) b.click(); }); await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('[data-vite="dodo"]'); if (b) b.click(); }); await page.waitForTimeout(800);
  const dodo = activitesFaux.map(a => ({ genre: a.genre, titre: a.titre, glyphe: a.glyphe, debut: !!a.debut, finie: !!a.finie }));
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /\+ tsoin/.test(x.textContent)); if (b) b.click(); }); await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('[data-vite="reveil"]'); if (b) b.click(); }); await page.waitForTimeout(800);
  const reveil = activitesFaux.map(a => ({ titre: a.titre, finie: !!a.finie }));
  // ▦ le widget du journal (publié par le tsoin) et un ploxion qui publie
  await page.evaluate(() => window.jOSWidget.publier({ valeur: 42, unite: 'pts', serie: [1, 3, 2, 5], bouton: { titre: 'jouer' } }, 'xp')); await page.waitForTimeout(700);
  const pref = appels.filter(a => a.p === 'Preferences' && a.m === 'set' && a.o.key === 'ploxi0n.px-widgets').map(a => JSON.parse(a.o.value)).pop();
  const widget = pref ? { liste: pref.liste.slice(0, 4).map(x => x.id), journal: pref.px['journal-tsoins'] && pref.px['journal-tsoins'].valeur, xp: pref.px.xp && { valeur: pref.px.xp.valeur, bouton: pref.px.xp.bouton, g64: !!pref.px.xp.g64 } } : null;
  // 🔔 le push
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-accueil] [data-rg-aller="notifs"]').click()); await page.waitForTimeout(400);
  await page.evaluate(() => { const t = document.querySelector('[data-t="push"]'); t.checked = true; t.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(2200);
  await ecrire('01-notifs-push');
  const pushHttp = appels.filter(a => a.p === 'CapacitorHttp' && /\/api\/app\/push/.test(a.o.url || '')).map(a => a.o.method + ' ' + a.o.url.replace('https://labo.j0bot.ch', '') + ((a.o.headers || {}).Authorization ? ' [Bearer]' : ' [sans jeton]') + (/faux-jeton-apns/.test(a.o.url) ? ' [JETON DANS L\'ADRESSE]' : ''));
  const etat = await page.evaluate(() => (document.querySelector('[data-t="push"]') || {}).closest ? document.querySelector('[data-t="push"]').closest('.l').textContent.replace(/\s+/g, ' ').slice(0, 160) : null);
  return { dodo, reveil, widget, pushHttp, recu: pushFaux, etat };
}
