# Le lot du jour de ploxi0n

RS-7, coord #2108 (20.11.2026) : « un seul build de ploxi0n par jour, chaque jour à 00:00 y a un nouveau build, donc tout ce qui doit être fait sur ploxi0n, faudra tout faire pour que ça soit juste un build par jour et pas genre des sparadraps partout ».

Règle : ce qui peut vivre côté labo (les vues des ploxions servies par labo.j0bot.ch) passe sans build ; ce fichier liste ce qui part dans le build de 00:00 (heure de Zurich). Un lot = des changements finis et testés, jamais une rustine.

## Build du 21.11 à 00:00
Lancé le 21.11 vers 00:30 (Zurich), sur le go de RS-7 (coord #2214 « build à lancer de ploxi0n »), en **0.99.66**. Au moment de pousser, GitHub avait avancé : la branche contenait `main` en 0.99.65 (0.99.51 à 0.99.65, fusionnée par RS-7 le 18.11, PR #6), alors que ce lot était parti de la 0.99.50. Le build tel quel aurait fait reculer l'app de quinze versions. Ce qui part donc :
- la 0.99.65 de GitHub telle quelle, plus l'icône du xeroction (`4ff1962`) et la barre ∧ ∨ ✓ coupée (`9ab49b3`) ;
- la bande entre les koins de nouveau toujours là, comme en 0.99.57 : la fusion du 18.11 avait remis son `hidden` (le test 0.99.57 le disait) ;
- un test de xerbot qui échouait au hasard (deux `Date.now()`), rendu stable ;
- 496 tests passés deux fois, vite build sans erreur.
Mis de côté (`4e61e6d`) : le relais `24ec99a`, déjà dans la 0.99.61 ; le mode xerboxion `c5fbad1` (le trou entre les koins), à réconcilier au prochain lot avec la bande de la 0.99.57 et de la 0.99.60, qui occupe la même place.
- `24ec99a` le relais natif pose `Content-Type: multipart/form-data` pour un FormData (src/marketplace/depot.js). Sans lui, Capacitor 8 (`CapacitorUrlRequest.setRequestBody`) ne pose aucun corps : coord répondait « rien à envoyer » (#1987, #2099) et les originaux de la galerie n'arrivaient pas dans le boxion (39 sur 52). Le natif fabrique le boundary.
  - côté labo, déjà en ligne sans build : coord envoie un message sans fichier en JSON.
- `9ab49b3` la barre ∧ ∨ ✓ d'iOS (la barre d'accessoires de WebKit) est coupée de base : sur iOS 26 elle flottait par-dessus la bande de koins du bas dès que le clavier s'ouvrait (#2128, « je ne peux pas utiliser les koins là »). Le plugin Keyboard la coupe à son chargement (il n'a pas de clé de config pour elle) ; c'est l'app qui la rallumait (réglage `barreClavier`, allumé de base depuis la 0.23). Défaut coupé + une bascule unique des réglages déjà rangés (marque `barreClavierVue`) ; ⚙ › Navigation la rallume ; natif seulement, jamais d'erreur. `Keyboard.resize = native` écrit en clair dans capacitor.config.json (c'était déjà le défaut : la vue web rétrécit au-dessus du clavier, la bande reste visible, la capture de #2128 le montre). Vérifié : tests node + faux iPhone (au démarrage un seul `setAccessoryBarVisible({ isVisible: false })`, pareil après relance avec des réglages d'avant).
- `4ff1962` l'icône de base de l'app = le logo du xeroction (#2127 ; le SVG de RS-7 dans docs/look/xeroction.svg). Rendu par Chromium (la balade) en 1024 × 1024 : fond noir, le glyphe ×5 (630 × 600 px) centré, 197 px de marge sur les côtés et 212 px en haut et en bas. La base en RGB sans canal alpha (l'App Store refuse l'alpha) ; la sombre et la teintée en transparence, comme avant ; mêmes noms de fichiers, même Contents.json ; un test garde la forme du catalogue (tests/icone-app.test.mjs).
- `c5fbad1` le mode xerboxion devient tout le xer des koins (#2120) : les koins toujours (comme en organique, le dock s'efface) ; le trou entre les deux koins du bas toujours comblé (src/app/koin-trou.js, le dessin de jOSTsoins : trapèze renversé à trapèzes emboîtés, la hauteur des koins). La bande qu'un ploxion pose lui-même (jOSTsoins, coord) fait foi : sous les koins, cachée pendant qu'ils s'ouvrent. Sinon la bande auto du ploxion (jOSXerkoin.pour ; un triangle lance son action, jOSXerkoin.lancer), au-dessus de l'indicateur d'accueil, et le ploxion s'arrête au-dessus du trou ; à l'accueil le wormion adapté, un toucher ouvre les koins. Les koins dessinés avec les glyphes de l'alien (xb:alien:glyphes : k1, k2, k3, trait, traitI). Le panneau du mode le dit en une ligne. Chill-tekk, organique, xerbot : rien ne change.
  - côté labo (sans build, pour RS-1) : jOSTsoins mesure le koin avec getBoundingClientRect, agrandi par l'ouverture (×3,2), et redessine un trou géant (offsetWidth/offsetHeight donnent la vraie taille) ; sa bande descend à 4 px du bas, sous l'indicateur d'accueil de l'iPhone (28 px au-dessus du bas suffiraient).

## Pour un prochain build

### Changer l'icône depuis ploxi0n (#2127 : « je veux changer l'icône de l'application depuis ploxi0n, pck je suis un xeroction »)
Pas dans le lot du 21.11 : iOS ne le permet que par `UIApplication.setAlternateIconName`, donc du Swift, qu'on ne compile pas ici. La marche à suivre, en un seul lot :
1. Les icônes : dans `ios/App/App/Assets.xcassets/`, un jeu par icône alternative, de la même forme que `AppIcon.appiconset` (un Contents.json à trois images 1024 × 1024 : la base en RGB sans alpha, la sombre, la teintée). Par exemple `AppIcon-Losange.appiconset` = l'ancienne icône (les trois PNG d'avant `4ff1962` : `git show 4ff1962^:ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`, idem pour `AppIcon-sombre.png` et `AppIcon-teinte.png`). Une nouvelle icône : une page HTML de 1024 × 1024 (fond plein, le SVG centré) passée à la balade (`--taille 1024x1024 --capture …`) ; la sombre et la teintée : la même page rendue sur noir et sur blanc, puis la transparence calculée pixel par pixel (alpha = 255 − (blanc − noir), couleur = noir × 255 / alpha).
2. Le build : Xcode n'embarque un jeu alternatif que s'il est nommé dans le réglage de build `ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES` (les noms séparés par des espaces, ex. `AppIcon-Losange`) de la cible App. Le poser par fastlane (gem xcodeproj : un `def ajouter_icones` appelé dans la lane `beta`, comme `retirer_ar`), jamais à la main dans le .pbxproj. actool écrit alors tout seul `CFBundleIcons › CFBundleAlternateIcons` dans l'Info.plist compilé : rien à ajouter dans `ios/App/App/Info.plist` (la voie à la main, `CFBundleAlternateIcons` + des PNG 120 et 180 px hors du catalogue, est l'ancienne façon).
3. Le Swift, minimal, dans `PloxiApple` (AppDelegate.swift, le plugin déjà enregistré par PloxionVC) : deux entrées dans `pluginMethods`, `CAPPluginMethod(name: "icone", returnType: CAPPluginReturnPromise)` et `CAPPluginMethod(name: "iconeActuelle", returnType: CAPPluginReturnPromise)`, et :
   ```swift
   @objc func icone(_ call: CAPPluginCall) {
       let nom = call.getString("nom") ?? ""   // "" : l'icône de base (le xeroction)
       DispatchQueue.main.async {
           guard UIApplication.shared.supportsAlternateIcons else { call.reject("icônes alternatives indisponibles"); return }
           UIApplication.shared.setAlternateIconName(nom.isEmpty ? nil : nom) { e in
               if let e = e { call.reject(e.localizedDescription) } else { call.resolve() }
           }
       }
   }
   @objc func iconeActuelle(_ call: CAPPluginCall) {
       DispatchQueue.main.async { call.resolve(["nom": UIApplication.shared.alternateIconName ?? "", "possible": UIApplication.shared.supportsAlternateIcons]) }
   }
   ```
   iOS affiche toujours sa petite alerte « Vous avez modifié l'icône de ploxi0n » (aucune API publique ne la tait) ; l'app doit être au premier plan.
4. Le JS : `src/natif/icone-app.js` avec `changerIcone(nom)` et `iconeActuelle()`, par le `PloxiApple` de `src/natif/plugins-app.js` (le plugin n'est jamais rendu d'une fonction async : `surPromesse()`, `src/natif/plugin-sur.js`) ; hors iPhone ou sur un build sans la méthode : « pas possible », sans erreur. Tests : node avec un faux PloxiApple, puis le faux iPhone (extraire-plugins.cjs lit les méthodes dans le Swift).
5. Le réglage : ⚙ › Apparence (`section('apparence', …)` dans `src/app/reglages.js`), une rangée « L'icône de l'app » : les icônes en petites tuiles (xeroction, losange…), la tuile active marquée (`iconeActuelle`) ; montrée seulement au palier xeroction (`compte.etat().palier === 'xeroction'`, le rang affiché dans ⚙ › Compte). Un bouton = son nom.
6. Sans Swift maison : un plugin communautaire (`@capacitor-community/app-icon`), mais c'est une dépendance npm et un paquet SPM de plus, à vérifier pour Capacitor 8 ; les dix lignes dans PloxiApple restent plus sûres pour un build par jour.

### Le logo du xeroction ailleurs dans l'app (proposé, pas changé)
- L'écran de démarrage (`ios/App/App/Assets.xcassets/Splash.imageset`, trois PNG 2732 × 2732, montré par LaunchScreen.storyboard en scaleAspectFill) est encore l'ancien losange noir sur fond blanc : l'app s'ouvre sur un écran blanc avant l'écran de chargement sombre. À passer au xeroction sur noir (même rendu par la balade, glyphe vers 20 à 25 % de la largeur : l'aspect fill rogne les côtés sur iPhone).
- Le glyphe xeroction de l'interface (`src/app/glyphes.js`, le ✕ au trait des koins, la case « toi ») : à redessiner d'après le SVG, pour que l'icône et le koin aient la même forme.
- `public/icons/ploxi0n.svg` (l'icône de l'onglet) et `public/icons/ploxi0n-1024.png` (la pochette de l'écran verrouillé, src/natif/lecteur.js) : encore le losange.
