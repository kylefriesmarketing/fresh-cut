// FRESH CUT — main.js
// Boot, loop, input, save, and the shape of a session:
// notebook → briefing → the yard → golden hour → postcard → notebook.
import * as THREE from 'three';
import { Game, GEARS } from './game.js';
import { JOBS, GEAR_UNLOCKS, dailyDef } from './yards.js';
import * as ui from './ui.js';
import * as sfx from './sfx.js';
import { makePost } from './post.js';
import { award, ensure as ensureTrophies } from './trophies.js';

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
const post = makePost(renderer);
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  post.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
// post is on unless the machine can't do WebGL2 or the player turned it off
function postOn() { return post.available && S.postfx !== false && quality() !== 'low'; }
function drawScene(sc, cam, warm) {
  if (postOn()) post.render(sc, cam, warm);
  else { renderer.setRenderTarget(null); renderer.render(sc, cam); }
}

// ---------- save ----------
const SAVE_KEY = 'fc-save';
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) return s; } catch (_) { }
  return { v: 1, done: {}, pegboard: [], jar: 0, resume: null, settings: { veng: 70, vamb: 80, vrad: 65, sens: 100, invy: false, bob: true, postfx: true, qual: 'auto' } };
}
const save = ensureTrophies(loadSave());
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
  ui.renderShelf(save, (c) => { save.paint = c; persist(); });
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
    gear, quality: quality(), paint: save.paint || null, cb: {
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
  // the shelf: fold this run into the lifetime totals and see what it earned
  const won = award(save, {
    dist: stats.dist, time: stats.time, bags: G ? G.bagsEmptied : 0,
    pattern: stats.pattern, found: stats.found, totalDisc: stats.totalDisc, gear: G ? G.gearKey : null,
  });
  for (let i = 0; i < won.length; i++) {
    const t = won[i];
    setTimeout(() => ui.sms('THE SHELF', `🏆 ${t.name} — ${t.note}${t.paint ? ' (a tin of paint came with it)' : ''}`, false), 900 + i * 1500);
  }
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
  renderer.setSize(1200, 675, false);
  post.setSize(1200, 675);                 // the postcard gets the grade too — it's the keepsake
  drawScene(scene, dc, G.warm);
  const url = renderer.domElement.toDataURL('image/jpeg', 0.9);
  renderer.setSize(innerWidth, innerHeight, false);
  post.setSize(innerWidth, innerHeight);
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
bind('s-postfx', 'postfx', () => { });
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
  drawScene(scene, camera, G.warm);
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
  post: () => post,
  gl: () => ({ renderer, camera, scene }),
  // What the skyline actually costs, measured properly. ⚠️ Wall-clock timing of GPU work
  // LIES here (v1.9 measured post-processing as "faster than off", which is impossible) —
  // this uses EXT_disjoint_timer_query_webgl2, and reports draw calls and triangles too,
  // which are exact and don't need a stable clock at all.
  heroCost: async (frames = 24) => {
    const heroes = [];
    G.world.group.traverse(o => { if (o.userData.hero) heroes.push(o); });
    const gl = renderer.getContext();
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    // ⚠️ `renderer.info` is RESET on every render() call, and post.js renders several passes
    // per frame — so reading it after drawFrame reports the composite quad alone (1 call,
    // 2 triangles) and looks like the scene is free. autoReset off + a manual reset gives
    // the real per-frame totals.
    renderer.info.autoReset = false;
    const pass = async (on) => {
      for (const h of heroes) h.visible = on;
      renderer.info.reset(); drawFrame(0.016);
      const info = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
      if (!ext) return { ...info, ms: null };
      const times = [];
      for (let i = 0; i < frames; i++) {
        const q = gl.createQuery();
        gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
        drawFrame(0.016);
        gl.endQuery(ext.TIME_ELAPSED_EXT);
        for (let t = 0; t < 300; t++) {                   // poll until the driver hands it back
          await new Promise(r => setTimeout(r, 2));
          if (gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE) &&
              !gl.getParameter(ext.GPU_DISJOINT_EXT)) { times.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6); break; }
        }
        gl.deleteQuery(q);
      }
      times.sort((a, b) => a - b);
      return { ...info, ms: +times[times.length >> 1].toFixed(3), lo: +times[0].toFixed(3), hi: +times[times.length - 1].toFixed(3), n: times.length };
    };
    const on = await pass(true), off = await pass(false);
    // CONTROL: hide everything. If this does NOT collapse, the timing is measuring nothing
    // and the numbers above are worthless — v1.9 shipped exactly that kind of bad probe.
    scene.visible = false;
    const control = await pass(true);
    scene.visible = true;
    for (const h of heroes) h.visible = true;
    renderer.info.autoReset = true;
    const noise = on.ms != null ? +(on.hi - on.lo).toFixed(3) : null;
    return {
      heroes: heroes.length, on, off, control,
      deltaCalls: on.calls - off.calls, deltaTris: on.tris - off.tris,
      deltaMs: on.ms != null ? +(on.ms - off.ms).toFixed(3) : null,
      noiseMs: noise, valid: control.ms != null && control.ms < on.ms * 0.5,
      // the honest reading: if |deltaMs| < noise, say so instead of quoting a number
      verdict: on.ms != null && Math.abs(on.ms - off.ms) < noise
        ? `below the noise floor (spread ${noise}ms); cost is ${on.calls - off.calls} draw calls / ${on.tris - off.tris} tris`
        : `${(on.ms - off.ms).toFixed(3)}ms`,
    };
  },
  // THE BATTERY, in the repo instead of being retyped into the console every session.
  // Every job boots → mows → completes, and each one is checked for the things that have
  // actually broken before: deck alignment, a bag, a hero, a palette.
  //   await __fc.battery()            → {pass, fail, errors, rows}
  //   __fc.battery({log:true})        → also prints a table
  // ⚠️ It cycles the gear per job on purpose — a mower that fails to build only shows up
  // if something other than 'push' gets used.
  battery: async (opts = {}) => {
    const errs = [];
    const onErr = (e) => errs.push('ERR ' + (e.message || e));
    const oldErr = console.error;
    console.error = (...a) => { errs.push(a.join(' ')); oldErr(...a); };
    window.addEventListener('error', onErr);
    const ids = (opts.ids || JOBS.map(j => j.id).concat(['daily']));
    const gears = opts.gears || ['push', 'self', 'wide', 'rider'];
    const rows = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        window.__fcAuto = true;
        window.__fc.startJob(id, gears[i % gears.length]);
        await new Promise(r => setTimeout(r, opts.settle || 60));
        window.__fc.mowAll();
        window.__fc.drive(0, 60);
        const g = G;
        rows.push({
          id, gear: g.gearKey, pct: +g.grass.pct().toFixed(3), done: !!g.done,
          zones: g.zoneNames.length, hero: (g.def.hero || []).length, pal: !!g.def.palette,
          deck: Math.abs(g.deckAt - (g.mowerOff + (g.mowerG.userData.deckLocal || 0))) < 1e-9,
          bag: !!g.mowerG.userData.bag,
          ok: !!g.done && g.grass.pct() >= 0.999 && !!g.mowerG.userData.bag,
        });
      } catch (e) { rows.push({ id, ok: false, err: e.message }); }
      document.getElementById('comp-next')?.click();
      document.getElementById('cred-done')?.click();
      await new Promise(r => setTimeout(r, 30));
      document.getElementById('comp-next')?.click();
      document.getElementById('cred-done')?.click();
    }
    console.error = oldErr;
    window.removeEventListener('error', onErr);
    const out = { pass: rows.filter(r => r.ok).length, fail: rows.filter(r => !r.ok), errors: [...new Set(errs)], rows };
    if (opts.log) console.table(rows);
    return out;
  },
  // Photograph the game from inside it. The Browser pane never composites this canvas, so
  // the built-in screenshot tools time out and the canvas reports 0×0 — but a WebGL drawing
  // buffer is only cleared on COMPOSITE, so sizing + rendering + toDataURL IN ONE TASK gives
  // real pixels. POSTs the PNG to tools-shot-receiver.mjs (repo root of the workspace).
  // ⚠️ Mow a patch at the camera first, or the foreground is a wall of uncut grass.
  shoot: (name = 'fc', port = 8399, w = 1280, h = 720) => {
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (post && post.available) post.setSize(w, h);
    drawFrame(0.016);
    const url = renderer.domElement.toDataURL('image/png');
    return fetch(`http://localhost:${port}/shot?name=${encodeURIComponent(name)}`, { method: 'POST', body: url }).then(r => r.text());
  },
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
