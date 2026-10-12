import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        // (12.10, RS-7 : « "PloxiApple" plugin is not implemented on ios ») le contrôleur DE L'APP, PloxionVC (AppDelegate.swift) : c'est lui
        // qui enregistre les plugins locaux (PloxiApple : gyroscope, météo, Shazam, musique, maison, Wi-Fi, Game Center ; PloxiVocal : les
        // vocaux) et garde les bords en plein écran. Un CAPBridgeViewController nu ici les rendait tous absents depuis le début (le storyboard
        // Main → PloxionVC n'est pas lu quand la scène crée sa fenêtre elle-même).
        window?.rootViewController = PloxionVC()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
