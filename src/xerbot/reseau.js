// 🤖 LE RÉSEAU LOCAL DU CONTRÔLEUR XERB0T (0.75). RS-7 (16.10) : « se connecter avec Home Assistant, WLED, tous les trucs genre ESP, Arduino,
// Raspberry Pi ; un controller pour checker tout ça et contrôler tout ça ».
// Sur l'iPhone, tout passe par le natif :
//   requete()   CapacitorHttp (URLSession) : pas de CORS (ni Home Assistant, ni boxion-rt n'en envoient), pas de contenu mixte ; un délai court
//               (sinon 600 s par défaut) et un second essai (la toute première requête vers le réseau local peut être refusée pendant
//               qu'iOS demande la permission « réseau local ») ; JAMAIS le relais du labo (il ajouterait le jeton du compte)
//   flux()      PloxiApple.httpFlux : un flux SSE lu quelques instants (ESPHome /events, boxion-rt /events)
//   chercher()  PloxiApple.reseauChercher : Bonjour (NWBrowser) ; resoudre() : l'adresse IPv4 d'un service
// Hors iPhone (le navigateur de dev, les essais) : fetch, et pas de Bonjour.
// Les clés d'Info.plist : NSAllowsLocalNetworking, NSLocalNetworkUsageDescription, NSBonjourServices (= TYPES_BONJOUR).
export const TYPES_BONJOUR = ['_home-assistant._tcp', '_wled._tcp', '_esphomelib._tcp', '_http._tcp', '_arduino._tcp', '_ssh._tcp', '_workstation._tcp', '_mqtt._tcp', '_shelly._tcp'];

/** « 192.168.1.5 », « wled.local:80 », « http://ha:8123/ » → « http://hôte[:port] » (sans / final) ; port : celui par défaut du type */
export function normaliser(adresse, port = null) {
  let a = String(adresse || '').trim(); if (!a) return '';
  if (!/^https?:\/\//i.test(a)) a = 'http://' + a;
  try {
    const u = new URL(a);
    if (port && !u.port && !/^https:/i.test(a) && !/:\d+$/.test(u.host)) u.port = String(port);
    return (u.protocol + '//' + u.host + u.pathname).replace(/\/+$/, '');
  } catch (e) { return ''; }
}

/** les lignes d'un flux SSE → [{ event, data }] (data : l'objet JSON si c'en est un) */
export function lireSSE(lignes) {
  const out = []; let ev = 'message';
  for (const l of lignes || []) {
    if (l.startsWith('event:')) ev = l.slice(6).trim();
    else if (l.startsWith('data:')) { const t = l.slice(5).trim(); let d = t; try { d = JSON.parse(t); } catch (e) { /* texte */ } out.push({ event: ev, data: d }); ev = 'message'; }
  }
  return out;
}

const attendre = (ms) => new Promise((ok) => setTimeout(ok, ms));

export function creerReseauLocal({ W = globalThis.window, http = () => import('@capacitor/core'), plugin = null } = {}) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const finir = (status, texte, entetes = {}) => { let json = null; try { json = texte ? JSON.parse(texte) : null; } catch (e) { /* pas du JSON */ } return { status, texte, json, entetes }; };
  async function une({ methode, url, entetes, corps, delai }) {
    if (natif()) {
      const { CapacitorHttp } = await http();   // le module, jamais le plugin (un Proxy) rendu par une promesse
      const r = await CapacitorHttp.request({ method: methode, url, headers: entetes, data: corps == null ? undefined : corps, connectTimeout: delai, readTimeout: delai, responseType: 'text' });
      const h = {}; for (const k in (r.headers || {})) h[k.toLowerCase()] = r.headers[k];
      return finir(r.status, typeof r.data === 'string' ? r.data : (r.data == null ? '' : JSON.stringify(r.data)), h);
    }
    const ac = typeof W.AbortController === 'function' ? new W.AbortController() : null;
    const t = setTimeout(() => ac && ac.abort(), delai);
    try {
      const r = await W.fetch(url, { method: methode, headers: entetes, body: corps == null ? undefined : (typeof corps === 'string' ? corps : JSON.stringify(corps)), signal: ac ? ac.signal : undefined });
      const h = {}; if (r.headers && r.headers.forEach) r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return finir(r.status, await r.text(), h);
    } finally { clearTimeout(t); }
  }
  return {
    natif,
    /** { status, texte, json, entetes } ; lève sur une erreur réseau (après `essais`) */
    async requete({ methode = 'GET', url, entetes = {}, corps, delai = 4000, essais = 2 }) {
      let derniere = null;
      const e = { Accept: 'application/json', ...(corps != null && typeof corps !== 'string' ? { 'Content-Type': 'application/json' } : {}), ...entetes };
      for (let i = 0; i < essais; i++) {
        try { return await une({ methode, url, entetes: e, corps, delai }); } catch (er) { derniere = er; if (i + 1 < essais) await attendre(600); }
      }
      throw derniere || new Error('réseau');
    },
    /** les lignes d'un flux (SSE) lu pendant `duree` ms */
    async flux({ url, duree = 1500, entetes = {} }) {
      if (natif() && plugin) { const r = await plugin.httpFlux({ url, duree, entetes }); return { lignes: (r && r.lignes) || [], statut: (r && r.statut) || 0 }; }
      const ac = typeof W.AbortController === 'function' ? new W.AbortController() : null;
      const lignes = []; const t = setTimeout(() => ac && ac.abort(), duree); let statut = 0;
      try {
        const r = await W.fetch(url, { headers: { Accept: 'text/event-stream', ...entetes }, signal: ac ? ac.signal : undefined }); statut = r.status;
        if (r.body && r.body.getReader) {
          const lecteur = r.body.getReader(), dec = new TextDecoder(); let reste = '';
          for (;;) { const { done, value } = await lecteur.read(); if (done) break; reste += dec.decode(value, { stream: true }); const l = reste.split('\n'); reste = l.pop(); lignes.push(...l.map(x => x.replace(/\r$/, ''))); }
        } else lignes.push(...(await r.text()).split('\n'));
      } catch (e) { /* la fin voulue (abort) ou le réseau */ } finally { clearTimeout(t); }
      return { lignes, statut };
    },
    /** Bonjour : [{ nom, type, domaine, txt }] (rien hors iPhone) */
    async chercher({ types = TYPES_BONJOUR, duree = 4000 } = {}) {
      if (!natif() || !plugin) return [];
      const r = await plugin.reseauChercher({ types, duree });
      return (r && r.services) || [];
    },
    /** l'adresse d'un service Bonjour : { hote, port } */
    async resoudre(s) {
      if (!natif() || !plugin) throw new Error('Bonjour : sur l\'iPhone');
      return plugin.reseauResoudre({ nom: s.nom, type: s.type, domaine: s.domaine || 'local.' });
    },
  };
}
