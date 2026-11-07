// ▣ (0.99.35) la carte d'un pote (le QR, comme meshlink) et Proche en pages : l'aller-retour du QR, une carte trafiquée refusée, le pote
// vérifié avec sa clé (le privé chiffré marche avant même qu'il s'annonce), gardé au redémarrage, effacé avec tout ; les cinq pages
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import jsQR from 'jsqr';
import { creerMaille, lienCarte, lireCarte } from '../src/bions/maille.js';
import { qrModules, qrSvg } from '../src/bions/qr.js';
import { creerProche, PAGES } from '../src/lot/proche.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

const C = globalThis.crypto;
function magasin() { const m = new Map(); return { m, lire: async (k) => (m.has(k) ? structuredClone(m.get(k)) : null), ecrire: async (k, v) => { m.set(k, structuredClone(v)); } }; }
function maille(envois = [], mag = magasin(), nom = '') {
  return creerMaille({ subtle: C.subtle, alea: (n) => C.getRandomValues(new Uint8Array(n)), envoyer: (t, v) => envois.push({ t, v }), attente: (ms, f) => setTimeout(f, 0), repeter: () => () => {}, magasin: mag, nom });
}

test('▣ le QR : la carte du pote se relit à l\'identique (jsQR)', async () => {
  const a = maille(); await a.demarrer({ nom: 'Léa' });
  const c = a.carte();
  assert.match(c, /^ploxi0n:\/\/pote\?k=[A-Za-z0-9_-]{87}&f=[0-9a-f]{16}&n=L%C3%A9a$/);
  const m = qrModules(c), n = m.length, z = 4, cote = (n + 2 * z) * 4, px = new Uint8ClampedArray(cote * cote * 4);
  for (let y = 0; y < cote; y++) for (let x = 0; x < cote; x++) { const my = Math.floor(y / 4) - z, mx = Math.floor(x / 4) - z, noir = my >= 0 && mx >= 0 && my < n && mx < n && m[my][mx], i = (y * cote + x) * 4; px[i] = px[i + 1] = px[i + 2] = noir ? 0 : 255; px[i + 3] = 255; }
  const lu = jsQR(px, cote, cote); assert.ok(lu, 'jsQR lit le QR'); assert.equal(lu.data, c);
  assert.match(qrSvg(c), /^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*><rect[^>]*\/><path d="M/);
});

test('▣ lire une carte : bornée, suspecte', () => {
  assert.equal(lireCarte('https://exemple.ch'), null); assert.equal(lireCarte('ploxi0n://pote?k=AAAA'), null);
  assert.equal(lireCarte('ploxi0n://pote?k=' + 'A'.repeat(500)), null);
  const cle = new Uint8Array(65); cle[0] = 4;
  const l = lienCarte({ cle, nom: 'Tom\u0007\u0000', fp: 'zz' }); assert.equal(lireCarte(l), null, 'une empreinte qui n\'est pas hex');
  const ok = lireCarte(lienCarte({ cle, nom: 'Tom\u0007' })); assert.equal(ok.cle.length, 65); assert.equal(ok.nom, 'Tom'); assert.equal(ok.fp, null);
});

test('▣ scanner la carte d\'un pote : vérifié, sa clé tout de suite, le privé chiffré part ; une carte trafiquée ou la sienne refusées', async () => {
  const lea = maille([], magasin(), 'Léa'), tom = maille(), tomEnvois = [], magTom = magasin();
  await lea.demarrer({ nom: 'Léa' });
  const t = maille(tomEnvois, magTom); await t.demarrer({ nom: 'Tom' });
  const r = await t.ajouterCarte(lea.carte());
  assert.equal(r.nom, 'Léa'); assert.equal(r.fp, lea.moi().fp);
  const f = t.favoris().find(x => x.fp === lea.moi().fp); assert.ok(f && f.cle && f.verifie, 'pote ✦, vérifié, avec sa clé');
  assert.ok(await t.codeSecurite(lea.moi().fp), 'le code de sécurité se calcule déjà');
  const id = await t.prive(lea.moi().fp, 'on se voit au lac'); assert.ok(id, 'le message privé part, chiffré, sans l\'avoir jamais vue dans le maillage');
  assert.ok(!tomEnvois.some(e => /on se voit au lac/.test(e.t)), 'jamais en clair');
  // trafiquée : la clé d'un autre sous l'empreinte de Léa
  const autre = maille(); await autre.demarrer({ nom: 'X' });
  const k = new URL(autre.carte().replace('ploxi0n://', 'http://x/')).searchParams.get('k');
  assert.match((await t.ajouterCarte('ploxi0n://pote?k=' + k + '&f=' + lea.moi().fp + '&n=L%C3%A9a')).erreur, /trafiquée/);
  assert.match((await t.ajouterCarte(t.carte())).erreur, /ta propre carte/);
  assert.match((await t.ajouterCarte('ploxi0n://px/xion')).erreur, /pas une carte/);
  // redémarrer : le pote et sa clé reviennent du disque
  const t2 = maille([], magTom); await t2.demarrer({ nom: 'Tom' });
  const f2 = t2.favoris().find(x => x.fp === lea.moi().fp); assert.ok(f2 && f2.cle && f2.verifie);
  assert.ok(await t2.prive(lea.moi().fp, 'toujours là ?'));
  // tout effacer : plus de pote
  await t2.effacerTout(); assert.equal(t2.favoris().length, 0);
  const t3 = maille([], magTom); await t3.demarrer({}); assert.equal(t3.favoris().length, 0);
  void tom;
});

const Wpage = () => { const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true }); const W = dom.window; Object.defineProperty(W, 'crypto', { value: C }); return W; };
const tuyauNul = () => { const t = { demarrer: ({ nom }) => Promise.resolve({ moi: nom + '·1' }), arreter: () => Promise.resolve(), envoyer: () => Promise.resolve({ envoyes: 0 }), pairs: () => Promise.resolve([]), surPair() {}, surMessage() {} }; return t; };

test('◉ Proche en pages : cinq onglets, une seule page visible ; éteint → autour, démarré → messages ; la carte a son QR', async () => {
  const W = Wpage(), h = W.document.getElementById('h');
  const p = creerProche({ W, boxion: creerMemoire(), tuyau: tuyauNul(), Contexte: null });
  const m = p.mount(h, {}); await new Promise(r => setTimeout(r, 20));
  assert.deepEqual([...h.querySelectorAll('[data-pr-page]')].map(b => b.getAttribute('data-pr-page')), PAGES.map(x => x[0]));
  const visibles = () => [...h.querySelectorAll('[data-pr-section]')].filter(s => !s.hidden).map(s => s.getAttribute('data-pr-section'));
  assert.deepEqual(visibles(), ['autour']);
  h.querySelector('[data-pr-nom]').value = 'RS-7';
  h.querySelector('[data-pr="allumer"]').click(); await new Promise(r => setTimeout(r, 60));
  assert.deepEqual(visibles(), ['messages'], 'démarré : on arrive sur les messages');
  assert.match(h.querySelector('[data-pr-etat]').textContent, /RS-7/);
  h.querySelector('[data-pr-page="carte"]').click();
  assert.deepEqual(visibles(), ['carte']); assert.ok(h.querySelector('.px-pr-qr svg path'), 'ma carte en QR');
  assert.ok(h.querySelector('[data-pr-scan]') && !h.querySelector('[data-pr-scan]').disabled);
  h.querySelector('[data-pr-page="son"]').click(); assert.deepEqual(visibles(), ['son']);
  h.querySelector('[data-pr-page="potes"]').click(); assert.deepEqual(visibles(), ['potes']);
  m.unmount(); await p.arreter(); W.close();
});

test('◉ un lien ploxi0n://pote… ouvre Proche sur la carte et ajoute le pote (en attente tant que Proche est éteint)', async () => {
  const lea = maille(); await lea.demarrer({ nom: 'Léa' });
  const W = Wpage(), h = W.document.getElementById('h');
  const p = creerProche({ W, boxion: creerMemoire(), tuyau: tuyauNul(), Contexte: null });
  p.mount(h, { params: { lien: '?carte=' + encodeURIComponent(lea.carte()) } }); await new Promise(r => setTimeout(r, 20));
  assert.equal(p.page(), 'carte'); assert.match(h.textContent, /une carte de pote attend/);
  await p.demarrer({ nom: 'Tom' }); await new Promise(r => setTimeout(r, 60));
  assert.ok(p.maille().favoris().some(f => f.fp === lea.moi().fp && f.verifie), 'ajoutée au démarrage');
  assert.match(h.textContent, /Léa/);
  await p.arreter(); W.close();
});
