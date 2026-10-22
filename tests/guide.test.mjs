// 🧭 (0.95) le guide : apprendre en faisant (une étape passe quand c'est fait), les astuces une fois chacune, « c'est quoi ça ? » explique
// au lieu d'agir
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerGuide, ETAPES, ASTUCES, VERSION_GUIDE } from '../src/app/guide.js';

function page(html) {
  const dom = new JSDOM('<!doctype html><body>' + html + '</body>', { pretendToBeVisual: true });
  const W = dom.window;
  W.HTMLElement.prototype.getBoundingClientRect = function () { return this.hidden ? { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 } : { left: 10, top: 100, width: 80, height: 60, right: 90, bottom: 160 }; };
  const db = new Map(), boxion = { get: async (n, k) => db.get(n + '/' + k), put: async (n, k, v) => { db.set(n + '/' + k, v); } };
  return { W, D: W.document, db, boxion };
}
const attendre = (ms) => new Promise(r => setTimeout(r, ms));

test('🧭 apprendre en faisant : la cible éclairée, l\'étape passe quand c\'est fait ; à la fin, le guide est vu', async () => {
  const { W, D, db, boxion } = page('<div class="px-accueil"><button data-id="jeu" aria-label="Jeu">Jeu</button></div><button class="px-retour" aria-label="retour">‹</button><div class="px-modes"><button>organique</button></div>');
  let courant = null; const routeur = { courant: () => courant };
  const g = creerGuide({ W, boxion, routeur: () => routeur });
  await g.pret; g.montrer();
  assert.match(D.querySelector('.px-guide-bulle p').textContent, /Touche un ploxion/);
  assert.ok(D.querySelector('.px-guide-trou'), 'la cible est éclairée');
  courant = 'jeu'; await attendre(300);   // ouvert pour de vrai
  assert.match(D.querySelector('.px-guide-bulle p').textContent, /te ramène/);
  courant = null; await attendre(300);
  assert.match(D.querySelector('.px-guide-bulle p').textContent, /Ton xer/);
  D.querySelector('[data-g="suivant"]').click();
  assert.match(D.querySelector('.px-guide-bulle').textContent, /C'est tout/);
  D.querySelector('[data-g="suivant"]').click(); await attendre(10);
  assert.equal(D.querySelector('.px-guide'), null);
  assert.equal(db.get('reglages/guide').vu, VERSION_GUIDE);
  assert.equal(ETAPES.length, 4, 'quatre étapes, pas neuf cartes');
  W.close();
});

test('🧭 les astuces : une fois chacune ; « c\'est quoi ça ? » explique sans agir', async () => {
  const { W, D, db, boxion } = page('<div data-pad="wormion" aria-label="le temps (trackpad)"></div><button id="x" aria-label="ses pages, dans le cube">▣</button>');
  const g = creerGuide({ W, boxion });
  await g.pret; g.installer(); await attendre(800);
  assert.match(D.querySelector('.px-guide-bulle p').textContent, /tourne ton doigt/i);
  D.querySelector('[data-g="ok"]').click();
  assert.deepEqual(db.get('reglages/guide').astuces, ['wormion']);
  D.body.appendChild(D.createElement('i')); await attendre(800);
  assert.equal(D.querySelector('.px-guide'), null, 'pas deux fois');
  let agi = false; D.getElementById('x').addEventListener('click', () => { agi = true; });
  g.cestQuoi();
  W.document.elementFromPoint = () => D.getElementById('x');
  D.getElementById('x').dispatchEvent(new W.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 120 }));
  assert.equal(agi, false, 'rien ne s\'ouvre');
  assert.match(D.querySelector('.px-guide-bulle p').textContent, /ses pages, dans le cube/);
  g.finQuoi(); assert.equal(D.querySelector('.px-guide'), null);
  assert.ok(ASTUCES.every(a => a.texte.length < 140), 'une phrase, pas un paragraphe');
  W.close();
});
