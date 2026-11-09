# Le labo connecté tout seul dans l'app (0.83)

RS-7, 19.10, avec une capture du mode xerboxion (l'UI du labo s'affiche dans l'app, mais déconnectée : « j'ai un code ») :
« faut aussi que le labo puisse se connecter automatiquement, plus simple ».

## Pourquoi c'est déconnecté

L'app a déjà ton compte du labo : un jeton (docs/dev/57 du labo), envoyé en `Authorization: Bearer` par le HTTP natif.
Une page du labo dans un **cadre** de l'app, elle, ne voit que des cookies. iOS bloque dans un cadre les cookies d'un autre site
(`capacitor://localhost` ≠ `labo.j0bot.ch`). Seuls passent les cookies **partitionnés** (CHIPS : `Partitioned`), propres à ce cadre
dans cette app. Le support de WebKit est complet depuis Safari 26.2 ; WebKit l'avait livré en 18.4 puis retiré en 18.5.

## Ce que fait l'app (fait, 0.83 : `src/natif/connexion-labo.js`)

1. Avant d'ouvrir une page du labo (le cadre du mode xerboxion, le cadre d'un ploxion vers une page du labo, le navigateur intégré),
   l'app demande un **passe** : `POST https://labo.j0bot.ch/api/app/passe` avec `Authorization: Bearer <jeton>` et le corps `{ "vers": "/home?app=ploxi0n" }`.
2. Elle ouvre `https://labo.j0bot.ch/app/entrer?passe=<passe>&vers=<chemin encodé>`.
3. Le jeton n'est **jamais** dans une adresse.

Si l'app n'a pas de compte, est hors ligne, ou si le labo répond 404 ou 405, elle ouvre l'adresse simple, comme avant. Après un 404, elle ne
redemande plus avant le prochain lancement.

## Ce que le labo doit faire (à faire par la session du labo)

### `POST /api/app/passe`

- **Authentification** : le jeton de l'app (le même garde que `/api/app/moi`). Sans jeton valide, répondre 401.
- **Réponse 200** : `{ "passe": "<au moins 32 caractères base64url>", "expire": "<ISO 8601>" }`.
- **Le passe** :
  - il vit 60 s et ne sert qu'une fois ;
  - le labo n'en garde que le **haché** (cache), lié à l'utilisateur ;
  - limiter le débit, par exemple 30 par minute et par jeton.
- `vers` est informatif : ne pas s'y fier, il est revérifié à l'entrée.

### `GET /app/entrer?passe=…&vers=…`

- **Le passe** : le consommer de façon atomique (le lire et le supprimer).
  - Invalide ou expiré : ne connecter personne, rediriger vers `vers`, qui propose alors de se connecter.
- **La connexion** : `Auth::login($user)` puis `session()->regenerate()`.
- **`vers`** : seulement un chemin du labo.
  - Il doit commencer par `/` et pas par `//`, sans schéma.
  - Sinon : `/home`. Pas de redirection ouverte.
- **La réponse** : `Referrer-Policy: no-referrer` et `Cache-Control: no-store`.
- **Les cookies dans un cadre** (la clé) :
  - Quand la requête vient d'un cadre (`Sec-Fetch-Dest: iframe`), poser la session et le XSRF avec `SameSite=None; Secure; Partitioned`.
  - Faire de même pour **toutes** les réponses suivantes dans ce cadre, sinon le cookie de session réémis sans `Partitioned` est ignoré.
  - Avec Laravel 11 ou plus : un middleware, avant `StartSession`, qui fait `config(['session.same_site' => 'none', 'session.partitioned' => true])`
    quand `Sec-Fetch-Dest` vaut `iframe`. Le site normal garde `Lax`, non partitionné.
- **Le navigateur intégré** (SFSafariViewController) : il est le premier site, les cookies normaux suffisent.

## Les limites connues

- **Avant iOS 26.2** : les cookies partitionnés peuvent ne pas tenir. Le cadre reste alors déconnecté ; le navigateur intégré, lui, se connecte toujours.
- **Une autre app iOS** peut encadrer le labo (la CSP l'autorise pour `capacitor://localhost`), mais elle n'a ni ton jeton ni de passe.
