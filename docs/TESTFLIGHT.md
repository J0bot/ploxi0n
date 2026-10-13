# Tester sur TestFlight (sans minutes Actions ni Mac)

*13.10.2026 : les minutes GitHub Actions sont épuisées jusqu'au 1.11 (macOS compte ×10). Le dernier build TestFlight est la 0.45.*

## Les options

| | Coût | Mise en place | Remarque |
|---|---|---|---|
| **Codemagic** (recommandé) | gratuit : 500 min/mois de macOS M2 (≈ 40 builds) | 10 min, dans le navigateur | `codemagic.yaml` est prêt : le même fastlane que GitHub |
| GitHub Actions payant | ≈ 0,06 $/min macOS → ≈ 0,50 $ par build | Settings › Billing › une limite de dépense (ex. 5 $) | rien d'autre à changer |
| Rendre le dépôt public | Actions gratuit et illimité (macOS compris) | un clic | le code devient public (les secrets restent dans GitHub) |
| Xcode Cloud | 25 h/mois avec le compte développeur | demande Xcode sur un Mac pour la première connexion | pas de Mac : écarté |

Le numéro de build est « dernier build TestFlight + 1 » (fastlane) : GitHub et Codemagic peuvent alterner.

## Codemagic, pas à pas

1. https://codemagic.io › **Sign up with GitHub** › autoriser le dépôt **J0bot/ploxi0n** (et seulement lui).
2. **Add application** › J0bot/ploxi0n › type **Other** (il lit `codemagic.yaml`).
3. L'app › onglet **Environment variables** › un groupe **`ploxi0n`** (cocher **Secret** pour chaque valeur). Les secrets GitHub ne
   se relisent pas (ni l'API ni l'interface ne les rendent) : les reprendre à leur source. **Le minimum : 4 valeurs** (sans `MATCH_*`,
   fastlane passe par la signature gérée par Apple, avec la seule clé API) :
   - `ASC_KEY_ID` et `ASC_ISSUER_ID` : App Store Connect › Utilisateurs et accès › Intégrations › Clés de l'API App Store Connect ;
   - `ASC_KEY_P8` : le contenu du fichier `AuthKey_XXXX.p8` (téléchargeable une seule fois : perdu → une nouvelle clé, rôle Admin) ;
   - `APPLE_TEAM_ID` : developer.apple.com › Account › Membership.
   Facultatif : `MATCH_PAT` + `MATCH_PASSWORD` (réutiliser les certificats de ploxi0n-certificats), `TESTFLIGHT_EMAIL` (lane
   `testeurs`), `PLOXI0N_WIDGETS=1` (les widgets, les contrôles), `PLOXI0N_VLC=1` (VLC).
   Tant que la branche n'est pas dans `main` : **Branch** › `glob/youthful-noether-v9xlop` › ↻ › **Check for configuration files**.
4. Lancer : **Start new build** › branche `main` › workflow « ploxi0n → TestFlight » — ou pousser un tag `v0.49`.
5. ≈ 15 min plus tard : l'app **TestFlight** de l'iPhone propose la mise à jour (le groupe « ploxi0n interne » reçoit chaque build ;
   sinon : Actions › « TestFlight testeurs et infos » › lane `testeurs`).

## Quoi vérifier sur l'iPhone (ce que le faux iPhone ne peut pas prouver)

- [ ] **Raccourcis / Siri** : « Dis à ploxi0n ouvre bother » ; Raccourcis › Ouvrir un ploxion ; Noter un tsoin.
- [ ] **Widgets** (build avec `widgets`) : épinglés, valeurs, **Cube** (⟲ le tourne), **À l'écoute** ; les **contrôles** (iOS 18).
- [ ] **Face ID** : verrouiller un ploxion, le rouvrir. **Notifications** : ⚙ › Notifications › tester.
- [ ] **Santé** : ❤ Santé iPhone › autoriser → des chiffres ; ☁ envoyer (connecté).
- [ ] **Le thème vivant** bouge, l'accueil ne déborde pas sur le côté.
- [ ] **Spotify** : l'écran verrouillé montre le titre, l'artiste, la pochette, ⏮ ⏯ ⏭ (sinon : noter ce qui s'affiche).
- [ ] **Stremio** : un stream MP4 → lecteur d'Apple (PiP, AirPlay) ; un MKV → VLC (build avec `vlc`) ; la reprise.
- [ ] **Le web natif** : un ploxion qui vibre, la position, une dictée, un QR, Bluetooth (ultimate-bluetooth), NFC.
- [ ] **Les fichiers** : Envoyer vers, l'aperçu d'un PDF, zip, la galerie, la lampe.
- [ ] ⚙ › À propos › Dernier démarrage : le temps et l'étape la plus lente.
