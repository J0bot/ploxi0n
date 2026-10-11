// jOSVerrou — FACE ID pour les ploxions (11.10). Un bion du shim : un ploxion ne sait pas qu'il tourne sur un iPhone, il demande juste
// « ouvre-moi ça avec le visage de la personne ».
//   dispo()                    → { ok, type: 'faceid' | 'touchid' | 'code' | null }
//   ouvrir(raison)             → true si la personne s'est authentifiée (Face ID, sinon le code de l'iPhone)
//   garder(cle, secret)        → range un secret dans le trousseau iOS, lisible SEULEMENT après Face ID (et effacé si les visages changent)
//   lire(cle, raison)          → le secret (Face ID demandé) ou null
//   oublier(cle)
// Hors iPhone (navigateur de dev), tout répond « pas disponible » : jamais un faux succès.
const SERVEUR = (cle) => 'ploxi0n.' + cle;

export function creerVerrou({ W = globalThis.window, charger = () => import('@capgo/capacitor-native-biometric') } = {}) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function plugin() { return (await charger()).NativeBiometric; }
  const TYPES = { 1: 'touchid', 2: 'faceid', 7: 'code' };
  return {
    async dispo() {
      if (!natif()) return { ok: false, type: null };
      const r = await (await plugin()).isAvailable({ useFallback: true });
      return { ok: !!r.isAvailable, type: TYPES[r.biometryType] || (r.deviceIsSecure ? 'code' : null) };
    },
    async ouvrir(raison = 'Ouvrir dans ploxi0n') {
      if (!natif()) return false;
      try { await (await plugin()).verifyIdentity({ reason: raison, title: 'ploxi0n', useFallback: true, maxAttempts: 3 }); return true; }
      catch (e) { return false; }
    },
    async garder(cle, secret) {
      if (!natif()) throw new Error('Face ID : iPhone seulement');
      // accessControl 1 = BIOMETRY_CURRENT_SET : le secret n'est lisible qu'avec un visage enregistré AUJOURD'HUI (un visage ajouté plus tard ne l'ouvre pas)
      await (await plugin()).setCredentials({ username: cle, password: String(secret), server: SERVEUR(cle), accessControl: 1 });
    },
    async lire(cle, raison = 'Ouvrir un secret de ploxi0n') {
      if (!natif()) return null;
      try { return (await (await plugin()).getSecureCredentials({ server: SERVEUR(cle), reason: raison, title: 'ploxi0n' })).password; }
      catch (e) { return null; }
    },
    async oublier(cle) { if (natif()) await (await plugin()).deleteCredentials({ server: SERVEUR(cle) }).catch(() => {}); },
  };
}
