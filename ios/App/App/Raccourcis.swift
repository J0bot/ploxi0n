// Les RACCOURCIS AUTOMATIQUES de ploxi0n (App Intents, 11.10.2026) : les actions de l'app apparaissent toutes seules dans l'app Raccourcis,
// dans Siri, Spotlight et le bouton Action, et se mettent dans des automatisations (heure, lieu, NFC…), sans rien installer.
//   Ouvrir un ploxion   la liste vient des ploxions installés (écrite par l'app : CapacitorStorage.ploxi0n.ploxions)
//   Noter un tsoin      sans ouvrir l'app : rangé dans CapacitorStorage.ploxi0n.tsoins-en-attente, versé dans boxion_local au prochain lancement
//   Ouvrir ploxi0n
//   (0.9, RS-7 : « pouvoir ajouter des options en plus dans Raccourcis »)
//   Envoyer à un ploxion  un port + un texte → le ploxion s'ouvre et le reçoit sur le bus (jOSPorts « ploxion.<id>.<port> ») : piloter n'importe
//                         quel ploxion depuis une automatisation (heure, lieu, NFC, bouton Action)
//   Lire une valeur       sans ouvrir l'app : les valeurs que l'app publie (CapacitorStorage.ploxi0n.valeurs : tsoins du jour, heures, mode…,
//                         et celles des ploxions via jOSRaccourcis.publierValeur) ; les widgets liront les mêmes
//   Chercher un ploxion   ouvre le marketplace sur la recherche
// L'app et ces intents se parlent par UserDefaults.standard, avec le préfixe du plugin Préférences de Capacitor.
import AppIntents
import Foundation
import UIKit
import Capacitor

private let PREFIXE = "CapacitorStorage."
private func lire(_ cle: String) -> String? { UserDefaults.standard.string(forKey: PREFIXE + cle) }
private func ecrire(_ cle: String, _ valeur: String) { UserDefaults.standard.set(valeur, forKey: PREFIXE + cle) }

@available(iOS 16.0, *)
struct PloxionEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Ploxion"
    static var defaultQuery = PloxionQuery()
    var id: String
    var nom: String
    var icone: String
    var syn: [String] = []   // (0.99.44) nos mots et leurs déformations (src/natif/vocabulaire.js, synonymes) : Siri reconnaît « mappion », « map ion »…
    var displayRepresentation: DisplayRepresentation {
        // les synonymes : iOS 17 et plus (l'app va jusqu'à iOS 15 : en dessous, le nom seul, comme avant la 0.99.44)
        if #available(iOS 17.0, *) {
            return DisplayRepresentation(title: "\(nom)", subtitle: "\(icone) ploxion", synonyms: syn.map { LocalizedStringResource(stringLiteral: $0) })
        }
        return DisplayRepresentation(title: "\(nom)", subtitle: "\(icone) ploxion")
    }
}

@available(iOS 16.0, *)
struct PloxionQuery: EntityQuery {
    func tous() -> [PloxionEntity] {
        guard let s = lire("ploxi0n.ploxions"), let d = s.data(using: .utf8),
              let l = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] else { return [] }
        return l.compactMap { p in
            guard let id = p["id"] as? String else { return nil }
            return PloxionEntity(id: id, nom: (p["nom"] as? String) ?? id, icone: (p["icone"] as? String) ?? "▣", syn: Array(((p["syn"] as? [String]) ?? []).prefix(16)))
        }
    }
    func entities(for identifiers: [String]) async throws -> [PloxionEntity] { tous().filter { identifiers.contains($0.id) } }
    func suggestedEntities() async throws -> [PloxionEntity] { tous() }
}

@available(iOS 16.0, *)
struct OuvrirPloxion: AppIntent {
    static var title: LocalizedStringResource = "Ouvrir un ploxion"
    static var description = IntentDescription("Ouvre un ploxion dans ploxi0n.")
    static var openAppWhenRun: Bool = true
    @Parameter(title: "Ploxion") var ploxion: PloxionEntity
    @MainActor func perform() async throws -> some IntentResult {
        ecrire("ploxi0n.ouvrir", ploxion.id)
        return .result()
    }
}

@available(iOS 16.0, *)
struct NoterTsoin: AppIntent {
    static var title: LocalizedStringResource = "Noter un tsoin"
    static var description = IntentDescription("Ajoute un tsoin à ton journal ploxi0n, sans ouvrir l'app.")
    static var openAppWhenRun: Bool = false
    @Parameter(title: "Texte") var texte: String
    func perform() async throws -> some IntentResult & ProvidesDialog {
        var l: [[String: Any]] = []
        if let s = lire("ploxi0n.tsoins-en-attente"), let d = s.data(using: .utf8),
           let x = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] { l = x }
        l.append(["k": "raccourci", "d": texte, "t": Int(Date().timeIntervalSince1970 * 1000)])
        if let d = try? JSONSerialization.data(withJSONObject: l), let s = String(data: d, encoding: .utf8) { ecrire("ploxi0n.tsoins-en-attente", s) }
        return .result(dialog: "Tsoin noté.")
    }
}

@available(iOS 16.0, *)
struct EnvoyerAPloxion: AppIntent {
    static var title: LocalizedStringResource = "Envoyer à un ploxion"
    static var description = IntentDescription("Ouvre un ploxion et lui envoie un texte sur un port (le bus du xerboxion).")
    static var openAppWhenRun: Bool = true
    @Parameter(title: "Ploxion") var ploxion: PloxionEntity
    @Parameter(title: "Port", default: "cmd") var port: String
    @Parameter(title: "Texte", default: "") var texte: String
    @MainActor func perform() async throws -> some IntentResult {
        let m: [String: Any] = ["id": ploxion.id, "port": port, "payload": texte, "t": Int(Date().timeIntervalSince1970 * 1000)]
        if let d = try? JSONSerialization.data(withJSONObject: m), let s = String(data: d, encoding: .utf8) { ecrire("ploxi0n.envoyer", s) }
        return .result()
    }
}

@available(iOS 16.0, *)
struct ValeurEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Valeur ploxi0n"
    static var defaultQuery = ValeurQuery()
    var id: String
    var titre: String
    var valeur: String
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(titre)") }
}

@available(iOS 16.0, *)
struct ValeurQuery: EntityQuery {
    func toutes() -> [ValeurEntity] {
        guard let s = lire("ploxi0n.valeurs"), let d = s.data(using: .utf8),
              let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else { return [] }
        return o.keys.sorted().compactMap { k in
            guard let v = o[k] as? [String: Any] else { return nil }
            return ValeurEntity(id: k, titre: (v["titre"] as? String) ?? k, valeur: (v["valeur"] as? String) ?? "")
        }
    }
    func entities(for identifiers: [String]) async throws -> [ValeurEntity] { toutes().filter { identifiers.contains($0.id) } }
    func suggestedEntities() async throws -> [ValeurEntity] { toutes() }
}

@available(iOS 16.0, *)
struct LireValeur: AppIntent {
    static var title: LocalizedStringResource = "Lire une valeur de ploxi0n"
    static var description = IntentDescription("Rend une valeur publiée par ploxi0n ou un de ses ploxions, sans ouvrir l'app.")
    static var openAppWhenRun: Bool = false
    @Parameter(title: "Valeur") var valeur: ValeurEntity
    func perform() async throws -> some IntentResult & ReturnsValue<String> & ProvidesDialog {
        let v = ValeurQuery().toutes().first { $0.id == valeur.id }?.valeur ?? valeur.valeur
        return .result(value: v, dialog: "\(valeur.titre) : \(v)")
    }
}

@available(iOS 16.0, *)
struct ChercherPloxion: AppIntent {
    static var title: LocalizedStringResource = "Chercher un ploxion"
    static var description = IntentDescription("Ouvre le marketplace de ploxi0n sur une recherche.")
    static var openAppWhenRun: Bool = true
    @Parameter(title: "Recherche", default: "") var texte: String
    @MainActor func perform() async throws -> some IntentResult {
        ecrire("ploxi0n.chercher", texte.isEmpty ? " " : texte)
        return .result()
    }
}

@available(iOS 16.0, *)
struct CommandePloxi0n: AppIntent {
    // « Dis à ploxi0n … » (12.10) : Siri demande la commande, on la dicte ; l'app l'exécute (ouvre X, cherche X, note X, accueil…)
    static var title: LocalizedStringResource = "Dire à ploxi0n"
    static var description = IntentDescription("Une phrase pour ploxi0n : « ouvre stremio », « cherche météo », « note … », « accueil ».")
    static var openAppWhenRun: Bool = true
    @Parameter(title: "Commande") var commande: String
    @MainActor func perform() async throws -> some IntentResult {
        ecrire("ploxi0n.commande", commande)
        return .result()
    }
}

@available(iOS 16.0, *)
struct OuvrirPloxi0n: AppIntent {
    static var title: LocalizedStringResource = "Ouvrir ploxi0n"
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult { .result() }
}

@available(iOS 16.0, *)
struct RaccourcisPloxi0n: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: OuvrirPloxion(), phrases: ["Ouvre \(\.$ploxion) dans \(.applicationName)", "Ouvre \(\.$ploxion) avec \(.applicationName)", "Open \(\.$ploxion) in \(.applicationName)", "Open \(\.$ploxion) with \(.applicationName)", "Launch \(\.$ploxion) in \(.applicationName)",
                    // (0.99.44, RS-7 : « ouvre le ploxion mappion », et en anglais) ; « ploxion » et « xerboxion » sont aussi des noms de l'app (INAlternativeAppNames)
                    "Open the ploxion \(\.$ploxion) in \(.applicationName)", "Open the \(\.$ploxion) ploxion in \(.applicationName)", "Show \(\.$ploxion) in \(.applicationName)", "Go to \(\.$ploxion) in \(.applicationName)", "\(.applicationName) open \(\.$ploxion)", "\(.applicationName) \(\.$ploxion)",
                    "Ouvre le ploxion \(\.$ploxion) dans \(.applicationName)", "Va dans \(\.$ploxion) sur \(.applicationName)", "\(.applicationName) ouvre \(\.$ploxion)"],
                    shortTitle: "Ouvrir un ploxion", systemImageName: "square.grid.2x2")
        AppShortcut(intent: NoterTsoin(), phrases: ["Note un tsoin dans \(.applicationName)", "Note a tsoin in \(.applicationName)", "New tsoin in \(.applicationName)", "Add a tsoin to \(.applicationName)"], shortTitle: "Noter un tsoin", systemImageName: "hourglass")
        AppShortcut(intent: CommandePloxi0n(), phrases: ["Dis à \(.applicationName)", "Demande à \(.applicationName)", "\(.applicationName) commande", "Tell \(.applicationName)", "Ask \(.applicationName)", "Talk to \(.applicationName)", "Hey \(.applicationName)"], shortTitle: "Dire à ploxi0n", systemImageName: "waveform")
        AppShortcut(intent: LireValeur(), phrases: ["Lis une valeur de \(.applicationName)", "Que dit \(.applicationName)", "Read a value from \(.applicationName)", "What does \(.applicationName) say"], shortTitle: "Lire une valeur", systemImageName: "text.bubble")
        AppShortcut(intent: ChercherPloxion(), phrases: ["Cherche un ploxion dans \(.applicationName)", "Search \(.applicationName)", "Find a ploxion in \(.applicationName)"], shortTitle: "Chercher un ploxion", systemImageName: "magnifyingglass")
        AppShortcut(intent: OuvrirPloxi0n(), phrases: ["Ouvre \(.applicationName)", "Open \(.applicationName)"], shortTitle: "Ouvrir ploxi0n", systemImageName: "diamond")
    }
}

// 🎛 (0.99.58) les boutons du Centre de contrôle (PloxionWidgets.swift : le même type, au caractère près). openAppWhenRun : iOS ouvre l'app et
// exécute CETTE copie, ici ; le lien passe par le pont de Capacitor comme un vrai lien ploxi0n:// (appUrlOpen ; au démarrage à froid, le pont
// le garde, ApplicationDelegateProxy.lastURL, jusqu'à ce que la page écoute).
@available(iOS 16.0, *)
struct OuvrirLienPloxi0n: AppIntent {
    static var title: LocalizedStringResource = "Ouvrir ploxi0n"
    static var openAppWhenRun: Bool = true
    static var isDiscoverable: Bool = false
    @Parameter(title: "Lien") var lien: String
    init() {}
    init(_ lien: String) { self.lien = lien }
    @MainActor func perform() async throws -> some IntentResult {
        if let u = URL(string: lien), u.scheme == "ploxi0n" {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: u, options: [:])
        }
        return .result()
    }
}
