# ploxi0n en Rust : le cap (RS-7, 18.10.2026)

> « Enfait tu fais du js, mais pour plus tard je veux du rust uniquement, avec du bevy ou autre truc. »

C'est une **décision de RS-7**, pas encore un chantier. Ce qui suit est le chemin proposé ; rien n'est commencé dans ploxi0n.

## Ce qui existe déjà en Rust (composer, ne pas rebâtir)

- **boxion-rt** (`J0bot/boxion-rt`) : le cœur du xerboxion, `xerboxion-host` (axum + tokio + wasmtime). Les ploxions y sont du
  **WASM** (`ploxions/sdk`, `wasm32-unknown-unknown`). Il a un bus, un store et un codec de tsoins (`tsoin-codec`).
- **boxion-rt/android** : l'« Approche B ». Le même cœur est compilé pour le téléphone (`aarch64-linux-android`) et embarqué dans une
  coquille fine. Les ploxions sont servis en boucle locale (`127.0.0.1:8730`), sans réseau. wasmtime y tourne en **Pulley**
  (interprète, pas de JIT). Il note aussi : « les vues 3D lourdes : les sortir de la WebView vers du wgpu natif, plus tard ».
- **labo-cape** : `crates/cape-core`, la physique et la sécurité de la blouse.

## Le chemin proposé, par paliers (chacun livrable seul)

1. **Le cœur du xerboxion sur l'iPhone, en Rust.** La même chose que l'Approche B d'Android, pour `aarch64-apple-ios` : `xerboxion-host`
   en bibliothèque statique, appelée depuis le Swift de l'app. iOS interdit le JIT, donc **Pulley obligatoire**, comme sur Android.
   ploxi0n parle alors à un vrai boxion local au lieu du shim JS (`src/shim/`, `src/boxion-local/`).
2. **Les moteurs en Rust → WASM.** D'abord le moteur du clicker (`jOSXerClicker`, pur calcul : le log10, la production, les achats, la
   fusion des parties). Une crate `xerclicker-core` compilée en WASM, avec la même API, que le labo, l'app et boxion-rt chargent. Elle se
   compile aussi en natif pour un widget iOS qui avance seul (aujourd'hui le widget montre la dernière valeur publiée).
3. **Bevy pour les vues 3D et les jeux** : le Cube du Clickion, le terrax, le cube des pages, la carte. Bevy tourne sur iOS (wgpu → Metal)
   et dans un navigateur (WebGPU / WebGL2).
   - **D'abord en WASM**, dans un ploxion (un canvas) : la même vue marche au labo, sur le PC et dans l'app.
   - **Ensuite en vue native** dans l'app (une `UIView` Metal par-dessus la WebView), pour la fluidité : c'est la « limite structurelle »
     que boxion-rt/android relève pour la WebView.
4. **La coquille.** Tant que les 593 ploxions du labo sont en JS, il faut une WebView pour les faire tourner (Capacitor aujourd'hui).
   Quand le cœur et les vues seront en Rust, on peut remplacer Capacitor par une coquille Rust (Tauri 2 mobile : Rust + WebView, qui garde
   les ploxions JS), ou par une app Bevy pure si on n'a plus besoin de la WebView.

## Le désaccord à trancher (challenge, pas flagornerie)

« Rust uniquement » et « composer, ne jamais rebâtir » (`boxion-rt/CLAUDE.md`, règle n° 1) tirent dans deux sens : les 593 ploxions et la
centaine de bions du labo sont en JS. Les réécrire tous, c'est rebâtir.

Proposition : **tout le code NEUF en Rust** (cœurs, moteurs, vues 3D, natif). Les ploxions JS existants restent et tournent dans la WebView,
puis migrent un par un quand un ploxion gagne vraiment à être en Rust (un jeu, une vue 3D, un calcul).

## Les contraintes d'ici (sessions dans le cloud)

- **Pas de Mac** : le Rust pour iOS (`aarch64-apple-ios`) ne se compile pas ici, pas plus que le Swift. Le WASM, si (`cargo` est là). Les
  paliers 2 et 3 en WASM peuvent avancer et être testés ici ; les paliers 1 et 3 natif se vérifient sur TestFlight (Codemagic, `docs/TESTFLIGHT.md`).
- Le faux iPhone (`tools/faux-iphone/`) teste le pont Capacitor : il ne verra pas un binaire natif.
- La taille : un Bevy en WASM pèse plusieurs Mo, contre ~170 Ko pour le clicker JS. Il faut ne garder que les plugins de Bevy utiles,
  et le charger à la demande.
