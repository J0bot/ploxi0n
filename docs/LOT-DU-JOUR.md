# Le lot du jour de ploxi0n

RS-7, coord #2108 (20.11.2026) : « un seul build de ploxi0n par jour, chaque jour à 00:00 y a un nouveau build, donc tout ce qui doit être fait sur ploxi0n, faudra tout faire pour que ça soit juste un build par jour et pas genre des sparadraps partout ».

Règle : ce qui peut vivre côté labo (les vues des ploxions servies par labo.j0bot.ch) passe sans build ; ce fichier liste ce qui part dans le build de 00:00 (heure de Zurich). Un lot = des changements finis et testés, jamais une rustine.

## Build du 21.11 à 00:00
- `24ec99a` le relais natif pose `Content-Type: multipart/form-data` pour un FormData (src/marketplace/depot.js). Sans lui, Capacitor 8 (`CapacitorUrlRequest.setRequestBody`) ne pose aucun corps : coord répondait « rien à envoyer » (#1987, #2099) et les originaux de la galerie n'arrivaient pas dans le boxion (39 sur 52). Le natif fabrique le boundary.
  - côté labo, déjà en ligne sans build : coord envoie un message sans fichier en JSON.
