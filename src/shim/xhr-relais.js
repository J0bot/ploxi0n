// 📤 (0.85) XMLHttpRequest vers les routes du serveur → le fetch du shim. Le shim (jos.js) remplace fetch : les routes du serveur y sont
// servies en local, ou relayées au labo en mode connecté. Mais certains bions du labo envoient par XMLHttpRequest — le système de fichiers
// (FS.write avec o.progres : seul XHR donne la progression d'un envoi) — et un XHR vers « /fs/write » partait sur capacitor://localhost : rien.
// Ici : un XHR même origine, asynchrone, hors fichiers de l'app (ASSETS), passe par W.fetch ; tout le reste garde le vrai XMLHttpRequest.
// La progression d'envoi : le HTTP natif ne la donne pas ; « loadstart » au départ, puis « progress » 100 % et « load » à la fin.
const EVENEMENTS = ['readystatechange', 'loadstart', 'progress', 'load', 'error', 'abort', 'timeout', 'loadend'];

class Cible {
  constructor() { this._ec = {}; for (const e of EVENEMENTS) this['on' + e] = null; }
  addEventListener(t, f) { (this._ec[t] = this._ec[t] || new Set()).add(f); }
  removeEventListener(t, f) { if (this._ec[t]) this._ec[t].delete(f); }
  _emettre(t, ev = {}) {
    const e = { type: t, target: this, currentTarget: this, lengthComputable: false, loaded: 0, total: 0, ...ev };
    try { if (typeof this['on' + t] === 'function') this['on' + t].call(this, e); } catch (x) { setTimeout(() => { throw x; }); }
    for (const f of [...(this._ec[t] || [])]) { try { f.call(this, e); } catch (x) { setTimeout(() => { throw x; }); } }
  }
}

/** remplace W.XMLHttpRequest ; `relayer(url)` dit si une adresse (absolue) passe par le shim */
export function installerXhrRelais(W, relayer) {
  const Vrai = W.XMLHttpRequest; if (!Vrai || Vrai.__pxRelais) return;
  const taille = (b) => {
    if (b == null) return 0;
    if (W.FormData && b instanceof W.FormData) { let n = 0; for (const [, v] of b.entries()) n += typeof v === 'string' ? v.length : (v.size || 0); return n; }
    return typeof b === 'string' ? b.length : b.size != null ? b.size : b.byteLength != null ? b.byteLength : 0;
  };
  class XHR extends Cible {
    constructor() {
      super();
      this.readyState = 0; this.status = 0; this.statusText = ''; this.responseType = ''; this.response = null; this.responseText = ''; this.responseURL = '';
      this.timeout = 0; this.withCredentials = false; this.upload = new Cible(); this._h = {}; this._rh = null; this._vrai = null; this._fini = false;
    }
    open(methode, url, async = true, user, pass) {
      const u = new W.URL(String(url), W.location.href);
      if (async === false || !relayer(u)) {   // le vrai XMLHttpRequest, branché sur nos écouteurs
        const v = this._vrai = new Vrai();
        for (const e of EVENEMENTS) {
          v.addEventListener(e, (ev) => { this._copier(); this._emettre(e, { lengthComputable: ev.lengthComputable, loaded: ev.loaded, total: ev.total }); });
          v.upload.addEventListener(e, (ev) => this.upload._emettre(e, { lengthComputable: ev.lengthComputable, loaded: ev.loaded, total: ev.total }));
        }
        return v.open(methode, url, async, user, pass);
      }
      this._m = String(methode || 'GET').toUpperCase(); this._u = u.href; this.readyState = 1; this._emettre('readystatechange');
    }
    _copier() { const v = this._vrai; if (!v) return; for (const k of ['readyState', 'status', 'statusText', 'responseURL']) this[k] = v[k]; try { this.response = v.response; } catch (e) { /* */ } try { this.responseText = v.responseText; } catch (e) { /* responseType non texte */ } }
    setRequestHeader(k, v) { if (this._vrai) return this._vrai.setRequestHeader(k, v); this._h[k] = v; }
    overrideMimeType(m) { if (this._vrai) this._vrai.overrideMimeType(m); }
    getResponseHeader(k) { if (this._vrai) return this._vrai.getResponseHeader(k); return this._rh ? this._rh.get(k) : null; }
    getAllResponseHeaders() { if (this._vrai) return this._vrai.getAllResponseHeaders(); let s = ''; if (this._rh) this._rh.forEach((v, k) => { s += k + ': ' + v + '\r\n'; }); return s; }
    abort() { if (this._vrai) { this._vrai.abort(); return; } if (this._fini) return; this._fini = true; this.readyState = 4; this.status = 0; this._emettre('readystatechange'); this._emettre('abort'); this._emettre('loadend'); }
    send(corps) {
      if (this._vrai) { for (const p of ['responseType', 'timeout', 'withCredentials']) { try { this._vrai[p] = this[p]; } catch (e) { /* */ } } return this._vrai.send(corps); }
      const total = taille(corps);
      this._emettre('loadstart'); if (corps != null) this.upload._emettre('loadstart', { lengthComputable: true, loaded: 0, total });
      const minuteur = this.timeout > 0 ? setTimeout(() => { if (this._fini) return; this._fini = true; this.readyState = 4; this._emettre('readystatechange'); this._emettre('timeout'); this._emettre('loadend'); }, this.timeout) : 0;
      Promise.resolve().then(() => W.fetch(this._u, { method: this._m, headers: this._h, body: this._m === 'GET' || this._m === 'HEAD' ? undefined : corps })).then(async (r) => {
        if (this._fini) return;
        if (corps != null) { this.upload._emettre('progress', { lengthComputable: true, loaded: total, total }); this.upload._emettre('load', { lengthComputable: true, loaded: total, total }); this.upload._emettre('loadend', { lengthComputable: true, loaded: total, total }); }
        this.status = r.status; this.statusText = r.statusText || ''; this.responseURL = this._u; this._rh = r.headers;
        this.readyState = 2; this._emettre('readystatechange');
        const t = this.responseType;
        if (t === 'blob') this.response = await r.blob();
        else if (t === 'arraybuffer') this.response = await r.arrayBuffer();
        else { const x = await r.text(); this.responseText = x; if (t === 'json') { try { this.response = JSON.parse(x); } catch (e) { this.response = null; } } else this.response = x; }
        if (this._fini) return; this._fini = true; clearTimeout(minuteur);
        this.readyState = 4; this._emettre('readystatechange'); this._emettre('progress', { lengthComputable: true, loaded: 1, total: 1 }); this._emettre('load'); this._emettre('loadend');
      }).catch(() => {
        if (this._fini) return; this._fini = true; clearTimeout(minuteur);
        this.readyState = 4; this.status = 0; this._emettre('readystatechange'); this._emettre('error'); this._emettre('loadend');
      });
    }
  }
  XHR.UNSENT = 0; XHR.OPENED = 1; XHR.HEADERS_RECEIVED = 2; XHR.LOADING = 3; XHR.DONE = 4; XHR.__pxRelais = true;
  W.XMLHttpRequest = XHR;
}
