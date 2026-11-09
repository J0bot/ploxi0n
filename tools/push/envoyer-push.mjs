#!/usr/bin/env node
// 🔔 UN ENVOI DE TEST, SANS LE LABO (0.99.28, RS-7 01.11 : « les notifications sur iPhone, ce soir, le plus vite possible »).
// Un seul fichier, aucune dépendance (Node 18+, Windows, Mac ou Linux) : la clé .p8 d'APNs signe un JWT ES256, puis une requête HTTP/2 part
// à Apple. La clé ne quitte jamais ton ordinateur ; ne la mets jamais dans git, une adresse ou l'app.
//
//   node tools/push/envoyer-push.mjs --cle AuthKey_ABC123DEFG.p8 --kid ABC123DEFG --team XYZ987TEAM --jeton <le jeton copié dans l'app>
//        [--titre "ploxi0n"] [--texte "ça marche"] [--ouvrir coord] [--sujet coord] [--bac-a-sable] [--essai]
//
// Le jeton : ⚙ › Notifications › « Même app fermée (push) » allumé, puis « copier » sous « Le jeton de cet iPhone ».
// --cle peut aussi être le contenu de la variable APNS_KEY_P8 (alors --cle n'est pas nécessaire) ; --kid et --team : APNS_KEY_ID, APNS_TEAM_ID.
// --bac-a-sable : un build lancé depuis Xcode (TestFlight et l'App Store parlent à la production, le défaut).
// --essai : montre ce qui partirait (le JWT, les en-têtes, le corps), sans rien envoyer.
import { readFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';
import http2 from 'node:http2';
import { pathToFileURL } from 'node:url';

const b64url = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

/** le JWT d'APNs : ES256, { alg, kid } · { iss: team, iat } ; la signature en R||S (64 octets), comme Apple l'attend */
export function jwtApns({ cle, kid, team, maintenant = Date.now() }) {
  const h = b64url(JSON.stringify({ alg: 'ES256', kid })), p = b64url(JSON.stringify({ iss: team, iat: Math.floor(maintenant / 1000) }));
  const s = sign('sha256', Buffer.from(h + '.' + p), { key: createPrivateKey(cle), dsaEncoding: 'ieee-p1363' });
  return h + '.' + p + '.' + b64url(s);
}
/** le corps : une alerte, et ce que l'app lit en la touchant (ouvrir : le ploxion, params) */
export function corpsApns({ titre = 'ploxi0n', texte = 'les notifications marchent ✓', sujet = 'coord', ouvrir = null, params = null } = {}) {
  const c = { aps: { alert: { title: String(titre).slice(0, 120), body: String(texte).slice(0, 1000) }, sound: 'default', 'thread-id': sujet } };
  if (ouvrir) c.ouvrir = ouvrir; if (params) c.params = params;
  return c;
}
/** ce que veut dire la réponse d'Apple, en clair */
export function expliquer(status, raison) {
  const r = {
    BadDeviceToken: 'le jeton ne va pas avec ce serveur : un build TestFlight = production (sans --bac-a-sable), un build Xcode = --bac-a-sable ; ou le jeton est mal copié',
    InvalidProviderToken: 'la clé, le --kid ou le --team ne vont pas ensemble (le Key ID est dans le nom AuthKey_<KEYID>.p8 ; le Team ID en haut à droite du portail)',
    TopicDisallowed: 'la clé n\'a pas le droit d\'envoyer pour ch.j0bot.ploxi0n (une clé d\'une autre équipe ?)',
    BadTopic: 'le topic n\'est pas l\'identifiant de l\'app (ch.j0bot.ploxi0n)',
    Unregistered: 'ce jeton n\'est plus valable (l\'app a été supprimée, ou les notifications coupées) : réactive-les dans l\'app et recopie le jeton',
    ExpiredProviderToken: 'le JWT a plus d\'une heure : relance simplement',
    TooManyProviderTokenUpdates: 'trop de JWT neufs : attends quelques minutes',
    MissingTopic: 'il manque apns-topic',
  }[raison];
  return status === 200 ? '✓ Apple l\'a accepté : elle arrive sur l\'iPhone (verrouille-le pour la voir en grand)' : '✕ ' + status + ' ' + (raison || '') + (r ? ' : ' + r : '');
}

function args(argv) {
  const o = {}; for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (!a.startsWith('--')) continue; const k = a.slice(2); const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; } }
  return o;
}
async function principal() {
  const o = args(process.argv.slice(2));
  const cle = o.cle && o.cle !== true ? readFileSync(o.cle, 'utf8') : process.env.APNS_KEY_P8 || (process.env.APNS_KEY_P8_B64 ? Buffer.from(process.env.APNS_KEY_P8_B64, 'base64').toString('utf8') : null);
  const kid = o.kid || process.env.APNS_KEY_ID, team = o.team || process.env.APNS_TEAM_ID, jeton = String(o.jeton || '').trim().toLowerCase();
  const manque = [!cle && '--cle (le fichier .p8)', !kid && '--kid', !team && '--team', !/^[0-9a-f]{64,200}$/.test(jeton) && '--jeton (hexadécimal, copié dans l\'app)'].filter(Boolean);
  if (manque.length) { console.error('il manque : ' + manque.join(', ') + '\n\nnode tools/push/envoyer-push.mjs --cle AuthKey_XXXX.p8 --kid XXXX --team YYYY --jeton <hex>'); process.exit(2); }
  const topic = o.topic || process.env.APNS_TOPIC || 'ch.j0bot.ploxi0n', hote = o['bac-a-sable'] ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com';
  const corps = JSON.stringify(corpsApns({ titre: o.titre === true ? undefined : o.titre, texte: o.texte === true ? undefined : o.texte, sujet: o.sujet || 'coord', ouvrir: o.ouvrir && o.ouvrir !== true ? o.ouvrir : null }));
  const entetes = { ':method': 'POST', ':path': '/3/device/' + jeton, authorization: 'bearer ' + jwtApns({ cle, kid, team }), 'apns-topic': topic, 'apns-push-type': 'alert', 'apns-priority': '10', 'content-type': 'application/json' };
  if (o.essai) { console.log(hote, JSON.stringify({ ...entetes, authorization: 'bearer ' + entetes.authorization.slice(7, 40) + '…' }, null, 1), corps); return; }
  const client = http2.connect(hote);
  client.on('error', (e) => { console.error('✕ pas de connexion à ' + hote + ' : ' + e.message); process.exit(1); });
  const req = client.request(entetes); let status = 0, texte = '';
  req.on('response', (h) => { status = h[':status']; }); req.setEncoding('utf8'); req.on('data', (d) => { texte += d; });
  req.on('end', () => { let raison = ''; try { raison = JSON.parse(texte || '{}').reason || ''; } catch (e) { /* */ } console.log(expliquer(status, raison)); client.close(); process.exit(status === 200 ? 0 : 1); });
  req.end(corps);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();   // lancé directement (Windows compris), pas importé par un test
