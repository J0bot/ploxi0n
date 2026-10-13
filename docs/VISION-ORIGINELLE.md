# La vision originelle du xerboxion

*RS-7, 13.10.2026 (dictée, nettoyée ; ses mots gardés). C'est la source : quand une décision de design hésite, relire ceci.*

## Le récit

Je me rappelle maintenant de la vision originelle du xerboxion. J'étais à une soirée, je n'avais pas de connexion internet, et je me suis
demandé comment je pouvais trouver mes potes. J'ai eu la vision d'un système où il y aurait une **map**, où je pourrais voir où étaient mes
potes : un truc **off the grid**. C'était sur mon iPhone ; je me rappelle avoir regardé mon téléphone et m'être dit à quel point c'était nul,
l'UI était nulle, et j'ai eu la vision du système en map.

**L'OS, c'est une map géante où il y a toutes les applications.** Je peux dézoomer l'app pour aller dans d'autres apps. Pour changer d'app,
je swipe à droite, en haut, à droite, en haut, à gauche, et j'arrive à l'app : soit j'utilise la map, soit je sais où est l'app avec des
swipes dans **quatre directions**. Chaque app a sa place ; quand on est dans une app, on peut aller ailleurs selon l'endroit où on l'a mise,
par **mémoire musculaire**.

C'était comme si je me baladais sur un **cube** : une app, c'est un cube ; j'arrive sur une face, je peux rentrer dedans et swiper à gauche,
à droite. À la base, il y a la base de l'OS : juste un cube, **le xerboxion**, et à partir du xerboxion tu vas partout. Au début tu n'as
rien, juste le xerboxion, et au fur et à mesure tu ajoutes des apps, des fonctionnalités : de l'XP, la fonction amis, la fonction boissons,
la fonction soirées, la map des amis, le son — mais c'étaient des **ploxions** : le ploxion map du monde, un pour les idées, un autre juste
pour les trip reports, et d'autres encore.

L'UI pouvait **changer selon l'état d'esprit** : le mode soirée, le mode vie normale, le mode travail, le mode en plein trip, le mode bourré
— des modes que **tu designes toi-même**. Un mode pour retrouver tes amis facilement, etc. Et au bout d'un moment il y avait le ploxion
Spotify, le ploxion Insta, tous les ploxions avec le système de map ; le ploxion soirée pour prendre les billets et payer ses boissons
directement sur le xerboxion. **Un endroit où il y a tout : pas plein d'apps, juste des plugins sur une map géante.**

À l'origine, c'était aussi pour avoir **un endroit où on peut tous se parler et se voir**, partager ce qu'on vit, et générer des **tsoins** au
fur et à mesure du temps. C'est le xerboxion pour téléphone : l'app xerboxion, qui est **un OS dans ton téléphone**. Et tout est
**décentralisé** : on se connecte juste entre nous avec des **codes d'amis**, personne ne peut nous surveiller ni voir ce qu'on fait : un
petit **réseau parallèle** pour les soirées.

Il y a plein de soirées où je me disais : waouh, ce serait tellement cool d'avoir le xerboxion là, tout serait tellement plus simple. **Tout
aurait la même UI**, le même thème graphique et la même manière de fonctionner. Tu veux faire un ploxion : c'est ultra simple. Tu veux
ajouter une fonctionnalité : tu la balances dans le truc d'idées, et boum, tu peux la faire. Au milieu du xerboxion il y avait aussi un
truc spécial qui pouvait savoir **si ça allait bien ou pas** : tu pouvais **logger tes états d'esprit**, **braindumper** à fond ; dès que tu
as une idée, un truc, une photo, tu la prends avec le xerboxion et tu la mets plus tard au bon endroit. Un truc magnifique.

Il y avait aussi une espèce d'Uber, mais gratuit, avec des voitures autonomes ; un système de drones qui te passe de la bouffe et des
boissons. **Le xerboxion : le truc chill qui rassemble les gens.** Je me rappelle m'être dit : waouh, ça, c'est un xerboxion.

J'avais commencé à le faire avec un backend Rust et un front en Flutter, mais je n'ai jamais réussi à vraiment le faire : il me manquait des
éléments. Là, tout bientôt, j'aurai fini de faire les building blocks pour le rendre réel : faire le **réseau mesh** de malade qu'est le
**xion**. Ça m'a pris des années à comprendre le mot xerboxion, mais je me rappelle à quoi je l'avais appliqué en premier — je crois que
c'était le « xerbixia mobile », j'irai checker ça.

## Ce que ploxi0n en tient déjà (posé)

| La vision | Dans ploxi0n (13.10, 0.62) |
|---|---|
| Un OS dans le téléphone, tout est un ploxion | l'app elle-même ; les ploxions du labo installés et lancés en natif, chacun peut ouvrir les autres |
| La même UI partout | le thème chill-tekk imposé à tous les ploxions (`pxChill`), les glyphes et les icônes du xerboxion |
| Une app = un cube, se balader dessus | la fractale (`src/app/fractale.js`) : tenir un bord → aperçu, fractale, slider, **cube** (faces = apps, dessus = ses bions), gyroscope |
| Changer d'app par des swipes, gauche / droite | les bords (glisser = app précédente / suivante, 9 zones à gestes) |
| Des modes selon l'état d'esprit | les modes chill-tekk / xerboxion / xerbot (fixes, pas encore à designer soi-même) |
| Logger, braindumper, la capture rapide | le tsoin (noter un tsoin d'un geste), le vocal, le journal des tsoins |
| Tes données à toi, rien ne sort | boxion_local (tout est sur l'iPhone, chiffré), le mode connecté est un choix |
| La map | des ploxions de carte au labo (kion-map, cartes…) ; pas encore la map des apps |

## Ce qui n'y est pas encore (voulu, pas posé)

- **La map géante des apps** : chaque ploxion a une PLACE sur une carte ; dézoomer = voir la carte ; changer d'app = des swipes dans
  **quatre directions** (droite, haut, droite, haut, gauche → l'app), appris par mémoire musculaire. La fractale actuelle est une bande
  (gauche / droite) : la carte en serait la généralisation 2D (et le cube, une case de la carte vue de près).
- **Commencer avec rien** : au premier lancement, juste le cube du xerboxion ; les ploxions s'ajoutent avec le temps (l'XP, les amis…).
- **Des modes qu'on designe soi-même** : soirée, vie normale, travail, en plein trip, bourré, « retrouver mes amis » — chacun change l'UI,
  les ploxions mis en avant, les gestes.
- **Les amis off the grid** : la map des amis, sans internet, par des **codes d'amis**, en **mesh** (le xion) ; personne ne surveille.
- **Le ploxion soirée** (billets, boissons), le **check-in de l'état d'esprit** (« est-ce que ça va »), l'inbox de capture (« prendre une
  photo ou une idée maintenant, la ranger plus tard »).
- *(spéculatif)* l'Uber gratuit en voitures autonomes, les drones de bouffe et de boissons.
