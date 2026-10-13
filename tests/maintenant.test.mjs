// ♫ À L'ÉCOUTE (0.48) : le Spotify Web Playback SDK d'un ploxion → l'écran verrouillé (PloxiApple.lecture) ; les commandes reviennent au lecteur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerMaintenant, depuisSpotify } from '../src/natif/maintenant.js';

const ETAT = { paused: false, position: 90000, duration: 377000, disallows: { skipping_prev: true }, track_window: { current_track: { name: 'Keep It Psychedelic', duration_ms: 377000,
  artists: [{ name: 'GMS' }, { name: 'Z-Cat' }], album: { name: 'KIP', images: [{ url: 'https://i/petite', width: 64 }, { url: 'https://i/grande', width: 640 }] } } } };

test('l\'état Spotify devient titre, artistes, la plus grande pochette, secondes, ⏮ interdit', () => {
  assert.deepEqual(depuisSpotify(ETAT), { source: 'spotify', titre: 'Keep It Psychedelic', artiste: 'GMS, Z-Cat', album: 'KIP', image: 'https://i/grande', duree: 377, position: 90,
    enLecture: true, suivant: true, precedent: false, uri: '' });
  assert.equal(depuisSpotify(null), null);
});

test('un ploxion charge le SDK : l\'écran verrouillé reçoit le morceau, ses commandes pilotent le lecteur, la fin efface tout', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>', { url: 'capacitor://localhost/' });
  W.Capacitor = { isNativePlatform: () => true };
  const natif = []; let commande = null; const valeurs = [];
  const apple = { lecture: async (o) => { natif.push(['lecture', o]); }, lectureFin: async () => { natif.push(['fin']); }, addListener: async (n, f) => { commande = f; return { remove() {} }; } };
  const m = creerMaintenant({ W, apple, courant: () => 'spotify', valeur: async (k, t, v) => valeurs.push([k, v]), preferences: async () => ({ Preferences: { set: async () => {}, remove: async () => {} } }) });
  const faits = [];
  try {
  W.onSpotifyWebPlaybackSDKReady = () => { W.__p = new W.Spotify.Player({}); };
  W.Spotify = { Player: class { constructor() { this.l = []; } addListener(e, f) { if (e === 'player_state_changed') this.l.push(f); return true; } connect() {}
    nextTrack() { faits.push('next'); } previousTrack() { faits.push('prev'); } togglePlay() { faits.push('toggle'); } pause() { faits.push('pause'); } resume() { faits.push('resume'); } seek(ms) { faits.push('seek' + ms); } } };
  W.onSpotifyWebPlaybackSDKReady();
  W.__p.l.forEach(f => f(ETAT));
  assert.equal(natif[0][0], 'lecture'); assert.equal(natif[0][1].titre, 'Keep It Psychedelic'); assert.equal(natif[0][1].precedent, false);
  assert.deepEqual(valeurs, [['musique', 'Keep It Psychedelic — GMS, Z-Cat']]);
  assert.equal(m.etat().ploxion, 'spotify');
  await new Promise(r => setTimeout(r, 0));
  commande({ commande: 'suivant' }); commande({ commande: 'toggle' }); commande({ commande: 'seekto', position: 12.5 });
  assert.deepEqual(faits, ['next', 'toggle', 'seek12500'], '⏯ = togglePlay du SDK');
  assert.ok(W.document.querySelector('.px-maintenant b').textContent.includes('Keep It'));
  W.__p.l.forEach(f => f(null));
  assert.deepEqual(natif.at(-1), ['fin']); assert.equal(m.etat(), null);
  assert.equal(W.document.querySelector('.px-maintenant').hidden, true);
  } finally { m.fin(); W.close(); }
});

// (0.51) le VRAI motif du ploxion Spotify du labo (/px/spotify) et les pièges relevés : un SDK déjà là, une function globale, le démontage
const SDK = `window.Spotify = { Player: function Player(o){ this.o=o; this.l={}; } };
  Spotify.Player.prototype.addListener = function(e,f){ (this.l[e]=this.l[e]||[]).push(f); return true; };
  Spotify.Player.prototype.connect = function(){ return Promise.resolve(true); };
  Spotify.Player.prototype.disconnect = function(){ window.__deco=true; };
  Spotify.Player.prototype.getCurrentState = function(){ return Promise.resolve(null); };
  Spotify.Player.prototype.togglePlay = function(){ window.__toggle=(window.__toggle||0)+1; };
  Spotify.Player.prototype._emit = function(e,x){ (this.l[e]||[]).forEach(function(f){ f(x); }); };
  if (window.onSpotifyWebPlaybackSDKReady) window.onSpotifyWebPlaybackSDKReady();`;
const PLOXION = `(function(){ var player=null;
  function loadSDK(){ return new Promise(function(res){ if (window.Spotify && window.Spotify.Player) return res();
    var prev = window.onSpotifyWebPlaybackSDKReady; window.onSpotifyWebPlaybackSDKReady = function () { if (prev) try { prev(); } catch (e) {} res(); }; window.__chargerSDK(); }); }
  loadSDK().then(function(){ player = new Spotify.Player({ name: 'Xerboxion ▸ XER' }); player.addListener('player_state_changed', function(){}); player.connect(); window.__p = player; });
  window.__unmount = function(){ player.disconnect(); };
})();`;
async function essai({ sdkAvant = false, ploxion = PLOXION } = {}) {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://localhost/', runScripts: 'dangerously' });
  const W = dom.window; W.Capacitor = { isNativePlatform: () => true };
  const natif = [];
  const apple = { lecture: async (o) => natif.push(o), lectureFin: async () => natif.push('FIN'), addListener: async () => ({ remove() {} }) };
  const run = (code) => { const s = W.document.createElement('script'); s.textContent = code; W.document.head.appendChild(s); };
  W.__chargerSDK = () => W.setTimeout(() => run(SDK), 5);
  if (sdkAvant) run(SDK);
  const m = creerMaintenant({ W, apple, courant: () => 'spotify', preferences: async () => ({ Preferences: { set: async () => {}, remove: async () => {} } }) });
  run(ploxion);
  await new Promise(r => setTimeout(r, 40));
  return { W, m, natif, run };
}
test('Spotify du labo : publié quel que soit l\'ordre (SDK avant, function globale) ; le démontage (disconnect) efface « à l\'écoute »', async () => {
  for (const cas of [{}, { sdkAvant: true }, { ploxion: 'function onSpotifyWebPlaybackSDKReady(){ window.__p = new Spotify.Player({}); window.__p.connect(); } window.__chargerSDK();' }]) {
    const { W, m, natif, run } = await essai(cas);
    try {
      assert.ok(W.__p, 'le ploxion a son Player');
      W.__p._emit('player_state_changed', ETAT);
      assert.equal(m.etat() && m.etat().titre, 'Keep It Psychedelic', JSON.stringify(cas));
      const n = natif.length; W.__p._emit('player_state_changed', { ...ETAT, position: 91000 });
      assert.equal(natif.length, n, 'la même chose qui avance : pas de nouvel envoi (le journal xion ne gonfle pas)');
      m.commander('toggle'); assert.equal(W.__toggle, 1);
      if (cas.ploxion) continue;
      run('window.__unmount()');
      assert.equal(m.etat(), null, 'démonté : plus rien « à l\'écoute »'); assert.equal(natif.at(-1), 'FIN');
    } finally { m.fin(); W.close(); }
  }
});

test('jOSSound (music, le Lecteur, Spotify sans SDK) : la source qui joue devient « à l\'écoute », ses commandes passent', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>', { url: 'https://localhost/' });
  W.Capacitor = { isNativePlatform: () => false };
  const m = creerMaintenant({ W, preferences: async () => ({ Preferences: { set: async () => {}, remove: async () => {} } }) });
  try {
    m.brancherBus();
    // le bion du labo arrive plus tard, avec un ploxion (window.jOSSound = window.jOSSound || …)
    W.jOSSound = W.jOSSound || (function () { const srcs = {}, subs = []; const emit = () => subs.slice().forEach(f => f());
      return { register(s) { srcs[s.id] = s; emit(); return () => { delete srcs[s.id]; emit(); }; }, list: () => Object.values(srcs), subscribe(cb) { subs.push(cb); return () => {}; } }; })();
    let enPause = false; const faits = [];
    const off = W.jOSSound.register({ id: 'music', name: 'Music', label: () => 'Un morceau', sub: () => '0:42 / 3:10', isPaused: () => enPause, toggle: () => { enPause = !enPause; faits.push('toggle'); }, next: () => faits.push('next'), prev: () => faits.push('prev') });
    await new Promise(r => setTimeout(r, 80));
    assert.equal(m.etat().titre, 'Un morceau'); assert.equal(m.etat().artiste, 'Music', 'un temps n\'est pas un artiste');
    m.commander('suivant'); m.commander('pause');
    assert.deepEqual(faits, ['next', 'toggle']);
    off(); await new Promise(r => setTimeout(r, 80));
    assert.equal(m.etat(), null, 'la source partie : fini');
  } finally { m.arreter(); m.fin(); W.close(); }
});
