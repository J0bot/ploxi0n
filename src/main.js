// ploxi0n — le démarrage : boxion_local d'abord, puis le shim jOS (avant tout ploxion), puis le routeur.
// L'accueil = les ploxions intégrés (banc, marketplace, mon xer en ligne) + ceux que la personne a installés (marketplace).
import { ouvrirBoxionLocal } from './boxion-local/index.js';
import { installerShim } from './shim/jos.js';
import { creerRouteur } from './app/routeur.js';
import { enregistrerBanc } from './banc/banc.js';
import { creerVerrou } from './natif/verrou.js';
import { creerDepot, creerHttp } from './marketplace/depot.js';
import { enregistrerMarketplace } from './marketplace/marketplace.js';
import { enregistrerXerEnLigne } from './app/xer-en-ligne.js';
import { brancherLiens } from './natif/liens.js';

const VERSION = '0.4.0';

async function demarrer() {
  const racine = document.getElementById('ploxi0n');
  const boxion = await ouvrirBoxionLocal();
  let routeur = null;
  const routeurProxy = { ouvrir: (...a) => routeur.ouvrir(...a), connait: (id) => routeur.connait(id), fermer: () => routeur.fermer() };
  const shim = await installerShim({ boxion, routeur: routeurProxy });
  window.jOSVerrou = creerVerrou();   // Face ID pour les ploxions
  const lireJson = async (u, defaut) => { try { return await (await fetch(u)).json(); } catch (e) { return defaut; } };
  const pack = (await lireJson('/ploxions/index.json', { ploxions: [] })).ploxions || [];
  const compat = await lireJson('/marketplace/compat.json', {});
  const depot = creerDepot({ boxion, http: creerHttp(window), compat, packLocal: pack, lireLocal: async (id) => (await fetch('/ploxions/' + encodeURIComponent(id) + '/app.js')).text() });
  const internes = [
    enregistrerMarketplace({ depot, surChangement: () => majAccueil() }),
    enregistrerXerEnLigne({}),
    enregistrerBanc({ boxion, version: VERSION }),
  ];
  async function majAccueil() {
    const installes = await depot.installes();
    routeur.majCatalogue([...installes.map(p => ({ id: p.id, nom: p.nom, icone: p.icone })), ...internes]);
  }
  routeur = creerRouteur({ racine, catalogue: internes, boxion, verrou: window.jOSVerrou, bundleLocal: (id) => depot.bundle(id) });
  await majAccueil();
  window.ploxi0n = { boxion, shim, routeur, depot, version: VERSION };
  brancherLiens({ routeur });
  const id = decodeURIComponent((location.hash.match(/^#\/(.+)$/) || [])[1] || '');
  if (id && routeur.connait(id)) routeur.ouvrir(id); else routeur.accueil();
}
demarrer().catch((e) => { document.getElementById('ploxi0n').innerHTML = '<p class="px-erreur">ploxi0n n\'a pas pu démarrer : ' + String(e && e.message).replace(/[<&]/g, '') + '</p>'; });
