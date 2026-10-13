# 🎞 Le lecteur intégré de ploxi0n (0.49)

RS-7 (13.10) : « pour le ploxion stremio, quand il est installé seul, il faut lui donner un lecteur intégré ». Choix : **Apple d'abord,
VLC en repli** ; pour un ploxion seul (l'icône qui ouvre xerboxion.org dans Safari) : **un bouton « ▶ ploxi0n »**.

## Dans l'app (rien à faire côté ploxion)

| Ce que fait le ploxion | Ce qui se passe |
|---|---|
| `jOSplayer.open(url)` / `jOSplayer.embed(cible, url)` d'une vidéo (le bion lecteur, Stremio) | le lecteur intégré (plugion) |
| une `<video>` que la WebView ne lit pas (MKV, codec) | le lecteur intégré, tout seul |
| une `<video>` sans son (AC3/DTS mal décodé) | une bulle « 🔇 pas de son ? ▶ lecteur natif » |
| un lien `vlc://`, `vlc-x-callback://…?url=`, `infuse://…?url=`, `outplayer://`, `nplayer-https://` | le lecteur intégré (on ne quitte pas l'app) |
| `window.open(url)` d'un flux vidéo | le lecteur intégré |
| `jOSNatif.lecteur.ouvrir(url, { titre, position, moteur, entetes, sousTitres })` | le lecteur intégré, explicitement |

Les moteurs : **Apple** (AVPlayerViewController : MP4, MOV, HLS, HEVC, AC-3/E-AC-3 ; PiP, AirPlay, écran verrouillé) et **VLC**
(MobileVLCKit : MKV, AVI, WebM, DTS, sous-titres intégrés ou externes, choix des pistes audio et sous-titres). En `auto`, un conteneur
qu'iOS ne lit pas va droit à VLC ; sinon Apple, et VLC si Apple échoue. ⚙ › Lecteur : le moteur, le passage automatique.
**VLC n'est dans le build qu'avec l'option `vlc`** (Actions › iOS TestFlight › Run workflow › vlc, ou la variable du dépôt
`PLOXI0N_VLC=1`) : sans elle, le lecteur intégré n'a que le moteur d'Apple.

L'app retient la position de chaque vidéo (`boxion_local` « lecteur-positions ») et reprend où on s'était arrêté ; le bus `jOSPorts`
reçoit `natif/lecteur` (`{ etat: lecture | position | fin | ferme | erreur | repli, moteur, position, duree, url }`).

## Pour un ploxion SEUL (dans Safari) : le bouton « ▶ ploxi0n » — à ajouter côté labo

Une page dans Safari ne peut pas lancer de code natif ; elle peut ouvrir l'app avec le lien `ploxi0n://lire` :

```js
// dans le ploxion (Stremio…), à côté de « Ouvrir » : seulement sur iPhone/iPad, et pas déjà dans l'app
const dansPloxi0n = !!(window.jOSNatif && window.jOSNatif.natif);
const surIOS = /iPhone|iPad/.test(navigator.userAgent);
if (surIOS && !dansPloxi0n) {
  const lien = 'ploxi0n://lire?url=' + encodeURIComponent(stream.url)
    + '&titre=' + encodeURIComponent(titre)                       // « Rick and Morty S9E3 »
    + (position ? '&position=' + Math.floor(position) : '')        // secondes
    + (sousTitres || []).map(s => '&sous=' + encodeURIComponent(s)).join('');
  bouton.textContent = '▶ ploxi0n'; bouton.onclick = () => { location.href = lien; };
}
// dans l'app, jOSplayer / jOSNatif.lecteur.ouvrir font déjà le travail
```

Si ploxi0n n'est pas installé, iOS ne fait rien : garder « Ouvrir » (le lecteur web) à côté.
