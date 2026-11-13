// 🔔 LES NOTIFICATIONS RICHES (0.99.45 ; demandé par xerxion1 pour RS-7 : « l'avatar ou le glyphe dans les notifications, comme Snapchat »).
// Une Notification Service Extension (option de build PLOXI0N_NOTIFS ; la cible est ajoutée par fastlane, ajouter_notifs) : iOS lui passe
// chaque push qui porte « mutable-content: 1 » avant de l'afficher, elle a ~30 s pour l'enrichir.
//   (1) une PERSONNE (« expediteur »: { nom, avatar?, id? }) : une notification de communication (INSendMessageIntent + INPerson) :
//       l'avatar en grand, l'icône de l'app en coin. « groupe » (facultatif) : le nom de la conversation (coord · #topic).
//   (2) un PLOXION (« image »: une URL https vers un PNG, le glyphe rendu par le labo) : l'image jointe (UNNotificationAttachment).
// Tout le reste du push (ouvrir, params) passe tel quel à l'app. En cas de doute (pas d'URL https, trop gros, trop lent) : la notification
// d'origine, jamais rien de perdu. Swift jamais compilé ici : relu ligne par ligne. docs/PUSH.md.
import UserNotifications
import Intents
import Foundation

class NotificationService: UNNotificationServiceExtension {
    private var rendre: ((UNNotificationContent) -> Void)?
    private var origine: UNNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        rendre = contentHandler
        origine = request.content
        guard let c = request.content.mutableCopy() as? UNMutableNotificationContent else { contentHandler(request.content); return }
        let info = c.userInfo
        if let exp = info["expediteur"] as? [String: Any], let nom = exp["nom"] as? String, !nom.isEmpty {
            telecharger(exp["avatar"] as? String) { donnees in self.personne(c, nom: nom, id: exp["id"] as? String, avatar: donnees, groupe: info["groupe"] as? String) }
        } else if let lien = info["image"] as? String {
            telecharger(lien) { donnees in
                if let d = donnees, let piece = self.piece(d) { c.attachments = [piece] }
                self.finir(c)
            }
        } else { finir(c) }
    }

    override func serviceExtensionTimeWillExpire() {
        if let o = origine { finir(o) }   // trop lent : la notification d'origine
    }

    private func finir(_ c: UNNotificationContent) {
        guard let r = rendre else { return }
        rendre = nil   // une seule fois
        r(c)
    }

    /** une URL https, 2 Mo au plus, 8 s au plus ; nil sinon */
    private func telecharger(_ lien: String?, _ fini: @escaping (Data?) -> Void) {
        guard let l = lien, let u = URL(string: l), u.scheme == "https" else { fini(nil); return }
        var req = URLRequest(url: u); req.timeoutInterval = 8
        URLSession.shared.dataTask(with: req) { d, rep, err in
            let ok = err == nil && ((rep as? HTTPURLResponse)?.statusCode ?? 0) == 200 && (d?.count ?? 0) > 0 && (d?.count ?? 0) <= 2_000_000
            fini(ok ? d : nil)
        }.resume()
    }

    /** l'image en pièce jointe : un fichier temporaire (iOS le déplace), son extension d'après ses premiers octets */
    private func piece(_ d: Data) -> UNNotificationAttachment? {
        let ext = d.starts(with: [0x89, 0x50, 0x4E, 0x47]) ? "png" : (d.starts(with: [0xFF, 0xD8]) ? "jpg" : (d.starts(with: [0x47, 0x49, 0x46]) ? "gif" : ""))
        if ext.isEmpty { return nil }
        let f = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + "." + ext)
        do { try d.write(to: f); return try UNNotificationAttachment(identifier: "glyphe", url: f, options: nil) } catch { return nil }
    }

    /** une notification de communication : qui écrit (son nom, son avatar), la conversation */
    private func personne(_ c: UNMutableNotificationContent, nom: String, id: String?, avatar: Data?, groupe: String?) {
        let image = avatar.map { INImage(imageData: $0) }
        let qui = INPerson(personHandle: INPersonHandle(value: id ?? nom, type: .unknown), nameComponents: nil, displayName: nom,
                           image: image, contactIdentifier: nil, customIdentifier: id ?? nom)
        let intention = INSendMessageIntent(recipients: nil, outgoingMessageType: .outgoingMessageText, content: c.body,
                                            speakableGroupName: groupe.map { INSpeakableString(spokenPhrase: $0) },
                                            conversationIdentifier: c.threadIdentifier.isEmpty ? (id ?? nom) : c.threadIdentifier,
                                            serviceName: nil, sender: qui, attachments: nil)
        if let i = image { intention.setImage(i, forParameterNamed: \.sender) }
        let interaction = INInteraction(intent: intention, response: nil)
        interaction.direction = .incoming
        interaction.donate { _ in
            if let enrichi = try? c.updating(from: intention) { self.finir(enrichi) } else { self.finir(c) }
        }
    }
}
