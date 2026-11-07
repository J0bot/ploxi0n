// (0.99.39) le HUD du labo (jOSHud : #xhud-layer et son bouton de secours) ne se pose jamais sur l'app
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

test('le calque du HUD du labo et son bouton de secours sont masqués, les ploxions gardent le reste', () => {
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  const dom = new JSDOM('<!doctype html><html><head><style>' + css + '</style></head><body><div id="xhud-layer" style="position:fixed;inset:0"><div class="xhe" id="xhe-secours" data-app="ui-secours"></div></div><button id="monui-rescue"></button><div class="px-hote"><div id="xhud-layer-pas-moi"></div></div></body></html>');
  const W = dom.window, vu = (sel) => W.getComputedStyle(W.document.querySelector(sel)).display !== 'none';
  assert.equal(vu('#xhud-layer'), false); assert.equal(vu('#monui-rescue'), false);
  assert.equal(vu('#xhud-layer-pas-moi'), true);
});
