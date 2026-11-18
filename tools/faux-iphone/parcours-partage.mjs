// ✉ (0.76) inviter · partager sur le chemin iPhone : l'invitation du social (CapacitorHttp, jamais le relais du labo), le QR de CoreImage
// (PloxiApple.qr), copier → le presse-papiers natif a le lien PUBLIC ; un ploxion partagé depuis le menu ; un lien reçu collé s'ouvre ici
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.setItem('jos_social_token', 'bon'));
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('inviter')); await page.waitForTimeout(1200);
  await ecrire('01-inviter');
  await page.evaluate(() => { document.querySelector('[data-iv-label]').value = 'RS-4'; document.querySelector('[data-iv="inviter"]').click(); });
  await page.waitForTimeout(1500);
  await ecrire('02-invitation');
  const lienInvitation = await page.evaluate(() => (document.querySelector('.px-partage .px-pt-lien') || {}).value);
  const qrImg = await page.evaluate(() => !!document.querySelector('.px-partage [data-pt-qr] img'));
  await page.evaluate(() => document.querySelector('.px-partage [data-pt="copier"]').click()); await page.waitForTimeout(500);
  const copie = appels.filter(a => a.p === 'Clipboard' && a.m === 'write').map(a => a.o.string).pop();
  await page.evaluate(() => document.querySelector('.px-partage [data-pt="fermer"]').click());
  // un ploxion : le partager depuis la liste
  await page.evaluate(() => document.querySelector('[data-iv="ploxions"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => { const b = document.querySelector('[data-iv-px="controleur"]') || document.querySelector('[data-iv-px]'); b.click(); }); await page.waitForTimeout(800);
  await ecrire('03-ploxion');
  const lienPloxion = await page.evaluate(() => (document.querySelector('.px-partage .px-pt-lien') || {}).value);
  await page.evaluate(() => document.querySelector('.px-partage [data-pt="fermer"]').click());
  // un lien reçu, collé
  await page.evaluate(async () => { await window.jOSNatif.copier('https://labo.j0bot.ch/app/ouvrir/controleur?app=1'); document.querySelector('[data-iv="recu"]').click(); });
  await page.waitForTimeout(1500);
  await ecrire('04-lien-recu');
  const ouvert = await page.evaluate(() => (window.ploxi0nRouteur.actuel ? window.ploxi0nRouteur.actuel() : null) || document.querySelector('[data-ploxion-id]')?.getAttribute('data-ploxion-id'));
  const http = appels.filter(a => a.p === 'CapacitorHttp').map(a => (a.o.method || 'GET') + ' ' + a.o.url + (a.o.headers && a.o.headers['X-Ploxi0n'] ? ' [X-Ploxi0n !]' : ''));
  const qr = appels.filter(a => a.p === 'PloxiApple' && a.m === 'qr').map(a => a.o.texte);
  return { lienInvitation, qrImg, copie, lienPloxion, qr, http, ouvert };
}
