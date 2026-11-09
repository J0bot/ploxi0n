// ⧗ LES TSOINS DU NEXUS : LES COMMITS (0.97). RS-7 (23.10) : « les tsoins du nexus, c'est les commits » ; « voir les paliers d'existence, d'où
// on vient, l'histoire, comment on a extrapolé depuis le début, le chemin qu'on a fait, toutes les idées qui s'ajoutent au fur et à mesure ».
// Écrit src/app/tsoins-nexus.js : chaque commit de ploxi0n (sa date, son sujet) ; les commits de version (« 0.xx : … ») sont les paliers
// d'existence (les ultra-tsoins). Seulement ce dépôt (il voyage dans l'app : rien d'un dépôt privé). À relancer à chaque version :
//   node tools/tsoins-nexus.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const brut = execFileSync('git', ['log', '--format=%at%x1f%s', '--no-merges'], { encoding: 'utf8' });
const l = brut.trim().split('\n').map(x => x.split('\x1f')).filter(([t, s]) => t && s)
  .map(([t, s]) => [+t * 1000, s.replace(/\s*\[(skip ci|build)\]\s*/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)]);
writeFileSync('src/app/tsoins-nexus.js', '// ⧗ LES TSOINS DU NEXUS : les commits de ploxi0n (écrit par tools/tsoins-nexus.mjs, ne pas éditer à la main). [date (ms), sujet], le plus récent d\'abord.\n'
  + 'export const COMMITS = ' + JSON.stringify(l).replace(/\],\[/g, '],\n  [') + ';\n'
  + '/** les paliers d\'existence (les ultra-tsoins) : les commits de version, « 0.xx : … » */\nexport const PALIERS_EXISTENCE = COMMITS.filter(([, s]) => /^(ploxi0n )?0\\.\\d+(\\.\\d+)? ?:/.test(s));\n');
console.log(l.length + ' commits');
