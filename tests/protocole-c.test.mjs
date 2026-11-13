// 🌐 (0.99.42) le C de référence (ref/c) : son en-tête de vecteurs est à jour, et quand un compilateur C est là, il passe ses tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enteteC, CHEMIN_H } from '../tools/protocole/vecteurs-c.mjs';

const REF = fileURLToPath(new URL('../ref/c/', import.meta.url));
const cc = ['cc', 'gcc', 'clang'].find(c => spawnSync(c, ['--version']).status === 0);

test('🌐 ref/c/test/vecteurs.h correspond aux vecteurs publiés (node tools/protocole/vecteurs-c.mjs)', () => {
  assert.equal(readFileSync(CHEMIN_H, 'utf8'), enteteC());
});

test('🌐 le C de référence passe ses tests contre les vecteurs', { skip: cc ? false : 'pas de compilateur C ici' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'maille-c-')), bin = join(dir, 'maille-test');
  try {
    execFileSync(cc, ['-std=c99', '-Wall', '-Wextra', '-pedantic', '-Werror', '-O2', '-I', REF, join(REF, 'maille.c'), join(REF, 'test', 'test.c'), '-o', bin], { stdio: 'pipe' });
    const sortie = execFileSync(bin, { encoding: 'utf8' });
    assert.match(sortie, /(\d+)\/\1 vérifications au vert/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
