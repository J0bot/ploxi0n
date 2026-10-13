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
