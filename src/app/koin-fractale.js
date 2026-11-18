// ✺ LA FRACTALE DANS LE PORTION (15.11.2026). RS-7 : « sur ploxi0n la fractale marche pas, et aussi pour le xer : il faut la mêler au xer de koins
// de ploxi0n, ça doit être intégré, mon système de glyphes doit être modulaire » ; son carnet (koins.js) : « portion □ — rationnel, FRACTALE,
// types de réel ». Un MODULE DE FOND pour une case des koins : la fractale du trippion (bion jOSFractale du labo, chargé s'il manque), le
// trippion en cours (ou le dernier) lu dans le stockage du ploxion trip ; elle tourne seulement quand le koin est ouvert (montée → arrêt à la
// fermeture). Une image ~ toutes les 0,7 s, le zoom glisse entre deux en CSS (pas de boucle d'images : ça tient sur un vieux téléphone).
//   fondFractale({ W }) → (el) => arreter()
export function fondFractale({ W = globalThis.window, source = 'https://labo.j0bot.ch' } = {}) {
  let charge = null;
  const bion = () => {
    if (W.jOSFractale) return Promise.resolve(W.jOSFractale);
    if (charge) return charge;
    charge = new Promise((ok, ko) => { const s = W.document.createElement('script'); s.src = source + '/px/bion-app/jOSFractale.js'; s.onload = () => (W.jOSFractale ? ok(W.jOSFractale) : ko(new Error('bion'))); s.onerror = () => { charge = null; ko(new Error('réseau')); }; W.document.head.appendChild(s); });
    return charge;
  };
  const trip = () => { try { const c = JSON.parse(W.localStorage.getItem('xb:trip') || 'null'); if (c && c.t0) return { v: c, vivant: true }; const r = JSON.parse(W.localStorage.getItem('xb:trip:reports') || '[]'); const d = r[r.length - 1]; return d && d.t0 ? { v: d, vivant: false } : null; } catch (e) { return null; } };
  return (el) => {
    if (!el) return () => {};
    const cv = W.document.createElement('canvas'); cv.className = 'px-koin-fond'; cv.width = cv.height = 160; el.insertBefore(cv, el.firstChild);
    let vivant = true, t = 0; const ctx = cv.getContext('2d'), debut = Date.now();
    const pas = (F) => { t = 0; if (!vivant) return; const x = trip(); if (!x) { cv.style.opacity = '0'; t = W.setTimeout(() => pas(F), 4000); return; }
      const T = x.vivant ? Date.now() - x.v.t0 : (Date.now() - debut) % Math.max(60000, (x.v.fin || x.v.t0 + 60000) - x.v.t0);
      try { ctx.putImageData(F.rendre(F.vue(x.v, T), 160), 0, 0); } catch (e) { /* */ }
      cv.style.transition = 'none'; cv.style.transform = 'scale(1)'; void cv.offsetWidth; cv.style.transition = 'transform 700ms linear, opacity .5s'; cv.style.transform = 'scale(1.045)'; cv.style.opacity = '';
      t = W.setTimeout(() => pas(F), 700); };
    bion().then((F) => { if (vivant) pas(F); }).catch(() => { cv.remove(); });
    return () => { vivant = false; if (t) W.clearTimeout(t); cv.remove(); };
  };
}
