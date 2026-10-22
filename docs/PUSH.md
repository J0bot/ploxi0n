# Les notifications push (APNs) : la clé sur le labo (0.91)

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
