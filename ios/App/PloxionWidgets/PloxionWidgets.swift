// Les WIDGETS de ploxi0n (RS-7 11.10.2026 : « je veux des widgets ploxion »). Une extension WidgetKit, ajoutée au projet par la CI
// (fastlane, ajouter_widgets ; interrupteur PLOXI0N_WIDGETS). Elle ne lit que l'App Group group.ch.j0bot.ploxi0n, que l'app remplit
// (AppDelegate : copie des Préférences ploxi0n.epingles et ploxi0n.valeurs, puis WidgetCenter.reloadAllTimelines) :
//   📌 Ploxions épinglés   les ploxions épinglés du HUD (⚙ → HUD), chacun ouvre ploxi0n://px/<id>
//   ◇ ploxi0n              une valeur : les tsoins du jour, le dernier tsoin, le compte ; aussi sur l'écran verrouillé
//   ◈ Cube (0.48)          six infos des bions (ploxi0n.cube) sur un cube penché comme le téléphone l'était ; ⟲ le tourne (iOS 17),
//                          et il tourne de lui-même toutes les 20 min. Le gyroscope EN DIRECT est impossible ici (ni capteurs ni
//                          animation continue pour un widget) : l'aperçu de l'app (⚙ › Widgets) le fait.
//   ♫ À l'écoute (0.48)    ce que jouent les ploxions (ploxi0n.lecture + la pochette lecture.jpg, copiées par l'app), ⏮ ⏯ ⏭
// Sinon aucune minuterie : la timeline ne se rafraîchit que quand l'app publie (policy .never).
import WidgetKit
import SwiftUI
import UIKit
import AppIntents

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
        let v = ["musique", "tsoins-jour", "dernier-tsoin", "pas", "compte"].compactMap { k -> Valeur? in
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

// ---- ◈ LE CUBE DES BIONS ------------------------------------------------------------------------------------------------------------------
struct Face: Identifiable { let id: Int; let g: String; let t: String; let v: String }
struct CubeEntree: TimelineEntry { let date: Date; let faces: [Face]; let tour: Int; let ix: Double; let iy: Double }

/** ⟲ : tourne le cube d'un cran (dans l'extension, sans ouvrir l'app) ; le widget se redessine tout seul après */
struct TournerCube: AppIntent {
    static var title: LocalizedStringResource = "Tourner le cube"
    func perform() async throws -> some IntentResult {
        let d = UserDefaults(suiteName: GROUPE)
        d?.set((d?.integer(forKey: "cube.rotation") ?? 0) + 1, forKey: "cube.rotation")
        return .result()
    }
}

struct FournisseurCube: TimelineProvider {
    func lire(decalage: Int, date: Date) -> CubeEntree {
        let o = lireJSON("ploxi0n.cube") as? [String: Any] ?? [:]
        let lues = (o["faces"] as? [[String: Any]] ?? []).enumerated().map { (i, f) in
            Face(id: i, g: (f["g"] as? String) ?? "◆", t: (f["t"] as? String) ?? "", v: (f["v"] as? String) ?? "—")
        }
        let faces = lues.count == 6 ? lues : (0..<6).map { Face(id: $0, g: "◇", t: "ploxi0n", v: "—") }
        let incl = o["incl"] as? [String: Any] ?? [:]
        let tour = (UserDefaults(suiteName: GROUPE)?.integer(forKey: "cube.rotation") ?? 0) + decalage
        return CubeEntree(date: date, faces: faces, tour: tour, ix: (incl["x"] as? Double) ?? 0, iy: (incl["y"] as? Double) ?? 0)
    }
    func placeholder(in context: Context) -> CubeEntree {
        CubeEntree(date: Date(), faces: [Face(id: 0, g: "⧗", t: "tsoins", v: "3"), Face(id: 1, g: "♫", t: "à l'écoute", v: "Keep It Psychedelic"), Face(id: 2, g: "👣", t: "pas", v: "4 200"),
                                         Face(id: 3, g: "▣", t: "ploxions", v: "130"), Face(id: 4, g: "◇", t: "compte", v: "josion"), Face(id: 5, g: "✎", t: "dernier", v: "—")], tour: 0, ix: 0.3, iy: 0.1)
    }
    func getSnapshot(in context: Context, completion: @escaping (CubeEntree) -> Void) { completion(context.isPreview ? placeholder(in: context) : lire(decalage: 0, date: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<CubeEntree>) -> Void) {
        // il tourne de lui-même : un cran toutes les 20 minutes pendant 3 heures, puis on recommence
        let maintenant = Date()
        let entrees = (0..<9).map { k in lire(decalage: k, date: maintenant.addingTimeInterval(Double(k) * 1200)) }
        completion(Timeline(entries: entrees, policy: .atEnd))
    }
}

private func polygone(_ pts: [CGPoint]) -> Path {
    var p = Path()
    guard let premier = pts.first else { return p }
    p.move(to: premier)
    for q in pts.dropFirst() { p.addLine(to: q) }
    p.closeSubpath()
    return p
}
private func centre(_ pts: [CGPoint]) -> CGPoint {
    let n = CGFloat(max(pts.count, 1))
    return CGPoint(x: pts.map { $0.x }.reduce(0, +) / n, y: pts.map { $0.y }.reduce(0, +) / n)
}

struct VueEtiquette: View {
    let f: Face
    let petit: Bool
    var body: some View {
        VStack(spacing: 0) {
            Text(f.g).font(.system(size: petit ? 13 : 16))
            Text(f.v).font(.system(size: petit ? 10 : 12, weight: .bold)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.5)
        }.frame(width: petit ? 46 : 58)
    }
}

/** un cube isométrique : le dessus, la gauche, la droite ; penché comme le téléphone l'était (ix, iy) */
struct DessinCube: View {
    let e: CubeEntree
    var body: some View {
        GeometryReader { geo in
            let w = min(geo.size.width, geo.size.height)
            let s = w * 0.34
            let cx = geo.size.width / 2
            let cy = geo.size.height / 2 - w * 0.02
            let dx = CGFloat(max(-1, min(1, e.ix))) * s * 0.22
            let h = s * (0.56 + CGFloat(max(-1, min(1, e.iy))) * 0.14)
            let arete = s * 1.05
            let t0 = CGPoint(x: cx - dx, y: cy - h * 2 + arete * 0.45)
            let t1 = CGPoint(x: cx + s, y: cy - h + arete * 0.45)
            let t2 = CGPoint(x: cx + dx, y: cy + arete * 0.45)
            let t3 = CGPoint(x: cx - s, y: cy - h + arete * 0.45)
            let b1 = CGPoint(x: t1.x, y: t1.y + arete)
            let b2 = CGPoint(x: t2.x, y: t2.y + arete)
            let b3 = CGPoint(x: t3.x, y: t3.y + arete)
            let dessus = [t0, t1, t2, t3], gauche = [t3, t2, b2, b3], droite = [t2, t1, b1, b2]
            let n = e.faces.count
            let fd = e.faces[((e.tour % n) + n) % n], fg = e.faces[(((e.tour + 1) % n) + n) % n], fr = e.faces[(((e.tour + 2) % n) + n) % n]
            ZStack {
                polygone(gauche).fill(Color(red: 0.10, green: 0.08, blue: 0.16))
                polygone(droite).fill(Color(red: 0.06, green: 0.05, blue: 0.10))
                polygone(dessus).fill(Color(red: 0.16, green: 0.13, blue: 0.24))
                polygone(gauche).stroke(Color.white.opacity(0.14), lineWidth: 1.5)
                polygone(droite).stroke(Color.white.opacity(0.10), lineWidth: 1.5)
                polygone(dessus).stroke(ACCENT.opacity(0.75), lineWidth: 1.5)
                Group {
                    VueEtiquette(f: fd, petit: w < 150).position(centre(dessus))
                    VueEtiquette(f: fg, petit: w < 150).position(centre(gauche))
                    VueEtiquette(f: fr, petit: w < 150).position(centre(droite))
                }.id(e.tour).transition(.push(from: .trailing))
            }
        }
    }
}

struct VueCube: View {
    @Environment(\.widgetFamily) var famille
    let e: CubeEntree
    var body: some View {
        if famille == .systemMedium {
            HStack(spacing: 12) {
                DessinCube(e: e).frame(maxWidth: .infinity)
                VStack(alignment: .leading, spacing: 3) {
                    ForEach(e.faces) { f in
                        HStack(spacing: 4) { Text(f.g).font(.caption2); Text(f.v).font(.caption2.bold()).foregroundColor(.white).lineLimit(1) }
                    }
                    Spacer(minLength: 0)
                    Button(intent: TournerCube()) { Label("tourner", systemImage: "arrow.triangle.2.circlepath").font(.caption2) }.tint(ACCENT)
                }.frame(maxWidth: .infinity, alignment: .leading)
            }.widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        } else {
            ZStack(alignment: .topTrailing) {
                DessinCube(e: e)
                Button(intent: TournerCube()) { Image(systemName: "arrow.triangle.2.circlepath").font(.caption).foregroundColor(ACCENT) }.buttonStyle(.plain)
            }.widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        }
    }
}

struct WidgetCube: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "cube", provider: FournisseurCube()) { e in
            VueCube(e: e).containerBackground(for: .widget) { FOND }
        }
        .configurationDisplayName("Cube")
        .description("Six infos de tes bions sur un cube ; ⟲ pour le tourner.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// ---- ♫ À L'ÉCOUTE -------------------------------------------------------------------------------------------------------------------------
struct LectureEntree: TimelineEntry { let date: Date; let titre: String; let artiste: String; let enLecture: Bool; let image: UIImage? }

struct FournisseurLecture: TimelineProvider {
    func lire() -> LectureEntree {
        guard let o = lireJSON("ploxi0n.lecture") as? [String: Any], let t = o["titre"] as? String, !t.isEmpty else {
            return LectureEntree(date: Date(), titre: "", artiste: "", enLecture: false, image: nil)
        }
        var img: UIImage? = nil
        if let adresse = o["image"] as? String, !adresse.isEmpty, UserDefaults(suiteName: GROUPE)?.string(forKey: "ploxi0n.lecture-pochette") == adresse,
           let dossier = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: GROUPE) {
            img = UIImage(contentsOfFile: dossier.appendingPathComponent("lecture.jpg").path)
        }
        return LectureEntree(date: Date(), titre: t, artiste: (o["artiste"] as? String) ?? "", enLecture: (o["enLecture"] as? Bool) ?? false, image: img)
    }
    func placeholder(in context: Context) -> LectureEntree { LectureEntree(date: Date(), titre: "Keep It Psychedelic", artiste: "GMS, Z-Cat", enLecture: true, image: nil) }
    func getSnapshot(in context: Context, completion: @escaping (LectureEntree) -> Void) { completion(context.isPreview ? placeholder(in: context) : lire()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<LectureEntree>) -> Void) { completion(Timeline(entries: [lire()], policy: .never)) }
}

struct VuePochette: View {
    let e: LectureEntree
    var body: some View {
        if let img = e.image { Image(uiImage: img).resizable().scaledToFill() }
        else { ZStack { Color.white.opacity(0.06); Text("♫").font(.system(size: 28)).foregroundColor(ACCENT) } }
    }
}

struct VueLecture: View {
    @Environment(\.widgetFamily) var famille
    let e: LectureEntree
    func bouton(_ symbole: String, _ commande: String) -> some View {
        Link(destination: URL(string: "ploxi0n://lecture/" + commande) ?? URL(string: "ploxi0n://")!) {
            Image(systemName: symbole).font(.system(size: 18, weight: .semibold)).foregroundColor(.white).frame(maxWidth: .infinity)
        }
    }
    var body: some View {
        if e.titre.isEmpty {
            VStack(alignment: .leading, spacing: 4) {
                Text("♫ à l'écoute").font(.caption).foregroundColor(ACCENT)
                Text("Rien ne joue").font(.headline).foregroundColor(.white)
                Text("Lance de la musique dans un ploxion (Spotify…)").font(.caption2).foregroundColor(.white.opacity(0.7))
            }.frame(maxWidth: .infinity, alignment: .leading)
        } else {
            switch famille {
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text((e.enLecture ? "♫ " : "⏸ ") + e.titre).font(.headline).lineLimit(1)
                    Text(e.artiste).font(.caption).lineLimit(1)
                }
            case .systemMedium:
                HStack(spacing: 12) {
                    VuePochette(e: e).frame(width: 110, height: 110).clipShape(RoundedRectangle(cornerRadius: 14))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(e.enLecture ? "♫ à l'écoute" : "⏸ en pause").font(.caption2).foregroundColor(ACCENT)
                        Text(e.titre).font(.headline).foregroundColor(.white).lineLimit(2)
                        Text(e.artiste).font(.caption).foregroundColor(.white.opacity(0.75)).lineLimit(1)
                        Spacer(minLength: 0)
                        HStack { bouton("backward.fill", "precedent"); bouton(e.enLecture ? "pause.fill" : "play.fill", "toggle"); bouton("forward.fill", "suivant") }
                    }
                }
            default:
                VStack(alignment: .leading, spacing: 4) {
                    VuePochette(e: e).frame(width: 64, height: 64).clipShape(RoundedRectangle(cornerRadius: 12))
                    Spacer(minLength: 0)
                    Text(e.titre).font(.caption.bold()).foregroundColor(.white).lineLimit(2)
                    Text(e.artiste).font(.caption2).foregroundColor(.white.opacity(0.75)).lineLimit(1)
                }.frame(maxWidth: .infinity, alignment: .leading).widgetURL(URL(string: "ploxi0n://lecture/ouvrir"))
            }
        }
    }
}

struct WidgetLecture: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "lecture", provider: FournisseurLecture()) { e in
            VueLecture(e: e).containerBackground(for: .widget) { FOND }
        }
        .configurationDisplayName("À l'écoute")
        .description("Ce que jouent tes ploxions, la pochette, ⏮ ⏯ ⏭.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

// ---- 🎛 LES CONTRÔLES (0.49, iOS 18 : Centre de contrôle, écran verrouillé, bouton Action) ---------------------------------------------------
// Chacun ouvre ploxi0n sur un geste (OpenURLIntent → ploxi0n://…, que l'app reçoit) : noter un tsoin, un vocal, la lampe, ploxi0n.
@available(iOS 18.0, *)
struct ControleTsoin: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "ch.j0bot.ploxi0n.controle.tsoin") {
            ControlWidgetButton(action: OpenURLIntent(URL(string: "ploxi0n://tsoin")!)) { Label("Noter un tsoin", systemImage: "hourglass") }
        }
        .displayName("Noter un tsoin")
        .description("ploxi0n s'ouvre sur le composeur de tsoins.")
    }
}
@available(iOS 18.0, *)
struct ControleVocal: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "ch.j0bot.ploxi0n.controle.vocal") {
            ControlWidgetButton(action: OpenURLIntent(URL(string: "ploxi0n://vocal")!)) { Label("Vocal ploxi0n", systemImage: "mic") }
        }
        .displayName("Vocal")
        .description("Un vocal, transcrit sur le téléphone.")
    }
}
@available(iOS 18.0, *)
struct ControleLampe: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "ch.j0bot.ploxi0n.controle.lampe") {
            ControlWidgetButton(action: OpenURLIntent(URL(string: "ploxi0n://lampe")!)) { Label("Lampe ploxi0n", systemImage: "flashlight.on.fill") }
        }
        .displayName("Lampe")
        .description("La lampe de poche, par ploxi0n.")
    }
}
@available(iOS 18.0, *)
struct ControlePloxi0n: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "ch.j0bot.ploxi0n.controle.ouvrir") {
            ControlWidgetButton(action: OpenURLIntent(URL(string: "ploxi0n://px/accueil")!)) { Label("ploxi0n", systemImage: "square.grid.2x2") }
        }
        .displayName("ploxi0n")
        .description("Tes ploxions.")
    }
}

@main
struct PloxionWidgets: WidgetBundle {
    var body: some Widget {
        WidgetPloxions()
        WidgetValeurs()
        WidgetCube()
        WidgetLecture()
        if #available(iOS 18.0, *) {
            ControleTsoin()
            ControleVocal()
            ControleLampe()
            ControlePloxi0n()
        }
    }
}
