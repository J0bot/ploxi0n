# ploxi0n sur Android

*0.99.32 (07.11). RS-7 : « sur android il faut que l'appli ploxion soit utilisable comme launcher, genre comme appli de base ; comme ça t'utilises
que le xerboxion sur ton android, tu peux avoir un android sans rien et juste l'appli ploxion ».*

## Avoir l'APK

1. GitHub › Actions › **Android APK** › *Run workflow* (sur la branche voulue). Ou un tag `v*`, ou un commit dont le message contient `[apk]`
   sur une branche `glob/**`. Linux seulement : minutes au tarif normal.
2. L'artefact `ploxi0n-<version>-apk` (en bas de la page du run) : un zip qui contient `app-debug.apk`.
3. Sur le téléphone : ouvrir l'APK, autoriser « installer des applis inconnues » pour le navigateur ou les fichiers.

C'est un APK de **debug** (signé par la clé de debug d'Android) : il s'installe directement, pas sur le Play Store. Pour le Play Store il faudra
une clé de signature (un keystore) posée par RS-7 en secret du dépôt, et un `bundleRelease`.

## ploxion comme écran d'accueil (launcher)

- Dans l'app : ouvrir le ploxion **Applis** (⌂) › « en faire l'écran d'accueil ». Android 10+ ouvre sa fenêtre « appli d'accueil » ; avant,
  ce sont les réglages. À la main : Paramètres › Applis › Applis par défaut › Appli d'accueil › ploxi0n.
- Ensuite : le bouton maison (ou le geste) ramène à l'accueil du xer ; le bouton retour ferme ce qui flotte, puis le ploxion ouvert, puis
  ne fait plus rien (on ne quitte pas un écran d'accueil).
- **Applis** liste toutes les applis du téléphone (chercher sans accents, toucher = ouvrir, appui long = ses réglages Android). C'est la sortie
  vers ce qui n'est pas encore un ploxion (le téléphone, l'appareil photo, les paramètres).
- Revenir en arrière : Paramètres › Applis › Appli d'accueil › l'ancien launcher. Rien n'est verrouillé.

Le natif : `android/app/src/main/AndroidManifest.xml` (l'`activity-alias` `.Accueil` avec la catégorie HOME, `<queries>` pour voir les
applis), `MainActivity.java` (le bouton maison → l'événement `ploxiAccueil`), `PloxiAccueil.java` (estAccueil, choisir, applis, lancer,
reglages). Le JS : `src/natif/accueil-natif.js` (le bion jOSAccueil, le bouton retour), `src/lot/applis.js` (le ploxion).

## Ce qui marche, ce qui ne marche pas (encore)

| | |
|---|---|
| ✅ | Tout le JS de l'app : le xer, les ploxions, le labo, le boxion local (SQLite), les réglages, le banc |
| ✅ | Les plugins Capacitor (26) : position, caméra, NFC, Wi-Fi, Bluetooth (bluetooth-le), Santé (Health Connect), notifications locales, biométrie, partage… |
| ⚠ | Le push : il faut un projet **Firebase** et son `google-services.json` dans `android/app/` (à créer par RS-7) ; d'ici là il est coupé sur Android |
| ✗ | Ce qui est en Swift : Proche (MultipeerConnectivity), le maillage BLE, la veille, les ondes, l'AR, le lecteur natif, le vocal natif, CarPlay, les widgets, les Live Activities. Les ploxions s'ouvrent quand même (Proche retombe sur son tuyau du navigateur) ; leurs équivalents Android sont à écrire en Kotlin/Java (Nearby Connections pour Proche) |

Garde-fou : un plugin de l'app ne s'appelle qu'après `ploxiIci('Ploxi…')`. Vérifier avec le faux iPhone :
`node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ build/fa --android --script tools/faux-iphone/parcours-android.mjs`.

## Plus loin

- **Le mode kiosque** : un téléphone qui n'a QUE ploxion, sans sortie (Device Owner + lock task, posé une fois par `adb`). Possible, à décider.
- **Le xerboxion en entier sur Android** (« avec xb ») : à préciser (une ROM ? xerboxion-core ?).

## Le téléphone, un appareil xb (0.99.33)

Le ploxion **Appareil xb** (▸) fait du téléphone un appareil de ton labo, comme un Pi avec `xb agent` (même protocole que le CLI xb) :

1. « appairer ce téléphone » : un code s'affiche et la page d'approbation du labo s'ouvre ; vérifie le code, approuve. Le jeton (droit `atelier`
   seulement) va dans le trousseau, jamais dans une URL.
2. « allumer l'agent » : le téléphone apparaît dans le labo › ◈ appareils et dans le « où » du terminal xb, tant que l'app est ouverte.
   « allumé au lancement de l'app » pour qu'il s'allume tout seul.
3. Depuis le labo : `xb ouvrir <ploxion | url>`, `xb mode kiosque <url>` (plein écran), `xb mode aucun`, `xb scanner` (le Bluetooth, là où il
   est compilé), `xb notifier "…"`, `xb infos`, `xb sante`. Le téléphone refuse tout le reste (et le labo voit le refus) ; le journal du
   ploxion montre tout ce qu'il a fait.
4. « oublier ce labo » efface le jeton du téléphone ; révoque-le aussi sur le labo (Réglages › Données › jetons).

Avec le launcher, c'est le téléphone « xerboxion seulement » : l'écran d'accueil est le xer, et le labo peut le piloter comme un écran en kiosque.

Note pour le labo : le sondage de l'appairage passe le secret d'enrôlement dans l'URL (`/px/miroir/enroler/<id>?secret=…`), comme le CLI ;
un en-tête serait plus propre (à changer des deux côtés en même temps).
