// ⧗ LES TSOINS NATIFS (RS-7 12.10 : « je veux pouvoir faire des tsoins natifs »). Un tsoin = un moment de ta vie, noté d'un geste :
//   - le composeur : une feuille au pouce — le texte (le clavier d'iOS, la dictée), un genre (fait · idée · note · humeur · but),
//     📷 une photo, 📍 le lieu, 🎙 un vocal transcrit, ⧉ le ploxion où tu étais. Enregistrer → boxion_local « tsoins »
//     { kind: 'tsoin', genre, d, ploxion?, lieu?, photo?, vocal?, source: 'natif' } (la photo à part : « tsoins-medias/<id> »).
//   - connecté : le tsoin part aussi au boxion (jOSBoxion « tsoins-natifs/<id> », sans la photo) — hors ligne, la file le pousse au retour.
//   - le journal ⧗ : un ploxion interne, les tsoins par jour, et le bouton « + tsoin » en bas.
//   - les portes : ⧗ dans le dock (HUD), un geste de bord (« les deux · bas » par défaut), Siri (« Tell ploxi0n note … »),
//     et jOSNatif.tsoin({ texte, genre }) pour les ploxions.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const GENRES = [['fait', '⧗ fait'], ['idee', '💡 idée'], ['note', '📝 note'], ['humeur', '🌡 humeur'], ['but', '🎯 but'], ['dodo', '☾ dodo'], ['reveil', '☀ réveil']];
// ☾ (0.64, RS-7 : « un moyen facile de dire quand je vais me coucher : dans le bouton tsoin, la santé, le sommeil, et là : dodo ; et on pourra
// comparer avec les données de la Garmin ») DODO et RÉVEIL : un toucher dans le composeur (la rangée « santé ») note l'heure, sans rien
// écrire ; la page Santé met la nuit dite à côté de la nuit mesurée (la montre → Garmin Connect → Apple Santé → ploxi0n) : comparerNuit().
export const VITE = [['dodo', '☾ dodo', 'je vais me coucher'], ['reveil', '☀ réveil', 'je me lève']];
const MAX_PHOTO = 1.5e6;

export function creerTsoinNatif({ W = globalThis.window, boxion, vibrer = () => {}, contexte = () => null, vocal = null, distant = () => null }) {
  const D = W.document, nj = () => W.jOSNatif || {};
  async function enregistrer({ texte = '', genre = 'fait', ploxion = null, lieu = null, photo = null, vocalId = null } = {}) {
    const d = String(texte || '').trim();
    if (!d && !photo && !vocalId) throw new Error('un tsoin vide');
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), le = new Date().toISOString();
    if (photo) await boxion.put('tsoins-medias', id, { photo }).catch(() => {});
    const e = { kind: 'tsoin', id, genre: GENRES.some(g => g[0] === genre) ? genre : 'fait', d: d.slice(0, 2000), source: 'natif', le };
    if (ploxion) e.ploxion = ploxion; if (lieu) e.lieu = lieu; if (photo) e.photo = true; if (vocalId) e.vocal = vocalId;
    await boxion.append('tsoins', e);
    // au boxion (connecté) : la même API que le xer ; jOSBoxion connecté file l'écriture hors ligne
    const jb = distant(); if (jb && jb.set) { try { await jb.set('tsoins-natifs', id, e, d.slice(0, 80) || genre); } catch (er) { /* la copie locale fait foi */ } }
    vibrer('succes');
    return e;
  }
  async function liste(n = 200) {
    const t = await boxion.lire('tsoins', { limite: 5000 }).catch(() => []);
    return t.filter(x => x.entry && x.entry.kind === 'tsoin').slice(-n).reverse().map(x => ({ ...x.entry, t: x.t }));
  }

  /** le composeur : une feuille, les boutons en bas ; pre = { texte, genre } */
  function ouvrir(pre = {}) {
    return new Promise((fin) => {
      const ici = contexte();
      const st = { genre: pre.genre || 'fait', photo: null, lieu: null, vocalId: null, ploxion: ici, enreg: false };
      const f = D.createElement('div'); f.className = 'px-voile px-tsoin';
      const peindre = () => {
        const garde = f.querySelector('[data-texte]'), val = garde ? garde.value : (pre.texte || '');
        f.innerHTML = '<div class="px-tiroir"><p class="px-ft">⧗ un tsoin · ' + new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) + '</p>'
          + '<textarea data-texte rows="4" placeholder="ce qui se passe, ce que tu fais, une idée…" enterkeyhint="done">' + esc(val) + '</textarea>'
          + '<div class="px-tsoin-vite"><small>santé · sommeil</small>' + VITE.map(([k, t, q]) => '<button data-vite="' + k + '" aria-label="' + q + '">' + t + '</button>').join('') + '</div>'
          + '<div class="px-puces">' + GENRES.filter(([k]) => !VITE.some(v => v[0] === k)).map(([k, t]) => '<button data-genre="' + k + '" class="px-puce' + (k === st.genre ? ' on' : '') + '">' + t + '</button>').join('') + '</div>'
          + (st.photo ? '<img class="px-tsoin-photo" src="' + esc(st.photo) + '" alt="">' : '')
          + '<div class="px-puces">'
          + '<button data-j="photo" class="px-puce' + (st.photo ? ' on' : '') + '">📷 ' + (st.photo ? 'photo ✓' : 'photo') + '</button>'
          + '<button data-j="lieu" class="px-puce' + (st.lieu ? ' on' : '') + '">📍 ' + (st.lieu ? 'lieu ✓' : 'lieu') + '</button>'
          + (vocal ? '<button data-j="vocal" class="px-puce' + (st.enreg ? ' px-rec on' : st.vocalId ? ' on' : '') + '">' + (st.enreg ? '■ arrêter' : st.vocalId ? '🎙 vocal ✓' : '🎙 vocal') + '</button>' : '')
          + (ici ? '<button data-j="ploxion" class="px-puce' + (st.ploxion ? ' on' : '') + '">⧉ ' + esc(ici) + '</button>' : '')
          + '</div><p class="px-sous" data-msg></p>'
          + '<div class="px-tuto-btn"><button data-j="annuler">annuler</button><button class="p" data-j="ok">noter</button></div></div>';
      };
      const msg = (m) => { const p = f.querySelector('[data-msg]'); if (p) p.textContent = m; };
      const fermer = (r) => { f.remove(); fin(r); if (W.jOSMiniDock) W.jOSMiniDock.retirer('tsoin-brouillon'); };
      // ▤ (0.51) toucher à côté avec du texte = le MINIMISER : un mini dock « ⧗ brouillon » le rouvre tel quel (annuler = le jeter)
      const minimiser = () => {
        const texte = (f.querySelector('[data-texte]') || {}).value || '', genre = st.genre;
        f.remove(); fin(null);
        if (!texte.trim() || !W.jOSMiniDock) return;
        W.jOSMiniDock.publier({ cle: 'tsoin-brouillon', titre: 'tsoin pas fini', icone: '⧗', sous: '« ' + texte.trim().slice(0, 90) + ' »', ouvrir: () => ouvrir({ texte, genre }),
          actions: [{ id: 'noter', icone: '✓', nom: 'noter tel quel', faire: () => enregistrer({ texte, genre }).then(() => { W.jOSMiniDock.retirer('tsoin-brouillon'); vibrer('succes'); }) }] });
        vibrer('minimiser');
      };
      f.addEventListener('click', async (e) => {
        if (e.target === f) return minimiser();
        const g = e.target.closest('[data-genre]'); if (g) { st.genre = g.getAttribute('data-genre'); vibrer('selection'); return peindre(); }
        // ☾ dodo / ☀ réveil : noté tout de suite (le texte éventuel l'accompagne), la feuille se ferme
        const v = e.target.closest('[data-vite]');
        if (v) { const genre = v.getAttribute('data-vite'), t = ((f.querySelector('[data-texte]') || {}).value || '').trim(); try { fermer(await enregistrer({ texte: t || (genre === 'dodo' ? 'dodo' : 'réveil'), genre, ploxion: null })); } catch (er) { msg(er.message); } return; }
        const b = e.target.closest('[data-j]'); if (!b) return;
        const j = b.getAttribute('data-j');
        try {
          if (j === 'annuler') return fermer(null);
          if (j === 'photo') { if (st.photo) st.photo = null; else { const p = await nj().photo({ source: 'galerie' }); if (p && p.length > MAX_PHOTO) throw new Error('photo trop lourde'); st.photo = p || null; } return peindre(); }
          if (j === 'lieu') { st.lieu = st.lieu ? null : await nj().position(); return peindre(); }
          if (j === 'ploxion') { st.ploxion = st.ploxion ? null : ici; return peindre(); }
          if (j === 'vocal') {
            if (!st.enreg) { await vocal.commencer(); st.enreg = true; return peindre(); }
            const v = await vocal.arreter(); st.enreg = false; st.vocalId = v.id;
            const ta = f.querySelector('[data-texte]'); if (v.texte) ta.value = (ta.value ? ta.value + ' ' : '') + v.texte;
            return peindre();
          }
          if (j === 'ok') {
            if (st.enreg) { const v = await vocal.arreter(); st.enreg = false; st.vocalId = v.id; }
            const e2 = await enregistrer({ texte: f.querySelector('[data-texte]').value, genre: st.genre, ploxion: st.ploxion, lieu: st.lieu && { lat: +(+st.lieu.lat).toFixed(4), lng: +(+st.lieu.lng).toFixed(4) }, photo: st.photo, vocalId: st.vocalId });
            return fermer(e2);
          }
        } catch (er) { vibrer('erreur'); st.enreg = false; msg('⚠ ' + (er.message || er)); }
      });
      (D.getElementById('ploxi0n') || D.body).appendChild(f);
      peindre();
      const ta = f.querySelector('[data-texte]'); if (ta) try { ta.focus(); } catch (e) { /* */ }
      vibrer('leger');
    });
  }

  /** le journal ⧗ : un ploxion interne */
  function mount(hote) {
    let vivant = true;
    const dessiner = async () => {
      const l = await liste(); if (!vivant) return;
      const jours = new Map();
      for (const t of l) { const j = new Date(t.t || t.le).toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' }); if (!jours.has(j)) jours.set(j, []); jours.get(j).push(t); }
      const g = (k) => (GENRES.find(x => x[0] === k) || GENRES[0])[1].split(' ')[0];
      hote.innerHTML = '<div class="px-page px-journal"><p class="px-grave">⧗ journal des tsoins · ' + l.length + '</p>'
        + (l.length ? '' : '<p class="px-sous">Aucun tsoin natif pour l\'instant. Note le premier : ce que tu fais, une idée, ton humeur. Ils se rejouent dans la machine à tsoins.</p>')
        + [...jours].map(([j, ts]) => '<h3>' + esc(j) + '</h3>' + ts.map(t => '<div class="px-ligne-tsoin"><span class="g">' + g(t.genre) + '</span><div><b>' + esc(new Date(t.t || t.le).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })) + '</b> ' + esc(t.d)
          + '<small>' + [t.ploxion ? '⧉ ' + esc(t.ploxion) : '', t.lieu ? '📍' : '', t.photo ? '📷' : '', t.vocal ? '🎙' : ''].filter(Boolean).join(' · ') + '</small></div></div>').join('')).join('')
        + '</div><div class="px-journal-bas"><button class="p" data-plus>+ tsoin</button></div>';
      hote.querySelector('[data-plus]').onclick = async () => { if (await ouvrir()) dessiner(); };
    };
    dessiner();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['journal-tsoins'] = { manifest: { id: 'journal-tsoins', name: 'Tsoins', icon: '⧗' }, mount };
  /** ☾ (0.64) d'un geste (Siri, un bord, un raccourci) : dodo / réveil */
  const dodo = () => enregistrer({ texte: 'dodo', genre: 'dodo' }), reveil = () => enregistrer({ texte: 'réveil', genre: 'reveil' });
  return { ouvrir, enregistrer, liste, dodo, reveil, ploxion: { id: 'journal-tsoins', nom: 'Tsoins', icone: '⧗', interne: true } };
}
