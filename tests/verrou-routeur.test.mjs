// 🔒 FACE ID (0.55, RS-7 : « un ploxion en Face ID… plus besoin de Face ID ») : déverrouillé pour la séance seulement. En arrière-plan tout se
// reverrouille ; un ploxion vivant mais verrouillé ne se remontre plus sans le visage (reprendre, la file d'à côté, la pile).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

test('Face ID : déverrouillé pour la séance, reverrouillé en arrière-plan, redemandé au retour, même pour un ploxion vivant', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    W.jOSApps = W.jOSApps || {};
    for (const id of ['a', 'b']) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
    await p.boxion.put('reglages', 'verrous', ['a']);
    let reponse = true; const demandes = [];
    const verrou = { ouvrir: async (raison) => { demandes.push(raison); return reponse; }, dispo: async () => ({ ok: true }), derniereErreur: () => null };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, boxion: p.boxion, verrou, catalogue: [{ id: 'a', nom: 'A', icone: '◇' }, { id: 'b', nom: 'B', icone: '◆' }] });
    await r.accueil();
    assert.equal(await r.ouvrir('a'), true); assert.equal(demandes.length, 1, 'le visage, une fois');
    await r.ouvrir('b'); await r.ouvrir('a');
    assert.equal(demandes.length, 1, 'dans la même séance, a se rouvre sans redemander');
    assert.equal(r.courant(), 'a');
    // l'app passe en arrière-plan : a (à l'écran) est caché tout de suite, l'écran du verrou le remplace
    assert.equal(r.reverrouiller(), 'a');
    assert.equal(r.courant(), null);
    assert.match(racine.textContent, /ne s'ouvre qu'avec ton visage/);
    assert.ok(racine.querySelector('.px-hote[data-ploxion="a"]').hidden, 'son contenu est caché (l\'aperçu du sélecteur d\'apps ne le montre pas)');
    // au retour, refusé : il reste fermé, toujours vivant
    reponse = false; assert.equal(await r.redemander('a'), false); assert.equal(demandes.length, 2);
    assert.equal(r.courant(), null); assert.ok(r.vivants().includes('a'));
    // la file d'à côté (le bord) ne le remontre pas sans visage non plus
    await r.ouvrir('b'); assert.equal(r.courant(), 'b');
    r.aCote(-1); await attendre(10);
    assert.equal(demandes.length, 3, 'le bord vers a redemande le visage');
    assert.notEqual(r.courant(), 'a');
    // accepté : a revient tel quel (vivant, pas remonté)
    reponse = true; assert.equal(await r.ouvrir('a'), true); assert.equal(r.courant(), 'a'); assert.equal(demandes.length, 4);
    assert.equal(racine.querySelector('.px-hote[data-ploxion="a"]').textContent, 'a', 'repris, pas remonté');
  } finally { p.fin(); }
});
