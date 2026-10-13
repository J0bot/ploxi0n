// Le parcours : le tuto, chaque ploxion du catalogue, chaque capacité de jOSNatif, un raccourci reçu au retour au premier plan.
export default async function ({ page, ecrire, journal, prefs, emettre }) {
  const r = { ploxions: [], natif: {}, raccourci: null, reglages: [] };
  const marque = (t) => journal.push('—— ' + t);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(300);
  const cat = await page.evaluate(() => window.ploxi0n.routeur.catalogue().map(p => ({ id: p.id, nom: p.nom, interne: !!p.interne })));
  for (const p of cat) {
    marque('ouvrir ' + p.id);
    const ok = await page.evaluate(async (id) => { try { return await window.ploxi0n.routeur.ouvrir(id); } catch (e) { return 'EXC ' + e.message; } }, p.id);
    await page.waitForTimeout(1200);
    const txt = await page.evaluate(() => { const h = document.querySelector('.px-hote'); return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 160) : '(pas d\'hôte)'; });
    await ecrire('px-' + p.id);
    r.ploxions.push({ id: p.id, ok, txt });
    await page.evaluate(() => window.ploxi0n.routeur.accueil());
    await page.waitForTimeout(300);
  }
  marque('jOSNatif');
  r.natif = await page.evaluate(async () => {
    const N = window.jOSNatif, out = {};
    const essai = async (k, f) => { try { const v = await f(); out[k] = v === undefined ? 'ok' : JSON.stringify(v).slice(0, 140); } catch (e) { out[k] = 'ERREUR ' + (e && e.message); } };
    await essai('capacites', () => N.capacites && N.capacites());
    await essai('vibrer', () => N.vibrer('moyen'));
    await essai('copier', () => N.copier('x'));
    await essai('coller', () => N.coller());
    await essai('appareil', () => N.appareil());
    await essai('batterie', () => N.batterie());
    await essai('reseau', () => N.reseau());
    await essai('position', () => N.position());
    await essai('meteo', () => N.meteo());
    await essai('notifier', () => N.notifier({ titre: 't', texte: 'x' }));
    await essai('parler', () => N.parler('bonjour'));
    await essai('maison', () => N.maison.liste());
    await essai('jeu', () => N.jeu.connecter());
    await essai('haptique', () => N.haptique && N.haptique('succes'));
    await essai('sante.dispo', () => N.sante && N.sante.dispo());
    await essai('verrou.dispo', () => window.jOSVerrou && window.jOSVerrou.dispo());
    await essai('widgets.publier', () => window.ploxi0nWidgets.publier());
    return out;
  });
  marque('raccourci');
  prefs.set('ploxi0n.ouvrir', 'bother');
  prefs.set('ploxi0n.tsoins-en-attente', JSON.stringify([{ k: 'eau', d: 'un verre', t: Date.now() }]));
  emettre('App', 'appStateChange', { isActive: true });
  await page.waitForTimeout(1500);
  r.raccourci = { courant: await page.evaluate(() => window.ploxi0n.routeur.courant()), ouvrirRestant: prefs.get('ploxi0n.ouvrir') || null,
    ploxionsPublies: (prefs.get('ploxi0n.ploxions') || '').slice(0, 120), epingles: prefs.get('ploxi0n.epingles') || null, valeurs: (prefs.get('ploxi0n.valeurs') || '').slice(0, 120) };
  await ecrire('raccourci');
  return r;
}
