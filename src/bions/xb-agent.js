// @bion jOSXb — l'agent xb dans ploxi0n : le téléphone devient un APPAREIL du labo (comme un Pi avec « xb agent ») | api: appairer, demarrer, arreter, etat, journal, oublier, surEtat
// ▸ (0.99.33, RS-7 : « le xerboxion en entier sur un Android, avec xb » → « go »). Le même protocole que le CLI xb (labo.j0bot.ch/downloads/xb/xb.mjs,
// cmdInit/approuver et cmdAgent), en JS, sans Node :
//   appairage  POST /px/miroir/enroler {nom, secret, droits} → {id, code} ; la personne approuve sur /px/miroir/ok?code=… ; on attend
//              GET /px/miroir/enroler/<id>?secret=… → {statut:'approuve', jeton:'xj_…'} (10 min au plus)
//   battement  POST /xb/appareil/battement (X-Xer-Jeton) {nom, version, os, cmds, io, infos} → {demandes:[{uid, cmd, args}]} toutes les 3 s
//   sortie     POST /xb/appareil/sortie/<uid> {texte} … puis {fin:{code[, etat:'refuse']}}
// L'APPAREIL JUGE : seules les commandes de CMDS passent, avec des arguments qui collent à leurs motifs (ceux du CLI) ; le reste est refusé
// et le labo le voit. Rien ne tourne tant que la personne n'a pas allumé l'agent (ne pas nuire) ; le jeton : le trousseau (coffre), jamais une URL.
export const RX = { mot: /^[a-z0-9][a-z0-9-]{1,39}$/, msg: /^[^\n\r\x00]{3,160}$/, url: /^https?:\/\/[^\s"'<>]{3,300}$/,
  cible: /^([a-z0-9][a-z0-9-]{0,59}|https?:\/\/[^\s"'<>]{3,300})$/ };
// le droit demandé : « atelier », celui d'un jeton `xb init --coller`, avec lequel `xb agent` tourne déjà (pas « miroir » : rien à copier du compte)
export const DROITS = ['atelier'];
const JETON = /^xj_[a-f0-9]{48}$/;
const hex = (n, alea) => { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(alea() * 16).toString(16); return s; };

/** une demande du labo est-elle acceptée par l'appareil ? → null (oui) ou la raison du refus */
export function juger(cmds, d) {
  const def = d && cmds[d.cmd]; const a = Array.isArray(d && d.args) ? d.args.map(String) : [];
  if (!def) return '« ' + String(d && d.cmd).slice(0, 40) + ' » n\'est pas dans la liste de cet appareil';
  if (a.length > (def.args || []).length) return 'trop d\'arguments';
  for (let i = 0; i < a.length; i++) if (a[i] !== '' && !def.args[i].test(a[i])) return 'l\'argument ' + (i + 1) + ' ne passe pas';
  return null;
}

/**
 * requete({ methode, url, headers, corps }) → { status, texte }   (le relais HTTP de l'app : CapacitorHttp sur le téléphone)
 * coffre : { lire(), garder(jeton), oublier() }                    (le trousseau, Face ID)
 * cmds : { nom: { args: [RegExp…], faire: async (args, ecrire) → code } }
 */
export function creerAgentXb({ requete, coffre, cmds, source = 'https://labo.j0bot.ch', nom = () => 'ploxi0n', version = '0', os = 'web', infos = async () => ({}),
  ouvrirLien = () => {}, attendre = (ms) => new Promise(r => setTimeout(r, ms)), alea = Math.random, maintenant = () => Date.now(), periode = 3000 } = {}) {
  let jeton = null, actif = false, etat = { statut: 'eteint', erreur: null, depuis: null, dernier: null, commandes: 0, appairage: null }, tour = 0;
  const journal = [], auditeurs = new Set();
  const poser = (o) => { etat = { ...etat, ...o }; for (const f of auditeurs) { try { f({ ...etat }); } catch (e) { /* */ } } };
  const noter = (l) => { journal.unshift({ t: maintenant(), l: String(l).slice(0, 300) }); journal.length = Math.min(journal.length, 60); };
  const json = (r) => { try { return JSON.parse((r && r.texte) || '{}') || {}; } catch (e) { return {}; } };
  const api = (methode, chemin, corps) => requete({ methode, url: source + chemin,
    headers: { 'X-Xer-Jeton': jeton, Accept: 'application/json', ...(corps ? { 'Content-Type': 'application/json' } : {}) }, corps: corps ? JSON.stringify(corps) : undefined });

  async function appairer({ annule = () => false, duree = 600000 } = {}) {
    const secret = hex(64, alea);
    const r = await requete({ methode: 'POST', url: source + '/px/miroir/enroler', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      corps: JSON.stringify({ nom: String(nom()).slice(0, 60), secret, droits: DROITS }) });
    const d = json(r);
    if (r.status !== 201 || !d.id || !d.code) throw new Error('le labo répond ' + r.status + (r.status === 404 ? ' (pas d\'enrôlement par code ici)' : '') + (d.error ? ' : ' + d.error : ''));
    const lien = source + '/px/miroir/ok?code=' + encodeURIComponent(d.code);
    poser({ statut: 'appairage', appairage: { code: String(d.code), lien }, erreur: null }); noter('appairage : code ' + d.code);
    ouvrirLien(lien);
    const fin = maintenant() + duree;
    while (maintenant() < fin) {
      await attendre(2000);
      if (annule()) { poser({ statut: 'eteint', appairage: null }); throw new Error('appairage annulé'); }
      let p; try { p = await requete({ methode: 'GET', url: source + '/px/miroir/enroler/' + encodeURIComponent(d.id) + '?secret=' + secret, headers: { Accept: 'application/json' } }); } catch (e) { continue; }
      const j = json(p);
      if (j.statut === 'approuve' && JETON.test(j.jeton || '')) {
        jeton = j.jeton; try { await coffre.garder(jeton); } catch (e) { noter('le trousseau a refusé : le jeton vaut pour cette séance'); }
        poser({ statut: 'eteint', appairage: null, compte: j.nom_compte || j.compte || null }); noter('✓ appairé' + (j.nom_compte ? ' au compte ' + j.nom_compte : ''));
        return { compte: j.nom_compte || j.compte || null };
      }
      if (j.statut === 'refuse') { poser({ statut: 'eteint', appairage: null, erreur: 'refusé sur le labo' }); throw new Error('refusé sur le labo'); }
      if (p.status === 410 || p.status === 404) { poser({ statut: 'eteint', appairage: null, erreur: 'la demande a expiré' }); throw new Error('la demande a expiré'); }
    }
    poser({ statut: 'eteint', appairage: null, erreur: '10 minutes sans approbation' }); throw new Error('10 minutes sans approbation');
  }

  async function executer(d) {
    const uid = encodeURIComponent(String(d.uid || ''));
    const envoyer = (corps) => api('POST', '/xb/appareil/sortie/' + uid, corps).catch(() => null);
    const refus = juger(cmds, d);
    if (refus) { noter('✗ refusé : ' + d.cmd); await envoyer({ texte: '✗ refusé par l\'appareil : ' + refus + '\n', fin: { code: 1, etat: 'refuse' } }); return; }
    const a = Array.isArray(d.args) ? d.args.map(String) : [];
    noter('▶ xb ' + d.cmd + (a.length ? ' ' + a.join(' ') : ''));
    let tampon = '';
    const ecrire = (t) => { tampon += String(t); };
    let code = 0;
    try { code = (await cmds[d.cmd].faire(a, ecrire)) || 0; } catch (e) { ecrire('✗ ' + (e && e.message ? e.message : e) + '\n'); code = 1; }
    poser({ commandes: etat.commandes + 1 });
    await envoyer({ texte: tampon || '' , fin: { code } });
  }

  async function boucle(n) {
    let pause = periode;
    while (actif && n === tour) {
      let r = null;
      try { r = await api('POST', '/xb/appareil/battement', { nom: String(nom()).slice(0, 60), version: 'ploxi0n-' + version, os, cmds: Object.keys(cmds), io: { entrees: [], sorties: [] }, infos: await infos().catch(() => ({})) }); }
      catch (e) { r = { status: 0 }; }
      if (!actif || n !== tour) return;
      if (r.status === 401 || r.status === 403) { actif = false; poser({ statut: 'refuse', erreur: 'jeton refusé (révoqué ?) : appairer de nouveau' }); noter('✗ jeton refusé'); return; }
      if (r.status !== 200) { poser({ statut: 'hors-ligne', erreur: r.status ? 'le labo répond ' + r.status : 'pas de réseau' }); pause = Math.min(30000, pause * 2); await attendre(pause); continue; }
      pause = periode; poser({ statut: 'connecte', erreur: null, dernier: maintenant() });
      for (const d of (json(r).demandes || []).slice(0, 10)) { if (!actif || n !== tour) return; await executer(d); }
      await attendre(pause);
    }
  }

  return {
    appairer,
    /** allumer : le jeton du trousseau (Face ID), puis le battement */
    async demarrer() {
      if (actif) return true;
      if (!jeton) { try { jeton = await coffre.lire(); } catch (e) { jeton = null; } }
      if (!JETON.test(jeton || '')) { jeton = null; poser({ statut: 'eteint', erreur: 'pas encore appairé' }); return false; }
      actif = true; tour++; poser({ statut: 'connexion', erreur: null, depuis: maintenant() }); noter('agent allumé');
      boucle(tour); return true;
    },
    arreter() { if (!actif) return; actif = false; tour++; poser({ statut: 'eteint', depuis: null }); noter('agent éteint'); },
    async oublier() { this.arreter(); jeton = null; try { await coffre.oublier(); } catch (e) { /* */ } poser({ statut: 'eteint', compte: null, erreur: null }); noter('jeton oublié'); },
    etat: () => ({ ...etat, actif, appaire: !!jeton }),
    journal: () => journal.slice(),
    cmds: () => Object.keys(cmds),
    surEtat(f) { auditeurs.add(f); return () => auditeurs.delete(f); },
  };
}
