// ✦ LES NOUVEAUTÉS (RS-7 12.10 : « quand y a une update, on peut voir le changelog de ce qui a changé la première fois qu'on ouvre l'app »).
// Au premier lancement d'une nouvelle version : une feuille avec ce qui a changé DEPUIS la dernière version vue (plusieurs versions
// sautées → toutes, la plus récente en haut). boxion_local « reglages/version-vue » = la dernière version montrée. Un tout premier
// lancement n'affiche rien (le tuto d'accueil s'en charge) : la version est seulement notée. ⚙ › À propos › « Nouveautés » : tout l'historique.
// Une version = { v, titre, points: [texte] } ; à compléter à chaque version publiée (la plus récente en tête).
export const NOUVEAUTES = [
  { v: '0.51.0', titre: 'Les mini docks', points: [
    '▤ Tout se minimise en mini dock : un ploxion (▁), la musique (⏮ ⏯ ⏭), la blouse (température, consigne, ⏻), la Santé (les pas), la vidéo à reprendre, le vocal qui enregistre, le tsoin pas fini (touche à côté du composeur). Au-dessus du dock ; glisse-en un de côté pour le fermer.',
    '▤ La page de tous les mini docks : « ▤ +N » au-dessus du dock, ou ⧉ dans un ploxion — chacun avec ses actions, ✕, les 💤 de la dernière session, « tout fermer ». ⚙ › HUD et dock : combien au-dessus du dock.',
    '🎞 Stremio lit enfin dans le lecteur de l\'iPhone : branché sur le vrai bion du labo (jOSPlayer) — la reprise de Stremio, l\'épisode suivant à la fin, ses sous-titres, VLC d\'emblée pour un DTS/MKV.',
    '🎧 Spotify : installable dans l\'app (son code est pris dans sa page du labo), et l\'écran verrouillé suit quel que soit l\'ordre de chargement ; fermer le ploxion efface « à l\'écoute ». Les autres lecteurs du labo (jOSSound : music, le Lecteur) aussi.',
    '📶 Moins de données : un bion que le labo ne sert pas (une page d\'erreur de 3,5 Mo) n\'est plus redemandé à chaque installation.',
  ] },
  { v: '0.50.0', titre: 'La blouse, et trois modes', points: [
    '🥼 labo-cape : pilote la blouse RS-7 (Bluetooth) — températures, consigne (42 °C max), zones, LEDs, autonomie, journal, la session en tsoin. Sans blouse : la simulation, avec le vrai moteur de cape-core.',
    '◈ Trois modes en haut de l\'accueil : ◇ chill-tekk (tes ploxions), ⬡ xerboxion (l\'UI du labo, le dock par-dessus), 🤖 xerbot (le monde physique : la blouse, Bluetooth, la maison, la lampe, NFC, Wi-Fi, le bus des robots).',
  ] },
  { v: '0.49.0', titre: 'Le lecteur intégré', points: [
    '🎞 Un vrai lecteur dans l\'app : celui d\'Apple (PiP, AirPlay, écran verrouillé) et VLC en repli pour les MKV, le son DTS et les sous-titres. Stremio s\'en sert tout seul ; il reprend où tu t\'étais arrêté.',
    '🔇 Une vidéo sans son (AC3/DTS) ? Une bulle propose le lecteur natif. Les liens VLC, Infuse, Outplayer restent dans l\'app.',
    '📁 Envoyer vers (avec les fichiers), le visualiseur d\'iOS (PDF, Office, images, 3D…), zip et unzip, la galerie native, Plans, Mail, la lampe de poche — pour tous les ploxions.',
    '🎛 Les contrôles du Centre de contrôle (iOS 18) : noter un tsoin, un vocal, la lampe, ploxi0n.',
  ] },
  { v: '0.48.0', titre: 'À l\'écoute, et le cube', points: [
    '♫ L\'écran verrouillé dit enfin ce qui joue : titre, artistes, pochette, et ⏮ ⏯ ⏭ (au lieu de « Spotify Embedded Player » et ±10 s). Ça marche pour Spotify et pour tout ploxion qui renseigne la Media Session.',
    '♫ Un mini-lecteur au-dessus du dock, sur l\'accueil : ce qui joue en arrière-plan, ⏮ ⏯ ⏭ ; le toucher rouvre le ploxion.',
    '◈ Le widget Cube : six infos de tes bions (tsoins, musique, pas, ploxions…) sur un cube penché comme ton téléphone ; ⟲ pour le tourner. Dans ⚙ › Widgets, il suit le gyroscope en direct, et tu choisis ses faces.',
    '♫ Le widget À l\'écoute : la pochette, le titre, ⏮ ⏯ ⏭ ; aussi sur l\'écran verrouillé.',
  ] },
  { v: '0.47.0', titre: 'Le natif, partout', points: [
    '⚡ Tous tes ploxions deviennent natifs : vibrer (Taptic Engine), la position, les notifications, la dictée, les QR, le gyroscope, Bluetooth, NFC, garder l\'écran allumé, le partage et le presse-papiers passent par l\'iPhone. ⚙ › Natif les montre.',
    '🛠 Corrigé, enfin : Raccourcis et Siri (ouvrir un ploxion, noter un tsoin, « Dis à ploxi0n »), les widgets (épinglés, valeurs), Face ID, les notifications et Santé échouaient en silence sur l\'iPhone depuis le début.',
    '❤ Santé lit vraiment Apple Santé ; « ☁ envoyer » met un résumé (jamais les mesures brutes) sur ton boxion, pour le hub 🌸 Santé et tes autres appareils. Éteint par défaut.',
    '⚙ Les réglages, plus calmes : un accueil court, une page par catégorie, des sous-pages (gestes des bords, haptique).',
    '📐 Corrigé : avec le thème vivant, l\'accueil débordait sur le côté (la 5e colonne coupée, une barre verte à gauche).',
  ] },
  { v: '0.46.0', titre: 'Le natif, pour de vrai', points: [
    '🔌 Corrigé : les capacités natives de l\'app n\'étaient jamais branchées (gyroscope, météo, Shazam, Apple Music, HomeKit, Wi-Fi, Game Center, les vocaux). Le thème vivant bouge enfin.',
  ] },
  { v: '0.45.0', titre: 'Le vivant, partout', points: [
    '🌀 Le thème vivant suit le téléphone aussi dans les ploxions : la barre, les feuilles, les bulles flottent ; les ploxions reçoivent le mouvement (jOSNatif.mouvement, var(--mx)/--my).',
    '🩺 Si le gyroscope refuse : la raison s\'affiche dans ⚙ › Apparence › État du mouvement, et le capteur du navigateur prend le relais au premier toucher.',
  ] },
  { v: '0.44.0', titre: 'Le gel du démarrage, trouvé', points: [
    '🧊 Corrigé : depuis 0.37, si le gyroscope refusait de démarrer, le thème vivant tournait en rond sans fin et figeait toute l\'app au chargement (iPhone et iPad).',
  ] },
  { v: '0.43.0', titre: 'Quand le téléphone est plein', points: [
    '💾 Au lancement, l\'app mesure l\'espace libre ; sous 1,5 Go elle vide ses caches (jamais tes données). L\'espace libre s\'affiche au journal du chargement.',
  ] },
  { v: '0.42.0', titre: 'L\'app s\'ouvre toujours', points: [
    '🛟 Corrigé : le stockage du téléphone pouvait figer le démarrage. Chaque accès a maintenant un délai : l\'app s\'ouvre quoi qu\'il arrive (et le dit si le stockage a été lent).',
    '🧹 Le cache des réponses du serveur ne grossit plus sans fin (il gardait chaque sondage) ; il se range tout seul.',
  ] },
  { v: '0.41.0', titre: 'Tes données mobiles', points: [
    '📶 Corrigé : un ploxion caché (▁, ⧉) gardait ses vidéos en lecture, invisibles — et l\'app restait éveillée pour le son. Caché ou app fermée : les vidéos s\'arrêtent (ta musique continue).',
  ] },
  { v: '0.40.0', titre: 'Plus jamais coincé au démarrage', points: [
    '🛟 Si le chargement ne bouge plus pendant 6 s : il dit où il est bloqué, et propose recharger, mode sûr (sans les ajouts lourds), ou copier le journal.',
  ] },
  { v: '0.39.0', titre: 'Le démarrage ne bloque plus', points: [
    '🩹 Corrigé : l\'app pouvait rester bloquée à « les ploxions de base » sur un réseau faible (un fichier de l\'app partait sur internet, sans délai).',
  ] },
  { v: '0.38.0', titre: 'Un démarrage qui se raconte', points: [
    '◇ L\'écran de chargement : la barre fait le tour d\'un carré, chaque étape s\'inscrit au journal avec son temps, une astuce change en attendant.',
    '⚡ Plus rapide à ouvrir : l\'accueil ne relit plus chaque ploxion en entier, et l\'écran s\'en va dès que l\'accueil est là.',
    '⏱ ⚙ › À propos › Dernier démarrage : combien de temps, et ce qui a été le plus lent.',
  ] },
  { v: '0.37.0', titre: 'Le thème vivant', points: [
    '🌀 Le thème suit ton téléphone (gyroscope, accéléromètre) : le fond glisse, les icônes flottent et attrapent la lumière, les inscriptions se creusent.',
    '◉ Penche-le comme tu veux : l\'angle où tu le tiens devient le neutre. Un choc fait tressauter les icônes.',
    '⚙ › Apparence › Thème vivant pour l\'éteindre (Calme l\'éteint aussi).',
  ] },
  { v: '0.36.0', titre: 'Plus vif, plus vivant', points: [
    '⚡ Chaque bouton s\'enfonce sous le doigt ; l\'accueil se pose en cascade ; un ploxion s\'ouvre en montant ; les feuilles montent du bas. (⚙ › Apparence › Calme coupe tout.)',
    '⇄ Fusionner : ton Apple ID avait déjà son propre compte (un bion) ? 👤 › Lier mon Apple ID propose de le fondre dans ton compte — ses données sont copiées, rien n\'est effacé.',
    '❤ Le ploxion Santé de l\'iPhone s\'appelle « Santé iPhone » (🌸 Santé reste le hub du xerkion).',
  ] },
  { v: '0.35.0', titre: 'Ton dossier dans Fichiers', points: [
    '📁 L\'app Fichiers › Sur mon iPhone › ploxi0n : tes tsoins (un journal par mois), tes vocaux (le son et le texte), ton fond, tes ploxions.',
    '⇣ Le dossier Dépôt : glisses-y des fichiers depuis Fichiers, tes ploxions peuvent les lire.',
  ] },
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
