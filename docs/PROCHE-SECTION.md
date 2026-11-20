# Proche pour une section : ce qu'il est, ce qu'il n'est pas

*13.11.2026, ploxi0n 0.99.55. RS-7 (officier télématique), relayé par xerxion1 : « Proche pour une section : à documenter avant de
proposer ». Ce document décrit Proche tel qu'il est, pour qu'une décision se prenne sur des faits. Il ne propose rien, et il ne remplace
aucune règle de l'armée : sur ce sujet, ce sont le règlement, la sécurité de l'information et la hiérarchie qui décident, pas ce fichier.*

## Ce que Proche fait aujourd'hui (posé, testé)

| | |
|---|---|
| **Réseau** | maillage Bluetooth basse consommation, sans internet ni antenne : chaque téléphone relaie les autres (Maille v1, `docs/protocole/MAILLE-v1.md`) ; iPhone et Android parlent le même protocole ; un Pi ou un ESP32 peut servir de relais fixe |
| **Portée** | quelques dizaines de mètres par saut en terrain dégagé, beaucoup moins à travers les murs et les corps ; la portée totale dépend du nombre de relais |
| **Débit** | des messages courts, pas de la voix ni de la vidéo ; un morceau BLE fait 180 octets, un paquet chiffré va jusqu'à 8 Ko |
| **Messages** | un canal ouvert, des salons fermés (un mot de passe), des privés entre deux personnes ; un accusé « remis » ; garder et remettre plus tard quand quelqu'un revient à portée |
| **Positions** | partagées seulement avec les potes ✦ choisis, chiffrées pour eux, gardées en mémoire, jamais plus longtemps que la journée |
| **Chiffrement** | ECDH P-256 → HKDF-SHA256 → AES-GCM 256 pour les privés et les positions ; PBKDF2 (100 000 itérations) pour les salons ; rembourrage à paliers |
| **Identité** | une clé par téléphone, une empreinte de 8 octets ; une carte QR à scanner en vrai pour un pote vérifié, un code de sécurité à comparer |
| **Code** | ouvert, un protocole public avec des vecteurs de test, une implémentation C de référence |

## Ce qu'il n'est pas (les limites, sans les adoucir)

- **Pas un moyen homologué.** Ni le protocole ni l'app n'ont été audités ou approuvés par qui que ce soit. AES-GCM et P-256 sont solides,
  mais un chiffrement solide mal employé ne vaut rien, et personne d'extérieur n'a vérifié l'emploi.
- **Les messages publics ne sont pas signés** : n'importe qui à portée peut écrire au nom d'un autre sur le canal ouvert (Maille v1 §9). Seuls
  les privés et les positions sont authentifiés.
- **Pas de secret persistant** : une clé volée plus tard permet de relire les privés gardés.
- **Les métadonnées sont visibles** : qui parle, à qui, quand, le nom et les voisins de chaque téléphone sont lisibles par n'importe quel
  appareil à portée. Un téléphone qui annonce en Bluetooth **se signale** : on peut le détecter, le compter, le suivre, le goniométrer.
- **Des téléphones personnels** : le système, les autres apps, la sauvegarde iCloud ou Google, la perte ou la saisie du téléphone sortent du
  contrôle de Proche.
- **Pas de garantie d'acheminement** : un message passe s'il existe une chaîne de relais au bon moment ; sinon il attend, ou il se perd.
- **Le Bluetooth se brouille facilement** et dépend de la batterie des téléphones.

## Conséquences

- Rien de classifié, rien d'opérationnel, aucune position de troupe réelle ne doit y passer.
- Dans le cadre militaire, c'est au mieux un **objet d'étude** ou un outil pour ce qui serait de toute façon dit à voix haute (l'heure de la
  soupe, où est le camion), et seulement si le commandement et les règles sur les appareils personnels le permettent.
- Pour aller plus loin, il faudrait : des messages publics signés (v2 du protocole), un secret persistant, un audit externe du code et de la
  cryptographie, une politique sur les métadonnées (annonces discrètes, noms neutres), et surtout l'avis des personnes chargées de la sécurité
  de l'information. Rien de cela n'existe aujourd'hui.

## Ce qui reste à documenter avant de proposer quoi que ce soit

1. Ce que RS-7 a en tête concrètement : un exercice de formation sur les réseaux maillés, un outil de section pour la vie au quotidien, une
   démonstration ?
2. Les règles applicables aux appareils personnels et aux applications non homologuées dans ce cadre (à demander, pas à deviner).
3. Une mesure réelle : la portée et le temps d'acheminement avec 5, 10 et 30 téléphones sur le terrain (le faux iPhone ne le dit pas).
