// 🍏 LE SOCIAL AVEC L'IDENTIFIANT APPLE (0.72). RS-7 (15.10, sur l'écran de connexion du ploxion « le social » : identifiant ou email, mot de
// passe, lien d'invitation) : « je veux que le social marche avec Apple ID, en indépendant de xerboxion social ».
// COMPOSER : le social (labo, /px/social/app.js) parle aux comptes j0bot (https://api.j0bot.ch/api/v1 : /auth/login → { token, user }) et garde
// sa session dans localStorage « jos_social_token » / « jos_social_user ». On ne le réécrit pas : on AJOUTE sur son écran de connexion
// (#so-f-login) un bouton « Continuer avec Apple » —
//   1. la feuille native d'Apple (celle du compte de l'app, src/natif/compte.js jetonApple : un nonce frais, son sha256 chez Apple) ;
//   2. POST api.j0bot.ch/api/v1/auth/apple { identity_token, nonce, nom } → { token, user }, la même forme que /auth/login : un compte j0bot
//      né de l'Apple ID (ou retrouvé), SANS le compte xerboxion du labo ;
//   3. la session posée là où le social la lit, puis le social remonté : il s'ouvre connecté.
// (0.84) la route existe (api.j0bot.ch, 22.10) et l'inscription y reste SUR INVITATION : un Apple ID déjà lié entre ; un Apple ID nouveau
// entre avec le code d'une invitation (gardé quand un lien d'invitation a ouvert l'app, sinon collé ici) ; « j'ai déjà un compte » lie l'Apple
// ID au compte de l'identifiant et du mot de passe de l'écran du social. Et ⚙ › Compte supprime ce compte (Apple l'exige : DELETE /me).
// Contrat : docs/SOCIAL-APPLE.md. Rien n'est envoyé ailleurs qu'à api.j0bot.ch ; le mot de passe ne sert qu'à /auth/login, jamais gardé.
// `fetch` : dans l'app, le HTTP natif (main.js) — l'api ne parle pas en CORS à capacitor://localhost avant son redéploiement.
export const SOCIAUX = new Set(['social', 'socialion', 'ultimate-social']);
export const API_SOCIAL = 'https://api.j0bot.ch/api/v1';
const JSON_ENTETES = { 'Content-Type': 'application/json', Accept: 'application/json' };
const lire = async (r) => { try { return (await r.json()) || {}; } catch (e) { return {}; } };

/** un lien d'invitation (…/px/invite?code=…, …/local?px=invite&code=…, /join?inv=…) ou un code collé → le code, sinon '' */
export function codeInvitation(texte) {
  const t = String(texte || '').trim(); if (!t) return '';
  try { const u = new URL(t); const c = u.searchParams.get('code') || u.searchParams.get('inv') || ''; return /^[A-Za-z0-9_-]{4,100}$/.test(c) ? c : ''; } catch (e) { /* pas une adresse */ }
  return /^[A-Za-z0-9_-]{4,100}$/.test(t) ? t : '';
}

/** le lien reçu par l'app (liens.js : { id, lien }) est une invitation du social (le ploxion invite : …?px=invite&code=…) ? → son code, gardé
 *  pour « Continuer avec Apple » (les invitations à un palier, ploxion invitation, sont celles du labo : pas des comptes j0bot) */
export function invitationDuLien(r) {
  if (!r || r.id !== 'invite') return '';
  return codeInvitation('https://x/' + (r.lien || ''));
}

/** se connecter au social avec l'Apple ID : rend { token, user, cree } ; `apple` : la feuille déjà passée ({ x, brut }, pour réessayer avec un
 *  code sans la remontrer) ; lève une erreur lisible : err.absente (pas de route), err.invitation (Apple ID nouveau, il faut un code) ;
 *  err.apple rend la feuille pour l'essai suivant */
export async function connecterSocialApple({ W = globalThis.window, jetonApple, fetch: f = (...a) => W.fetch(...a), code = '', apple = null }) {
  const a = apple || await jetonApple();
  const { x, brut } = a;
  const nom = [x.givenName, x.familyName].filter(Boolean).join(' ').trim();
  const corps = { identity_token: x.identityToken, nonce: brut, nom, client: 'ch.j0bot.ploxi0n' };
  if (code) corps.code = code;
  const r = await f(API_SOCIAL + '/auth/apple', { method: 'POST', headers: JSON_ENTETES, body: JSON.stringify(corps) });
  const d = await lire(r);
  if (r.status === 404 || r.status === 405) { const e = new Error('les comptes j0bot n\'ont pas encore la porte Apple (la quête social-apple)'); e.absente = true; throw e; }
  if (r.status === 403 && d.invitation_requise) { const e = new Error(d.message || 'cet Apple ID n\'a pas encore de compte : il faut une invitation'); e.invitation = true; e.apple = a; throw e; }
  if (!r.ok || !d.token) { const e = new Error(d.message || d.error || 'connexion Apple refusée (' + r.status + ')'); if (/invitation/i.test(e.message)) e.apple = a; throw e; }
  return { token: d.token, user: d.user || {}, cree: r.status === 201 };
}

/** « j'ai déjà un compte » : /auth/login (identifiant, mot de passe), puis l'Apple ID lié à ce compte (/auth/apple/lier) ; rend { token, user } */
export async function lierSocialApple({ W = globalThis.window, jetonApple, fetch: f = (...a) => W.fetch(...a), login, password, apple = null }) {
  if (!login || !password) throw new Error('remplis ton identifiant et ton mot de passe au-dessus');
  const r = await f(API_SOCIAL + '/auth/login', { method: 'POST', headers: JSON_ENTETES, body: JSON.stringify({ login, password }) });
  const d = await lire(r);
  if (!r.ok || !d.token) throw new Error(r.status === 401 ? 'identifiant ou mot de passe faux' : (d.message || d.error || 'connexion refusée (' + r.status + ')'));
  const a = apple || await jetonApple();
  const r2 = await f(API_SOCIAL + '/auth/apple/lier', { method: 'POST', headers: { ...JSON_ENTETES, Authorization: 'Bearer ' + d.token }, body: JSON.stringify({ identity_token: a.x.identityToken, nonce: a.brut }) });
  const d2 = await lire(r2);
  if (!r2.ok) throw new Error(d2.message || d2.error || 'liaison refusée (' + r2.status + ')');
  return { token: d.token, user: d.user || {} };
}

/** la session du social sur ce téléphone : { token, user } ou null */
export function sessionSocial(W = globalThis.window) {
  try { const token = W.localStorage.getItem('jos_social_token'); if (!token) return null; let user = null; try { user = JSON.parse(W.localStorage.getItem('jos_social_user') || 'null'); } catch (e) { /* */ } return { token, user: user || {} }; } catch (e) { return null; }
}

/** ⚙ › Compte : supprimer le compte du social (règle App Store 5.1.1(v)) ; la session part avec lui */
export async function supprimerCompteSocial({ W = globalThis.window, fetch: f = (...a) => W.fetch(...a) }) {
  const s = sessionSocial(W); if (!s) throw new Error('pas de compte du social sur ce téléphone');
  const r = await f(API_SOCIAL + '/me', { method: 'DELETE', headers: { ...JSON_ENTETES, Authorization: 'Bearer ' + s.token }, body: JSON.stringify({ confirmer: 'supprimer' }) });
  const d = await lire(r);
  if (r.status === 401) throw new Error('ta session du social a expiré : reconnecte-toi dans le social, puis recommence');
  if (!r.ok) throw new Error(d.message || d.error || 'suppression refusée (' + r.status + ')');
  try { W.localStorage.removeItem('jos_social_token'); W.localStorage.removeItem('jos_social_user'); } catch (e) { /* */ }
  return true;
}

/** pose la session du social là où il la lit */
export function poserSession(W, { token, user }) {
  W.localStorage.setItem('jos_social_token', token);
  W.localStorage.setItem('jos_social_user', JSON.stringify(user || null));
}

/** ajoute « Continuer avec Apple » sous le formulaire de connexion du social, s'il est là (et une seule fois) ;
 *  invitation() : le code gardé (un lien d'invitation a ouvert l'app) ; oublier() : il a servi */
export function ajouterBouton({ W = globalThis.window, hote, jetonApple, remonter = () => {}, vibrer = () => {}, natif = () => true, fetch: f, invitation = async () => '', oublier = async () => {} }) {
  const form = hote && hote.querySelector('#so-f-login');
  if (!form || form.querySelector('[data-so-apple]') || !natif()) return false;
  const D = W.document;
  const b = D.createElement('button');
  b.type = 'button'; b.className = 'so__btn so__apple'; b.setAttribute('data-so-apple', '');
  b.style.cssText = 'margin-top:10px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;gap:8px';
  b.innerHTML = '<span aria-hidden="true" style="font-size:1.15em"></span><span>Continuer avec Apple</span>';
  const msg = D.createElement('div'); msg.className = 'so__err'; msg.setAttribute('data-so-apple-msg', '');
  // (0.84) Apple ID nouveau : coller l'invitation, ou lier à un compte existant
  const plus = D.createElement('div'); plus.setAttribute('data-so-apple-plus', ''); plus.hidden = true; plus.style.cssText = 'margin-top:10px;display:grid;gap:8px';
  plus.innerHTML = '<input data-so-apple-code autocapitalize="none" autocomplete="off" placeholder="ton lien d\'invitation (ou son code)">'
    + '<button type="button" class="so__btn" data-so-apple-creer>Créer mon compte avec Apple</button>'
    + '<small style="opacity:.75">déjà un compte j0bot ? identifiant et mot de passe au-dessus, puis :</small>'
    + '<button type="button" class="so__btn ghost" data-so-apple-lier>Lier mon Apple ID à ce compte</button>';
  form.appendChild(b); form.appendChild(plus); form.appendChild(msg);
  let apple = null;   // la feuille déjà passée : réessayer sans la remontrer (le jeton d'Apple vit 10 min)
  const entrer = (s) => { poserSession(W, s); vibrer('succes'); remonter(); };
  const echec = (er) => { apple = (er && er.apple) || null; msg.textContent = String((er && er.message) || er); vibrer('erreur'); };
  async function geste(bouton, faire) {
    for (const x of form.querySelectorAll('[data-so-apple],[data-so-apple-creer],[data-so-apple-lier]')) x.disabled = true;
    msg.textContent = '';
    try { await faire(); } catch (er) { echec(er); }
    for (const x of form.querySelectorAll('[data-so-apple],[data-so-apple-creer],[data-so-apple-lier]')) x.disabled = false;
  }
  b.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    geste(b, async () => {
      apple = null;
      const garde = await Promise.resolve().then(invitation).catch(() => '');
      try {
        const s = await connecterSocialApple({ W, jetonApple, fetch: f, code: garde });
        if (s.cree) await Promise.resolve().then(oublier).catch(() => {});
        entrer(s);
      } catch (er) {
        if (er.invitation || (garde && er.apple)) {   // nouveau, ou l'invitation gardée ne vaut plus : la coller, ou lier
          if (garde && !er.invitation) await Promise.resolve().then(oublier).catch(() => {});
          plus.hidden = false; const c = plus.querySelector('[data-so-apple-code]'); if (garde && er.invitation) c.value = garde;
        }
        throw er;
      }
    });
  });
  plus.addEventListener('click', (e) => {
    const x = e.target.closest('button'); if (!x || !plus.contains(x)) return;
    e.preventDefault(); e.stopPropagation();
    if (x.hasAttribute('data-so-apple-creer')) geste(x, async () => {
      const code = codeInvitation(plus.querySelector('[data-so-apple-code]').value);
      if (!code) throw Object.assign(new Error('colle le lien d\'invitation qu\'un ami t\'a envoyé'), { apple });
      const s = await connecterSocialApple({ W, jetonApple, fetch: f, code, apple });
      await Promise.resolve().then(oublier).catch(() => {});
      entrer(s);
    });
    if (x.hasAttribute('data-so-apple-lier')) geste(x, async () => {
      const l = form.querySelector('#so-login'), p = form.querySelector('#so-pass');
      try { entrer(await lierSocialApple({ W, jetonApple, fetch: f, login: l ? l.value.trim() : '', password: p ? p.value : '', apple })); }
      catch (er) { if (/mot de passe|identifiant/.test(er.message)) er.apple = apple; throw er; }   // un mot de passe faux : la feuille d'Apple reste valable
    });
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
