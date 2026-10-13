// 🧭 LE TUTO D'ACCUEIL (RS-7 12.10 : « quand on start l'app, un petit tuto onboarding pour un bref aperçu des features et des mouvements UI »).
// Des cartes chill-tekk, une idée par carte, avec sa vibration ; les boutons en bas (au pouce) ; glisser pour avancer. Une fois par version
// du tuto (boxion_local « reglages/onboarding » = { vu: VERSION_TUTO }) ; ⚙ › À propos › « revoir le tuto ».
export const VERSION_TUTO = 1;
const CARTES = [
  { ic: '◇', titre: 'Bienvenue dans ploxi0n', texte: 'Tes ploxions sur ton téléphone. Ils tournent même sans réseau ; connecté, ils parlent à ton boxion.', hap: 'motif:vague' },
  { ic: '▣', titre: 'Le dock, en bas', texte: 'Ton compte, 🎙 un vocal, tes ploxions épinglés et ⚙ les réglages. Tout se fait au pouce, comme une télécommande. En plein écran, la barre du haut est à toi : appui long dessus pour la composer.', hap: 'leger' },
  { ic: '☝', titre: 'Appui long', texte: 'Sur un ploxion de l\'accueil : épingler, déplacer vers une page, le mettre sur l\'écran d\'accueil de l\'iPhone, Face ID. Dans un ploxion : c\'est un clic droit.', hap: 'moyen', geste: 'appui' },
  { ic: '⇆', titre: 'Les bords', texte: 'Glisse depuis le bord gauche ou droit pour passer d\'une app à l\'autre. En haut, au milieu, en bas : trois gestes par bord. Les deux bords ensemble : portion.', hap: 'selection', geste: 'bords' },
  { ic: '▁', titre: 'Plusieurs ploxions à la fois', texte: '▁ minimise, ⧉ bascule, ‹ revient au ploxion d\'où tu viens. Ils restent vivants en arrière-plan ; l\'app fermée ou plantée, tu les retrouves (💤 dans ⧉).', hap: 'moyen' },
  { ic: '⧗', titre: 'Les tsoins', texte: '⧗ dans le dock (ou les deux bords, en bas) : note ce que tu fais, une idée, ton humeur — avec une photo, le lieu, un vocal. Le journal ⧗ les garde ; connecté, ils vont à ton boxion.', hap: 'succes' },
  { ic: '🛍', titre: 'Le marketplace', texte: 'Vitrine, grille, A–Z, découvrir en glissant. Les ploxions qui comptent sont ceux où le Nexus passe ses heures.', hap: 'leger' },
  { ic: '🎙', titre: 'La voix et le toucher', texte: '« Tell ploxi0n … » à Siri. Tes vocaux transcrits. Chaque ploxion a sa vibration d\'ouverture : à force, tu les reconnais sans regarder.', hap: 'motif:battement' },
  { ic: '👤', titre: 'Connecte-toi', texte: 'Avec ton compte labo.j0bot.ch (ou Apple : un compte bion). Tes ploxions retrouvent leurs données, tes fichiers et tes vidéos du boxion.', hap: 'succes', action: 'connecter' },
];

export function creerOnboarding({ W = globalThis.window, boxion, vibrer = () => {}, connecter = null }) {
  async function dejaVu() { const v = await boxion.get('reglages', 'onboarding').catch(() => null); return !!(v && v.vu >= VERSION_TUTO); }
  async function marquer() { await boxion.put('reglages', 'onboarding', { vu: VERSION_TUTO, le: new Date().toISOString() }).catch(() => {}); }
  function montrer() {
    const D = W.document, f = D.createElement('div'); f.className = 'px-tuto';
    let i = 0, x0 = null;
    const peindre = () => {
      const c = CARTES[i], dernier = i === CARTES.length - 1;
      f.innerHTML = '<div class="px-tuto-carte"><p class="px-grave">' + (i + 1) + ' / ' + CARTES.length + '</p><div class="px-tuto-ic">' + c.ic + '</div>'
        + (c.geste === 'bords' ? '<div class="px-tuto-bords"><i></i><i></i><i></i><b></b><b></b><b></b></div>' : c.geste === 'appui' ? '<div class="px-tuto-appui"><span class="px-ic" style="--t:265">◇</span><i></i></div>' : '')
        + '<h2>' + c.titre + '</h2><p>' + c.texte + '</p></div>'
        + '<div class="px-tuto-bas"><div class="px-points">' + CARTES.map((_, k) => '<span class="px-point' + (k === i ? ' on' : '') + '"></span>').join('') + '</div>'
        + '<div class="px-tuto-btn"><button data-t="passer">passer</button>' + (c.action === 'connecter' && connecter ? '<button data-t="connecter">se connecter</button>' : '')
        + '<button class="p" data-t="suivant">' + (dernier ? 'c\'est parti' : 'suivant') + '</button></div></div>';
      vibrer(c.hap);
    };
    const fin = async () => { await marquer(); f.remove(); };
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      const t = b.getAttribute('data-t');
      if (t === 'passer') return fin();
      if (t === 'connecter') { await fin(); return connecter(); }
      if (i < CARTES.length - 1) { i++; peindre(); } else fin();
    });
    f.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    f.addEventListener('pointerup', (e) => {
      if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
      if (dx < -60 && i < CARTES.length - 1) { i++; peindre(); } else if (dx > 60 && i > 0) { i--; peindre(); }
    });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    peindre();
  }
  return { montrer, async auDemarrage() { if (await dejaVu()) return false; montrer(); return true; }, CARTES };
}
