# 🎞 Le lecteur intégré de ploxi0n (0.49 ; 0.51 : branché sur le VRAI bion du labo)

RS-7 (13.10) : « pour le ploxion stremio, quand il est installé seul, il faut lui donner un lecteur intégré ». Choix : **Apple d'abord,
VLC en repli** ; pour un ploxion seul (l'icône qui ouvre xerboxion.org dans Safari) : **un bouton « ▶ ploxi0n »**.

## Dans l'app (rien à faire côté ploxion)

| Ce que fait le ploxion | Ce qui se passe |
|---|---|
| `jOSPlayer.play(url, { title, key, onNext, subs, pos })` : le bion du labo (Stremio, Ciné, Ouvrir, le Lecteur, la forge) | le lecteur intégré (plugion) ; la reprise reste celle de Stremio (`xb:resume:<key>`, `jOSPlayer.mark`) ; à la fin, `onNext` (l'épisode suivant) ; les sous-titres de Stremio passent ; si l'iPhone échoue, une bulle « ▶ lecteur web » |
| `jOSplayer.open(url)` / `jOSplayer.embed(cible, url)` (le bion de boxion-rt ; le labo ne le sert pas) | le lecteur intégré (plugion) |
| une `<video>` que la WebView ne lit pas (MKV, codec) | le lecteur intégré, tout seul |
| une `<video>` sans son (AC3/DTS mal décodé) | une bulle « 🔇 pas de son ? ▶ lecteur natif » |
| un lien `vlc://`, `vlc-x-callback://…?url=`, `infuse://…?url=`, `outplayer://`, `nplayer-https://` | le lecteur intégré (on ne quitte pas l'app) |
| `window.open(url)` d'un flux vidéo, ou d'un flux que `jOSPlayer` a déjà donné | le lecteur intégré (pas Safari) |
| `jOSNatif.lecteur.ouvrir(url, { titre, position, moteur, entetes, sousTitres })` | le lecteur intégré, explicitement |

Les moteurs : **Apple** (AVPlayerViewController : MP4, MOV, HLS, HEVC, AC-3/E-AC-3 ; PiP, AirPlay, écran verrouillé) et **VLC**
(MobileVLCKit : MKV, AVI, WebM, DTS, sous-titres intégrés ou externes, choix des pistes audio et sous-titres). En `auto`, un conteneur
qu'iOS ne lit pas va droit à VLC ; sinon Apple, et VLC si Apple échoue. ⚙ › Lecteur : le moteur, le passage automatique.
**VLC n'est dans le build qu'avec l'option `vlc`** (Actions › iOS TestFlight › Run workflow › vlc, ou la variable du dépôt
`PLOXI0N_VLC=1`) : sans elle, le lecteur intégré n'a que le moteur d'Apple.

L'app retient la position de chaque vidéo (`boxion_local` « lecteur-positions ») et reprend où on s'était arrêté ; le bus `jOSPorts`
reçoit `natif/lecteur` (`{ etat: lecture | position | fin | ferme | erreur | repli, moteur, position, duree, url }`).

## Côté labo : ne plus masquer ce que l'iPhone lit (Stremio)

Dans l'app, `window.jOSPlayer.natif` dit ce que le lecteur de l'iPhone lit (posé avant le montage du ploxion) :
`{ lecteur: 'ploxi0n', apple, vlc, son: ['aac','mp3','ac3','eac3','flac','alac', + 'dts','truehd','opus','vorbis' avec VLC], conteneurs: [...], video: [...] }`.
Stremio masque aujourd'hui les flux AC3/DTS par une regex (`var compatOnly = true`) et pénalise HEVC et MKV. Proposition (app.js du ploxion) :

```js
var N = window.jOSPlayer && window.jOSPlayer.natif;           // dans ploxi0n
var compatOnly = !N;                                           // l'iPhone lit l'AC3 (et le DTS avec VLC) : on montre tout
// analyze() : badA seulement pour (dts|truehd) quand N && !N.vlc ; plus de −2 pour HEVC (Apple le lit), ni pour mkv quand N.vlc
```

## Côté labo : la musique de l'UI du labo (mode ⬡ xerboxion)

L'iframe du labo est d'une autre origine : l'app ne voit pas son son. Le xer (avec `?app=ploxi0n`) peut relayer ce qui joue :
`parent.postMessage({ ploxi0n: 'lecture', titre, artiste, image, enLecture, duree, position }, '*')` (un `titre` vide = fini) ; l'app répond
aux commandes de l'écran verrouillé par `postMessage({ ploxi0n: 'commande', c: 'toggle' | 'play' | 'pause' | 'suivant' | 'precedent' | 'seekto' })`.
Le plus simple : relayer le bus `ploxion.spotify.track` et la source `jOSSound` qui joue.

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
// dans l'app, jOSPlayer.play / jOSNatif.lecteur.ouvrir font déjà le travail
```

Si ploxi0n n'est pas installé, iOS ne fait rien : garder « Ouvrir » (le lecteur web) à côté.
