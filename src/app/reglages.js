// ⚙ LES RÉGLAGES de ploxi0n (RS-7 11.10 : « un vrai bouton réglages » ; 12.10 : « améliorer au max les réglages, on a tellement d'options
// qu'on peut activer ou désactiver ; on doit pouvoir manager les bions »). Un ploxion interne, toujours au bout du ⚙ (il ne se retire pas).
// (0.47, RS-7 : « réorganiser les paramètres pour les rendre plus chill, des paramètres de sous-paramètres ») : comme les Réglages d'iOS —
// un accueil court (cinq groupes, une ligne par catégorie avec son état en un mot et ›), chaque catégorie sur sa page (‹ pour revenir),
// et des sous-pages pour ce qui est long (les gestes des bords ; l'haptique : motifs, événements, signatures). La recherche fouille tout.
// Les bions : chacun avec sa taille et les ploxions qui l'utilisent ; le couper (plus chargé), le mettre à jour, le retirer s'il ne sert plus.
import { VARIANTES } from '../bions/membrane.js';
import { ECRITURES, POLICES } from './prefs.js';   // (0.95) les peaux de l'organique
import { SUJETS as SUJETS_PUSH } from '../natif/push.js';
import { ACTIONS_BORDS } from './routeur.js';
import { testerClavier } from './clavier.js';
import { PLUGIONS } from '../natif/plugions.js';
import { STYLES, EVENEMENTS, MOTIFS_APP, DENSITES } from '../natif/haptique.js';
import { BRANCHEMENTS } from '../natif/web-natif.js';
import { versGlyphe, glyphePloxion } from './glyphes.js';
import { LANGUES } from '../bions/dire.js';
import { diagnostic, diagnosticDans, dernierDiagnostic } from './diagnostic.js';   // ◎ (0.99.18)   // ⟡ (0.99.14) la langue de l'app   // ◇ (0.54) des glyphes, plus d'emoji
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ko = (n) => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (Math.round(n / 104857.6) / 10) + ' Mo';
const heures = (s) => !s ? '0 h' : s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : (Math.round(s / 360) / 10).toLocaleString('fr-CH') + ' h';
export const FOURNIS_APP = ['jOSApps', 'jOSPorts', 'jOSTsoin', 'jOSBoxion', 'jOS', 'jOSXerPrefs', 'jOSMobile', 'jOSb', 'jOSVerrou', 'jOSRaccourcis', 'jOSEcranAccueil', 'jOSKeyboard (le clavier d\'iOS)', 'jOSSante (Apple Santé)', 'jOSMiniDock (les mini docks)'];
// l'accueil des réglages : [groupe, [[page, icône, nom]]] ; SOUS : une sous-page → sa page parente (‹ y revient)
export const GROUPES = [   // [page, glyphe (src/app/glyphes.js), nom]
  ['toi', [['compte', 'compte', 'Compte'], ['reseau', 'globe', 'Réseau et mode connecté']]],
  ['l\'iPhone', [['natif', 'bion', 'Natif'], ['sante', 'coeur', 'Santé'], ['widgets', 'widgets', 'Widgets'], ['notifs', 'notifs', 'Notifications'], ['faceid', 'verrou', 'Face ID'], ['iphone', 'iphone', 'Écran d\'accueil de l\'iPhone']]],
  ['le look', [['apparence', 'palette', 'Apparence'], ['haptique', 'haptique', 'Haptique'], ['lecteur', 'video', 'Lecteur']]],
  ['les gestes', [['navigation', 'navigation', 'Navigation'], ['hud', 'dock', 'HUD et dock'], ['accueil', 'maison', 'Accueil']]],
  ['tes ploxions', [['ploxions', 'portion', 'Ploxions'], ['bions', 'bion', 'Bions'], ['donnees', 'donnees', 'Données']]],
  ['', [['apropos', 'chilltekk', 'À propos']]],
];
export const SOUS = { gestes: 'navigation', 'haptique-motifs': 'haptique', 'haptique-evenements': 'haptique', 'haptique-fractale': 'haptique', 'haptique-ploxions': 'haptique' };

export function enregistrerReglages({ W = globalThis.window, compte, social = null, remontee = null, hud, routeur, depot, boxion, modeConnecte, notifs = null, prefs = null, vibrer = () => {}, haptique = null, lecteur = null, lecteurNatif = null, sante = null, cube = null, valeurs = () => ({}), version = '?', maj = null }) {
  const ELS = { tsoin: '⧗ noter un tsoin', vocal: 'vocal', compte: 'compte', reseau: 'réseau et mode connecté', heure: 'heure', chercher: 'chercher un ploxion', epingles: 'ploxions épinglés' };
  function mount(hote) {
    let vivant = true, q = '', composition = [], page = null;   // page : null = l'accueil des réglages
    const R = () => routeur();
    hote.innerHTML = '<div class="rg"><style>'
      + '.rg{padding:0 16px 80px;max-width:640px;margin:0 auto}.rg h3{margin:24px 6px 8px;font:600 10.5px var(--mono,monospace);letter-spacing:.2em;text-transform:uppercase;color:var(--muted,#8aa0c0)}'
      + '.rg-tete{position:sticky;top:0;z-index:3;background:var(--bg,#07050c);padding:12px 0 8px;margin:0 -16px;padding-left:16px;padding-right:16px;border-bottom:1px solid var(--bord,#272036)}'
      + '.rg-q{width:100%;box-sizing:border-box;padding:11px 14px;border-radius:14px;border:var(--trait,2px) solid var(--bord,#272036);background:var(--creux,#0a0712);color:inherit;font:16px var(--police,system-ui);-webkit-appearance:none;appearance:none}.rg-q:focus{outline:none;border-color:var(--bord2,#3a3050)}'
      + '.rg-fil{display:flex;align-items:center;gap:10px;margin-bottom:8px;min-height:34px}.rg-fil b{font:600 11px var(--mono,monospace);letter-spacing:.24em;text-transform:uppercase;color:var(--txt,#eee);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rg-fil .rg-retour{min-height:34px;padding:0 12px;font-size:15px}'
      + '.rg .lien{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;border:0;border-top:1px solid rgba(178,140,255,.12);border-radius:0;background:none;padding:11px 14px;min-height:54px;font:inherit;color:inherit}.rg .bloc>.lien:first-child{border-top:0}'
      + '.rg .lien .ic{font-size:1.15rem;width:30px;height:30px;line-height:30px;text-align:center;flex:0 0 30px;border-radius:9px;background:var(--surface2,#151021)}.rg .lien>span:nth-child(2){flex:1;min-width:0}.rg .lien small{display:block;color:var(--muted,#8aa0c0);font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rg .lien .chev{color:var(--muted,#8aa0c0);font-size:1.2rem;flex:none}'
      + '.rg .bloc{background:var(--surface,#0f0b18) var(--grain,none);border:var(--trait,2px) solid var(--bord,#272036);border-radius:18px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--filet,rgba(190,175,230,.06))}'
      + '.rg .l{display:flex;align-items:center;gap:10px;padding:12px 16px;min-height:30px;border-top:1px solid rgba(178,140,255,.12)}.rg .l:first-child{border-top:0}.rg .l[hidden],.rg section[hidden],.rg .lien[hidden],.rg [data-accueil][hidden]{display:none}'
      + '.rg .l>span{flex:1;min-width:0}.rg .l small{display:block;color:var(--muted,#8aa0c0);font-size:.78rem;overflow-wrap:anywhere}.rg button{border:var(--trait,2px) solid var(--bord,#22324f);background:var(--surface2,#251754);color:inherit;border-radius:11px;padding:6px 12px;min-height:34px;font:500 14px inherit;flex:none}'
      + '.rg .bas{border:0;min-height:30px;padding:2px 8px;color:var(--muted,#8aa0c0)}.rg .p{border-color:var(--acc2,#7a6aa8);color:var(--acc,#b69cff)}.rg .msg{color:var(--muted,#8aa0c0);font-size:.82rem;margin:8px 4px}.rg .danger{color:#e8a0b8}'
      + '.rg input[type=checkbox]{appearance:none;-webkit-appearance:none;width:48px;height:29px;border-radius:10px;background:var(--creux,#160d35);border:3px solid var(--bord,#3b2775);box-sizing:content-box;position:relative;flex:none;margin:0;transition:background .15s}'
      + '.rg input[type=checkbox]::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:7px;background:#8a82a3;transition:transform .15s}.rg input:checked{background:#16301f;border-color:var(--bio,#79d9a2)}.rg input:checked::after{background:var(--bio,#79d9a2);box-shadow:0 0 8px var(--glow,rgba(121,217,162,.3));transform:translateX(18px)}'
      + '.rg .l.ls{flex-wrap:wrap}.rg .l.ls>span{flex:1 1 100%}.rg .seg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-start}.rg .seg button{min-height:32px;padding:0 10px;font-size:12.5px;color:var(--muted,#8aa0c0)}.rg .seg button.on{color:var(--txt,#eee);border-color:var(--bio,#79d9a2)}'
      + '.rg .pins{display:flex;gap:10px;flex-wrap:wrap;padding:12px 16px}.rg .pin{font-size:1.4rem;width:50px;height:50px;border-radius:var(--blob1,14px);padding:0;opacity:.5}.rg .pin.on{opacity:1;border-color:var(--bio,#79d9a2);box-shadow:0 0 10px var(--glow,rgba(121,217,162,.28))}'
      + '.rg .l>span.ic{font-size:1.25rem;width:30px;text-align:center;flex:0 0 30px}.rg .eteint{opacity:.5}.rg .l .act{display:flex;gap:6px;align-items:center;flex:none}'
      + '</style><div class="rg-tete"><div class="rg-fil"><button class="rg-retour" data-rg-retour hidden aria-label="retour">‹</button><b data-titre>réglages</b></div><input class="rg-q" data-q type="search" autocomplete="off" placeholder="chercher un réglage"></div><div data-c></div></div>';
    const zone = hote.querySelector('[data-c]');
    const section = (k, titre, corps) => '<section data-s="' + k + '"><h3>' + titre + '</h3>' + corps + '</section>';
    const lien = (k, ic, titre, sous) => '<button class="lien" data-rg-aller="' + k + '"><span class="ic">' + versGlyphe(ic) + '</span><span>' + esc(titre) + (sous ? '<small>' + esc(sous) + '</small>' : '') + '</span><span class="chev">›</span></button>';
    const TITRES = Object.fromEntries([...GROUPES.flatMap(([, l]) => l.map(([k, i, n]) => [k, n])), ['gestes', 'Gestes des bords'], ['haptique-motifs', 'Tes motifs'], ['haptique-evenements', 'Les événements'], ['haptique-fractale', 'La fractale et les bords'], ['haptique-ploxions', 'La signature des ploxions']]);
    const bascule = (attr, on, texte, sous) => '<label class="l"><span>' + texte + (sous ? '<small>' + sous + '</small>' : '') + '</span><input type="checkbox" ' + attr + (on ? ' checked' : '') + '></label>';
    const seg = (cle, valeurs, actuel, texte, sous) => '<div class="l ls"><span>' + texte + (sous ? '<small>' + sous + '</small>' : '') + '</span><div class="seg">' + valeurs.map(([v, n]) => '<button data-pv="' + cle + '" data-v="' + esc(v) + '"' + (String(v) === String(actuel) ? ' class="on"' : '') + '>' + esc(n) + '</button>').join('') + '</div></div>';

    async function peindre() {
      if (!vivant) return;
      const e = compte.etat(), c = hud.config(), verrous = R().verrous(), cat = R().catalogue().filter(p => !p.interne), P = prefs ? prefs.lire() : null;
      const [nRoutes, installes, bions, u] = await Promise.all([boxion.list('routes').then(l => l.length).catch(() => 0), depot.installes().catch(() => []), depot.bions ? depot.bions().catch(() => []) : [], boxion.get('usage', 'stats').catch(() => null)]);
      const usage = (u && u.px) || {};
      const tailles = {}; for (const p of installes) tailles[p.id] = Number.isFinite(p.taille) ? p.taille : (depot.taille ? await depot.taille(p.id) : 0);
      const wn = W.ploxi0nWebNatif ? W.ploxi0nWebNatif.etat() : { natif: false, faits: [], erreurs: {} }, sp = sante ? await sante.partage().catch(() => ({})) : null;
      // l'état de chaque catégorie, en quelques mots (la ligne de l'accueil des réglages)
      const etats = {
        compte: e.connecte ? (e.glyphe || '·') + ' ' + e.nom + ' · ' + e.palier : 'pas connecté', reseau: modeConnecte() ? 'mode connecté' : 'hors ligne seulement',
        natif: wn.natif ? (P && P.webNatif === false ? 'coupé' : wn.faits.length + ' API du web → le natif de l\'iPhone') : 'sur l\'iPhone', sante: sp ? (sp.actif ? 'résumé envoyé à ton boxion' : 'lu sur le téléphone, rien n\'est envoyé') : '',
        widgets: cube ? 'le cube : ' + cube.faces().slice(0, 3).map(f => f.g).join(' ') + ' … ; à l\'écoute, épinglés, valeurs' : '',
        notifs: notifs && notifs.reglage().coord ? 'coord surveillé' : 'test, coord', faceid: verrous.length ? verrous.length + ' ploxion(s) verrouillé(s)' : 'aucun verrou', iphone: 'tes ploxions en vraies apps',
        apparence: P ? [P.themeVivant !== false ? 'thème vivant' : null, P.pleinEcran ? 'plein écran' : null, P.calme ? 'calme' : null, 'icônes ' + P.icones].filter(Boolean).join(' · ') : '',
        haptique: P && P.haptique === false ? 'coupée' : 'motifs, événements, signatures', lecteur: 'le lecteur intégré (Apple, VLC), écran verrouillé, AirPlay',
        navigation: P ? [P.bords ? 'les bords' : null, P.telecommande !== false ? 'télécommande' : null, 'gestes'].filter(Boolean).join(' · ') : '', hud: c.epingles.length + ' épinglé(s)' + (P && P.dock === false ? ' · sans dock' : '') + (P ? ' · ▤ ' + (P.miniDocks == null ? 2 : P.miniDocks) + ' mini docks' : ''),
        accueil: 'dossiers et pages', ploxions: installes.length + ' installé(s)' + (maj ? ' · ↻ ' + (maj.reglage().auto ? 'à jour tout seul' : 'mises à jour à la main') : ''), bions: bions.length + ' bion(s)', donnees: nRoutes + ' réponse(s) gardée(s)', apropos: 'ploxi0n ' + version,
      };
      zone.innerHTML = '<div data-accueil>' + GROUPES.map(([g, l]) => (g ? '<h3>' + esc(g) + '</h3>' : '<h3>&nbsp;</h3>') + '<div class="bloc">' + l.filter(([k]) => (k !== 'sante' || sante) && (k !== 'widgets' || cube)).filter(([k]) => k !== 'notifs' || notifs).map(([k, i, n]) => lien(k, i, n, etats[k])).join('') + '</div>').join('') + '</div>'
        + section('natif', 'Natif', '<div class="bloc">' + bascule('data-pb="webNatif"', !P || P.webNatif !== false, 'Le web devient natif', 'les API web de TOUS les ploxions passent par l\'iPhone (au prochain lancement si tu changes)')
          + BRANCHEMENTS.map(([k, ic, api, quoi]) => '<div class="l"><span class="ic">' + versGlyphe(ic) + '</span><span>' + esc(api) + '<small>→ ' + esc(quoi) + (wn.erreurs[k] ? ' · ⚠ ' + esc(wn.erreurs[k]) : '') + '</small></span><span class="act">' + (wn.faits.includes(k) ? '✓' : '—') + '</span></div>').join('') + '</div>'
          + '<p class="msg">Pour les ploxions qui veulent plus : jOSNatif, le bion natif</p><div class="bloc"><div class="l"><span class="ic"></span><span>jOSNatif<small>' + esc((W.jOSNatif ? W.jOSNatif.capacites() : []).join(' · ') || 'non chargé') + '</small></span></div>'
          + PLUGIONS.map(pg => '<div class="l"><span class="ic"></span><span>plugion · ' + esc(pg.bion) + '<small>' + esc(pg.quoi) + (W[pg.bion] ? (W[pg.bion].__plugion ? ' · branché' : ' · en attente') : ' · bion pas encore chargé') + '</small></span></div>').join('')
          + '<div class="l"><span>Le banc iPhone<small>essayer chaque capacité sur cet appareil</small></span><button data-ouvrir="banc">ouvrir</button></div></div>')
        + (sante ? section('sante', 'Santé', '<div class="bloc"><div class="l"><span>Santé iPhone<small>pas, sommeil, cœur, entraînements, tes appareils</small></span><button class="p" data-ouvrir="sante">ouvrir</button></div>'
          + bascule('data-t="sante-partage"', !!(sp && sp.actif), 'Envoyer un résumé à mon boxion', 'agrégats du jour et de la semaine, jamais les mesures brutes ; le hub Santé du xerkion et tes autres appareils le lisent' + (sp && sp.dernier ? ' · dernier envoi ' + new Date(sp.dernier).toLocaleString('fr-CH', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : ''))
          + '<div class="l"><span>Les ploxions qui lisent ta santé<small>chacun demande une fois (jOSSante) ; Réglages iOS › Santé › Accès aux données › ploxi0n pour ce qu\'iOS partage</small></span></div></div>') : '')
        + (cube ? (() => { const V = valeurs() || {}, cles = [...new Set([...Object.keys(V), ...cube.choix()])], ch = cube.choix(), NOMS = ['devant', 'droite', 'derrière', 'gauche', 'dessus', 'dessous'];
            return section('widgets', '▦ Widgets', '<div class="bloc"><div class="l ls"><span>◈ Le cube des bions<small>six infos des bions sur un cube : penche le téléphone, il suit (ici, en direct) ; le widget « Cube » garde ta dernière inclinaison et tourne d\'un toucher (⟲)</small></span></div>'
              + cube.apercu() + '</div><p class="msg">Ses six faces : une valeur de l\'app ou d\'un bion chacune</p><div class="bloc">'
              + ch.map((k, i) => '<div class="l"><span>' + esc(NOMS[i]) + '</span><select data-cube-face="' + i + '" style="max-width:62%;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:6px;font:13px inherit">'
                + cles.map(c => '<option value="' + esc(c) + '"' + (c === k ? ' selected' : '') + '>' + esc((V[c] && V[c].titre) || c) + (V[c] ? ' · ' + esc(String(V[c].valeur).slice(0, 18)) : ' · (pas encore publiée)') + '</option>').join('') + '</select></div>').join('')
              + '</div><p class="msg">Les widgets de ploxi0n : appui long sur l\'écran d\'accueil de l\'iPhone › ＋ › ploxi0n</p><div class="bloc">'
              + '<div class="l"><span class="ic">◈</span><span>Cube<small>les six infos ci-dessus ; ⟲ pour le tourner</small></span></div>'
              + '<div class="l"><span class="ic"></span><span>À l\'écoute<small>ce que jouent tes ploxions (Spotify…), la pochette, ⏮ ⏯ ⏭ ; aussi sur l\'écran verrouillé</small></span></div>'
              + '<div class="l"><span class="ic"></span><span>Ploxions épinglés<small>ceux de ton dock (› HUD et dock)</small></span></div>'
              + '<div class="l"><span class="ic">◇</span><span>ploxi0n<small>une valeur : tes tsoins du jour, la musique, ton compte ; aussi sur l\'écran verrouillé</small></span></div>'
              + '<div class="l"><span>État de la copie vers les widgets<small data-widgets-etat>…</small></span><button data-a="widgets">republier</button></div></div>'
              + '<p class="msg">Le gyroscope en direct n\'existe pas pour un widget : Apple ne leur donne ni capteurs ni animation continue. Le cube de l\'app, lui, suit le téléphone.</p>'); })() : '')
        + section('compte', 'Compte', '<div class="bloc"><div class="l"><span>' + (e.connecte ? esc((e.glyphe || '·') + ' ' + e.nom) + '<small>rang ' + esc(e.palier) + ' · labo.j0bot.ch</small>' : 'Pas connecté<small>tout reste sur ton téléphone</small>') + '</span>'
          + (e.connecte ? '<button data-a="sortir">se déconnecter</button>' : '<button class="p" data-a="connecter">se connecter</button>') + '</div>'
          // (0.52) règle App Store 5.1.1(v) : supprimer son compte DEPUIS l'app → la page du labo où la suppression se termine
          + (e.connecte ? '<div class="l"><span>Supprimer mon compte<small>sur labo.j0bot.ch : ton compte, ton boxion en ligne, tes tsoins partagés. Ce téléphone garde ses données (› Données pour les effacer).</small></span><button class="danger" data-a="supprimer-compte">supprimer…</button></div>' : '')
          + '</div>'
          // (0.84) le compte du social (api.j0bot.ch : « Continuer avec Apple » le crée dans l'app) : le supprimer d'ici aussi (règle 5.1.1(v))
          + ((() => { const so = social && social.etat(); if (!so) return ''; const n = (so.user && so.user.username) || 'ton compte';
            return '<div class="bloc"><div class="l"><span>🎉 le social : ' + esc(n) + '<small>ton compte j0bot (api.j0bot.ch) : tes spaces, tes messages, tes amis, tes invitations</small></span></div>'
              + '<div class="l"><span>Supprimer ce compte du social<small>pour de bon, tout de suite : ses spaces (et leurs salons), ses messages, ses invitations, ses amitiés</small></span><button class="danger" data-a="supprimer-social">supprimer…</button></div></div>'; })()))
        + section('reseau', 'Réseau', '<div class="bloc">' + bascule('data-t="mode"', modeConnecte(), 'Mode connecté', 'les ploxions joignent labo.j0bot.ch' + (e.connecte ? ' avec ton compte' : '') + ' ; hors ligne, leur dernière réponse')
          + '<div class="l"><span>Source<small>labo.j0bot.ch (le marketplace, les bions, le mode connecté)</small></span></div></div>'
          + (remontee ? '<p class="msg">⧗ tes tsoins (0.86)</p>' + remontee.html() : ''))
        + (notifs ? section('notifs', 'Notifications', '<div class="bloc"><div class="l"><span>Une notification de test<small>elle arrive 5 s après : verrouille le téléphone</small></span><button data-a="notif">tester</button></div>'
          + bascule('data-t="proche"', notifs.reglage().proche !== false, 'Proche : messages privés et mentions', 'reçus par le maillage quand Proche n\'est pas à l\'écran (sans réseau aussi) ; il faut avoir permis les notifications une fois (« tester »)')
          + bascule('data-t="coord"', notifs.reglage().coord, 'Messages de coord', e.connecte ? 'tant que l\'app est ouverte (et app fermée : « même app fermée » ci-dessous)' : 'connecte-toi avec le compte admin') + '</div>'
          // 🔔 (0.91) le push (APNs, la clé sur le labo) et 🏝 les activités en direct
          + (notifs.push ? (() => { const pr = notifs.push.reglage(); return '<div class="bloc">' + bascule('data-t="push"', !!pr.actif, 'Même app fermée (push)', e.connecte ? 'le labo t\'envoie tes notifications ; ' + (pr.erreur ? '⚠ ' + pr.erreur : pr.envoye ? 'jeton envoyé au labo' : 'pas encore envoyé') : 'connecte-toi d\'abord (le labo envoie à ton compte)')
            + (pr.actif && pr.jeton ? '<div class="l ls"><span>Le jeton de cet iPhone<small>pour un envoi de test (tools/push/envoyer-push.mjs) : il n\'ouvre rien d\'autre que tes notifications</small></span><div class="seg"><button data-push-copier="' + esc(pr.jeton) + '">copier ' + esc(pr.jeton.slice(0, 6)) + '…</button></div></div>' : '')
            + (pr.actif ? '<div class="l ls"><span>Les sujets</span><div class="seg">' + SUJETS_PUSH.map(([k, n]) => '<button data-push-sujet="' + k + '"' + (pr.sujets.includes(k) ? ' class="on"' : '') + ' title="' + esc(n) + '">' + esc(k) + '</button>').join('') + '</div></div>' : '') + '</div>'; })() : '')
          + (P ? '<div class="bloc">' + bascule('data-pb="activites"', P.activites !== false, 'Activités en direct', 'sur l\'écran verrouillé et la Dynamic Island : ☾ dodo, un vocal, le minuteur des ambiances, ce que tes ploxions suivent') + '</div>' : '')) : '')
        + (P ? section('apparence', 'Apparence', '<div class="bloc">'
          + seg('police', Object.entries(POLICES).map(([k, v]) => [k, v.nom]), P.police || 'mixte', 'La police', 'la ChillTekk : notre alphabet (O le chaos, I l\'observateur et son œil, A un koin) ; dans l\'organique')
          + seg('ecriture', ECRITURES, P.ecriture || 'xerboxion', 'L\'écriture', 'comment tout s\'écrit : la forme, le glyphe et le nom (xerboxion) ; un glyphe et le nom ; rien que des glyphes ; rien que des mots ; les emoji ; minimal')
          + seg('taille', [['1', 'normale'], ['1.15', 'grande'], ['1.3', 'très grande'], ['1.45', 'énorme']], String(P.taille || 1.15), 'Taille de tout', 'tout grandit, la mise en page suit (comme le zoom de Safari)')
          + seg('langue', [['auto', 'auto (l\'iPhone)'], ...LANGUES], P.langue || 'auto', 'Langue', 'la langue de l\'app ; les mots du xerboxion (ploxion, bion, koin, tsoin…) restent tels quels')
          + seg('vue', [['grille', 'grille'], ['compacte', 'compacte'], ['liste', 'liste'], ['usage', 'usage'], ['recents', 'récents'], ['categories', 'catégories']], R().vueAccueil ? R().vueAccueil() : 'grille', 'Vue de l\'accueil')
          + seg('icones', [['petites', 'petites'], ['normales', 'normales'], ['grandes', 'grandes']], P.icones, 'Taille des icônes')
          + bascule('data-pb="pleinEcran"', !!P.pleinEcran, 'Plein écran complet', 'sans barre d\'état ; la barre du bas s\'efface ; les bords haut et bas vont d\'abord à l\'app (un 2e glissé pour iOS)')
          + '<div class="l"><span>Fond d\'écran<small>une photo, un motif gravé ; assombrir, flouter ; l\'accueil ou partout</small></span><button data-a="fond">changer</button></div>'
          + bascule('data-pb="barreHaut"', P.barreHaut !== false, 'Notre barre du haut', 'en plein écran : l\'heure, la batterie, tes tsoins… à gauche et à droite de l\'île ; appui long dessus pour la composer')
          + '<div class="l"><span>Composer la barre du haut<small>quels éléments, à gauche ou à droite</small></span><button data-a="barre-haut">composer</button></div>'
          + bascule('data-pb="policePartout"', !!P.policePartout, 'La police aussi dans les ploxions', 'éteint : ta police habille le xer (la map, les koins, les réglages) ; les ploxions du labo gardent la leur')
          + bascule('data-pb="telVivant"', P.telVivant !== false, 'Le téléphone vivant', 'dans l\'organique : un bord qui respire ; plus vite quand l\'iPhone chauffe, plus pâle quand la batterie baisse, il bat avec le son ; il dort en économie d\'énergie')
          + bascule('data-pb="themeVivant"', P.themeVivant !== false, 'Thème vivant', 'le thème suit le téléphone (gyroscope, accéléromètre) : le fond glisse, les icônes flottent et attrapent la lumière, un choc les fait tressauter')
          + '<div class="l ls"><span>État du mouvement<small data-mouvement>…</small></span></div>'
          + bascule('data-pb="glyphes"', P.glyphes !== false, 'Les glyphes du xerboxion', 'des glyphes au trait pour les icônes et l\'interface ; coupé : les emoji du labo') + seg('styleIcones', [['xerboxion', 'xerboxion'], ['glyphe', 'glyphe seul']], P.styleIcones || 'xerboxion', 'Style des icônes', 'xerboxion : la forme dit le type (losange, xerkion, cubion…) et le glyphe est au centre ; glyphe seul : le glyphe en grand. Chaque app peut avoir le sien (appui long › son icône)') + bascule('data-pb="pxChill"', P.pxChill !== false, 'Chill-tekk pour tous les ploxions', 'leurs couleurs, polices, boutons et champs suivent ceux de l\'app (les variables du xer, --xr-*) ; coupé : chacun garde son style du labo')
          + seg('peau', [['legere', 'légère'], ['auto', 'auto'], ['pleine', 'pleine']], P.peau || 'legere', 'La peau', 'légère : rapide, les couleurs de la peau sans les membranes ; pleine : les membranes ondulées (lourdes) ; auto : pleine, sauf en économie d\'énergie')
          + seg('variante', Object.entries(VARIANTES).filter(([, v]) => !v.lot).map(([k, v]) => [k, v.nom]), P.variante || 'nerfs', 'L\'organique · lot 1', 'les peaux du xer organique : compare-les en direct')
          + seg('variante', Object.entries(VARIANTES).filter(([, v]) => v.lot === 2).map(([k, v]) => [k, v.nom]), P.variante || 'nerfs', 'L\'organique · lot 2 (alien)', 'câbles × gelée, puis Giger, Rick et Morty, cyberpunk, cyberglysm, tribal tekkno…')
          + seg('variante', Object.entries(VARIANTES).filter(([, v]) => v.lot === 3).map(([k, v]) => [k, v.nom]), P.variante || 'nerfs', 'L\'organique · lot 3 (d\'autres DA)', 'gothique, evangelion, eldritch…')
          + (Object.values(VARIANTES).some(v => v.lot === 'tiennes' || v.lot === 'perso') ? seg('variante', Object.entries(VARIANTES).filter(([, v]) => v.lot === 'tiennes' || v.lot === 'perso').map(([k, v]) => [k, v.nom]), P.variante || 'nerfs', 'Tes peaux', 'celles que tu as trouvées dans l\'atelier') : '')
          + '<div class="l"><span>◈ L\'atelier des peaux<small>la fractale des UI : zoome dans les peaux, tourne les knobs, trouve la tienne</small></span><button data-a="atelier">ouvrir</button></div>'
          + bascule('data-pb="grain"', P.grain, 'Patine', 'le grain usé des plaques')
          + bascule('data-pb="contraste"', P.contraste === 'fort', 'Contraste fort', 'textes et bords plus clairs')
          + (W.ploxi0nRegard && W.ploxi0nRegard.dispo ? seg('regard', [['non', 'non'], ['tete', 'tête'], ['regard', 'regard']], P.regard || 'non', '👁 Piloter de la tête', 'la caméra de Face ID suit ta tête (ou ton regard) : un point sur l\'écran ; le fixer ou cligner longtemps = toucher. En mode regard, un coup de tête change de ploxion, secouer minimise. Aucune image gardée.') : '')   // (0.99.49) sans PloxiRegard (Android, le navigateur) : pas de réglage
          + ((P.regard || 'non') !== 'non' ? '<div class="l"><span>👁 Le pointeur<small>recentrer : regarde le milieu de l\'écran, puis touche ; calibrer : suis les points du regard</small></span><span><button data-a="regard-recentrer">recentrer</button>' + (P.regard === 'regard' ? '<button data-a="regard-calibrer">calibrer</button>' : '') + '</span></div>'
            + bascule('data-pb="regardInverse"', !!P.regardInverse, '⇄ Inverser gauche et droite', 'si le point part du mauvais côté quand tu tournes la tête') : '')
          + seg('cibles', [['auto', 'auto'], ['oui', 'oui'], ['non', 'non']], P.cibles || 'auto', '♿ Grandes cibles', 'chaque bouton fait au moins 44 points : pour viser du regard, de la tête, au contrôle de sélection (Réglages iOS › Accessibilité) ; auto : quand une de ces aides tourne')
          + bascule('data-pb="calme"', P.calme, 'Calme', 'plus aucune animation, même aux gestes')
          + bascule('data-pb="plaque"', P.plaque, 'Plaque gravée', '« cycle 7026 · … » sur l\'accueil') + '</div>') : '')
        + (haptique ? (() => { const hc = haptique.config(), noms = Object.keys(hc.motifs);
            const options = (actuel) => '<option value="aucun"' + (actuel === 'aucun' ? ' selected' : '') + '>— rien</option>' + STYLES.map(([k, n]) => '<option value="' + k + '"' + (actuel === k ? ' selected' : '') + '>' + esc(n) + '</option>').join('')
              + [...noms, ...Object.keys(MOTIFS_APP).filter(m => !noms.includes(m))].map(m => '<option value="motif:' + esc(m) + '"' + (actuel === 'motif:' + m ? ' selected' : '') + '>' + esc(m) + '</option>').join('');   // (0.63) + les motifs de l'app
            const selEv = (ev, large) => '<select data-ev="' + ev + '" style="max-width:' + large + ';background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:6px;font:13px inherit">' + options(hc.evenements[ev] || 'aucun') + '</select>';
            // (0.63) la fractale et les bords : les événements du groupe « fractale », rangés par famille, et la densité
            const familles = []; for (const [ev, n, g, f] of EVENEMENTS) { if (g !== 'fractale') continue; let x = familles.find(y => y[0] === f); if (!x) familles.push(x = [f, []]); x[1].push([ev, n]); }
            const dens = haptique.densite ? haptique.densite() : 'pleine';
            return section('haptique', 'Haptique', '<div class="bloc">' + (P ? bascule('data-pb="haptique"', P.haptique !== false, 'Haptique', 'de petites vibrations : ouvrir, revenir, minimiser, les bords, les pages, les interrupteurs — et navigator.vibrate des ploxions') : '')
              + lien('haptique-motifs', '', 'Tes motifs', noms.length ? noms.length + ' motif(s) inventé(s)' : 'en inventer un') + lien('haptique-evenements', '', 'Les événements', 'ouvrir, revenir, notification… un style ou un motif chacun')
              + lien('haptique-fractale', 'navigation', 'La fractale et les bords', 'aperçu, slider, cube, freefall, la carte… · ' + dens)
              + lien('haptique-ploxions', '▣', 'La signature des ploxions', 'chaque ploxion se sent à l\'ouverture') + '</div>')
              + section('haptique-motifs', 'Tes motifs', '<div class="bloc">'
              + '<div class="l ls"><span>Inventer un motif<small>touche les pas dans l\'ordre (· = une pause), donne un nom, ▶ pour l\'essayer</small></span><div class="seg" data-studio>'
              + STYLES.map(([k, n]) => '<button data-pas="' + k + '">' + esc(n) + '</button>').join('') + '<button data-pas="pause">· pause</button><button data-pas="effacer">⌫</button></div>'
              + '<input class="rg-q" data-motif-nom placeholder="nom du motif" style="margin-top:8px"><div class="seg" style="margin-top:8px"><span data-motif-pas style="flex:1;color:var(--muted,#8aa0c0);font:12px var(--mono,monospace);align-self:center">(vide)</span><button data-motif="essayer">▶ essayer</button><button class="p" data-motif="sauver">sauver</button></div></div>'
              + noms.map(m => '<div class="l"><span class="ic"></span><span>' + esc(m) + '<small>' + esc(hc.motifs[m].map(([st, ms]) => st + (ms ? ' ' + ms + 'ms' : '')).join(' · ')) + '</small></span><span class="act"><button class="bas" data-jouer="motif:' + esc(m) + '">▶</button><button class="bas danger" data-motif-suppr="' + esc(m) + '"></button></span></div>').join('')
              + '</div>') + section('haptique-evenements', 'Les événements', '<p class="msg">Chaque événement joue un style ou un de tes motifs :</p><div class="bloc">'
              + EVENEMENTS.filter(e => e[2] !== 'fractale').map(([ev, n]) => '<div class="l"><span>' + esc(n) + '</span>' + selEv(ev, '48%') + '</div>').join('')
              + '</div>') + section('haptique-fractale', 'La fractale et les bords', '<p class="msg">Tenir un bord, la fractale, le slider, le cube, la carte : chaque geste se sent (▶ pour le sentir). La densité choisit combien :</p><div class="bloc">'
              + '<div class="l ls"><span>Densité<small>sobre : les gestes qui arrivent · normale : + les seuils · pleine : + chaque cran</small></span><div class="seg">'
              + DENSITES.map(([v, n]) => '<button data-hdens="' + v + '"' + (v === dens ? ' class="on"' : '') + '>' + esc(n) + '</button>').join('') + '</div></div>'
              + familles.map(([f, l]) => '<div class="l" style="min-height:0;padding:14px 16px 4px;font:600 10px var(--mono,monospace);letter-spacing:.18em;text-transform:uppercase;color:var(--muted,#8aa0c0)"><span>' + esc(f) + '</span></div>'
                + l.map(([ev, n]) => '<div class="l"><span>' + esc(n) + '</span><span class="act"><button class="bas" data-jouer="' + ev + '">▶</button>' + selEv(ev, '40vw') + '</span></div>').join('')).join('')
              + '</div>') + section('haptique-ploxions', 'La signature des ploxions', '<p class="msg">Chaque ploxion a sa signature d\'ouverture (▶ pour la sentir), ou celle que tu choisis :</p><div class="bloc">'
              + R().catalogue().filter(p => !p.interne).slice(0, 80).map(p => { const v = (hc.ploxions || {})[p.id] || 'signature';
                  return '<div class="l"><span class="ic" style="color:hsl(' + 0 + ' 0% 80%)">' + glyphePloxion(p) + '</span><span>' + esc(p.nom || p.id) + '<small>' + esc(v === 'signature' ? haptique.signature(p.id).map(([st]) => st).join(' · ') : v.replace('motif:', '')) + '</small></span>'
                    + '<span class="act"><button class="bas" data-sentir="' + esc(p.id) + '">▶</button><select data-hpx="' + esc(p.id) + '" style="max-width:34vw;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:5px;font:12px inherit">'
                    + '<option value="signature"' + (v === 'signature' ? ' selected' : '') + '>signature</option>' + options(v).replace('<option value="aucun"', '<option value="aucun"') + '</select></span></div>'; }).join('')
              + '</div>'); })() : '')
        + (lecteur ? section('lecteur', 'Lecteur', (lecteurNatif ? (() => { const ln = lecteurNatif.reglage(); return '<div class="bloc">'
          + '<div class="l ls"><span>Le lecteur intégré<small data-moteurs>Apple (PiP, AirPlay, écran verrouillé) ; VLC en repli pour MKV, DTS, sous-titres — si ce build l\'a</small></span>'
          + '<div class="seg">' + [['auto', 'auto'], ['apple', 'Apple'], ['vlc', 'VLC']].map(([v, n]) => '<button data-lnat-moteur="' + v + '"' + (ln.moteur === v ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div></div>'
          + bascule('data-lnat-auto', ln.auto !== false, 'Passer au lecteur intégré tout seul', 'une vidéo que la page ne lit pas, le lecteur d\'un ploxion (jOSplayer, Stremio), un lien vlc:// ou infuse:// ; une vidéo sans son propose de basculer')
          + '</div><p class="msg">Dans la page :</p>'; })() : '') + '<div class="bloc">'
          + bascule('data-lect="yt"', lecteur.reglage().yt, 'YouTube par labo.j0bot.ch', 'une page https : YouTube refuse l\'intégration directe dans l\'app (erreurs 152/153)')
          + bascule('data-lect="haptiqueSon"', lecteur.reglage().haptiqueSon, 'Haptique du son', 'les basses deviennent des vibrations — pour les sons lisibles par l\'app (pas YouTube ni la plupart des flux)')
          + '<div class="l"><span>Le son continue écran verrouillé et en silencieux<small>contrôles sur l\'écran verrouillé et le Centre de contrôle, AirPlay, Picture in Picture ; plein écran = le lecteur d\'iOS</small></span></div></div>') : '')
        + (P ? section('navigation', 'Navigation', '<div class="bloc">'
          + bascule('data-pb="barreClavier"', P.barreClavier !== false, 'La barre au-dessus du clavier', 'QuickType, les mots de passe du trousseau, « OK » ; la dictée marche dans tous les champs')
          + bascule('data-pb="telecommande"', P.telecommande !== false, 'Télécommande', 'les barres en bas de l\'écran : tout au pouce (chill-tekk : on est tous des flemmards)')
          + bascule('data-pb="reprendre"', P.reprendre !== false, 'Reprendre là où j\'en étais', 'après une fermeture ou un plantage : le ploxion de devant rouvert, les autres endormis dans ⧉')
          + bascule('data-pb="bords"', P.bords, 'Les bords', 'glisser depuis le bord gauche ou droit pour passer d\'une app à l\'autre')
          + bascule('data-pb="bande"', !!P.bande, 'La bande (façon niri)', 'tes ploxions en colonnes : la suivante dépasse à droite (la toucher l\'amène devant), le nouveau s\'ouvre à droite ; ▥ la vue d\'ensemble (appui long sur le bord de la suivante, ou un geste des bords)')
          + bascule('data-pb="appuiLong"', P.appuiLong, 'Appui long sur l\'accueil', 'le menu d\'un ploxion (épingler, déplacer, retirer…)')
          + bascule('data-pb="clicDroit"', P.clicDroit !== false, 'Appui long = clic droit', 'dans les ploxions : leurs menus du clic droit s\'ouvrent')
          + bascule('data-pb="fractale"', P.fractale !== false, 'Tenir un bord : aperçu, fractale, slider', 'tenir 0,3 s : l\'app d\'à côté passe la tête (tire-la) ; 0,9 s : toutes tes apps en fractale (glisse, lâche sur une) ; 1,9 s : le slider défile tout seul, lâche pour ouvrir')
          + seg('maxVivants', [[5, '5'], [8, '8'], [12, '12'], [20, '20'], [0, '∞']], P.maxVivants, 'Ploxions vivants en arrière-plan', 'au-delà, le plus ancien s\'endort (il reste dans les mini docks) ; cachés, ils sont gelés et leurs vidéos coupées ; ∞ : aucune limite, iOS fermera l\'app s\'il manque de mémoire')
          + seg('sommeil', [[2, '2 min'], [5, '5 min'], [15, '15 min'], [60, '1 h'], [0, 'jamais']], P.sommeil == null ? 5 : P.sommeil, 'Un ploxion caché s\'endort après', 'il ne coûte plus rien (ni processeur, ni mémoire, ni réseau) ; un toucher le réveille ; jamais s\'il fait du son, flotte ou est sous le cube')
          + lien('gestes', '↔', 'Gestes des bords', '9 zones, une action chacune') + '</div>') + section('gestes', 'Gestes des bords', '<p class="msg">Glisser vite depuis une zone d\'un bord (ou les deux bords ensemble) fait son action. Tenir un bord (gauche ou droit) : 0,3 s l\'aperçu de l\'app d\'à côté, 0,9 s la fractale de tes apps, 1,9 s le slider (⚙ › Navigation).</p><div class="bloc">'
          + (() => { const D0 = (R().GESTES_DEFAUT || {}), G = P.gestes || {}, cat2 = R().catalogue();
              const ACTIONS = ACTIONS_BORDS   // (0.64) la même liste que le routeur et le HUD de tuto (l'état, le tuto, tout le xerboxion)
                .concat(cat2.filter(p => !p.interne).slice(0, 60).map(p => ['ouvrir:' + p.id, '▶ ' + (p.nom || p.id)]));
              const ZONES = [['g-haut', 'gauche · haut'], ['g-milieu', 'gauche · milieu'], ['g-bas', 'gauche · bas'], ['d-haut', 'droit · haut'], ['d-milieu', 'droit · milieu'], ['d-bas', 'droit · bas'], ['deux-haut', 'les deux · haut'], ['deux-milieu', 'les deux · milieu'], ['deux-bas', 'les deux · bas']];
              return ZONES.map(([z, n]) => { const v = G[z] || D0[z] || 'rien'; return '<div class="l"><span>' + esc(n) + '</span><select data-geste="' + z + '" style="max-width:52%;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:6px;font:13px inherit">'
                + ACTIONS.map(([k, t]) => '<option value="' + esc(k) + '"' + (k === v ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></div>'; }).join(''); })()
          + '</div>') : '')
        + section('hud', 'HUD et dock', '<div class="bloc">' + (P && P.mode === 'organique' ? '<div class="l"><span>Les koins<small>dans l\'organique, les koins remplacent le dock : il n\'y en a plus</small></span></div>' : P ? bascule('data-pb="koins"', !!P.koins, 'Les koins (prototype)', 'le xerboxion du carnet : deux koins dans les coins du bas remplacent le dock et la barre ; touche-les pour qu\'ils grandissent, jusqu\'aux cases') : '') + (P && P.mode !== 'organique' ? bascule('data-pb="dock"', P.dock, 'Le dock en bas', 'compte, épinglés, ')
          + seg('miniDocks', [[0, 'aucun'], [1, '1'], [2, '2'], [3, '3']], P.miniDocks == null ? 2 : P.miniDocks, '▤ Mini docks au-dessus du dock', 'ce qui vit en arrière-plan (ploxions minimisés, musique, blouse…) ; ▤ les montre tous ; glisser de côté = fermer') : '')
          + c.elements.map((x, i) => '<label class="l"><span>' + esc(ELS[x.k] || x.k) + '</span><button class="bas" data-monter="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="monter">↑</button><input type="checkbox" data-el="' + i + '"' + (x.on ? ' checked' : '') + '></label>').join('')
          + '<div class="l"><span>réglages<small>toujours là</small></span></div></div>'
          + '<p class="msg">épinglés au dock et au widget (4 au plus)</p><div class="bloc"><div class="pins">' + (cat.length ? cat.map(p => '<button class="pin' + (c.epingles.includes(p.id) ? ' on' : '') + '" data-pin="' + esc(p.id) + '" title="' + esc(p.nom) + '">' + esc(p.icone || '▣') + '</button>').join('') : '<span class="msg">installe des ploxions d\'abord</span>') + '</div></div>')
        + section('iphone', 'Écran d\'accueil de l\'iPhone', '<div class="bloc"><div class="l"><span>Tes ploxions en apps<small>une icône par ploxion, qui ouvre ploxi0n directement dessus</small></span><button class="p" data-a="apps">choisir</button></div></div>')
        + section('accueil', 'Accueil', '<div class="bloc"><div class="l"><span>Dossiers et pages<small>appui long sur un ploxion pour le ranger</small></span><button data-a="accueil">tout remettre</button></div></div>')
        + section('ploxions', 'Ploxions · ' + installes.length, (maj ? '<p class="msg">↻ mises à jour</p>' + maj.html() + '<p class="msg">installés</p>' : '') + '<div class="bloc">' + (maj ? '' : '<div class="l"><span>Mises à jour<small>les ploxions installés depuis le réseau</small></span><button data-a="ajour">vérifier</button></div>')
          + installes.map(p => '<div class="l"><span class="ic" style="color:hsl(' + 0 + ' 0% 80%)">' + glyphePloxion(p) + '</span><span>' + esc(p.nom || p.id) + '<small>' + ko(tailles[p.id] || 0) + ' · ' + heures((usage[p.id] || {}).seconds) + ' · ' + (p.origine === 'pack' ? 'pack' : 'réseau') + (verrous.includes(p.id) ? ' · ' : '') + '</small></span>'
            + '<span class="act"><button class="danger" data-retirer="' + esc(p.id) + '" aria-label="retirer"></button></span></div>').join('') + '</div>')
        + section('bions', 'Bions · ' + bions.length, '<div class="bloc"><div class="l"><span>Compléter<small>ce que chaque ploxion touche, servi par le labo</small></span><button data-a="bions">compléter</button></div>'
          + '<div class="l"><span>Tout mettre à jour<small>retélécharge chaque bion, garde ceux qui n\'ont pas changé</small></span><button data-a="bions-maj">mettre à jour</button></div>'
          + bions.map(b => '<div class="l' + (b.coupe ? ' eteint' : '') + '"><span class="ic"></span><span>' + esc(b.nom) + '<small>' + ko(b.octets) + ' · ' + (b.utilisePar.length ? 'sert à ' + esc(b.utilisePar.slice(0, 4).join(', ')) + (b.utilisePar.length > 4 ? ' +' + (b.utilisePar.length - 4) : '') : 'ne sert plus') + (b.coupe ? ' · coupé' : '') + '</small></span>'
            + '<span class="act"><button class="bas" data-bion-maj="' + esc(b.nom) + '" aria-label="mettre à jour">⟳</button>' + (b.utilisePar.length ? '' : '<button class="bas danger" data-bion-retirer="' + esc(b.nom) + '" aria-label="retirer"></button>')
            + '<input type="checkbox" data-bion-on="' + esc(b.nom) + '"' + (b.coupe ? '' : ' checked') + ' aria-label="allumé"></span></div>').join('')
          + '<div class="l"><span>jOSNatif, les plugions<small>dans › Natif</small></span><button data-rg-aller="natif">voir</button></div>'
          + '<div class="l"><span>Fournis par l\'app<small>' + FOURNIS_APP.join(' · ') + ' · jOSNatif</small></span></div></div>')
        + section('faceid', 'Face ID', '<div class="bloc">' + (verrous.length ? verrous.map(id => { const p = cat.find(x => x.id === id) || { nom: id, icone: '' }; return '<div class="l"><span>' + esc(p.icone + ' ' + p.nom) + '</span><button data-deverrou="' + esc(id) + '">retirer le verrou</button></div>'; }).join('') : '<div class="l"><span>Aucun ploxion verrouillé<small>appui long sur un ploxion › verrouiller</small></span></div>') + '</div>')
        + section('donnees', 'Données', '<div class="bloc"><div class="l"><span>Réponses gardées pour le mode avion<small>' + nRoutes + ' route' + (nRoutes > 1 ? 's' : '') + '</small></span><button data-a="routes">vider</button></div>'
          + '<div class="l"><span>Réinitialiser les réglages<small>accueil, HUD, apparence, verrous… (tes ploxions, tes tsoins et ton compte restent)</small></span><button class="danger" data-a="reset">réinitialiser</button></div></div>')
        + section('apropos', 'À propos', '<div class="bloc"><div class="l"><span>ploxi0n ' + esc(version) + '<small>' + esc(W.navigator.onLine !== false ? 'en ligne' : 'hors ligne') + ' · cycle ' + (new Date().getFullYear() + 5000) + '</small></span></div>'
          + '<div class="l ls"><span>◎ Diagnostic de l\'écran<small>ce qui flotte par-dessus, ce qui est incliné en 3D, ce qui déborde : à copier et à envoyer quand quelque chose cloche</small></span><div class="seg"><button data-rg-diag>relever ici</button><button data-rg-diag-plus-tard>dans 5 s (va sur l\'écran qui cloche)</button><button data-rg-diag-copier hidden>copier</button></div><pre data-rg-diag-sortie hidden style="white-space:pre-wrap;font:10.5px/1.35 var(--mono,monospace);max-height:320px;overflow:auto;margin:8px 0 0;color:var(--muted,#8aa0c0)"></pre></div>'
          + '<div class="l ls"><span>◇ Dernier démarrage<small data-demarrage>…</small></span></div>'
          + '<div class="l"><span>Dossier dans Fichiers<small data-dossier>Sur mon iPhone › ploxi0n : tsoins, vocaux, fond, Dépôt</small></span><button data-a="dossier">mettre à jour</button></div>'
          + '<div class="l"><span>Ploxions installés<small>la place qu\'ils prennent, leurs bions, retirer</small></span><button data-a="gestion">ouvrir</button></div>'
          + '<div class="l"><span>Nouveautés<small>ce qui a changé, version par version</small></span><button data-a="nouveautes">voir</button></div>'
          + '<div class="l"><span>Le guide<small>quatre gestes, sur la vraie interface</small></span><button data-a="tuto">revoir</button></div>'
          + '<div class="l"><span>ⓘ C\'est quoi ça ?<small>touche n\'importe quoi : l\'app te dit ce que c\'est</small></span><button data-a="quoi">essayer</button></div>'
          + '<div class="l"><span>Les astuces<small>une phrase la première fois que tu croises quelque chose</small></span><button data-a="astuces">les remontrer</button></div>'
          + '<div class="l"><span>▦ Widgets<small>le cube des bions, à l\'écoute, épinglés</small></span><button data-rg-aller="widgets">voir</button></div>'
          + '<div class="l"><span>⌨ Tester le clavier<small>si le clavier ne s\'ouvre pas : le rapport dit où ça casse</small></span><button class="p" data-a="clavier">tester</button></div>'
          + '<div class="l"><span>Banc iPhone</span><button data-ouvrir="banc">ouvrir</button></div><div class="l"><span>Bother me (un souci, une idée)</span><button data-ouvrir="bother">ouvrir</button></div></div>')
        + '<p class="msg" data-msg></p>';
      filtrer();
      if (lecteurNatif) lecteurNatif.moteurs().then(m => { const el = zone.querySelector('[data-moteurs]'); if (el && m) el.textContent = 'ce build : Apple ' + (m.apple ? '✓' : '—') + ' · VLC ' + (m.vlc ? '✓ (MKV, DTS, sous-titres)' : '— (build avec l\'option « vlc » pour l\'avoir)'); }).catch(() => {});
      if (maj) { const m = zone.querySelector('.px-maj'); if (m) maj.brancher(m); }   // ↻ (0.80) les mises à jour des ploxions
      if (remontee) { const m = zone.querySelector('.px-remontee'); if (m) remontee.brancher(m, () => peindre()); }   // ⧗ (0.86) les tsoins au boxion
      if (cube && cube.animer) cube.animer(zone.querySelector('.px-cube-scene'));   // (0.54) l'aperçu du cube vit tout seul
      { const el = zone.querySelector('[data-mouvement]'); if (el && W.ploxi0nMouvement) { const e = W.ploxi0nMouvement.etat(); el.textContent = e.actif ? '✓ ' + e.source + ' · penche le téléphone' : e.erreur ? '⚠ ' + e.erreur + (e.erreur.includes('web') ? '' : ' — touche l\'écran une fois pour essayer le capteur du navigateur') : 'en attente (hors Calme, app visible)'; } }
      // le journal du dernier démarrage (l'écran de chargement) : le total, et les étapes les plus lentes
      boxion.get('reglages', 'demarrage').then(d => { const el = zone.querySelector('[data-demarrage]'); if (!el || !d) return;
        const lentes = (d.etapes || []).filter(x => x.d > 120).sort((a, b) => b.d - a.d).slice(0, 3);
        el.textContent = (d.total / 1000).toFixed(1) + ' s (v' + String(d.version || '').replace(/\.0$/, '') + ')' + (lentes.length ? ' · le plus lent : ' + lentes.map(x => x.x + ' ' + x.d + ' ms').join(', ') : ''); }).catch(() => {});
      if (W.ploxi0nWidgets) W.ploxi0nWidgets.etat().then(e => { const el = zone.querySelector('[data-widgets-etat]'); if (!el) return;
        el.textContent = !e ? 'pas encore copié (ouvre puis quitte l\'app)' : !e.groupe ? '⚠ App Group inaccessible pour l\'app' : (e.conteneur ? '' : '⚠ conteneur du groupe absent · ')
          + 'épinglés ' + (e.epingles >= 0 ? e.epingles + ' car.' : 'jamais publiés') + ' · valeurs ' + (e.valeurs >= 0 ? e.valeurs + ' car.' : 'jamais publiées') + ' · relu ' + e.relu + ' · ' + (e.le ? new Date(e.le * 1000).toLocaleTimeString('fr-CH') : '');
      }).catch(() => {});
    }
    // ce qui se voit : l'accueil des réglages, UNE page (et ses sous-pages par leurs liens), ou — en cherchant — toutes les lignes trouvées
    function filtrer() {
      const t = norm(q).trim();
      const acc = zone.querySelector('[data-accueil]'); if (acc) acc.hidden = !!t || !!page;
      for (const s of zone.querySelectorAll('section')) {
        if (!t) { for (const l of s.querySelectorAll('.l')) l.hidden = false; s.hidden = s.getAttribute('data-s') !== page; continue; }
        let n = 0; const titre = norm(s.querySelector('h3').textContent);
        for (const l of s.querySelectorAll('.l')) { const ok = titre.includes(t) || norm(l.textContent).includes(t); l.hidden = !ok; if (ok) n++; }
        s.hidden = !n;
      }
      const ti = hote.querySelector('[data-titre]'), re = hote.querySelector("[data-rg-retour]");
      if (ti) ti.textContent = t ? '« ' + q.trim() + ' »' : page ? (TITRES[page] || page) : 'réglages';
      if (re) re.hidden = !page || !!t;
    }
    function aller(p) {
      page = p; q = ''; const ch = hote.querySelector('[data-q]'); if (ch) ch.value = ''; filtrer(); vibrer('selection');
      for (const el of [hote, hote.closest && hote.closest('.px-hote'), hote.parentElement]) { try { if (el) el.scrollTop = 0; } catch (e) { /* */ } }
    }
    const msg = (t) => { const m = zone.querySelector('[data-msg]'); if (m) { m.textContent = t; try { m.scrollIntoView({ block: 'nearest' }); } catch (e) { /* */ } } };
    async function majHud(f) { const c = hud.config(); f(c); await hud.regler(c); peindre(); }
    hote.querySelector('[data-q]').addEventListener('input', (ev) => { q = ev.target.value; filtrer(); });
    hote.addEventListener('change', async (ev) => {
      const t = ev.target;
      if (t.type === 'checkbox') vibrer('interrupteur');
      if (t.matches('[data-lnat-auto]') && lecteurNatif) { await lecteurNatif.regler({ auto: t.checked }); return; }
      if (t.matches('[data-cube-face]') && cube) { await cube.choisir(+t.getAttribute('data-cube-face'), t.value); vibrer('selection'); return peindre(); }
      if (t.matches('[data-t="sante-partage"]') && sante) { const p = await sante.partager(t.checked); msg(t.checked ? (p.dernier ? '✓ envoyé à ton boxion' : '✓ activé : il partira dès que tu es connecté') : '✓ plus rien n\'est envoyé'); return; }
      if (t.matches('[data-t="mode"]')) { modeConnecte(t.checked); hud.regler(hud.config()); return; }
      if (t.matches('[data-t="proche"]')) { await notifs.regler({ proche: t.checked }); vibrer('selection'); return; }
      if (t.matches('[data-t="coord"]')) { try { await notifs.coord(t.checked); const n = t.checked ? await notifs.verifierCoord() : []; msg(t.checked ? '✓ coord surveillé' + (n.length ? ' : ' + n.length + ' nouveau(x)' : '') : 'coord : plus de notifications'); } catch (er) { t.checked = false; await notifs.coord(false); msg('⚠ ' + (er.message || er)); } return; }
      if (t.matches('[data-t="push"]') && notifs && notifs.push) { try { if (t.checked) { await notifs.push.activer(); msg('✓ ploxi0n demande son jeton à iOS, puis l\'envoie au labo'); } else { await notifs.push.couper(); msg('push coupé : le labo oublie ce téléphone'); } } catch (er) { t.checked = false; msg('⚠ ' + (er.message || er)); } W.setTimeout(() => peindre(), 1500); return; }
      if (t.matches('[data-el]')) return majHud(c => { c.elements[+t.getAttribute('data-el')].on = t.checked; });
      if (t.matches('[data-pb]') && prefs) { const k = t.getAttribute('data-pb'); await prefs.regler({ [k]: k === 'contraste' ? (t.checked ? 'fort' : 'normal') : t.checked }); return; }
      if (t.matches('[data-geste]') && prefs) { const g = { ...(prefs.lire().gestes || {}), [t.getAttribute('data-geste')]: t.value }; await prefs.regler({ gestes: g }); return; }
      if (t.matches('[data-hpx]') && haptique) { const id = t.getAttribute('data-hpx'); await haptique.choisirPloxion(id, t.value); haptique.jouerPloxion(id, 'ouvrir', null, { force: true }); return; }
      if (t.matches('[data-ev]') && haptique) { await haptique.assigner(t.getAttribute('data-ev'), t.value); haptique.jouer(t.value, { force: true }); return; }
      if (t.matches('[data-lect]') && lecteur) { await lecteur.regler({ [t.getAttribute('data-lect')]: t.checked }); return; }
      if (t.matches('[data-bion-on]')) { await depot.couperBion(t.getAttribute('data-bion-on'), !t.checked); msg(t.checked ? '✓ rallumé : il revient à la prochaine ouverture du ploxion' : '✓ coupé : il ne se charge plus (les ploxions qui l\'utilisent perdent sa fonction)'); t.closest('.l').classList.toggle('eteint', !t.checked); return; }
    });
    hote.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button'); if (!b || !hote.contains(b)) return;
      if (b.hasAttribute('data-pas')) {
        const k = b.getAttribute('data-pas');
        if (k === 'effacer') composition.pop(); else if (k === 'pause') { if (composition.length) composition[composition.length - 1][1] += 120; } else { composition.push([k, 90]); haptique.jouer(k, { force: true }); }
        const el = zone.querySelector('[data-motif-pas]'); if (el) el.textContent = composition.length ? composition.map(([st, ms]) => st + (ms ? ' ' + ms + 'ms' : '')).join(' · ') : '(vide)'; return;
      }
      if (b.hasAttribute('data-motif')) {
        try {
          if (b.getAttribute('data-motif') === 'essayer') { haptique.essayer(composition); return; }
          const nom = await haptique.sauver(zone.querySelector('[data-motif-nom]').value, composition); composition = []; await peindre(); msg('✓ motif « ' + nom + ' » sauvé : choisis-le pour un événement');
        } catch (er) { msg('⚠ ' + (er.message || er)); } return;
      }
      if (b.hasAttribute('data-sentir')) { haptique.jouerPloxion(b.getAttribute('data-sentir'), 'ouvrir', null, { force: true }); return; }
      if (b.hasAttribute('data-jouer')) { haptique.jouer(b.getAttribute('data-jouer'), { force: true }); return; }
      if (b.hasAttribute('data-motif-suppr')) { await haptique.supprimer(b.getAttribute('data-motif-suppr')); return peindre(); }
      if (b.hasAttribute('data-hdens') && haptique && haptique.assignerDensite) { await haptique.assignerDensite(b.getAttribute('data-hdens')); vibrer('selection'); return peindre(); }
      if (b.hasAttribute('data-lnat-moteur') && lecteurNatif) { await lecteurNatif.regler({ moteur: b.getAttribute('data-lnat-moteur') }); vibrer('selection'); return peindre(); }
      if (b.hasAttribute('data-push-sujet') && notifs && notifs.push) { ev.preventDefault(); const k = b.getAttribute('data-push-sujet'), l = notifs.push.reglage().sujets; await notifs.push.sujets(l.includes(k) ? l.filter(x => x !== k) : [...l, k]); vibrer('selection'); return peindre(); }
      if (b.hasAttribute("data-rg-aller")) return aller(b.getAttribute("data-rg-aller"));
      if (b.hasAttribute("data-rg-retour")) return aller(SOUS[page] || null);
      if (b.hasAttribute('data-monter')) { ev.preventDefault(); const i = +b.getAttribute('data-monter'); return majHud(c => { const [x] = c.elements.splice(i, 1); c.elements.splice(i - 1, 0, x); }); }
      if (b.hasAttribute('data-pin')) { const id = b.getAttribute('data-pin'); return majHud(c => { c.epingles = c.epingles.includes(id) ? c.epingles.filter(x => x !== id) : [...c.epingles, id].slice(-4); if (!c.elements.find(x => x.k === 'epingles').on) c.elements.find(x => x.k === 'epingles').on = true; }); }
      if (b.hasAttribute('data-rg-diag')) { const o = hote.querySelector('[data-rg-diag-sortie]'), c = hote.querySelector('[data-rg-diag-copier]'); o.textContent = (dernierDiagnostic() ? 'LE RELEVÉ D\'AVANT (5 s après)\n' + dernierDiagnostic() + '\n\n— ICI —\n' : '') + diagnostic(W); o.hidden = false; c.hidden = false; vibrer('selection'); return; }
      if (b.hasAttribute('data-rg-diag-plus-tard')) { b.textContent = 'relevé dans 5 s…'; vibrer('selection'); diagnosticDans(5000, W).then(() => { vibrer('succes'); b.textContent = 'relevé ✓ (touche « relever ici » pour le voir)'; }); return; }
      if (b.hasAttribute('data-push-copier')) { const t = b.getAttribute('data-push-copier') || ''; try { W.navigator.clipboard.writeText(t).then(() => { b.textContent = 'copié ✓'; vibrer('succes'); }, () => {}); } catch (e) { /* */ } return; }   // (0.99.28) le jeton APNs, pour un envoi de test
      if (b.hasAttribute('data-rg-diag-copier')) { const t = (hote.querySelector('[data-rg-diag-sortie]') || {}).textContent || ''; try { W.navigator.clipboard.writeText(t).then(() => { b.textContent = 'copié ✓'; vibrer('succes'); }, () => {}); } catch (e) { /* */ } return; }
      if (b.hasAttribute('data-pv') && prefs) { ev.preventDefault(); const k = b.getAttribute('data-pv'), v = b.getAttribute('data-v'); if (k === 'vue') { if (R().vueAccueil) R().vueAccueil(v); } else await prefs.regler({ [k]: k === 'maxVivants' || k === 'miniDocks' || k === 'sommeil' || k === 'taille' ? +v : v }); return peindre(); }
      if (b.hasAttribute('data-ouvrir')) return R().ouvrir(b.getAttribute('data-ouvrir'));
      if (b.hasAttribute('data-deverrou')) { if (await R().deverrouiller(b.getAttribute('data-deverrou'))) peindre(); return; }
      // les gestes qui détruisent : un premier toucher demande « sûr ? »
      const destructif = b.hasAttribute('data-retirer') || b.hasAttribute('data-bion-retirer') || b.getAttribute('data-a') === 'reset' || b.getAttribute('data-a') === 'supprimer-compte' || b.getAttribute('data-a') === 'supprimer-social';
      if (destructif && !b.classList.contains('sur')) { b.classList.add('sur'); b.dataset.avant = b.textContent; b.textContent = 'sûr ?'; return; }
      try {
        if (b.hasAttribute('data-retirer')) { const id = b.getAttribute('data-retirer'); await (R().retirerPloxion ? R().retirerPloxion(id) : depot.retirer(id)); msg('✓ ' + id + ' retiré'); return peindre(); }
        if (b.hasAttribute('data-bion-retirer')) { await depot.retirerBion(b.getAttribute('data-bion-retirer')); msg('✓ bion retiré'); return peindre(); }
        if (b.hasAttribute('data-bion-maj')) { b.disabled = true; const r = await depot.majBion(b.getAttribute('data-bion-maj')); msg(r === 'a-jour' ? '✓ déjà à jour' : '✓ mis à jour'); b.disabled = false; return; }
      } catch (er) { msg('⚠ ' + (er.message || er)); b.disabled = false; return; }
      const a = b.getAttribute('data-a'); if (!a) return;
      b.disabled = true;
      try {
        if (a === 'dossier') { const s = zone.querySelector('[data-dossier]'); try { const l = await W.jOSNatif.fichiers.synchroniser(); if (s) s.textContent = '✓ ' + l.length + ' fichier(s) · ouvre Fichiers › Sur mon iPhone › ploxi0n'; } catch (er) { if (s) s.textContent = '⚠ ' + (er.message || er); } }
        else if (a === 'fond') { if (W.ploxi0nFond) W.ploxi0nFond.composer(); }
        else if (a === 'gestion') { R().ouvrir('gestion'); }
        else if (a === 'nouveautes') { if (W.ploxi0nNouveautes) W.ploxi0nNouveautes.tout(); }
        else if (a === 'barre-haut') { if (W.ploxi0nBarreHaut) W.ploxi0nBarreHaut.composer(); }
        else if (a === 'tuto') { if (W.ploxi0nTuto) W.ploxi0nTuto.montrer(); }
        else if (a === 'atelier') { R().ouvrir('atelier-peaux'); }
        else if (a === 'regard-recentrer') { if (W.ploxi0nRegard) W.ploxi0nRegard.recentrer(); }
        else if (a === 'regard-calibrer') { if (W.ploxi0nRegard) await W.ploxi0nRegard.calibrer(); }
        else if (a === 'quoi') { if (W.ploxi0nTuto && W.ploxi0nTuto.cestQuoi) W.ploxi0nTuto.cestQuoi(); }
        else if (a === 'astuces') { if (W.ploxi0nTuto && W.ploxi0nTuto.remettreAstuces) { await W.ploxi0nTuto.remettreAstuces(); b.textContent = 'c\'est fait'; } }
        else if (a === 'widgets') { if (W.ploxi0nWidgets) { await W.ploxi0nWidgets.publier(); await new Promise(r => W.setTimeout(r, 700)); } await peindre(); msg('✓ republié : regarde tes widgets (iOS peut prendre quelques secondes)'); }
        else if (a === 'clavier') { await testerClavier({ W, version }); }
        else if (a === 'notif') { await notifs.tester(); msg('✓ elle arrive dans 5 secondes'); }
        else if (a === 'apps') { if (W.jOSEcranAccueil) await W.jOSEcranAccueil(); }
        else if (a === 'connecter') await compte.connecter();
        else if (a === 'sortir') { await compte.deconnecter(); }
        else if (a === 'supprimer-compte') { await W.jOSNatif.navigateur(((depot && depot.source) || 'https://labo.j0bot.ch') + '/profile'); msg('la page de ton compte s\'ouvre : « supprimer le compte » en bas ; ensuite, déconnecte-toi ici'); }
        else if (a === 'supprimer-social') { await social.supprimer(); await peindre(); msg('✓ ton compte du social est supprimé'); return; }
        else if (a === 'accueil') { R().reinitialiserAccueil(); msg('✓ accueil remis à zéro'); }
        else if (a === 'bions') { const r = await depot.completerBions(); msg(r.length ? '✓ ' + r.map(x => x.id + ' +' + (x.apres - x.avant)).join(' · ') : '✓ rien à compléter'); }
        else if (a === 'bions-maj') { let n = 0; for (const x of await depot.bions()) { try { if ((await depot.majBion(x.nom)) === 'mis-a-jour') n++; } catch (er) { /* un bion introuvable n'arrête pas les autres */ } } msg('✓ ' + n + ' bion' + (n > 1 ? 's' : '') + ' mis à jour'); }
        else if (a === 'ajour') { const r = await depot.aJour(); msg(r.length ? r.map(x => x.id + ' : ' + ({ 'a-jour': 'à jour', 'mis-a-jour': 'mis à jour ✓', erreur: 'erreur' }[x.etat])).join(' · ') : 'rien à vérifier'); }
        else if (a === 'routes') { for (const r of await boxion.list('routes')) await boxion.del('routes', r.key); await peindre(); msg('✓ vidé'); }
        else if (a === 'reset') { for (const k of ['accueil', 'verrous', 'hud', 'app', 'marketplace', 'notifs', 'mode-connecte', 'bions-coupes']) await boxion.del('reglages', k); msg('✓ réinitialisé : ploxi0n redémarre'); try { W.location.reload(); } catch (er) { /* */ } }
      } catch (er) { msg('⚠ ' + (er.message || er)); }
      b.disabled = false;
      if (a === 'sortir' || a === 'accueil' || a === 'bions') { const m = zone.querySelector('[data-msg]').textContent; await peindre(); msg(m); }
    });
    const off = compte.surChangement(() => peindre());
    peindre();
    return { unmount() { vivant = false; off(); hote.innerHTML = ''; },
      // ▣ (0.68) le contrat du cube des pages (src/app/cube-pages.js) : l'accueil des réglages (« * ») et chaque page de premier niveau
      pages: () => [['*', 'réglages'], ...GROUPES.flatMap(([, l]) => l.map(([k, , n]) => [k, n]))].filter(([k]) => k === '*' || zone.querySelector('section[data-s="' + k + '"]'))
        .map(([k, n]) => ({ cle: k, nom: n, actif: (page || '*') === k })),
      allerPage(k, o = {}) { if (!vivant) return; page = k === '*' ? null : k; q = ''; const ch = hote.querySelector('[data-q]'); if (ch) ch.value = ''; filtrer(); if (!o.muet) vibrer('selection'); },
      garderEtat() { const s = { page, q }; return () => { if (!vivant) return; page = s.page; q = s.q; const ch = hote.querySelector('[data-q]'); if (ch) ch.value = q; filtrer(); }; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['reglages-app'] = { manifest: { id: 'reglages-app', name: 'Réglages', icon: '' }, mount };
  return { id: 'reglages-app', nom: 'Réglages', icone: '', interne: true };
}
