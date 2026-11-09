// 🦀 (0.99.17) le cœur Rust (rust/ploxi-coeur → public/coeur/ploxi_coeur.wasm) rend exactement ce que rendent les bions JS (tools/rust-golden.mjs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { golden } from '../tools/rust-golden.mjs';

test('🦀 le cœur Rust = les bions JS (proche, autour, dire)', { skip: !existsSync('public/coeur/ploxi_coeur.wasm') && 'pas de WASM' }, async () => {
  const r = await golden(undefined, { n: 120 });
  assert.ok(r.cas > 2000, r.cas + ' cas');
  assert.deepEqual(r.ecarts, []);
});
