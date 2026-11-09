# Le social avec l'identifiant Apple

RS-7 (15.10.2026), sur l'écran de connexion du ploxion « le social » : « je veux que le social marche avec Apple ID, en indépendant de
xerboxion social ».

## Ce qui est posé dans ploxi0n (0.72)

- **Où** : sur l'écran de connexion du social (ploxions `social`, `socialion`, `ultimate-social`), ploxi0n ajoute « Continuer avec Apple »
  sous « Se connecter » (`src/natif/social-apple.js`). Le social lui-même n'est pas réécrit.
- **La feuille Apple** : la même que le compte de l'app (`src/natif/compte.js`, `jetonApple`). Elle tire un nonce frais ; Apple reçoit son
  sha256, le serveur reçoit le nonce brut.
- **L'envoi** : `POST https://api.j0bot.ch/api/v1/auth/apple`.
- **La session** : la réponse est posée là où le social la lit (localStorage `jos_social_token` et `jos_social_user`). Le social est ensuite
  remonté et s'ouvre connecté.
- **Indépendant du xerboxion** : c'est un compte j0bot (celui du social), né de l'Apple ID ou retrouvé par lui. Le compte du labo
  (`labo.j0bot.ch/api/app/apple`, ⚙ › Compte) n'entre pas en jeu.

## ✅ 0.84 (22.10) : la route est déployée, sur invitation

api.j0bot.ch (J0bot/api-j0bot) : un Apple ID lié → `200 { user, token }` ; nouveau avec `code` (une invitation du social) → `201`, compte
pseudonyme ami de l'inviteur ; nouveau sans `code` → `403 { message, invitation_requise: true }`. L'app garde le code d'un lien d'invitation
qui l'a ouverte, sinon propose de le coller, ou de lier l'Apple ID à un compte existant (`/auth/apple/lier` après `/auth/login`).
⚙ › Compte supprime le compte du social (`DELETE /me`). Ci-dessous, le contrat d'origine (15.10).

## Le contrat d'origine (15.10)

La route, côté serveur :

**Requête** : `POST /api/v1/auth/apple`, JSON.

| champ | sens |
| --- | --- |
| `identity_token` | le JWT d'identité d'Apple |
| `nonce` | le nonce brut ; le JWT porte son sha256 (hex) |
| `nom` | le prénom et le nom, seulement à la première autorisation (Apple ne les redonne jamais) |
| `client` | `ch.j0bot.ploxi0n` |

**Vérifications** :

1. La signature RS256, avec les clés publiques d'Apple (`https://appleid.apple.com/auth/keys`, à mettre en cache, choisies par `kid`).
2. `iss` = `https://appleid.apple.com`, `aud` = `ch.j0bot.ploxi0n`, `exp` dans le futur.
3. `nonce` du JWT = sha256(nonce brut) en hexadécimal. C'est ce qui lie le jeton à CETTE demande (pas de rejeu).

**Le compte** :

- Retrouvé par `sub` (l'identifiant stable d'Apple pour cette app), dans une colonne `apple_sub` unique.
- Sinon créé : un pseudo libre dérivé de `nom` (ou « bion-xxxx »). L'email est facultatif et peut être un relais privé d'Apple.
- Aucun mot de passe n'est créé. Le compte peut en ajouter un plus tard.

**Réponse** : exactement celle de `/auth/login`, pour que le social n'ait rien à changer : `200 { token, user }`.
Les erreurs : `422` pour un jeton invalide, `409` si l'Apple ID est déjà lié à un autre compte, avec un `message` lisible.

Le labo a déjà la même vérification pour son propre compte (`/api/app/apple`, docs/dev/57 du labo) : elle peut être reprise telle quelle.

## Ensuite

- Lier un Apple ID à un compte j0bot existant (`POST /api/v1/auth/apple/lier`, avec le `Bearer` du compte), comme `/api/app/apple/lier`.
- La suppression du compte depuis l'app (exigée par Apple pour tout compte créé dans l'app) : `DELETE /api/v1/me`.
