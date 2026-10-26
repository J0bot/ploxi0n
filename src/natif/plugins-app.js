// Les plugins NATIFS DE L'APP (AppDelegate.swift, enregistrés par PloxionVC) : déclarés une seule fois ici. Capacitor refuse un second
// registerPlugin du même nom (« already registered ») ; jOSNatif, le mouvement et les vocaux partagent donc ces deux-là.
import { registerPlugin } from '@capacitor/core';
export const PloxiApple = registerPlugin('PloxiApple');
export const PloxiVocal = registerPlugin('PloxiVocal');
export const PloxiLecteur = registerPlugin('PloxiLecteur');   // 🎞 le lecteur intégré (0.49)
export const PloxiAR = registerPlugin('PloxiAR');           // 👁 l'AR native (0.73) : ARKit, RealityKit, RoomPlan (src/natif/ar-natif.js)
export const PloxiProche = registerPlugin('PloxiProche');
export const PloxiBLE = registerPlugin('PloxiBLE');         // 〰 (0.99.23) le maillage en Bluetooth basse consommation (option de build PLOXI0N_BLE)   // ◉ (0.99.1) l'ultimate Bluetooth : MultipeerConnectivity (src/natif/proche-natif.js)
