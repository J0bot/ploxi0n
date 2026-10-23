# Les bibliothèques que les ploxions du labo chargent depuis /vendor/

Copiées telles quelles de labo.j0bot.ch/vendor/ (0.99.19), parce que dans l'app `/vendor/…` pointe vers l'app elle-même : sans elles,
24 ploxions du labo s'ouvraient à moitié (« 3D indisponible », la conversion audio, les PDF, Word, les tableurs, les QR…).
Chacune garde son en-tête de licence.

| fichier | bibliothèque | licence |
|---|---|---|
| js/three.module.js, three.min.js | three.js | MIT |
| js/xlsx.full.min.js | SheetJS Community Edition | Apache-2.0 |
| js/qrcode-generator.js | qrcode-generator (Kazuhiko Arase) | MIT |
| js/qrcode.min.js | qrcode.js (davidshimjs) | MIT |
| js/webtorrent.min.js | WebTorrent | MIT |
| js/jsxgraph.min.js, css/jsxgraph.css | JSXGraph | LGPL-3.0 ou MIT |
| js/fflate.min.js | fflate | MIT |
| js/cropper.min.js, css/cropper.min.css | Cropper.js | MIT |
| js/lamejs.min.js | lamejs | LGPL-3.0 |
| js/pdf-lib.min.js | pdf-lib | MIT |
| js/mammoth.browser.min.js | mammoth.js | BSD-2-Clause |
| js/openpgp.min.js | OpenPGP.js (déjà là) | LGPL-3.0 |
