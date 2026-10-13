// ♫ (0.48) Un ploxion qui joue avec le Spotify Web Playback SDK (simulé comme le vrai : onSpotifyWebPlaybackSDKReady, Spotify.Player,
// player_state_changed) : l'écran verrouillé (PloxiApple.lecture), le widget (Préférences ploxi0n.lecture), le mini-lecteur de l'accueil,
// et les commandes de l'écran verrouillé qui reviennent au lecteur du ploxion.
export default async function ({ page, ecrire, appels, prefs, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => {
    // le ploxion : il déclare son rappel AVANT de charger le SDK, comme le veut Spotify
    window.onSpotifyWebPlaybackSDKReady = () => { const p = new window.Spotify.Player({ name: 'ploxi0n', getOAuthToken: (cb) => cb('jeton') }); p.connect(); window.__lecteur = p; };
    // le SDK : il pose window.Spotify, puis appelle le rappel
    window.Spotify = { Player: class { constructor(o) { this.o = o; this.l = {}; } addListener(e, f) { (this.l[e] = this.l[e] || []).push(f); return true; } connect() { return Promise.resolve(true); }
      nextTrack() { window.__cmd = 'suivant'; } previousTrack() { window.__cmd = 'precedent'; } togglePlay() { window.__cmd = 'toggle'; } pause() { window.__cmd = 'pause'; } resume() { window.__cmd = 'resume'; } seek(ms) { window.__cmd = 'seek ' + ms; }
      _etat(st) { (this.l.player_state_changed || []).forEach(f => f(st)); } } };
    window.onSpotifyWebPlaybackSDKReady();
    window.__lecteur._etat({ paused: false, position: 90000, duration: 377000, disallows: {}, track_window: { current_track: { name: 'Keep It Psychedelic', uri: 'spotify:track:x', duration_ms: 377000,
      artists: [{ name: 'GMS' }, { name: 'Z-Cat' }], album: { name: 'Keep It Psychedelic', images: [{ url: 'https://i.scdn.co/image/petite', width: 64 }, { url: 'https://i.scdn.co/image/grande', width: 640 }] } } } });
  });
  await page.waitForTimeout(800);
  await ecrire('lecture-accueil');
  const lecture = appels.filter(a => a.p === 'PloxiApple' && a.m === 'lecture').map(a => a.o);
  const r = { verrouille: lecture.at(-1) || null, widget: prefs.get('ploxi0n.lecture') || null, valeurs: (prefs.get('ploxi0n.valeurs') || '').includes('Keep It Psychedelic'),
    mini: await page.evaluate(() => { const b = document.querySelector('.px-maintenant'); return b && !b.hidden ? b.innerText.replace(/\s+/g, ' ') : null; }) };
  for (const c of ['suivant', 'precedent', 'toggle', 'seekto']) { emettre('PloxiApple', 'lecture', { commande: c, position: 42 }); await page.waitForTimeout(150); r['commande ' + c] = await page.evaluate(() => window.__cmd); }
  await page.evaluate(() => document.querySelector('.px-maintenant [data-lc="suivant"]').click()); await page.waitForTimeout(100);
  r['bouton ⏭ du mini-lecteur'] = await page.evaluate(() => window.__cmd);
  await page.evaluate(() => window.__lecteur._etat(null)); await page.waitForTimeout(300);
  r.fin = { lectureFin: appels.some(a => a.m === 'lectureFin'), mini: await page.evaluate(() => { const b = document.querySelector('.px-maintenant'); return !b || b.hidden; }) };
  return r;
}
