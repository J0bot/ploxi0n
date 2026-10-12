// Le COMPTE de ploxi0n (RS-7 : « il faut un bouton se connecter facilement accessible dans le HUD et l'UI »). Côté labo : docs/dev/57.
//   connecter()      un verifier aléatoire + son challenge (SHA-256, base64url) → le navigateur intégré ouvre xerboxion.org/app/connexion ;
//                    la personne autorise ; le labo renvoie ploxi0n://connexion?code=… (brancherLiens → recevoirCode)
//   recevoirCode(c)  POST /api/app/jeton {code, verifier} → le jeton (jamais dans une URL) et le compte (nom, rang)
//   etat()           { connecte, nom, palier, glyphe } ; surChangement(fn) ; deconnecter() (le jeton est révoqué côté labo)
// Le jeton vit dans boxion_local (« compte/jeton »), chiffré par iOS (Data Protection). Hors iPhone : le navigateur ordinaire.
import { SOURCE } from '../marketplace/depot.js';

const b64url = (octets) => btoa(String.fromCharCode(...octets)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function creerCompte({ W = globalThis.window, boxion, http, source = SOURCE }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let etat = { connecte: false }, verifier = null;
  const abonnes = new Set();
  const signaler = () => { for (const f of abonnes) { try { f(etat); } catch (e) { /* */ } } };
  const pret = boxion.get('compte', 'courant').then(c => { if (c && c.jeton) etat = { connecte: true, ...c.compte }; signaler(); }).catch(() => {});

  async function poster(chemin, corps, jeton) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (jeton) headers.Authorization = 'Bearer ' + jeton;
    if (natif()) {
      const { CapacitorHttp } = await import('@capacitor/core');
      const r = await CapacitorHttp.post({ url: source + chemin, headers, data: corps || {} });
      return { status: r.status, data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : r.data };
    }
    const r = await W.fetch(source + chemin, { method: 'POST', headers, body: JSON.stringify(corps || {}) });
    return { status: r.status, data: await r.json().catch(() => ({})) };
  }

  return {
    pret, etat: () => etat,
    surChangement(f) { abonnes.add(f); return () => abonnes.delete(f); },
    async connecter() {
      const a = new Uint8Array(32); W.crypto.getRandomValues(a); verifier = b64url(a);
      await boxion.put('compte', 'verifier', verifier);   // l'app peut être tuée pendant le login
      const h = new Uint8Array(await W.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
      const url = source + '/app/connexion?challenge=' + b64url(h) + '&retour=' + encodeURIComponent('ploxi0n://connexion');
      if (natif()) { const { Browser } = await import('@capacitor/browser'); await Browser.open({ url, presentationStyle: 'popover' }); }
      else W.open(url, '_blank', 'noopener');
    },
    async recevoirCode(code) {
      if (natif()) { try { const { Browser } = await import('@capacitor/browser'); await Browser.close(); } catch (e) { /* déjà fermé */ } }
      const v = verifier || await boxion.get('compte', 'verifier');
      if (!code || !v) throw new Error('connexion interrompue : recommence');
      const r = await poster('/api/app/jeton', { code, verifier: v });
      await boxion.del('compte', 'verifier'); verifier = null;
      if (r.status !== 200 || !r.data.jeton) throw new Error((r.data && r.data.message) || 'connexion refusée');
      await boxion.put('compte', 'courant', { jeton: r.data.jeton, compte: r.data.compte, le: new Date().toISOString() });
      await boxion.append('tsoins', { kind: 'compte', action: 'connecter', palier: r.data.compte && r.data.compte.palier });
      etat = { connecte: true, ...r.data.compte }; signaler();
      return etat;
    },
    /** SE CONNECTER AVEC APPLE (12.10) : la feuille native d'Apple ; un nonce aléatoire (son sha256 part chez Apple, le brut au labo, qui
     *  vérifie que le jeton d'Apple est bien celui de CETTE demande) ; le labo crée un compte BION ou retrouve le sien (docs/dev/57) */
    async connecterApple() {
      if (!natif()) throw new Error('Se connecter avec Apple : sur l\'iPhone');
      const a = new Uint8Array(32); W.crypto.getRandomValues(a);
      const brut = Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
      const hache = Array.from(new Uint8Array(await W.crypto.subtle.digest('SHA-256', new TextEncoder().encode(brut))), b => b.toString(16).padStart(2, '0')).join('');
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      const r = await SignInWithApple.authorize({ clientId: 'ch.j0bot.ploxi0n', redirectURI: source, scopes: 'email name', nonce: hache, state: brut.slice(0, 16) });
      const x = (r && r.response) || {};
      if (!x.identityToken) throw new Error('Apple n\'a pas donné de jeton');
      const nom = [x.givenName, x.familyName].filter(Boolean).join(' ');
      const rep = await poster('/api/app/apple', { identity_token: x.identityToken, nonce: brut, nom });
      if (rep.status !== 200 || !rep.data.jeton) throw new Error((rep.data && rep.data.message) || 'connexion Apple refusée');
      await boxion.put('compte', 'courant', { jeton: rep.data.jeton, compte: rep.data.compte, le: new Date().toISOString(), via: 'apple' });
      await boxion.append('tsoins', { kind: 'compte', action: 'connecter-apple', palier: rep.data.compte && rep.data.compte.palier });
      etat = { connecte: true, ...rep.data.compte }; signaler();
      return etat;
    },
    /** le compte vu par le labo (rang, admin) : au démarrage, en ligne ; un jeton révoqué ou expiré → déconnecté */
    async rafraichir() {
      const c = await boxion.get('compte', 'courant'); if (!c || !c.jeton) return etat;
      try {
        let r;
        if (natif()) { const { CapacitorHttp } = await import('@capacitor/core'); const x = await CapacitorHttp.get({ url: source + '/api/app/moi', headers: { Accept: 'application/json', Authorization: 'Bearer ' + c.jeton } }); r = { status: x.status, data: typeof x.data === 'string' ? JSON.parse(x.data || '{}') : x.data }; }
        else { const x = await W.fetch(source + '/api/app/moi', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + c.jeton } }); r = { status: x.status, data: await x.json().catch(() => ({})) }; }
        if (r.status === 401) { await boxion.del('compte', 'courant'); etat = { connecte: false }; signaler(); return etat; }
        if (r.status === 200 && r.data.compte) { await boxion.put('compte', 'courant', { ...c, compte: r.data.compte }); etat = { connecte: true, ...r.data.compte }; signaler(); }
      } catch (e) { /* hors ligne : on garde ce qu'on sait */ }
      return etat;
    },
    async jeton() { const c = await boxion.get('compte', 'courant'); return c ? c.jeton : null; },
    async deconnecter() {
      const c = await boxion.get('compte', 'courant');
      if (c && c.jeton) await poster('/api/app/deconnexion', {}, c.jeton).catch(() => {});
      await boxion.del('compte', 'courant');
      await boxion.append('tsoins', { kind: 'compte', action: 'deconnecter' });
      etat = { connecte: false }; signaler();
    },
  };
}
