// ◈ LES MODES (0.50, RS-7 : « je veux qu'il y ait aussi un mode xerbot, et un mode xerboxion ; le mode xerboxion, c'est d'avoir l'UI du
// labo »). Trois façons d'habiter l'app, un toucher en haut de l'accueil :
//   ◇ chill-tekk  l'accueil de ploxi0n : tes ploxions, calme
//   ⬡ xerboxion   l'UI du labo (xerboxion.org) comme accueil, le dock de l'app par-dessus ; un ploxion qu'elle ouvre
//                 (postMessage { ploxi0n: 'ouvrir', id }) s'ouvre dans l'app, en natif
//   🤖 xerbot     XERB0T, la couche robotique : le poste de pilotage du monde physique — la blouse (labo-cape), les appareils
//                 Bluetooth, la maison (HomeKit), la lampe, les tags NFC (les kions dans le réel), le Wi-Fi, et le bus xerbot.cmd
// Réglage : prefs.mode ; <html> porte px-m-<mode> (le CSS cache la grille quand un panneau la remplace).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const MODES = [['chill-tekk', '◇', 'chill-tekk'], ['xerboxion', '⬡', 'xerboxion'], ['xerbot', '🤖', 'xerbot']];

export function creerModes({ W = globalThis.window, prefs, ouvrir = () => {}, connait = () => false, source = 'https://xerboxion.org', chemin = '/home', vibrer = () => {} }) {
  const D = W.document, N = () => W.jOSNatif || {};
  const mode = () => (MODES.some(m => m[0] === (prefs.lire().mode || '')) ? prefs.lire().mode : 'chill-tekk');
  const appliquer = () => { for (const [m] of MODES) D.documentElement.classList.toggle('px-m-' + m, mode() === m); };
  appliquer(); prefs.surChangement(appliquer);
  const xb = { messages: [], maison: null, nfc: null, ble: null, wifi: null, lampe: false };

  // le labo : un ploxion qu'il ouvre s'ouvre ici (seulement depuis l'origine du labo)
  W.addEventListener('message', (e) => {
    if (e.origin !== source || !e.data || typeof e.data !== 'object') return;
    if (e.data.ploxi0n === 'ouvrir' && typeof e.data.id === 'string') ouvrir(e.data.id.slice(0, 80));
  });
  // XERB0T : le bus (les ploxions et la blouse y parlent) ; les derniers messages s'affichent
  try { if (W.jOSPorts && W.jOSPorts.on) W.jOSPorts.on('*', (p, topic) => { if (!/^ploxion\.xerbot\./.test(topic || '')) return; xb.messages.unshift({ le: Date.now(), port: topic.slice(15), p }); xb.messages.length = Math.min(xb.messages.length, 12); if (mode() === 'xerbot') rafraichir(); }); } catch (e) { /* */ }

  const puces = () => '<div class="px-modes" role="tablist">' + MODES.map(([k, i, n]) => '<button data-mode="' + k + '" class="' + (k === mode() ? 'on' : '') + '">' + i + ' ' + n + '</button>').join('') + '</div>';
  function panneauXerboxion() {
    if (W.navigator.onLine === false) return '<div class="px-mode-p"><p class="px-grave">⬡ xerboxion</p><p>L\'UI du labo demande le réseau. Hors ligne : ◇ chill-tekk.</p></div>';
    return '<div class="px-mode-p px-labo"><iframe title="xerboxion" src="' + esc(source + chemin) + '?app=ploxi0n" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; geolocation" referrerpolicy="origin"></iframe></div>';
  }
  const carte = (ic, titre, sous, actions) => '<div class="px-xb-c"><span class="ic">' + ic + '</span><span><b>' + esc(titre) + '</b><small>' + sous + '</small></span><span class="act">' + actions + '</span></div>';
  function panneauXerbot() {
    const m = xb.maison;
    return '<div class="px-mode-p px-xerbot"><p class="px-grave">🤖 XERB0T · le monde physique</p>'
      + carte('🥼', 'labo-cape', 'la blouse RS-7 : températures, consigne, LEDs', '<button data-xb="cape">ouvrir</button>')
      + carte('ᛒ', 'Bluetooth', xb.ble ? esc(xb.ble) : 'un capteur, un robot, une lampe…', '<button data-xb="ble">chercher</button>' + (connait('ultimate-bluetooth') ? '<button data-xb="ub">ultimate</button>' : ''))
      + carte('🏠', 'La maison', m == null ? 'HomeKit : tes accessoires' : m.length ? m.length + ' accessoire(s)' : 'aucun accessoire', '<button data-xb="maison">' + (m == null ? 'voir' : '↻') + '</button>')
      + (m && m.length ? '<div class="px-xb-maison">' + m.slice(0, 12).map(a => '<button data-xb-acc="' + esc(a.id) + '" class="' + (a.allume ? 'on' : '') + '"' + (a.basculable && a.joignable ? '' : ' disabled') + '>' + esc(a.nom) + '<small>' + esc(a.piece || a.maison || '') + '</small></button>').join('') + '</div>' : '')
      + carte('🔦', 'La lampe', xb.lampe ? 'allumée' : 'éteinte', '<button data-xb="lampe">' + (xb.lampe ? 'éteindre' : 'allumer') + '</button>')
      + carte('◉', 'NFC · les kions dans le réel', xb.nfc ? esc(xb.nfc) : 'lire un tag (un ploxion, un tsoin, un objet)', '<button data-xb="nfc">lire</button>')
      + carte('📶', 'Wi-Fi', xb.wifi ? esc(xb.wifi) : 'le réseau de la blouse, du robot, du boxion', '<button data-xb="wifi">voir</button>')
      + '<p class="px-grave">bus xerbot.cmd</p><div class="px-xb-bus"><input data-xb-cmd placeholder="une commande pour les robots (ex. avance 1m)" autocomplete="off"><button data-xb="envoyer">envoyer</button></div>'
      + '<pre class="px-cape-log">' + esc(xb.messages.map(x => new Date(x.le).toLocaleTimeString('fr-CH') + '  ' + x.port + ' ' + (typeof x.p === 'string' ? x.p : JSON.stringify(x.p))).join('\n') || 'rien encore : la blouse, ultimate-bluetooth et les robots y publient') + '</pre></div>';
  }
  function panneau() {
    const m = mode();
    return puces() + (m === 'xerboxion' ? panneauXerboxion() : m === 'xerbot' ? panneauXerbot() : '');
  }
  function rafraichir() { const p = D.querySelector('.px-accueil .px-mode-p.px-xerbot'); if (p) p.outerHTML = panneauXerbot(); }
  async function action(b) {
    const a = b.getAttribute('data-xb'), n = N();
    try {
      if (a === 'cape') return ouvrir('cape');
      if (a === 'ub') return ouvrir('ultimate-bluetooth');
      if (a === 'ble') { const d = await W.navigator.bluetooth.requestDevice({ acceptAllDevices: true }); xb.ble = (d.name || d.id) + ' · trouvé'; }
      if (a === 'maison') xb.maison = n.maison ? await n.maison.liste() : [];
      if (a === 'lampe') { const r = await n.lampe(!xb.lampe); xb.lampe = !!(r && r.allume); }
      if (a === 'nfc') { const l = await n.nfc.lire(); xb.nfc = l.map(r => r.texte || r.type).join(' · ') || 'tag vide'; }
      if (a === 'wifi') { const w = await n.wifiInfo(); xb.wifi = (w.ssid || 'pas de Wi-Fi') + (w.ip ? ' · ' + w.ip : ''); }
      if (a === 'envoyer') { const i = D.querySelector('[data-xb-cmd]'); const t = i && i.value.trim(); if (!t) return; if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('xerbot', 'cmd', t); i.value = ''; }
      vibrer('succes');
    } catch (e) { vibrer('erreur'); xb.messages.unshift({ le: Date.now(), port: '⚠', p: String((e && e.message) || e) }); }
    rafraichir();
  }
  /** les gestes du panneau (délégués : l'accueil est redessiné souvent) */
  function attacher(racine) {
    racine.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-mode')) { e.stopPropagation(); vibrer('selection'); prefs.regler({ mode: b.getAttribute('data-mode') }).then(() => W.ploxi0n && W.ploxi0n.routeur && W.ploxi0n.routeur.accueil()); return; }
      if (b.hasAttribute('data-xb')) { e.stopPropagation(); action(b); return; }
      if (b.hasAttribute('data-xb-acc')) { e.stopPropagation(); const id = b.getAttribute('data-xb-acc'); N().maison.basculer(id).then(r => { const a = (xb.maison || []).find(x => x.id === id); if (a) a.allume = r.allume; rafraichir(); }).catch(() => {}); }
    }, true);
  }
  return { panneau, attacher, mode, MODES };
}
