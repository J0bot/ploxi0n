# ploxi0n — la feuille de route complète

*RS-7, 12.10.2026 : « il y a tellement de choses à ajouter à l'app, c'est abusé, il faut que t'aies déjà fait une énorme liste de tout ce qu'on compte faire ».*
*Tout ce qui a été demandé depuis le brief v1 (11.10), rangé par axe. Sources : le brief PDF, `docs/plan-suite.md` (points 1–15), les braindumps du labo (`docs/braindumps/2026-10-1*`), les messages de la session. Tenue à jour à chaque version.*

**Légende** : ✅ fait (version) · 🔨 en cours · ⏭ prochain · 💭 plus tard · ❓ attend une décision de RS-7

---

## 1. Le socle (ce qui fait tourner les ploxions)

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | boxion_local (mémoire, IndexedDB, SQLite) | Data Protection iOS (0.4) au lieu de SQLCipher |
| ✅ 0.1 | Shim jOS : jOSPorts, jOSTsoin, jOSBoxion, miroir localStorage, routes locales | |
| ✅ 0.8 | **Mode connecté** : toute route du serveur → xerboxion.org avec le jeton ; cache hors ligne | labo `JetonAppWeb`, kill-switch |
| ✅ 0.8 | Bions **touchés** résolus récursivement, rattrapage des anciens | xerkions, réglages, ultimate-social |
| ✅ 0.8 | jOSXerPrefs complet (get/set/ouvrir/params/demande) | |
| ⏭ | **Envoi de fichiers** par le mode connecté (FormData / multipart) | aujourd'hui : 503 « pas encore relayé » |
| ⏭ | Les bions qui manquent encore : jOSComptes, jOSToast, jOSXerkionsForge (404 sur /px/bion-app) | côté labo : les servir seuls |
| ⏭ | Mettre à jour les **bions** (pas seulement les ploxions) dans « vérifier les mises à jour » | |
| 💭 | jOSPorts relié au **bus du boxion** (xion en direct, SSE) en mode connecté | le phone devient un nœud du xion |
| 💭 | Le **boxion de chacun** comme source (pas seulement xerboxion.org) : choisir son boxion | topologie 2 boxions |
| 💭 | Fil threads WASM (COOP/COEP) : impossible dans la WebView Capacitor → serveur local natif | seul échec du banc |

## 2. Le compte, les rangs, le Nexus

| | Quoi | Notes |
|---|---|---|
| ✅ 0.6 | Se connecter avec son compte xerboxion.org (PKCE), bouton dans le HUD | |
| ✅ 0.8 | Jetons d'app de 180 j (Sanctum lisait 30 **minutes**) | |
| ⏭ ❓ | **Sign in with Apple** → un compte **bion** seulement | route labo qui vérifie le jeton d'Apple |
| ⏭ | Monter de rang : **code d'un xerion** (→ zion) ; **installer son boxion** (→ xeroction) | |
| ⏭ | **L'icône qui évolue avec le rang** (icônes alternatives iOS : bion → … → xeroction) | |
| 💭 | **L'app xeroction** : au rang xeroction, l'accueil montre tous les xers et le Nexus | |
| 💭 | Le **Nexus des xeroctions** : un xeroction demande l'accès TestFlight par e-mail, RS-7 valide, la CI l'ajoute (groupe externe) | revue bêta Apple par version |
| 💭 | Le **speedrun** : de bion à xeroction, annoncé au Nexus (note TestFlight « What to Test ») | |

## 3. Le marketplace

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Installer depuis xerboxion.org, pack hors ligne, mises à jour (ETag) | |
| ✅ 0.6 | Dépendances automatiques (comme les mods sur Prism) | |
| ✅ 0.7 | Popularité = **heures du Nexus** (pas les vues), « zéro heure », « souvent utilisé avec » | |
| ✅ 0.8 | Refait : vitrine, grille, A–Z, découvrir (glisser), à moi, fiche, recherche instantanée | |
| ⏭ | « **Un xer de cette app** » : proposer le xer d'un ploxion (chaque ploxion devient un xerboxion) | |
| ⏭ | Les ploxions **admin** visibles pour l'admin (pourriture-4…) | pourriture-4 reste personnel |
| ⏭ | Le **marketplace des raccourcis** : des recettes Raccourcis prêtes (liens iCloud) | plan-suite 13 |
| 💭 | **Plusieurs sources** : le boxion de chaque xeroction du Nexus, après le banc de compatibilité | plan-suite 7 |
| 💭 | Le **Steam Workshop** comme source (miroir labo `/px/workshop/*.json`, clé Steam sur le boxion) | plan-suite 12 |
| 💭 | Les **ploxions comme joueurs** : rangs, stats, commits, l'usage par feature (pas seulement par ploxion) | braindump machine à tsoin |

## 4. L'écran d'accueil de l'iPhone et iOS lui-même

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Liens `ploxi0n://px/<id>`, raccourcis de l'icône | |
| ✅ 0.5 | **App Intents** : Ouvrir un ploxion, Noter un tsoin | Siri, Spotlight, bouton Action |
| ✅ 0.9 | Envoyer à un ploxion (bus), Lire une valeur, Chercher un ploxion | |
| ✅ 0.9 | **Widgets** : 📌 épinglés, ◇ valeurs (aussi écran verrouillé) | App Group |
| ✅ 0.11 | 📲 **Tes ploxions en vraies apps** (profil de clips fabriqué par le labo) | |
| ⏭ | Widgets **interactifs** (iOS 17 : boutons, interrupteurs sans ouvrir l'app) | |
| ⏭ | Un widget **par ploxion** (chaque ploxion publie le sien : une valeur, un bouton, un graphe) | |
| 💭 | **Contrôles du Centre de contrôle** (iOS 18) : un bion = un contrôle | |
| 💭 | **Live Activities / Dynamic Island** : un tsoin en cours, un minuteur, la musique | |
| 💭 | **Un xer = un mode de concentration** avec ses pages d'accueil ; Focus Filter → l'app change d'accueil et de thème | « le vrai mode xerboxion sur le phone » |
| 💭 | Liens universels `https://xerboxion.org/px/<id>` qui ouvrent l'app | Associated Domains coché |
| 💭 | Le **mode xerboxion** de tout l'iPhone : réglages, son, interface pilotés par des ploxions et des bions (Raccourcis + automatisations) | tableau de plan-suite |

## 5. La navigation et le multitâche

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Dossiers | |
| ✅ 0.8 | **Pages** d'accueil qu'on fait glisser | |
| ✅ 0.12 | **Ouvrir un ploxion depuis un ploxion** (pile : « ‹ » y revient vivant) | |
| ✅ 0.12 | **▁ Minimiser**, « en arrière-plan » sur l'accueil, **⧉ basculer** | 5 vivants au plus |
| ✅ 0.12 | **Les bords** gauche/droit : glisser pour passer d'une app à l'autre | |
| ✅ 0.13 | Le **dock en bas** (compte, épinglés, ⚙) | RS-7 : « la barre boxion avec les épinglés en bas » |
| ✅ 0.13 | **Six façons de voir ses ploxions** : grille, compacte, liste, usage (ses heures), récents, catégories | |
| ✅ 0.13 | Le **droit au silence** appliqué : ce qu'un ploxion accroche à la page se cache, revient et part avec lui | le carré lilas flottant |
| ⏭ | Glisser-déposer pour ranger (au lieu du ✎ + prompt) | |
| ⏭ | Deux ploxions côte à côte (iPad, iPhone en paysage) ; **fill the gaps** dans l'app (jOSGaps) | |
| 💭 | Le **cube** / la carte géante des apps (vision originelle 14.09) comme accueil alternatif | |

## 6. Le look

| | Quoi | Notes |
|---|---|---|
| ✅ 0.11 | **Chill-tekk-7026** : presque noir, violets délavés, aucun dégradé, arrondi chill usé, patine, inscriptions gravées | |
| ⏭ | Les **trois modes** : chill-tekk (tsoin engine seul, chill absolu) · xerboxion (tout tourne) · xeroction (voir ce qu'on a fait) | braindump 11.10 |
| ⏭ | Les ploxions eux-mêmes en chill-tekk-7026 (le thème du labo appliqué dans l'app) | |
| 💭 | Les **xers** (thèmes, dispositions) choisis dans l'app | |
| 💭 | L'UI **organique vivante** : mitose (uncraft), fusion (craft), membranes, tubes | APRÈS le système bions |

## 7. Les notifications

| | Quoi | Notes |
|---|---|---|
| ✅ 0.3 | Notification locale (banc) | |
| ✅ 0.12 | ⚙ « tester une notification » ; **messages de coord** tant que l'app est ouverte | |
| ⏭ ❓ | **Les vraies notifications push (APNs)** : coord, DM, social, bother… même app fermée | une clé APNs (portail Apple) ; le labo l'envoie → décision : où vit la clé |
| 💭 | Chaque ploxion publie ses notifications (jOSNotif) ; les régler par ploxion | |

## 8. Les capacités de l'iPhone (le banc)

| | Quoi | Notes |
|---|---|---|
| ✅ 0.3 | Banc iPhone (~60 sondes : capteurs, caméra, QR, voix, santé, NFC, Wi-Fi, BLE, Face ID…) | tout vert sauf WASM threads |
| ✅ 0.4 | **Face ID** : verrous par ploxion, coffre | |
| ⏭ | **ultimate-bluetooth** sur iPhone (bluetooth-le en bion) | |
| ⏭ | Santé (pas, sommeil) en bions lisibles par les ploxions | lecture seule, sur accord |
| 💭 | NFC → tags qui ouvrent des ploxions ou lancent des tsoins (les **kions** dans le réel) | |

## 9. Les ploxions à faire vraiment marcher sur l'iPhone

| | Quoi | Notes |
|---|---|---|
| ✅ 0.8 | **bother me** de base (pour les testeurs) | |
| ✅ 0.8 | réglages, xerkions, ultimate-social, social (mode connecté + bions) | à confirmer sur l'iPhone |
| ⏭ | **Fichiers** (jOSFiles) et la connexion au boxion | envoi de fichiers d'abord |
| ⏭ | **Stremio**, **YouTube**, **Instagram** intégrés | |
| ⏭ | **Coord** 📡 dans l'app (lire, écrire, pièces) | |
| ⏭ | **pourriture-4** (admin, personnel) : téléphone d'abord, glisser-déposer fichiers/photos/captures | |
| ⏭ | **Code** : la console xerboxion (xerminal, btop, RAM, paquets, apt sur le boxion) | braindump 11.10 |
| 💭 | **👁 Le vu** : ce qu'on regarde (YouTube, Stremio, Netflix, **Trakt**) — un bion jOSVu, une frise | plan-suite 14 |
| 💭 | La **symbiose 3D** : voir en temps réel ce que fait l'agent, annoter | braindump 11.10 |
| 💭 | Le **robot de la certitude** : le fact-check, « la certitude du Nexus » | braindump 10.10 |

## 10. Les tsoins et la machine à tsoins

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | Tsoins locaux (jOSTsoin), Noter un tsoin par Raccourcis (0.5) | |
| ⏭ | Les tsoins de l'iPhone **remontent au boxion** (réplication pull/apply) | |
| 💭 | Le **tsoin engine** sur le phone : détecter les patterns d'usage → proposer une automatisation (deux koins → un koin) | sans LLM |
| 💭 | La **vidéo faite de tsoins** : le processus « fais ton app » rejoué depuis ses tsoins | plan-suite 8 |

## 11. La technique pour tout le monde

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | CI GitHub Actions + fastlane + TestFlight sans Mac | |
| ✅ 0.9 | Les widgets ajoutés par la CI (xcodeproj), signés par match | |
| ⏭ | Le **modèle de dépôt** « fais ton app » : la coque, le shim, la CI ; tes ploxions viennent de ton boxion | plan-suite 6 |
| 💭 | Le **banc de compatibilité** comme porte d'entrée au Nexus (contrat jOSApps du xer de xerboxion.org) | |
| 💭 | Android (la même coque Capacitor) | |

## 12. Le jeu

| | Quoi | Notes |
|---|---|---|
| 💭 | **pourriture-4 sur Steam** : construire son vaisseau, depuis la station pourriture-4 du Nexus ; VR ; core Rust | RS-7 a les droits Steam |
| 💭 | Le speedrun du xerboxion : de pourriture-4 au xeroction ; trouver tous les xerboxions et leur machine à tsoins → des kions dans le réel | |

## 13. La qualité

| | Quoi | Notes |
|---|---|---|
| ✅ | 47 tests (jsdom), banc labo 55/55, `tools/diagnostic-iphone.mjs` (le vrai chemin de l'app) | |
| ⏭ | Diagnostic sur **tous** les ploxions publics (un par processus), publié comme compat.json | |
| ⏭ | Captures automatiques des écrans (Chromium, taille iPhone) à chaque version | |

---

## Les décisions qui t'attendent (❓)

1. **Les notifications push (APNs)** : il faut une clé APNs (developer.apple.com › Keys › + › Apple Push Notifications service). Le serveur qui envoie (le labo) doit la détenir, alors que la règle actuelle dit « les secrets Apple jamais sur le Boxion ». Options : (a) la clé APNs sur le labo, isolée et révocable (elle ne sert QU'À envoyer des notifications, pas à publier l'app) ; (b) un petit relais ailleurs ; (c) pas de push, seulement app ouverte.
2. **Sign in with Apple** : la route labo qui crée un compte **bion** à partir du jeton Apple. À confirmer : l'e-mail masqué d'Apple suffit, pas d'autre donnée.
3. **Testeurs externes** (Nexus des xeroctions) : chaque version passe par une revue bêta d'Apple (≈ 1 jour). On y va maintenant ou on garde des testeurs internes ?
4. **Steam Workshop** : quand le jeu pourriture-4 existe sur Steam (la clé API vivra sur le boxion).
