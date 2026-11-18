# Les contacts du xerboxion, et le partage au rang xerboxion

*14.11.2026, ploxi0n 0.99.64. RS-7 : « envoyer un message à un contact sur ploxion (depuis la feuille de partage d'iOS) ; dans le profil, ajouter
tous ses contacts sur le xerboxion, puis les lier avec des zions ou des xerions ; un ploxion contacts pour tous les contacts de toutes les
plateformes (Contacts, Messages, e-mail, Instagram, Discord, WhatsApp, Signal, Telegram) : tout ce qui est possible d'importer, on l'importe,
parce que les ploxions doivent servir à importer le téléphone en entier, pour n'avoir besoin que du xerboxion » ; « pour le partage, le rang
xerboxion des amis peut voir son coord ou le mien pour y écrire ; je peux choisir de montrer des ploxions à moi avec mes données (partagés), ou
garder seulement mes propres données ». Statut : plan, rien n'est construit.*

## 1. Ce qu'on peut vraiment importer (sans contourner personne)

| source | comment | ce qu'on obtient |
|---|---|---|
| **Contacts d'iOS** | l'API Contacts (CNContactStore), avec la permission ; un plugin natif à ajouter | noms, numéros, e-mails, adresses, anniversaires, photos, **et les profils sociaux que la fiche contient déjà** (Instagram, Telegram, WhatsApp… quand ils y ont été mis) |
| **Fichiers vCard (.vcf)** | n'importe quelle app les exporte (Contacts, Google, Outlook, Proton) ; la feuille de partage les donne à ploxi0n | les mêmes champs |
| **Google** | Google Takeout (contacts en .vcf ou .csv) | idem |
| **Instagram, Facebook** | « Télécharger tes informations » (JSON) : abonnés, abonnements | des pseudos, sans numéro |
| **Telegram** | l'export de Telegram Desktop (result.json, section contacts) | noms et numéros |
| **Discord** | le paquet de données (relations / amis) | des pseudos |
| **E-mail** | les correspondants viennent surtout des Contacts ; un export de la messagerie au besoin | adresses |
| **WhatsApp, Signal, Messages d'Apple** | **aucun export de contacts possible** : leurs contacts SONT ceux du téléphone (donc déjà là par les Contacts d'iOS) ; leurs messages ne sont pas lisibles par une autre app | rien de plus que les Contacts |

Aucune app ne peut lire les contacts ou les messages d'une autre app sur iOS : on ne passe que par ce que la personne exporte elle-même, ou
par les Contacts d'iOS. Ne pas nuire : tout reste sur le téléphone (boxion_local), rien ne part au labo sans un geste ; les contacts des
autres ne deviennent jamais des données partagées.

## 2. Le ploxion Contacts (à construire, dans l'ordre)

1. **Importer** : les Contacts d'iOS (le plugin natif), puis les .vcf, puis les exports JSON (Instagram, Telegram, Discord) ; une fiche par
   personne, **fusionnée** (même numéro, même e-mail, même pseudo → une seule fiche, ses sources gardées).
2. **Lier** : chaque fiche se lie à un compte du xerboxion (un xerion : `RS-3`, ou un pseudo du labo), à une clé de Proche (un pote ✦ du
   maillage), à des zions (des groupes, des lieux). Le lien se propose quand un numéro ou un e-mail correspond à un compte qui l'a rendu
   trouvable (opt-in de l'autre côté, jamais deviné).
3. **Écrire** : depuis une fiche, le meilleur chemin : le maillage (Proche) s'il est autour, le social du labo s'il est lié, sinon iMessage,
   WhatsApp, Signal, Telegram, e-mail par leurs liens (`sms:`, `https://wa.me/`, `sgnl://`, `tg://`, `mailto:`), qui ouvrent l'autre app.
4. **Le profil** : « mes contacts dans le xerboxion » : combien sont liés, à quels zions.

## 3. Envoyer à un contact depuis la feuille de partage d'iOS

Ta capture : la rangée de personnes en haut de la feuille de partage. Pour que des contacts du xerboxion y apparaissent, avec ploxi0n en
petit, il faut :

- une **extension de partage** (Share Extension), une nouvelle cible iOS (comme les widgets : ajoutée par fastlane, derrière une option de build) ;
- que l'app **donne** à iOS les conversations qu'elle a (`INSendMessageIntent`, comme les notifications de communication de la 0.99.45) :
  iOS apprend avec qui tu parles par ploxi0n et propose ces personnes en haut de la feuille ;
- l'extension reçoit le contenu (un texte, un lien, une image) et le pose dans ploxi0n (App Group), qui l'envoie par le bon chemin (§ 2.3).

## 4. Le partage au rang xerboxion

Les rangs d'amis existent au labo ; le rang **xerboxion** est le plus haut avant **xeroction** (là, tout est partagé). Proposition :

- **Le coord** : un ami au rang xerboxion peut **lire** ton coord, ou **écrire** dans le tien, selon ce que tu choisis pour lui. Chacun a son
  coord ; le tien est au labo, gardé par ton compte ; le labo vérifie le rang à chaque lecture et à chaque écriture (pas l'app).
- **Les ploxions partagés** : sur chaque ploxion, un choix : « à moi seul » (mes données restent les miennes, par défaut) ou « partagé avec
  le rang xerboxion » (mes données de ce ploxion deviennent visibles, et modifiables si je le permets, par ces amis). Le choix se voit sur
  l'icône du ploxion.
- **Xeroction** : tout partagé, en entier ; un réglage à part, jamais par défaut, qui se coupe d'un geste.

## 5. Ce qu'il faut décider (RS-7, avec xerxion1 pour le labo)

1. L'ordre : d'abord le ploxion Contacts (import iOS + vCard), ou d'abord l'extension de partage ?
2. Le plugin natif des Contacts : un plugin de la communauté Capacitor, ou un petit plugin maison (`PloxiContacts`, lecture seule) ? Le
   second est plus sûr ici (Swift minimal, relu ligne par ligne).
3. Au labo : la route « trouver un compte par un numéro ou un e-mail haché » (opt-in), les droits par rang sur le coord et sur les données
   d'un ploxion : xerxion1 ?
