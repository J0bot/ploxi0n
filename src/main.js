// ploxi0n — le démarrage : boxion_local d'abord, puis le shim jOS (avant tout ploxion), puis le routeur.
import { ouvrirBoxionLocal } from './boxion-local/index.js';
import { installerShim } from './shim/jos.js';
import { creerRouteur } from './app/routeur.js';
import { enregistrerBanc } from './banc/banc.js';

const VERSION = '0.3.0';

async function demarrer() {
  const racine = document.getElementById('ploxi0n');
  const boxion = await ouvrirBoxionLocal();
  const routeurProxy = { ouvrir: (...a) => routeur.ouvrir(...a), connait: (id) => routeur.connait(id), fermer: () => routeur.fermer() };
  const shim = await installerShim({ boxion, routeur: routeurProxy });
  let catalogue = [];
  try { catalogue = (await (await fetch('/ploxions/index.json')).json()).ploxions || []; } catch (e) { /* aucun ploxion embarqué */ }
  catalogue = [enregistrerBanc({ boxion, version: VERSION }), ...catalogue];   // 🧪 le banc iPhone, intégré à l'app
  const routeur = creerRouteur({ racine, catalogue });
  window.ploxi0n = { boxion, shim, routeur, version: VERSION };
  const id = decodeURIComponent((location.hash.match(/^#\/(.+)$/) || [])[1] || '');
  if (id && routeur.connait(id)) routeur.ouvrir(id); else routeur.accueil();
}
demarrer().catch((e) => { document.getElementById('ploxi0n').innerHTML = '<p class="px-erreur">ploxi0n n\'a pas pu démarrer : ' + String(e && e.message).replace(/[<&]/g, '') + '</p>'; });
