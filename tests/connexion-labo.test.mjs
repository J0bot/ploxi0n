// 🔑 (0.83) le labo connecté tout seul : un passe à usage unique (jamais le jeton dans une adresse), le repli (pas connecté, hors ligne,
// route absente), le cadre du mode xerboxion et les cadres des ploxions qui s'ouvrent connectés
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerConnexionLabo } from '../src/natif/connexion-labo.js';
import { creerCadresLabo } from '../src/natif/cadres-labo.js';
import { creerModes } from '../src/app/modes.js';
import { page, attendre } from './aide.mjs';

const S = 'https://labo.j0bot.ch';
const PASSE = 'p4ss3-un-seul-usage-0123456789';

test('🔑 le passe : POST /api/app/passe (le jeton dans l\'en-tête du relais, jamais dans l\'adresse) → /app/entrer?passe=…&vers=…', async () => {
  const demandes = [];
  const c = creerConnexionLabo({ source: S, connecte: () => true, requete: async (o) => { demandes.push(o); return { status: 200, texte: JSON.stringify({ passe: PASSE, expire: new Date(Date.now() + 60e3).toISOString() }) }; } });
  const u = await c.adresse('/home?app=ploxi0n');
  assert.equal(u, S + '/app/entrer?passe=' + PASSE + '&vers=' + encodeURIComponent('/home?app=ploxi0n'));
  assert.equal(demandes[0].methode, 'POST'); assert.equal(demandes[0].url, S + '/api/app/passe'); assert.deepEqual(JSON.parse(demandes[0].corps), { vers: '/home?app=ploxi0n' });
  assert.doesNotMatch(u, /jeton|Bearer/i);
  assert.equal(await c.emballer('https://ailleurs.ch/x'), 'https://ailleurs.ch/x', 'un autre site : tel quel');
  assert.match(await c.emballer(S + '/ideas'), /\/app\/entrer\?passe=.*&vers=%2Fideas$/);
  assert.equal(await c.emballer(S + '/app/entrer?passe=x'), S + '/app/entrer?passe=x', 'jamais deux fois');
  assert.equal(await c.adresse('//evil.ch/x'), S + '//evil.ch/x', 'pas de chemin d\'un autre site : aucun passe demandé');
  assert.equal(demandes.length, 2);
});

test('🔑 le repli : pas connecté, hors ligne, route absente (une fois), réponse bizarre → l\'adresse simple', async () => {
  let connecte = false, enLigne = true, n = 0, rep = { status: 404, texte: '' };
  const c = creerConnexionLabo({ source: S, connecte: () => connecte, enLigne: () => enLigne, requete: async () => { n++; return rep; } });
  assert.equal(await c.adresse('/home'), S + '/home'); assert.equal(n, 0);
  connecte = true; enLigne = false; assert.equal(await c.adresse('/home'), S + '/home'); assert.equal(n, 0);
  enLigne = true; assert.equal(await c.adresse('/home'), S + '/home'); assert.equal(n, 1);
  assert.equal(await c.adresse('/home'), S + '/home'); assert.equal(n, 1, '404 : plus redemandé jusqu\'au prochain lancement'); assert.equal(c.disponible(), false);
  const c2 = creerConnexionLabo({ source: S, connecte: () => true, requete: async () => ({ status: 200, texte: JSON.stringify({ passe: '<script>' }) }) });
  assert.equal(await c2.adresse('/home'), S + '/home');
  const c3 = creerConnexionLabo({ source: S, connecte: () => true, requete: async () => ({ status: 200, texte: JSON.stringify({ passe: PASSE, expire: '2000-01-01T00:00:00Z' }) }) });
  assert.equal(await c3.adresse('/home'), S + '/home', 'un passe déjà expiré');
  const c4 = creerConnexionLabo({ source: S, connecte: () => true, requete: async () => { throw new Error('réseau'); } });
  assert.equal(await c4.adresse('/home'), S + '/home');
});

test('🔑 le mode xerboxion : le cadre attend la règle du labo, puis s\'ouvre CONNECTÉ ; un cadre de ploxion aussi', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    const connecter = async (c) => S + '/app/entrer?passe=' + PASSE + '&vers=' + encodeURIComponent(c);
    const cadres = creerCadresLabo({ W, source: S, tete: async () => ({ status: 200, entetes: { 'content-security-policy': "frame-ancestors 'self' https://*.j0bot.ch capacitor://localhost" } }), connecter });
    const prefs = { lire: () => ({ mode: 'xerboxion' }), regler: async () => {}, surChangement: () => {} };
    const m = creerModes({ W, prefs, cadres, connecter, source: S });
    const h = D.createElement('div'); h.className = 'px-accueil'; h.innerHTML = m.panneau(); D.body.appendChild(h);
    const f = h.querySelector('.px-labo iframe');
    assert.equal(f.getAttribute('src'), 'about:blank', 'rien du labo avant de savoir');
    await attendre(60);
    assert.equal(f.getAttribute('src'), S + '/app/entrer?passe=' + PASSE + '&vers=' + encodeURIComponent('/home?app=ploxi0n'));
    // un ploxion qui encadre une page du labo
    const hote = D.createElement('div'); hote.className = 'px-hote'; hote.innerHTML = '<iframe src="/ideas"></iframe>'; D.body.appendChild(hote);
    await attendre(40);
    assert.equal(hote.querySelector('iframe').getAttribute('src'), S + '/app/entrer?passe=' + PASSE + '&vers=%2Fideas');
  } finally { p.fin(); }
});
