// 📤 (0.85) l'envoi de fichiers par le mode connecté : FormData, Blob, ArrayBuffer → le multipart / le binaire du HTTP natif ; un XHR vers
// une route du serveur passe par le fetch du shim (le FS du labo envoie ainsi pour suivre la progression)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { corpsRelayable, base64, nomSur, MAX_OCTETS } from '../src/shim/corps-fichier.js';
import { page, attendre } from './aide.mjs';

test('📤 corpsRelayable : texte tel quel ; FormData → formData (fichier en base64, nom et type TOUJOURS là) ; Blob, octets → file ; flux → null', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w;
    assert.equal(await corpsRelayable(undefined, W), undefined);
    assert.equal(await corpsRelayable('{"a":1}', W), '{"a":1}');
    assert.equal(await corpsRelayable(new W.URLSearchParams({ a: '1', b: 'x y' }), W), 'a=1&b=x+y');
    const fd = new W.FormData(); fd.append('path', '/photos/chat.jpg'); fd.append('file', new W.File([new Uint8Array([255, 216, 255])], 'chat "1"\n.jpg', { type: 'image/jpeg' })); fd.append('anonyme', new W.Blob(['abc']));
    const c = await corpsRelayable(fd, W);
    assert.equal(c.dataType, 'formData'); assert.equal(c.original, fd);
    assert.deepEqual(c.data[0], { key: 'path', value: '/photos/chat.jpg', type: 'string' });
    assert.deepEqual(c.data[1], { key: 'file', value: '/9j/', type: 'base64File', fileName: 'chat _1__.jpg', contentType: 'image/jpeg' });
    assert.equal(c.data[2].fileName, 'blob'); assert.equal(c.data[2].contentType, 'application/octet-stream', 'sans type : le Swift force-déballe, on en donne un');
    assert.equal(c.data[2].value, 'YWJj');
    const b = await corpsRelayable(new W.Blob(['salut'], { type: 'text/plain' }), W);
    assert.deepEqual({ ...b, original: null }, { dataType: 'file', data: 'c2FsdXQ=', type: 'text/plain', original: null });
    assert.equal((await corpsRelayable(new Uint8Array([1, 2, 3]), W)).data, 'AQID');
    assert.equal(await corpsRelayable({ getReader() {} }, W), null);
    await assert.rejects(corpsRelayable({ size: MAX_OCTETS + 1, type: '', __proto__: W.Blob.prototype }, W), /trop lourd/);
    assert.equal(base64(new Uint8Array(70000).fill(65)).length, Math.ceil(70000 / 3) * 4, 'par tranches, sans déborder la pile');
    assert.equal(nomSur(''), 'fichier');
  } finally { p.fin(); }
});

test('📤 le relais du mode connecté envoie un FormData au labo (plus de 503) ; sans le Content-Type de la page (iOS pose le boundary)', async () => {
  const envois = [];
  const relais = { routes: [], general: () => true, vers: (c) => 'https://labo.j0bot.ch' + c, envoyer: async (q) => { envois.push(q); return { status: 200, texte: '{"ok":true}', entetes: { 'content-type': 'application/json' } }; } };
  const p = await page({ relais, ploxions: [] });
  try {
    const W = p.w;
    const fd = new W.FormData(); fd.append('path', '/a.txt'); fd.append('file', new W.File(['bonjour'], 'a.txt', { type: 'text/plain' }));
    const r = await W.fetch('/fs/write', { method: 'POST', headers: { 'Content-Type': 'multipart/form-data', 'X-CSRF-TOKEN': 'x' }, body: fd });
    assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true });
    assert.equal(envois.length, 1); assert.equal(envois[0].url, 'https://labo.j0bot.ch/fs/write');
    assert.equal(envois[0].corps.dataType, 'formData'); assert.equal(envois[0].corps.data[1].value, 'Ym9uam91cg==');
    assert.ok(!Object.keys(envois[0].headers).some(k => /content-type|csrf/i.test(k)), 'ni Content-Type ni CSRF de la page');
  } finally { p.fin(); }
});

test('📤 XMLHttpRequest vers une route du serveur → le fetch du shim, avec la progression d\'envoi ; une adresse externe garde le vrai XHR', async () => {
  const envois = [];
  const relais = { routes: [], general: () => true, vers: (c) => 'https://labo.j0bot.ch' + c, envoyer: async (q) => { envois.push(q); return { status: 201, texte: '{"chemin":"/b.bin"}', entetes: { 'content-type': 'application/json' } }; } };
  const p = await page({ relais, ploxions: [] });
  try {
    const W = p.w;
    const fd = new W.FormData(); fd.append('file', new W.Blob([new Uint8Array(10)]), 'b.bin');
    const ev = []; const x = new W.XMLHttpRequest();
    x.upload.onprogress = (e) => ev.push('up:' + e.loaded + '/' + e.total);
    x.onreadystatechange = () => ev.push('rs' + x.readyState);
    const fini = new Promise((ok) => { x.onload = () => ok(); x.onerror = () => ok('erreur'); });
    x.open('POST', '/fs/write'); x.responseType = 'json'; x.setRequestHeader('Accept', 'application/json'); x.send(fd);
    assert.equal(await fini, undefined);
    assert.equal(x.status, 201); assert.deepEqual(x.response, { chemin: '/b.bin' }); assert.equal(x.getResponseHeader('content-type'), 'application/json');
    assert.deepEqual(ev, ['rs1', 'up:10/10', 'rs2', 'rs4']);
    assert.equal(envois[0].corps.data[0].fileName, 'b.bin');
    // une adresse externe : le vrai XMLHttpRequest (ici le réseau refuse tout : une erreur, pas le relais)
    const y = new W.XMLHttpRequest(); const err = new Promise((ok) => { y.onerror = () => ok('erreur'); y.onload = () => ok('charge'); });
    y.open('GET', 'https://ailleurs.example/x'); y.send(); await Promise.race([err, attendre(400)]);
    assert.equal(envois.length, 1, 'l\'externe ne passe pas par le relais');
  } finally { p.fin(); }
});
