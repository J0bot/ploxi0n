// ◈ (0.78) le clicker et le clickion en natif : le toucher instantané (un par doigt, le clic d'iOS avalé), jamais un clic droit, le temps
// d'absence rattrapé par le moteur du labo, la partie publiée pour les widgets ; les vrais bundles du pack montent et jouent
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerClickerNatif, toucherRapide, resumePartie, choisirClassements, scoresPartie } from '../src/jeu/clicker-natif.js';
import { page, attendre } from './aide.mjs';

const touche = (W, el, id) => el.dispatchEvent(new W.PointerEvent('pointerdown', { bubbles: true, pointerId: id, pointerType: 'touch', clientX: 10, clientY: 10 }));
const leve = (W, el, id) => el.dispatchEvent(new W.PointerEvent('pointerup', { bubbles: true, pointerId: id, pointerType: 'touch' }));

test('👆 le cœur compte au toucher, un par doigt ; le clic d\'iOS qui suit est avalé ; ailleurs, rien ne change', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    if (!W.PointerEvent) W.PointerEvent = class extends W.MouseEvent { constructor(t, o = {}) { super(t, o); this.pointerId = o.pointerId; this.pointerType = o.pointerType; } };
    creerClickerNatif({ W, vrai: (e) => !!e.vraiClicIos });   // jsdom ne laisse pas simuler isTrusted
    const h = D.createElement('div'); h.className = 'px-hote'; h.dataset.ploxion = 'clickion'; h.innerHTML = '<button class="ck-cube" data-cube>◈</button><button data-tab="x">onglet</button>'; D.body.appendChild(h);
    const cube = h.querySelector('[data-cube]'), autre = h.querySelector('[data-tab]'); let n = 0, m = 0;
    h.addEventListener('click', (e) => { if (e.target.closest('[data-cube]')) n++; else m++; });
    assert.equal(toucherRapide(cube), true); assert.equal(toucherRapide(autre), false);
    touche(W, cube, 1); touche(W, cube, 2);   // deux doigts
    assert.equal(n, 2);
    leve(W, cube, 1); leve(W, cube, 2);
    const vrai = new W.MouseEvent('click', { bubbles: true, cancelable: true }); vrai.vraiClicIos = true;   // le clic d'iOS, après le doigt levé
    cube.dispatchEvent(vrai);
    assert.equal(n, 2, 'le vrai clic d\'après est avalé');
    cube.dispatchEvent(new W.MouseEvent('click', { bubbles: true }));   // un clic de programme passe toujours
    assert.equal(n, 3);
    autre.click(); assert.equal(m, 1);
    const ailleurs = D.createElement('div'); ailleurs.className = 'px-hote'; ailleurs.dataset.ploxion = 'piano'; ailleurs.innerHTML = '<button data-cube>x</button>'; D.body.appendChild(ailleurs);
    assert.equal(toucherRapide(ailleurs.firstChild), false, 'seulement dans les clickers');
  } finally { p.fin(); }
});

test('◈ les vrais bundles : 🎮 Jeu monte hors ligne, le moteur est enveloppé, la partie résumée pour le widget', async () => {
  const p = await page({ avion: true, ploxions: ['xp', 'clickion'] });
  try {
    const W = p.w, publies = [];
    const cn = creerClickerNatif({ W, publier: (k, t, v) => publies.push([k, v]) });
    assert.equal(await p.routeur.ouvrir('xp'), true); await attendre(150);
    const C = W.jOSXerClicker;
    assert.ok(C && C.__natif, 'le moteur du labo enveloppé');
    W.localStorage.setItem('xb:xpclick', JSON.stringify({ v: 3, v31: true, L: 45.66, dims: 3, owned: {}, t: Date.now() }));
    const r = cn.publierPartie();
    assert.match(r.texte, /^◈ 4\.57·10\^45 · ∞3$/);
    assert.deepEqual(publies, [['px.clicker', r.texte]]);
    assert.equal(resumePartie('pas du json', C), null);
    cn.arreter();
  } finally { p.fin(); }
});

test('⏱ le Clickion seul, resté ouvert pendant que l\'iPhone dormait : le temps d\'absence est rattrapé et dit', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, dits = [];
    const cn = creerClickerNatif({ W, signaler: (t) => dits.push(t) });
    const st = { t: Date.now() - 3 * 3600e3, L: 10 };
    W.jOSXerClicker = { fmtL: (L) => L.toFixed(2), production: (c, s) => ({ L: 1 }), rattraper(ctx, s, now) { const dt = (now - s.t) / 1000; s.t = now; s.L += 1 + Math.log10(dt); return { s: dt, L: 1 + Math.log10(dt) }; } };
    W.jOSXerClicker.production({ heures: 2 }, st);   // le tic du Clickion passe son contexte
    W.__xpPartie = { st };
    const h = D.createElement('div'); h.className = 'px-hote'; h.dataset.ploxion = 'clickion'; D.body.appendChild(h);
    cn._cache(Date.now() - 2 * 3600e3);   // caché depuis 2 h
    st.t = Date.now();   // le tic du Clickion a réécrit t au réveil
    const r = cn.auRetour();
    assert.ok(r && Math.abs(r.s - 7200) < 5, 'les 2 h de l\'absence : ' + (r && r.s));
    assert.match(dits[0], /^◈ pendant ton absence \(2 h\) : \+/);
    cn._cache(Date.now() - 3600e3); const h2 = D.createElement('div'); h2.className = 'px-hote'; h2.dataset.ploxion = 'xp'; D.body.appendChild(h2);
    assert.equal(cn.auRetour(), null, '🎮 Jeu ouvert : il rattrape lui-même (jamais deux fois)');
    cn.arreter();
  } finally { p.fin(); }
});

test('🏆 Game Center : le classement du clicker trouvé parmi ceux de l\'app, le record en exposant au centième', () => {
  assert.deepEqual(choisirClassements([{ id: '001', titre: 'Xeroctions' }, { id: 'clicker.record', titre: 'Clicker du xerboxion' }, { id: 'clicker.dims', titre: 'Dimensions' }]), { record: 'clicker.record', dims: 'clicker.dims' });
  assert.deepEqual(choisirClassements([{ id: '001', titre: 'Xeroctions' }, { id: '002', titre: 'Le meilleur' }]), { record: '002', dims: null }, 'le seul qui n\'est pas Xeroctions');
  assert.deepEqual(choisirClassements([{ id: '001', titre: 'Xeroctions' }]), { record: null, dims: null });
  assert.deepEqual(choisirClassements([{ id: 'a', titre: 'A' }, { id: 'b', titre: 'B' }]), { record: null, dims: null }, 'deux inconnus : on ne devine pas');
  assert.deepEqual(scoresPartie({ L: 12.3, dims: 4.9, stats: { meilleur: 45.666 } }), { record: 4566, dims: 4 });
  assert.equal(scoresPartie({ L: null, stats: {} }), null);
  assert.ok(scoresPartie({ L: 1e300, stats: {} }).record <= Number.MAX_SAFE_INTEGER);
});

test('🏆 se connecter à la première partie, envoyer quand le record monte, 🏆 dans la barre ouvre le classement', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, appels = [], garde = { v: null };
    const jeu = { connecter: async () => { appels.push('connecter'); return { connecte: true, nom: 'RS-7' }; }, classements: async () => [{ id: '001', titre: 'Xeroctions' }, { id: 'ploxi0n.clicker', titre: 'Clicker' }],
      score: async (c, s) => { appels.push(['score', c, s]); return { ok: true }; }, ouvrir: async (c) => { appels.push(['ouvrir', c]); return { ok: true }; } };
    const cn = creerClickerNatif({ W, jeu, intervalle: 20, garder: { lire: () => garde.v, ecrire: (v) => { garde.v = v; } } });
    assert.deepEqual(cn.boutonsBarre('piano'), []); assert.equal(cn.boutonsBarre('xp')[0].texte, '🏆');
    W.localStorage.setItem('xb:xpclick', JSON.stringify({ L: 20, stats: { meilleur: 20.5 } }));
    const h = D.createElement('div'); h.className = 'px-hote'; h.dataset.ploxion = 'xp'; D.body.appendChild(h);
    await attendre(120);
    assert.deepEqual(appels.slice(0, 2), ['connecter', ['score', 'ploxi0n.clicker', 2050]]);
    assert.deepEqual(garde.v, { record: 2050, dims: 0 });
    assert.equal(await cn.envoyerScore(true), null, 'rien de neuf : rien envoyé');
    W.localStorage.setItem('xb:xpclick', JSON.stringify({ L: 31, stats: { meilleur: 31 } }));
    await cn.boutonsBarre('xp')[0].faire();
    assert.deepEqual(appels.slice(-2), [['score', 'ploxi0n.clicker', 3100], ['ouvrir', 'ploxi0n.clicker']]);
    assert.equal(appels.filter(a => a === 'connecter').length, 1, 'une seule connexion');
    cn.arreter();
  } finally { p.fin(); }
});

test('🏆 le routeur : les boutons d\'un ploxion dans sa barre', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let n = 0;
    W.jOSApps = W.jOSApps || {}; W.jOSApps.xp = { manifest: { id: 'xp' }, mount: (h) => { h.innerHTML = '<p>jeu</p>'; return {}; } };
    const racine = D.createElement('div'); D.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'xp', nom: 'Jeu' }], boutonsBarre: (id) => (id === 'xp' ? [{ cle: 'classement', texte: '🏆', faire: () => { n++; } }] : []) });
    await r.ouvrir('xp');
    const b = racine.querySelector('[data-barre-x="classement"]'); assert.ok(b, 'le bouton dans la barre');
    b.click(); assert.equal(n, 1);
  } finally { p.fin(); }
});
