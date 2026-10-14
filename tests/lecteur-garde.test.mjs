// 🛡 (0.63) LA GARDE DU LECTEUR NATIF (RS-7, builds 0.60.1/0.62 : « des fois y a un lecteur vidéo random qui pop et ça crash » ; « ou soit ça
// s'ouvre en boucle et ça reste bloqué, ça marche jamais ») : pas de présentation sans toucher, ni pour un ploxion caché ; une à la fois ; le
// disjoncteur ; la reprise ne présente jamais toute seule ; pas de boucle natif ↔ web.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerLecteurNatif } from '../src/natif/lecteur-natif.js';

const LABO = readFileSync(new URL('./donnees/jOSPlayer.labo.js', import.meta.url), 'utf8');
const attendre = (ms = 5) => new Promise(r => setTimeout(r, ms));

/** une page de l'app : #ploxi0n, le ploxion à l'écran (stremio) et un caché ; un faux PloxiLecteur ; une horloge à la main ; des toucher jsdom tenus pour vrais */
function monde({ rejeter = false, activation = () => false } = {}) {
  const { window: W } = new JSDOM('<!doctype html><body><main id="ploxi0n"><div class="px-scene">'
    + '<div class="px-hote" data-ploxion="stremio"><div class="cadre"><video id="v1"></video><button id="b1">▶</button></div></div>'
    + '<div class="px-hote" data-ploxion="autre" hidden><div class="cadre"><video id="v2"></video><button id="b2">▶</button></div></div>'
    + '</div></main></body>', { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  W.Capacitor = { isNativePlatform: () => true };
  const horloge = { t: 1e6 }, ouverts = []; let ecouteur = null;
  const plugin = {
    ouvrir: async (o) => { ouverts.push(o); if (rejeter) throw new Error('"PloxiLecteur.ouvrir()" is not implemented on ios'); return { moteur: 'apple' }; },
    moteurs: async () => ({ apple: true, vlc: false }), fermer: async () => {},
    addListener: async (n, f) => { ecouteur = f; return { remove() {} }; },
  };
  const l = creerLecteurNatif({ W, boxion: creerMemoire(), plugin, garde: { maintenant: () => horloge.t, fiable: () => true, activation } });
  const D = W.document, $ = (id) => D.getElementById(id);
  return {
    W, D, $, l, ouverts,
    toucher: (el) => el.dispatchEvent(new W.Event('pointerup', { bubbles: true })),
    avancer: (ms) => { horloge.t += ms; },
    emettre: async (e) => { await ecouteur({ position: 0, duree: 0, ...e }); },
    bulles: () => [...D.querySelectorAll('.px-bulle-lecteur')],
    labo: (jOSMobile) => { W.jOSMobile = jOSMobile; W.eval(LABO); assert.equal(l.brancherJosPlayer(W.jOSPlayer), true); return W.jOSPlayer; },
    illisible: (v, src) => { v.setAttribute('src', src); Object.defineProperty(v, 'error', { configurable: true, value: { code: 4 } }); v.dispatchEvent(new W.Event('error')); },
  };
}

test('🛡 pas de présentation sans toucher : la bulle à la place, et le lecteur sur le toucher de la bulle (un toucher = une présentation)', async () => {
  const m = monde();
  try {
    await assert.rejects(m.l.api.ouvrir('https://cdn/film.mp4', { titre: 'Film' }), (e) => e.garde === 'geste');
    assert.equal(m.ouverts.length, 0, 'aucun lecteur sans toucher');
    assert.equal(m.bulles().length, 1); assert.match(m.bulles()[0].textContent, /Film/);
    // un toucher trop vieux (> 1,5 s) ne compte plus ; la bulle reste unique
    m.toucher(m.$('b1')); m.avancer(2000);
    await assert.rejects(m.l.ouvrir('https://cdn/film.mp4', { titre: 'Film' }), (e) => e.garde === 'geste');
    assert.equal(m.ouverts.length, 0); assert.equal(m.bulles().length, 1, 'une bulle par flux');
    // le toucher de la bulle : le lecteur
    m.bulles()[0].querySelector('button').click(); await attendre();
    assert.deepEqual(m.ouverts.map(o => o.url), ['https://cdn/film.mp4']); assert.equal(m.bulles().length, 0);
    // le même toucher ne présente pas une seconde fois
    await assert.rejects(m.l.ouvrir('https://cdn/autre.mp4'), (e) => e.garde === 'vol');
    assert.equal(m.ouverts.length, 1); assert.equal(m.bulles().length, 0, 'sans toucher libre : pas de bulle surprise');
  } finally { m.W.close(); }
});

test('🛡 l\'activation du navigateur (un toucher dans un iframe) vaut un toucher — une seule fois', async () => {
  let ua = true; const m = monde({ activation: () => ua });
  try {
    await m.l.ouvrir('https://cdn/a.mp4'); assert.equal(m.ouverts.length, 1);
    await m.emettre({ etat: 'ferme' });
    m.avancer(2000);   // toujours « active » (WebKit : ≤ 5 s) : pas réutilisée
    await assert.rejects(m.l.ouvrir('https://cdn/b.mp4'), (e) => e.garde === 'geste');
    ua = false; m.avancer(6000);
    await assert.rejects(m.l.ouvrir('https://cdn/b.mp4'), (e) => e.garde === 'geste');
    assert.equal(m.ouverts.length, 1);
  } finally { m.W.close(); }
});

test('🛡 rien pour un ploxion caché, la fractale, la page cachée ; la vidéo illisible d\'un ploxion caché → la bulle quand on revient la toucher', async () => {
  const m = monde();
  try {
    const v1 = m.$('v1'), v2 = m.$('v2');
    m.l.surMedia(v1); m.l.surMedia(v2);
    // le toucher vient du ploxion caché (son code tourne encore) : jOSNatif.lecteur.ouvrir → rien, pas même une bulle
    m.toucher(m.$('b2'));
    await assert.rejects(m.l.api.ouvrir('https://cdn/x.mp4'), (e) => e.garde === 'cache');
    assert.equal(m.bulles().length, 0);
    assert.equal(m.l.garde.permis(v2), false, 'pas de plein écran pour une vidéo cachée');
    // une <video> illisible du ploxion caché, même juste après un toucher à l'écran : ni lecteur, ni bulle
    m.avancer(700); m.toucher(m.$('b1'));
    assert.equal(m.l.garde.permis(v1), true, 'le plein écran de la vidéo qu\'on vient de toucher');
    m.illisible(v2, 'https://cdn/cache.mkv'); await attendre();
    assert.equal(m.ouverts.length, 0); assert.equal(m.bulles().length, 0);
    // la fractale : le ploxion de devant n'est plus qu'une carte
    m.$('ploxi0n').classList.add('px-fx'); v1.closest('.px-hote').classList.add('px-fx-carte');
    m.avancer(700); m.toucher(m.$('b1'));
    await assert.rejects(m.l.ouvrir('https://cdn/y.mp4', { el: v1 }), (e) => e.garde === 'cache');
    assert.equal(m.l.garde.permis(v1), false);
    m.$('ploxi0n').classList.remove('px-fx'); v1.closest('.px-hote').classList.remove('px-fx-carte');
    // la page cachée (l'app en arrière-plan)
    Object.defineProperty(m.D, 'hidden', { configurable: true, get: () => true });
    m.avancer(700); m.toucher(m.$('b1'));
    await assert.rejects(m.l.ouvrir('https://cdn/y.mp4', { el: m.$('b1') }), (e) => e.garde === 'cache');
    delete m.D.hidden;
    assert.equal(m.ouverts.length, 0); assert.equal(m.bulles().length, 0);
    // on revient sur le ploxion caché et on touche SA vidéo : la bulle (jamais le lecteur tout seul), puis le lecteur sur la bulle
    m.$('v2').closest('.px-hote').hidden = false; v1.closest('.px-hote').hidden = true;
    m.avancer(700); m.toucher(m.$('b2'));
    assert.equal(m.ouverts.length, 0); assert.equal(m.bulles().length, 1, 'la bulle de la vidéo illisible');
    m.bulles()[0].querySelector('button').click(); await attendre();
    assert.deepEqual(m.ouverts.map(o => o.url), ['https://cdn/cache.mkv']);
  } finally { m.W.close(); }
});

test('🛡 ploxi0n://lire pendant que l\'app revient : pas de lecteur, la bulle quand la page est là', async () => {
  const m = monde();
  try {
    Object.defineProperty(m.D, 'hidden', { configurable: true, get: () => true });
    await assert.rejects(m.l.ouvrir('https://cdn/lien.mp4', { titre: 'Le lien' }), (e) => e.garde === 'cache');
    assert.equal(m.bulles().length, 0);
    delete m.D.hidden; m.D.dispatchEvent(new m.W.Event('visibilitychange'));
    assert.equal(m.bulles().length, 1); assert.match(m.bulles()[0].textContent, /Le lien/);
    assert.equal(m.ouverts.length, 0);
  } finally { m.W.close(); }
});

test('🛡 un seul à la fois : rien pendant le vol ni pendant qu\'il est à l\'écran, sauf un nouveau toucher après coup (le PiP) ; l\'app inactive', async () => {
  const m = monde();
  try {
    const b1 = m.$('b1');
    m.toucher(b1);
    const p = m.l.ouvrir('https://cdn/a.mp4');   // en vol (le Swift présente)
    await assert.rejects(m.l.ouvrir('https://cdn/b.mp4'), (e) => e.garde === 'vol');
    m.avancer(300); m.toucher(b1);   // un toucher pendant l'entrée : la même rafale, et trop tôt
    await assert.rejects(m.l.ouvrir('https://cdn/b.mp4'), (e) => e.garde === 'vol');
    await p; await m.emettre({ etat: 'lecture' });
    assert.equal(m.l.garde.occupe(), true); assert.equal(m.l.garde.permis(m.$('v1')), false, 'pas de plein écran web par-dessus');
    // à l'écran, un ploxion relance sa vidéo bien plus tard, sans toucher : rien
    m.avancer(5000);
    await assert.rejects(m.l.ouvrir('https://cdn/b.mp4'), (e) => e.garde === 'vol');
    assert.equal(m.bulles().length, 0);
    // le PiP : on touche la page après coup → le suivant remplace
    m.toucher(b1);
    await m.l.ouvrir('https://cdn/b.mp4');
    assert.deepEqual(m.ouverts.map(o => o.url), ['https://cdn/a.mp4', 'https://cdn/b.mp4']);
    // fermé → libre ; l'app devient inactive → rien jusqu'au prochain toucher
    await m.emettre({ etat: 'ferme' }); assert.equal(m.l.garde.occupe(), false);
    m.avancer(700); m.toucher(b1); m.l.garde.arrierePlan();
    await assert.rejects(m.l.ouvrir('https://cdn/c.mp4', { el: b1 }), (e) => e.garde === 'cache');
    m.avancer(700); m.toucher(b1);
    await m.l.ouvrir('https://cdn/c.mp4');
    assert.equal(m.ouverts.length, 3);
  } finally { m.W.close(); }
});

test('🛡 le disjoncteur : 2 échecs natifs, ou 3 ouvertures en 30 s → plus de natif pour ce flux ; le web par la bulle, ou tout de suite sur un toucher', async () => {
  const m = monde();
  try {
    const web = [], jp = m.labo({ open: (id) => web.push(id) }), b1 = m.$('b1'), u = 'https://cdn/film.mp4';
    for (let i = 0; i < 2; i++) { m.avancer(2000); m.toucher(b1); jp.play(u, { title: 'Film' }); await attendre(); await m.emettre({ etat: 'erreur', raison: 'format' }); }
    assert.equal(m.ouverts.length, 2); assert.equal(m.l.garde.etat().coupe(u), true);
    // sans toucher (un montage, la forge) : ni le natif, ni le web tout seul — la bulle « ▶ lecteur web »
    m.avancer(2000); jp.play(u, { title: 'Film' }); await attendre();
    assert.equal(m.ouverts.length, 2); assert.deepEqual(web, []);
    const b = m.bulles(); assert.equal(b.length, 1); assert.match(b[0].textContent, /lecteur web/);
    b[0].querySelector('button').click();
    assert.deepEqual(web, ['player'], 'la bulle : le Lecteur du web');
    // sur un toucher : le web tout de suite (le natif est coupé pour la session)
    m.avancer(2000); m.toucher(b1); jp.play(u, { title: 'Film' }); await attendre();
    assert.equal(m.ouverts.length, 2); assert.deepEqual(web, ['player', 'player']);
    // 3 ouvertures du même flux en 30 s (fermé, rouvert…) : la 4ᵉ n'ira plus au natif
    const u2 = 'https://cdn/serie.mp4?token=1';
    for (let i = 0; i < 3; i++) { m.avancer(2000); m.toucher(b1); await m.l.ouvrir(u2.replace('1', String(i))); await m.emettre({ etat: 'ferme' }); }
    m.avancer(2000); m.toucher(b1);
    await assert.rejects(m.l.ouvrir(u2), (e) => e.garde === 'coupe');
    assert.equal(m.ouverts.length, 5); assert.equal(m.l.garde.etat().coupes.length, 2);
  } finally { m.W.close(); }
});

test('🛡 la reprise (xb:resume) ne présente jamais toute seule : au montage, la bulle « reprendre à … » ; l\'épisode suivant, lui, enchaîne', async () => {
  const m = monde();
  try {
    const jp = m.labo({ open: () => {} });
    m.W.localStorage.setItem('xb:resume:tt9:1:1', '754');
    // Stremio remonte (la session restaurée au lancement) et relance sa lecture : aucun toucher
    const suivants = [];
    const o = { title: 'Épisode 1', key: 'tt9:1:1', onNext: () => { suivants.push('ep2'); jp.play('https://h/stream/ep2.mp4', { title: 'Épisode 2', key: 'tt9:1:2' }); } };
    jp.play('https://h/stream/ep1.mp4', o); await attendre();
    jp.play('https://h/stream/ep1.mp4', o); await attendre();   // un second montage
    assert.equal(m.ouverts.length, 0, 'jamais au lancement');
    assert.equal(m.bulles().length, 1, 'une seule bulle'); assert.match(m.bulles()[0].textContent, /Épisode 1 · reprendre à 12:34/);
    // le toucher de la bulle : le lecteur, à la reprise
    m.bulles()[0].querySelector('button').click(); await attendre();
    assert.equal(m.ouverts.length, 1); assert.equal(m.ouverts[0].position, 754);
    // la fin : l'épisode suivant s'enchaîne dans le lecteur (la suite d'une lecture à l'écran), sans toucher
    await m.emettre({ etat: 'lecture' }); m.avancer(40 * 60e3);
    await m.emettre({ etat: 'fin', position: 2400, duree: 2400 }); await attendre(800);
    assert.deepEqual(suivants, ['ep2']); assert.deepEqual(m.ouverts.map(x => x.titre), ['Épisode 1', 'Épisode 2']);
    assert.equal(m.W.localStorage.getItem('xb:resume:tt9:1:1'), null);
  } finally { m.W.close(); }
});

test('🛡 pas de boucle : le natif échoue → le web → la <video> du web échoue → jamais de retour au natif (ni le labo qui relance)', async () => {
  // 1. le natif lit, puis échoue (événement « erreur ») ; la bulle « ▶ lecteur web » ; le web échoue aussi
  const m = monde();
  try {
    const u = 'https://h/x/Film.mkv', v1 = m.$('v1');
    m.l.surMedia(v1);
    const jp = m.labo({ open: () => m.illisible(v1, u) });   // le Lecteur du web monte sa <video> : la WebView ne lit pas le MKV
    m.toucher(m.$('b1')); jp.play(u, { title: 'Film' }); await attendre();
    assert.equal(m.ouverts.length, 1);
    await m.emettre({ etat: 'erreur', raison: 'format non lu par iOS' });
    m.avancer(3000); m.bulles()[0].querySelector('button').click(); await attendre();
    assert.equal(m.ouverts.length, 1, 'le web a échoué : pas de retour au natif');
    assert.ok(m.bulles().some(b => /ni la page ni l'iPhone/.test(b.textContent)), 'on le dit, simplement');
  } finally { m.W.close(); }
  // 2. le Swift rejette (« not implemented », l'app inactive) → le web tout de suite → sa <video> échoue → le labo relance play() en rafale
  const n = monde({ rejeter: true });
  try {
    const u = 'https://h/y/Autre.mkv', v1 = n.$('v1'); let relances = 0;
    n.l.surMedia(v1);
    const jp = n.labo({ open: () => { n.illisible(v1, u); if (relances++ < 5) n.W.jOSPlayer.play(u, { title: 'Autre' }); } });
    n.toucher(n.$('b1')); jp.play(u, { title: 'Autre' }); await attendre(20);
    assert.equal(n.ouverts.length, 1, 'un seul essai natif pour un toucher');
    assert.ok(relances <= 1, 'les relances du labo ne repartent pas vers le web ni vers le natif');
    assert.ok(n.bulles().length <= 2, 'pas une tempête de bulles');
  } finally { n.W.close(); }
});
