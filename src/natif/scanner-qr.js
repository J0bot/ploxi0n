// ▣ (0.99.35) SCANNER UN CODE QR avec la caméra, dans la page : getUserMedia + BarcodeDetector (jsQR derrière, src/natif/web-natif.js,
// quand le système ne l'a pas : la WebView d'iOS). Quatre lectures par seconde ; s'arrête au premier code qui passe le filtre, ou à arreter().
// La caméra n'est allumée que pendant le scan (ne pas nuire) : la vidéo s'éteint dès qu'on a le code, ou qu'on ferme.
export function scannerQr({ W = globalThis.window, video, accepter = () => true, surCode, surErreur = () => {}, periode = 250 }) {
  let flux = null, minuteur = 0, fini = false, detecteur = null;
  const arreter = () => { fini = true; W.clearTimeout(minuteur); if (flux) { for (const t of flux.getTracks()) { try { t.stop(); } catch (e) { /* */ } } flux = null; } if (video) { try { video.srcObject = null; } catch (e) { /* */ } } };
  async function lire() {
    if (fini) return;
    try {
      if (video.readyState >= 2) {
        const codes = await detecteur.detect(video);
        for (const c of codes || []) { const v = c && c.rawValue; if (v && accepter(v)) { arreter(); surCode(v); return; } }
      }
    } catch (e) { /* une image ratée : la suivante */ }
    minuteur = W.setTimeout(lire, periode);
  }
  (async () => {
    try {
      if (!W.navigator || !W.navigator.mediaDevices || !W.navigator.mediaDevices.getUserMedia) throw new Error('pas de caméra ici');
      if (!W.BarcodeDetector) throw new Error('pas de lecteur de QR ici');
      detecteur = new W.BarcodeDetector({ formats: ['qr_code'] });
      flux = await W.navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (fini) { arreter(); return; }
      video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = flux;
      const p = video.play(); if (p && p.catch) p.catch(() => {});
      lire();
    } catch (e) { arreter(); surErreur(e && e.name === 'NotAllowedError' ? new Error('caméra refusée : Réglages › ploxi0n › Appareil photo') : e); }
  })();
  return { arreter };
}
