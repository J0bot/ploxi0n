// ▭ (0.99.27, RS-7 27.10 : « fais en sorte de checker toutes les manières que quelque chose pourrait sortir de l'écran et patch »). L'audit
// de l'écran : chaque écran de l'app (les modes, les ploxions de l'app, chaque page des réglages, la map à chaque palier, la fractale, les
// koins, le tuto, chercher…), à chaque taille de tout (×1, ×1,15, ×1,45), sur trois largeurs d'iPhone (SE 375, 15 393, Pro Max 430), en
// paysage, avec l'encoche et l'indicateur d'accueil simulés. Relève, après les découpes des cadres :
//   deborde  la page plus large que l'écran (elle peut glisser de côté)
//   coupe    un bouton, un champ, un texte ou un élément fixé dessiné en partie hors de l'écran (ou sous l'encoche / l'indicateur)
//   cadre    un cadre qui défile de côté sans le vouloir (ou décalé : scrollLeft ≠ 0 alors qu'il ne défile pas)
// PX_ECRAN_RAPIDE=1 : une seule configuration (393, ×1,15).
export default async function ({ page }) {
  const cdp = await page.context().newCDPSession(page);
  const encoche = async (portrait) => { try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: portrait ? { top: 59, bottom: 34, left: 0, right: 0 } : { top: 0, bottom: 21, left: 59, right: 59 } }); return true; } catch (e) { return false; } };
  const passer = async () => { for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); } };
  await passer();
  const audit = (ou) => page.evaluate((ou) => {
    const W = innerWidth, H = innerHeight, cs0 = getComputedStyle(document.documentElement);
    const sa = (k) => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;' + k + ':0;padding-' + k + ':env(safe-area-inset-' + k + ',0px)'; document.body.appendChild(d); const v = parseFloat(getComputedStyle(d)['padding' + k[0].toUpperCase() + k.slice(1)]) || 0; d.remove(); return v; };
    const SA = { top: sa('top'), bottom: sa('bottom'), left: sa('left'), right: sa('right') };
    const sig = (e) => (e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (e.getAttribute('data-ploxion') ? '[' + e.getAttribute('data-ploxion') + ']' : '')).slice(0, 70);
    const chemin = (e) => { const l = []; for (let x = e; x && x !== document.body && l.length < 3; x = x.parentElement) l.unshift(sig(x)); return l.join(' > '); };
    const visible = (e) => e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true;
    const coupe = [], cadres = [];
    // la boîte VUE d'un élément : sa boîte, recoupée par chaque parent qui coupe (overflow ≠ visible) ; un parent fixé arrête la remontée
    const vue = (e) => {
      const r = e.getBoundingClientRect(); let l = r.left, t = r.top, rr = r.right, b = r.bottom;
      for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) {
        const c = getComputedStyle(x);
        if (c.overflowX !== 'visible' || c.overflowY !== 'visible' || c.clipPath !== 'none' || c.contain.includes('paint')) { const q = x.getBoundingClientRect(); if (c.overflowX !== 'visible') { l = Math.max(l, q.left); rr = Math.min(rr, q.right); } if (c.overflowY !== 'visible') { t = Math.max(t, q.top); b = Math.min(b, q.bottom); } }
        if (c.position === 'fixed') break;
      }
      return { l, t, r: rr, b };
    };
    const INTER = 'button,a[href],input,select,textarea,[role=button],[data-k],[data-tt],[data-rs],[data-c],[data-pad],.px-bord';
    for (const e of document.querySelectorAll('body *')) {
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
      if (!visible(e)) continue;
      const c = getComputedStyle(e), r = e.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
      if (e.closest('.px-fx-carte,.px-fx-loin,.px-tuto-fond,.px-fx-calque')) continue;   // les cartes de la fractale : des vues réduites qui glissent, voulu
      if (e.closest('.px-koin')) continue;   // les koins mangent les coins (0.99.7, voulu par RS-7)
      if (e.matches('.px-bord') || (e.matches('.px-scene') && e.closest('.px-fx'))) continue;   // les bords : au ras de l'écran, voulu ; la scène inclinée de la fractale
      const fixe = c.position === 'fixed' || c.position === 'sticky', inter = e.matches(INTER), texte = !e.children.length && (e.textContent || '').trim().length > 1;
      if (!fixe && !inter && !texte) continue;
      const v = vue(e); if (v.r - v.l < 2 || v.b - v.t < 2) continue;   // entièrement coupé par un cadre : invisible, voulu
      if (v.r <= 0 || v.l >= W || v.b <= 0 || v.t >= H) continue;          // entièrement dehors : un tiroir rangé, voulu
      const ancre = (() => { for (let x = e; x && x !== document.body; x = x.parentElement) { const c2 = getComputedStyle(x), p = c2.position; if (p === 'fixed' || p === 'sticky') return true; if (x !== e && /auto|scroll/.test(c2.overflowY) && x.scrollHeight > x.clientHeight + 2) return false; } return false; })();   // ne bouge pas en défilant (un cadre qui défile entre les deux : on peut le remonter)
      const hors = []; if (v.l < -3) hors.push('gauche ' + Math.round(-v.l)); if (v.r > W + 3) hors.push('droite ' + Math.round(v.r - W)); if (v.t < -3) hors.push('haut ' + Math.round(-v.t)); if (v.b > H + 3) hors.push('bas ' + Math.round(v.b - H));
      // un bouton sous l'encoche (en haut) ou sous l'indicateur d'accueil (en bas) : on ne peut pas le toucher
      if (inter && ancre && SA.top > 0 && v.t < SA.top - 4 && v.b > 0 && !e.closest('.px-haut')) hors.push('sous l\'encoche ' + Math.round(SA.top - v.t));
      if (inter && ancre && SA.bottom > 0 && v.b > H - SA.bottom + 6 && v.t < H) hors.push('sous l\'indicateur ' + Math.round(v.b - (H - SA.bottom)));
      if (inter && ancre && SA.left > 0 && v.l < SA.left - 4) hors.push('sous l\'encoche (paysage, gauche) ' + Math.round(SA.left - v.l));
      if (inter && ancre && SA.right > 0 && v.r > W - SA.right + 4) hors.push('sous l\'encoche (paysage, droite) ' + Math.round(v.r - (W - SA.right)));
      if (!ancre && hors.length && hors.every(h => /^bas /.test(h))) hors.length = 0;   // du contenu qui continue sous le bord : il défile
      if (hors.length) coupe.push({ ou, quoi: chemin(e), hors: hors.join(', '), fixe });
    }
    for (const e of document.querySelectorAll('body, body *')) {
      const c = getComputedStyle(e); if (!visible(e) || e.clientWidth < 40) continue;
      if (/auto|scroll/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 2 && !e.matches('[data-defile-x],.px-map-n,.px-map-rs,table,pre,.px-pages,.mk-defile,.mk-vues,.px-vues,.px-au-puces,.px-barre .px-hud,.px-sy-grille')) cadres.push({ ou, quoi: chemin(e), defile: e.scrollWidth - e.clientWidth });
      if (e.scrollLeft > 1 && !/auto|scroll/.test(c.overflowX) && !e.matches('.px-pages')) cadres.push({ ou, quoi: chemin(e), decale: e.scrollLeft });
    }
    return { ou, W, H, SA, deborde: document.documentElement.scrollWidth - W, coupe, cadres };
  }, ou);

  const ouvrir = async (id) => { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id).catch(() => {}); await page.waitForTimeout(700); };
  const accueil = async () => { await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')).catch(() => {}); await page.waitForTimeout(600); };
  const taille = async (z) => { await ouvrir('reglages-app'); await page.evaluate(() => { const b = document.querySelector('[data-rg-aller="apparence"]'); if (b) b.click(); }); await page.waitForTimeout(300);
    await page.evaluate((z) => { const b = document.querySelector('[data-pv="taille"][data-v="' + z + '"]'); if (b) b.click(); }, String(z)); await page.waitForTimeout(600); };
  const mode = async (m) => { await accueil(); await page.evaluate((m) => { const b = document.querySelector('[data-mode="' + m + '"]'); if (b) b.click(); }, m); await page.waitForTimeout(900); };
  const bord = async (cote, { dy = 0.5, dx = 120, tenir = 0, lacher = true } = {}) => { const b = await page.$('.px-bord-' + cote); if (!b) return; const bb = await b.boundingBox(); if (!bb) return;
    const x0 = bb.x + bb.width / 2, y = bb.y + bb.height * dy, s = cote === 'g' ? 1 : -1; await page.mouse.move(x0, y); await page.mouse.down(); if (tenir) await page.waitForTimeout(tenir);
    for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + s * dx * i / 8, y); await page.waitForTimeout(16); } if (lacher) await page.mouse.up(); await page.waitForTimeout(700); };

  const INTERNES = ['reglages-app', 'marketplace', 'banc', 'proche', 'synthe', 'autour', 'systeme', 'ambiances', 'atelier-peaux', 'passe', 'sante', 'journal-tsoins', 'gestion', 'trackpad', 'xers', 'map'];
  const res = [];
  async function tour(cfg, complet) {
    for (const m of complet ? ['organique', 'chill-tekk', 'xerboxion', 'xerbot'] : ['organique', 'chill-tekk']) { await mode(m); res.push(await audit(cfg + ' · accueil ' + m)); }
    await mode('organique');
    for (const id of INTERNES) { await ouvrir(id); res.push(await audit(cfg + ' · ' + id)); }
    // chaque page des réglages
    await ouvrir('reglages-app');
    const pages = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-rg-aller]')].map(b => b.getAttribute('data-rg-aller')))]);
    for (const p of complet ? pages : pages.slice(0, 4)) {
      await ouvrir('reglages-app'); await page.evaluate((p) => { const b = document.querySelector('[data-rg-aller="' + p + '"]'); if (b) b.click(); }, p); await page.waitForTimeout(350);
      res.push(await audit(cfg + ' · réglages › ' + p));
    }
    // la map à chaque palier
    await accueil();
    for (const pal of ['tout', 'reseau', 'hub']) { await page.evaluate((pal) => { const b = document.querySelector('[data-map-palier="' + pal + '"]'); if (b) b.click(); }, pal); await page.waitForTimeout(600); res.push(await audit(cfg + ' · map ' + pal)); }
    // la fractale (tenir le bord), puis lâchée ; chercher ; les koins dépliés
    await ouvrir('reglages-app'); await bord('d', { tenir: 700, dx: 10 }); res.push(await audit(cfg + ' · fractale ouverte')); await accueil();
    await bord('d', { dy: 0.15 }); res.push(await audit(cfg + ' · chercher')); await accueil();
    await page.evaluate(() => { const k = document.querySelector('[data-pad="wormion"]'); if (k) k.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 30, clientY: innerHeight - 30, pointerId: 9 })); }); await page.waitForTimeout(500);
    res.push(await audit(cfg + ' · koin tenu')); await page.evaluate(() => { const k = document.querySelector('[data-pad="wormion"]'); if (k) k.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 9 })); }); await page.waitForTimeout(300);
    await page.evaluate(() => window.ploxi0n.routeur.faire('tuto')).catch(() => {}); await page.waitForTimeout(700); res.push(await audit(cfg + ' · tuto')); await passer(); await accueil();
  }
  const configs = process.env.PX_ECRAN_RAPIDE ? [[393, 852, 1.15, true]] : [[393, 852, 1, true], [393, 852, 1.15, true], [393, 852, 1.45, true], [375, 667, 1.15, false], [430, 932, 1.15, false], [430, 932, 1.45, false], [852, 393, 1.15, false]];
  let sa = false;
  for (const [w, h, z, complet] of configs) {
    await page.setViewportSize({ width: w, height: h }); sa = await encoche(h > w); await page.waitForTimeout(400);
    await taille(z); await accueil();
    await tour(w + '×' + h + ' ×' + z, complet);
  }
  // regrouper : un même défaut vu à plusieurs endroits
  const g = new Map();
  for (const a of res) for (const c of a.coupe.concat(a.cadres.map(x => ({ ...x, hors: x.defile ? 'défile de côté ' + x.defile : 'décalé ' + x.decale })))) {
    const k = c.quoi + ' | ' + c.hors.replace(/\d+/g, '#'); if (!g.has(k)) g.set(k, { quoi: c.quoi, hors: c.hors, n: 0, ou: [] }); const x = g.get(k); x.n++; if (x.ou.length < 4) x.ou.push(c.ou);
  }
  return { encocheSimulee: sa, deborde: res.filter(a => a.deborde > 0).map(a => a.ou + ' : ' + a.deborde), defauts: [...g.values()].sort((a, b) => b.n - a.n) };
}
