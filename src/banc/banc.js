// Le BANC iPHONE 🧪 — un ploxion intégré à ploxi0n : essaie toutes les possibilités de l'appareil (WebView + plugins natifs Capacitor),
// montre ✓ / ✗, garde le rapport dans boxion_local (banc/dernier + un tsoin), et le partage d'un geste (feuille de partage iOS ou copie).
// Les sondes « auto » tournent à l'ouverture (jamais de réseau ni de permission) ; les autres attendent qu'on les touche.
import { sondes } from './sondes.js';
import { sondesBions, GROUPE_NOUVEAUX, demanderMouvement } from './sondes-bions.js';   // (0.99.24) les nouveaux bions, essayés sur l'iPhone

const CHARGEURS = {
  device: () => import('@capacitor/device'), network: () => import('@capacitor/network'), filesystem: () => import('@capacitor/filesystem'),
  preferences: () => import('@capacitor/preferences'), camera: () => import('@capacitor/camera'), geolocation: () => import('@capacitor/geolocation'),
  haptics: () => import('@capacitor/haptics'), 'local-notifications': () => import('@capacitor/local-notifications'), share: () => import('@capacitor/share'),
  clipboard: () => import('@capacitor/clipboard'), app: () => import('@capacitor/app'), 'screen-orientation': () => import('@capacitor/screen-orientation'),
  'status-bar': () => import('@capacitor/status-bar'),
  'bluetooth-le': () => import('@capacitor-community/bluetooth-le'), health: () => import('@capgo/capacitor-health'), nfc: () => import('@capgo/capacitor-nfc'),
  wifi: () => import('@capgo/capacitor-wifi'), 'text-to-speech': () => import('@capacitor-community/text-to-speech'), 'app-shortcuts': () => import('@capawesome/capacitor-app-shortcuts'),
  jsqr: () => import('jsqr'),
};
// (0.99.24) ⊘ et ! : ⛔ et ⚠ étaient effacés par le filtre sans-emoji (le banc montrait une case vide pour une erreur)
const SYMBOLE = { ok: '✓', partiel: '◐', non: '✗', refuse: '⊘', erreur: '!', attente: '…', '': '○' };
const COULEUR = { ok: '#5fe08a', partiel: '#ffcf6a', non: '#8aa0c0', refuse: '#ff8a8a', erreur: '#ff8a8a' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function enregistrerBanc({ W = globalThis.window, boxion, version = '?', extras = {} }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const plugin = (nom) => { const f = CHARGEURS[nom]; if (!f) throw new Error('plugin inconnu ' + nom); return f(); };
  const ctx = { W, boxion, natif, plugin };

  function mount(hote) {
    const liste = [...sondesBions(W, extras), ...sondes(W)], res = {};
    let vivant = true;
    hote.innerHTML = '<div class="banc"><style>'
      + '.banc{padding:12px 14px 60px;font-size:14px}.banc h2{margin:2px 0 4px;font-size:1.2rem}.banc .n{color:#8aa0c0;font-size:.85rem}'
      + '.banc h3{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:#3fe0d0;margin:16px 0 6px}'
      + '.banc .s{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid rgba(120,140,190,.14)}'
      + '.banc .s b{width:20px;text-align:center;flex:none}.banc .s div{flex:1;min-width:0}.banc .s small{display:block;color:#8aa0c0;word-break:break-word}'
      + '.banc button{border:1px solid #22324f;background:transparent;color:inherit;border-radius:9px;padding:6px 11px;font:13px system-ui;min-height:36px}'
      + '.banc .b{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.banc .ok{background:#3fe0d0;color:#08111b;border-color:#3fe0d0;font-weight:700}'
      + '</style><h2>🧪 Banc iPhone</h2><p class="n">Tout ce que ploxi0n peut faire sur cet appareil. Les essais marqués « essayer » demandent une permission ou le réseau. « ▶ les nouveaux bions » les essaie tous (≈ 30 s, ouvre Proche sur un 2e iPhone à côté), puis « copier » : le log.</p>'
      + '<div class="b"><button class="ok" data-nouveaux>▶ les nouveaux bions, tout</button><button data-tout>tout relancer</button><button data-partager>partager le rapport</button><button data-copier>copier</button></div>'
      + '<p class="n" data-resume></p><div data-liste></div></div>';
    const zone = hote.querySelector('[data-liste]'), resume = hote.querySelector('[data-resume]');
    const groupes = [...new Set(liste.map(s => s.groupe))];
    zone.innerHTML = groupes.map(g => '<h3>' + esc(g) + '</h3>' + liste.filter(s => s.groupe === g).map(s => '<div class="s" data-s="' + esc(s.id) + '"><b>○</b><div>' + esc(s.nom) + '<small></small></div>' + (s.quand === 'toucher' ? '<button data-essayer="' + esc(s.id) + '">essayer</button>' : '') + '</div>').join('')).join('');

    function peindre(id) {
      const el = zone.querySelector('[data-s="' + id + '"]'), r = res[id] || { etat: '' };
      if (!el) return;
      el.querySelector('b').textContent = SYMBOLE[r.etat] || '○';
      el.querySelector('b').style.color = COULEUR[r.etat] || '';
      el.querySelector('small').textContent = r.detail || '';
      const vals = Object.values(res), c = (e) => vals.filter(x => x.etat === e).length;
      resume.textContent = `${c('ok')} ✓ · ${c('partiel')} ◐ · ${c('non')} ✗ · ${c('refuse')} ⊘ · ${c('erreur')} ! sur ${liste.length} possibilités` + (natif() ? '' : ' (navigateur : les essais natifs sont marqués ✗)');
    }
    async function lancer(s) {
      res[s.id] = { etat: 'attente', detail: '' }; peindre(s.id);
      let r;
      try { r = await Promise.race([Promise.resolve().then(() => s.fn(ctx)), new Promise((ok) => setTimeout(() => ok({ etat: 'erreur', detail: 'pas de réponse en 20 s' }), 20000))]); }
      catch (e) { r = { etat: /denied|permission|NotAllowed/i.test(String(e && (e.message || e.name))) ? 'refuse' : 'erreur', detail: String((e && e.message) || e).slice(0, 200) }; }
      if (!vivant) return;
      res[s.id] = { etat: r.etat, detail: r.detail, t: Date.now() };
      peindre(s.id);
    }
    function rapport() {
      return { v: 1, app: 'ploxi0n', version, quand: new Date().toISOString(), natif: natif(), stockage: boxion.impl,
        resultats: liste.map(s => ({ id: s.id, groupe: s.groupe, nom: s.nom, ...(res[s.id] || { etat: 'pas essayé' }) })) };
    }
    function texte() {
      const r = rapport();
      return `ploxi0n ${r.version} · banc iPhone · ${r.quand}\n` + r.resultats.map(x => `${SYMBOLE[x.etat] || '○'} ${x.groupe} · ${x.nom}${x.detail ? ' — ' + x.detail : ''}`).join('\n');
    }
    async function garder() {
      const r = rapport(); await boxion.put('banc', 'dernier', r);
      const c = (e) => r.resultats.filter(x => x.etat === e).length;
      await boxion.append('tsoins', { kind: 'banc', ok: c('ok'), partiel: c('partiel'), non: c('non'), refuse: c('refuse'), erreur: c('erreur') });
    }
    async function toutAuto() {
      for (const s of liste) { if (!vivant) return; if (s.quand === 'auto') await lancer(s); }
      if (vivant) await garder();
    }
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-nouveaux') || b.getAttribute('data-essayer') === 'nb-boussole') demanderMouvement(W);   // pendant le toucher, avant tout await
      if (b.hasAttribute('data-essayer')) { const s = liste.find(x => x.id === b.getAttribute('data-essayer')); if (s) { await lancer(s); await garder(); } return; }
      if (b.hasAttribute('data-tout')) { await toutAuto(); return; }
      // (0.99.24) un toucher : chaque nouveau bion, la radio, le GPS, la boussole et le réseau compris (environ 30 s), puis le rapport gardé
      if (b.hasAttribute('data-nouveaux')) { b.disabled = true; for (const x of liste) { if (!vivant) return; if (x.groupe === GROUPE_NOUVEAUX) await lancer(x); } b.disabled = false; await garder(); return; }
      if (b.hasAttribute('data-copier')) { try { if (natif()) { const { Clipboard } = await plugin('clipboard'); await Clipboard.write({ string: texte() }); } else await W.navigator.clipboard.writeText(texte()); b.textContent = 'copié ✓'; } catch (er) { b.textContent = 'copie impossible'; } return; }
      if (b.hasAttribute('data-partager')) {
        try { if (natif()) { const { Share } = await plugin('share'); await Share.share({ title: 'Banc ploxi0n', text: texte() }); } else if (W.navigator.share) await W.navigator.share({ text: texte() }); else b.textContent = 'pas de partage ici'; } catch (er) { /* partage annulé */ }
      }
    });
    toutAuto();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.banc = { manifest: { id: 'banc', name: 'Banc iPhone', icon: '🧪' }, mount };
  return { id: 'banc', nom: 'Banc iPhone', icone: '🧪', interne: true };
}
