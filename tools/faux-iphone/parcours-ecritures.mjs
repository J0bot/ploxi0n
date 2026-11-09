// ✎ (0.96) les six écritures côte à côte : l'accueil, les koins ouverts
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true, mode: 'organique', variante: 'xeno' }); });
  await page.reload(); await page.waitForTimeout(3000);
  for (const e of ['xerboxion', 'texte-glyphes', 'glyphes', 'texte', 'emoji', 'minimal']) {
    await page.evaluate(async (x) => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, ecriture: x }); }, e);
    await page.reload(); await page.waitForTimeout(2500);
    await ecrire(e + '-1-accueil');
    for (let k = 0; k < 3; k++) { await page.click('[data-koin="gauche"]'); await page.waitForTimeout(200); }
    await page.waitForTimeout(500); await ecrire(e + '-2-koins');
  }
  return {};
}
