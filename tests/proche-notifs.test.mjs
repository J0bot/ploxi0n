// ◉ (0.99.40) les notifications de Proche : un privé ou une mention reçus quand Proche n'est pas à l'écran → une notification (une fois) ;
// jamais un message d'un salon ouvert sans mention, ni le sien ; pas de notification pour la conversation qu'on regarde
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerProche } from '../src/lot/proche.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { attendre } from './aide.mjs';

function air() {
  const tuyaux = new Map();
  return () => {
    const pair = new Set(), msg = new Set(); let moi = null;
    const t = { demarrer({ nom }) { moi = nom + '·' + (tuyaux.size + 1); tuyaux.set(moi, t);
        queueMicrotask(() => { for (const [id, x] of tuyaux) if (id !== moi) { x._pair({ id: moi, etat: 'connecte' }); t._pair({ id, etat: 'connecte' }); } }); return Promise.resolve({ moi }); },
      arreter() { tuyaux.delete(moi); return Promise.resolve(); },
      envoyer(donnees, a) { const de = moi; for (const [id, x] of tuyaux) if (id !== de && (!a || a.includes(id))) setTimeout(() => x._msg({ de, donnees }), 2); return Promise.resolve({ envoyes: 1 }); },
      pairs: () => Promise.resolve([...tuyaux.keys()].filter(k => k !== moi)), surPair: (f) => pair.add(f), surMessage: (f) => msg.add(f),
      _pair: (e) => { for (const f of pair) f(e); }, _msg: (e) => { for (const f of msg) f(e); } };
    return t;
  };
}
const Wfaux = () => ({ setInterval: () => 0, clearInterval: () => {}, setTimeout: (f, ms) => setTimeout(f, Math.min(ms || 0, 5)), clearTimeout: () => {}, crypto: globalThis.crypto });

test('◉ un privé et une mention deviennent une notification ; un message ouvert sans mention, non ; une seule fois chacun', async () => {
  const f = air();
  const A = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null }), B = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null });
  const notifs = []; A.brancherNotifier((o) => { notifs.push(o); return true; });
  await A.demarrer({ nom: 'RS-4' }); await B.demarrer({ nom: 'RS-3' }); await attendre(300);
  const fpA = A.maille().moi().fp;
  await B.maille().prive(fpA, 'tu es où ?'); await attendre(300);
  await B.maille().dire('salut tout le monde'); await attendre(200);
  await B.maille().dire('@RS-4 viens au bar'); await attendre(300);
  assert.equal(notifs.length, 2, JSON.stringify(notifs));
  assert.equal(notifs[0].titre, '◉ RS-3'); assert.equal(notifs[0].texte, 'tu es où ?'); assert.equal(notifs[0].salon, '@' + B.maille().moi().fp);
  assert.match(notifs[1].titre, /^@ RS-3 · #/); assert.equal(notifs[1].texte, '@RS-4 viens au bar');
  await B.maille().dire('encore'); await attendre(200);
  assert.equal(notifs.length, 2, 'les anciens ne reviennent pas');
  await A.arreter(); await B.arreter();
});

test('↩ (0.99.45) répondre depuis la notification : la réponse part par le maillage ; « ✓ Lu » ; un privé porte l\'action, un événement non', async () => {
  const f = air();
  const A = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null }), B = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null });
  const notifs = []; A.brancherNotifier((o) => { notifs.push(o); return true; });
  await A.demarrer({ nom: 'RS-4' }); await B.demarrer({ nom: 'RS-3' }); await attendre(300);
  await B.maille().prive(A.maille().moi().fp, 'tu es où ?'); await attendre(300);
  const salon = notifs[0].salon; assert.equal(salon, '@' + B.maille().moi().fp);
  assert.equal(await A.repondre(salon, 'au bar, viens'), true); await attendre(400);
  assert.ok(B.maille().fil('@' + A.maille().moi().fp).some(m => m.texte === 'au bar, viens' && !m.moi), 'RS-3 a reçu la réponse tapée sur l\'écran verrouillé');
  assert.equal(await A.repondre('#inconnu', 'x'), false, 'pas un salon rejoint');
  A.marquerLu(salon);
  await A.arreter(); await B.arreter();
});

test('🔔 (0.99.45) les événements du maillage : un pote ✦ qui revient après 10 min sonne « tout près » ; pas ceux déjà là au démarrage', async () => {
  const f = air(); let t = Date.now(); const horloge = () => t;
  const A = creerProche({ W: Wfaux(), boxion: creerMemoire(), tuyau: f(), Contexte: null, maintenant: horloge });
  const memB = creerMemoire();   // RS-3 garde son identité (son empreinte) d'une fois à l'autre
  let B = creerProche({ W: Wfaux(), boxion: memB, tuyau: f(), Contexte: null, maintenant: horloge });
  const notifs = []; A.brancherNotifier((o) => { notifs.push(o); return true; });
  await A.demarrer({ nom: 'RS-4' }); await B.demarrer({ nom: 'RS-3' }); await attendre(300);
  A.maille().favori('RS-3'); await attendre(100);
  assert.equal(notifs.filter(n => /tout près/.test(n.titre)).length, 0, 'déjà là au démarrage : rien');
  await B.arreter(); t += 11 * 60e3; await attendre(100);
  B = creerProche({ W: Wfaux(), boxion: memB, tuyau: f(), Contexte: null, maintenant: horloge });
  await B.demarrer({ nom: 'RS-3' }); await attendre(400);
  const pres = notifs.filter(n => /tout près/.test(n.titre));
  assert.equal(pres.length, 1, JSON.stringify(notifs)); assert.equal(pres[0].genre, 'evenement'); assert.match(pres[0].titre, /^◉ RS-3 est tout près/);
  await A.arreter(); await B.arreter();
});
