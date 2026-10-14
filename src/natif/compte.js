// Le COMPTE de ploxi0n (RS-7 : « il faut un bouton se connecter facilement accessible dans le HUD et l'UI »). Côté labo : docs/dev/57.
//   connecter()      un verifier aléatoire + son challenge (SHA-256, base64url) → le navigateur intégré ouvre labo.j0bot.ch/app/connexion ;
//                    la personne autorise ; le labo renvoie ploxi0n://connexion?code=… (brancherLiens → recevoirCode)
//   recevoirCode(c)  POST /api/app/jeton {code, verifier} → le jeton (jamais dans une URL) et le compte (nom, rang)
//   etat()           { connecte, nom, palier, glyphe } ; surChangement(fn) ; deconnecter() (le jeton est révoqué côté labo)
// Le jeton vit dans boxion_local (« compte/jeton »), chiffré par iOS (Data Protection). Hors iPhone : le navigateur ordinaire.
// 💭 EXTRAPOLATIONS XERBOXION (RS-7, 13–14.10 — en attendant de les créer ; le braindump vit ici, au plus près du compte) :
//   - LES SESSIONS dans Compte : « ma session de test » qui repart de zéro à chaque fois, la session « xeroction » ; une session = un xer
//     (ses ploxions, son thème, son fond, ses gestes) qu'on prépare, qu'on rejoue et qu'on partage (le marketplace de xers iOS) ;
//   - LE XER DE LA REVUE D'APPLE : un bion pour Apple (jamais celui de RS-7) et SON xer préparé — « ce compte-là, ça va être une pépite »
//     (docs/APP-STORE.md) ; c'est la même mécanique que la session de test ;
//   - LE PORTION des deux bords : l'axe x = les xers, l'axe y = les sessions ; on y choisit sa session, on revient à l'accueil ;
//   - SON XERBION et SON XERPLOXION (RS-7, 14.10 : « le xerbion, c'est les données des bions du ploxion, et le xerploxion, c'est la version
//     holographique d'un ploxion ») — posés en 0.66 : le xerbion sur le dessus du cube (src/app/xerbion.js), le xerploxion par ◈
//     (routeur.js, basculerHolo). 💭 la suite : le xerbion dans la carte (de près), le xerploxion projeté hors de l'écran (AR, Vision Pro) ;
//   - LE PARTAGE DE TSOINS entre bions par le compte Apple (Game Center, CloudKit : un stockage commun aux iPhone), la messagerie entre
//     bions, le Bluetooth (sans réseau : les amis off the grid de la vision originelle), l'accès au nexus (labo.j0bot.ch) ;
//   - LA MILKY WAY FOUNDATION (milkywayhub.org, à but non lucratif) dans l'app : payer l'électricité de quelqu'un, financer des missions,
//     des bières par drone, récupérer des colis, des missions de minage d'astéroïdes, un mandat pour un poste ; un abonnement pour soutenir
//     le projet ou louer du compute (la moitié du boxion pour le xerboxion, l'autre pour le nexus : l'abonné a du compute de qualité h24,
//     le reste est le compute gratuit du nexus) — les règles d'Apple (numérique = achat intégré ; monde réel = Apple Pay ; dons = une
//     association approuvée) sont dans docs/APP-STORE.md ;
//   - demander à Apple (la mise en vedette) de soutenir l'open source sur iPhone : une bibliothèque commune entre les apps du nexus.
import { SOURCE } from '../marketplace/depot.js';

const b64url = (octets) => btoa(String.fromCharCode(...octets)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function creerCompte({ W = globalThis.window, boxion, http, source = SOURCE }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let etat = { connecte: false }, verifier = null;
  const abonnes = new Set();
  const signaler = () => { for (const f of abonnes) { try { f(etat); } catch (e) { /* */ } } };
  const pret = boxion.get('compte', 'courant').then(c => { if (c && c.jeton) etat = { connecte: true, ...c.compte }; signaler(); }).catch(() => {});

  /** la feuille Apple : un nonce frais (le labo vérifie son sha256 dans le jeton), le jeton d'identité */
  async function jetonApple() {
    if (!natif()) throw new Error('Apple : sur l\'iPhone');
    const a = new Uint8Array(32); W.crypto.getRandomValues(a);
    const brut = Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    const hache = Array.from(new Uint8Array(await W.crypto.subtle.digest('SHA-256', new TextEncoder().encode(brut))), b => b.toString(16).padStart(2, '0')).join('');
    const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
    const r = await SignInWithApple.authorize({ clientId: 'ch.j0bot.ploxi0n', redirectURI: source, scopes: 'email name', nonce: hache, state: brut.slice(0, 16) });
    const x = (r && r.response) || {};
    if (!x.identityToken) throw new Error('Apple n\'a pas donné de jeton');
    return { x, brut };
  }
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
      const { x, brut } = await jetonApple();
      const nom = [x.givenName, x.familyName].filter(Boolean).join(' ');
      const rep = await poster('/api/app/apple', { identity_token: x.identityToken, nonce: brut, nom });
      if (rep.status !== 200 || !rep.data.jeton) throw new Error((rep.data && rep.data.message) || 'connexion Apple refusée');
      await boxion.put('compte', 'courant', { jeton: rep.data.jeton, compte: rep.data.compte, le: new Date().toISOString(), via: 'apple' });
      await boxion.append('tsoins', { kind: 'compte', action: 'connecter-apple', palier: rep.data.compte && rep.data.compte.palier });
      etat = { connecte: true, ...rep.data.compte }; signaler();
      return etat;
    },
    /** LIER son Apple ID au compte connecté (RS-7 12.10 : « connecté en labo.j0bot.ch, il faut aussi pouvoir se connecter avec Apple ID —
     *  que l'un des deux ») : ensuite « Continuer avec Apple » ouvre CE compte. delierApple() : le compte revient à sa seule connexion xer. */
    async lierApple({ fusionner = false } = {}) {
      const c = await boxion.get('compte', 'courant'); if (!c || !c.jeton) throw new Error('connecte-toi d\'abord avec ton compte labo.j0bot.ch');
      const { x, brut } = await jetonApple();
      const rep = await poster('/api/app/apple/lier', { identity_token: x.identityToken, nonce: brut, fusionner }, c.jeton);
      if (rep.status !== 200) {
        // 409 « fusionnable » : cet Apple ID a déjà son compte (né d'Apple) — le HUD propose de le fondre dans celui-ci (RS-7 : « il faut pouvoir merge »)
        const e = new Error((rep.data && rep.data.message) || 'liaison Apple refusée (' + rep.status + ')');
        if (rep.data && rep.data.fusionnable) { e.fusionnable = true; e.autre = rep.data.autre || null; }
        throw e;
      }
      if (rep.data.fusion) await boxion.append('tsoins', { kind: 'compte', action: 'fusion-apple', ...rep.data.fusion }).catch(() => {});
      await boxion.put('compte', 'courant', { ...c, compte: rep.data.compte });
      await boxion.append('tsoins', { kind: 'compte', action: 'lier-apple' });
      etat = { connecte: true, ...rep.data.compte }; signaler();
      return etat;
    },
    async delierApple() {
      const c = await boxion.get('compte', 'courant'); if (!c || !c.jeton) throw new Error('pas connecté');
      const rep = await poster('/api/app/apple/delier', {}, c.jeton);
      if (rep.status !== 200) throw new Error((rep.data && rep.data.message) || 'refusé (' + rep.status + ')');
      await boxion.put('compte', 'courant', { ...c, compte: rep.data.compte });
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
