// 🎧 (0.99.34) le xer de Spotify : sur la page du labo (ses classes .sp__…), la recherche, la playlist qui glisse, « tout jouer », le lecteur déplié
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { habillerSpotify, plat, XERS_PLOXIONS } from '../src/app/xer-spotify.js';

const attendre = () => new Promise(r => setTimeout(r, 40));
function pageLabo(W) {
  const h = W.document.createElement('div'); h.className = 'px-hote'; W.document.body.appendChild(h);
  h.innerHTML = '<div class="sp"><div class="sp__top"><div class="sp__side" data-side></div><div class="sp__main" data-main><div class="sp__msg">connexion…</div></div></div>'
    + '<div class="sp__bar" data-bar style="display:none"><img class="sp__barimg" data-bimg alt=""><div class="sp__barn"><div class="sp__bart">—</div><div class="sp__bara"></div></div>'
    + '<div class="sp__ctl"><button class="sp__cb" data-prev>⏮</button><button class="sp__cb main" data-pp>▶</button><button class="sp__cb" data-next>⏭</button></div><div class="sp__seek"></div></div></div>';
  return h;
}
const biblio = '<div class="sp__grp">tes sons</div><div class="sp__pl" data-liked><img class="sp__plimg" src=""><div class="sp__pln"><div class="sp__plt">💚 Titres likés</div><div class="sp__plc">3291 titres</div></div></div>'
  + '<div class="sp__grp">playlists · 3</div>' + ['Séption', 'Zone 1', 'Zone 2'].map((n, i) => '<div class="sp__pl" data-pl="p' + i + '"><img class="sp__plimg" src="c' + i + '.jpg"><div class="sp__pln"><div class="sp__plt">' + n + '</div><div class="sp__plc">' + (i + 2) + ' titres</div></div></div>').join('');

test('🎧 le xer s\'enregistre pour spotify ; chercher sans accents', () => {
  assert.equal(XERS_PLOXIONS.spotify, habillerSpotify);
  assert.equal(plat('Séption'), 'seption');
});

test('🎧 la bibliothèque : la recherche, le cœur des likés ; une playlist glisse avec sa pochette, « tout jouer », ‹ tes sons', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true }); const W = dom.window;
  const h = pageLabo(W), vib = [], x = habillerSpotify(h, { W, vibrer: (v) => vib.push(v) });
  assert.ok(h.classList.contains('px-xsp'));
  h.querySelector('.sp__side').innerHTML = biblio; await attendre();
  const q = h.querySelector('.px-xsp-q'); assert.ok(q, 'la recherche posée quand les playlists arrivent');
  assert.ok(h.querySelector('.px-xsp-coeur'), 'l\'image sans source des likés devient un cœur');
  q.value = 'sept'; q.dispatchEvent(new W.Event('input'));
  assert.deepEqual([...h.querySelectorAll('[data-pl]')].filter(e => !e.hidden).map(e => e.querySelector('.sp__plt').textContent), ['Séption']);
  q.value = ''; q.dispatchEvent(new W.Event('input'));
  // le labo : la playlist choisie (.on) et ses pistes dans le panneau principal
  const pl = h.querySelector('[data-pl="p1"]'); pl.classList.add('on');
  let joue = null;
  h.querySelector('.sp__main').innerHTML = '<div class="sp__htitle">Zone 1</div><div class="sp__tr" data-uri="u1">a</div><div class="sp__tr" data-uri="u2">b</div>';
  h.querySelectorAll('.sp__tr').forEach(t => t.addEventListener('click', () => { joue = t.getAttribute('data-uri'); }));
  await attendre();
  assert.ok(h.querySelector('.sp__top').classList.contains('px-xsp-pistes'));
  assert.equal(h.querySelector('.px-xsp-cover img').getAttribute('src'), 'c1.jpg');
  assert.equal(h.querySelector('.px-xsp-info small').textContent, '3 titres');
  h.querySelector('.px-xsp-tout').click(); assert.equal(joue, 'u1', '« tout jouer » = la première piste, par le code du labo');
  h.querySelector('.px-xsp-retour').click(); assert.ok(!h.querySelector('.sp__top').classList.contains('px-xsp-pistes'));
  assert.ok(vib.includes('revenir'));
  // une autre playlist : la tête se refait
  h.querySelector('.sp__main').innerHTML = '<div class="sp__htitle">Zone 2</div>'; await attendre();
  assert.equal(h.querySelectorAll('.px-xsp-tete').length, 1); assert.ok(h.querySelector('.sp__top').classList.contains('px-xsp-pistes'));
  x.couper(); assert.ok(!h.classList.contains('px-xsp'));
});

test('🎧 le lecteur : toucher la carte la déplie (sans voler les boutons du labo), ⌄ la replie, la pochette en fond', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true }); const W = dom.window;
  const h = pageLabo(W); habillerSpotify(h, { W });
  const bar = h.querySelector('.sp__bar'); bar.style.display = 'flex'; h.querySelector('.sp__barimg').setAttribute('src', 'art.jpg'); await attendre();
  assert.match(bar.style.getPropertyValue('--xsp-art'), /art\.jpg/);
  let pp = 0; h.querySelector('[data-pp]').addEventListener('click', () => pp++);
  h.querySelector('[data-pp]').click(); assert.equal(pp, 1); assert.ok(!bar.classList.contains('px-xsp-grand'), 'un bouton du labo ne déplie pas');
  h.querySelector('.sp__barn').click(); assert.ok(bar.classList.contains('px-xsp-grand'));
  h.querySelector('.px-xsp-fermer').click(); assert.ok(!bar.classList.contains('px-xsp-grand'));
});

test('🎧 une page du labo qui change ses classes : le xer ne touche à rien', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="h"><div class="autre"><p>nouvelle UI</p></div></div></body>', { pretendToBeVisual: true }); const W = dom.window;
  const h = W.document.getElementById('h'); habillerSpotify(h, { W }); await attendre();
  assert.equal(h.querySelector('.autre').outerHTML, '<div class="autre"><p>nouvelle UI</p></div>');
});
