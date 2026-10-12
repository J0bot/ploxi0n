// Le côté app des RACCOURCIS AUTOMATIQUES (ios/App/App/Raccourcis.swift, App Intents) : ils se parlent par les Préférences de Capacitor.
//   publier(liste)   la liste des ploxions installés → « Ouvrir un ploxion » la propose dans Raccourcis et à Siri
//   recevoir()       au lancement et à chaque retour au premier plan : ouvre le ploxion demandé, verse les tsoins notés par raccourci,
//                    « Envoyer à un ploxion » (l'ouvre, puis jOSPorts.emit(id, port, texte)), « Chercher un ploxion » (le marketplace)
//   valeur(cle, titre, valeur)  une valeur pour « Lire une valeur de ploxi0n » (et les widgets) ; les ploxions : jOSRaccourcis.publierValeur
import { surPromesse } from './plugin-sur.js';
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
      if (natif()) await (await P()).set({ key: 'ploxi0n.epingles', value: JSON.stringify(liste.slice(0, 8).map(p => ({ id: p.id, nom: p.nom, icone: p.icone }))) });
    },
    async valeur(cle, titre, valeur) {
      cle = String(cle || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 60); if (!cle) return;
      valeurs[cle] = { titre: String(titre || cle).slice(0, 80), valeur: String(valeur == null ? '' : valeur).slice(0, 500), le: Date.now() };
      await boxion.put('reglages', 'valeurs', valeurs).catch(() => {});
      if (natif()) await (await P()).set({ key: 'ploxi0n.valeurs', value: JSON.stringify(valeurs) });
    },
  };
}
