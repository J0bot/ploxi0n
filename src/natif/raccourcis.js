// Le côté app des RACCOURCIS AUTOMATIQUES (ios/App/App/Raccourcis.swift, App Intents) : ils se parlent par les Préférences de Capacitor.
//   publier(liste)   la liste des ploxions installés → « Ouvrir un ploxion » la propose dans Raccourcis et à Siri
//   recevoir()       au lancement et à chaque retour au premier plan : ouvre le ploxion demandé, verse les tsoins notés par raccourci
export function creerRaccourcis({ W = globalThis.window, routeur, boxion, charger = () => import('@capacitor/preferences') } = {}) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function P() { return (await charger()).Preferences; }
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
    },
  };
}
