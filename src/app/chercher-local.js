// 🔍 CHERCHER CHEZ SOI (0.69). RS-7 (14.10) : « y a pas d'option pour chercher les ploxions présents, ça emmène direct sur le marketplace ; il
// faut pouvoir checker les ploxions locaux, et avoir un bouton pour mettre à jour les ploxions facilement ».
// 🔍 (le dock, le HUD, le geste « chercher ») ouvre d'abord CETTE feuille : tes ploxions installés (et ceux de l'app), trouvés pendant que tu
// tapes (sans accents, par nom, id, famille, description : chercher() du marketplace), ceux qui vivent en premier ; un toucher : il s'ouvre.
// En bas : « « mot » dans le marketplace › » (le reste du nexus) et « ↻ tout mettre à jour » (depot.aJour : chaque ploxion installé depuis le
// réseau, comparé par ETag puis par empreinte ; le pack hors ligne n'est pas touché).
// Rien ne touche au réseau tant qu'on ne demande pas la mise à jour ou le marketplace.
import { chercher } from '../marketplace/marketplace.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

import { trouverLienCff } from '../natif/cff.js';   // ⇄ (0.99.67) un lien CFF collé ici devient un trajet
// (0.99.67) cff(texte) : un lien CFF collé dans le champ → « ⇄ ajouter ce trajet » (le calendrier, le rappel de départ ; src/natif/cff.js)
export function creerChercherLocal({ W = globalThis.window, cff = null, racine, liste = () => [], vivants = () => [], ouvrir = () => {}, marketplace = () => {}, majTout = null, vibrer = () => {}, icone = (p) => esc(p.icone || '◇') } = {}) {
  const D = W.document;
  let f = null;
  /** les ploxions qui répondent à q (sans q : ceux qui vivent, puis tous, par nom) */
  function trouver(q) {
    const l = liste().map(p => ({ ...p, nom: p.nom || p.id })), v = new Set(vivants());
    const t = String(q || '').trim();
    const r = t ? chercher(l, t) : l.slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return r.sort((a, b) => (v.has(b.id) ? 1 : 0) - (v.has(a.id) ? 1 : 0));   // stable : l'ordre de chercher() reste dans chaque groupe
  }
  function peindre() {
    if (!f) return;
    const q = f.querySelector('[data-cl-q]').value, l = trouver(q), v = new Set(vivants());
    if (cff && trouverLienCff(q)) { f.querySelector('[data-cl-liste]').innerHTML = '<button type="button" class="px-cl-l" data-cl-cff><span class="px-cl-ic">⇄</span><span><b>ajouter ce trajet</b><small>au calendrier, avec le rappel de départ</small></span></button>'; f.querySelector('[data-cl-mk]').textContent = 'le marketplace ›'; return; }
    f.querySelector('[data-cl-liste]').innerHTML = l.length
      ? l.slice(0, 60).map(p => '<button type="button" class="px-cl-l" data-cl-id="' + esc(p.id) + '"><span class="px-cl-ic">' + icone(p) + '</span><span><b>' + esc(p.nom) + '</b><small>' + esc(p.id) + (v.has(p.id) ? ' · ouvert' : '') + (p.interne ? ' · de l\'app' : '') + '</small></span></button>').join('')
      : '<p class="px-cl-vide">rien chez toi pour « ' + esc(q) + ' »</p>';
    f.querySelector('[data-cl-mk]').textContent = q.trim() ? '« ' + q.trim() + ' » dans le marketplace ›' : 'le marketplace ›';
  }
  function fermer() { if (f) { f.remove(); f = null; } }
  function ouvrirFeuille(q = '') {
    fermer();
    f = D.createElement('div'); f.className = 'px-voile px-cherche';
    f.innerHTML = '<div class="px-tiroir px-cl"><input class="px-cl-q" data-cl-q type="search" enterkeyhint="go" autocomplete="off" placeholder="chercher dans tes ploxions">'
      + '<div class="px-cl-liste" data-cl-liste></div><div class="px-cl-bas"><button type="button" data-cl-mk></button>' + (majTout ? '<button type="button" data-cl-maj>↻ tout mettre à jour</button>' : '') + '</div><p class="px-cl-msg" data-cl-msg></p></div>';
    racine.appendChild(f);
    const champ = f.querySelector('[data-cl-q]'); champ.value = q;
    champ.addEventListener('input', peindre);
    champ.addEventListener('keydown', (e) => { if (e.key === 'Enter' && cff && trouverLienCff(champ.value)) { const t = champ.value; fermer(); vibrer('succes'); cff(t); return; } if (e.key === 'Enter') { const p = trouver(champ.value)[0]; if (p) { fermer(); vibrer('fx-ouvrir', p.id); ouvrir(p.id); } } if (e.key === 'Escape') fermer(); });
    f.addEventListener('click', async (e) => {
      if (e.target === f) return fermer();
      const b = e.target.closest('button'); if (!b) return;
      e.stopPropagation();
      if (b.hasAttribute('data-cl-cff') && cff) { const t = champ.value; fermer(); vibrer('succes'); cff(t); return; }
      if (b.hasAttribute('data-cl-id')) { const id = b.getAttribute('data-cl-id'); fermer(); vibrer('fx-ouvrir', id); return ouvrir(id); }
      if (b.hasAttribute('data-cl-mk')) { const t = champ.value.trim(); fermer(); return marketplace(t); }
      if (b.hasAttribute('data-cl-maj') && majTout) {
        const m = f.querySelector('[data-cl-msg]'); b.disabled = true; b.textContent = '↻ …'; m.textContent = 'je compare chaque ploxion avec le labo…';
        try {
          const r = await majTout(); const n = (k) => r.filter(x => x.etat === k).length;
          m.textContent = n('mis-a-jour') + ' mis à jour · ' + n('a-jour') + ' déjà à jour' + (n('erreur') ? ' · ' + n('erreur') + ' injoignable' + (n('erreur') > 1 ? 's' : '') : '');
          vibrer(n('mis-a-jour') ? 'succes' : 'selection');
        } catch (er) { m.textContent = '⚠ ' + String(er.message || er).slice(0, 80); vibrer('erreur'); }
        b.disabled = false; b.textContent = '↻ tout mettre à jour'; peindre();
      }
    });
    peindre();
    try { champ.focus(); } catch (e) { /* */ }
    return f;
  }
  return { ouvrir: ouvrirFeuille, fermer, ouverte: () => !!f, trouver };
}
