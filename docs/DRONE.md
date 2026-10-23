# Le drone xerbot : il te suit, il mappe en 3D, tu l'envoies (braindump de RS-7, 23.10)

*Extrapolation avec RS-7. Rien n'est construit. Ce qui est **voulu**, ce qui **existe déjà**, ce que le **réel** impose (la loi, la batterie, les
gens autour), et un chemin par paliers qui tourne à chaque étape.*

## Ce que RS-7 a dit

- Un **drone qui te suit** quand tu marches et **mappe tout en 3D** autour de toi.
- L'**envoyer à des endroits**, ou **aller chercher des trucs**.
- Il a la **5G** et le **GPS**. **C'est un xerbot.**

## Ce que ça devient dans le xerboxion

- **Un xerbot comme les autres** : une famille de plus dans le contrôleur XERB0T (docs/XERBOT.md), son état et ses commandes sur le bus
  xerbot v1 (`drone-<id>.telemetry`, `drone-<id>.cmd`). Le téléphone n'est pas une télécommande spéciale : c'est un xer de plus sur le drone.
- **L'œil volant du terrax** : ce qu'il mappe devient des couches du terrax et du mapion (docs/TERRAX.md, docs/MAPION.md). Ton scan
  d'une sculpture au téléphone (Object Capture) et le scan d'une rue par le drone finissent au même endroit : des ancres 3D posées sur la carte.
- **Il marche avec toi** : ta position (jOSNatif.position, le vrai nord du terrax) devient sa cible. Le mapion te dit ce qu'il y a autour ;
  le drone le voit d'en haut.
- **Il porte une salle de Proche** : un drone peut héberger une salle (docs/ULTIMATE-BLUETOOTH.md) : ceux qui sont dessous la rejoignent.
  💭 Spéculatif : un drone qui porte la basse d'une fête.

## Le réel (avant de rêver plus loin)

- **La loi suisse** (l'OFAC applique les règles européennes depuis 2023) :
  - **Te suivre en restant à vue**, c'est la catégorie « ouverte », possible avec un petit drone et la formation en ligne de l'OFAC
    (moins de 250 g, c'est le plus simple ; au-dessus, des distances aux gens à tenir).
  - **L'envoyer hors de ta vue** (vol « BVLOS ») : c'est la catégorie « spécifique », il faut une **autorisation** de l'OFAC. « Envoyer le
    drone à des endroits » et « aller chercher des trucs » tombent là. Ce n'est pas impossible, mais c'est un dossier, pas un bouton.
  - **Les zones interdites** : autour des aéroports (Zurich-Kloten couvre une grande part de la ville), des prisons, des sites protégés, des
    réserves naturelles. Il faut les lire avant chaque vol (la carte officielle des zones drones de la Suisse).
  - **Transporter et lâcher un objet** : interdit en catégorie ouverte. Encore la catégorie « spécifique ».
  - ⚠ À vérifier au moment de construire : ces règles bougent, et ce résumé vient de ma mémoire, pas d'une source relue.
- **Les gens autour** (ne pas nuire) : un drone qui filme et mappe tout filme aussi des gens qui n'ont rien demandé. La loi sur la protection
  des données s'applique. Ce qu'il mappe doit rester à toi par défaut (comme le terrax), et flouter les gens et les plaques avant tout partage au nexus.
- **La batterie** : 20 à 40 minutes de vol pour un petit drone. Un drone qui te suit toute une balade, ça veut dire des relais, ou des pauses.
- **La 5G** : un modem cellulaire sur un drone, c'est faisable (un petit ordinateur embarqué + un modem), mais un abonnement et une
  autorisation de vol hors de vue vont avec, puisque c'est surtout utile loin de toi.

## Avec quoi (open source d'abord : forker doit rester libre)

- **Le pilote automatique** : ArduPilot ou PX4, qui parlent **MAVLink** (un protocole ouvert). Un drone de ce genre se construit ou s'achète
  ouvert. DJI marche aussi (son SDK mobile pour iOS), mais c'est fermé : à garder en second choix.
- **Le cerveau embarqué** : un Raspberry Pi (ou équivalent) sur le drone, avec le modem 5G et le GPS. Il parle MAVLink au pilote automatique
  et HTTP / SSE au xerboxion. Il peut faire tourner un boxion-rt (le même cœur que le serveur, sans rien rebâtir).
- **Me suivre** : MAVLink a déjà le message « suivre une cible » (`FOLLOW_TARGET`) et un mode « me suivre » dans ArduPilot. Le téléphone
  envoie sa position quelques fois par seconde.
- **Le mapping 3D** : en photos (photogrammétrie) avec **OpenDroneMap**, sur le boxion après le vol ; ou un petit LiDAR embarqué pour du
  temps réel. Le résultat : un nuage de points ou un maillage (USDZ pour l'iPhone, comme Object Capture), ancré par GPS.

## Un chemin par paliers (chaque palier tourne et se montre)

1. **Le drone dans le contrôleur XERB0T** : une famille « drone (MAVLink) » : son état (batterie, GPS, altitude, mode), décoller, atterrir,
   revenir. Par le Wi-Fi du drone ou de son Pi. Au sol, on peut déjà tout tester avec le **simulateur** d'ArduPilot (SITL) : pas besoin de drone.
2. **Me suivre** (à vue, catégorie ouverte) : la position du téléphone envoyée au drone ; un bouton rouge « reviens et atterris » toujours visible.
3. **Le mapping** : les photos du vol vont au boxion, OpenDroneMap en fait un modèle, il revient dans le terrax comme une couche, à toi seul.
4. **Les zones** : la carte officielle des zones lue avant de décoller ; un vol refusé dans une zone interdite (ne pas nuire, et ne pas se faire coincer).
5. 💭 **L'envoyer, aller chercher** : seulement avec une autorisation de vol hors de vue. La 5G sert là.

## Questions ouvertes (à RS-7, quand il en aura envie)

- Tu as déjà un drone ? Lequel (DJI, ou un drone ouvert ArduPilot / PX4) ?
- D'abord « me suivre et mapper » (possible vite, à vue), ou d'abord « l'envoyer » (il faut l'autorisation) ?
- Ce que le drone mappe : à toi seul par défaut, comme le terrax ?
