// ◇ (0.99.59) LA BANQUE D'EMOJI : compte les emoji d'un dossier (les ploxions du labo : resources/views/ploxions, resources/data) et ce que le
// dictionnaire de ploxi0n (src/app/glyphes.js, DEPUIS_EMOJI) couvre déjà ; écrit la liste triée (les plus fréquents d'abord).
//   node tools/compter-emoji.mjs <dossier> docs/banque-emoji/labo.json
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { nomDepuisEmoji } from '../src/app/glyphes.js';
const [dir, sortie] = process.argv.slice(2);
if (!dir || !sortie) { console.error('node tools/compter-emoji.mjs <dossier> <sortie.json>'); process.exit(1); }
const RE = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*/gu;
const compte = new Map(), ou = new Map();
const cle = (e) => e.replace(/️/g, '');   // ⚠ et ⚠️ : le même
function marcher(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n), s = statSync(p);
    if (s.isDirectory()) { marcher(p); continue; }
    if (!/\.(php|js|json|html|css|md)$/.test(n) || s.size > 3e6) continue;
    for (const m of readFileSync(p, 'utf8').matchAll(RE)) {
      const e = cle(m[0]); compte.set(e, (compte.get(e) || 0) + 1);
      if (!ou.has(e)) ou.set(e, new Set()); ou.get(e).add((p.split('/ploxions/')[1] || n).split('/')[0]);
    }
  }
}
marcher(dir);
const l = [...compte].sort((a, b) => b[1] - a[1]).map(([e, n]) => ({ e, n, glyphe: nomDepuisEmoji(e), ploxions: [...ou.get(e)].slice(0, 8) }));
const tot = l.reduce((a, x) => a + x.n, 0), cov = l.filter(x => x.glyphe).reduce((a, x) => a + x.n, 0);
console.log(l.length + ' emoji distincts · ' + tot + ' occurrences · ' + l.filter(x => x.glyphe).length + ' déjà un glyphe (' + Math.round(100 * cov / Math.max(1, tot)) + ' % des occurrences)');
writeFileSync(sortie, JSON.stringify(l, null, 1) + '\n');
