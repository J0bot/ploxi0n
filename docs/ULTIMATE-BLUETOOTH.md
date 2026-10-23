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
- Tests : `tests/proche.test.mjs` (deux téléphones simulés, 5 s d'écart d'horloge). Faux iPhone : `parcours-proche.mjs` (un voisin « Tom »
  simulé dans `faux-iphone.mjs`, 3 s d'avance : il répond aux pings et aux messages, puis héberge une basse).
- Au passage : le filtre « sans emoji » de l'app (`src/app/sans-emoji.js`) effaçait les signes « pictographiques » (♡ ♫ ▶ ◼ ✉ ❄) des
  ploxions internes ; `[data-ecrit]` garde ce que les gens s'écrivent, et l'interface utilise des signes qui passent (∿ ▷ ■ ✻).

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
