// ✉ INVITER · PARTAGER (0.76). RS-7 (17.10) : « il y a des gros zbeul avec les invitations ; je veux pouvoir inviter des gens plus facilement
// et partager des ploxions plus facilement ».
// Un ploxion de l'app (« inviter ») et une feuille commune (un titre, un QR natif, le lien, ↗ partager, copier) :
//   ✉ inviter quelqu'un   COMPOSE l'invite du labo : POST api.j0bot.ch/api/v1/invites (le compte du social, jos_social_token — avec Apple
//                         depuis la 0.72) → le lien https://labo.j0bot.ch/px/invite?code=… : un lien universel (il ouvre ploxi0n chez qui
//                         l'a, la page du ploxion invite sinon) ; la personne crée son compte et devient ton amie
//   ⬡ sur un palier       le ploxion invitation du labo (en personne, les 9 paliers) : ses liens sont maintenant les bons (liens-publics.js)
//   ↗ un ploxion          son lien universel (/px/<id> ; un ploxion de l'app seule : /app/ouvrir/<id>?app=1) ; aussi dans le menu d'un ploxion
//   📥 un lien reçu       collé : il s'ouvre ICI, avec ses paramètres (une invitation, un salon, un curseur partagé…)
// Le QR : CoreImage (PloxiApple.qr), sans réseau. Le HTTP : natif (CapacitorHttp), jamais le relais du labo.
import { PUBLIC, lienPloxion, lienRecu } from './liens-publics.js';
export const API_SOCIAL = 'https://api.j0bot.ch/api/v1';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** une invitation du social : { code, lien } ; err.connexion : il faut se connecter au social d'abord */
export async function creerInvitation({ W, requete, label = '' }) {
  let jeton = null; try { jeton = W.localStorage.getItem('jos_social_token'); } catch (e) { /* */ }
  if (!jeton) { const e = new Error('connecte-toi d\'abord au social (Continuer avec Apple, ou ton compte j0bot)'); e.connexion = true; throw e; }
  const r = await requete({ methode: 'POST', url: API_SOCIAL + '/invites', entetes: { Authorization: 'Bearer ' + jeton }, corps: label ? { label: String(label).slice(0, 60) } : {}, delai: 8000 });
  if (r.status === 401) { const e = new Error('ta connexion au social a expiré : reconnecte-toi'); e.connexion = true; throw e; }
  const code = r.json && (r.json.code || (r.json.invite && r.json.invite.code));
  if (r.status < 200 || r.status >= 300 || !code) throw new Error((r.json && r.json.message) || 'le social n\'a pas donné de code (' + r.status + ')');
  return { code, lien: PUBLIC + '/px/invite?code=' + encodeURIComponent(code) };
}

export function creerPartage({ W = globalThis.window, routeur = () => null, qr = null, requete, natif = () => W.jOSNatif || {}, vibrer = () => {}, racine = null } = {}) {
  const D = W.document;
  /** la feuille : un titre, un QR, le lien ; ↗ partager, copier */
  async function feuille({ titre, lien, texte = '', sous = '', qr: avecQr = true }) {
    const f = D.createElement('div'); f.className = 'px-voile px-partage';
    f.innerHTML = '<div class="px-tiroir px-pt"><p class="px-ft">' + esc(titre) + '</p>' + (sous ? '<p class="px-pt-sous">' + esc(sous) + '</p>' : '')
      + '<div class="px-pt-qr" data-pt-qr><span>QR…</span></div>'
      + '<input class="px-pt-lien" readonly value="' + esc(lien) + '" aria-label="le lien">'
      + '<div class="px-pt-b"><button type="button" class="p" data-pt="partager">↗ partager</button><button type="button" data-pt="copier">copier le lien</button></div>'
      + '<button type="button" data-pt="fermer">fermer</button></div>';
    (racine || D.body).appendChild(f);
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b && e.target === f) { f.remove(); return; } if (!b) return;
      e.stopPropagation(); const a = b.getAttribute('data-pt'), n = natif();
      if (a === 'fermer') { f.remove(); return; }
      try {
        if (a === 'partager') { if (n.partager) await n.partager({ titre, texte: (texte ? texte + ' ' : '') + lien }); else if (W.navigator.share) await W.navigator.share({ title: titre, text: texte, url: lien }); vibrer('succes'); }
        if (a === 'copier') { if (n.copier) await n.copier(lien); else await W.navigator.clipboard.writeText(lien); b.textContent = '✓ copié'; vibrer('succes'); }
      } catch (er) { /* la feuille d'iOS fermée sans rien choisir */ }
    });
    // le QR en personne : natif (CoreImage) ; toucher l'agrandit
    const z = f.querySelector('[data-pt-qr]');
    if (qr && avecQr) {
      try { const r = await qr({ texte: lien, echelle: 12 }); if (r && r.base64) z.innerHTML = '<img alt="QR du lien" src="data:image/png;base64,' + r.base64 + '">'; else z.remove(); } catch (er) { z.remove(); }
      if (z.isConnected) z.addEventListener('click', () => { z.classList.toggle('grand'); vibrer('selection'); });
    } else z.remove();
    return f;
  }
  async function partagerPloxion(id) {
    const r = routeur(), p = r && r.catalogue ? r.catalogue().find(x => x.id === id) : null;
    if (!p) return null;
    return feuille({ titre: '↗ ' + (p.nom || id), lien: lienPloxion(p), texte: 'le ploxion ' + (p.nom || id) + (p.description ? ' — ' + String(p.description).slice(0, 120) : '') + ' :', sous: p.interne ? 'un ploxion de ploxi0n : il s\'ouvre dans l\'app' : 'il s\'ouvre dans ploxi0n chez qui l\'a, sur le web sinon' });
  }
  async function inviter(label = '') {
    try {
      const { lien } = await creerInvitation({ W, requete, label });
      vibrer('succes');
      return feuille({ titre: '✉ ton invitation', lien, texte: 'Rejoins-moi dans le xerboxion :', sous: 'en personne : montre le QR ; sinon, envoie le lien. La personne crée son compte et devient ton amie.' });
    } catch (er) {
      vibrer('erreur');
      if (er.connexion) { const r = routeur(); if (r && r.signaler) r.signaler(er.message); if (r && r.connait && r.connait('social')) r.ouvrir('social'); }
      throw er;
    }
  }
  /** un lien reçu (collé) → ouvert ici ; rend vrai s'il a été reconnu */
  async function ouvrirLien(texte) {
    const l = lienRecu(texte); if (!l) return false;
    const r = routeur(); if (!r) return false;
    await r.ouvrir(l.id, l.lien ? { lien: l.lien } : undefined);
    return true;
  }

  // ---- le ploxion « inviter » ----
  function mount(hote) {
    let vivant = true;
    hote.innerHTML = '<div class="px-page px-inviter"><p class="px-grave">✉ inviter · partager</p>'
      + '<button type="button" class="px-gros p" data-iv="inviter"><b>✉ inviter quelqu\'un</b><small>un lien et un QR ; la personne crée son compte et devient ton amie</small></button>'
      + '<input data-iv-label placeholder="pour qui ? (facultatif, pour t\'en souvenir)" autocomplete="off">'
      + '<button type="button" class="px-gros" data-iv="palier"><b>⬡ inviter sur un palier</b><small>en personne : bion, kion, ploxion… jusqu\'à xeroction (le ploxion invitation)</small></button>'
      + '<button type="button" class="px-gros" data-iv="ploxions"><b>↗ partager un ploxion</b><small>son lien et son QR (aussi : appui long sur un ploxion › le partager)</small></button>'
      + '<div data-iv-liste></div>'
      + '<button type="button" class="px-gros" data-iv="recu"><b>📥 ouvrir un lien reçu</b><small>copié dans un message : il s\'ouvre ici, avec l\'invitation, le salon, le curseur…</small></button>'
      + '<p class="px-sous" data-iv-msg></p></div>';
    const msg = (t) => { const m = hote.querySelector('[data-iv-msg]'); if (m) m.textContent = t; };
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b || !hote.contains(b)) return;
      const a = b.getAttribute('data-iv'), r = routeur();
      if (b.hasAttribute('data-iv-px')) { vibrer('selection'); partagerPloxion(b.getAttribute('data-iv-px')); return; }
      if (a === 'inviter') { b.disabled = true; msg('je demande une invitation au social…'); try { await inviter((hote.querySelector('[data-iv-label]') || {}).value || ''); msg(''); } catch (er) { msg(er.message); } if (vivant) b.disabled = false; return; }
      if (a === 'palier') { if (r && r.connait('invitation')) r.ouvrir('invitation'); else msg('le ploxion invitation n\'est pas installé : le marketplace l\'a'); return; }
      if (a === 'ploxions') {
        const l = (r ? r.catalogue() : []).filter(p => p.id !== 'inviter').slice(0, 120), z = hote.querySelector('[data-iv-liste]');
        z.innerHTML = z.innerHTML ? '' : '<div class="px-iv-l">' + l.map(p => '<button type="button" data-iv-px="' + esc(p.id) + '">' + esc(p.nom || p.id) + '</button>').join('') + '</div>';
        return;
      }
      if (a === 'recu') {
        let t = ''; try { const n = natif(); t = n.coller ? await n.coller() : await W.navigator.clipboard.readText(); } catch (er) { /* */ }
        if (!(await ouvrirLien(t))) msg(t ? 'ce lien ne mène à aucun ploxion : ' + String(t).slice(0, 80) : 'rien dans le presse-papiers : copie le lien reçu, puis touche ici');
        return;
      }
    });
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.inviter = { manifest: { id: 'inviter', name: 'inviter', icon: '✉' }, mount };
  return { feuille, partagerPloxion, inviter, ouvrirLien, ploxion: { id: 'inviter', nom: 'inviter · partager', icone: '✉', interne: true, cat: 'social', type: 'ploxion', description: 'Inviter quelqu\'un (un lien, un QR), sur un palier, partager un ploxion, ouvrir un lien reçu', bions: ['jOSNatif'] } };
}
