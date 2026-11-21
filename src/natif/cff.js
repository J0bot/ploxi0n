// ⇄ LES TRAJETS CFF (0.99.67). RS-7 coord #2258 : « que les liens SBB CFF s'ajoutent automatiquement dans mon calendrier, des notifs de départ de
// là où je suis, et un widget calendrier pour ploxi0n ». Côté ploxi0n, sans Swift ni dépendance (le widget : docs/LOT-DU-JOUR.md) :
//   - un lien a.sbbmobile.ch/s/… (ou sbb.ch), seul ou dans le texte que l'app CFF partage, arrive par ploxi0n://cff?lien=… (une action
//     « partager » de Raccourcis) ou collé dans ⌕ chercher ;
//   - lu ici : les gares, le jour, l'heure de départ et d'arrivée (le texte, les paramètres du site des CFF) ; un lien court sans heure se
//     déplie d'abord (le HTTP natif suit la redirection, SANS le jeton du labo : il ne part jamais chez les CFF) ;
//   - un évènement dans le calendrier de l'app : le ploxion calendar du labo (/px/calendrier/evenement, par le relais du mode connecté) ;
//   - une notification locale de départ : l'heure du train moins le chemin jusqu'à la gare depuis là où tu es, si l'app connaît les deux
//     positions (la gare : ce que le labo renvoie pour l'évènement) ; sinon 15 min avant.
// Pur pour la lecture (trouverLienCff, lireTrajet, rappelDepart : testables) ; creerCff branche le calendrier, la notification, la bulle.

export const LIEN_CFF = /https?:\/\/(?:a\.sbbmobile\.ch\/s\/[\w-]+|(?:www\.)?sbb\.ch\/[^\s"'<>]+|(?:[\w-]+\.)?sbbmobile\.ch\/[^\s"'<>]*)/i;
/** le premier lien des CFF d'un texte (sans la ponctuation qui le suit), ou null */
export function trouverLienCff(t) { const m = LIEN_CFF.exec(String(t || '')); return m ? m[0].replace(/[).,;:!?»]+$/, '') : null; }

const deux = (n) => String(n).padStart(2, '0');
const jourDe = (d) => d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate());
const heure = (h) => { const m = /^(\d{1,2})[:.h](\d{2})$/.exec(String(h || '').trim()); return m && +m[1] < 24 && +m[2] < 60 ? deux(+m[1]) + ':' + m[2] : null; };
const nettoyerGare = (g) => String(g || '').replace(/\s+/g, ' ').replace(/^[\s,:;·-]+|[\s,:;·-]+$/g, '').slice(0, 60) || null;

/**
 * un trajet lu dans un texte (et les adresses qu'il contient) : { lien, de, a, depart: Date, arrivee: Date | null }, ou null sans heure de départ.
 * Le site des CFF : stops=[{label}], date="AAAA-MM-JJ", time="HH:MM", moment=DEPARTURE|ARRIVAL ; l'ancien horaire : von, nach, datum=JJ.MM.AAAA,
 * zeit=HH:MM, an=true (l'heure d'arrivée). Le texte de l'app : « Lausanne → Genève », « 21.11.2026 », « dép. 08:12 », « arr. 08:48 », ou deux heures.
 */
export function lireTrajet(texte, { maintenant = new Date() } = {}) {
  const s = String(texte || '');
  let de = null, a = null, jour = null, hDep = null, hArr = null;
  for (const brut of s.match(new RegExp(LIEN_CFF.source, 'gi')) || []) {
    let u; try { u = new URL(brut.replace(/[).,;:!?»]+$/, '')); } catch (e) { continue; }
    const q = u.searchParams, sans = (k) => String(q.get(k) || '').replace(/^"|"$/g, '');
    try { const l = JSON.parse(q.get('stops') || 'null'); if (Array.isArray(l) && l.length >= 2) { de = de || nettoyerGare(l[0] && (l[0].label || l[0].value)); a = a || nettoyerGare(l[l.length - 1] && (l[l.length - 1].label || l[l.length - 1].value)); } } catch (e) { /* pas du JSON */ }
    if (/^\d{4}-\d{2}-\d{2}$/.test(sans('date'))) jour = sans('date');
    if (heure(sans('time'))) { if (/ARRIVAL/i.test(sans('moment'))) hArr = heure(sans('time')); else hDep = heure(sans('time')); }
    de = de || nettoyerGare(q.get('von') || q.get('from')); a = a || nettoyerGare(q.get('nach') || q.get('to'));
    const dt = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(q.get('datum') || ''); if (dt) jour = dt[3] + '-' + deux(dt[2]) + '-' + deux(dt[1]);
    if (heure(q.get('zeit'))) { if (q.get('an') === 'true') hArr = heure(q.get('zeit')); else hDep = heure(q.get('zeit')); }
  }
  const t = s.replace(new RegExp(LIEN_CFF.source, 'gi'), ' ');   // le texte, sans les adresses
  const g = /([A-ZÀ-ÖØ-Ý][\p{L}.'’ -]*?)\s*(?:→|->|⇄|›|–|—)\s*([A-ZÀ-ÖØ-Ý][\p{L}.'’ -]*?)(?=\s*(?:[,;\n(·]|\d|$))/u.exec(t)
    || /\b(?:de|von|da|from)\s+([A-ZÀ-ÖØ-Ý][\p{L}.'’ -]*?)\s+(?:à|nach|a|to)\s+([A-ZÀ-ÖØ-Ý][\p{L}.'’ -]*?)(?=\s*(?:[,;\n(·]|\d|$))/u.exec(t);
  if (g) { de = de || nettoyerGare(g[1]); a = a || nettoyerGare(g[2]); }
  const d = /\b(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})?(?!\d)/.exec(t);
  if (!jour && d && +d[1] >= 1 && +d[1] <= 31 && +d[2] >= 1 && +d[2] <= 12) {
    let y = d[3] ? +d[3] : maintenant.getFullYear(); if (y < 100) y += 2000;
    jour = y + '-' + deux(d[2]) + '-' + deux(d[1]);
    if (!d[3] && new Date(jour + 'T23:59') < maintenant) jour = (y + 1) + jour.slice(4);   // « 3.1. » vu en décembre : l'an prochain
  }
  const dep = /(?:\bdép(?:art)?\.?|\bab|\bpart(?:enza)?\.?|\bdep(?:arture)?\.?)\s*(\d{1,2}[:.h]\d{2})/i.exec(t), arr = /(?:\barr(?:ivée|ivo|ival)?\.?|\ban)\s*(\d{1,2}[:.h]\d{2})/i.exec(t);
  hDep = hDep || (dep && heure(dep[1])); hArr = hArr || (arr && heure(arr[1]));
  if (!hDep) { const l = [...t.matchAll(/\b(\d{1,2}):(\d{2})\b/g)].map(m => heure(m[0])).filter(Boolean); if (l.length) { hDep = l[0]; hArr = hArr || l[1] || null; } }
  if (!hDep) return null;
  if (!jour) { const auj = new Date(maintenant); jour = jourDe(auj); if (new Date(jour + 'T' + hDep) < new Date(maintenant.getTime() - 3600e3)) { auj.setDate(auj.getDate() + 1); jour = jourDe(auj); } }
  const depart = new Date(jour + 'T' + hDep);
  let arrivee = hArr ? new Date(jour + 'T' + hArr) : null; if (arrivee && arrivee < depart) arrivee = new Date(arrivee.getTime() + 86400e3);
  return { lien: trouverLienCff(s), de, a, depart, arrivee };
}

/** la distance (km) entre deux positions { lat, lng } */
export function distanceKm(p, q) {
  const r = (x) => x * Math.PI / 180, dLat = r(q.lat - p.lat), dLng = r(q.lng - p.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(p.lat)) * Math.cos(r(q.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** l'heure du rappel : le départ moins le chemin jusqu'à la gare (à pied jusqu'à 2,5 km, 5 km/h + 3 min ; plus loin, 25 km/h + 10 min ; 2 h au plus),
 *  si l'on connaît où tu es ET la gare ; sinon 15 min avant. Rend { at: Date, minutes, depuisIci: bool } */
export function rappelDepart(depart, { ici = null, gare = null, defaut = 15 } = {}) {
  const ok = (p) => p && Number.isFinite(+p.lat) && Number.isFinite(+p.lng);
  let minutes = defaut, depuisIci = false;
  if (ok(ici) && ok(gare)) { const km = distanceKm({ lat: +ici.lat, lng: +ici.lng }, { lat: +gare.lat, lng: +gare.lng }); minutes = Math.min(120, Math.ceil(km <= 2.5 ? km / 5 * 60 + 3 : km / 25 * 60 + 10)); depuisIci = true; }
  return { at: new Date(depart.getTime() - minutes * 60000), minutes, depuisIci };
}

/**
 * fetch : celui du shim (les routes du serveur partent au labo en mode connecté) ; deplier(lien) → l'adresse finale d'un lien court (ou null) ;
 * rappel({ id, titre, texte, at, ouvrir }) : la notification locale ; position() → { lat, lng } ; signaler(texte) : la bulle
 */
export function creerCff({ W = globalThis.window, fetch: f = (u, o) => W.fetch(u, o), deplier = async () => null, rappel = async () => false, position = async () => null, signaler = () => {}, maintenant = () => new Date() }) {
  const hm = (d) => deux(d.getHours()) + ':' + deux(d.getMinutes()), loc = (d) => jourDe(d) + 'T' + hm(d);
  async function calendrier(t) {
    const jour = jourDe(t.depart);
    const g = await f('/px/calendrier/donnees.json?de=' + jour + '&a=' + jour, { headers: { Accept: 'application/json' } });
    if (!g.ok) throw new Error(g.status === 401 || g.status === 419 ? 'connecte-toi au labo' : 'calendrier : HTTP ' + g.status);
    const groupe = ((await g.json()).groupes || [])[0]; if (!groupe) throw new Error('pas encore de calendrier au labo');
    const titre = t.de && t.a ? t.de + ' → ' + t.a : t.a ? 'train → ' + t.a : 'train';
    const r = await f('/px/calendrier/evenement', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ groupe: groupe.id, titre, debut: loc(t.depart), fin: t.arrivee ? loc(t.arrivee) : null, journee: false, lieu: t.de ? 'gare de ' + t.de : null, note: t.lien || null, url: t.lien || null }) });
    if (!r.ok) throw new Error(r.status === 401 || r.status === 419 ? 'connecte-toi au labo' : 'calendrier : HTTP ' + r.status);
    let j = null; try { j = await r.json(); } catch (e) { j = null; }
    const ev = (j && (j.evenement || j.event || j)) || {};
    return { titre, gare: Number.isFinite(+ev.lat) && Number.isFinite(+ev.lng) && ev.lat !== null ? { lat: +ev.lat, lng: +ev.lng } : null };
  }
  /** un texte ou un lien des CFF → l'évènement et le rappel ; rend { trajet, calendrier: bool, rappel: Date | null } ou null */
  async function trajetDuLabo(lien) {
    const r = await f('/px/sbb/trajet?lien=' + encodeURIComponent(lien), { headers: { Accept: 'application/json' } });
    if (!r.ok) return null; const j = await r.json().catch(() => null), x = j && j.ok && j.trajet; if (!x || !x.depart) return null;
    const tr = (x.etapes || []).filter(e => e && e.type === 'transport')[0], g = tr && tr.de;
    return { lien, de: (g && g.nom) || x.de || null, a: x.vers || null, depart: new Date(x.depart), arrivee: x.arrivee ? new Date(x.arrivee) : null,
      gare: g && Number.isFinite(+g.lat) && Number.isFinite(+g.lng) ? { lat: +g.lat, lng: +g.lng } : null, ligne: (tr && tr.ligne) || x.ligne || '' };
  }
  async function ajouter(texte) {
    const s = String(texte || '').slice(0, 4000), lien = trouverLienCff(s);
    let t = lireTrajet(s, { maintenant: maintenant() });
    if (!t && lien) { const long = await Promise.resolve(deplier(lien)).catch(() => null); if (long) t = lireTrajet(s + '\n' + long, { maintenant: maintenant() }); }
    // (21.11, RS-1 avec le vrai lien de RS-7) le lien court de l'app ne porte que le jeton HAFAS du trajet (ni heure ni gares dans l'adresse) :
    // le labo le déplie (GET /px/sbb/trajet, App\Support\LienSbb) et rend les étapes, la gare de départ et sa position (pour le rappel)
    if (!t && lien && /a\.sbbmobile\.ch\/s\//i.test(lien)) t = await trajetDuLabo(lien).catch(() => null);
    if (!t) { signaler(lien ? '⇄ ce lien ne dit pas l\'heure : partage le trajet depuis l\'app CFF' : '⇄ pas de trajet CFF là-dedans'); return null; }
    let cal = null, err = null; try { cal = await calendrier(t); } catch (e) { err = (e && e.message) || 'calendrier'; }
    const gare = (cal && cal.gare) || t.gare || null;
    let ici = null; if (gare) ici = await Promise.race([Promise.resolve().then(() => position()).catch(() => null), new Promise(ok => setTimeout(() => ok(null), 6000))]);
    const r = rappelDepart(t.depart, { ici, gare });
    let pose = false; try { pose = await rappel({ id: 820000 + (Math.floor(t.depart.getTime() / 60000) % 90000), titre: '⇄ départ ' + hm(t.depart) + (t.de ? ' · ' + t.de : ''),
      texte: (t.de && t.a ? t.de + ' → ' + t.a : 'ton train') + ' · ' + (r.depuisIci ? 'pars maintenant (' + r.minutes + ' min jusqu\'à la gare)' : 'dans 15 min'), at: r.at, ouvrir: 'calendar' }); } catch (e) { pose = false; }
    signaler('⇄ ' + (t.de && t.a ? t.de + ' → ' + t.a + ', ' : '') + hm(t.depart) + (cal ? ' : au calendrier' : ' : pas au calendrier (' + err + ')') + (pose ? ', rappel à ' + hm(r.at) : ''));
    return { trajet: t, calendrier: !!cal, rappel: pose ? r.at : null };
  }
  return { ajouter };
}

/** (iPhone) le lien court des CFF déplié : le HTTP natif suit la redirection et rend l'adresse finale ; sans jeton ni cookie du labo */
export function deplierNatif(W = globalThis.window) {
  return async (lien) => {
    if (!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform())) return null;
    const { CapacitorHttp } = await import('@capacitor/core');
    const r = await CapacitorHttp.request({ method: 'GET', url: lien, headers: { Accept: 'text/html' }, responseType: 'text' });
    const corps = (typeof r.data === 'string' ? r.data : '').replace(/&amp;/g, '&');   // la page peut porter l'adresse longue (un lien, un og:url)
    const dans = corps.match(new RegExp(LIEN_CFF.source, 'gi')) || [];
    return [r.url || '', ...dans.slice(0, 8)].filter(Boolean).join('\n') || null;
  };
}
