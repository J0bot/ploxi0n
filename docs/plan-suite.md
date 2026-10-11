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

## Posé (suite) : comme les mods sur Prism

- « Exactement quand on rajoute des mods sur Prism : ça nous ajoute **les dépendances automatiquement** (fait en 0.6), et ça nous propose **des apps qui sont utilisées habituellement en même temps** que celle-là (fait en 0.7 : « souvent utilisé avec », calculé sur le Nexus), **ou un xer de cette app**. Parce qu'au bout d'un moment, **chaque ploxion devient un xerboxion**. »

## Posé (suite) : bother me de base, le marketplace qui se trouve, le Steam Workshop

- « Il faut aussi avoir le ploxion **bother me comme ploxion de base**, parce que là ce sont quand même les versions de test… juste pour les testeurs, genre mes potes. » Fait en 0.8 : bother est dans le pack hors ligne avec ses bions (jOSGpg, jOSBug) et openpgp, installé d'office au premier lancement (retirable) ; ses routes `/bother*` partent sur `xerboxion.org/api/app/bother*` (relais du shim, sans session).
- « Pour le marketplace, actuellement c'est vraiment l'enfer de trouver un ploxion : il faut une manière **bien plus stylée et rapide**, **différentes façons de voir le marketplace** sur iPhone. »
- « Il faudra que le marketplace fonctionne avec **le Workshop de Steam** aussi. »

## Lecture (suite)

12. **Le Steam Workshop = une source de plus du marketplace** (même geste que le point 7 : plusieurs sources, un adaptateur chacune, jamais un choix exclusif). Le jeu pourriture-4 sur Steam a son Workshop ; un ploxion publié là (un « objet » du Workshop : le bundle `app.js` + l'icône + la description) s'installe dans ploxi0n comme ceux de xerboxion.org, après le même banc de compatibilité. Lecture côté iPhone : l'API Web de Steam (`IPublishedFileService/QueryFiles`, `ISteamRemoteStorage/GetPublishedFileDetails`) donne la liste et l'URL du fichier ; la clé d'API Steam vit sur le boxion (jamais dans l'app) : le labo sert un miroir `/px/workshop/*.json`, que le marketplace lit comme le registre. Publication : depuis le jeu (Steamworks UGC) ou depuis le boxion. Le classement reste celui du Nexus (les heures), le Workshop ajoute ses abonnés comme info.

## Posé (suite, 11.10 la nuit)

- « Le ploxion réglages fonctionne pas, en fait presque tous les ploxions. » Diagnostic (`tools/diagnostic-iphone.mjs`, le vrai chemin de l'app) sur les 45 plus utilisés : 15 marchaient. Fait en 0.8 : **le mode connecté** (toute route du serveur → xerboxion.org avec le jeton ; labo `JetonAppWeb`) → 41/45 ; les bions **touchés** (pas seulement déclarés), récursivement → réglages, xerkions et ultimate-social montent avec leurs bions ; jOSXerPrefs complet.
- « Le mode connecté, y a pas tout qui fonctionne, des fois les xerkions » ; « l'ultimate social fonctionne pas non plus ». Cause : jOSXerkionHub jamais installé (non déclaré) → « vit dans la galerie Xerkions — ouverture… » ; corrigé par la règle des bions touchés (0.8) et le rattrapage des ploxions déjà installés au démarrage.
- « Il faut pouvoir utiliser des **pages de ploxions** » (fait en 0.8 : pages qu'on fait glisser, comme l'écran d'accueil) ; « ajouter des ploxions au **homescreen** et les utiliser tous seuls, mais connectés » (fait en 0.8 : le guide Raccourcis + l'icône du ploxion, depuis l'édition et la fiche du marketplace).
- « Je veux des **widgets ploxion**. » (prochain lot : extension WidgetKit + App Group, une deuxième cible signée.)
- « Il faut pouvoir **ajouter des options en plus dans Raccourcis**, avoir **le marketplace de ça** aussi. »
- « Il faut vraiment **un vrai bouton réglages** dans l'app ploxi0n, et un moyen de **customiser son HUD**. »
- « Une **vision des trucs qu'on regarde** : les films qu'on regarde, sur YouTube, Stremio, n'importe quoi genre Netflix, ou avec Trakt : pouvoir tout checker. »

## Lecture (suite)

13. **Les actions Raccourcis = des ploxions aussi** : chaque action (App Intent) est déclarée dans l'app ; les ajouter au vol n'est pas possible (iOS les lit à la compilation). La voie : un petit nombre d'actions GÉNÉRIQUES (ouvrir un ploxion, envoyer un port à un ploxion `ploxion.port(payload)`, lire la valeur d'un bion, noter un tsoin, lancer un tsoin rejouable) ; le marketplace propose des **recettes** (un raccourci tout fait = une suite de ces actions avec ses paramètres, partageable en lien iCloud) : « le marketplace des raccourcis ».
14. **Le vu du xerboxion (vision de ce qu'on regarde)** : un bion `jOSVu` (journal de visionnage : titre, source, durée, quand) alimenté par les ploxions médias (YouTube, Stremio, cinéma) ; Trakt en adaptateur (API OAuth, l'historique Netflix/Disney y arrive via ses intégrations) ; l'export Netflix (CSV) en import. Un ploxion « 👁 vu » : la frise, les heures par source, ce qui reste à finir. Rien ne sort du boxion (degré O par défaut).
15. **Les réglages de ploxi0n** : un ploxion interne ⚙ toujours accessible (HUD) : compte, mode connecté, verrous Face ID, pages, vue du marketplace, version et banc ; **le HUD se compose** (quels éléments, dans quel ordre : compte, réseau, mode, heure, des ploxions épinglés).
