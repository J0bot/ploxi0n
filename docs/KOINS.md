# Les koins : le xerboxion de l'appli (le carnet de RS-7, 22.10)

RS-7, avec deux pages de son carnet : « et y a aussi ça pour le xerboxion de l'appli iPhone ploxi0n, on va atteindre le xerboxion tout bientôt ».
Les pages : `docs/look/references/koins-01-glyphes.jpg` et `koins-02-telephone.jpg`.

## Ce qui est sur les pages (posé)

**Page 1, en haut : un écran.** Un cadre aux angles coupés. Dans chaque coin, un koin : des triangles emboîtés. À gauche, un grand panneau
vide. À droite, un panneau rempli d'un glyphe dessiné (des triangles et des courbes). En bas, une barre : ⧗ ○ △ □ ◇ entre deux koins de coin.
À droite de l'écran : □ △ ○, puis :

- **Wormion** (des cercles concentriques) : l'émotionnel, le temps, le niveau de réel.
- **Portion** (des carrés emboîtés) : le rationnel, la fractale, les types de réel.

**Page 1, au milieu : le lexique.** ✕ ⧗ ○ △ □ ◇ ⊠, nommés :

| glyphe | nom | noté dessous |
| --- | --- | --- |
| ✕ (un X aux bras larges) | xeroction | user, params |
| ⧗ (un sablier, deux triangles dedans, un point) | tsoin | record, rejouer, play |
| ○ (cercles concentriques) | wormion | |
| △ (triangles emboîtés) | trion | koins |
| □ (carrés emboîtés) | portion | |
| ◇ (losanges emboîtés) | ploxion | |
| ⊠ (un carré, un carré dedans, les diagonales) | xer ? | (le point d'interrogation est sur la page) |

Au bas de la page, un mot écrit en miroir, peut-être « HION → XERKTION ». Il n'est pas sûr.

**Page 2, en haut : quatre écrans.**

- **La carte** : une grille de glyphes reliés, un centre (un cube), des koins dans les coins du bas.
- **Le portion et le wormion** : trois écrans dont le bas est partagé en deux. À gauche le wormion, à droite le portion. Le haut change :
  - des cartes empilées et un triangle ;
  - un couloir de cadres en perspective ;
  - un grand wormion avec un tsoin.

**Page 2, en bas : « la base des koins sur téléphone ».** Quatre écrans, quatre étapes :

1. deux petits koins dans les coins du bas ;
2. des koins plus grands ;
3. de grands koins, jusqu'au milieu de l'écran ;
4. en bas, deux carrés de deux cases. À gauche : un trion au-dessus d'un wormion. À droite : un glyphe triangulaire au-dessus d'un portion.

Sous ces quatre écrans, il est écrit : **« les koins remplacent les dock/hud »**.

## Ce que l'app en fait (0.89, un prototype à corriger)

- **Les glyphes du lexique** sont redessinés d'après la page : xeroction, tsoin, wormion, trion, portion, ploxion, et xer (`src/app/glyphes.js`).
  Ils remplacent ceux repris du sprite du labo, partout dans l'app.
- **Les koins** (`src/app/koins.js`), dans ⚙ › HUD et dock › « Les koins (prototype) », coupés par défaut :
  - deux koins dans les coins du bas ; le dock de l'accueil et la barre du bas d'un ploxion s'effacent ;
  - un toucher : le koin grandit, une étape à chaque toucher, comme sur la page ; glisser vers le haut va directement aux cases ;
  - à la dernière étape : deux carrés de deux cases, et au-dessus la barre des glyphes de la page 1 (‹ ⧗ ○ △ □ ◇ ✕ ▁).

  Pour la case en haut à droite (le glyphe triangulaire de la page 2), j'ai mis le xer : c'est une supposition.

Ce que fait chaque glyphe, d'après les mots de la page. C'est **ma lecture, à confirmer** :

| glyphe | dans l'app |
| --- | --- |
| ✕ xeroction (user, params) | toi : les réglages et le compte |
| ⧗ tsoin (record, rejouer, play) | noter un tsoin ; appui long : le journal |
| ○ wormion (le temps) | ce que tu avais ouvert (⧉) |
| △ trion (koins) | le koin du ion |
| □ portion (la fractale, les types de réel) | la carte de tout le xerboxion |
| ◇ ploxion | l'accueil |
| ⊠ xer | mes xers |

## Les maillons qui manquent (❓ RS-7)

- **La case en haut à droite** (le glyphe triangulaire de la page 2) : c'est le xer, autre chose, ou le grand glyphe du panneau de droite de la page 1 ?
- **Le panneau de droite de la page 1** (le grand glyphe dessiné) : qu'est-ce qu'il montre ?
- **Le wormion** « émotionnel, temps, niveau de réel » : quelle vue ? Une frise de tes tsoins ? Les xers dans le temps ? Le portion du temps (x = xers,
  y = sessions, déjà dans la feuille de route) ?
- **Le portion** « rationnel, fractale, types de réel » : la carte du xerboxion (⊞), la fractale des bords, ou les dossiers ion, 3ion,
  seption, nexus du koin du ion ?
- **Les étapes 2 et 3** (les grands koins) : montrent-elles déjà quelque chose, ou grandissent-elles seulement ?
- **Les koins du haut** (page 1, l'écran a quatre koins) : ils servent à quoi sur le téléphone ?
- **Le mot en miroir** au bas de la page 1 : qu'est-ce qu'il dit ?
