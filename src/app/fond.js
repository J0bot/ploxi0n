// 🖼 LE FOND D'ÉCRAN (RS-7 12.10 : « faut pouvoir changer le background image »). Une couche fixe derrière l'app :
//   - une PHOTO (la photothèque, ou l'appareil photo) — réduite à 1600 px, gardée dans boxion_local « reglages/fond-image » ;
//   - ou un MOTIF gravé chill-tekk (aucun dégradé) : grille, hexagones, points, courbes de niveau, cubes ;
//   - assombrir (0–85 %) et flouter (0–24 px), pour que les tuiles restent lisibles ;
//   - où : l'accueil seulement, ou partout (derrière les ploxions qui laissent leur fond transparent).
// Réglage : boxion_local « reglages/fond » = { type: 'aucun'|'photo'|'motif', motif, sombre, flou, partout }. ⚙ › Apparence › Fond d'écran.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = (w, h, corps) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' + corps + '</svg>') + '")';
const T = 'fill="none" stroke="#a597cf" stroke-opacity=".16" stroke-width="1"';
export const MOTIFS = {
  grille: { nom: 'grille gravée', css: svg(36, 36, '<path d="M36 0H0V36" ' + T + '/>') },
  hex: { nom: 'hexagones', css: svg(56, 97, '<path d="M28 0l28 16v32L28 64 0 48V16zM28 64v33" ' + T + '/>') },
  points: { nom: 'points', css: svg(22, 22, '<circle cx="11" cy="11" r="1.2" fill="#a597cf" fill-opacity=".22"/>') },
  niveaux: { nom: 'courbes de niveau', css: svg(160, 160, '<path d="M-10 40C30 10 60 70 100 40S150 10 170 40M-10 90C30 60 60 120 100 90S150 60 170 90M-10 140C30 110 60 170 100 140S150 110 170 140" ' + T + '/>') },
  cubes: { nom: 'cubes', css: svg(60, 70, '<path d="M30 0l30 17.5v35L30 70 0 52.5v-35zM30 35l30-17.5M30 35L0 17.5M30 35v35" ' + T + '/>') },
};
export const FOND_DEFAUT = { type: 'aucun', motif: 'grille', sombre: 45, flou: 0, partout: false };

export function creerFond({ W = globalThis.window, boxion, vibrer = () => {} }) {
  const D = W.document;
  let r = { ...FOND_DEFAUT }, image = null, el = null;
  const pret = Promise.all([boxion.get('reglages', 'fond').catch(() => null), boxion.get('reglages', 'fond-image').catch(() => null)])
    .then(([f, i]) => { if (f && typeof f === 'object') r = { ...FOND_DEFAUT, ...f }; image = (i && i.url) || null; appliquer(); });
  function appliquer() {
    const h = D.documentElement;
    if (!el) { el = D.createElement('div'); el.className = 'px-fond'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<i></i><b></b>'; D.body.insertBefore(el, D.body.firstChild); }
    const actif = r.type === 'photo' ? !!image : r.type === 'motif';
    h.classList.toggle('px-a-fond', actif);
    h.classList.toggle('px-fond-partout', actif && !!r.partout);
    el.hidden = !actif;
    if (!actif) return;
    const img = el.querySelector('i'), voile = el.querySelector('b');
    if (r.type === 'photo') { img.style.backgroundImage = 'url("' + image + '")'; img.style.backgroundSize = 'cover'; img.style.backgroundRepeat = 'no-repeat'; }
    else { img.style.backgroundImage = (MOTIFS[r.motif] || MOTIFS.grille).css; img.style.backgroundSize = 'auto'; img.style.backgroundRepeat = 'repeat'; }
    img.style.filter = r.flou > 0 && r.type === 'photo' ? 'blur(' + (+r.flou) + 'px)' : '';
    img.style.inset = r.flou > 0 && r.type === 'photo' ? (-2 * r.flou) + 'px' : '0';
    voile.style.opacity = r.type === 'photo' ? String(Math.min(85, Math.max(0, +r.sombre)) / 100) : '0';
  }
  async function regler(p) { r = { ...r, ...p }; await boxion.put('reglages', 'fond', r).catch(() => {}); appliquer(); return r; }
  /** une photo → réduite (1600 px, JPEG) → le fond */
  async function choisirPhoto(source = 'galerie') {
    let url = null;
    const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
    if (!natif) { if (!(W.jOSNatif && W.jOSNatif.photo)) throw new Error('une photo : sur l\'iPhone'); url = await W.jOSNatif.photo({ source }); }
    else try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      url = (await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos, quality: 80, width: 1600, correctOrientation: true })).dataUrl;
    } catch (e) { if (/cancel/i.test(String(e && e.message))) return null; if (W.jOSNatif && W.jOSNatif.photo) url = await W.jOSNatif.photo({ source }); else throw e; }
    if (!url) return null;
    url = await reduire(url).catch(() => url);
    image = url; await boxion.put('reglages', 'fond-image', { url, le: new Date().toISOString() });
    vibrer('succes');
    return regler({ type: 'photo' });
  }
  /** au plus 1600 px de côté, JPEG 0,82 (une photo de 12 Mpx pèserait 4 Mo dans le boxion local) */
  function reduire(url) {
    if (url.length < 1.5e6) return Promise.resolve(url);   // déjà légère (Camera width: 1600 l'a réduite)
    return new Promise((ok, ko) => {
      W.setTimeout(() => ok(url), 4000);   // jamais bloqué si l'image ne se décode pas
      const im = new W.Image();
      im.onload = () => { try { const k = Math.min(1, 1600 / Math.max(im.width, im.height));
        const c = D.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.82)); } catch (e) { ko(e); } };
      im.onerror = ko; im.src = url;
    });
  }
  async function retirer() { image = null; await boxion.del('reglages', 'fond-image').catch(() => {}); return regler({ type: 'aucun' }); }

  /** la feuille, au pouce : aperçu, photo, motifs, assombrir, flouter, où */
  function composer() {
    const f = D.createElement('div'); f.className = 'px-voile px-fond-feuille';
    const peindre = () => {
      f.innerHTML = '<div class="px-tiroir"><p class="px-ft">🖼 fond d\'écran</p>'
        + '<div class="px-fond-apercu">' + (r.type === 'photo' && image ? '<span style="background-image:url(&quot;' + esc(image) + '&quot;)"></span>' : r.type === 'motif' ? '<span style="background-image:' + esc((MOTIFS[r.motif] || MOTIFS.grille).css) + ';background-size:auto;background-repeat:repeat"></span>' : '<em>aucun : le noir usé de chill-tekk</em>') + '</div>'
        + '<div class="px-puces"><button class="px-puce" data-f="galerie">📷 une photo</button><button class="px-puce" data-f="camera">◉ prendre</button><button class="px-puce' + (r.type === 'aucun' ? ' on' : '') + '" data-f="aucun">aucun</button></div>'
        + '<p class="px-grave">motifs gravés</p><div class="px-puces">' + Object.entries(MOTIFS).map(([k, m]) => '<button class="px-puce' + (r.type === 'motif' && r.motif === k ? ' on' : '') + '" data-motif="' + k + '">' + esc(m.nom) + '</button>').join('') + '</div>'
        + (r.type === 'photo' ? '<label class="l"><span>Assombrir · ' + r.sombre + ' %</span><input type="range" min="0" max="85" step="5" value="' + r.sombre + '" data-r="sombre"></label>'
          + '<label class="l"><span>Flouter · ' + r.flou + ' px</span><input type="range" min="0" max="24" step="2" value="' + r.flou + '" data-r="flou"></label>' : '')
        + '<div class="px-puces"><button class="px-puce' + (!r.partout ? ' on' : '') + '" data-ou="0">l\'accueil</button><button class="px-puce' + (r.partout ? ' on' : '') + '" data-ou="1">partout</button></div>'
        + '<p class="px-sous" data-msg></p><button data-fermer>fermer</button></div>';
    };
    f.addEventListener('click', async (e) => {
      if (e.target === f || e.target.closest('[data-fermer]')) return f.remove();
      let b;
      try {
        if ((b = e.target.closest('[data-f]'))) { const k = b.getAttribute('data-f'); if (k === 'aucun') await retirer(); else await choisirPhoto(k); return peindre(); }
        if ((b = e.target.closest('[data-motif]'))) { await regler({ type: 'motif', motif: b.getAttribute('data-motif') }); vibrer('selection'); return peindre(); }
        if ((b = e.target.closest('[data-ou]'))) { await regler({ partout: b.getAttribute('data-ou') === '1' }); vibrer('selection'); return peindre(); }
      } catch (er) { const m = f.querySelector('[data-msg]'); if (m) m.textContent = '⚠ ' + (er.message || er); }
    });
    f.addEventListener('change', async (e) => { const k = e.target.getAttribute && e.target.getAttribute('data-r'); if (!k) return; await regler({ [k]: +e.target.value }); peindre(); });
    f.addEventListener('input', (e) => { const k = e.target.getAttribute && e.target.getAttribute('data-r'); if (!k) return; r[k] = +e.target.value; appliquer(); const s = e.target.parentElement.querySelector('span'); if (s) s.textContent = (k === 'sombre' ? 'Assombrir · ' : 'Flouter · ') + r[k] + (k === 'sombre' ? ' %' : ' px'); });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    peindre();
  }
  /** § (0.77) la photo d'un xer, remise en place quand on y revient */
  async function poserImage(url) { if (!url) return; image = url; await boxion.put('reglages', 'fond-image', { url }).catch(() => {}); appliquer(); }
  return { pret, composer, regler, choisirPhoto, retirer, poserImage, reglage: () => ({ ...r }), image: () => image };
}
