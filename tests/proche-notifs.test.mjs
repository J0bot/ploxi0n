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
  await A.demarrer({ nom: 'Léa' }); await B.demarrer({ nom: 'Tom' }); await attendre(300);
  const fpA = A.maille().moi().fp;
  await B.maille().prive(fpA, 'tu es où ?'); await attendre(300);
  await B.maille().dire('salut tout le monde'); await attendre(200);
  await B.maille().dire('@Léa viens au bar'); await attendre(300);
  assert.equal(notifs.length, 2, JSON.stringify(notifs));
  assert.equal(notifs[0].titre, '◉ Tom'); assert.equal(notifs[0].texte, 'tu es où ?'); assert.equal(notifs[0].salon, '@' + B.maille().moi().fp);
  assert.match(notifs[1].titre, /^@ Tom · #/); assert.equal(notifs[1].texte, '@Léa viens au bar');
  await B.maille().dire('encore'); await attendre(200);
  assert.equal(notifs.length, 2, 'les anciens ne reviennent pas');
  await A.arreter(); await B.arreter();
});
