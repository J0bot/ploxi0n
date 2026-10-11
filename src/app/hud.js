// Le HUD du compte (RS-7 : « un bouton se connecter facilement accessible dans le HUD et l'UI ») : une pastille toujours visible, en haut de
// l'accueil et dans la barre de chaque ploxion. Déconnecté : « Se connecter » ; connecté : le glyphe du rang et le nom. La toucher ouvre une
// feuille : se connecter avec son compte xerboxion.org, (bientôt) continuer avec Apple, ou se déconnecter.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function creerHud({ W = globalThis.window, compte }) {
  const D = W.document;
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
  return {
    html(compact) {
      const e = compte.etat();
      if (!e.connecte) return '<button class="px-compte" data-compte>' + (compact ? '👤' : '👤 Se connecter') + '</button>';
      return '<button class="px-compte on" data-compte title="' + esc(e.nom) + ' · ' + esc(e.palier) + '"><span class="g">' + esc(e.glyphe || '·') + '</span>' + (compact ? '' : esc(String(e.nom || '').slice(0, 14))) + '</button>';
    },
    ouvrir() {
      const e = compte.etat();
      if (!e.connecte) {
        feuille('<h2>Se connecter</h2><p>Relie ploxi0n à ton compte du xerboxion : tes ploxions connectés, tes fichiers, tes autres xers. Sans compte, tout reste sur ton téléphone.</p>'
          + '<button class="p" data-a="xer">Avec mon compte xerboxion.org</button>'
          + '<button class="apple" data-a="apple">  Continuer avec Apple</button>'
          + '<button data-a="fermer">Plus tard</button>', {
          xer: () => compte.connecter(),
          apple: async () => { throw new Error('bientôt : la création de compte avec Apple arrive'); },
          fermer: async () => {},
        });
      } else {
        feuille('<h2>' + esc(e.glyphe || '·') + ' ' + esc(e.nom) + '</h2><p>Connecté au xerboxion, rang <b>' + esc(e.palier) + '</b>. Pour monter de rang : le code d\'un xerion (→ zion), ou installer ton boxion (→ xeroction).</p>'
          + '<button data-a="sortir">Se déconnecter</button><button data-a="fermer">Fermer</button>', {
          sortir: () => compte.deconnecter(),
          fermer: async () => {},
        });
      }
    },
  };
}
