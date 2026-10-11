// Les WIDGETS de ploxi0n (RS-7 11.10.2026 : « je veux des widgets ploxion »). Une extension WidgetKit, ajoutée au projet par la CI
// (fastlane, ajouter_widgets ; interrupteur PLOXI0N_WIDGETS). Elle ne lit que l'App Group group.ch.j0bot.ploxi0n, que l'app remplit
// (AppDelegate : copie des Préférences ploxi0n.epingles et ploxi0n.valeurs, puis WidgetCenter.reloadAllTimelines) :
//   📌 Ploxions épinglés   les ploxions épinglés du HUD (⚙ → HUD), chacun ouvre ploxi0n://px/<id>
//   ◇ ploxi0n              une valeur : les tsoins du jour, le dernier tsoin, le compte ; aussi sur l'écran verrouillé
// Aucune minuterie : la timeline ne se rafraîchit que quand l'app publie (policy .never).
import WidgetKit
import SwiftUI

private let GROUPE = "group.ch.j0bot.ploxi0n"
private func lireJSON(_ cle: String) -> Any? {
    guard let s = UserDefaults(suiteName: GROUPE)?.string(forKey: cle), let d = s.data(using: .utf8) else { return nil }
    return try? JSONSerialization.jsonObject(with: d)
}

struct Px: Identifiable { let id: String; let nom: String; let icone: String }
struct Valeur: Identifiable { let id: String; let titre: String; let valeur: String }
struct Entree: TimelineEntry { let date: Date; let ploxions: [Px]; let valeurs: [Valeur] }

struct Fournisseur: TimelineProvider {
    func lire() -> Entree {
        let l = (lireJSON("ploxi0n.epingles") as? [[String: Any]] ?? []).compactMap { p -> Px? in
            guard let id = p["id"] as? String else { return nil }
            return Px(id: id, nom: (p["nom"] as? String) ?? id, icone: (p["icone"] as? String) ?? "▣")
        }
        let o = lireJSON("ploxi0n.valeurs") as? [String: Any] ?? [:]
        let v = ["tsoins-jour", "dernier-tsoin", "compte"].compactMap { k -> Valeur? in
            guard let x = o[k] as? [String: Any] else { return nil }
            return Valeur(id: k, titre: (x["titre"] as? String) ?? k, valeur: (x["valeur"] as? String) ?? "")
        }
        return Entree(date: Date(), ploxions: l, valeurs: v)
    }
    func placeholder(in context: Context) -> Entree {
        Entree(date: Date(), ploxions: [Px(id: "bother", nom: "bother me", icone: "🐛")], valeurs: [Valeur(id: "tsoins-jour", titre: "Tsoins aujourd'hui", valeur: "3")])
    }
    func getSnapshot(in context: Context, completion: @escaping (Entree) -> Void) { completion(context.isPreview ? placeholder(in: context) : lire()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entree>) -> Void) { completion(Timeline(entries: [lire()], policy: .never)) }
}

private let FOND = LinearGradient(colors: [Color(red: 0.09, green: 0.20, blue: 0.29), Color(red: 0.03, green: 0.04, blue: 0.08)], startPoint: .topLeading, endPoint: .bottomTrailing)
private let ACCENT = Color(red: 0.25, green: 0.88, blue: 0.82)

struct VuePloxions: View {
    @Environment(\.widgetFamily) var famille
    let e: Entree
    var body: some View {
        if e.ploxions.isEmpty {
            VStack(alignment: .leading, spacing: 4) {
                Text("📌 ploxi0n").font(.headline).foregroundColor(.white)
                Text("Épingle des ploxions : ⚙ réglages → HUD").font(.caption).foregroundColor(.white.opacity(0.7))
            }.widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        } else if famille == .systemSmall {
            // un petit widget ne connaît qu'un seul geste : le premier épinglé, en grand ; les autres en dessous
            VStack(spacing: 6) {
                Text(e.ploxions[0].icone).font(.system(size: 44))
                Text(e.ploxions[0].nom).font(.caption).foregroundColor(.white).lineLimit(1)
                HStack(spacing: 6) { ForEach(e.ploxions.dropFirst().prefix(3)) { p in Text(p.icone).font(.system(size: 16)) } }
            }.widgetURL(URL(string: "ploxi0n://px/" + e.ploxions[0].id))
        } else {
            HStack(spacing: 10) {
                ForEach(e.ploxions.prefix(4)) { p in
                    Link(destination: URL(string: "ploxi0n://px/" + p.id) ?? URL(string: "ploxi0n://")!) {
                        VStack(spacing: 4) {
                            Text(p.icone).font(.system(size: 34)).frame(width: 58, height: 58).background(Color.white.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius: 14))
                            Text(p.nom).font(.caption2).foregroundColor(.white.opacity(0.85)).lineLimit(1)
                        }.frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
}

struct VueValeurs: View {
    @Environment(\.widgetFamily) var famille
    let e: Entree
    var body: some View {
        switch famille {
        case .accessoryInline:
            Text("◇ " + (e.valeurs.first.map { $0.titre + " : " + $0.valeur } ?? "ploxi0n"))
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("◇ ploxi0n").font(.headline)
                ForEach(e.valeurs.prefix(2)) { v in Text(v.titre + " : " + v.valeur).font(.caption).lineLimit(1) }
            }
        default:
            VStack(alignment: .leading, spacing: 6) {
                Text("◇ ploxi0n").font(.caption).foregroundColor(ACCENT)
                if let t = e.valeurs.first { Text(t.valeur).font(.system(size: 34, weight: .bold)).foregroundColor(.white); Text(t.titre).font(.caption2).foregroundColor(.white.opacity(0.7)) }
                ForEach(e.valeurs.dropFirst().prefix(famille == .systemSmall ? 1 : 2)) { v in Text(v.titre + " : " + v.valeur).font(.caption2).foregroundColor(.white.opacity(0.85)).lineLimit(2) }
                Spacer(minLength: 0)
            }.frame(maxWidth: .infinity, alignment: .leading).widgetURL(URL(string: "ploxi0n://"))
        }
    }
}

struct WidgetPloxions: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ploxions", provider: Fournisseur()) { e in
            VuePloxions(e: e).containerBackground(for: .widget) { FOND }
        }
        .configurationDisplayName("Ploxions épinglés")
        .description("Les ploxions de ton HUD, d'un geste.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WidgetValeurs: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "valeurs", provider: Fournisseur()) { e in
            VueValeurs(e: e).containerBackground(for: .widget) { FOND }
        }
        .configurationDisplayName("ploxi0n")
        .description("Tes tsoins du jour, le dernier tsoin, ton compte.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}

@main
struct PloxionWidgets: WidgetBundle {
    var body: some Widget {
        WidgetPloxions()
        WidgetValeurs()
    }
}
