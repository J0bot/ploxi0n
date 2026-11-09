# Publier ploxi0n sur l'App Store : la liste, dans l'ordre

*09.11, 0.99.40. RS-7 : « je veux bientôt publier l'app sur l'App Store et que tout soit prêt, surtout les notifs ».
Le détail de chaque écran d'App Store Connect : docs/APP-STORE.md. Les missions admin : docs/MISSIONS-ADMIN.md.*

## 1. Les notifications (le chemin complet)

| étape | qui | état |
|---|---|---|
| L'app : la permission, le jeton gardé et copiable, envoyé au labo, toucher = ouvrir le ploxion, les sujets | app | ✅ 0.91 · 0.99.28 |
| L'app ouverte : le bandeau de l'app (pas de doublon) ; la notification reste dans le centre de notifications, le badge | app | ✅ 0.99.40 |
| Proche : un privé ou une mention par le maillage → une notification, même sans réseau (⚙ › Notifications › Proche) | app | ✅ 0.99.40 |
| `aps-environment = production`, le relais du jeton dans l'AppDelegate | app | ✅ |
| **La clé APNs** (`.p8`, Key ID, Team ID) | RS-7 | ⏳ A3 |
| **Un premier envoi sans le labo** : ⚙ › Notifications › « Même app fermée » → copier le jeton → `node tools/push/envoyer-push.mjs --cle AuthKey_XXXX.p8 --kid … --team … --jeton …` | RS-7 | ⏳ |
| **Le labo** : coller `docs/labo-push/` (service, route `/api/app/push`, migration), la clé en variable d'environnement, `php artisan push:test ton@email` | RS-7 | ⏳ D1 |
| **Les vrais envois** : une ligne chacun là où le message est enregistré (coord, le social, bother) : `docs/labo-push/LISEZMOI.md` §5 | RS-7 | ⏳ |

Le jour où le labo envoie : le build déjà installé déclare son jeton tout seul (rallumer l'interrupteur, ou relancer l'app).

## 2. App Store Connect

1. **La politique de confidentialité** en ligne : `docs/CONFIDENTIALITE.md` → https://xerboxion.org/confidentialite (l'URL déjà déclarée).
2. **Le compte de démo** « bion » (jamais le tien) → `fastlane/metadata/review_information/` (demo_user, demo_password).
3. **Les notes pour la revue** : `fastlane/metadata/review_information/notes.txt` (prêtes : les modes d'arrière-plan expliqués, comment
   essayer Proche à deux appareils, aucune notification marketing).
4. **Les captures** : iPhone 6,9" (1320 × 2868) et iPad 13" (2064 × 2752), depuis tes appareils.
5. **App Privacy** : le même contenu que `ios/App/App/PrivacyInfo.xcprivacy`.
6. **Le chiffrement (export)** : l'Info.plist dit `ITSAppUsesNonExemptEncryption = NO`. L'app chiffre les messages de Proche (ECDH P-256,
   AES-GCM) avec la cryptographie fournie par iOS (WebCrypto) : relis la question d'Apple et confirme que l'exemption s'applique (chiffrement
   standard fourni par le système, grand public) ; sinon, il faut la passer à OUI et remplir la déclaration.
7. **La suppression du compte** : ⚙ › Compte › « Supprimer mon compte » ouvre la page du compte ; vérifie qu'elle va jusqu'au bout.
8. **Le build** : le workflow iOS TestFlight (avec `ble` pour que Proche parle aussi aux appareils non Apple), puis « Soumettre pour la revue ».

## 3. Ce que la revue peut demander

- Les modes d'arrière-plan `location`, `bluetooth-central`, `bluetooth-peripheral`, `audio` : justifiés dans les notes (Proche, la veille, le
  partage de position, les ambiances). Si Apple refuse `location` : la veille seule en a besoin, elle peut partir dans une version suivante.
- HealthKit : lecture seule, sur demande, l'envoi au boxion éteint par défaut (déjà dans les notes).
- Sign in with Apple : présent (le social, le compte).
