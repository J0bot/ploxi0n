// ◉ (0.99.1) Proche, l'ultimate Bluetooth, par le vrai pont natif : démarrer (PloxiProche.demarrer), Tom arrive (l'événement « pair »),
// l'horloge se cale (ping / pong : Tom a 3 s d'avance), un message part et l'accusé revient, une basse hébergée, puis la basse de Tom rejointe
export default async function ({ page, ecrire, emettre, procheEnvoyes }) {
  const r = {};
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {}); await page.waitForTimeout(500);   // les nouveautés
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(1200);
  await ecrire('01-proche-eteint');
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr-salle]').value = 'zurich'; h.querySelector('[data-pr="allumer"]').click(); });
  await page.waitForTimeout(1500);
  r.pairs = await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-pair')].map(x => x.textContent));
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-msg]').value = 'on se retrouve au lac ?'; h.querySelector('[data-pr="envoyer"]').click(); });
  await page.evaluate(() => document.querySelector('.px-proche [data-pr-glyphe="♡"]').click());
  await page.waitForTimeout(800);
  r.fil = await page.evaluate(() => [...document.querySelectorAll('.px-proche .px-pr-m')].map(x => x.textContent));
  await ecrire('02-tom-et-les-messages');
  await page.evaluate(() => document.querySelector('.px-proche [data-pr="basse-heberger"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.px-proche [data-pr-motif="tekk"]').click()); await page.waitForTimeout(400);
  r.basse = await page.evaluate(() => document.querySelector('.px-proche [data-pr-basse]').innerText.split('\n')[0]);
  await ecrire('03-la-basse-hebergee');
  await page.evaluate(() => document.querySelector('.px-proche [data-pr="basse-stop"]').click()); await page.waitForTimeout(300);
  // Tom héberge une basse : elle s'annonce, rien ne joue avant « rejoindre »
  emettre('PloxiProche', 'message', { de: 'Tom·b2c3', donnees: JSON.stringify({ v: 1, g: 'basse', d: { tempo: 124, motif: 'dub', tonique: 31, gamme: 'phrygien', debut: Date.now() + 3000, volume: 0.8 }, t: Date.now() + 3000 }) });
  await page.waitForTimeout(500);
  r.annonce = await page.evaluate(() => (document.querySelector('.px-proche [data-pr="basse-rejoindre"]') || {}).textContent || null);
  await ecrire('04-la-basse-de-tom');
  await page.evaluate(() => document.querySelector('.px-proche [data-pr="basse-rejoindre"]').click()); await page.waitForTimeout(400);
  r.rejoint = await page.evaluate(() => document.querySelector('.px-proche [data-pr-basse]').innerText.split('\n')[0]);
  await ecrire('05-basse-rejointe');
  // 〰 (0.99.21) le maillage : Léa (deux sauts) est dans le fil, et dans la liste ; un salon par /j
  r.maille = await page.evaluate(() => ({ fil: [...document.querySelectorAll('.px-proche .px-pr-m')].map(x => x.textContent), loin: [...document.querySelectorAll('.px-proche .px-pr-loin')].map(x => x.textContent), empreinte: (document.querySelector('.px-proche [data-pr-moi] b') || {}).textContent || null }));
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-msg]').value = '/j #lac'; h.querySelector('[data-pr="envoyer"]').click(); });
  await page.waitForTimeout(500);
  r.salons = await page.evaluate(() => [...document.querySelectorAll('.px-proche [data-pr-salon]')].map(x => x.textContent + (x.classList.contains('on') ? ' (ouvert)' : '')));
  await ecrire('06-le-maillage');
  r.envoyes = procheEnvoyes.map(o => { try { return (JSON.parse(o.donnees).g || 'maille:' + JSON.parse(o.donnees).k); } catch (e) { return '?'; } }).reduce((a, g) => ({ ...a, [g]: (a[g] || 0) + 1 }), {});
  return r;
}
