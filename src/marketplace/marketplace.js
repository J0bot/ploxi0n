// Le ploxion 🛍 MARKETPLACE, intégré à ploxi0n : choisir les ploxions qu'on veut sur son téléphone (RS-7 : « j'ajoute que les ploxions que
// je vais utiliser »). Onglets : catalogue (xerboxion.org, en cache hors ligne) · pack hors ligne (installable sans réseau) · installés
// (mettre à jour, retirer). Chaque ploxion porte un badge mesuré par le banc de compatibilité.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function badge(c) {
  if (!c) return '<span class="mk-b mk-q" title="pas encore mesuré par le banc">?</span>';
  if (c.verdict === 'pret' && c.complet === 'oui') return '<span class="mk-b mk-ok" title="monte, se démonte proprement, aucun réseau">✓ hors ligne</span>';
  if (c.verdict === 'pret') return '<span class="mk-b mk-mi" title="certains bions manquent encore dans ploxi0n">◐ hors ligne, partiel</span>';
  if (c.classe === 'B' || c.classe === 'C') return '<span class="mk-b mk-web" title="appelle le serveur ou un service en ligne">🌐 en ligne</span>';
  return '<span class="mk-b mk-q" title="' + esc(c.verdict) + '">⚠ à revoir</span>';
}

const heures = (s) => !s ? '0 h' : s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : (Math.round(s / 360) / 10).toLocaleString('fr-CH') + ' h';

export function enregistrerMarketplace({ W = globalThis.window, depot, surChangement = () => {}, usage = async () => null }) {
  function mount(hote, ctx) {
    let onglet = (ctx && ctx.params && ctx.params.onglet) || 'catalogue', q = '', cat = '★', vivant = true;
    hote.innerHTML = '<div class="mk"><style>'
      + '.mk{padding:10px 14px 60px}.mk h2{margin:2px 0 6px;font-size:1.2rem}.mk .n{color:#8aa0c0;font-size:.84rem}'
      + '.mk .tabs{display:flex;gap:6px;margin:8px 0}.mk button{border:1px solid #22324f;background:transparent;color:inherit;border-radius:9px;padding:6px 11px;font:13px system-ui;min-height:36px}'
      + '.mk button.on,.mk .ok{border-color:#3fe0d0;color:#3fe0d0}.mk input{width:100%;box-sizing:border-box;padding:9px 11px;border-radius:10px;border:1px solid #22324f;background:#0b1220;color:inherit;font:15px system-ui;margin:4px 0 8px}'
      + '.mk .it{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid rgba(120,140,190,.14)}.mk .ic{font-size:1.6rem;width:34px;text-align:center}'
      + '.mk .it div{flex:1;min-width:0}.mk .it small{display:block;color:#8aa0c0;font-size:.8rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'
      + '.mk-b{display:inline-block;font-size:.66rem;font-weight:700;border-radius:99px;padding:1px 7px;border:1px solid currentColor;margin-left:4px}.mk-ok{color:#5fe08a}.mk-mi{color:#ffcf6a}.mk-web{color:#8fb2ff}.mk-q{color:#8aa0c0}'
      + '.mk .chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}.mk .chips button{white-space:nowrap}'
      + '</style><h2>🛍 Marketplace</h2><p class="n">Installe les ploxions que tu utilises : le réseau sert à installer, ils tournent ensuite hors ligne.</p>'
      + '<div class="tabs"><button data-o="catalogue">catalogue</button><button data-o="pack">pack hors ligne</button><button data-o="installes">installés</button></div><div data-c></div></div>';
    const zone = hote.querySelector('[data-c]');
    const tabs = () => hote.querySelectorAll('[data-o]').forEach(b => b.classList.toggle('on', b.getAttribute('data-o') === onglet));
    async function peindre() {
      tabs();
      const installes = new Set((await depot.installes()).map(x => x.id));
      if (!vivant) return;
      if (onglet === 'catalogue') {
        zone.innerHTML = '<p class="n">⏳ le catalogue…</p>';
        const [c, pop] = await Promise.all([depot.catalogue({ reseau: true }), depot.populaires()]);
        if (!vivant) return;
        const sec = new Map((pop.ploxions || []).map(x => [x.id, x.secondes]));
        const zero = new Set((pop.zero || []).map(x => x.id));
        const cats = [...new Set(c.items.map(x => x.categorie))].sort();
        // ★ = les plus utilisés (heures du Nexus) ; 😴 = zéro heure ; sinon une catégorie
        const L = c.items.filter(x => (cat === '★' ? true : cat === '😴' ? zero.has(x.id) || !sec.has(x.id) : !cat || x.categorie === cat) && (!q || (x.nom + ' ' + x.id + ' ' + x.description).toLowerCase().includes(q.toLowerCase())))
          .sort((a, b) => (sec.get(b.id) || 0) - (sec.get(a.id) || 0) || (b.compat && b.compat.complet === 'oui') - (a.compat && a.compat.complet === 'oui') || a.nom.localeCompare(b.nom));
        zone.innerHTML = (c.horsLigne ? '<p class="n">📴 hors ligne : le catalogue du ' + esc((c.maj || '').slice(0, 10) || '—') + ' (installer demande le réseau)</p>' : '<p class="n">' + c.items.length + ' ploxions sur ' + esc(c.source || depot.source) + '</p>')
          + '<input data-q placeholder="chercher un ploxion…" value="' + esc(q) + '">'
          + (pop.heures_total != null ? '<p class="n">⭐ ' + heures(pop.heures_total * 3600) + ' passées dans les ploxions du Nexus · ' + (pop.utilises || 0) + ' utilisés, ' + ((pop.zero || []).length) + ' à zéro heure</p>' : '')
          + '<div class="chips"><button data-cat="★" class="' + (cat === '★' ? 'on' : '') + '">⭐ plus utilisés</button><button data-cat="😴" class="' + (cat === '😴' ? 'on' : '') + '">😴 zéro heure</button><button data-cat="" class="' + (!cat ? 'on' : '') + '">tout</button>' + cats.map(k => '<button data-cat="' + esc(k) + '" class="' + (cat === k ? 'on' : '') + '">' + esc(k) + '</button>').join('') + '</div>'
          + L.slice(0, 150).map(x => '<div class="it"><span class="ic">' + esc(x.icone) + '</span><div><b>' + esc(x.nom) + '</b>' + badge(x.compat) + (sec.get(x.id) ? '<span class="mk-b mk-ok">' + heures(sec.get(x.id)) + '</span>' : '') + '<small>' + esc(x.description) + '</small></div>'
            + (installes.has(x.id) ? '<button disabled>installé ✓</button>' : '<button class="ok" data-installer="' + esc(x.id) + '" data-nom="' + esc(x.nom) + '" data-icone="' + esc(x.icone) + '">installer</button>') + '</div>').join('')
          + (L.length > 150 ? '<p class="n">… ' + (L.length - 150) + ' de plus : affine ta recherche</p>' : '');
      } else if (onglet === 'pack') {
        const P = depot.packLocal();
        zone.innerHTML = '<p class="n">Embarqués dans l\'app : installables en mode avion.</p>' + P.map(x => '<div class="it"><span class="ic">' + esc(x.icone) + '</span><div><b>' + esc(x.nom) + '</b><span class="mk-b mk-ok">✓ hors ligne</span></div>'
          + (installes.has(x.id) ? '<button disabled>installé ✓</button>' : '<button class="ok" data-pack="' + esc(x.id) + '">installer</button>') + '</div>').join('');
      } else {
        const I = await depot.installes();
        const moi = ((await usage()) || { px: {} }).px || {};
        zone.innerHTML = '<div class="tabs"><button data-ajour>vérifier les mises à jour</button></div><p class="n" data-msg></p>'
          + (I.length ? I.map(x => '<div class="it"><span class="ic">' + esc(x.icone) + '</span><div><b>' + esc(x.nom) + '</b><small>' + (moi[x.id] ? '⏱ ' + heures(moi[x.id].seconds) + ' · ' : '') + esc(x.origine === 'pack' ? 'pack hors ligne' : 'installé') + ' le ' + esc((x.maj || x.installe || '').slice(0, 10)) + ' · ' + esc((x.hash || '').slice(0, 10)) + '</small></div><button data-retirer="' + esc(x.id) + '">retirer</button></div>').join('') : '<p class="n">Aucun ploxion installé : va dans le catalogue ou le pack hors ligne.</p>');
      }
    }
    hote.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { q = e.target.value; const pos = e.target.selectionStart; peindre().then(() => { const i = zone.querySelector('[data-q]'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (er) { /* */ } } }); } });
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-o')) { onglet = b.getAttribute('data-o'); return peindre(); }
      if (b.hasAttribute('data-cat')) { cat = b.getAttribute('data-cat'); return peindre(); }
      try {
        if (b.hasAttribute('data-installer')) { b.disabled = true; b.textContent = '⏳'; await depot.installer(b.getAttribute('data-installer'), { nom: b.getAttribute('data-nom'), icone: b.getAttribute('data-icone') }); await surChangement(); b.textContent = 'installé ✓'; return; }
        if (b.hasAttribute('data-pack')) { b.disabled = true; await depot.installerLocal(b.getAttribute('data-pack')); await surChangement(); b.textContent = 'installé ✓'; return; }
        if (b.hasAttribute('data-retirer')) { await depot.retirer(b.getAttribute('data-retirer')); await surChangement(); return peindre(); }
        if (b.hasAttribute('data-ajour')) { const m = zone.querySelector('[data-msg]'); m.textContent = '⏳'; const r = await depot.aJour(); await surChangement(); m.textContent = r.length ? r.map(x => x.id + ' : ' + ({ 'a-jour': 'à jour', 'mis-a-jour': 'mis à jour ✓', erreur: 'erreur ' + (x.detail || '') }[x.etat])).join(' · ') : 'rien à vérifier'; return; }
      } catch (er) { b.disabled = false; b.textContent = '⚠ ' + String(er.message || er).slice(0, 60); }
    });
    peindre();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.marketplace = { manifest: { id: 'marketplace', name: 'Marketplace', icon: '🛍' }, mount };
  return { id: 'marketplace', nom: 'Marketplace', icone: '🛍', interne: true };
}
