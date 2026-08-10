// FRESH CUT — sfx.js
// Everything is synthesized. The engine is the protagonist; the ding is sacred.
// All continuous nodes are tracked and stopped — beds never leak or stack.
let AC = null;
const buses = {};
let engine = null, trimmerV = null, amb = { nodes: [], timers: [] }, radio = { st: 0, nodes: [], timers: [], names: ['off', 'WHZL — The Porch', 'Route 9', 'Night Owl'] };

let acDead = false;
export function ac() {
  if (acDead) return null;
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      for (const b of ['master', 'eng', 'amb', 'rad', 'ui']) {
        buses[b] = AC.createGain();
        buses[b].connect(b === 'master' ? AC.destination : buses.master);
      }
      buses.master.gain.value = 0.9; buses.eng.gain.value = 0.7; buses.amb.gain.value = 0.8; buses.rad.gain.value = 0.65; buses.ui.gain.value = 0.9;
    } catch (e) { acDead = true; AC = null; return null; }
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
export function setVol(bus, v) { if (AC && buses[bus]) buses[bus].gain.value = v; }
export function radioName() { return radio.names[radio.st]; }

function noiseBuf(sec = 1.2) {
  const b = AC.createBuffer(1, AC.sampleRate * sec, AC.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
let NB = null;
function noiseSrc() { if (!NB) NB = noiseBuf(); const s = AC.createBufferSource(); s.buffer = NB; s.loop = true; return s; }

// ---------------- engine ----------------
const ENGINE_VOICE = {
  push:  { f: 86, lop: 480, put: 11, wob: 0.06, whir: 1500, whirQ: 1.1, vol: 0.5 },
  self:  { f: 96, lop: 560, put: 12.5, wob: 0.05, whir: 1750, whirQ: 1.2, vol: 0.52 },
  wide:  { f: 74, lop: 430, put: 9.5, wob: 0.07, whir: 1300, whirQ: 1.0, vol: 0.58 },
  rider: { f: 58, lop: 360, put: 6.8, wob: 0.10, whir: 950, whirQ: 0.9, vol: 0.66 },
};
export function engineStart(gear) {
  if (!ac()) return;
  engineStop();
  const v = ENGINE_VOICE[gear] || ENGINE_VOICE.push;
  const g = AC.createGain(); g.gain.value = 0; g.connect(buses.eng);
  // core thump: saw + square detuned through lowpass
  const o1 = AC.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = v.f;
  const o2 = AC.createOscillator(); o2.type = 'square'; o2.frequency.value = v.f * 0.5;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.lop; lp.Q.value = 0.8;
  const og = AC.createGain(); og.gain.value = 0.5;
  o1.connect(og); o2.connect(og); og.connect(lp); lp.connect(g);
  // putter AM
  const lfo = AC.createOscillator(); lfo.frequency.value = v.put;
  const lg = AC.createGain(); lg.gain.value = 0.34;
  lfo.connect(lg); lg.connect(og.gain);
  // deck whir: bandpassed noise
  const n = noiseSrc(); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = v.whir; bp.Q.value = v.whirQ;
  const ng = AC.createGain(); ng.gain.value = 0.11;
  n.connect(bp); bp.connect(ng); ng.connect(g);
  // slow wobble on pitch
  const wob = AC.createOscillator(); wob.frequency.value = 0.6; const wg = AC.createGain(); wg.gain.value = v.f * v.wob;
  wob.connect(wg); wg.connect(o1.frequency);
  o1.start(); o2.start(); lfo.start(); n.start(); wob.start();
  // the pull-cord: rip — sputter, sputter — settle into the putter
  const t0 = AC.currentTime;
  const cord = noiseSrc(); const cbp = AC.createBiquadFilter(); cbp.type = 'bandpass'; cbp.frequency.setValueAtTime(2400, t0); cbp.frequency.exponentialRampToValueAtTime(500, t0 + 0.22); cbp.Q.value = 1.4;
  const cg = AC.createGain(); cord.connect(cbp); cbp.connect(cg); cg.connect(buses.eng);
  cg.gain.setValueAtTime(0.001, t0); cg.gain.exponentialRampToValueAtTime(0.5, t0 + 0.05); cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
  cord.start(t0); cord.stop(t0 + 0.35);
  o1.frequency.setValueAtTime(v.f * 0.45, t0);
  g.gain.setValueAtTime(0, t0);
  for (let i = 0; i < 3; i++) { const st = t0 + 0.24 + i * 0.16; g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(v.vol * (0.5 + i * 0.15), st + 0.03); g.gain.exponentialRampToValueAtTime(0.02, st + 0.11); }
  g.gain.setValueAtTime(0.02, t0 + 0.72);
  g.gain.linearRampToValueAtTime(v.vol, t0 + 1.0);
  o1.frequency.linearRampToValueAtTime(v.f, t0 + 0.9);
  engine = { g, o1, o2, lfo, n, wob, v, base: v.f, stopped: false };
}
export function engineStop() {
  if (!engine || engine.stopped || !AC) { engine = null; return; }
  const e = engine; engine = null; e.stopped = true;
  e.g.gain.setTargetAtTime(0, AC.currentTime, 0.18);
  setTimeout(() => { try { e.o1.stop(); e.o2.stop(); e.lfo.stop(); e.n.stop(); e.wob.stop(); } catch (_) { } }, 700);
}
// load 0..1 (thick grass), speed 0..1 — pitch digs DOWN under load, whir rises with speed
export function engineSet(load, speed) {
  if (!engine || !AC) return;
  const e = engine, t = AC.currentTime;
  const rpm = 0.9 + speed * 0.16 - load * 0.17;
  e.o1.frequency.setTargetAtTime(e.base * rpm, t, 0.09);
  e.o2.frequency.setTargetAtTime(e.base * 0.5 * rpm, t, 0.09);
  e.lfo.frequency.setTargetAtTime(e.v.put * (0.92 + speed * 0.2 - load * 0.22), t, 0.12);
  e.g.gain.setTargetAtTime(e.v.vol * (1 + load * 0.5), t, 0.1);
}
export function trimmerStart() {
  if (!ac()) return;
  trimmerStop();
  const g = AC.createGain(); g.gain.value = 0; g.connect(buses.eng);
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 210;
  const o2 = AC.createOscillator(); o2.type = 'square'; o2.frequency.value = 424;
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
  const og = AC.createGain(); og.gain.value = 0.16;
  o.connect(og); o2.connect(og); og.connect(hp); hp.connect(g);
  const n = noiseSrc(); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3400; bp.Q.value = 2;
  const ng = AC.createGain(); ng.gain.value = 0.05; n.connect(bp); bp.connect(ng); ng.connect(g);
  o.start(); o2.start(); n.start();
  g.gain.linearRampToValueAtTime(0.4, AC.currentTime + 0.25);
  trimmerV = { g, o, o2, n };
}
export function trimmerStop() {
  if (!trimmerV || !AC) { trimmerV = null; return; }
  const tv = trimmerV; trimmerV = null;
  tv.g.gain.setTargetAtTime(0, AC.currentTime, 0.1);
  setTimeout(() => { try { tv.o.stop(); tv.o2.stop(); tv.n.stop(); } catch (_) { } }, 500);
}
export function trimmerSet(eating) { // pitch rises as the cone eats — a micro reward curve
  if (!trimmerV || !AC) return;
  trimmerV.o.frequency.setTargetAtTime(210 * (1 + eating * 0.22), AC.currentTime, 0.06);
  trimmerV.o2.frequency.setTargetAtTime(424 * (1 + eating * 0.22), AC.currentTime, 0.06);
}

// ---------------- one-shots ----------------
function env(g, a, peak, d) { const t = AC.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
export function ding() { // THE ding — one warm bell, tape-saturated, never layered (caller enforces cooldown)
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = 880;
  const o2 = AC.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1318;
  const o3 = AC.createOscillator(); o3.type = 'sine'; o3.frequency.value = 2093;
  const g2 = AC.createGain(); g2.gain.value = 0.35; const g3 = AC.createGain(); g3.gain.value = 0.12;
  const sh = AC.createWaveShaper(); const cur = new Float32Array(64);
  for (let i = 0; i < 64; i++) { const x = i / 32 - 1; cur[i] = Math.tanh(x * 1.5); } sh.curve = cur;
  o.connect(sh); o2.connect(g2); g2.connect(sh); o3.connect(g3); g3.connect(sh); sh.connect(g);
  env(g, 0.008, 0.5, 1.6);
  o.start(); o2.start(); o3.start();
  const st = AC.currentTime + 1.8; o.stop(st); o2.stop(st); o3.stop(st);
  duckRadio(0.5);
}
export function chime(near = 0.5) { // discovery proximity — soft, curious
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = 1560 + near * 300;
  o.connect(g); env(g, 0.01, 0.10 + near * 0.08, 0.5);
  o.start(); o.stop(AC.currentTime + 0.6);
}
export function plink() { // junk pickup
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(660, AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(1320, AC.currentTime + 0.07);
  o.connect(g); env(g, 0.005, 0.14, 0.22); o.start(); o.stop(AC.currentTime + 0.3);
}
export function treasure() { // keepsake — a tiny arpeggio
  if (!ac()) return;
  [523, 659, 784, 1047].forEach((f, i) => {
    const g = AC.createGain(); g.connect(buses.ui);
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    o.connect(g);
    const t = AC.currentTime + i * 0.09;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.start(t); o.stop(t + 0.8);
  });
  duckRadio(0.8);
}
export function thunk() { // bump a prop
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(48, AC.currentTime + 0.1);
  o.connect(g); env(g, 0.004, 0.3, 0.16); o.start(); o.stop(AC.currentTime + 0.25);
}
export function bagDump() { // the bag tips out — a soft grass whump, nothing sharp
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const n = noiseSrc(); const lp = AC.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1900, AC.currentTime);
  lp.frequency.exponentialRampToValueAtTime(300, AC.currentTime + 0.34);
  n.connect(lp); lp.connect(g); env(g, 0.02, 0.2, 0.42);
  n.start(); n.stop(AC.currentTime + 0.55);
  const g2 = AC.createGain(); g2.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(92, AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(50, AC.currentTime + 0.18);
  const t = AC.currentTime;
  g2.gain.setValueAtTime(0, t + 0.04); g2.gain.linearRampToValueAtTime(0.16, t + 0.07); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  o.connect(g2); o.start(t + 0.04); o.stop(t + 0.4);
}
export function squeak() { // gnome / toy bump
  if (!ac()) return;
  const g = AC.createGain(); g.connect(buses.ui);
  const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(900, AC.currentTime);
  o.frequency.linearRampToValueAtTime(1400, AC.currentTime + 0.08); o.frequency.linearRampToValueAtTime(700, AC.currentTime + 0.16);
  o.connect(g); env(g, 0.01, 0.16, 0.2); o.start(); o.stop(AC.currentTime + 0.3);
}
export function completeChord() { // the 100% — held, warm, then evening settles in
  if (!ac()) return;
  [392, 494, 587, 784].forEach((f, i) => {
    const g = AC.createGain(); g.connect(buses.ui);
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const o2 = AC.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 1.005;
    const g2 = AC.createGain(); g2.gain.value = 0.4;
    o.connect(g); o2.connect(g2); g2.connect(g);
    const t = AC.currentTime + i * 0.12;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    o.start(t); o.stop(t + 3.6); o2.start(t); o2.stop(t + 3.6);
  });
}
export function click() { if (!ac()) return; const g = AC.createGain(); g.connect(buses.ui); const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = 2000; o.connect(g); env(g, 0.002, 0.06, 0.03); o.start(); o.stop(AC.currentTime + 0.06); }

// ---------------- ambience: deep summer ----------------
export function ambStart(kind = 'day') {
  if (!ac()) return;
  ambStop();
  const add = (node) => { amb.nodes.push(node); return node; };
  // warm air: soft filtered noise
  const n = add(noiseSrc()); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
  const ng = AC.createGain(); ng.gain.value = kind === 'night' ? 0.020 : 0.030;
  n.connect(lp); lp.connect(ng); ng.connect(buses.amb); n.start();
  if (kind !== 'night') {
    // cicada bed: high bandpassed noise with a fast tremolo, swelling in waves
    const cn = add(noiseSrc()); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4300; bp.Q.value = 6;
    const cg = AC.createGain(); cg.gain.value = 0;
    const trem = add(AC.createOscillator()); trem.frequency.value = 38; const tg = AC.createGain(); tg.gain.value = 0.5;
    const dc = AC.createConstantSource(); dc.offset.value = 0.5; dc.start(); amb.nodes.push(dc);
    const vca = AC.createGain(); vca.gain.value = 0;
    trem.connect(tg); tg.connect(vca.gain); dc.connect(vca.gain);
    cn.connect(bp); bp.connect(vca); vca.connect(cg); cg.connect(buses.amb);
    cn.start(); trem.start();
    const swell = () => {
      if (!amb.nodes.includes(cn)) return;
      const t = AC.currentTime, dur = 3.5 + Math.random() * 3;
      cg.gain.setTargetAtTime(0.045 + Math.random() * 0.03, t, 1.2);
      amb.timers.push(setTimeout(() => { cg.gain.setTargetAtTime(0.008, AC.currentTime, 1.6); }, dur * 1000));
      amb.timers.push(setTimeout(swell, (dur + 4 + Math.random() * 5) * 1000));
    };
    swell();
    // birds
    const bird = () => {
      if (!amb.nodes.includes(n)) return;
      const g = AC.createGain(); g.connect(buses.amb);
      const o = AC.createOscillator(); o.type = 'sine';
      const t = AC.currentTime, f0 = 2200 + Math.random() * 1400;
      const hops = 2 + (Math.random() * 3 | 0);
      for (let i = 0; i < hops; i++) {
        o.frequency.setValueAtTime(f0 * (1 + Math.random() * 0.25), t + i * 0.13);
        o.frequency.exponentialRampToValueAtTime(f0 * (0.8 + Math.random() * 0.15), t + i * 0.13 + 0.09);
      }
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.setTargetAtTime(0, t + hops * 0.13, 0.05);
      o.connect(g); o.start(t); o.stop(t + hops * 0.13 + 0.3);
      amb.timers.push(setTimeout(bird, 4000 + Math.random() * 9000));
    };
    amb.timers.push(setTimeout(bird, 1500));
    // distant sprinkler ticks
    const spr = () => {
      if (!amb.nodes.includes(n)) return;
      const reps = 8 + (Math.random() * 8 | 0);
      for (let i = 0; i < reps; i++) {
        const g = AC.createGain(); g.connect(buses.amb);
        const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = 3000;
        const t = AC.currentTime + i * 0.14;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.012, t + 0.004); g.gain.setTargetAtTime(0, t + 0.01, 0.015);
        o.connect(g); o.start(t); o.stop(t + 0.06);
      }
      amb.timers.push(setTimeout(spr, 20000 + Math.random() * 25000));
    };
    amb.timers.push(setTimeout(spr, 9000));
  } else {
    // crickets for the golden-hour tail
    const cr = () => {
      if (!amb.nodes.includes(n)) return;
      const g = AC.createGain(); g.connect(buses.amb);
      const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = 4200;
      const t = AC.currentTime;
      for (let i = 0; i < 3; i++) { g.gain.setValueAtTime(0.03, t + i * 0.07); g.gain.setValueAtTime(0, t + i * 0.07 + 0.035); }
      o.connect(g); o.start(t); o.stop(t + 0.3);
      amb.timers.push(setTimeout(cr, 700 + Math.random() * 1800));
    };
    cr();
  }
}
export function ambStop() {
  for (const t of amb.timers) clearTimeout(t);
  for (const nd of amb.nodes) { try { nd.stop ? nd.stop() : 0; } catch (_) { } try { nd.disconnect(); } catch (_) { } }
  amb = { nodes: [], timers: [] };
}

// ---------------- Pop's radio ----------------
const SCALES = {
  porch: [220, 261.6, 293.7, 329.6, 392, 440, 523.3],
  route9: [196, 246.9, 293.7, 329.6, 392, 493.9],
  night: [174.6, 207.7, 233.1, 311.1, 349.2, 415.3],
};
export function radioCycle(allowed = 3) {
  if (!ac()) return;
  radio.st = (radio.st + 1) % (allowed + 1);
  radioStop(false);
  if (radio.st > 0) { radioStatic(); setTimeout(() => radioPlay(radio.st), 380); }
  return radio.st;
}
export function radioOff() { radio.st = 0; radioStop(false); }
function radioStatic() {
  const n = noiseSrc(); const g = AC.createGain(); g.gain.value = 0.05;
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 0.4;
  n.connect(bp); bp.connect(g); g.connect(buses.rad); n.start();
  setTimeout(() => { try { n.stop(); } catch (_) { } }, 420);
}
function radioPlay(st) {
  radioStop(false);
  const kind = ['', 'porch', 'route9', 'night'][st];
  const scale = SCALES[kind];
  // the "radio" voicing chain: bandpass + soft clip + hiss + wow
  const out = AC.createGain(); out.gain.value = 0.9; radio.nodes.push(out);
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.55;
  const sh = AC.createWaveShaper(); const cur = new Float32Array(64);
  for (let i = 0; i < 64; i++) { const x = i / 32 - 1; cur[i] = Math.tanh(x * 2.2); } sh.curve = cur;
  out.connect(sh); sh.connect(bp); bp.connect(buses.rad);
  const hiss = noiseSrc(); const hg = AC.createGain(); hg.gain.value = 0.006; hiss.connect(hg); hg.connect(buses.rad); hiss.start(); radio.nodes.push(hiss);
  // pad
  const wow = AC.createOscillator(); wow.frequency.value = 0.5; const wg = AC.createGain(); wg.gain.value = 1.2; wow.start(); radio.nodes.push(wow);
  const tempo = kind === 'porch' ? 2.4 : kind === 'route9' ? 1.05 : 1.7;
  const padF = [scale[0], scale[2], scale[4]];
  for (const f of padF) {
    const o = AC.createOscillator(); o.type = kind === 'night' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
    const og = AC.createGain(); og.gain.value = kind === 'route9' ? 0.03 : 0.045;
    wow.connect(wg); wg.connect(o.detune);
    o.connect(og); og.connect(out); o.start(); radio.nodes.push(o);
  }
  // melody scheduler
  let step = 0;
  const mel = () => {
    if (radio.st !== st) return;
    const t = AC.currentTime;
    if (Math.random() < (kind === 'porch' ? 0.7 : 0.9)) {
      const f = scale[(Math.random() * scale.length) | 0] * (Math.random() < 0.3 ? 2 : 1);
      const o = AC.createOscillator(); o.type = kind === 'route9' ? 'square' : 'sine'; o.frequency.value = f;
      const g = AC.createGain(); o.connect(g); g.connect(out);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(kind === 'route9' ? 0.05 : 0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + tempo * (0.4 + Math.random() * 0.5));
      o.start(t); o.stop(t + tempo);
      if (kind === 'route9' && Math.random() < 0.5) { // backbeat snap
        const n2 = noiseSrc(); const g2 = AC.createGain(); const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
        n2.connect(hp); hp.connect(g2); g2.connect(out);
        g2.gain.setValueAtTime(0.04, t + tempo / 2); g2.gain.setTargetAtTime(0, t + tempo / 2 + 0.02, 0.02);
        n2.start(t + tempo / 2); n2.stop(t + tempo / 2 + 0.1);
      }
    }
    step++;
    radio.timers.push(setTimeout(mel, tempo * 1000 * (kind === 'porch' ? (0.5 + Math.random()) : 0.5)));
  };
  mel();
}
function radioStop(reset = true) {
  for (const t of radio.timers) clearTimeout(t);
  for (const nd of radio.nodes) { try { nd.stop ? nd.stop() : 0; } catch (_) { } try { nd.disconnect(); } catch (_) { } }
  radio.nodes = []; radio.timers = [];
  if (reset) radio.st = 0;
}
function duckRadio(sec) {
  if (!AC) return;
  buses.rad.gain.setTargetAtTime(0.12, AC.currentTime, 0.05);
  setTimeout(() => { if (AC) buses.rad.gain.setTargetAtTime(radioUserVol, AC.currentTime, 0.4); }, sec * 1000);
}
let radioUserVol = 0.65;
export function setRadioUserVol(v) { radioUserVol = v; setVol('rad', v); }
export function stopAll() { engineStop(); trimmerStop(); ambStop(); radioStop(); }
