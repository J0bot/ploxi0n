// 📦 LE GESTIONNAIRE DES PLOXIONS (RS-7 12.10 : « un manager simple pour voir les ploxions installés, la place qu'ils prennent et les
// dépendances »). Un ploxion interne : en tête la place totale (ploxions + bions) ; puis chaque ploxion, du plus lourd au plus léger, avec
// ce que le retirer libérerait (son bundle + les bions qui ne servent qu'à lui) ; le toucher déplie ses bions (partagés avec combien
// d'autres). En bas, au pouce : trier, retirer les bions orphelins, tout mettre à jour.
import { ko } from './installation.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function enregistrerGestion({ W = globalThis.window, depot, ouvrir = () => {}, retirer = async () => {}, vibrer = () => {} }) {
  function mount(hote) {
    let vivant = true, tri = 'poids', ouvert = null, msg = '';
    const dessiner = async () => {
      const inv = await depot.inventaire({ tailles: true }); if (!vivant) return;
      const T = inv.totaux, liste = inv.ploxions.slice().sort(tri === 'nom' ? (a, b) => String(a.nom).localeCompare(String(b.nom)) : tri === 'deps' ? (a, b) => b.deps.length - a.deps.length : (a, b) => b.liberable - a.liberable);
      const max = Math.max(1, ...liste.map(p => p.total));
      hote.innerHTML = '<div class="px-page px-gestion"><p class="px-grave">📦 ploxions installés · ' + liste.length + '</p>'
        + '<div class="px-sante-tuiles"><div class="px-sante-t"><small>en tout</small><b>' + ko(T.tout) + '</b></div><div class="px-sante-t"><small>ploxions</small><b>' + ko(T.bundles) + '</b></div><div class="px-sante-t"><small>bions · ' + inv.bions.length + '</small><b>' + ko(T.bions) + '</b></div>'
        + (T.orphelins.length ? '<div class="px-sante-t"><small>orphelins · ' + T.orphelins.length + '</small><b>' + ko(T.orphelins.reduce((a, b) => a + b.octets, 0)) + '</b></div>' : '') + '</div>'
        + (msg ? '<p class="px-sous">' + esc(msg) + '</p>' : '')
        + liste.map(p => '<div class="px-gest-l' + (ouvert === p.id ? ' on' : '') + '" data-p="' + esc(p.id) + '"><div class="px-gest-h"><span class="g">' + esc(p.icone || '▣') + '</span><div><b>' + esc(p.nom || p.id) + '</b>'
          + '<small>' + ko(p.total) + ' · ' + p.deps.length + ' bion(s)' + (p.origine === 'pack' ? ' · de base' : '') + ' · libère ' + ko(p.liberable) + '</small>'
          + '<span class="px-gest-jauge"><i style="width:' + (p.bundle / max * 100).toFixed(1) + '%"></i><i class="b" style="width:' + ((p.total - p.bundle) / max * 100).toFixed(1) + '%"></i></span></div></div>'
          + (ouvert === p.id ? '<div class="px-gest-deps">' + (p.deps.length ? p.deps.slice().sort((a, b) => b.octets - a.octets).map(d => '<span class="px-puce' + (d.partage > 1 ? '' : ' seul') + '">⬡ ' + esc(d.nom) + ' · ' + ko(d.octets) + (d.partage > 1 ? ' · ×' + d.partage : ' · à lui seul') + (d.coupe ? ' · coupé' : '') + '</span>').join('') : '<span class="px-sous">aucun bion</span>')
            + '<div class="px-gest-act"><button data-ouvrir="' + esc(p.id) + '">ouvrir</button>' + (p.origine === 'pack' ? '' : '<button class="px-danger" data-retirer="' + esc(p.id) + '">retirer · libère ' + ko(p.liberable) + '</button>') + '</div></div>' : '')
          + '</div>').join('')
        + '</div><div class="px-journal-bas px-puces">'
        + [['poids', 'poids'], ['deps', 'bions'], ['nom', 'A–Z']].map(([k, t]) => '<button class="px-puce' + (tri === k ? ' on' : '') + '" data-tri="' + k + '">' + t + '</button>').join('')
        + (T.orphelins.length ? '<button class="px-puce" data-orphelins>🧹 orphelins</button>' : '') + '<button class="px-puce" data-maj>↻ à jour</button></div>';
    };
    hote.addEventListener('click', async (e) => {
      const t = e.target;
      try {
        let b;
        if ((b = t.closest('[data-tri]'))) { tri = b.getAttribute('data-tri'); vibrer('selection'); return dessiner(); }
        if ((b = t.closest('[data-ouvrir]'))) return ouvrir(b.getAttribute('data-ouvrir'));
        if ((b = t.closest('[data-retirer]'))) {
          const id = b.getAttribute('data-retirer');
          if (b.dataset.sur !== '1') { b.dataset.sur = '1'; b.textContent = 'sûr ? toucher encore pour retirer'; vibrer('moyen'); return; }
          const libere = (await depot.inventaire({ tailles: true })).ploxions.find(p => p.id === id);
          await retirer(id);
          // les bions qui ne servaient qu'à lui partent aussi
          for (const d of (libere && libere.deps) || []) if (d.partage <= 1) await depot.retirerBion(d.nom).catch(() => {});
          msg = '« ' + id + ' » retiré · ' + ko((libere && libere.liberable) || 0) + ' libérés'; ouvert = null; vibrer('succes'); return dessiner();
        }
        if (t.closest('[data-orphelins]')) {
          const inv = await depot.inventaire({ tailles: true }); let n = 0, o = 0;
          for (const x of inv.totaux.orphelins) { await depot.retirerBion(x.nom).catch(() => {}); n++; o += x.octets; }
          msg = n + ' bion(s) orphelin(s) retiré(s) · ' + ko(o) + ' libérés'; vibrer('succes'); return dessiner();
        }
        if ((b = t.closest('[data-maj]'))) { b.disabled = true; b.textContent = '↻ …'; const r = await depot.aJour(); msg = r.filter(x => x.etat === 'mis-a-jour').length + ' mis à jour · ' + r.filter(x => x.etat === 'erreur').length + ' en erreur'; return dessiner(); }
        if ((b = t.closest('[data-p]'))) { const id = b.getAttribute('data-p'); ouvert = ouvert === id ? null : id; vibrer('selection'); return dessiner(); }
      } catch (er) { msg = '⚠ ' + (er.message || er); dessiner(); }
    });
    dessiner();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.gestion = { manifest: { id: 'gestion', name: 'Ploxions installés', icon: '📦' }, mount };
  return { id: 'gestion', nom: 'Ploxions installés', icone: '📦', interne: true };
}
