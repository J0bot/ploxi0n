# XERB0T · le contrôleur

RS-7 (16.10.2026) : « améliore la partie xerbot pour vraiment pouvoir se connecter avec Home Assistant, WLED, tous les trucs genre ESP,
Arduino, Raspberry Pi : il faut un controller pour que je puisse checker tout ça et contrôler tout ça ».

## Posé (0.75)

Le ploxion natif `controleur` (src/xerbot/), aussi en tête du mode xerbot de l'accueil.
Trois pages (les faces de son cube) :

- **appareils** : tes appareils, leur état et leurs commandes ;
- **ajouter** : chercher sur le réseau, ou une adresse ;
- **le bus** : le journal du bus xerbot v1, et une commande à la main.

| famille | comment l'app lui parle | ce qu'on voit, ce qu'on fait |
| --- | --- | --- |
| Home Assistant | REST : `GET /api/states`, `POST /api/services/<domaine>/<service>`, `Authorization: Bearer <jeton>` | lumières (luminosité, couleur), prises, volets, chauffage, scènes, scripts, boutons, son ; capteurs |
| WLED | `GET /json`, `POST /json/state` (`on`, `bri`, `seg[{col,fx,pal}]`, `ps`), `/presets.json` | allumer, luminosité, couleur, effet, palette, preset ; LED, version, courant |
| ESPHome | le composant `web_server` : flux `/events` (SSE), `POST /<domaine>/<nom>/<toggle|turn_on|press|open|close|stop>` | interrupteurs, lumières, boutons, volets ; capteurs |
| Tasmota | `/cm?cmnd=Status%200`, `/cm?cmnd=Power<n>%20TOGGLE` | les relais ; l'énergie et les capteurs |
| Raspberry Pi | Glances (`glances -w`, port 61208) : `/api/4/quicklook`, `sensors`, `system` | processeur, mémoire, charge, températures |
| un boxion | boxion-rt (port 8730) : `/healthz`, `/events` (SSE), `POST /emit` | le cœur (uptime, ploxions), écouter le bus 2,5 s, émettre |
| HTTP JSON | n'importe quel firmware (ESP, Arduino Wi-Fi, un script sur un Pi) qui sert du JSON | ses clés ; tes actions (méthode, chemin, corps) |
| Bluetooth | UART : Nordic (`6e400001-…`) ou HM-10 (`ffe0` / `ffe1`) | un terminal : une ligne envoyée, les lignes reçues (aussi sur le bus : `ble-<id>.telemetry`) |
| HomeKit | déjà dans l'app (`jOSNatif.maison`) | les accessoires et leur interrupteur |

**Chercher sur le réseau** : la découverte Bonjour (`PloxiApple.reseauChercher`, NWBrowser) puis l'adresse IPv4 (`reseauResoudre`). Les types
écoutés sont dans `Info.plist` (`NSBonjourServices`) et dans `TYPES_BONJOUR` (src/xerbot/reseau.js) : les deux listes doivent rester les mêmes.

**Une adresse** : la famille se reconnaît seule. Toutes les familles sont sondées en même temps, chacune sur son port par défaut.

**Le réseau** : tout passe par le HTTP natif (CapacitorHttp), donc sans CORS. Ni Home Assistant ni boxion-rt n'envoient d'en-têtes CORS.
- Le délai est court (4 s), avec un second essai. La toute première requête vers le réseau local peut être refusée pendant qu'iOS demande la
  permission.
- Le relais du labo n'est jamais utilisé : il ajouterait le jeton du compte.

Les clés `Info.plist` : `NSAllowsLocalNetworking`, `NSLocalNetworkUsageDescription`, `NSBonjourServices`.

**Les jetons** (Home Assistant, un boxion qui en demande un) sont gardés dans le trousseau d'iOS (`jOSVerrou`, Face ID). L'app les lit une fois
par séance et ne les garde qu'en mémoire. `boxion_local` ne garde que le fait qu'un jeton existe (`options.jeton`).

**Ne pas nuire** :
- une serrure ou une porte de garage demande « sûr ? » avant d'agir ;
- une alarme se lit seulement ;
- rien de sensible n'est atteignable par le bus ;
- le contrôleur ne parle au réseau que lorsqu'il est à l'écran : toutes les 5 s pour l'appareil ouvert, toutes les 20 s pour la liste.

## Le bus xerbot v1 (le contrat du labo)

C'est le contrat de `/xerbot-contract.json` : `ploxion.xerbot.<appareil>.cmd|ack|state|telemetry`.

Chaque lumière ou prise du contrôleur devient un device du bus :
- `ha-<entity_id>` (comme jOSHome) ;
- `wled-<id>` ;
- `esphome-<id>-<entité>`, `tasmota-<id>-<relais>`.

Ce qu'il fait sur le bus :
- il répond à `set { on, bri 0..255, color [r,g,b] | '#rrggbb', fx }` et à `preset { n }` par un `ack { id, ok, err? }` ;
- un verbe inconnu reçoit `ok:false`, jamais un ok aveugle ;
- il publie son `state { online, on, bri, color, transport }`.

`window.jOSXerbotReel.devices()` les rend dans la forme du registre `/xerbot-devices.json` (`transport: 'ha' | 'http'`).

Le mode xerbot de l'accueil envoie maintenant la commande legacy du contrat (`ploxion.xerbot.command { cmd, d?, deg?, src }`). Avant, il envoyait
une chaîne brute sur `ploxion.xerbot.cmd` que personne n'écoutait.

## Pour brancher tes appareils

- **Home Assistant** : ton profil › Sécurité › « jeton d'accès longue durée ». Colle-le dans le contrôleur (Face ID le garde).
- **WLED** : rien à faire, il s'annonce.
- **ESPHome** : ajoute `web_server:` (version 2 ou 3) dans le YAML de la carte.
- **Raspberry Pi** : `pip install glances` puis `glances -w` (port 61208).
  - Un boxion : `installers/flash.sh pi` de boxion-rt (port 8730).
- **Un Arduino en Bluetooth** : un module HM-10, ou un ESP32 en Nordic UART. Une ligne par message, terminée par `\n`.

## Les quêtes

| id | quête |
| --- | --- |
| `xerbot-registre` | Servir `/xerbot-devices.json` depuis l'app (le registre du labo + `jOSXerbotReel.devices()`) : le centre xerbot montre le vrai matériel avec son badge HA / HTTP. |
| `ha-ws` | Home Assistant en direct (WebSocket `/api/websocket`, comme jOSHome) au lieu de relire toutes les 5 s. |
| `mqtt` | Un broker MQTT (Mosquitto) : le pont jOSMqtt du labo, en natif (`xerbot/<appareil>/<port>`). |
| `esphome-api` | L'API native d'ESPHome (port 6053, protobuf) pour les cartes sans `web_server`. |
| `widgets` | Un widget et un contrôle du Centre de contrôle pour les appareils favoris. |
| `gpio-pi` | Le bion GPIO WS2812 sur un boxion (Pi) qu'attendent chillout et web-chillout-led. |
