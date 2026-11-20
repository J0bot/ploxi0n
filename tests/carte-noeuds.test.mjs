// 🗺 (0.99.53) les nœuds sur la vraie carte : la qualité d'un lien, les rencontres, les zones, la position d'un nœud fixe, la capacité xion,
// Proche qui note où il entend ses voisins (sur demande) et window.jOSMaille pour mappion
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qualite, couleurQualite, rencontre, zones, noeudsCarte, cadrer, distance } from '../src/bions/carte-noeuds.js';
import { creerMaille } from '../src/bions/maille.js';
import { creerProche } from '../src/lot/proche.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { attendre } from './aide.mjs';

test('🗺 la qualité d\'un lien : rapide, lente, ce qu\'on ignore ne compte pas, chaque saut la divise', () => {
  assert.equal(qualite({ rtt: 20 }), 1); assert.equal(qualite({ rtt: 900 }), 0);
  assert.ok(qualite({ rtt: 120 }) > 0.4 && qualite({ rtt: 120 }) < 0.7);
  assert.equal(qualite({}), 0.5, 'rien de mesuré : au milieu');
  assert.ok(qualite({ rtt: 20, sauts: 2 }) < 0.4);
  assert.equal(couleurQualite(0.9).mot, 'rapide'); assert.equal(couleurQualite(0.1).mot, 'lent');
});

test('🗺 les rencontres font des zones : le centre penche vers là où le lien était bon ; une position floue ne compte pas', () => {
  const ici = { lat: 46.7785, lng: 6.6411 }, la = { lat: 46.7795, lng: 6.6411 };   // ~111 m plus au nord
  assert.equal(rencontre({ fp: 'a', moi: { ...ici, precision: 400 }, t: 1 }), null);
  const r = [rencontre({ fp: 'pi', nom: 'pi-gare', moi: ici, t: 1, rtt: 20 }), rencontre({ fp: 'pi', moi: la, t: 2, rtt: 700 }), rencontre({ fp: 'rs3', nom: 'RS-3', moi: la, t: 3 })];
  const z = zones(r), pi = z.find(x => x.fp === 'pi');
  assert.equal(z.length, 2); assert.equal(z[0].fp, 'rs3', 'le plus récent d\'abord');
  assert.ok(distance(pi, ici) < distance(pi, la), 'plus près de là où le lien était rapide');
  assert.ok(pi.rayon >= 15 && pi.n === 2 && pi.qMax === 1);
  assert.equal(zones(r, { depuis: 3 }).length, 1);
});

test('🗺 la carte : un nœud fixe à sa place, un pote à sa position partagée, les autres par leur zone, ceux qu\'on n\'entend plus marqués absents', () => {
  const T = { noeuds: [{ id: 'moi', moi: true }, { id: 'pi', nom: 'pi', direct: true, pos: { lat: 46.78, lng: 6.64 }, cap: ['relais', 'xion'] }, { id: 'rs3', nom: 'RS-3', direct: true }, { id: 'esp', nom: 'esp32', direct: false, sauts: 1 }] };
  const zs = zones([rencontre({ fp: 'esp', nom: 'esp32', moi: { lat: 46.781, lng: 6.642 }, t: 5 }), rencontre({ fp: 'vieux', nom: 'vieux', moi: { lat: 46.77, lng: 6.63 }, t: 1 })]);
  const C = noeudsCarte({ topologie: T, positions: [{ fp: 'rs3', lat: 46.779, lng: 6.641 }], zs, moi: { lat: 46.7785, lng: 6.6411 } });
  const par = Object.fromEntries(C.noeuds.map(n => [n.fp, n]));
  assert.equal(par.pi.pos.source, 'annoncee'); assert.equal(par.pi.xion, true);
  assert.equal(par.rs3.pos.source, 'pote'); assert.ok(par.esp.zone && !par.esp.pos); assert.equal(par.vieux.absent, true);
  const c = cadrer(C); assert.ok(c.rayon > 900, 'le cadre contient tout, le vieux nœud compris : ' + c.rayon);
});

test('🗺 le maillage : un nœud fixe annonce sa position (arrondie), xion s\'ajoute aux capacités ; un téléphone se tait par défaut', async () => {
  const fil = { A: null, B: null };
  const mk = (nom, autre) => creerMaille({ subtle: globalThis.crypto.subtle, alea: (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)), nom, attente: (ms, f) => setTimeout(f, 1), repeter: () => () => {},
    envoyer: (t) => setTimeout(() => fil[autre] && fil[autre].recevoir(nom, t), 1) });
  fil.A = mk('pi', 'B'); fil.B = mk('tel', 'A');
  await fil.A.demarrer(); await fil.B.demarrer(); fil.A.voisin('tel', 'connecte'); fil.B.voisin('pi', 'connecte'); await attendre(60);
  let n = fil.B.topologie().noeuds.find(x => x.nom === 'pi'); assert.equal(n.pos, null, 'par défaut, rien'); assert.equal(n.xion, false);
  assert.deepEqual(fil.A.positionFixe({ lat: 46.7785123, lng: 6.6411987, precision: 4.6 }), { lat: 46.77851, lng: 6.6412, precision: 5 });
  fil.A.xion(true); await attendre(60);
  n = fil.B.topologie().noeuds.find(x => x.nom === 'pi');
  assert.deepEqual(n.pos, { lat: 46.77851, lng: 6.6412, precision: 5 }); assert.equal(n.xion, true);
  fil.A.positionFixe(null); await attendre(60); assert.equal(fil.B.topologie().noeuds.find(x => x.nom === 'pi').pos, null, 'il peut se taire à nouveau');
});

test('🗺 Proche : rien n\'est noté tant qu\'on ne l\'allume pas ; allumé, chaque voisin direct devient une rencontre ; jOSMaille les rend', async () => {
  const tuyaux = new Map();
  const tuyau = () => { const pair = new Set(), msg = new Set(); let moi = null;
    const t = { demarrer({ nom }) { moi = nom + '·' + (tuyaux.size + 1); tuyaux.set(moi, t); queueMicrotask(() => { for (const [id, x] of tuyaux) if (id !== moi) { x._pair({ id: moi, etat: 'connecte' }); t._pair({ id, etat: 'connecte' }); } }); return Promise.resolve({ moi }); },
      arreter() { tuyaux.delete(moi); return Promise.resolve(); },
      envoyer(donnees, a) { const de = moi; for (const [id, x] of tuyaux) if (id !== de && (!a || a.includes(id))) setTimeout(() => x._msg({ de, donnees }), 2); return Promise.resolve({ envoyes: 1 }); },
      pairs: () => Promise.resolve([...tuyaux.keys()].filter(k => k !== moi)), surPair: (f) => pair.add(f), surMessage: (f) => msg.add(f),
      _pair: (e) => { for (const f of pair) f(e); }, _msg: (e) => { for (const f of msg) f(e); } };
    return t; };
  const W = { setInterval: () => 0, clearInterval: () => {}, setTimeout: (f, ms) => setTimeout(f, Math.min(ms || 0, 5)), clearTimeout: (x) => clearTimeout(x), crypto: globalThis.crypto };
  const A = creerProche({ W, boxion: creerMemoire(), tuyau: tuyau(), Contexte: null, position: async () => ({ lat: 46.7785, lng: 6.6411, precision: 8 }) });
  const B = creerProche({ W: { ...W }, boxion: creerMemoire(), tuyau: tuyau(), Contexte: null });
  await A.demarrer({ nom: 'RS-4' }); await B.demarrer({ nom: 'RS-3' }); await attendre(300);
  assert.equal(await A.noterRencontres(), 0, 'pas allumé : rien'); assert.equal(A.rencontres().length, 0);
  A.garderNoeuds(true); await attendre(30);
  const n = await A.noterRencontres(); assert.equal(n, 1, 'RS-3, voisin direct');
  const r = A.rencontres()[0]; assert.equal(r.nom, 'RS-3'); assert.equal(r.lat, 46.7785);
  const C = W.jOSMaille.noeuds(); const rs3 = C.noeuds.find(x => x.nom === 'RS-3'); assert.ok(rs3 && rs3.zone && rs3.zone.rayon >= 15);
  await A.arreter(); await B.arreter();
});
