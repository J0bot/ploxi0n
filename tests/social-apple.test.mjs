// 🍏 (0.72) le social avec l'Apple ID : le bouton sur son écran de connexion ; la route d'api.j0bot.ch ; la session posée là où il la lit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ajouterBouton, connecterSocialApple, surveillerSocial, API_SOCIAL } from '../src/natif/social-apple.js';
import { page, attendre } from './aide.mjs';

const jetonApple = async () => ({ x: { identityToken: 'jwt.apple', givenName: 'Jos', familyName: 'Ion' }, brut: 'n0nce' });
const rep = (status, corps) => async () => ({ status, ok: status >= 200 && status < 300, json: async () => corps });

test('🍏 la route : envoie le jeton d\'Apple et le nonce brut ; rend la session ; 404 → « pas encore la porte Apple »', async () => {
  let envoye = null;
  const f = async (url, o) => { envoye = { url, corps: JSON.parse(o.body) }; return rep(200, { token: 'tok', user: { username: 'jos' } })(); };
  const s = await connecterSocialApple({ W: {}, jetonApple, fetch: f });
  assert.deepEqual(s, { token: 'tok', user: { username: 'jos' } });
  assert.equal(envoye.url, API_SOCIAL + '/auth/apple'); assert.deepEqual(envoye.corps, { identity_token: 'jwt.apple', nonce: 'n0nce', nom: 'Jos Ion', client: 'ch.j0bot.ploxi0n' });
  await assert.rejects(connecterSocialApple({ W: {}, jetonApple, fetch: rep(404, {}) }), (e) => e.absente === true);
  await assert.rejects(connecterSocialApple({ W: {}, jetonApple, fetch: rep(422, { message: 'jeton invalide' }) }), /jeton invalide/);
});

test('🍏 le bouton : une seule fois sur #so-f-login ; connecté → la session dans jos_social_token, le social remonté ; revient après une déconnexion', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, hote = D.createElement('div'); D.body.appendChild(hote);
    hote.innerHTML = '<div id="so-f-login"><input id="so-login"><button id="so-b-login">Se connecter</button></div>';
    let remontes = 0;
    const stop = surveillerSocial({ W, hote, jetonApple, remonter: () => remontes++, fetch: rep(200, { token: 'tok', user: { username: 'jos' } }) });
    assert.equal(hote.querySelectorAll('[data-so-apple]').length, 1);
    assert.equal(ajouterBouton({ W, hote, jetonApple }), false, 'pas deux fois');
    hote.querySelector('[data-so-apple]').click(); await attendre(20);
    assert.equal(W.localStorage.getItem('jos_social_token'), 'tok'); assert.deepEqual(JSON.parse(W.localStorage.getItem('jos_social_user')), { username: 'jos' });
    assert.equal(remontes, 1);
    hote.innerHTML = '<p>le fil</p>'; await attendre(80);
    hote.innerHTML = '<div id="so-f-login"><button id="so-b-login">Se connecter</button></div>'; await attendre(120);
    assert.ok(hote.querySelector('[data-so-apple]'), 'déconnecté : le bouton revient');
    stop();
    const h2 = D.createElement('div'); h2.innerHTML = '<div id="so-f-login"></div>';
    assert.equal(ajouterBouton({ W, hote: h2, jetonApple, natif: () => false }), false, 'hors iPhone : pas de feuille Apple, pas de bouton');
  } finally { p.fin(); }
});
