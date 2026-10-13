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

test('zip puis dézip : les mêmes fichiers', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>');
  const fx = creerFichiersNatif({ W });
  const z = await fx.zip([{ nom: 'a.txt', data: 'salut' }, { nom: 'dossier/b.json', data: '{"x":1}' }]);
  const l = await fx.dezipper(new Uint8Array(await z.arrayBuffer()));
  assert.deepEqual(l.map(f => [f.nom, new TextDecoder().decode(f.data)]), [['a.txt', 'salut'], ['dossier/b.json', '{"x":1}']]);
  W.close();
});
