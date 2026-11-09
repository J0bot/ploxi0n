// ▔ (0.63) LA BANDE DU HAUT (RS-7 : « y a toujours une bordure noire en haut qui remplit pas l'écran pour une vraie immersion, il faut
// remplir ça »). Le faux iPhone prend l'encoche d'un iPhone à Dynamic Island (59 px en haut, 34 en bas : Emulation.setSafeAreaInsetsOverride,
// Chromium ≥ 137), un fond photo vif (une forêt rouge peinte au canvas), puis photographie l'accueil, un ploxion, ⚙ — plein écran avec notre
// barre du haut, télécommande ou non, le fond « partout » ou non. Pour chaque capture : ce qui PEINT la bande (la pile sous (x, 20 px), le
// premier fond opaque) et les 60 px du haut en PNG (bande-*.png).
// Usage : node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ build/fi-bande --script tools/faux-iphone/parcours-bande.mjs
export default async function ({ page, ecrire }) {
  const cdp = await page.context().newCDPSession(page);
  const encoche = () => cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 59, topMax: 59, bottom: 34, bottomMax: 34, left: 0, leftMax: 0, right: 0, rightMax: 0 } }).then(() => true, (e) => 'sans encoche : ' + e.message);
  const r = { encoche: await encoche(), vues: {} };
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const demarre = async () => { for (let i = 0; i < 100; i++) { if (await page.evaluate(() => { const b = document.getElementById('px-boot'); return !b || b.classList.contains('fin'); }).catch(() => false)) break; await page.waitForTimeout(100); } await page.waitForTimeout(600); await passer(); await page.waitForTimeout(300); };
  // la forêt rouge (un fond vif : la bande noire saute aux yeux) + les réglages, puis on recharge (le fond et les préférences se lisent au démarrage)
  const regler = (app, fond) => page.evaluate(async ({ app, fond }) => {
    const B = window.ploxi0n.boxion;
    if (!(await B.get('reglages', 'fond-image').catch(() => null))) {
      const c = document.createElement('canvas'); c.width = 400; c.height = 860; const g = c.getContext('2d');
      const d = g.createLinearGradient(0, 0, 0, 860); d.addColorStop(0, '#ffb070'); d.addColorStop(0.35, '#d0402a'); d.addColorStop(1, '#3a0a10'); g.fillStyle = d; g.fillRect(0, 0, 400, 860);
      for (let i = 0; i < 26; i++) { const x = (i * 97) % 400, w = 6 + (i * 13) % 18; g.fillStyle = 'rgba(40,6,10,' + (0.35 + (i % 5) / 10) + ')'; g.fillRect(x, 0, w, 860); }
      await B.put('reglages', 'fond-image', { url: c.toDataURL('image/jpeg', 0.85), le: new Date().toISOString() });
    }
    await B.put('reglages', 'fond', { type: 'photo', motif: 'grille', sombre: 10, flou: 0, partout: !!fond.partout });
    const p = (await B.get('reglages', 'app').catch(() => null)) || {};
    await B.put('reglages', 'app', { ...p, ...app });
  }, { app, fond });
  // ce qui peint la bande : la pile sous trois points du haut, et le premier fond non transparent de chaque pile
  const sonder = () => page.evaluate(() => {
    const opaque = (cs) => (cs.backgroundImage && cs.backgroundImage !== 'none') || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
    const nom = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
    const out = {};
    for (const [x, y] of [[30, 20], [200, 30], [360, 52]]) {
      const pile = document.elementsFromPoint(x, y).filter(e => getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0);
      const peint = pile.find(e => opaque(getComputedStyle(e)));
      out[x + ',' + y] = { pile: pile.slice(0, 6).map(nom), peint: peint ? nom(peint) + ' · ' + (getComputedStyle(peint).backgroundImage !== 'none' ? getComputedStyle(peint).backgroundImage.slice(0, 60) : getComputedStyle(peint).backgroundColor) : null };
    }
    const haut = document.querySelector('.px-haut');
    out.haut = haut ? { cache: haut.hidden, fond: getComputedStyle(haut).backgroundColor, image: getComputedStyle(haut).backgroundImage.slice(0, 80), h: haut.getBoundingClientRect().height } : null;
    const hote = document.querySelector('.px-scene>.px-hote:not([hidden])');
    if (hote) { const b = hote.getBoundingClientRect(), cs = getComputedStyle(hote); out.hote = { top: b.top, paddingTop: cs.paddingTop, fond: cs.backgroundColor, image: cs.backgroundImage.slice(0, 80), clair: hote.classList.contains('px-hote-clair') }; }
    const barre = document.querySelector('.px-barre'); if (barre) { const b = barre.getBoundingClientRect(); out.barre = { top: Math.round(b.top), bas: Math.round(b.bottom), paddingTop: getComputedStyle(barre).paddingTop }; }
    const fond = document.querySelector('.px-fond'); if (fond) { const b = fond.getBoundingClientRect(); out.fond = { cache: fond.hidden || getComputedStyle(fond).display === 'none', top: b.top, bas: b.bottom, h: innerHeight }; }
    out.classes = document.documentElement.className.split(/\s+/).filter(c => /haut|fond|telecommande|clair/.test(c)).join(' ');
    return out;
  });
  const capture = async (nom) => { await ecrire(nom); await page.screenshot({ path: 'build/fi-bande/bande-' + nom + '.png', clip: { x: 0, y: 0, width: 393, height: 60 } }).catch(() => {}); r.vues[nom] = await sonder(); };
  const accueil = async () => { await page.evaluate(() => window.ploxi0n.routeur.accueil()); await page.waitForTimeout(500); };
  const ouvrir = async (pref) => {
    const id = await page.evaluate((pref) => { const ids = window.ploxi0n.routeur.catalogue().map(p => p.id); return pref.find(x => ids.includes(x)) || ids[0]; }, pref);
    await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(1300); return id;
  };

  // 1. plein écran + notre barre du haut, télécommande (le réglage par défaut), le fond à l'accueil seulement
  await passer(); await page.waitForTimeout(300);
  await regler({ pleinEcran: true, barreHaut: true, telecommande: true }, { partout: false });
  await page.reload({ waitUntil: 'load' }); await encoche(); await demarre(); await accueil();   // (la session reprise rouvrirait le ploxion d'avant)
  await capture('1-accueil-plein');
  r.ploxion = await ouvrir(['horloge', 'couleurs', 'pomodoro', 'bother']); await capture('2-ploxion-telecommande');
  // un ploxion CLAIR (sa racine repeinte en papier) : la bande prend son fond, l'encre fonce
  await page.evaluate(() => { const h = document.querySelector('.px-scene>.px-hote:not([hidden])'), x = h && [...h.children].find(e => !/^(STYLE|LINK|SCRIPT)$/.test(e.tagName)); if (x) { x.style.background = '#f4efe4'; x.style.color = '#222'; } if (window.ploxi0nBarreHaut) window.ploxi0nBarreHaut.peindre(); });
  await page.waitForTimeout(300); await capture('2b-ploxion-clair');
  r.clair = await page.evaluate(() => ({ html: document.documentElement.classList.contains('px-haut-clair'), hote: (document.querySelector('.px-scene>.px-hote:not([hidden])') || {}).style ? document.querySelector('.px-scene>.px-hote:not([hidden])').style.getPropertyValue('--px-hote-fond') : null }));
  await page.evaluate(() => { const h = document.querySelector('.px-scene>.px-hote:not([hidden])'), x = h && [...h.children].find(e => !/^(STYLE|LINK|SCRIPT)$/.test(e.tagName)); if (x) { x.style.background = ''; x.style.color = ''; } if (window.ploxi0nBarreHaut) window.ploxi0nBarreHaut.peindre(); });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1000); await capture('3-reglages');
  await accueil();
  // 2. la barre du ploxion en haut (télécommande coupée)
  await regler({ pleinEcran: true, barreHaut: true, telecommande: false }, { partout: false });
  await page.reload({ waitUntil: 'load' }); await encoche(); await demarre();
  await ouvrir([r.ploxion]); await capture('4-ploxion-barre-haut');
  await accueil();
  // 3. la barre d'état d'iOS (pas de plein écran), le fond partout
  await regler({ pleinEcran: false, barreHaut: true, telecommande: true }, { partout: true });
  await page.reload({ waitUntil: 'load' }); await encoche(); await demarre(); await accueil();
  await capture('5-accueil-ios');
  await ouvrir([r.ploxion]); await capture('6-ploxion-ios-partout');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1000); await capture('7-reglages-partout');
  // l'accueil défilé : les tuiles passent SOUS la bande (jamais coupées net par un trait)
  await accueil(); await page.evaluate(() => { const a = document.querySelector('.px-accueil'); if (a) a.scrollTop = 120; }); await page.waitForTimeout(300); await capture('8-accueil-defile');
  return r;
}
