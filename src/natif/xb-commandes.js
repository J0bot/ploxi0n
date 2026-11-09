// ▸ (0.99.33) CE QUE LE LABO PEUT DEMANDER AU TÉLÉPHONE (l'agent xb, src/bions/xb-agent.js). Les noms et les arguments sont ceux du CLI xb (AGENT_CMDS)
// pour que le terminal xb du labo et ⬢ xeroction marchent tels quels (« ouvrir xion », « mode kiosque https://… », « notifier "…" »).
// Rien d'autre : pas de fichiers, pas de shell, pas d'installation à distance d'autre chose qu'un ploxion de TON labo qu'on ouvre (et ça se voit).
import { RX } from '../bions/xb-agent.js';

const PX = /^https?:\/\/(?:labo\.j0bot\.ch|xerboxion\.org)\/px\/([a-z0-9][a-z0-9-]{0,59})(?:\/(?:index\.html)?)?(?:[?#].*)?$/;
export const MODES = [['kiosque <url>', 'une page ou un ploxion en plein écran'], ['xer', 'l\'accueil du xer'], ['aucun', 'arrêter le mode en cours (l\'accueil)']];

/** ouvrir(id) · ouvrirLien(url) · plein(on) · accueil() · notifier(texte) · infos() → {…} · scanner(secondes) → [{nom, rssi, distance}] · etat() · signaler(texte) */
export function creerCommandesXb({ ouvrir, ouvrirLien, plein = () => {}, accueil, notifier, infos, scanner = null, etat = () => ({}), signaler = () => {} }) {
  const cible = async (c, ecrire) => {
    const m = PX.exec(c);
    if (m) { await ouvrir(m[1]); ecrire('✓ ' + m[1] + ' ouvert sur le téléphone\n'); return m[1]; }
    if (/^https?:\/\//.test(c)) { await ouvrirLien(c); ecrire('✓ ' + c + ' ouvert dans le navigateur du téléphone\n'); return c; }
    await ouvrir(c); ecrire('✓ ' + c + ' ouvert sur le téléphone\n'); return c;
  };
  return {
    sante: { args: [], async faire(a, ecrire) {
      const e = etat(); ecrire('▸ ploxi0n (agent xb)\n  état : ' + (e.statut || '?') + (e.compte ? ' · compte ' + e.compte : '') + '\n  commandes reçues : ' + (e.commandes || 0) + '\n');
      ecrire('  scanner Bluetooth : ' + (scanner ? 'oui' : 'non (pas sur ce téléphone)') + '\n'); return 0; } },
    infos: { args: [], async faire(a, ecrire) {
      const i = await infos(); for (const [k, v] of Object.entries(i)) if (v !== '' && v != null) ecrire(k.padEnd(12) + ' ' + v + '\n'); return 0; } },
    scanner: { args: [], async faire(a, ecrire) {
      if (!scanner) { ecrire('le scan Bluetooth n\'est pas compilé sur ce téléphone\n'); return 1; }
      ecrire('… 8 s d\'écoute Bluetooth\n');
      const l = await scanner(8);
      if (!l.length) ecrire('rien n\'émet autour\n');
      for (const x of l.slice(0, 40)) ecrire(String(x.rssi).padStart(4) + ' dBm  ' + (x.distance != null ? ('~' + x.distance + ' m').padEnd(8) : ''.padEnd(8)) + ' ' + (x.nom || '(sans nom)') + (x.fabricant ? ' · ' + x.fabricant : '') + '\n');
      return 0; } },
    notifier: { args: [RX.msg], async faire(a, ecrire) { await notifier(a[0] || 'xerboxion'); ecrire('✓ notifié\n'); return 0; } },
    ouvrir: { args: [RX.cible], async faire(a, ecrire) { const c = await cible(a[0] || 'accueil', ecrire); signaler('▸ le labo ouvre ' + c); return 0; } },
    mode: { args: [RX.mot, RX.url], async faire(a, ecrire) {
      const m = a[0] || '';
      if (!m) { ecrire('les modes du téléphone :\n'); for (const [k, d] of MODES) ecrire('  ' + k.padEnd(16) + d + '\n'); return 0; }
      if (m === 'kiosque') { if (!a[1]) { ecrire('mode kiosque <url>\n'); return 1; } const c = await cible(a[1], ecrire); plein(true); signaler('▸ mode kiosque : ' + c); return 0; }
      if (m === 'xer' || m === 'aucun') { plein(false); await accueil(); ecrire('✓ l\'accueil du xer\n'); return 0; }
      ecrire('mode inconnu sur le téléphone : ' + m + ' (xb mode pour la liste)\n'); return 1; } },
  };
}
