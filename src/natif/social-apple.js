// 🍏 LE SOCIAL AVEC L'IDENTIFIANT APPLE (0.72). RS-7 (15.10, sur l'écran de connexion du ploxion « le social » : identifiant ou email, mot de
// passe, lien d'invitation) : « je veux que le social marche avec Apple ID, en indépendant de xerboxion social ».
// COMPOSER : le social (labo, /px/social/app.js) parle aux comptes j0bot (https://api.j0bot.ch/api/v1 : /auth/login → { token, user }) et garde
// sa session dans localStorage « jos_social_token » / « jos_social_user ». On ne le réécrit pas : on AJOUTE sur son écran de connexion
// (#so-f-login) un bouton « Continuer avec Apple » —
//   1. la feuille native d'Apple (celle du compte de l'app, src/natif/compte.js jetonApple : un nonce frais, son sha256 chez Apple) ;
//   2. POST api.j0bot.ch/api/v1/auth/apple { identity_token, nonce, nom } → { token, user }, la même forme que /auth/login : un compte j0bot
//      né de l'Apple ID (ou retrouvé), SANS le compte xerboxion du labo ;
//   3. la session posée là où le social la lit, puis le social remonté : il s'ouvre connecté.
// La route Apple d'api.j0bot.ch n'existe pas encore (404 au 15.10) : le bouton le dit. Son contrat exact : docs/SOCIAL-APPLE.md (la quête
// social-apple). Rien n'est envoyé ailleurs qu'à api.j0bot.ch ; le mot de passe n'est jamais touché.
export const SOCIAUX = new Set(['social', 'socialion', 'ultimate-social']);
export const API_SOCIAL = 'https://api.j0bot.ch/api/v1';

/** se connecter au social avec l'Apple ID : rend { token, user } ; lève une erreur lisible (err.absente : la route n'existe pas encore) */
export async function connecterSocialApple({ W = globalThis.window, jetonApple, fetch: f = (...a) => W.fetch(...a) }) {
  const { x, brut } = await jetonApple();
  const nom = [x.givenName, x.familyName].filter(Boolean).join(' ').trim();
  const r = await f(API_SOCIAL + '/auth/apple', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ identity_token: x.identityToken, nonce: brut, nom, client: 'ch.j0bot.ploxi0n' }) });
  let d = {}; try { d = await r.json(); } catch (e) { /* */ }
  if (r.status === 404 || r.status === 405) { const e = new Error('les comptes j0bot n\'ont pas encore la porte Apple (la quête social-apple)'); e.absente = true; throw e; }
  if (!r.ok || !d.token) throw new Error(d.message || d.error || 'connexion Apple refusée (' + r.status + ')');
  return { token: d.token, user: d.user || {} };
}

/** pose la session du social là où il la lit */
export function poserSession(W, { token, user }) {
  W.localStorage.setItem('jos_social_token', token);
  W.localStorage.setItem('jos_social_user', JSON.stringify(user || null));
}

/** ajoute « Continuer avec Apple » sous le formulaire de connexion du social, s'il est là (et une seule fois) */
export function ajouterBouton({ W = globalThis.window, hote, jetonApple, remonter = () => {}, vibrer = () => {}, natif = () => true, fetch: f }) {
  const form = hote && hote.querySelector('#so-f-login');
  if (!form || form.querySelector('[data-so-apple]') || !natif()) return false;
  const b = W.document.createElement('button');
  b.type = 'button'; b.className = 'so__btn so__apple'; b.setAttribute('data-so-apple', '');
  b.style.cssText = 'margin-top:10px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;gap:8px';
  b.innerHTML = '<span aria-hidden="true" style="font-size:1.15em"></span><span>Continuer avec Apple</span>';
  const msg = W.document.createElement('div'); msg.className = 'so__err'; msg.setAttribute('data-so-apple-msg', '');
  form.appendChild(b); form.appendChild(msg);
  b.addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation();
    b.disabled = true; msg.textContent = '';
    try {
      const s = await connecterSocialApple({ W, jetonApple, fetch: f });
      poserSession(W, s); vibrer('succes'); remonter();
    } catch (er) { msg.textContent = String((er && er.message) || er); vibrer('erreur'); }
    b.disabled = false;
  });
  return true;
}

/** surveille un ploxion social monté : le bouton apparaît chaque fois que son écran de connexion revient (déconnexion comprise) */
export function surveillerSocial({ W = globalThis.window, hote, ...o }) {
  if (!hote || !W.MutationObserver) return () => {};
  let attente = 0;
  const essayer = () => { attente = 0; ajouterBouton({ W, hote, ...o }); };
  essayer();
  const ob = new W.MutationObserver(() => { if (!attente) attente = W.setTimeout(essayer, 60); });
  ob.observe(hote, { childList: true, subtree: true });
  return () => { ob.disconnect(); if (attente) W.clearTimeout(attente); };
}
