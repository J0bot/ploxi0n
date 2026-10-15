// Le côté app des RACCOURCIS AUTOMATIQUES (ios/App/App/Raccourcis.swift, App Intents) : ils se parlent par les Préférences de Capacitor.
//   publier(liste)   la liste des ploxions installés → « Ouvrir un ploxion » la propose dans Raccourcis et à Siri
//   recevoir()       au lancement et à chaque retour au premier plan : ouvre le ploxion demandé, verse les tsoins notés par raccourci,
//                    « Envoyer à un ploxion » (l'ouvre, puis jOSPorts.emit(id, port, texte)), « Chercher un ploxion » (le marketplace)
//   valeur(cle, titre, valeur)  une valeur pour « Lire une valeur de ploxi0n » (et les widgets) ; les ploxions : jOSRaccourcis.publierValeur
import { surPromesse } from './plugin-sur.js';
import { glyphePloxion } from '../app/glyphes.js';

// (0.72) LE GLYPHE D'UN PLOXION POUR LES WIDGETS (RS-7 : « les widgets ne sont pas encore corrects ») : le widget « épinglés » montrait les
// emoji ; il montre maintenant le trait du xerboxion (glyphePloxion, src/app/glyphes.js), rendu ici en PNG 96×96 blanc (le widget le teinte).
// Les règles du trait (app.css « .px-g ») sont mises dans le SVG pour qu'il se dessine seul ; 1,5 s au plus, sinon pas de glyphe (le repli).
const TRAIT = '<style>*{fill:none;stroke:#fff;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.f{fill:#fff;stroke:none}.p{stroke-dasharray:7 7;stroke-width:4.5}</style>';
const glyphesPng = new Map();
export function glyphePng(W, p) {
  if (glyphesPng.has(p.id)) return glyphesPng.get(p.id);
  const svg = glyphePloxion(p).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" ').replace(/<\/svg>$/, TRAIT + '</svg>');
  const pr = new Promise((ok) => {
    let fini = false; const fin = (v) => { if (!fini) { fini = true; ok(v); } };
    setTimeout(() => fin(null), 1500);
    try {
      const im = new W.Image();
      im.onload = () => { try { const c = W.document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 96, 96); fin(c.toDataURL('image/png').split(',')[1] || null); } catch (e) { fin(null); } };
      im.onerror = () => fin(null);
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (e) { fin(null); }
  });
  glyphesPng.set(p.id, pr); return pr;
}
export function creerRaccourcis({ W = globalThis.window, routeur, boxion, commande = null, charger = () => import('@capacitor/preferences') } = {}) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function P() { return surPromesse((await charger()).Preferences); }
  const valeurs = {};
  boxion.get('reglages', 'valeurs').then(v => { if (v && typeof v === 'object') Object.assign(valeurs, v); }).catch(() => {});
  return {
    async publier(liste) {
      if (!natif()) return;
      await (await P()).set({ key: 'ploxi0n.ploxions', value: JSON.stringify(liste.filter(p => !p.interne).map(p => ({ id: p.id, nom: p.nom, icone: p.icone }))) });
    },
    async recevoir() {
      if (!natif()) return;
      const Pr = await P();
      const t = (await Pr.get({ key: 'ploxi0n.tsoins-en-attente' })).value;
      if (t) {
        await Pr.remove({ key: 'ploxi0n.tsoins-en-attente' });
        try { for (const e of JSON.parse(t)) await boxion.append('tsoins', { kind: 'action', k: e.k || 'raccourci', d: String(e.d || '').slice(0, 500), noteLe: e.t || null, source: 'raccourci' }); } catch (er) { /* illisible : perdu, mais jamais bloquant */ }
      }
      const id = (await Pr.get({ key: 'ploxi0n.ouvrir' })).value;
      if (id) { await Pr.remove({ key: 'ploxi0n.ouvrir' }); if (routeur.connait(id)) await routeur.ouvrir(id); }
      const env = (await Pr.get({ key: 'ploxi0n.envoyer' })).value;
      if (env) {
        await Pr.remove({ key: 'ploxi0n.envoyer' });
        try {
          const m = JSON.parse(env), port = String(m.port || 'cmd').slice(0, 60), payload = String(m.payload == null ? '' : m.payload).slice(0, 4000);
          if (routeur.connait(m.id)) { await routeur.ouvrir(m.id, { port, payload, texte: payload, depuis: 'raccourci' }); if (W.jOSPorts) W.jOSPorts.emit(m.id, port, payload); }
          await boxion.append('tsoins', { kind: 'action', k: 'raccourci-envoyer', d: m.id + '.' + port, source: 'raccourci' });
        } catch (er) { /* illisible : ignoré */ }
      }
      const cmd = (await Pr.get({ key: 'ploxi0n.commande' })).value;
      if (cmd) { await Pr.remove({ key: 'ploxi0n.commande' }); if (commande) await commande(cmd); }
      const q = (await Pr.get({ key: 'ploxi0n.chercher' })).value;
      if (q) { await Pr.remove({ key: 'ploxi0n.chercher' }); if (routeur.connait('marketplace')) await routeur.ouvrir('marketplace', { chercher: '1', q: q.trim() }); }
    },
    /** les ploxions épinglés du HUD → le widget « Ploxions épinglés » */
    async epingles(liste) {
      if (!natif()) return;
      const l = await Promise.all(liste.slice(0, 8).map(async p => { const g64 = await glyphePng(W, p).catch(() => null); return g64 ? { id: p.id, nom: p.nom, icone: p.icone, g64 } : { id: p.id, nom: p.nom, icone: p.icone }; }));
      await (await P()).set({ key: 'ploxi0n.epingles', value: JSON.stringify(l) });
    },
    /** toutes les valeurs publiées (celles de l'app et des ploxions) : le cube des widgets s'y sert (0.48) */
    toutes: () => ({ ...valeurs }),
    async valeur(cle, titre, valeur) {
      cle = String(cle || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 60); if (!cle) return;
      valeurs[cle] = { titre: String(titre || cle).slice(0, 80), valeur: String(valeur == null ? '' : valeur).slice(0, 500), le: Date.now() };
      await boxion.put('reglages', 'valeurs', valeurs).catch(() => {});
      if (natif()) await (await P()).set({ key: 'ploxi0n.valeurs', value: JSON.stringify(valeurs) });
    },
  };
}
