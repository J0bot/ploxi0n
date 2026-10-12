> **La direction de RS-7 (12.10.2026)** : « Umbrel, c'est juste une inspiration qu'on peut prendre sur l'architecture, et aussi pour déjà préparer le terrain pour des collaborations futures. » « Eux, ils ont les avis des customers ; nous, on essaie de faire un écosystème entier. »
> Donc : on n'intègre pas leur code ni leur catalogue maintenant ; on s'inspire de leur architecture (app store = dépôt git, auth par app, widgets typés, MCP, sessions natives courtes) et on garde nos formats compatibles (widgets, manifestes) pour qu'une collaboration soit simple le jour venu.

# Umbrel : ce que c'est, ce qu'on peut en tirer

> Recherche du 12.10.2026, en lecture seule. Sources : `getumbrel/umbrel` (umbrelOS 2.0.0, sorti le 22.09.2026), `getumbrel/umbrel-apps` (état du 12.10), `getumbrel/umbrel-community-app-store`, `getumbrel/umbrel-apps-gallery`, apps.umbrel.com, umbrel.com/legal. Les chiffres viennent d'un comptage sur l'archive du dépôt d'apps (pas d'estimation). Rien ici n'est un avis juridique : la partie licence dit ce que disent les textes, et où il faut demander.

En une phrase : Umbrel est un OS de serveur maison (Debian + Docker + une belle UI web + une app iOS/macOS), et son app store est un dépôt git de 368 apps docker-compose. On peut **lire** ce catalogue, **faire tourner** ces compose sur le boxion, **packager** le xer comme une app Umbrel et **piloter** un umbrelOS existant depuis ploxi0n. Chacune de ces quatre pistes a sa contrainte de licence, et elles sont résumées dans le tableau en fin de section 4.

---

## 1. Ce qu'est Umbrel

### Le produit

- **umbrelOS** : un OS complet, pas un paquet. Le README le dit noir sur blanc : il « ne peut pas être installé par-dessus une distribution Linux existante ». Image Debian *trixie*, construite avec rugix (rugpi) ; les mises à jour passaient par mender (on garde `info.json` « pour toujours » pour les vieilles boîtes 0.5). Cibles : PC Intel/AMD, Raspberry Pi 5 (sur NVMe/USB, pas microSD), machine virtuelle, et leurs boîtes vendues (Umbrel Home, Umbrel Pro). GPU AMD/NVIDIA pris en charge dans l'image amd64.
- **umbrelOS 2.0** (22.09.2026) : HTTPS local avec sa propre CA, multi-comptes (propriétaire + membres, apps partagées par membre), réglages par app (dossiers, variables d'env), données d'app déplaçables vers un disque externe, VMs (libvirt), photos (sauvegarde depuis l'iPhone), **serveur MCP** pour agents IA, et plus de conteneur `app_proxy` : le proxy est maintenant dans le démon.
- **Clients natifs** : `clients/apple` = une app iOS (`com.umbrel.app`, avec une extension d'envoi de photos en arrière-plan) et une app macOS, sur une lib Swift commune `UmbrelKit`. Au jumelage, l'app enregistre la CA locale de la boîte (épinglage par app, jamais installée dans le système) ; à travers Tailscale elle passe en HTTP dans le tunnel WireGuard. C'est exactement le terrain de ploxi0n : **ils ont déjà l'app iPhone qui parle à la boîte**.

### Le dépôt `getumbrel/umbrel` (monorepo, ~12 300 étoiles)

| Dossier | Contenu |
|---|---|
| `packages/os` | construction de l'image (Dockerfiles, rugix, overlays Pi) |
| `packages/umbreld` | le démon (TypeScript, Express + tRPC, tourne en root, écoute sur `127.0.0.1`) |
| `packages/ui` | l'interface web (React, Tailwind, react-query) |
| `containers/tor` | l'image Tor |
| `clients/apple` | iOS + macOS (Swift) |

### umbreld, le cœur

Les modules de `packages/umbreld/source/modules/` donnent la carte : `apps` (cycle de vie des apps), `app-gateway` (proxy et auth par app), `auth`, `lan-ingress` (ports 80/443 + règles nftables qui redirigent les ports des apps vers des écouteurs internes, certificats avec leur CA), `widgets`, `files`, `photos`, `backups`, `machines` (VMs), `mcp`, `notifications`, `event-bus`, `shortcuts`.

**L'API** est un routeur tRPC monté sur `/trpc` (HTTP + WebSocket), avec quelques routes REST à côté (`/api/files`, `/api/photos`, `/mcp`, `/app-auth`, `/lan-ingress/umbrel-local-ca.crt`). Les procédures qui nous intéressent :

| Procédure | Accès | Ce qu'elle fait |
|---|---|---|
| `user.login` `{userId?, password, totpToken?}` | public | session navigateur (7 jours), renvoie un jeton tableau de bord et pose les cookies (dont celui de la passerelle d'apps) |
| `user.loginNative` `{…, client:{id, platform, deviceClass, appVersion, appBuild, osVersion}}` | public | session native : `accessToken` (1 h) + `deviceToken` |
| `user.refreshNativeAccess` `{deviceToken, client}` | public | renouvelle l'`accessToken` |
| `appStore.registry` / `repositories` / `addRepository` / `removeRepository` | membres / propriétaire | le catalogue, les sources d'apps |
| `apps.list` | membres | apps installées : `id, name, icon, port, path, state, widgets, hiddenService, credentials, dependencies…` |
| `apps.install/start/stop/restart/update/uninstall/logs/state` | propriétaire | cycle de vie |
| `apps.setTorEnabled` | propriétaire | Tor pour toutes les apps |
| `widget.data` `{widgetId}` | membres | les données d'un widget |

Auth : `Authorization: Bearer <jeton>`, jetons au format `umbrel_<32 hex>_<64 hex>`, 2FA TOTP optionnelle. En CLI sur la boîte : `sudo umbreld client apps.list.query`.

**Le serveur MCP** (`/mcp`, Réglages → AI agents) : le propriétaire crée des jetons nommés, révocables, avec des permissions. Outils exposés : lister les apps installées, état, détails, logs, désinstaller, réglages, déplacer les données, **chercher dans l'App Store, détails d'une app du store, installer**. C'est l'API qu'ils ont prévue pour des clients tiers.

### Comment une app est exposée

- Chaque app a un **port hôte** (`port` du manifeste), servi en HTTP **et** HTTPS (2.0) : `http(s)://umbrel.local:<port><path>`.
- Devant, la **passerelle d'apps** de umbreld exige la session Umbrel (cookie) sauf si l'app désactive l'auth (`PROXY_AUTH_ADD: "false"`) ; elle sait aussi ouvrir quelques chemins (`PROXY_AUTH_WHITELIST`, par ex. `/api/*`) et en refermer (`PROXY_AUTH_BLACKLIST`). En 2.0, le propriétaire peut couper « Require Umbrel login » app par app.
- **Tor** : un service caché par app quand Tor est activé (`APP_HIDDEN_SERVICE`), plus un onion pour le tableau de bord (port 2000 en interne).
- **Distant** : pas de relais maison ; c'est l'app Tailscale (ou Tor) qui fait le travail.
- **Widgets** : des cartes sur l'écran d'accueil, 3 au plus par compte, remplies par un endpoint JSON de l'app que umbreld va chercher **côté serveur** (voir §2).

---

## 2. Le format des apps

Une app = un dossier nommé par son id :

```
<app-id>/
  umbrel-app.yml       le manifeste
  docker-compose.yml   les conteneurs
  exports.sh           (si besoin) variables calculées, contrat pour les apps qui en dépendent
  hooks/               (si besoin) pre-install, pre-start, post-update…
  *.template           (si besoin) passés à envsubst à l'install/au démarrage
  data/.../.gitkeep    squelette des dossiers montés
```

### `umbrel-app.yml`

Exemple réel (Uptime Kuma, l'app la plus simple de l'échantillon, auteurs retirés) :

```yaml
manifestVersion: 1
id: uptime-kuma
storage:
  dataRoot: data
category: networking
name: Uptime Kuma
version: "2.5.6"
tagline: Self-hosted uptime monitoring tool
description: >
  Uptime Kuma is a self-hosted monitoring tool like Uptime Robot. …
developer: …
website: https://uptime.kuma.pet
dependencies: []
repo: …            (dépôt amont)
support: …         (issues amont)
port: 8385
gallery: [1.jpg, 2.jpg, 3.jpg]
path: ""
defaultPassword: ""
releaseNotes: > …
submitter: …
submission: https://github.com/getumbrel/umbrel/pull/1148
```

Les champs, et combien d'apps (sur 393 manifestes) les utilisent :

| Champ | Rôle | Présence |
|---|---|---|
| `manifestVersion` | version du *framework* Umbrel exigée (1, 1.1, 1.2, 2.0) ; un umbrelOS plus vieux refuse l'install | 393 (1 : 272 · 1.1 : 96 · 1.2 : 22 · 2.0 : 3) |
| `id` | = nom du dossier, kebab-case, jamais changé | 393 |
| `name`, `tagline`, `description`, `releaseNotes` | textes de la vitrine (Markdown via YAML plié) | 393 |
| `category` | une des 10 catégories | 393 |
| `version` | version amont | 393 |
| `developer`, `website`, `repo`, `support`, `submitter`, `submission` | crédits et liens | 393 |
| `port` | port hôte de l'app, **unique dans tout le store** | 393 |
| `path` | sous-chemin d'ouverture (`""` ou `/admin`) | 393 |
| `gallery` | noms de fichiers (store officiel) ou URLs (stores communautaires) | 393 |
| `dependencies` | ids d'autres apps Umbrel requises | 86 non vides |
| `implements` | « je peux remplacer l'app X » (nœuds Bitcoin, serveurs Electrum) | 4 |
| `defaultUsername` / `defaultPassword` / `deterministicPassword` | identifiants affichés ; le dernier affiche `APP_PASSWORD` | 308 / 269 / 95 |
| `storage: {dataRoot: data}` | données déplaçables (2.0) | 222 |
| `permissions` | `STORAGE_DOWNLOADS` (28), `GPU` (14) | 42 |
| `torOnly`, `requiresHttps`, `nativeTlsHostnameSuffixes` | réseau particulier | 75 / 3 / 1 |
| `widgets` | widgets d'accueil | 14 |
| `backupIgnore` | exclusions de sauvegarde | 36 |
| `folderAccess`, `environment` | réglages utilisateur (2.0) | 5 / 1 |
| `disabled` | retirée du store | 25 |
| `icon` | URL d'icône ; **absent du store officiel** (icônes hébergées à part), permis dans les stores communautaires | 0 |

### `docker-compose.yml` : les conventions

Un compose presque standard qu'umbrelOS **patche** avant de le lancer :

- Un service fantôme **`app_proxy`** qui n'a que des variables : `APP_HOST: <app-id>_<service>_1` (le nom de conteneur injecté), `APP_PORT: <port interne>`, et éventuellement `PROXY_AUTH_ADD`, `PROXY_AUTH_WHITELIST`, `PROXY_AUTH_BLACKLIST`. En 2.0, aucun conteneur ne tourne pour lui : umbreld lit ces valeurs et route `port` → `APP_HOST:APP_PORT`.
- `container_name` injecté (`<app-id>_<service>_1`), réseau externe `umbrel_main_network` injecté comme `default`.
- Données **toujours** en bind mounts sous `${APP_DATA_DIR}/data/...`, jamais de volumes nommés.
- Images **épinglées** `registre/image:tag@sha256:<digest multi-arch>`, amd64 + arm64 obligatoires, jamais de `build:` (0 dans le dépôt).
- Variables fournies : `APP_ID`, `APP_DATA_DIR`, `APP_DATA_ROOT`, `APP_DOMAIN`, `APP_PROXY_PORT`, `APP_SEED`, `APP_PASSWORD`, `APP_HIDDEN_SERVICE`, `DEVICE_HOSTNAME`, `DEVICE_DOMAIN_NAME`, `NETWORK_IP`, `TOR_PROXY_IP/PORT`, `TOR_DATA_DIR`, `UMBREL_ROOT`.
- **Secrets déterministes** : `derive_entropy <label>` = HMAC-SHA256 de la graine de l'appareil et d'une étiquette. `APP_SEED` = `derive_entropy "app-<id>-seed"`, `APP_PASSWORD` = `derive_entropy "app-<id>-seed-APP_PASSWORD"`. Mêmes valeurs à chaque redémarrage, sans fichier de secrets.

Trois manifestes réels :

| App | Services | Ce qui la rend intéressante |
|---|---|---|
| **uptime-kuma** | `app_proxy` + `server` | le cas d'école : une image, un volume, auth Umbrel coupée |
| **nextcloud** | `app_proxy`, `db` (MariaDB), `redis`, `web`, `cron` | `exports.sh` + hook `pre-start` monté **dans** les conteneurs comme entrypoint de migration ; `deterministicPassword` pour l'admin ; mots de passe de base en dur dans le compose (le réseau Docker est censé être privé, ce que leur propre doc déconseille aujourd'hui) |
| **bitcoin** | `app_proxy`, `app`, `tor`, `i2pd_daemon` | IPs fixes sur le réseau, ports P2P/RPC publiés, `exports.sh` qui sert de **contrat** aux 80 apps de l'écosystème Bitcoin, 2 widgets (`four-stats`, `text-with-progress`) |
| **home-assistant** | `server` seul | `network_mode: host` + `privileged: true` + `/dev:/dev` monté : pas d'`app_proxy`, accès total au matériel |

### `exports.sh`, hooks, templates

- `exports.sh` est **sourcé** par le script d'app (en root, `set -euo pipefail`) ; il exporte des `APP_<ID>_...` pour l'app et pour celles qui en dépendent (74 apps en ont un).
- `hooks/` : `pre-install`, `post-install`, `pre-start`, `post-start`, `pre-stop`, `post-stop`, `pre-update`, `post-update` ; scripts bash exécutés **sur l'hôte** (93 apps).
- `*.template` : `envsubst` au démarrage (torrc, fichiers de config).
- Les mises à jour ne recopient que `docker-compose.yml`, les templates, `exports.sh`, `torrc` et `hooks/`.

### Widgets

Déclarés dans le manifeste : `id`, `type`, `refresh`, `endpoint` (`service:port/chemin`, sans schéma, résolu sur le réseau Docker et appelé par umbreld, **sans les cookies du navigateur**), `link`, `example` (pour le sélecteur). L'endpoint renvoie le JSON du type. Les 7 types, tirés de `packages/ui/src/modules/widgets/shared/constants.ts` :

| Type | Forme du JSON | Apps |
|---|---|---|
| `four-stats` | `items[4]` de `{title, text, subtext}` | 11 |
| `three-stats` | `items[3]` de `{icon, text, subtext}` (icône Tabler) | 1 |
| `two-stats-with-guage` | `items[2]` de `{title, text, subtext, progress 0–1}` | 0 |
| `text-with-progress` | `{title, text, subtext, progressLabel, progress}` | 4 |
| `text-with-buttons` | `{title, text, subtext, buttons[{text, icon, link}]}` | 2 |
| `list` | `{items[{text, subtext}], noItemsText}` | 2 |
| `list-emoji` | `{count, items[{emoji, text}]}` | 1 |

Champs communs : `link` (relatif à l'origine de l'app) et `refresh` (`"5s"`, `"1m"`, converti en ms par umbreld). Umbrel a aussi ses widgets système (CPU, mémoire, stockage, température) et fichiers.

### Le catalogue en chiffres (umbrel-apps, 12.10.2026)

- **397 dossiers, 393 manifestes, 25 désactivées → 368 apps actives** (apps.umbrel.com en liste aussi 368).
- **Catégories** (sur les 393) : files 106 · bitcoin 88 · networking 47 · media 30 · developer 29 · social 26 · ai 23 · automation 20 · finance 17 · crypto 7.
- Compose : 2 services en médiane, 14 au plus ; `app_proxy` dans 378 ; auth Umbrel coupée dans 101.
- **Accès à l'hôte** : `privileged` 15, `network_mode: host` 23, `/dev` monté 8, **socket Docker monté 7** (portainer, dockge, komodo, arcane, onedev, openhands, sv2-ui), alors que leur guide de packaging l'interdit pour les nouvelles apps.
- 32 apps utilisent au moins une image construite par Umbrel (`ghcr.io/getumbrel/*`), surtout le conteneur Tor (16).
- **« Simples »** (ni dépendance, ni `exports.sh`, ni hook, ni template, ni accès hôte, avec `app_proxy`) : **186 sur 368**. C'est la moitié qu'un adaptateur sans les spécificités Umbrel peut lancer telle quelle.

---

## 3. L'app store et apps.umbrel.com (sources de données)

### Comment umbrelOS consomme un store

Lu dans `modules/apps/app-repository.ts` et `app-store.ts` :

1. Un store = **une URL git**. umbreld en garde une liste (`appRepositories`), la première est l'officielle `getumbrel/umbrel-apps`.
2. Clone `depth 1`, branche unique (isomorphic-git) dans `app-stores/<user>-<repo>-<hôte>-<hash8>`, de façon **atomique** (dossier temporaire puis déplacement), `chown 1000:1000`, suppression des `.gitkeep`. Mise à jour = comparer le commit local au `HEAD` distant, et recloner s'il a changé, à intervalle régulier.
3. Lecture du registre : `*/umbrel-app.yml` → validation zod → retrait des `disabled` → **pour un store communautaire, seuls les ids qui commencent par l'id du store sont gardés** → icône et galerie complétées → tri.
4. Doublons d'id entre stores : le premier store dans l'ordre gagne.
5. Icônes et galerie du store officiel : `https://getumbrel.github.io/umbrel-apps-gallery/<id>/icon.svg` et `…/<id>/1.jpg` (dépôt `umbrel-apps-gallery`, ~250 Mo, GitHub Pages, servi en `image/svg+xml`).

### Un store communautaire

Dépôt modèle `getumbrel/umbrel-community-app-store` :

```yaml
# umbrel-app-store.yml
id: "sparkles"      # préfixe obligatoire de chaque app : sparkles-hello-world
name: "Sparkles"    # affiché « Sparkles App Store »
```

plus un dossier par app (`sparkles-hello-world/umbrel-app.yml` + `docker-compose.yml`), avec `icon:` et `gallery:` en **URLs**. L'utilisateur colle l'URL git dans l'UI (App Store → ⋯ → Community App Stores). N'importe quel serveur git en HTTPS fait l'affaire, gitea compris.

### apps.umbrel.com

Site Next.js : pages `/app/<id>` (368), `/category/<id>` (11 : all, files, bitcoin, crypto, finance, media, networking, social, automation, ai, developer), `/search`, `sitemap.xml`, `robots.txt` (tout permis). Pas d'endpoint qui donne le catalogue complet (`/api/apps` → 404). Ce qui existe, trouvé dans le code de l'UI (`APP_STORE_REMOTE_API_BASE`) :

| URL | Contenu | En-têtes |
|---|---|---|
| `GET https://apps.umbrel.com/api/v3/umbrelos/app-store/storefront` | `{data:{schemaVersion:1, sections[], categories[], apps[]}}` : sections éditoriales (`spotlight` avec bannières webp, `app-list` en rail ou en grille, « Serving hot now », « Most installs », « Fresh from the oven », `category-feature`…), `categories[{id, featuredAppIds}]`, `apps[{id, version, createdAt, updatedAt}]` (368) | `access-control-allow-origin: *`, `cache-control: public, max-age=300` |
| `GET …/app-store/apps/<id>` | `{data:{id, version, releases[{version, date, notes}]}}` | CORS `*` |
| `GET /api/app/<id>/badge-dark.svg` / `badge-light.svg` | badge « Get it on umbrelOS » | |
| `GET /api/og-image/app/<id>` | image de partage 1200×630 | |

À noter : leur UI traite ce flux comme une **décoration optionnelle** (3 s de délai max, pas de retry, pas de cookies, en cas d'erreur la vitrine locale s'affiche seule, et un id est ignoré s'il n'existe pas dans le registre local). Les noms, descriptions et ports ne sont **que** dans le dépôt git.

**Pour nous**, la bonne source est donc :

| Besoin | Source | Remarque |
|---|---|---|
| catalogue complet (manifestes + compose) | dépôt git `getumbrel/umbrel-apps` (archive ~12 Mo décompressée) | côté boxion seulement : trop lourd pour le téléphone, et l'API GitHub non authentifiée est limitée à 60 req/h |
| icônes, captures | `getumbrel.github.io/umbrel-apps-gallery/<id>/…` | SVG de quelques Ko, à mettre en cache |
| vitrine (« en vogue », « plus installées », nouveautés) | `/api/v3/umbrelos/app-store/storefront` | appelable depuis le téléphone (CORS `*`), optionnel |
| historique des versions | `/api/v3/umbrelos/app-store/apps/<id>` | optionnel |

---

## 4. Licence et ce qu'elle permet

| Dépôt / contenu | Licence | En clair |
|---|---|---|
| `getumbrel/umbrel` (OS, umbreld, UI, clients Apple) | **PolyForm Noncommercial 1.0.0** | utiliser, modifier, forker et redistribuer **pour un usage non commercial** (perso, hobby, recherche, associations, écoles, administrations). **Interdit** : vendre Umbrel ou un dérivé, en cloud hébergé, préinstallé sur du matériel, ou en support payant (FAQ officielle). Une demande commerciale passe par leur adresse partenaires. Il faut transmettre le texte de la licence et les lignes `Required Notice:`. |
| `getumbrel/umbrel-apps` (manifestes, compose, guides `.agents/skills`, linter) | **aucune licence** (pas de fichier LICENSE, GitHub : `null`) | par défaut, tous droits réservés. Les faits (id, port, nom d'image) ne sont guère protégeables ; les **textes** (descriptions, taglines, notes de version) et le **code** (hooks, linter, guides) le sont. Lire pour interopérer : défendable. Republier un miroir sous notre nom : non. |
| `getumbrel/umbrel-apps-gallery` (icônes, captures) | **aucune licence** | des logos et captures de **projets tiers** (souvent des marques déposées), rassemblés par Umbrel. On peut faire un lien direct ou un cache local chez l'utilisateur ; pas de republication. |
| `umbrel-community-app-store` (modèle) | aucune licence | c'est un format de 2 champs ; écrire le nôtre ne pose pas de problème |
| images Docker des apps | celle de chaque projet amont (AGPL, MIT, Apache, propriétaire parfois) | **c'est le seul vrai code qu'on fait tourner** : sa licence est celle de l'amont, pas d'Umbrel. Les 32 apps qui tirent `ghcr.io/getumbrel/*` (Tor, configurateurs) : licence à vérifier image par image, sans doute Umbrel. |
| Conditions du site (umbrel.com/legal/tos) | — | interdit, entre autres, « de faire de l'ingénierie inverse ou d'analyser nos produits dans le but de créer un produit similaire, en particulier par des concurrents ». Les conditions d'umbrelOS interdisent aussi la décompilation, ce qui est étrange pour un code publié, mais c'est écrit. |
| Pour comparer | CasaOS + son AppStore : **Apache-2.0** · Runtipi + appstore : **GPL-3.0** · YunoHost : AGPL-3.0, apps GPL-3.0 | des catalogues docker-compose comparables, sous **vraies licences libres** |

**Ce qui compte pour xerboxion** : l'objectif posé est de **vendre des boxions** et d'ouvrir tout le code. Toute idée qui embarquerait du code Umbrel (umbreld, l'UI, le script d'app, le linter, leurs guides) dans un boxion vendu est **exclue** par la PolyForm NC. Ce qui reste propre : un **adaptateur écrit par nous**, qui lit un format de fichier (interopérabilité), lance les images amont sous leurs propres licences, et parle à l'API d'un umbrelOS **appartenant à l'utilisateur**. Avant de mettre la piste (a) dans un boxion vendu, il faut une réponse écrite d'Umbrel.

| Idée | Statut licence |
|---|---|
| (a) lire le catalogue, lancer les compose sur le boxion | 🟡 adaptateur à nous = OK ; **la source « Umbrel » doit être ajoutée par l'utilisateur** (comme un store communautaire), pas livrée remplie ni republiée sur xerboxion.org ; dans un boxion vendu : demander |
| (b) le xer comme app communautaire Umbrel | 🟢 notre code, notre manifeste ; l'utilisateur fait tourner umbrelOS chez lui. 🔴 vendre une boîte umbrelOS + xer : non sans accord commercial |
| (c) piloter un umbrelOS depuis ploxi0n | 🟢 un client à nous qui parle à la boîte de l'utilisateur (MCP = interface prévue pour les tiers) ; 🟡 l'API tRPC interne relève de la clause « analyser pour créer un produit similaire » |
| (d) widgets | 🟢 réimplémenter un format JSON = interopérabilité ; 🔴 copier leurs composants React : non |

---

## 5. Comment xerboxion peut s'en servir

Règle maison : **on implémente tout**, chaque piste est un **adaptateur** interchangeable à côté des autres, jamais un choix exclusif. Et **on fusionne les similaires** : la digestion de YunoHost a déjà prévu un `yh-app-manager`. Il faut donc **un seul** gestionnaire d'apps Docker côté boxion, avec des adaptateurs de source (`umbrel`, `casaos`, `runtipi`, `yunohost`, `xerboxion`), et pas un ploxion par écosystème.

### a) Le catalogue Umbrel comme source du marketplace de ploxi0n

**Quoi.** Dans le marketplace (vitrine, grille, A–Z, découvrir), une deuxième famille d'entrées : les **services** (apps docker qui tournent sur le boxion), à côté des ploxions (JS qui tournent hors ligne sur le téléphone). « Installer » un service = le lancer sur le boxion et ajouter un **ploxion-lien** qui ouvre son interface web.

**Comment.**

1. **Indexeur côté boxion** (labo ou xerboxion-rt, pas le téléphone) : `git clone --depth 1` de chaque source configurée, refait seulement quand le `HEAD` distant change (même logique qu'umbreld). Il lit `*/umbrel-app.yml` et produit `/px/sources/umbrel.json` dans la forme que `depot.catalogue()` attend déjà :
   `{id: "umbrel:<id>", nom, icone: <url icon.svg>, description (tronquée), categorie, galerie[], version, port, path, sorte: "service", source: "umbrel", compat: {simple, deps, exports, hooks, hote, gpu}, fournit: implements}`.
   Le score `compat` est calculé à l'indexation (les 186 « simples » d'abord). La vitrine `storefront` (CORS `*`) peut décorer les sections, avec la même politique qu'eux : 3 s max, et un échec ne casse rien.
2. **Côté ploxi0n** : un `src/marketplace/sources/umbrel.js` à côté de `depot.js` ; `creerDepot` accepte une **liste de sources** (`xerboxion.org`, `umbrel`, plus tard `casaos`…), chacune en cache dans `boxion_local` (`marketplace/catalogue:<source>`), donc consultable en mode avion. Icônes SVG mises en cache dans `boxion_local` (quelques Ko chacune) ; captures chargées à la demande. Badge sur la fiche : « service · tourne sur ton boxion » contre « ploxion · hors ligne ».
3. **Installeur côté boxion** (adaptateur `umbrel-compose`, écrit à partir du format, pas de leur script) :
   - copier le dossier de l'app dans `/opt/xerboxion/apps/<id>/` et créer `data/` ;
   - calculer les variables : `APP_DATA_DIR`, `APP_ID`, `APP_PROXY_PORT`, `DEVICE_DOMAIN_NAME`, `NETWORK_IP`, et `APP_SEED`/`APP_PASSWORD` par HMAC d'une **graine du boxion** (même idée que `derive_entropy`, implémentée chez nous) ;
   - réécrire le compose : `container_name` injectés, réseau externe `xer_apps`, **suppression du service `app_proxy`** remplacé par une route de notre ingress (`<id>.<boxion>` ou un port) vers `APP_HOST:APP_PORT`, avec **l'auth du xer** (jeton Sanctum) devant, et `PROXY_AUTH_WHITELIST` respecté ;
   - garde-fous (voir risques), puis `docker compose -p umbrel-<id> up -d` ;
   - enregistrer un ploxion-lien `umbrel:<id>` dans `jOSApps` : `mount()` ouvre l'URL dans une iframe, ou dans le navigateur intégré (SFSafariViewController via Capacitor Browser) quand l'app refuse d'être encadrée (`X-Frame-Options`, très courant).
   - v1 : `exports.sh` des dépendances (écosystème Bitcoin), templates, hooks **dans un conteneur jetable** plutôt que sur l'hôte.

**Effort.** Indexeur + source ploxi0n : 2 à 3 jours. Installeur v0 limité aux « simples » avec garde-fous : 4 à 6 jours. Parité (dépendances, `implements`, hooks, Tor, widgets) : plusieurs semaines, et à ne faire que si l'usage le demande.

**Risques.**

- **Sécurité, le plus gros.** Un compose tiers revient à donner root sur l'hôte : `privileged`, `/dev`, `network_mode: host`, socket Docker (7 apps du store officiel en montent un). Les hooks et `exports.sh` sont du bash exécuté **sur l'hôte**. Garde-fous v0 : refuser `privileged`, `cap_add`, `devices`, `/dev`, `docker.sock`, `network_mode: host`, `pid: host`, les montages hors `${APP_DATA_DIR}` ; ne **jamais** exécuter hooks ni `exports.sh` sur l'hôte ; exiger des images épinglées par digest (c'est déjà la règle chez eux) ; un réseau Docker par app, pas de port publié brut sans accord ; `mem_limit`/`cpus` par app ; confirmation explicite avec la liste de ce que l'app demande. Les stores communautaires (n'importe quelle URL git) : liste blanche.
- **Ressources.** Le VPS du labo a déjà crashé sur des OOM containerd : pas de Nextcloud, d'Immich ou de nœud Bitcoin dessus, une app lourde à la fois, des limites mémoire partout, et un test à part pour le Pi 4 (directive « tourner partout »).
- **Isolation du xer.** Le réseau `xer_apps` ne doit pas voir les services internes du labo (boxion-kv, bus xion sur `10.0.0.1:8730`).
- **Licence.** 🟡, voir §4 : source ajoutée par l'utilisateur, pas de miroir public, attribution « via l'Umbrel App Store » avec lien vers apps.umbrel.com.
- **Dérive du format.** `manifestVersion` 2.0 arrive : refuser proprement ce qu'on ne sait pas lire.

### b) Faire tourner le xer sur une boîte Umbrel

**Quoi.** Un **store communautaire xerboxion** que n'importe quel possesseur d'Umbrel ajoute par URL : il installe le xer (et plus tard le boxion Rust) en un clic, et ploxi0n s'y connecte.

**Comment.**

```
xerboxion-umbrel-store/            (git.j0bot.ch + miroir GitHub)
  umbrel-app-store.yml             id: xerboxion · name: Xerboxion
  xerboxion-xer/
    umbrel-app.yml                 manifestVersion 1.1, port 7373 (libre dans le store officiel au 12.10),
                                   icon + gallery en URLs, storage.dataRoot: data, widgets
    docker-compose.yml             app_proxy → xerboxion-xer_web_1:8080 ; web (image xer) ; db (MariaDB/MySQL) ; queue/cron si besoin
    exports.sh                     APP_KEY, mot de passe DB, secrets via derive_entropy "${app_entropy_identifier}-…"
    data/{db,storage}/.gitkeep
  xerboxion-boxion/                plus tard : xerboxion-rt
```

- **Le vrai travail, c'est l'image** : aujourd'hui le xer tourne avec Sail (`build:`, interdit chez eux). Il faut une image de prod `ghcr.io/<org>/xer:<version>@sha256` **amd64 + arm64**, construite par GitHub Actions avec buildx (**jamais** de `docker build` sur le VPS), qui joue les migrations au démarrage, tourne en `1000:1000` et met ses données sous `/data`.
- `APP_URL` = `http://${DEVICE_DOMAIN_NAME}:${APP_PROXY_PORT}` ; `TRUSTED_PROXIES=${NETWORK_IP}/16`.
- Auth : garder la connexion Umbrel devant le xer, `PROXY_AUTH_WHITELIST: "/api/*,/px/*"` pour que ploxi0n (jetons) et le marketplace passent ; le xer garde ses propres jetons sur ces chemins.
- Un widget Umbrel servi par le xer (`/api/umbrel/widget`, `four-stats` : ploxions, tsoins du jour, xers, dernière sync), un QR de jumelage ploxi0n sur la page d'accueil.
- Test : umbrelOS 2.0 en VM amd64 (**ailleurs** que sur le VPS), `rsync` du dossier dans `app-stores/…` comme le décrit leur guide de test, puis `umbreld client apps.install.mutate`.

**Effort.** Image de prod multi-arch : 3 à 5 jours (c'est utile de toute façon, pour les boxions à vendre). Dépôt du store + manifestes : 1 jour. Tests en VM : 1 à 2 jours. Soumission au store **officiel** possible ensuite (revue par l'équipe Umbrel, et leur règle « on doit comprendre l'app depuis le navigateur, sans SSH »).

**Risques.** Licence : 🟢 pour publier le store ; 🔴 pour **vendre** une boîte qui embarque umbrelOS + xer sans accord. Technique : MySQL sur Pi (mémoire), migrations à chaque mise à jour, l'app_proxy n'existe plus en 2.0 (ne jamais le référencer depuis un autre service), port à garder unique, préfixe d'id obligatoire (`xerboxion-…`).

### c) Piloter un umbrelOS existant depuis ploxi0n

**Quoi.** « Mon boxion, c'est un Umbrel » : ploxi0n liste ses apps, les ouvre, les démarre ou les arrête, affiche ses widgets, et à terme installe depuis son store.

**Comment, deux adaptateurs interchangeables :**

| | **MCP** (préféré) | **tRPC natif** |
|---|---|---|
| Entrée | `https://umbrel.local/mcp` (ou IP, ou Tailscale) | `https://umbrel.local/trpc/<procédure>` |
| Auth | l'utilisateur crée un **jeton nommé, révocable, avec permissions** dans Réglages → AI agents et le colle (ou le scanne en QR) dans ploxi0n | `user.loginNative` (mot de passe + TOTP, `client:{id:"ploxi0n", platform:"ios", deviceClass:"phone", …}`) → `accessToken` 1 h + `deviceToken` ; `refreshNativeAccess` pour renouveler |
| Ce qu'on obtient | outils MCP : apps installées, état, détails, logs, recherche et install depuis le store, réglages | `apps.list` (avec `icon`, `port`, `path`, `state`, `widgets`, `hiddenService`), `apps.start/stop/restart`, `widget.data`, `appStore.registry` |
| Stabilité | interface prévue pour des tiers | API interne, peut casser à chaque version : vérifier `system.version` |
| Licence / conditions | 🟢 | 🟡 (clause « analyser pour créer un produit similaire ») |

- Côté ploxi0n : un adaptateur `src/boxion-distant/umbrel.js` derrière la même interface que le mode connecté xerboxion.org, avec jetons au **Trousseau** et Face ID (jOSVerrou). Chaque app installée devient un ploxion-lien (icône = `icon` de `apps.list`, URL = `https://<hôte>:<port><path>`).
- **Ouvrir une app** demande le cookie de la passerelle d'apps (posé par `user.login`, côté navigateur) : il faut une connexion dans la webview intégrée (une fois, puis cookie de 7 jours), ou que l'app ait coupé l'auth Umbrel.
- **Réseau iOS** : `umbrel.local` (mDNS) demande `NSLocalNetworkUsageDescription` + `NSBonjourServices` ; le HTTPS 2.0 est signé par **leur CA locale**. Il faut la récupérer (`/lan-ingress/umbrel-local-ca.crt`) et l'épingler dans ploxi0n, en natif (délégué `URLSession`, petit plugin Capacitor), comme le fait leur app. Ou passer par Tailscale en HTTP.

**Effort.** Client MCP en JS (JSON-RPC sur HTTP) + liste des apps : 1 à 2 jours. Plugin d'épinglage de CA + découverte Bonjour : 2 à 3 jours. tRPC natif en second : 1 à 2 jours.

**Risques.** Un jeton MCP avec le droit d'installer = contrôle de la boîte : commencer en **lecture seule**, et confirmer chaque action d'écriture avec Face ID. Ne jamais stocker le mot de passe Umbrel (seulement le `deviceToken`). La CA locale ne doit être de confiance que **pour cet hôte**.

### d) Widgets : Umbrel ↔ ploxi0n (HUD et WidgetKit)

**Quoi.** Un seul contrat de widget (on peut l'appeler `jOSWidget`) **qui reprend les 7 types Umbrel tels quels**, avec deux sens de branchement et trois rendus.

| Type Umbrel | HUD ploxi0n | WidgetKit (iOS) |
|---|---|---|
| `four-stats` | grille 2×2 | `systemMedium` |
| `three-stats` | rangée de 3 avec icônes | `systemSmall` / `systemMedium` |
| `two-stats-with-guage` | 2 jauges | `accessoryCircular` ×2 (écran verrouillé) |
| `text-with-progress` | texte + barre | `accessoryRectangular`, ou Live Activity si c'est long (sync, téléchargement) |
| `text-with-buttons` | texte + boutons | widget **interactif** iOS 17 (App Intents) ; le `link` ouvre `ploxi0n://px/<id>` |
| `list` / `list-emoji` | liste | `systemLarge` |

- **Umbrel → ploxi0n** : par (c), `widget.data` sur la boîte de l'utilisateur ; par (a), le boxion appelle lui-même l'endpoint `service:port/chemin` sur le réseau Docker (comme umbreld) et le relaie en JSON authentifié. Le HUD affiche en direct ; WidgetKit reçoit un **instantané** par l'App Group `group.ch.j0bot.ploxi0n` (iOS ne rafraîchit pas toutes les 2 s, plutôt toutes les 15 min environ : `refresh` sert seulement dans l'app).
- **ploxi0n/xer → Umbrel** : un ploxion ou un bion publie ses widgets dans ce même format, et le xer packagé (b) les déclare dans son `umbrel-app.yml`, donc ils s'affichent aussi sur l'accueil Umbrel. Un format, trois rendus (HUD, WidgetKit, Umbrel).
- `refresh` : chaîne (`"5s"`) → ms ; `link` relatif à l'origine de l'app.

**Effort.** Rendus HUD des 7 types : 1 à 2 jours. Extension WidgetKit (Swift, l'App Group est déjà prévu) : 2 à 3 jours. Relais boxion : 1 jour.

**Risques.** Licence 🟢 tant qu'on réécrit les rendus (pas de copie de leurs composants React) ; un endpoint de widget n'a pas d'auth chez eux (appelé en interne) : notre relais doit, lui, être derrière le jeton du xer.

---

## 6. Ce qu'on peut leur prendre comme idées

Des idées, pas du code (il est en PolyForm NC) :

1. **Store = dépôt git**, plusieurs sources, clone atomique `depth 1`, mise à jour au changement de `HEAD`, **ids préfixés par l'id du store**, le premier store gagne en cas de doublon. Ça colle au Nexus = RepoVerse : un marketplace xerboxion = des dépôts sur git.j0bot.ch, et le registre `/px/registry.json` devient un index parmi d'autres.
2. **`dependencies` + `implements` + contrat d'`exports`** : « cette app peut remplacer celle-là si elle exporte les mêmes variables ». C'est notre `fournit` du catalogue, en plus strict : un bion qui *implémente* un autre bion.
3. **Secrets déterministes** (`derive_entropy` : HMAC de la graine de l'appareil et d'une étiquette) : pas de fichiers de secrets, des valeurs stables, et un mot de passe d'app affichable. À reprendre pour `jOSBoxion` et les boxions à vendre.
4. **Images épinglées par digest, multi-arch obligatoire, et un linter** qui le vérifie (`npm run lint:apps -- <id> --check-images`). Pour nous : un linter de ploxions dans la forge, et la règle « tourne sur Pi » vérifiée par la machine.
5. **Le « standard de l'App Store »** : chaque app s'ouvre sur une page utile depuis le navigateur, sans SSH ni logs. Pour nous : chaque ploxion s'ouvre sur quelque chose d'utile, même hors ligne.
6. **La vitrine éditoriale séparée du catalogue** (flux optionnel, 3 s max, ne dégrade jamais le local, ne fait que décorer des ids qui existent). C'est exactement ce qu'il faut pour la vitrine de xerboxion.org dans ploxi0n.
7. **Sessions natives** : `accessToken` court (1 h) + `deviceToken` stable qui sert seulement au renouvellement, et un descripteur de client (`id, platform, deviceClass, versions`) visible dans la liste des sessions. Plus propre que nos jetons Sanctum de N jours.
8. **Un serveur MCP sur la boîte**, avec jetons nommés, permissions et liste des agents connectés. À mettre dans xerboxion-rt : c'est l'« agent sur le boxion » du brief ploxi0n.
9. **La passerelle d'auth par app** (session de la boîte devant chaque app, chemins ouverts et chemins refermés, partage d'une app avec un membre). C'est le modèle pour exposer des services tiers derrière le SSO du xer.
10. **Des widgets en JSON servi par l'app, en 7 types**, avec un `example` pour le sélecteur. Simple, et suffisant pour la plupart des besoins.
11. `backupIgnore`, `storage.dataRoot` (données déplaçables), `folderAccess` (l'utilisateur pointe un dossier, en lecture seule si possible) : des petits champs qui règlent de vrais problèmes de boxion.
12. **Des guides pour agents dans le dépôt** (`AGENTS.md` + `.agents/skills/{package,update,test,develop}-app`) : contribuer = « envoie ton agent lire AGENTS.md ». Même logique que notre doc dev et le tsoin = commit.
13. **Des badges** « Get it on … » par app. À faire pour « Disponible sur xerboxion ».
14. **Leur app iOS** fait déjà le jumelage avec épinglage de la CA locale, Tailscale et la sauvegarde photo en arrière-plan avec un droit limité à une source. C'est la référence à battre pour ploxi0n, et une bonne liste d'idées pour le jumelage boxion ↔ iPhone.

---

## 7. Prochaines étapes concrètes

Par ordre, chacune livrable seule :

1. **Licence d'abord** (une décision, pas du code) : valider qu'on part sur des adaptateurs clean-room (aucun fichier copié d'Umbrel), la source Umbrel « ajoutée par l'utilisateur », et, si (a) doit entrer dans un boxion **vendu**, écrire à leur adresse partenaires. Pendant ce temps, brancher **CasaOS (Apache-2.0)** et **Runtipi (GPL-3.0)** avec le même adaptateur : légalement plus simple.
2. **Indexeur** côté labo : `tools/index-apps-docker.mjs` (sources : umbrel, casaos, runtipi) → `/px/sources/<source>.json` + calcul de `compat` ; cron, clone `depth 1`, recloné seulement si le `HEAD` a changé.
3. **ploxi0n** : `depot.js` accepte plusieurs sources ; `src/marketplace/sources/umbrel.js` ; cache `boxion_local` + icônes ; badge « service ». Tests avec des registres factices (comme les 25 tests actuels).
4. **Installeur v0** sur le boxion : seulement les 186 « simples », liste de refus (privileged, host, `/dev`, socket Docker, montages hors données), limites mémoire, réseau `xer_apps` isolé, route ingress + auth xer, ploxion-lien. Premier test : uptime-kuma.
5. **VM umbrelOS 2.0** (amd64, hors VPS) pour les tests de (b), (c) et (d).
6. **Spike MCP** depuis ploxi0n vers cette VM : jeton en lecture seule, `apps.list` → ploxions-liens.
7. **Image de prod du xer** multi-arch en CI (utile aussi pour les boxions à vendre), puis le dépôt `xerboxion-umbrel-store`.
8. **Contrat `jOSWidget`** = les 7 types Umbrel ; rendus HUD, puis extension WidgetKit ; un widget du xer déclaré dans son manifeste Umbrel.
