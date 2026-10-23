// 🦀 LE CŒUR EN RUST (0.99.17, RS-7 : « le plus de truc en Rust possible ; tout natif ou en Rust ») : rust/ploxi-coeur compilé en WASM
// (public/coeur/ploxi_coeur.wasm). Une seule porte, la même que pour le Swift d'iOS : px_appel(nom, json) → json.
// chargerCoeur(octets | Response | URL) → { appel(nom, donnees), version } ; une erreur du cœur devient une exception.

export async function chargerCoeur(source = 'coeur/ploxi_coeur.wasm') {
  const octets = source instanceof ArrayBuffer || ArrayBuffer.isView(source) ? source
    : await (typeof source === 'string' || source instanceof URL ? fetch(source) : source).then(r => r.arrayBuffer());
  const { instance } = await WebAssembly.instantiate(octets, {});
  const ex = instance.exports, enc = new TextEncoder(), dec = new TextDecoder();
  const poser = (u8) => { const p = ex.px_reserver(u8.length); new Uint8Array(ex.memory.buffer, p, u8.length).set(u8); return p; };
  function appelTexte(nom, json) {
    const n = enc.encode(nom), j = enc.encode(json), pn = poser(n), pj = poser(j);
    const r = ex.px_appel(pn, n.length, pj, j.length), p = Number(r >> 32n), l = Number(r & 0xffffffffn);
    const s = dec.decode(new Uint8Array(ex.memory.buffer, p, l).slice());
    ex.px_liberer(p, l); ex.px_liberer(pn, n.length); ex.px_liberer(pj, j.length);
    return s;
  }
  function appel(nom, donnees = null) {
    const o = JSON.parse(appelTexte(nom, JSON.stringify(donnees === undefined ? null : donnees)));
    if (o && 'erreur' in o) throw new Error(o.erreur);
    return o.ok;
  }
  return { appel, appelTexte, version: appel('version') };
}
