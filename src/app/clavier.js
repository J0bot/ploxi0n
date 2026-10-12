// 🧪 LE TEST DU CLAVIER (RS-7 12.10 : « le clavier n'apparaît pas quand il faut », même dans le marketplace). Sans Mac pour inspecter
// WebKit, l'app se diagnostique elle-même : un champ, et le journal en direct de ce qui arrive quand on le touche :
//   le toucher arrive-t-il ? quelqu'un l'annule-t-il (defaultPrevented) ? le champ prend-il le focus ? iOS ouvre-t-il le clavier
//   (événements du plugin Keyboard, et la hauteur de visualViewport) ? qui a le focus juste après ?
// « copier le rapport » → le presse-papiers (à coller dans bother me ou coord).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function testerClavier({ W = globalThis.window, version = '?' }) {
  const D = W.document, journal = [], t0 = Date.now();
  const f = D.createElement('div'); f.className = 'px-voile';
  f.innerHTML = '<div class="px-tiroir"><p class="px-ft">🧪 le clavier</p><p class="px-sous" style="margin:0 0 8px">Touche le champ, écris quelque chose, puis « copier le rapport ».</p>'
    + '<input data-essai type="text" placeholder="touche-moi" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:13px;border:2px solid var(--bord2);background:var(--creux);color:var(--txt);font:16px var(--police)">'
    + '<pre data-j style="font:11px/1.45 var(--mono);color:var(--muted);white-space:pre-wrap;max-height:34vh;overflow:auto;margin:10px 0"></pre>'
    + '<button data-x="copier">copier le rapport</button><button data-x="">fermer</button></div>';
  (D.getElementById('ploxi0n') || D.body).appendChild(f);
  const champ = f.querySelector('[data-essai]'), pre = f.querySelector('[data-j]');
  const note = (m) => { journal.push('+' + String(Date.now() - t0).padStart(5) + ' ms  ' + m); pre.textContent = journal.slice(-40).join('\n'); };
  const qui = () => { const a = D.activeElement; return a ? a.tagName.toLowerCase() + (a.className ? '.' + String(a.className).split(' ')[0] : '') + (a === champ ? ' (le champ)' : '') : 'rien'; };
  const vv = W.visualViewport, h0 = vv ? Math.round(vv.height) : W.innerHeight;
  note('ploxi0n ' + version + ' · ' + (W.navigator.userAgent.match(/OS [\d_]+/) || ['?'])[0] + ' · hauteur ' + h0);
  const offs = [];
  const sur = (cible, type, fn, o) => { cible.addEventListener(type, fn, o); offs.push(() => cible.removeEventListener(type, fn, o)); };
  for (const type of ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click']) {
    sur(champ, type, () => note(type + ' sur le champ'), { passive: true });
    // en fin de propagation (window, bulle) : le défaut a-t-il été annulé par quelqu'un ?
    sur(W, type, (e) => { if (e.target === champ) note('   ' + type + (e.defaultPrevented ? ' ⚠ ANNULÉ (preventDefault) par un écouteur' : ' : pas annulé')); }, false);
  }
  sur(champ, 'focus', () => note('✓ focus sur le champ'));
  sur(champ, 'blur', () => note('✗ le champ perd le focus → ' + qui()));
  sur(champ, 'input', () => note('✓ saisie : « ' + champ.value.slice(-20) + ' »'));
  if (vv) sur(vv, 'resize', () => { const h = Math.round(vv.height); note('hauteur visible ' + h + (h < h0 - 120 ? ' → clavier probablement OUVERT' : ' → clavier fermé')); });
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    for (const ev of ['keyboardWillShow', 'keyboardDidShow', 'keyboardWillHide']) {
      const h = await Keyboard.addListener(ev, (i) => note('⌨ ' + ev + (i && i.keyboardHeight ? ' (' + i.keyboardHeight + ' px)' : '')));
      offs.push(() => h.remove());
    }
  } catch (e) { note('(plugin Keyboard absent : seulement hors iPhone)'); }
  f.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-x]'); if (!b && e.target !== f) return;
    if (b && b.getAttribute('data-x') === 'copier') {
      const t = journal.join('\n');
      try { const { Clipboard } = await import('@capacitor/clipboard'); await Clipboard.write({ string: t }); } catch (er) { try { await W.navigator.clipboard.writeText(t); } catch (er2) { /* */ } }
      b.textContent = '✓ copié : colle-le dans bother me ou coord'; return;
    }
    for (const o of offs) { try { o(); } catch (er) { /* */ } }
    f.remove();
  });
  return journal;
}
export { esc };
