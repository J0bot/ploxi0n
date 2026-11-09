# Les notifications push, côté labo : le code prêt à coller (0.99.28)

Le contrat est dans `docs/PUSH.md`. Ces fichiers se copient tels quels dans le labo (Laravel), aux mêmes chemins :

| fichier | rôle |
| --- | --- |
| `database/migrations/2026_11_01_000000_create_appareils_push_table.php` | la table `appareils_push` (une ligne par iPhone) |
| `app/Services/Apns.php` | l'envoi : le JWT ES256 (gardé 50 min), HTTP/2 vers Apple, les jetons morts effacés |
| `app/Http/Controllers/AppPushController.php` | `POST` et `DELETE /api/app/push` (l'iPhone déclare son jeton et ses sujets) |
| `app/Console/Commands/PushTest.php` | `php artisan push:test <id ou e-mail>` : une notification de test |

Vérifiés ici : `php -l` sur chacun ; le JWT signé par `Apns::jwtAvec` est accepté par la clé publique (8 sur 8, ES256 en R‖S).

## 1. `config/services.php`, dans le tableau

```php
'apns' => [
    'key_id' => env('APNS_KEY_ID'),
    'team_id' => env('APNS_TEAM_ID'),
    'key_p8' => env('APNS_KEY_P8'),          // le texte du .p8 (Coolify : variable secrète)
    'key_p8_b64' => env('APNS_KEY_P8_B64'),  // ou le même en base64, sur une ligne
    'key_path' => env('APNS_KEY_PATH'),      // ou un fichier hors du dépôt (chmod 600)
    'topic' => env('APNS_TOPIC', 'ch.j0bot.ploxi0n'),
    'prod' => env('APNS_PROD', true),        // TestFlight et l'App Store : production
],
```

## 2. Les routes, dans `routes/api.php`, DANS LE MÊME GROUPE que `/app/moi` (le garde du jeton de l'app)

```php
use App\Http\Controllers\AppPushController;

Route::post('/app/push', [AppPushController::class, 'store'])->middleware('throttle:20,1');
Route::delete('/app/push', [AppPushController::class, 'destroy']);
```

## 3. Déployer

```
php artisan migrate --force
php artisan config:clear
```

## 4. Tester

1. Dans l'app (connecté) : ⚙ › Notifications › « Même app fermée (push) » : allumé. L'app envoie son jeton au labo ; le message sous
   l'interrupteur dit « jeton envoyé au labo » (ou l'erreur exacte).
2. Sur le serveur : `php artisan push:test ton@email` → `✓ 200` et la notification arrive (verrouille l'iPhone pour la voir en grand).

## 5. Brancher les vrais envois (une ligne chacun, là où le message est enregistré)

```php
use App\Services\Apns;

// /coord : un message posté (pas à son auteur)
Apns::aTous('coord', '📡 coord · #' . $topic, mb_substr($texte, 0, 200), ['ouvrir' => 'coord', 'params' => ['topic' => $topic]], sauf: $auteurId);

// le social : un message direct ou une mention
Apns::auCompte($destinataireId, 'messages', '💬 ' . $nomAuteur, mb_substr($texte, 0, 200), ['ouvrir' => 'social']);

// bother : une réponse
Apns::auCompte($auteurDuBotherId, 'bother', '🗯 bother', 'RS-7 t\'a répondu', ['ouvrir' => 'bother']);
```

Si un envoi ralentit la requête, mets-le dans un job (`dispatch(fn () => Apns::aTous(...))->afterResponse();`).

## Si ça ne marche pas

| réponse | cause |
| --- | --- |
| `403 InvalidProviderToken` | la clé, `APNS_KEY_ID` ou `APNS_TEAM_ID` ne vont pas ensemble |
| `400 BadDeviceToken` | `APNS_PROD` faux pour ce build (TestFlight = `true`) |
| `400 TopicDisallowed` | la clé n'est pas de l'équipe de l'app |
| `410 Unregistered` | le jeton est mort (effacé tout seul) : réactiver dans l'app |
| cURL sans HTTP/2 | `curl_version()['features'] & CURL_VERSION_HTTP2` doit être vrai (libcurl avec nghttp2) |
