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
