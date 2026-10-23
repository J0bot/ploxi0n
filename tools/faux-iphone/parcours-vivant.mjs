// ◌ (0.99.11) le téléphone vivant : la couche du bord existe dans l'organique, respire (la période), et bat avec le synthé (--tv-son)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  const lire = () => page.evaluate(() => { const e = document.querySelector('.px-tel-vivant'); if (!e) return null; const cs = getComputedStyle(e); return { visible: !e.hidden && cs.display !== 'none', periode: e.style.getPropertyValue('--tv-periode'), intensite: e.style.getPropertyValue('--tv-intensite'), teinte: e.dataset.teinte, son: e.style.getPropertyValue('--tv-son'), anim: cs.animationName }; });
  const r = { repos: await lire() };
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('synthe')); await page.waitForTimeout(1200);
  await page.click('.px-synthe [data-sy="boucle"]'); await page.waitForTimeout(1500);   // un vrai geste : l'audio n'est permis qu'après un toucher
  r.ctx = await page.evaluate(() => [...(window.__pxSon || [])].map(a => a.context.state));
  r.rms = await page.evaluate(() => [...(window.__pxSon || [])].map(a => { const t = new Uint8Array(a.fftSize); a.getByteTimeDomainData(t); let mx = 0; for (const x of t) mx = Math.max(mx, Math.abs(x - 128)); return mx; }));
  r.reveil = await page.evaluate(() => typeof window.__pxSonReveil);
  const sons = []; for (let i = 0; i < 8; i++) { sons.push((await lire() || {}).son); await page.waitForTimeout(150); }
  r.sonPendantLaBoucle = sons;
  await ecrire('01-le-bord-bat');
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy="boucle"]').click());
  return r;
}
