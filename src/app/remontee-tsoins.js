// ⧗ LES TSOINS DE L'IPHONE REMONTENT AU BOXION (0.86). La feuille de route (§10) : « les tsoins de l'iPhone remontent au boxion (réplication) »,
// et le journal du mode test (§8, RS-7 12.10 : « tout logger ; des modes de consentement : xerboxion = demander de faire un tsoin ; chill-tekk =
// un tampon envoyé seulement si on veut »). Le journal existe déjà : boxion_local « tsoins » (tes tsoins notés, jOSTsoin.mark des ploxions,
// le marketplace, le terrax, xerbot, le compte…). Il restait sur le téléphone.
//   Ce qui part, c'est TOI qui choisis (⚙ › Réseau › Mes tsoins au boxion) ; par défaut rien ne part (ne pas nuire) :
//     non     rien ne part
//     tsoins  tes tsoins (ceux que tu notes : ⧗, vocaux, la blouse) — tout seuls, connecté
//     tout    tout le journal (tes gestes dans les ploxions aussi) — tout seul, connecté
//     tampon  tout le journal, gardé ici ; il part seulement quand tu appuies « envoyer le tampon »
//   Où : jOSBoxion de ton compte, espace « tsoins-iphone », une clé par jour et par appareil (« 2026-10-22.iphone-ab12 ») : chaque appareil
//   écrit les siens, jamais ceux d'un autre ; le document du jour est relu puis fusionné (par numéro de séquence) : renvoyer ne double rien.
//   « Me demander un tsoin après une session » (le consentement du mode xerboxion) : au retour dans l'app après une pause, une proposition
//   (un mini dock) de noter ta dernière session — rien n'est noté sans toi.
// boxion_local « reglages/tsoins-remontee » = { mode, demander } ; « reglages/tsoins-remontee-etat » = { curseur, le, envoyes, jours, erreur }.
export const MODES_REMONTEE = [['non', 'rien', 'rien ne part'], ['tsoins', 'tsoins', 'tes tsoins notés, tout seuls'], ['tout', 'tout', 'tout le journal, tout seul'], ['tampon', 'tampon', 'tout le journal, quand tu l\'envoies']];
export const NS_REMONTEE = 'tsoins-iphone';
const PAR_JOUR = 3000;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** l'entrée garde-t-elle sa place dans ce mode ? (« tsoins » : ce que la personne a noté elle-même) */
export const retenue = (mode, e) => !!e && (mode === 'tout' || mode === 'tampon' || (mode === 'tsoins' && (e.kind === 'tsoin' || e.kind === 'vocal')));
/** la date locale d'un horodatage : « 2026-10-22 » */
export const jourDe = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/** distant = { actif(), appel(methode, chemin, corps) → { status, data } } (main.js : le jeton du compte, le HTTP natif) */
export function creerRemontee({ W = globalThis.window, boxion, distant, maintenant = () => Date.now(), signaler = () => {}, proposer = null }) {
  let r = { mode: 'non', demander: false }, etat = { curseur: 0 }, enCours = null, appareil = null;
  const pret = Promise.all([boxion.get('reglages', 'tsoins-remontee').catch(() => null), boxion.get('reglages', 'tsoins-remontee-etat').catch(() => null), boxion.get('reglages', 'appareil-id').catch(() => null)])
    .then(async ([a, b, c]) => {
      if (a && typeof a === 'object') r = { ...r, ...a };
      if (b && typeof b === 'object') etat = { curseur: 0, ...b };
      appareil = typeof c === 'string' && c ? c : 'iphone-' + Math.random().toString(36).slice(2, 6);
      if (c !== appareil) await boxion.put('reglages', 'appareil-id', appareil).catch(() => {});
    });

  async function aEnvoyer(limite = 20000) {
    const l = await boxion.lire('tsoins', { depuis: etat.curseur || 0, limite }).catch(() => []);
    return l.filter(x => retenue(r.mode, x.entry));
  }
  /** envoyer ce qui n'est pas encore parti ; force : le tampon aussi. Une seule à la fois. */
  function remonter({ force = false } = {}) {
    if (enCours) return enCours;
    enCours = (async () => {
      await pret;
      if (r.mode === 'non') return { mode: 'non', envoyes: 0 };
      if (r.mode === 'tampon' && !force) return { mode: 'tampon', envoyes: 0, enAttente: (await aEnvoyer()).length };
      if (!distant || !distant.actif()) return { horsLigne: true, envoyes: 0, enAttente: (await aEnvoyer()).length };
      let envoyes = 0; const jours = new Set();
      for (;;) {
        const lot = await boxion.lire('tsoins', { depuis: etat.curseur || 0, limite: 500 }).catch(() => []);
        if (!lot.length) break;
        const parJour = new Map();
        for (const x of lot) if (retenue(r.mode, x.entry)) { const j = jourDe(x.t); if (!parJour.has(j)) parJour.set(j, []); parJour.get(j).push({ seq: x.seq, t: x.t, ...x.entry }); }
        for (const [jour, l] of parJour) {
          const cle = jour + '.' + appareil;
          const lu = await distant.appel('GET', '/px/boxion/load?ns=' + NS_REMONTEE + '&key=' + encodeURIComponent(cle));
          if (!lu || lu.status < 200 || lu.status >= 300) throw new Error('le boxion ne répond pas (' + (lu && lu.status) + ')');
          const doc = lu.data && (lu.data.item !== undefined ? lu.data.item : lu.data);
          const avant = doc && doc.data && Array.isArray(doc.data.tsoins) ? doc.data.tsoins : [];
          const m = new Map(avant.map(x => [x.seq, x])); for (const x of l) m.set(x.seq, x);
          const tsoins = [...m.values()].sort((a, b) => a.seq - b.seq).slice(-PAR_JOUR);
          const ec = await distant.appel('POST', '/px/boxion/save', { ns: NS_REMONTEE, key: cle, name: '⧗ ' + jour + ' · ' + appareil, data: { appareil, jour, n: tsoins.length, tsoins } });
          if (!ec || ec.status < 200 || ec.status >= 300) throw new Error('le boxion refuse (' + (ec && ec.status) + ')');
          envoyes += l.length; jours.add(jour);
        }
        etat = { ...etat, curseur: lot[lot.length - 1].seq };
        await boxion.put('reglages', 'tsoins-remontee-etat', etat).catch(() => {});
        if (lot.length < 500) break;
      }
      etat = { ...etat, le: maintenant(), envoyes: (etat.envoyes || 0) + envoyes, jours: [...jours].slice(-7), erreur: null };
      await boxion.put('reglages', 'tsoins-remontee-etat', etat).catch(() => {});
      return { envoyes, jours: [...jours] };
    })().catch(async (er) => {
      etat = { ...etat, erreur: er.message, le: maintenant() }; await boxion.put('reglages', 'tsoins-remontee-etat', etat).catch(() => {});
      return { erreur: er.message, envoyes: 0 };
    }).finally(() => { enCours = null; });
    return enCours;
  }
  async function regler(p) {
    await pret; const avant = r.mode; r = { ...r, ...p };
    // passer à un mode qui envoie : on part de MAINTENANT (le passé reste ici, sauf « tout envoyer depuis le début »)
    if (p.mode && p.mode !== avant && avant === 'non' && p.mode !== 'non') { const d = await boxion.lire('tsoins', { depuis: 0, limite: 1e7 }).catch(() => []); etat = { ...etat, curseur: d.length ? d[d.length - 1].seq : 0 }; await boxion.put('reglages', 'tsoins-remontee-etat', etat).catch(() => {}); }
    await boxion.put('reglages', 'tsoins-remontee', r).catch(() => {});
    return { ...r };
  }
  async function depuisLeDebut() { await pret; etat = { ...etat, curseur: 0 }; await boxion.put('reglages', 'tsoins-remontee-etat', etat).catch(() => {}); return remonter({ force: true }); }

  // ---- le rythme : au lancement (après 25 s), toutes les 15 min, au retour du réseau ; et la session (le consentement « demander ») ----
  let debut = maintenant(), cache = null, minuteur = null;
  function demarrer({ attente = 25000 } = {}) {
    const tic = () => { if (r.mode === 'tsoins' || r.mode === 'tout') remonter().catch(() => {}); };
    W.setTimeout(tic, attente); minuteur = W.setInterval(tic, 15 * 60e3);
    W.addEventListener('online', () => W.setTimeout(tic, 3000));
    W.document.addEventListener('visibilitychange', () => {
      if (W.document.hidden) { cache = { fin: maintenant(), duree: maintenant() - debut }; return; }
      const c = cache; cache = null; debut = maintenant();
      // une vraie session (≥ 2 min), puis une vraie pause (≥ 20 min) : proposer de la noter
      if (r.demander && proposer && c && c.duree >= 120e3 && maintenant() - c.fin >= 20 * 60e3) proposer({ minutes: Math.round(c.duree / 60e3), finie: c.fin });
    });
  }

  // ---- ⚙ › Réseau : la section ----
  function html() {
    const quand = etat.le ? new Date(etat.le).toLocaleString('fr-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais';
    return '<div class="bloc px-remontee"><div class="l ls"><span>Mes tsoins au boxion<small>' + esc((MODES_REMONTEE.find(m => m[0] === r.mode) || MODES_REMONTEE[0])[2]) + ' · ton compte, connecté</small></span><div class="seg">'
      + MODES_REMONTEE.map(([k, n]) => '<button data-rt-mode="' + k + '"' + (r.mode === k ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div></div>'
      + '<label class="l"><span>Me demander un tsoin après une session<small>au retour dans l\'app après une pause : noter ce que tu viens de faire (rien sans toi)</small></span><input type="checkbox" data-rt-demander' + (r.demander ? ' checked' : '') + '></label>'
      + '<div class="l"><span>' + (r.mode === 'tampon' ? 'Envoyer le tampon' : 'Envoyer maintenant') + '<small data-rt-etat>dernier envoi : ' + esc(quand) + (etat.envoyes ? ' · ' + etat.envoyes + ' tsoins envoyés en tout' : '') + (etat.erreur ? ' · ⚠ ' + esc(etat.erreur) : '') + '</small></span><button class="p" data-rt-envoyer' + (r.mode === 'non' ? ' disabled' : '') + '>↑ envoyer</button></div>'
      + '<div class="l"><span>Tout envoyer depuis le début<small>le journal entier de ce téléphone (renvoyer ne double rien)</small></span><button data-rt-tout' + (r.mode === 'non' ? ' disabled' : '') + '>↑ tout</button></div></div>';
  }
  function brancher(zone, repeindre = () => {}) {
    const s = () => zone.querySelector('[data-rt-etat]');
    zone.addEventListener('change', async (e) => { if (e.target.matches('[data-rt-demander]')) await regler({ demander: e.target.checked }); });
    zone.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b || !zone.contains(b)) return;
      if (b.hasAttribute('data-rt-mode')) { e.stopPropagation(); await regler({ mode: b.getAttribute('data-rt-mode') }); repeindre(); return; }
      if (!b.hasAttribute('data-rt-envoyer') && !b.hasAttribute('data-rt-tout')) return;
      e.stopPropagation(); b.disabled = true; if (s()) s().textContent = '↑ …';
      const x = b.hasAttribute('data-rt-tout') ? await depuisLeDebut() : await remonter({ force: true });
      b.disabled = false;
      if (s()) s().textContent = x.erreur ? '⚠ ' + x.erreur : x.horsLigne ? 'pas connecté (ou hors ligne) : ' + (x.enAttente || 0) + ' en attente, ils partiront au retour' : '✓ ' + x.envoyes + ' tsoin' + (x.envoyes > 1 ? 's' : '') + ' envoyé' + (x.envoyes > 1 ? 's' : '') + (x.jours && x.jours.length ? ' (' + x.jours.join(', ') + ')' : '');
    });
  }
  return { pret, remonter, regler, depuisLeDebut, aEnvoyer, demarrer, html, brancher, reglage: () => ({ ...r }), etat: () => ({ ...etat }), appareil: () => appareil, arreter: () => W.clearInterval(minuteur) };
}
