# ploxi0n sur CarPlay (0.99.31)

RS-7, 07.11 : « ploxion sur CarPlay » (une photo de CarPlay dans sa voiture : Plans, Spotify, Téléphone).

## Ce qu'Apple permet (et pas)

- **CarPlay n'affiche jamais une page web.** Les ploxions tels quels (du HTML dans une WebView) ne peuvent pas aller sur l'écran de la voiture.
  Une app n'y a droit qu'aux **gabarits** d'Apple : des listes, des onglets, des grilles, le lecteur audio, des alertes… selon sa catégorie.
- **Il faut l'autorisation d'Apple** (un « entitlement » CarPlay), accordée **par catégorie** : audio, communication, navigation,
  « tâche de conduite » (driving task), recharge, parking, carburant, commande de repas. Sans elle, une app qui la déclare ne se signe pas.

## Ce qui est construit (derrière l'option de build `PLOXI0N_CARPLAY`, éteinte par défaut)

Deux onglets, rien que des listes (ce que les catégories audio ET tâche de conduite acceptent) :

| onglet | ce qu'on y voit | toucher |
| --- | --- | --- |
| **Potes** | les rendez-vous, puis les potes de Proche qui partagent leur position : « RS-3 · 120 m au nord-est · à l'instant », les plus proches d'abord | l'itinéraire en voiture dans **Plans, sur l'écran de la voiture** |
| **Ambiances** | pluie, vent, vagues, feu, orage, ruisseau, bruits rose et brun ; « ■ tout couper » quand quelque chose joue | lancer / couper le son (l'iPhone peut rester verrouillé) |

- Le modèle est fait en JS (`src/bions/carplay.js`, testé), poussé au Swift (`src/natif/carplay-natif.js` : toutes les 8 s quand la voiture est
  branchée, si quelque chose a changé) ; le Swift (`PloxiCarPlay` + `PloxiCarPlayScene` dans `AppDelegate.swift`) le dessine et le **garde** :
  une voiture branchée avant que l'app ait démarré montre le dernier état. Un pote ou un rendez-vous ouvre Plans sans même la page.
- Le faux iPhone simule CarPlay : `tools/faux-iphone/parcours-carplay.mjs` (la voiture se branche, les potes, la pluie qu'on lance et qu'on coupe).
- fastlane `ajouter_carplay` (testé sur une copie du projet) : la condition de compilation, l'autorisation dans `App.entitlements`
  (`com.apple.developer.carplay-audio` par défaut, ou `-driving-task` avec la variable `PLOXI0N_CARPLAY_TYPE`), la scène CarPlay dans Info.plist.

## Ce que RS-7 doit faire (une fois)

1. **Demander l'autorisation** : developer.apple.com/contact/carplay (connecté avec le compte développeur). Catégorie conseillée : **Audio**
   (les ambiances ; plus tard « à l'écoute » et le synthé). La réponse d'Apple prend de quelques jours à quelques semaines, et peut être un refus.
2. Quand c'est accordé : Certificates, IDs & Profiles › Identifiers › `ch.j0bot.ploxi0n` : la capacité CarPlay apparaît ; la cocher.
3. Lancer le workflow « iOS TestFlight » avec **`regenerer_profil`** ET **`carplay`** cochés (le profil doit contenir l'autorisation).
4. Brancher l'iPhone dans la voiture : l'icône ploxi0n apparaît dans CarPlay.

## Pas encore vérifié

- Le Swift n'est pas compilé ici (pas de Mac) : relu ligne par ligne (les API de CarPlay d'iOS 14+, la cible est iOS 15).
- Lancer un son depuis CarPlay pendant que l'iPhone est verrouillé : iOS peut demander un premier geste sur l'iPhone pour le son de la page
  (alors : ouvrir Ambiances une fois sur l'iPhone).
- `UIApplicationSupportsMultipleScenes` reste à `false` (une seule fenêtre sur l'iPhone) ; la scène CarPlay est d'un autre rôle.
