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
