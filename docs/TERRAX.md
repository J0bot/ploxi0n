# Le terrax

Le braindump de RS-7 (14.10.2026), capté tel quel, puis ce qui est posé dans ploxi0n et les quêtes ouvertes.
Les néologismes ne se traduisent pas. On distingue toujours le **posé** (ce qui tourne) du **spéculatif** (la vision, à valider).

## 1. Ce que RS-7 a dit

### Le Pokémon Go du nexus

- « Je veux lancer le Pokémon Go du nexus : c'est un ploxion qui a l'équivalent xerboxion de Pokémon Go, mais c'est pour mapper des
  trucs en 3D en AR dans le monde, dans le réel. »
- « Il y a un endroit où il n'y a rien, ou un parc chiant : on peut ajouter des trucs en AR. »
- « Quand on achète un truc, un robot, ou chez IKEA : on peut mapper nos objets et nos meubles en AR. »
- C'est la **convergence** du ploxion chambre, du ploxion mapping, du mapion, du ploxion 3d, du ploxion cad et du ploxion nexus :
  ça sera **le ploxion terrax**.
- Sur mappion, gravé à la Promenade Robert-Hainard le 14.10 à 20:57 : « Départ du terrax, la convergence des idées : Pokémon Go
  mélangé à Google Maps mélangé à Blender, FreeCAD, KiCad, Minecraft de la vie. Le xerboxion du terrax et du terrion, terra. »

### Les noms

- **terrion** : la terre dans le réel. La map de base calquée sur le réel : l'état actuel du réel.
- **terrax** : le « ax » de la terre. Son interface à elle, la nôtre pour y aller : notre version de Pokémon Go.
- **xerion** : nous. On utilise le **Xerax** pour utiliser le terrax.
- Le lexique du labo (`my_website2/docs/lexique.md`) le disait déjà : « terrion = le réel de la Terre » ; « **terraxion** = la Terre
  copiée dans le xion en temps réel, somme des tsoins des capteurs ». Le terrax en est l'abréviation.
- Après : **marsion**, **solax**, **solion**, **galaxion**.

### L'AR

- « Important que pour l'AR on a l'impression de regarder une version 3D du réel. »
- On peut aider à la mapper, et ça part directement au **nexus**, commun à tout le monde.
- Mais on peut le désactiver, et mapper des trucs que pour soi : une chambre.

### Comment le construire

- « Il faut prendre tous les projets open source de ça et les fusionner dans mon app. »
- « Mais attention : toujours commencer par prendre les bions et ploxions déjà dans le nexus ; sinon, au pire, on fait nos propres
  bions. »
- « Le but, c'est le plus possible propre de la machine, pour avoir les performances maximales : du vrai codage optimisé au max pour
  iPhone. »

### L'aventure et les quêtes du terrax

- « C'est l'aventure et les quêtes du terrax : implémenter tout ça. Le but du jeu, c'est que tout le monde m'aide à l'implémenter. »
- « Que ce soit du code de zinzin ultra optimisé ou un rewrite Rust vibe-codé au max, tout est permis. »
- « Le but, c'est d'arriver au xerboxion du terrax et du terrion : franchir les limites du réel. »

### Les paliers du réel

- On a le **3ion**, puis le **4ion**, le **5ion**, le **6ion**. Ce n'est pas comme 2D ou 3D : ce sont des **paliers de réel**.
- Le **seption** (le 7ion) : le maximum possible comme dimensions. Tout ce qu'on sait et peut faire, c'est le seption. Le but : améliorer
  le seption de notre réel.
- L'**oction** : la dimension âme.
- La dimension **conscience** est entre le 7ion et l'oction : les abords du réel, le chaos.
  - On s'en rapproche toujours, mais à l'infini : il faut trouver autre chose que l'infini pour y arriver.
  - La physique quantique, les particules, la théorie des cordes : ce sont les abords du réel, la fin du seption.
- Le **septax** : atteindre le réel de notre cerveau.
  - N'avoir plus qu'à penser pour utiliser.
  - Plus de pause, plus de temps à prendre : tout est instantané, tout est là.

### Les niveaux de Xerax

- **Xerax 1** : le clavier, la souris (maintenant), et les haptics.
- **Xerax 2** : les ondes cérébrales. On commande par la pensée.
- **Xerax 3** : on peut faire des instances de cerveau.
- **Xerax 4** : instancier des réels. L'imagination mélangée à la réalité, entièrement : ça ne fait plus qu'un seul monde cohérent.
  C'est le septax.

### Le LSDION

- En tant qu'espèce, avec le LSD on n'atteint que le seption, et pas dans le réel : on va dans le **LSDION**, une autre dimension, propre
  à elle.
- C'est un peu le **portion** et le **wormion** purs.
- Le réel : une petite singularité, avec des trous de vers autour.

### Le koin du ion

- Le koin du ion (centre « ion » ; kion, trion, koin, wormion, portion, spherion, ion, fractale ; les portails Temps, Monde 3D, Bions).
- « Je veux qu'il y ait les dossiers : ion, 3ion, seption, nexus… et pouvoir se balader dedans avec le portion : une balade entre les
  réels. »

## 2. Posé : le ploxion terrax dans ploxi0n

Depuis la 0.71, **terrax** est un ploxion de l'app (`src/terrax/terrax.js`). Il est natif : aucun réseau requis pour jouer chez soi.
Il a quatre pages, qui sont aussi les faces de son cube (▣).

- **terrion** (la carte) : la carte du réel, avec ta position et ce qui est posé autour. Un moteur de tuiles minimal, sans bibliothèque
  (un plan, un transform). Toucher la carte : poser quelque chose à cet endroit.
- **terrax** (l'AR) : la caméra, avec par-dessus ce qui est posé autour de toi, à sa vraie direction et à sa distance. Il utilise le GPS,
  la boussole et l'inclinaison de l'iPhone. « Poser ici » : à quelques pas devant toi.
- **chambre** (à toi seul) : tes objets à toi, jamais envoyés au nexus. Ton robot, ton meuble IKEA, avec un nom, une photo et une place.
- **quêtes** : les quêtes du jeu, avec leur avancée, et les quêtes du code, pour celles et ceux qui veulent aider.

Ce qui est posé est **à toi par défaut**, gardé dans boxion_local (« terrax/objets »). Partager au nexus est un geste explicite, par objet.

**Composé avec ce qui existe déjà** (l'inventaire du nexus, 14.10) :

- **mappion** (le labo) : ses souvenirs 🧿 sont une couche du terrion et du terrax, en lecture. Le même fond satellite (ArcGIS World Imagery).
- **jOSNexus** (le labo) : le même protocole. Partager = `POST /nexus/push { kind: 'ancre', payload }`. Les ancres des autres =
  `GET /nexus/pull?kind=ancre`. Le shim les relaie au labo en mode connecté ; hors ligne, le terrax le dit et rien ne casse.
- **L'ancre** : `{ id, lat, lng, alt, cap, ion, txt, portee, ts }`. C'est la forme proposée pour le bion d'ancres du nexus, le seul bion
  de données qui manque vraiment.
- **Le vrai nord** : CoreMotion démarre dans le repère du nord magnétique, et son cap arrive dans la page comme `webkitCompassHeading`
  (AppDelegate.swift, `src/natif/web-natif.js`). Sans lui, l'AR ne savait pas où regarder.
- **Le koin du ion** : les dossiers ion, 3ion, seption et nexus sont semés dans les hubs perso du labo (`src/terrax/koin-ion.js`, le
  format de jOSXerkionHub). Glisser à droite monte d'un palier (ion → 3ion → seption → ion), à gauche on redescend, en haut on ressort
  au koin du ion, en bas c'est le nexus. Le terrax est un koin du 3ion et du nexus.

### L'AR native (0.73)

RS-7 (15.10) : « le plus important de tout, c'est l'AR ; utiliser au max les fonctions natives ; et AR Quick Look ».

- **Les yeux du terrax** : sur l'iPhone, « ouvrir les yeux » ouvre l'AR d'iOS (ARKit + RealityKit, le plugin `PloxiAR`). Le monde est
  aligné sur la gravité et le nord : chaque objet est à sa vraie direction et à sa distance (au-delà de 150 m, il est rapproché et grandi,
  sa direction reste vraie, son texte dit la vraie distance). Il te fait toujours face.
- **Le LiDAR** (iPhone Pro) : le maillage du réel cache ce qui est derrière un mur, un meuble ; une personne passe devant les objets.
  ◇ montre ce maillage : « une version 3D du réel ».
- **Poser** : toucher le réel lance un rayon sur la surface touchée (le sol, une table, un mur) ; l'objet y est posé et gardé à sa
  position GPS (plus sa hauteur). Toucher un objet le montre.
- **La chambre en AR** : iOS garde la carte de la pièce (ARWorldMap) ; à la prochaine ouverture, il retrouve la pièce et chaque objet
  revient à sa place exacte. Rien ne quitte l'iPhone.
- **Le scan de la pièce** (RoomPlan, iOS 16, LiDAR) : murs, portes, fenêtres, meubles, en USDZ (Documents/terrax/pieces, visible dans
  Fichiers). Il s'ouvre en **AR Quick Look** à l'échelle 1 : on pose sa chambre où l'on veut.
- **AR Quick Look partout** : un lien `.usdz` / `.reality` (ou `rel="ar"`) dans un ploxion s'ouvre dans iOS (téléchargé par iOS, sans CORS).
- **Pour tous les ploxions** : `jOSNatif.ar` (disponible, ouvrir, ecouter, fermer, scannerPiece, voirPiece).
- Sans AR native (le web, un appareil sans ARKit, un build `PLOXI0N_AR=0`), l'AR web d'avant prend le relais.

Ce qui existe au labo et qu'on composera ensuite : jOSCarte (les couches de la carte), jOSZone (la portée `zone` privée ou `nexus`
commune), jOSObjets et room-map (la chambre), scan-reel (caméra + GPS + gyroscope), cubmap (les robots en BLE), jOSViewer et jOS3D
(glTF, STL), SkyView dans boxion-rt (le premier AR boussole), et AR Quick Look en USDZ, déjà ouvert par `PloxiApple.apercu`.

## 3. Spéculatif (à valider avec RS-7)

- La place au mètre près : les ancres géographiques d'ARKit (ARGeoAnchor), là où Apple a sa VPS (pas encore en Suisse, à vérifier).
- L'AR à plusieurs : une session collaborative d'ARKit, les mêmes objets au même endroit pour chacun.
- Les modèles 3D (glTF) dans l'AR, avec un rendu WebGPU ou Metal.
- Le terrion partagé : un nexus commun où chacun corrige la carte du réel (comme OpenStreetMap, en 3D).
- marsion, solax, solion, galaxion : les mêmes ploxions, sur d'autres corps.
- Xerax 2 (les ondes cérébrales) : un bion EEG (Muse, OpenBCI) qui lit l'intention.
- Le koin du ion, ses dossiers et la balade au portion : les données vivent au labo (voir les quêtes).

## 4. Les quêtes du terrax

Chaque quête a un identifiant : on la prend, on la fait, on la rend (une PR, un tsoin).

### Quêtes du jeu (dans l'app)

| id | quête |
| --- | --- |
| `premier-pas` | Pose ton premier objet sur le terrion. |
| `parc-chiant` | Pose 5 objets dans un même endroit vide : un parc qui ne l'est plus. |
| `regard` | Ouvre le terrax (l'AR) et trouve un objet que tu as posé. |
| `chambre` | Mappe 3 objets de ta chambre (à toi seul). |
| `nexus` | Partage un objet au nexus. |
| `marcheur` | Pose des objets à 1 km l'un de l'autre. |

### Quêtes du code (pour qui veut aider)

| id | quête |
| --- | --- |
| `ar-arkit` | **Faite (0.73)** : `PloxiAR`, ARKit + RealityKit (nord, LiDAR, poser au rayon, la chambre gardée par ARWorldMap). |
| `chambre-lidar` | **Faite (0.73)** : RoomPlan → USDZ (Documents/terrax/pieces), ouvert en AR Quick Look à l'échelle 1. |
| `ar-geo` | Les ancres géographiques d'ARKit (ARGeoAnchor) là où Apple a sa VPS : la place au mètre près, au lieu du GPS. |
| `ar-partage` | L'AR à plusieurs (une session collaborative d'ARKit) : voir les mêmes objets, au même endroit, en même temps. |
| `usdz-ion` | Un modèle USDZ comme ion d'une ancre : en 3D dans l'AR, et en AR Quick Look. |
| `gltf` | Afficher un modèle glTF à sa place GPS, le plus léger possible (WebGPU, sinon Metal natif). |
| `tuiles-hors-ligne` | Garder les tuiles du terrion pour jouer sans réseau (un cache borné, par zone). |
| `nexus-commun` | L'API du nexus pour les objets partagés (boxion-rt `/store`, jamais de jeton dans l'app). |
| `rust-moteur` | Le moteur de projection (GPS, boussole → écran) en Rust compilé en WASM, mesuré contre la version JS. |
| `koin-ion` | **À moitié faite** : les hubs sont semés dans l'app. Reste à les officialiser au labo (`xerkion-hubs.spec.json`, et les 4 koins dans `xerkion-primitives`). |
| `cad` | Importer une pièce FreeCAD ou KiCad (STEP, glTF) et la poser dans le terrax. |
