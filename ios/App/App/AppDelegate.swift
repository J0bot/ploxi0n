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
    // apercu({ base64, nom }) ou apercu({ chemin }) ; partager, imprimer, annoter : les boutons d'iOS.
    private var apercuURL: URL?
    @objc func apercu(_ call: CAPPluginCall) {
        var url: URL? = nil
        if let chemin = call.getString("chemin"), !chemin.isEmpty {
            url = chemin.hasPrefix("file://") ? URL(string: chemin) : URL(fileURLWithPath: chemin)
        } else if let b64 = call.getString("base64"), let data = Data(base64Encoded: b64, options: .ignoreUnknownCharacters) {
            let nom = (call.getString("nom") ?? "fichier").replacingOccurrences(of: "/", with: "-")
            let u = FileManager.default.temporaryDirectory.appendingPathComponent(nom.isEmpty ? "fichier" : nom)
            do { try data.write(to: u, options: .atomic); url = u } catch { call.reject("aperçu : \(error.localizedDescription)"); return }
        }
        guard let fichier = url else { call.reject("aperçu : rien à montrer (chemin ou base64)"); return }
        DispatchQueue.main.async {
            self.apercuURL = fichier
            let ql = QLPreviewController()
            ql.dataSource = self
            self.bridge?.viewController?.present(ql, animated: true)
            call.resolve(["ok": true])
        }
    }
    public func numberOfPreviewItems(in controller: QLPreviewController) -> Int { apercuURL == nil ? 0 : 1 }
    public func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem { (apercuURL ?? URL(fileURLWithPath: "/")) as NSURL }

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
            mouvements.startDeviceMotionUpdates(to: .main) { [weak self] m, _ in
                guard let m = m else { return }
                self?.notifyListeners("mouvement", data: [
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

class PloxionVC: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PloxiVocal())
        bridge?.registerPluginInstance(PloxiApple())
        bridge?.registerPluginInstance(PloxiLecteur())
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
        // l'événement « ploxi0n-capture » sur window et en fait la photo du xer (src/app/capture-xer.js)
        NotificationCenter.default.addObserver(forName: UIApplication.userDidTakeScreenshotNotification, object: nil, queue: .main) { [weak self] _ in
            self?.bridge?.triggerWindowJSEvent(eventName: "ploxi0n-capture")
        }
    }
}
