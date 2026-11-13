// ◺◿ (0.89) les koins du carnet de RS-7 sur le chemin iPhone : l'accueil sans dock, les deux koins ; ils grandissent ; les cases et la barre
// des glyphes ; dans un ploxion (0.99.57 : sa barre laisse la place à la bande des koins) ; une case agit
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true }); });
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  for (const id of ['systeme', 'ambiances', 'journal-tsoins']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(500); await page.evaluate(() => window.ploxi0n.routeur.faire('minimiser')); await page.waitForTimeout(300); }
  const dock = await page.evaluate(() => { const d = document.querySelector('.px-dock'); return d ? getComputedStyle(d).display : 'absent'; });
  await ecrire('01-accueil-koins');
  // (0.99.47) glisser vers le haut : le koin suit le doigt (le triangle qui s'ouvre en carré, à mi-chemin) ; lâcher avant 40 % : il se referme
  const kb = await (await page.$('[data-koin="gauche"]')).boundingBox();
  await page.mouse.move(kb.x + 30, kb.y + kb.height - 20); await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(kb.x + 30, kb.y + kb.height - 20 - i * 15);   // 90 px : moins de 40 %
  await page.waitForTimeout(150); await ecrire('02a-glisse-mi-chemin');
  const kMi = await page.evaluate(() => document.querySelector('.px-koins-r').style.getPropertyValue('--k'));
  await page.mouse.up(); await page.waitForTimeout(600);
  const refermeApresGlisse = await page.evaluate(() => !document.querySelector('.px-koins-r').classList.contains('px-koins-ouverts'));
  // (0.99.47) un seul toucher : le koin grandit et s'ouvre en carré ; captures pendant l'animation, puis ouvert
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(110); await ecrire('02-s-ouvre'); await page.waitForTimeout(110); await ecrire('03-s-ouvre-encore');
  await page.waitForTimeout(400); await ecrire('04-cases');
  const cases = await page.evaluate(() => [...document.querySelectorAll('[data-cases]:not([hidden]) [data-koin-a]')].map(b => b.getAttribute('data-koin-a')));
  // ○ □ (0.92) les trackpads : tourner le wormion (horaire), puis glisser le portion vers le haut — la capture pendant le geste
  const pad = async (sel) => { const b = await (await page.$(sel)).boundingBox(); return b; };
  const w = await pad('[data-pad="wormion"]'), cx = w.x + w.width / 2, cy = w.y + w.height / 2, R = w.width * 0.36;
  await page.mouse.move(cx + R, cy); await page.mouse.down();
  for (let d = 10; d <= 70; d += 10) await page.mouse.move(cx + R * Math.cos(d * Math.PI / 180), cy + R * Math.sin(d * Math.PI / 180));
  const wormion = await page.evaluate(() => ({ l: document.querySelector('[data-pad="wormion"] [data-pad-l]').textContent, s: document.querySelector('[data-pad="wormion"] [data-pad-s]').textContent }));
  await ecrire('05-wormion-tourne');
  for (let d = 60; d >= 0; d -= 10) await page.mouse.move(cx + R * Math.cos(d * Math.PI / 180), cy + R * Math.sin(d * Math.PI / 180));
  await page.mouse.up(); await page.waitForTimeout(300);   // revenu au départ : rien n'est ouvert, le panneau reste
  const resteOuvert = await page.evaluate(() => !document.querySelector('[data-cases="gauche"]').hidden);
  const p = await pad('[data-pad="portion"]'), px = p.x + p.width / 2, py = p.y + p.height / 2;
  await page.mouse.move(px, py); await page.mouse.down();
  for (let k = 1; k <= 8; k++) await page.mouse.move(px + 2, py - k * 7);
  const portion = await page.evaluate(() => ({ l: document.querySelector('[data-pad="portion"] [data-pad-l]').textContent, dir: document.querySelector('[data-pad="portion"]').getAttribute('data-dir') }));
  await ecrire('06-portion-glisse');
  await page.mouse.up(); await page.waitForTimeout(1200);
  const apresPortion = await page.evaluate(() => window.ploxi0n.routeur.courant());
  await ecrire('07-portion-la-map');
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(500);
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(600);
  await page.click('[data-koin-a="toi"]'); await page.waitForTimeout(900);
  const ouvert = await page.evaluate(() => window.ploxi0n.routeur.courant());
  const barre = await page.evaluate(() => { const b = document.querySelector('.px-ecran>.px-barre'); if (!b) return 'absente'; const k = document.querySelector('.px-koin-barre'), r = k.getBoundingClientRect(); return getComputedStyle(b).display + (r.bottom >= innerHeight - 1 && !k.hidden ? ' · la bande des koins en bas' : ' · PAS de bande'); });
  await ecrire('05-dans-un-ploxion');
  // ⊠ (0.99.47) la case xer : les quatre xers (les modes) sur place ; en choisir un change l'accueil ; l'en-tête des modes est effacé
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(600);
  const entete = await page.evaluate(() => ({ titre: getComputedStyle(document.querySelector('.px-tete h1') || document.body).display, modes: (() => { const m = document.querySelector('.px-modes'); return m ? getComputedStyle(m).display : 'absent'; })() }));
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(600);
  const trion = await page.evaluate(() => document.querySelector('[data-koin-sous="koins"]').textContent);
  await page.click('[data-cases] [data-koin-a="xer"]'); await page.waitForTimeout(500); await ecrire('08-les-xers');
  const xers = await page.evaluate(() => [...document.querySelectorAll('.px-koin-modes [data-koin-mode]')].map(b => b.getAttribute('data-koin-mode') + (b.classList.contains('on') ? '*' : '')));
  await page.click('.px-koin-modes [data-koin-mode="organique"]'); await page.waitForTimeout(1200);
  const modeApres = await page.evaluate(() => window.ploxi0n.prefs.lire().mode); await ecrire('09-organique');
  await page.evaluate(() => window.ploxi0n.prefs.regler({ mode: 'chill-tekk' })); await page.waitForTimeout(600);
  return { dock, kMi, refermeApresGlisse, cases, wormion, resteOuvert, portion, apresPortion, ouvert, barre, entete, trion, xers, modeApres };
}
