// Le niveau « mount/unmount » et « offline » de la pyramide (brief v1) pour CHAQUE ploxion embarqué (public/ploxions/index.json) :
// mode avion → monter → interagir → démonter → rien ne reste (intervalles, rAF, écouteurs window/document, blobs) et aucune requête sortante.
// Le droit au silence n'est plus sur l'honneur : il est mesuré.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { page, attendre, RACINE } from './aide.mjs';

const index = JSON.parse(readFileSync(path.join(RACINE, 'public/ploxions/index.json'), 'utf8')).ploxions;

test('au moins un ploxion embarqué (l\'app est utile au premier lancement en mode avion)', () => {
  assert.ok(index.length >= 1, 'public/ploxions/index.json est vide : lancer npm run extraire');
});

for (const px of index) {
  test(`${px.icone} ${px.id} : monte, vit, se démonte en silence, sans réseau`, async () => {
    const p = await page({ avion: true, ploxions: [px.id] });
    try {
      assert.ok(p.w.jOSApps[px.id], 'le bundle s\'enregistre dans jOSApps');
      const avant = p.compte.photo();
      assert.equal(await p.routeur.ouvrir(px.id), true);
      await attendre(120);
      const hote = p.w.document.querySelector('.px-hote');
      assert.doesNotMatch(hote.textContent, /n'a pas pu s'ouvrir/);
      assert.ok(hote.innerHTML.length > 0, 'le ploxion rend quelque chose');
      const b = hote.querySelector('button, [role=button]'); if (b) b.click();
      await attendre(120);
      p.routeur.accueil();
      await attendre(1500);
      const apres = p.compte.photo();
      for (const k of ['interval', 'raf', 'ecoute', 'blob']) assert.equal(apres[k] - avant[k], 0, `droit au silence : ${k} restant après l'unmount`);
      assert.deepEqual(p.tentatives, [], 'aucune requête sortante en mode avion');
      assert.deepEqual(p.erreurs, [], 'aucune erreur');
    } finally { p.w.close(); }
  });
}
