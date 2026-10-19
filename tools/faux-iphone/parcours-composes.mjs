// ⧉📖 (0.81) sur le chemin iPhone : le vrai ultimate-social installé, ses onglets (social, chat…) installés et montés à la demande ;
// ses dépendances installées en fond ; le ploxion wiki lu dans l'app (le vrai article « xerboxion »)
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(async () => { await window.ploxi0n.depot.catalogue(); });
  await page.evaluate(() => window.jOS.openPloxion('ultimate-social')); await page.waitForTimeout(4000);   // comme un ploxion ou un lien : installé à la volée
  await ecrire('01-ultimate-social');
  const fil = await page.evaluate(() => { const h = document.querySelector('.px-hote[data-ploxion="ultimate-social"]'); return h ? h.textContent.replace(/\s+/g, ' ').slice(0, 220) : null; });
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-us-tab]')].find(x => /Salons/.test(x.textContent)); if (b) b.click(); }); await page.waitForTimeout(2000);
  await ecrire('02-salons');
  const salons = await page.evaluate(() => { const h = document.querySelector('[data-us-host="salons"], [data-us-host]:not([hidden])'); return h ? h.textContent.replace(/\s+/g, ' ').slice(0, 160) : null; });
  await page.waitForTimeout(2500);
  const installes = await page.evaluate(() => ['ultimate-social', 'social', 'chat', 'carte', 'amis', 'profil', 'idee', 'atelier'].filter(id => window.ploxi0nRouteur.connait(id)));
  // le wiki : le ploxion du labo n'est qu'un <iframe src="/wiki"> ; ici un hôte qui le simule
  await page.evaluate(() => { window.jOSApps.wiki = { manifest: { id: 'wiki' }, mount(h) { h.innerHTML = ''; const f = document.createElement('iframe'); f.src = '/wiki/xerboxion'; f.style.cssText = 'width:100%;height:100%;border:0'; h.appendChild(f); return { unmount() { h.innerHTML = ''; } }; } }; });
  await page.evaluate(() => window.ploxi0nRouteur.majCatalogue([...window.ploxi0nRouteur.catalogue(), { id: 'wiki', nom: 'Wiki', icone: '📖' }]));
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('wiki')); await page.waitForTimeout(2500);
  await ecrire('03-wiki');
  const wiki = await page.evaluate(() => { const a = document.querySelector('.px-hote[data-ploxion="wiki"] .px-wiki-a'); return a ? { titre: (a.querySelector('h1') || {}).textContent, liens: a.querySelectorAll('a[data-wiki]').length } : null; });
  const http = appels.filter(a => a.p === 'CapacitorHttp' && a.m === 'get').map(a => a.o.url.replace('https://labo.j0bot.ch', '').replace(/maj=[a-z0-9]+/, 'maj=…')).slice(0, 14);
  return { fil, salons, installes, wiki, http };
}
