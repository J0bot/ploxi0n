// ◌ LE TÉLÉPHONE VIVANT (0.99.11) : un bord lumineux qui respire (src/bions/vivant.js) ; la chaleur l'accélère, la batterie le pâlit, la
// charge le teinte, l'économie d'énergie et « réduire les animations » l'endorment ; il bat avec le son qui joue (les analyseurs posés dans
// window.__pxSon par le synthé). Une seule couche fixe (pointer-events: none) ; l'état relu toutes les 60 s, le son seulement quand il joue.
// ⚙ › Apparence › « Le téléphone vivant ». Dans l'organique seulement.
import { etatVivant, niveauSon } from '../bions/vivant.js';

export function installerTelVivant({ W = globalThis.window, prefs, systeme = null, batterie = null }) {
  const D = W.document; let el = null, minuteur = 0, raf = 0, tampon = null, dernier = -1, eveille = 0;
  const voulu = () => { const p = prefs.lire(); return p.mode === 'organique' && p.telVivant !== false; };
  async function relire() {
    if (!voulu() || D.hidden) { if (el) el.hidden = true; return; }
    if (!el) { el = D.createElement('div'); el.className = 'px-tel-vivant'; el.setAttribute('aria-hidden', 'true'); D.body.appendChild(el); }
    const s = systeme ? await systeme().catch(() => null) : null, b = batterie ? await batterie().catch(() => null) : null;
    const e = etatVivant({ thermique: s && s.thermique, economie: !!(s && s.economie), batterie: b && b.niveau, enCharge: !!(b && b.enCharge), calme: !!prefs.lire().calme, disqueLibre: s && s.disqueLibre });
    el.hidden = !e.actif; el.dataset.teinte = e.teinte; el.classList.toggle('px-tv-irregulier', !!e.irregulier);
    el.style.setProperty('--tv-periode', e.periode + 's'); el.style.setProperty('--tv-intensite', String(e.intensite));
    sonder();
  }
  // le son : seulement tant qu'un analyseur joue (sinon rien ne tourne)
  function sonder() {
    if (raf || !el || el.hidden) return;
    const pas = () => {
      raf = 0; const l = W.__pxSon ? [...W.__pxSon] : []; let n = 0;
      for (const a of l) { try { if (!tampon || tampon.length !== a.fftSize) tampon = new Uint8Array(a.fftSize); a.getByteTimeDomainData(tampon); n = Math.max(n, niveauSon(tampon)); } catch (e) { /* débranché */ } }
      const x = Math.round(n * 25) / 25; if (x !== dernier && el) { dernier = x; el.style.setProperty('--tv-son', String(x)); }
      if (n > 0.01 || Date.now() < eveille || dernier > 0) raf = (W.requestAnimationFrame || ((f) => W.setTimeout(f, 50)))(() => W.setTimeout(pas, 40));   // ~ 20 fois par seconde
    };
    pas();
  }
  W.__pxSonReveil = () => { eveille = Date.now() + 3000; sonder(); };   // le synthé le réveille : on écoute au moins 3 s (la première note part un peu après)
  relire(); minuteur = W.setInterval(relire, 60000);
  if (prefs.surChangement) prefs.surChangement(() => relire());
  D.addEventListener('visibilitychange', () => relire());
  return { relire, arreter() { W.clearInterval(minuteur); if (el) el.remove(); el = null; } };
}
