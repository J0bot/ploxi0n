// Le ploxion 🛍 MARKETPLACE, intégré à ploxi0n : choisir les ploxions qu'on veut sur son téléphone (RS-7 : « j'ajoute que les ploxions que
// je vais utiliser » ; 11.10 : « c'est l'enfer de trouver un ploxion : une manière bien plus stylée et rapide, différentes façons de le voir »).
//   ouverture immédiate depuis le cache (boxion_local), le réseau rafraîchit derrière ; la recherche est en mémoire (sans accents, instantanée)
//   cinq vues, la dernière est gardée :
//     ▦ vitrine    des rayons comme l'App Store : ce où le Nexus passe ses heures, avec tes ploxions, nouveautés, sans réseau, zéro heure, puis
//                  un rayon par catégorie
//     ⊞ grille     des icônes comme l'écran d'accueil, filtrées par catégorie
//     ☰ liste      A–Z compacte, une barre de lettres à glisser du pouce
//     🃏 découvrir  une carte à la fois : glisser à droite = installer, à gauche = passer (les passés ne reviennent pas)
//     ✓ à moi      les installés : mises à jour, retirer
//   chaque ploxion ouvre une fiche (feuille du bas) : badges, heures du Nexus, ce qu'il fournit, installer/ouvrir/retirer, souvent utilisé avec.
// Pi 4 / iPhone : aucune minuterie, aucun rAF ; les gestes sont des pointer events.
import { installerAvecBarre } from '../app/installation.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const heures = (s) => !s ? '0 h' : s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : (Math.round(s / 360) / 10).toLocaleString('fr-CH') + ' h';
const teinte = (t) => { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; };
const teinteDe = (id) => 160 + (teinte(id) % 160);   // la même que l'accueil (routeur) : teal → violet → rose
const lettre = (n) => { const l = norm(n).replace(/[^a-z0-9]/g, '').charAt(0); return /[a-z]/.test(l) ? l.toUpperCase() : '#'; };
export const VUES = [['vitrine', '▦', 'vitrine'], ['grille', '⊞', 'grille'], ['liste', '☰', 'A–Z'], ['decouvrir', '🃏', 'découvrir'], ['moi', '✓', 'à moi']];

function badge(c) {
  if (!c) return '<span class="mk-b mk-q" title="pas encore mesuré par le banc">?</span>';
  if (c.verdict === 'pret' && c.complet === 'oui') return '<span class="mk-b mk-ok" title="monte, se démonte proprement, aucun réseau">✓ hors ligne</span>';
  if (c.verdict === 'pret') return '<span class="mk-b mk-mi" title="certains bions manquent encore dans ploxi0n">◐ partiel</span>';
  if (c.classe === 'B' || c.classe === 'C') return '<span class="mk-b mk-web" title="appelle le serveur ou un service en ligne">🌐 en ligne</span>';
  return '<span class="mk-b mk-q" title="' + esc(c.verdict) + '">⚠ à revoir</span>';
}

// (0.67, RS-7 : « voir les catégories natives et web et autres, à quel point ils sont utilisables partout, parce qu'on aura bientôt la
// version Android ») LA PORTÉE d'un ploxion, lue sur le banc (public/marketplace/compat.json, tools/audit-ploxions.mjs) :
//   natif    un ploxion de l'app, écrit pour elle (il touche l'iPhone : jOSNatif) ........................ iPhone (Android : à porter)
//   partout  écran pur (classe A), monte et tourne sans réseau dans ploxi0n ............................... iPhone · Android · web
//   partiel  écran pur, mais des bions manquent encore dans l'app ......................................... web (iPhone, Android : en partie)
//   nexus    appelle le serveur du nexus (classe B, labo.j0bot.ch) : en ligne ........................... iPhone · Android · web, connecté
//   externe  un site ou un service en dehors (classe C) : en ligne seulement ................................ web
//   inconnu  pas encore passé au banc
export const PORTEES = [['partout', '◇', 'partout'], ['natif', '◆', 'natif'], ['partiel', '◐', 'partiel'], ['nexus', '⇄', 'nexus'], ['externe', '↗', 'web externe'], ['inconnu', '?', 'pas mesuré']];
const OU = { partout: 'iPhone · Android · web · hors ligne', natif: 'iPhone (Android : à porter)', partiel: 'web ; iPhone et Android en partie', nexus: 'iPhone · Android · web, connecté au nexus', externe: 'web, en ligne seulement', inconnu: 'pas encore mesuré' };
export function porteeDe(x) {
  if (x && x.interne) return 'natif';
  const c = x && x.compat; if (!c) return 'inconnu';
  if (c.classe === 'C') return 'externe';
  if (c.classe === 'B') return 'nexus';
  if (c.verdict === 'pret' && c.complet === 'oui') return 'partout';
  if (c.classe === 'A' && c.verdict !== 'casse') return c.verdict ? 'partiel' : 'partout';
  return 'inconnu';
}
const badgePortee = (x) => { const k = porteeDe(x), p = PORTEES.find(y => y[0] === k); return '<span class="mk-b mk-p-' + k + '" title="' + esc(OU[k]) + '">' + p[1] + ' ' + esc(p[2]) + '</span>'; };

/** la recherche : nom (début, début d'un mot, dedans) > id > ce qu'il fournit, sa catégorie > sa description ; les heures départagent */
export function chercher(items, q, sec = new Map()) {
  const t = norm(q).trim(); if (!t) return [];
  const mots = t.split(/\s+/);
  const out = [];
  for (const x of items) {
    const nom = norm(x.nom), id = norm(x.id), autres = norm((x.fournit || []).join(' ') + ' ' + x.categorie), desc = norm(x.description);
    let score = 0, tous = true;
    for (const m of mots) {
      const s = nom.startsWith(m) ? 100 : (' ' + nom).includes(' ' + m) ? 80 : nom.includes(m) ? 60 : id.includes(m) ? 50 : autres.includes(m) ? 30 : desc.includes(m) ? 10 : 0;
      if (!s) { tous = false; break; } score += s;
    }
    if (tous) out.push([score, x]);
  }
  return out.sort((a, b) => b[0] - a[0] || (sec.get(b[1].id) || 0) - (sec.get(a[1].id) || 0) || a[1].nom.localeCompare(b[1].nom)).map(e => e[1]);
}

const CSS = '.mk-tuile.mk-xk{background:none !important;box-shadow:none !important;border-radius:0 !important}.mk-tuile.mk-xk .xki,.mk-tuile.mk-xk .px-g{width:100%;height:100%}'
  + '.mk-portees{margin-top:-4px}.mk-p-partout{color:#7dbfb8}.mk-p-natif{color:var(--bio,#7fe0b0)}.mk-p-nexus{color:#4677b5}.mk-p-externe{color:#d8b04a}.mk-p-partiel{color:var(--muted,#8aa0c0)}'
  + '.mk{padding:0 0 70px;--a:var(--acc,#a597cf);--n:var(--muted,#8aa0c0);--l:var(--bord,#272036)}.mk .n{color:var(--n);font-size:.82rem;margin:6px 16px}'
  + '.mk-top{position:sticky;top:0;z-index:4;background:var(--surface,#0f0b18) var(--grain,none);padding:10px 14px 8px;border-bottom:var(--trait,2px) solid var(--l)}'
  + '.mk-l1{display:flex;gap:8px;align-items:center}.mk-q{flex:1;min-width:0;padding:10px 14px 10px 36px;border-radius:14px;border:var(--trait,2px) solid var(--l);background:var(--creux,#0a0712) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%23a99fd0%27 stroke-width=%272%27%3E%3Ccircle cx=%277%27 cy=%277%27 r=%275%27/%3E%3Cpath d=%27m11 11 4 4%27/%3E%3C/svg%3E") 13px 50% no-repeat;color:inherit;font:16px inherit;-webkit-appearance:none;appearance:none}'
  + '.mk-q:focus{outline:none;border-color:var(--a)}'
  + '.mk-vues{display:flex;gap:4px;margin-top:9px;padding:4px;border-radius:14px;background:var(--creux,#160d35);border:var(--trait,2px) solid var(--l);overflow-x:auto;scrollbar-width:none}.mk-vues::-webkit-scrollbar{display:none}'
  + '.mk button{border:var(--trait,2px) solid var(--l);background:var(--surface2,#251754);color:inherit;border-radius:11px;padding:6px 12px;font:500 13px inherit;min-height:34px;cursor:pointer;transition:transform .1s}.mk button:active{transform:scale(.95)}'
  + '.mk-vues button{flex:1 0 auto;border-color:transparent;background:none;color:var(--n)}.mk .mk-vues button.on{background:var(--surface2,#151021);color:var(--txt,#ddd6ea);font-weight:600;border-color:var(--bord2,#3a3050);box-shadow:inset 0 -2px 0 var(--bio,#79d9a2)}'
  + '.mk button.on,.mk .ok{border-color:rgba(182,156,255,.65);color:var(--a)}.mk button:disabled{opacity:.55}'
  + '.mk-chips{display:flex;gap:6px;overflow-x:auto;padding:10px 16px 2px;scrollbar-width:none}.mk-chips::-webkit-scrollbar{display:none}.mk-chips button{white-space:nowrap;border-radius:11px}'
  + '.mk-tuile{width:58px;height:58px;border-radius:var(--blob1,36% 42% 38% 44% / 40% 36% 44% 38%);display:flex;align-items:center;justify-content:center;font-size:1.85rem;flex:none;position:relative;'
  + 'background:hsl(var(--t) 22% 11%) var(--grain,none);border:var(--trait,2px) solid hsl(var(--t) 20% 24%);box-shadow:inset 0 0 0 1px var(--filet,rgba(190,175,230,.06))}'
  + '.mk-carte:nth-child(3n+2) .mk-tuile,.mk-it:nth-child(3n+2) .mk-tuile{border-radius:var(--blob2)}.mk-carte:nth-child(3n) .mk-tuile,.mk-it:nth-child(3n) .mk-tuile{border-radius:var(--blob3)}'
  + '.mk-tuile i{position:absolute;right:-4px;bottom:-4px;font:700 .62rem system-ui;background:var(--bio,#7dffb0);color:#0b2a17;border-radius:99px;padding:2px 5px;font-style:normal;box-shadow:0 0 10px rgba(125,255,176,.5)}'
  + '.mk-rayon h3{margin:22px 16px 10px;font:600 11px var(--mono,monospace);letter-spacing:.18em;text-transform:uppercase;color:var(--muted,#7f7699);display:flex;justify-content:space-between;align-items:baseline;gap:8px}.mk-rayon h3 small{color:var(--grave,#5f5878);font:400 .72rem var(--police,system-ui);letter-spacing:0;text-transform:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '.mk-defile{display:grid;grid-auto-flow:column;grid-auto-columns:82px;gap:12px;overflow-x:auto;padding:4px 16px 8px;scroll-snap-type:x mandatory;scrollbar-width:none}.mk-defile::-webkit-scrollbar{display:none}.mk-carte{scroll-snap-align:start;text-align:center;cursor:pointer;min-width:0;transition:transform .12s}.mk-carte:active{transform:scale(.93)}'
  + '.mk-carte .mk-tuile{width:66px;height:66px;font-size:2.1rem;margin:0 auto 6px}.mk-carte b{display:block;font-size:.76rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mk-carte small{color:var(--n);font-size:.68rem}'
  + '.mk-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:16px 8px;padding:14px 16px}.mk-grille .mk-carte{content-visibility:auto;contain-intrinsic-size:90px 104px}'
  + '.mk-it{display:flex;gap:12px;align-items:center;padding:9px 16px;border-bottom:1px solid rgba(150,120,235,.1);cursor:pointer;content-visibility:auto;contain-intrinsic-size:auto 64px}.mk-it .mk-tuile{width:46px;height:46px;font-size:1.45rem}'
  + '.mk-it div{flex:1;min-width:0}.mk-it b{font-size:.92rem;font-weight:600}.mk-it small{display:block;color:var(--n);font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '.mk-sec{position:sticky;top:106px;z-index:2;background:var(--bg,#07050c);font-family:var(--mono,monospace);color:var(--a);font:700 .78rem inherit;letter-spacing:.08em;padding:4px 16px}'
  + '.mk-az{position:fixed;right:2px;top:50%;transform:translateY(-50%);z-index:5;display:flex;flex-direction:column;font:700 .62rem system-ui;color:var(--a);touch-action:none;padding:6px 3px;border-radius:99px;background:var(--surface,#1c1140);user-select:none;-webkit-user-select:none}.mk-az span{padding:1px 4px;text-align:center}'
  + '.mk-b{display:inline-block;font-size:.62rem;font-weight:700;border-radius:99px;padding:1px 7px;border:var(--trait,2px) solid currentColor;margin:0 4px 0 0;vertical-align:middle}.mk-ok{color:var(--bio,#7dffb0)}.mk-mi{color:#ffcf6a}.mk-web{color:#9fb5ff}.mk-q.mk-b,.mk-b.mk-q{color:var(--n)}'
  + '.mk-deck{padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:16px}.mk-dc{width:100%;max-width:360px;border-radius:22px;padding:30px 22px;text-align:center;touch-action:pan-y;border:var(--trait,2px) solid var(--l);transition:transform .22s,opacity .22s;user-select:none;-webkit-user-select:none}'
  + '.mk-dc .mk-tuile{width:112px;height:112px;font-size:3.6rem;margin:0 auto 14px}.mk-dc h2{margin:6px 0 6px}.mk-dc p{color:rgba(225,225,240,.8);font-size:.88rem;line-height:1.45;max-height:7.3em;overflow:hidden}'
  + '.mk-dk{display:flex;gap:20px}.mk-dk button{width:64px;height:64px;border-radius:18px;font-size:1.5rem}'
  + '.mk-voile{position:fixed;inset:0;z-index:20;background:rgba(3,2,6,.78);display:flex;align-items:flex-end}'
  + '.mk-feuille{width:100%;max-height:86vh;overflow:auto;background:var(--surface,#0f0b18) var(--grain,none);border-radius:22px 22px 0 0;padding:10px 18px calc(24px + env(safe-area-inset-bottom,0px));box-sizing:border-box;border:var(--trait,2px) solid var(--l);border-bottom:0;}'
  + '.mk-poignee{width:40px;height:5px;border-radius:9px;background:rgba(200,190,255,.28);margin:0 auto 14px}.mk-fh{display:flex;gap:14px;align-items:center}.mk-fh .mk-tuile{width:84px;height:84px;font-size:2.8rem}'
  + '.mk-fh h2{margin:0 0 3px;font-size:1.25rem}.mk-actions{display:flex;gap:8px;margin:16px 0}.mk-actions button{flex:1;min-height:46px;font-size:15px;font-weight:600}.mk-actions button[data-accueil]{flex:0 0 52px}'
  + '.mk-actions .plein{background:var(--a);color:#0d0a16;border-color:var(--a)}'
  + '.mk-feuille p{line-height:1.5;color:rgba(225,225,240,.82)}.mk-tags{display:flex;gap:6px;flex-wrap:wrap}.mk-tags span{font-size:.72rem;color:var(--n);border:var(--trait,2px) solid var(--l);border-radius:99px;padding:2px 9px}'
  + '.mk-feuille .mk-defile{padding:4px 0 8px}';

export function enregistrerMarketplace({ W = globalThis.window, depot, surChangement = () => {}, usage = async () => null, prefs = null, vibrer = () => {}, icone = null, internes = () => [] }) {
  function mount(hote, ctx) {
    const params = (ctx && ctx.params) || {};
    let vue = params.vue || params.onglet || 'vitrine', q = params.q || '', cat = '', portee = '', vivant = true, feuille = null;
    if (vue === 'catalogue' || vue === 'pack') vue = 'vitrine'; if (vue === 'installes') vue = 'moi';
    const D = W.document;
    // les données, en mémoire : la recherche et les vues ne retouchent jamais le réseau
    const d = { items: [], parId: new Map(), sec: new Map(), zero: new Set(), ensemble: {}, pop: {}, installes: new Set(), horsLigne: true, maj: null, passes: new Set(), pack: new Set() };

    hote.innerHTML = '<div class="mk"><style>' + CSS + '</style><div class="mk-top"><div class="mk-l1"><input class="mk-q" data-q type="search" enterkeyhint="search" autocomplete="off" placeholder="chercher un ploxion" value="' + esc(q) + '"></div>'
      + '<div class="mk-vues">' + VUES.map(([k, i, n]) => '<button data-vue="' + k + '">' + i + ' ' + n + '</button>').join('') + '</div></div><div data-c></div></div>';
    const zone = hote.querySelector('[data-c]'), champ = hote.querySelector('[data-q]');

    async function charger(reseau) {
      const [c, pop, inst] = await Promise.all([depot.catalogue({ reseau }), depot.populaires({ reseau }), depot.installes()]);
      const items = c.items.slice(), ids = new Set(items.map(x => x.id));
      d.pack = new Set(depot.packLocal().map(p => p.id));
      for (const p of internes() || []) if (p && p.id && !ids.has(p.id)) { ids.add(p.id); items.push({ id: p.id, nom: p.nom || p.id, icone: p.icone || '▣', description: 'un ploxion de l\'app, écrit pour elle : il est déjà là', categorie: 'ploxi0n', cat: 'ploxi0n', cat_icone: '◆', compat: null, interne: true, mtime: 0, fournit: [] }); }
      for (const p of depot.packLocal()) if (!ids.has(p.id)) items.push({ id: p.id, nom: p.nom, icone: p.icone, description: 'embarqué dans l\'app : installable sans réseau', categorie: 'Pack hors ligne', cat_icone: '📦', compat: { verdict: 'pret', complet: 'oui' }, mtime: 0, fournit: [], packSeul: true });
      Object.assign(d, { items, parId: new Map(items.map(x => [x.id, x])), sec: new Map((pop.ploxions || []).map(x => [x.id, x.secondes])), zero: new Set((pop.zero || []).map(x => x.id)),
        ensemble: pop.ensemble || {}, pop, installes: new Set(inst.map(x => x.id)), horsLigne: c.horsLigne, maj: c.maj });
      if (prefs) { const p = (await prefs.lire().catch(() => null)) || {}; d.passes = new Set(p.passes || []); }
    }
    const garder = () => { if (prefs) prefs.ecrire({ vue, passes: [...d.passes].slice(-600) }).catch(() => {}); };
    const parHeures = (a, b) => (d.sec.get(b.id) || 0) - (d.sec.get(a.id) || 0) || a.nom.localeCompare(b.nom);
    // (0.67, RS-7 : « voir les icônes des ploxions comme dans le xer ») le xerkion (forme = type, glyphe = catégorie), pas l'emoji du labo (que l'app efface : des tuiles vides)
    const tuile = (x, pastille) => '<span class="mk-tuile' + (icone ? ' mk-xk' : '') + '" style="--t:' + teinteDe(x.id) + '">' + (icone ? icone(x) : esc(x.icone)) + (pastille && d.installes.has(x.id) ? '<i>✓</i>' : '') + '</span>';
    const carte = (x) => '<div class="mk-carte" data-fiche="' + esc(x.id) + '">' + tuile(x, true) + '<b>' + esc(x.nom) + '</b><small>' + (d.sec.get(x.id) ? '⏱ ' + heures(d.sec.get(x.id)) : esc(x.cat_icone || '')) + '</small></div>';
    const ligne = (x) => '<div class="mk-it" data-fiche="' + esc(x.id) + '">' + tuile(x, true) + '<div><b>' + (x.admin ? '🛡 ' : '') + esc(x.nom) + '</b><small>' + badge(x.compat) + (d.sec.get(x.id) ? '⏱ ' + heures(d.sec.get(x.id)) + ' · ' : '') + esc(x.description || x.categorie) + '</small></div>'
      + (d.installes.has(x.id) ? '<button data-ouvrir="' + esc(x.id) + '">ouvrir</button>' : '<button class="ok" data-installer="' + esc(x.id) + '">＋</button>') + '</div>';
    const rayon = (titre, info, l, vers) => l.length ? '<section class="mk-rayon"><h3><span>' + titre + '</span><small' + (vers ? ' data-voir="' + esc(vers) + '"' : '') + '>' + info + (vers ? ' ›' : '') + '</small></h3><div class="mk-defile">' + l.map(carte).join('') + '</div></section>' : '';
    const cats = () => { const n = new Map(); for (const x of d.items) n.set(x.categorie, [(n.get(x.categorie) || [0])[0] + 1, x.cat_icone]); return [...n.entries()].sort((a, b) => b[1][0] - a[1][0]).map(([k, [c, i]]) => [k, i, c]); };
    const puces = () => '<div class="mk-chips"><button data-cat="" class="' + (!cat ? 'on' : '') + '">tout · ' + d.items.length + '</button>' + cats().map(([k, i, c]) => '<button data-cat="' + esc(k) + '" class="' + (cat === k ? 'on' : '') + '">' + esc(i + ' ' + k + ' · ' + c) + '</button>').join('') + '</div>';
    const filtre = () => d.items.filter(x => (!cat || x.categorie === cat) && (!portee || porteeDe(x) === portee));
    // la portée : une deuxième rangée de puces (où il tourne : iPhone, Android, web, hors ligne)
    const pucesPortee = () => { const n = new Map(); for (const x of d.items) { const k = porteeDe(x); n.set(k, (n.get(k) || 0) + 1); }
      return '<div class="mk-chips mk-portees">' + PORTEES.filter(([k]) => n.get(k)).map(([k, g, t]) => '<button data-portee="' + k + '" title="' + esc(OU[k]) + '" class="' + (portee === k ? 'on' : '') + '">' + g + ' ' + esc(t) + ' · ' + n.get(k) + '</button>').join('') + '</div>'; };
    // l'ordre du jour (graine = la date) : pour « zéro heure » et « découvrir », il change chaque jour mais pas à chaque peinture
    const jour = new Date().toISOString().slice(0, 10), duJour = (l) => l.map(x => [teinte(x.id + jour), x]).sort((a, b) => a[0] - b[0]).map(e => e[1]);

    function peindre() {
      if (!vivant) return;
      hote.querySelectorAll('[data-vue]').forEach(b => b.classList.toggle('on', b.getAttribute('data-vue') === vue && !q.trim()));
      const az = hote.querySelector('.mk-az'); if (az) az.remove();
      const etat = d.horsLigne ? '<p class="n">📴 hors ligne : le catalogue du ' + esc((d.maj || '').slice(0, 10) || '—') + ' ; le pack s\'installe sans réseau</p>' : '';
      if (q.trim()) {
        const R = chercher(d.items, q, d.sec);
        zone.innerHTML = '<p class="n">' + (R.length ? R.length + ' résultat' + (R.length > 1 ? 's' : '') : 'rien pour « ' + esc(q) + ' »') + '</p>' + R.slice(0, 80).map(ligne).join('');
        return;
      }
      if (vue === 'vitrine') {
        const top = d.items.filter(x => d.sec.get(x.id)).sort(parHeures).slice(0, 16);
        const sc = new Map(); for (const i of d.installes) for (const [a, s] of d.ensemble[i] || []) if (!d.installes.has(a) && d.parId.has(a)) sc.set(a, (sc.get(a) || 0) + s);
        const avecToi = [...sc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([a]) => d.parId.get(a));
        const neufs = d.items.filter(x => x.mtime).sort((a, b) => b.mtime - a.mtime).slice(0, 14);
        const sansReseau = d.items.filter(x => d.pack.has(x.id) || (x.compat && x.compat.complet === 'oui')).sort(parHeures).slice(0, 16);
        const zero = duJour(d.items.filter(x => !d.sec.get(x.id))).slice(0, 14);
        zone.innerHTML = etat + (d.pop.heures_total != null ? '<p class="n">⭐ ' + heures(d.pop.heures_total * 3600) + ' passées dans les ploxions du Nexus · ' + (d.pop.utilises || 0) + ' utilisés · ' + (d.pop.zero || []).length + ' à zéro heure</p>' : '')
          + rayon('⭐ Le Nexus y passe ses heures', 'tout', top, 'grille') + rayon('🔗 Avec tes ploxions', 'souvent utilisés ensemble', avecToi) + rayon('✨ Nouveautés', '', neufs)
          + rayon('◇ Partout', 'iPhone · Android · web, hors ligne', duJour(d.items.filter(x => porteeDe(x) === 'partout')).slice(0, 16), 'portee:partout')
          + rayon('📦 Sans réseau', 'tournent hors ligne', sansReseau) + rayon('😴 Zéro heure', 'personne encore : sois le premier', zero)
          + cats().map(([k, i, c]) => rayon(esc(i + ' ' + k), c + '', d.items.filter(x => x.categorie === k).sort(parHeures).slice(0, 14), 'cat:' + k)).join('');
      } else if (vue === 'grille') {
        zone.innerHTML = etat + puces() + pucesPortee() + '<div class="mk-grille">' + filtre().sort(parHeures).map(carte).join('') + '</div>';
      } else if (vue === 'liste') {
        const L = filtre().sort((a, b) => lettre(a.nom).localeCompare(lettre(b.nom)) || a.nom.localeCompare(b.nom));
        let l0 = null, h = '';
        for (const x of L) { const l = lettre(x.nom); if (l !== l0) { h += '<div class="mk-sec" data-l="' + l + '">' + l + '</div>'; l0 = l; } h += ligne(x); }
        zone.innerHTML = etat + puces() + pucesPortee() + h;
        const barre = D.createElement('div'); barre.className = 'mk-az'; barre.innerHTML = [...new Set(L.map(x => lettre(x.nom)))].map(l => '<span data-az="' + l + '">' + l + '</span>').join('');
        hote.querySelector('.mk').appendChild(barre);
        const aller = (e) => { const el = D.elementFromPoint ? D.elementFromPoint(e.clientX, e.clientY) : e.target; const l = el && el.getAttribute && el.getAttribute('data-az'); const s = l && zone.querySelector('[data-l="' + l + '"]'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'start' }); };
        barre.addEventListener('pointerdown', (e) => { try { barre.setPointerCapture(e.pointerId); } catch (er) { /* */ } aller(e); });
        barre.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') aller(e); });
      } else if (vue === 'decouvrir') {
        peindreDeck(etat);
      } else {
        peindreMoi();
      }
    }

    function peindreDeck(etat) {
      const pile = duJour(d.items.filter(x => !d.installes.has(x.id) && !d.passes.has(x.id))).sort((a, b) => ((b.compat && b.compat.complet === 'oui') - (a.compat && a.compat.complet === 'oui')));
      const x = pile[0];
      if (!x) { zone.innerHTML = etat + '<div class="mk-deck"><p class="n">Tu as tout vu. 🎉</p><button data-remettre>remettre les passés</button></div>'; return; }
      zone.innerHTML = etat + '<div class="mk-deck"><p class="n">' + pile.length + ' à découvrir · glisse → installer, ← passer</p>'
        + '<div class="mk-dc" data-carte="' + esc(x.id) + '" style="--t:' + teinteDe(x.id) + ';background:hsl(' + teinteDe(x.id) + ' 20% 9%) var(--grain,none);border-color:hsl(' + teinteDe(x.id) + ' 20% 24%)">' + tuile(x) + '<h2>' + esc(x.nom) + '</h2><div>' + badge(x.compat) + '<span class="mk-b mk-q">' + esc(x.cat_icone + ' ' + x.categorie) + '</span>'
        + (d.sec.get(x.id) ? '<span class="mk-b mk-ok">⏱ ' + heures(d.sec.get(x.id)) + '</span>' : '<span class="mk-b mk-q">😴 zéro heure</span>') + '</div><p>' + esc(x.description || '') + '</p></div>'
        + '<div class="mk-dk"><button data-passer="' + esc(x.id) + '" title="passer">✕</button><button data-fiche="' + esc(x.id) + '" title="la fiche">ⓘ</button><button class="ok" data-garder="' + esc(x.id) + '" title="installer">＋</button></div></div>';
      const c = zone.querySelector('.mk-dc'); let x0 = null, dx = 0;
      c.addEventListener('pointerdown', (e) => { x0 = e.clientX; dx = 0; c.style.transition = 'none'; });
      c.addEventListener('pointermove', (e) => { if (x0 == null) return; dx = e.clientX - x0; c.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 18 + 'deg)'; });
      const lacher = () => { if (x0 == null) return; x0 = null; c.style.transition = ''; if (Math.abs(dx) > 90) decider(x.id, dx > 0); else c.style.transform = ''; };
      c.addEventListener('pointerup', lacher); c.addEventListener('pointercancel', lacher);
    }
    async function decider(id, prendre) {
      vibrer(prendre ? 'garder' : 'passer');
      const c = zone.querySelector('.mk-dc'); if (c) { c.style.transform = 'translateX(' + (prendre ? 120 : -120) + '%) rotate(' + (prendre ? 14 : -14) + 'deg)'; c.style.opacity = '0'; }
      if (prendre) { try { await installer(id); } catch (e) { d.passes.add(id); } } else d.passes.add(id);
      garder(); peindre();
    }

    async function peindreMoi() {
      const I = await depot.installes(), moi = ((await usage()) || { px: {} }).px || {};
      if (!vivant || vue !== 'moi' || q.trim()) return;
      zone.innerHTML = '<div class="mk-chips"><button data-ajour>⟳ vérifier les mises à jour</button></div><p class="n" data-msg></p>'
        + (I.length ? I.sort((a, b) => ((moi[b.id] || {}).seconds || 0) - ((moi[a.id] || {}).seconds || 0)).map(x => { const it = d.parId.get(x.id) || { ...x, categorie: '', description: '' };
          return '<div class="mk-it" data-fiche="' + esc(x.id) + '">' + tuile(it) + '<div><b>' + esc(x.nom) + '</b><small>' + (moi[x.id] ? '⏱ ' + heures(moi[x.id].seconds) + ' chez toi · ' : '') + esc(x.origine === 'pack' ? 'pack hors ligne' : 'installé') + ' le ' + esc((x.maj || x.installe || '').slice(0, 10)) + '</small></div><button data-ouvrir="' + esc(x.id) + '">ouvrir</button></div>'; }).join('')
          : '<p class="n">Aucun ploxion installé : la vitrine ou « découvrir » t\'attendent.</p>');
    }

    async function installer(id) {
      const x = d.parId.get(id) || { id, nom: id, icone: '▣' };
      // le pack d'abord quand il l'a (sans réseau, et c'est la version testée avec l'app)
      const r = d.pack.has(id) ? await depot.installerLocal(id) : await installerAvecBarre({ depot, id, meta: { nom: x.nom, icone: x.icone }, vibrer });
      d.installes.add(id); await surChangement();
      vibrer('installe');
      return r;
    }

    function ouvrirFiche(id) {
      const x = d.parId.get(id); if (!x) return;
      fermerFiche();
      const avec = (d.ensemble[id] || []).map(([a]) => d.parId.get(a)).filter(Boolean).slice(0, 8);
      const voisins = d.items.filter(y => y.categorie === x.categorie && y.id !== id).sort(parHeures).slice(0, 10);
      const inst = d.installes.has(id);
      feuille = D.createElement('div'); feuille.className = 'mk-voile';
      feuille.innerHTML = '<div class="mk-feuille" data-feuille="' + esc(id) + '"><div class="mk-poignee"></div><div class="mk-fh">' + tuile(x) + '<div><h2>' + esc(x.nom) + '</h2><div class="n" style="margin:0">' + esc(x.cat_icone + ' ' + x.categorie) + ' · ' + esc(x.id) + '</div></div></div>'
        + '<div class="mk-actions">' + (inst ? '<button class="plein" data-ouvrir="' + esc(id) + '">ouvrir</button>' + (W.jOSEcranAccueil ? '<button data-accueil="' + esc(id) + '" title="sur l\'écran d\'accueil de l\'iPhone">⌂</button>' : '') + '<button data-retirer="' + esc(id) + '">retirer</button>' : '<button class="plein" data-installer="' + esc(id) + '">installer' + (d.pack.has(id) ? ' · sans réseau' : '') + '</button>') + '</div>'
        + '<div>' + (x.admin ? '<span class="mk-b mk-mi" title="réservé aux admins (xeroction)">🛡 admin</span>' : '') + badgePortee(x) + '<span class="mk-b mk-q">' + esc(OU[porteeDe(x)]) + '</span>' + badge(x.compat) + (d.sec.get(id) ? '<span class="mk-b mk-ok">⏱ ' + heures(d.sec.get(id)) + ' dans le Nexus</span>' : '<span class="mk-b mk-q">😴 zéro heure</span>') + '</div>'
        + (x.description ? '<p>' + esc(x.description) + '</p>' : '') + (x.fournit && x.fournit.length ? '<div class="mk-tags">' + x.fournit.map(f => '<span>' + esc(f) + '</span>').join('') + '</div>' : '')
        + (avec.length ? '<section class="mk-rayon"><h3><span>🔗 Souvent utilisé avec</span></h3><div class="mk-defile">' + avec.map(carte).join('') + '</div></section>' : '')
        + (voisins.length ? '<section class="mk-rayon"><h3><span>' + esc(x.cat_icone) + ' Dans la même catégorie</span></h3><div class="mk-defile">' + voisins.map(carte).join('') + '</div></section>' : '') + '</div>';
      hote.querySelector('.mk').appendChild(feuille);
      feuille.addEventListener('click', (e) => { if (e.target === feuille) fermerFiche(); });
      // glisser vers le bas depuis le haut de la feuille = fermer
      const f = feuille.firstElementChild; let y0 = null;
      f.addEventListener('pointerdown', (e) => { if (f.scrollTop <= 0) y0 = e.clientY; });
      f.addEventListener('pointerup', (e) => { if (y0 != null && e.clientY - y0 > 80) fermerFiche(); y0 = null; });
    }
    function fermerFiche() { if (feuille && feuille.parentNode) feuille.parentNode.removeChild(feuille); feuille = null; }

    champ.addEventListener('input', () => { q = champ.value; peindre(); });
    champ.addEventListener('keydown', (e) => { if (e.key === 'Enter') { try { champ.blur(); } catch (er) { /* */ } } });
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button,[data-fiche],[data-voir]'); if (!b || !hote.contains(b)) return;
      if (b.hasAttribute('data-vue')) { vibrer('vue'); vue = b.getAttribute('data-vue'); q = ''; champ.value = ''; cat = ''; portee = ''; garder(); peindre(); return; }
      if (b.hasAttribute('data-cat')) { cat = b.getAttribute('data-cat'); return peindre(); }
      if (b.hasAttribute('data-portee')) { const k = b.getAttribute('data-portee'); portee = portee === k ? '' : k; if (vue !== 'grille' && vue !== 'liste') vue = 'grille'; vibrer('selection'); return peindre(); }
      if (b.hasAttribute('data-voir')) { const v = b.getAttribute('data-voir'); if (v.startsWith('cat:')) { cat = v.slice(4); portee = ''; vue = 'grille'; } else if (v.startsWith('portee:')) { portee = v.slice(7); cat = ''; vue = 'grille'; } else { vue = v; cat = ''; } garder(); return peindre(); }
      if (b.hasAttribute('data-passer')) return decider(b.getAttribute('data-passer'), false);
      if (b.hasAttribute('data-garder')) return decider(b.getAttribute('data-garder'), true);
      if (b.hasAttribute('data-remettre')) { d.passes.clear(); garder(); return peindre(); }
      if (b.hasAttribute('data-accueil')) { fermerFiche(); W.jOSEcranAccueil(b.getAttribute('data-accueil')); return; }
      if (b.hasAttribute('data-ouvrir')) { fermerFiche(); const o = W.jOS && W.jOS.openPloxion; if (o) o(b.getAttribute('data-ouvrir')); return; }
      if (b.tagName !== 'BUTTON') return ouvrirFiche(b.getAttribute('data-fiche'));
      if (b.hasAttribute('data-fiche')) return ouvrirFiche(b.getAttribute('data-fiche'));
      try {
        if (b.hasAttribute('data-installer')) {
          const id = b.getAttribute('data-installer'), dansFiche = !!b.closest('.mk-feuille'); b.disabled = true; b.textContent = '⏳';
          const r = await installer(id);
          if (dansFiche) { ouvrirFiche(id); const n = feuille && feuille.querySelector('.mk-actions'); if (n && r && r.bions && r.bions.length) n.insertAdjacentHTML('afterend', '<p class="n" style="margin:0 0 8px">+ ' + r.bions.length + ' bion' + (r.bions.length > 1 ? 's' : '') + ' : ' + esc(r.bions.join(', ')) + '</p>'); }
          else { b.disabled = false; b.removeAttribute('data-installer'); b.className = ''; b.textContent = 'ouvrir'; b.setAttribute('data-ouvrir', id); }
          return;
        }
        if (b.hasAttribute('data-retirer')) { const id = b.getAttribute('data-retirer'); await depot.retirer(id); d.installes.delete(id); await surChangement(); fermerFiche(); return peindre(); }
        if (b.hasAttribute('data-ajour')) { const m = zone.querySelector('[data-msg]'); m.textContent = '⏳'; const r = await depot.aJour(); await surChangement(); m.textContent = r.length ? r.map(x => x.id + ' : ' + ({ 'a-jour': 'à jour', 'mis-a-jour': 'mis à jour ✓', erreur: 'erreur ' + (x.detail || '') }[x.etat])).join(' · ') : 'rien à vérifier (le pack se met à jour avec l\'app)'; return; }
      } catch (er) { vibrer('erreur'); b.disabled = false; b.textContent = '⚠ ' + String(er.message || er).slice(0, 60); }
    });

    // d'abord le cache (immédiat, même en mode avion), puis le réseau derrière
    const pret = (async () => {
      if (prefs) { const p = (await prefs.lire().catch(() => null)) || {}; if (!params.vue && !params.onglet && p.vue && VUES.some(v => v[0] === p.vue)) vue = p.vue; }
      zone.innerHTML = '<p class="n">⏳</p>';
      await charger(false); if (!vivant) return; peindre();
      await charger(true).catch(() => {}); if (!vivant) return;
      if (!feuille && (D.activeElement !== champ || q.trim())) peindre();
      if (params.id) ouvrirFiche(String(params.id));
      if (params.chercher) { try { champ.focus(); } catch (e) { /* */ } }
    })();
    return { ready: pret, unmount() { vivant = false; fermerFiche(); hote.innerHTML = ''; },
      // ▣ (0.68) le contrat du cube des pages (src/app/cube-pages.js) : ses vues sont ses pages ; à la sortie, sa recherche et ses filtres reviennent
      pages: () => VUES.map(([k, , n]) => ({ cle: k, nom: n, actif: k === vue })),
      allerPage(k, o = {}) { if (!vivant || !VUES.some(v => v[0] === k)) return; if (!o.muet) vibrer('vue'); vue = k; q = ''; champ.value = ''; cat = ''; portee = ''; return peindre(); },
      garderEtat() { const s = { vue, q, cat, portee }; return () => { if (!vivant) return; ({ vue, q, cat, portee } = s); champ.value = q; return peindre(); }; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.marketplace = { manifest: { id: 'marketplace', name: 'Marketplace', icon: '🛍' }, mount };
  return { id: 'marketplace', nom: 'Marketplace', icone: '🛍', interne: true };
}
