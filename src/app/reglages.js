// ⚙ LES RÉGLAGES de ploxi0n (RS-7 11.10 : « un vrai bouton réglages » ; 12.10 : « améliorer au max les réglages, on a tellement d'options
// qu'on peut activer ou désactiver ; on doit pouvoir manager les bions »). Un ploxion interne, toujours au bout du ⚙ (il ne se retire pas).
// Une page, une recherche (« chercher un réglage » filtre chaque ligne), une rangée de catégories pour sauter d'une section à l'autre :
//   compte · réseau · notifications · apparence · navigation · HUD et dock · écran d'accueil iPhone · accueil · ploxions · bions · Face ID ·
//   données · à propos
// Les bions : chacun avec sa taille et les ploxions qui l'utilisent ; le couper (plus chargé), le mettre à jour, le retirer s'il ne sert plus.
import { testerClavier } from './clavier.js';
import { PLUGIONS } from '../natif/plugions.js';
import { STYLES, EVENEMENTS } from '../natif/haptique.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ko = (n) => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (Math.round(n / 104857.6) / 10) + ' Mo';
const heures = (s) => !s ? '0 h' : s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : (Math.round(s / 360) / 10).toLocaleString('fr-CH') + ' h';
export const FOURNIS_APP = ['jOSApps', 'jOSPorts', 'jOSTsoin', 'jOSBoxion', 'jOS', 'jOSXerPrefs', 'jOSMobile', 'jOSb', 'jOSVerrou', 'jOSRaccourcis', 'jOSEcranAccueil', 'jOSKeyboard (le clavier d\'iOS)'];
const SECTIONS = [['compte', '👤', 'compte'], ['reseau', '🌐', 'réseau'], ['notifs', '🔔', 'notifications'], ['apparence', '🎨', 'apparence'], ['haptique', '🫧', 'haptique'], ['lecteur', '🎞', 'lecteur'], ['navigation', '🧭', 'navigation'],
  ['hud', '🧩', 'HUD et dock'], ['iphone', '📲', 'écran d\'accueil'], ['accueil', '🏠', 'accueil'], ['ploxions', '▣', 'ploxions'], ['bions', '⬡', 'bions'], ['faceid', '🔒', 'Face ID'],
  ['donnees', '💾', 'données'], ['apropos', '◇', 'à propos']];

export function enregistrerReglages({ W = globalThis.window, compte, hud, routeur, depot, boxion, modeConnecte, notifs = null, prefs = null, vibrer = () => {}, haptique = null, lecteur = null, version = '?' }) {
  const ELS = { tsoin: '⧗ noter un tsoin', vocal: '🎙 vocal', compte: '👤 compte', reseau: '📶 réseau et mode connecté', heure: '🕐 heure', chercher: '🔎 chercher un ploxion', epingles: '📌 ploxions épinglés' };
  function mount(hote) {
    let vivant = true, q = '', composition = [];
    const R = () => routeur();
    hote.innerHTML = '<div class="rg"><style>'
      + '.rg{padding:0 16px 80px;max-width:640px;margin:0 auto}.rg h3{margin:24px 6px 8px;font:600 10.5px var(--mono,monospace);letter-spacing:.2em;text-transform:uppercase;color:var(--muted,#8aa0c0)}'
      + '.rg-tete{position:sticky;top:0;z-index:3;background:var(--bg,#07050c);padding:12px 0 8px;margin:0 -16px;padding-left:16px;padding-right:16px;border-bottom:1px solid var(--bord,#272036)}'
      + '.rg-q{width:100%;box-sizing:border-box;padding:11px 14px;border-radius:14px;border:var(--trait,2px) solid var(--bord,#272036);background:var(--creux,#0a0712);color:inherit;font:16px var(--police,system-ui);-webkit-appearance:none;appearance:none}.rg-q:focus{outline:none;border-color:var(--bord2,#3a3050)}'
      + '.rg-nav{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-top:8px}.rg-nav::-webkit-scrollbar{display:none}.rg-nav button{flex:none;font:600 10.5px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;min-height:32px;padding:0 11px;color:var(--muted,#8aa0c0)}'
      + '.rg .bloc{background:var(--surface,#0f0b18) var(--grain,none);border:var(--trait,2px) solid var(--bord,#272036);border-radius:18px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--filet,rgba(190,175,230,.06))}'
      + '.rg .l{display:flex;align-items:center;gap:10px;padding:12px 16px;min-height:30px;border-top:1px solid rgba(178,140,255,.12)}.rg .l:first-child{border-top:0}.rg .l[hidden],.rg section[hidden]{display:none}'
      + '.rg .l>span{flex:1;min-width:0}.rg .l small{display:block;color:var(--muted,#8aa0c0);font-size:.78rem;overflow-wrap:anywhere}.rg button{border:var(--trait,2px) solid var(--bord,#22324f);background:var(--surface2,#251754);color:inherit;border-radius:11px;padding:6px 12px;min-height:34px;font:500 14px inherit;flex:none}'
      + '.rg .bas{border:0;min-height:30px;padding:2px 8px;color:var(--muted,#8aa0c0)}.rg .p{border-color:var(--acc2,#7a6aa8);color:var(--acc,#b69cff)}.rg .msg{color:var(--muted,#8aa0c0);font-size:.82rem;margin:8px 4px}.rg .danger{color:#e8a0b8}'
      + '.rg input[type=checkbox]{appearance:none;-webkit-appearance:none;width:48px;height:29px;border-radius:10px;background:var(--creux,#160d35);border:3px solid var(--bord,#3b2775);box-sizing:content-box;position:relative;flex:none;margin:0;transition:background .15s}'
      + '.rg input[type=checkbox]::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:7px;background:#8a82a3;transition:transform .15s}.rg input:checked{background:#16301f;border-color:var(--bio,#79d9a2)}.rg input:checked::after{background:var(--bio,#79d9a2);box-shadow:0 0 8px var(--glow,rgba(121,217,162,.3));transform:translateX(18px)}'
      + '.rg .l.ls{flex-wrap:wrap}.rg .l.ls>span{flex:1 1 100%}.rg .seg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-start}.rg .seg button{min-height:32px;padding:0 10px;font-size:12.5px;color:var(--muted,#8aa0c0)}.rg .seg button.on{color:var(--txt,#eee);border-color:var(--bio,#79d9a2)}'
      + '.rg .pins{display:flex;gap:10px;flex-wrap:wrap;padding:12px 16px}.rg .pin{font-size:1.4rem;width:50px;height:50px;border-radius:var(--blob1,14px);padding:0;opacity:.5}.rg .pin.on{opacity:1;border-color:var(--bio,#79d9a2);box-shadow:0 0 10px var(--glow,rgba(121,217,162,.28))}'
      + '.rg .l>span.ic{font-size:1.25rem;width:30px;text-align:center;flex:0 0 30px}.rg .eteint{opacity:.5}.rg .l .act{display:flex;gap:6px;align-items:center;flex:none}'
      + '</style><div class="rg-tete"><input class="rg-q" data-q type="search" autocomplete="off" placeholder="chercher un réglage"><div class="rg-nav">' + SECTIONS.map(([k, i, n]) => '<button data-aller="' + k + '">' + i + ' ' + esc(n) + '</button>').join('') + '</div></div><div data-c></div></div>';
    const zone = hote.querySelector('[data-c]');
    const section = (k, titre, corps) => '<section data-s="' + k + '"><h3>' + titre + '</h3>' + corps + '</section>';
    const bascule = (attr, on, texte, sous) => '<label class="l"><span>' + texte + (sous ? '<small>' + sous + '</small>' : '') + '</span><input type="checkbox" ' + attr + (on ? ' checked' : '') + '></label>';
    const seg = (cle, valeurs, actuel, texte, sous) => '<div class="l ls"><span>' + texte + (sous ? '<small>' + sous + '</small>' : '') + '</span><div class="seg">' + valeurs.map(([v, n]) => '<button data-pv="' + cle + '" data-v="' + esc(v) + '"' + (String(v) === String(actuel) ? ' class="on"' : '') + '>' + esc(n) + '</button>').join('') + '</div></div>';

    async function peindre() {
      if (!vivant) return;
      const e = compte.etat(), c = hud.config(), verrous = R().verrous(), cat = R().catalogue().filter(p => !p.interne), P = prefs ? prefs.lire() : null;
      const [nRoutes, installes, bions, u] = await Promise.all([boxion.list('routes').then(l => l.length).catch(() => 0), depot.installes().catch(() => []), depot.bions ? depot.bions().catch(() => []) : [], boxion.get('usage', 'stats').catch(() => null)]);
      const usage = (u && u.px) || {};
      const tailles = {}; for (const p of installes) tailles[p.id] = depot.taille ? await depot.taille(p.id) : 0;
      zone.innerHTML =
        section('compte', 'Compte', '<div class="bloc"><div class="l"><span>' + (e.connecte ? esc((e.glyphe || '·') + ' ' + e.nom) + '<small>rang ' + esc(e.palier) + ' · xerboxion.org</small>' : 'Pas connecté<small>tout reste sur ton téléphone</small>') + '</span>'
          + (e.connecte ? '<button data-a="sortir">se déconnecter</button>' : '<button class="p" data-a="connecter">se connecter</button>') + '</div></div>')
        + section('reseau', 'Réseau', '<div class="bloc">' + bascule('data-t="mode"', modeConnecte(), 'Mode connecté', 'les ploxions joignent xerboxion.org' + (e.connecte ? ' avec ton compte' : '') + ' ; hors ligne, leur dernière réponse')
          + '<div class="l"><span>Source<small>xerboxion.org (le marketplace, les bions, le mode connecté)</small></span></div></div>')
        + (notifs ? section('notifs', 'Notifications', '<div class="bloc"><div class="l"><span>Une notification de test<small>elle arrive 5 s après : verrouille le téléphone</small></span><button data-a="notif">tester</button></div>'
          + bascule('data-t="coord"', notifs.reglage().coord, 'Messages de coord', e.connecte ? 'tant que l\'app est ouverte ; app fermée : bientôt (APNs)' : 'connecte-toi avec le compte admin') + '</div>') : '')
        + (P ? section('apparence', 'Apparence', '<div class="bloc">'
          + seg('vue', [['grille', 'grille'], ['compacte', 'compacte'], ['liste', 'liste'], ['usage', 'usage'], ['recents', 'récents'], ['categories', 'catégories']], R().vueAccueil ? R().vueAccueil() : 'grille', 'Vue de l\'accueil')
          + seg('icones', [['petites', 'petites'], ['normales', 'normales'], ['grandes', 'grandes']], P.icones, 'Taille des icônes')
          + bascule('data-pb="pleinEcran"', !!P.pleinEcran, 'Plein écran complet', 'sans barre d\'état ; la barre du bas s\'efface ; les bords haut et bas vont d\'abord à l\'app (un 2e glissé pour iOS)')
          + '<div class="l"><span>🖼 Fond d\'écran<small>une photo, un motif gravé ; assombrir, flouter ; l\'accueil ou partout</small></span><button data-a="fond">changer</button></div>'
          + bascule('data-pb="barreHaut"', P.barreHaut !== false, 'Notre barre du haut', 'en plein écran : l\'heure, la batterie, tes tsoins… à gauche et à droite de l\'île ; appui long dessus pour la composer')
          + '<div class="l"><span>Composer la barre du haut<small>quels éléments, à gauche ou à droite</small></span><button data-a="barre-haut">composer</button></div>'
          + bascule('data-pb="themeVivant"', P.themeVivant !== false, 'Thème vivant', 'le thème suit le téléphone (gyroscope, accéléromètre) : le fond glisse, les icônes flottent et attrapent la lumière, un choc les fait tressauter')
          + bascule('data-pb="haptique"', P.haptique !== false, 'Haptique', 'de petites vibrations : ouvrir, revenir, minimiser, les bords, les pages, les interrupteurs')
          + bascule('data-pb="grain"', P.grain, 'Patine', 'le grain usé des plaques')
          + bascule('data-pb="contraste"', P.contraste === 'fort', 'Contraste fort', 'textes et bords plus clairs')
          + bascule('data-pb="calme"', P.calme, 'Calme', 'plus aucune animation, même aux gestes')
          + bascule('data-pb="plaque"', P.plaque, 'Plaque gravée', '« cycle 7026 · … » sur l\'accueil') + '</div>') : '')
        + (haptique ? (() => { const hc = haptique.config(), noms = Object.keys(hc.motifs);
            const options = (actuel) => '<option value="aucun"' + (actuel === 'aucun' ? ' selected' : '') + '>— rien</option>' + STYLES.map(([k, n]) => '<option value="' + k + '"' + (actuel === k ? ' selected' : '') + '>' + esc(n) + '</option>').join('')
              + noms.map(m => '<option value="motif:' + esc(m) + '"' + (actuel === 'motif:' + m ? ' selected' : '') + '>🫧 ' + esc(m) + '</option>').join('');
            return section('haptique', 'Haptique', '<div class="bloc">'
              + '<div class="l ls"><span>Inventer un motif<small>touche les pas dans l\'ordre (· = une pause), donne un nom, ▶ pour l\'essayer</small></span><div class="seg" data-studio>'
              + STYLES.map(([k, n]) => '<button data-pas="' + k + '">' + esc(n) + '</button>').join('') + '<button data-pas="pause">· pause</button><button data-pas="effacer">⌫</button></div>'
              + '<input class="rg-q" data-motif-nom placeholder="nom du motif" style="margin-top:8px"><div class="seg" style="margin-top:8px"><span data-motif-pas style="flex:1;color:var(--muted,#8aa0c0);font:12px var(--mono,monospace);align-self:center">(vide)</span><button data-motif="essayer">▶ essayer</button><button class="p" data-motif="sauver">sauver</button></div></div>'
              + noms.map(m => '<div class="l"><span class="ic">🫧</span><span>' + esc(m) + '<small>' + esc(hc.motifs[m].map(([st, ms]) => st + (ms ? ' ' + ms + 'ms' : '')).join(' · ')) + '</small></span><span class="act"><button class="bas" data-jouer="motif:' + esc(m) + '">▶</button><button class="bas danger" data-motif-suppr="' + esc(m) + '">🗑</button></span></div>').join('')
              + '</div><p class="msg">Chaque événement joue un style ou un de tes motifs :</p><div class="bloc">'
              + EVENEMENTS.map(([ev, n]) => '<div class="l"><span>' + esc(n) + '</span><select data-ev="' + ev + '" style="max-width:48%;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:6px;font:13px inherit">' + options(hc.evenements[ev] || 'aucun') + '</select></div>').join('')
              + '</div><p class="msg">Chaque ploxion a sa signature d\'ouverture (▶ pour la sentir), ou celle que tu choisis :</p><div class="bloc">'
              + R().catalogue().filter(p => !p.interne).slice(0, 80).map(p => { const v = (hc.ploxions || {})[p.id] || 'signature';
                  return '<div class="l"><span class="ic">' + esc(p.icone || '▣') + '</span><span>' + esc(p.nom || p.id) + '<small>' + esc(v === 'signature' ? haptique.signature(p.id).map(([st]) => st).join(' · ') : v.replace('motif:', '🫧 ')) + '</small></span>'
                    + '<span class="act"><button class="bas" data-sentir="' + esc(p.id) + '">▶</button><select data-hpx="' + esc(p.id) + '" style="max-width:34vw;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:5px;font:12px inherit">'
                    + '<option value="signature"' + (v === 'signature' ? ' selected' : '') + '>signature</option>' + options(v).replace('<option value="aucun"', '<option value="aucun"') + '</select></span></div>'; }).join('')
              + '</div>'); })() : '')
        + (lecteur ? section('lecteur', 'Lecteur', '<div class="bloc">'
          + bascule('data-lect="yt"', lecteur.reglage().yt, 'YouTube par xerboxion.org', 'une page https : YouTube refuse l\'intégration directe dans l\'app (erreurs 152/153)')
          + bascule('data-lect="haptiqueSon"', lecteur.reglage().haptiqueSon, 'Haptique du son', 'les basses deviennent des vibrations — pour les sons lisibles par l\'app (pas YouTube ni la plupart des flux)')
          + '<div class="l"><span>Le son continue écran verrouillé et en silencieux<small>contrôles sur l\'écran verrouillé et le Centre de contrôle, AirPlay, Picture in Picture ; plein écran = le lecteur d\'iOS</small></span></div></div>') : '')
        + (P ? section('navigation', 'Navigation', '<div class="bloc">'
          + bascule('data-pb="barreClavier"', P.barreClavier !== false, 'La barre au-dessus du clavier', 'QuickType, les mots de passe du trousseau, « OK » ; la dictée marche dans tous les champs')
          + bascule('data-pb="telecommande"', P.telecommande !== false, 'Télécommande', 'les barres en bas de l\'écran : tout au pouce (chill-tekk : on est tous des flemmards)')
          + bascule('data-pb="reprendre"', P.reprendre !== false, 'Reprendre là où j\'en étais', 'après une fermeture ou un plantage : le ploxion de devant rouvert, les autres endormis 💤 dans ⧉')
          + bascule('data-pb="bords"', P.bords, 'Les bords', 'glisser depuis le bord gauche ou droit pour passer d\'une app à l\'autre')
          + bascule('data-pb="appuiLong"', P.appuiLong, 'Appui long sur l\'accueil', 'le menu d\'un ploxion (épingler, déplacer, retirer…)')
          + bascule('data-pb="clicDroit"', P.clicDroit !== false, 'Appui long = clic droit', 'dans les ploxions : leurs menus du clic droit s\'ouvrent')
          + seg('maxVivants', [[3, '3'], [5, '5'], [8, '8']], P.maxVivants, 'Ploxions vivants en arrière-plan', 'au-delà, le plus ancien se ferme') + '</div>'
          + '<p class="msg">Les gestes des bords : glisser depuis une zone d\'un bord (ou les deux bords ensemble)</p><div class="bloc">'
          + (() => { const D0 = (R().GESTES_DEFAUT || {}), G = P.gestes || {}, cat2 = R().catalogue();
              const ACTIONS = [['precedente', '← app précédente'], ['suivante', 'app suivante →'], ['accueil', '⌂ accueil'], ['minimiser', '▁ minimiser'], ['basculer', '⧉ basculer'], ['chercher', '🔎 chercher'], ['reglages', '⚙ réglages'], ['portion', '◈ portion'], ['tsoin', '⧗ noter un tsoin'], ['rien', '— rien']]
                .concat(cat2.filter(p => !p.interne).slice(0, 60).map(p => ['ouvrir:' + p.id, '▶ ' + (p.nom || p.id)]));
              const ZONES = [['g-haut', 'gauche · haut'], ['g-milieu', 'gauche · milieu'], ['g-bas', 'gauche · bas'], ['d-haut', 'droit · haut'], ['d-milieu', 'droit · milieu'], ['d-bas', 'droit · bas'], ['deux-haut', 'les deux · haut'], ['deux-milieu', 'les deux · milieu'], ['deux-bas', 'les deux · bas']];
              return ZONES.map(([z, n]) => { const v = G[z] || D0[z] || 'rien'; return '<div class="l"><span>' + esc(n) + '</span><select data-geste="' + z + '" style="max-width:52%;background:var(--surface2,#151021);color:inherit;border:2px solid var(--bord,#272036);border-radius:10px;padding:6px;font:13px inherit">'
                + ACTIONS.map(([k, t]) => '<option value="' + esc(k) + '"' + (k === v ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></div>'; }).join(''); })()
          + '</div>') : '')
        + section('hud', 'HUD et dock', '<div class="bloc">' + (P ? bascule('data-pb="dock"', P.dock, 'Le dock en bas', 'compte, épinglés, ⚙') : '')
          + c.elements.map((x, i) => '<label class="l"><span>' + esc(ELS[x.k] || x.k) + '</span><button class="bas" data-monter="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="monter">↑</button><input type="checkbox" data-el="' + i + '"' + (x.on ? ' checked' : '') + '></label>').join('')
          + '<div class="l"><span>⚙ réglages<small>toujours là</small></span></div></div>'
          + '<p class="msg">📌 épinglés au dock et au widget (4 au plus)</p><div class="bloc"><div class="pins">' + (cat.length ? cat.map(p => '<button class="pin' + (c.epingles.includes(p.id) ? ' on' : '') + '" data-pin="' + esc(p.id) + '" title="' + esc(p.nom) + '">' + esc(p.icone || '▣') + '</button>').join('') : '<span class="msg">installe des ploxions d\'abord</span>') + '</div></div>')
        + section('iphone', 'Écran d\'accueil de l\'iPhone', '<div class="bloc"><div class="l"><span>📲 Tes ploxions en apps<small>une icône par ploxion, qui ouvre ploxi0n directement dessus</small></span><button class="p" data-a="apps">choisir</button></div></div>')
        + section('accueil', 'Accueil', '<div class="bloc"><div class="l"><span>Dossiers et pages<small>appui long sur un ploxion pour le ranger</small></span><button data-a="accueil">tout remettre</button></div></div>')
        + section('ploxions', 'Ploxions · ' + installes.length, '<div class="bloc"><div class="l"><span>Mises à jour<small>les ploxions installés depuis le réseau</small></span><button data-a="ajour">vérifier</button></div>'
          + installes.map(p => '<div class="l"><span class="ic">' + esc(p.icone || '▣') + '</span><span>' + esc(p.nom || p.id) + '<small>' + ko(tailles[p.id] || 0) + ' · ' + heures((usage[p.id] || {}).seconds) + ' · ' + (p.origine === 'pack' ? 'pack' : 'réseau') + (verrous.includes(p.id) ? ' · 🔒' : '') + '</small></span>'
            + '<span class="act"><button class="danger" data-retirer="' + esc(p.id) + '" aria-label="retirer">🗑</button></span></div>').join('') + '</div>')
        + section('bions', 'Bions · ' + bions.length, '<div class="bloc"><div class="l"><span>Compléter<small>ce que chaque ploxion touche, servi par le labo</small></span><button data-a="bions">compléter</button></div>'
          + '<div class="l"><span>Tout mettre à jour<small>retélécharge chaque bion, garde ceux qui n\'ont pas changé</small></span><button data-a="bions-maj">mettre à jour</button></div>'
          + bions.map(b => '<div class="l' + (b.coupe ? ' eteint' : '') + '"><span class="ic">⬡</span><span>' + esc(b.nom) + '<small>' + ko(b.octets) + ' · ' + (b.utilisePar.length ? 'sert à ' + esc(b.utilisePar.slice(0, 4).join(', ')) + (b.utilisePar.length > 4 ? ' +' + (b.utilisePar.length - 4) : '') : 'ne sert plus') + (b.coupe ? ' · coupé' : '') + '</small></span>'
            + '<span class="act"><button class="bas" data-bion-maj="' + esc(b.nom) + '" aria-label="mettre à jour">⟳</button>' + (b.utilisePar.length ? '' : '<button class="bas danger" data-bion-retirer="' + esc(b.nom) + '" aria-label="retirer">🗑</button>')
            + '<input type="checkbox" data-bion-on="' + esc(b.nom) + '"' + (b.coupe ? '' : ' checked') + ' aria-label="allumé"></span></div>').join('')
          + '<div class="l"><span class="ic">⚡</span><span>jOSNatif · le bion natif<small>' + esc((W.jOSNatif ? W.jOSNatif.capacites() : []).join(' · ') || 'non chargé') + ' — un seul bion, toutes les capacités de l\'iPhone, pour tous les ploxions</small></span></div>'
          + PLUGIONS.map(pg => '<div class="l"><span class="ic">🔌</span><span>plugion · ' + esc(pg.bion) + '<small>' + esc(pg.quoi) + (W[pg.bion] ? (W[pg.bion].__plugion ? ' · branché' : ' · en attente') : ' · bion pas encore chargé') + '</small></span></div>').join('')
          + '<div class="l"><span>Fournis par l\'app<small>' + FOURNIS_APP.join(' · ') + ' · jOSNatif</small></span></div></div>')
        + section('faceid', 'Face ID', '<div class="bloc">' + (verrous.length ? verrous.map(id => { const p = cat.find(x => x.id === id) || { nom: id, icone: '🔒' }; return '<div class="l"><span>' + esc(p.icone + ' ' + p.nom) + '</span><button data-deverrou="' + esc(id) + '">retirer le verrou</button></div>'; }).join('') : '<div class="l"><span>Aucun ploxion verrouillé<small>appui long sur un ploxion › verrouiller</small></span></div>') + '</div>')
        + section('donnees', 'Données', '<div class="bloc"><div class="l"><span>Réponses gardées pour le mode avion<small>' + nRoutes + ' route' + (nRoutes > 1 ? 's' : '') + '</small></span><button data-a="routes">vider</button></div>'
          + '<div class="l"><span>Réinitialiser les réglages<small>accueil, HUD, apparence, verrous… (tes ploxions, tes tsoins et ton compte restent)</small></span><button class="danger" data-a="reset">réinitialiser</button></div></div>')
        + section('apropos', 'À propos', '<div class="bloc"><div class="l"><span>ploxi0n ' + esc(version) + '<small>' + esc(W.navigator.onLine !== false ? 'en ligne' : 'hors ligne') + ' · cycle ' + (new Date().getFullYear() + 5000) + '</small></span></div>'
          + '<div class="l"><span>📁 Dossier dans Fichiers<small data-dossier>Sur mon iPhone › ploxi0n : tsoins, vocaux, fond, Dépôt</small></span><button data-a="dossier">mettre à jour</button></div>'
          + '<div class="l"><span>📦 Ploxions installés<small>la place qu\'ils prennent, leurs bions, retirer</small></span><button data-a="gestion">ouvrir</button></div>'
          + '<div class="l"><span>✦ Nouveautés<small>ce qui a changé, version par version</small></span><button data-a="nouveautes">voir</button></div>'
          + '<div class="l"><span>🧭 Le tuto d\'accueil<small>les gestes et les features, en 9 cartes</small></span><button data-a="tuto">revoir</button></div>'
          + '<div class="l"><span>▦ Widgets<small data-widgets-etat>…</small></span><button data-a="widgets">rafraîchir</button></div>'
          + '<div class="l"><span>⌨ Tester le clavier<small>si le clavier ne s\'ouvre pas : le rapport dit où ça casse</small></span><button class="p" data-a="clavier">tester</button></div>'
          + '<div class="l"><span>🧪 Banc iPhone</span><button data-ouvrir="banc">ouvrir</button></div><div class="l"><span>🐛 Bother me (un souci, une idée)</span><button data-ouvrir="bother">ouvrir</button></div></div>')
        + '<p class="msg" data-msg></p>';
      filtrer();
      if (W.ploxi0nWidgets) W.ploxi0nWidgets.etat().then(e => { const el = zone.querySelector('[data-widgets-etat]'); if (!el) return;
        el.textContent = !e ? 'pas encore copié (ouvre puis quitte l\'app)' : !e.groupe ? '⚠ App Group inaccessible pour l\'app' : (e.conteneur ? '' : '⚠ conteneur du groupe absent · ')
          + 'épinglés ' + (e.epingles >= 0 ? e.epingles + ' car.' : 'jamais publiés') + ' · valeurs ' + (e.valeurs >= 0 ? e.valeurs + ' car.' : 'jamais publiées') + ' · relu ' + e.relu + ' · ' + (e.le ? new Date(e.le * 1000).toLocaleTimeString('fr-CH') : '');
      }).catch(() => {});
    }
    function filtrer() {
      const t = norm(q).trim();
      for (const s of zone.querySelectorAll('section')) {
        let n = 0; const titre = norm(s.querySelector('h3').textContent);
        for (const l of s.querySelectorAll('.l')) { const ok = !t || titre.includes(t) || norm(l.textContent).includes(t); l.hidden = !ok; if (ok) n++; }
        s.hidden = !!t && !n;
      }
    }
    const msg = (t) => { const m = zone.querySelector('[data-msg]'); if (m) { m.textContent = t; try { m.scrollIntoView({ block: 'nearest' }); } catch (e) { /* */ } } };
    async function majHud(f) { const c = hud.config(); f(c); await hud.regler(c); peindre(); }
    hote.querySelector('[data-q]').addEventListener('input', (ev) => { q = ev.target.value; filtrer(); });
    hote.addEventListener('change', async (ev) => {
      const t = ev.target;
      if (t.type === 'checkbox') vibrer('interrupteur');
      if (t.matches('[data-t="mode"]')) { modeConnecte(t.checked); hud.regler(hud.config()); return; }
      if (t.matches('[data-t="coord"]')) { try { await notifs.coord(t.checked); const n = t.checked ? await notifs.verifierCoord() : []; msg(t.checked ? '✓ coord surveillé' + (n.length ? ' : ' + n.length + ' nouveau(x)' : '') : 'coord : plus de notifications'); } catch (er) { t.checked = false; await notifs.coord(false); msg('⚠ ' + (er.message || er)); } return; }
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
      if (b.hasAttribute('data-aller')) { const s = zone.querySelector('[data-s="' + b.getAttribute('data-aller') + '"]'); q = ''; hote.querySelector('[data-q]').value = ''; filtrer(); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      if (b.hasAttribute('data-monter')) { ev.preventDefault(); const i = +b.getAttribute('data-monter'); return majHud(c => { const [x] = c.elements.splice(i, 1); c.elements.splice(i - 1, 0, x); }); }
      if (b.hasAttribute('data-pin')) { const id = b.getAttribute('data-pin'); return majHud(c => { c.epingles = c.epingles.includes(id) ? c.epingles.filter(x => x !== id) : [...c.epingles, id].slice(-4); if (!c.elements.find(x => x.k === 'epingles').on) c.elements.find(x => x.k === 'epingles').on = true; }); }
      if (b.hasAttribute('data-pv') && prefs) { ev.preventDefault(); const k = b.getAttribute('data-pv'), v = b.getAttribute('data-v'); if (k === 'vue') { if (R().vueAccueil) R().vueAccueil(v); } else await prefs.regler({ [k]: k === 'maxVivants' ? +v : v }); return peindre(); }
      if (b.hasAttribute('data-ouvrir')) return R().ouvrir(b.getAttribute('data-ouvrir'));
      if (b.hasAttribute('data-deverrou')) { if (await R().deverrouiller(b.getAttribute('data-deverrou'))) peindre(); return; }
      // les gestes qui détruisent : un premier toucher demande « sûr ? »
      const destructif = b.hasAttribute('data-retirer') || b.hasAttribute('data-bion-retirer') || b.getAttribute('data-a') === 'reset';
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
        else if (a === 'widgets') { if (W.ploxi0nWidgets) { await W.ploxi0nWidgets.publier(); await new Promise(r => W.setTimeout(r, 700)); } await peindre(); msg('✓ republié : regarde tes widgets (iOS peut prendre quelques secondes)'); }
        else if (a === 'clavier') { await testerClavier({ W, version }); }
        else if (a === 'notif') { await notifs.tester(); msg('✓ elle arrive dans 5 secondes'); }
        else if (a === 'apps') { if (W.jOSEcranAccueil) await W.jOSEcranAccueil(); }
        else if (a === 'connecter') await compte.connecter();
        else if (a === 'sortir') { await compte.deconnecter(); }
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
    return { unmount() { vivant = false; off(); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['reglages-app'] = { manifest: { id: 'reglages-app', name: 'Réglages', icon: '⚙' }, mount };
  return { id: 'reglages-app', nom: 'Réglages', icone: '⚙', interne: true };
}
