// ✕ (20.11, RS-7 #2127 : « le logo de base de l'application ploxi0n = le logo du xeroction ») l'icône de l'app : le catalogue garde sa forme
// (une image de base, une sombre, une teintée, 1024 × 1024) ; l'image de base n'a PAS de canal alpha (l'App Store la refuse sinon) ;
// le logo source (le SVG de RS-7) est dans le dépôt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const DOSSIER = new URL('../ios/App/App/Assets.xcassets/AppIcon.appiconset/', import.meta.url);
const entete = (nom) => { const b = readFileSync(new URL(nom, DOSSIER)); return { png: b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), l: b.readUInt32BE(16), h: b.readUInt32BE(20), profondeur: b[24], type: b[25] }; };

test('✕ l\'icône de l\'app : trois images 1024 × 1024, la base opaque (RGB sans alpha), les variantes sombre et teintée', () => {
  const c = JSON.parse(readFileSync(new URL('Contents.json', DOSSIER), 'utf8'));
  const parAspect = Object.fromEntries(c.images.map(im => [(im.appearances && im.appearances[0] && im.appearances[0].value) || 'base', im]));
  assert.deepEqual(Object.keys(parAspect).sort(), ['base', 'dark', 'tinted']);
  for (const im of c.images) {
    const e = entete(im.filename);
    assert.ok(e.png, im.filename + ' est un PNG');
    assert.equal(im.size, '1024x1024'); assert.equal(e.l + 'x' + e.h, im.size, im.filename + ' a la taille déclarée');
    assert.equal(e.profondeur, 8);
  }
  assert.equal(entete(parAspect.base.filename).type, 2, 'la base : RGB sans canal alpha');
  for (const k of ['dark', 'tinted']) assert.ok([2, 6].includes(entete(parAspect[k].filename).type), k + ' : RGB ou RGBA');
});

test('✕ le logo du xeroction (le SVG de RS-7) est dans le dépôt', () => {
  const svg = new URL('../docs/look/xeroction.svg', import.meta.url);
  assert.ok(existsSync(svg));
  assert.match(readFileSync(svg, 'utf8'), /viewBox="0 0 126 120"/);
});
