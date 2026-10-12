import UIKit
import Capacitor
import WidgetKit
import AVFoundation
import WebKit
import ObjectiveC

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
        if UserDefaults.standard.string(forKey: "CapacitorStorage.ploxi0n.clavier-libre") != "off" { AppDelegate.clavierSansGeste() }
        // LE SON (RS-7 12.10 : « améliorer le lecteur, utiliser les trucs natifs ») : la catégorie « lecture » d'iOS — le son des ploxions
        // continue écran verrouillé et joue même en mode silencieux, comme une vraie app de musique ou de vidéo (avec UIBackgroundModes audio)
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
        // les WIDGETS (extension PloxionWidgets) lisent l'App Group : chaque fois que l'app réécrit ses Préférences, on y recopie les
        // ploxions épinglés et les valeurs, et on redessine les widgets seulement si quelque chose a changé
        NotificationCenter.default.addObserver(forName: UserDefaults.didChangeNotification, object: nil, queue: .main) { [weak self] _ in self?.versLesWidgets() }
        versLesWidgets()
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

    private func versLesWidgets() {
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
                    "relu": g.string(forKey: "ploxi0n.epingles")?.count ?? -1, "le": Int(Date().timeIntervalSince1970)])
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
class PloxionVC: CAPBridgeViewController {
    private var plein: Bool { UserDefaults.standard.string(forKey: "CapacitorStorage.ploxi0n.plein-ecran") == "1" }
    override var prefersHomeIndicatorAutoHidden: Bool { plein }
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { plein ? [.bottom, .top] : [] }
    override func viewDidLoad() {
        super.viewDidLoad()
        NotificationCenter.default.addObserver(forName: UserDefaults.didChangeNotification, object: nil, queue: .main) { [weak self] _ in
            self?.setNeedsUpdateOfHomeIndicatorAutoHidden()
            self?.setNeedsUpdateOfScreenEdgesDeferringSystemGestures()
        }
    }
}
