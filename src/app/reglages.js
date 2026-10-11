// ⚙ LES RÉGLAGES de ploxi0n (RS-7 11.10 : « il faut vraiment un vrai bouton réglages dans l'app, et un moyen de customiser son HUD »).
// Un ploxion interne, toujours au bout du ⚙ de l'accueil (il ne se retire pas). Sections :
//   compte · mode connecté · HUD (quels éléments, dans quel ordre, les ploxions épinglés) · accueil (dossiers et pages) · Face ID ·
//   ploxions (compléter les bions, mettre à jour) · données (le cache des routes) · à propos (version, banc, bother me)
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function enregistrerReglages({ W = globalThis.window, compte, hud, routeur, depot, boxion, modeConnecte, version = '?' }) {
  const ELS = { compte: '👤 compte', reseau: '📶 réseau et mode connecté', heure: '🕐 heure', chercher: '🔎 chercher un ploxion', epingles: '📌 ploxions épinglés' };
  function mount(hote) {
    let vivant = true;
    const R = () => routeur();
    hote.innerHTML = '<div class="rg"><style>'
      + '.rg{padding:6px 16px 70px;max-width:640px;margin:0 auto}.rg h3{margin:20px 4px 6px;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#8aa0c0)}'
      + '.rg .bloc{background:var(--surface,#1c1140);border:var(--trait,3px) solid var(--bord,#3b2775);border-radius:30px;overflow:hidden}.rg .l{display:flex;align-items:center;gap:10px;padding:12px 16px;min-height:30px;border-top:1px solid rgba(178,140,255,.14)}.rg .l:first-child{border-top:0}'
      + '.rg .l>span{flex:1;min-width:0}.rg .l small{display:block;color:var(--muted,#8aa0c0);font-size:.78rem}.rg button{border:var(--trait,3px) solid var(--bord,#22324f);background:var(--surface2,#251754);color:inherit;border-radius:999px;padding:6px 14px;min-height:34px;font:500 14px inherit}'
      + '.rg .bas{border:0;min-height:30px;padding:2px 8px;color:var(--muted,#8aa0c0)}.rg .p{border-color:rgba(182,156,255,.65);color:var(--acc,#b69cff)}.rg .msg{color:var(--muted,#8aa0c0);font-size:.82rem;margin:6px 4px}'
      + '.rg input[type=checkbox]{appearance:none;-webkit-appearance:none;width:48px;height:29px;border-radius:99px;background:var(--creux,#160d35);border:3px solid var(--bord,#3b2775);box-sizing:content-box;position:relative;flex:none;margin:0;transition:background .15s}'
      + '.rg input[type=checkbox]::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:99px;background:#fff;transition:transform .15s}.rg input:checked{background:var(--bio,#7dffb0)}.rg input:checked::after{background:#0b2a17}.rg input:checked::after{transform:translateX(18px)}'
      + '.rg .pins{display:flex;gap:10px;flex-wrap:wrap;padding:12px 16px}.rg .pin{font-size:1.4rem;width:50px;height:50px;border-radius:var(--blob1);padding:0;opacity:.5}.rg .pin.on{opacity:1;border-color:var(--bio,#7dffb0);background:var(--surface2,#251754);box-shadow:0 0 12px rgba(125,255,176,.4)}'
      + '</style><div data-c></div></div>';
    const zone = hote.querySelector('[data-c]');
    async function peindre() {
      if (!vivant) return;
      const e = compte.etat(), c = hud.config(), verrous = R().verrous(), cat = R().catalogue().filter(p => !p.interne);
      const nRoutes = (await boxion.list('routes').catch(() => [])).length;
      zone.innerHTML = '<h3>Compte</h3><div class="bloc"><div class="l"><span>' + (e.connecte ? esc((e.glyphe || '·') + ' ' + e.nom) + '<small>rang ' + esc(e.palier) + ' · xerboxion.org</small>' : 'Pas connecté<small>tout reste sur ton téléphone</small>') + '</span>'
        + (e.connecte ? '<button data-a="sortir">se déconnecter</button>' : '<button class="p" data-a="connecter">se connecter</button>') + '</div></div>'
        + '<h3>Réseau</h3><div class="bloc"><label class="l"><span>Mode connecté<small>les ploxions joignent xerboxion.org' + (e.connecte ? ' avec ton compte' : '') + ' ; hors ligne, leur dernière réponse</small></span><input type="checkbox" data-t="mode"' + (modeConnecte() ? ' checked' : '') + '></label></div>'
        + '<h3>HUD</h3><div class="bloc">' + c.elements.map((x, i) => '<label class="l"><span>' + esc(ELS[x.k] || x.k) + '</span><button class="bas" data-monter="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="monter">↑</button><input type="checkbox" data-el="' + i + '"' + (x.on ? ' checked' : '') + '></label>').join('')
        + '<div class="l"><span>⚙ réglages<small>toujours sur l\'accueil</small></span></div></div>'
        + '<p class="msg">📌 épinglés dans le HUD (4 au plus) : touche pour épingler ou retirer</p><div class="bloc"><div class="pins">' + (cat.length ? cat.map(p => '<button class="pin' + (c.epingles.includes(p.id) ? ' on' : '') + '" data-pin="' + esc(p.id) + '" title="' + esc(p.nom) + '">' + esc(p.icone || '▣') + '</button>').join('') : '<span class="msg">installe des ploxions d\'abord</span>') + '</div></div>'
        + '<h3>Écran d\'accueil de l\'iPhone</h3><div class="bloc"><div class="l"><span>📲 Tes ploxions en apps<small>une icône par ploxion, qui ouvre ploxi0n directement dessus</small></span><button class="p" data-a="apps">choisir</button></div></div>'
        + '<h3>Accueil</h3><div class="bloc"><div class="l"><span>Dossiers et pages<small>✎ sur l\'accueil, puis touche un ploxion</small></span><button data-a="accueil">tout remettre</button></div></div>'
        + '<h3>Face ID</h3><div class="bloc">' + (verrous.length ? verrous.map(id => { const p = cat.find(x => x.id === id) || { nom: id, icone: '🔒' }; return '<div class="l"><span>' + esc(p.icone + ' ' + p.nom) + '</span><button data-deverrou="' + esc(id) + '">retirer le verrou</button></div>'; }).join('') : '<div class="l"><span>Aucun ploxion verrouillé<small>🔓 dans la barre d\'un ploxion</small></span></div>') + '</div>'
        + '<h3>Ploxions</h3><div class="bloc"><div class="l"><span>Compléter leurs bions<small>ce que chaque ploxion touche, servi par le labo</small></span><button data-a="bions">compléter</button></div>'
        + '<div class="l"><span>Mises à jour</span><button data-a="ajour">vérifier</button></div></div>'
        + '<h3>Données</h3><div class="bloc"><div class="l"><span>Réponses gardées pour le mode avion<small>' + nRoutes + ' route' + (nRoutes > 1 ? 's' : '') + '</small></span><button data-a="routes">vider</button></div></div>'
        + '<h3>À propos</h3><div class="bloc"><div class="l"><span>ploxi0n ' + esc(version) + '<small>' + esc(W.navigator.onLine !== false ? 'en ligne' : 'hors ligne') + '</small></span></div>'
        + '<div class="l"><span>🧪 Banc iPhone</span><button data-ouvrir="banc">ouvrir</button></div><div class="l"><span>🐛 Bother me (un souci, une idée)</span><button data-ouvrir="bother">ouvrir</button></div></div>'
        + '<p class="msg" data-msg></p>';
    }
    const msg = (t) => { const m = zone.querySelector('[data-msg]'); if (m) { m.textContent = t; try { m.scrollIntoView({ block: 'nearest' }); } catch (e) { /* */ } } };
    async function majHud(f) { const c = hud.config(); f(c); await hud.regler(c); peindre(); }
    hote.addEventListener('change', async (ev) => {
      const t = ev.target;
      if (t.matches('[data-t="mode"]')) { modeConnecte(t.checked); hud.regler(hud.config()); return; }
      if (t.matches('[data-el]')) return majHud(c => { c.elements[+t.getAttribute('data-el')].on = t.checked; });
    });
    hote.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button'); if (!b || !hote.contains(b)) return;
      if (b.hasAttribute('data-monter')) { ev.preventDefault(); const i = +b.getAttribute('data-monter'); return majHud(c => { const [x] = c.elements.splice(i, 1); c.elements.splice(i - 1, 0, x); }); }
      if (b.hasAttribute('data-pin')) { const id = b.getAttribute('data-pin'); return majHud(c => { c.epingles = c.epingles.includes(id) ? c.epingles.filter(x => x !== id) : [...c.epingles, id].slice(-4); if (!c.elements.find(x => x.k === 'epingles').on) c.elements.find(x => x.k === 'epingles').on = true; }); }
      if (b.hasAttribute('data-ouvrir')) return R().ouvrir(b.getAttribute('data-ouvrir'));
      if (b.hasAttribute('data-deverrou')) { if (await R().deverrouiller(b.getAttribute('data-deverrou'))) peindre(); return; }
      const a = b.getAttribute('data-a'); if (!a) return;
      b.disabled = true;
      try {
        if (a === 'apps') { if (W.jOSEcranAccueil) await W.jOSEcranAccueil(); }
        else if (a === 'connecter') await compte.connecter();
        else if (a === 'sortir') { await compte.deconnecter(); }
        else if (a === 'accueil') { R().reinitialiserAccueil(); msg('✓ accueil remis à zéro'); }
        else if (a === 'bions') { const r = await depot.completerBions(); msg(r.length ? '✓ ' + r.map(x => x.id + ' +' + (x.apres - x.avant)).join(' · ') : '✓ rien à compléter'); }
        else if (a === 'ajour') { const r = await depot.aJour(); msg(r.length ? r.map(x => x.id + ' : ' + ({ 'a-jour': 'à jour', 'mis-a-jour': 'mis à jour ✓', erreur: 'erreur' }[x.etat])).join(' · ') : 'rien à vérifier'); }
        else if (a === 'routes') { for (const r of await boxion.list('routes')) await boxion.del('routes', r.key); await peindre(); msg('✓ vidé'); }
      } catch (er) { msg('⚠ ' + (er.message || er)); }
      b.disabled = false;
      if (a === 'sortir' || a === 'accueil' || a === 'bions') { const m = zone.querySelector('[data-msg]').textContent; await peindre(); msg(m); }
    });
    const off = compte.surChangement(() => peindre());
    peindre();
    return { unmount() { vivant = false; off(); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['reglages-app'] = { manifest: { id: 'reglages-app', name: 'Réglages', icon: '⚙' }, mount };
  return { id: 'reglages-app', nom: 'Réglages', icone: '⚙', interne: true };
}
