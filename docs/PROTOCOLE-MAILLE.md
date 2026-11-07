# Le protocole du maillage (pour `xb proche` : Linux, Windows, Pi, ESP32…)

*0.99.36. Pour qu'un appareil qui n'est pas un iPhone entre dans le maillage de Proche. Source de vérité : `src/bions/maille.js`,
`src/bions/fragments.js`, `PloxiBLE` dans `ios/App/App/AppDelegate.swift`. Les tests : `tests/maille.test.mjs`.*

## 0. Pourquoi l'iPhone ne voit pas le Pi

Proche parle deux tuyaux sur l'iPhone :
- **MultipeerConnectivity** (toujours) : le protocole d'Apple, entre appareils Apple seulement (iPhone ↔ iPad ↔ Mac). Un Pi, un PC Linux
  ou Windows ne peuvent PAS le parler. La « salle » de Proche (« xerboxion ») ne sert qu'à lui.
- **PloxiBLE** (le Bluetooth basse consommation) : le seul tuyau commun avec le reste du monde. **Il n'est compilé qu'avec l'option `ble`**
  du build iOS (Actions › iOS TestFlight › Run workflow › cocher `ble`) ; sans elle, l'iPhone n'annonce rien en BLE et ne cherche personne.
  Il ignore la salle : tout ce qui annonce le service ci-dessous est un voisin.

## 1. Le transport BLE (GATT)

- Service : `8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C10`
- Caractéristique : `8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C11`, propriétés **notify + write + writeWithoutResponse**, permission écriture.
- Chaque appareil fait **les deux rôles à la fois** :
  - **périphérique** : il annonce le service (l'UUID dans l'annonce), reçoit les écritures sur la caractéristique (ce qu'on lui envoie)
    et **notifie** ses abonnés (ce qu'il envoie) ;
  - **central** : il cherche ce service, se connecte (8 au plus), découvre la caractéristique, **s'abonne** aux notifications (ce qu'il
    reçoit) et y **écrit sans réponse** (ce qu'il envoie).
  Un même voisin peut donc arriver deux fois (une fois par rôle) : le maillage dédoublonne les paquets, ce n'est pas un problème.
- Une écriture / une notification = **un morceau** de 180 octets au plus (512 refusé).

## 2. Les morceaux (`src/bions/fragments.js`)

Un paquet du maillage (du texte JSON, jusqu'à 16 000 octets) est coupé en morceaux :

```
octet 0      : 0xB1 (la marque)
octets 1..4  : id du paquet, entier non signé 32 bits, gros-boutiste (un compteur au hasard, +1 par paquet)
octet 5      : rang du morceau (0..n-1)
octet 6      : nombre de morceaux n (1..100)
octet 7      : 0
octets 8..   : la suite des octets UTF-8 du texte (172 au plus par morceau)
```

À l'arrivée : les morceaux d'un même (voisin, id) se recollent dans n'importe quel ordre ; un paquet incomplet est oublié au bout de 30 s ;
au plus 64 paquets en cours par appareil. `n = 1` : le morceau est le paquet entier.

## 3. Le paquet (le texte recollé)

```json
{ "m": 1, "i": "<16 hex : id du paquet>", "o": "<16 hex : empreinte de l'auteur>", "n": "<nom, 24 car. max>",
  "h": <sauts restants, entier 0..255>, "t": <heure d'émission, ms epoch>, "k": "ann|pub|mp|ack|sync|pos",
  "s": "<#salon, facultatif>", "a": "<16 hex : destinataire, facultatif>", "d": { … } }
```

- **Relayer** : un paquet jamais vu (son `i`), d'une heure plausible (pas plus de 72 h, pas plus de 10 min dans le futur), dont `h > 0`,
  repart vers tous les autres voisins avec `h - 1`, après 10 à 150 ms au hasard. Un paquet dont `a` est soi-même s'arrête là.
  On émet avec `h = 255` (0.99.36 : l'infini en pratique ; avant, 7 : les anciennes versions refusent `h > 7`, il faut mettre à jour).
  Les sauts déjà faits = `255 - h`.
- **Anti-déluge** : 40 paquets par auteur (`o`) et par 10 s, au-delà on jette.
- **Stocker et relayer** : garder les paquets récents (150, 12 h ; ceux pour un pote : 72 h) ; à chaque nouveau voisin, lui envoyer un
  `sync` (`h: 0`, `d.ids` = les 160 derniers id vus) ; à la réception d'un `sync`, lui renvoyer ce qu'il n'a pas (avec `h - 1`).

## 4. L'identité et la cryptographie

- Identité : une paire **ECDH P-256**. Clé publique brute non compressée (65 octets, `0x04…`). **Empreinte** = les 8 premiers octets du
  SHA-256 de cette clé, en hex (16 caractères). C'est l'empreinte qui fait foi, pas le nom.
- `ann` : `d.cle` = la clé publique brute en base64 ; émis à chaque nouveau voisin et toutes les 60 s. À la réception : refuser si
  SHA-256(clé)[0..8] ≠ `o`.
- Clé d'une paire (privés, positions) : ECDH(ma clé privée, sa clé publique) → 256 bits → **HKDF-SHA256**, sel `ploxi-maille-v1`,
  info = les deux empreintes triées, jointes par `|` → **AES-GCM 256**.
- Clé d'un salon fermé : **PBKDF2-SHA256**(mot de passe), sel `ploxi-salon:<#salon>`, 100 000 itérations → AES-GCM 256.
- Chiffrer un objet : JSON → octets → **rembourrage** (`[longueur sur 4 octets gros-boutiste][octets][hasard]` jusqu'à 256, 512, 1024,
  2048, 4096 ou 8192) → AES-GCM, IV de 12 octets au hasard, **données associées** = `o + ">" + (a || s || "") + ":" + i` (UTF-8).
  `d = { "c": base64(chiffré), "v": base64(IV) }`.
- `pub` : `d = { "x": "<texte>" }` en clair (salon ouvert), ou chiffré par la clé du salon (salon fermé) ; `s` = le salon (`#` = tout le monde).
- `mp` : `a` = destinataire, `d` = `{ "x": "<texte>" }` chiffré par la clé de la paire. Le destinataire renvoie un `ack`
  (`a` = l'auteur, `d = { "r": "<i du message>" }`, `"l": 1` quand il est lu).
- `pos` : `{ lat, lng, precision, cap, rdv? }` ou `{ fin: true }`, chiffré pour un pote (`a`) ou un salon fermé (`s`), jamais en clair.

## 5. La carte de pote (le QR, 0.99.35)

`ploxi0n://pote?k=<clé publique, base64url sans =>&f=<empreinte>&n=<nom, encodé URL>` : la scanner = connaître sa clé d'avance (pote vérifié).

## 6. Ce qu'un appareil `xb proche` doit faire au minimum

1. Générer et garder son identité P-256 ; s'annoncer (`ann`).
2. Le BLE dans les deux rôles (§1) avec les morceaux (§2).
3. Relayer (§3) : c'est ce qui fait le maillage, même sans rien afficher. Un Pi qui relaie et garde (stocker-relayer) est le meilleur pont
   de la soirée.
4. Facultatif : lire et écrire dans les salons (`pub`), les privés (`mp` + `ack`).
