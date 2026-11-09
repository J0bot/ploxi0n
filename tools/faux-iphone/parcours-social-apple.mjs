// 🍏🎟 (0.84) sur le chemin iPhone : un lien d'invitation ouvre l'app (le code est gardé) ; « Continuer avec Apple » sur l'écran du social
// envoie ce code par le HTTP natif (pas de CORS) → le compte ; ⚙ › Compte supprime ce compte du social (DELETE /me)
export default async function ({ page, ecrire, appels, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { localStorage.removeItem('jos_social_token'); localStorage.removeItem('jos_social_user'); });
  // 1. le lien d'invitation d'un ami
  emettre('App', 'appUrlOpen', { url: 'https://labo.j0bot.ch/local?px=invite&code=FAUX42&join=7' }); await page.waitForTimeout(1500);
  const garde = await page.evaluate(() => window.ploxi0n.boxion.get('social', 'invitation'));
  // 2. le social et son écran de connexion (le vrai social est au labo ; ici un hôte « social » qui montre son formulaire)
  await page.evaluate(() => { window.jOSApps.social = { manifest: { id: 'social' }, mount(h) { h.innerHTML = '<div id="so-f-login" style="padding:16px;display:grid;gap:8px"><label>identifiant ou email</label><input id="so-login"><label>mot de passe</label><input id="so-pass" type="password"><button id="so-b-login">Se connecter</button></div>'; return { unmount() { h.innerHTML = ''; } }; } };
    window.ploxi0nRouteur.majCatalogue([...window.ploxi0nRouteur.catalogue().filter(p => p.id !== 'social'), { id: 'social', nom: 'le social', icone: '🎉' }]); });
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('social')); await page.waitForTimeout(1500);
  const bouton = await page.evaluate(() => !!document.querySelector('.px-hote[data-ploxion="social"] [data-so-apple]'));
  await ecrire('01-social-apple');
  await page.evaluate(() => document.querySelector('.px-hote[data-ploxion="social"] [data-so-apple]').click()); await page.waitForTimeout(2000);
  const session = await page.evaluate(() => ({ token: localStorage.getItem('jos_social_token'), user: JSON.parse(localStorage.getItem('jos_social_user') || 'null') }));
  const gardeApres = await page.evaluate(() => window.ploxi0n.boxion.get('social', 'invitation'));
  const apple = appels.filter(a => a.p === 'CapacitorHttp' && /api\.j0bot\.ch/.test(a.o.url || '')).map(a => a.o.method + ' ' + a.o.url.replace('https://api.j0bot.ch/api/v1', '') + ' ' + JSON.stringify(typeof a.o.data === 'string' ? JSON.parse(a.o.data) : a.o.data));
  const feuille = appels.filter(a => a.p === 'SignInWithApple').map(a => a.m + (a.o.nonce && /^[0-9a-f]{64}$/.test(a.o.nonce) ? ' [nonce sha256]' : ' [nonce ?]'));
  // 3. ⚙ › Compte : le compte du social, et sa suppression (« sûr ? » puis supprimé)
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('[data-accueil] [data-rg-aller="compte"]').click()); await page.waitForTimeout(400);
  const bloc = await page.evaluate(() => { const b = document.querySelector('[data-a="supprimer-social"]'); return b ? b.closest('.bloc').textContent.replace(/\s+/g, ' ').slice(0, 160) : null; });
  await ecrire('02-compte-social');
  await page.evaluate(() => document.querySelector('[data-a="supprimer-social"]').click()); await page.waitForTimeout(200);
  const sur = await page.evaluate(() => document.querySelector('[data-a="supprimer-social"]').textContent);
  await page.evaluate(() => document.querySelector('[data-a="supprimer-social"]').click()); await page.waitForTimeout(1200);
  const apres = await page.evaluate(() => ({ token: localStorage.getItem('jos_social_token'), bloc: !!document.querySelector('[data-a="supprimer-social"]'), msg: (document.querySelector('[data-msg]') || {}).textContent }));
  await ecrire('03-supprime');
  const suppression = appels.filter(a => a.p === 'CapacitorHttp' && a.o.method === 'DELETE').map(a => a.o.url.replace('https://api.j0bot.ch/api/v1', '') + ((a.o.headers || {}).Authorization ? ' [Bearer]' : ''));
  return { garde, bouton, feuille, apple, session, gardeApres, bloc, sur, suppression, apres };
}
