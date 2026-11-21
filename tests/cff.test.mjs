// ⇄ (0.99.67, RS-7 coord #2258) « que les liens SBB CFF s'ajoutent automatiquement dans mon calendrier, des notifs de départ de là où je suis » :
// un lien a.sbbmobile.ch/s/… (ou le texte que l'app CFF partage) collé dans ⌕ chercher ou reçu par ploxi0n://cff?lien=… devient un évènement du
// calendrier de l'app (le ploxion calendar du labo) et une notification locale de départ (le chemin jusqu'à la gare si l'app le sait, sinon 15 min).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { trouverLienCff, lireTrajet, rappelDepart, creerCff, distanceKm } from '../src/natif/cff.js';
import { creerChercherLocal } from '../src/app/chercher-local.js';
import { creerNotifs } from '../src/natif/notifs.js';

const COURT = 'https://a.sbbmobile.ch/s/Ab3dE9x';
const h = (d) => d && (String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'));
const j = (d) => d && (d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));

test('⇄ lire un trajet : le texte partagé par l\'app CFF (fr, de), le site des CFF (nouveau et ancien), le lien court seul', () => {
  assert.equal(trouverLienCff('regarde ' + COURT + '.'), COURT, 'sans le point qui suit'); assert.equal(trouverLienCff('rien ici https://exemple.ch/x'), null);
  const maintenant = new Date('2026-11-21T06:00');
  const fr = lireTrajet('Lausanne → Genève Aéroport\nSa 21.11.2026 · dép. 08:12 · arr. 08:58\n' + COURT, { maintenant });
  assert.deepEqual([fr.de, fr.a, j(fr.depart), h(fr.depart), h(fr.arrivee), fr.lien], ['Lausanne', 'Genève Aéroport', '2026-11-21', '08:12', '08:58', COURT]);
  const de = lireTrajet('Zürich HB → Bern, 22.11.2026, ab 08:02, an 08:58 ' + COURT, { maintenant });
  assert.deepEqual([de.de, de.a, j(de.depart), h(de.depart), h(de.arrivee)], ['Zürich HB', 'Bern', '2026-11-22', '08:02', '08:58']);
  // le site des CFF (l'adresse longue du lien court) : stops, date, time, moment
  const stops = encodeURIComponent(JSON.stringify([{ value: '8501120', type: 'ID', label: 'Lausanne' }, { value: '8501008', type: 'ID', label: 'Genève' }]));
  const nouveau = lireTrajet('https://www.sbb.ch/fr?stops=' + stops + '&date=%222026-11-23%22&time=%2217:45%22&moment=%22DEPARTURE%22', { maintenant });
  assert.deepEqual([nouveau.de, nouveau.a, j(nouveau.depart), h(nouveau.depart), nouveau.arrivee], ['Lausanne', 'Genève', '2026-11-23', '17:45', null]);
  const ancien = lireTrajet('https://www.sbb.ch/fr/acheter/pages/fahrplan/fahrplan.xhtml?von=Lausanne&nach=Gen%C3%A8ve&datum=24.11.2026&zeit=07:05&an=false', { maintenant });
  assert.deepEqual([ancien.de, ancien.a, j(ancien.depart), h(ancien.depart)], ['Lausanne', 'Genève', '2026-11-24', '07:05']);
  // le lien court seul ne dit pas l'heure : il faut le déplier
  assert.equal(lireTrajet(COURT, { maintenant }), null);
  // sans date : aujourd'hui, ou demain si l'heure est passée ; un train qui arrive après minuit
  assert.equal(j(lireTrajet('Lausanne → Genève 08:12', { maintenant }).depart), '2026-11-21');
  assert.equal(j(lireTrajet('Lausanne → Genève 08:12', { maintenant: new Date('2026-11-21T21:00') }).depart), '2026-11-22');
  const nuit = lireTrajet('Genève → Lausanne, 21.11.2026, dép. 23:40, arr. 00:20', { maintenant });
  assert.equal(j(nuit.arrivee), '2026-11-22', 'l\'arrivée, le lendemain');
});

test('⇄ le rappel : le chemin jusqu\'à la gare si l\'app connaît où tu es et la gare, sinon 15 min avant', () => {
  const dep = new Date('2026-11-21T08:12');
  assert.deepEqual([h(rappelDepart(dep).at), rappelDepart(dep).minutes, rappelDepart(dep).depuisIci], ['07:57', 15, false]);
  const gare = { lat: 46.5168, lng: 6.6291 };
  assert.ok(Math.abs(distanceKm(gare, { lat: 46.5258, lng: 6.6291 }) - 1) < 0.01, '0,009° de latitude ≈ 1 km');
  const pied = rappelDepart(dep, { ici: { lat: 46.5257, lng: 6.6291 }, gare });
  assert.deepEqual([pied.minutes, h(pied.at), pied.depuisIci], [15, '07:57', true], '0,99 km à pied : 12 min + 3 (arrondi vers le haut : partir un peu tôt)');
  assert.equal(rappelDepart(dep, { ici: { lat: 46.5258, lng: 6.6291 }, gare }).minutes, 16, '1,0008 km : 16 min');
  assert.equal(rappelDepart(dep, { ici: { lat: 46.6067, lng: 6.6291 }, gare }).minutes, 34, '10 km : 24 min + 10');
  assert.equal(rappelDepart(dep, { ici: { lat: 47.37, lng: 8.54 }, gare }).minutes, 120, 'au plus 2 h');
  assert.equal(rappelDepart(dep, { ici: null, gare }).minutes, 15, 'sans ta position : 15 min');
});

test('⇄ ajouter : l\'évènement au calendrier de l\'app (le relais du labo), le rappel de départ, la bulle ; le lien court déplié ; sans compte, le rappel quand même', async () => {
  const appels = [], rappels = [], bulles = [];
  let statut = 200;
  const fetch = async (u, o = {}) => {
    appels.push([o.method || 'GET', u, o.body ? JSON.parse(o.body) : null]);
    const rep = (corps) => ({ ok: statut === 200, status: statut, json: async () => corps });
    if (u.startsWith('/px/calendrier/donnees.json')) return rep({ groupes: [{ id: 7, nom: 'perso' }], evenements: [] });
    if (u === '/px/calendrier/evenement') return rep({ ok: true, evenement: { id: 41, lat: 46.5168, lng: 6.6291 } });
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const cff = creerCff({ fetch, rappel: async (o) => { rappels.push(o); return true; }, position: async () => ({ lat: 46.5257, lng: 6.6291 }), signaler: (t) => bulles.push(t),
    deplier: async (l) => (l === COURT ? 'https://www.sbb.ch/fr/acheter/pages/fahrplan/fahrplan.xhtml?von=Lausanne&nach=Gen%C3%A8ve&datum=21.11.2026&zeit=08:12&an=false' : null), maintenant: () => new Date('2026-11-21T06:00') });
  const r = await cff.ajouter(COURT);
  assert.equal(r.calendrier, true); assert.equal(h(r.rappel), '07:57');
  assert.deepEqual(appels.map(a => a[0] + ' ' + a[1]), ['GET /px/calendrier/donnees.json?de=2026-11-21&a=2026-11-21', 'POST /px/calendrier/evenement']);
  assert.deepEqual(appels[1][2], { groupe: 7, titre: 'Lausanne → Genève', debut: '2026-11-21T08:12', fin: null, journee: false, lieu: 'gare de Lausanne', note: COURT, url: COURT });
  assert.equal(rappels.length, 1); assert.match(rappels[0].titre, /^⇄ départ 08:12 · Lausanne$/); assert.match(rappels[0].texte, /pars maintenant \(15 min jusqu'à la gare\)/);
  assert.equal(rappels[0].ouvrir, 'calendar'); assert.ok(rappels[0].id >= 820000 && rappels[0].id < 910000);
  assert.match(bulles.at(-1), /^⇄ Lausanne → Genève, 08:12 : au calendrier, rappel à 07:57$/);
  for (const b of bulles) assert.doesNotMatch(b, /\p{Extended_Pictographic}|—/u);
  // pas connecté au labo : pas d'évènement, mais le rappel (15 min : la gare n'est pas connue)
  statut = 401; rappels.length = 0;
  const r2 = await cff.ajouter('Lausanne → Genève, 21.11.2026, dép. 09:30 ' + COURT);
  assert.equal(r2.calendrier, false); assert.equal(h(r2.rappel), '09:15'); assert.match(bulles.at(-1), /pas au calendrier \(connecte-toi au labo\), rappel à 09:15/);
  // un lien qui ne dit rien
  assert.equal(await cff.ajouter('https://a.sbbmobile.ch/s/inconnu'), null); assert.match(bulles.at(-1), /ne dit pas l'heure/);
});

test('⇄ les entrées : ⌕ chercher (un lien collé), ploxi0n://cff?lien=… ; le lien court se déplie sans le jeton du labo', async () => {
  const W = new JSDOM('<!doctype html><html><body><div id="r"></div></body></html>').window, recus = [];
  const ch = creerChercherLocal({ W, racine: W.document.getElementById('r'), liste: () => [{ id: 'wiki', nom: 'Wiki' }], cff: (t) => recus.push(t) });
  const f = ch.ouvrir(COURT);
  const b = f.querySelector('[data-cl-cff]'); assert.ok(b, '⇄ ajouter ce trajet'); assert.match(b.textContent, /ajouter ce trajet/);
  b.click(); assert.deepEqual(recus, [COURT]); assert.equal(ch.ouverte(), false);
  const f2 = ch.ouvrir('wiki'); assert.ok(!f2.querySelector('[data-cl-cff]'), 'une recherche normale reste normale'); assert.ok(f2.querySelector('[data-cl-id="wiki"]')); ch.fermer();
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), cffSrc = readFileSync(new URL('../src/natif/cff.js', import.meta.url), 'utf8');
  assert.match(main, /cff: \(u\) => \{ cff\.ajouter\(u\.searchParams\.get\('lien'\)/, 'ploxi0n://cff?lien=…');
  assert.match(main, /rappel: \(o\) => notifs\.rappel\(o\)/);
  const deplier = cffSrc.slice(cffSrc.indexOf('export function deplierNatif'));
  assert.doesNotMatch(deplier, /Authorization|enTetes|jeton|credentials/, 'le lien court part chez les CFF sans rien du labo');
  // hors de l'iPhone, pas de rappel planifié (et pas d'erreur)
  const n = creerNotifs({ W, boxion: { get: async () => null, put: async () => {} } });
  assert.equal(await n.rappel({ id: 1, titre: 't', at: new Date(Date.now() + 60000) }), false);
});
