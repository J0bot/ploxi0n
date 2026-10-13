import { readFileSync } from 'node:fs';
// 🎞 (0.49) le lecteur intégré et les bions de fichiers : jOSPlayer (le vrai bion du labo, 0.51), lien vlc://, reprise, ploxi0n://lire, zip, aperçu, lampe, envoyer.
export default async function ({ page, appels, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const ouvertures = () => appels.filter(a => a.p === 'PloxiLecteur' && a.m === 'ouvrir').map(a => ({ url: a.o.url, position: a.o.position, moteur: a.o.moteur }));
  const r = {};
  // 1. (0.51) le VRAI bion jOSPlayer du labo (Stremio) : play() d'un flux → natif (VLC pour un DTS/MKV, sous-titres) ; YouTube → le Lecteur du web
  await page.evaluate((code) => {
    window.__web = []; window.__mobileAvant = window.jOSMobile && window.jOSMobile.open;
    window.jOSMobile = window.jOSMobile || {}; window.jOSMobile.open = (id) => { window.__web.push(id); };
    (0, eval)(code); window.ploxi0nLecteurNatif.brancherJosPlayer(window.jOSPlayer);
  }, readFileSync(new URL('../../tests/donnees/jOSPlayer.labo.js', import.meta.url), 'utf8'));
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.jOSPlayer.play('https://debrid.example/films/rick.DTS.mkv', { title: 'Rick and Morty S9E3', key: 'tt9:9:3', subs: [{ url: 'https://s.example/fr.srt', lang: 'fre' }] }); window.jOSPlayer.play('', { ytid: 'abc' }); });
  await page.waitForTimeout(300);
  r.josPlayer = { natif: appels.filter(a => a.p === 'PloxiLecteur' && a.m === 'ouvrir').map(a => ({ url: a.o.url, titre: a.o.titre, moteur: a.o.moteur, sousTitres: a.o.sousTitres })), web: await page.evaluate(() => window.__web),
    capacites: await page.evaluate(() => window.jOSPlayer.natif) };
  await page.evaluate(() => { if (window.__mobileAvant) window.jOSMobile.open = window.__mobileAvant; });
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
