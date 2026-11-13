// 🍏 (0.72) le social avec l'Apple ID : le bouton sur son écran de connexion ; la route d'api.j0bot.ch ; la session posée là où il la lit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ajouterBouton, connecterSocialApple, surveillerSocial, API_SOCIAL, codeInvitation, invitationDuLien, lierSocialApple, supprimerCompteSocial, sessionSocial } from '../src/natif/social-apple.js';
import { page, attendre } from './aide.mjs';

const jetonApple = async () => ({ x: { identityToken: 'jwt.apple', givenName: 'Jos', familyName: 'Ion' }, brut: 'n0nce' });
const rep = (status, corps) => async () => ({ status, ok: status >= 200 && status < 300, json: async () => corps });

test('🍏 la route : envoie le jeton d\'Apple et le nonce brut ; rend la session ; 404 → « pas encore la porte Apple »', async () => {
  let envoye = null;
  const f = async (url, o) => { envoye = { url, corps: JSON.parse(o.body) }; return rep(200, { token: 'tok', user: { username: 'jos' } })(); };
  const s = await connecterSocialApple({ W: {}, jetonApple, fetch: f });
  assert.deepEqual(s, { token: 'tok', user: { username: 'jos' }, cree: false });
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

test('🎟 (0.84) l\'invitation : un lien du ploxion invite, un code collé ; les invitations du labo (palier) ne comptent pas', () => {
  assert.equal(codeInvitation('https://labo.j0bot.ch/local?px=invite&code=Ab12Cd34Ef56Gh78&join=3'), 'Ab12Cd34Ef56Gh78');
  assert.equal(codeInvitation('https://labo.j0bot.ch/px/invite?code=Zz9_x-'), 'Zz9_x-');
  assert.equal(codeInvitation('  Ab12Cd34Ef56Gh78 '), 'Ab12Cd34Ef56Gh78');
  assert.equal(codeInvitation('un mot de passe ?'), '');
  assert.equal(codeInvitation('https://labo.j0bot.ch/px/social'), '');
  assert.equal(invitationDuLien({ id: 'invite', lien: '?code=Ab12Cd34&join=1' }), 'Ab12Cd34');
  assert.equal(invitationDuLien({ id: 'invitation', lien: '?code=Ab12Cd34&niv=kion' }), '');
  assert.equal(invitationDuLien({ id: 'social', lien: '?code=Ab12Cd34' }), '');
});

/** une fausse api.j0bot.ch : les Apple ID liés, les invitations, les comptes */
function fausseApi() {
  const lies = new Map([['sub-rs4', { id: 'u-rs4', username: 'rs4' }]]), codes = new Set(['BON-CODE-1']), comptes = new Map([['rs3', 'secret']]);
  const appels = [];
  const f = async (url, o = {}) => {
    const b = o.body ? JSON.parse(o.body) : {}; appels.push({ url: url.replace(API_SOCIAL, ''), methode: o.method, b, auth: (o.headers || {}).Authorization });
    const sub = b.identity_token && b.identity_token.replace('jwt.', '');
    const chemin = url.replace(API_SOCIAL, '');
    if (chemin === '/auth/apple') {
      if (lies.has(sub)) return rep(200, { token: 'tok-' + lies.get(sub).username, user: lies.get(sub) })();
      if (!b.code) return rep(403, { message: 'Cet Apple ID n\'a pas encore de compte j0bot.', invitation_requise: true })();
      if (!codes.has(b.code)) return rep(422, { message: 'Invitation invalide, expirée ou épuisée.' })();
      codes.delete(b.code); const u = { id: 'u-' + sub, username: 'nouveau' }; lies.set(sub, u); return rep(201, { token: 'tok-nouveau', user: u })();
    }
    if (chemin === '/auth/login') return comptes.get(b.login) === b.password ? rep(200, { token: 'tok-' + b.login, user: { username: b.login } })() : rep(401, { error: 'Invalid credentials' })();
    if (chemin === '/auth/apple/lier') { if (lies.has(sub)) return rep(409, { message: 'Cet Apple ID est déjà lié à un autre compte j0bot.' })(); lies.set(sub, { username: o.headers.Authorization.replace('Bearer tok-', '') }); return rep(200, { message: 'Apple ID lié.' })(); }
    if (chemin === '/me' && o.method === 'DELETE') return o.headers.Authorization === 'Bearer tok-ok' && b.confirmer === 'supprimer' ? rep(200, { message: 'Compte supprimé.' })() : rep(401, {})();
    return rep(404, {})();
  };
  return { f, appels, lies };
}
const feuille = (sub) => async () => ({ x: { identityToken: 'jwt.' + sub, givenName: 'RS-3' }, brut: 'n0nce' });

test('🍏 (0.84) Apple ID nouveau : 403 → coller l\'invitation (sans remontrer la feuille) → le compte ; un mauvais code le dit', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, hote = D.createElement('div'); D.body.appendChild(hote);
    hote.innerHTML = '<div id="so-f-login"><input id="so-login"><input id="so-pass" type="password"></div>';
    const api = fausseApi(); let feuilles = 0, remontes = 0, oublis = 0;
    ajouterBouton({ W, hote, jetonApple: async () => { feuilles++; return feuille('sub-rs3')(); }, fetch: api.f, remonter: () => remontes++, oublier: () => { oublis++; } });
    const plus = hote.querySelector('[data-so-apple-plus]'), msg = hote.querySelector('[data-so-apple-msg]');
    assert.equal(plus.hidden, true);
    hote.querySelector('[data-so-apple]').click(); await attendre(20);
    assert.equal(plus.hidden, false, 'Apple ID nouveau : le panneau'); assert.match(msg.textContent, /pas encore de compte/);
    plus.querySelector('[data-so-apple-code]').value = 'https://labo.j0bot.ch/local?px=invite&code=MAUVAIS-1';
    plus.querySelector('[data-so-apple-creer]').click(); await attendre(20);
    assert.match(msg.textContent, /Invitation invalide/); assert.equal(remontes, 0);
    plus.querySelector('[data-so-apple-code]').value = 'https://labo.j0bot.ch/local?px=invite&code=BON-CODE-1&join=2';
    plus.querySelector('[data-so-apple-creer]').click(); await attendre(20);
    assert.equal(feuilles, 1, 'la feuille d\'Apple une seule fois'); assert.equal(remontes, 1); assert.equal(oublis, 1);
    assert.equal(W.localStorage.getItem('jos_social_token'), 'tok-nouveau');
    assert.equal(api.appels.at(-1).b.code, 'BON-CODE-1'); assert.equal(api.appels.at(-1).b.nonce, 'n0nce');
  } finally { p.fin(); }
});

test('🍏 (0.84) l\'invitation gardée (le lien a ouvert l\'app) part toute seule ; un Apple ID lié entre sans elle', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, hote = D.createElement('div'); D.body.appendChild(hote);
    hote.innerHTML = '<div id="so-f-login"></div>';
    const api = fausseApi(); let oublis = 0, remontes = 0;
    ajouterBouton({ W, hote, jetonApple: feuille('sub-zoe'), fetch: api.f, invitation: async () => 'BON-CODE-1', oublier: () => { oublis++; }, remonter: () => remontes++ });
    hote.querySelector('[data-so-apple]').click(); await attendre(20);
    assert.equal(remontes, 1); assert.equal(oublis, 1, 'elle a servi : oubliée'); assert.equal(hote.querySelector('[data-so-apple-plus]').hidden, true);
    // déjà lié : la même porte, le code ne sert pas (et n'est pas oublié)
    const h2 = D.createElement('div'); h2.innerHTML = '<div id="so-f-login"></div>'; D.body.appendChild(h2);
    let oublis2 = 0;
    ajouterBouton({ W, hote: h2, jetonApple: feuille('sub-rs4'), fetch: api.f, invitation: async () => 'X-CODE-9', oublier: () => { oublis2++; } });
    h2.querySelector('[data-so-apple]').click(); await attendre(20);
    assert.equal(W.localStorage.getItem('jos_social_token'), 'tok-rs4'); assert.equal(oublis2, 0);
  } finally { p.fin(); }
});

test('🍏 (0.84) « j\'ai déjà un compte » : identifiant et mot de passe de l\'écran du social → l\'Apple ID lié ; la prochaine fois, Apple suffit', async () => {
  const api = fausseApi();
  await assert.rejects(lierSocialApple({ jetonApple: feuille('sub-rs3'), fetch: api.f, login: 'rs3', password: '' }), /remplis/);
  await assert.rejects(lierSocialApple({ jetonApple: feuille('sub-rs3'), fetch: api.f, login: 'rs3', password: 'faux' }), /mot de passe faux/);
  assert.deepEqual(await lierSocialApple({ jetonApple: feuille('sub-rs3'), fetch: api.f, login: 'rs3', password: 'secret' }), { token: 'tok-rs3', user: { username: 'rs3' } });
  assert.equal(api.appels.at(-1).auth, 'Bearer tok-rs3');
  const s = await connecterSocialApple({ jetonApple: feuille('sub-rs3'), fetch: api.f });
  assert.equal(s.token, 'tok-rs3');
  await assert.rejects(lierSocialApple({ jetonApple: feuille('sub-rs4'), fetch: api.f, login: 'rs3', password: 'secret' }), /déjà lié/);
});

test('🗑 (0.84) supprimer le compte du social : DELETE /me confirmé, la session part ; expirée → le dire', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, api = fausseApi();
    W.localStorage.removeItem('jos_social_token');
    assert.equal(sessionSocial(W), null);
    await assert.rejects(supprimerCompteSocial({ W, fetch: api.f }), /pas de compte/);
    W.localStorage.setItem('jos_social_token', 'tok-vieux');
    await assert.rejects(supprimerCompteSocial({ W, fetch: api.f }), /expiré/);
    W.localStorage.setItem('jos_social_token', 'tok-ok'); W.localStorage.setItem('jos_social_user', JSON.stringify({ username: 'rs3' }));
    assert.equal(sessionSocial(W).user.username, 'rs3');
    assert.equal(await supprimerCompteSocial({ W, fetch: api.f }), true);
    assert.equal(W.localStorage.getItem('jos_social_token'), null); assert.equal(sessionSocial(W), null);
  } finally { p.fin(); }
});
