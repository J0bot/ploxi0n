// ⌨ LE CLAVIER D'iOS, À FOND (RS-7 12.10 : « prendre plein parti du clavier iOS et de toutes les intégrations : la dictée, Siri »).
// Chaque champ que les ploxions créent reçoit, s'il ne les a pas déjà, les bons attributs pour le clavier d'iOS — sans réécrire les ploxions :
//   texte : majuscule en début de phrase, correction, orthographe (un textarea comme un message) ; recherche : « Rechercher » ;
//   e-mail / URL / nombre / téléphone : le bon clavier ; identifiant / mot de passe : le remplissage du trousseau (Mots de passe d'iOS) ;
//   un code reçu par SMS : autocomplete one-time-code. La dictée (le micro du clavier) marche dans tous ces champs.
// La barre au-dessus du clavier (QuickType, mots de passe, « OK ») : visible (Capacitor la cache par défaut) — barreClavier().
const TEXTE = 'input:not([type]),input[type=text],input[type=search],input[type=email],input[type=url],input[type=tel],input[type=number],input[type=password],textarea';
export function regler(el) {
  if (!el || !el.matches || !el.matches(TEXTE) || el.hasAttribute('data-clavier-ios')) return;
  el.setAttribute('data-clavier-ios', '');
  const type = (el.getAttribute('type') || 'text').toLowerCase(), nom = ((el.name || '') + ' ' + (el.id || '') + ' ' + (el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
  const poser = (a, v) => { if (!el.hasAttribute(a)) el.setAttribute(a, v); };
  if (type === 'password') { poser('autocomplete', /nouveau|new|cr[ée]er|confirm/.test(nom) ? 'new-password' : 'current-password'); poser('autocapitalize', 'off'); poser('autocorrect', 'off'); return; }
  if (type === 'email' || /e-?mail|courriel/.test(nom)) { poser('inputmode', 'email'); poser('autocomplete', 'email'); poser('autocapitalize', 'off'); poser('autocorrect', 'off'); poser('spellcheck', 'false'); return; }
  if (type === 'url' || /\burl\b|lien|adresse web/.test(nom)) { poser('inputmode', 'url'); poser('autocapitalize', 'off'); poser('autocorrect', 'off'); poser('spellcheck', 'false'); return; }
  if (type === 'tel') { poser('inputmode', 'tel'); poser('autocomplete', 'tel'); return; }
  if (type === 'number') { poser('inputmode', 'decimal'); return; }
  if (/\bcode\b|otp|v[ée]rification|2fa/.test(nom)) { poser('inputmode', 'numeric'); poser('autocomplete', 'one-time-code'); return; }
  if (/utilisateur|identifiant|username|login|pseudo/.test(nom)) { poser('autocomplete', 'username'); poser('autocapitalize', 'off'); poser('autocorrect', 'off'); return; }
  if (type === 'search' || /cherch|recherche|search|filtr/.test(nom)) { poser('enterkeyhint', 'search'); poser('autocapitalize', 'off'); return; }
  // du texte : une phrase, un message
  poser('autocapitalize', 'sentences'); poser('autocorrect', 'on'); poser('spellcheck', 'true');
  if (el.tagName === 'TEXTAREA' || /message|écri|ecri|dire|chat|note|tsoin|commentaire/.test(nom)) poser('enterkeyhint', 'send');
}

export function installerClavierIos({ W = globalThis.window } = {}) {
  const D = W.document;
  const balayer = (n) => { if (!n || n.nodeType !== 1) return; regler(n); if (n.querySelectorAll) n.querySelectorAll(TEXTE).forEach(regler); };
  balayer(D.body);
  try { new W.MutationObserver((l) => { for (const m of l) for (const n of m.addedNodes) balayer(n); }).observe(D.body, { childList: true, subtree: true }); } catch (e) { /* */ }
}

/** la barre au-dessus du clavier : QuickType, le remplissage des mots de passe, « OK » */
export async function barreClavier(visible = true) {
  try { const { Keyboard } = await import('@capacitor/keyboard'); await Keyboard.setAccessoryBarVisible({ isVisible: !!visible }); } catch (e) { /* hors iPhone */ }
}

import { corriger } from './vocabulaire.js';
/** une commande dite à Siri (« Dis à ploxi0n … ») → une action de l'app */
export function comprendre(texte) {
  const t = String(texte || '').trim(), m = corriger(t);
  let r;
  if ((r = /^(go to|va sur|ouvre|ouvrir|lance|lancer|montre|open|launch|start|show)( le| la| les| l'| mon| ma| the| my)?( ploxion)?\s+(.+)$/.exec(m))) return { action: 'ouvrir', quoi: r[4].trim() };
  if ((r = /^(search for|look for|cherche|chercher|trouve|recherche|search|find)( un| une| le| la| a| the)?( ploxion)?\s+(.+)$/.exec(m))) return { action: 'chercher', quoi: r[4].trim() };
  if ((r = /^(note|noter|ecris|retiens|remember|write|tsoin|add a tsoin|new tsoin)( un tsoin| a tsoin| tsoin| que| that| :)?\s*(.+)$/.exec(m))) { const brut = t.split(/\s+/), n = r[3].split(/\s+/).length; return { action: 'noter', quoi: brut.slice(-n).join(' ') }; }
  if (/^(accueil|maison|retour a l'?accueil|home|go home)$/.test(m)) return { action: 'accueil' };
  if (/^(minimise|minimiser|cache|minimize|hide)$/.test(m)) return { action: 'minimiser' };
  if (/^(reglages|parametres|settings)$/.test(m)) return { action: 'ouvrir', quoi: 'reglages' };
  return { action: 'ouvrir-ou-chercher', quoi: m };
}
