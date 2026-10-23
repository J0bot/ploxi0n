// @bion polices — les polices du xerboxion : la ChillTekk (notre alphabet, tools/police/chilltekk.py) et les autres ; les poser sur un élément | api: POLICES, poserPolice
// (0.96, RS-7 23.10 : « il faut aussi mettre à jour la police et avoir un knob pour la police ; on pourrait faire notre alphabet custom du
// xerboxion, la police chill-tekk »). Deux voix : --police (le texte) et --mono (les inscriptions gravées). Rien que des polices hors ligne :
// celles de l'iPhone, et la nôtre (public/fonts/chilltekk.woff2, 6 Ko). Deux étages : la préférence (--px-pol, --px-mono) et la peau qui en
// porte une (--px-pol-peau, --px-mono-peau) ; app.css choisit : la peau, sinon la préférence, sinon l'arrondi d'avant.
const CT = '"ChillTekk",ui-monospace,monospace', ROND = 'ui-rounded,"SF Pro Rounded",system-ui,-apple-system,sans-serif', MONO = 'ui-monospace,"SF Mono",Menlo,monospace';
export const POLICES = {
  mixte: { nom: 'chill-tekk + rond', police: ROND, mono: CT },
  chilltekk: { nom: 'chill-tekk partout', police: CT, mono: CT },
  rond: { nom: 'arrondi', police: ROND, mono: MONO },
  mono: { nom: 'mono', police: MONO, mono: MONO },
  serif: { nom: 'serif', police: 'ui-serif,"New York",Georgia,serif', mono: CT },
  condensee: { nom: 'condensée', police: '"Avenir Next Condensed","Helvetica Neue",system-ui,sans-serif', mono: CT },
};
/** poser une police (sa clé) sur un élément ; etage : '' (la préférence) ou '-peau' ; null l'enlève */
export function poserPolice(el, cle, etage = '') {
  const st = el && el.style, p = POLICES[cle]; if (!st) return;
  if (p) { st.setProperty('--px-pol' + etage, p.police); st.setProperty('--px-mono' + etage, p.mono); }
  else { st.removeProperty('--px-pol' + etage); st.removeProperty('--px-mono' + etage); }
}
