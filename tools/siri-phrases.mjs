// 🗣 (0.99.44) les phrases Siri en français : ios/App/App/fr.lproj/AppShortcuts.strings, depuis les phrases de Raccourcis.swift (la langue de
// base du projet est l'anglais : sans ce fichier, un Siri en français ne connaît pas les raccourcis de ploxi0n). Une phrase déjà française
// reste telle quelle ; une anglaise reçoit sa traduction (TRAD). node tools/siri-phrases.mjs [--verifier]
import { readFileSync, writeFileSync } from 'node:fs';
const RACINE = new URL('../', import.meta.url);
const TRAD = {
  'Open ${ploxion} in ${applicationName}': 'Ouvre ${ploxion} dans ${applicationName}', 'Open ${ploxion} with ${applicationName}': 'Ouvre ${ploxion} avec ${applicationName}',
  'Launch ${ploxion} in ${applicationName}': 'Lance ${ploxion} dans ${applicationName}', 'Open the ploxion ${ploxion} in ${applicationName}': 'Ouvre le ploxion ${ploxion} dans ${applicationName}',
  'Open the ${ploxion} ploxion in ${applicationName}': 'Ouvre le ploxion ${ploxion} sur ${applicationName}', 'Show ${ploxion} in ${applicationName}': 'Montre ${ploxion} dans ${applicationName}',
  'Go to ${ploxion} in ${applicationName}': 'Va sur ${ploxion} dans ${applicationName}', '${applicationName} open ${ploxion}': '${applicationName} lance ${ploxion}', '${applicationName} ${ploxion}': '${applicationName} ${ploxion}',
  'Note a tsoin in ${applicationName}': 'Note un tsoin sur ${applicationName}', 'New tsoin in ${applicationName}': 'Nouveau tsoin dans ${applicationName}', 'Add a tsoin to ${applicationName}': 'Ajoute un tsoin à ${applicationName}',
  'Tell ${applicationName}': 'Dis à ${applicationName}', 'Ask ${applicationName}': 'Demande à ${applicationName}', 'Talk to ${applicationName}': 'Parle à ${applicationName}', 'Hey ${applicationName}': 'Hé ${applicationName}',
  'Read a value from ${applicationName}': 'Lis une valeur de ${applicationName}', 'What does ${applicationName} say': 'Que dit ${applicationName}',
  'Search ${applicationName}': 'Cherche dans ${applicationName}', 'Find a ploxion in ${applicationName}': 'Trouve un ploxion dans ${applicationName}', 'Open ${applicationName}': 'Ouvre ${applicationName}',
};
export function phrases(swift) {
  const out = [];
  for (const m of swift.matchAll(/phrases:\s*\[([\s\S]*?)\]\s*,\s*\n?\s*shortTitle/g)) for (const p of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)) out.push(p[1].replace(/\\\(\.applicationName\)/g, '${applicationName}').replace(/\\\(\\\.\$(\w+)\)/g, '${$1}'));
  return [...new Set(out)];
}
const FRANCAIS = /^(Ouvre|Note un|Dis à|Demande à|Lis une|Que dit|Cherche un|Va dans|\$\{applicationName\} (commande|ouvre))/;
export function fichier(swift) {
  const lignes = ['/* Généré par tools/siri-phrases.mjs depuis Raccourcis.swift : les phrases de Siri en français. */'];
  const manque = [];
  const vues = new Set();   // une phrase en double fait échouer la vérification des App Shortcuts au build : chaque phrase française une fois
  for (const p of phrases(swift)) { const f = FRANCAIS.test(p) ? p : TRAD[p]; if (!f) { manque.push(p); continue; } if (vues.has(f)) continue; vues.add(f); lignes.push('"' + p + '" = "' + f + '";'); }
  return { texte: lignes.join('\n') + '\n', manque };
}
if (process.argv[1] && process.argv[1].endsWith('siri-phrases.mjs')) {
  const { texte, manque } = fichier(readFileSync(new URL('ios/App/App/Raccourcis.swift', RACINE), 'utf8'));
  if (manque.length) { console.error('sans traduction :', manque); process.exit(1); }
  writeFileSync(new URL('ios/App/App/fr.lproj/AppShortcuts.strings', RACINE), texte); console.log('fr.lproj/AppShortcuts.strings :', texte.split('\n').length - 2, 'phrases');
}
