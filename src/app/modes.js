// ◈ LES MODES (0.50, RS-7 : « je veux qu'il y ait aussi un mode xerbot, et un mode xerboxion ; le mode xerboxion, c'est d'avoir l'UI du
// labo »). Trois façons d'habiter l'app, un toucher en haut de l'accueil :
//   〰 organique   (0.94, RS-7 : « que tout le UI entier ait l'air vivant ») l'accueil de ploxi0n, en membranes et en neurones
//   ◇ chill-tekk  l'accueil de ploxi0n : tes ploxions, calme ; (0.99.47) le mode de base à l'installation, le plus simple pour commencer
//   ⬡ xerboxion   l'UI du labo (labo.j0bot.ch) comme accueil, le dock de l'app par-dessus ; un ploxion qu'elle ouvre
//                 (postMessage { ploxi0n: 'ouvrir', id }) s'ouvre dans l'app, en natif
//                 (0.99.55, RS-7 via xerxion1 : « le xer xerboxion de l'app = le xer chill-tekk du labo : même thème, koins gauche = app,
//                 droite = global, hypercube, octogone en bas, ‹ › ; + tout le natif ; ton xer chill-tekk reste le tien ») → /xer/chill-tekk
//   ✕ xeroction  (0.99.67, RS-7 coord #2221 : « le mode xerbot de ploxi0n c'est le mode xeroction ») l'ancien mode xerbot, le même : XERB0T,
//                 la couche robotique, le poste de pilotage du monde physique — la blouse (labo-cape), les appareils Bluetooth, la maison
//                 (HomeKit), la lampe, les tags NFC (les kions dans le réel), le Wi-Fi, et le bus xerbot.cmd ; « xerbot » rangé → xeroction
// Réglage : prefs.mode ; <html> porte px-m-<mode> (le CSS cache la grille quand un panneau la remplace).
/** « avance 1 », « tourne 90 », « stop » → la commande legacy du contrat xerbot v1 { cmd, d?, deg?, src, ts } */
export function commandeLegacy(t) {
  const [cmd, n] = String(t || '').trim().split(/\s+/), x = parseFloat(n);
  const c = { cmd: (cmd || '').toLowerCase(), src: 'ploxi0n', ts: Date.now() };
  if (!isNaN(x)) { if (/^tourne/.test(c.cmd)) c.deg = x; else c.d = x; }
  return c;
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { glyphe as G, versGlyphe } from './glyphes.js';   // ◇ (0.54) des glyphes, plus d'emoji
import { modeNormal } from './prefs.js';
export { modeNormal };
export const MODES = [['organique', 'neurone', 'organique'], ['chill-tekk', 'chilltekk', 'chill-tekk'], ['xerboxion', 'xerboxion', 'xerboxion'], ['xeroction', 'xeroction', 'xeroction']];

export function creerModes({ W = globalThis.window, prefs, ouvrir = () => {}, connait = () => false, source = 'https://labo.j0bot.ch', chemin = '/home', vibrer = () => {}, cadres = null, controleur = null, connecter = null, xerboxion = null }) {
  const D = W.document, N = () => W.jOSNatif || {};
  const mode = () => { const m = modeNormal(prefs.lire().mode || ''); return MODES.some(x => x[0] === m) ? m : 'chill-tekk'; };   // (0.99.47) le mode de base : chill-tekk
  const appliquer = () => { for (const [m] of MODES) D.documentElement.classList.toggle('px-m-' + m, mode() === m); };
  appliquer(); prefs.surChangement(appliquer);
  const xb = { messages: [], maison: null, nfc: null, ble: null, wifi: null, lampe: false };

  // le labo : un ploxion qu'il ouvre s'ouvre ici (seulement depuis l'origine du labo)
  W.addEventListener('message', (e) => {
    if (e.origin !== source || !e.data || typeof e.data !== 'object') return;
    if (e.data.ploxi0n === 'ouvrir' && typeof e.data.id === 'string') ouvrir(e.data.id.slice(0, 80));
    // (0.51) ce que joue l'UI du labo (Spotify dans l'iframe : l'app n'y a pas accès) → l'écran verrouillé, le mini dock ; les commandes y retournent
    if (e.data.ploxi0n === 'lecture' && N().lecture) {
      const d = e.data, f = e.source, cmd = (c) => () => { try { f.postMessage({ ploxi0n: 'commande', c }, source); } catch (er) { /* */ } };
      if (!d.titre) { N().lecture.fin(); return; }
      N().lecture.surCommande((c) => cmd(c)());
      N().lecture.publier({ titre: String(d.titre).slice(0, 200), artiste: String(d.artiste || '').slice(0, 200), image: /^https:/.test(d.image || '') ? d.image : '', enLecture: !!d.enLecture, duree: +d.duree || 0, position: +d.position || 0 });
    }
  });
  // XERB0T : le bus (les ploxions et la blouse y parlent) ; les derniers messages s'affichent
  try { if (W.jOSPorts && W.jOSPorts.on) W.jOSPorts.on('*', (p, topic) => { if (!/^ploxion\.xerbot\./.test(topic || '')) return; xb.messages.unshift({ le: Date.now(), port: topic.slice(15), p }); xb.messages.length = Math.min(xb.messages.length, 12); if (mode() === 'xeroction') rafraichir(); }); } catch (e) { /* */ }

  const puces = () => '<div class="px-modes" role="tablist" data-neurones="fin" data-neurones-cellules="button">' + MODES.map(([k, i, n]) => '<button data-mode="' + k + '" class="' + (k === mode() ? 'on' : '') + '">' + G(i) + ' ' + n + '</button>').join('') + '</div>';
  function panneauXerboxion() {
    if (W.navigator.onLine === false) return '<div class="px-mode-p"><p class="px-grave">⬡ xerboxion</p><p>L\'UI du labo demande le réseau. Hors ligne : ◇ chill-tekk.</p></div>';
    // (0.52) l'iframe reste invisible tant que l'UI du labo n'est pas là (plus de grand rectangle blanc) ; dessous, « ça arrive »
    return '<div class="px-mode-p px-labo"><p class="px-labo-attente">⬡ l\'UI du labo arrive…</p><iframe onload="this.dataset.charge=1;if(this.dataset.ok&&this.getAttribute(\'src\')!==\'about:blank\')this.style.opacity=1" style="opacity:0" title="xerboxion" src="about:blank" data-vers="' + esc(chemin) + '?app=ploxi0n" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; geolocation" referrerpolicy="origin"></iframe></div>';
  }
  const carte = (ic, titre, sous, actions) => '<div class="px-xb-c"><span class="ic">' + versGlyphe(ic) + '</span><span><b>' + esc(titre) + '</b><small>' + sous + '</small></span><span class="act">' + actions + '</span></div>';
  function panneauXerbot() {
    const m = xb.maison;
    // (0.75) le contrôleur d'abord : tes appareils, leur état d'un coup d'œil
    let resume = 'Home Assistant, WLED, ESPHome, Tasmota, les Pi, les Arduino/ESP';
    if (controleur && xb.appareils) { const l = xb.appareils, ok = l.filter(a => { const r = controleur.etat(a.id); return r && r.en_ligne && !r.erreur; }).length; resume = l.length ? ok + ' en ligne sur ' + l.length + ' appareil(s)' : 'rien encore : ajoute tes appareils'; }
    return '<div class="px-mode-p px-xerbot px-xeroction"><p class="px-grave">✕ xeroction · le monde physique</p>'
      + (controleur ? carte('🤖', 'le contrôleur', esc(resume), '<button data-xb="controleur">ouvrir</button>') : '')
      + carte('🥼', 'labo-cape', 'la blouse RS-7 : températures, consigne, LEDs', '<button data-xb="cape">ouvrir</button>')
      + carte('ᛒ', 'Bluetooth', xb.ble ? esc(xb.ble) : 'un capteur, un robot, une lampe…', '<button data-xb="ble">chercher</button>' + (connait('bluetooth') ? '<button data-xb="ub">ultimate</button>' : ''))
      + carte('🏠', 'La maison', m == null ? 'HomeKit : tes accessoires' : m.length ? m.length + ' accessoire(s)' : 'aucun accessoire', '<button data-xb="maison">' + (m == null ? 'voir' : '↻') + '</button>')
      + (m && m.length ? '<div class="px-xb-maison">' + m.slice(0, 12).map(a => '<button data-xb-acc="' + esc(a.id) + '" class="' + (a.allume ? 'on' : '') + '"' + (a.basculable && a.joignable ? '' : ' disabled') + '>' + esc(a.nom) + '<small>' + esc(a.piece || a.maison || '') + '</small></button>').join('') + '</div>' : '')
      + carte('🔦', 'La lampe', xb.lampe ? 'allumée' : 'éteinte', '<button data-xb="lampe">' + (xb.lampe ? 'éteindre' : 'allumer') + '</button>')
      + carte('◉', 'NFC · les kions dans le réel', xb.nfc ? esc(xb.nfc) : 'lire un tag (un ploxion, un tsoin, un objet)', '<button data-xb="nfc">lire</button>')
      + carte('📶', 'Wi-Fi', xb.wifi ? esc(xb.wifi) : 'le réseau de la blouse, du robot, du boxion', '<button data-xb="wifi">voir</button>')
      + '<p class="px-grave">le bus xerbot</p><div class="px-xb-bus"><input data-xb-cmd placeholder="une commande pour le robot (ex. avance 1, tourne 90, stop)" autocomplete="off"><button data-xb="envoyer">envoyer</button></div>'
      + '<pre class="px-cape-log">' + esc(xb.messages.map(x => new Date(x.le).toLocaleTimeString('fr-CH') + '  ' + x.port + ' ' + (typeof x.p === 'string' ? x.p : JSON.stringify(x.p))).join('\n') || 'rien encore : la blouse, ultimate-bluetooth et les robots y publient') + '</pre></div>';
  }
  // (0.52) une page d'erreur dans l'iframe (hors réseau, labo injoignable) est blanche et illisible depuis ici : on sonde le labo d'abord
  function sonder() {
    W.setTimeout(() => {
      const f = D.querySelector('.px-labo iframe'); if (!f || f.dataset.sonde) return; f.dataset.sonde = '1';
      // (0.53) la règle d'encadrement du labo (CSP frame-ancestors, lue par un HEAD natif) : refusé → une carte « ouvrir », pas un blanc
      const regle = cadres ? cadres.permis(chemin) : Promise.race([W.fetch(source + chemin, { mode: 'no-cors', cache: 'no-store' }).then(() => 'oui'), new Promise((ok) => W.setTimeout(() => ok('injoignable'), 8000))]).catch(() => 'injoignable');
      regle.then((r) => {
        const p = f.closest('.px-labo'); if (!p) return;
        // 🔑 (0.83) le labo accepte le cadre : l'adresse qui te CONNECTE (un passe à usage unique, src/natif/connexion-labo.js), pas « j'ai un code »
        if (r === 'oui') {
          f.dataset.ok = '1';
          const vers = f.dataset.vers; if (!vers || f.dataset.parti) { if (f.dataset.charge) f.style.opacity = '1'; return; }
          f.dataset.parti = '1'; delete f.dataset.charge;
          (connecter ? connecter(vers) : Promise.resolve(source + vers)).catch(() => source + vers).then((u) => { if (f.isConnected) f.setAttribute('src', u); });
          return;
        }
        p.innerHTML = r === 'non'
          ? '<div class="px-cadre-labo"><span class="g">⬡</span><b>L\'UI du labo ne s\'affiche pas encore dans l\'app</b><small>le labo n\'accepte d\'être encadré que par lui-même (frame-ancestors) ; en attendant, elle s\'ouvre à côté</small><button type="button" data-xb-ouvrir>ouvrir le labo</button></div>'
          : '<p class="px-labo-attente">⬡ le labo ne répond pas · ◇ chill-tekk en attendant</p>';
        const b = p.querySelector('[data-xb-ouvrir]'); if (b) b.onclick = () => { if (W.jOSNatif && W.jOSNatif.navigateur) W.jOSNatif.navigateur(source + chemin + '?app=ploxi0n'); };
      });
    }, 0);
  }
  // ◈ (0.98, RS-7 23.10 : « une seule map, tout est fractal ») : dans l'organique, l'accueil EST la map (ses paliers : tes ploxions, le réseau,
  // un hub, un ploxion, un bion). Une seule map, montée une fois et gardée : l'accueil, redessiné souvent, la reprend telle quelle
  let hoteMap = null;
  function monterMap() {
    const place = D.querySelector('.px-accueil [data-org-map]'); if (!place) return;
    if (!hoteMap) { hoteMap = D.createElement('div'); hoteMap.className = 'px-org-map-h'; try { W.jOSApps.map.mount(hoteMap, {}); } catch (e) { hoteMap = null; return; } }
    if (hoteMap.parentNode !== place) place.appendChild(hoteMap);
  }
  // ⬡ (0.99.63, RS-7 : « Prio 1 : xer xerboxion », le choix « natif ») le xer xerboxion dessiné ici (src/app/xer-xerboxion.js) ; la page
  // du labo dans un cadre reste possible (prefs.xerboxionLabo), et à un toucher dans l'onglet Xers
  const natifXbx = () => !!xerboxion && prefs.lire().xerboxionLabo !== true;
  function monterXbx() { const place = D.querySelector('.px-accueil [data-xbx-place]'); if (place && xerboxion) xerboxion.monter(place); }
  function panneau() {
    const m = mode();
    if (m === 'xerboxion' && natifXbx()) { W.setTimeout(monterXbx, 0); return puces() + '<div class="px-mode-p px-xbx-place" data-xbx-place></div>'; }
    if (m === 'xerboxion') sonder();
    if (m === 'organique') W.setTimeout(monterMap, 0);
    return puces() + (m === 'xerboxion' ? panneauXerboxion() : m === 'xeroction' ? panneauXerbot() : m === 'organique' ? '<div class="px-mode-p px-org-map" data-org-map></div>' : '');
  }
  function rafraichir() { const p = D.querySelector('.px-accueil .px-mode-p.px-xerbot'); if (p) p.outerHTML = panneauXerbot(); }
  // le résumé du contrôleur : la liste au premier affichage, puis chaque changement d'état
  if (controleur) { controleur.liste().then((l) => { xb.appareils = l; if (mode() === 'xeroction') rafraichir(); }).catch(() => {}); controleur.surChangement(() => { controleur.liste().then((l) => { xb.appareils = l; if (mode() === 'xeroction') rafraichir(); }); }); }
  async function action(b) {
    const a = b.getAttribute('data-xb'), n = N();
    try {
      if (a === 'cape') return ouvrir('cape');
      if (a === 'ub') return ouvrir('bluetooth');   // (0.75) « Ultimate Bluetooth » a l'id bluetooth au labo
      if (a === 'controleur') return ouvrir('controleur');
      if (a === 'ble') { const d = await W.navigator.bluetooth.requestDevice({ acceptAllDevices: true }); xb.ble = (d.name || d.id) + ' · trouvé'; }
      if (a === 'maison') xb.maison = n.maison ? await n.maison.liste() : [];
      if (a === 'lampe') { const r = await n.lampe(!xb.lampe); xb.lampe = !!(r && r.allume); }
      if (a === 'nfc') { const l = await n.nfc.lire(); xb.nfc = l.map(r => r.texte || r.type).join(' · ') || 'tag vide'; }
      if (a === 'wifi') { const w = await n.wifiInfo(); xb.wifi = (w.ssid || 'pas de Wi-Fi') + (w.ip ? ' · ' + w.ip : ''); }
      // (0.75) le contrat xerbot v1 du labo : la forme legacy « command » { cmd, d?, deg?, src } (routée au robot par défaut) ;
      // l'ancienne chaîne brute sur ploxion.xerbot.cmd, personne ne l'écoutait
      if (a === 'envoyer') { const i = D.querySelector('[data-xb-cmd]'); const t = i && i.value.trim(); if (!t) return; if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('xerbot', 'command', commandeLegacy(t)); i.value = ''; }
      vibrer('succes');
    } catch (e) { vibrer('erreur'); xb.messages.unshift({ le: Date.now(), port: '⚠', p: String((e && e.message) || e) }); }
    rafraichir();
  }
  /** les gestes du panneau (délégués : l'accueil est redessiné souvent) */
  function attacher(racine) {
    racine.addEventListener('click', (e) => {
      // (0.68) seulement les puces des modes et les panneaux de l'accueil : un ploxion a ses propres data-mode (le minuteur : chrono,
      // minuteur, pomo) — capturés ici, ils changeaient le mode de l'app au lieu du sien (revue du cube des pages)
      const b = e.target.closest('button'); if (!b || b.closest('.px-hote')) return;
      if (b.hasAttribute('data-mode') && b.closest('.px-modes')) { e.stopPropagation(); vibrer('selection'); prefs.regler({ mode: b.getAttribute('data-mode') }).then(() => W.ploxi0n && W.ploxi0n.routeur && W.ploxi0n.routeur.accueil()); return; }
      if (b.hasAttribute('data-xb')) { e.stopPropagation(); action(b); return; }
      if (b.hasAttribute('data-xb-acc')) { e.stopPropagation(); const id = b.getAttribute('data-xb-acc'); N().maison.basculer(id).then(r => { const a = (xb.maison || []).find(x => x.id === id); if (a) a.allume = r.allume; rafraichir(); }).catch(() => {}); }
    }, true);
  }
  return { panneau, attacher, mode, MODES };
}
