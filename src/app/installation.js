// ⬇ LA BARRE D'INSTALLATION (RS-7 12.10 : « si on utilise un xerkion et que le ploxion qu'on choisit n'est pas encore installé, il faut une
// barre de chargement qui montre que le ploxion s'installe »). Une plaque en bas de l'écran : l'icône, le nom, la barre, l'étape
// (le ploxion, puis chaque bion qui arrive), le poids reçu. Elle se ferme seule quand c'est prêt ; une erreur reste lisible, avec « fermer ».
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ko = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1e3)) + ' ko');

export async function installerAvecBarre({ W = globalThis.window, depot, id, meta = {}, vibrer = () => {} }) {
  const D = W.document, f = D.createElement('div'); f.className = 'px-installation'; f.setAttribute('role', 'status');
  f.innerHTML = '<div class="px-inst-tete"><span class="px-ic">' + esc(meta.icone || '▣') + '</span><div><b>' + esc(meta.nom || id) + '</b><small data-etape>s\'installe…</small></div></div>'
    + '<div class="px-inst-barre"><i data-barre style="width:4%"></i></div>';
  (D.getElementById('ploxi0n') || D.body).appendChild(f);
  const barre = f.querySelector('[data-barre]'), etape = f.querySelector('[data-etape]');
  let octets = 0, pct = 4;
  const poser = (p, t) => { pct = Math.max(pct, Math.min(99, p)); barre.style.width = pct.toFixed(0) + '%'; if (t) etape.textContent = t; };
  try {
    const r = await depot.installer(id, meta, (e) => {
      if (e.etape === 'ploxion') poser(6, 'téléchargement du ploxion…');
      else if (e.etape === 'recu') { octets = e.octets || 0; poser(30, 'ploxion reçu · ' + ko(octets) + ' · ses bions…'); }
      else if (e.etape === 'bion') poser(30 + 65 * (e.fait / Math.max(e.connus, e.fait + 1, 1)), '⬡ ' + e.nom + ' · ' + e.fait + '/' + Math.max(e.connus, e.fait));
    });
    poser(100, 'prêt · ' + ko(r.octets || octets) + (r.bions && r.bions.length ? ' · ' + r.bions.length + ' bions' : '') + (r.manquants && r.manquants.length ? ' · ⚠ ' + r.manquants.length + ' bion(s) introuvable(s)' : ''));
    barre.style.width = '100%'; f.classList.add('ok'); vibrer('succes');
    W.setTimeout(() => f.remove(), 900);
    return r;
  } catch (e) {
    f.classList.add('ko'); vibrer('erreur');
    etape.textContent = '⚠ ' + (e.message || e);
    const b = D.createElement('button'); b.textContent = 'fermer'; b.onclick = () => f.remove(); f.appendChild(b);
    W.setTimeout(() => f.remove(), 9000);
    throw e;
  }
}
