// ❄ LE GEL DES PLOXIONS CACHÉS (0.53, RS-7 : « l'app lag de malade, pas snappy »). Un ploxion minimisé, ou sous un autre, reste monté
// (c'est voulu : on le reprend tel quel) — mais ses animations tournaient encore à 60 images/s, invisibles : un jeu en arrière-plan prenait
// le processeur de tout le reste. requestAnimationFrame d'un ploxion vivant mais caché est mis de côté, et rendu dès qu'on le revoit.
// Qui appelle ? Le code d'un ploxion porte son nom dans la pile : « ploxi0n/<id>.js » (sourceURL du routeur) ou « /ploxions/<id>/app.js »
// (le pack). Lu une fois par fonction (une boucle de jeu redemande la même). Ni les minuteurs ni le son ne sont touchés : la musique continue.
const SOURCE = /ploxi0n\/([A-Za-z0-9_-]+)\.js|\/ploxions\/([A-Za-z0-9_-]+)\/app\.js/;

/** le ploxion qui a écrit cette pile d'appels (ou null : l'app, un bion de l'app) */
export function auteur(pile) { const m = SOURCE.exec(String(pile || '')); return m ? (m[1] || m[2]) : null; }

export function installerGel({ W = globalThis.window, courant = () => null, vivants = () => [] } = {}) {
  const raf = W.requestAnimationFrame && W.requestAnimationFrame.bind(W), caf = W.cancelAnimationFrame && W.cancelAnimationFrame.bind(W);
  if (!raf || W.requestAnimationFrame.__gel) return null;
  const proprio = new WeakMap(), geles = new Map(); let n = 0x40000000;
  function deQui(cb) {
    if (typeof cb === 'function' && proprio.has(cb)) return proprio.get(cb);
    const id = auteur(new Error().stack);
    if (typeof cb === 'function') proprio.set(cb, id);
    return id;
  }
  const cache = (id) => id && id !== courant() && vivants().includes(id);
  const nouveau = function requestAnimationFrame(cb) {
    const id = deQui(cb);
    if (cache(id)) { const k = ++n; geles.set(k, { id, cb }); return k; }
    return raf(cb);
  };
  nouveau.__gel = true;
  W.requestAnimationFrame = nouveau;
  // (0.69) LE SON WEB AUDIO d'un ploxion : qui a créé l'AudioContext (sa pile, une fois par contexte), et s'il joue encore — le sommeil des
  // cachés (routeur) n'endort jamais un ploxion qui fait du son, même sans <audio> ni <video>
  const sons = new Map();   // contexte → id du ploxion
  for (const nom of ['AudioContext', 'webkitAudioContext']) {
    const C = W[nom]; if (typeof C !== 'function' || C.__gel) continue;
    const E = function (...a) { const ctx = new C(...a); const id = auteur(new Error().stack); if (id) sons.set(ctx, id); return ctx; };
    E.prototype = C.prototype; E.__gel = true; W[nom] = E;
  }
  W.cancelAnimationFrame = function cancelAnimationFrame(k) { if (geles.has(k)) { geles.delete(k); return; } return caf(k); };
  return {
    /** le ploxion revient devant : ses images reprennent */
    degeler(id) { for (const [k, g] of geles) if (g.id === id) { geles.delete(k); raf(g.cb); } },
    /** le ploxion est fermé : ses images en attente partent avec lui */
    liberer(id) { for (const [k, g] of geles) if (g.id === id) geles.delete(k); },
    enAttente: () => geles.size,
    /** ce ploxion fait-il du son (Web Audio qui tourne) ? */
    aDuSon(id) { for (const [ctx, x] of sons) { if (ctx.state === 'closed') { sons.delete(ctx); continue; } if (x === id && ctx.state === 'running') return true; } return false; },
  };
}
