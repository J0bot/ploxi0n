# ❤ Santé connecté (0.47)

RS-7 (12.10) : « je veux surtout que le ploxion santé soit connecté » → les deux :

1. **Le bion `jOSSante`** (= `jOSNatif.sante`), fourni par l'app : n'importe quel ploxion ouvert dans ploxi0n — dont le hub
   🌸 Santé du xerkion (`xerkion-sante`) — lit Apple Santé sur le téléphone. Chaque ploxion demande une fois (une feuille), refus = rien.
   `dispo()` · `autoriser()` · `resume({ jours })` · `lire(type, { depuis, jusqua, limite })` · `agreger(type, { depuis, bucket, aggregation })` ·
   `entrainements({ depuis, limite })` — les types : `LECTURE` dans `src/natif/sante.js` (ceux de @capgo/capacitor-health).
2. **Le résumé sur TON boxion** : interrupteur « ☁ envoyer » dans ❤ Santé iPhone, **éteint par défaut**. Allumé et connecté, au
   lancement, au retour au premier plan (au plus toutes les 30 min) et sur « ↥ maintenant », par jOSBoxion connecté (hors ligne : la
   file l'envoie au retour). Des agrégats, jamais les échantillons bruts :

| jOSBoxion | contenu |
|---|---|
| `sante/resume` | `{ maj, source, aujourdhui: { steps, distance, calories, heartRate, restingHeartRate, … }, nuit: { minutes, phases }, jours: [{ date, pas, sommeilH, coeurRepos }] (7), entrainements: [{ type, debut, minutes, km, kcal, source }] (12), appareils: [{ nom, type }] }` |
| `sante/jour-AAAA-MM-JJ` | `{ date, …aujourdhui, nuit, maj }` — un document par jour : l'historique s'accumule sur le boxion |

Côté labo, le hub 🌸 Santé peut lire `jOSBoxion.get('sante', 'resume')` (sur le web comme dans l'app) et `jOSSante` quand il existe
(dans l'app : les données fraîches de l'iPhone). Le bus `jOSPorts` reçoit `natif/sante` (le résumé) à chaque envoi.

Apple : HealthKit ne va jamais dans iCloud ni dans la pub ; l'envoi est explicite (texte d'Info.plist mis à jour) et révocable.
