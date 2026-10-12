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
        for k in ["ploxi0n.epingles", "ploxi0n.valeurs"] {
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
public class PloxiApple: CAPPlugin, CAPBridgedPlugin, HMHomeManagerDelegate {
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
    ]

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

class PloxionVC: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PloxiVocal())
        bridge?.registerPluginInstance(PloxiApple())
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
    }
}
