# Maille v1 : l'implémentation de référence en C

Pour n'importe quel appareil qui veut faire partie de la maille : un ESP32, un nRF52, un Pi, un PC. La spec :
[`docs/protocole/MAILLE-v1.md`](../../docs/protocole/MAILLE-v1.md).

- `maille.h`, `maille.c` : C99, sans allocation, sans dépendance. Les morceaux BLE (§3), la lecture et la validation d'un paquet
  (§4), la décision d'un nœud (§5 : dédoublonnage, âge, anti-déluge, h - 1, c : 1, les champs inconnus gardés à l'octet près).
  Pas de crypto : un relais n'en a pas besoin. Pour lire les mp / pos / salons fermés, ajouter mbedTLS (ECDH P-256, HKDF-SHA256,
  PBKDF2-SHA256, AES-256-GCM, §7) et vérifier contre les vecteurs.
- `test/` : `make test` (ou `cc -std=c99 -I. maille.c test/test.c -o t && ./t`) vérifie tout contre
  `docs/protocole/vecteurs-v1.json`. `test/vecteurs.h` est généré par `node tools/protocole/vecteurs-c.mjs`. `npm test` le lance
  aussi quand un compilateur C est là.
- `esp32/noeud-maille/` : un nœud ESP32 (NimBLE) qui relaie, ou écoute en mode client. **Pas compilé ici** (pas de chaîne
  ESP32) : un squelette relu, à compiler et à tester sur une vraie carte.

Mémoire : environ `MAILLE_RECOLLAGES × MAILLE_PAQUET_MAX` (64 ko par défaut) + `MAILLE_VUS × 8` (8 ko). Sur un petit
microcontrôleur, baisser `MAILLE_PAQUET_MAX` (4096) et `MAILLE_RECOLLAGES` (2) : les plus gros paquets ne passent plus par lui,
la maille les fait passer ailleurs.
