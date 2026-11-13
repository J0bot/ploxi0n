// ◇ (0.99.56) jOSGlyphe servi seul, pour le labo et le xer : src/bions/glyphe-seed.js enveloppé en un script sans import → window.jOSGlyphe.
// node tools/bion-glyphe.mjs écrit public/bions/jOSGlyphe.js ; tests/glyphe-seed.test.mjs vérifie qu'il est à jour (une seule source).
import { readFileSync, writeFileSync } from 'node:fs';
export function envelopper(src) {
  const corps = src.replace(/^export (const|function) /gm, '$1 ');
  const noms = [...src.matchAll(/^export (?:const|function) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
  return '/* jOSGlyphe — généré depuis ploxi0n src/bions/glyphe-seed.js par tools/bion-glyphe.mjs : ne pas modifier à la main. */\n'
    + '(function () {\n  \'use strict\';\n  if (typeof window !== \'undefined\' && window.jOSGlyphe) return;\n'
    + corps.split('\n').map(l => (l ? '  ' + l : l)).join('\n')
    + '\n  var api = { ' + noms.map(n => n + ': ' + n).join(', ') + ' };\n'
    + '  if (typeof window !== \'undefined\') window.jOSGlyphe = api;\n  if (typeof module !== \'undefined\' && module.exports) module.exports = api;\n})();\n';
}
if (process.argv[1] && process.argv[1].endsWith('bion-glyphe.mjs')) {
  const src = readFileSync(new URL('../src/bions/glyphe-seed.js', import.meta.url), 'utf8');
  writeFileSync(new URL('../public/bions/jOSGlyphe.js', import.meta.url), envelopper(src));
  console.log('public/bions/jOSGlyphe.js écrit');
}
