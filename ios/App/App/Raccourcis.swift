// Les RACCOURCIS AUTOMATIQUES de ploxi0n (App Intents, 11.10.2026) : les actions de l'app apparaissent toutes seules dans l'app Raccourcis,
// dans Siri, Spotlight et le bouton Action, et se mettent dans des automatisations (heure, lieu, NFC…), sans rien installer.
//   Ouvrir un ploxion   la liste vient des ploxions installés (écrite par l'app : CapacitorStorage.ploxi0n.ploxions)
//   Noter un tsoin      sans ouvrir l'app : rangé dans CapacitorStorage.ploxi0n.tsoins-en-attente, versé dans boxion_local au prochain lancement
//   Ouvrir ploxi0n
// L'app et ces intents se parlent par UserDefaults.standard, avec le préfixe du plugin Préférences de Capacitor.
import AppIntents
import Foundation

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
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(icone) \(nom)") }
}

@available(iOS 16.0, *)
struct PloxionQuery: EntityQuery {
    func tous() -> [PloxionEntity] {
        guard let s = lire("ploxi0n.ploxions"), let d = s.data(using: .utf8),
              let l = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] else { return [] }
        return l.compactMap { p in
            guard let id = p["id"] as? String else { return nil }
            return PloxionEntity(id: id, nom: (p["nom"] as? String) ?? id, icone: (p["icone"] as? String) ?? "▣")
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
struct OuvrirPloxi0n: AppIntent {
    static var title: LocalizedStringResource = "Ouvrir ploxi0n"
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult { .result() }
}

@available(iOS 16.0, *)
struct RaccourcisPloxi0n: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: OuvrirPloxion(), phrases: ["Ouvre \(\.$ploxion) dans \(.applicationName)", "Ouvre \(\.$ploxion) avec \(.applicationName)"],
                    shortTitle: "Ouvrir un ploxion", systemImageName: "square.grid.2x2")
        AppShortcut(intent: NoterTsoin(), phrases: ["Note un tsoin dans \(.applicationName)"], shortTitle: "Noter un tsoin", systemImageName: "hourglass")
        AppShortcut(intent: OuvrirPloxi0n(), phrases: ["Ouvre \(.applicationName)"], shortTitle: "Ouvrir ploxi0n", systemImageName: "diamond")
    }
}
