// 🎞 LE LECTEUR INTÉGRÉ, côté page (0.49, RS-7 : « pour le ploxion stremio, il faut lui donner un lecteur intégré »). Le lecteur natif de
// l'app (PloxiLecteur : Apple d'abord — PiP, AirPlay, écran verrouillé —, VLC en repli pour MKV, DTS, sous-titres) pour tous les ploxions,
// sans les réécrire :
//   - jOSNatif.lecteur.ouvrir(url, { titre, position, moteur, entetes, sousTitres }) ; il reprend où on s'était arrêté (par adresse) ;
//   - le PLUGION jOSplayer (le bion lecteur du labo, celui de Stremio) : open(url) / embed(cible, url) d'une vidéo → le lecteur natif ;
//   - une <video> que la WebView ne sait pas lire (MKV, codec) → le lecteur natif, tout seul ; une vidéo SANS SON (AC3/DTS que la WebView
//     décode mal) → une bulle « pas de son ? ▶ lecteur natif » ;
//   - les liens vers les lecteurs externes (vlc://, infuse://, outplayer://, nplayer-…) restent dans l'app ;
//   - ploxi0n://lire?url=…&titre=…&position=… (le bouton « ▶ ploxi0n » d'un ploxion SEUL, dans Safari : docs/LECTEUR.md).
// Réglages : boxion_local « reglages/lecteur-natif » = { moteur: auto|apple|vlc, auto: true } ; « lecteur-positions/<clé> » = { position, duree, le }.
import { PloxiLecteur } from './plugins-app.js';

const VIDEO = /\.(mp4|m4v|mov|mkv|avi|webm|wmv|flv|ts|m2ts|m3u8|mpd|ogv|vob|divx)(\?|#|$)/i;
/** l'adresse du flux derrière un lien vers un lecteur externe (vlc://, infuse://x-callback-url/play?url=…, nplayer-https://…) — ou null */
export function fluxDuLienExterne(href) {
  const h = String(href || '').trim();
  const m = /^(vlc|vlc-x-callback|infuse|outplayer|nplayer-https?|nplayer|vidhub|senplayer|playerxtreme|kmplayer)(:\/\/|:)(.*)$/i.exec(h); if (!m) return null;
  if (/^nplayer-https?$/i.test(m[1])) return m[1].slice(8) + '://' + m[3];
  const q = /[?&]url=([^&]+)/i.exec(h); if (q) { try { return decodeURIComponent(q[1]); } catch (e) { return q[1]; } }
  const reste = m[3].replace(/^\/+/, '');
  if (/^https?:\/\//i.test(reste)) return reste;
  if (/^https?%3A/i.test(reste)) { try { return decodeURIComponent(reste); } catch (e) { /* */ } }
  return null;
}
const cleDe = (url) => { let h = 0; const s = String(url).replace(/[?#].*$/, ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'p' + (h >>> 0).toString(36); };

export function creerLecteurNatif({ W = globalThis.window, boxion, plugin = PloxiLecteur, vibrer = () => {}, titre = () => '' } = {}) {
  const D = W.document, natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let reglage = { moteur: 'auto', auto: true }, moteurs = null, ecoute = false, courant = null;
  const pret = boxion.get('reglages', 'lecteur-natif').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const abonnes = new Set();

  async function lesMoteurs() { if (moteurs) return moteurs; if (!natif) return { apple: false, vlc: false }; try { moteurs = await plugin.moteurs(); } catch (e) { moteurs = { apple: false, vlc: false }; } return moteurs; }
  function ecouter() {
    if (ecoute || !natif) return; ecoute = true;
    plugin.addListener('lecteur', async (e) => {
      if (!e || !courant) return;
      if (e.etat === 'position' || e.etat === 'ferme') {
        if (e.position > 5) await boxion.put('lecteur-positions', courant.cle, { position: e.position, duree: e.duree || 0, titre: courant.titre, url: courant.url, le: Date.now() }).catch(() => {});
      }
      if (e.etat === 'fin') await boxion.del('lecteur-positions', courant.cle).catch(() => {});
      if (e.etat === 'erreur') vibrer('erreur');
      try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('natif', 'lecteur', { ...e, url: courant.url, titre: courant.titre }); } catch (er) { /* */ }
      for (const f of abonnes) { try { f({ ...e, url: courant.url }); } catch (er) { /* */ } }
      if (e.etat === 'ferme' || e.etat === 'fin') courant = null;
    }).catch(() => { ecoute = false; });
  }
  /** ouvrir une vidéo dans le lecteur natif ; il reprend où on s'était arrêté (sauf position donnée) */
  async function ouvrir(url, o = {}) {
    if (!natif) throw new Error('le lecteur natif : sur l\'iPhone');
    const adresse = String(url || ''); if (!/^https?:\/\//i.test(adresse) && !/^file:/i.test(adresse)) throw new Error('adresse de vidéo illisible');
    await pret; ecouter();
    const cle = o.cle || cleDe(adresse);
    let position = o.position;
    if (position == null) { const p = await boxion.get('lecteur-positions', cle).catch(() => null); position = p && p.position > 30 && (!p.duree || p.position < p.duree - 60) ? p.position : 0; }
    courant = { cle, url: adresse, titre: o.titre || titre() || '' };
    vibrer('ouvrir');
    return plugin.ouvrir({ url: adresse, titre: courant.titre, position: +position || 0, moteur: o.moteur || reglage.moteur, entetes: o.entetes || {}, sousTitres: (o.sousTitres || []).map(String) });
  }

  // ---- le PLUGION jOSplayer (le bion lecteur du labo) -------------------------------------------------------------------------------------
  const estVideo = (b, url) => { try { const r = b.resolve ? b.resolve(url) : null; return (r && r.kind === 'video') || VIDEO.test(String(url || '')); } catch (e) { return VIDEO.test(String(url || '')); } };
  function brancherJosPlayer(b) {
    if (!b || b.__lecteurNatif) return false;
    try { Object.defineProperty(b, '__lecteurNatif', { value: true, enumerable: false }); } catch (e) { /* */ }
    const open = b.open && b.open.bind(b), embed = b.embed && b.embed.bind(b);
    if (open) b.open = (url, ...a) => (natif && reglage.auto !== false && url && estVideo(b, url) ? ouvrir(url).catch(() => open(url, ...a)) : open(url, ...a));
    if (embed) b.embed = (cible, url, ...a) => {
      if (!(natif && reglage.auto !== false && url && estVideo(b, url))) return embed(cible, url, ...a);
      const el = typeof cible === 'string' ? D.getElementById(cible) : cible;
      if (el) { el.innerHTML = '<button type="button" style="position:absolute;inset:0;width:100%;border:0;background:#000;color:#ddd6ea;font:600 14px system-ui">▶ lecture dans le lecteur de l\'iPhone</button>'; el.firstChild.onclick = () => ouvrir(url).catch(() => {}); }
      ouvrir(url).catch(() => embed(cible, url, ...a));
      return { kind: 'video', src: url, who: 'lecteur natif' };
    };
    return true;
  }

  // ---- une <video> de la page : illisible → natif ; muette → la bulle ------------------------------------------------------------------
  const vus = new WeakSet();
  function surMedia(m) {
    if (!natif || vus.has(m) || m.tagName !== 'VIDEO') return; vus.add(m);
    const src = () => m.currentSrc || m.src || (m.querySelector('source') || {}).src || '';
    m.addEventListener('error', () => {
      const e = m.error, s = src();
      if (reglage.auto === false || !e || (e.code !== 4 && e.code !== 3) || !/^https?:/i.test(s)) return;
      ouvrir(s, { titre: m.getAttribute('title') || '' }).catch(() => {});
    });
    let verifie = false;
    m.addEventListener('timeupdate', () => {
      if (verifie || m.currentTime < 4) return; verifie = true;
      if (m.muted || m.volume === 0 || typeof m.webkitAudioDecodedByteCount !== 'number' || m.webkitAudioDecodedByteCount > 0) return;
      const s = src(); if (!/^https?:/i.test(s)) return;
      bulle('🔇 pas de son ? (AC3/DTS)', '▶ lecteur natif', () => { m.pause(); ouvrir(s, { titre: m.getAttribute('title') || '', position: m.currentTime }).catch(() => {}); });
    });
  }
  function bulle(texte, action, f) {
    const b = D.createElement('div'); b.className = 'px-bulle px-bulle-lecteur';
    b.innerHTML = '<span></span><button type="button"></button><button type="button" aria-label="fermer">✕</button>';
    b.children[0].textContent = texte; b.children[1].textContent = action;
    b.children[1].onclick = () => { b.remove(); f(); }; b.children[2].onclick = () => b.remove();
    (D.getElementById('ploxi0n') || D.body).appendChild(b);
    W.setTimeout(() => b.remove(), 15000);
  }

  // ---- les liens vers les lecteurs externes, et window.open d'un flux vidéo -------------------------------------------------------------
  if (natif) {
    D.addEventListener('click', (e) => {
      if (reglage.auto === false) return;
      const a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
      const flux = fluxDuLienExterne(a.getAttribute('href')); if (!flux) return;
      e.preventDefault(); e.stopPropagation(); ouvrir(flux, { titre: a.textContent.trim().slice(0, 120) }).catch(() => {});
    }, true);
    const avant = W.open && W.open.bind(W);
    W.open = (u, ...a) => {
      const flux = reglage.auto !== false && u ? (fluxDuLienExterne(u) || (/^https?:/i.test(String(u)) && VIDEO.test(String(u)) ? String(u) : null)) : null;
      if (flux) { ouvrir(flux).catch(() => {}); return null; }
      return avant ? avant(u, ...a) : null;
    };
  }

  const api = {
    ouvrir, moteurs: lesMoteurs, fermer: () => (natif ? plugin.fermer() : Promise.resolve()),
    reprises: async () => (await boxion.list('lecteur-positions').catch(() => [])).length,
    surEvenement: (f) => { abonnes.add(f); return () => abonnes.delete(f); },
  };
  return {
    api, pret, surMedia, brancherJosPlayer, ouvrir, moteurs: lesMoteurs,
    reglage: () => ({ ...reglage }),
    async regler(patch) { reglage = { ...reglage, ...patch }; await boxion.put('reglages', 'lecteur-natif', reglage); },
  };
}
