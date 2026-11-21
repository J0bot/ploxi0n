// ♫ (0.99.67, RS-7 coord #2114) les sons créés en new Audio('/…') par les ploxions du labo : dans l'app, un chemin du site visait
// capacitor://localhost (aucun son) ; il vise maintenant labo.j0bot.ch, comme les images (src/natif/images.js). Les fichiers de l'app, les adresses
// complètes, data: et blob: ne bougent pas ; Audio reste Audio (instanceof, HTMLAudioElement).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { installerImages } from '../src/natif/images.js';

const SOURCE = 'https://labo.j0bot.ch';
const fenetre = () => new JSDOM('<!doctype html><html><body></body></html>', { url: 'capacitor://localhost/', runScripts: 'outside-only' }).window;

test('♫ new Audio(\'/sons/…\') et audio.src = \'/…\' (hors de la page) visent le labo ; le reste ne bouge pas', () => {
  const W = fenetre(), V = W.Audio;
  installerImages({ W, source: SOURCE });
  assert.notEqual(W.Audio, V, 'Audio est enveloppé');
  // le son d'un ploxion du labo, créé hors de la page
  const a = new W.Audio('/sons/clic.mp3');
  assert.equal(a.getAttribute('src'), SOURCE + '/sons/clic.mp3');
  assert.ok(a instanceof W.Audio && a instanceof W.HTMLAudioElement && a instanceof W.HTMLMediaElement, 'Audio reste Audio');
  assert.equal(a.tagName, 'AUDIO'); assert.equal(W.Audio.name, 'Audio');
  // le code d'un ploxion appelle l'Audio global de la page (son bundle tourne dans la fenêtre de l'app)
  const g = W.eval('new Audio("/px/coord/notif.wav")'); assert.equal(g.getAttribute('src'), SOURCE + '/px/coord/notif.wav');
  // un élément audio ou vidéo sans page, sa source posée ensuite
  const b = W.document.createElement('audio'); b.src = '/storage/sons/bip.ogg'; assert.equal(b.getAttribute('src'), SOURCE + '/storage/sons/bip.ogg');
  const c = new W.Audio(); assert.equal(c.getAttribute('src'), null, 'sans source'); c.src = '/sons/fin.mp3'; assert.equal(c.getAttribute('src'), SOURCE + '/sons/fin.mp3');
  const v = W.document.createElement('video'); v.src = '/px/clip/x.mp4'; assert.equal(v.getAttribute('src'), SOURCE + '/px/clip/x.mp4');
  // ce qui ne bouge pas : les fichiers de l'app, une adresse complète, //hôte, data:, blob:, un fichier de l'iPhone
  for (const u of ['/assets/son.mp3', '/ploxions/xp/tic.mp3', '/bions/x.wav', 'https://exemple.ch/a.mp3', '//cdn.exemple.ch/a.mp3', 'data:audio/wav;base64,AAAA', 'blob:capacitor://localhost/1234', '/_capacitor_file_/var/mobile/son.m4a']) {
    assert.equal(new W.Audio(u).getAttribute('src'), u, u); const e = W.document.createElement('audio'); e.src = u; assert.equal(e.getAttribute('src'), u, u + ' (src)');
  }
  // installé deux fois (un rechargement du shim) : pas de double labo
  installerImages({ W, source: SOURCE });
  assert.equal(new W.Audio('/sons/clic.mp3').getAttribute('src'), SOURCE + '/sons/clic.mp3'); const d = W.document.createElement('audio'); d.src = '/s.mp3'; assert.equal(d.getAttribute('src'), SOURCE + '/s.mp3');
});

test('♫ un <audio src="/…"> posé dans la page suit toujours la même règle (le balayage des images)', async () => {
  const W = fenetre();
  installerImages({ W, source: SOURCE });
  W.document.body.innerHTML = '<div><audio src="/sons/ambiance.mp3"></audio><audio><source src="/sons/b.ogg"></audio></div>';
  await new Promise(r => setTimeout(r, 10));
  assert.equal(W.document.querySelector('audio').getAttribute('src'), SOURCE + '/sons/ambiance.mp3');
  assert.equal(W.document.querySelector('source').getAttribute('src'), SOURCE + '/sons/b.ogg');
});
