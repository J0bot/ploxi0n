// 📤 (0.85) l'envoi de fichiers par le mode connecté, sur le chemin iPhone : un ploxion envoie un FormData (fetch) puis un fichier avec la
// progression (XMLHttpRequest, comme le FS du labo) à /fs/write → le shim → le HTTP natif en multipart (dataType formData), plus de 503
export default async function ({ page, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(800);
  const parFetch = await page.evaluate(async () => {
    const fd = new FormData(); fd.append('path', '/Photos/chat.jpg'); fd.append('file', new File([new Uint8Array([255, 216, 255, 224, 0, 16])], 'chat.jpg', { type: 'image/jpeg' }));
    const r = await fetch('/fs/write', { method: 'POST', headers: { 'X-CSRF-TOKEN': 'x', 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }, body: fd });
    return { status: r.status, corps: await r.json() };
  });
  const parXhr = await page.evaluate(() => new Promise((ok) => {
    const fd = new FormData(); fd.append('path', '/notes/a.txt'); fd.append('file', new Blob(['bonjour le boxion']), 'a.txt');
    const x = new XMLHttpRequest(), progres = [];
    x.upload.onprogress = (e) => progres.push(e.loaded + '/' + e.total);
    x.onload = () => ok({ status: x.status, corps: JSON.parse(x.responseText), progres });
    x.onerror = () => ok({ erreur: true, progres });
    x.open('POST', '/fs/write'); x.setRequestHeader('Accept', 'application/json'); x.send(fd);
  }));
  const natif = appels.filter(a => a.p === 'CapacitorHttp' && /\/fs\/write/.test(a.o.url || '')).map(a => a.o.method + ' ' + a.o.dataType + ' ' + (a.o.data || []).map(d => d.key + ':' + d.type + (d.fileName ? '(' + d.fileName + ',' + d.contentType + ')' : '')).join(' '));
  return { parFetch, parXhr, natif };
}
