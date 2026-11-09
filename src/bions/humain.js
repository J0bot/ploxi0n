// @bion humain — le mode humain : zéro texte, des glyphes lisibles par un humain et des fonctions mathématiques ; les mêmes choses, dites
// sans langue (rien à traduire) | api: compte, duree, fenetre, rien, flux
// (0.99.8, RS-7 23.10 : « un mode humain, où y a zéro texte, que des glyphes human readable et des fonctions mathématiques » ; docs/LANGUES.md).
// Les unités sont celles du SI (s, min, h, d), lisibles partout ; ∅ = rien ; → entre, sort → ; Δt = il y a ; ∀t = tout le temps.

/** un nombre et le glyphe de ce qu'il compte : compte(8, '◇') → « 8◇ » ; les grands nombres en milliers (« 12k ») */
export const compte = (n, glyphe = '') => { const x = Math.max(0, Math.round(+n || 0)); return (x >= 10000 ? Math.round(x / 1000) + 'k' : String(x)) + glyphe; };

/** une durée passée (ms) → « Δt −2 d », « Δt −3 h », « Δt −40 min », « Δt ≈ 0 » */
export function duree(ms) {
  const s = Math.max(0, (+ms || 0) / 1000);
  if (s < 60) return 'Δt ≈ 0';
  if (s < 3600) return 'Δt −' + Math.round(s / 60) + ' min';
  if (s < 86400) return 'Δt −' + Math.round(s / 3600) + ' h';
  return 'Δt −' + Math.round(s / 86400) + ' d';
}

/** une fenêtre du wormion [de, à] en jours → « ∀t », « Δt = 0 d », « Δt ∈ [7, 20] d », « Δt > 31 d » */
export function fenetre(de, a) {
  if (de == null) return '∀t';
  if (a >= 9999) return 'Δt > ' + de + ' d';
  if (de === a) return 'Δt = ' + de + ' d';
  return 'Δt ∈ [' + de + ', ' + a + '] d';
}

export const rien = '∅';
/** les entrées et les sorties d'un neurone : « →3 · 2→ » */
export const flux = (e, s) => '→' + compte(e) + ' · ' + compte(s) + '→';
