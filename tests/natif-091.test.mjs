// 🏝 ▦ 🔔 (0.91) les Live Activities, un widget par ploxion, les notifications push (la clé APNs sur le labo)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerActivites } from '../src/natif/activites.js';
import { creerWidgetsPloxions } from '../src/natif/widgets-ploxions.js';
import { creerPush } from '../src/natif/push.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

function fauxPloxiApple() {
  const appels = []; let n = 0;
  return { appels,
    activiteDebut: async (o) => { appels.push(['debut', o]); return { id: 'a' + (++n) }; },
    activiteMaj: async (o) => { appels.push(['maj', o]); },
    activiteFin: async (o) => { appels.push(['fin', o]); return { n: 1 }; } };
}

test('🏝 une activité par clé : la redemander la met à jour ; fin ; coupée ou hors iPhone : rien ; les ploxions ont la leur', async () => {
  const pl = fauxPloxiApple(); let actif = true;
  const a = creerActivites({ plugin: pl, natif: () => true, actif: () => actif, boxion: creerMemoire() });
  const id = await a.debut('dodo', { titre: 'dodo', glyphe: 'dodo', debut: new Date(1e12) });
  assert.equal(id, 'a1'); assert.deepEqual(pl.appels[0], ['debut', { genre: 'dodo', ploxion: 'accueil', titre: 'dodo', sous: '', glyphe: 'moon.zzz', debut: 1e12, fin: undefined, progression: undefined }]);
  assert.equal(await a.debut('dodo', { titre: 'dodo', sous: 'encore' }), 'a1', 'la même'); assert.equal(pl.appels[1][0], 'maj');
  assert.equal(a.en('dodo'), true); await a.fin('dodo'); assert.deepEqual(pl.appels.at(-1), ['fin', { id: 'a1' }]); assert.equal(a.en('dodo'), false);
  assert.equal((await a.debut('x', { glyphe: '<script>' })) && pl.appels.at(-1)[1].glyphe, 'hourglass', 'un glyphe inconnu : le sablier');
  const p = a.pour('systeme'); await p.debut({ titre: 'images/s', progression: 2 });
  assert.equal(pl.appels.at(-1)[1].ploxion, 'systeme'); assert.equal(pl.appels.at(-1)[1].progression, 2, 'le Swift borne à 0…1');
  actif = false; assert.equal(await a.debut('vocal', {}), null);
  const sans = creerActivites({ plugin: pl, natif: () => false }); assert.equal(await sans.debut('vocal', {}), null);
});

test('▦ un widget par ploxion : publier (id du ploxion devant), la liste du widget, le bouton → ploxi0n://px/<id>?…, les Préférences', async () => {
  const ecrits = []; const boxion = creerMemoire(); let devant = 'systeme';
  const w = creerWidgetsPloxions({ boxion, ecrire: async (k, v) => ecrits.push([k, JSON.parse(v)]), glyphePng: async () => 'PNG64', courant: () => devant,
    catalogue: () => [{ id: 'systeme', nom: 'Système', interne: true }, { id: 'xp', nom: 'Jeu', description: 'un jeu de cartes, au pouce', categorie: 'jeux', bions: ['jOSKnob', 'jOSSwipe'] }, { id: 'wiki', nom: 'Wiki' }], maintenant: () => 1234 });
  const d = await w.publier({ valeur: 60, unite: 'img/s', sous: 'fluide', serie: [1, 2, 'x', 3, ...Array(40).fill(5)], bouton: { titre: 'mesurer', params: { onglet: 'app' } } });
  assert.deepEqual({ ...d, serie: d.serie.length }, { nom: 'Système', valeur: '60', unite: 'img/s', sous: 'fluide', serie: 24, bouton: { titre: 'mesurer', lien: 'ploxi0n://px/systeme?onglet=app' }, g64: 'PNG64', le: 1234 });
  devant = null; await assert.rejects(w.publier({ valeur: 1 }), /quel ploxion/);
  await w.publier({ valeur: 'x' }, 'xp');
  await new Promise(r => setTimeout(r, 450));
  const [cle, doc] = ecrits.at(-1); assert.equal(cle, 'ploxi0n.px-widgets');
  assert.deepEqual(doc.liste.map(x => x.id).filter(i => !i.startsWith('xer:')), ['systeme', 'xp', 'wiki'], 'ceux qui publient d\'abord, puis les installés (les internes seulement s\'ils publient)');
  assert.deepEqual(doc.liste.filter(x => x.id.startsWith('xer:')).map(x => x.id), ['xer:organique', 'xer:chill-tekk', 'xer:xerboxion', 'xer:xerbot'], '(0.99.59) les xers, au bout');
  assert.equal(doc.fiche['xer:xerbot'].c, 'xer');
  assert.deepEqual(doc.fiche.xp, { d: 'un jeu de cartes, au pouce', c: 'jeux', b: ['jOSKnob', 'jOSSwipe'] }, '◈ la fiche du xerploxion : description, catégorie, bions'); assert.equal(doc.fiche.wiki, undefined);
  assert.equal(doc.px.xp.valeur, 'x');
  await w.retirer('xp'); assert.equal(w.tous().xp, undefined);
});

test('🔔 le push : la permission, le jeton → le labo (POST /api/app/push, jamais dans l\'adresse) ; les sujets ; couper le retire ; toucher ouvre', async () => {
  const ecoutes = {}, envois = [], ouverts = [];
  const P = { requestPermissions: async () => ({ receive: 'granted' }), register: async () => { ecoutes.registration({ value: 'jeton-apns-123' }); }, unregister: async () => {},
    addListener: async (n, f) => { ecoutes[n] = f; return { remove() {} }; } };
  const boxion = creerMemoire(); let connecte = false, statut = 201;
  const push = creerPush({ W: {}, boxion, natif: () => true, connecte: () => connecte, charger: async () => ({ PushNotifications: P }), ouvrir: (id, p) => ouverts.push([id, p]),
    envoyer: async (q) => { envois.push(q); return { status: statut, texte: '{}' }; } });
  await assert.rejects(push.activer(), /connecte-toi/);
  connecte = true;
  await push.activer(['coord', 'pas-un-sujet']); await new Promise(r => setTimeout(r, 10));
  const q = envois.at(-1);
  assert.equal(q.methode, 'POST'); assert.equal(q.url, 'https://labo.j0bot.ch/api/app/push'); assert.ok(!/jeton-apns/.test(q.url));
  assert.deepEqual(JSON.parse(q.corps), { jeton: 'jeton-apns-123', plateforme: 'ios', environnement: 'production', app: 'ch.j0bot.ploxi0n', sujets: ['coord'] });
  assert.equal(push.reglage().jeton, 'jeton-apns-123'); assert.equal(push.reglage().actif, true);
  await push.sujets(['coord', 'messages']); assert.deepEqual(JSON.parse(envois.at(-1).corps).sujets, ['coord', 'messages']);
  ecoutes.pushNotificationActionPerformed({ notification: { data: { ouvrir: 'coord', params: { topic: 'push' } } } });
  assert.deepEqual(ouverts, [['coord', { topic: 'push' }]]);
  await push.couper(); assert.equal(envois.at(-1).methode, 'DELETE'); assert.equal(JSON.parse(envois.at(-1).corps).jeton, 'jeton-apns-123'); assert.equal(push.reglage().actif, false);
  // le labo sans la route : le message le dit
  statut = 404; await push.activer(); await new Promise(r => setTimeout(r, 10));
  assert.match(push.reglage().erreur, /pas encore la route/);
});
