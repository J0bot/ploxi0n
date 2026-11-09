// ▤ ≈ (0.88) le lot de ploxions : le système (btop) et les ambiances (Blanket)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerSysteme, courbe, jauge, octets, duree } from '../src/lot/systeme.js';
import { creerAmbiances, SONS, fabriquer, bruits } from '../src/lot/ambiances.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { page, attendre } from './aide.mjs';

test('▤ les petites mesures : courbe en blocs, jauge, octets, durée', () => {
  assert.equal(courbe([0, 30, 60], 60), '▁▅█');
  assert.equal(jauge(0.5, 8), '████░░░░');
  assert.equal(octets(5 * 1048576), '5 Mo'); assert.equal(octets(-1), '—'); assert.equal(octets(3.2 * 1073741824), '3,2 Go');
  assert.equal(duree(7500), '2 h 5 min'); assert.equal(duree(0), '—');
});

test('▤ le système : les panneaux (thermique, mémoire, disque, batterie, ploxions), le xerminal ; démonté, plus rien ne tourne', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w; let ouvert = null;
    const s = creerSysteme({ W, periode: 30,
      systeme: async () => ({ thermique: 'chaud', economie: true, memoire: 6 * 1073741824, coeurs: 6, depuis: 90000, disqueLibre: 10 * 1073741824, disqueTotal: 128 * 1073741824 }),
      appareil: async () => ({ model: 'iPhone16,2', operatingSystem: 'ios', osVersion: '26.2', memUsed: 180 * 1048576 }),
      batterie: async () => ({ niveau: 0.15, enCharge: false }), reseau: async () => ({ connecte: true, type: 'wifi' }),
      sonder: async () => {}, ploxions: () => ({ vivants: ['systeme', 'wiki'], endormis: ['xp'] }), ouvrir: (id) => { ouvert = id; } });
    assert.equal(s.ploxion.id, 'systeme'); assert.ok(W.jOSApps.systeme);
    const avant = p.photo ? p.photo() : null;
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = s.mount(h); await attendre(120);
    const t = h.textContent;
    for (const m of ['chaud', 'iPhone16,2', '180 Mo / 6 Go', '15 %', '10 Go libres / 128 Go', 'wifi', '2 vivants · 1 endormi', '1 j 1 h']) assert.ok(t.includes(m), 'manque : ' + m);
    assert.ok(h.querySelector('.px-btop-ko'), 'batterie faible : en rouge');
    h.querySelector('[data-btop-xerminal]').click(); assert.equal(ouvert, 'xerminal');
    inst.unmount(); await attendre(80);
    assert.equal(h.innerHTML, '');
    if (avant) { const apres = p.photo(); assert.ok(apres.interval <= avant.interval && apres.raf <= avant.raf, 'ni intervalle ni rAF après le démontage'); }
  } finally { p.fin(); }
});

/** un faux AudioContext : assez pour suivre le graphe */
function fauxAudio() {
  const crees = [];
  const param = () => ({ value: 0, setTargetAtTime(v) { this.value = v; } });
  const noeud = (type) => { const n = { type, connexions: [], connect(x) { this.connexions.push(x); return x; }, disconnect() { this.connexions = []; }, gain: param(), frequency: param(), Q: param(), start() { this.joue = true; }, stop() { this.joue = false; } }; crees.push(n); return n; };
  class Ctx {
    constructor() { this.sampleRate = 8000; this.currentTime = 0; this.state = 'running'; this.destination = noeud('destination'); Ctx.dernier = this; this.ferme = false; }
    createBuffer(c, n) { const d = new Float32Array(n); return { getChannelData: () => d }; }
    createBufferSource() { return noeud('source'); } createBiquadFilter() { return noeud('filtre'); } createGain() { const g = noeud('gain'); g.gain.value = 1; return g; } createOscillator() { return noeud('osc'); }
    close() { this.ferme = true; return Promise.resolve(); } resume() { return Promise.resolve(); }
  }
  return { Ctx, crees };
}

test('≈ les sons se fabriquent (huit recettes, chacune une sortie et un arrêt)', () => {
  const { Ctx, crees } = fauxAudio(); const ctx = new Ctx(); const b = bruits(ctx, 0.1);
  for (const [k] of SONS) { const s = fabriquer(ctx, k, b); assert.ok(s.sortie, k); s.arreter(); }
  assert.ok(crees.filter(n => n.type === 'source').every(n => n.joue === false), 'tout arrêté');
});

test('≈ les ambiances : un curseur lance son son, le mélange est gardé, « tout couper » ferme le contexte ; démonté, rien ne joue', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, { Ctx, crees } = fauxAudio(), boxion = creerMemoire();
    const a = creerAmbiances({ W, boxion, Contexte: Ctx });
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = a.mount(h); await attendre(20);
    assert.equal(h.querySelectorAll('[data-amb]').length, SONS.length);
    const pluie = h.querySelector('[data-amb="pluie"]'); pluie.value = '0.6'; pluie.dispatchEvent(new W.Event('input', { bubbles: true }));
    assert.ok(Ctx.dernier, 'le contexte audio naît au premier son'); assert.ok(inst.joue());
    assert.ok(crees.some(n => n.type === 'source' && n.joue));
    await attendre(500);
    assert.deepEqual((await boxion.get('reglages', 'ambiances')).volumes, { pluie: 0.6 });
    h.querySelector('[data-amb-tout]').click();
    assert.equal(Ctx.dernier.ferme, true); assert.equal(inst.joue(), false); assert.equal(pluie.value, '0');
    // rouvert : le mélange gardé revient affiché (il joue au premier geste)
    await boxion.put('reglages', 'ambiances', { volumes: { vent: 0.3 }, maitre: 0.5 });
    const a2 = creerAmbiances({ W, boxion, Contexte: Ctx }); const h2 = W.document.createElement('div'); W.document.body.appendChild(h2);
    const i2 = a2.mount(h2); await attendre(20);
    assert.equal(h2.querySelector('[data-amb="vent"]').value, '0.3'); assert.equal(i2.joue(), false, 'pas de son sans geste');
    h2.dispatchEvent(new W.Event('pointerdown', { bubbles: true })); assert.equal(i2.joue(), true);
    i2.unmount(); assert.equal(Ctx.dernier.ferme, true);
  } finally { p.fin(); }
});
