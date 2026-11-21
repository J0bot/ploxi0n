// ◺ (0.99.67, RS-7 coord #2120) le mode xerboxion sur le chemin iPhone : les koins toujours, le dock effacé, une seule bande entre les koins
// (même si un ploxion du labo pose la sienne dans le trou), les koins dessinés avec les glyphes de l'alien (xb:alien:glyphes).
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await passer(); await page.waitForTimeout(500);
  await page.evaluate(async () => { localStorage.setItem('xb:alien:glyphes', JSON.stringify({ k1: 0.86, k2: 0.5, k3: 0.22, trait: 2.6, traitI: 1.4 }));
    const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'xerboxion', koins: false }); });
  await page.reload(); await page.waitForTimeout(3500); await passer(); await page.waitForTimeout(800);
  const etat = () => page.evaluate(() => {
    const d = document.querySelector('.px-dock'), b = document.querySelectorAll('.px-koin-barre'), t = document.querySelector('.tsk-trou');
    const k = document.querySelector('[data-koin="gauche"] svg polygon');
    return { mode: window.ploxi0n.prefs.lire().mode, koins: document.documentElement.classList.contains('px-koins'), dock: d ? getComputedStyle(d).display : 'absent',
      bandes: b.length, bandeBas: b[0] ? Math.round(window.innerHeight - b[0].getBoundingClientRect().bottom) : null, trouPloxion: t ? getComputedStyle(t).display : 'absent', koin: k ? k.getAttribute('points') : null };
  });
  // un ploxion du labo qui poserait sa bande dans le trou (jOSTsoins)
  await page.evaluate(() => { const t = document.createElement('div'); t.className = 'tsk-trou'; t.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:60px;background:red;z-index:39'; document.body.appendChild(t); });
  const r = await etat();
  await ecrire('01-xerboxion-koins');
  return r;
}
