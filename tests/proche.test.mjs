// ◉ (0.99.1) l'ultimate Bluetooth : les paquets, l'horloge partagée, la partition de la basse, le son partagé ; deux téléphones simulés
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paquet, lire, ecart, meilleurEcart, partition, notesEntre, freq, positionA, nomDe, TAILLE_MAX } from '../src/bions/proche.js';
import { creerProche } from '../src/lot/proche.js';
import { creerTuyauProche, court } from '../src/natif/proche-natif.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { attendre } from './aide.mjs';

test('◉ les paquets : aller-retour, et ce qui vient d\'à côté est suspect', () => {
  const s = paquet('msg', { texte: 'salut' }, 42);
  assert.deepEqual(lire(s), { g: 'msg', d: { texte: 'salut' }, t: 42 });
  assert.equal(lire('pas du json'), null); assert.equal(lire(JSON.stringify({ v: 9, g: 'msg' })), null);
  assert.equal(lire(JSON.stringify({ v: 1, g: 'virus' })), null); assert.equal(lire('x'.repeat(TAILLE_MAX + 1)), null); assert.equal(lire(42), null);
  assert.throws(() => paquet('msg', { texte: 'x'.repeat(TAILLE_MAX) })); assert.throws(() => paquet('autre', 1));
  assert.equal(nomDe('RS-7·a3f2'), 'RS-7'); assert.equal(nomDe(''), '·');
  assert.equal(court(''), 'ploxion'); assert.equal(court('a·b'), 'a-b'); assert.ok(new TextEncoder().encode(court('🦀'.repeat(40))).length <= 50);
});

test('◉ l\'horloge : le décalage à la NTP, les mesures rapides disent vrai', () => {
  // B a 5000 ms d'avance ; le voyage met 10 ms à l'aller, 10 au retour
  assert.deepEqual(ecart(1000, 6010, 6011, 1021), { decalage: 5000, allerRetour: 20 });
  const m = meilleurEcart([{ decalage: 5000, allerRetour: 20 }, { decalage: 5300, allerRetour: 600 }, { decalage: 4998, allerRetour: 18 }, { decalage: 5003, allerRetour: 25 }]);
  assert.equal(m.decalage, 5000); assert.equal(m.allerRetour, 18); assert.equal(meilleurEcart([]), null);
});

test('◉ la basse : une partition bornée, des notes en boucle depuis le début de l\'hôte', () => {
  const p = partition({ tempo: 500, motif: 'nimporte', tonique: 3, debut: 10000 });
  assert.equal(p.tempo, 200); assert.equal(p.motif, 'pulse'); assert.equal(p.tonique, 24);
  const q = partition({ tempo: 120, motif: 'pulse', tonique: 36, debut: 0 });   // un pas = 125 ms ; pulse : une note tous les 4 pas
  const n = notesEntre(q, 0, 2000);
  assert.deepEqual(n.map(x => x.t), [0, 500, 1000, 1500]); assert.ok(n.every(x => x.midi === 36));
  assert.deepEqual(notesEntre(q, 1000, 1000), []); assert.deepEqual(notesEntre(q, 1001, 1600).map(x => x.t), [1500]);
  assert.deepEqual(notesEntre(q, -500, 100).map(x => x.t), [0]);   // rien avant le début
  assert.equal(Math.round(freq(69)), 440); assert.equal(Math.round(freq(57)), 220);
  const d = partition({ motif: 'dub', tonique: 36 }), notes = notesEntre(d, 0, 2000).map(x => x.midi);
  assert.ok(notes.includes(48), 'le « +0 » = l\'octave du dessus');
});

test('◉ le son partagé : la position au rendez-vous', () => {
  const r = { url: 'https://x/a.mp3', position: 10, a: 1000, joue: true };
  assert.equal(positionA(r, 3000), 12); assert.equal(positionA({ ...r, joue: false }, 9000), 10); assert.equal(positionA(null, 1), 0);
});

// deux téléphones simulés : un « air » commun livre les paquets ; chacun a sa propre horloge
function air() {
  const tuyaux = new Map();
  const fabriquer = () => {
    const pair = new Set(), msg = new Set(); let moi = null;
    const t = { demarrer({ nom }) { moi = nom + '·' + (tuyaux.size + 1); tuyaux.set(moi, t);
        queueMicrotask(() => { for (const [id, x] of tuyaux) if (id !== moi) { x._pair({ id: moi, etat: 'connecte' }); t._pair({ id, etat: 'connecte' }); } }); return Promise.resolve({ moi }); },
      arreter() { tuyaux.delete(moi); for (const x of tuyaux.values()) x._pair({ id: moi, etat: 'perdu' }); return Promise.resolve(); },
      envoyer(donnees, a) { const de = moi; for (const [id, x] of tuyaux) if (id !== de && (!a || a.includes(id))) setTimeout(() => x._msg({ de, donnees }), 2); return Promise.resolve({ envoyes: 1 }); },
      pairs: () => Promise.resolve([...tuyaux.keys()].filter(k => k !== moi)), surPair: (f) => pair.add(f), surMessage: (f) => msg.add(f),
      _pair: (e) => { for (const f of pair) f(e); }, _msg: (e) => { for (const f of msg) f(e); } };
    return t;
  };
  return fabriquer;
}
const Wfaux = () => ({ setInterval: () => 0, clearInterval: () => {}, setTimeout: (f) => setTimeout(f, 0), clearTimeout: () => {} });

test('◉ deux téléphones : les messages, l\'horloge de l\'hôte, la basse annoncée puis rejointe, le son en https seulement', async () => {
  const f = air();
  const A = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null, maintenant: () => Date.now() });
  const B = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null, maintenant: () => Date.now() + 5000 });   // B a 5 s d'avance
  assert.equal(A.ploxion.id, 'proche');
  assert.equal(A.envoyerMessage('rien'), false, 'éteint : rien ne part');
  assert.ok(await A.demarrer({ nom: 'RS-7', salle: 'zurich' })); assert.ok(await B.demarrer({ nom: 'Tom', salle: 'zurich' }));
  await attendre(60);
  assert.equal(A.etat().pairs.length, 1); assert.equal(A.etat().pairs[0].etat, 'connecte');
  const ea = A.etat().pairs[0].ecart; assert.ok(ea && Math.abs(ea.decalage - 5000) < 30, 'A voit l\'avance de B : ' + (ea && ea.decalage));
  // les messages, et le texte reçu reste du texte
  assert.ok(A.envoyerMessage('<b>salut</b> ♡')); await attendre(30);
  assert.equal(B.etat().messages.at(-1).texte, '<b>salut</b> ♡'); assert.equal(A.etat().messages.at(-1).moi, true);
  // A héberge la basse ; B la voit, ne joue rien tant qu'il n'a pas rejoint
  const p = A.hebergerBasse({ tempo: 128, motif: 'tekk' }); await attendre(30);
  assert.equal(B.etat().basse.tempo, 128); assert.equal(B.etat().basseHote, A.etat().moi); assert.equal(B.etat().ecoute.basse, false);
  assert.equal(B.etat().basse.debut, p.debut, 'le début est dans l\'heure de l\'hôte');
  const ecartB = B.etat().pairs[0].ecart; assert.ok(Math.abs(B.heureDe(A.etat().moi) - Date.now()) < 40 + Math.abs(ecartB.decalage + 5000), 'B lit l\'heure de A');
  assert.ok(Math.abs(ecartB.decalage + 5000) < 30, 'B voit le retard de A : ' + ecartB.decalage);
  B.rejoindre('basse'); assert.equal(B.etat().ecoute.basse, true);
  // changer le tempo garde le début : tout le monde reste calé
  const p2 = A.hebergerBasse({ tempo: 140 }); assert.equal(p2.debut, p.debut); await attendre(30); assert.equal(B.etat().basse.tempo, 140);
  A.arreterBasse(); await attendre(30); assert.equal(B.etat().basse, null);
  // le son : https seulement
  assert.equal(A.hebergerSon('http://pas-sur/a.mp3'), null); assert.equal(A.hebergerSon('javascript:alert(1)'), null);
  const r = A.hebergerSon('https://exemple.ch/son.mp3'); await attendre(30);
  assert.equal(B.etat().son.url, 'https://exemple.ch/son.mp3'); assert.equal(B.etat().son.a, r.a);
  A.pauseSon(); await attendre(30); assert.equal(B.etat().son.joue, false);
  // B s'en va : A l'oublie
  await B.arreter(); await attendre(20); assert.equal(A.etat().pairs.length, 0); assert.equal(B.etat().actif, false);
  await A.arreter();
});

test('◉ le tuyau ailleurs que sur l\'iPhone : deux onglets par un BroadcastChannel', async () => {
  const W = { BroadcastChannel: globalThis.BroadcastChannel };
  const a = creerTuyauProche({ W }), b = creerTuyauProche({ W }); const vus = [], recus = [];
  a.surPair((e) => vus.push(e)); b.surMessage((m) => recus.push(m));
  assert.equal((await a.envoyer('x')).envoyes, 0, 'éteint : rien ne part');
  await a.demarrer({ nom: 'A', salle: 's-test' }); await b.demarrer({ nom: 'B', salle: 's-test' }); await attendre(40);
  assert.ok(vus.some(e => e.etat === 'connecte' && e.id === b.moi()));
  await a.envoyer('bonjour'); await attendre(40); assert.equal(recus[0].donnees, 'bonjour'); assert.equal(recus[0].de, a.moi());
  await b.arreter(); await attendre(40); assert.ok(vus.some(e => e.etat === 'perdu')); await a.arreter();
});
