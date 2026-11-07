# La soirée : un réseau parallèle, le temps d'une soirée

> **Pour l'agent du nexus** (RS-7, 07.11 : « c'est pas trop pour toi ça, c'est pour l'agent du nexus, pas besoin de faire ça mtn »).
> Rien n'est construit ici : c'est la passation, avec ce qui existe déjà côté ploxi0n et boxion-rt.

*RS-7, 07.11 : « il faut que ça puisse être une redondance avec le ploxion messages avec les amis : s'ils sont dans nos amis, on peut direct les
voir s'il y a un mesh. En soirée, un boxion qui traîne, qui fait toute la réplication avec le nexus, ou qui est hors ligne mais a déjà tout ce
qu'il faut ; quelqu'un se connecte au Wi-Fi xion du boxion ou en Bluetooth, ça crée un mesh tout seul, et on parle avec nos amis sur le social
ou les autres ploxions connectés, même sans réseau. On crée notre réseau parallèle le temps d'une soirée, ou on va plus loin. »*

## Le concept, en une image

```
            (internet, s'il y en a)
   nexus ⇄ ──────────────────────── ⇄ le boxion de la soirée (un Pi : xerboxion-rt, « xb devenir xion »)
                                         │  réplique avant (le social, les ploxions, les profils des amis)
                                         │  émet SON Wi-Fi « xion-… » ; garde tout pendant la soirée
                 Wi-Fi xion ┌────────────┼────────────┐ Wi-Fi xion
                            ▼            ▼            ▼
                         téléphone ⇄ téléphone ⇄ téléphone      ← et entre eux : Bluetooth / Multipeer (Proche, déjà là)
                            le maillage : les mêmes paquets, par tous les tuyaux à la fois
```

- **Les amis = les potes du maillage.** Un ami du social est reconnu dans le maillage dès qu'il est à portée (sa clé est connue d'avance) :
  on le voit, on lui écrit, chiffré, sans réseau.
- **Le boxion de la soirée** est un nœud de plus, fixe et toujours allumé : il relaie, il garde (stocker et relayer), et quand internet
  revient il resynchronise avec le nexus.
- **Redondance** : un message part par tous les chemins disponibles (internet → le social ; le Wi-Fi du xion ; le Bluetooth) ; le maillage
  dédoublonne. Le social et Proche montrent la même conversation.

## Ce qui existe déjà (posé)

| brique | où | état |
|---|---|---|
| le maillage façon bitchat (relais 7 sauts, stocker-relayer, privés E2E, salons, potes, position chiffrée) | ploxi0n `src/bions/maille.js` | ✅ 0.99.21 → 0.99.29 |
| les tuyaux téléphone ↔ téléphone : MultipeerConnectivity (+ BLE derrière `PLOXI0N_BLE`) | ploxi0n `src/natif/proche-natif.js`, Swift | ✅ iPhone ; ✗ Android |
| la carte de pote (QR : clé + nom ; scanner = pote vérifié, sa clé gardée) | ploxi0n `maille.carte()`, `ajouterCarte()` | ✅ 0.99.35 |
| le bus du boxion en WebSocket (`/ws` : `{emit:{topic,payload}}` et le flux de tous les événements) | boxion-rt `crates/xerboxion-host/src/serve.rs` | ✅ (jeton `XION_BUS_TOKEN` facultatif) |
| la fédération entre boxions (`/peer`, `/replicate`) : la réplication avec le nexus | boxion-rt | ✅ |
| un Pi qui émet son Wi-Fi `xion-…` (Wi-Fi + Bluetooth du même nom) | `xb devenir xion`, `xb reseau` | ✅ |
| le téléphone appareil du labo (agent xb) | ploxi0n `src/bions/xb-agent.js` | ✅ 0.99.33 |

## Ce qui manque, dans l'ordre (spéculatif tant que ce n'est pas construit)

1. **Le tuyau « boxion » dans Proche** (ploxi0n seul) : un troisième tuyau, à côté de Multipeer et du BLE : le WebSocket `/ws` du boxion de
   la soirée, sujet `maille`. Les mêmes paquets (les privés restent chiffrés de bout en bout ; le boxion ne lit que le public). On le
   rejoint en scannant **le QR de la soirée** que le boxion affiche (`ploxi0n://soiree?ws=…&wifi=…`), ou en tapant son adresse.
2. **Le boxion, un pair du maillage** (boxion-rt) : il garde les paquets récents et les rejoue aux nouveaux venus (le stocker-relayer du
   maillage, côté boxion) ; sa page affiche le QR de la soirée ; le bus de la soirée en accès local (un jeton de soirée dans le QR plutôt
   que `XION_BUS_TOKEN`).
3. **Les amis du social ↔ les clés du maillage** (labo, le social) : chacun publie sa carte de pote (sa clé publique, rien d'autre) sur son
   profil ; l'app récupère celles de ses amis quand il y a du réseau (ou le boxion de la soirée les a répliquées) → ils deviennent des
   potes vérifiés d'avance. ❓ à décider : où vit la carte (le profil j0bot ? le boxion du compte ?) et qui la voit (les amis seulement).
4. **Le social sans réseau** (labo + ploxi0n) : la conversation d'un ami passe par le maillage quand internet manque, et se recolle au social
   quand il revient (la redondance : un même id de message, dédoublonné).
5. **Android** dans le maillage : `PloxiBLE.java` (notre protocole, inspiré de meshlink), sinon le Wi-Fi du xion suffit déjà.
6. **Plus loin** : plusieurs boxions qui se relaient entre eux (la fédération), un quartier, un festival.
