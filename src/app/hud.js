// Le HUD du compte (RS-7 : « un bouton se connecter facilement accessible dans le HUD et l'UI ») : une pastille toujours visible, en haut de
// l'accueil et dans la barre de chaque ploxion. Déconnecté : « Se connecter » ; connecté : le glyphe du rang et le nom. La toucher ouvre une
// feuille : se connecter avec son compte xerboxion.org, (bientôt) continuer avec Apple, ou se déconnecter.
// 0.9 (RS-7 : « un vrai bouton réglages, et un moyen de customiser son HUD ») : le HUD se COMPOSE (boxion_local « reglages/hud ») :
//   elements = [{ k, on }] dans l'ordre : compte · reseau (📶/📴 + le mode connecté) · heure · chercher (le marketplace) · epingles
//   epingles = au plus 4 ploxions, une icône chacun, ouverts d'un geste. ⚙ (les réglages) est toujours là : on ne s'enferme jamais dehors.
import { glyphe as G, glyphePloxion } from './glyphes.js';   // ◇ (0.54) des glyphes, plus d'emoji
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const ELEMENTS = [['compte', '👤 compte'], ['vocal', '🎙 vocal (enregistrer, transcrire)'], ['tsoin', '⧗ noter un tsoin'], ['reseau', '📶 réseau et mode connecté'], ['heure', '🕐 heure'], ['chercher', '🔎 chercher un ploxion'], ['epingles', '📌 ploxions épinglés']];
export const HUD_DEFAUT = { elements: ELEMENTS.map(([k]) => ({ k, on: k === 'compte' || k === 'epingles' || k === 'reseau' || k === 'vocal' || k === 'tsoin' })), epingles: [] };

const teinte = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };
export function creerHud({ W = globalThis.window, compte, boxion = null, trouver = () => null, modeConnecte = () => true, vocalEnCours = () => false }) {
  const D = W.document;
  let config = HUD_DEFAUT;
  const abonnes = new Set();
  const normaliser = (c) => {
    const vus = new Set(), el = [];
    for (const e of (c && Array.isArray(c.elements) ? c.elements : [])) if (e && ELEMENTS.some(x => x[0] === e.k) && !vus.has(e.k)) { vus.add(e.k); el.push({ k: e.k, on: !!e.on }); }
    for (const e of HUD_DEFAUT.elements) if (!vus.has(e.k)) el.push({ ...e });
    return { elements: el, epingles: (c && Array.isArray(c.epingles) ? c.epingles : []).filter(x => typeof x === 'string').slice(0, 4) };
  };
  const pret = boxion ? boxion.get('reglages', 'hud').then(c => { config = normaliser(c); }).catch(() => {}) : Promise.resolve();
  function fermer() { const f = D.querySelector('.px-feuille'); if (f) f.remove(); }
  function feuille(html, actions) {
    fermer();
    const f = D.createElement('div'); f.className = 'px-feuille'; f.innerHTML = '<div>' + html + '</div>';
    f.addEventListener('click', async (e) => {
      if (e.target === f) return fermer();
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = actions[b.getAttribute('data-a')]; if (!a) return;
      b.disabled = true;
      try { await a(); fermer(); } catch (er) { b.disabled = false; b.textContent = '⚠ ' + String(er.message || er).slice(0, 80); }
    });
    D.body.appendChild(f);
  }
  function bouton(compact) {
    const e = compte.etat();
    if (!e.connecte) return '<button class="px-compte" data-compte>' + (compact ? G('compte') : G('compte') + ' Se connecter') + '</button>';
    return '<button class="px-compte on" data-compte title="' + esc(e.nom) + ' · ' + esc(e.palier) + '"><span class="g">' + esc(e.glyphe || '·') + '</span>' + (compact ? '' : esc(String(e.nom || '').slice(0, 14))) + '</button>';
  }
  const morceaux = {
    compte: bouton,
    reseau: () => { const en = W.navigator.onLine !== false, mc = modeConnecte(); return '<span class="px-h-ic" title="' + (en ? (mc ? 'en ligne, mode connecté' : 'en ligne, mode connecté coupé') : 'hors ligne') + '">' + (en ? (mc ? G('reseau') : G('reseau', 'px-g-pale')) : G('horsligne')) + '</span>'; },
    heure: () => '<span class="px-h-ic px-heure">' + new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) + '</span>',
    chercher: () => '<button class="px-h-b" data-chercher aria-label="chercher un ploxion">' + G('chercher') + '</button>',
    tsoin: () => '<button class="px-h-b" data-tsoin aria-label="noter un tsoin">' + G('tsoin') + '</button>',
    vocal: () => '<button class="px-h-b' + (vocalEnCours() ? ' px-rec' : '') + '" data-vocal aria-label="vocal">' + (vocalEnCours() ? '■' : G('vocal')) + '</button>',
    epingles: () => config.epingles.map(id => { const p = trouver(id); return p ? '<button class="px-h-b" data-hud-px="' + esc(id) + '" aria-label="' + esc(p.nom || id) + '" style="--t:' + teinte(id) + '">' + glyphePloxion(p) + '</button>' : ''; }).join(''),
  };
  return {
    pret,
    config: () => normaliser(config),
    async regler(c) { config = normaliser(c); if (boxion) await boxion.put('reglages', 'hud', config); for (const f of abonnes) { try { f(config); } catch (e) { /* */ } } return config; },
    surChangement(f) { abonnes.add(f); return () => abonnes.delete(f); },
    /** compact = la barre d'un ploxion ouvert ; reglages = le bouton ⚙ (toujours sur l'accueil) */
    html(compact, { reglages = !compact } = {}) {
      const h = config.elements.filter(e => e.on).map(e => morceaux[e.k](compact)).join('');
      return h + (reglages ? '<button class="px-h-b" data-reglages aria-label="réglages">' + G('reglages') + '</button>' : '');
    },
    ouvrir() {
      const e = compte.etat();
      if (!e.connecte) {
        feuille('<h2>Se connecter</h2><p>Relie ploxi0n à ton compte du xerboxion : tes ploxions connectés, tes fichiers, tes autres xers. Sans compte, tout reste sur ton téléphone.</p><p>Avec Apple : un nouveau compte <b>bion</b> (pour monter : le code d\'un xerion, ou installer ton boxion).</p>'
          + '<button class="p" data-a="xer">Avec mon compte xerboxion.org</button>'
          + '<button class="apple" data-a="apple">  Continuer avec Apple</button>'
          + '<button data-a="fermer">Plus tard</button>', {
          xer: () => compte.connecter(),
          apple: () => compte.connecterApple(),
          fermer: async () => {},
        });
      } else {
        feuille('<h2>' + esc(e.glyphe || '·') + ' ' + esc(e.nom) + '</h2><p>Connecté au xerboxion, rang <b>' + esc(e.palier) + '</b>. Pour monter de rang : le code d\'un xerion (→ zion), ou installer ton boxion (→ xeroction).</p>'
          + (e.apple ? '<p class="px-sous">  Apple ID lié : « Continuer avec Apple » ouvre aussi ce compte.</p><button data-a="delier">Délier mon Apple ID</button>'
            : '<button class="apple" data-a="lier">  Lier mon Apple ID</button><p class="px-sous">ensuite, Apple ou ton compte xerboxion.org : l\'un ou l\'autre ouvre ce compte</p>')
          + '<button data-a="sortir">Se déconnecter</button><button data-a="fermer">Fermer</button>', {
          lier: async () => {
            try { await compte.lierApple(); }
            catch (er) {
              if (!er.fusionnable) throw er;
              // l'Apple ID a déjà son compte (un bion né d'Apple) : le fondre dans celui-ci, sur confirmation
              const a = er.autre || {};
              W.setTimeout(() => feuille('<h2>Fusionner les deux comptes ?</h2><p>Ton Apple ID a déjà son propre compte : <b>' + esc(a.nom || 'un bion') + '</b>' + (a.cree ? ' (créé le ' + esc(a.cree) + ')' : '') + '.</p>'
                + '<p>Il se fond dans <b>' + esc(e.nom) + '</b> : ses données sont <b>copiées</b> ici (rien n\'est effacé ; en cas de doublon, ce compte-ci gagne), ses fichiers vont dans « depuis-apple ». Ensuite, Apple ou xerboxion.org : l\'un ou l\'autre ouvre ce compte.</p>'
                + '<button class="p" data-a="fusion">Fusionner (Apple redemande)</button><button data-a="fermer">Annuler</button>', {
                fusion: () => compte.lierApple({ fusionner: true }),
                fermer: async () => {},
              }), 50);
            }
          },
          delier: () => compte.delierApple(),
          sortir: () => compte.deconnecter(),
          fermer: async () => {},
        });
      }
    },
  };
}
