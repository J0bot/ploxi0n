#!/usr/bin/env node
// tools/spm-capacitor8.mjs (postinstall) — un plugin écrit pour Capacitor 7 déclare capacitor-swift-pm « from: 7.0.0 » (= < 8.0.0) :
// avec l'app en Capacitor 8 (exact 8.x), SPM refuserait de résoudre. On aligne ces bornes sur 8 (le code des plugins compile tel quel ;
// la CI le vérifie). Aujourd'hui : @capacitor-community/apple-sign-in (Sign in with Apple, 12.10.2026). Idempotent.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const PLUGINS = ['@capacitor-community/apple-sign-in'];
for (const p of PLUGINS) {
  const f = path.join('node_modules', p, 'Package.swift');
  if (!existsSync(f)) continue;
  const s = readFileSync(f, 'utf8'), t = s.replace(/(capacitor-swift-pm\.git",\s*from:\s*")7\.[0-9.]+(")/, '$18.0.0$2');
  if (t !== s) { writeFileSync(f, t); console.log('spm-capacitor8 : ' + p + ' → capacitor-swift-pm 8'); }
}
