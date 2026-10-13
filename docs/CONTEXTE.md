# Passation — la session du 12–13.10.2026 (0.46 → 0.50)

*La sauvegarde du contexte demandée par RS-7 avant de fermer la conversation. À lire en premier dans la session suivante.*

## 1. Où en est tout

| Dépôt | Branche | État |
|---|---|---|
| **J0bot/ploxi0n** | `glob/youthful-noether-v9xlop` | 0.47 → 0.50 poussées, **pas fusionnées dans `main`**, pas encore construites. Dernier build TestFlight : **0.45**. |
| **J0bot/labo-cape** | `ploxi0n-l1` | `docs/BLE.md` (le contrat BLE), lot L1 marqué présent, tsoin 31, le correctif golden.json sous Windows. Pas fusionnée. |
| J0bot/ploxi0n-certificats | — | les certificats fastlane match (chiffrés ; `MATCH_PASSWORD` absent de la session). Lecture seule. |
| J0bot/my_website2 | `main`, `labo`, `labo-ploxmobile`… | le labo Laravel (xerboxion.org) **figé en juin** : le vrai labo n'est plus sur GitHub. |
| J0bot/boxion-rt | `main` (juillet) | `BIONS.md` (jOSplayer, jOScube, jOSsso…), `XERBOXION-PRIMER.md`, `book/themes/*.json` (le lexique : XERB0T, cubion…). |

**Le « zbeul » (RS-7)** : cette session n'a jamais eu accès aux ploxions. `xerboxion.org` était refusé par le proxy de l'environnement
(et WebFetch n'avait aucun DNS) ; RS-7 a élargi la politique réseau, elle vaut pour une NOUVELLE session. **Premier geste de la session
suivante** : `curl -sS -o /dev/null -w "%{http_code}" https://xerboxion.org/px/registry.json` — si 200 : lire la doc du labo, le code
des ploxions (Stremio, Spotify, le hub 🌸 Santé, xerkion-sante, jOSplayer/jOSPlayer, la route de connexion), puis lancer le faux iPhone
sur tous les ploxions publics (`tools/diagnostic-iphone.mjs` existe aussi, en jsdom).

## 2. Ce qui a été fait (par version)

- **0.47 — le natif partout.** Le piège du proxy (Raccourcis/Siri, widgets, Face ID, notifications, Santé ne marchaient JAMAIS sur
  iPhone) ; `src/natif/web-natif.js` (les API web standard des ploxions → le natif : vibrate, share, clipboard, geolocation,
  Notification, getBattery, SpeechRecognition, BarcodeDetector, devicemotion, orientation, wakeLock, Web Bluetooth, Web NFC,
  window.open) ; Santé connecté (opt-in, `jOSSante`, `docs/SANTE.md`) ; la mise en page cassée par le thème vivant ; les réglages en
  pages et sous-pages ; PrivacyInfo.xcprivacy, arm64, `fastlane/metadata`, `docs/CONFIDENTIALITE.md` ; le faux iPhone.
- **0.48 — à l'écoute et le cube.** `src/natif/maintenant.js` : le Spotify Web Playback SDK (et toute Media Session d'un iframe) →
  l'écran verrouillé (PloxiApple.lecture : MPNowPlayingInfoCenter + MPRemoteCommandCenter), **le mini-lecteur au-dessus du dock**
  (RS-7 : « magnifique »), widget À l'écoute ; `src/app/cube.js` + widget Cube (six valeurs des bions, ⟲) ; ⚙ › Widgets (le cube 3D
  qui suit le gyroscope dans l'app — un widget ne peut pas lire le gyroscope).
- **0.49 — le lecteur intégré et la liste de bions.** PloxiLecteur (AVPlayerViewController ; VLC en repli derrière `PLOXI0N_VLC`) ;
  `src/natif/lecteur-natif.js` (plugion jOSplayer, vidéo illisible → natif, muette → bulle, vlc:// infuse://, `ploxi0n://lire`,
  reprise ; `docs/LECTEUR.md` pour le bouton « ▶ ploxi0n » côté labo) ; `src/natif/fichiers-natif.js` (envoyer vers avec fichiers,
  aperçu QuickLook, zip/dezipper avec fflate, galerie + import dans Fichiers, sélecteur de fichiers, Plans, Mail, lampe) ; contrôles du
  Centre de contrôle (iOS 18) ; **Codemagic** (`codemagic.yaml`, `docs/TESTFLIGHT.md`) ; numéro de build = dernier TestFlight + 1.
- **0.50 — la blouse et les modes.** `src/cape/` : 🥼 labo-cape (BLE selon labo-cape `docs/BLE.md`, ou simulation avec la copie de
  cape-engine vérifiée contre la trace du Rust) ; `src/app/modes.js` : ◇ chill-tekk · ⬡ xerboxion (l'UI du labo dans l'accueil) ·
  🤖 xerbot (le monde physique : blouse, Bluetooth, HomeKit, lampe, NFC, Wi-Fi, bus `xerbot.cmd`).

## 3. Ce qui reste, par ordre

1. **Les MINI DOCKS** (RS-7, 13.10 : « c'est magnifique le mini dock, j'adore ; il faut que tout puisse être minimisé en mini dock, et
   avoir une page de tous les mini docks »). Le mini-lecteur de `maintenant.js` (`.px-maintenant`) devient UN cas d'un système général :
   - chaque ploxion minimisé (▁, les vivants et les endormis du routeur) devient une pastille au-dessus du dock : icône/pochette, nom,
     une ligne vivante, ses actions ; toucher = le rouvrir ;
   - une API pour les ploxions et les bions : `jOSMiniDock.publier({ id, titre, sous, image, actions: [{ id, icone }] })`, `retirer(id)`,
     les actions reviennent au ploxion (jOSPorts) ; les internes en donnent un riche (labo-cape : température · consigne, ⏻ ; Santé : pas ;
     le lecteur, la musique : ⏮ ⏯ ⏭) ;
   - au-dessus du dock : deux pastilles au plus, puis « ▤ N » ; **la page de tous les mini docks** (une feuille, ou un ploxion interne)
     avec leurs actions et ✕ pour fermer ; la section « en arrière-plan » de l'accueil (`arriere()` dans le routeur) se fond dedans.
2. **Construire et tester sur l'iPhone** (`docs/TESTFLIGHT.md`, la liste à cocher) : rien de 0.46 à 0.50 n'a tourné sur un téléphone ;
   le Swift (lecteur, lampe, aperçu, à l'écoute, widgets, contrôles) n'a jamais été compilé.
3. Fusionner `glob/youthful-noether-v9xlop` dans `main` (une PR, si RS-7 la demande) ; idem `ploxi0n-l1` dans labo-cape.
4. Côté labo (dès que xerboxion.org est joignable) : le bouton « ▶ ploxi0n » de Stremio (`docs/LECTEUR.md`) ; le `postMessage({ ploxi0n:
   'ouvrir', id })` de l'UI du labo (mode xerboxion) et la session dans l'iframe ; **la suppression du compte dans l'app** (règle App
   Store 5.1.1(v), bloquante) ; l'envoi de fichiers relayé (l'import des photos dans le boxion l'attend) ; publier la page de confidentialité.
5. labo-cape : le firmware L0 doit parler `docs/BLE.md` ; ensuite essayer la vraie blouse.
6. Plus tard : le mode xeroction ; Live Activities (la musique : `maintenant.js` a tout) ; ⏯ du widget sans ouvrir l'app.

## 4. Les décisions de RS-7 (à ne pas re-demander)

- Santé « connecté » = **les deux** : `jOSSante` pour le hub, ET un résumé sur le boxion, opt-in, éteint par défaut.
- Lecteur = **Apple d'abord, VLC en repli** ; Stremio seul = **un bouton « ▶ ploxi0n »** (lien `ploxi0n://lire`).
- Modes = chill-tekk, xerboxion (« l'UI du labo »), xerbot (XERB0T : la couche robotique).
- TestFlight sans minutes Actions = Codemagic (RS-7 l'a branché le 13.10).
- RS-7 veut « le plus de fonctionnalités natives possible, c'est le but de l'app ».

## 5. Comment travaille RS-7

En français, des messages courts tapés sur le téléphone, souvent en plein travail (les intégrer sans tout arrêter) ; des captures
d'écran de l'iPhone ; il aime le style chill-tekk (presque noir, violets délavés, aucun dégradé). Il a donné un budget de tokens :
travailler en direct, sans sous-agents inutiles, et vérifier ce qui compte (tests, faux iPhone). Ne pas promettre ce qu'Apple interdit
(gyroscope dans un widget, allumer le partage de connexion) : le dire et proposer mieux.
