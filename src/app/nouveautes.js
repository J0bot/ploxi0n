// ✦ LES NOUVEAUTÉS (RS-7 12.10 : « quand y a une update, on peut voir le changelog de ce qui a changé la première fois qu'on ouvre l'app »).
// Au premier lancement d'une nouvelle version : une feuille avec ce qui a changé DEPUIS la dernière version vue (plusieurs versions
// sautées → toutes, la plus récente en haut). boxion_local « reglages/version-vue » = la dernière version montrée. Un tout premier
// lancement n'affiche rien (le tuto d'accueil s'en charge) : la version est seulement notée. ⚙ › À propos › « Nouveautés » : tout l'historique.
// Une version = { v, titre, points: [texte | { t, essayer }] } ; à compléter à chaque version publiée (la plus récente en tête).
// (0.63, RS-7 : « au lieu de texte, un aperçu de la feature et son utilisation, directement montrée sur l'UI ; les changelogs c'est des
// tsoins, on peut aller en arrière et tester les features ; le jeu c'est le tuto ») un point peut se JOUER : ▶ essayer lance sa démo
// (src/app/demo.js : un doigt fantôme fait le geste pour de vrai), depuis la feuille du lancement comme depuis tout l'historique.
export const NOUVEAUTES = [
  { v: '0.99.65', titre: 'L\'écran, nettoyé', points: [
    '🧹 Le clavier ouvert, la bande des koins s\'efface : tout l\'écran pour écrire (coord, messages).',
    '🧹 Une feuille ouverte dans un ploxion passe devant la bande, son bas n\'est plus caché ; plus rien ne transparaît dans les coins.',
    '🧹 Le « ? » flottant du labo ne recouvre plus les boutons des ploxions en mode koin (ⓘ de la bande fait la même chose) ; l\'accueil commence plus haut.',
  ] },
  { v: '0.99.64', titre: 'Le ploxion Notifs', points: [
    '🔔 Un ploxion Notifs : toutes tes notifications au même endroit, par jour, celles de coord, de Proche, les push, et celles arrivées pendant que l\'app dormait.',
    '🔔 Choisis les mots à cacher (la notif disparaît, et ploxi0n ne la pose même plus) ou les seuls mots à voir.',
    '🔔 Un nouveau build installé s\'y note ; et le sujet « build » est prêt pour que le labo te prévienne dès qu\'il est sur TestFlight.',
  ] },
  { v: '0.99.63', titre: 'Le xer xerboxion, dans l\'app', points: [
    '⬡ Le mode xerboxion est maintenant dessiné dans l\'app : le chill-tekk du labo, cyan, sans attendre le serveur ni se reconnecter. Hors ligne aussi.',
    '⬡ Home · tes ploxions et ceux du labo · filtrer ; les onglets Bureau, Labo (tout le catalogue, un toucher l\'installe), Capteurs & bions (le natif de l\'iPhone), Quêtes, Xers.',
    '⬡ Les koins sont toujours là en xerboxion ; la page du labo reste à un toucher (Xers › le xer du labo, en ligne).',
  ] },
  { v: '0.99.62', titre: 'Le dézoom en 3 × 3', points: [
    '⊡ La vue des xers (le premier dézoom) montre neuf ploxions au lieu de cinq : le tien au milieu et les huit autour, diagonales comprises. Les cases sont carrées.',
    '⊡ Glisse en biais pour aller dans un coin ; d\'où tu viens reste toujours derrière toi.',
  ] },
  { v: '0.99.61', titre: 'Coord envoie, la bande s\'affine', points: [
    '🛰 Coord envoie de nouveau : le texte partait vide par le mode connecté (« rien à envoyer »). Les fichiers envoyés au labo (les photos vers ton boxion) passaient par le même trou : réparé aussi.',
    '🛰 Le verrou de coord se rouvre tout seul : il réessaie après quelques secondes, puis chaque minute, et quand tu reviens dans l\'app.',
    '▭ La bande des koins est plus fine, ses glyphes plus grands, sans le vide dessous ; la barre du haut se place dans les oreilles de l\'encoche, comme l\'heure d\'iOS.',
  ] },
  { v: '0.99.60', titre: 'La bande, barre d\'accueil', points: [
    '▭ Dans un ploxion, la case ◇ de la bande prend son glyphe, encadré : tu sais toujours où tu es.',
    '▭ Glisse vers le haut sur la bande pour minimiser, à droite pour le ploxion d\'avant, à gauche pour le suivant, comme la barre d\'accueil de l\'iPhone.',
    '▭ Le trait des koins et de la bande brille un peu, comme le koin du labo (rien en mode Calme).',
  ] },
  { v: '0.99.59', titre: 'La mini-carte, les fiches, Autour en direct', points: [
    '🗺 Le widget « Un ploxion » réglé sur mappion montre une vraie carte, sombre, avec tes zones autour (là où tu passes du temps, d\'après la veille) et toi au milieu.',
    '◈ Un ploxion qui ne publie rien montre sa fiche dans son widget : ce qu\'il fait, sa catégorie, ses bions. Les quatre xers se choisissent aussi : un toucher t\'y amène.',
    '◉ Autour › en direct : une activité sur l\'écran verrouillé avec les lieux les plus proches, si tu partages ta position, et le pote le plus proche, sa distance et sa direction.',
  ] },
  { v: '0.99.58', titre: 'Les boutons du Centre de contrôle, réparés', points: [
    '🎛 Les boutons de ploxi0n dans le Centre de contrôle ouvrent maintenant l\'app et font ce qu\'ils disent : tsoin, vocal, lampe, ploxi0n, Proche, balade, toilettes.',
    '◷ Un nouveau bouton, Veille : mappion te suit partout (tes lieux, tes pas, ta vitesse, ton allure : à pied, à vélo, en voiture), et tu l\'éteins d\'un geste.',
    '👣 La veille note aussi tes pas et l\'accéléromètre et le gyroscope pendant que tu bouges ; les ploxions peuvent relire tes pas et tes activités des 7 derniers jours.',
  ] },
  { v: '0.99.57', titre: 'Le koin du chill-tekk', points: [
    '▭ La bande entre les deux koins : toute la barre, toujours là. ‹ › pour revenir ou passer au ploxion suivant, ⧗ ○ △ □ ◇ ✕ ⓘ, et ▁ pour minimiser. Dans un ploxion, le ◇ s\'encadre.',
    '▣ Le koin ouvert : quatre cases en tunnel, un grand glyphe chacune. Le trion, l\'hypercube du xer, le wormion, le portion.',
  ] },
  { v: '0.99.56', titre: 'Plus aucun emoji', points: [
    '◇ Un emoji qu\'on ne connaît pas ne disparaît plus : il devient un glyphe du xerboxion, tiré de lui, toujours le même (une forme, un cœur, une couleur de xerkion).',
    '◇ Dans tous les ploxions maintenant, ceux du labo aussi. Ce que tu écris et ce qu\'on t\'envoie garde ses signes.',
    '◇ Un ploxion sans glyphe à lui reçoit le sien de la même façon, ici comme au labo.',
  ] },
  { v: '0.99.55', titre: 'Les koins partout', points: [
    '▭ En mode koin, la barre d\'un ploxion descend en bas, entre les deux koins : retour, son nom encadré, minimiser. Plus rien en haut, tout au pouce.',
    '▭ Sur l\'accueil, la même bande dit le xer où tu es ; un toucher ouvre le koin sur les xers.',
    '⬡ Le xer xerboxion ouvre maintenant le xer chill-tekk du labo. Ton chill-tekk à toi ne change pas.',
  ] },
  { v: '0.99.54', titre: 'Plus de prénoms', points: [
    '◉ Les voisins de démonstration et les exemples n\'ont plus de prénom : RS-3, RS-4, xerion-1, xerion-2. Les tiens, tu les choisis.',
  ] },
  { v: '0.99.53', titre: 'Les nœuds sur la carte', points: [
    '🗺 Proche › autour › les nœuds sur la carte : allume « garder », et ton téléphone note où il entend chaque nœud et la qualité du lien. Chaque nœud a sa zone, colorée selon sa vitesse de connexion (rapide, bon, moyen, lent). Ça reste sur ton téléphone, 30 jours, « effacer » vide tout.',
    '🗺 Un nœud fixe (un Pi, un ESP32 relais) peut dire où il est : il apparaît à sa place. Les nœuds reliés au xion sont entourés.',
  ] },
  { v: '0.99.52', titre: 'Le pokédex des animations', points: [
    '◫ Banc des animations › pokédex : toutes les animations que tu as jugées, en tuiles ; touche le verdict pour en ajouter ou en retirer, ▶ pour la revoir.',
    '⚙ Banc des animations › dans l\'app : par famille, choisis celle que l\'app utilise. Une ★ au swipe la choisit d\'office. Déjà branchées : ouvrir, fermer, la courbe, l\'arrivée sur l\'accueil.',
  ] },
  { v: '0.99.51', titre: 'Le banc des animations', points: [
    '🎞 Un nouveau ploxion, « Banc des animations » : 39 animations jouées en boucle dans un petit téléphone (ouvrir, fermer, passer d\'une app à l\'autre, le koin, les feuilles, changer de xer, l\'accueil, les courbes, le wormion). Swipe : ← non, → oui, ↑ c\'est celle-là.',
    '🎞 À la fin, « copier pour Claude » : tes choix, prêts à coller.',
  ] },
  { v: '0.99.50', titre: 'Coord dans l\'app', points: [
    '📡 Coord est dans l\'app d\'office : lire la flotte, écrire, glisser des fichiers, depuis le téléphone. Il faut être connecté au labo avec le compte admin (⚙ › Compte).',
  ] },
  { v: '0.99.49', titre: 'Le build iPhone repart, Android vérifié', points: [
    '🛠 Le build iPhone de la 0.99.48 s\'arrêtait sur les synonymes de Siri (une fonction d\'iOS 17, l\'app va jusqu\'à iOS 15) : corrigé.',
    '🤖 Sur Android, Proche passe par le Bluetooth (le maillage, RS-3, RS-4, les potes, la basse) ; le réglage « Piloter de la tête » ne s\'affiche plus là où il n\'existe pas.',
  ] },
  { v: '0.99.48', titre: 'Les ploxions sortent de leur icône', points: [
    '🔍 Touche une icône : le ploxion en sort et grandit jusqu\'à l\'écran, comme sur iPhone. ▁ Minimiser, ‹ ou l\'accueil : il rapetisse et rentre dans son icône.',
    '🔍 Si son icône n\'est pas à l\'écran, il s\'efface vers le milieu. « Réduire les animations » d\'iOS (ou ⚙ › Calme) : l\'ouverture directe.',
  ] },
  { v: '0.99.47', titre: 'Le koin qui s\'ouvre', points: [
    '◺ Un toucher sur un koin : il grandit et s\'ouvre en carré, le wormion et le portion apparaissent dedans. Glisse vers le haut : il suit ton doigt.',
    '○ Le wormion tourne avec ton doigt (un tunnel du temps) ; □ le portion part en couloir de cadres quand tu glisses.',
    '⊠ En mode koin, la case « ton xer » change de xer : organique, chill-tekk, xerboxion, xerbot. Appui long : mes xers.',
    '◇ Une nouvelle installation commence en chill-tekk, le plus simple pour prendre en main.',
  ] },
  { v: '0.99.46', titre: 'Piloter de la tête', points: [
    '👁 ⚙ › Piloter de la tête : la caméra de Face ID suit ta tête, un point se promène sur l\'écran. Le fixer un instant, ou cligner longtemps des deux yeux = toucher.',
    '👁 Le mode regard : c\'est ton regard qui pointe (calibré en suivant 4 points) ; un coup de tête à gauche ou à droite change de ploxion, secouer la tête minimise.',
    '👁 Aucune image gardée : seulement des angles, sur le moment. Les ploxions peuvent écouter tes gestes de tête (jOSRegard).',
  ] },
  { v: '0.99.45', titre: 'Les notifications qui parlent', points: [
    '↩ Un message privé de Proche : « Répondre » directement depuis la notification, la réponse part par le maillage. Ou « ✓ Lu ».',
    '◉ « RS-3 est tout près » : un pote ✦ qui revient à portée de Bluetooth. « ✓ remis » : ton message passé par un coursier est enfin arrivé.',
    '🔔 Les notifications du labo avec l\'avatar de qui t\'écrit, en grand, ou le glyphe du ploxion (avec la build « notifs »).',
  ] },
  { v: '0.99.44', titre: 'Siri parle xerboxion, et la tête ou le regard visent juste', points: [
    '🗣 « Open mappion in ploxion », « Open the ploxion Proche in xerboxion », « Ouvre le ploxion Autour dans ploxi0n » : Siri connaît tes ploxions et nos mots (map ion, mapion…), en anglais comme en français. Tous les ploxions, Proche et Autour compris.',
    '🗣 « ploxion » et « xerboxion » sont deux autres noms de l\'app pour Siri (ploxi0n, avec un zéro, se dit mal).',
    '♿ ⚙ › Grandes cibles : chaque bouton fait au moins 44 points, pour viser du regard, de la tête ou au contrôle de sélection d\'iOS. En « auto », ça s\'allume tout seul quand une de ces aides tourne.',
  ] },
  { v: '0.99.43', titre: 'La balade sur l\'écran verrouillé', points: [
    '🏝 Autour › 🏝 balade : le chrono, la distance et ta cible sur l\'écran verrouillé et la Dynamic Island, même l\'app fermée. Touche un lieu : la flèche et les mètres t\'y mènent ; « tu y es » à l\'arrivée.',
    '🏝 Proche › potes › la boussole › 🏝 écran verrouillé : vers un pote ou le rendez-vous.',
    '◉ Proche tient sur l\'écran verrouillé tant qu\'il tourne : tes voisins, maillé ou pas, les non-lus (jamais le texte d\'un message).',
    '🎛 Trois nouveaux boutons pour le Centre de contrôle (iOS 18) : Proche (allumé / éteint), Balade, Toilettes. Centre de contrôle › ＋ › ploxi0n.',
  ] },
  { v: '0.99.42', titre: 'Le maillage a un protocole public', points: [
    '🌐 Maille v1, le protocole de Proche, est écrit noir sur blanc (docs/protocole/MAILLE-v1.md) avec des vecteurs de test : n\'importe qui peut fabriquer un appareil qui entre dans le maillage, comme nœud (il relaie) ou comme client (il écoute et parle).',
    '🌐 Une implémentation de référence en C (pour un ESP32, un Pi, un PC) et un nœud ESP32 à flasher.',
    '🌐 Un appareil de demain qui invente un nouveau type de message est transporté par les téléphones d\'aujourd\'hui, sans rien perdre en route.',
  ] },
  { v: '0.99.41', titre: 'Proche sur Android', points: [
    '〰 Proche marche maintenant sur Android, en Bluetooth : entre deux Android, avec un iPhone (sa build « ble »), avec un Pi ou un PC (xb proche). Android demande l\'autorisation « Appareils à proximité » au premier lancement.',
  ] },
  { v: '0.99.40', titre: 'Les notifications de Proche', points: [
    '🔔 Un message privé ou une mention reçus dans Proche, quand Proche n\'est pas à l\'écran : une notification, même sans réseau. La toucher ouvre la conversation. ⚙ › Notifications › Proche pour la couper.',
    '🔔 Une notification reçue pendant que l\'app est ouverte reste aussi dans le centre de notifications.',
  ] },
  { v: '0.99.39', titre: 'Le rond en haut à droite, parti', points: [
    '◌ Le rond vide en haut à droite (le bouton de secours du HUD du labo, laissé par un ploxion) ne se pose plus sur l\'app.',
  ] },
  { v: '0.99.38', titre: 'Les messages arrivent même plus tard', points: [
    '✉ Un message privé qui n\'est pas arrivé repart tout seul (à chaque nouveau voisin, quand ton pote réapparaît), jusqu\'à l\'accusé ; après 24 h ou 8 essais, « ⚠ pas remis ».',
    '✉ Les coursiers, comme bitchat : un téléphone qui croise ton message pour quelqu\'un d\'absent l\'emporte (chiffré) et le lui remet quand il le croise. Proche › autour montre ce qui est en route.',
  ] },
  { v: '0.99.37', titre: 'La carte du maillage', points: [
    '◈ Proche › autour : la carte du maillage. Toi au centre, tes voisins directs autour, les autres plus loin ; un trait par lien. « Maillé » quand des nœuds sont reliés entre eux, pas seulement à toi.',
    '↝ Sous chaque voisin, les paquets qu\'il t\'a fait passer pour d\'autres : la preuve qu\'il route. Un relais qui ne s\'annonce pas (un Pi, un PC) apparaît aussi, en ◌.',
  ] },
  { v: '0.99.36', titre: 'Le maillage sans limite', points: [
    '〰 Proche relaie aussi loin que le maillage va : plus de limite à 7 sauts (255, l\'infini en pratique). Les boucles sont arrêtées par le dédoublonnage, et un message de plus de 72 h ne repart plus.',
  ] },
  { v: '0.99.35', titre: 'Proche, rangé ; ta carte de pote', points: [
    '◉ Proche en cinq pages : autour (qui est là, une ligne par personne), messages, potes (le radar, la boussole), son (la basse, le son partagé), ▣ carte.',
    '▣ Ta carte de pote : un QR avec ta clé et ton nom. Scanne celle d\'un pote en face de toi : il devient un pote ✦ vérifié, et vous pouvez vous écrire en privé, chiffré, avant même d\'être reliés. La caméra de l\'iPhone sur le QR ouvre aussi Proche.',
  ] },
  { v: '0.99.34', titre: 'Spotify, un vrai xer', points: [
    '🎧 Spotify sur le téléphone : tes playlists en grandes pochettes, une recherche, une playlist qui s\'ouvre en plein écran avec « tout jouer ».',
    '🎧 Le lecteur flotte au-dessus des koins ; touche-le pour la vue « en lecture » : la grande pochette, la barre de temps, les gros boutons, le tsoin.',
  ] },
  { v: '0.99.33', titre: 'Ton téléphone, un appareil xb', points: [
    '▸ Appareil xb : appaire ton téléphone à ton labo (un code à approuver, une fois) et allume l\'agent. Il apparaît dans ◈ appareils et dans le terminal xb, comme un Pi.',
    '▸ Depuis le labo : xb ouvrir <ploxion>, xb mode kiosque <url> (plein écran), xb scanner (le Bluetooth autour), xb notifier, xb infos. Le téléphone refuse tout le reste, et le journal montre ce qu\'il a fait.',
  ] },
  { v: '0.99.32', titre: 'ploxion sur Android, comme écran d\'accueil', points: [
    '⌂ ploxion arrive sur Android, et il peut devenir l\'écran d\'accueil du téléphone : Applis › « en faire l\'écran d\'accueil ». Le bouton maison ramène au xer, le bouton retour ferme le ploxion ouvert.',
    '⌂ Le ploxion Applis (Android) : toutes les applis du téléphone, à chercher et à ouvrir depuis le xer ; appui long = ses réglages.',
  ] },
  { v: '0.99.31', titre: 'ploxi0n dans la voiture', points: [
    '◫ CarPlay est prêt : tes potes (au nord-est, à 1,2 km ; toucher = l\'itinéraire dans Plans, sur l\'écran de la voiture) et les ambiances. Il arrive dès qu\'Apple donne son autorisation CarPlay.',
  ] },
  { v: '0.99.30', titre: 'La veille, les ondes, LedFx', points: [
    '◷ La veille en arrière-plan : ta position, même app fermée (les visites d\'iOS, presque rien pour la batterie, et un point tous les 5 m quand tu bouges). Mappion compte où tu passes du temps et crée tes zones. Elle reste sur ton téléphone.',
    'ᛒ Autour › les ondes : tout ce qui émet en Bluetooth autour de toi, du plus proche au plus loin, avec la distance estimée et le fabricant (montres, écouteurs, ESP32…).',
    '◉ Proche s\'annonce en Bluetooth : tu vois les autres ploxis à portée, et à quelle distance, avant même d\'être connectés.',
    '◈ XERB0T : LedFx (ses écrans virtuels, ses effets, ses scènes) et, pour une lumière ESPHome, sa couleur et ses effets.',
  ] },
  { v: '0.99.29', titre: 'Retrouver tes potes, mieux', points: [
    '◫ Proche › mes potes › « ⤓ garder la carte du coin » : avec du réseau, avant la soirée ; ensuite la carte s\'affiche même sans connexion.',
    '◎ Un rendez-vous là où tu es : il part avec ta position, chiffré, à tes potes ✦ ; un losange sur leur radar, et leur boussole t\'y mène.',
    '≋ La boussole : l\'aiguille ne tremble plus, « guidé aux vibrations » tique quand tu marches dans la bonne direction (plus vite en approchant), le temps à pied, « tu te rapproches ».',
    '⌖ Le radar : les derniers pas de chaque pote en pointillés ; ＋ − pour zoomer à la main, « auto » pour revenir.',
  ] },
  { v: '0.99.28', titre: 'Les notifications', points: [
    '◉ ⚙ › Notifications › « Même app fermée » : le jeton de ton iPhone est gardé même si le labo ne répond pas encore, et tu peux le copier pour un envoi de test.',
  ] },
  { v: '0.99.27', titre: 'Rien ne sort de l\'écran', points: [
    '▭ Tout l\'écran vérifié, à chaque taille, sur un iPhone SE, 15 et Pro Max, couché aussi : plus rien ne déborde ni ne se cache sous l\'encoche ou la barre d\'accueil.',
    '◈ Le dock ne déborde plus : ton nom se raccourcit (…) au lieu de pousser les boutons hors de l\'écran.',
    '▤ Une feuille plus haute que l\'écran (le tuto, en grand) défile au lieu de sortir par le haut ; les barres du bas des réglages et du marketplace laissent la place de la barre d\'accueil.',
    '↻ Couché, les ploxions, le dock et les mini docks évitent l\'encoche ; le synthé ne garde plus ses motifs sous le bord.',
  ] },
  { v: '0.99.26', titre: 'Le bord droit revient', points: [
    '⇆ Le bord droit répond de nouveau (l\'app suivante, l\'accueil en bas, chercher en haut) : avec la taille « grande », il était posé hors de l\'écran, comme ▤ et la fin du dock.',
    '▭ Les pages ne glissent plus de côté (les réglages, les menus décalés à gauche) : la taille de tout agrandit la page comme une vraie page mobile.',
    '◎ Le koin de droite revient (il était hors de l\'écran, comme le bord droit) ; le wormion, la portion, la map et le synthé vibrent à chaque cran (leur cran n\'existait pas dans le moteur haptique).',
  ] },
  { v: '0.99.25', titre: 'La map tient sous les doigts', points: [
    '◎ Pincer la map : ce qui est sous tes doigts y reste (avant, le zoom partait ailleurs, trop grand ou trop petit). Lâché, dézoomé, elle revient au centre ; zoomé, jamais de bord vide.',
    '▭ La page ne glisse plus de côté (l\'en-tête et la map décalés à gauche) ; un appui long sur un koin ne part plus au milieu d\'un pincement.',
    '◈ ⚙ › À propos › Diagnostic de l\'écran dit aussi si la vue est décalée ou zoomée, et ce qui peint du rouge (le rond rouge flou : envoie-moi le relevé).',
  ] },
  { v: '0.99.24', titre: 'Le banc des nouveaux bions', points: [
    '◇ Le banc iPhone › « ▶ les nouveaux bions, tout » : le maillage chiffré, les morceaux du Bluetooth, les potes (GPS, boussole, carte), Proche en vrai (15 s, avec un 2e iPhone à côté), le synthé, le cœur Rust, le bord vivant, les langues, le marketplace. Puis « copier » : le log, sans aucune position.',
    '! Une erreur du banc se voit enfin (son signe était effacé).',
  ] },
  { v: '0.99.23', titre: 'Tout vérifié', points: [
    '✓ Le marketplace dit, pour chaque ploxion du labo, s\'il s\'ouvre sur l\'iPhone (testé un par un, avec ses vrais bions), ou ce qu\'il attend.',
    'Aa L\'app parle anglais, allemand, italien et espagnol sur tous ses écrans (Proche, le synthé, l\'atelier, le système, le passé, tes xers…), et les demandes d\'autorisation d\'iOS aussi.',
    '◉ VoiceOver sait dire chaque bouton (les glyphes de Proche : « envoyer : cœur »).',
    '◌ Le bord vivant devient orange et étouffe quand l\'iPhone n\'a presque plus de place (sous 1,5 Go).',
    '≈ Proche peut passer par le Bluetooth basse consommation, comme bitchat (une option de build, pour l\'instant) : les messages traversent même Wi-Fi coupé.',
  ] },
  { v: '0.99.22', titre: 'Retrouver tes potes', points: [
    { t: '⌖ Proche › mes potes : partage ta position avec tes potes ✦ ou dans un salon fermé (chiffrée, 1 h, 4 h ou jusqu\'à ce que tu arrêtes). Le radar les montre autour de toi, même sans connexion ; touche un pote : une boussole te mène à lui. Avec du réseau, la carte s\'affiche dessous.', essayer: 'proche' },
    '✦ Les potes (/fav @nom) : ce qui leur est envoyé les attend 72 h dans le maillage.',
    '◉ Les messages privés disent quand ils sont lus ; le code de sécurité d\'une conversation se compare en vrai (/code @nom).',
    '@ Quelqu\'un écrit @ton nom dans un salon : ça vibre.',
  ] },
  { v: '0.99.21', titre: 'Le maillage, et un max de psy', points: [
    { t: '〰 Proche devient un maillage, comme bitchat : les messages sautent de téléphone en téléphone (jusqu\'à 7 sauts), attendent ceux qui arrivent après ; des salons # (avec un mot de passe si tu veux) ; les messages privés chiffrés de bout en bout, avec l\'accusé ✓✓ ; /j #salon, /m @nom, /w ; trois touchers sur « ◉ proche » effacent tout.', essayer: 'proche' },
    { t: '≋ Le synthé : psytrance, tribe, acidcore, mentalcore (le son, le motif, la gamme, le tempo jusqu\'à 240) et un kick sur les temps.', essayer: 'synthe' },
    '↗ Partager un son : dans Proche (il voyage avec le message, l\'autre le joue d\'un toucher), ou par un code à coller.',
    'Aa Ta police habille le xer ; les ploxions du labo gardent la leur (⚙ › Apparence pour la mettre partout).',
    '🫧 Finances, stock, contacts, tâches… s\'ouvrent tout de suite : une zone « chez moi » quand tu n\'en as pas.',
    '⧉ Un bion déjà là n\'est plus jamais relu ni relancé quand un autre ploxion le compose.',
  ] },
  { v: '0.99.20', titre: 'Des ploxions qui s\'ouvrent', points: [
    '▦ Tes ploxions sur la map remplissent l\'écran : pincer change le nombre de colonnes (plus de petite grille perdue au milieu).',
    '◬ Les moteurs 3D du labo (moteur, doomion, monde-os, scan-reel…) s\'ouvrent : leur bion jOS3D n\'était jamais installé. Tes ploxions déjà là sont réparés en douceur, quelques-uns à chaque lancement.',
    '⧗ Le ploxion tsoin s\'ouvre et enregistre pour de vrai (● tsoin, ■ arrêter : tes sessions sont gardées).',
    '⧉ chill, daron, zbeul (et tout ploxion qui en monte un autre) s\'ouvrent.',
    '〰 En peau pleine, les membranes suivent leurs cellules (elles restaient parfois à côté).',
  ] },
  { v: '0.99.19', titre: 'Plus grand, plus léger', points: [
    '◈ La peau légère par défaut : les couleurs de ta peau sans les membranes ondulées, qui faisaient ramer. ⚙ › Apparence › La peau : légère, auto (légère en économie d\'énergie), pleine.',
    '◈ Changer de peau marche pour de vrai (les membranes ne restaient plus vides sur l\'iPhone).',
    'Aa La taille de tout : grande par défaut, et ⚙ › Apparence › Taille de tout (normale, grande, très grande, énorme).',
    '⬇ Les bibliothèques des ploxions (three.js, xlsx, pdf-lib, qrcode…) sont dans l\'app : plus besoin du réseau pour qu\'ils s\'ouvrent.',
    '▭ Les boutons des modes ne débordent plus sur les petits écrans.',
  ] },
  { v: '0.99.18', titre: 'Des bugs en moins', points: [
    '◈ La map dézoomée montre tout son voisinage, plus de hubs coupés net.',
    '▦ L\'atelier des peaux ne déborde plus à droite ; plus aucune page ne glisse de côté. Les onglets des ploxions du labo ne sont plus tronqués.',
    '◎ ⚙ › À propos › Diagnostic de l\'écran : ce qui flotte, ce qui est incliné, ce qui déborde (« dans 5 s » pour aller sur l\'écran qui cloche), à copier. « c\'est quoi ça ? » dit d\'où vient ce qu\'il ne connaît pas.',
  ] },
  { v: '0.99.17', titre: 'Plus léger, et le début du Rust', points: [
    '⚡ Avec beaucoup de ploxions : les réglages et la map ne relisent plus le code entier de chaque ploxion. Pendant un tour de l\'app, plus aucun ploxion n\'est relu à travers le pont natif.',
    '🦀 Le cœur de l\'app en Rust commence (la basse partagée, Autour, les langues), prouvé identique au JS, et le digesteur des ploxions : la route vers « tout natif ».',
  ] },
  { v: '0.99.16', titre: 'Le pas à pas', points: [
    '⊞ Synthé › « à moi » : 16 pas, 8 notes de la gamme. Touche une case : la note est posée (et tu l\'entends). ▷ la boucle la joue, la colonne qui joue s\'allume.',
    '⇣ partir du motif, ⁂ hasard, ∅ effacer. Gardé pour la prochaine fois ; « dans Proche », toute la salle joue ton pas à pas.',
  ] },
  { v: '0.99.15', titre: 'Autour : la boussole et les trottinettes', points: [
    '⌖ Les flèches tournent avec toi : tiens l\'iPhone devant toi, la flèche montre où aller.',
    '⋈ En Suisse, les trottinettes et les vélos libres en direct (sharedmobility.ch) : la plus proche en un geste, sous les toilettes.',
  ] },
  { v: '0.99.14', titre: 'Toutes les langues (le début)', points: [
    '⟡ ⚙ › Apparence › Langue : auto (celle de l\'iPhone), français, English, Deutsch, italiano, español. Ça change tout de suite, sans relancer.',
    '⟡ Traduits d\'abord : l\'accueil et la map, les réglages, le marketplace, Autour, Proche. Les mots du xerboxion (ploxion, bion, koin, tsoin…) restent tels quels.',
  ] },
  { v: '0.99.13', titre: 'Couché, partout', points: [
    '⟷ L\'iPhone couché : les réglages et le marketplace gardent la recherche dans une colonne à gauche, le reste à droite (les réglages sur deux colonnes).',
    '⟷ Les ambiances, le système, Proche, inviter, l\'atelier des peaux se rangent en colonnes au lieu de défiler.',
  ] },
  { v: '0.99.12', titre: 'Le drone dans XERB0T', points: [
    '◬ XERB0T › ＋ ajouter › « drone (MAVLink · mavlink2rest) » : son état (armé, mode, batterie, GPS, position, altitude, vitesse).',
    '⌂ « revenir » et ↓ « atterrir » seulement, toujours avec « sûr ? ». Pas de décollage depuis l\'app : le premier palier, c\'est la sécurité.',
  ] },
  { v: '0.99.11', titre: 'Le téléphone vivant', points: [
    '◌ Dans l\'organique, le bord de l\'écran respire : plus vite quand l\'iPhone chauffe, plus pâle quand la batterie baisse, bleuté en charge ; il bat avec le son du synthé. Il dort en économie d\'énergie.',
    '⚙ › Apparence › « Le téléphone vivant » pour l\'éteindre.',
  ] },
  { v: '0.99.10', titre: 'Le synthé à plusieurs, et penché', points: [
    '◉ « dans Proche » : ton son part chez tous ceux de la salle ; chaque knob que tu tords, ils l\'entendent.',
    '⟲ « pencher » : incline l\'iPhone, deux knobs tournent (coupure × résonance, ou une autre paire au toucher).',
    '≋ Le synthé continue écran verrouillé.',
  ] },
  { v: '0.99.9', titre: 'Autour de toi', points: [
    '⌖ Autour : ce qu\'il y a autour de toi, du plus proche au plus loin (OpenStreetMap) : cafés, bars, restos, eau, art, points de vue, parcs, vélos…',
    'WC Les toilettes les plus proches, en un geste. Touche un lieu : Plans t\'y emmène à pied.',
    '◉ « Suivre en marchant » : la liste se refait quand tu bouges. ◈ Des propositions selon l\'heure et tes ploxions. ＋ « Poser ici » : tes lieux à toi.',
    '◇ Ta position ne part pas : seulement le centre d\'une case d\'un kilomètre.',
  ] },
  { v: '0.99.8', titre: 'Le mode humain', points: [
    '⊙ ⚙ › Apparence › L\'écriture › humain : zéro texte. Des glyphes, et des maths : 8◇ · 4⊡ (koins · portails), Δt −2 d (il y a deux jours), ∀t (tout le temps), →3 · 2→ (entrées · sorties), ∅ (rien). Lisible dans toutes les langues.',
  ] },
  { v: '0.99.7', titre: 'Les koins gobent les coins', points: [
    '◺◿ Les koins sont collés aux coins de l\'écran, plus grands : l\'arrondi de l\'iPhone les découpe.',
  ] },
  { v: '0.99.6', titre: 'L\'app ne gèle plus à l\'ouverture', points: [
    '◇ Avec beaucoup de ploxions installés, l\'app relisait et réécrivait chacun d\'eux en entier au démarrage : elle gelait. Elle se contente maintenant de leur fiche légère.',
    '⬡ La réparation des bions se fait en douceur, quelques ploxions à la fois, et attend quand le labo dit « trop de requêtes ».',
  ] },
  { v: '0.99.5', titre: 'Tordre les knobs, et le paysage', points: [
    '◎ Les knobs se tordent avec les doigts : un doigt qui tourne autour, deux doigts qui tordent, un doigt au centre qui glisse ; appuyé, il grossit ; deux touchers le remettent au départ ; chaque cran vibre.',
    '≋ Le synthé a 33 knobs : deux ondes et leur intervalle, bruit, octave, transposition, glisse, type de filtre, onde du lfo, vibrato, trémolo, saturation, réverb et sa taille, stéréo, swing, durée.',
    '⟷ Couche ton iPhone : l\'accueil, la map et le synthé se mettent en paysage.',
    '⬡ Zoome sur un ploxion : son cœur (son propre bion) et tous les bions qu\'il touche ; zoome encore, un bion montre les siens.',
    '↻ Les mises à jour lisent le changelog du labo : un ploxion qui n\'a pas changé n\'est plus retéléchargé (une seule requête au lieu de tous les ploxions).',
  ] },
  { v: '0.99.4', titre: 'Le synthé : du son avec des knobs', points: [
    '≋ Synthé : 17 knobs (la source, le filtre, l\'enveloppe, le mouvement, l\'espace, la sortie). Tourne-les : le son change en direct, même d\'une note tenue.',
    '◇ 16 pads dans la gamme (mineur, majeur, phrygien, penta), plusieurs doigts à la fois ; un oscilloscope montre le son.',
    '▷ La boucle : les motifs de la basse de Proche (pulse, roule, tekk, marche, dub), au tempo du knob.',
    '◈ Des sons tout prêts (basse tekk, nappe, acide, cloche, brume), ⁂ hasard, et « ＋ garder » pour les tiens.',
  ] },
  { v: '0.99.3', titre: 'Les ploxions qui ne s\'installaient pas', points: [
    '⬇ Musique, Agora, Calendrier, Le chemin, RAM, YouTube Music, Installer, le système des RS s\'installent enfin : l\'app ne savait pas lire leur page.',
    '⬡ Quand le labo dit « trop de requêtes », l\'app patiente et réessaie au lieu d\'oublier le bion pendant 7 jours. Au prochain lancement, les ploxions installés récupèrent les bions qui leur manquaient.',
    '◎ Ouvrir un bion (les étapes du Chemin : jOSChemin, jOSForge…) montre son neurone sur la map, au lieu d\'une installation ratée.',
  ] },
  { v: '0.99.2', titre: 'La map tient en place, et se lit', points: [
    '◈ L\'accueil de l\'organique ne glisse plus de côté ni en bas : la map est fixe, elle prend tout l\'écran.',
    '◇ Plus lisible sur ton fond : un voile sombre derrière la map, des noms plus grands et plus clairs (sur deux lignes), les hubs voisins moins effacés.',
    '✻ La règle du zoom en ronds : ✻ fige, ∿ libre, ≡ paliers ; la réglette du temps passe entre les deux koins du bas.',
  ] },
  { v: '0.99.1', titre: 'Proche : l\'ultimate Bluetooth', points: [
    '◉ Proche : les téléphones autour de toi, sans internet. Choisis un nom et une salle, démarre : ceux de la même salle apparaissent.',
    '≡ Des messages, ou des glyphes d\'un geste (◉ ○ △ ♡ → ? !) : lisibles dans toutes les langues.',
    '∿ Héberge une basse : tempo, motif, grave ou aigu. Les autres la rejoignent et la jouent eux-mêmes, calés sur ton horloge. Plus il y a de téléphones, plus ça cogne.',
    '▷ Ou un son (une adresse https) : chacun joue sa copie au même moment, et se recale s\'il dérive. Rien ne joue chez quelqu\'un sans son « rejoindre ».',
  ] },
  { v: '0.99.0', titre: 'Le zoom libre, ou tes paliers', points: [
    '◈ Sur la map, pincer agrandit sous tes doigts, en continu ; au-delà, tu plonges dans ce qui est dessous, en deçà tu recules d\'un palier.',
    '✎ L\'écriture suit le zoom : de loin le glyphe seul, au milieu les deux, de près le texte, en ChillTekk.',
    '✻ (à droite) garde ce zoom comme un palier à toi (1, 2…, touche pour y revenir). ∿ → ≡ : le pincer saute d\'un palier figé au suivant au lieu de zoomer librement.',
  ] },
  { v: '0.98.0', titre: 'Une seule map, tout est fractal', points: [
    '◈ Dans l\'organique, l\'accueil EST la map. Pince pour changer de palier (la règle à droite) : tes ploxions, le réseau des hubs, un hub, un ploxion, un bion.',
    '⇄ Le neurone d\'un ploxion (appui long sur un koin) : ce qui entre, ce qui sort, ses bions dedans, et ses synapses vers les autres ploxions qui partagent un canal. Touche un bion : le sien.',
  ] },
  { v: '0.97.0', titre: 'Le zoom de temps, le zoom de fractale', points: [
    '○ Le passé (le wormion des koins) : tout ce que tu as fait, à l\'envers. Pince pour zoomer dans le temps : les heures, les jours, les semaines, les mois. Touche un ploxion pour y revenir. Et ton xer qui change : « revenir à cet instant ».',
    '⎇ Les portées : les miens, le nexus (les commits), les ultra (les paliers d\'existence, depuis la 0.10), le xerboxion.',
    '▦ La map en 3 × 3 : les coins aussi, un glisser en biais y va. Chaque koin dit quand il a servi ; la réglette du wormion allume ce que tu as ouvert il y a deux semaines.',
    '✎ La police ChillTekk, notre alphabet : O le chaos, I l\'observateur et son œil, A un koin. Et l\'écriture : xerboxion, texte + glyphes, glyphes, texte, emoji, minimal.',
    '◺◿ Dans l\'organique, plus de dock : les koins.',
  ] },
  { v: '0.96.0', titre: 'L\'atelier des peaux : la fractale des UI', points: [
    '◈ L\'atelier des peaux (⚙ › Apparence) : neuf peaux autour de la tienne ; touche celle qui te parle, tu zoomes dedans ; ⊖ dézoome, hasard saute ailleurs. Les knobs tournent la peau gène par gène, et toute l\'app suit. ✓ garder : elle est à toi.',
    '〰 Un troisième lot de peaux : gothique, evangelion, eldritch.',
  ] },
  { v: '0.95.0', titre: 'Seize peaux, un guide', points: [
    '〰 L\'organique a seize peaux : nerfs, vaisseaux, câbles, gelée, terminal ; et les aliens : xéno (Giger), cyberpunk, cyberglysm, tribal tekkno, mycélium, abysses, portail, cristal… ⚙ › Apparence › L\'organique : essaie-les en direct.',
    '🧭 Un nouveau guide : quatre gestes, sur la vraie interface. Et ⓘ « c\'est quoi ça ? » dans la barre des koins : touche n\'importe quoi, l\'app te dit ce que c\'est.',
    '◇ Tous les ploxions prennent l\'organique : leurs bords, leurs boutons, la barre du haut.',
  ] },
  { v: '0.94.0', titre: 'Le xer organique', points: [
    '〰 Le nouveau mode de base : organique. Des membranes qui luisent, vert et violet, des gouttes aux coins, des cellules reliées comme des neurones.',
    '◇ Le chill-tekk d\'avant est gardé tel qu\'il était : en haut de l\'accueil, ou dans § mes xers (« chill-tekk »).',
  ] },
  { v: '0.93.0', titre: 'Les bords organiques, les neurones', points: [
    '〰 Les bords sont plus épais et ondulent doucement, comme une membrane.',
    '🧠 Les éléments voisins se collent comme des neurones : leurs membranes se rejoignent par des synapses. Les cases des koins et leur barre, les hubs de la map (collés par leurs portails) et leurs koins autour du centre, les plaques du système, les ambiances.',
    '⚙ › Apparence › Bords organiques : coupé, les plaques d\'avant reviennent.',
  ] },
  { v: '0.92.0', titre: 'L\'allure chill-tekk, le wormion et le portion en trackpads', points: [
    '○ Le wormion des koins est un trackpad : tourne le doigt autour de son centre, il remonte ce que tu avais ouvert, un cran tous les 30° ; lâche pour l\'ouvrir. Un simple toucher : le temps, comme avant.',
    '□ Le portion aussi : glisse ← l\'app d\'avant, → l\'app d\'après, ↑ dézoomer vers la map, ↓ l\'accueil. Tu sens le grain sous le pouce ; il dit ce qui va se passer avant que tu lâches.',
    '◇ La bande, le système, les ambiances (le son qui joue s\'allume), les koins et la map prennent l\'allure chill-tekk du xerboxion : plaques, creux, filets, mono.',
  ] },
  { v: '0.91.0', titre: 'L\'écran verrouillé, les widgets, les notifications', points: [
    '🏝 Activités en direct : ☾ dodo affiche le chrono de ta nuit sur l\'écran verrouillé et la Dynamic Island, jusqu\'au réveil ; un vocal qui enregistre ; le minuteur des ambiances. Les ploxions peuvent aussi en lancer.',
    '▦ Le widget « Un ploxion » : sur l\'écran d\'accueil, choisis un ploxion (appui long › Modifier) ; il montre ce qu\'il publie, une valeur, une courbe, un bouton. Le journal y met tes tsoins du jour.',
    '🔔 ⚙ › Notifications › Même app fermée : tes notifications arrivent même quand ploxi0n est fermé (dès que le labo les envoie). Choisis les sujets : coord, messages, bother, ploxions.',
  ] },
  { v: '0.90.0', titre: 'La map, en carrés', points: [
    '▦ La map du xerboxion dans l\'app : les hubs du labo, en carrés. Le hub où tu es au centre, son glyphe et ses koins ; ses voisins dépassent des bords. Glisse pour y aller, ‹ pour revenir sur tes pas, touche un koin pour l\'ouvrir.',
    '＋ Crée tes hubs : un nom, un glyphe, tes ploxions comme koins, le côté où il se pose. Ils vont dans le même rangement que la map du labo : connecté, tu les retrouves là-bas.',
    '□ Le portion des koins et le geste « la map » des bords y mènent. Hors ligne, la dernière map revient.',
  ] },
  { v: '0.89.0', titre: 'Les koins du carnet', points: [
    '◇ Les glyphes du lexique sont ceux du carnet de RS-7 : xeroction, tsoin, wormion, trion, portion, ploxion, et le xer.',
    '◺◿ ⚙ › HUD et dock › Les koins (prototype) : deux koins dans les coins du bas remplacent le dock et la barre. Touche-les : ils grandissent, jusqu\'à deux carrés de deux cases et la barre des glyphes.',
  ] },
  { v: '0.88.0', titre: 'Le système et les ambiances', points: [
    '▤ Système (façon btop) : la fluidité de l\'app, sa mémoire, le disque, la batterie, l\'état thermique, le mode économie, le réseau et la latence jusqu\'au labo, tes ploxions vivants. Et le xerminal du labo à un toucher.',
    '≈ Ambiances (façon Blanket) : pluie, vent, vagues, feu, orage, ruisseau, bruits rose et brun. Mélange-les ; ils continuent pendant que tu fais autre chose, avec un minuteur. Fabriqués sur place : hors ligne, rien à télécharger.',
  ] },
  { v: '0.87.0', titre: 'La bande, façon niri', points: [
    '▥ ⚙ › Navigation › La bande : tes ploxions en colonnes. Celle d\'à côté dépasse à droite, vivante ; la toucher l\'amène devant.',
    '→ Un ploxion ouvert depuis un autre s\'ouvre juste à sa droite. Les bords font défiler la bande dans cet ordre.',
    '▥ La vue d\'ensemble : appui long sur le bord de la colonne suivante (ou le geste « la bande » des bords) : toutes tes colonnes en petit, glisse, touche.',
    '⇆ En paysage, deux colonnes côte à côte.',
  ] },
  { v: '0.86.0', titre: 'Tes tsoins rejoignent ton boxion', points: [
    '⧗ ⚙ › Réseau › Mes tsoins au boxion : rien (par défaut), tes tsoins notés, tout ton journal, ou un tampon que tu envoies quand tu veux.',
    '↑ Chaque jour de ce téléphone devient une page de ton boxion. Renvoyer ne double rien ; hors ligne, ça part au retour.',
    '⧗ « Me demander un tsoin après une session » : quand tu reviens après une pause, un mini dock te propose de noter ce que tu venais de faire.',
  ] },
  { v: '0.85.0', titre: 'Tes fichiers partent au labo', points: [
    '📤 Connecté, les ploxions envoient enfin des fichiers au labo et à ton boxion : photos, documents, tout ce qu\'ils te proposent d\'envoyer. Avant : « pas encore relayé ».',
    '📷 Importer des photos les garde sur l\'iPhone (Fichiers › ploxi0n › Photos) et, connecté, les envoie aussi dans ton boxion (Photos).',
    '◔ Les envois qui montrent leur progression marchent aussi dans l\'app.',
  ] },
  { v: '0.84.0', titre: 'Le social avec Apple, pour de vrai', points: [
    '🍏 « Continuer avec Apple » sur l\'écran du social marche : la porte d\'api.j0bot.ch est ouverte.',
    '🎟 Le social reste sur invitation : ouvre le lien qu\'un ami t\'a envoyé, puis « Continuer avec Apple » crée ton compte tout seul. Sans lien, colle-le sous le bouton.',
    '🔗 Déjà un compte j0bot ? Identifiant et mot de passe, puis « Lier mon Apple ID » : la prochaine fois, Apple suffit.',
    '🗑 ⚙ › Compte : supprimer ton compte du social, pour de bon, depuis l\'app.',
  ] },
  { v: '0.83.0', titre: 'Le labo te reconnaît tout seul', points: [
    '🔑 Le mode xerboxion, les pages du labo dans tes ploxions et le navigateur intégré t\'ouvrent le labo déjà connecté, avec ton compte de l\'app : plus de « j\'ai un code ».',
    '🔒 Ton jeton ne sort jamais dans une adresse : l\'app demande au labo un passe qui ne sert qu\'une fois, pendant une minute.',
  ] },
  { v: '0.82.0', titre: 'Les pages du labo et tes glyphes, dans l\'app', points: [
    '⬡ Les glyphes que tu dessines dans l\'atelier des glyphes du labo apparaissent sur tes icônes dans l\'app, avec les retouches du labo et les tiennes.',
    '▣ Les ploxions qui affichent une page du labo s\'ouvrent enfin dans l\'app : idées, makelab, fichiers, xerkions, universal-suit (le labo l\'accepte maintenant).',
    '📖 Le wiki est 100 fois plus léger : le labo n\'envoie plus que l\'article (30 Ko au lieu de 3,6 Mo).',
  ] },
  { v: '0.81.0', titre: 'Les ploxions composés et le wiki, dans l\'app', points: [
    '⧉ Les ploxions qui en composent d\'autres marchent : Ultimate social (le fil, les salons, les amis, la carte, les idées, le profil), socialion, space, stockage… Chaque onglet qui manque s\'installe tout seul la première fois, au lieu de « indisponible ici ».',
    '⧉ Les dépendances : installer un ploxion installe aussi, en fond, ceux qu\'il compose. Ceux qui manquaient déjà arrivent à la prochaine mise à jour automatique.',
    '📖 Le wiki se lit dans l\'app : l\'article seul, avec ses liens entre termes (← pour revenir), un terme à chercher, ⚄ au hasard, ≡ le lexique. Chaque page lue reste là, même hors ligne.',
  ] },
  { v: '0.80.0', titre: 'Tes ploxions à jour tout seuls', points: [
    '↻ Tes ploxions se mettent à jour tout seuls : au lancement, puis toutes les 6 h (ou 1 h, ou 24 h), avec du réseau. Ce qui a changé est dit en bas de l\'écran.',
    '⚙ › Ploxions › mises à jour : l\'interrupteur, la fréquence, les bions aussi, et « vérifier » maintenant, avec la progression.',
    '✓ Un ploxion mis à jour l\'est vraiment : sa nouvelle version s\'ouvre tout de suite, sans redémarrer l\'app (s\'il est ouvert, dès que tu le fermes). Les bions dont il a besoin viennent avec lui, et iOS ne sert plus une vieille copie.',
    '◇ Les ploxions embarqués avec l\'app suivent aussi le labo dès qu\'il en a une version plus récente.',
  ] },
  { v: '0.79.0', titre: 'Game Center : le classement du clicker', points: [
    '🏆 Le Jeu et le Clickion se connectent à Game Center à ta première partie. Ton record part dans le classement du clicker, tout seul, à chaque fois qu\'il monte.',
    '🏆 Dans la barre du Jeu et du Clickion : le classement, mondial et de tous les temps, par l\'écran de Game Center (tes amis aussi).',
  ] },
  { v: '0.78.0', titre: 'Le clicker et le Clickion, dans l\'app', points: [
    '🎮 Le Jeu (le clicker du xerboxion) et ◈ le Clickion sont dans l\'app dès le premier lancement, même sans réseau, et restent à jour depuis le labo. Une seule partie pour les deux, gardée dans ton iPhone.',
    '👆 Chaque doigt compte, dès qu\'il touche : tape à plusieurs doigts sur la cité ou le Cube, sans le petit délai d\'iOS. Un appui long ne mange plus de toucher.',
    '⏱ Le Clickion resté ouvert pendant que ton iPhone dormait : au retour, ce que ta partie a produit pendant ton absence est ajouté, et dit.',
    '◈ Ta partie dans les widgets : le Cube (⚙ › Widgets) peut montrer « clicker du xerboxion ».',
    '✪ La progression du Jeu (niveau, XP, succès) marche enfin dans l\'app : il lui manquait son moteur.',
  ] },
  { v: '0.77.0', titre: 'Plusieurs xers, et les partager', points: [
    '§ Un nouveau ploxion, mes xers (aussi sur les bords : « § changer de xer ») : le xer, c\'est l\'interface entière sur les mêmes ploxions. Ton accueil (pages, dossiers), ton dock, ta barre du haut, ton fond, ton mode et tes gestes des bords.',
    '⧉ Crée-en autant que tu veux : une copie de celui-ci, ou un modèle (Épuré, XERB0T, xerboxion, chill-tekk). Change de xer d\'un toucher : celui que tu quittes est gardé tel quel, rien ne se perd.',
    '↗ Partage un xer : un lien et un QR. Ton ami le reçoit dans ploxi0n, voit ses ploxions, installe ceux qui lui manquent s\'il veut, et l\'essaie. Ta photo de fond reste chez toi.',
    '▣ Un ploxion épinglé ne déborde plus de la barre d\'un ploxion ouvert.',
  ] },
  { v: '0.76.0', titre: 'Inviter et partager, sans zbeul', points: [
    '✉ Un nouveau ploxion, inviter · partager (aussi sur les bords : « ✉ inviter quelqu\'un ») : un toucher, et ton invitation a son lien et son QR. En personne, montre le QR ; sinon, envoie le lien. La personne crée son compte et devient ton amie.',
    '🔗 Les liens qui sortent de l\'app marchent enfin : avant, une invitation, un salon ou un curseur partagés depuis l\'iPhone donnaient un lien « capacitor://localhost » que personne ne pouvait ouvrir. Maintenant c\'est le lien du labo (il ouvre ploxi0n chez qui l\'a, la page du ploxion chez les autres), dans tous les ploxions, sans en réécrire un seul.',
    '↗ Partager un ploxion : appui long sur un ploxion › « le partager », ou depuis inviter · partager. Son lien et son QR, faits par l\'iPhone sans réseau.',
    '📥 Un lien reçu (une invitation, un salon, un curseur) s\'ouvre dans l\'app avec ses paramètres. Copié dans un message : « ouvrir un lien reçu ».',
  ] },
  { v: '0.75.0', titre: 'XERB0T : le contrôleur du monde physique', points: [
    '🤖 Un nouveau ploxion, XERB0T · le contrôleur (et en tête du mode xerbot) : tes appareils, leur état d\'un coup d\'œil, et leurs commandes. Home Assistant, WLED, ESPHome, Tasmota, tes Raspberry Pi (Glances), tes boxions, n\'importe quel ESP ou Arduino qui parle HTTP, et HomeKit.',
    '🔍 « chercher sur le réseau » : ce qui s\'annonce (Bonjour) apparaît seul ; un toucher l\'ajoute. Ou une adresse : la famille se reconnaît seule. Un Arduino ou un ESP en Bluetooth (HM-10, Nordic UART) : un petit terminal.',
    '💡 Allumer, la luminosité, la couleur, les effets, les palettes, les presets de WLED ; les volets, le chauffage, les scènes, les boutons de Home Assistant. Une serrure ou une porte de garage demande « sûr ? ». Le jeton de Home Assistant reste dans le trousseau d\'iOS (Face ID).',
    '⇄ Chaque lumière, chaque prise est aussi sur le bus xerbot du labo : le centre xerbot, cublumiere et tes scripts pilotent le vrai matériel.',
    '↔ Les bords par défaut, ceux de RS-7 : à droite en bas l\'accueil ; les deux bords au milieu, les xers à côté ; en bas, tout le xerboxion.',
  ] },
  { v: '0.74.1', titre: 'L\'AR plus solide', points: [
    '👁 Un appel ou une autre app pendant l\'AR : le terrax retrouve son repère avant de te laisser poser, et ta chambre n\'est jamais enregistrée de travers. « Recommencer » du guide d\'iOS ferme l\'AR proprement.',
    '✋ Ce que tu poses tient SUR la surface (avant, le LiDAR en cachait la moitié dessous). Tes objets 3D se chargent sans figer l\'AR. Les 12 emojis sont dans la feuille de pose.',
    '🔗 AR Quick Look : un lien en erreur le dit au lieu d\'ouvrir une page vide ; un modèle sans extension s\'ouvre quand même.',
  ] },
  { v: '0.74.0', titre: 'Object Capture : tes objets réels en 3D', points: [
    '📦 Le terrax › chambre › « un objet en 3D » : la capture guidée d\'Apple (iOS 17, iPhone avec LiDAR). Vise ton objet, tourne autour : l\'iPhone calcule lui-même son modèle 3D, à l\'échelle réelle. Ton robot, ton meuble IKEA, ta plante.',
    '👁 Il s\'ouvre en AR Quick Look : pose-le à l\'échelle 1 où tu veux, partage-le (AirDrop, Messages).',
    '✋ Dans l\'AR du terrax (ta chambre ou les yeux du terrax), touche une surface : tes objets 3D sont proposés (📦). Le vrai modèle s\'y pose, tourné vers toi, et revient à sa place à la prochaine ouverture de ta chambre.',
  ] },
  { v: '0.73.0', titre: 'L\'AR native : le terrax voit le réel en 3D', points: [
    '👁 Le terrax ouvre les yeux d\'iOS (ARKit) : le monde aligné sur la gravité et le nord, chaque objet à sa vraie direction et à sa distance, qui te fait toujours face. Avec le LiDAR, le réel cache ce qui est derrière un mur, un meuble, une personne ; ◇ montre le maillage du réel.',
    '✋ Touche le réel : un rayon trouve la surface (le sol, une table, un mur) et y pose ce que tu veux, à sa vraie place sur le terrion. Touche un objet : tu le vois (et la quête regard avance).',
    '🛏 Ta chambre en AR : iOS garde la carte de ta pièce ; à la prochaine ouverture, tes objets reviennent exactement à leur place. ↺ recommence une chambre neuve.',
    '📐 Scanne ta pièce au LiDAR (iPhone Pro, iOS 16) : les murs, les portes, les meubles, en 3D. Elle s\'ouvre en AR Quick Look, à l\'échelle 1 : pose ta chambre dans le salon. Le fichier est aussi dans Fichiers › ploxi0n › terrax.',
    '🔗 AR Quick Look partout : un lien vers un modèle 3D (.usdz, .reality) dans n\'importe quel ploxion s\'ouvre dans iOS, en 3D et en AR. Et jOSNatif.ar donne l\'AR native à tous les ploxions.',
    '▦ Le widget « À l\'écoute » montre enfin sa pochette (elle était trop grande pour iOS).',
  ] },
  { v: '0.72.0', titre: 'Des widgets HUD, des captures gardées, le social avec Apple', points: [
    '▦ Les widgets refaits, façon HUD : un fond profond avec sa grille et ses crochets de viseur, le kion ◇ en tête, des lettres d\'instrument. ploxi0n : tes tsoins du jour en grand (plus le titre de la musique coupé), tes pas, ce qui joue ; aussi en rond sur l\'écran verrouillé. Le cube : le texte imprimé SUR ses faces, un socle de lumière. À l\'écoute : la pochette en disque. Épinglés : les glyphes de tes ploxions, plus des emoji.',
    '📸 Chaque capture d\'écran garde la photo de ton xer dans le téléphone : la vue des xers montre ces photos pour les apps fermées, tout de suite, sans rien recharger.',
    '🍏 Le social : « Continuer avec Apple » sur son écran de connexion, un compte j0bot né de ton Apple ID, sans le compte xerboxion. Il attend la porte Apple du serveur des comptes (docs/SOCIAL-APPLE.md) : le bouton le dit tant qu\'elle manque.',
  ] },
  { v: '0.71.0', titre: 'Le terrax, le Pokémon Go du nexus', points: [
    '🌍 Un nouveau ploxion, natif : le terrax. Le terrion, la carte du réel (le satellite de mappion, ta position) : touche +, ou tiens le doigt sur la carte, et pose quelque chose là. Ses souvenirs de mappion 🧿 y sont aussi.',
    '👁 Le terrax, l\'AR : la caméra, et ce qui est posé autour de toi à sa vraie direction et à sa distance (GPS, boussole, inclinaison). « + poser ici » le grave à trois pas devant toi.',
    '🛏 Ta chambre : tes objets à toi (ton robot, ton meuble), jamais envoyés. ⚑ Les quêtes : celles du jeu, et celles du code pour qui veut aider (docs/TERRAX.md). Tout est à toi par défaut ; partager au nexus, c\'est un geste, par objet.',
    '◬ Le koin du ion a ses dossiers : ion, 3ion, seption, nexus. Glisse à droite pour monter d\'un palier, à gauche pour redescendre : une balade entre les réels.',
  ] },
  { v: '0.70.0', titre: 'Le xer en image, ses voisins autour', points: [
    '📸 Fais une capture d\'écran (les boutons d\'iOS) : ploxi0n la sent. Un éclair, ton xer devient une image qui recule, et autour apparaissent ses voisins, en aperçu : en haut, en bas, à gauche, à droite.',
    '⊡ Glisse dans une direction : l\'app d\'à côté vient au centre (un cran par case, une butée s\'il n\'y a rien). Revenir dans l\'autre sens ramène toujours d\'où tu viens. Touche le centre : tu y entres. Pince : la carte entière.',
    'Les voisins sont ceux de la carte du xerboxion : la même place pour chaque app, la même mémoire musculaire. Aussi : le geste des bords « ⊡ les xers à côté ».',
  ] },
  { v: '0.69.0', titre: 'Démarrer toujours, ne plus déborder', points: [
    'ploxi0n démarre même quand iOS a fermé sa base (« unable to open database file », iPhone verrouillé) : il réessaie, attend que tu déverrouilles, et sinon te dit pourquoi avec ↻ réessayer. La base reste chiffrée par iOS jusqu\'au premier déverrouillage, pour que le son et les raccourcis (dodo) marchent écran verrouillé.',
    'La barre d\'un ploxion ne dépasse plus de l\'écran (elle défile dans elle-même) : plus rien ne se décale à gauche.',
    'Moins de lag avec beaucoup de ploxions ouverts : un ploxion caché depuis 5 minutes s\'endort (il ne coûte plus rien, un toucher le réveille), jamais s\'il fait du son. Réglable : ⚙ › Navigation.',
    '🔍 cherche d\'abord dans TES ploxions (sans accents, ceux qui sont ouverts d\'abord, Entrée ouvre le premier) ; le marketplace est en dessous, et ↻ tout mettre à jour d\'un toucher.',
  ] },
  { v: '0.68.1', titre: 'Le cube ne fait que regarder', points: [
    '▣ Les pages d\'onglets se photographient sans toucher au ploxion : il ne bouge plus derrière le cube (bother ne recharge plus sa boîte, rien de tapé ne se perd).',
    '▣ Deux touchers rapides sur ▣ n\'ouvrent plus deux cubes ; changer d\'app pendant qu\'il s\'ouvre l\'annule ; le geste des bords « cube » le referme bien ; le plafond et le sol arrivent en fondu ; un appui long n\'ouvre plus le menu image d\'iOS.',
    'Le minuteur : ses boutons chrono, minuteur et pomo marchent enfin (ils changeaient le mode de l\'app).',
  ] },
  { v: '0.68.0', titre: 'Le cube, la vue des pages d\'un ploxion', points: [
    '▣ dans la barre d\'un ploxion : il devient l\'intérieur d\'un cube. La page où tu es au fond ; la suivante sur le mur de droite, la précédente à gauche, les autres au plafond et au sol. Penche l\'iPhone : tu vois les murs.',
    'Glisse : le cube tourne, la page d\'à côté vient au fond. Touche une face : elle vient au fond. Touche le fond : tu entres dans cette page, le vrai ploxion, vivant. ⤢ (ou ▣) : tu reviens comme tu étais.',
    'Ça marche déjà pour le marketplace (ses vues), les réglages (toutes leurs pages), bother, couleurs, minuteur, et tout ploxion qui a des onglets. Les faces sans page restent à toi : un xer au choix, et l\'intérieur se peuple (gardé pour chaque ploxion).',
    'Ne pas nuire : le cube ne touche jamais un bouton qui agit (envoyer, installer, retirer…), ne feuillette pas la blouse ni le minuteur (il remettrait le chrono à zéro) ; il ne fait que regarder.',
  ] },
  { v: '0.67.0', titre: 'Dans le cube, et un marketplace qui dit où', points: [
    '▣ « dans le cube », un nouveau ploxion : ton iPhone est une face du cube, tu regardes dedans. Penche-le (le gyroscope), les autres faces se montrent : le fond, les deux murs, le plafond, le sol. Chaque face est un xer que tu choisis (touche son étiquette) : l\'accueil, ce qui vit, tes tsoins, un koin, une image, ou le trait. ＋ peupler : pose dedans un ploxion, un texte, une image, un glyphe ; glisse-le, deux touchers le rapprochent ou l\'éloignent, appui long pour l\'enlever.',
    '◈ Sur un xerkion du labo (dev, bouffe, ferme, pont, veille), ◈ ouvre sa vraie console xerploxion, celle du labo. Ailleurs, l\'hologramme local, avec « ◈ consoles du labo » sur son socle.',
    'Le marketplace montre les icônes des ploxions comme dans ton xer, et dit où chacun tourne : ◇ partout (iPhone, Android, web, hors ligne), ◆ natif, ◐ partiel, ⇄ nexus (il lui faut le serveur du labo), ↗ web externe. En grille, filtre par portée ; les ploxions de l\'app y sont aussi.',
  ] },
  { v: '0.66.0', titre: 'Le xerbion et le xerploxion', points: [
    { t: '⧈ Le xerbion d\'un ploxion (les données de ses bions) : sur la face du dessus du cube, ce que chacun de ses bions garde chez toi (ses clés, leur poids, quand), ce qu\'il garde lui-même, et ses tsoins.', essayer: 'cube' },
    '◈ Le xerploxion, la version holographique d\'un ploxion : ◈ dans sa barre. Il flotte au-dessus d\'un socle de projection, penché par ta main (le gyroscope), toujours vivant : tu t\'en sers comme avant. Un bord le remet à plat.',
  ] },
  { v: '0.65.0', titre: 'Tout ton xerboxion, sur une carte', points: [
    { t: 'La carte du xerboxion : pince la fractale (ou ⊞, ou « tout » sur la page aujourd\'hui). Au centre le cube du xerboxion ; autour, chaque famille est un koin, et chaque ploxion a SA place, toujours la même. Promène-la du doigt (elle file sur son élan), zoome à deux doigts : de loin les koins, de près les noms et le chemin des swipes pour y aller depuis là où tu es. Touche une app : tu plonges dedans. Appui long : déplace-la, elle garde sa nouvelle place.', essayer: 'carte' },
    'Les fils, la seule couleur : vus de près, ils relient les ploxions qui partagent un bion rare.',
    'Les gestes des bords proposent aussi l\'état d\'un ploxion, le tuto et « tout le xerboxion ».',
  ] },
  { v: '0.64.0', titre: 'Dodo, et le son qui tient', points: [
    '☾ Dodo : dans le tsoin, la rangée « santé · sommeil » : ☾ dodo ou ☀ réveil d\'un toucher, sans rien écrire. Ou ploxi0n://dodo depuis un raccourci, le Toucher au dos, ou l\'automatisation « quand Sommeil s\'active ». La page Santé met ta nuit dite à côté de la nuit de ta montre (Garmin → Apple Santé) : combien de temps pour t\'endormir, l\'écart au réveil.',
    '≋ chill-synth, la phase 1 : une piste (un fichier à toi, ou une adresse CC0), lance, verrouille l\'iPhone 10 minutes ; au retour, le ploxion te dit si le son a tenu. Deux essais (le son seul, avec l\'analyse), et les bandes du son partent sur le bus « audio:bands » pour la suite (le visuel, l\'haptique).',
    'Si « Réduire les animations » est activé dans iOS, ploxi0n passe tout seul en mode Calme.',
  ] },
  { v: '0.63.1', titre: 'L\'accueil n\'est plus lent', points: [
    'La lenteur venait du thème vivant : 8 fois par seconde, il faisait recalculer TOUTE la page (avec 202 ploxions, l\'iPhone n\'arrivait plus à dessiner : 2 images par seconde au banc). Il ne touche plus que ce qui bouge vraiment (le logo, le dock, la barre, les feuilles) : 50 images par seconde au même banc, et l\'accueil se dessine deux fois plus vite.',
  ] },
  { v: '0.63.0', titre: 'Fluide, et ça se sent', points: [
    { t: 'La fractale refaite pour être fluide : une seule boucle d\'images, l\'inclinaison du gyroscope posée sur tout le paquet (plus de tremblement), les cartes lointaines allégées. Elle se prépare pendant que ton doigt tient : l\'aperçu arrive sans à-coup.', essayer: 'apercu' },
    { t: 'Lance le paquet : il file sur son élan, ralentit et se pose. Un cran par carte qui passe : net quand c\'est lent, en rafale quand c\'est vite. Un doigt le rattrape au vol.', essayer: 'lancer' },
    'L\'haptique selon l\'usage : la profondeur se sent (l\'aperçu léger, la fractale, le moteur du slider, le verrou du cube), chaque seuil a son retour (les 30 % de l\'aperçu, la carte qu\'on jette), chaque app arrive avec sa signature. ⚙ › Haptique › La fractale et les bords : tout se règle, avec la densité (sobre, normale, pleine).',
    { t: 'Le cube : plus de nom qui chevauche la face du dessus, plus de trait qui traverse la face, l\'indice sur une ligne. Le curseur de réel se charge avant que le xer devienne cube ; le gyroscope le fait pivoter dans ta main ; la face du dessus tourne avec lui.', essayer: 'cube' },
    { t: 'Tout le xerboxion : pince la fractale (ou ⊞) — la carte de tous tes ploxions, chacun à sa place.', essayer: 'carte' },
    'Les nouveautés se jouent : ▶ essayer, et un doigt fantôme fait le geste pour de vrai, sur ton xer. Touche l\'écran pour l\'arrêter.',
    'Plus rien ne passe par-dessus la fractale (mini docks, bulles des ploxions) ; plus rien ne reste coincé (un appel, Face ID, un ploxion fermé ailleurs, la rotation).',
    'Les bords, comme tu les voulais : en haut à gauche le tuto de ce que tu vois (ses gestes, ▶ chacun ; dans un ploxion, son tuto, ou ＋ pour l\'écrire et ↗ le partager) ; en bas à gauche l\'état du ploxion ; en bas à droite minimiser ; les deux bords ensemble, le portion.',
    'L\'état d\'un ploxion (bord bas gauche) : plein écran (sa barre s\'efface), PiP (il flotte en petit, vivant, au-dessus du reste : glisse-le, il s\'aimante aux coins ; touche-le, il revient ; deux touchers, un cadre), cadre (une fenêtre comme sur Wayland : sa barre, ⤢ ▁ ✕, son coin pour la redimensionner).',
    'La bande noire du haut est partie : le fond d\'écran et les ploxions vont jusque sous l\'île ; un voile doux garde l\'heure lisible ; un ploxion clair fonce l\'encre de la barre.',
    'Le lecteur vidéo ne surgit plus tout seul : seulement sous ton doigt, pour le ploxion à l\'écran ; une seule scène à la fois ; s\'il échoue, une bulle te propose le lecteur de l\'iPhone ou le web au lieu de rouvrir en boucle.',
  ] },
  { v: '0.62.0', titre: 'Freefall fait défiler', points: [
    { t: 'Freefall : pencher l\'iPhone en avant ou en arrière fait défiler ce qui est à l\'écran (le ploxion, ou l\'accueil) ; à gauche ou à droite, la fractale.', essayer: 'freefall' },
    'La fractale reste légère même avec beaucoup de ploxions ouverts : seuls ceux proches du centre sont dessinés en direct.',
  ] },
  { v: '0.61.0', titre: 'Des pages de côté, le cube dans sa salle', points: [
    'L\'accueil a une page à gauche, « aujourd\'hui » (ce qui vit, la musique, les vidéos à reprendre ; la fractale, freefall, un tsoin, les mini docks d\'un toucher), et une à droite, « bibliothèque » (tout, par catégorie).',
    'Le cube se voit de trois quarts, dans la salle du kion 4D (les cadres qui reculent, les arêtes vers le cube) ; entrer dans une app ouvre un portail de carrés emboîtés.',
    'Tiens une icône de l\'accueil : elle flotte avec le gyroscope ; penche l\'iPhone en avant, une bulle montre ses bions.',
  ] },
  { v: '0.60.1', titre: 'Les bords ne sélectionnent plus le texte', points: [
    'Tirer depuis un bord ne sélectionne plus le texte du ploxion (ni loupe, ni menu d\'iOS) : le geste reste à l\'app, il ne se coupe plus en route.',
  ] },
  { v: '0.60.0', titre: 'Le xer devient un cube', points: [
    { t: 'La fractale en jeu de cartes : de grandes cartes, l\'icône et le nom au-dessus de chacune ; elles suivent le doigt et filent sur leur élan. Jette une carte vers le haut : le ploxion se ferme.', essayer: 'fractale' },
    { t: 'Le slider, c\'est le filtrage de photons : autour du curseur de réel (le trait au milieu), les apps sont pleines ; plus loin elles tournent sur la tranche et deviennent des lignes serrées.', essayer: 'slider' },
    { t: 'Arrête-toi sur une app dans le slider et tiens encore : le xer devient un cube autour d\'elle. Tourne-le (un cran à chaque face) ; penche-le en avant, ou glisse vers le haut : sa face du dessus montre ses bions.', essayer: 'cube' },
    'Le gyroscope : pendant la fractale tout s\'incline avec l\'iPhone ; dans le slider, pencher accélère ou freine. Le zéro, c\'est ta façon de tenir l\'iPhone au début du geste.',
    'Freefall (un geste des bords à choisir) : toute l\'appli au gyroscope. Penche pour ouvrir la fractale et défiler, reste droit 1,4 s sur une app pour l\'ouvrir ; le badge en haut l\'arrête.',
    'Trackpad haptique : le banc des essais (textures grille, bords, cibles ; clic, clic fort ; deux doigts pour défiler), pour sentir le Taptic Engine avant le vrai trackpad.',
  ] },
  { v: '0.59.0', titre: 'La fractale des ploxions', points: [
    { t: 'Passer d\'une app à l\'autre par un bord : l\'app part en biais, l\'autre arrive en 3D, un trait de lumière balaie l\'écran.', essayer: 'glisser' },
    { t: 'Tenir un bord 0,3 s : l\'app d\'à côté passe la tête (à droite la suivante, à gauche la précédente) ; tire-la vers le centre pour y aller.', essayer: 'apercu' },
    'Tenir 0,9 s : la fractale. Ton app au milieu, en petit, les autres de chaque côté, de plus en plus petites ; glisse, lâche sur une app. Lâchée sans bouger, elle reste ouverte : touche une app, ou à côté pour revenir.',
    'Tenir 1,9 s : le slider. Encore plus petit, ça défile tout seul vers le bord tenu ; ramène le doigt vers le centre pour ralentir ou repartir dans l\'autre sens ; lâche pour ouvrir.',
    'Sur les iPhone à 3D Touch, presser fort fait pareil, plus vite.',
  ] },
  { v: '0.58.0', titre: 'Des couleurs douces', points: [
    'Les icônes gardent les teintes des xerkions du labo, mais adoucies : moins saturées, moins lumineuses. Ça n\'explose plus les yeux.',
  ] },
  { v: '0.57.0', titre: 'Le glyphe seul garde sa forme', points: [
    'Style « glyphe seul » : la forme du type reste (losange, xerkion à N côtés, cube, kion, koin, anneaux, sphère, portion, bion, boîte), pleine, d\'une couleur, et le glyphe est découpé dessus, en grand.',
  ] },
  { v: '0.56.0', titre: 'Plus de ploxions ouverts, des glyphes lisibles', points: [
    'Ploxions vivants en arrière-plan : 12 par défaut, jusqu\'à 20, ou ∞ (⚙ › Navigation). Cachés, ils sont gelés et leurs vidéos coupées ; au-delà de la limite, le plus ancien s\'endort dans les mini docks.',
    'Le glyphe au centre des icônes est bien plus grand.',
    'Deux styles d\'icônes (⚙ › Apparence) : xerboxion (la forme dit le type, le glyphe au centre) ou glyphe seul, en grand. App par app aussi : appui long › son icône › le style.',
  ] },
  { v: '0.55.0', titre: 'Les icônes du xerboxion, et Face ID tient', points: [
    'Chaque ploxion a son icône, dessinée comme les xerkions du labo : la FORME dit ce qu\'il est (ploxion = losange, xerkion = autant de côtés que de koins, xer = octogone, cubion = cube, kion, koin, wormion, spherion, portion, bion, boxion), la COULEUR et le glyphe disent sa catégorie.',
    'L\'atelier : appui long sur un ploxion › « son icône » (ou la feuille de l\'écran d\'accueil) : sa palette, son glyphe, une photo, et le nom sous l\'icône de l\'iPhone.',
    'Proposer son icône au labo : si elle est prise, tout le monde l\'aura.',
    'Face ID : un ploxion verrouillé se referme quand l\'app passe en arrière-plan et redemande ton visage au retour ; mis sur l\'écran d\'accueil, il passe toujours par ploxi0n (plus d\'accès en ligne sans visage).',
    'Le labo, c\'est labo.j0bot.ch.',
  ] },
  { v: '0.54.0', titre: 'Des glyphes, et ranger au doigt', points: [
    'Plus d\'emoji : chaque ploxion a son glyphe, au trait du xerboxion (ion, koin, portion, cubion…), teinté à sa couleur ; le dock, les réglages, les mini docks aussi. ⚙ › Apparence pour revenir aux emoji du labo.',
    'Ranger l\'accueil au doigt : appui long sur une icône, elle se soulève — glisse-la où tu veux, sur un dossier pour l\'y mettre, au bord de l\'écran pour changer de page. Sans bouger : son menu, comme avant.',
    'Les widgets reviennent (le cube, À l\'écoute, épinglés, valeurs) avec les contrôles du Centre de contrôle.',
    'L\'aperçu du cube (⚙ › Widgets) vit : il suit le gyroscope, se tourne au doigt, et tourne doucement tout seul.',
    'Vidéo : plus de plein écran surprise ; le PiP automatique en quittant l\'app ; une vidéo en plein écran endort les autres ploxions (la mémoire : c\'était le plantage).',
  ] },
  { v: '0.53.0', titre: 'Snappy', points: [
    '⚡ L\'app ne rame plus : le thème vivant ne recalcule plus toute la page 30 fois par seconde (il fait glisser le fond et la grille, c\'est tout), il dort dans les ploxions, et les 131 icônes ne sont plus 131 calques ni 131 ombres qui bougent.',
    '❄ Un ploxion en arrière-plan (un jeu…) n\'anime plus pour rien : ses images reprennent quand tu le rouvres. La musique continue.',
    '💾 Le bus n\'écrit plus chaque message dans la base (le gyroscope, la blouse) : au plus une fois par seconde.',
    '📖 Le wiki (et les ploxions qui montrent une page du labo) : l\'adresse va au labo ; tant que le labo refuse d\'être affiché dans l\'app, une carte « ouvrir » au lieu d\'une page blanche. Pareil pour le mode xerboxion.',
  ] },
  { v: '0.52.0', titre: 'Tous les ploxions en chill-tekk', points: [
    '◇ Un thème commun : les ploxions du labo prennent les couleurs, la police, les boutons et les champs de l\'app (ils se peignent avec les variables du xer : l\'app les redéfinit). Ce qu\'un ploxion ne style pas du tout devient chill-tekk aussi. ⚙ › Apparence pour le couper.',
    '⬡ Le mode xerboxion n\'affiche plus un grand rectangle blanc : « le labo arrive », ou « le labo ne répond pas » hors réseau.',
    '⏱ Minuteur rejoint le pack hors ligne : Pomodoro (qui l\'ouvre) marche sans réseau ; un ploxion du pack s\'installe depuis le téléphone, jamais par le réseau.',
    '👤 ⚙ › Compte › « Supprimer mon compte » : la page de ton compte xerboxion.org s\'ouvre, la suppression s\'y termine.',
  ] },
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

const point = (p) => (typeof p === 'string' ? { t: p } : p || { t: '' });
export function creerNouveautes({ W = globalThis.window, boxion, version, vibrer = () => {}, liste = NOUVEAUTES, essayer = null }) {
  const D = W.document;
  /** les versions plus récentes que « depuis » (exclu), jusqu'à la version de l'app (incluse) */
  const depuis = (vue) => liste.filter(n => (!vue || cmp(n.v, vue) > 0) && cmp(n.v, version) <= 0);
  function montrer(entrees, { tout = false } = {}) {
    if (!entrees.length) return null;
    const f = D.createElement('div'); f.className = 'px-voile px-nouveautes';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft">✦ ' + (tout ? 'toutes les nouveautés' : 'quoi de neuf · ploxi0n ' + esc(version.replace(/\.0$/, ''))) + '</p>'
      + '<div class="px-nv-liste">' + entrees.map(n => '<section><h3>' + esc(n.v.replace(/\.0$/, '')) + ' · ' + esc(n.titre) + '</h3><ul>'
        + n.points.map(point).map(p => '<li>' + esc(p.t) + (p.essayer && essayer ? ' <button type="button" class="px-nv-essai" data-essayer="' + esc(p.essayer) + '">▶ essayer</button>' : '') + '</li>').join('') + '</ul></section>').join('') + '</div>'
      + '<button class="p" data-nv>ok</button></div>';
    f.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-essayer]');
      if (b) { e.stopPropagation(); const nom = b.getAttribute('data-essayer'); f.remove(); vibrer('leger'); W.setTimeout(() => { try { essayer(nom); } catch (er) { /* */ } }, 280); return; }
      if (e.target === f || e.target.closest('[data-nv]')) { f.remove(); vibrer('leger'); }
    });
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
