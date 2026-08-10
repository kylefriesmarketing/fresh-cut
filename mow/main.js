// FRESH CUT — main.js
// Boot, loop, input, save, and the shape of a session:
// notebook → briefing → the yard → golden hour → postcard → notebook.
import * as THREE from 'three';
import { Game, GEARS } from './game.js';
import { JOBS, GEAR_UNLOCKS, dailyDef } from './yards.js';
import * as ui from './ui.js';
import * as sfx from './sfx.js';

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('app').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.05, 400);
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});

// ---------- save ----------
const SAVE_KEY = 'fc-save';
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) return s; } catch (_) { }
  return { v: 1, done: {}, pegboard: [], jar: 0, resume: null, settings: { veng: 70, vamb: 80, vrad: 65, sens: 100, invy: false, bob: true, qual: 'auto' } };
}
const save = loadSave();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { } }
function quality() {
  const q = save.settings.qual;
  if (q !== 'auto') return q;
  return (navigator.hardwareConcurrency || 8) <= 4 ? 'med' : 'high';
}

// ---------- state ----------
let G = null, DEF = null, scene = null;
let running = false, paused = false;
let beforeImg = null, afterImg = null;
let midFired = [];
let autosaveT = 0;
const input = { w: 0, a: 0, s: 0, d: 0, act: 0, mx: 0, my: 0, sens: 1, invY: false };

// ---------- input ----------
const KEYMAP = { KeyW: 'w', ArrowUp: 'w', KeyA: 'a', ArrowLeft: 'a', KeyS: 's', ArrowDown: 's', KeyD: 'd', ArrowRight: 'd' };
addEventListener('keydown', e => {
  if (KEYMAP[e.code] !== undefined) { input[KEYMAP[e.code]] = 1; e.preventDefault(); }
  if (!G || !running || paused) return;
  if (e.code === 'KeyE') { G.swapTool(); }
  if (e.code === 'KeyF') { G.lever(); }
  if (e.code === 'KeyZ') { zonesVisible = !zonesVisible; }
  if (e.code === 'KeyL') { const on = G.toggleLB(); ui.hint(on ? 'Last blades, glowing. Go get the stragglers.' : 'Glow off.'); }
  if (e.code === 'KeyR') {
    if (DEF.noRadio) { ui.hint(DEF.finale ? '(Only static tonight. That feels right.)' : '(…static…)'); return; }
    sfx.radioCycle(save.done['pops'] ? 3 : 2);
    ui.setRadioChip(sfx.radioName());
  }
});
addEventListener('keyup', e => { if (KEYMAP[e.code] !== undefined) input[KEYMAP[e.code]] = 0; });
renderer.domElement.addEventListener('mousedown', e => {
  if (!running || paused) return;
  if (e.button === 0) input.act = 1;
  if (document.pointerLockElement !== renderer.domElement && e.button === 0 && !window.__fcAuto) {
    renderer.domElement.requestPointerLock?.();
  }
});
addEventListener('mouseup', e => { if (e.button === 0) input.act = 0; });
addEventListener('mousemove', e => {
  if (!running || paused) return;
  if (document.pointerLockElement === renderer.domElement) { input.mx += e.movementX; input.my += e.movementY; }
  else if (e.buttons & 2) { input.mx += e.movementX; input.my += e.movementY; }
});
addEventListener('contextmenu', e => { if (running) e.preventDefault(); });
document.addEventListener('pointerlockchange', () => {
  if (running && document.pointerLockElement !== renderer.domElement && !window.__fcAuto && !G?.done) showPause();
});

// ---------- flow ----------
let zonesVisible = false;
function openNotebook() {
  ui.renderNotebook(save, pickJob);
  ui.show('notebook'); ui.hide('title');
}
function pickJob(id) {
  const def = id === 'daily' ? dailyDef(todayStr()) : JOBS.find(j => j.id === id);
  if (!def) return;
  ui.hide('notebook');
  ui.renderBrief(def, save, (gear) => beginJob(def, gear), () => { ui.show('notebook'); ui.hide('brief'); });
  ui.show('brief');
}
function todayStr() { const d = new Date(); return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`; }

function beginJob(def, gear) {
  ui.hide('brief'); ui.hide('title'); ui.hide('notebook');
  DEF = def; midFired = [];
  scene = new THREE.Scene();
  G = new Game(scene, def, {
    gear, quality: quality(), cb: {
      pct: p => { ui.setPct(p, def.name); checkMidTexts(p); },
      zone: (name, done, total) => ui.zoneBanner(name, done, total),
      hint: t => ui.hint(t),
      tool: (tool, high) => ui.setTool(tool, high, G.gearKey),
      discover: d => onDiscover(d),
      complete: stats => onComplete(stats),
      bagDump: () => {
        if (localStorage.getItem('fc-bagged')) return;
        localStorage.setItem('fc-bagged', '1');
        ui.hint("(bag's full — it tips itself out by the curb. that smell is the whole job.)", 6000);
      },
    }
  });
  // resume?
  if (save.resume && save.resume.id === def.id) {
    G.restore(save.resume.snap);
    ui.hint('Right where you left it. The grass waited.');
  }
  save.resume = null; persist();
  ui.setPct(G.grass.pct(), def.name);
  ui.setTool('mow', false, G.gearKey);
  ui.setRadioChip('off');
  ui.clearSms();
  ui.hudOn(true);
  running = true; paused = false;
  // the "before" postcard shot, then hand the camera to the player
  beforeImg = null; afterImg = null;
  requestAnimationFrame(() => { beforeImg = droneShot(); });
  try { sfx.ac(); sfx.engineStart(gear); sfx.ambStart(def.light === 'night' ? 'night' : 'day', { quiet: !!def.finale }); } catch (_) { }
  if (def.texts?.arrive) setTimeout(() => ui.sms(def.who, def.texts.arrive), 1800);
  if (!localStorage.getItem('fc-taught')) {
    localStorage.setItem('fc-taught', '1');
    ui.hint('WASD to push, mouse to steer. The grass ahead of the deck gets cut. That’s the whole job.', 7000);
  }
}
function checkMidTexts(p) {
  for (const m of DEF.texts?.mid || []) {
    if (p * 100 >= m.pct && !midFired.includes(m.pct)) { midFired.push(m.pct); ui.sms(DEF.who, m.t); }
  }
}
function onDiscover(d) {
  if (d.tier === 'junk') { save.jar++; persist(); return; }
  ui.sms(d.self ? null : DEF.who, (d.self ? '' : '') + (d.text ? d.text : `Found: ${d.label}`), false);
  ui.hint(`${d.tier === 'keep' ? '🏆 Keepsake' : '💌 Returned'}: ${d.label}`, 5200);
  save.pegboard.push({ label: d.label, tier: d.tier, from: DEF.name });
  persist();
}
function onComplete(stats) {
  running && persist();
  ui.flash();
  const doneBefore = ui.countCampaignDone(save);
  if (!DEF.daily) {
    save.done[DEF.id] = { found: stats.found, keeps: stats.keeps, time: Math.round(stats.time) };
  } else {
    save.dailyDone = todayStr();
  }
  save.resume = null;
  persist();
  // gear unlock crossing?
  const doneAfter = ui.countCampaignDone(save);
  const unlocked = GEAR_UNLOCKS.find(u => doneBefore < u.afterJobs && doneAfter >= u.afterJobs);
  // linger in the golden hour, then the postcard
  setTimeout(() => {
    afterImg = droneShot(true);
    ui.hudOn(false);
    document.exitPointerLock?.();
    ui.renderComplete(DEF, stats, beforeImg, afterImg, DEF.texts?.reply, () => {
      ui.hide('complete');
      if (DEF.finale && !save.creditsSeen) {
        save.creditsSeen = true; persist();
        ui.renderCredits(() => { ui.hide('credits'); teardown(); openNotebook(); });
      } else {
        teardown(); openNotebook();
        if (unlocked) setTimeout(() => ui.sms('THE GARAGE', unlocked.note, false), 600);
      }
    });
  }, 2400);
}
function teardown() {
  running = false; paused = false;
  try { sfx.stopAll(); } catch (_) { }
  if (G) { G.dispose(); G = null; }
  scene = null;
  ui.hudOn(false);
}
function showPause() {
  paused = true;
  document.getElementById('pause-title').textContent = 'Take a breather';
  ui.show('pause');
  try { sfx.engineStop(); sfx.trimmerStop(); } catch (_) { }
}
function hidePause() {
  paused = false; ui.hide('pause');
  if (G && G.tool === 'mow' && !G.done) { try { sfx.engineStart(G.gearKey); } catch (_) { } }
  if (!window.__fcAuto) renderer.domElement.requestPointerLock?.();
}
document.getElementById('ps-resume').onclick = hidePause;
document.getElementById('ps-quit').onclick = () => {
  if (G && !G.done) { save.resume = { id: DEF.id, snap: G.snapshot() }; persist(); }
  ui.hide('pause'); teardown(); openNotebook();
};

// ---------- the drone shot (before/after postcards) ----------
function droneShot(final = false) {
  if (!G) return null;
  if (final) { G.applyWarmNow(); } // the postcard gets the full golden hour
  const W = DEF.lot.w, H = DEF.lot.h;
  const dc = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 400);
  const dist = Math.max(W, H);
  dc.position.set(W * 0.18, dist * 0.72, H * 1.42);
  dc.lookAt(W / 2, 0, H * 0.42);
  const old = { w: renderer.domElement.width, h: renderer.domElement.height };
  renderer.setSize(1200, 675, false);
  renderer.render(scene, dc);
  const url = renderer.domElement.toDataURL('image/jpeg', 0.9);
  renderer.setSize(innerWidth, innerHeight, false);
  const img = new Image(); img.src = url;
  return img;
}

// ---------- menus ----------
document.getElementById('bt-continue').onclick = () => { sfx.ac?.(); openNotebook(); };
document.getElementById('bt-daily').onclick = () => { sfx.ac?.(); pickJob('daily'); ui.hide('title'); };
document.getElementById('bt-settings').onclick = () => { document.getElementById('pause-title').textContent = 'Settings'; ui.show('pause'); paused = false; };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { ui.hide(b.dataset.close); ui.show('title'); });
ui.wireNotebookTabs();

// settings wiring
const S = save.settings;
const bind = (id, key, fn) => {
  const e = document.getElementById(id);
  if (e.type === 'checkbox') { e.checked = !!S[key]; e.onchange = () => { S[key] = e.checked; persist(); fn?.(e.checked); }; }
  else { e.value = S[key]; e.oninput = () => { S[key] = e.type === 'range' ? +e.value : e.value; persist(); fn?.(e.value); }; }
};
bind('s-veng', 'veng', v => sfx.setVol('eng', v / 100));
bind('s-vamb', 'vamb', v => sfx.setVol('amb', v / 100));
bind('s-vrad', 'vrad', v => sfx.setRadioUserVol(v / 100));
bind('s-sens', 'sens', () => { });
bind('s-invy', 'invy', () => { });
bind('s-bob', 'bob', () => { });
bind('s-qual', 'qual', () => ui.hint('Quality applies next job.'));

// ---------- loop ----------
let last = performance.now(), acc = 0, smoothFov = 74;
const STEP = 0.02;
// one visual frame (camera + render), shared by the loop and the __fc.renderOnce QA hook —
// the Browser pane suspends rAF, so headless verification needs a callable render path
function drawFrame(dt) {
  G.frame(camera, dt);
  const c = G.camPos();
  // camera rides a shoulder-width behind the push point so the mower lives in frame
  const back = G.gearKey === 'rider' ? -0.15 : 0.34;
  camera.position.set(c.x - Math.sin(c.yaw) * back, S.bob ? c.y : G.gear.cam, c.z - Math.cos(c.yaw) * back);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = c.yaw + Math.PI; camera.rotation.x = c.pitch;
  renderer.toneMappingExposure = 1.0 + G.warm * 0.12;
  // the engine digs in: a breath of FOV under load
  smoothFov += ((74 + (G.tool === 'mow' ? G.load * 3.2 : 0)) - smoothFov) * Math.min(1, dt * 3);
  if (Math.abs(camera.fov - smoothFov) > 0.05) { camera.fov = smoothFov; camera.updateProjectionMatrix(); }
  renderer.render(scene, camera);
}
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!G || !scene) return;
  if (paused || document.hidden) { return; }
  input.sens = S.sens / 100; input.invY = S.invy;
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard++ < 6) { G.update(STEP, input); acc -= STEP; }
  drawFrame(dt);
  // zone list (on demand)
  if (zonesVisible && !G.done) ui.renderZones(G.zoneNames, G.zoneNames.map((_, i) => G.grass.zonePct(i)), G.zoneDone, true);
  else ui.renderZones([], [], [], false);
  // autosave mid-job
  autosaveT -= dt;
  if (autosaveT <= 0 && running && !G.done) {
    autosaveT = 8;
    save.resume = { id: DEF.id, snap: G.snapshot() };
    persist();
  }
}
requestAnimationFrame(loop);

// ---------- debug / test hooks (the toybox lesson: build QA in from day one) ----------
window.__fc = {
  save, JOBS,
  startJob: (id, gear = 'push') => { window.__fcAuto = true; const def = id === 'daily' ? dailyDef(todayStr()) : JOBS.find(j => j.id === id); beginJob(def, gear); },
  game: () => G,
  pct: () => G ? G.grass.pct() : 0,
  state: () => G ? { pct: G.grass.pct(), zones: G.zoneNames.map((n, i) => [n, +G.grass.zonePct(i).toFixed(3)]), done: G.done, found: G.found.length } : null,
  mowRect: (x0, z0, x1, z1, step = 0.4) => {
    for (let z = z0; z <= z1; z += step) for (let x = x0; x <= x1; x += step) G.grass.stamp(x, z, 0.35, 'trim', false, 0);
  },
  mowAll: () => { window.__fc.mowRect(0, 0, DEF.lot.w, DEF.lot.h, 0.35); },
  teleport: (x, z) => { G.p.x = x; G.p.z = z; },
  drive: (fw, ticks = 50) => { input.w = fw > 0 ? 1 : 0; input.s = fw < 0 ? 1 : 0; for (let i = 0; i < ticks; i++) G.update(STEP, input); input.w = 0; input.s = 0; },
  turn: (yaw) => { G.p.yaw = yaw; },
  look: (pitch, yaw) => { if (pitch !== undefined) G.p.pitch = pitch; if (yaw !== undefined) G.p.yaw = yaw; },
  stripes: (x0, z0, x1, z1, rows = 8) => {
    const rh = (z1 - z0) / rows;
    for (let r = 0; r < rows; r++) {
      const z = z0 + rh * (r + 0.5), dir = r % 2 ? -Math.PI / 2 : Math.PI / 2;
      for (let x = x0; x <= x1; x += 0.3) G.grass.stamp(x, z, rh / 2 + 0.05, 'trim', false, dir);
    }
  },
  shot: () => renderer.domElement.toDataURL('image/jpeg', 0.85),
  renderOnce: (dt = 0.016) => { if (G && scene) drawFrame(dt); },
  sfx,
};

// ---------- URL params (test / share) ----------
const Q = new URLSearchParams(location.search);
if (Q.get('job')) {
  window.__fcAuto = Q.get('auto') === '1';
  const id = Q.get('job');
  setTimeout(() => {
    ui.hide('title');
    const def = id === 'daily' ? dailyDef(todayStr()) : JOBS.find(j => j.id === id);
    if (def) beginJob(def, Q.get('gear') || def.gearLock || 'push');
  }, 120);
}
