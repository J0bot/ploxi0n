// ◎ (0.99.25) le diagnostic de l'écran : la vue de l'iPhone (défilée, zoomée ?), les translations restées posées, ce qui peint du rouge
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { diagnostic } from '../src/app/diagnostic.js';

test('◎ le diagnostic relève la vue, une translation collée et un rond rouge', () => {
  const dom = new JSDOM('<!doctype html><body><main class="px-mode-accueil" style="transform:translateX(-140px)"><div class="rond" style="width:200px;height:200px;background-color:rgba(200,10,10,.6)"></div><div class="vert" style="width:200px;height:200px;background-color:rgb(20,200,20)"></div></main></body>', { pretendToBeVisual: true });
  const W = dom.window;
  for (const e of W.document.querySelectorAll('div')) e.getBoundingClientRect = () => ({ left: 10, top: 10, right: 210, bottom: 210, width: 200, height: 200 });
  const t = diagnostic(W);
  assert.match(t, /la vue : défilée 0,0/);
  assert.match(t, /LES TRANSFORMATIONS POSÉES \(1\)\nmain\.px-mode-accueil · posé sur l'app · translateX\(-140px\)/);
  assert.match(t, /CE QUI PEINT DU ROUGE \(1\)\ndiv\.rond/);
  W.close();
});
