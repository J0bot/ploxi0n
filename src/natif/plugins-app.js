// Les plugins NATIFS DE L'APP (AppDelegate.swift, enregistrés par PloxionVC) : déclarés une seule fois ici. Capacitor refuse un second
// registerPlugin du même nom (« already registered ») ; jOSNatif, le mouvement et les vocaux partagent donc ces deux-là.
import { registerPlugin } from '@capacitor/core';
export const PloxiApple = registerPlugin('PloxiApple');
export const PloxiVocal = registerPlugin('PloxiVocal');
export const PloxiLecteur = registerPlugin('PloxiLecteur');   // 🎞 le lecteur intégré (0.49)
export const PloxiAR = registerPlugin('PloxiAR');           // 👁 l'AR native (0.73) : ARKit, RealityKit, RoomPlan (src/natif/ar-natif.js)
export const PloxiProche = registerPlugin('PloxiProche');   // ◉ (0.99.1) l'ultimate Bluetooth : MultipeerConnectivity (src/natif/proche-natif.js)
export const PloxiBLE = registerPlugin('PloxiBLE');         // 〰 (0.99.23) le maillage en Bluetooth basse consommation (option de build PLOXI0N_BLE)
export const PloxiVeille = registerPlugin('PloxiVeille');   // ◷ (0.99.20) la position en arrière-plan (src/natif/veille-natif.js)
export const PloxiCarPlay = registerPlugin('PloxiCarPlay'); // 🚗 (0.99.31) CarPlay : les gabarits d'Apple dessinés depuis un modèle JS (option de build PLOXI0N_CARPLAY)
export const PloxiOndes = registerPlugin('PloxiOndes');     // ᛒ (0.99.20) le Bluetooth bas niveau : scan brut + annonce (src/natif/ondes-natif.js)
export const PloxiAccueil = registerPlugin('PloxiAccueil'); // ⌂ (0.99.32) Android : ploxion comme écran d'accueil, les applis du téléphone (PloxiAccueil.java)

// (0.99.32) Android n'a AUCUN des plugins Swift ci-dessus (seulement PloxiAccueil) : avant d'appeler un plugin de l'app, demander s'il est là.
// Sinon chaque appel rejette « not implemented on android » (et un addListener sans catch remonte en exception).
export const ploxiIci = (nom, W = globalThis.window) => !!(W && W.Capacitor && typeof W.Capacitor.isPluginAvailable === 'function' && W.Capacitor.isPluginAvailable(nom));
/** 'ios' | 'android' | 'web' */
export const plateforme = (W = globalThis.window) => { try { return (W && W.Capacitor && typeof W.Capacitor.getPlatform === 'function' && W.Capacitor.getPlatform()) || 'web'; } catch (e) { return 'web'; } };
