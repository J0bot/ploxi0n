# Maille v1 — le protocole public du maillage xerboxion

*Version 1 · 12.11.2026 · ploxi0n 0.99.42. Statut : stable (ce qui suit est implémenté et testé dans ploxi0n iPhone et Android).*
*Licence proposée : CC0 (domaine public), à confirmer par RS-7. Implémentation de référence : `src/bions/maille.js`, `src/bions/fragments.js`
(JavaScript), `ref/c/` (C portable, pour les microcontrôleurs). Vecteurs de test : `docs/protocole/vecteurs-v1.json`.*

Maille est un réseau de messages **sans internet ni serveur** : des appareils proches (téléphones, ordinateurs, Raspberry Pi, ESP32…) se
relient en Bluetooth basse consommation et se relaient les paquets de proche en proche. Ce document suffit pour construire un appareil qui
en fait partie. Les mots **DOIT**, **NE DOIT PAS**, **DEVRAIT**, **PEUT** ont le sens de la RFC 2119.

## 1. Les rôles

| rôle | il… | pour qui |
|---|---|---|
| **nœud** (`noeud`) | relaie les paquets des autres (§5), DEVRAIT les garder un temps (§6) | téléphones, ordinateurs, Pi, ESP32 alimenté |
| **client** (`client`) | se relie à un ou plusieurs nœuds, envoie et reçoit ses propres paquets, NE relaie PAS | un capteur sur pile, un bouton, un écran |

Un client n'a besoin ni de mémoire ni de relais : il parle à son nœud, qui fait le reste. Un nœud DOIT relayer les paquets d'un client
comme ceux de n'importe qui. Les deux rôles parlent exactement le même protocole ; seul le relais diffère.

Un appareil PEUT aussi ne rien comprendre au contenu et seulement relayer (un « relais muet ») : c'est un nœud valide. Il DEVRAIT tout de
même s'annoncer (§4.2), sinon les autres ne le voient que comme un voisin sans nom.

## 2. Le transport : Bluetooth basse consommation (GATT)

- Service : `8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C10`
- Caractéristique : `8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C11`, propriétés **notify + write + writeWithoutResponse**, avec son descripteur
  d'abonnement (CCCD `0x2902`).
- Un **nœud** DOIT tenir les deux rôles GATT à la fois :
  - **périphérique** : il annonce l'UUID du service dans son annonce, accepte les écritures (ce qu'on lui envoie) et **notifie** ses abonnés
    (ce qu'il envoie) ;
  - **central** : il cherche ce service, se connecte (8 voisins au plus est raisonnable), découvre la caractéristique, **s'abonne** aux
    notifications (ce qu'il reçoit) et y **écrit sans réponse** (ce qu'il envoie).
- Un **client** PEUT ne tenir qu'un rôle (central ou périphérique) : un nœud le verra dans l'un ou l'autre.
- Un même appareil peut donc arriver deux fois chez un voisin (une fois par rôle) : ce n'est pas une erreur, le dédoublonnage (§5) s'en charge.
- Chaque écriture ou notification porte **un morceau** (§3) de **180 octets au plus**. Les deux côtés DOIVENT négocier un MTU ATT
  **≥ 185** (Android et ESP32 : le demander explicitement, 517 par exemple ; le défaut de 23 octets ne suffit pas).
- Une seule opération GATT à la fois par connexion est la règle sur Android et la plupart des piles embarquées : mettre les morceaux en file.

*D'autres transports (le Wi-Fi d'un boxion, un fil série) PEUVENT porter les mêmes morceaux ou les mêmes paquets ; seul le BLE est défini ici.*
*Sur les appareils Apple, ploxi0n utilise en plus MultipeerConnectivity (Apple seulement) : il porte les mêmes paquets, sans morceaux.*

## 3. Les morceaux

Un paquet (§4 : du texte JSON en UTF-8, 16 000 octets au plus) est coupé en morceaux :

```
octet 0      0xB1                 la marque
octets 1..4  id du paquet         entier non signé 32 bits, gros-boutiste (au hasard au départ, +1 par paquet)
octet 5      rang                 0 .. n-1
octet 6      n                    nombre de morceaux, 1 .. 100
octet 7      0                    réservé
octets 8..   les octets UTF-8 du paquet, 172 au plus
```

À l'arrivée, les morceaux d'un même (voisin, id) se recollent dans n'importe quel ordre. Un paquet incomplet est oublié au bout de 30 s.
Un morceau qui ne commence pas par `0xB1`, ou dont le rang est ≥ n, est jeté. `n = 1` : le morceau est le paquet entier.

## 4. Le paquet

Un paquet est un objet JSON en UTF-8, 16 000 octets au plus. Il DEVRAIT être émis compact (sans espaces, comme `JSON.stringify`)
et DOIT être accepté avec des espaces. L'ordre des champs est libre.

### 4.1 La forme

```json
{ "m": 1, "i": "<16 hex>", "o": "<16 hex>", "n": "<nom>", "h": <0..255>, "t": <ms epoch>, "k": "<type>",
  "s": "<#salon>", "a": "<16 hex>", "c": <1..16>, "d": { … } }
```

| champ | | sens |
|---|---|---|
| `m` | DOIT | la version du format : `1` |
| `i` | DOIT | l'id du paquet : 8 octets au hasard, en hex minuscule (16 caractères) |
| `o` | DOIT | l'empreinte de l'auteur (§7.1) |
| `n` | PEUT | son nom affiché, 24 caractères au plus (libre : c'est l'empreinte qui fait foi) |
| `h` | DOIT | les sauts restants : entier 0 à 255 ; on émet à **255** |
| `t` | DOIT | l'heure d'émission, en millisecondes depuis 1970 |
| `k` | DOIT | le type : 2 à 10 lettres minuscules (§4.2) |
| `s` | PEUT | le salon : `#` (tout le monde) ou `#` suivi de 32 lettres, chiffres, `_` ou `-` au plus |
| `a` | PEUT | le destinataire (son empreinte) |
| `c` | PEUT | le budget du coursier, 1 à 16 (§6.2) |
| `d` | PEUT | le contenu, un objet |

Un paquet qui ne respecte pas ces formes DOIT être jeté (ni lu ni relayé). **Un champ inconnu DOIT être ignoré et DOIT être conservé
quand on relaie** (c'est ce qui permet d'étendre le protocole sans casser les appareils plus anciens).

### 4.2 Les types

| `k` | contenu `d` | |
|---|---|---|
| `ann` | `{ cle, v?, r?, p?, cap?, pos? }` | l'annonce : la clé publique brute en base64 (`cle`) ; les empreintes de ses voisins directs (`v`, 10 au plus) ; le rôle (`r` : `noeud` ou `client`) ; la version du protocole (`p` : `1`) ; ce qu'il sait faire (`cap` : `relais`, `stock`, `pub`, `mp`, `ack`, `pos`, `coursier`, `carte`, `xion`…) ; (0.99.53) **`pos`** : `{ lat, lng, precision? }`, seulement pour un nœud **fixe** qui accepte de dire où il est (un relais posé : un Pi, un ESP32), arrondi à 5 décimales (~1 m) ; un appareil qui bouge (un téléphone) NE DEVRAIT PAS l'envoyer. **`xion`** dans `cap` : ce nœud est relié au xion (le runtime en ligne : une passerelle) |
| `pub` | `{ x }` en clair, ou chiffré (§7.3) | un message dans un salon (`s`) |
| `mp` | chiffré (§7.2) : `{ x, m? }` | un message privé pour `a` |
| `ack` | `{ r, l? }` | l'accusé d'un privé : `r` = l'id du message, `l: 1` = lu |
| `sync` | `{ ids }` (`h` = 0) | « voici les 160 derniers id que j'ai vus » (§6.1) |
| `pos` | chiffré : `{ lat, lng, precision, cap, rdv? }` ou `{ fin: true }` | une position, pour un pote (`a`) ou un salon fermé (`s`), jamais en clair |

**Un type inconnu bien formé DOIT être relayé** (et PEUT être gardé) comme les autres, et ignoré pour le reste. Exemple : un ESP32 peut
inventer `capteur` ; tous les nœuds d'aujourd'hui le transporteront jusqu'à ceux qui le comprennent. Un nouveau type DEVRAIT être annoncé
dans `cap`.

Un appareil DEVRAIT envoyer `ann` à chaque nouveau voisin, quand il identifie un nouveau voisin direct, et toutes les 60 s.

## 5. Le relais (pour un nœud)

Pour chaque paquet reçu d'un voisin :

1. **Déjà vu** (son `i` est connu) → jeté. Le dédoublonnage DOIT se souvenir des id au moins 12 h (un filtre de Bloom suffit) ; un appareil à court de mémoire PEUT en retenir
   moins (`ref/c` : les 1024 derniers) : un doublon repassera alors une fois de plus, `h` et l'âge le bornent.
2. **Âge** : `t` plus vieux que 72 h, ou plus de 10 min dans le futur → jeté (ni lu ni relayé).
3. **Anti-déluge** : plus de 40 paquets du même auteur `o` en 10 s → jeté.
4. Le lire s'il est pour soi (`a` = soi, un salon rejoint, un type compris).
5. **Relayer** si `h > 0` et si `a` n'est pas soi : renvoyer le paquet **tel quel**, avec `h - 1` (et `c: 1`, §6.2), à tous les autres
   voisins, après un délai au hasard de 10 à 150 ms (moins de collisions, et on devine moins qui a écrit le premier).

Les sauts déjà faits = `255 - h`. Un voisin direct est celui dont un paquet arrive avec `h = 255`.

## 6. Garder et remettre (pour un nœud, recommandé)

### 6.1 Stocker et relayer
Garder les paquets récents (150, 12 h ; 72 h pour un pote). À chaque nouveau voisin, lui envoyer un `sync` ; à la réception d'un `sync`,
lui renvoyer ce qu'il n'a pas (avec `h - 1`, et `c: 1`).

### 6.2 La boîte d'envoi et les coursiers
- **La boîte d'envoi** (l'auteur) : un `mp` sans `ack` DEVRAIT être renvoyé à chaque nouveau voisin et quand le destinataire s'annonce
  (24 h, 8 essais au plus, 20 s entre deux), avec un **nouvel `i`** (sinon les relais le jettent) ; l'id du *message* voyage dans le
  chiffré (`m` = l'`i` du premier envoi). Le destinataire affiche et accuse `m` (un seul message, même reçu deux fois).
- **Les coursiers** (spray-and-wait) : un `mp` part avec `c: 8`. Un nœud qui le voit passer pour quelqu'un qui n'est pas son voisin direct
  le garde (72 h, 100 au plus). Une copie relayée ou rejouée par `sync` part avec `c: 1`. À un NOUVEAU voisin, le porteur donne la moitié
  de ses copies (`h: 0`, `c: moitié`). Quand le destinataire est voisin direct, le porteur le lui remet (`h: 0`) et l'oublie. Un `ack` qui
  passe vide la sacoche de ce message.

## 7. L'identité et la cryptographie

### 7.1 L'identité
Une paire **ECDH P-256**. Clé publique brute non compressée : 65 octets (`0x04 ‖ X ‖ Y`). **Empreinte** = les 8 premiers octets du
SHA-256 de cette clé, en hex minuscule. Un `ann` dont la clé ne donne pas son `o` DOIT être jeté.

### 7.2 Une paire (les privés, les positions)
`secret = ECDH(ma clé privée, sa clé publique)` (32 octets) → **HKDF-SHA256**, sel `ploxi-maille-v1` (UTF-8), info = les deux empreintes
**triées** et jointes par `|` → 32 octets → clé **AES-GCM 256**.

### 7.3 Un salon fermé
**PBKDF2-SHA256**(mot de passe), sel `ploxi-salon:<#salon>`, 100 000 itérations → 32 octets → AES-GCM 256.

### 7.4 Chiffrer un objet
1. JSON → octets UTF-8 ;
2. **rembourrage** : `[longueur sur 4 octets, gros-boutiste][les octets][du hasard]` jusqu'au premier palier de 256, 512, 1024, 2048, 4096
   ou 8192 octets ;
3. AES-GCM, IV de 12 octets au hasard, **données associées** = `o + ">" + (a || s || "") + ":" + i` (UTF-8) ;
4. `d = { "c": base64(chiffré + étiquette), "v": base64(IV) }`.

Les données associées lient le chiffré à son en-tête : un relais ne peut ni le détourner vers un autre destinataire, ni le rejouer sous un
autre id.

### 7.5 La carte d'un pote (QR)
`ploxi0n://pote?k=<clé publique, base64url sans =>&f=<empreinte>&n=<nom, encodé URL>`. La scanner en vrai = connaître sa clé d'avance (un pote
vérifié) ; l'empreinte se recalcule depuis la clé, une carte où elles ne correspondent pas DOIT être refusée.

## 8. La conformité

`docs/protocole/vecteurs-v1.json` contient, pour deux identités de test (publiques, à ne jamais utiliser pour de vrai) : leurs clés et
empreintes, le secret ECDH, la clé AES de la paire, la clé du salon `#soiree` (mot de passe `lac`), un exemple de rembourrage, six paquets
réels (`ann`, `pub` en clair, `pub` de salon fermé, `mp`, `ack`, `pos`), leurs contenus en clair et un paquet découpé en morceaux. Une
implémentation est conforme si elle :
1. retrouve les empreintes, le secret, les clés ;
2. déchiffre `pub_salon_ferme`, `mp_x1_x2` et `pos_x1_x2` vers les contenus attendus ;
3. recolle les morceaux en `pub_clair` ;
4. relaie un paquet de type inconnu en conservant ses champs inconnus.

Le test de référence : `tests/protocole-v1.test.mjs` (WebCrypto seul, d'après ce document) ; `ref/c/test` (le C).

## 9. Ce que la v1 ne fait pas (à savoir)

- **Les messages publics ne sont pas signés** : n'importe qui peut écrire un `pub` avec l'empreinte d'un autre. Les privés et les positions,
  eux, sont authentifiés (seuls les deux bouts ont la clé). Une v2 ajoutera une signature (Ed25519 ou ECDSA P-256).
- **Pas de secret persistant** : qui vole une clé privée plus tard peut relire les privés gardés.
- **Les métadonnées** : l'empreinte de l'auteur est en clair dans chaque paquet, l'annonce publie la clé, le nom et les voisins.
- **Le TTL de 255** : les boucles sont arrêtées par le dédoublonnage ; un maillage très dense multiplie les copies d'un même paquet.

## 10. Faire évoluer le protocole

- Un nouveau champ, un nouveau type : possible en v1 (§4.1, §4.2), annoncé dans `cap`.
- Ce qui casse la compatibilité (une autre cryptographie, une autre forme de paquet) : `m: 2`. Un appareil v1 jette un `m: 2` ; un appareil v2
  DEVRAIT continuer à comprendre et à émettre la v1 tant que des appareils v1 sont là.
