# Le mapion : autour de moi, en continu (braindump de RS-7, Zurich, 23.10)

*Capture fidèle d'un braindump dicté en marchant dans Zurich. Rien n'est construit ici : ce qui est **voulu** (RS-7 l'a dit), ce qui
**existe déjà** (à composer, pas à refaire), et ce qui est **à vérifier** (mes propositions, pas les siennes).*

## Ce que RS-7 a dit

- En se baladant en ville, il y a plein de trucs qu'on aimerait avoir sur l'app. Une trottinette est là : je peux la prendre.
- Ou je me balade sans savoir quoi faire : des **propositions de trucs à faire selon mon vecteur xerion**. Plein d'activités, dans tous les
  sens, un peu partout.
- Dès que l'app connaît ma position, elle montre **tout ce qui est autour de moi**, et ça donne une **continuité** de ce qu'il y a à faire :
  je me déplace, ça se met à jour au fur et à mesure.
- Quoi : des events, un bar, un resto, n'importe quoi, **des toilettes** (« il faut un truc pour trouver des toilettes direct »).
- **Mapper nous-mêmes** si on en a envie, mais d'abord **fetch tout ce qui existe déjà**, de toutes les bases de données qui existent.
- Le **mapion** devient une app bien plus importante.
- Le mélanger avec le **terrax** pour mapper en 3D : un dessin trop stylé, une sculpture, je la mappe en 3D. **On construit le monde sur
  le xerboxion, dans l'app.**

Et juste avant, sur les zooms : **le wormion et le portion sont de gros knobs connectés à plein de knobs ; chaque action est un knob**
(voir docs/KOINS.md).

## Ce qui existe déjà (à composer)

- **mappion** (le labo) : la carte, ses souvenirs 🧿, le fond satellite. Le terrax le lit déjà comme une couche (docs/TERRAX.md).
- **Le terrax** (`src/terrax/`) : le terrion, l'AR native (0.73 : ARKit, LiDAR, posé sur le réel, le vrai nord), les ancres
  `{ id, lat, lng, alt, cap, ion, txt, portee, ts }`, privées par défaut, partagées au nexus par un geste explicite.
- **Object Capture** (0.74) : un objet scanné à l'iPhone devient un USDZ à l'échelle réelle, posé dans l'AR du terrax. C'est déjà « mapper
  une sculpture en 3D » ; il manque de l'**ancrer à un lieu** (l'USDZ comme ion d'une ancre, déjà noté au ⏭ de docs/TERRAX.md).
- **Le vecteur xerion** : le temps passé dans chaque ploxion (`src/app/routeur.js`, comme jOSUsage du labo). Il peut pondérer les propositions.
- **jOSNatif.position** : la position de l'iPhone.

## Les sources à brancher (à vérifier avant de coder)

- **OpenStreetMap, par l'API Overpass** : libre, sans clé. Toilettes (`amenity=toilets`), fontaines (`amenity=drinking_water`, Zurich en a
  plein), bars, restos, cafés, musées, parcs, œuvres d'art (`tourism=artwork`). Respecter son usage équitable : peu de requêtes, un cache par case.
- **Les trottinettes et les vélos** : en Suisse, sharedmobility.ch (open data fédéral) publie les positions des véhicules en libre-service
  au format GBFS. À vérifier : la couverture de Zurich, les opérateurs présents, les conditions d'usage.
- **Les events** : pas de source libre évidente. Pistes : l'open data de la Ville de Zurich, les agendas des lieux. À chercher.
- **Nos propres lieux** : les ancres du nexus (le terrax) et les souvenirs du mappion.

## Une forme possible (proposition, pas décidée)

- Un bion **autour** : position → les cases autour (un pavage fixe, mis en cache) → les lieux de toutes les sources, en une seule forme
  `{ id, genre, nom, lat, lng, source, ouvert? }`. Pur, testable, sans DOM.
- La **continuité** : la case change quand on marche, on ne recharge que les nouvelles cases ; une trace de la balade (un tsoin de balade).
- Les **propositions** : les lieux autour, pondérés par le vecteur xerion et l'heure ; « toilettes » toujours en un geste.
- Le **mapion** dans la map fractale : un palier « autour de moi » (la ville comme un hub, les lieux comme des koins), et le terrax comme
  palier 3D en dessous.
- **Mapper soi-même** : poser une ancre (déjà là), y attacher un scan Object Capture (le maillon qui manque).

## Questions ouvertes (à RS-7, quand il en aura envie)

- Mapion (le ploxion) et mappion (celui du labo), c'est le même ?
- Le « vecteur xerion » pour les propositions, c'est seulement le temps passé dans les ploxions, ou plus (tes goûts, tes tsoins) ?
- Ce qu'on mappe soi-même : à soi par défaut, comme le terrax, ou public par défaut ?
