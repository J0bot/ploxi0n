// 📁 LES FICHIERS ET LE RESTE DU NATIF (0.49, la liste de RS-7 : zip et unzip, galerie photo native et importation, ouverture de fichiers
// native, envoyer vers, visualiseur de fichiers, map native, mail, lampe de poche). Pour jOSNatif, donc pour tous les ploxions :
//   envoyer(fichiers, { titre, texte })   « Envoyer vers » : la feuille de partage d'iOS AVEC les fichiers (AirDrop, Mail, Messages, Fichiers…)
//   apercu(fichier, { echelleReelle })     le visualiseur d'iOS (QuickLook) : PDF, images, vidéos, Office, Pages, texte, USDZ (AR Quick Look)…
//   zip(fichiers) → Blob · dezipper(zip) → [{ nom, data: Uint8Array, taille }]
//   photos.choisir({ max }) → [File]      la galerie native (plusieurs à la fois)
//   photos.importer({ max })              → Fichiers › Sur mon iPhone › ploxi0n › Photos ; (0.85) et dans ton boxion (Photos/), connecté
//   ouvrir({ types })  → [File]           le sélecteur de fichiers d'iOS (Fichiers, iCloud Drive, clés USB…)
//   carte.ouvrir({ lat, lng, nom } | { adresse }) · carte.itineraire({ … }, mode)   Plans d'Apple
//   mail({ a, cc, objet, corps })         Mail d'iOS
//   lampe(allume?, niveau?)               la lampe de poche
// Un fichier = un File / Blob, ou { nom, base64, type }, ou { nom, data: Uint8Array | string, type }.
import { PloxiApple } from './plugins-app.js';

const enOctets = async (f) => {
  if (!f) return new Uint8Array();
  if (f instanceof Uint8Array) return f;
  if (typeof f === 'string') return new TextEncoder().encode(f);
  if (f.base64 != null) return Uint8Array.from(atob(String(f.base64).replace(/^data:[^,]*,/, '')), c => c.charCodeAt(0));
  if (f.data != null) return enOctets(f.data);
  if (typeof f.arrayBuffer === 'function') return new Uint8Array(await f.arrayBuffer());
  if (f instanceof ArrayBuffer) return new Uint8Array(f);
  return new TextEncoder().encode(String(f));
};
const enBase64 = (o) => { let s = ''; for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000)); return btoa(s); };
const nomDe = (f, i = 0) => String((f && (f.nom || f.name)) || ('fichier-' + (i + 1))).replace(/[/\\]/g, '-').slice(0, 120);

/** versBoxion(fichier, chemin) → vrai si envoyé (0.85 : le FS du labo, /fs/write, relayé par le mode connecté) ; null : pas connecté */
export function creerFichiersNatif({ W = globalThis.window, apple = PloxiApple, charger = {}, versBoxion = () => null } = {}) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const imp = (n, f) => (charger[n] || f)();
  const fs = () => imp('fs', () => import('@capacitor/filesystem'));
  const lanceur = (url) => (natif ? imp('lanceur', () => import('@capacitor/app-launcher')).then(m => m.AppLauncher.openUrl({ url })) : Promise.resolve(W.open(url, '_blank')));

  /** écrit un fichier dans le cache de l'app → son adresse file:// (pour partager, prévisualiser) */
  async function versCache(f, i = 0) {
    const { Filesystem, Directory } = await fs();
    const r = await Filesystem.writeFile({ path: 'envoi/' + Date.now().toString(36) + '-' + nomDe(f, i), data: enBase64(await enOctets(f)), directory: Directory.Cache, recursive: true });
    return r.uri;
  }
  async function envoyer(fichiers, { titre = '', texte = '' } = {}) {
    const l = Array.isArray(fichiers) ? fichiers : [fichiers];
    if (!natif) { if (W.navigator.share) return W.navigator.share({ title: titre, text: texte, files: l.filter(f => f instanceof W.File) }); throw new Error('envoyer : sur l\'iPhone'); }
    const files = []; for (let i = 0; i < l.length; i++) files.push(await versCache(l[i], i));
    const { Share } = await imp('share', () => import('@capacitor/share'));
    return Share.share({ title: titre || undefined, text: texte || undefined, files, dialogTitle: titre || undefined });
  }
  // (0.73) une adresse http(s) est téléchargée par iOS (pas de CORS) ; un .usdz s'ouvre en AR Quick Look ; { echelleReelle } : à l'échelle 1
  async function apercu(f, o = {}) {
    if (!natif) throw new Error('aperçu : sur l\'iPhone');
    const e = o && o.echelleReelle ? { echelleReelle: true } : {};
    if (typeof f === 'string' && /^(file:|\/)/.test(f)) return apple.apercu({ chemin: f, ...e });
    if (typeof f === 'string' && /^https?:/i.test(f)) return apple.apercu({ url: f, ...e });
    if (typeof f === 'string' && /^(capacitor|blob|data):/i.test(f)) {
      const r = await W.fetch(f); if (!r.ok) throw new Error('aperçu : ' + r.status);
      const b = await r.blob();
      // le nom sans ?requête ni #fragment ; sans extension (blob:, data:, rel="ar"), celle du type : sinon AR Quick Look ne reconnaît pas le USDZ
      let nom = f.startsWith('data:') ? '' : f.split('/').pop().split(/[?#]/)[0]; try { nom = decodeURIComponent(nom); } catch (e) { /* tel quel */ }
      if (!/\.[a-z0-9]+$/i.test(nom)) nom = (nom || 'fichier') + (/usdz/i.test(b.type) ? '.usdz' : /reality/i.test(b.type) ? '.reality' : '');
      return apercu({ nom, data: new Uint8Array(await b.arrayBuffer()) }, o);
    }
    return apple.apercu({ base64: enBase64(await enOctets(f)), nom: nomDe(f), ...e });
  }
  async function zip(fichiers) {
    const { zipSync } = await imp('fflate', () => import('fflate'));
    const o = {}; const l = Array.isArray(fichiers) ? fichiers : [fichiers];
    // un zip garde ses dossiers (« photos/a.jpg ») ; jamais de « .. » ni de chemin absolu
    const chemin = (f, i) => String((f && (f.nom || f.name)) || ('fichier-' + (i + 1))).replace(/\\/g, '/').split('/').filter(x => x && x !== '..' && x !== '.').join('/') || ('fichier-' + (i + 1));
    for (let i = 0; i < l.length; i++) o[chemin(l[i], i)] = await enOctets(l[i]);
    return new W.Blob([zipSync(o, { level: 6 })], { type: 'application/zip' });
  }
  async function dezipper(source) {
    const { unzipSync } = await imp('fflate', () => import('fflate'));
    const tout = unzipSync(await enOctets(source));
    return Object.entries(tout).filter(([n]) => !n.endsWith('/') && !n.startsWith('__MACOSX/')).map(([nom, data]) => ({ nom, data, taille: data.length }));
  }
  const photos = {
    async choisir({ max = 0 } = {}) {
      if (!natif) throw new Error('la galerie : sur l\'iPhone');
      const { Camera } = await imp('camera', () => import('@capacitor/camera'));
      const r = await Camera.pickImages({ limit: max, quality: 92 });
      const out = [];
      for (let i = 0; i < (r.photos || []).length; i++) {
        const p = r.photos[i], b = await (await W.fetch(p.webPath)).blob();
        out.push(new W.File([b], 'photo-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '-' + (i + 1) + '.' + (p.format || 'jpeg'), { type: b.type || 'image/' + (p.format || 'jpeg') }));
      }
      return out;
    },
    async importer({ max = 0 } = {}) {
      const l = await photos.choisir({ max });
      const { Filesystem, Directory } = await fs();
      for (const f of l) await Filesystem.writeFile({ path: 'ploxi0n/Photos/' + f.name, data: enBase64(await enOctets(f)), directory: Directory.Documents, recursive: true });
      // 📤 (0.85) et dans ton boxion, si l'app y est connectée (une photo qui échoue reste sur l'iPhone, les autres partent)
      let boxion = null;
      for (const f of l) { let ok = null; try { ok = await versBoxion(f, 'Photos/' + f.name); } catch (e) { ok = false; } if (ok !== null) boxion = (boxion || 0) + (ok ? 1 : 0); }
      return { n: l.length, ou: 'Fichiers › Sur mon iPhone › ploxi0n › Photos' + (boxion ? ' · ' + boxion + ' dans ton boxion (Photos)' : ''), fichiers: l.map(f => f.name), boxion };
    },
  };
  /** le sélecteur de fichiers d'iOS (Fichiers, iCloud Drive…) : l'<input type=file> que WebKit ouvre en natif */
  function ouvrir({ types = '', plusieurs = true } = {}) {
    return new Promise((ok) => {
      const i = W.document.createElement('input'); i.type = 'file'; if (types) i.accept = types; i.multiple = !!plusieurs;
      i.style.cssText = 'position:fixed;left:-999px;opacity:0';
      i.onchange = () => { ok([...(i.files || [])]); i.remove(); };
      W.document.body.appendChild(i); i.click();
    });
  }
  const q = (o) => Object.entries(o).filter(([, v]) => v != null && v !== '').map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  const lieu = (o = {}) => (o.lat != null && o.lng != null ? { ll: o.lat + ',' + o.lng, q: o.nom || '' } : { q: o.adresse || o.nom || '' });
  const carte = {
    ouvrir: (o) => lanceur('maps://?' + q(lieu(o))),
    itineraire: (o, mode = 'marche') => { const l = lieu(o); return lanceur('maps://?' + q({ daddr: l.ll || l.q, dirflg: { voiture: 'd', marche: 'w', transports: 'r', velo: 'c' }[mode] || 'w' })); },
  };
  const mail = ({ a = '', cc = '', objet = '', corps = '' } = {}) => lanceur('mailto:' + encodeURIComponent(Array.isArray(a) ? a.join(',') : a).replace(/%40/g, '@').replace(/%2C/g, ',') + '?' + q({ cc: Array.isArray(cc) ? cc.join(',') : cc, subject: objet, body: corps }));
  const lampe = (allume, niveau) => { if (!natif) return Promise.reject(new Error('la lampe : sur l\'iPhone')); const o = {}; if (allume != null) o.allume = !!allume; if (niveau != null) o.niveau = +niveau; return apple.lampe(o); };
  return { envoyer, apercu, zip, dezipper, photos, ouvrir, carte, mail, lampe, versCache };
}
