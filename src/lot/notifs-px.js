// 🔔 LE PLOXION NOTIFS (0.99.64, RS-7 : « un ploxion notifs pour voir toutes les notifs ; quand il y a un nouveau build, une notif ; pouvoir
// choisir quels mots on veut voir ou pas »). Un journal de toutes les notifications que l'app voit passer :
//   - celles qu'elle pose elle-même (coord, Proche, le test : src/natif/notifs.js) ;
//   - les push reçues app ouverte, et celles touchées (src/natif/push.js) ;
//   - celles restées dans le centre de notifications d'iOS pendant que l'app dormait (getDeliveredNotifications, au retour dans l'app) ;
//   - « nouveau build » : une version installée qui n'avait jamais été vue (et le sujet push « build », que le labo ou la CI peut envoyer).
// LES MOTS : « à cacher » (une notif qui en contient un disparaît du journal ; une notif LOCALE n'est même pas posée) et « à voir » (s'il y en
// a, seules celles qui en contiennent un restent). Le journal : boxion_local « notifs » (500 au plus), les mots : « reglages/notifs-mots ».
// Les mots partent aussi au labo avec le jeton push (docs/PUSH.md) : c'est lui qui filtre les push avant de les envoyer.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const MAX = 500;
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const mots = (l) => [...new Set((Array.isArray(l) ? l : []).map(m => norm(m).trim()).filter(Boolean))].slice(0, 60);

/** une notification passe-t-elle les mots ? { voir: [..], cacher: [..] } ; insensible à la casse et aux accents */
export function passe(n, { voir = [], cacher = [] } = {}) {
  const t = norm([n && n.titre, n && n.texte, n && n.sujet, n && n.source].join(' '));
  if (mots(cacher).some(m => t.includes(m))) return false;
  const v = mots(voir); return !v.length || v.some(m => t.includes(m));
}
/** le jour d'une date, pour regrouper : « aujourd'hui », « hier », sinon la date */
export function jourDe(t, maintenant) {
  const d = new Date(t), m = new Date(maintenant), j0 = new Date(m.getFullYear(), m.getMonth(), m.getDate()).getTime();
  if (t >= j0) return 'aujourd\'hui'; if (t >= j0 - 864e5) return 'hier';
  return d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function creerNotifsPx({ W = globalThis.window, boxion, ouvrir = () => {}, vibrer = () => {}, maintenant = () => Date.now(), surMots = () => {} } = {}) {
  let journal = [], regle = { voir: [], cacher: [] }, peindre = () => {}, sujet = '';
  const pret = Promise.all([boxion.get('notifs', 'journal').then(l => { if (Array.isArray(l)) journal = l.slice(-MAX); }).catch(() => {}),
    boxion.get('reglages', 'notifs-mots').then(v => { if (v && typeof v === 'object') regle = { voir: mots(v.voir), cacher: mots(v.cacher) }; }).catch(() => {})]);
  const garder = () => boxion.put('notifs', 'journal', journal.slice(-MAX)).catch(() => {});
  /** noter une notification ; { cle } évite les doublons (la même notif vue par deux chemins) ; → l'entrée, ou null si déjà là */
  async function noter({ titre = '', texte = '', source = 'app', sujet: s = '', ouvrir: o = null, params = null, cle = null, t = null } = {}) {
    await pret;
    const k = cle ? String(cle) : null; if (k && journal.some(x => x.cle === k)) return null;
    const e = { id: maintenant().toString(36) + Math.random().toString(36).slice(2, 6), t: Number.isFinite(t) ? t : maintenant(), titre: String(titre).slice(0, 120), texte: String(texte).slice(0, 400),
      source, sujet: String(s || '').slice(0, 30), ouvrir: o ? String(o).slice(0, 60) : null, params: params && typeof params === 'object' ? params : null, cle: k, lu: false };
    journal.push(e); if (journal.length > MAX) journal = journal.slice(-MAX); await garder(); peindre(); return e;
  }
  const masquee = (n) => !passe(n, regle);
  async function reglerMots(r) { regle = { voir: mots(r.voir != null ? r.voir : regle.voir), cacher: mots(r.cacher != null ? r.cacher : regle.cacher) }; await boxion.put('reglages', 'notifs-mots', regle).catch(() => {}); try { surMots({ ...regle }); } catch (e) { /* */ } peindre(); return { ...regle }; }
  function visibles() { return journal.filter(n => passe(n, regle) && (!sujet || n.sujet === sujet || n.source === sujet)).sort((a, b) => b.t - a.t); }
  const nonLues = () => journal.filter(n => !n.lu && passe(n, regle)).length;

  function mount(hote) {
    let vivant = true;
    hote.innerHTML = '<div class="px-page px-nt" data-ecrit><p class="px-grave">🔔 notifs</p>'
      + '<div class="px-nt-mots"><div><b>à cacher</b><span data-nt-l="cacher"></span><input data-nt-in="cacher" placeholder="un mot à ne plus voir" autocomplete="off"></div>'
      + '<div><b>à voir seulement</b><span data-nt-l="voir"></span><input data-nt-in="voir" placeholder="un mot (vide : tout)" autocomplete="off"></div></div>'
      + '<div class="px-nt-puces" data-nt-puces></div><div class="px-nt-liste" data-nt-liste></div>'
      + '<div class="px-nt-b"><button type="button" data-nt="lu">✓ tout lu</button><button type="button" data-nt="vider">vider le journal</button></div></div>';
    const $ = (s) => hote.querySelector(s);
    peindre = () => {
      if (!vivant) return;
      for (const k of ['voir', 'cacher']) $('[data-nt-l="' + k + '"]').innerHTML = regle[k].map(m => '<button type="button" class="px-nt-mot" data-nt-ote="' + k + '" data-m="' + esc(m) + '">' + esc(m) + ' ✕</button>').join('');
      const sujets = [...new Set(journal.map(n => n.sujet || n.source).filter(Boolean))];
      $('[data-nt-puces]').innerHTML = ['', ...sujets].map(s => '<button type="button" data-nt-sujet="' + esc(s) + '"' + (s === sujet ? ' class="on"' : '') + '>' + esc(s || 'tout') + '</button>').join('');
      const l = visibles(); let jour = '';
      $('[data-nt-liste]').innerHTML = l.map(n => { const j = jourDe(n.t, maintenant()), h = j !== jour ? '<h3>' + esc(j) + '</h3>' : ''; jour = j;
        return h + '<button type="button" class="px-nt-n' + (n.lu ? '' : ' neuve') + '" data-nt-id="' + esc(n.id) + '"><span class="px-nt-t">' + esc(n.titre || '(sans titre)') + '<small>'
          + esc(new Date(n.t).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) + ' · ' + (n.sujet || n.source)) + '</small></span>' + (n.texte ? '<span class="px-nt-x">' + esc(n.texte) + '</span>' : '') + '</button>'; }).join('')
        || '<p class="px-sous">' + (journal.length ? 'rien ne passe les mots choisis' : 'aucune notification pour l\'instant : elles arriveront ici, toutes') + '</p>';
    };
    hote.addEventListener('keydown', (e) => { const i = e.target.closest('[data-nt-in]'); if (!i || e.key !== 'Enter') return; e.preventDefault(); const v = i.value.trim(); if (!v) return; const k = i.getAttribute('data-nt-in'); i.value = ''; vibrer('selection'); reglerMots({ [k]: [...regle[k], v] }); });
    hote.addEventListener('click', (e) => {
      const o = e.target.closest('[data-nt-ote]'); if (o) { const k = o.getAttribute('data-nt-ote'), m = o.getAttribute('data-m'); reglerMots({ [k]: regle[k].filter(x => x !== m) }); return; }
      const s = e.target.closest('[data-nt-sujet]'); if (s) { sujet = s.getAttribute('data-nt-sujet'); vibrer('selection'); peindre(); return; }
      const n = e.target.closest('[data-nt-id]'); if (n) { const x = journal.find(j => j.id === n.getAttribute('data-nt-id')); if (x) { x.lu = true; garder(); peindre(); if (x.ouvrir) { vibrer('fx-arrivee'); ouvrir(x.ouvrir, x.params); } } return; }
      const b = e.target.closest('[data-nt]'); if (!b) return;
      if (b.getAttribute('data-nt') === 'lu') { journal.forEach(j => { j.lu = true; }); garder(); peindre(); }
      if (b.getAttribute('data-nt') === 'vider') { journal = []; garder(); peindre(); }
    });
    pret.then(() => peindre());
    return { unmount() { vivant = false; peindre = () => {}; hote.innerHTML = ''; } };
  }
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.notifs = { manifest: { id: 'notifs', name: 'Notifs', icon: '🔔' }, mount }; }
  return { mount, pret, noter, masquee, passe: (n) => passe(n, regle), mots: () => ({ ...regle }), reglerMots, liste: () => visibles(), nonLues,
    ploxion: { id: 'notifs', nom: 'Notifs', icone: '🔔', interne: true, description: 'Toutes tes notifications, au même endroit ; les mots à voir ou à cacher ; les nouveaux builds' } };
}
