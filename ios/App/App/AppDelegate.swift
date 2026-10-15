import UIKit
import Capacitor
import WidgetKit
import AVFoundation
import Speech
import WeatherKit
import ShazamKit
import MusicKit
import CoreLocation
import HomeKit
import NetworkExtension
import GameKit
import WebKit
import ObjectiveC
import CoreMotion
import MediaPlayer
import AVKit
import QuickLook
// l'AR native (0.73) : PloxiAR plus bas. Interrupteur de secours : PLOXI0N_AR=0 (fastlane) la retire du build.
#if !PLOXI0N_SANS_AR
import ARKit
import RealityKit
import Combine
import SwiftUI
#if canImport(RoomPlan)
import RoomPlan
#endif
#endif
#if canImport(MobileVLCKit)
import MobileVLCKit
#endif

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // les raccourcis automatiques (Raccourcis.swift) : la liste des ploxions proposés à Siri et à l'app Raccourcis suit les installations
        if #available(iOS 16.0, *) { RaccourcisPloxi0n.updateAppShortcutParameters() }
        // LE CLAVIER (RS-7 12.10 : « le clavier n'apparaît pas quand il faut ») : WebKit n'ouvre le clavier que si le focus vient
        // DIRECTEMENT d'un toucher ; les ploxions et leurs bions (le « clic rapide » de _toucher, les cartes du swipe…) annulent souvent le
        // toucher et donnent le focus un instant après → pas de clavier. Comme Cordova / Ionic (KeyboardDisplayRequiresUserAction=false) :
        // tout focus compte comme venu de l'utilisateur. Interrupteur : UserDefaults « CapacitorStorage.ploxi0n.clavier-libre » = "off".
        // LA BOÎTE NOIRE (RS-7 12.10 : « ça crash quand j'ouvre, des fois deux fois d'affilée ») : « en-cours » ici, « ok » quand la page a fini
        // de démarrer (main.js) ; un lancement resté « en-cours » = un plantage. Après 2 plantages d'affilée : le MODE SÛR — sans le correctif
        // clavier (une méthode privée de WebKit) ni la copie vers les widgets (les deux suspects natifs) ; la page le dit et propose bother me.
        let d = UserDefaults.standard
        var plantages = d.integer(forKey: "ploxi0n.plantages")
        plantages = d.string(forKey: "CapacitorStorage.ploxi0n.lancement") == "en-cours" ? plantages + 1 : 0
        d.set(plantages, forKey: "ploxi0n.plantages")
        d.set(String(plantages), forKey: "CapacitorStorage.ploxi0n.plantages")
        d.set("en-cours", forKey: "CapacitorStorage.ploxi0n.lancement")
        // L'ESPACE LIBRE (RS-7 12.10 : figé au démarrage, à un endroit différent chaque fois, entre +16 et +161 ms ; « j'ai pas beaucoup de
        // place sur mon tel ») : un disque plein fige SQLite et WebKit. Mesuré à chaque lancement (la page le montre au journal) ; sous 1,5 Go,
        // les CACHES de l'app sont vidés (WebKit, réseau : régénérables — jamais Documents ni la base).
        let fm = FileManager.default
        if let attrs = try? fm.attributesOfFileSystem(forPath: NSHomeDirectory()), let libre = attrs[.systemFreeSize] as? NSNumber {
            d.set(String(libre.int64Value), forKey: "CapacitorStorage.ploxi0n.espace-libre")
            if libre.int64Value < 1_500_000_000, let caches = fm.urls(for: .cachesDirectory, in: .userDomainMask).first,
               let items = try? fm.contentsOfDirectory(at: caches, includingPropertiesForKeys: nil) {
                var vide: Int64 = 0
                for u in items {
                    if let t = try? u.resourceValues(forKeys: [.totalFileAllocatedSizeKey, .isDirectoryKey]) { vide += Int64(t.totalFileAllocatedSize ?? 0) }
                    try? fm.removeItem(at: u)
                }
                d.set(String(items.count) + " éléments, " + String(vide / 1_000_000) + " Mo", forKey: "CapacitorStorage.ploxi0n.caches-vides")
            } else { d.removeObject(forKey: "CapacitorStorage.ploxi0n.caches-vides") }
        }
        // LA BASE QUAND L'IPHONE EST VERROUILLÉ (RS-7 14.10 : « ploxi0n n'a pas pu démarrer : … rc: 14 unable to open database file ») : la
        // protection « Complete » de l'app ferme la base dès le verrouillage ; un démarrage en arrière-plan (le son, un raccourci « dodo »)
        // ne pouvait plus l'ouvrir. Le dossier de la base et ce qu'il contient (la base, son journal) passent en « jusqu'au premier
        // déverrouillage », le réglage par défaut d'iOS : chiffré tant que l'iPhone n'a pas été déverrouillé depuis son démarrage.
        if let lib = fm.urls(for: .libraryDirectory, in: .userDomainMask).first {
            let dossierBase = lib.appendingPathComponent("CapacitorDatabase", isDirectory: true)
            let protection: [FileAttributeKey: Any] = [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
            try? fm.createDirectory(at: dossierBase, withIntermediateDirectories: true, attributes: protection)
            try? fm.setAttributes(protection, ofItemAtPath: dossierBase.path)
            for f in (try? fm.contentsOfDirectory(atPath: dossierBase.path)) ?? [] {
                try? fm.setAttributes(protection, ofItemAtPath: dossierBase.appendingPathComponent(f).path)
            }
        }
        let sur = plantages >= 2
        d.set(sur ? "1" : "0", forKey: "CapacitorStorage.ploxi0n.mode-sur")
        if !sur && d.string(forKey: "CapacitorStorage.ploxi0n.clavier-libre") != "off" { AppDelegate.clavierSansGeste() }
        // LE SON (RS-7 12.10 : « améliorer le lecteur, utiliser les trucs natifs ») : la catégorie « lecture » d'iOS — le son des ploxions
        // continue écran verrouillé et joue même en mode silencieux, comme une vraie app de musique ou de vidéo (avec UIBackgroundModes audio)
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
        // les WIDGETS (extension PloxionWidgets) lisent l'App Group : chaque fois que l'app réécrit ses Préférences, on y recopie les
        // ploxions épinglés et les valeurs, et on redessine les widgets seulement si quelque chose a changé
        // hors du chemin critique du lancement (le premier dessin d'abord) ; jamais en mode sûr
        if !sur {
            DispatchQueue.main.async { [weak self] in
                NotificationCenter.default.addObserver(forName: UserDefaults.didChangeNotification, object: nil, queue: .main) { [weak self] _ in self?.planifierCopie() }
                self?.versLesWidgets()
            }
        }
        return true
    }

    /** WKContentView._elementDidFocus:userIsInteracting:… (iOS 13+) : on force userIsInteracting = vrai */
    static func clavierSansGeste() {
        guard let classe = NSClassFromString("WKContentView") else { return }
        let sel = sel_getUid("_elementDidFocus:userIsInteracting:blurPreviousNode:activityStateChanges:userObject:")
        guard let methode = class_getInstanceMethod(classe, sel) else { return }
        typealias Originale = @convention(c) (AnyObject, Selector, UnsafeRawPointer?, Bool, Bool, Bool, AnyObject?) -> Void
        let originale = unsafeBitCast(method_getImplementation(methode), to: Originale.self)
        let remplacante: @convention(block) (AnyObject, UnsafeRawPointer?, Bool, Bool, Bool, AnyObject?) -> Void = { moi, noeud, _, flouAvant, changements, objet in
            originale(moi, sel, noeud, true, flouAvant, changements, objet)
        }
        method_setImplementation(methode, imp_implementationWithBlock(remplacante))
    }

    private var enCopie = false   // la copie écrit elle-même des préférences : jamais de réentrance
    // 0.30 — les 3 plantages partagés (build 37, iPhone14,7, iOS 26.4.2) : « Thread stack size exceeded due to excessive recursion » dans
    // versLesWidgets ← didChangeNotification ← l'écriture de la copie elle-même. Garde de réentrance (0.29) + ici : la notification ne fait
    // que PLANIFIER une copie (regroupée, 0,6 s), et l'état écrit ne contient plus d'heure → une copie qui ne change rien n'écrit rien,
    // donc ne renotifie rien : la boucle ne peut plus exister, ni en récursion, ni en différé.
    private var copiePrevue = false
    private func planifierCopie() {
        if enCopie || copiePrevue { return }
        copiePrevue = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { [weak self] in self?.copiePrevue = false; self?.versLesWidgets() }
    }
    private func versLesWidgets() {
        if enCopie { return }
        enCopie = true
        defer { enCopie = false }
        // l'état de la copie, lisible par l'app (⚙ › À propos) : RS-7 12.10, les widgets restaient vides — on saura pourquoi
        let ecrireEtat: ([String: Any]) -> Void = { etat in
            if let d = try? JSONSerialization.data(withJSONObject: etat), let s = String(data: d, encoding: .utf8),
               UserDefaults.standard.string(forKey: "CapacitorStorage.ploxi0n.widgets-etat") != s { UserDefaults.standard.set(s, forKey: "CapacitorStorage.ploxi0n.widgets-etat") }
        }
        guard let g = UserDefaults(suiteName: "group.ch.j0bot.ploxi0n") else { ecrireEtat(["groupe": false]); return }
        let conteneur = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.ch.j0bot.ploxi0n") != nil
        var change = false, tailles: [String: Int] = [:]
        for k in ["ploxi0n.epingles", "ploxi0n.valeurs", "ploxi0n.lecture", "ploxi0n.cube"] {
            let v = UserDefaults.standard.string(forKey: "CapacitorStorage." + k)
            tailles[k] = v?.count ?? -1
            if v != nil && g.string(forKey: k) != v { g.set(v, forKey: k); change = true }
        }
        if change { WidgetCenter.shared.reloadAllTimelines() }
        ecrireEtat(["groupe": true, "conteneur": conteneur, "epingles": tailles["ploxi0n.epingles"] ?? -1, "valeurs": tailles["ploxi0n.valeurs"] ?? -1,
                    "relu": g.string(forKey: "ploxi0n.epingles")?.count ?? -1])
    }

    func applicationWillResignActive(_ application: UIApplication) { versLesWidgets() }
    func applicationDidEnterBackground(_ application: UIApplication) { versLesWidgets() }



    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// LE PLEIN ÉCRAN COMPLET (RS-7 12.10 : « tous les bords que je peux utiliser, pour que mon app soit vraiment en plein écran complet »).
// Le contrôleur de la vue web (Main.storyboard → PloxionVC) : quand ⚙ › Apparence › Plein écran est allumé (Préférences « ploxi0n.plein-ecran » = "1") :
//   l'indicateur d'accueil (la barre du bas) s'efface tant qu'on ne touche pas l'écran ; les bords HAUT et BAS donnent la priorité à
//   l'app (un premier glissé va aux ploxions, un second à iOS : l'accueil, le centre de notifications). La barre d'état : le plugin StatusBar.
// 🎙 LES VOCAUX (RS-7 12.10 : « j'aime beaucoup faire des vocaux, mais je veux aussi une transcription de ce que je raconte ») : un plugin de
// l'app (enregistré par PloxionVC) — enregistrer (AVAudioRecorder, m4a), arrêter, transcrire avec la reconnaissance vocale d'iOS, sur le
// téléphone quand il le peut ; le VOCABULAIRE du xerboxion (ploxion, tsoin, xeroction…) est donné comme mots à privilégier (contextualStrings).
@objc(PloxiVocal)
public class PloxiVocal: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PloxiVocal"
    public let jsName = "PloxiVocal"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "commencer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "arreter", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "transcrire", returnType: CAPPluginReturnPromise),
    ]
    private var enregistreur: AVAudioRecorder?
    private var debut = Date()

    @objc func commencer(_ call: CAPPluginCall) {
        AVAudioSession.sharedInstance().requestRecordPermission { ok in
            guard ok else { call.reject("micro refusé : Réglages iOS › ploxi0n › Micro"); return }
            DispatchQueue.main.async {
                do {
                    try AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
                    try AVAudioSession.sharedInstance().setActive(true)
                    let url = FileManager.default.temporaryDirectory.appendingPathComponent("vocal-\(Int(Date().timeIntervalSince1970)).m4a")
                    let r = try AVAudioRecorder(url: url, settings: [AVFormatIDKey: Int(kAudioFormatMPEG4AAC), AVSampleRateKey: 44100, AVNumberOfChannelsKey: 1, AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue])
                    r.record(); self.enregistreur = r; self.debut = Date()
                    call.resolve(["chemin": url.path])
                } catch { call.reject("enregistrement impossible : \(error.localizedDescription)") }
            }
        }
    }

    @objc func arreter(_ call: CAPPluginCall) {
        guard let r = enregistreur else { call.reject("aucun enregistrement en cours"); return }
        r.stop(); enregistreur = nil
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
        let data = (try? Data(contentsOf: r.url)) ?? Data()
        call.resolve(["chemin": r.url.path, "duree": Date().timeIntervalSince(debut), "base64": data.base64EncodedString(), "type": "audio/mp4"])
    }

    @objc func transcrire(_ call: CAPPluginCall) {
        guard let chemin = call.getString("chemin") else { call.reject("chemin manquant"); return }
        let langue = call.getString("langue") ?? Locale.current.identifier
        let mots = call.getArray("vocabulaire", String.self) ?? []
        SFSpeechRecognizer.requestAuthorization { statut in
            guard statut == .authorized else { call.reject("reconnaissance vocale refusée : Réglages iOS › ploxi0n"); return }
            guard let rec = SFSpeechRecognizer(locale: Locale(identifier: langue)) ?? SFSpeechRecognizer(), rec.isAvailable else { call.reject("reconnaissance vocale indisponible pour \(langue)"); return }
            let req = SFSpeechURLRecognitionRequest(url: URL(fileURLWithPath: chemin))
            req.contextualStrings = Array(mots.prefix(100))
            req.shouldReportPartialResults = false
            if rec.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
            var fini = false
            rec.recognitionTask(with: req) { res, err in
                if fini { return }
                if let err = err { fini = true; call.reject("transcription : \(err.localizedDescription)"); return }
                guard let res = res, res.isFinal else { return }
                fini = true
                call.resolve(["texte": res.bestTranscription.formattedString, "langue": langue, "surLeTelephone": req.requiresOnDeviceRecognition])
            }
        }
    }
}

// 🍎 LES SERVICES D'APPLE (RS-7 12.10 : « ajoute MusicKit, ShazamKit, WeatherKit comme utilisables ») : un plugin de l'app, jOSNatif côté page.
//   meteo({lat,lng})        WeatherKit : maintenant + 7 jours (l'attribution « Apple Weather » doit être affichée : rendue avec)
//   shazam()                ShazamKit (iOS 17+) : écoute le micro, rend titre, artiste, pochette, lien Apple Music
//   musiqueChercher({q})    MusicKit : le catalogue Apple Music · musiqueJouer({id}) · musiquePause()  (jouer : un abonnement Apple Music)
@objc(PloxiApple)
public class PloxiApple: CAPPlugin, CAPBridgedPlugin, HMHomeManagerDelegate, QLPreviewControllerDataSource {
    public let identifier = "PloxiApple"
    public let jsName = "PloxiApple"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "meteo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shazam", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "musiqueChercher", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "musiqueJouer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "musiquePause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "maisonListe", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "maisonBasculer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "wifiRejoindre", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "gameCenter", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "gameCenterScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mouvementDebut", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mouvementFin", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ecranEveille", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lecture", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lectureFin", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lampe", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "apercu", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "capturerXer", returnType: CAPPluginReturnPromise),
    ]

    // 🔦 LA LAMPE DE POCHE (0.49) : lampe({ allume?, niveau? 0…1 }) ; sans « allume », elle bascule
    @objc func lampe(_ call: CAPPluginCall) {
        guard let d = AVCaptureDevice.default(for: .video), d.hasTorch else { call.reject("pas de lampe sur cet appareil"); return }
        let allume = call.getBool("allume") ?? (d.torchMode != .on)
        let niveau = Float(max(0.05, min(1.0, call.getDouble("niveau") ?? 1.0)))
        do {
            try d.lockForConfiguration()
            if allume { try d.setTorchModeOn(level: niveau) } else { d.torchMode = .off }
            d.unlockForConfiguration()
            call.resolve(["allume": allume])
        } catch { call.reject("lampe : \(error.localizedDescription)") }
    }

    // 👁 LE VISUALISEUR DE FICHIERS (0.49) : QuickLook — PDF, images, vidéos, Office, Pages/Numbers/Keynote, texte, USDZ (3D/AR)…
    // apercu({ base64, nom }) ou apercu({ chemin }) ou (0.73) apercu({ url }) : téléchargé par iOS (pas de CORS) ; partager, imprimer, annoter :
    // les boutons d'iOS. Un USDZ s'ouvre en AR QUICK LOOK (l'onglet AR d'iOS) ; echelleReelle : à l'échelle 1, sans pincer (une pièce scannée).
    private var apercuURL: URL?
    private var apercuEchelleReelle = false
    @objc func apercu(_ call: CAPPluginCall) {
        var url: URL? = nil
        let echelle = call.getBool("echelleReelle") ?? false
        if let chemin = call.getString("chemin"), !chemin.isEmpty {
            url = chemin.hasPrefix("file://") ? URL(string: chemin) : URL(fileURLWithPath: chemin)
        } else if let b64 = call.getString("base64"), let data = Data(base64Encoded: b64, options: .ignoreUnknownCharacters) {
            let nom = (call.getString("nom") ?? "fichier").replacingOccurrences(of: "/", with: "-")
            let u = FileManager.default.temporaryDirectory.appendingPathComponent(nom.isEmpty ? "fichier" : nom)
            do { try data.write(to: u, options: .atomic); url = u } catch { call.reject("aperçu : \(error.localizedDescription)"); return }
        } else if let lien = call.getString("url"), let distant = URL(string: lien), ["http", "https"].contains(distant.scheme?.lowercased() ?? "") {
            URLSession.shared.downloadTask(with: distant) { tmp, _, erreur in
                guard let tmp = tmp else { call.reject("aperçu : " + (erreur?.localizedDescription ?? "rien reçu")); return }
                let nom = distant.lastPathComponent.isEmpty ? "fichier" : distant.lastPathComponent
                let u = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + "-" + nom)
                do { try FileManager.default.moveItem(at: tmp, to: u) } catch { call.reject("aperçu : \(error.localizedDescription)"); return }
                self.montrerApercu(u, echelle, call)
            }.resume()
            return
        }
        guard let fichier = url else { call.reject("aperçu : rien à montrer (chemin, base64 ou url)"); return }
        montrerApercu(fichier, echelle, call)
    }
    private func montrerApercu(_ fichier: URL, _ echelle: Bool, _ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.apercuURL = fichier
            self.apercuEchelleReelle = echelle
            let ql = QLPreviewController()
            ql.dataSource = self
            self.bridge?.viewController?.present(ql, animated: true)
            call.resolve(["ok": true])
        }
    }
    public func numberOfPreviewItems(in controller: QLPreviewController) -> Int { apercuURL == nil ? 0 : 1 }

    // 📸 (0.72) LA PHOTO D'UN XER (RS-7 15.10 : « quand tu screenshot vraiment, ça s'enregistre sur l'appli dans le cache, pour avoir plus de vues
    // rapidement sans devoir les fetch, juste nativement du téléphone ») : ce que montre la page, rendu par WebKit (takeSnapshot), à demi-largeur,
    // en JPEG dans Caches/xers/<id>.jpg (régénérable : iOS peut le vider s'il manque de place) ; rend son chemin
    @objc func capturerXer(_ call: CAPPluginCall) {
        let brut = call.getString("id") ?? "accueil"
        let propre = String(brut.map { ($0.isLetter || $0.isNumber || $0 == "-" || $0 == "_") ? $0 : "-" })
        let id = String(propre.prefix(80))
        DispatchQueue.main.async {
            guard let web = self.bridge?.webView else { call.reject("capture : pas de page"); return }
            let reglage = WKSnapshotConfiguration()
            reglage.snapshotWidth = NSNumber(value: Double(web.bounds.width) * 0.5)
            web.takeSnapshot(with: reglage) { image, erreur in
                guard let image = image, let jpeg = image.jpegData(compressionQuality: 0.72) else { call.reject("capture : " + (erreur?.localizedDescription ?? "rien")); return }
                let fm = FileManager.default
                guard let caches = fm.urls(for: .cachesDirectory, in: .userDomainMask).first else { call.reject("capture : pas de cache"); return }
                let dossier = caches.appendingPathComponent("xers", isDirectory: true)
                try? fm.createDirectory(at: dossier, withIntermediateDirectories: true)
                let fichier = dossier.appendingPathComponent(id + ".jpg")
                do {
                    try jpeg.write(to: fichier, options: .atomic)
                    call.resolve(["chemin": fichier.path, "largeur": Double(image.size.width), "hauteur": Double(image.size.height)])
                } catch { call.reject("capture : " + error.localizedDescription) }
            }
        }
    }
    public func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        let u = apercuURL ?? URL(fileURLWithPath: "/")
        #if !PLOXI0N_SANS_AR
        if apercuEchelleReelle, ["usdz", "reality"].contains(u.pathExtension.lowercased()) {
            let item = ARQuickLookPreviewItem(fileAt: u)
            item.allowsContentScaling = false
            return item
        }
        #endif
        return u as NSURL
    }

    // ♫ À L'ÉCOUTE (0.48, RS-7 : l'écran verrouillé disait « Spotify Embedded Player », sans pochette, ±10 s au lieu de ⏮ ⏭). Le son des
    // ploxions joue souvent dans un iframe d'un autre site (le SDK de Spotify) : la page (maintenant.js) sait ce qui joue et le publie ici —
    // titre, artiste, album, pochette, durée, position — dans MPNowPlayingInfoCenter ; les commandes (écran verrouillé, Centre de contrôle,
    // écouteurs) reviennent à la page par l'événement « lecture » { commande: play | pause | toggle | suivant | precedent | seekto, position }.
    // La pochette est aussi copiée dans l'App Group (lecture.jpg) pour le widget « À l'écoute ».
    private var commandesBranchees = false
    private var pochetteURL = ""
    private var pochette: MPMediaItemArtwork?
    private var infoLecture: [String: Any] = [:]
    @objc func lecture(_ call: CAPPluginCall) {
        let image = call.getString("image") ?? ""
        let suivant = call.getBool("suivant") ?? true, precedent = call.getBool("precedent") ?? true
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: call.getString("titre") ?? "",
            MPMediaItemPropertyArtist: call.getString("artiste") ?? "",
            MPMediaItemPropertyAlbumTitle: call.getString("album") ?? "",
            MPNowPlayingInfoPropertyElapsedPlaybackTime: call.getDouble("position") ?? 0,
            MPNowPlayingInfoPropertyPlaybackRate: (call.getBool("enLecture") ?? true) ? 1.0 : 0.0,
            MPNowPlayingInfoPropertyMediaType: MPNowPlayingInfoMediaType.audio.rawValue,
        ]
        let duree = call.getDouble("duree") ?? 0
        if duree > 0 { info[MPMediaItemPropertyPlaybackDuration] = duree }
        DispatchQueue.main.async {
            self.brancherCommandes()
            let c = MPRemoteCommandCenter.shared()
            c.nextTrackCommand.isEnabled = suivant
            c.previousTrackCommand.isEnabled = precedent
            if let p = self.pochette, self.pochetteURL == image { info[MPMediaItemPropertyArtwork] = p }
            self.infoLecture = info
            MPNowPlayingInfoCenter.default().nowPlayingInfo = info
            call.resolve()
            if image != self.pochetteURL { self.chargerPochette(image) }
        }
    }
    @objc func lectureFin(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.infoLecture = [:]
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
            call.resolve()
        }
    }
    private func chargerPochette(_ adresse: String) {
        pochetteURL = adresse; pochette = nil
        guard let url = URL(string: adresse), url.scheme == "https" else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            guard let self = self, let data = data, let img = UIImage(data: data) else { return }
            // pour le widget : une copie réduite dans l'App Group
            if let dossier = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.ch.j0bot.ploxi0n") {
                let petite = UIGraphicsImageRenderer(size: CGSize(width: 300, height: 300)).image { _ in img.draw(in: CGRect(x: 0, y: 0, width: 300, height: 300)) }
                try? petite.jpegData(compressionQuality: 0.85)?.write(to: dossier.appendingPathComponent("lecture.jpg"), options: .atomic)
                UserDefaults(suiteName: "group.ch.j0bot.ploxi0n")?.set(adresse, forKey: "ploxi0n.lecture-pochette")
            }
            DispatchQueue.main.async {
                guard self.pochetteURL == adresse else { return }
                let art = MPMediaItemArtwork(boundsSize: img.size) { _ in img }
                self.pochette = art
                if !self.infoLecture.isEmpty {
                    self.infoLecture[MPMediaItemPropertyArtwork] = art
                    MPNowPlayingInfoCenter.default().nowPlayingInfo = self.infoLecture
                }
                WidgetCenter.shared.reloadAllTimelines()
            }
        }.resume()
    }
    private func brancherCommandes() {
        if commandesBranchees { return }
        commandesBranchees = true
        UIApplication.shared.beginReceivingRemoteControlEvents()
        let c = MPRemoteCommandCenter.shared()
        let relayer: (String, Double?) -> MPRemoteCommandHandlerStatus = { [weak self] commande, position in
            var d: [String: Any] = ["commande": commande]
            if let p = position { d["position"] = p }
            self?.notifyListeners("lecture", data: d)
            return .success
        }
        c.playCommand.addTarget { _ in relayer("play", nil) }
        c.pauseCommand.addTarget { _ in relayer("pause", nil) }
        c.togglePlayPauseCommand.addTarget { _ in relayer("toggle", nil) }
        c.nextTrackCommand.addTarget { _ in relayer("suivant", nil) }
        c.previousTrackCommand.addTarget { _ in relayer("precedent", nil) }
        c.changePlaybackPositionCommand.addTarget { e in
            guard let e = e as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            return relayer("seekto", e.positionTime)
        }
        // ⏮ ⏭ plutôt que ±10 s
        c.skipForwardCommand.isEnabled = false
        c.skipBackwardCommand.isEnabled = false
        let actives: [MPRemoteCommand] = [c.playCommand, c.pauseCommand, c.togglePlayPauseCommand, c.nextTrackCommand, c.previousTrackCommand, c.changePlaybackPositionCommand]
        for x in actives { x.isEnabled = true }
    }

    // ☀ L'ÉCRAN RESTE ALLUMÉ (0.47, navigator.wakeLock des ploxions → web-natif.js) : tant qu'un ploxion le tient, iOS ne met pas l'écran en veille
    @objc func ecranEveille(_ call: CAPPluginCall) {
        let actif = call.getBool("actif") ?? true
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = actif
            call.resolve(["actif": actif])
        }
    }

    // LE MOUVEMENT (RS-7 12.10 : « des effets avec le gyroscope et l'accéléromètre ») : CoreMotion, sans permission à demander.
    // mouvementDebut({ hz }) → l'événement « mouvement » : attitude (roll, pitch, yaw), gravité (gx, gy, gz), accélération propre
    // (ax, ay, az, en g), rotation (rx, ry, rz). La page l'arrête dès qu'elle n'est plus visible (mouvementFin).
    private let mouvements = CMMotionManager()
    @objc func mouvementDebut(_ call: CAPPluginCall) {
        guard mouvements.isDeviceMotionAvailable else { call.reject("pas de gyroscope sur cet appareil"); return }
        let hz = max(5.0, min(60.0, call.getDouble("hz") ?? 30))
        mouvements.deviceMotionUpdateInterval = 1.0 / hz
        if !mouvements.isDeviceMotionActive {
            // (0.71, le terrax) LE NORD : le repère du nord magnétique quand l'iPhone l'a (le magnétomètre) ; « cap » = m.heading, en degrés
            // depuis le nord, sens horaire (−1 sans boussole). Personne ne lisait le lacet : le thème et la fractale ne lisent que la gravité.
            let repere: CMAttitudeReferenceFrame = CMMotionManager.availableAttitudeReferenceFrames().contains(.xMagneticNorthZVertical) ? .xMagneticNorthZVertical : .xArbitraryZVertical
            mouvements.startDeviceMotionUpdates(using: repere, to: .main) { [weak self] m, _ in
                guard let m = m else { return }
                self?.notifyListeners("mouvement", data: [
                    "cap": repere == .xMagneticNorthZVertical ? m.heading : -1.0,
                    "roll": m.attitude.roll, "pitch": m.attitude.pitch, "yaw": m.attitude.yaw,
                    "gx": m.gravity.x, "gy": m.gravity.y, "gz": m.gravity.z,
                    "ax": m.userAcceleration.x, "ay": m.userAcceleration.y, "az": m.userAcceleration.z,
                    "rx": m.rotationRate.x, "ry": m.rotationRate.y, "rz": m.rotationRate.z])
            }
        }
        call.resolve()
    }
    @objc func mouvementFin(_ call: CAPPluginCall) { mouvements.stopDeviceMotionUpdates(); call.resolve() }

    // ---- 🏠 HomeKit (RS-7 12.10 : les capabilities « pour aller de l'avant » — les KIONS dans le réel) ----
    private var maison: HMHomeManager?
    private var maisonChargee = false
    private var enAttente: [(HMHomeManager) -> Void] = []
    private func quandMaisonPrete(_ f: @escaping (HMHomeManager) -> Void) {
        DispatchQueue.main.async {
            if let m = self.maison, self.maisonChargee { f(m); return }
            self.enAttente.append(f)
            if self.maison == nil { let m = HMHomeManager(); m.delegate = self; self.maison = m }
        }
    }
    public func homeManagerDidUpdateHomes(_ manager: HMHomeManager) {
        maisonChargee = true
        let l = enAttente; enAttente = []
        l.forEach { $0(manager) }
    }
    private func interrupteur(_ a: HMAccessory) -> HMCharacteristic? {
        for s in a.services { for c in s.characteristics where c.characteristicType == HMCharacteristicTypePowerState { return c } }
        return nil
    }
    @objc func maisonListe(_ call: CAPPluginCall) {
        quandMaisonPrete { m in
            var l: [[String: Any]] = []
            for home in m.homes {
                for a in home.accessories {
                    let c = self.interrupteur(a)
                    l.append(["id": a.uniqueIdentifier.uuidString, "nom": a.name, "piece": a.room?.name ?? "", "maison": home.name,
                              "allume": (c?.value as? Bool) ?? false, "basculable": c != nil, "joignable": a.isReachable])
                }
            }
            call.resolve(["accessoires": l])
        }
    }
    @objc func maisonBasculer(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else { call.reject("id manquant"); return }
        quandMaisonPrete { m in
            for home in m.homes {
                for a in home.accessories where a.uniqueIdentifier.uuidString == id {
                    guard let c = self.interrupteur(a) else { call.reject("cet accessoire n'a pas d'interrupteur"); return }
                    let v: Bool = call.getBool("allume") ?? !((c.value as? Bool) ?? false)
                    c.writeValue(v) { err in
                        if let err = err { call.reject("HomeKit : \(err.localizedDescription)") } else { call.resolve(["allume": v]) }
                    }
                    return
                }
            }
            call.reject("accessoire introuvable")
        }
    }

    // ---- 📶 rejoindre un Wi-Fi (le boxion, depuis un QR) ----
    @objc func wifiRejoindre(_ call: CAPPluginCall) {
        guard let ssid = call.getString("ssid"), !ssid.isEmpty else { call.reject("ssid manquant"); return }
        let mdp = call.getString("mdp") ?? ""
        let conf = mdp.isEmpty ? NEHotspotConfiguration(ssid: ssid) : NEHotspotConfiguration(ssid: ssid, passphrase: mdp, isWEP: false)
        conf.joinOnce = false
        NEHotspotConfigurationManager.shared.apply(conf) { err in
            if let e = err as NSError?, e.code != NEHotspotConfigurationError.alreadyAssociated.rawValue { call.reject("Wi-Fi : \(e.localizedDescription)") }
            else { call.resolve(["ok": true, "ssid": ssid]) }
        }
    }

    // ---- 🎮 Game Center (le clicker du xerboxion, pourriture-4) ----
    @objc func gameCenter(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if GKLocalPlayer.local.isAuthenticated { call.resolve(["connecte": true, "nom": GKLocalPlayer.local.displayName]); return }
            var fini = false
            GKLocalPlayer.local.authenticateHandler = { vc, err in
                if let vc = vc { self.bridge?.viewController?.present(vc, animated: true); return }
                if fini { return }
                fini = true
                if let err = err { call.reject("Game Center : \(err.localizedDescription)"); return }
                call.resolve(["connecte": GKLocalPlayer.local.isAuthenticated, "nom": GKLocalPlayer.local.displayName])
            }
        }
    }
    @objc func gameCenterScore(_ call: CAPPluginCall) {
        guard let classement = call.getString("classement"), let score = call.getInt("score") else { call.reject("classement et score manquants"); return }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [classement]) { err in
            if let err = err { call.reject("Game Center : \(err.localizedDescription)") } else { call.resolve(["ok": true]) }
        }
    }

    @objc func meteo(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { call.reject("WeatherKit : iOS 16 ou plus"); return }
        guard let lat = call.getDouble("lat"), let lng = call.getDouble("lng") else { call.reject("lat et lng manquants"); return }
        Task {
            do {
                let w = try await WeatherService.shared.weather(for: CLLocation(latitude: lat, longitude: lng))
                let c = w.currentWeather
                let iso = ISO8601DateFormatter()
                var jours: [[String: Any]] = []
                for d in w.dailyForecast.forecast.prefix(7) {
                    jours.append(["date": iso.string(from: d.date), "min": d.lowTemperature.converted(to: .celsius).value, "max": d.highTemperature.converted(to: .celsius).value,
                                  "symbole": d.symbolName, "pluie": d.precipitationChance])
                }
                call.resolve(["temperature": c.temperature.converted(to: .celsius).value, "ressentie": c.apparentTemperature.converted(to: .celsius).value,
                              "condition": c.condition.description, "symbole": c.symbolName, "humidite": c.humidity, "vent": c.wind.speed.converted(to: .kilometersPerHour).value,
                              "uv": c.uvIndex.value, "jours": jours, "attribution": " Weather", "attributionLien": "https://weatherkit.apple.com/legal-attribution.html"])
            } catch { call.reject("météo : \(error.localizedDescription)") }
        }
    }

    @objc func shazam(_ call: CAPPluginCall) {
        guard #available(iOS 17.0, *) else { call.reject("Shazam : iOS 17 ou plus"); return }
        Task {
            try? AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
            let session = SHManagedSession()
            let r = await session.result()
            try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
            switch r {
            case .match(let m):
                let i = m.mediaItems.first
                call.resolve(["trouve": true, "titre": i?.title ?? "", "artiste": i?.artist ?? "", "image": i?.artworkURL?.absoluteString ?? "",
                              "appleMusic": i?.appleMusicURL?.absoluteString ?? "", "isrc": i?.isrc ?? ""])
            case .noMatch(_):
                call.resolve(["trouve": false])
            case .error(let e, _):
                call.reject("Shazam : \(e.localizedDescription)")
            @unknown default:
                call.reject("Shazam : réponse inconnue")
            }
        }
    }

    @objc func musiqueChercher(_ call: CAPPluginCall) {
        let q = call.getString("q") ?? ""
        Task {
            let st = await MusicAuthorization.request()
            guard st == .authorized else { call.reject("Apple Music refusé : Réglages iOS › ploxi0n › Médias et Apple Music"); return }
            do {
                var req = MusicCatalogSearchRequest(term: q, types: [Song.self])
                req.limit = 15
                let res = try await req.response()
                var l: [[String: Any]] = []
                for s in res.songs {
                    l.append(["id": s.id.rawValue, "titre": s.title, "artiste": s.artistName, "album": s.albumTitle ?? "",
                              "image": s.artwork?.url(width: 300, height: 300)?.absoluteString ?? "", "duree": s.duration ?? 0])
                }
                call.resolve(["morceaux": l])
            } catch { call.reject("Apple Music : \(error.localizedDescription)") }
        }
    }

    @objc func musiqueJouer(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else { call.reject("id manquant"); return }
        Task {
            do {
                let req = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: MusicItemID(id))
                let res = try await req.response()
                guard let s = res.items.first else { call.reject("morceau introuvable"); return }
                await MainActor.run { ApplicationMusicPlayer.shared.queue = ApplicationMusicPlayer.Queue(for: [s]) }
                try await ApplicationMusicPlayer.shared.play()
                call.resolve(["ok": true])
            } catch { call.reject("lecture : \(error.localizedDescription) (il faut un abonnement Apple Music)") }
        }
    }

    @objc func musiquePause(_ call: CAPPluginCall) {
        Task { await MainActor.run { ApplicationMusicPlayer.shared.pause() }; call.resolve() }
    }
}

// 🎞 LE LECTEUR INTÉGRÉ (0.49, RS-7 : « pour le ploxion stremio, il faut lui donner un lecteur intégré » ; choix : Apple d'abord, VLC en repli).
//   ouvrir({ url, titre?, position? (s), moteur? auto|apple|vlc, entetes? {User-Agent, Referer…}, sousTitres? [url] }) → { moteur }
//   fermer() · moteurs() → { apple: true, vlc: bool }
//   événement « lecteur » : { etat: lecture | position | fin | ferme | erreur | repli, moteur, position, duree, raison? }
// APPLE (AVPlayerViewController) : MP4, MOV, HLS, HEVC, AC-3/E-AC-3 ; PiP, AirPlay, l'écran verrouillé, les sous-titres HLS — tout iOS.
// VLC (MobileVLCKit, seulement si le paquet est dans le build : option PLOXI0N_VLC) : MKV, AVI, WebM, DTS, sous-titres intégrés ou
// externes, choix des pistes. En « auto » : les conteneurs qu'iOS ne lit pas vont droit à VLC ; sinon Apple, et VLC si Apple échoue.
@objc(PloxiLecteur)
public class PloxiLecteur: CAPPlugin, CAPBridgedPlugin, AVPlayerViewControllerDelegate {
    public let identifier = "PloxiLecteur"
    public let jsName = "PloxiLecteur"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ouvrir", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fermer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "moteurs", returnType: CAPPluginReturnPromise),
    ]
    static var vlcDisponible: Bool {
        #if canImport(MobileVLCKit)
        return true
        #else
        return false
        #endif
    }
    private var appleVC: AVPlayerViewController?
    private var observations: [NSKeyValueObservation] = []
    private var finObs: NSObjectProtocol?
    private var periodique: Any?
    private var enPiP = false
    private var derniere: (position: Double, duree: Double) = (0, 0)
    #if canImport(MobileVLCKit)
    private var ecranVLC: EcranVLC?
    #endif

    @objc func moteurs(_ call: CAPPluginCall) { call.resolve(["apple": true, "vlc": PloxiLecteur.vlcDisponible]) }

    // (0.54, RS-7 : « ça prend tout l'écran et ça crash ») présenter depuis le contrôleur du DESSUS (une feuille, Safari, l'aperçu peuvent
    // déjà être là), et jamais un contrôleur déjà présenté (UIKit lève une exception : le plantage)
    // (0.63) false : le dessus est encore en train d'entrer — UIKit ignorerait la présentation, et le lecteur jouerait sans écran (le son fantôme)
    @discardableResult private func presenter(_ vc: UIViewController) -> Bool {
        guard var haut = bridge?.viewController else { return false }
        while let p = haut.presentedViewController, !p.isBeingDismissed { haut = p }
        if vc.presentingViewController != nil || vc.isBeingPresented || haut === vc { return true }
        if haut.isBeingPresented { return false }
        haut.present(vc, animated: true)
        return true
    }

    private func emettre(_ etat: String, _ moteur: String, _ extra: [String: Any] = [:]) {
        var d: [String: Any] = ["etat": etat, "moteur": moteur, "position": derniere.position, "duree": derniere.duree]
        for (k, v) in extra { d[k] = v }
        notifyListeners("lecteur", data: d)
    }

    @objc func ouvrir(_ call: CAPPluginCall) {
        guard let adresse = call.getString("url"), let url = URL(string: adresse) else { call.reject("url manquante ou illisible"); return }
        let titre = call.getString("titre") ?? ""
        let position = call.getDouble("position") ?? 0
        let moteur = call.getString("moteur") ?? "auto"
        var entetes: [String: String] = [:]
        for (k, v) in call.getObject("entetes") ?? [:] { if let t = v as? String { entetes[k] = t } }
        let sousTitres = (call.getArray("sousTitres", String.self) ?? []).compactMap { URL(string: $0) }
        let illisibleParApple = ["mkv", "avi", "webm", "wmv", "flv", "m2ts", "vob", "ogv", "divx", "rmvb"].contains(url.pathExtension.lowercased())
        DispatchQueue.main.async {
            // (0.63) jamais quand l'app n'est pas au premier plan (une alerte, Face ID, le Centre de contrôle, l'arrière-plan)
            guard UIApplication.shared.applicationState == .active else { call.reject("l'app n'est pas au premier plan"); return }
            self.toutFermer()
            self.derniere = (position, 0)
            if moteur == "vlc" || (moteur == "auto" && illisibleParApple && PloxiLecteur.vlcDisponible) {
                if self.ouvrirVLC(url, titre: titre, position: position, entetes: entetes, sousTitres: sousTitres) { call.resolve(["moteur": "vlc"]); return }
            }
            self.ouvrirApple(url, titre: titre, position: position, entetes: entetes, sousTitres: sousTitres, repli: moteur != "apple" && PloxiLecteur.vlcDisponible)
            call.resolve(["moteur": "apple"])
        }
    }

    @objc func fermer(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.toutFermer(); call.resolve() }
    }

    private func toutFermer() {
        if let vc = appleVC {
            vc.player?.pause()
            if let p = periodique { vc.player?.removeTimeObserver(p) }
            vc.dismiss(animated: false)
        }
        periodique = nil; observations = []; appleVC = nil; enPiP = false
        if let o = finObs { NotificationCenter.default.removeObserver(o) }
        finObs = nil
        #if canImport(MobileVLCKit)
        if let e = ecranVLC { e.arreter(); e.dismiss(animated: false) }
        ecranVLC = nil
        #endif
    }

    // ---- Apple ----
    private func ouvrirApple(_ url: URL, titre: String, position: Double, entetes: [String: String], sousTitres: [URL], repli: Bool) {
        let options: [String: Any] = entetes.isEmpty ? [:] : ["AVURLAssetHTTPHeaderFieldsKey": entetes]
        let item = AVPlayerItem(asset: AVURLAsset(url: url, options: options))
        let lecteur = AVPlayer(playerItem: item)
        let vc = AVPlayerViewController()
        vc.player = lecteur
        vc.delegate = self
        vc.allowsPictureInPicturePlayback = true
        vc.canStartPictureInPictureAutomaticallyFromInline = true   // (0.54) le PiP automatique en quittant l'app
        vc.updatesNowPlayingInfoCenter = true
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
        try? AVAudioSession.sharedInstance().setActive(true)   // sans session active, ni PiP ni son en arrière-plan
        vc.modalPresentationStyle = .fullScreen
        appleVC = vc
        var pret = false
        observations.append(item.observe(\.status, options: [.new]) { [weak self] it, _ in
            DispatchQueue.main.async {
                guard let self = self, self.appleVC === vc else { return }   // (0.63) remplacé entre-temps : ni son fantôme, ni l'appleVC du suivant effacé
                if it.status == .readyToPlay && !pret {
                    pret = true
                    if position > 1 { lecteur.seek(to: CMTime(seconds: position, preferredTimescale: 600)) }
                    lecteur.play()
                    self.emettre("lecture", "apple")
                } else if it.status == .failed {
                    let raison = it.error?.localizedDescription ?? "format non lu par iOS"
                    // (0.63) un échec PENDANT l'entrée (un MKV refusé d'emblée) : UIKit ignore le dismiss, le lecteur noir reste (« ça reste bloqué ») → après l'entrée
                    let renvoyer: (Bool, (() -> Void)?) -> Void = { anime, puis in
                        if vc.isBeingPresented, let tc = vc.transitionCoordinator { tc.animate(alongsideTransition: nil) { _ in vc.dismiss(animated: anime, completion: puis) } } else { vc.dismiss(animated: anime, completion: puis) }
                    }
                    if repli {
                        self.emettre("repli", "apple", ["raison": raison])
                        renvoyer(false, { _ = self.ouvrirVLC(url, titre: titre, position: position, entetes: entetes, sousTitres: sousTitres) })
                        self.appleVC = nil
                    } else {
                        self.emettre("erreur", "apple", ["raison": raison])
                        renvoyer(true, nil)
                        self.appleVC = nil
                    }
                }
            }
        })
        finObs = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak self] _ in self?.emettre("fin", "apple") }
        periodique = lecteur.addPeriodicTimeObserver(forInterval: CMTime(seconds: 5, preferredTimescale: 1), queue: .main) { [weak self] t in
            guard let self = self else { return }
            let d = item.duration.seconds
            self.derniere = (t.seconds.isFinite ? t.seconds : 0, d.isFinite ? d : 0)
            self.emettre("position", "apple")
        }
        if !presenter(vc) { toutFermer(); emettre("erreur", "apple", ["raison": "un autre écran s'ouvre encore : réessaie"]) }   // (0.63) pas de lecteur sans écran
    }
    // ✕ (ou glisser vers le bas) : la fin du plein écran = fermé, sauf si l'image passe en PiP
    public func playerViewController(_ playerViewController: AVPlayerViewController, willEndFullScreenPresentationWithAnimationCoordinator coordinator: UIViewControllerTransitionCoordinator) {
        coordinator.animate(alongsideTransition: nil) { [weak self] ctx in
            // (0.63) seulement le lecteur d'aujourd'hui : celui que toutFermer() remplace émettait « ferme » au milieu de l'ouverture du suivant
            guard let self = self, playerViewController === self.appleVC, !ctx.isCancelled, !self.enPiP else { return }
            playerViewController.player?.pause()
            self.emettre("ferme", "apple")
        }
    }
    public func playerViewControllerWillStartPictureInPicture(_ playerViewController: AVPlayerViewController) { enPiP = true }
    public func playerViewControllerDidStopPictureInPicture(_ playerViewController: AVPlayerViewController) {
        guard playerViewController === appleVC else { return }   // (0.63) le PiP d'un lecteur remplacé : rien pour celui d'aujourd'hui
        enPiP = false
        if playerViewController.presentingViewController == nil { emettre("ferme", "apple") }
    }
    public func playerViewController(_ playerViewController: AVPlayerViewController, restoreUserInterfaceForPictureInPictureStopWithCompletionHandler completionHandler: @escaping (Bool) -> Void) {
        if playerViewController.presentingViewController != nil || playerViewController.isBeingPresented { completionHandler(true); return }
        // (0.63) un PiP d'un lecteur remplacé, ou personne pour le présenter : il se ferme (et completionHandler est TOUJOURS appelé)
        guard playerViewController === appleVC, var haut = bridge?.viewController else { completionHandler(false); return }
        while let p = haut.presentedViewController, !p.isBeingDismissed { haut = p }
        if haut.presentedViewController != nil || haut.isBeingPresented { completionHandler(false); return }
        haut.present(playerViewController, animated: true) { completionHandler(true) }
    }

    // ---- VLC ----
    private func ouvrirVLC(_ url: URL, titre: String, position: Double, entetes: [String: String], sousTitres: [URL]) -> Bool {
        #if canImport(MobileVLCKit)
        let e = EcranVLC(url: url, titre: titre, depart: position, entetes: entetes, sousTitres: sousTitres)
        e.surEvenement = { [weak self] etat, pos, duree in
            guard let self = self else { return }
            self.derniere = (pos, duree)
            self.emettre(etat, "vlc")
            if etat == "ferme" { self.ecranVLC = nil }
        }
        ecranVLC = e
        presenter(e)
        return true
        #else
        emettre("erreur", "vlc", ["raison": "VLC n'est pas dans ce build (option PLOXI0N_VLC)"])
        return false
        #endif
    }
}

#if canImport(MobileVLCKit)
/** l'écran du lecteur VLC : l'image, et des commandes qui s'effacent (toucher pour les revoir) */
final class EcranVLC: UIViewController, VLCMediaPlayerDelegate {
    let lecteur = VLCMediaPlayer()
    var surEvenement: ((String, Double, Double) -> Void)?
    private let url: URL, titre: String, depart: Double, entetes: [String: String], sousTitres: [URL]
    private let image = UIView()
    private let commandes = UIView()
    private let curseur = UISlider()
    private let temps = UILabel()
    private let bLecture = UIButton(type: .system)
    private var positionne = false
    private var dernierEnvoi = Date.distantPast

    init(url: URL, titre: String, depart: Double, entetes: [String: String], sousTitres: [URL]) {
        self.url = url; self.titre = titre; self.depart = depart; self.entetes = entetes; self.sousTitres = sousTitres
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .fullScreen
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) non utilisé") }

    private var secondes: Double { Double(lecteur.time.intValue) / 1000 }
    private var duree: Double { Double(lecteur.media?.length.intValue ?? 0) / 1000 }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        image.frame = view.bounds
        image.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(image)
        lecteur.drawable = image
        lecteur.delegate = self
        let media = VLCMedia(url: url)
        if let ua = entetes["User-Agent"] { media.addOption(":http-user-agent=\(ua)") }
        if let ref = entetes["Referer"] { media.addOption(":http-referrer=\(ref)") }
        lecteur.media = media
        for s in sousTitres { lecteur.addPlaybackSlave(s, type: .subtitle, enforce: false) }
        construire()
        view.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(basculer)))
        lecteur.play()
    }
    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }

    private func bouton(_ symbole: String, _ action: Selector) -> UIButton {
        let b = UIButton(type: .system)
        b.setImage(UIImage(systemName: symbole), for: .normal)
        b.tintColor = .white
        b.addTarget(self, action: action, for: .touchUpInside)
        b.widthAnchor.constraint(equalToConstant: 44).isActive = true
        b.heightAnchor.constraint(equalToConstant: 44).isActive = true
        return b
    }
    private func construire() {
        commandes.backgroundColor = UIColor.black.withAlphaComponent(0.35)
        commandes.frame = view.bounds
        commandes.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(commandes)
        let nom = UILabel()
        nom.text = titre.isEmpty ? url.lastPathComponent : titre
        nom.textColor = .white
        nom.font = .boldSystemFont(ofSize: 15)
        nom.lineBreakMode = .byTruncatingTail
        let haut = UIStackView(arrangedSubviews: [bouton("xmark", #selector(fermer)), nom, bouton("speaker.wave.2", #selector(pistesAudio)), bouton("captions.bubble", #selector(pistesSousTitres))])
        haut.spacing = 8
        haut.alignment = .center
        bLecture.setImage(UIImage(systemName: "pause.fill"), for: .normal)
        bLecture.tintColor = .white
        bLecture.addTarget(self, action: #selector(lectureOuPause), for: .touchUpInside)
        bLecture.widthAnchor.constraint(equalToConstant: 64).isActive = true
        bLecture.heightAnchor.constraint(equalToConstant: 64).isActive = true
        let milieu = UIStackView(arrangedSubviews: [bouton("gobackward.10", #selector(reculer)), bLecture, bouton("goforward.10", #selector(avancer))])
        milieu.spacing = 36
        milieu.alignment = .center
        curseur.isContinuous = false
        curseur.minimumTrackTintColor = UIColor(red: 0.47, green: 0.85, blue: 0.64, alpha: 1)
        curseur.addTarget(self, action: #selector(chercher), for: .valueChanged)
        temps.textColor = .white
        temps.font = .monospacedDigitSystemFont(ofSize: 12, weight: .medium)
        temps.text = "0:00"
        let bas = UIStackView(arrangedSubviews: [curseur, temps])
        bas.spacing = 10
        bas.alignment = .center
        for v in [haut, milieu, bas] { v.translatesAutoresizingMaskIntoConstraints = false; commandes.addSubview(v) }
        let g = commandes.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            haut.topAnchor.constraint(equalTo: g.topAnchor, constant: 8), haut.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 12), haut.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12),
            milieu.centerXAnchor.constraint(equalTo: commandes.centerXAnchor), milieu.centerYAnchor.constraint(equalTo: commandes.centerYAnchor),
            bas.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -12), bas.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 16), bas.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -16),
        ])
    }
    private func horaire(_ s: Double) -> String {
        let t = Int(max(0, s)), h = t / 3600, m = (t % 3600) / 60, sec = t % 60
        return h > 0 ? String(format: "%d:%02d:%02d", h, m, sec) : String(format: "%d:%02d", m, sec)
    }

    @objc private func basculer() { UIView.animate(withDuration: 0.2) { self.commandes.alpha = self.commandes.alpha > 0.5 ? 0 : 1 } }
    @objc private func lectureOuPause() {
        if lecteur.isPlaying { lecteur.pause() } else { lecteur.play() }
    }
    @objc private func reculer() { lecteur.jumpBackward(10) }
    @objc private func avancer() { lecteur.jumpForward(10) }
    @objc private func chercher() { lecteur.position = curseur.value }
    @objc private func fermer() {
        let p = secondes, d = duree
        arreter()
        dismiss(animated: true)
        surEvenement?("ferme", p, d)
    }
    func arreter() { lecteur.stop() }

    private func choisir(_ titreFeuille: String, noms: [Any]?, index: [Any]?, actuel: Int32, appliquer: @escaping (Int32) -> Void) {
        let n = (noms ?? []).compactMap { $0 as? String }, i = (index ?? []).compactMap { ($0 as? NSNumber)?.int32Value }
        let feuille = UIAlertController(title: titreFeuille, message: nil, preferredStyle: .actionSheet)
        for (nom, k) in zip(n, i) {
            feuille.addAction(UIAlertAction(title: (k == actuel ? "✓ " : "") + nom, style: .default) { _ in appliquer(k) })
        }
        feuille.addAction(UIAlertAction(title: "Annuler", style: .cancel))
        feuille.popoverPresentationController?.sourceView = view
        present(feuille, animated: true)
    }
    @objc private func pistesAudio() {
        choisir("Piste audio", noms: lecteur.audioTrackNames, index: lecteur.audioTrackIndexes, actuel: lecteur.currentAudioTrackIndex) { [weak self] k in self?.lecteur.currentAudioTrackIndex = k }
    }
    @objc private func pistesSousTitres() {
        choisir("Sous-titres", noms: lecteur.videoSubTitlesNames, index: lecteur.videoSubTitlesIndexes, actuel: lecteur.currentVideoSubTitleIndex) { [weak self] k in self?.lecteur.currentVideoSubTitleIndex = k }
    }

    func mediaPlayerStateChanged(_ aNotification: Notification) {
        switch lecteur.state {
        case .playing:
            bLecture.setImage(UIImage(systemName: "pause.fill"), for: .normal)
            if !positionne { positionne = true; if depart > 1 { lecteur.time = VLCTime(int: Int32(depart * 1000)) }; surEvenement?("lecture", secondes, duree) }
        case .paused:
            bLecture.setImage(UIImage(systemName: "play.fill"), for: .normal)
        case .ended:
            surEvenement?("fin", secondes, duree)
        case .error:
            surEvenement?("erreur", secondes, duree)
        default:
            break
        }
    }
    func mediaPlayerTimeChanged(_ aNotification: Notification) {
        let s = secondes, d = duree
        if !curseur.isTracking, d > 0 { curseur.value = Float(s / d) }
        temps.text = horaire(s) + (d > 0 ? " / " + horaire(d) : "")
        if Date().timeIntervalSince(dernierEnvoi) > 5 { dernierEnvoi = Date(); surEvenement?("position", s, d) }
    }
}
#endif

// 👁 L'AR NATIVE (0.73). RS-7 (15.10) : « le plus important de tout, c'est l'AR ; utiliser au max les fonctions natives ; et AR Quick Look ».
// ARKit + RealityKit, sans bibliothèque. Le terrax (src/terrax/terrax.js) l'appelle ; les autres ploxions par jOSNatif.ar.
//   disponible()   → { ar, lidar, piece, chambre, pieces }   (chambre : la carte de ta chambre est gardée ; pieces : le dossier des scans)
//   ouvrir({ mode: terre | chambre, objets: [{ id, x, y, z, taille, emoji, texte }], emojis, maillage })   l'AR en plein écran.
//       terre   : le monde aligné sur la gravité ET le nord (x = est, z = sud, en mètres depuis l'iPhone à l'ouverture) : la page place
//                 chaque objet à sa vraie direction et sa distance (GPS) ;
//       chambre : la carte de ta chambre (ARWorldMap, Documents/terrax/chambre) est rechargée : tes objets reviennent à leur place exacte.
//     LiDAR : le maillage du réel cache ce qui est derrière un mur, un meuble, une personne ; on peut le montrer (◇).
//     Toucher le réel : poser là (le rayon sur la surface touchée) ; toucher un objet : le voir. Événement « ar » :
//       { type: pose, id, x, y, z, emoji, texte } · { type: touche, id } · { type: chambre-neuve } · { type: ferme }
//   fermer()
//   scannerPiece() → { nom, chemin }   RoomPlan (iOS 16, LiDAR) : la pièce en USDZ dans Documents/terrax/pieces ; elle s'ouvre ensuite en
//     AR Quick Look (PloxiApple.apercu, echelleReelle : la pièce posée à l'échelle 1).
//   capturerObjet() → { nom, chemin }  (0.74) Object Capture (iOS 17, LiDAR) : ton objet réel en modèle 3D (USDZ, Documents/terrax/objets),
//     vu en AR Quick Look et posé dans l'AR (ouvrir : objets[].modele, rot ; modeles : [{ nom, texte }] proposés quand on pose).
#if !PLOXI0N_SANS_AR
@objc(PloxiAR)
public class PloxiAR: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PloxiAR"
    public let jsName = "PloxiAR"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "disponible", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ouvrir", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fermer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scannerPiece", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "capturerObjet", returnType: CAPPluginReturnPromise),
    ]
    private weak var ecran: TerraxVC?

    static func dossier(_ nom: String) -> URL? {
        guard let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return nil }
        let d = docs.appendingPathComponent("terrax", isDirectory: true).appendingPathComponent(nom, isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }
    static var carteChambre: URL? { dossier("chambre")?.appendingPathComponent("chambre.arworldmap") }

    @objc func disponible(_ call: CAPPluginCall) {
        var piece = false
        #if canImport(RoomPlan)
        if #available(iOS 16.0, *) { piece = RoomCaptureSession.isSupported }
        #endif
        let carte = PloxiAR.carteChambre.map { FileManager.default.fileExists(atPath: $0.path) } ?? false
        let base: [String: Any] = [
            "ar": ARWorldTrackingConfiguration.isSupported,
            "lidar": ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh),
            "piece": piece,
            "chambre": carte,
            "pieces": PloxiAR.dossier("pieces")?.path ?? "",
            "objets": PloxiAR.dossier("objets")?.path ?? "",
        ]
        // ObjectCaptureSession.isSupported ne se lit que sur l'acteur principal
        Task { @MainActor in
            var d = base
            var objet = false
            if #available(iOS 17.0, *) { objet = ObjectCaptureSession.isSupported && PhotogrammetrySession.isSupported }
            d["objet"] = objet
            call.resolve(d)
        }
    }

    @objc func ouvrir(_ call: CAPPluginCall) {
        guard ARWorldTrackingConfiguration.isSupported else { call.reject("l'AR n'est pas sur cet appareil"); return }
        let objets = call.getArray("objets", JSObject.self) ?? []
        let chambre = call.getString("mode") == "chambre"
        let emojis = call.getArray("emojis", String.self) ?? []
        let maillage = call.getBool("maillage") ?? false
        let modeles = call.getArray("modeles", JSObject.self) ?? []
        DispatchQueue.main.async {
            guard let hote = self.bridge?.viewController else { call.reject("AR : pas de page"); return }
            if self.ecran != nil { call.reject("l'AR est déjà ouverte"); return }
            let vc = TerraxVC()
            vc.chambre = chambre
            vc.objets = objets
            if !emojis.isEmpty { vc.emojis = emojis }
            vc.maillageVisible = maillage
            vc.modeles = modeles
            vc.surEvenement = { [weak self] d in self?.notifyListeners("ar", data: d) }
            vc.modalPresentationStyle = .fullScreen
            self.ecran = vc
            hote.present(vc, animated: true)
            call.resolve(["ok": true])
        }
    }

    @objc func fermer(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.ecran?.fermer()
            call.resolve(["ok": true])
        }
    }

    @objc func scannerPiece(_ call: CAPPluginCall) {
        #if canImport(RoomPlan)
        if #available(iOS 16.0, *) {
            guard RoomCaptureSession.isSupported else { call.reject("le scan de pièce demande le LiDAR (iPhone Pro, iPad Pro)"); return }
            DispatchQueue.main.async {
                guard let hote = self.bridge?.viewController else { call.reject("scan : pas de page"); return }
                let vc = PieceVC()
                vc.modalPresentationStyle = .fullScreen
                vc.fini = { u, erreur in
                    if let u = u { call.resolve(["nom": u.lastPathComponent, "chemin": u.path]) } else { call.reject(erreur ?? "scan annulé") }
                }
                hote.present(vc, animated: true)
            }
            return
        }
        #endif
        call.reject("le scan de pièce demande iOS 16 et le LiDAR")
    }

    @objc func capturerObjet(_ call: CAPPluginCall) {
        guard #available(iOS 17.0, *) else { call.reject("la capture d'objet demande iOS 17 et le LiDAR"); return }
        Task { @MainActor in
            guard ObjectCaptureSession.isSupported, PhotogrammetrySession.isSupported else {
                call.reject("la capture d'objet demande le LiDAR (iPhone 12 Pro ou plus récent)"); return
            }
            guard let hote = self.bridge?.viewController else { call.reject("capture : pas de page"); return }
            let vc = ObjetVC()
            vc.modalPresentationStyle = .fullScreen
            vc.fini = { u, erreur in
                if let u = u { call.resolve(["nom": u.lastPathComponent, "chemin": u.path]) } else { call.reject(erreur ?? "capture annulée") }
            }
            hote.present(vc, animated: true)
        }
    }
}

// l'écran de l'AR : une ARView (RealityKit) sans configuration automatique, le guide d'Apple (ARCoachingOverlayView) par-dessus
final class TerraxVC: UIViewController, ARSessionDelegate {
    var chambre = false
    var objets: [JSObject] = []
    var emojis: [String] = ["✨", "🌳", "🗿", "🤖", "🪑", "🎵", "💡", "🍄"]
    var maillageVisible = false
    var modeles: [JSObject] = []   // tes objets 3D (Object Capture) : { nom, texte }, proposés quand on pose
    var surEvenement: (([String: Any]) -> Void)?
    private var vue: ARView!
    private var abonnement: Cancellable?
    private var etiquettes: [ModelEntity] = []
    private var infos: [String: (String, String)] = [:]
    private let etat = UILabel()
    private var lance = false
    private var carteChargee = false
    private var retrouvee = true
    private var ferme = false

    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        vue = ARView(frame: view.bounds, cameraMode: .ar, automaticallyConfigureSession: false)
        vue.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        vue.session.delegate = self
        view.addSubview(vue)
        let guide = ARCoachingOverlayView(frame: view.bounds)
        guide.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        guide.session = vue.session
        guide.goal = .tracking
        guide.activatesAutomatically = true
        vue.addSubview(guide)
        etat.textColor = .white
        etat.font = .systemFont(ofSize: 14, weight: .semibold)
        etat.textAlignment = .center
        etat.numberOfLines = 2
        etat.backgroundColor = UIColor(white: 0, alpha: 0.45)
        etat.layer.cornerRadius = 14
        etat.clipsToBounds = true
        etat.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(etat)
        let g = view.safeAreaLayoutGuide
        let croix = bouton("✕", #selector(toucheFermer))
        NSLayoutConstraint.activate([
            croix.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            croix.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12),
            etat.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            etat.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 12),
            etat.trailingAnchor.constraint(equalTo: croix.leadingAnchor, constant: -10),
            etat.heightAnchor.constraint(greaterThanOrEqualToConstant: 44),
        ])
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            let b = bouton("  ◇ le maillage du réel  ", #selector(basculerMaillage))
            b.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 12).isActive = true
            b.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -12).isActive = true
            if maillageVisible { vue.debugOptions.insert(.showSceneUnderstanding) }
        }
        if chambre {
            let b = bouton("  ↺ nouvelle chambre  ", #selector(nouvelleChambre))
            b.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12).isActive = true
            b.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -12).isActive = true
        }
        vue.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(toucher(_:))))
        abonnement = vue.scene.subscribe(to: SceneEvents.Update.self) { [weak self] _ in self?.tourner() }
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if lance { return }
        lance = true
        lancer(neuve: false)
    }

    private func bouton(_ titre: String, _ action: Selector) -> UIButton {
        let b = UIButton(type: .system)
        b.setTitle(titre, for: .normal)
        b.setTitleColor(.white, for: .normal)
        b.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        b.backgroundColor = UIColor(white: 0, alpha: 0.45)
        b.layer.cornerRadius = 22
        b.translatesAutoresizingMaskIntoConstraints = false
        b.addTarget(self, action: action, for: .touchUpInside)
        view.addSubview(b)
        b.widthAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
        b.heightAnchor.constraint(equalToConstant: 44).isActive = true
        return b
    }

    private func dire(_ t: String) { etat.text = "  " + t + "  " }

    // la session : la terre alignée sur la gravité et le nord ; la chambre sur la gravité, avec sa carte gardée (ARWorldMap)
    private func lancer(neuve: Bool) {
        let c = ARWorldTrackingConfiguration()
        c.worldAlignment = chambre ? .gravity : .gravityAndHeading
        c.planeDetection = [.horizontal, .vertical]
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            c.sceneReconstruction = .mesh
            vue.environment.sceneUnderstanding.options.insert(.occlusion)
        }
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.personSegmentationWithDepth) {
            c.frameSemantics.insert(.personSegmentationWithDepth)
        }
        carteChargee = false
        if chambre, !neuve, let u = PloxiAR.carteChambre, let data = try? Data(contentsOf: u),
           let carte = try? NSKeyedUnarchiver.unarchivedObject(ofClass: ARWorldMap.self, from: data) {
            c.initialWorldMap = carte
            carteChargee = true
        }
        retrouvee = !carteChargee
        if !carteChargee {
            if chambre { objets = [] }   // sans sa carte, les places gardées de la chambre ne veulent plus rien dire
            ajouterTous()
        }
        vue.session.run(c, options: neuve ? [.resetTracking, .removeExistingAnchors] : [])
        dire(carteChargee ? "je retrouve ta chambre : regarde autour, doucement" : resume())
    }

    private func resume() -> String {
        if chambre { return "ta chambre · à toi seul · touche une surface pour y poser un objet" }
        return "\(etiquettes.count) autour de toi · touche le réel pour y poser quelque chose"
    }

    private func ajouterTous() {
        for o in objets {
            let x = Float(o["x"] as? Double ?? 0), y = Float(o["y"] as? Double ?? 0), z = Float(o["z"] as? Double ?? 0)
            let id = o["id"] as? String ?? "", texte = o["texte"] as? String ?? "", p = SIMD3<Float>(x, y, z)
            if let nom = o["modele"] as? String, !nom.isEmpty, poserModele(id: id, nom: nom, texte: texte, en: p, rot: Float(o["rot"] as? Double ?? 0)) { continue }
            poser(id: id, emoji: o["emoji"] as? String ?? "✨", texte: texte, en: p, taille: Float(o["taille"] as? Double ?? 0.5))
        }
        objets = []
    }

    // un objet 3D à toi (Object Capture) : le vrai modèle, à l'échelle 1, posé SUR le point (le bas du modèle), tourné comme à la pose
    @discardableResult
    private func poserModele(id: String, nom: String, texte: String, en p: SIMD3<Float>, rot: Float) -> Bool {
        guard let u = PloxiAR.dossier("objets")?.appendingPathComponent(nom), FileManager.default.fileExists(atPath: u.path),
              let e = try? Entity.loadModel(contentsOf: u) else { return false }
        e.name = id
        e.generateCollisionShapes(recursive: true)
        let q = simd_quatf(angle: rot, axis: SIMD3<Float>(0, 1, 0))
        let b = e.visualBounds(relativeTo: e)
        e.orientation = q
        e.position = q.act(SIMD3<Float>(-b.center.x, -b.min.y, -b.center.z))
        let ancre = AnchorEntity(world: p)
        ancre.addChild(e)
        vue.scene.addAnchor(ancre)
        infos[id] = ("📦", texte)
        return true
    }

    // un objet : son emoji et son texte dessinés une fois en image, sur un plan qui se tourne toujours vers toi (debout)
    private func poser(id: String, emoji: String, texte: String, en p: SIMD3<Float>, taille: Float) {
        guard let image = TerraxVC.etiquette(emoji, texte),
              let tex = try? TextureResource.generate(from: image, withName: nil, options: .init(semantic: .color)) else { return }
        var m = UnlitMaterial()
        m.color = .init(tint: UIColor.white.withAlphaComponent(0.999), texture: .init(tex))
        m.blending = .transparent(opacity: .init(floatLiteral: 1.0))
        let t = max(0.15, min(taille, 12))
        let e = ModelEntity(mesh: .generatePlane(width: t, height: t * 1.2), materials: [m])
        e.name = id
        e.collision = CollisionComponent(shapes: [.generateBox(size: SIMD3<Float>(t, t * 1.2, 0.04))])
        let ancre = AnchorEntity(world: p)
        ancre.addChild(e)
        vue.scene.addAnchor(ancre)
        etiquettes.append(e)
        infos[id] = (emoji, texte)
    }

    static func etiquette(_ emoji: String, _ texte: String) -> CGImage? {
        let f = UIGraphicsImageRendererFormat.default()
        f.scale = 2
        f.opaque = false
        let l: CGFloat = 200, h: CGFloat = 240
        let image = UIGraphicsImageRenderer(size: CGSize(width: l, height: h), format: f).image { _ in
            let centre = NSMutableParagraphStyle()
            centre.alignment = .center
            (emoji as NSString).draw(in: CGRect(x: 0, y: 4, width: l, height: 146), withAttributes: [.font: UIFont.systemFont(ofSize: 118), .paragraphStyle: centre])
            if texte.isEmpty { return }
            let pastille = CGRect(x: 6, y: 156, width: l - 12, height: 78)
            UIColor(white: 0.04, alpha: 0.7).setFill()
            UIBezierPath(roundedRect: pastille, cornerRadius: 20).fill()
            (texte as NSString).draw(in: pastille.insetBy(dx: 10, dy: 8), withAttributes: [.font: UIFont.systemFont(ofSize: 21, weight: .semibold), .foregroundColor: UIColor.white, .paragraphStyle: centre])
        }
        return image.cgImage
    }

    // à chaque image : chaque objet pivote (autour de la verticale) pour te faire face
    private func tourner() {
        let cam = vue.cameraTransform.translation
        for e in etiquettes {
            let p = e.position(relativeTo: nil)
            e.setOrientation(simd_quatf(angle: atan2(cam.x - p.x, cam.z - p.z), axis: SIMD3<Float>(0, 1, 0)), relativeTo: nil)
        }
    }

    @objc private func toucher(_ geste: UITapGestureRecognizer) {
        let pt = geste.location(in: vue)
        if let e = vue.entity(at: pt), !e.name.isEmpty, let i = infos[e.name] {
            surEvenement?(["type": "touche", "id": e.name])
            let a = UIAlertController(title: i.0, message: i.1.isEmpty ? nil : i.1, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "ok", style: .default))
            present(a, animated: true)
            return
        }
        guard retrouvee else { dire("je retrouve d'abord ta chambre : regarde autour"); return }
        var p: SIMD3<Float>
        if let r = vue.raycast(from: pt, allowing: .estimatedPlane, alignment: .any).first {
            let c = r.worldTransform.columns.3
            p = SIMD3<Float>(c.x, c.y, c.z)
        } else {
            let m = vue.cameraTransform.matrix
            let devant = -SIMD3<Float>(m.columns.2.x, m.columns.2.y, m.columns.2.z)
            p = vue.cameraTransform.translation + devant * 1.5
        }
        choisir(p)
    }

    // poser : la feuille d'iOS (un texte, puis l'emoji)
    private func choisir(_ p: SIMD3<Float>) {
        let a = UIAlertController(title: "poser ici", message: chambre ? "dans ta chambre (à toi seul)" : "à cette place du réel", preferredStyle: .alert)
        let invite = chambre ? "quoi ? (ton robot, ton meuble…)" : "qu'est-ce qu'il y a ici ?"
        a.addTextField { t in t.placeholder = invite }
        for e in emojis.prefix(8) {
            a.addAction(UIAlertAction(title: e, style: .default) { [weak self, weak a] _ in
                guard let self = self else { return }
                let brut = a?.textFields?.first?.text ?? ""
                let texte = String(brut.trimmingCharacters(in: .whitespacesAndNewlines).prefix(280))
                let id = "tx" + String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
                self.poser(id: id, emoji: e, texte: texte, en: p, taille: self.chambre ? 0.25 : 0.5)
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                self.surEvenement?(["type": "pose", "id": id, "x": Double(p.x), "y": Double(p.y), "z": Double(p.z), "emoji": e, "texte": texte])
                self.dire(self.resume())
            })
        }
        // tes objets 3D : le vrai modèle, tourné vers toi
        for m in modeles.prefix(5) {
            guard let nom = m["nom"] as? String, !nom.isEmpty else { continue }
            let titre = "📦 " + ((m["texte"] as? String).map { String($0.prefix(30)) } ?? "ton objet 3D")
            a.addAction(UIAlertAction(title: titre, style: .default) { [weak self, weak a] _ in
                guard let self = self else { return }
                let brut = a?.textFields?.first?.text ?? ""
                var texte = String(brut.trimmingCharacters(in: .whitespacesAndNewlines).prefix(280))
                if texte.isEmpty { texte = m["texte"] as? String ?? "" }
                let id = "tx" + String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
                let cam = self.vue.cameraTransform.translation
                let rot = atan2(cam.x - p.x, cam.z - p.z)
                guard self.poserModele(id: id, nom: nom, texte: texte, en: p, rot: rot) else { self.dire("ce modèle 3D est introuvable"); return }
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                self.surEvenement?(["type": "pose", "id": id, "x": Double(p.x), "y": Double(p.y), "z": Double(p.z), "emoji": "📦", "texte": texte, "modele": nom, "rot": Double(rot)])
                self.dire(self.resume())
            })
        }
        a.addAction(UIAlertAction(title: "annuler", style: .cancel))
        present(a, animated: true)
    }

    @objc private func basculerMaillage() {
        if vue.debugOptions.contains(.showSceneUnderstanding) { vue.debugOptions.remove(.showSceneUnderstanding) } else { vue.debugOptions.insert(.showSceneUnderstanding) }
    }

    @objc private func nouvelleChambre() {
        let a = UIAlertController(title: "nouvelle chambre ?", message: "la carte de ta chambre recommence : tes objets restent dans ta liste, mais sans leur place en AR", preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "recommencer", style: .destructive) { [weak self] _ in
            guard let self = self else { return }
            if let u = PloxiAR.carteChambre { try? FileManager.default.removeItem(at: u) }
            self.vue.scene.anchors.removeAll()
            self.etiquettes.removeAll()
            self.infos.removeAll()
            self.lancer(neuve: true)
            self.surEvenement?(["type": "chambre-neuve"])
        })
        a.addAction(UIAlertAction(title: "annuler", style: .cancel))
        present(a, animated: true)
    }

    func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
        let s = camera.trackingState
        if case .normal = s {
            if !retrouvee {
                retrouvee = true
                ajouterTous()
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            }
            dire(resume())
        } else if case .limited(.relocalizing) = s {
            dire("je retrouve ta chambre : regarde autour, doucement")
        } else if case .limited(_) = s {
            dire("bouge un peu l'iPhone, doucement")
        }
    }

    func session(_ session: ARSession, didFailWithError error: Error) {
        dire("l'AR : " + error.localizedDescription)
    }

    @objc private func toucheFermer() { fermer() }

    // fermer : la chambre garde sa carte (si elle a été retrouvée, ou si elle est neuve) pour la prochaine fois
    func fermer() {
        if ferme { return }
        ferme = true
        let fin: () -> Void = { [weak self] in
            guard let self = self else { return }
            self.abonnement?.cancel()
            self.abonnement = nil
            self.vue.session.pause()
            self.vue.scene.anchors.removeAll()
            self.dismiss(animated: true) { self.surEvenement?(["type": "ferme"]) }
        }
        if chambre, retrouvee, let u = PloxiAR.carteChambre {
            vue.session.getCurrentWorldMap { carte, _ in
                if let carte = carte, let data = try? NSKeyedArchiver.archivedData(withRootObject: carte, requiringSecureCoding: true) {
                    try? data.write(to: u, options: .atomic)
                }
                DispatchQueue.main.async { fin() }
            }
        } else {
            fin()
        }
    }
}

#if canImport(RoomPlan)
// le scan d'une pièce (RoomPlan, iOS 16, LiDAR) : la vue d'Apple guide le scan ; « terminer » → la pièce calculée → « garder » → un USDZ
@available(iOS 16.0, *)
final class PieceVC: UIViewController, RoomCaptureViewDelegate {
    var fini: ((URL?, String?) -> Void)?
    private var vue: RoomCaptureView?
    private var chemin: URL?
    private let finir = UIButton(type: .system)
    private var lance = false
    private var rendu = false

    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        let v = RoomCaptureView(frame: view.bounds)
        v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        v.delegate = self
        view.addSubview(v)
        vue = v
        let croix = UIButton(type: .system)
        for (b, titre) in [(croix, "✕"), (finir, "  terminer le scan  ")] {
            b.setTitle(titre, for: .normal)
            b.setTitleColor(.white, for: .normal)
            b.titleLabel?.font = .systemFont(ofSize: 17, weight: .bold)
            b.backgroundColor = UIColor(white: 0, alpha: 0.5)
            b.layer.cornerRadius = 22
            b.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(b)
        }
        croix.addTarget(self, action: #selector(annuler), for: .touchUpInside)
        finir.addTarget(self, action: #selector(terminer), for: .touchUpInside)
        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            croix.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            croix.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12),
            croix.widthAnchor.constraint(equalToConstant: 44),
            croix.heightAnchor.constraint(equalToConstant: 44),
            finir.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -16),
            finir.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            finir.heightAnchor.constraint(equalToConstant: 48),
        ])
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if lance { return }
        lance = true
        vue?.captureSession.run(configuration: RoomCaptureSession.Configuration())
    }

    @objc private func terminer() {
        if let c = chemin { rendre(c, nil); return }
        finir.isEnabled = false
        finir.setTitle("  je calcule la pièce…  ", for: .normal)
        vue?.captureSession.stop()
    }

    @objc private func annuler() {
        vue?.captureSession.stop()
        if let c = chemin { try? FileManager.default.removeItem(at: c) }
        rendre(nil, "scan annulé")
    }

    private func rendre(_ u: URL?, _ erreur: String?) {
        if rendu { return }
        rendu = true
        dismiss(animated: true) { self.fini?(u, erreur) }
    }

    func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool { true }

    func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        if let error = error { rendre(nil, "scan : " + error.localizedDescription); return }
        guard let dossier = PloxiAR.dossier("pieces") else { rendre(nil, "scan : pas de dossier"); return }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd-HHmmss"
        let u = dossier.appendingPathComponent("piece-" + f.string(from: Date()) + ".usdz")
        do {
            try processedResult.export(to: u)
            chemin = u
            finir.isEnabled = true
            finir.setTitle("  ✓ garder la pièce  ", for: .normal)
        } catch {
            rendre(nil, "scan : " + error.localizedDescription)
        }
    }
}
#endif

// 📦 OBJECT CAPTURE (0.74). RS-7 (15.10, la vidéo d'Apple « AR Quick Look, meet Object Capture ») : « ça pour l'AR ». Ton objet réel (un robot,
// un meuble IKEA) devient un modèle 3D, sur l'iPhone, sans serveur : la capture guidée d'Apple (ObjectCaptureView, iOS 17, LiDAR) prend les
// photos tout autour (Caches temporaires), puis PhotogrammetrySession calcule le modèle (USDZ, à l'échelle réelle) dans Documents/terrax/objets.
// La capture est libérée avant le calcul (les deux ensemble, c'est trop de mémoire). Le modèle s'ouvre en AR Quick Look et se pose dans l'AR.
@available(iOS 17.0, *)
final class ObjetVC: UIViewController {
    var fini: ((URL?, String?) -> Void)?
    private var session: ObjectCaptureSession?
    private var hote: UIViewController?
    private var photogrammetrie: PhotogrammetrySession?
    private var suivi: Task<Void, Never>?
    private var calcul: Task<Void, Never>?
    private let action = UIButton(type: .system)
    private let etat = UILabel()
    private var travail: URL?
    private var sortie: URL?
    private var eveilAvant = false
    private var lance = false
    private var calculLance = false
    private var rendu = false

    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        let s = ObjectCaptureSession()
        session = s
        let h = UIHostingController(rootView: ObjectCaptureView(session: s))
        addChild(h)
        h.view.frame = view.bounds
        h.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(h.view)
        h.didMove(toParent: self)
        hote = h
        etat.textColor = .white
        etat.font = .systemFont(ofSize: 14, weight: .semibold)
        etat.textAlignment = .center
        etat.numberOfLines = 3
        etat.backgroundColor = UIColor(white: 0, alpha: 0.5)
        etat.layer.cornerRadius = 14
        etat.clipsToBounds = true
        etat.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(etat)
        let croix = UIButton(type: .system)
        for (b, titre) in [(croix, "✕"), (action, "  …  ")] {
            b.setTitle(titre, for: .normal)
            b.setTitleColor(.white, for: .normal)
            b.titleLabel?.font = .systemFont(ofSize: 17, weight: .bold)
            b.backgroundColor = UIColor(white: 0, alpha: 0.55)
            b.layer.cornerRadius = 24
            b.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(b)
        }
        croix.addTarget(self, action: #selector(annuler), for: .touchUpInside)
        action.addTarget(self, action: #selector(agir), for: .touchUpInside)
        action.isHidden = true
        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            croix.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            croix.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12),
            croix.widthAnchor.constraint(equalToConstant: 48),
            croix.heightAnchor.constraint(equalToConstant: 48),
            etat.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            etat.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 12),
            etat.trailingAnchor.constraint(equalTo: croix.leadingAnchor, constant: -10),
            etat.heightAnchor.constraint(greaterThanOrEqualToConstant: 48),
            action.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -16),
            action.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            action.heightAnchor.constraint(equalToConstant: 52),
        ])
        dire("la caméra démarre…")
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if lance { return }
        lance = true
        eveilAvant = UIApplication.shared.isIdleTimerDisabled
        UIApplication.shared.isIdleTimerDisabled = true   // l'écran reste allumé pendant la capture et le calcul
        guard let s = session else { return }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd-HHmmss"
        let nom = "objet-" + f.string(from: Date())
        let t = FileManager.default.temporaryDirectory.appendingPathComponent(nom, isDirectory: true)
        let images = t.appendingPathComponent("images", isDirectory: true)
        let points = t.appendingPathComponent("points", isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: images, withIntermediateDirectories: true)
            try FileManager.default.createDirectory(at: points, withIntermediateDirectories: true)
        } catch { rendre(nil, "capture : " + error.localizedDescription); return }
        travail = t
        sortie = PloxiAR.dossier("objets")?.appendingPathComponent(nom + ".usdz")
        var c = ObjectCaptureSession.Configuration()
        c.checkpointDirectory = points
        s.start(imagesDirectory: images, configuration: c)
        surEtat(s.state)
        suivi = Task { [weak self] in
            for await e in s.stateUpdates { self?.surEtat(e) }
        }
    }

    private func dire(_ t: String) { etat.text = "  " + t + "  " }

    private func montrer(_ t: String, _ bouton: String?) {
        dire(t)
        action.isHidden = bouton == nil
        action.isEnabled = true
        if let b = bouton { action.setTitle("  " + b + "  ", for: .normal) }
    }

    // les étapes de la capture d'Apple : prête → viser l'objet (la boîte) → capturer en tournant autour → terminer → le calcul
    private func surEtat(_ e: ObjectCaptureSession.CaptureState) {
        if rendu { return }
        switch e {
        case .initializing: montrer("la caméra démarre…", nil)
        case .ready: montrer("pose ton objet sur une table, de l'espace tout autour ; vise-le", "◎ viser cet objet")
        case .detecting: montrer("ajuste la boîte autour de l'objet", "● commencer la capture")
        case .capturing: montrer("tourne lentement autour, puis plus haut ; termine quand le cercle est plein", "✓ terminer")
        case .finishing: montrer("je range les photos…", nil)
        case .completed: reconstruire()
        case .failed(let erreur): rendre(nil, "capture : " + erreur.localizedDescription)
        @unknown default: break
        }
    }

    @objc private func agir() {
        guard let s = session else { return }
        switch s.state {
        case .ready: if !s.startDetecting() { dire("je ne trouve pas d'objet : rapproche-toi, vise-le au centre") }
        case .detecting: s.startCapturing()
        case .capturing:
            action.isEnabled = false
            s.finish()
        default: break
        }
    }

    // le calcul, sur l'iPhone : la capture est d'abord libérée (caméra, mémoire)
    private func reconstruire() {
        if calculLance || rendu { return }
        calculLance = true
        suivi?.cancel()
        suivi = nil
        hote?.willMove(toParent: nil)
        hote?.view.removeFromSuperview()
        hote?.removeFromParent()
        hote = nil
        session = nil
        guard let t = travail, let sortie = sortie else { rendre(nil, "capture : pas de dossier"); return }
        montrer("je calcule ton objet en 3D… garde ploxi0n ouvert", nil)
        var conf = PhotogrammetrySession.Configuration()
        conf.checkpointDirectory = t.appendingPathComponent("points", isDirectory: true)
        let p: PhotogrammetrySession
        do {
            p = try PhotogrammetrySession(input: t.appendingPathComponent("images", isDirectory: true), configuration: conf)
            try p.process(requests: [.modelFile(url: sortie)])
        } catch { rendre(nil, "calcul : " + error.localizedDescription); return }
        photogrammetrie = p
        calcul = Task { [weak self] in
            do {
                for try await o in p.outputs {
                    guard let self = self else { return }
                    if case .requestProgress(_, let f) = o {
                        self.dire("je calcule ton objet en 3D… \(Int(f * 100)) %")
                    } else if case .requestError(_, let erreur) = o {
                        self.rendre(nil, "calcul : " + erreur.localizedDescription)
                        return
                    } else if case .processingCancelled = o {
                        self.rendre(nil, "calcul annulé")
                        return
                    } else if case .processingComplete = o {
                        if FileManager.default.fileExists(atPath: sortie.path) { self.rendre(sortie, nil) } else { self.rendre(nil, "calcul : pas de modèle") }
                        return
                    }
                }
            } catch {
                self?.rendre(nil, "calcul : " + error.localizedDescription)
            }
        }
    }

    @objc private func annuler() {
        session?.cancel()
        photogrammetrie?.cancel()
        rendre(nil, "capture annulée")
    }

    // une seule fin : la promesse de la page est tenue une fois ; les photos (temporaires) sont effacées
    private func rendre(_ u: URL?, _ erreur: String?) {
        if rendu { return }
        rendu = true
        suivi?.cancel()
        calcul?.cancel()
        UIApplication.shared.isIdleTimerDisabled = eveilAvant
        if let t = travail { try? FileManager.default.removeItem(at: t) }
        if u == nil, let s = sortie { try? FileManager.default.removeItem(at: s) }
        dismiss(animated: true) { self.fini?(u, erreur) }
    }
}
#endif

class PloxionVC: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PloxiVocal())
        bridge?.registerPluginInstance(PloxiApple())
        bridge?.registerPluginInstance(PloxiLecteur())
        #if !PLOXI0N_SANS_AR
        bridge?.registerPluginInstance(PloxiAR())
        #endif
    }
    private var plein: Bool { UserDefaults.standard.string(forKey: "CapacitorStorage.ploxi0n.plein-ecran") == "1" }
    // l'indicateur d'accueil : le plugin SystemBars de Capacitor 8 le gère déjà (CAPBridgeViewController.prefersHomeIndicatorAutoHidden n'est
    // pas ouvert à la redéfinition) — la page appelle SystemBars.hide({ bar: NavigationBar })
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { plein ? [.bottom, .top] : [] }
    override func viewDidLoad() {
        super.viewDidLoad()
        NotificationCenter.default.addObserver(forName: UserDefaults.didChangeNotification, object: nil, queue: .main) { [weak self] _ in
            self?.setNeedsUpdateOfScreenEdgesDeferringSystemGestures()
        }
        // LA CAPTURE D'ÉCRAN (RS-7 14.10 : « faire la manœuvre des screenshots et avoir l'impression de faire un screenshot sur l'app, mais ça fait
        // comme une image : on peut dézoomer notre xer et voir les autres xers à côté ») : iOS prévient après chaque capture ; la page reçoit
        // l'événement « ploxi0n-capture » sur window et en fait la photo du xer (src/app/vue-xers.js)
        NotificationCenter.default.addObserver(forName: UIApplication.userDidTakeScreenshotNotification, object: nil, queue: .main) { [weak self] _ in
            self?.bridge?.triggerWindowJSEvent(eventName: "ploxi0n-capture")
        }
    }
}
