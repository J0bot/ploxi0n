# Les animations : la grammaire du mouvement (téléphone, puis desktop)

*12.11.2026, ploxi0n 0.99.50. RS-7 : « les animations c'est le plus important, pck ça montre d'où ça vient quand ça s'ouvre ou se ferme,
c'est intuitif ; prendre exemple sur le UI iPhone, c'est eux les pros » ; « il va falloir les incorporer sur desktop aussi ; un document par
rapport à tout ça, et extrapoler avec moi le zbeul ».*

Ce document a trois parties, à ne pas mélanger : **ce qui est posé** (ce que l'app fait aujourd'hui, avec le fichier où ça vit), **ce qui est
proposé** (une grammaire et des jetons communs, pour le téléphone et le desktop ; à valider), et **le zbeul** (l'extrapolation, spéculatif,
marqué 💭). Les questions pour RS-7 sont à la fin.

---

## 1. Le principe : le mouvement dit d'où ça vient

Une animation n'est pas une décoration : c'est **une phrase qui explique un changement d'état**. Ce que fait iOS (et ce qu'on prend) :

1. **La provenance.** Tout ce qui s'ouvre sort de ce qu'on a touché (l'icône, le bouton, le coin), et tout ce qui se ferme y retourne. Sans
   provenance, l'écran « change » ; avec, on comprend où on est allé et comment revenir.
2. **La réversibilité.** Fermer, c'est ouvrir à l'envers, par le même chemin. Le cerveau mémorise un trajet, pas deux.
3. **La manipulation directe.** Quand un geste peut piloter l'animation, le doigt la tient (le koin qui suit le doigt, la fractale, le wormion
   qui tourne) ; lâcher la termine dans le sens où elle allait, avec la vitesse du lancer.
4. **L'interruption.** Une animation en cours peut être reprise : rouvrir un ploxion pendant qu'il se referme le ramène, sans saut.
5. **La physique, sans rebond inutile.** Rapide au départ, atterrissage doux (un ressort amorti). Le rebond est réservé à ce qui est
   vivant ou joueur (une tuile posée, un choc), jamais à la navigation.
6. **Une seule chose bouge à la fois** (ou un groupe qui bouge ensemble). Le reste se tait ou recule.
7. **Le corps suit.** Chaque mouvement important a son haptique (src/natif/haptique.js : fx-ouvrir, fx-arrivee, fx-cran…) ; le son viendra
   (le zbeul, §6).
8. **Réduire les animations.** « Réduire les animations » d'iOS, ou ⚙ › Calme : plus de mouvement, des fondus courts à la place
   (`html.px-calme`, `prefers-reduced-motion`). Jamais une information portée seulement par le mouvement.
9. **La performance.** Seulement `transform`, `opacity`, `clip-path` (le GPU) ; jamais `width`, `top`, `left` pendant une animation ; 60 ou
   120 images par seconde, sinon ça ment.

---

## 2. Ce qui est posé (l'inventaire, 0.99.50)

### 2.1 Naviguer entre les ploxions

| animation | quand | le mouvement | durée, courbe | où | provenance |
|---|---|---|---|---|---|
| **Sortir de l'icône** (0.99.48) | toucher une icône de l'accueil | le ploxion part du carré de son icône (échelle uniforme + clip-path aux coins d'icône d'iOS) et grandit jusqu'à l'écran | 420 ms, `.2,.88,.24,1` | `src/app/zoom-icone.js`, `routeur.js` (montrer) | ✅ |
| **Rentrer dans l'icône** (0.99.48) | ▁ minimiser, ‹ vers l'accueil, le geste accueil | le chemin inverse ; sans icône à l'écran : il s'efface vers le milieu | 360 ms | idem (versAccueil) | ✅ |
| **Le glissement** | un bord : l'app d'avant / d'après | l'app sortante part en 3D (rotateY 22°, recule à 0,8), l'entrante arrive de l'autre côté ; un trait de lumière balaie l'écran ; plus rapide si on lance vite | 380 / 460 ms, `.4,0,.2,1` et le ressort `.16,1,.3,1` | `src/app/fractale.js` (glisser) | ✅ (le sens du geste) |
| **La fractale** | tenir un bord | l'app rapetisse au milieu, ses voisines de chaque côté (un paquet de cartes) ; tenir plus : le slider défile ; jeter une carte vers le haut la ferme | continu, piloté au doigt | `fractale.js` | ✅ |
| **La carte du xerboxion** | pincer la fractale, ⊞ | dézoom : l'accueil devient un cube au centre, les koins autour | | `carte-xer.js` | ✅ (dézoom) |
| **La map en carrés** | ▦, le portion ↑ | un hub au centre, ses voisins qui dépassent ; glisser va au voisin ; dézoom : `px-recule` | 320 ms | `map-hubs.js` | ✅ |
| **La bande (niri)** | ⚙ › Navigation | les ploxions en colonnes, le nouveau s'ouvre à droite | | `bande.js` | ✅ |
| **Entrer (sans icône)** | un ploxion ouvert par Siri, un lien, un mini dock | un petit fondu qui monte (`px-entre`) | 200 ms | `app.css` | ❌ pas de provenance |
| **Revenir au ploxion d'avant** | ‹ quand la pile n'est pas vide | instantané | | `routeur.js` (retour) | ❌ |

### 2.2 Les koins, le wormion, le portion (0.99.47)

| animation | le mouvement | où |
|---|---|---|
| **Le koin qui s'ouvre** | un toucher : le triangle du coin grandit depuis son angle et s'efface ; les cases se révèlent dans un triangle qui s'ouvre en carré (clip-path, `--k` de 0 à 1) ; la barre descend, le voile monte. Glisser : `--k` au doigt, lâcher après 40 % ouvre. Fermer : à l'envers | `koins.js`, `app.css` (`.px-koins-r`) |
| **Les xers dans la case** | les quatre modes apparaissent en cascade (`px-koin-mode`, 40 ms de décalage) | idem |
| **Le wormion** | chaque cercle tourne avec le doigt à sa vitesse (×0,15 à ×1,6 : un tunnel du temps) ; une onde à chaque cran ; retour en place au lâcher ; respire au repos | `pads.js` |
| **Le portion** | les carrés suivent le doigt en profondeur (×0,08 à ×0,7 : un couloir de cadres) ; ↑ écarte, ↓ plonge ; une onde au changement de direction | `pads.js` |

### 2.3 L'accueil, les feuilles, les petits signes

| animation | le mouvement | où | provenance |
|---|---|---|---|
| **La cascade des tuiles** | en arrivant sur l'accueil : les 16 premières tuiles se posent une à une (`px-pose`, 14 ms de décalage, un léger rebond) | `app.css` | ✅ (l'arrivée) |
| **Le tri** | en édition, les icônes tremblent (`px-tremble`, comme iOS) | `app.css` | ✅ |
| **Le choc** | une icône secouée (`px-choc`) | `app.css` | — |
| **Les feuilles et tiroirs** | le voile se fonce (`px-fondu`, 160 ms), la feuille monte du bas (`px-monte`, 240 ms) | `app.css` | ⚠ du bas, pas du bouton |
| **La bulle** | un message monte (`px-bulle`) | `app.css` | ⚠ |
| **Les paliers du zoom** | le nom du palier s'affiche puis s'efface (`px-palier-nom`, 1,8 s) | `app.css` | — |
| **Le tuto des bords, l'appui** | des impulsions sur les bords (`px-bord`), un cercle qui s'ouvre (`px-appui`) ; le doigt fantôme des démos | `app.css`, `demo.js` | ✅ (montre le geste) |

### 2.4 Le vivant (le mouvement ambiant)

| animation | le mouvement | où |
|---|---|---|
| **Le thème vivant** | le gyroscope : le fond glisse à l'opposé (parallaxe), les icônes flottent, leur ombre suit, la lumière attrape l'arête | `mouvement.js` (`--mx`, `--my`) |
| **Le téléphone vivant** | un bord lumineux qui respire ; la chaleur l'accélère, la batterie le pâlit, le son le fait battre | `tel-vivant.js` (`px-tv-souffle`) |
| **Les neurones, les membranes** (organique) | les éléments se collent comme des cellules, les bords ondulent | `neurones.js` |
| **Le cube, la salle** | un cube qui suit le téléphone ; dans le cube, une salle en vraie 3D, le point de vue au gyroscope | `cube.js`, `cube-interieur.js` |
| **Freefall** | l'app entière au gyroscope : pencher fait défiler | `fractale.js` |
| **Le regard** (0.99.46) | un point qui suit la tête ou le regard ; un anneau qui se remplit quand on fixe ; un éclair au toucher | `regard.js` |
| **Le gel** | les animations d'un ploxion caché sont mises en pause (pas de mouvement invisible qui mange la batterie) | `gel.js` |

### 2.5 L'état des lieux (les trous)

- **Les jetons sont éparpillés** : une dizaine de courbes différentes (`.16,1,.3,1` ×7, `.2,.9,.3,1` ×6, `.2,.9,.25,1`, `.3,.7,.4,1`,
  `.2,.9,.3,1.1`, `.2,.8,.2,1`, `.3,1.6,.4,1`…) et une douzaine de durées (120, 160, 200, 220, 240, 250, 260, 280, 300, 320, 380, 420,
  460 ms). Ça marche, mais rien ne garantit que deux choses de même nature bougent pareil.
- **La provenance manque** dans : les feuilles et tiroirs (ils montent du bas, pas du bouton touché), les dossiers, les réglages ouverts par
  ⚙, les nouveautés, un ploxion ouvert par un mini dock, une case des koins, Siri ou un lien (fondu générique), le retour au ploxion d'avant
  (instantané), le changement de mode ou de xer (instantané), une notification touchée.
- **Deux moteurs** : du CSS (`@keyframes`, transitions) et du JS (Web Animations : `fractale.js`, `zoom-icone.js`). Les deux se valent ;
  il manque une **bibliothèque commune** pour « ouvrir depuis », « fermer vers », « glisser » et « révéler ».

---

## 3. Ce qui est proposé : les jetons et le moteur (à valider)

### 3.1 Quatre courbes, cinq durées (des variables CSS, les mêmes partout)

| jeton | valeur | pour |
|---|---|---|
| `--px-c-entre` | `cubic-bezier(.2,.88,.24,1)` | ce qui arrive, s'ouvre, grandit (iOS : rapide puis doux) |
| `--px-c-sort` | `cubic-bezier(.4,0,.2,1)` | ce qui part, se ferme (accélère en sortant) |
| `--px-c-ressort` | `cubic-bezier(.16,1,.3,1)` | ce qui est lâché par le doigt (l'inertie, sans rebond) |
| `--px-c-vivant` | `cubic-bezier(.3,1.6,.4,1)` | le joueur seulement : une tuile posée, un choc (un rebond) |
| `--px-d-instant` | 120 ms | un retour d'état (un bouton, une case) |
| `--px-d-court` | 220 ms | un petit élément (une bulle, une puce, un fondu) |
| `--px-d-moyen` | 360 ms | une feuille, une case, une fermeture |
| `--px-d-long` | 440 ms | un écran entier qui s'ouvre (un ploxion, une map) |
| `--px-d-ambiant` | 4 à 6 s | ce qui respire |

Règles : une fermeture dure ~85 % de son ouverture (on part plus vite qu'on arrive) ; un geste lancé vite raccourcit (jusqu'à ×0,62, comme
le glissement) ; Calme : tout passe à `--px-d-instant` en fondu.

### 3.2 Un bion du mouvement, partagé (téléphone, desktop, labo)

Composer, pas rebâtir : `zoom-icone.js` est déjà le cœur. Le généraliser en un bion (proposition de nom : **`mouvion`**) :

- `ouvrirDepuis(source, cible, { forme })` : n'importe quel élément sort de n'importe quel autre (une feuille sort de son bouton, un dossier
  de sa tuile, un ploxion de sa case de koin, d'une notification, du mini dock). `forme` : `icone` (carré arrondi), `bouton` (pilule),
  `coin` (triangle), `cercle`.
- `fermerVers(source, cible)` : le chemin inverse ; cible absente → le milieu, en s'effaçant.
- `glisser(sortant, entrant, sens, vitesse)` : le glissement de la fractale, réutilisable (les pages, les onglets, les hubs de la map).
- `reveler(el, forme, k)` : le clip-path piloté par un nombre de 0 à 1 (le koin, et tout ce qui s'ouvre au doigt).
- `suivre(el, geste)` : relie un geste (doigt, souris, molette, regard) à `k`, avec le seuil (40 %) et la vitesse du lâcher.
- Tout respecte les jetons, Calme, et s'interrompt (`annuler()` rend l'état d'où il partait).

Le même bion tourne dans ploxi0n (iPhone, Android), sur desktop et dans les ploxions du labo (`jOSmouvion` côté labo). Une animation
réglée une fois l'est partout.

### 3.3 Le desktop : transposer, pas copier

Ce qui ne change pas : la provenance, la réversibilité, les jetons, les haptiques deviennent des sons très discrets (option). Ce qui change :

| sur le téléphone | sur le desktop |
|---|---|
| toucher une icône → le ploxion sort de l'icône | cliquer → la fenêtre sort de l'icône (le dock, le bureau) ; ▁ la renvoie dedans (comme le « génie » de macOS, en plus sobre) |
| les bords (tenir, glisser) | les bords de l'écran à la souris, et le trackpad à deux doigts (glisser = l'app d'à côté, pincer = la fractale puis la map) |
| les koins dans les coins du bas | **des coins actifs** (hot corners) : la souris dans un coin ouvre son koin, avec la même animation triangle → carré |
| le wormion (tourner le doigt) | la molette, ou deux doigts qui tournent ; ⌃ + molette pour le temps |
| le portion (glisser dans une direction) | les flèches + une touche, ou trois doigts sur le trackpad |
| la fractale (le paquet de cartes) | ⌘/Ctrl + Tab, mais en fractale : l'app au milieu, ses voisines de chaque côté |
| une colonne à la fois | la bande (niri) devient naturelle : plusieurs colonnes, le nouveau à droite |
| le survol n'existe pas | **le survol préfigure** : survoler une icône montre en petit d'où le ploxion sortira (un aperçu de 120 ms), sans rien ouvrir |
| le gyroscope (parallaxe) | la position de la souris donne la parallaxe (`--mx`, `--my` depuis le pointeur) |
| un écran de 6 pouces | des fenêtres : les animations se jouent dans la fenêtre et ne débordent jamais sur le reste de l'écran |

---

## 4. Ce qu'il faudrait faire, dans l'ordre (des phases montrables)

1. **Les jetons** : les variables de §3.1 dans `app.css`, et les ~60 transitions et 23 keyframes qui s'y rangent (sans rien changer à
   l'œil : un renommage). Un test vérifie qu'aucune courbe ou durée « en dur » ne revient.
2. **Le bion `mouvion`** à partir de `zoom-icone.js`, avec ses tests (la géométrie, l'interruption, Calme).
3. **La provenance partout** : les feuilles sortent de leur bouton, les dossiers de leur tuile, les cases de koin, le mini dock, les
   notifications ; le retour au ploxion d'avant glisse (le chemin de la pile) ; le changement de xer se voit (§6).
4. **Le desktop** : quand on saura où il vit (❓ ci-dessous), le même bion, les transpositions de §3.3.
5. Le faux iPhone a déjà de quoi figer une animation à mi-chemin (`parcours-zoom.mjs`) : chaque animation aura sa capture figée, pour
   la relire sans téléphone.

---

## 5. Les mesures (pour régler sur l'iPhone)

Ce qui ne se voit pas sur le faux iPhone et qu'il faut sentir au doigt : la durée de la sortie de l'icône (420 ms paraît long sur iPhone ?
iOS est vers 400–500 ms avec un ressort), le seuil du koin (40 %), la vitesse des cercles du wormion, si le grand triangle qui grandit avant
de s'effacer se lit bien ou fait « flash », si le trait de lumière du glissement plaît encore. Le banc de l'app (Banc iPhone) pourra
mesurer les images par seconde de chaque animation.

---

## 6. Le zbeul 💭 (l'extrapolation : rien de posé, tout à discuter)

Des pistes, de la plus proche à la plus folle. Aucune n'est voulue tant que RS-7 ne l'a pas dit.

- 💭 **Une seule caméra.** Il n'y a plus d'« écrans » : le xerboxion est un plan infini (la map), et tout mouvement est un déplacement de
  la même caméra. Ouvrir un ploxion = zoomer dans son koin ; l'accueil = reculer d'un cran ; la carte = reculer encore. La vision
  originelle (« une map géante où il y a toutes les applications ; on dézoome l'app pour aller dans d'autres apps ») devient littérale, et
  la provenance est gratuite : tout vient de quelque part sur la carte.
- 💭 **La grammaire ionique en mouvement.** `ON` (le chaos) + `I` (l'observateur) = `ION` (le réel) : quand quelque chose apparaît, il
  sort d'un nuage de particules (ON) qui se condense sous ton regard (I) en forme nette (ION). Le chargement d'un ploxion serait ce nuage,
  pas une roue.
- 💭 **Le wormion rembobine les animations.** Le temps n'est pas qu'une liste : tourner le wormion à l'envers rejoue tes derniers gestes à
  l'envers (le ploxion rentre dans son icône, la feuille redescend…). Chaque transition est un **tsoin** de navigation, rejouable.
- 💭 **Le xer qui se retourne.** Changer de xer (de mode) n'est pas un clignement : l'interface est une face du cube, et le cube tourne
  vers la face du nouveau xer (le cube intérieur existe déjà). Les mêmes ploxions, une autre peau : on voit que la donnée ne bouge pas.
- 💭 **Le koin portail.** Passer d'un hub à l'autre de la map, c'est traverser un portion : un couloir de cadres en perspective (le carnet,
  page 2), la même animation que le pad du portion, en plein écran.
- 💭 **La trinité image, corps, son.** Chaque mouvement a sa vibration (déjà) et son son (le chill-synth : une ouverture monte d'une
  quinte, une fermeture redescend, un cran est un tic accordé à la gamme du xer). Les mêmes courbes pilotent les trois.
- 💭 **Le mouvement qui saute d'un appareil à l'autre.** Le maillage relie les appareils : envoyer un ploxion du téléphone au desktop, il
  sort par le bord de l'écran du téléphone et entre par le bord du desktop, du côté où le téléphone est posé (le Bluetooth sait à peu près
  où il est). La provenance devient physique.
- 💭 **La masse.** Chaque chose a un poids (son importance, sa taille, son activité) : les lourdes bougent lentement, les légères filent ;
  lancer une carte vide la fait voler, une carte pleine glisse. Le monde a une physique, pas des durées.
- 💭 **Le regard pilote la caméra.** Avec PloxiRegard, ce que tu regardes s'approche un peu, le reste recule (une profondeur de champ
  pilotée par l'attention) ; sur desktop, la même chose avec la webcam, si tu l'acceptes.
- 💭 **Les fenêtres organiques (desktop).** Sur desktop, les fenêtres sont des cellules : elles se collent (les neurones), se poussent,
  fusionnent en un cubion quand on les glisse l'une dans l'autre (« diviser et fusionner »), se séparent d'un geste (la mitose).

---

## 7. Questions pour RS-7 (pour extrapoler ensemble)

1. **Le desktop, c'est quoi exactement ?** La même app (ploxi0n dans une fenêtre, Tauri ou Electron), `xb` sur Windows et Linux, le labo
   dans le navigateur, ou un vrai bureau (un xer plein écran qui remplace celui de l'OS) ? La transposition de §3.3 change beaucoup selon.
2. **Les jetons de §3.1** : on part là-dessus ? Et le nom du bion (`mouvion`, ou un autre mot de la grammaire) ?
3. **« Une seule caméra » (§6)** : c'est la direction, ou trop loin pour maintenant ? Si oui, l'accueil en grille devient une vue de la map,
  et ça change tout le reste.
4. **Le rebond** : réservé au joueur (ma proposition), ou tu veux plus de vie partout ?
5. **Le son** des mouvements : oui, non, en option ?
6. **Ce qui te choque aujourd'hui** sur l'iPhone, en mouvement : ce qui saute, ce qui est trop lent, ce qui « flashe ». C'est par là qu'on
  commence la phase 3.
