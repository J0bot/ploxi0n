// ✉ (0.76) inviter · partager : les liens de l'app qui sortent deviennent publics (le zbeul des invitations), les liens reçus s'ouvrent ici avec
// leurs paramètres, l'invitation du social, la feuille (QR natif, copier)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versPublic, publierTexte, envelopperQR, reparerAffichage, lienRecu, lienPloxion } from '../src/app/liens-publics.js';
import { creerInvitation, creerPartage } from '../src/app/partage.js';
import { page, attendre } from './aide.mjs';

test('↗ un lien fait dans l\'app → le lien public (lien universel /px/<id>)', () => {
  assert.equal(versPublic('capacitor://localhost/local?px=invite&code=AB12'), 'https://labo.j0bot.ch/px/invite?code=AB12');
  assert.equal(versPublic('capacitor://localhost/local?px=social&join=7&code=Z'), 'https://labo.j0bot.ch/px/social?join=7&code=Z');
  assert.equal(versPublic('capacitor://localhost/?px=curseur&cur=r1'), 'https://labo.j0bot.ch/px/curseur?cur=r1');
  assert.equal(versPublic('capacitor://localhost/join?inv=XY9&niv=3'), 'https://labo.j0bot.ch/join?inv=XY9&niv=3');
  assert.equal(versPublic('http://localhost:4176/local?px=amis'), 'https://labo.j0bot.ch/px/amis');
  assert.equal(versPublic('https://exemple.ch/a?px=b'), 'https://exemple.ch/a?px=b', 'un autre site : tel quel');
  assert.equal(publierTexte('Rejoins-moi : capacitor://localhost/local?px=invite&code=Q1 !'), 'Rejoins-moi : https://labo.j0bot.ch/px/invite?code=Q1 !');
  assert.equal(lienPloxion({ id: 'terrax', interne: true }), 'https://labo.j0bot.ch/app/ouvrir/terrax?app=1');
  assert.equal(lienPloxion({ id: 'social' }), 'https://labo.j0bot.ch/px/social');
});

test('📥 un lien reçu → le ploxion et ses paramètres', () => {
  assert.deepEqual(lienRecu('https://labo.j0bot.ch/px/invite?code=AB12'), { id: 'invite', lien: '?code=AB12' });
  assert.deepEqual(lienRecu('https://labo.j0bot.ch/app/ouvrir/terrax?app=1'), { id: 'terrax', lien: '' });
  assert.deepEqual(lienRecu('https://labo.j0bot.ch/local?px=social&join=5'), { id: 'social', lien: '?join=5' });
  assert.deepEqual(lienRecu('https://labo.j0bot.ch/join?inv=XY9&niv=3'), { id: 'invitation', lien: '?code=XY9&niv=3' });
  assert.deepEqual(lienRecu('ploxi0n://px/curseur?cur=r1'), { id: 'curseur', lien: '?cur=r1' });
  assert.equal(lienRecu('https://exemple.ch/px/x'), null, 'un autre site : rien');
  assert.equal(lienRecu('pas un lien'), null);
});

test('🔳 jOSQR (le bion du labo) et les champs : toujours le lien public', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, recus = [];
    envelopperQR(W);
    W.jOSQR = function (t, el, px) { recus.push([t, px]); };   // le bion arrive plus tard, comme dans l'app
    W.jOSQR('capacitor://localhost/local?px=invite&code=K', null, 190);
    assert.deepEqual(recus, [['https://labo.j0bot.ch/px/invite?code=K', 190]]);
    const h = D.createElement('div'); D.body.appendChild(h);
    const stop = reparerAffichage(h);
    h.innerHTML = '<div><input readonly value="capacitor://localhost/local?px=amis&add=u1"><input value="capacitor://localhost/x"></div>'; await attendre(10);
    const [a, b] = h.querySelectorAll('input');
    assert.equal(a.value, 'https://labo.j0bot.ch/px/amis?add=u1'); assert.equal(b.value, 'capacitor://localhost/x', 'un champ qu\'on tape : jamais touché');
    stop();
  } finally { p.fin(); }
});

test('🧭 un lien universel ouvre le ploxion avec ses paramètres dans location.search, le temps du montage', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, vus = [];
    W.jOSApps = W.jOSApps || {};
    W.jOSApps.invite = { manifest: { id: 'invite' }, mount: (h) => { vus.push(new URLSearchParams(W.location.search).get('code')); return {}; } };
    const racine = D.createElement('div'); D.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'invite', nom: 'invite', interne: true }] });
    await r.ouvrir('invite', { lien: '?code=AB12' });
    assert.deepEqual(vus, ['AB12']);
  } finally { p.fin(); }
});

test('✉ l\'invitation du social : sans compte, avec, expirée', async () => {
  const store = new Map(), W = { localStorage: { getItem: (k) => store.get(k) || null } }, appels = [];
  const requete = async (o) => { appels.push(o); return o.entetes.Authorization === 'Bearer bon' ? { status: 201, json: { code: 'C0DE42' } } : { status: 401, json: {} }; };
  await assert.rejects(creerInvitation({ W, requete }), (e) => e.connexion === true);
  store.set('jos_social_token', 'bon');
  const i = await creerInvitation({ W, requete, label: 'Léa' });
  assert.deepEqual(i, { code: 'C0DE42', lien: 'https://labo.j0bot.ch/px/invite?code=C0DE42' });
  assert.equal(appels[0].url, 'https://api.j0bot.ch/api/v1/invites'); assert.deepEqual(appels[0].corps, { label: 'Léa' });
  store.set('jos_social_token', 'vieux');
  await assert.rejects(creerInvitation({ W, requete }), (e) => e.connexion === true && /expiré/.test(e.message));
});

test('↗ la feuille : le QR natif, copier, et un ploxion partagé depuis le ploxion « inviter »', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, copies = [];
    const routeur = { catalogue: () => [{ id: 'terrax', nom: 'terrax', interne: true }, { id: 'social', nom: 'le social' }], connait: () => true, ouvrir: async () => true };
    const pt = creerPartage({ W, routeur: () => routeur, qr: async ({ texte }) => ({ base64: 'QUJD', cote: 300, texte }), requete: async () => ({ status: 401 }), natif: () => ({ copier: async (t) => copies.push(t) }) });
    const f = await pt.partagerPloxion('social');
    assert.equal(f.querySelector('.px-pt-lien').value, 'https://labo.j0bot.ch/px/social');
    assert.ok(f.querySelector('[data-pt-qr] img').src.endsWith('base64,QUJD'), 'le QR natif');
    f.querySelector('[data-pt="copier"]').click(); await attendre(10);
    assert.deepEqual(copies, ['https://labo.j0bot.ch/px/social']);
    f.querySelector('[data-pt="fermer"]').click(); assert.ok(!f.isConnected);
    const h = D.createElement('div'); D.body.appendChild(h);
    W.jOSApps.inviter.mount(h);
    h.querySelector('[data-iv="ploxions"]').click();
    h.querySelector('[data-iv-px="terrax"]').click(); await attendre(10);
    assert.equal(D.querySelector('.px-partage .px-pt-lien').value, 'https://labo.j0bot.ch/app/ouvrir/terrax?app=1');
  } finally { p.fin(); }
});
