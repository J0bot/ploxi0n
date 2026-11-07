// ▸ L'APPAREIL XB (0.99.33) : ce téléphone dans le labo, comme un Pi avec « xb agent ». Un ploxion interne qui compose jOSXb (src/bions/xb-agent.js) :
// appairer (un code à approuver sur le labo, une fois), allumer / éteindre, au démarrage ou non, ce que le labo peut demander, le journal.
// Le réglage (boxion_local « reglages/xb-agent ») : { appaire, auDemarrage, compte } ; le jeton, lui, est dans le trousseau.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STATUTS = { eteint: ['éteint', ''], connexion: ['connexion…', 'mi'], connecte: ['dans le labo', 'ok'], 'hors-ligne': ['hors ligne (il réessaie)', 'mi'], refuse: ['jeton refusé', 'ko'], appairage: ['appairage…', 'mi'] };
export const AIDE_CMDS = { sante: 'l\'état de l\'agent', infos: 'modèle, système, batterie, réseau', scanner: 'ce qui émet en Bluetooth autour (8 s)', notifier: 'une notification sur le téléphone', ouvrir: 'un ploxion (ou une page) sur le téléphone', mode: 'kiosque <url> : en plein écran ; xer : l\'accueil' };

export function creerAppareilXb({ W = globalThis.window, agent, boxion, vibrer = () => {} } = {}) {
  let reglage = { appaire: false, auDemarrage: false, compte: null };
  const pret = boxion.get('reglages', 'xb-agent').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'xb-agent', reglage).catch(() => {});
  /** au lancement de l'app : allumé tout seul seulement si la personne l'a voulu */
  async function auLancement() { await pret; if (reglage.appaire && reglage.auDemarrage) return agent.demarrer(); return false; }

  function mount(hote) {
    let vivant = true, annuler = false, msg = '';
    hote.innerHTML = '<div class="px-page px-xba"><p class="px-grave">▸ appareil xb</p><div data-xba></div></div>';
    const zone = hote.querySelector('[data-xba]');
    function peindre() {
      if (!vivant) return;
      const e = agent.etat(), s = STATUTS[e.statut] || [e.statut, ''], appaire = reglage.appaire || e.appaire;
      let h = '<div class="px-xba-etat px-xba-' + s[1] + '"><b>' + esc(s[0]) + '</b>' + (reglage.compte ? '<span>compte ' + esc(reglage.compte) + '</span>' : '') + (e.erreur ? '<span class="ko">' + esc(e.erreur) + '</span>' : '') + '</div>';
      if (e.appairage) {
        h += '<div class="px-xba-code"><small>sur le labo, vérifie ce code et approuve</small><b>' + esc(e.appairage.code) + '</b><button type="button" data-xba="lien">rouvrir la page d\'approbation</button><button type="button" data-xba="annuler">annuler</button></div>';
      } else if (!appaire) {
        h += '<p class="px-xba-txt">Ce téléphone devient un appareil de ton labo, comme un Pi avec « xb agent » : il apparaît dans ◈ appareils et dans le terminal xb, et le labo peut lui demander d\'ouvrir un ploxion, de passer en plein écran, de scanner le Bluetooth, de notifier. Il refuse tout le reste.</p>'
          + '<button type="button" class="px-gros" data-xba="appairer"><b>▸ appairer ce téléphone</b><small>un code à approuver sur le labo, une fois</small></button>';
      } else {
        h += '<div class="px-xba-b">' + (e.actif ? '<button type="button" data-xba="eteindre">■ éteindre l\'agent</button>' : '<button type="button" class="px-gros" data-xba="allumer"><b>▸ allumer l\'agent</b><small>le labo voit ce téléphone tant que l\'app est ouverte</small></button>')
          + '<label class="px-xba-l"><input type="checkbox" data-xba="demarrage"' + (reglage.auDemarrage ? ' checked' : '') + '> allumé au lancement de l\'app</label>'
          + '<button type="button" data-xba="oublier">oublier ce labo (le jeton)</button></div>';
      }
      if (msg) h += '<p class="px-xba-msg">' + esc(msg) + '</p>';
      h += '<h4 class="px-xba-h">ce que le labo peut lui demander</h4><ul class="px-xba-cmds">' + agent.cmds().map(c => '<li><code>xb ' + esc(c) + '</code> ' + esc(AIDE_CMDS[c] || '') + '</li>').join('') + '</ul>';
      const j = agent.journal();
      if (j.length) h += '<h4 class="px-xba-h">journal</h4><ul class="px-xba-j">' + j.slice(0, 20).map(x => '<li><time>' + esc(new Date(x.t).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })) + '</time> ' + esc(x.l) + '</li>').join('') + '</ul>';
      zone.innerHTML = h;
    }
    const off = agent.surEtat(peindre);
    pret.then(peindre);
    zone.addEventListener('click', async (ev) => {
      const b = ev.target.closest('[data-xba]'); if (!b || b.type === 'checkbox') return;
      const k = b.getAttribute('data-xba'); msg = '';
      if (k === 'appairer') { vibrer('interrupteur'); annuler = false;
        try { const r = await agent.appairer({ annule: () => annuler || !vivant }); reglage = { ...reglage, appaire: true, compte: r.compte || null }; await garder(); msg = '✓ appairé ; allume l\'agent quand tu veux'; }
        catch (e) { msg = e.message; } }
      else if (k === 'annuler') annuler = true;
      else if (k === 'lien') { const e = agent.etat(); if (e.appairage && W.jOSNatif && W.jOSNatif.ouvrirLien) W.jOSNatif.ouvrirLien(e.appairage.lien); }
      else if (k === 'allumer') { vibrer('interrupteur'); const ok = await agent.demarrer(); if (!ok) msg = agent.etat().erreur || 'le trousseau n\'a pas rendu le jeton'; }
      else if (k === 'eteindre') { vibrer('interrupteur'); agent.arreter(); }
      else if (k === 'oublier') { vibrer('interrupteur'); await agent.oublier(); reglage = { appaire: false, auDemarrage: false, compte: null }; await garder(); msg = 'jeton oublié ; révoque-le aussi sur le labo (Réglages › Données › jetons)'; }
      peindre();
    });
    zone.addEventListener('change', (ev) => { const c = ev.target.closest('[data-xba="demarrage"]'); if (!c) return; reglage = { ...reglage, auDemarrage: !!c.checked }; garder(); });
    return { unmount() { vivant = false; off(); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['appareil-xb'] = { manifest: { id: 'appareil-xb', name: 'Appareil xb', icon: '▸' }, mount };
  return { mount, auLancement, ploxion: { id: 'appareil-xb', nom: 'Appareil xb', icone: '▸', interne: true } };
}
