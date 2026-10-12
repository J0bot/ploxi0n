import UIKit
import Capacitor
import WidgetKit
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
        guard let g = UserDefaults(suiteName: "group.ch.j0bot.ploxi0n") else { return }
        var change = false
        for k in ["ploxi0n.epingles", "ploxi0n.valeurs"] {
            let v = UserDefaults.standard.string(forKey: "CapacitorStorage." + k)
            if v != nil && g.string(forKey: k) != v { g.set(v, forKey: k); change = true }
        }
        if change { WidgetCenter.shared.reloadAllTimelines() }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

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
