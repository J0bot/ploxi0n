// ✦ LES NOUVEAUTÉS (RS-7 12.10 : « quand y a une update, on peut voir le changelog de ce qui a changé la première fois qu'on ouvre l'app »).
// Au premier lancement d'une nouvelle version : une feuille avec ce qui a changé DEPUIS la dernière version vue (plusieurs versions
// sautées → toutes, la plus récente en haut). boxion_local « reglages/version-vue » = la dernière version montrée. Un tout premier
// lancement n'affiche rien (le tuto d'accueil s'en charge) : la version est seulement notée. ⚙ › À propos › « Nouveautés » : tout l'historique.
// Une version = { v, titre, points: [texte] } ; à compléter à chaque version publiée (la plus récente en tête).
export const NOUVEAUTES = [
  { v: '0.34.0', titre: 'Ton fond d\'écran', points: [
    '🖼 ⚙ › Apparence › Fond d\'écran : une photo (ou en prendre une), ou un motif gravé — grille, hexagones, points, courbes de niveau, cubes.',
    '◐ Assombrir et flouter la photo pour que tes ploxions restent lisibles ; sur l\'accueil seulement, ou partout.',
  ] },
  { v: '0.33.0', titre: 'Installer, voir, ranger', points: [
    '⬇ Un ploxion pas encore installé (depuis un xerkion, un lien, le marketplace) : une barre montre qu\'il s\'installe, bion par bion.',
    '📦 « Ploxions installés » : la place que chacun prend, ses bions (partagés ou à lui seul), ce que le retirer libère ; ranger les orphelins.',
    '◇ Un vrai écran de chargement à l\'ouverture.',
    ' Connecté avec xerboxion.org, lie ton Apple ID (👤 › Lier mon Apple ID) : ensuite, l\'un ou l\'autre ouvre le même compte.',
    '📶 Rejoindre un Wi-Fi d\'un geste, plus de mémoire pour les gros ploxions, les notifications de message.',
  ] },
  { v: '0.32.0', titre: 'Santé, et tes données du boxion pour de vrai', points: [
    '❤ Le ploxion Santé : pas, sommeil et ses phases, cœur, VFC, SpO₂, entraînements, et tes appareils (iPhone, montre…). Lu sur le téléphone, jamais envoyé.',
    '🔗 Corrigé : en mode connecté, l\'app ne lisait jamais ce que ton boxion contenait déjà. Tes zones, l\'historique de pourriture-4… reviennent.',
    '📖 Corrigé : le wiki (et calendar, notes, player…) s\'ouvrait sur une page blanche.',
    '🧭 xp › Vecteur marche dans l\'app : ton usage du téléphone + celui du web.',
    '⚡ L\'idle est synchronisé avec le web et avance quand l\'app est fermée.',
  ] },
  { v: '0.31.0', titre: 'Ce qui a changé, à l\'ouverture', points: [
    '✦ Cette feuille : à chaque mise à jour, ce qui a changé. Tout l\'historique : ⚙ › À propos › Nouveautés.',
    '🫧 Zone, Files, Word, Excel, PowerPoint, OneNote, Rockets, Contacts, Documents, Tâches, Finances, la veille… 33 ploxions qui manquaient sont dans le marketplace.',
  ] },
  { v: '0.30.0', titre: 'Tu reprends où tu en étais', points: [
    '💤 L\'app fermée ou plantée : le ploxion de devant revient, les autres dorment dans ⧉ et sous les bords.',
    '⧗ Les tsoins natifs : ⧗ dans le dock (ou les deux bords, en bas) — texte, dictée, photo, lieu, vocal. Le journal « Tsoins » les garde.',
    '▔ En plein écran, la barre du haut est à toi : heure, batterie, tsoins du jour… appui long dessus pour la composer.',
    '🧭 Un tuto d\'accueil (⚙ › À propos › revoir le tuto).',
    '🩹 Corrigé : le plantage à l\'ouverture (la copie vers les widgets tournait en boucle).',
  ] },
  { v: '0.29.0', titre: 'La boîte noire', points: [
    '⚠ Un plantage au lancement est signalé à l\'ouverture suivante, avec « envoyer à bother me ».',
    '🛟 Deux plantages d\'affilée : le mode sûr (clavier et widgets en pause) pour que l\'app s\'ouvre toujours.',
    '📲 Les icônes de l\'écran d\'accueil se connectent toutes seules (régénère le profil depuis l\'app, connecté).',
  ] },
  { v: '0.28.0', titre: 'Tes données du boxion', points: [
    '🔗 Connecté, jOSBoxion lit et écrit sur ton boxion (l\'historique de pourriture-4 revient) ; hors ligne, une copie et une file d\'envoi.',
    '🖼 Les images et les vidéos du boxion s\'affichent, dans le lecteur natif d\'iOS.',
    '📲 Une icône d\'écran d\'accueil peut ÊTRE le ploxion, tout seul, sans ouvrir ploxi0n.',
  ] },
  { v: '0.27.0', titre: 'Apple, partout', points: [
    ' Se connecter avec Apple (un compte bion).',
    '☁ WeatherKit, 🎵 MusicKit, ShazamKit, 🏠 HomeKit, 🎮 Game Center : dans jOSNatif pour tous les ploxions.',
    '🫧 Chaque ploxion a sa vibration d\'ouverture ; invente tes propres motifs (⚙ › Haptique).',
  ] },
  { v: '0.26.0', titre: 'La voix', points: [
    '🎙 Les vocaux, transcrits sur le téléphone, envoyables à pourriture-4 ou notés comme tsoin.',
    '🗣 « Tell ploxi0n … » à Siri, avec le vocabulaire du xerboxion.',
    '⌨ Le clavier d\'iOS à fond : dictée, mots de passe, codes SMS.',
  ] },
  { v: '0.25.0', titre: 'Les bords et la télécommande', points: [
    '⇆ Trois zones par bord, les deux bords ensemble (portion) : chaque geste se règle dans ⚙ › Navigation.',
    '☝ Appui long = menu sur l\'accueil, clic droit dans un ploxion.',
    '▣ Le dock en bas, tout au pouce.',
  ] },
];

const cmp = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function creerNouveautes({ W = globalThis.window, boxion, version, vibrer = () => {}, liste = NOUVEAUTES }) {
  const D = W.document;
  /** les versions plus récentes que « depuis » (exclu), jusqu'à la version de l'app (incluse) */
  const depuis = (vue) => liste.filter(n => (!vue || cmp(n.v, vue) > 0) && cmp(n.v, version) <= 0);
  function montrer(entrees, { tout = false } = {}) {
    if (!entrees.length) return null;
    const f = D.createElement('div'); f.className = 'px-voile px-nouveautes';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft">✦ ' + (tout ? 'toutes les nouveautés' : 'quoi de neuf · ploxi0n ' + esc(version.replace(/\.0$/, ''))) + '</p>'
      + '<div class="px-nv-liste">' + entrees.map(n => '<section><h3>' + esc(n.v.replace(/\.0$/, '')) + ' · ' + esc(n.titre) + '</h3><ul>'
        + n.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></section>').join('') + '</div>'
      + '<button class="p" data-nv>ok</button></div>';
    f.addEventListener('click', (e) => { if (e.target === f || e.target.closest('[data-nv]')) { f.remove(); vibrer('leger'); } });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    vibrer('motif:vague');
    return f;
  }
  return {
    depuis,
    /** au lancement : rien au tout premier (le tuto) ; après une mise à jour, ce qui a changé depuis la dernière version vue */
    async auDemarrage({ premierLancement = false } = {}) {
      const vue = await boxion.get('reglages', 'version-vue').catch(() => null);
      await boxion.put('reglages', 'version-vue', version).catch(() => {});
      if (premierLancement || (vue && cmp(vue, version) >= 0)) return null;
      // rien de noté (une installation d'avant cette feuille) : seulement la version qu'on vient d'installer
      return montrer(vue ? depuis(vue) : depuis(null).slice(0, 1));
    },
    tout: () => montrer(liste.filter(n => cmp(n.v, version) <= 0), { tout: true }),
  };
}
