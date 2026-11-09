// 🎧 (0.99.34, RS-7 : « donne un vrai xer au ploxion spotify ») : le VRAI code du ploxion spotify du labo (tests/donnees/spotify.labo.html),
// installé depuis le faux labo, avec un faux Spotify (l'API, le SDK du lecteur, des pochettes) ; le xer de ploxi0n par-dessus :
// la grille de pochettes, chercher, une playlist qui glisse (‹ tes sons, ▶ tout jouer), le lecteur en carte, puis déplié « en lecture ».
const couv = (h1, h2, t) => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h1 + ',70%,45%)"/><stop offset="1" stop-color="hsl(' + h2 + ',80%,20%)"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><text x="20" y="270" font-family="sans-serif" font-size="34" fill="#fff" opacity=".85">' + t + '</text></svg>');
const NOMS = ['Psylopsyon', 'Seption', 'Tsoin 7L', 'Walkium', 'Zlorpsyon', 'Zone 3', 'Zone 2', 'Zone 1', 'Math realm', 'Epsylatek', 'Full-On/PsyTrance', 'Goa 70', 'Chill-tekk', 'Mentalcore', 'Acidcore', 'Tribe'];
const PL = NOMS.map((n, i) => ({ id: 'pl' + i, uri: 'spotify:playlist:pl' + i, name: n, images: [{ url: couv(i * 37 % 360, (i * 37 + 120) % 360, n.slice(0, 10)) }], tracks: { total: [1, 21, 85, 4, 2, 2, 2, 7, 1, 1, 688, 30, 12, 9, 40, 18][i] } }));
const piste = (i, n, a) => ({ uri: 'spotify:track:t' + i, name: n, duration_ms: 180000 + i * 7000, artists: [{ name: a }], album: { images: [{ url: couv(i * 53 % 360, (i * 53 + 90) % 360, '') }] } });
const PISTES = [['Mombasa', 'Hans Zimmer'], ['Kalimba', 'Astrix'], ['Seption', 'RS-7'], ['Shpongle Falls', 'Shpongle'], ['Tsoin', 'Xerboxion'], ['Spiral', 'Vini Vici'], ['Zlorp', 'Ace Ventura'], ['Mitosis', 'Infected Mushroom']].map((x, i) => piste(i, x[0], x[1]));
const SDK = `window.Spotify = { Player: class { constructor(o) { this.o = o; this.l = {}; this.st = { paused: false, position: 42000, duration: 205000, track_window: { current_track: ${JSON.stringify(PISTES[0])} } }; }
  addListener(n, f) { this.l[n] = f; return true; } removeListener() {} connect() { setTimeout(() => { this.l.ready && this.l.ready({ device_id: 'dev-faux' }); this.l.player_state_changed && this.l.player_state_changed(this.st); }, 200); return Promise.resolve(true); }
  disconnect() {} getCurrentState() { return Promise.resolve(this.st); } togglePlay() { this.st.paused = !this.st.paused; this.l.player_state_changed(this.st); return Promise.resolve(); }
  nextTrack() { return Promise.resolve(); } previousTrack() { return Promise.resolve(); } seek() { return Promise.resolve(); } pause() { return Promise.resolve(); } resume() { return Promise.resolve(); } setVolume() { return Promise.resolve(); } activateElement() { return Promise.resolve(); } } };
setTimeout(() => window.onSpotifyWebPlaybackSDKReady && window.onSpotifyWebPlaybackSDKReady(), 50);`;

export default async function ({ page, ecrire }) {
  const r = { appels: [] };
  await page.route('https://sdk.scdn.co/**', (rt) => rt.fulfill({ status: 200, contentType: 'application/javascript', body: SDK }));
  await page.route('https://api.spotify.com/**', (rt) => { const u = new URL(rt.request().url()); r.appels.push(rt.request().method() + ' ' + u.pathname);
    const j = (o) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (u.pathname === '/v1/me/playlists') return j({ items: PL, next: null });
    if (u.pathname === '/v1/me/tracks') return j({ total: 3291, items: PISTES.map(t => ({ track: t })) });
    if (/^\/v1\/playlists\/[^/]+\/tracks$/.test(u.pathname)) return j({ items: PISTES.map(t => ({ track: t })) });
    return rt.fulfill({ status: 204, body: '' }); });
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); }
  // le jeton du labo (POST /spotify/token, la session) : simulé dans la page
  await page.evaluate(() => { const f = window.fetch; window.fetch = function (e, i) { const u = String(typeof e === 'string' ? e : e && e.url); if (/\/spotify\/token$/.test(u)) return Promise.resolve(new Response(JSON.stringify({ token: 'jeton-faux' }), { status: 200, headers: { 'Content-Type': 'application/json' } })); return f.apply(this, arguments); }; });
  await page.evaluate(() => window.jOS.openPloxion('spotify'));
  try { await page.waitForFunction(() => document.querySelectorAll('.px-xsp .sp__side .sp__pl').length > 5, null, { timeout: 20000 }); }
  catch (e) { r.dom = await page.evaluate(() => { const h = document.querySelector('.px-hote[data-ploxion="spotify"]'); return { courant: window.ploxi0n.routeur.courant(), hote: !!h, classe: h && h.className, texte: (h ? h.innerText : document.body.innerText).slice(0, 400) }; }); await ecrire('00-spotify-rate'); return r; }
  await page.waitForTimeout(700);
  r.habille = await page.evaluate(() => !!document.querySelector('.px-hote[data-ploxion="spotify"].px-xsp'));
  r.grille = await page.evaluate(() => getComputedStyle(document.querySelector('.px-xsp .sp__side')).display);
  r.cartes = await page.evaluate(() => document.querySelectorAll('.px-xsp .sp__side [data-pl]').length);
  r.barre = await page.evaluate(() => { const b = document.querySelector('.px-xsp .sp__bar'); const x = b.getBoundingClientRect(); return { visible: getComputedStyle(b).display !== 'none', bas: Math.round(innerHeight - x.bottom), titre: b.querySelector('.sp__bart').textContent }; });
  await ecrire('01-spotify-bibliotheque');
  await page.evaluate(() => { const q = document.querySelector('.px-xsp-q'); q.value = 'zone'; q.dispatchEvent(new Event('input')); }); await page.waitForTimeout(200);
  r.recherche = await page.evaluate(() => [...document.querySelectorAll('.px-xsp .sp__side [data-pl]')].filter(x => !x.hidden).map(x => x.querySelector('.sp__plt').textContent));
  await ecrire('02-spotify-chercher');
  await page.evaluate(() => { const q = document.querySelector('.px-xsp-q'); q.value = ''; q.dispatchEvent(new Event('input')); });
  await page.evaluate(() => document.querySelector('.px-xsp .sp__side [data-pl="pl2"]').click());
  await page.waitForFunction(() => document.querySelector('.px-xsp .sp__top.px-xsp-pistes .px-xsp-tete'), null, { timeout: 10000 });
  await page.waitForTimeout(450);
  r.pistes = await page.evaluate(() => ({ titre: document.querySelector('.px-xsp .sp__htitle').textContent, n: document.querySelectorAll('.px-xsp .sp__tr').length, cover: !!document.querySelector('.px-xsp-cover img'), info: document.querySelector('.px-xsp-info small').textContent }));
  await ecrire('03-spotify-playlist');
  const avant = r.appels.length;
  await page.evaluate(() => document.querySelector('.px-xsp-tout').click()); await page.waitForTimeout(400);
  r.toutJouer = r.appels.slice(avant);
  await page.evaluate(() => document.querySelector('.px-xsp-retour').click()); await page.waitForTimeout(400);
  r.retour = await page.evaluate(() => !document.querySelector('.px-xsp .sp__top').classList.contains('px-xsp-pistes'));
  await page.evaluate(() => document.querySelector('.px-xsp .sp__barn').click()); await page.waitForTimeout(400);
  r.grand = await page.evaluate(() => { const b = document.querySelector('.px-xsp .sp__bar'); const i = b.querySelector('.sp__barimg').getBoundingClientRect(); return { grand: b.classList.contains('px-xsp-grand'), pochette: Math.round(i.width), seek: getComputedStyle(b.querySelector('.sp__seek')).display }; });
  await ecrire('04-spotify-en-lecture');
  await page.evaluate(() => document.querySelector('.px-xsp-fermer').click()); await page.waitForTimeout(300);
  r.reduit = await page.evaluate(() => !document.querySelector('.px-xsp .sp__bar').classList.contains('px-xsp-grand'));
  return r;
}
