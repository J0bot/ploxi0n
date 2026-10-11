/* bion jOSGpg — servi seul pour ploxi0n (/px/bion-app/jOSGpg.js) */
void 0;

;
(function () {
    'use strict';
    var LIB = '/vendor/js/openpgp.min.js';
    var STORE = 'jos:gpg';
    var _libP = null;        // promesse de chargement de la lib (une seule fois)
    var _priv = null;        // clé privée DÉCHIFFRÉE en mémoire (jamais persistée)
    var _subs = [];          // abonnés 'change' (UI à rafraîchir)

    function load() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
    function save(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
    function emit() { _subs.forEach(function (cb) { try { cb(); } catch (e) {} }); }

    // Charge OpenPGP.js une seule fois (à la demande). Rejette proprement si offline.
    function ensureLib() {
        if (window.openpgp) return Promise.resolve(window.openpgp);
        if (_libP) return _libP;
        _libP = new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = LIB; s.async = true;
            s.onload = function () { window.openpgp ? resolve(window.openpgp) : reject(new Error('openpgp absent')); };
            s.onerror = function () { _libP = null; reject(new Error('chargement OpenPGP.js échoué')); };
            document.head.appendChild(s);
        });
        return _libP;
    }

    function isArmored(t) {
        return typeof t === 'string' && t.indexOf('-----BEGIN PGP MESSAGE-----') !== -1;
    }
    function isPubBlock(t) {
        return typeof t === 'string' && t.indexOf('-----BEGIN PGP PUBLIC KEY BLOCK-----') !== -1;
    }

    function meRaw() { return load().me || null; }
    function contactsRaw() { return load().contacts || []; }

    function state() {
        var me = meRaw();
        return {
            hasKey:   !!me,
            unlocked: !!_priv,
            me:       me ? { name: me.name, email: me.email, fpr: me.fpr } : null,
            contacts: contactsRaw().map(function (c) { return { name: c.name, fpr: c.fpr }; })
        };
    }

    // Génère MA paire ECC (curve25519), chiffre la privée par passphrase, stocke,
    // et auto-déverrouille pour la session.
    function generate(opts) {
        opts = opts || {};
        var name = (opts.name || 'moi').toString().slice(0, 80);
        var email = (opts.email || '').toString().trim().slice(0, 120);
        // OpenPGP refuse un email mal formé → on ne le met QUE s'il est valide,
        // sinon clé au nom seul (l'email est optionnel de toute façon).
        var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        var pass = (opts.passphrase || '').toString();
        if (pass.length < 1) return Promise.reject(new Error('passphrase requise'));
        return ensureLib().then(function (pgp) {
            return pgp.generateKey({
                type: 'ecc', curve: 'curve25519',
                userIDs: [validEmail ? { name: name, email: email } : { name: name }],
                passphrase: pass
            });
        }).then(function (kp) {
            return ensureLib().then(function (pgp) { return pgp.readKey({ armoredKey: kp.publicKey }); })
                .then(function (pub) {
                    var o = load();
                    o.me = { name: name, email: email, fpr: pub.getFingerprint(), pub: kp.publicKey, privEnc: kp.privateKey };
                    save(o);
                    return unlock(pass);   // déverrouille tout de suite
                });
        });
    }

    // Déverrouille la privée stockée → la garde déchiffrée en mémoire (session).
    function unlock(passphrase) {
        var me = meRaw();
        if (!me) return Promise.reject(new Error('aucune clé'));
        return ensureLib().then(function (pgp) {
            return pgp.readPrivateKey({ armoredKey: me.privEnc }).then(function (pk) {
                return pgp.decryptKey({ privateKey: pk, passphrase: (passphrase || '').toString() });
            });
        }).then(function (dec) { _priv = dec; emit(); return true; })
          .catch(function (e) { _priv = null; throw new Error('passphrase incorrecte'); });
    }
    function lock() { _priv = null; emit(); }
    function forget() { try { localStorage.removeItem(STORE); } catch (e) {} _priv = null; emit(); }

    // Importe une clé PUBLIQUE de contact (bloc armor). Dédup par empreinte.
    function importContact(armored) {
        if (!isPubBlock(armored)) return Promise.reject(new Error('pas une clé publique PGP'));
        return ensureLib().then(function (pgp) { return pgp.readKey({ armoredKey: armored }); })
            .then(function (k) {
                var fpr = k.getFingerprint();
                var uid = (k.getUserIDs && k.getUserIDs()[0]) || fpr.slice(0, 8);
                var name = uid.replace(/\s*<.*>$/, '').trim() || uid;
                var o = load(); o.contacts = o.contacts || [];
                if (meRaw() && meRaw().fpr === fpr) throw new Error('c\'est ta propre clé');
                var existing = false;
                o.contacts = o.contacts.map(function (c) { if (c.fpr === fpr) { existing = true; return { name: name, fpr: fpr, pub: armored }; } return c; });
                if (!existing) o.contacts.push({ name: name, fpr: fpr, pub: armored });
                save(o); emit();
                return { name: name, fpr: fpr, added: !existing };
            });
    }
    function removeContact(fpr) {
        var o = load(); o.contacts = (o.contacts || []).filter(function (c) { return c.fpr !== fpr; });
        save(o); emit();
    }

    // Destinataires possibles = contacts + moi (toujours chiffrer pour soi → lire son propre envoi).
    function recipients() {
        var r = contactsRaw().map(function (c) { return { name: c.name, fpr: c.fpr, self: false }; });
        var me = meRaw(); if (me) r.unshift({ name: me.name + ' (moi)', fpr: me.fpr, self: true });
        return r;
    }

    // Chiffre `text` pour les empreintes `fprs` (+ moi), signé par ma privée si déverrouillée.
    function encryptTo(text, fprs) {
        var me = meRaw();
        var wanted = {}; (fprs || []).forEach(function (f) { wanted[f] = 1; });
        if (me) wanted[me.fpr] = 1;                 // toujours pour soi
        var pubs = [];
        if (me && wanted[me.fpr]) pubs.push(me.pub);
        contactsRaw().forEach(function (c) { if (wanted[c.fpr]) pubs.push(c.pub); });
        if (!pubs.length) return Promise.reject(new Error('aucun destinataire'));
        return ensureLib().then(function (pgp) {
            return Promise.all(pubs.map(function (a) { return pgp.readKey({ armoredKey: a }); }))
                .then(function (keys) {
                    var opt = { message: null, encryptionKeys: keys };
                    return pgp.createMessage({ text: text }).then(function (msg) {
                        opt.message = msg;
                        if (_priv) opt.signingKeys = _priv;   // signe si on peut
                        return pgp.encrypt(opt);
                    });
                });
        });
    }

    // Tente de déchiffrer un bloc armor avec MA privée. Renvoie un verdict, ne jette pas.
    function tryDecrypt(armored) {
        if (!isArmored(armored)) return Promise.resolve({ ok: false, reason: 'pas-pgp' });
        if (!_priv) return Promise.resolve({ ok: false, reason: meRaw() ? 'verrouille' : 'pas-de-cle' });
        return ensureLib().then(function (pgp) {
            return pgp.readMessage({ armoredMessage: armored }).then(function (msg) {
                var verif = contactsRaw().map(function (c) { return c.pub; });
                if (meRaw()) verif.push(meRaw().pub);
                return Promise.all(verif.map(function (a) { return pgp.readKey({ armoredKey: a }); }))
                    .then(function (vkeys) {
                        return pgp.decrypt({ message: msg, decryptionKeys: _priv, verificationKeys: vkeys });
                    });
            });
        }).then(function (res) {
            // signataire éventuel
            var by = null;
            try {
                if (res.signatures && res.signatures.length) {
                    var kid = res.signatures[0].keyID && res.signatures[0].keyID.toHex && res.signatures[0].keyID.toHex();
                    (contactsRaw().concat(meRaw() ? [meRaw()] : [])).forEach(function (c) {
                        if (kid && c.fpr && c.fpr.toLowerCase().indexOf(kid.toLowerCase()) !== -1) by = c.name;
                    });
                }
            } catch (e) {}
            return { ok: true, text: res.data, by: by };
        }).catch(function () { return { ok: false, reason: 'pas-pour-toi' }; });
    }

    // Empreintes voulues -> clés publiques armor (toujours + soi pour relire).
    function pubsFor(fprs) {
        var me = meRaw(), wanted = {}; (fprs || []).forEach(function (f) { wanted[f] = 1; });
        if (me) wanted[me.fpr] = 1;
        var pubs = [];
        if (me && wanted[me.fpr]) pubs.push(me.pub);
        contactsRaw().forEach(function (c) { if (wanted[c.fpr]) pubs.push(c.pub); });
        return pubs;
    }

    // Chiffre des OCTETS (image/fichier) pour `fprs` (+ moi) → Uint8Array (cipher
    // binaire GPG). Le serveur ne stockera QUE ça. Signé si la privée est ouverte.
    function encryptBytes(bytes, fprs) {
        var pubs = pubsFor(fprs);
        if (!pubs.length) return Promise.reject(new Error('aucun destinataire'));
        var data = (bytes instanceof Uint8Array) ? bytes : new Uint8Array(bytes);
        return ensureLib().then(function (pgp) {
            return Promise.all(pubs.map(function (a) { return pgp.readKey({ armoredKey: a }); }))
                .then(function (keys) {
                    return pgp.createMessage({ binary: data }).then(function (msg) {
                        var opt = { message: msg, encryptionKeys: keys, format: 'binary' };
                        if (_priv) opt.signingKeys = _priv;
                        return pgp.encrypt(opt);   // -> Uint8Array
                    });
                });
        });
    }

    // Déchiffre un cipher BINAIRE avec ma privée. Verdict, ne jette pas.
    function decryptBytes(cipher) {
        if (!_priv) return Promise.resolve({ ok: false, reason: meRaw() ? 'verrouille' : 'pas-de-cle' });
        var data = (cipher instanceof Uint8Array) ? cipher : new Uint8Array(cipher);
        return ensureLib().then(function (pgp) {
            return pgp.readMessage({ binaryMessage: data }).then(function (msg) {
                return pgp.decrypt({ message: msg, decryptionKeys: _priv, format: 'binary' });
            });
        }).then(function (res) { return { ok: true, bytes: res.data }; })
          .catch(function () { return { ok: false, reason: 'pas-pour-toi' }; });
    }

    function myPub() { var me = meRaw(); return me ? me.pub : ''; }
    function on(cb) { if (typeof cb === 'function') _subs.push(cb); }

    window.jOSGpg = {
        ensureLib: ensureLib, state: state, generate: generate, unlock: unlock, lock: lock, forget: forget,
        importContact: importContact, removeContact: removeContact, recipients: recipients,
        encryptTo: encryptTo, tryDecrypt: tryDecrypt, encryptBytes: encryptBytes, decryptBytes: decryptBytes,
        isArmored: isArmored, isPubBlock: isPubBlock, myPub: myPub, on: on
    };
})();
;
