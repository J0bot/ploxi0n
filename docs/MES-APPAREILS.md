# Mes appareils dans mappion (le « Find My » du xerboxion)

*13.11.2026, ploxi0n 0.99.55. RS-7, relayé par xerxion1 : « Find My : position et batterie des appareils du xerboxion dans mappion ».
Statut : proposition, rien n'est construit. À trancher par RS-7 (les questions en bas).*

## Ce qu'on ne peut pas faire : lire Find My

Apple n'ouvre **aucune API** qui permette à une app de lire Localiser (Find My) : ni la position de tes autres appareils, ni leur batterie,
ni celle des AirTags. Le programme « réseau Localiser » (Find My network accessory program) sert aux **fabricants d'accessoires** qui veulent
qu'Apple localise leur objet ; il ne donne rien à lire à une app. Passer par iCloud.com ou par des API privées reviendrait à contourner Apple
(refus à la revue de l'App Store, comptes bloqués, et on manipulerait des identifiants iCloud : non).

## Ce qu'on peut faire : chaque appareil du xerboxion se signale lui-même

Le xerboxion a déjà tout ce qu'il faut. Chaque appareil où tourne quelque chose du xerboxion **publie lui-même** sa position et sa batterie,
**pour toi seul** :

| appareil | position | batterie | comment |
|---|---|---|---|
| iPhone, iPad (ploxi0n) | la veille (PloxiVeille, déjà là, 0.99.20) | `UIDevice.batteryLevel` (déjà lue par la barre du haut) | en arrière-plan, au rythme de la veille |
| Android (ploxi0n) | la même veille | `BatteryManager` | pareil |
| Mac, PC (le navigateur, le xer) | à la demande (géolocalisation du navigateur) | Battery Status API là où elle existe | quand le xer est ouvert |
| Pi, ESP32 du maillage | **fixe** : `ann.d.pos` (Maille v1, 0.99.53) | un champ `bat` à ajouter dans l'annonce (0…100, optionnel) | à chaque annonce |

Le chemin :
- en ligne : chiffré de bout en bout pour **ton** compte (la clé reste sur tes appareils, le labo ne voit qu'un blob) et rangé dans ton boxion
  (`appareils/<id>` : `{ nom, type, lat, lng, precision, bat, charge, vu }`) ;
- sans réseau : par le maillage, comme les positions des potes ✦ (le paquet `pos`, chiffré pour toi) ;
- mappion lit `window.jOSAppareils.liste()` (même forme que `jOSMaille.noeuds()`) et dessine une **strate « mes appareils »** : le glyphe de
  l'appareil, sa batterie en petit, « vu il y a 12 min » ; toucher → la fiche, et « faire sonner » si l'appareil est joignable.

## Ce que ça ne fera pas, honnêtement

- Un appareil éteint, sans batterie ou sans ploxi0n ne se signale pas (Find My, lui, marche même éteint grâce aux autres iPhone du monde).
- Un iPhone volé dont on a supprimé l'app ne dit plus rien. Pour le vol, Localiser d'Apple reste l'outil.
- iOS limite l'arrière-plan : la position arrive au rythme de la veille (visites, déplacements notables), pas en continu.

## Ne pas nuire

- Opt-in par appareil, coupé par défaut ; un réglage « ne plus me signaler » sur chaque appareil.
- Seulement **tes** appareils, seulement pour **toi** : aucun partage avec les potes, le labo ne lit rien.
- Pas d'historique de positions : la dernière seulement (l'historique, c'est la veille de mappion, déjà sur le téléphone).

## À trancher (RS-7)

1. On le construit comme ça (chaque appareil se signale lui-même) ?
2. Les Pi et les ESP32 : ajouter `bat` à l'annonce du maillage (un champ optionnel, rétrocompatible : Maille v1 relaie les champs inconnus) ?
3. « Faire sonner » un appareil depuis mappion : oui / plus tard ?
