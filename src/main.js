// ploxi0n — le démarrage : boxion_local d'abord, puis le shim jOS (avant tout ploxion), puis le routeur.
// L'accueil = les ploxions intégrés (banc, marketplace, mon xer en ligne) + ceux que la personne a installés (marketplace).
import { ouvrirBoxionLocal } from './boxion-local/index.js';
import { installerShim } from './shim/jos.js';
import { creerRouteur } from './app/routeur.js';
import { enregistrerBanc } from './banc/banc.js';
import { creerVerrou } from './natif/verrou.js';
import { creerDepot, creerHttp, SOURCE } from './marketplace/depot.js';
import { enregistrerMarketplace } from './marketplace/marketplace.js';
import { enregistrerXerEnLigne } from './app/xer-en-ligne.js';
import { brancherLiens } from './natif/liens.js';
import { creerRaccourcis } from './natif/raccourcis.js';
import { creerCompte } from './natif/compte.js';
import { creerHud } from './app/hud.js';

const VERSION = '0.8.0';

async function demarrer() {
  const racine = document.getElementById('ploxi0n');
  const boxion = await ouvrirBoxionLocal();
  let routeur = null;
  // un ploxion en ouvre un autre (jOSXerPrefs.ouvrir, jOS.openPloxion) : s'il n'est pas installé et qu'il y a du réseau, on l'installe à la volée
  const routeurProxy = {
    async ouvrir(id, params) {
      if (!routeur.connait(id)) {
        try { const c = await depot.catalogue({ reseau: false }); const m = (c.items || []).find(x => x.id === id) || {}; await depot.installer(id, { nom: m.nom, icone: m.icone }); await majAccueil(); }
        catch (e) { return false; }
      }
      return routeur.ouvrir(id, params);
    },
    connait: (id) => routeur.connait(id), fermer: () => routeur.fermer(),
  };
  // le relais : les routes du labo qui ont une version API sans session partent sur xerboxion.org (bother me, le ploxion des testeurs)
  const fetchOrigine = window.fetch.bind(window), httpRelais = creerHttp(window);
  const relais = { routes: [{ prefixe: '/bother', vers: (p) => SOURCE + '/api/app' + p }], envoyer: (q) => httpRelais.requete(q, fetchOrigine) };
  const shim = await installerShim({ boxion, routeur: routeurProxy, relais });
  window.jOSVerrou = creerVerrou();   // Face ID pour les ploxions
  const lireJson = async (u, defaut) => { try { return await (await fetch(u)).json(); } catch (e) { return defaut; } };
  const indexPack = await lireJson('/ploxions/index.json', { ploxions: [] }), pack = indexPack.ploxions || [];
  const compat = await lireJson('/marketplace/compat.json', {});
  const depot = creerDepot({ boxion, http: creerHttp(window), compat, packLocal: pack, lireLocal: async (id) => (await fetch('/ploxions/' + encodeURIComponent(id) + '/app.js')).text(),
    lireBionLocal: async (b) => { const r = await fetch('/bions/' + encodeURIComponent(b) + '.js'); if (!r.ok) throw new Error('bion absent'); return r.text(); } });
  // les ploxions de base (index.json « base » : bother me pour les testeurs) : installés une fois, au premier lancement ; retirables ensuite
  const deja = (await boxion.get('reglages', 'base-installes')) || [];
  for (const id of (indexPack.base || []).filter(b => !deja.includes(b))) {
    try { await depot.installerLocal(id); deja.push(id); } catch (e) { console.warn('ploxion de base', id, e); }
  }
  await boxion.put('reglages', 'base-installes', deja);
  const internes = [
    enregistrerMarketplace({ depot, surChangement: () => majAccueil(), usage: () => boxion.get('usage', 'stats') }),
    enregistrerXerEnLigne({}),
    enregistrerBanc({ boxion, version: VERSION }),
  ];
  let raccourcis = null;
  async function majAccueil() {
    const installes = await depot.installes();
    const liste = [...installes.map(p => ({ id: p.id, nom: p.nom, icone: p.icone })), ...internes];
    routeur.majCatalogue(liste);
    if (raccourcis) raccourcis.publier(liste).catch(() => {});   // l'app Raccourcis et Siri proposent les ploxions installés
  }
  const compte = creerCompte({ boxion, http: creerHttp(window) });
  await compte.pret;
  const hud = creerHud({ compte });
  // le vecteur xerion de ce téléphone : le temps passé par ploxion (même forme que jOSUsage du labo : { px: { id: { opens, seconds, lastAt } } })
  async function surUsage(id, sec) {
    const u = (await boxion.get('usage', 'stats')) || { px: {} };
    const p = u.px[id] = u.px[id] || { opens: 0, seconds: 0, lastAt: 0 };
    p.opens++; p.seconds += sec; p.lastAt = Date.now();
    await boxion.put('usage', 'stats', u);
  }
  routeur = creerRouteur({ racine, catalogue: internes, boxion, verrou: window.jOSVerrou, bundleLocal: (id) => depot.bundle(id), hud, surUsage: (id, s) => surUsage(id, s).catch(() => {}) });
  compte.surChangement(() => { if (routeur.courant()) routeur.rafraichirHud(); else routeur.accueil(); });
  await majAccueil();
  // jOSApps.monter / peut, comme dans le labo : un ploxion en monte un autre dans un coin (fill the gaps, les « ultimate »). Démontable.
  window.jOSApps.peut = (id) => routeur.connait(id);
  window.jOSApps.monter = (id, hote, ctx) => {
    let inst = null, mort = false;
    const pret = routeur.charger(id).then(app => { if (mort) return null; inst = app.mount(hote, ctx || { embed: true }) || null; return inst; })
      .catch(e => { if (hote) hote.textContent = '⚠ « ' + id + ' » indisponible : ' + (e && e.message); });
    return { ready: pret, unmount() { mort = true; if (inst && inst.unmount) { try { inst.unmount(); } catch (e) { /* */ } } inst = null; } };
  };
  window.ploxi0n = { boxion, shim, routeur, depot, compte, version: VERSION };
  brancherLiens({ routeur, compte });
  raccourcis = creerRaccourcis({ routeur, boxion });
  await majAccueil();
  const id = decodeURIComponent((location.hash.match(/^#\/(.+)$/) || [])[1] || '');
  if (id && routeur.connait(id)) routeur.ouvrir(id); else routeur.accueil();
  // un raccourci (Siri, l'app Raccourcis, une automatisation) a pu demander un ploxion ou noter un tsoin
  raccourcis.recevoir().catch(() => {});
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (e) => { if (e.isActive) raccourcis.recevoir().catch(() => {}); })).catch(() => {});
  }
}
demarrer().catch((e) => { document.getElementById('ploxi0n').innerHTML = '<p class="px-erreur">ploxi0n n\'a pas pu démarrer : ' + String(e && e.message).replace(/[<&]/g, '') + '</p>'; });
