// ♿ (0.99.23, la feuille de route : « VoiceOver et police plus grande ») : sur chaque écran de l'app, ce que VoiceOver ne saurait pas dire —
// un bouton, un lien ou un champ sans nom (ni texte, ni aria-label, ni title, ni étiquette), ou dont le seul « nom » est un signe (◉ ○ ⌖ ∿ :
// VoiceOver lit « cercle noir »). Rend, par écran, le nombre d'éléments et les fautifs (leur HTML coupé), pour les corriger à la source.
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  const audit = () => page.evaluate(() => {
    const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[aria-hidden="true"],[hidden]'); };
    const nom = (e) => {
      const a = e.getAttribute('aria-label'); if (a && a.trim()) return a.trim();
      const lb = e.getAttribute('aria-labelledby'); if (lb) { const t = lb.split(/\s+/).map(i => (document.getElementById(i) || {}).textContent || '').join(' ').trim(); if (t) return t; }
      if (e.matches('input,select,textarea')) { if (e.id) { const l = document.querySelector('label[for="' + CSS.escape(e.id) + '"]'); if (l && l.textContent.trim()) return l.textContent.trim(); } const l2 = e.closest('label'); if (l2 && l2.textContent.trim()) return l2.textContent.trim(); return (e.getAttribute('placeholder') || e.getAttribute('title') || '').trim(); }
      const t = (e.innerText || e.textContent || '').trim() || [...e.querySelectorAll('img[alt],svg[aria-label]')].map(x => x.getAttribute('alt') || x.getAttribute('aria-label')).join(' ').trim();
      return t || (e.getAttribute('title') || '').trim();
    };
    const l = [...document.querySelectorAll('button,a[href],[role=button],input:not([type=hidden]),select,textarea')].filter(visible);
    const sans = [], signes = [], petits = [], caches = [];
    // (0.99.44, RS-7 : la Commande vocale, le Suivi du regard et de la tête d'iOS) : « touche <ce que tu vois> » ne marche que si le nom
    // CONTIENT le texte visible (WCAG 2.5.3) ; le regard et la tête visent mal sous 44 × 44 points (la cible d'Apple)
    const norme = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
    for (const e of l) {
      const n = nom(e); if (!n) sans.push(e.outerHTML.slice(0, 140)); else if (!/[\p{L}\p{N}]/u.test(n)) signes.push(n + ' ← ' + e.outerHTML.slice(0, 110));
      const r = e.getBoundingClientRect(); if ((r.width < 44 || r.height < 44) && !e.matches('input[type=range]')) petits.push(Math.round(r.width) + '×' + Math.round(r.height) + ' ' + (n || '').slice(0, 30));
      const a = e.getAttribute('aria-label'), vu = norme(e.innerText || ''); if (a && vu && /[\p{L}]{2}/u.test(vu) && !norme(a).includes(vu)) caches.push('« ' + vu.slice(0, 30) + ' » ≠ « ' + a.slice(0, 40) + ' »');
    }
    return { elements: l.length, sansNom: sans.length, seulementUnSigne: signes.length, petits: petits.length, nomCache: caches.length,
      exemples: [...sans.slice(0, 6), ...signes.slice(0, 8)], exemplesPetits: petits.slice(0, 10), exemplesCaches: caches.slice(0, 8) };
  });
  const r = {};
  r.accueil = await audit();
  for (const id of ['reglages-app', 'marketplace', 'proche', 'synthe', 'autour', 'atelier-peaux', 'systeme', 'ambiances', 'passe', 'journal-tsoins']) {
    await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id).catch(() => {}); await page.waitForTimeout(1000);
    r[id] = await audit();
    await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')).catch(() => {}); await page.waitForTimeout(400);
  }
  r.total = Object.values(r).reduce((a, x) => ({ elements: a.elements + x.elements, sansNom: a.sansNom + x.sansNom, seulementUnSigne: a.seulementUnSigne + x.seulementUnSigne, petits: a.petits + x.petits, nomCache: a.nomCache + x.nomCache }), { elements: 0, sansNom: 0, seulementUnSigne: 0, petits: 0, nomCache: 0 });
  // ♿ (0.99.44) les grandes cibles (⚙ › Grandes cibles : oui, ou auto quand le regard, la tête, le contrôle de sélection tournent) : ce qui reste petit
  await page.evaluate(() => window.ploxi0n.prefs.regler({ cibles: 'oui' })).catch(() => {}); await page.waitForTimeout(500);
  r.grandes = { classe: await page.evaluate(() => document.documentElement.classList.contains('px-grandes-cibles')) };
  for (const id of ['accueil', 'proche', 'autour', 'synthe', 'passe', 'atelier-peaux', 'marketplace', 'ambiances']) {
    if (id !== 'accueil') { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id).catch(() => {}); await page.waitForTimeout(1000); }
    const a = await audit(); r.grandes[id] = { elements: a.elements, petits: a.petits, exemples: a.exemplesPetits };
    if (id !== 'accueil') { await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')).catch(() => {}); await page.waitForTimeout(400); }
  }
  await ecrire('acc-grandes-cibles');
  await page.evaluate(() => window.ploxi0n.prefs.regler({ cibles: 'auto' })).catch(() => {});
  return r;
}
