// ▤ (0.51) LES MINI DOCKS : deux ploxions minimisés, la musique (Spotify), le brouillon de tsoin ; « ▤ +N » ; la page de tous ; glisser
// une carte de côté la ferme ; ⧉ dans un ploxion ouvre la page ; ✕ ferme.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const R = () => page.evaluate(() => [...document.querySelectorAll('.px-md > .px-md-c')].map(c => c.getAttribute('data-md') + ' · ' + c.innerText.replace(/\s+/g, ' ').trim()));
  const ids = await page.evaluate(() => window.ploxi0n.routeur.catalogue().map(p => p.id));
  const a = ids.includes('reglages-app') ? 'reglages-app' : ids[0], b = ids.find(x => x !== a && x !== 'portion' && x !== 'reglages-app') || ids[1];
  const r = { ploxions: [a, b] };
  await page.evaluate((id) => window.ploxi0n.routeur.ouvrir(id), a); await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.routeur.minimiser()); await page.waitForTimeout(300);
  await page.evaluate((id) => window.ploxi0n.routeur.ouvrir(id), b); await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.routeur.minimiser()); await page.waitForTimeout(300);
  r.deuxMinimises = await R();
  // la musique (le SDK de Spotify, comme le vrai ploxion) : passe devant
  await page.evaluate(() => {
    window.Spotify = { Player: class { constructor() { this.l = {}; } addListener(e, f) { (this.l[e] = this.l[e] || []).push(f); return true; } connect() { return Promise.resolve(true); } togglePlay() { window.__cmd = 'toggle'; } nextTrack() { window.__cmd = 'next'; } previousTrack() {} pause() {} resume() {} seek() {}
      _etat(st) { (this.l.player_state_changed || []).forEach(f => f(st)); } } };
    window.__p = new window.Spotify.Player({}); window.__p.connect();
    window.__p._etat({ paused: false, position: 98000, duration: 377000, disallows: {}, track_window: { current_track: { name: 'Keep It Psychedelic', artists: [{ name: 'GMS' }], album: { name: 'KIP', images: [] } } } });
  });
  await page.waitForTimeout(300);
  r.avecMusique = await R();
  r.onglet = await page.evaluate(() => (document.querySelector('.px-md-tous') || {}).textContent);
  await page.evaluate(() => document.querySelector('.px-md-c[data-md="musique"] [data-md-a="toggle"]').click()); await page.waitForTimeout(150);
  r.toggle = await page.evaluate(() => window.__cmd);
  r.hauteur = await page.evaluate(() => document.documentElement.style.getPropertyValue('--px-md'));
  await ecrire('minidocks-pile');
  // la page de tous les mini docks
  await page.evaluate(() => document.querySelector('.px-md-tous').click()); await page.waitForTimeout(300);
  r.page = await page.evaluate(() => [...document.querySelectorAll('.px-md-page .px-md-c')].map(c => c.getAttribute('data-md')));
  await ecrire('minidocks-page');
  await page.evaluate(() => document.querySelector('[data-md-ok]').click()); await page.waitForTimeout(200);
  // glisser une carte de côté : fermée
  const cle = 'px:' + b;
  await page.evaluate((k) => {   // le geste, en événements de pointeur (le doigt)
    const c = document.querySelector('.px-md-c[data-md="' + k + '"] .px-md-t'); if (!c) return;
    const ev = (t, x) => c.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 7, clientX: x, clientY: 10 }));
    ev('pointerdown', 100); ev('pointermove', 150); ev('pointermove', 230); ev('pointerup', 230);
  }, cle);
  await page.waitForTimeout(400);
  r.apresGlisser = { vivants: await page.evaluate(() => window.ploxi0n.routeur.vivants()), pile: await R() };
  // le tsoin pas fini : toucher à côté le minimise
  await page.evaluate(() => { window.jOSNatif.tsoin({}); });
  await page.waitForTimeout(400);
  r.composeur = await page.evaluate(() => { const t = document.querySelector('.px-tsoin [data-texte]'); if (!t) return false; t.value = 'une idée à finir plus tard'; document.querySelector('.px-tsoin').dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; });
  await page.waitForTimeout(300);
  r.brouillon = await page.evaluate(() => { const c = document.querySelector('.px-md-c[data-md="tsoin-brouillon"]') || [...document.querySelectorAll('.px-md-c')].find(x => x.getAttribute('data-md') === 'tsoin-brouillon'); return c ? c.innerText.replace(/\s+/g, ' ') : (window.jOSMiniDock.liste().find(m => m.cle === 'tsoin-brouillon') || {}).sous || null; });
  // ⧉ depuis un ploxion : la page
  await page.evaluate((id) => window.ploxi0n.routeur.ouvrir(id), a); await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.faire('basculer')); await page.waitForTimeout(300);
  r.pageDepuisPloxion = await page.evaluate(() => [...document.querySelectorAll('.px-md-page .px-md-c')].map(c => c.getAttribute('data-md') + (c.classList.contains('ici') ? ' (ici)' : '')));
  await ecrire('minidocks-depuis-ploxion');
  r.largeur = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, ecran: innerWidth }));
  return r;
}
