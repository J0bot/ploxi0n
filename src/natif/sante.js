// ❤ LA SANTÉ (RS-7 12.10 : « attaquer le ploxion santé avec toutes nos données de santé de l'iPhone et nos appareils » ; « y a toujours rien
// sur le Health »). Un ploxion interne qui LIT Apple Santé (HealthKit, @capgo/capacitor-health) — l'iPhone, l'Apple Watch, la balance,
// tout ce qui écrit dans Santé :
//   - le premier geste : « autoriser » → la feuille d'iOS (ploxi0n apparaît alors dans Santé › Accès aux données) ;
//   - aujourd'hui : pas, distance, énergie active, étages, exercice, FC, FC au repos, VFC, SpO₂, respiration, poids, eau, pleine conscience ;
//   - la nuit : le sommeil et ses phases (profond, paradoxal, léger, éveillé) ;
//   - 7 ou 30 jours : les pas, le sommeil, la FC au repos, en barres (SVG, aucune bibliothèque) ;
//   - les entraînements, et les APPAREILS qui ont écrit ces données (leur nom, leur type).
// Rien ne quitte le téléphone SAUF si tu l'actives : « ☁ envoyer à mon boxion » (0.47, RS-7 : « que le ploxion santé soit connecté ») —
// connecté, un RÉSUMÉ (pas, sommeil, cœur, entraînements ; jamais les mesures brutes) part sur TON boxion (jOSBoxion « sante/resume » et
// « sante/jour-AAAA-MM-JJ ») : le hub 🌸 Santé du xerkion et tes autres appareils le lisent ; hors ligne, la file l'envoie au retour.
// jOSNatif.sante = jOSSante (le bion) pour les autres ploxions, dont le hub 🌸 Santé ouvert dans l'app : chaque ploxion demande une fois.
import { surPromesse } from './plugin-sur.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const LECTURE = ['steps', 'distance', 'calories', 'flightsClimbed', 'exerciseTime', 'heartRate', 'restingHeartRate', 'heartRateVariability', 'oxygenSaturation',
  'respiratoryRate', 'vo2Max', 'weight', 'height', 'bodyFat', 'sleep', 'mindfulness', 'dietaryWater', 'appleStandHour', 'bloodPressure', 'bodyTemperature',
  'appleSleepingWristTemperature', 'basalCalories', 'workouts'];
// les tuiles du jour : [type, nom, comment (somme du jour | dernière valeur), format]
const TUILES = [
  ['steps', 'pas', 'somme', (v) => Math.round(v).toLocaleString('fr-CH')],
  ['distance', 'distance', 'somme', (v) => (v / 1000).toFixed(1) + ' km'],
  ['calories', 'énergie active', 'somme', (v) => Math.round(v) + ' kcal'],
  ['flightsClimbed', 'étages', 'somme', (v) => Math.round(v)],
  ['exerciseTime', 'exercice', 'somme', (v) => Math.round(v) + ' min'],
  ['heartRate', 'cœur', 'dernier', (v) => Math.round(v) + ' bpm'],
  ['restingHeartRate', 'cœur au repos', 'dernier', (v) => Math.round(v) + ' bpm'],
  ['heartRateVariability', 'VFC', 'dernier', (v) => Math.round(v) + ' ms'],
  ['oxygenSaturation', 'SpO₂', 'dernier', (v) => Math.round(v <= 1 ? v * 100 : v) + ' %'],
  ['respiratoryRate', 'respiration', 'dernier', (v) => v.toFixed(1) + ' /min'],
  ['vo2Max', 'VO₂ max', 'dernier', (v) => v.toFixed(1)],
  ['weight', 'poids', 'dernier', (v) => v.toFixed(1) + ' kg'],
  ['dietaryWater', 'eau', 'somme', (v) => (v < 20 ? v.toFixed(1) + ' L' : Math.round(v) + ' mL')],
  ['mindfulness', 'pleine conscience', 'somme', (v) => Math.round(v) + ' min'],
];
const DORT = new Set(['asleep', 'rem', 'deep', 'light']);
const PHASES = [['deep', 'profond'], ['rem', 'paradoxal'], ['light', 'léger'], ['asleep', 'endormi'], ['awake', 'éveillé']];
const SPORTS = { running: '🏃 course', walking: '🚶 marche', cycling: '🚴 vélo', swimming: '🏊 natation', hiking: '🥾 rando', yoga: '🧘 yoga', functionalStrengthTraining: '🏋 force', traditionalStrengthTraining: '🏋 force', highIntensityIntervalTraining: '⚡ HIIT', climbing: '🧗 escalade', dance: '💃 danse', soccer: '⚽ foot', tennis: '🎾 tennis', rowing: '🚣 aviron', elliptical: '◯ elliptique', crossTraining: '✚ cross', boxing: '🥊 boxe', other: '◇ autre' };
const jour0 = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
/** ☾ (0.64) LA NUIT DITE ET LA NUIT MESURÉE : le dernier « dodo » noté (un tsoin, dans les 20 h) et le « réveil » qui suit, à côté des
 *  échantillons « sleep » d'Apple Santé (une Garmin y arrive par Garmin Connect : sourceName). → { dit, endormi, latence (min), reveilDit,
 *  finSommeil, ecartReveil (min, + = levé après la fin du sommeil), source } ; null sans « dodo ». */
export function comparerNuit(tsoins, samples, maintenant = Date.now()) {
  const t = (x) => new Date(x).getTime(), l = (tsoins || []).filter(x => x && (x.genre === 'dodo' || x.genre === 'reveil') && x.le).sort((a, b) => t(a.le) - t(b.le));
  const dodo = [...l].reverse().find(x => x.genre === 'dodo' && maintenant - t(x.le) < 20 * 3600e3); if (!dodo) return null;
  const dit = t(dodo.le), rev = l.find(x => x.genre === 'reveil' && t(x.le) > dit);
  const dort = (samples || []).filter(x => DORT.has(x.sleepState || 'asleep') && t(x.endDate) > dit - 2 * 3600e3).sort((a, b) => t(a.startDate) - t(b.startDate));
  const endormi = dort.length ? t(dort[0].startDate) : null, fin = dort.length ? Math.max(...dort.map(x => t(x.endDate))) : null;
  return { dit, endormi, latence: endormi == null ? null : Math.round((endormi - dit) / 60000), reveilDit: rev ? t(rev.le) : null, finSommeil: fin,
    ecartReveil: rev && fin != null ? Math.round((t(rev.le) - fin) / 60000) : null, source: dort.length ? (dort[0].sourceName || '') : '' };
}
const heure = (ms) => new Date(ms).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
/** la ligne de la page Santé */
export function ligneNuit(c) {
  if (!c) return '';
  const p = ['☾ dodo dit à <b>' + heure(c.dit) + '</b>'];
  if (c.endormi != null) p.push((c.latence >= 0 ? 'endormi·e à <b>' + heure(c.endormi) + '</b> : ' + c.latence + ' min pour t\'endormir' : 'endormi·e dès <b>' + heure(c.endormi) + '</b>, avant de le dire') + (c.source ? ' (' + c.source + ')' : ''));
  else p.push('pas encore de nuit mesurée (la montre synchronise au matin)');
  if (c.reveilDit != null) p.push('☀ réveil dit à <b>' + heure(c.reveilDit) + '</b>' + (c.ecartReveil != null ? ' · fin du sommeil ' + heure(c.finSommeil) + ' (' + (c.ecartReveil >= 0 ? '+' : '') + c.ecartReveil + ' min)' : ''));
  return '<p class="px-sante-dodo">' + p.join(' · ') + '</p>';
}
const hm = (min) => Math.floor(min / 60) + ' h ' + String(Math.round(min % 60)).padStart(2, '0');
const minutes = (s) => (Date.parse(s.endDate) - Date.parse(s.startDate)) / 60000;

/** le sommeil d'une liste d'échantillons « sleep » : le total endormi et les phases (min) ; les phases détaillées (stages) si présentes */
export function sommeil(samples) {
  const ph = {}; let total = 0;
  for (const s of samples || []) {
    const parts = s.stages && s.stages.length ? s.stages.map(x => ({ etat: x.stage, min: x.durationMinutes })) : [{ etat: s.sleepState || 'asleep', min: minutes(s) }];
    for (const p of parts) { if (!(p.min > 0)) continue; ph[p.etat] = (ph[p.etat] || 0) + p.min; if (DORT.has(p.etat)) total += p.min; }
  }
  return { total, phases: ph };
}
/** les appareils qui ont écrit : nom de la source + type */
export function appareils(listes) {
  const m = new Map();
  for (const s of listes.flat()) { if (!s) continue; const nom = s.sourceName || '?', k = nom + '|' + (s.deviceType || ''); const a = m.get(k) || { nom, type: s.deviceType || '', n: 0 }; a.n++; m.set(k, a); }
  return [...m.values()].sort((a, b) => b.n - a.n);
}

export function creerSante({ W = globalThis.window, boxion, vibrer = () => {}, plugin = null, courant = () => null, distant = () => null, valeur = async () => {} }) {
  const D = W.document;
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const H = async () => { if (plugin) return surPromesse(plugin); if (!natif()) throw new Error('Santé : sur l\'iPhone'); return surPromesse((await import('@capgo/capacitor-health')).Health); };
  async function dispo() { try { const h = await H(); const r = await h.isAvailable(); return r && r.available ? { ok: true } : { ok: false, raison: (r && r.reason) || 'HealthKit indisponible' }; } catch (e) { return { ok: false, raison: e.message || String(e) }; } }
  async function autoriser() { const h = await H(); const r = await h.requestAuthorization({ read: LECTURE, write: [], requestHistoryAccess: true }); await boxion.put('reglages', 'sante', { demande: new Date().toISOString() }).catch(() => {}); vibrer('succes'); return r; }
  const dejaDemande = async () => !!(await boxion.get('reglages', 'sante').catch(() => null));
  async function lire(dataType, { depuis = jour0(), jusqua = new Date(), limite = 500 } = {}) {
    const h = await H(); try { return (await h.readSamples({ dataType, startDate: new Date(depuis).toISOString(), endDate: new Date(jusqua).toISOString(), limit: limite, ascending: false })).samples || []; } catch (e) { return []; }
  }
  async function agreger(dataType, { depuis, bucket = 'day', aggregation = 'sum' } = {}) {
    const h = await H(); try { return (await h.queryAggregated({ dataType, startDate: new Date(depuis).toISOString(), endDate: new Date().toISOString(), bucket, aggregation })).samples || []; } catch (e) { return []; }
  }
  async function entrainements({ depuis, limite = 12 } = {}) { const h = await H(); try { return (await h.queryWorkouts({ startDate: new Date(depuis).toISOString(), endDate: new Date().toISOString(), limit: limite, ascending: false })).workouts || []; } catch (e) { return []; } }

  /** tout ce que l'écran montre, en une fois */
  async function resume({ jours = 7 } = {}) {
    const auj = jour0(), debut = new Date(auj.getTime() - (jours - 1) * 864e5), nuit = new Date(auj.getTime() - 6 * 3600e3);
    const lus = {}, tuiles = [];
    await Promise.all(TUILES.map(async ([t, nom, comment, fmt]) => {
      const l = await lire(t, { depuis: comment === 'somme' ? auj : new Date(Date.now() - 7 * 864e5), limite: comment === 'somme' ? 2000 : 1 }); lus[t] = l;
      if (!l.length) return;
      const v = comment === 'somme' ? l.reduce((a, s) => a + (+s.value || 0), 0) : +l[0].value;
      tuiles.push({ t, nom, valeur: fmt(v), brut: v, le: l[0].endDate, source: l[0].sourceName || '' });
    }));
    tuiles.sort((a, b) => TUILES.findIndex(x => x[0] === a.t) - TUILES.findIndex(x => x[0] === b.t));
    const dodo = await lire('sleep', { depuis: nuit, limite: 400 });
    // (0.48) les valeurs du jour pour les widgets (le cube) et Siri — sur le téléphone seulement
    { const p = tuiles.find(x => x.t === 'steps'), z = sommeil(dodo).total; try { if (p) await valeur('pas', 'Pas aujourd\'hui', p.valeur); if (z) await valeur('sommeil', 'Sommeil cette nuit', hm(z)); } catch (e) { /* */ } }
    const dodos = await lire('sleep', { depuis: new Date(debut.getTime() - 6 * 3600e3), limite: 3000 });
    const parNuit = []; for (let i = 0; i < jours; i++) { const fin = new Date(debut.getTime() + i * 864e5 + 18 * 3600e3), dep = new Date(fin.getTime() - 864e5); parNuit.push({ date: new Date(debut.getTime() + i * 864e5), valeur: sommeil(dodos.filter(s => Date.parse(s.endDate) > dep && Date.parse(s.endDate) <= fin)).total / 60 }); }
    const pas = (await agreger('steps', { depuis: debut })).map(s => ({ date: new Date(s.startDate), valeur: s.value }));
    const repos = (await agreger('restingHeartRate', { depuis: debut, aggregation: 'average' })).map(s => ({ date: new Date(s.startDate), valeur: (s.values && s.values.average) || s.value }));
    const sports = await entrainements({ depuis: new Date(Date.now() - 30 * 864e5) });
    return { tuiles, sommeil: sommeil(dodo), echantillonsNuit: dodo, series: { pas, sommeil: parNuit, repos }, entrainements: sports, appareils: appareils([...Object.values(lus), dodo, sports]) };
  }

  // ---- ☁ connecté : le résumé sur TON boxion (opt-in, éteint par défaut) ---------------------------------------------------------------------
  const jourCle = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const lirePartage = async () => ({ actif: false, dernier: null, erreur: null, ...((await boxion.get('reglages', 'sante-boxion').catch(() => null)) || {}) });
  const ecrirePartage = async (p) => { await boxion.put('reglages', 'sante-boxion', p).catch(() => {}); return p; };
  /** le résumé envoyé : des agrégats, jamais les mesures brutes */
  function compacter(r) {
    const auj = {}; for (const t of r.tuiles) auj[t.t] = Math.round(t.brut * 100) / 100;
    const jours = r.series.pas.map((p, i) => ({ date: jourCle(p.date), pas: Math.round(p.valeur || 0),
      sommeilH: Math.round(((r.series.sommeil[i] || {}).valeur || 0) * 10) / 10, coeurRepos: Math.round((r.series.repos[i] || {}).valeur || 0) || null }));
    return { maj: new Date().toISOString(), source: 'ploxi0n · iPhone', aujourdhui: auj, nuit: { minutes: Math.round(r.sommeil.total), phases: Object.fromEntries(Object.entries(r.sommeil.phases).map(([k, v]) => [k, Math.round(v)])) },
      jours, entrainements: r.entrainements.slice(0, 12).map(w => ({ type: w.workoutType, debut: w.startDate, minutes: Math.round((w.duration || 0) / 60), km: w.totalDistance ? Math.round(w.totalDistance / 100) / 10 : null, kcal: w.totalEnergyBurned ? Math.round(w.totalEnergyBurned) : null, source: w.sourceName || null })),
      appareils: r.appareils.map(a => ({ nom: a.nom, type: a.type })) };
  }
  let synchroEnCours = null;
  /** envoie le résumé si le partage est actif et qu'on est connecté ; force = même si la dernière synchro est récente (< 30 min) */
  async function synchroniser({ force = false } = {}) {
    if (synchroEnCours) return synchroEnCours;
    synchroEnCours = (async () => {
      const p = await lirePartage(), jb = distant();
      if (!p.actif) return { ok: false, raison: 'partage éteint' };
      if (!jb || !jb.set) return { ok: false, raison: 'pas connecté' };
      if (!force && p.dernier && Date.now() - Date.parse(p.dernier) < 30 * 60000) return { ok: true, recent: true, dernier: p.dernier };
      if (!(await dispo()).ok || !(await dejaDemande())) return { ok: false, raison: 'Santé pas autorisée' };
      try {
        const c = compacter(await resume({ jours: 7 }));
        await jb.set('sante', 'resume', c, 'Santé · résumé');
        await jb.set('sante', 'jour-' + jourCle(new Date()), { date: jourCle(new Date()), ...c.aujourdhui, nuit: c.nuit, maj: c.maj }, 'Santé · ' + jourCle(new Date()));
        await ecrirePartage({ ...p, dernier: c.maj, erreur: null });
        try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('natif', 'sante', c); } catch (e) { /* */ }
        return { ok: true, dernier: c.maj };
      } catch (e) { await ecrirePartage({ ...p, erreur: String((e && e.message) || e) }); return { ok: false, raison: String((e && e.message) || e) }; }
    })();
    try { return await synchroEnCours; } finally { synchroEnCours = null; }
  }
  async function partager(actif) { const p = await ecrirePartage({ ...(await lirePartage()), actif: !!actif }); vibrer(actif ? 'succes' : 'selection'); if (actif) await synchroniser({ force: true }); return lirePartage(); }

  // ---- l'écran -------------------------------------------------------------------------------------------------------------------------
  function barres(serie, { unite = '', fmt = (v) => Math.round(v) } = {}) {
    if (!serie.length || !serie.some(x => x.valeur > 0)) return '<p class="px-sous">pas encore de données</p>';
    const max = Math.max(...serie.map(x => x.valeur)) || 1, n = serie.length, w = 300, h = 90, bw = w / n;
    return '<svg class="px-sante-barres" viewBox="0 0 ' + w + ' ' + (h + 16) + '" preserveAspectRatio="none" role="img">'
      + serie.map((x, i) => { const bh = Math.max(1, x.valeur / max * h); return '<rect x="' + (i * bw + bw * 0.18).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2"><title>' + esc(x.date.toLocaleDateString('fr-CH') + ' · ' + fmt(x.valeur) + unite) + '</title></rect>'
        + (n <= 10 ? '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (h + 13) + '" text-anchor="middle">' + esc(x.date.toLocaleDateString('fr-CH', { weekday: 'narrow' })) + '</text>' : ''); }).join('')
      + '</svg><p class="px-sous">moyenne ' + esc(fmt(serie.reduce((a, x) => a + x.valeur, 0) / serie.filter(x => x.valeur > 0).length)) + esc(unite) + ' · max ' + esc(fmt(max)) + esc(unite) + '</p>';
  }
  function mount(hote) {
    let vivant = true, jours = 7;
    const dessiner = async () => {
      const d = await dispo();
      if (!vivant) return;
      if (!d.ok) { hote.innerHTML = '<div class="px-page px-sante"><p class="px-grave">❤ santé</p><p class="px-sous">' + esc(d.raison) + '</p></div>'; return; }
      if (!(await dejaDemande())) {
        hote.innerHTML = '<div class="px-page px-sante"><p class="px-grave">❤ santé</p><h2>Tes données de santé, ici</h2><p>Pas, sommeil, cœur, entraînements… tout ce que ton iPhone, ta montre et tes appareils écrivent dans Santé. Lu sur le téléphone ; rien n\'en part sans ton accord.</p><p class="px-sous">iOS te demande quoi partager ; tu pourras changer d\'avis dans Réglages › Santé › Accès aux données › ploxi0n.</p></div>'
          + '<div class="px-journal-bas"><button class="p" data-autoriser>autoriser l\'accès à Santé</button></div>';
        hote.querySelector('[data-autoriser]').onclick = async (e) => { e.target.disabled = true; try { await autoriser(); } catch (er) { e.target.textContent = '⚠ ' + (er.message || er); return; } dessiner(); };
        return;
      }
      hote.innerHTML = '<div class="px-page px-sante"><p class="px-grave">❤ santé · lecture…</p></div>';
      const r = await resume({ jours });
      const pt = await lirePartage(), co = !!distant();
      if (!vivant) return;
      const s = r.sommeil;
      // ☾ (0.64) la nuit dite (tes tsoins « dodo », « réveil ») à côté de la nuit mesurée
      const dits = (await boxion.lire('tsoins', { limite: 5000 }).catch(() => [])).map(x => x && x.entry).filter(x => x && (x.genre === 'dodo' || x.genre === 'reveil'));
      const nuitDite = comparerNuit(dits, r.echantillonsNuit);
      // ▤ (0.51) minimisée, la Santé reste un mini dock : les pas, la nuit, le cœur ; ↻ relit
      { const md = W.jOSMiniDock, v = (k) => (r.tuiles.find(x => x.t === k) || {}).valeur;
        if (md) md.publier({ cle: 'sante', ploxion: 'sante', titre: 'Santé', icone: '❤', sous: [v('steps') ? v('steps') + ' pas' : null, s.total ? '☾ ' + hm(s.total) : null, v('heartRate') ? '♥ ' + v('heartRate') : null].filter(Boolean).join(' · ') || 'rien de lisible aujourd\'hui',
          actions: [{ id: 'relire', icone: '↻', nom: 'relire Santé', faire: () => dessiner() }] }); }
      hote.innerHTML = '<div class="px-page px-sante"><p class="px-grave">❤ santé · aujourd\'hui</p>'
        + (r.tuiles.length ? '<div class="px-sante-tuiles">' + r.tuiles.map(t => '<div class="px-sante-t"><small>' + esc(t.nom) + '</small><b>' + esc(t.valeur) + '</b></div>').join('') + '</div>'
          : '<p class="px-sous">Rien de lisible. Si tu as refusé un type : Réglages › Santé › Accès aux données › ploxi0n (iOS ne dit pas aux apps ce qui est refusé).</p>')
        + '<h3>☾ la nuit</h3>' + ligneNuit(nuitDite) + (s.total ? '<p class="px-sante-gros">' + hm(s.total) + '</p><div class="px-sante-phases">' + PHASES.filter(([k]) => s.phases[k]).map(([k, n]) => '<span class="ph-' + k + '" style="flex:' + s.phases[k].toFixed(0) + '">' + esc(n) + ' ' + hm(s.phases[k]) + '</span>').join('') + '</div>' : '<p class="px-sous">pas de sommeil enregistré cette nuit</p>')
        + '<h3>👣 pas · ' + jours + ' jours</h3>' + barres(r.series.pas)
        + '<h3>☾ sommeil · ' + jours + ' nuits</h3>' + barres(r.series.sommeil, { unite: ' h', fmt: (v) => v.toFixed(1) })
        + '<h3>♥ cœur au repos · ' + jours + ' jours</h3>' + barres(r.series.repos, { unite: ' bpm' })
        + '<h3>🏃 entraînements · 30 jours</h3>' + (r.entrainements.length ? r.entrainements.map(w => '<div class="px-ligne-tsoin"><span class="g">' + esc((SPORTS[w.workoutType] || '◇ ' + w.workoutType).split(' ')[0]) + '</span><div><b>' + esc((SPORTS[w.workoutType] || w.workoutType).replace(/^\S+ /, '')) + '</b> · ' + Math.round(w.duration / 60) + ' min'
          + (w.totalDistance ? ' · ' + (w.totalDistance / 1000).toFixed(1) + ' km' : '') + (w.totalEnergyBurned ? ' · ' + Math.round(w.totalEnergyBurned) + ' kcal' : '') + '<small>' + esc(new Date(w.startDate).toLocaleString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) + (w.sourceName ? ' · ' + esc(w.sourceName) : '') + '</small></div></div>').join('') : '<p class="px-sous">aucun ces 30 derniers jours</p>')
        + '<h3>⌚ tes appareils</h3>' + (r.appareils.length ? r.appareils.map(a => '<div class="px-ligne-tsoin"><span class="g">' + (/watch/i.test(a.nom + a.type) ? '⌚' : /phone/i.test(a.nom + a.type) ? '📱' : '◈') + '</span><div><b>' + esc(a.nom) + '</b><small>' + esc(a.type || 'source') + ' · ' + a.n + ' mesure(s) lue(s)</small></div></div>').join('') : '<p class="px-sous">aucun pour l\'instant</p>')
        + '<h3>☁ ton boxion</h3><div class="px-ligne-tsoin"><span class="g">' + (pt.actif ? '☁' : '◌') + '</span><div><b>' + (pt.actif ? (co ? 'activé : un résumé part sur ton boxion' : 'activé, en attente de connexion') : 'pas envoyé') + '</b><small>'
          + esc(pt.actif ? (co ? (pt.dernier ? 'dernier envoi ' + new Date(pt.dernier).toLocaleString('fr-CH', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'pas encore envoyé') : 'connecte-toi (👤) pour l\'envoyer') + (pt.erreur ? ' · ⚠ ' + pt.erreur : '')
            : 'pas, sommeil, cœur et entraînements en résumé (jamais les mesures brutes) → le hub 🌸 Santé du xerkion et tes autres appareils') + '</small></div></div>'
        + '<p class="px-sous" style="margin-top:18px">' + (pt.actif ? 'Lu sur ce téléphone ; seul le résumé part sur TON boxion.' : 'Lu sur ce téléphone, jamais envoyé.') + ' Gérer : Réglages › Santé › Accès aux données › ploxi0n.</p></div>'
        + '<div class="px-journal-bas px-puces"><button class="px-puce' + (jours === 7 ? ' on' : '') + '" data-j="7">7 jours</button><button class="px-puce' + (jours === 30 ? ' on' : '') + '" data-j="30">30 jours</button><button class="px-puce' + (pt.actif ? ' on' : '') + '" data-partage>☁ ' + (pt.actif ? 'envoyé' : 'envoyer') + '</button>' + (pt.actif && co ? '<button class="px-puce" data-synchro>↥ maintenant</button>' : '') + '<button class="px-puce" data-autoriser>autorisations</button><button class="px-puce" data-j="' + jours + '">↻</button></div>';
      hote.querySelectorAll('[data-j]').forEach(b => { b.onclick = () => { jours = +b.getAttribute('data-j'); vibrer('selection'); dessiner(); }; });
      hote.querySelector('[data-autoriser]').onclick = async () => { try { await autoriser(); } catch (e) { /* */ } dessiner(); };
      hote.querySelector('[data-partage]').onclick = async (e) => { e.target.disabled = true; await partager(!pt.actif); dessiner(); };
      const bs = hote.querySelector('[data-synchro]'); if (bs) bs.onclick = async () => { bs.disabled = true; bs.textContent = '↥ …'; await synchroniser({ force: true }); dessiner(); };
    };
    dessiner().catch(e => { if (vivant) hote.innerHTML = '<p class="px-erreur">santé : ' + esc(e.message || e) + '</p>'; });
    return { unmount() { vivant = false; hote.innerHTML = ''; if (W.jOSMiniDock) W.jOSMiniDock.retirer('sante'); } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.sante = { manifest: { id: 'sante', name: 'Santé iPhone', icon: '❤' }, mount };

  // ---- jOSNatif.sante : pour les autres ploxions, sur accord (une fois par ploxion) ---------------------------------------------------------
  async function permis() {
    const id = courant() || '?'; if (id === 'sante') return true;
    const p = (await boxion.get('reglages', 'sante-ploxions').catch(() => null)) || {};
    if (id in p) { if (!p[id]) throw new Error('santé refusée à ' + id); return true; }
    const ok = await new Promise((fin) => {
      const f = D.createElement('div'); f.className = 'px-voile';
      f.innerHTML = '<div class="px-tiroir"><p class="px-ft">❤ santé</p><p>« ' + esc(id) + ' » veut lire tes données de santé (sur le téléphone, rien n\'est envoyé par ploxi0n).</p><button class="p" data-ok>autoriser</button><button data-non>refuser</button></div>';
      f.addEventListener('click', (e) => { if (e.target.closest('[data-ok]')) { f.remove(); fin(true); } else if (e.target.closest('[data-non]') || e.target === f) { f.remove(); fin(false); } });
      (D.getElementById('ploxi0n') || D.body).appendChild(f);
    });
    p[id] = ok; await boxion.put('reglages', 'sante-ploxions', p).catch(() => {});
    if (!ok) throw new Error('santé refusée à ' + id); return true;
  }
  const api = {
    dispo,
    async autoriser() { await permis(); return autoriser(); },
    async lire(type, o) { await permis(); return lire(type, o); },
    async agreger(type, o) { await permis(); return agreger(type, o); },
    async entrainements(o) { await permis(); return entrainements(o); },
    async resume(o) { await permis(); return resume(o); },
  };
  W.jOSSante = api;   // le bion : le hub 🌸 Santé du xerkion (et tout ploxion) lit l'iPhone dans l'app, sur accord
  return { api, mount, resume, autoriser, synchroniser, partager, partage: lirePartage, ploxion: { id: 'sante', nom: 'Santé iPhone', icone: '❤', interne: true } };
}
