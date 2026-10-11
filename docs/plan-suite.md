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
