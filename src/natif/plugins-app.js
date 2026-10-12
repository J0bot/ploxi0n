// Les plugins NATIFS DE L'APP (AppDelegate.swift, enregistrés par PloxionVC) : déclarés une seule fois ici. Capacitor refuse un second
// registerPlugin du même nom (« already registered ») ; jOSNatif, le mouvement et les vocaux partagent donc ces deux-là.
import { registerPlugin } from '@capacitor/core';
export const PloxiApple = registerPlugin('PloxiApple');
export const PloxiVocal = registerPlugin('PloxiVocal');
