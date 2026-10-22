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
import ActivityKit

private let GROUPE = "group.ch.j0bot.ploxi0n"
private func lireJSON(_ cle: String) -> Any? {
    guard let s = UserDefaults(suiteName: GROUPE)?.string(forKey: cle), let d = s.data(using: .utf8) else { return nil }
    return try? JSONSerialization.jsonObject(with: d)
}

struct Px: Identifiable { let id: String; let nom: String; let icone: String; var img: UIImage? = nil }
struct Valeur: Identifiable { let id: String; let titre: String; let valeur: String; var le: Date? = nil }
struct Entree: TimelineEntry { let date: Date; let ploxions: [Px]; let valeurs: [Valeur] }

struct Fournisseur: TimelineProvider {
    func lire() -> Entree {
        let l = (lireJSON("ploxi0n.epingles") as? [[String: Any]] ?? []).compactMap { p -> Px? in
            guard let id = p["id"] as? String else { return nil }
            // (0.72) le glyphe du ploxion (le trait du xerboxion, rendu en PNG par l'app : raccourcis.js) ; l'emoji n'est plus qu'un repli
            let img = (p["g64"] as? String).flatMap { Data(base64Encoded: $0) }.flatMap { UIImage(data: $0) }
            return Px(id: id, nom: (p["nom"] as? String) ?? id, icone: (p["icone"] as? String) ?? "▣", img: img)
        }
        let o = lireJSON("ploxi0n.valeurs") as? [String: Any] ?? [:]
        // (0.72, RS-7 : « les widgets ne sont pas encore corrects ») les tsoins du jour en héros ; la musique n'est plus le titre coupé en 34 pt
        let v = ["tsoins-jour", "pas", "musique", "dernier-tsoin", "compte"].compactMap { k -> Valeur? in
            guard let x = o[k] as? [String: Any] else { return nil }
            let le = (x["le"] as? Double).map { Date(timeIntervalSince1970: $0 / 1000) }
            return Valeur(id: k, titre: (x["titre"] as? String) ?? k, valeur: (x["valeur"] as? String) ?? "", le: le)
        }
        return Entree(date: Date(), ploxions: l, valeurs: v)
    }
    func placeholder(in context: Context) -> Entree {
        Entree(date: Date(), ploxions: [Px(id: "bother", nom: "bother me", icone: "▣")], valeurs: [Valeur(id: "tsoins-jour", titre: "Tsoins aujourd'hui", valeur: "25"), Valeur(id: "pas", titre: "pas", valeur: "2 550")])
    }
    func getSnapshot(in context: Context, completion: @escaping (Entree) -> Void) { completion(context.isPreview ? placeholder(in: context) : lire()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entree>) -> Void) { completion(Timeline(entries: [lire()], policy: .never)) }
}

// ---- LE KIT HUD (0.72) : la grammaire de docs/LOOK.md §2 (tête glyphe + TITRE espacé + étiquette, état à point, rangées libellé/valeur),
// dessinée avec les formes du lexique (le kion ◇, la portion ▣, le wormion ◎). Deux peaux : .chill (les jetons de l'app : dégradé, lueur —
// « plus stylés et futuristes », RS-7 14.10) et .mono (LE TRAIT, docs/LOOK.md §3 : sans dégradé ni lueur). Une constante les change.
struct Peau {
    let fond0: Color, fond1: Color, trait: Color, acc: Color, bio: Color, muet: Color, lueur: CGFloat
    static let chill = Peau(fond0: Color(red: 0.059, green: 0.043, blue: 0.094), fond1: Color(red: 0.027, green: 0.020, blue: 0.047),
                            trait: Color(red: 0.867, green: 0.839, blue: 0.918), acc: Color(red: 0.647, green: 0.592, blue: 0.812),
                            bio: Color(red: 0.475, green: 0.851, blue: 0.635), muet: Color(red: 0.498, green: 0.463, blue: 0.600), lueur: 5)
    static let mono = Peau(fond0: Color(red: 0.122, green: 0.122, blue: 0.114), fond1: Color(red: 0.122, green: 0.122, blue: 0.114),
                           trait: Color(red: 0.925, green: 0.922, blue: 0.914), acc: Color(red: 0.925, green: 0.922, blue: 0.914),
                           bio: Color(red: 0.93, green: 0.78, blue: 0.24), muet: Color(red: 0.55, green: 0.55, blue: 0.53), lueur: 0)
}
private let PEAU = Peau.chill

/** la lueur, seulement en pleine couleur (teinté, StandBy, écran verrouillé : rien) */
struct Lueur: ViewModifier {
    @Environment(\.widgetRenderingMode) var mode
    let c: Color
    func body(content: Content) -> some View { content.shadow(color: mode == .fullColor ? c.opacity(0.6) : .clear, radius: PEAU.lueur) }
}
extension View { func lueur(_ c: Color) -> some View { modifier(Lueur(c: c)) } }

/** la grille HUD, tous les 12 pt */
struct Grille: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        var x = r.minX
        while x <= r.maxX { p.move(to: CGPoint(x: x, y: r.minY)); p.addLine(to: CGPoint(x: x, y: r.maxY)); x += 12 }
        var y = r.minY
        while y <= r.maxY { p.move(to: CGPoint(x: r.minX, y: y)); p.addLine(to: CGPoint(x: r.maxX, y: y)); y += 12 }
        return p
    }
}
/** les quatre crochets d'un viseur */
struct Crochets: Shape {
    func path(in r0: CGRect) -> Path {
        let r = r0.insetBy(dx: 9, dy: 9)
        let l: CGFloat = 8
        let coins: [(CGPoint, CGFloat, CGFloat)] = [(CGPoint(x: r.minX, y: r.minY), 1, 1), (CGPoint(x: r.maxX, y: r.minY), -1, 1),
                                                    (CGPoint(x: r.minX, y: r.maxY), 1, -1), (CGPoint(x: r.maxX, y: r.maxY), -1, -1)]
        var p = Path()
        for (c, sx, sy) in coins { p.move(to: CGPoint(x: c.x + l * sx, y: c.y)); p.addLine(to: c); p.addLine(to: CGPoint(x: c.x, y: c.y + l * sy)) }
        return p
    }
}
/** le kion : un losange et sa croix (la marque ◇ de ploxi0n) */
struct Kion: Shape {
    func path(in r: CGRect) -> Path {
        var p = polygone([CGPoint(x: r.midX, y: r.minY), CGPoint(x: r.maxX, y: r.midY), CGPoint(x: r.midX, y: r.maxY), CGPoint(x: r.minX, y: r.midY)])
        p.move(to: CGPoint(x: r.midX, y: r.minY)); p.addLine(to: CGPoint(x: r.midX, y: r.maxY))
        p.move(to: CGPoint(x: r.minX, y: r.midY)); p.addLine(to: CGPoint(x: r.maxX, y: r.midY))
        return p
    }
}
struct Losange: Shape {
    func path(in r: CGRect) -> Path { polygone([CGPoint(x: r.midX, y: r.minY), CGPoint(x: r.maxX, y: r.midY), CGPoint(x: r.midX, y: r.maxY), CGPoint(x: r.minX, y: r.midY)]) }
}
/** le fond : le dégradé, une lueur au coin, la grille, un cadre dans le cadre, les crochets ; la pochette floutée dessous si on en a une */
struct FondHUD: View {
    var image: UIImage? = nil
    var body: some View {
        ZStack {
            LinearGradient(colors: [PEAU.fond0, PEAU.fond1], startPoint: .top, endPoint: .bottom)
            if let img = image { Color.clear.overlay(Image(uiImage: img).resizable().scaledToFill().blur(radius: 22).opacity(0.45)).clipped() }
            RadialGradient(colors: [PEAU.acc.opacity(0.22), Color.clear], center: .topLeading, startRadius: 0, endRadius: 170)
            Grille().stroke(PEAU.trait.opacity(0.045), lineWidth: 0.5)
            ContainerRelativeShape().inset(by: 4).stroke(PEAU.trait.opacity(0.10), lineWidth: 1)
            Crochets().stroke(PEAU.acc.opacity(0.75), style: StrokeStyle(lineWidth: 1.5, lineCap: .round))
        }
    }
}
/** ◇ TITRE ········ ÉTIQUETTE */
struct Tete: View {
    let titre: String
    let etiquette: String
    var body: some View {
        HStack(spacing: 5) {
            Kion().stroke(PEAU.acc, lineWidth: 1).frame(width: 9, height: 9).widgetAccentable()
            Text(titre.uppercased()).font(.system(size: 9, weight: .bold, design: .monospaced)).tracking(1.4).foregroundColor(PEAU.trait).lineLimit(1)
            Spacer(minLength: 4)
            Text(etiquette.uppercased()).font(.system(size: 8, weight: .medium, design: .monospaced)).tracking(1).foregroundColor(PEAU.muet).lineLimit(1)
        }
    }
}
/** ● EN LECTURE / ● PAUSE */
struct Etat: View {
    let actif: Bool
    let texte: String
    var body: some View {
        HStack(spacing: 4) {
            Circle().fill(actif ? PEAU.bio : PEAU.muet).frame(width: 5, height: 5).lueur(actif ? PEAU.bio : Color.clear)
            Text(texte.uppercased()).font(.system(size: 8, weight: .semibold, design: .monospaced)).tracking(1.2).foregroundColor(actif ? PEAU.bio : PEAU.muet)
        }
    }
}
/** LIBELLÉ ········ valeur */
struct Ligne: View {
    let v: Valeur
    var body: some View {
        HStack(spacing: 4) {
            Text(v.titre.uppercased()).font(.system(size: 8, weight: .medium, design: .monospaced)).tracking(0.8).foregroundColor(PEAU.muet).lineLimit(1)
            Spacer(minLength: 4)
            Text(v.valeur).font(.system(size: 10, weight: .semibold, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(1)
        }
    }
}
/** un filet, sous le héros */
struct Filet: View { var body: some View { Rectangle().fill(PEAU.trait.opacity(0.14)).frame(height: 0.5) } }

// ---- 📌 LES ÉPINGLÉS : des glyphes dans des portions (plus d'emoji) ----
struct GlyphePx: View {
    let p: Px
    var body: some View {
        if let img = p.img {
            Image(uiImage: img).renderingMode(.template).resizable().scaledToFit().foregroundColor(PEAU.acc).widgetAccentable()
        } else {
            ZStack {
                Kion().stroke(PEAU.acc, lineWidth: 1.2)
                Text(String(p.nom.prefix(1)).uppercased()).font(.system(size: 11, weight: .bold, design: .monospaced)).foregroundColor(PEAU.trait)
            }
        }
    }
}
/** une portion : un carré dans un carré, le glyphe au centre */
struct Portion: View {
    let p: Px
    let cote: CGFloat
    var body: some View {
        ZStack {
            Rectangle().stroke(PEAU.trait.opacity(0.18), lineWidth: 1)
            Rectangle().stroke(PEAU.trait.opacity(0.10), lineWidth: 0.7).padding(cote * 0.12)
            GlyphePx(p: p).frame(width: cote * 0.46, height: cote * 0.46).lueur(PEAU.acc)
        }.frame(width: cote, height: cote)
    }
}

struct VuePloxions: View {
    @Environment(\.widgetFamily) var famille
    let e: Entree
    var body: some View {
        if e.ploxions.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                Tete(titre: "épinglés", etiquette: "0 px")
                Spacer(minLength: 0)
                Text("Épingle des ploxions : ⚙ réglages → HUD").font(.system(size: 11, design: .monospaced)).foregroundColor(PEAU.muet)
            }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        } else if famille == .systemSmall {
            // un petit widget ne connaît qu'un seul geste : le premier épinglé, en grand ; les autres en dessous
            VStack(alignment: .leading, spacing: 6) {
                Tete(titre: "épinglés", etiquette: "\(e.ploxions.count) px")
                Spacer(minLength: 0)
                HStack(spacing: 8) {
                    Portion(p: e.ploxions[0], cote: 52)
                    Text(e.ploxions[0].nom.uppercased()).font(.system(size: 10, weight: .bold, design: .monospaced)).tracking(1).foregroundColor(PEAU.trait).lineLimit(2)
                }
                HStack(spacing: 6) { ForEach(e.ploxions.dropFirst().prefix(3)) { p in Portion(p: p, cote: 28) } }
            }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).widgetURL(URL(string: "ploxi0n://px/" + e.ploxions[0].id))
        } else {
            VStack(alignment: .leading, spacing: 8) {
                Tete(titre: "épinglés", etiquette: "\(e.ploxions.count) px")
                HStack(spacing: 0) {
                    ForEach(e.ploxions.prefix(4)) { p in
                        Link(destination: URL(string: "ploxi0n://px/" + p.id) ?? URL(string: "ploxi0n://")!) {
                            VStack(spacing: 5) {
                                Portion(p: p, cote: 52)
                                Text(p.nom.uppercased()).font(.system(size: 8, weight: .semibold, design: .monospaced)).tracking(0.8).foregroundColor(PEAU.trait).lineLimit(1)
                            }.frame(maxWidth: .infinity)
                        }
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
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Kion().stroke(lineWidth: 1).frame(width: 9, height: 9).widgetAccentable()
                    Text(e.valeurs.first?.valeur ?? "—").font(.system(size: 17, weight: .semibold, design: .monospaced)).lineLimit(1).minimumScaleFactor(0.5)
                }
            }
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("◇ PLOXI0N").font(.system(size: 13, weight: .bold, design: .monospaced))
                ForEach(e.valeurs.prefix(2)) { v in Text(v.titre + " : " + v.valeur).font(.system(size: 11, design: .monospaced)).lineLimit(1) }
            }
        case .systemMedium:
            VStack(alignment: .leading, spacing: 6) {
                Tete(titre: "ploxi0n", etiquette: "tsoins // jour")
                HStack(alignment: .top, spacing: 12) {
                    heros.frame(maxWidth: .infinity, alignment: .leading)
                    Rectangle().fill(PEAU.trait.opacity(0.14)).frame(width: 0.5)
                    VStack(alignment: .leading, spacing: 5) {
                        ForEach(e.valeurs.dropFirst().prefix(3)) { v in Ligne(v: v) }
                        Spacer(minLength: 0)
                    }.frame(maxWidth: .infinity)
                }
            }.widgetURL(URL(string: "ploxi0n://"))
        default:
            VStack(alignment: .leading, spacing: 5) {
                Tete(titre: "ploxi0n", etiquette: "tsoins // jour")
                heros
                Filet()
                ForEach(e.valeurs.dropFirst().prefix(2)) { v in Ligne(v: v) }
                Spacer(minLength: 0)
            }.frame(maxWidth: .infinity, alignment: .leading).widgetURL(URL(string: "ploxi0n://"))
        }
    }
    /** le héros : la première valeur, en grand et fin, qui luit ; quand elle a changé (l'ancienneté se met à jour toute seule) */
    @ViewBuilder var heros: some View {
        if let h = e.valeurs.first {
            VStack(alignment: .leading, spacing: 2) {
                Text(h.valeur).font(.system(size: 40, weight: .thin, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(1).minimumScaleFactor(0.4)
                    .contentTransition(.numericText()).lueur(PEAU.acc)
                Text(h.titre.uppercased()).font(.system(size: 8, weight: .semibold, design: .monospaced)).tracking(1).foregroundColor(PEAU.acc).lineLimit(1).widgetAccentable()
                if let le = h.le { Text("↻ \(Text(le, style: .relative))").font(.system(size: 7, design: .monospaced)).foregroundColor(PEAU.muet).lineLimit(1) }
            }
        } else {
            Text("—").font(.system(size: 40, weight: .thin, design: .monospaced)).foregroundColor(PEAU.muet)
        }
    }
}

struct WidgetPloxions: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ploxions", provider: Fournisseur()) { e in
            VuePloxions(e: e).containerBackground(for: .widget) { FondHUD() }
        }
        .configurationDisplayName("Ploxions épinglés")
        .description("Les ploxions de ton HUD, d'un geste.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WidgetValeurs: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "valeurs", provider: Fournisseur()) { e in
            VueValeurs(e: e).containerBackground(for: .widget) { FondHUD() }
        }
        .configurationDisplayName("ploxi0n")
        .description("Tes tsoins du jour, tes pas, ce qui joue, ton compte.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline])
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
        CubeEntree(date: Date(), faces: [Face(id: 0, g: "⧗", t: "tsoins", v: "25"), Face(id: 1, g: "♫", t: "à l'écoute", v: "Slow Stride"), Face(id: 2, g: "∷", t: "pas", v: "2 550"),
                                         Face(id: 3, g: "▣", t: "ploxions", v: "213"), Face(id: 4, g: "◇", t: "compte", v: "josion"), Face(id: 5, g: "✎", t: "dernier", v: "—")], tour: 0, ix: 0.3, iy: 0.1)
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
/** le carré 100×100 → la face (o, a, …, b) : le texte est IMPRIMÉ sur la face, en perspective (le sens de lecture est gardé) */
private func surFace(_ o: CGPoint, _ a: CGPoint, _ b: CGPoint) -> CGAffineTransform {
    CGAffineTransform(a: (a.x - o.x) / 100, b: (a.y - o.y) / 100, c: (b.x - o.x) / 100, d: (b.y - o.y) / 100, tx: o.x, ty: o.y)
}
private func reduit(_ pts: [CGPoint], _ k: CGFloat) -> [CGPoint] {
    let c = centre(pts)
    return pts.map { CGPoint(x: c.x + ($0.x - c.x) * k, y: c.y + ($0.y - c.y) * k) }
}

/** ce qu'une face porte : son glyphe, sa valeur, son titre */
struct EtiquetteFace: View {
    let f: Face
    var body: some View {
        VStack(spacing: 3) {
            Text(f.g).font(.system(size: 18)).foregroundColor(PEAU.acc)
            Text(f.v).font(.system(size: 22, weight: .bold, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(2).minimumScaleFactor(0.35).multilineTextAlignment(.center)
            Text(f.t.uppercased()).font(.system(size: 9, weight: .semibold, design: .monospaced)).tracking(1.2).foregroundColor(PEAU.muet).lineLimit(1).minimumScaleFactor(0.6)
        }.padding(10).frame(width: 100, height: 100)
    }
}

/** un cube isométrique : le dessus, la gauche, la droite ; penché comme le téléphone l'était (ix, iy) ; un socle de lumière dessous */
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
            let ww = max(geo.size.width, 1), hh = max(geo.size.height, 1)
            let up = { (p: CGPoint) -> UnitPoint in UnitPoint(x: p.x / ww, y: p.y / hh) }
            ZStack(alignment: .topLeading) {
                Ellipse().fill(RadialGradient(colors: [PEAU.acc.opacity(0.35), Color.clear], center: .center, startRadius: 0, endRadius: s * 1.2))
                    .frame(width: s * 2.6, height: s * 0.7).position(x: cx, y: b2.y + s * 0.12)
                polygone(gauche).fill(LinearGradient(colors: [PEAU.acc.opacity(0.22), PEAU.fond1], startPoint: up(t3), endPoint: up(b2)))
                polygone(droite).fill(LinearGradient(colors: [PEAU.acc.opacity(0.10), PEAU.fond1], startPoint: up(t1), endPoint: up(b2)))
                polygone(dessus).fill(LinearGradient(colors: [PEAU.acc.opacity(0.45), PEAU.fond0], startPoint: up(t0), endPoint: up(t2)))
                polygone(reduit(dessus, 0.72)).stroke(PEAU.trait.opacity(0.10), lineWidth: 0.7)
                polygone(gauche).stroke(PEAU.trait.opacity(0.16), lineWidth: 1)
                polygone(droite).stroke(PEAU.trait.opacity(0.12), lineWidth: 1)
                polygone(dessus).stroke(PEAU.acc, lineWidth: 1.4).lueur(PEAU.acc)
                Group {
                    EtiquetteFace(f: fd).transformEffect(surFace(t3, t0, t2))
                    EtiquetteFace(f: fg).transformEffect(surFace(t3, t2, b3))
                    EtiquetteFace(f: fr).transformEffect(surFace(t2, t1, b2))
                }.id(e.tour).transition(.push(from: .trailing))
            }
        }
    }
}

/** ⟲ dans un losange */
struct BoutonTourner: View {
    var body: some View {
        Button(intent: TournerCube()) {
            Image(systemName: "arrow.triangle.2.circlepath").font(.system(size: 10, weight: .bold)).foregroundColor(PEAU.acc)
                .frame(width: 24, height: 24).overlay(Losange().stroke(PEAU.acc.opacity(0.6), lineWidth: 1))
        }.buttonStyle(.plain).widgetAccentable()
    }
}

struct VueCube: View {
    @Environment(\.widgetFamily) var famille
    let e: CubeEntree
    var body: some View {
        if famille == .systemMedium {
            HStack(spacing: 10) {
                DessinCube(e: e).frame(maxWidth: .infinity)
                VStack(alignment: .leading, spacing: 4) {
                    Tete(titre: "cube", etiquette: "bions // 6")
                    ForEach(e.faces) { f in
                        HStack(spacing: 5) {
                            Text(f.g).font(.system(size: 9)).foregroundColor(PEAU.acc).frame(width: 12)
                            Text(f.t.uppercased()).font(.system(size: 8, weight: .medium, design: .monospaced)).tracking(0.6).foregroundColor(PEAU.muet).lineLimit(1)
                            Spacer(minLength: 2)
                            Text(f.v).font(.system(size: 9, weight: .semibold, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(1)
                        }
                    }
                    Spacer(minLength: 0)
                    BoutonTourner()
                }.frame(maxWidth: .infinity, alignment: .leading)
            }.padding(12).widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        } else {
            ZStack(alignment: .topTrailing) {
                DessinCube(e: e)
                BoutonTourner().padding(10)
            }.widgetURL(URL(string: "ploxi0n://px/reglages-app"))
        }
    }
}

struct WidgetCube: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "cube", provider: FournisseurCube()) { e in
            VueCube(e: e).containerBackground(for: .widget) { FondHUD() }
        }
        .configurationDisplayName("Cube")
        .description("Six infos de tes bions sur un cube ; ⟲ pour le tourner.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// ---- ♫ À L'ÉCOUTE -------------------------------------------------------------------------------------------------------------------------
struct LectureEntree: TimelineEntry { let date: Date; let titre: String; let artiste: String; let enLecture: Bool; let image: UIImage?; var source: String = "" }

struct FournisseurLecture: TimelineProvider {
    func lire() -> LectureEntree {
        guard let o = lireJSON("ploxi0n.lecture") as? [String: Any], let t = o["titre"] as? String, !t.isEmpty else {
            return LectureEntree(date: Date(), titre: "", artiste: "", enLecture: false, image: nil)
        }
        var img: UIImage? = nil
        if let adresse = o["image"] as? String, !adresse.isEmpty, UserDefaults(suiteName: GROUPE)?.string(forKey: "ploxi0n.lecture-pochette") == adresse,
           let dossier = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: GROUPE) {
            // (0.73) réduite : WidgetKit refuse une image plus grande que le widget (la pochette fait 900 px), et le widget restait vide
            img = UIImage(contentsOfFile: dossier.appendingPathComponent("lecture.jpg").path)?.preparingThumbnail(of: CGSize(width: 240, height: 240))
        }
        return LectureEntree(date: Date(), titre: t, artiste: (o["artiste"] as? String) ?? "", enLecture: (o["enLecture"] as? Bool) ?? false, image: img, source: (o["ploxion"] as? String) ?? "")
    }
    func placeholder(in context: Context) -> LectureEntree { LectureEntree(date: Date(), titre: "Slow Stride", artiste: "YOUTH 83", enLecture: true, image: nil, source: "spotify") }
    func getSnapshot(in context: Context, completion: @escaping (LectureEntree) -> Void) { completion(context.isPreview ? placeholder(in: context) : lire()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<LectureEntree>) -> Void) { completion(Timeline(entries: [lire()], policy: .never)) }
}

struct VuePochette: View {
    let e: LectureEntree
    var body: some View {
        if let img = e.image { Image(uiImage: img).resizable().scaledToFill() }
        else { ZStack { PEAU.fond1; Text("♫").font(.system(size: 26)).foregroundColor(PEAU.acc) } }
    }
}
/** la pochette en wormion : des cercles autour, le trou au centre, une lueur quand ça joue */
struct Disque: View {
    let e: LectureEntree
    var body: some View {
        ZStack {
            Circle().stroke(PEAU.acc.opacity(0.35), lineWidth: 1)
            Circle().stroke(PEAU.trait.opacity(0.15), lineWidth: 0.7).padding(4)
            Color.clear.overlay(VuePochette(e: e)).clipShape(Circle()).padding(8)
            Circle().fill(PEAU.fond1).frame(width: 7, height: 7)
        }.aspectRatio(1, contentMode: .fit).lueur(e.enLecture ? PEAU.bio : Color.clear)
    }
}

struct VueLecture: View {
    @Environment(\.widgetFamily) var famille
    let e: LectureEntree
    func bouton(_ symbole: String, _ commande: String, plein: Bool = false) -> some View {
        Link(destination: URL(string: "ploxi0n://lecture/" + commande) ?? URL(string: "ploxi0n://")!) {
            Image(systemName: symbole).font(.system(size: 13, weight: .bold)).foregroundColor(plein ? PEAU.fond1 : PEAU.trait)
                .frame(maxWidth: .infinity, minHeight: 28).background(plein ? PEAU.acc : Color.clear)
                .overlay(Rectangle().stroke(PEAU.trait.opacity(plein ? 0 : 0.25), lineWidth: 1))
        }
    }
    var body: some View {
        if e.titre.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                Tete(titre: "à l'écoute", etiquette: "—")
                Spacer(minLength: 0)
                Etat(actif: false, texte: "rien ne joue")
                Text("Lance de la musique dans un ploxion (Spotify…)").font(.system(size: 10, design: .monospaced)).foregroundColor(PEAU.muet)
            }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        } else {
            switch famille {
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text((e.enLecture ? "♫ " : "⏸ ") + e.titre).font(.headline).lineLimit(1)
                    Text(e.artiste).font(.system(size: 11, design: .monospaced)).lineLimit(1)
                }
            case .systemMedium:
                HStack(spacing: 12) {
                    Disque(e: e).frame(width: 110, height: 110)
                    VStack(alignment: .leading, spacing: 4) {
                        Tete(titre: "à l'écoute", etiquette: e.source)
                        Etat(actif: e.enLecture, texte: e.enLecture ? "en lecture" : "pause")
                        Text(e.titre).font(.system(size: 15, weight: .semibold)).foregroundColor(PEAU.trait).lineLimit(2)
                        Text(e.artiste).font(.system(size: 10, design: .monospaced)).foregroundColor(PEAU.muet).lineLimit(1)
                        Spacer(minLength: 0)
                        HStack(spacing: 6) { bouton("backward.fill", "precedent"); bouton(e.enLecture ? "pause.fill" : "play.fill", "toggle", plein: true); bouton("forward.fill", "suivant") }
                    }
                }
            default:
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .top) { Disque(e: e).frame(width: 62, height: 62); Spacer(minLength: 0); Etat(actif: e.enLecture, texte: e.enLecture ? "live" : "pause") }
                    Spacer(minLength: 0)
                    Text(e.titre).font(.system(size: 13, weight: .semibold)).foregroundColor(PEAU.trait).lineLimit(2)
                    Text(e.artiste.uppercased()).font(.system(size: 9, weight: .medium, design: .monospaced)).tracking(0.8).foregroundColor(PEAU.muet).lineLimit(1)
                }.frame(maxWidth: .infinity, alignment: .leading).widgetURL(URL(string: "ploxi0n://lecture/ouvrir"))
            }
        }
    }
}

struct WidgetLecture: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "lecture", provider: FournisseurLecture()) { e in
            VueLecture(e: e).containerBackground(for: .widget) { FondHUD(image: e.image) }
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

// ---- 🏝 LES LIVE ACTIVITIES (0.91) : écran verrouillé et Dynamic Island. L'app les lance (PloxiApple.activiteDebut, AppDelegate.swift) ;
// le MÊME type que dans l'app, au caractère près (ActivityKit les apparie par leur nom).
struct PloxiActivite: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var titre: String
        var sous: String
        var glyphe: String          // un symbole SF (hourglass, mic, timer, waveform…)
        var debut: Date?            // un chrono qui monte depuis
        var fin: Date?              // un compte à rebours jusqu'à
        var progression: Double?    // 0…1
    }
    var genre: String               // tsoin, vocal, minuteur, ploxion
    var ploxion: String             // le toucher ouvre ploxi0n://px/<ploxion>
}

/** le temps d'une activité : le compte à rebours s'il y a une fin, sinon le chrono depuis le début, sinon rien */
struct TempsActivite: View {
    let e: PloxiActivite.ContentState
    var taille: CGFloat = 26
    var body: some View {
        if let f = e.fin { Text(f, style: .timer).font(.system(size: taille, weight: .thin, design: .monospaced)).monospacedDigit().multilineTextAlignment(.trailing) }
        else if let d = e.debut { Text(d, style: .timer).font(.system(size: taille, weight: .thin, design: .monospaced)).monospacedDigit().multilineTextAlignment(.trailing) }
        else { EmptyView() }
    }
}

struct VueActivite: View {
    let ctx: ActivityViewContext<PloxiActivite>
    var body: some View {
        let e = ctx.state
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Image(systemName: e.glyphe).font(.system(size: 20, weight: .light)).foregroundColor(PEAU.acc).frame(width: 34, height: 34)
                    .overlay(Rectangle().stroke(PEAU.acc.opacity(0.7), lineWidth: 1))
                VStack(alignment: .leading, spacing: 2) {
                    Text(e.titre.uppercased()).font(.system(size: 12, weight: .semibold, design: .monospaced)).tracking(1.5).foregroundColor(PEAU.trait).lineLimit(1)
                    if !e.sous.isEmpty { Text(e.sous).font(.system(size: 12)).foregroundColor(PEAU.muet).lineLimit(1) }
                }
                Spacer(minLength: 6)
                TempsActivite(e: e).foregroundColor(PEAU.trait).frame(maxWidth: 120, alignment: .trailing)
            }
            if let p = e.progression { ProgressView(value: p).tint(PEAU.acc) }
        }
        .padding(14)
        .activityBackgroundTint(PEAU.fond0.opacity(0.92))
        .activitySystemActionForegroundColor(PEAU.trait)
        .widgetURL(URL(string: "ploxi0n://px/\(ctx.attributes.ploxion)"))
    }
}

struct ActivitePloxi0n: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PloxiActivite.self) { ctx in
            VueActivite(ctx: ctx)
        } dynamicIsland: { ctx in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: ctx.state.glyphe).font(.system(size: 22, weight: .light)).foregroundColor(PEAU.acc).padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TempsActivite(e: ctx.state, taille: 22).foregroundColor(PEAU.trait).frame(maxWidth: 100, alignment: .trailing)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(ctx.state.titre).font(.system(size: 14, weight: .semibold, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(1)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        if !ctx.state.sous.isEmpty { Text(ctx.state.sous).font(.system(size: 12)).foregroundColor(PEAU.muet).lineLimit(1) }
                        if let p = ctx.state.progression { ProgressView(value: p).tint(PEAU.acc) }
                    }
                }
            } compactLeading: {
                Image(systemName: ctx.state.glyphe).foregroundColor(PEAU.acc)
            } compactTrailing: {
                TempsActivite(e: ctx.state, taille: 13).foregroundColor(PEAU.trait).frame(maxWidth: 52)
            } minimal: {
                Image(systemName: ctx.state.glyphe).foregroundColor(PEAU.acc)
            }
            .widgetURL(URL(string: "ploxi0n://px/\(ctx.attributes.ploxion)"))
        }
    }
}

// ---- ▦ UN PLOXION (0.91, « un widget par ploxion ») : on choisit le ploxion dans la configuration du widget (appui long › Modifier) ;
// il montre ce que ce ploxion publie (jOSWidget.publier : une valeur, son unité, une ligne, une courbe, un bouton), sinon son glyphe et
// son nom. L'app écrit « ploxi0n.px-widgets » = { liste: [{ id, nom }], px: { id: { nom, valeur, unite, sous, serie, bouton, g64, le } } }.
struct PxWidgetEntite: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Ploxion"
    static var defaultQuery = PxWidgetRequete()
    var id: String
    var nom: String
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(nom)") }
}
private func pxWidgetsTous() -> [PxWidgetEntite] {
    let o = lireJSON("ploxi0n.px-widgets") as? [String: Any] ?? [:]
    return (o["liste"] as? [[String: Any]] ?? []).compactMap { p in (p["id"] as? String).map { PxWidgetEntite(id: $0, nom: (p["nom"] as? String) ?? $0) } }
}
struct PxWidgetRequete: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [PxWidgetEntite] { pxWidgetsTous().filter { identifiers.contains($0.id) } }
    func suggestedEntities() async throws -> [PxWidgetEntite] { pxWidgetsTous() }
    func defaultResult() async -> PxWidgetEntite? { pxWidgetsTous().first }
}
struct ChoisirPloxion: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Un ploxion"
    static var description = IntentDescription("Le ploxion que ce widget montre.")
    @Parameter(title: "Ploxion") var ploxion: PxWidgetEntite?
}
struct PxEntree: TimelineEntry {
    let date: Date; let id: String; let nom: String; let valeur: String; let unite: String; let sous: String
    let serie: [Double]; let boutonTitre: String?; let boutonUrl: URL?; let img: UIImage?; let le: Date?
}
struct FournisseurPx: AppIntentTimelineProvider {
    func lire(_ id: String?) -> PxEntree {
        let o = lireJSON("ploxi0n.px-widgets") as? [String: Any] ?? [:]
        let px = o["px"] as? [String: Any] ?? [:]
        let ident = id ?? pxWidgetsTous().first?.id ?? "accueil"
        let d = px[ident] as? [String: Any] ?? [:]
        let nom = (d["nom"] as? String) ?? pxWidgetsTous().first(where: { $0.id == ident })?.nom ?? ident
        let b = d["bouton"] as? [String: Any]
        let lien = (b?["lien"] as? String).flatMap { URL(string: $0) }
        let img = (d["g64"] as? String).flatMap { Data(base64Encoded: $0) }.flatMap { UIImage(data: $0) }
        return PxEntree(date: Date(), id: ident, nom: nom, valeur: (d["valeur"] as? String) ?? "", unite: (d["unite"] as? String) ?? "", sous: (d["sous"] as? String) ?? "",
                        serie: (d["serie"] as? [Double]) ?? [], boutonTitre: b?["titre"] as? String, boutonUrl: lien,
                        img: img, le: (d["le"] as? Double).map { Date(timeIntervalSince1970: $0 / 1000) })
    }
    func placeholder(in context: Context) -> PxEntree {
        PxEntree(date: Date(), id: "systeme", nom: "Système", valeur: "60", unite: "img/s", sous: "la fluidité", serie: [40, 55, 60, 58, 60, 60, 52, 60], boutonTitre: nil, boutonUrl: nil, img: nil, le: nil)
    }
    func snapshot(for configuration: ChoisirPloxion, in context: Context) async -> PxEntree { context.isPreview ? placeholder(in: context) : lire(configuration.ploxion?.id) }
    func timeline(for configuration: ChoisirPloxion, in context: Context) async -> Timeline<PxEntree> { Timeline(entries: [lire(configuration.ploxion?.id)], policy: .never) }
}
/** une courbe au trait, à partir d'une série */
struct Courbe: Shape {
    let serie: [Double]
    func path(in r: CGRect) -> Path {
        var p = Path(); guard serie.count > 1, let lo = serie.min(), let hi = serie.max() else { return p }
        let e = hi - lo == 0 ? 1 : hi - lo
        for (i, v) in serie.enumerated() {
            let pt = CGPoint(x: r.minX + r.width * CGFloat(i) / CGFloat(serie.count - 1), y: r.maxY - r.height * CGFloat((v - lo) / e))
            if i == 0 { p.move(to: pt) } else { p.addLine(to: pt) }
        }
        return p
    }
}
struct VuePx: View {
    let e: PxEntree
    @Environment(\.widgetFamily) var famille
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                if let i = e.img { Image(uiImage: i).resizable().scaledToFit().frame(width: 16, height: 16) } else { Image(systemName: "square.grid.2x2").font(.system(size: 12)).foregroundColor(PEAU.acc) }
                Text(e.nom.uppercased()).font(.system(size: 9, weight: .semibold, design: .monospaced)).tracking(1).foregroundColor(PEAU.acc).lineLimit(1)
            }
            Spacer(minLength: 0)
            if e.valeur.isEmpty {
                Text("ouvrir").font(.system(size: 13, design: .monospaced)).foregroundColor(PEAU.muet)
            } else {
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(e.valeur).font(.system(size: famille == .accessoryRectangular ? 20 : 34, weight: .thin, design: .monospaced)).foregroundColor(PEAU.trait).lineLimit(1).minimumScaleFactor(0.4)
                    if !e.unite.isEmpty { Text(e.unite).font(.system(size: 10, design: .monospaced)).foregroundColor(PEAU.muet) }
                }
            }
            if !e.sous.isEmpty { Text(e.sous).font(.system(size: 10)).foregroundColor(PEAU.muet).lineLimit(1) }
            if e.serie.count > 1 && famille != .accessoryRectangular { Courbe(serie: e.serie).stroke(PEAU.acc, lineWidth: 1.2).frame(height: famille == .systemSmall ? 18 : 26) }
            if famille == .systemMedium, let t = e.boutonTitre, let u = e.boutonUrl {
                Link(destination: u) { Text(t).font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundColor(PEAU.trait).padding(.horizontal, 10).padding(.vertical, 4).overlay(Rectangle().stroke(PEAU.acc, lineWidth: 1)) }
            }
        }
        .widgetURL(URL(string: "ploxi0n://px/\(e.id)"))
    }
}
struct WidgetUnPloxion: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "un-ploxion", intent: ChoisirPloxion.self, provider: FournisseurPx()) { e in
            VuePx(e: e).containerBackground(for: .widget) { FondHUD() }
        }
        .configurationDisplayName("Un ploxion")
        .description("Ce qu'un ploxion publie : une valeur, une courbe, un bouton. Appui long › Modifier pour le choisir.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

@main
struct PloxionWidgets: WidgetBundle {
    var body: some Widget {
        WidgetPloxions()
        WidgetValeurs()
        WidgetCube()
        WidgetLecture()
        WidgetUnPloxion()
        ActivitePloxi0n()
        if #available(iOS 18.0, *) {
            ControleTsoin()
            ControleVocal()
            ControleLampe()
            ControlePloxi0n()
        }
    }
}
