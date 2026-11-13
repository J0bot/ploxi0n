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

## Le wormion et le portion, de gros knobs (RS-7, 23.10)

« Faut voir le wormion et le portion comme des gros knobs qui sont connectés à plein de knobs ; chaque action est un knob. » Le wormion
(le temps) et le portion (la fractale) ne sont pas des boutons mais des **knobs maîtres** : tourner l'un entraîne les knobs qui lui sont
reliés. Chaque action de l'app est elle-même un knob. Ce qui existe pour le composer : jOSKnob (le bion du labo, embarqué), les gènes de
l'atelier des peaux (`src/bions/genome.js`), les paliers figés du zoom (`src/bions/zoom.js`), les pads des koins (`src/app/pads.js`).
💭 Spéculatif : un knob maître = une liste de knobs reliés avec un poids chacun.

## Le koin qui s'ouvre, le xer dans la case (0.99.47, RS-7 12.11)

**Voulu.** « Je veux pas trois tailles de koin, je veux une animation du koin qui s'agrandit et qui se transforme en koin ouvert pour avoir
l'écran avec le portion et le wormion. » « Améliorer l'animation du portion et du wormion. » « Quand on est en mode koin, pas besoin d'avoir
le nom de l'appli ploxi0n avec les sections organic, chill-tekk, xerboxion et xerbot : il faut qu'on puisse changer ça avec le truc xer. »
« Le koin du ion, c'est un concept, mais il faut trouver l'utilité. »

**Fait.**
- **Une seule ouverture** (`src/app/koins.js`, `ETAPES = 2`) : un toucher, le triangle du coin grandit depuis son angle et s'efface pendant que
  les cases se révèlent dans un triangle qui **s'ouvre en carré** (un clip-path à 4 points, réglé par `--k` de 0 à 1) ; la barre descend, le
  voile monte. Glisser vers le haut : `--k` suit le doigt, lâcher après 40 % ouvre, avant referme. La fermeture rejoue l'animation à l'envers.
- **Le wormion** tourne avec le doigt, chaque cercle à sa vitesse (le dehors lent, le cœur vite : un tunnel du temps), une onde à chaque cran,
  retour en place au lâcher. **Le portion** : les carrés suivent le doigt en profondeur (un couloir de cadres, comme la page 2 du carnet),
  ↑ les écarte (dézoomer, la map), ↓ les fait plonger. Au repos, les deux respirent (rien en mode calme).
- **Le xer** : en mode koin, l'en-tête de l'accueil (le nom, les onglets des modes) s'efface ; la case ⊠ « ton xer » ouvre les quatre xers sur
  place (organique, chill-tekk, xerboxion, xerbot), le courant en surbrillance ; en toucher un change l'accueil. Appui long : mes xers.
- Corrigé en passant : les actions « mes xers » et « carte » étaient avalées par un commentaire dans `main.js` (la case xer et le toucher du
  portion ne faisaient rien).

**Le koin du ion : une proposition (💭, à trancher par RS-7).** Le wormion est le temps (ce qui a été), le portion la structure (la fractale,
les types de réel). Il manque un troisième axe : **ici, maintenant**. Le trion serait le koin où tu es : ce qui vit en ce moment (les ploxions
vivants), qui est autour (les voisins de Proche), où (Autour, la case), le tsoin en cours. Posé pour l'instant : la case dit « 3 vivants · 2
voisins » ; un toucher ouvre toujours le hub du koin du ion (les dossiers ion, 3ion, seption, nexus, `src/terrax/koin-ion.js`). À décider :
le trion devient-il un vrai panneau « ici » (un trackpad comme les deux autres ?), ou garde-t-il la balade entre les réels ?

## 0.99.57 : le koin du chill-tekk du labo (RS-7 : « plutôt ça l'inspi »)

Référence : `docs/look/references/koins-03-chill-tekk-labo.png`.
- **La bande entre les koins** = la barre des glyphes, toujours là, fermée ou ouverte : `‹ › ⧗ ○ △ □ ◇ ✕ ⓘ ▁` (› = le ploxion suivant). Un
  trapèze au trait : ses bouts suivent l'hypoténuse des deux koins. Dans un ploxion, elle tient lieu de sa barre (le ploxion s'arrête au-dessus)
  et ◇ s'encadre : tu es dans un ploxion.
- **Les koins restent dans leurs coins** (ils ne grandissent plus jusqu'à s'effacer) ; ce sont les cases qui sortent d'eux (le même clip-path
  triangle → carré).
- **Le koin ouvert** : quatre cases en tunnel (un cadre vif, un second dedans, des cadres qui s'enfoncent), un grand glyphe chacune, sans texte :
  △ le trion (en haut à gauche), l'hypercube du xer (en haut à droite), ○ le wormion, □ le portion. Le nom et l'aide d'un trackpad
  n'apparaissent que pendant le geste. En mode organique, les cases gardent leurs membranes.
