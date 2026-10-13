// 🎞 (0.49) le lecteur intégré et les bions de fichiers : jOSplayer d'un ploxion, lien vlc://, reprise, ploxi0n://lire, zip, aperçu, lampe, envoyer.
export default async function ({ page, appels, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const ouvertures = () => appels.filter(a => a.p === 'PloxiLecteur' && a.m === 'ouvrir').map(a => ({ url: a.o.url, position: a.o.position, moteur: a.o.moteur }));
  const r = {};
  // 1. le bion jOSplayer d'un ploxion (Stremio) : une vidéo → natif ; une page → le lecteur du web
  await page.evaluate(() => {
    window.jOSplayer = { resolve: (u) => (/\.(mp4|webm|m3u8)/.test(u) ? { kind: 'video', src: u } : { kind: 'iframe', src: u }), open: (u) => { window.__web = u; }, embed: () => ({ kind: 'iframe' }) };
    window.ploxi0nLecteurNatif.brancherJosPlayer(window.jOSplayer);
    window.jOSplayer.open('https://debrid.example/films/rick.mkv'); window.jOSplayer.open('https://www.youtube.com/watch?v=abc');
  });
  await page.waitForTimeout(300);
  r.josplayer = { natif: ouvertures().map(o => o.url), web: await page.evaluate(() => window.__web) };
  // 2. un lien vers VLC dans un ploxion
  await page.evaluate(() => { const a = document.createElement('a'); a.href = 'vlc-x-callback://x-callback-url/stream?url=' + encodeURIComponent('https://tb.example/s/9E3.mkv'); a.textContent = 'Rick and Morty S9E3'; document.body.appendChild(a); a.click(); a.remove(); });
  await page.waitForTimeout(300);
  r.lienVlc = ouvertures().at(-1);
  // 3. la reprise : position notée, puis rouverte
  emettre('PloxiLecteur', 'lecteur', { etat: 'position', moteur: 'vlc', position: 1234, duree: 1400 * 2 });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.jOSNatif.lecteur.ouvrir('https://tb.example/s/9E3.mkv'));
  await page.waitForTimeout(200);
  r.reprise = ouvertures().at(-1);
  // 4. ploxi0n://lire (le bouton « ▶ ploxi0n » d'un ploxion seul)
  emettre('App', 'appUrlOpen', { url: 'ploxi0n://lire?url=' + encodeURIComponent('https://cdn.example/a.mp4') + '&titre=Film&position=60' });
  await page.waitForTimeout(400);
  r.deepLink = ouvertures().at(-1);
  // 5. les bions de fichiers
  r.fichiers = await page.evaluate(async () => {
    const N = window.jOSNatif, out = {};
    const z = await N.zip([{ nom: 'a.txt', data: 'salut' }, { nom: 'b.json', data: '{"x":1}' }]);
    const l = await N.dezipper(z); out.zip = [z.type, z.size > 0, l.map(f => f.nom + ':' + new TextDecoder().decode(f.data)).join(' ')];
    out.apercu = await N.apercu({ nom: 'note.txt', data: 'bonjour' });
    out.lampe = await N.lampe(true, 0.5);
    out.envoyer = await N.envoyer([{ nom: 'carte.vcf', data: 'BEGIN:VCARD' }], { titre: 'contact' }).then(() => 'ok', e => 'ERREUR ' + e.message);
    out.shareFichiers = await navigator.share({ title: 't', files: [new File(['x'], 'x.txt', { type: 'text/plain' })] }).then(() => 'ok', e => 'ERREUR ' + e.message);
    return out;
  });
  r.natifsFichiers = [...new Set(appels.filter(a => ['PloxiApple', 'Share', 'Filesystem'].includes(a.p) && ['apercu', 'lampe', 'share', 'writeFile'].includes(a.m)).map(a => a.p + '.' + a.m + (a.m === 'share' ? '(' + (a.o.files || []).length + ' fichier)' : '')))];
  return r;
}
