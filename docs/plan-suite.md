# ploxi0n — la suite (RS-7, 11.10.2026)

*Captation fidèle des demandes de RS-7 pendant la journée du 11.10, puis l'ordre de construction proposé. Le posé = ses mots ; la lecture = RS-1, à valider.*

## Posé

- **Tout tester, tout voir** : « le but c'est de pouvoir tout intégrer ce qu'on peut faire avec un iPhone ». Face ID pour ouvrir des choses ; des widgets ; ultimate-bluetooth sur iPhone.
- **Le marketplace** : « j'ajoute que les ploxions que je vais utiliser ». (Fait en 0.4.)
- **Organiser** : des dossiers de ploxions ; des raccourcis vers un ploxion, « ajouter à l'accueil de l'iPhone… comme des apps » ; des widgets avec les infos des bions ou des ploxions.
- **Les ploxions connectés** : « les ploxions fichiers et les ploxions de connexion avec le boxion, et le login pour avoir les autres xers » ; « il faut que le ploxion stremio fonctionne dessus, les ploxions YouTube intégrés, Instagram, tout ».
- **Le compte** : « qu'on puisse faire un compte avec Apple ID, mais juste en bion, parce que pour augmenter son rang il faut être invité par un xerion » ; « en plus ça fait pro ».
- **Les rangs** : « pour être un zion il faut soit avoir un code d'un xerion ou plus haut, soit installer un boxion, et comme ça tu peux devenir ton propre xeroction ».
- **Le Nexus** : « le réseau des xeroctions, c'est le Nexus ; j'ai envie d'inviter des xeroctions, pas des zions ou des xerboxions ; mon focus c'est qu'ils aient leur propre boxion pour qu'on puisse faire des tests ».
- **Les testeurs** : « quand on fait un boxion, donc qu'on devient un xeroction, on peut envoyer son mail pour demander une invitation ; ça les ajoute au TestFlight si j'autorise ».
- **La technique, pour tout le monde** : « comme ça tout le monde peut utiliser ma technique pour faire des apps » ; « il faut faire une vidéo du processus avec des tsoins, pour expliquer comment faire ça soi-même ».
- **Les apps des autres** : « quelqu'un qui crée son app avec ma technique, qu'on puisse utiliser ses ploxions et l'ajouter au Nexus » ; « et utiliser son app dans notre app » ; « c'est un requirement que ses ploxions soient des apps compatibles avec le xer de xerboxion.org ».

## Lecture : l'ordre de construction (à valider)

1. **Le mode connecté du shim** (le verrou de presque tout le reste). Aujourd'hui, une route du serveur répond « hors ligne » sans réseau. Mode connecté : quand l'iPhone est en ligne ET relié à un boxion, ces routes partent vers le boxion avec le jeton de la personne. Fichiers, connexion au boxion, Stremio, YouTube, Instagram (les ploxions classe B) se mettent à marcher ; hors ligne, ils redisent « hors ligne ».
2. **Le compte** : Sign in with Apple → un compte **bion** sur le boxion (route côté labo qui vérifie le jeton d'Apple) ; le login xerboxion.org pour un compte existant ; un jeton d'app (pas de cookie) pour le mode connecté. Monter de rang : le code d'un xerion (→ zion), ou installer son boxion (→ xeroction de ce boxion). Case à cocher : **Sign In with Apple** sur l'identifiant.
3. **Ajouter un ploxion à l'écran d'accueil de l'iPhone comme une app** : les liens universels (Associated Domains, déjà coché) — `https://xerboxion.org/px/<id>` ouvre directement ploxi0n sur ce ploxion — et une page « ajouter à l'écran d'accueil » qui guide avec l'app Raccourcis (une icône par ploxion, son icône à lui).
4. **Les widgets** : une Widget Extension (Swift, WidgetKit) qui lit les données partagées par l'app (App Groups, coché) : un tsoin du jour, la valeur d'un bion (pas, météo, prochain réveil), un ploxion épinglé.
5. **Le Nexus des xeroctions et TestFlight** : sur le boxion, un xeroction demande l'accès (son e-mail) ; RS-7 voit la demande et l'accepte ; la CI l'ajoute à un groupe TestFlight externe (API App Store Connect). Les testeurs externes demandent une revue Apple « bêta » une fois par version.
6. **La technique pour tout le monde** : ploxi0n devient un modèle de dépôt (« fais ton app ») : la même coque, le même shim, la même CI ; tes ploxions viennent de ton boxion. Exigence : chaque ploxion respecte le contrat du xer de xerboxion.org (jOSApps : manifest, mount/unmount, describe, ports) — le banc de compatibilité le vérifie avant d'entrer au Nexus.
7. **Les apps des autres dans la nôtre** : le marketplace lit plusieurs sources (xerboxion.org, et le boxion de chaque xeroction du Nexus) ; un ploxion venu d'ailleurs s'installe comme les nôtres, après le même banc.
8. **La vidéo, faite de tsoins** : chaque étape du processus (créer le dépôt, poser les secrets, pousser, recevoir sur l'iPhone) est enregistrée comme tsoin ; la vidéo se rejoue depuis ces tsoins.

## Posé (suite, 11.10 au soir)

- « On peut utiliser les ploxions individuellement : chaque ploxion devient une app du homescreen ; au bout d'un moment, sur le homescreen il n'y a que des apps du ploxion, et ça devient le xerboxion. »
- « On peut avoir notre icône qui change au fur et à mesure qu'on avance dans le xerboxion ; avec l'app ploxi0n on peut devenir l'app xeroction si on veut, donc tous les xers depuis le xerboxion. »

## Lecture (suite)

9. **Un ploxion = une icône sur l'écran d'accueil.** iOS ne laisse pas une app poser elle-même plusieurs icônes. La voie qui marche : pour chaque ploxion, un raccourci (app Raccourcis) avec SON icône et son nom, qui ouvre `ploxi0n://px/<id>` ou le lien universel `https://xerboxion.org/px/<id>` ; ploxi0n prépare l'icône et guide en deux gestes. À l'écran, ça ressemble à une app par ploxion ; derrière, c'est le même ploxi0n, les mêmes données, hors ligne. (Plus tard, des App Clips pour quelques ploxions phares.)
10. **L'icône qui évolue avec le rang** : iOS permet de changer l'icône de l'app (icônes alternatives, déclarées dans l'app) : bion → zion → … → xeroction, chaque palier son losange. Le nom affiché reste « ploxi0n » (iOS ne permet pas de le changer) ; c'est l'icône et l'accueil qui deviennent « l'app xeroction ».
11. **L'app xeroction = tous les xers** : au rang xeroction (son boxion installé), l'accueil de ploxi0n montre les xers du xerboxion (thèmes, dispositions) et l'accès au Nexus.

## Posé (suite) : le vrai mode xerboxion sur l'iPhone

- « Toute l'interface de l'iPhone, les réglages, le son, tout manipulable avec des widgets et des fonctionnalités de l'app ploxi0n, juste en installant des ploxions ou des bions ; on peut changer toute notre interface, commander les différentes interfaces ; si on a des pages de homescreen, on peut faire nos propres customs, pour avoir le vrai mode xerboxion sur notre phone. »

## Lecture : ce qu'iOS permet, et comment chaque morceau devient un ploxion ou un bion

iOS isole chaque app : ploxi0n ne peut pas modifier directement les réglages du système ni ranger l'écran d'accueil. Mais iOS ouvre beaucoup de portes officielles, et chacune peut être pilotée par un ploxion ou un bion :

| Porte d'iOS | Ce qu'elle permet | Devient |
| --- | --- | --- |
| Widgets (accueil, écran verrouillé), interactifs depuis iOS 17 | des boutons et des interrupteurs qui agissent sans ouvrir l'app | chaque ploxion ou bion publie ses widgets (une valeur, un bouton, un graphique) |
| Contrôles du Centre de contrôle (iOS 18) | des boutons à soi dans le Centre de contrôle, sur l'écran verrouillé et le bouton Action | un bion = un contrôle (lancer un tsoin, basculer un mode, ouvrir un ploxion) |
| App Intents (Raccourcis, Siri, Spotlight, bouton Action) | exposer les actions des ploxions au système | chaque ploxion déclare ses actions ; elles deviennent utilisables partout dans iOS |
| L'app Raccourcis et ses automatisations | changer le fond d'écran, le mode sombre, le Wi-Fi, le Bluetooth, le volume, la luminosité, les modes de concentration, sur un déclencheur (heure, lieu, NFC, ouverture d'une app) | ploxi0n fournit des raccourcis prêts à installer ; un ploxion « interface » les compose |
| Modes de concentration (Focus) et leurs pages d'accueil | choisir quelles pages d'écran d'accueil s'affichent selon le mode | un « xer » = un mode de concentration avec SES pages d'accueil (les icônes de ploxions) ; changer de xer = changer de mode |
| Filtres de concentration (Focus Filter) | l'app s'adapte au mode actif | ploxi0n change son accueil et son thème selon le xer actif |
| Live Activities et Dynamic Island | une activité vivante (minuteur, tsoin en cours, musique) | un ploxion publie son activité vivante |
| Dans l'app | luminosité de l'écran, sons, vibrations, plein écran, orientation | des bions du shim (jOSAppareil, jOSSon…) |

Le vrai mode xerboxion = des pages d'écran d'accueil faites d'icônes de ploxions et de widgets de bions, un mode de concentration par xer, des contrôles et des raccourcis qui pilotent le système. Le tout installé depuis le marketplace, comme un ploxion.
