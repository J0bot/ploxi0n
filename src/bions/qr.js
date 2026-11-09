// @bion qr — un code QR en SVG, sans réseau ni plugin (le téléphone, Android, le navigateur) | api: qrSvg, qrModules
// (0.99.35) PloxiApple.qr (CoreImage) n'existe que sur l'iPhone ; Proche a besoin du QR hors ligne, partout : qrcode-generator (MIT).
import qrcode from 'qrcode-generator';

/** la matrice : un tableau de lignes de booléens (true = noir) */
export function qrModules(texte, niveau = 'M') {
  const q = qrcode(0, niveau); q.addData(String(texte), 'Byte'); q.make();
  const n = q.getModuleCount(), m = [];
  for (let y = 0; y < n; y++) { const l = []; for (let x = 0; x < n; x++) l.push(q.isDark(y, x)); m.push(l); }
  return m;
}
/** un <svg> carré (une seule <path>, nette à toutes les tailles) ; marge en modules (4 = la zone calme de la norme) */
export function qrSvg(texte, { marge = 4, niveau = 'M', titre = 'code QR' } = {}) {
  const m = qrModules(texte, niveau), n = m.length, t = n + marge * 2;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + marge) + ' ' + (y + marge) + 'h1v1h-1z';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img" aria-label="' + esc(titre) + '"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
}
