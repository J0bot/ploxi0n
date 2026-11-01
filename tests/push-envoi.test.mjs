// 🔔 (0.99.28) l'envoi de test d'APNs (tools/push/envoyer-push.mjs) : le JWT ES256 qu'Apple vérifie, le corps, les réponses en clair
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { jwtApns, corpsApns, expliquer } from '../tools/push/envoyer-push.mjs';

test('🔔 le JWT d\'APNs : ES256, kid, iss, iat, signature R||S vérifiable par la clé publique', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const t = jwtApns({ cle: privateKey.export({ type: 'pkcs8', format: 'pem' }), kid: 'ABC123DEFG', team: 'XYZ987TEAM', maintenant: 1793500000000 });
  const [h, p, s] = t.split('.'); const d = (x) => JSON.parse(Buffer.from(x, 'base64url').toString());
  assert.deepEqual(d(h), { alg: 'ES256', kid: 'ABC123DEFG' }); assert.deepEqual(d(p), { iss: 'XYZ987TEAM', iat: 1793500000 });
  const sig = Buffer.from(s, 'base64url'); assert.equal(sig.length, 64, 'R||S, pas du DER');
  assert.ok(verify('sha256', Buffer.from(h + '.' + p), { key: publicKey, dsaEncoding: 'ieee-p1363' }, sig));
});

test('🔔 le corps et les réponses d\'Apple', () => {
  assert.deepEqual(corpsApns({ titre: 't', texte: 'b', sujet: 'coord', ouvrir: 'coord' }), { aps: { alert: { title: 't', body: 'b' }, sound: 'default', 'thread-id': 'coord' }, ouvrir: 'coord' });
  assert.match(expliquer(200), /✓/); assert.match(expliquer(400, 'BadDeviceToken'), /production/); assert.match(expliquer(403, 'InvalidProviderToken'), /Key ID/);
});
