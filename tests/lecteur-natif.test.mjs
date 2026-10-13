import { readFileSync } from 'node:fs';
// 🎞 (0.49) le lecteur intégré : les liens des lecteurs externes, le plugion jOSplayer, la reprise ; 📁 le zip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { fluxDuLienExterne, creerLecteurNatif } from '../src/natif/lecteur-natif.js';
import { creerFichiersNatif } from '../src/natif/fichiers-natif.js';

test('les liens vers VLC, Infuse, Outplayer, nPlayer rendent l\'adresse du flux ; le reste : null', () => {
  const f = 'https://tb.example/s/9E3.mkv';
  assert.equal(fluxDuLienExterne('vlc://' + f), f);
  assert.equal(fluxDuLienExterne('vlc-x-callback://x-callback-url/stream?url=' + encodeURIComponent(f)), f);
  assert.equal(fluxDuLienExterne('infuse://x-callback-url/play?url=' + encodeURIComponent(f)), f);
  assert.equal(fluxDuLienExterne('outplayer://' + f), f);
  assert.equal(fluxDuLienExterne('nplayer-https://tb.example/s/9E3.mkv'), f);
  assert.equal(fluxDuLienExterne('https://xerboxion.org/px/stremio'), null);
  assert.equal(fluxDuLienExterne('mailto:a@b.c'), null);
});

test('jOSplayer : une vidéo va au lecteur natif (et reprend où on en était), une page reste au web', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>', { url: 'capacitor://localhost/' });
  W.Capacitor = { isNativePlatform: () => true };
  const ouverts = []; let ecouteur = null;
  const plugin = { ouvrir: async (o) => { ouverts.push(o); return { moteur: 'apple' }; }, moteurs: async () => ({ apple: true, vlc: true }), fermer: async () => {}, addListener: async (n, f) => { ecouteur = f; return { remove() {} }; } };
  const boxion = creerMemoire();
  const l = creerLecteurNatif({ W, boxion, plugin });
  const web = [];
  const jp = { resolve: (u) => (/\.mp4/.test(u) ? { kind: 'video' } : { kind: 'iframe' }), open: (u) => web.push(u) };
  assert.equal(l.brancherJosPlayer(jp), true); assert.equal(l.brancherJosPlayer(jp), false, 'une seule fois');
  await jp.open('https://cdn.example/film.mkv'); jp.open('https://www.twitch.tv/x');
  assert.deepEqual(ouverts.map(o => o.url), ['https://cdn.example/film.mkv']); assert.deepEqual(web, ['https://www.twitch.tv/x']);
  await ecouteur({ etat: 'position', position: 600, duree: 2400 });
  await l.ouvrir('https://cdn.example/film.mkv');
  assert.equal(ouverts.at(-1).position, 600, 'la reprise');
  await ecouteur({ etat: 'fin', position: 2400, duree: 2400 });
  await l.ouvrir('https://cdn.example/film.mkv');
  assert.equal(ouverts.at(-1).position, 0, 'fini : on repart du début');
  W.close();
});

test('le VRAI jOSPlayer du labo (Stremio) : play() → le lecteur natif (VLC pour un DTS/MKV, les sous-titres), la reprise partagée, l\'épisode suivant, le repli web', async () => {
  const { window: W } = new JSDOM('<!doctype html><body><main id="ploxi0n"></main></body>', { url: 'https://localhost/', runScripts: 'outside-only' });
  W.Capacitor = { isNativePlatform: () => true };
  const ouverts = []; let ecouteur = null; const webOuvert = [];
  const plugin = { ouvrir: async (o) => { ouverts.push(o); return { moteur: o.moteur || 'apple' }; }, moteurs: async () => ({ apple: true, vlc: true }), fermer: async () => {}, addListener: async (n, f) => { ecouteur = f; return { remove() {} }; } };
  W.jOSMobile = { open: (id) => webOuvert.push(id) };
  try {
  W.eval(readFileSync(new URL('./donnees/jOSPlayer.labo.js', import.meta.url), 'utf8'));
  const l = creerLecteurNatif({ W, boxion: creerMemoire(), plugin });
  await l.moteurs();
  assert.equal(l.brancherJosPlayer(W.jOSPlayer), true, 'play() est enveloppé');
  await new Promise(r => setTimeout(r, 10));
  assert.equal(W.jOSPlayer.natif.vlc, true); assert.ok(W.jOSPlayer.natif.son.includes('dts'), 'jOSPlayer.natif : le labo sait ce que l\'iPhone lit');
  const suivants = [];
  W.jOSPlayer.play('https://h/x/playback/abc/0/n/n/Film.2024.1080p.DTS.mkv', { title: 'Film', key: 'tt1:1:2', source: 'stremio', subs: [{ url: 'https://s/fr.srt', lang: 'fre' }, { lang: 'sans url' }], onNext: () => suivants.push('S01E03') });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(ouverts.length, 1); assert.equal(ouverts[0].titre, 'Film'); assert.equal(ouverts[0].moteur, 'vlc', 'DTS/MKV : VLC d\'emblée');
  assert.deepEqual(ouverts[0].sousTitres, ['https://s/fr.srt'], 'les sous-titres de Stremio (des objets) deviennent des adresses');
  assert.deepEqual(webOuvert, [], 'le Lecteur du web n\'est pas ouvert');
  assert.equal(W.jOSPlayer.history()[0].title, 'Film', 'l\'historique du Lecteur suit quand même');
  const u = ouverts[0].url;
  await ecouteur({ etat: 'position', position: 120, duree: 2400 });
  assert.equal(W.localStorage.getItem('xb:resume:tt1:1:2'), '120', 'la reprise que Stremio affiche (barres, « reprise 2 min »)');
  assert.equal(W.jOSPlayer.resumeAt(u), 120);
  await ecouteur({ etat: 'fin', position: 2400, duree: 2400 });
  await new Promise(r => setTimeout(r, 750));
  assert.deepEqual(suivants, ['S01E03'], 'fini : l\'épisode suivant'); assert.equal(W.localStorage.getItem('xb:resume:tt1:1:2'), null);
  // une erreur de lecture (le Swift résout tout de suite, l'échec arrive par événement) → la bulle « ▶ lecteur web »
  W.jOSPlayer.play('https://cdn/film.mp4', { title: 'Autre' }); await new Promise(r => setTimeout(r, 10));
  await ecouteur({ etat: 'erreur', raison: 'format', position: 0, duree: 0 });
  const bulle = W.document.querySelector('.px-bulle-lecteur'); assert.ok(bulle, 'la bulle du repli');
  bulle.querySelectorAll('button')[0].click();
  assert.deepEqual(webOuvert, ['player'], 'le repli : le Lecteur du web');
  // YouTube / un blob : au web, tel quel
  W.jOSPlayer.play('', { ytid: 'abc' }); W.jOSPlayer.play('blob:capacitor://localhost/1', { title: 'local' });
  assert.equal(ouverts.length, 2, 'ni YouTube ni un blob ne vont au natif');
  // window.open d'un flux déjà donné par jOSPlayer : le lecteur natif, pas Safari
  const safari = []; W.open = (x) => { safari.push(x); return null; };
  assert.equal(l.brancherOuvrir(), true);
  W.open('https://h/x/playback/abc/0/n/n/Film.2024.1080p.DTS.mkv', '_blank'); W.open('https://xerboxion.org/', '_blank');
  await new Promise(r => setTimeout(r, 10));
  assert.equal(ouverts.length, 3); assert.deepEqual(safari, ['https://xerboxion.org/']);
  } finally { W.close(); }
});

test('zip puis dézip : les mêmes fichiers', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>');
  const fx = creerFichiersNatif({ W });
  const z = await fx.zip([{ nom: 'a.txt', data: 'salut' }, { nom: 'dossier/b.json', data: '{"x":1}' }]);
  const l = await fx.dezipper(new Uint8Array(await z.arrayBuffer()));
  assert.deepEqual(l.map(f => [f.nom, new TextDecoder().decode(f.data)]), [['a.txt', 'salut'], ['dossier/b.json', '{"x":1}']]);
  W.close();
});
