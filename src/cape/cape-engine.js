// cape-engine.js : miroir JS de crates/cape-core (Rust) — COPIÉ de J0bot/labo-cape (sim/cape-engine.js, AGPL-3.0-or-later, même auteur),
// en module ES pour l'app. La règle de labo-cape : toute copie doit reproduire la trace dorée du Rust → tests/cape.test.mjs la rejoue
// (tests/donnees/cape-golden.json). Ne pas modifier la physique ici : la changer dans cape-core, régénérer, recopier.

const f = Math.fround;
const T_SKIN_C = 33, T_CUTOFF_C = 45, T_REARM_C = 40, SETPOINT_MAX_C = 42;
const R0 = 10000, T0K = 298.15, BETA = 3950, RS = 10000, ADC_MAX = 4095;

function adcToC(raw) {
  if (raw <= 8 || raw >= ADC_MAX - 8) return null; // défaut capteur
  const ratio = f(raw / ADC_MAX);
  const r = f(RS * ratio / (1 - ratio));
  const inv = f(1 / T0K + Math.log(r / R0) / BETA);
  return f(1 / inv - 273.15);
}
function cToAdc(t) {
  const tk = t + 273.15;
  const r = R0 * Math.exp(BETA * (1 / tk - 1 / T0K));
  return Math.floor(f(r / (r + RS)) * ADC_MAX + 0.5);
}

class Pi {
  constructor() { this.kp = 0.25; this.ki = 0.002; this.integ = 0; this.tripped = false; }
  step(t, sp, dt) {
    if (t === null) { this.integ = 0; return [0, 'fault']; }
    if (t >= T_CUTOFF_C) this.tripped = true;
    if (this.tripped) {
      if (t < T_REARM_C) this.tripped = false;
      else { this.integ = 0; return [0, 'tripped']; }
    }
    const s = Math.min(sp, SETPOINT_MAX_C);
    const e = f(s - t);
    const raw = f(this.kp * e + this.ki * this.integ);
    const duty = Math.min(1, Math.max(0, raw));
    if (!((raw >= 1 && e > 0) || (raw <= 0 && e < 0))) this.integ = f(this.integ + e * dt);
    return [duty, duty > 0 ? 'heating' : 'idle'];
  }
}

class Node {
  constructor(kind, t0) {
    Object.assign(this, kind === 'exposed'
      ? { c: 15, gBody: 0.04, gAmb: 0.10 }
      : { c: 40, gBody: 0.10, gAmb: 0.08 });
    this.t = t0;
  }
  gA(wind) { return this.gAmb * (1 + 2 * Math.min(1, Math.max(0, wind))); }
  step(p, tAmb, wind, dt) {
    const dq = p + this.gBody * (T_SKIN_C - this.t) - this.gA(wind) * (this.t - tAmb);
    this.t = f(this.t + dq / this.c * dt);
  }
  passiveEq(tAmb, wind) {
    const g = this.gA(wind);
    return (this.gBody * T_SKIN_C + g * tAmb) / (this.gBody + g);
  }
}

const P_MCU_W = 0.35, P_LED_FULL_W = 0.3, SUPPLY_MARGIN = 0.9;
function heatBudget(supplyW, nLeds, bright) {
  return Math.max(0, supplyW * SUPPLY_MARGIN - (P_MCU_W + nLeds * P_LED_FULL_W * Math.min(1, Math.max(0, bright))));
}
function allocate(duty, power, budget) {
  let asked = 0;
  for (let i = 0; i < duty.length; i++) asked += duty[i] * power[i];
  if (asked <= budget || asked <= 0) return 1;
  const k = budget / asked;
  for (let i = 0; i < duty.length; i++) duty[i] *= k;
  return k;
}
function autonomyH(capWh, eff, usedWh, avgW) {
  return avgW <= 0.01 ? Infinity : Math.max(0, capWh * eff - usedWh) / avgW;
}

const T_COLD = 10, T_HOT = 45;
function hueFor(t) { const x = Math.min(1, Math.max(0, (t - T_COLD) / (T_HOT - T_COLD))); return 240 * (1 - x); }
function rgbFor(t, b) {
  const h = hueFor(t) / 60, v = Math.min(1, Math.max(0, b)), i = Math.floor(h), fr = h - i;
  const [r, g, bl] = i === 0 ? [1, fr, 0] : i === 1 ? [1 - fr, 1, 0] : i === 2 ? [0, 1, fr] : i === 3 ? [0, 1 - fr, 1] : [0, 0, 1];
  const q = c => Math.floor(c * v * 255 + 0.5);
  return [q(r), q(g), q(bl)];
}

const api = { T_SKIN_C, T_CUTOFF_C, T_REARM_C, SETPOINT_MAX_C, adcToC, cToAdc, Pi, Node,
  P_MCU_W, P_LED_FULL_W, heatBudget, allocate, autonomyH, hueFor, rgbFor };
export default api;
export { api as CapeEngine };
