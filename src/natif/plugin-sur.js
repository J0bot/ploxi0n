// UN PLUGIN NATIF, RENDU SANS DANGER PAR UNE PROMESSE (0.47). Sur l'iPhone, un plugin de Capacitor est un Proxy : TOUTE propriété
// devient une méthode native, même « then ». Rendu par une fonction async (ou passé à resolve), `await` le prend pour une promesse,
// appelle then() → « "Preferences.then()" is not implemented on ios ». Invisible dans le navigateur et les tests (la version web est un
// objet ordinaire) : ainsi, depuis le début, Raccourcis/Siri/widgets (Preferences), Face ID (NativeBiometric), les notifications
// (LocalNotifications) et Santé (Health) échouaient sur l'iPhone. surPromesse() délègue tout au plugin, sauf « then ».
export function surPromesse(plugin) {
  if (!plugin || (typeof plugin !== 'object' && typeof plugin !== 'function')) return plugin;
  return new Proxy({}, {
    get(_, k) {
      if (k === 'then') return undefined;
      const v = plugin[k];
      return typeof v === 'function' ? v.bind(plugin) : v;
    },
    has(_, k) { return k !== 'then' && k in plugin; },
  });
}
