// 📤 L'ENVOI DE FICHIERS PAR LE MODE CONNECTÉ (0.85). Jusqu'ici, un ploxion qui envoyait un fichier au labo (FormData, Blob) recevait
// 503 « corps non texte (fichier) : pas encore relayé » : le relais du shim (jos.js) ne savait passer que du texte au HTTP natif. Or le pont
// de Capacitor sait envoyer du multipart (CapacitorUrlRequest.swift : dataType « formData » = [{ key, value, type: 'string' | 'base64File',
// fileName, contentType }], le boundary posé par iOS ; dataType « file » = un corps binaire en base64).
// ⚠ le Swift force-déballe fileName et contentType d'un fichier (`item["fileName"]!`) : sans eux, l'app plante. On les donne TOUJOURS.
// Un nom de fichier va dans un en-tête (Content-Disposition) : ni guillemet ni retour à la ligne.
export const MAX_OCTETS = 60 * 1024 * 1024;   // tout passe en base64 par le pont : au-delà, la mémoire de la WebView souffre

/** des octets → base64 (par tranches : String.fromCharCode(...grand tableau) déborde la pile) */
export function base64(octets) {
  const u = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
export const nomSur = (n) => String(n || 'fichier').replace(/["\r\n\\]/g, '_').slice(0, 200) || 'fichier';

async function octetsDe(b, W) {
  if (typeof b.arrayBuffer === 'function') return new Uint8Array(await b.arrayBuffer());
  return new Promise((ok, ko) => { const r = new W.FileReader(); r.onload = () => ok(new Uint8Array(r.result)); r.onerror = () => ko(r.error); r.readAsArrayBuffer(b); });
}

/** le corps d'un fetch → ce que le relais sait envoyer : une chaîne, { dataType, data, type, original } (fichiers), undefined (pas de corps) ;
 *  null = un corps qu'on ne sait pas relayer (un flux) ; lève une erreur lisible au-delà de MAX_OCTETS */
export async function corpsRelayable(body, W = globalThis.window) {
  if (body == null) return undefined;
  if (typeof body === 'string') return body;
  if (W.URLSearchParams && body instanceof W.URLSearchParams) return body.toString();
  let total = 0;
  const compter = (n) => { total += n; if (total > MAX_OCTETS) throw new Error('fichier trop lourd pour l\'app (' + Math.round(total / 1048576) + ' Mo, 60 au plus)'); };
  if (W.FormData && body instanceof W.FormData) {
    const data = [];
    for (const [key, value] of body.entries()) {
      if (W.Blob && value instanceof W.Blob) {
        compter(value.size || 0);
        data.push({ key: String(key), value: base64(await octetsDe(value, W)), type: 'base64File', fileName: nomSur(value.name || 'blob'), contentType: value.type || 'application/octet-stream' });
      } else data.push({ key: String(key), value: String(value), type: 'string' });
    }
    return { dataType: 'formData', data, original: body };
  }
  if (W.Blob && body instanceof W.Blob) { compter(body.size || 0); return { dataType: 'file', data: base64(await octetsDe(body, W)), type: body.type || 'application/octet-stream', original: body }; }
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    const u = body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    compter(u.length); return { dataType: 'file', data: base64(u), type: 'application/octet-stream', original: body };
  }
  return null;
}
