// 🔔 (0.99.45) les notifications riches : l'extension (communication + pièce jointe), sa cible fastlane derrière l'option, le labo qui pose mutable-content
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const lire = (c) => readFileSync(new URL('../' + c, import.meta.url), 'utf8');

test('🔔 l\'extension : une personne → INSendMessageIntent + INPerson ; une image → pièce jointe ; https seulement ; l\'origine si trop lent', () => {
  const s = lire('ios/App/PloxionNotifs/NotificationService.swift');
  assert.match(s, /class NotificationService: UNNotificationServiceExtension/);
  assert.ok(s.includes('info["expediteur"]') && s.includes('INSendMessageIntent(') && s.includes('INPerson(') && s.includes('c.updating(from: intention)'));
  assert.ok(s.includes('info["image"]') && s.includes('UNNotificationAttachment(identifier: "glyphe"'));
  assert.ok(s.includes('u.scheme == "https"') && s.includes('<= 2_000_000') && s.includes('override func serviceExtensionTimeWillExpire()'));
  const p = lire('ios/App/PloxionNotifs/Info.plist');
  assert.ok(p.includes('<string>com.apple.usernotifications.service</string>') && p.includes('$(PRODUCT_MODULE_NAME).NotificationService'));
});

test('🔔 fastlane : la cible et l\'identifiant derrière PLOXI0N_NOTIFS, signés avec l\'app ; le workflow a l\'option', () => {
  const f = lire('fastlane/Fastfile');
  assert.ok(f.includes('NOTIFS = ENV["PLOXI0N_NOTIFS"] == "1"') && f.includes('def ajouter_notifs') && f.includes('def identifiant_notifs'));
  assert.ok(f.includes('(NOTIFS ? [NOT_ID] : [])') && f.includes('targets: ["PloxionNotifs"]'));
  const w = lire('.github/workflows/ios.yml'); assert.ok(w.includes('PLOXI0N_NOTIFS:') && w.includes('notifs: { description:'));
  const app = lire('ios/App/App/App.entitlements'); assert.ok(app.includes('com.apple.developer.usernotifications.communication'));
});

test('🔔 le labo : mutable-content dès qu\'il y a une image ou un expéditeur', () => {
  const php = lire('docs/labo-push/app/Services/Apns.php');
  assert.match(php, /if \(! empty\(\$data\['image'\]\) \|\| ! empty\(\$data\['expediteur'\]\)\) \{ \$aps\['mutable-content'\] = 1; \}/);
});
