# Braindump : les idées posées, pas construites

*Ce que RS-7 veut, noté fidèlement pour ne pas le perdre, mais qu'on ne construit pas maintenant. Le **voulu** (ses mots) d'abord, puis ce
qui existe déjà à composer, puis les propositions (les miennes, pas décidées). Quand une idée passe en chantier : elle va dans
FEUILLE-DE-ROUTE.md et sort d'ici.*

## Piloter un appareil proche (12.11, 0.99.44)

**Voulu.** RS-7, depuis la capture Réglages › Accessibilité › Physique et motricité › « Contrôler les appareils à proximité » : intégrer
ça dans ploxi0n. Puis : « pour les appareils proches pour le pilotage, on note dans la doc braindump mais on fait pas maintenant ».

**Ce qu'iOS fait déjà.** « Contrôler les appareils à proximité » pilote un autre iPhone ou iPad du même compte iCloud (accueil, défilement,
volume, Siri). C'est iOS, une app ne peut ni l'allumer ni s'y brancher.

**Ce qui existe chez nous (à composer).** Le maillage de Proche (`src/bions/maille.js`, protocole public `docs/protocole/MAILLE-v1.md`) :
les potes ✦, le code de sécurité vérifié, les messages privés chiffrés (ECDH + AES-GCM), les accusés. Le bus des ploxions (jOSPorts,
« Envoyer à un ploxion » des Raccourcis). La télécommande de xb (`src/bions/xb-agent.js`).

**Proposition (pas décidée).** Un téléphone en pilote un autre par le maillage, sans réseau : ouvrir un ploxion, lui envoyer une commande
sur son port, la lecture (⏯), le volume, la lampe. Un nouveau type de paquet (le protocole l'accepte déjà : un type inconnu est relayé),
toujours chiffré comme un `mp`. Les garde-fous que j'ai proposés, à trancher par RS-7 :
- seulement entre potes ✦ dont le code de sécurité a été vérifié ;
- une demande à accepter sur le téléphone piloté, à chaque session ;
- une session qui s'arrête toute seule (15 min, ou au verrouillage) ;
- un bandeau toujours visible « piloté par Tom » sur le téléphone piloté, et un geste pour couper ;
- jamais les réglages, le trousseau, les paiements, la position, ni l'identité du maillage.
Questions ouvertes : seulement mes appareils, ou des potes aussi ? Une liste de ce qui se pilote, ploxion par ploxion ?
