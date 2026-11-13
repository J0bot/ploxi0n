# Brief pour l'agent du labo : alléger mappion

*13.11.2026, écrit depuis ploxi0n (0.99.52) pour l'agent qui tient mappion (`/px/mappion`, le labo). Mappion n'est pas dans le dépôt
ploxi0n : ce brief s'appuie sur le code servi (`https://labo.j0bot.ch/px/mappion/app.js`, 72 Ko, 610 lignes, lu le 13.11) et sur trois
captures de RS-7 sur l'iPhone. Les numéros de ligne renvoient à ce fichier servi.*

## Ce que RS-7 demande (ses mots)

« Le mappion commence à être beaucoup trop bloat, il faut simplifier le UI et le rendre plus optimisé, parce qu'au bout d'un moment il y a
trop de traits partout et ça va faire lag mon tel ; il faut faire des zones automatiques et avoir des couleurs pour les heat map, soit
là où je vais, et de la vitesse. »

## Ce qu'on voit sur l'iPhone (les captures)

- Un mur de bandeaux blancs qui se chevauchent : « Rue du Nord · 1 h 08 · zone → zone habituelle à 10 h », « Route de Cheseaux · 1 h 14
  · zone → … », coupés aux bords de l'écran.
- Des dizaines de cercles orange pointillés le long des trajets, des grands cercles orange, des carrés verts de la grille, les tracés.
- En bas : strates, importer, rejouer, et deux boutons ronds à droite. Le texte « zone → zone habituelle à 10 h » ne parle à personne.

## Pourquoi (dans le code)

1. **Les étiquettes permanentes** (l. 385) : `bindTooltip(…, { permanent: l.s >= T_ZONE })` sur chaque lieu au-delà du seuil. Elles ne
   se cachent jamais et ne s'évitent pas : passé une dizaine de lieux dans une ville, c'est le mur blanc.
2. **Un objet Leaflet par chose** : un `L.circle` par lieu (l. 384, pointillé quand ce n'est pas encore une zone), un `L.rectangle` par
   case de la grille (l. 150, `gEmp`) et par morceau de trace (l. 265, `gChunks`), des `L.polyline` pour les traces, des `L.marker`,
   rangés dans 8 `layerGroup`. Ça grossit sans fin avec l'historique (et l'import Google). Seules les traces ont un rendu canvas
   (`traceRendu`, l. 136) ; le reste est en SVG, un nœud du DOM par forme.
3. **Rien ne dépend du zoom** : de loin on dessine les mêmes milliers de cases et de cercles que de près.
4. **Deux minuteurs qui tournent toujours** (l. 386 : toutes les 60 s ; l. 413 : `pollAmis` toutes les 7 s), même quand mappion n'est pas
   à l'écran (dans ploxi0n, un ploxion minimisé reste monté).
5. **La vitesse est déjà calculée** (`modeVitesse` l. 179, `modeGoogle` l. 175, `legendeModes` l. 184) mais elle sert à une légende,
   pas à colorer la carte.

## Ce qu'il faut faire

### 1. Des zones automatiques
- Regrouper les lieux crédités (`temps`, `crediterVisite` l. 302) proches les uns des autres en **zones** : par exemple tout ce qui est à
  moins de ~80 m d'une zone existante la rejoint ; une zone = un centre (pondéré par le temps), un rayon, un temps total, un nombre de
  visites, les heures où on y est.
- Garder les paliers (`PALIERS` l. 18 : lieu, zone, zone habituelle, vraie zone) comme **niveau** de la zone (la taille, l'intensité), pas
  comme texte : supprimer « zone → zone habituelle à 10 h » de la carte (si on veut le garder, dans la fiche de la zone, en clair : « encore
  8 h pour qu'elle devienne habituelle »).
- Le nom : `jOSCarte.revGeocode` **une fois par zone**, gardé avec elle (pas à chaque dessin).

### 2. Une carte de chaleur, pas des traits
- Un **seul** calque de dessin, en canvas (`preferCanvas: true` sur la carte, ou un calque canvas maison qui dessine la grille d'un
  coup). Les points (veille + traces importées) agrégés dans une grille dont la taille de case dépend du zoom (≈ 25 m de près, ≈ 400 m de
  loin, ≈ 5 km au niveau du pays). Une case = une couleur. Plus aucun `L.rectangle`, `L.circle` ni `L.polyline` par élément.
- **Deux couleurs au choix** (un seul bouton qui bascule) :
  - **le temps passé** (là où je vais) : bleu foncé = de passage, cyan, jaune, orange, rouge = là où je vis ;
  - **la vitesse** (`modeVitesse` par segment) : vert = à pied, jaune = vélo, orange = voiture, violet = train, gris = inconnu.
- De près, si on veut voir le trajet exact : les traces **simplifiées selon le zoom** (`eclaircir` l. 208 garde un point tous les 15 m :
  ajouter un Douglas-Peucker dont la tolérance suit le zoom), et un plafond de points dessinés par vue (quelques milliers).
- Ne dessiner que ce qui est **dans la vue** (plus une marge), et seulement **à la fin d'un déplacement** (`moveend`, `zoomend`), dans un
  `requestAnimationFrame`.

### 3. Une étiquette à la fois
- Aucune étiquette permanente. Toucher une zone : une seule fiche (son nom, son temps, ses heures, son niveau), qui se ferme quand on
  touche ailleurs. Optionnel : au zoom proche, les noms des 3 à 5 zones les plus fortes, en petit, sans chevauchement.

### 4. Un écran épuré
- Gardés à l'écran : la marque (mappion · le nombre d'amis), le bouton **temps / vitesse**, le bouton **me recentrer**.
- Dans un menu (un seul bouton « … ») : strates, importer, rejouer, le fond satellite ou plan.
- Les cercles pointillés des lieux pas encore « zone » : retirés (la chaleur les montre déjà).

### 5. Ne rien faire quand on ne regarde pas
- Les deux `setInterval` (l. 386, l. 413) : arrêtés quand la page est cachée (`visibilitychange`) ou que mappion n'est pas devant, relancés
  au retour. Dans ploxi0n, `src/app/gel.js` met déjà en pause les `requestAnimationFrame` d'un ploxion caché, pas ses minuteurs.

## Ce qu'il ne faut pas casser

- **Les données restent compatibles** : `temps` (les lieux crédités), les traces dans IndexedDB (`idb`, l. 168), les souvenirs 🧿 (jOSBoxion
  « mappion / souvenirs »), les chunks. Le terrax de ploxi0n lit les souvenirs (`box:mappion` / `mappion:souvenirs`). Les zones peuvent
  être calculées à la volée ou gardées à part ; ne pas réécrire l'historique.
- **Composer, ne pas rebâtir** : jOSCarte (la carte, le géocodage), jOSZone, jOSVeille (la veille en arrière-plan de l'iPhone), jOSPresence
  (les amis). Si la grille de chaleur sert ailleurs (le terrax, Autour), en faire un bion (`jOSChaleur` ?) plutôt que du code dans mappion.
- **La carte de chaleur doit être un bion commun, pas du code de mappion** (RS-7, 13.11 : « et aussi à Proche, bien sûr »). Elle servira à
  mappion, au terrax, à Autour, et à **Proche** dans ploxi0n (`src/lot/proche.js`, la page potes et la carte du maillage) :
  - **où le groupe passe du temps** pendant une soirée : les positions que les potes ✦ partagent déjà (chiffrées, gardées en mémoire par
    Proche, jamais plus longtemps qu'aujourd'hui) agrégées en chaleur, pour voir où tout le monde se retrouve ;
  - **la couverture du maillage** : là où tu as eu des voisins Bluetooth (combien, à quelle distance en sauts), pour savoir où le maillage
    tient et où il faut un relais (un Pi, un ESP32, docs/protocole/MAILLE-v1.md) ;
  - la vitesse pour les potes : qui marche, qui roule, sans afficher les trajets exacts.
  Proposition de contrat, pour que ploxi0n le compose sans rien réécrire : `jOSChaleur.creer({ carte, mode: 'temps' | 'vitesse' | 'densite',
  case: (zoom) → mètres })` → `{ ajouter(points: [{ lat, lng, t, poids?, vitesse? }]), vider(), mode(m), zones({ rayon, min }) → [{ lat, lng,
  rayon, s, visites, heures }], detruire() }` ; pur côté calcul (les zones, l'agrégation testables sans carte), le dessin sur un canvas posé
  sur n'importe quelle carte (Leaflet du labo, les tuiles de Proche, le radar). Le servir seul par `/px/bion-app/jOSChaleur.js`, comme
  jOSKnob et jOSSwipe, pour que ploxi0n l'embarque.
- **La position reste sur le téléphone** (comme aujourd'hui) ; les amis ne voient que ce qu'ils voient déjà.
- Dans ploxi0n, `window.jOSVeille.balade` existe (0.99.43) : mappion peut lancer la Live Activity d'une balade (le chrono, la distance, une
  cible) sur l'écran verrouillé. Optionnel, mais c'est l'activité que RS-7 voulait pour mappion (docs/MAPION.md de ploxi0n).

## Comment vérifier

- Un historique lourd (l'import Google de RS-7, des mois de veille) : la carte doit rester fluide au doigt (60 images par seconde) de la
  vue « pays » à la vue « rue », et ne compter que quelques nœuds dans le DOM (une couche canvas, les boutons, une fiche).
- Aucune étiquette visible sans toucher ; une seule à la fois.
- Mappion minimisé dans ploxi0n : plus aucune requête `pollAmis`, plus aucun travail toutes les 60 s.
- Le bouton temps / vitesse change les couleurs sans recharger les données.
