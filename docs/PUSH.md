# Les notifications push (APNs) : la clé sur le labo (0.91)

## Ce soir, le plus vite (0.99.28, RS-7 01.11)

L'app est prête depuis la 0.91 (la permission, le jeton relayé par l'AppDelegate, les sujets, toucher = ouvrir le ploxion). Il manquait la
route du labo (`/api/app/push` : 404) ; et, sans elle, l'app perdait le jeton (corrigé en 0.99.28 : gardé, et copiable).

1. **La clé** (5 min) : ci-dessous, « 1. La clé ».
2. **Un premier envoi sans le labo** (build 0.99.28) : ⚙ › Notifications › « Même app fermée » allumé → « copier » le jeton → sur ton ordinateur
   `node tools/push/envoyer-push.mjs --cle AuthKey_XXXX.p8 --kid XXXX --team YYYY --jeton <collé>` → la notification arrive.
3. **Le labo** : `docs/labo-push/` (le code prêt à coller, les routes, `php artisan push:test`). Avec lui, même le build déjà installé
   envoie son jeton (rallumer l'interrupteur, ou relancer l'app).


RS-7, 22.10 : « la clé APNs sur le labo ». C'est l'option (a) de la feuille de route : la clé `.p8` d'APNs vit sur le serveur du labo,
isolée et révocable. Elle ne sert qu'à envoyer des notifications, pas à publier l'app.

## Ce que fait l'app (fait, 0.91 : `src/natif/push.js`)

- **Activation** : dans ⚙ › Notifications › « Même app fermée (push) », il faut un compte connecté.
  1. L'app demande la permission d'iOS.
  2. Elle s'enregistre auprès d'APNs (`@capacitor/push-notifications` ; l'AppDelegate relaie le jeton).
  3. Elle envoie le jeton au labo.
- **Les sujets** : `coord`, `messages`, `bother`, `ploxions`. On les choisit dans le même écran ; chaque changement renvoie le jeton avec la
  nouvelle liste.
- **Toucher une notification** ouvre le ploxion indiqué par `data.ouvrir`, avec `data.params` si présent.
- **App ouverte** : iOS n'affiche rien. L'app signale la notification en bas de l'écran et vibre.
- **Couper** : l'app envoie `DELETE` au labo, puis se désinscrit d'APNs.
- **Au lancement** : si le push est allumé, le jeton est redemandé, car iOS peut le changer.

L'entitlement `aps-environment: production` et la capability Push Notifications sont déjà sur l'identifiant de l'app : il n'y a rien à
cocher en plus dans le portail.

## Ce que le labo doit faire

### 1. La clé (RS-7, une fois)

1. developer.apple.com › Certificates, IDs & Profiles › **Keys** › ＋.
2. Nom : « ploxi0n push ». Coche **Apple Push Notifications service (APNs)**. Continue, puis Register.
3. **Télécharge le `.p8`** : Apple ne le redonne jamais. Note le **Key ID** (10 caractères) et le **Team ID**.
4. Sur le serveur du labo, mets le `.p8` **hors du dépôt et hors du dossier public**, par exemple `storage/app/apns/AuthKey_XXXX.p8`, en `chmod 600`.
5. Dans le `.env` du labo :
   - `APNS_KEY_ID` ;
   - `APNS_TEAM_ID` ;
   - `APNS_KEY_PATH` ;
   - `APNS_TOPIC=ch.j0bot.ploxi0n` ;
   - `APNS_PROD=true` (les builds TestFlight et App Store parlent à APNs de production).

Jamais de clé dans git, dans une adresse ou dans l'app.

**Ou, sans fichier (le labo tourne dans Coolify)** : le conteneur est recréé à chaque déploiement, un fichier posé à la main dans
`storage/` peut disparaître. Le plus simple : coller le CONTENU du `.p8` dans une variable d'environnement de l'application Coolify
(Configuration › Environment Variables), cochée « secret » et pas « build variable » :

- `APNS_KEY_P8` = tout le texte du fichier, de `-----BEGIN PRIVATE KEY-----` à `-----END PRIVATE KEY-----` (Coolify garde les retours à la
  ligne ; sinon, une seule ligne en base64 dans `APNS_KEY_P8_B64`) ;
- `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_TOPIC`, `APNS_PROD` comme ci-dessus, sans `APNS_KEY_PATH`.

Côté code : prendre `APNS_KEY_P8` (ou décoder `APNS_KEY_P8_B64`) s'il existe, sinon lire `APNS_KEY_PATH`. Les deux passent par
`config/services.php`, jamais `env()` ailleurs (le cache de config).

**Un secret du dépôt GitHub ne suffit pas** : le labo envoie les notifications depuis le serveur, à chaque message, longtemps après le
déploiement. Un secret GitHub n'existe que pendant un workflow ; il ne servirait que si le déploiement l'écrivait lui-même dans l'env du
serveur, ce qui revient à la variable Coolify avec un intermédiaire de plus.

**Où trouver Key ID et Team ID** : le Key ID est affiché sur la page de la clé (Keys › « ploxi0n push ») et dans le nom du fichier
`AuthKey_<KEYID>.p8` ; le Team ID est en haut à droite du portail developer.apple.com, sous ton nom, et dans Membership details.

### 2. Les routes (le garde des routes de l'app : le jeton de `/api/app/moi`)

`POST /api/app/push`

- Corps : `{ "jeton": "<hex>", "plateforme": "ios", "environnement": "production", "app": "ch.j0bot.ploxi0n", "sujets": ["coord", "messages", "bother"] }`.
- Garder **une ligne par jeton** : un jeton connu change de compte s'il le faut, et ses sujets sont remplacés.
  Table proposée : `appareils_push(id, user_id, jeton UNIQUE, sujets JSON, plateforme, cree, vu)`.
- Valider : `jeton` en hexadécimal, 64 à 200 caractères ; `sujets` dans la liste connue.
- Répondre `201 { ok: true }`. Sans compte valide : `401`. Limiter le débit, par exemple 20 par minute et par compte.

`DELETE /api/app/push`

- Corps : `{ "jeton": "<hex>" }`.
- Effacer la ligne si elle appartient au compte. Répondre `200`.

### 3. Envoyer

- **La requête** : `POST https://api.push.apple.com/3/device/<jeton>`, en HTTP/2.
- **Les en-têtes** :
  - `authorization: bearer <JWT>`, un JWT ES256 signé avec la clé `.p8` :
    - en-tête `{ alg: ES256, kid: APNS_KEY_ID }` ;
    - corps `{ iss: APNS_TEAM_ID, iat: <maintenant> }` ;
    - à garder et réutiliser entre 20 et 60 minutes, Apple refuse un JWT neuf à chaque envoi ;
  - `apns-topic: ch.j0bot.ploxi0n` ;
  - `apns-push-type: alert` ;
  - `apns-priority: 10`.
- **Le corps** :
  ```json
  { "aps": { "alert": { "title": "📡 coord · #push", "body": "le message" }, "sound": "default", "thread-id": "coord" },
    "ouvrir": "coord", "params": { "topic": "push" } }
  ```
- **Les réponses d'Apple** :
  - `410 Unregistered` ou `400 BadDeviceToken` : **effacer** le jeton.
  - `403` : la clé ou le JWT est mauvais. Le journaliser, ne pas réessayer en boucle.
- **En PHP** : `edamov/pushok` (composer) fait le JWT et l'HTTP/2. Sinon, `openssl_sign` (ES256, la signature DER convertie en R||S)
  et cURL avec `CURL_HTTP_VERSION_2_0`.

### 4. Quand envoyer (les sujets)

| sujet | quand | `ouvrir` |
| --- | --- | --- |
| `coord` | un message de /coord (pas les siens) | `coord` |
| `messages` | un message direct, une mention dans le social | `social` |
| `bother` | une réponse à un bother | `bother` |
| `ploxions` | un ploxion qui signale quelque chose à ce compte | l'id du ploxion |

Seulement les appareils du compte destinataire qui ont ce sujet.

## Plus tard

- Les Live Activities mises à jour par le labo (push-to-update) : le jeton de l'activité, `apns-push-type: liveactivity`.
- Les notifications de communication (l'avatar de qui écrit) : l'entitlement est déjà là.

## Les notifications riches (0.99.45) : l'avatar, le glyphe

Comme Snapchat (demandé par xerxion1 pour RS-7). L'extension **PloxionNotifs** (une Notification Service Extension, `ios/App/PloxionNotifs`,
option de build `notifs` : Actions › iOS TestFlight › Run workflow › cocher `notifs`, ou `[notifs]` dans le message, ou la variable du dépôt
`PLOXI0N_NOTIFS=1`) reçoit chaque push qui porte `"mutable-content": 1` et l'enrichit avant qu'il s'affiche :

```json
{ "aps": { "alert": { "title": "💬 RS-3", "body": "t'es où ?" }, "thread-id": "messages", "mutable-content": 1 },
  "ouvrir": "social",
  "expediteur": { "nom": "RS-3", "avatar": "https://labo.j0bot.ch/avatars/42.png", "id": "42" },
  "groupe": "coord · #push" }
```
- **`expediteur`** (une personne) : une **notification de communication** (INSendMessageIntent + INPerson) : l'avatar en grand, l'icône
  de l'app en coin, le nom de la personne. `groupe` (facultatif) : le nom de la conversation. L'entitlement
  `com.apple.developer.usernotifications.communication` et `NSUserActivityTypes: INSendMessageIntent` sont déjà dans l'app.
- **`image`** (un ploxion) : une URL **https** vers le glyphe rendu en PNG (ou JPG, GIF) : jointe à la notification.
- Garde-fous : https seulement, 2 Mo au plus, 8 s au plus ; sinon (ou si l'extension manque de temps) la notification d'origine, jamais rien
  de perdu. `ouvrir` et `params` passent tels quels (toucher = ouvrir le ploxion).
- Côté labo : `Apns::corps` (docs/labo-push/app/Services/Apns.php) pose `mutable-content: 1` tout seul dès qu'il y a `image` ou `expediteur`.
- La première fois : fastlane crée l'identifiant `ch.j0bot.ploxi0n.notifs` (clé API) et son profil (match) ; rien à cocher dessus.
