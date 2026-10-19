// ⧉ LES PLOXIONS À LA DEMANDE (0.81). RS-7 (19.10, captures d'Ultimate social : « carte / social / chat indisponible ici ») : des ploxions du
// labo en COMPOSENT d'autres (ultimate-social = social + chat + carte + amis + profil + idée + atelier ; aussi socialion, space, stockage,
// theme, dl). Ils les montent par le contrat de la coquille du labo — jOSApps.monter(id, hôte, ctx), jOSApps.peut(id), jOSApps.ensure(id),
// jOSApps.charge(id) — que ploxi0n ne fournissait pas : d'où « le ploxion n'est pas sur cette page ».
// Ici, le même contrat (la coquille du labo, monde.html : monter rend TOUT DE SUITE { unmount, ready, lazy, robuste, instance }), branché sur
// l'app : un sous-ploxion pas encore installé s'INSTALLE tout seul (le pack d'abord, puis le labo), son code entre dans la page, il se monte.
//   charge(id)  son code est dans la page          peut(id)   on sait le faire venir (installé, au pack, au catalogue du labo en ligne)
//   ensure(id)  → Promise<app>                       monter(id, hôte, ctx) → le handle, avant même l'arrivée (⏳ dans l'hôte)
// Les quatre sont posés sur jOSApps sans être énumérables : qui liste les ploxions par Object.keys(jOSApps) ne les voit pas.
const ID = /^[a-z0-9][a-z0-9_.-]{0,60}$/i;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * ensureApp(id) → Promise<app> : l'app installe s'il le faut et charge le code (routeur.chargerApp) ;
 * connu(id) → bool : installé, au pack, ou au catalogue du labo ; enLigne() : le réseau
 */
export function installerAppsALaDemande({ W = globalThis.window, ensureApp, connu = () => false, enLigne = () => W.navigator.onLine !== false }) {
  W.jOSApps = W.jOSApps || {};
  const A = W.jOSApps;
  if (A.__aLaDemande) return A;
  const D = W.document, pending = new Map();
  const canon = (id) => { const al = W.__PLOXIONS_ALIAS__; return al && typeof al[id] === 'string' && al[id] !== id ? al[id] : null; };
  const charge = (id) => { const a = A[id]; return !!(a && typeof a.mount === 'function'); };
  function peut(id) {
    id = String(id || ''); if (!ID.test(id)) return false;
    if (charge(id)) return true;
    const c = canon(id); if (c && charge(c)) return true;
    return !!(connu(id) || (c && connu(c)));
  }
  function ensure(id) {
    id = String(id || '');
    if (charge(id)) return Promise.resolve(A[id]);
    if (pending.has(id)) return pending.get(id);
    const c = canon(id);
    const p = (c ? ensure(c).then((app) => { if (!charge(id)) A[id] = app; return A[id]; })
      : (!ID.test(id) ? Promise.reject(new Error('ploxion « ' + id + ' » : nom invalide'))
        : (!connu(id) && !enLigne()) ? Promise.reject(Object.assign(new Error('ploxion « ' + id + ' » : pas installé, et pas de réseau pour le chercher'), { code: 'hors-ligne' }))
          : Promise.resolve().then(() => ensureApp(id)).then((app) => { if (!charge(id) && app && typeof app.mount === 'function') A[id] = app; if (!charge(id)) throw new Error('ploxion « ' + id + ' » : introuvable au labo'); return A[id]; })));
    pending.set(id, p);
    const fin = () => { if (pending.get(id) === p) pending.delete(id); };
    p.then(fin, fin);
    return p;
  }
  function monter(id, hote, ctx) {
    id = String(id || '');
    if (charge(id)) return A[id].mount(hote, ctx);   // déjà là : le retour de mount tel quel (comme le labo)
    let inst = null, mort = false, ph = null;
    const poser = (html) => {
      if (!hote || !hote.appendChild) return;
      if (!ph) { ph = D.createElement('div'); ph.className = 'px-ald'; hote.appendChild(ph); }
      ph.innerHTML = html;
    };
    const retirer = () => { if (ph && ph.parentNode) ph.parentNode.removeChild(ph); ph = null; };
    function essayer() {
      poser('<span class="px-ald-r">⏳</span> <b>' + esc(id) + '</b> arrive…<small>installé tout seul la première fois</small>');
      const r = ensure(id).then((app) => {
        retirer(); if (mort) return null;
        inst = app.mount(hote, ctx) || null;
        if (mort && inst && typeof inst.unmount === 'function') { try { inst.unmount(); } catch (e) { /* */ } inst = null; }
        return inst;
      }, (err) => {
        if (!mort) {
          poser('⚠ <b>' + esc(id) + '</b> indisponible<small>' + esc((err && err.message) || err) + '</small><button type="button" data-ald-reessayer>↻ réessayer</button>');
          const b = ph && ph.querySelector('[data-ald-reessayer]'); if (b) b.onclick = (e) => { e.stopPropagation(); essai.ready = essayer(); };
        }
        throw err;
      });
      r.catch(() => {});
      return r;
    }
    const essai = { ready: essayer() };
    return {
      unmount() { mort = true; retirer(); if (inst && typeof inst.unmount === 'function') { try { inst.unmount(); } catch (e) { /* */ } } inst = null; },
      get ready() { return essai.ready; },
      lazy: true, robuste: true,
      instance: () => inst,
      reessayer: () => { essai.ready = essayer(); return essai.ready; },
    };
  }
  const poserCache = (k, v) => Object.defineProperty(A, k, { value: v, enumerable: false, configurable: true, writable: true });
  poserCache('charge', charge); poserCache('peut', peut); poserCache('ensure', ensure); poserCache('monter', monter);
  poserCache('present', charge); poserCache('enCours', () => [...pending.keys()]); poserCache('__aLaDemande', true);
  return A;
}

/** (0.81) les ploxions qu'un code COMPOSE (ses onglets { app: 'chat' }, jOSApps.monter('carte'…), jOSApps['social']) : ses dépendances */
export function ploxionsComposes(js, soi = '') {
  const s = String(js || ''), out = new Set(), N = '([a-z0-9][a-z0-9_-]{1,40})';
  for (const re of [new RegExp('\\bapp\\s*:\\s*[\'"]' + N + '[\'"]', 'g'), new RegExp('jOSApps\\s*\\.\\s*(?:monter|ensure)\\(\\s*[\'"]' + N + '[\'"]', 'g'),
    new RegExp('jOSApps\\s*\\[\\s*[\'"]' + N + '[\'"]\\s*\\](?!\\s*=[^=])', 'g')]) {
    for (const m of s.matchAll(re)) out.add(m[1]);
  }
  // ce que le code enregistre lui-même (jOSApps['quests'] = jOSApps['xp']) n'est pas une dépendance
  for (const m of s.matchAll(new RegExp('jOSApps\\s*\\[\\s*[\'"]' + N + '[\'"]\\s*\\]\\s*=(?!=)', 'g'))) out.delete(m[1]);
  out.delete(soi);
  return [...out];
}
