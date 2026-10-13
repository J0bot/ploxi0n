# Le look : les inspirations de RS-7 (13.10, pour la 0.52)

*Capturées telles quelles, à trier quand on attaque le thème. Rien n'est décidé, sauf : s'inspirer de **Ryoku** d'abord (RS-7 : « plutôt
t'inspirer de ryoku ») — référence encore à recevoir (lien ou capture).*

## 1. Le Spotify de 43PR (spicetify, github.com/43PR/dotfiles)

- Des panneaux en verre fumé posés sur une photo (le fond reste visible à travers chaque zone).
- Le nom de chaque zone gravé dans son cadre, en petit en haut à gauche : « Nav », « Library », « Main », « Sidebar », « Playing » —
  chaque panneau est une fenêtre de tiling.
- Noir et blanc, police mono, filets de 1 px, presque aucun bouton plein ; la seule couleur vient des pochettes.
- Une barre du haut façon btop : CPU, RAM, température à gauche ; l'heure au milieu ; ce qui joue et le volume à droite.

## 2. « Aperture OS » (un rice KDE Plasma, thème Portal)

- Fond industriel bleu-gris très sombre, UN accent orange (Aperture), un vert pour les états.
- Des **widgets HUD** : une tête (glyphe ⚙ + TITRE en capitales espacées, et une étiquette à droite « SYS.MON // 2 s », « ENRICHMENT CTR »),
  une ligne d'état à point coloré (● ONLINE, ● NOMINAL), puis des rangées libellé · valeur · fine jauge · « OK » ; une courbe réseau.
- Tout en mono petit corps, libellés en capitales espacées ; filets fins ; aucune ombre portée lourde.
- Le terminal (kitty + fastfetch) : un logo ASCII orange, à droite les clés en orange et les valeurs en blanc, « ● SYSTEM ONLINE ».
- Le lanceur : un champ de recherche cerné d'orange, des « FAVORITEN » en icônes, des catégories en liste ; en bas, l'utilisateur ● ONLINE.
- Les dossiers de Dolphin : des contours en dégradé rose → cyan (pas de remplissage).

## Ce qu'on en tire pour ploxi0n (proposition, à valider)

- **Une seule grammaire de panneau HUD**, réutilisée partout : tête (glyphe, titre gravé, étiquette à droite), état à point, rangées
  libellé/valeur/jauge. Les mini docks, la barre d'un ploxion, le dock, les cartes du mode xerbot, les widgets de l'accueil la parlent.
- **Des « peaux » = des palettes et un fond**, pas des CSS différents : chill-tekk (l'actuel), mono (43PR), aperture (orange), ryoku.
- **btop** (le lot de ploxions) = le widget SYSTEM : ce que l'iPhone donne vraiment (batterie, mémoire de l'app, état thermique « nominal /
  chaud », disque, réseau) + le boxion (xion : /healthz, /ecosystem) ; le **xerminal** du labo dans le même esprit (fastfetch du xerboxion).
- La **bande façon niri** : chaque ploxion = une colonne-panneau avec son nom gravé dans le cadre.

## 3. LE TRAIT : la direction de RS-7 pour le trackpad et l'UI à venir (13.10)

*RS-7, 13.10 : « c'est à ça que devra ressembler le trackpad et l'UI en général dans le futur ».* Six planches de référence :
`docs/look/references/trait-01.jpg` … `trait-06.jpg`. Ce n'est plus une inspiration d'ailleurs : c'est le langage du xerboxion lui-même.

**Les couleurs** (mesurées sur les planches) : le fond `#1f1f1d` (un noir chaud, pas bleu), le trait `#ecebe9` (un blanc cassé). Rien
d'autre : monochrome. Pas de remplissage, pas de dégradé, pas d'ombre, pas de flou.

**Le trait** : une seule épaisseur par planche (≈ 1,2 à 2 % du côté), joints arrondis, une légère main (les lignes ne sont pas
parfaitement droites, les angles pas parfaitement fermés) ; les cadres extérieurs ont des **angles vifs** (« pas besoin de coins, que des
carrés »).

**La grammaire** (chaque forme est un mot du lexique) :
- **portion** : des rectangles ou des carrés **emboîtés** (concentriques, ou décalés vers un coin), 4 à 10 niveaux ;
- **koin** : des **triangles emboîtés**, dans les coins d'un cadre, ou en **spirale** (chaque triangle tourne un peu dans le précédent) ;
  un carré coupé en X donne quatre koins en spirale (trait-06) ;
- **wormion** : des **cercles ou des ovales concentriques** (un œil, une cible) ;
- **kion** : un cadre **découpé en panneaux** qui pavent tout l'espace, chacun habité par une forme emboîtée (trait-01, trait-05) ;
- **la bande** : un trapèze (une étagère vue en perspective) portant une rangée de petites formes (trait-02, trait-03) ;
- tout est un **cadre dans un cadre** : la page est un cadre, chaque zone en est un, chaque contrôle aussi (la fractale, à toutes les
  échelles).

**Pour le trackpad** (le prochain banc) : la surface sera une de ces compositions (des panneaux, des portions, des koins) ; la **texture
haptique suivra le dessin** : le doigt qui traverse un trait = un cran, un cadre plus épais ou plus extérieur = un cran plus fort, entrer
dans un panneau = une bosse ; et plus tard la reconnaissance de dessins (un motif tracé = une action).

**Pour l'UI** (à faire petit à petit, sans tout casser) : un thème « trait » à côté de chill-tekk : fond `#1f1f1d`, trait `#ecebe9`, les
cartes, boutons et tuiles en cadres emboîtés (pas de verre, pas de flou), les icônes du xerboxion en monochrome au trait (le style
xerboxion des icônes, sans les palettes), les transitions qui zooment de cadre en cadre (le portail).
