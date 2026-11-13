# Ultimate Bluetooth : messages, son partagé, un hôte et des répliques (braindump de RS-7, 23.10)

*Capture fidèle. Rien n'est construit. Ce qui est **voulu**, ce qui **existe déjà**, et ce qui **coince** (le réel d'iOS, à dire avant de rêver).*

## Ce que RS-7 a dit

- **Ultimate Bluetooth** : envoyer des **messages en Bluetooth**.
- **Partager du son, ou une basse.**
- **Un téléphone héberge le son, tous les autres le répliquent** : plein de gens avec le même son.

## Ce qui existe déjà (à composer)

- `@capacitor-community/bluetooth-le` (package.json) et le mode d'arrière-plan `bluetooth-central` (Info.plist) : le BLE est déjà là,
  utilisé par XERB0T (`src/xerbot/` : BLE UART) et la cape (`src/cape/cape.js`).
- Le mode d'arrière-plan `audio`, le lecteur natif (0.48 : AVPlayer), le **chill-synth** (`src/chill/chill-synth.js` : un synthé dans l'app).
- Le réseau local : Bonjour (`NSBonjourServices`), `NSLocalNetworkUsageDescription`.

## Ce qui coince (iOS), et comment le contourner

- **Un iPhone ne reçoit pas de son par Bluetooth d'un autre iPhone** : il n'est jamais une enceinte Bluetooth (pas de récepteur A2DP).
  Et le BLE est trop lent pour du vrai son de qualité.
- → **Envoyer la partition, pas le son.** Pour « une basse » : l'hôte envoie le tempo, les notes, les temps forts (quelques octets) ; chaque
  téléphone joue la basse lui-même avec le chill-synth. Ça passe en BLE, et ça sonne pareil partout.
- → **Pour un vrai morceau** : chaque téléphone joue sa copie du fichier, calée sur une **horloge partagée** (l'hôte dit « tel morceau, à
  telle position, à telle heure »). Le fichier peut passer d'abord de l'hôte aux autres. Le bon tuyau pour ça sur iPhone, c'est
  **MultipeerConnectivity** (le Bluetooth et le Wi-Fi direct ensemble, sans internet, comme AirDrop), pas le BLE seul.
- → **Les messages** : MultipeerConnectivity aussi (sans internet, de proche en proche). Le BLE seul marche quand l'app est ouverte ; en
  arrière-plan, iOS bride fort l'annonce Bluetooth.
- **Spotify** : on ne peut pas redistribuer son flux (DRM et conditions). Possible : chacun son Spotify, synchronisés sur le même morceau et
  la même position.
- **Le son d'un téléphone** : la basse d'un haut-parleur d'iPhone est faible ; c'est le nombre de téléphones qui fait le volume.
- **Le calage** : à quelques dizaines de millisecondes près, ça s'entend en écho dans une même pièce. Il faudra mesurer le décalage de chaque
  téléphone et le compenser.

## Ce qui est construit (0.99.1, « je te laisse extrapoler et implémenter toi-même »)

- **PloxiProche** (`ios/App/App/AppDelegate.swift`, MultipeerConnectivity, chiffré) : `demarrer({ nom, salle })`, `arreter()`, `envoyer({ donnees, a? })`,
  `pairs()` ; événements `pair` et `message`. Tout le monde annonce et cherche le service `ploxi-proche` ; seuls ceux de la même **salle** se
  connectent ; celui dont le nom est le plus petit invite (pas de double invitation). Les paquets sont du texte, 16 Ko au plus.
  Info.plist : `_ploxi-proche._tcp` et `._udp` dans NSBonjourServices. **⚠ Pas compilé ici** (pas de Mac) : relu ligne par ligne, signatures des
  délégués d'après le SDK ; le premier build le confirmera.
- **Le tuyau** (`src/natif/proche-natif.js`) : le plugin sur l'iPhone (par `surPromesse`), un BroadcastChannel ailleurs (deux onglets = deux
  téléphones). Le nom d'un pair : 50 octets au plus + un suffixe unique (MCPeerID tombe au-delà de 63 octets ou sur un nom vide).
- **Le bion pur** (`src/bions/proche.js`) : `paquet` / `lire` (ce qui vient d'à côté est suspect), l'horloge à la NTP (`ecart`, `meilleurEcart` :
  la médiane des 3 allers-retours les plus courts), la basse (`partition`, `MOTIFS` pulse / roule / tekk / marche / dub, `GAMMES`,
  `notesEntre` : les notes d'une fenêtre, en boucle depuis le début de l'hôte), `positionA` (le son partagé).
- **Le ploxion Proche** (`src/lot/proche.js`) : démarrer (nom, salle) ; qui est là et son aller-retour ; ≡ les messages et les glyphes d'un
  geste ; ∿ héberger une basse (tempo, motif, grave / bas / milieu ; changer garde le début, tout le monde reste calé), la rejoindre (un
  ordonnanceur Web Audio à 250 ms d'avance, une scie + une sous-octave, un filtre qui claque) ; ▷ héberger un son (https seulement), pause
  pour tous, le rejoindre (chacun sa copie, recalée au-delà de 80 ms). L'hôte réannonce toutes les 3 s (les retardataires) ; ping toutes les 4 s.
- Ne pas nuire : rien n'est annoncé avant « démarrer », rien ne joue chez quelqu'un sans son « rejoindre », textes échappés, https seulement.
- Tests : `tests/proche.test.mjs` (deux téléphones simulés, 5 s d'écart d'horloge). Faux iPhone : `parcours-proche.mjs` (un voisin « RS-3 »
  simulé dans `faux-iphone.mjs`, 3 s d'avance : il répond aux pings et aux messages, puis héberge une basse).
- Au passage : le filtre « sans emoji » de l'app (`src/app/sans-emoji.js`) effaçait les signes « pictographiques » (♡ ♫ ▶ ◼ ✉ ❄) des
  ploxions internes ; `[data-ecrit]` garde ce que les gens s'écrivent, et l'interface utilise des signes qui passent (∿ ▷ ■ ✻).

## Le maillage, comme bitchat (0.99.21, RS-7 : « ça doit être comme bitchat mesh pour le truc Bluetooth »)

`src/bions/maille.js` (pur ; testé dans `tests/maille.test.mjs`, des téléphones en ligne A–B–C–D qui n'entendent que leurs voisins) :

- **Le maillage** : chaque téléphone relaie ce qu'il reçoit à ses autres voisins, après un petit délai au hasard (10 à 150 ms). Un
  compteur de sauts (7 au plus, comme bitchat) l'arrête. Le multi-sauts porte bien au-delà de la portée d'un seul téléphone.
- **Le dédoublonnage** : chaque paquet a un id de 8 octets ; deux filtres de Bloom qui tournent (4 Ko chacun) se souviennent de ceux vus.
  Pas de tempête : chacun reçoit un paquet une fois par voisin, au plus.
- **Stocker et relayer** : les paquets des 12 dernières heures (150 au plus) sont gardés. Quand un voisin arrive, chacun envoie la liste de
  ce qu'il a vu (`sync`, un saut seulement) ; l'autre lui envoie ce qui manque. Un message attend ainsi quelqu'un qui n'était pas là.
- **Pas de compte** : une identité = une paire de clés ECDH P-256, gardée sur le téléphone ; son **empreinte** = les 8 premiers octets du
  SHA-256 de la clé publique. Le nom est libre, c'est l'empreinte qui fait foi (affichée : « nom#a3f2 »). Une annonce (`ann`) porte la clé
  publique ; elle est vérifiée (la clé doit redonner l'empreinte) et relayée : tout le maillage connaît la clé de chacun.
- **Les messages privés** : chiffrés de bout en bout (ECDH → HKDF-SHA256 → AES-GCM 256, l'en-tête du paquet lié au chiffré : un relais
  ne peut ni lire ni détourner) ; un **accusé** (✓✓) revient par le maillage. Vers un voisin direct, le paquet ne va qu'à lui.
  ⚠ Pas de confidentialité persistante : bitchat utilise le protocole Noise, ici une clé par paire de téléphones.
- **Les salons** `#nom` : ouverts, ou fermés par un mot de passe (PBKDF2-SHA256, 100 000 tours → AES-GCM). Sans le mot de passe, on voit
  qu'il y a un message, pas ce qu'il dit. Ceux qui n'ont pas rejoint un salon le relaient sans le voir.
- **Le rembourrage** : ce qui est chiffré est complété jusqu'à 256, 512, 1024… octets (la taille ne trahit pas le message).
- **Bloquer** une empreinte (on relaie quand même : le maillage tient) ; **tout effacer** d'un geste (trois touchers sur « ◉ proche » :
  une nouvelle identité, plus aucun message, salon ni cache) ; l'anti-déluge (40 paquets par empreinte et par 10 s).
- **Les commandes** : `/j #salon [mot de passe]` · `/m @nom texte` · `/w` (qui est là, à combien de sauts) · `/bloquer @nom` ·
  `/debloquer @nom` · `/quitter` · `/effacer` (aussi en anglais : /join /msg /who /block /clear).
- **Un son du synthé** peut voyager avec un message (♫), même dans un salon fermé ou en privé : « ▷ dans le synthé » le charge chez l'autre.

Le tuyau reste MultipeerConnectivity (le Bluetooth et le Wi-Fi direct ensemble). Une session tient 8 appareils : 7 voisins directs au plus
(`PloxiProche`, Swift), le maillage porte au-delà. La basse et le son partagés restent d'un hôte à ses voisins directs (l'horloge).
Les anciennes Proche (0.99.1 à 0.99.20, un seul saut) sont encore lues.

### La suite du maillage (0.99.22, RS-7 : « améliore le bitchat »)

- **Les potes ✦** (les favoris de bitchat) : `/fav @nom` ou ✧ dans la liste. Ce qui leur est adressé est gardé 72 h à part (le déluge des
  autres ne le chasse pas) : ils le reçoivent en revenant dans le maillage.
- **« Lu »** : ✓ envoyé, ✓✓ reçu, ◉ lu (l'accusé de lecture ne part que quand la conversation est vraiment ouverte à l'écran).
- **Le code de sécurité** d'une paire : 30 chiffres en 6 groupes, les mêmes chez les deux (SHA-256 des deux clés publiques). Le comparer
  en vrai prouve que personne ne s'est glissé entre vous ; « ✓ c'est le même code » le garde (✓ à côté du nom). `/code @nom`.
- **Les mentions** : `@ton nom` dans un salon te fait vibrer et le message est marqué (pas `@ton nom2`).

## Les potes : où ils sont, une boussole, une carte (0.99.22)

> RS-7 : « il faut avoir une map, genre si t'es en soirée tu peux savoir où sont tes potes, et t'as une boussole pour les retrouver s'il
> n'y a pas de connexion, ou soit une map directement ».

- **Partager sa position** (Proche › ⌖ mes potes) : avec ses potes ✦ (chiffrée pour chacun, avec sa clé), ou dans un salon **fermé**
  (`/j #soiree un-mot-de-passe` : chiffrée avec la clé du salon). Jamais dans un salon ouvert, jamais en clair. Pour 1 h, 4 h, ou jusqu'à
  ce que tu arrêtes (12 h au plus). Toutes les 15 s si tu as bougé de plus de 8 m, sinon chaque minute. « ■ arrêter » efface ta position
  chez les autres ; le bandeau le dit tant que ça dure. Le paquet `pos` du maillage, relayé comme le reste, jamais gardé en cache.
- **Sans connexion** : le GPS marche sans réseau, le maillage aussi. Le **radar** te met au centre, tes potes à l'échelle (des anneaux de
  25 m à 50 km, choisis pour que tout le monde tienne), la précision de chacun en halo, nord en haut ou **devant en haut** (la boussole de
  l'iPhone). Toucher un pote ouvre la **boussole** : une flèche qui tourne avec l'iPhone vers lui, la distance en grand, depuis quand on
  sait, ± la précision, « tu y es » (et une vibration) quand tu arrives.
- **Avec connexion** : la **carte** sous le radar (les tuiles sombres de CARTO, OpenStreetMap), à la même échelle, qui tourne avec lui ;
  « à pied (Plans) » vers le pote.
- `src/bions/potes.js` (pur : `relatif`, `echelle`, `aiguille`, `tourner`, `fraicheur`, les tuiles web mercator `tuile`, `zoomPour`,
  `tuilesAutour`), tests/potes.test.mjs ; le faux iPhone fait tourner le **vrai** maillage pour RS-3 (voisin direct) et RS-4 (deux sauts,
  relayé par RS-3), avec de vraies clés : `parcours-potes.mjs` (le radar, la boussole quand on regarde l'est, devant en haut, partager
  chiffré, le code de sécurité).

**Ce que bitchat fait et qu'on ne fait pas encore** : le Bluetooth Low Energy en arrière-plan (bitchat annonce et relaie même l'app
fermée ; MultipeerConnectivity s'arrête quand l'app passe en arrière-plan : le partage de position aussi) ; le protocole Noise
(confidentialité persistante) ; le pont vers Nostr quand il y a internet.

## Le Bluetooth basse consommation, comme bitchat (0.99.23, option `PLOXI0N_BLE`)

Multipeer (Wi-Fi pair-à-pair + Bluetooth, géré par Apple) reste le tuyau par défaut. bitchat, lui, parle en BLE pur : ça marche quand le Wi-Fi est
coupé, et iOS laisse un périphérique BLE annoncer en arrière-plan. Donc, derrière une option de build :

- **Swift** (`ios/App/App/AppDelegate.swift`, `#if PLOXI0N_BLE`) : `PloxiBLE`, à la fois central (il cherche le service `8F3A1C2E-…8C10`) et périphérique
  (il l'annonce, une caractéristique `…8C11` en écriture et en notification). Méthodes `demarrer`, `arreter`, `envoyer` ; événements `pair` et `message`
  (octets en base64). Les voisins s'appellent `p:<uuid>` (ceux que je vois) et `c:<uuid>` (ceux qui m'écrivent). Une file d'attente quand le canal est plein.
- **Les morceaux** (`src/bions/fragments.js`) : un paquet du maillage (jusqu'à 16 Ko) → des morceaux de 180 octets, en-tête `[0xB1][id u32][rang][total][0]` ;
  recollés dans n'importe quel ordre, oubliés au bout de 30 s, tout borné (tests/fragments.test.mjs).
- **Le tuyau mixte** (`src/natif/proche-natif.js`) : le maillage (`src/bions/maille.js`) ne voit qu'une liste de voisins ; chacun est Multipeer ou BLE.
  Si `PloxiBLE` n'existe pas (l'option éteinte) ou refuse de démarrer, rien ne change.
- **L'activer** : le workflow « iOS » (entrée `ble`, ou la variable de dépôt `PLOXI0N_BLE=1`), ou la variable `PLOXI0N_BLE=1` sur Codemagic.
  fastlane `ajouter_ble` ajoute la condition de compilation `PLOXI0N_BLE` et le mode d'arrière-plan `bluetooth-peripheral` dans Info.plist.
- **Pas encore vérifié** : le Swift n'est pas compilé ici (pas de Mac). Premier build avec l'option : à lire ligne par ligne si ça casse ; puis deux iPhones,
  le Wi-Fi coupé, Proche.

### Mieux retrouver ses potes (0.99.29, RS-7 : « améliore la map pour le Bluetooth et la boussole à amis »)

- **La carte hors ligne** : « ⤓ garder la carte du coin » (avec du réseau, avant la soirée) range les tuiles CARTO d'un disque de 1,5 km,
  zooms 13 à 17 (450 au plus, `tuilesZone`), dans le cache du navigateur ou boxion_local (`src/app/carte-tuiles.js`). La carte lit d'abord
  les tuiles gardées : elle s'affiche sans connexion. Rien n'est envoyé : on lit des tuiles publiques.
- **Le rendez-vous** (◎) : un point que je pose là où je suis ; il voyage dans le même paquet `pos` que ma position, chiffré pour chaque pote
  ✦ (ou le salon fermé), validé à l'arrivée (`rdvValide`). Un losange sur le radar ; la boussole sait y mener. Il suppose que je partage ma
  position (il part avec elle) ; « × le rendez-vous » l'efface chez les autres au prochain envoi.
- **La boussole** : le cap d'iOS lissé sur le cercle ; l'aiguille tourne par le plus court ; **guidé aux vibrations** : quand la flèche est
  droit devant (± 20°), un tic, de toutes les 2,5 s (loin) à toutes les 0,35 s (tout près), pour marcher l'iPhone en poche ; le temps à
  pied ; « tu te rapproches / tu t'éloignes » sur 30 s ; prévenu quand la position du pote date.
- **Le radar** : les 12 derniers pas de chaque pote (en mémoire, jamais gardés) ; ＋ − pour zoomer à la main, « auto » pour revenir.

## La suite (⏭)

- Le son en arrière-plan, écran verrouillé (passer par un `<audio>` comme les ambiances), et la basse sur les vibrations (le haptique).
- Envoyer un fichier son de l'hôte aux autres (MultipeerConnectivity `sendResource`), pour un son partagé sans internet.
- Mesurer et compenser la latence de sortie de chaque téléphone (Bluetooth casque : +150 ms).
- Les messages de proche en proche (relayés par les autres, au-delà de la portée).

## Une forme possible (proposition d'avant, gardée pour mémoire)

- Un plugin natif minimal **PloxiProche** (Swift, MultipeerConnectivity : annoncer, chercher, envoyer des octets, recevoir), exposé en
  `jOSNatif.proche`, et un bion **proche** côté JS : des pairs, des messages, une horloge partagée.
- Trois usages composés dessus : **messages** (un tsoin envoyé de proche en proche), **basse partagée** (la partition → chill-synth),
  **son partagé** (un hôte, des répliques, l'horloge).
- Ce qu'il faut ajouter dans Info.plist : un `NSBonjourServices` de plus pour Multipeer (`_ploxi-proche._tcp`, `_ploxi-proche._udp`).

## Questions ouvertes (à RS-7, quand il en aura envie)

- Les messages : seulement entre gens qui ont ploxi0n, ou aussi vers des appareils (ESP, la cape) ?
- Le son partagé, c'est d'abord la basse (le synthé), ou d'abord des morceaux (des fichiers) ?
- Rejoindre le son de quelqu'un : ouvert à tous ceux autour, ou sur invitation (un code, un QR) ?
