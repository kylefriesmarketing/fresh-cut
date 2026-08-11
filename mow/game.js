// FRESH CUT — game.js
// The sim: player + tools + stamping + zones + discoveries + critters.
// No fail states live anywhere in this file. Grass stays cut. Every second is banked.
import * as THREE from 'three';
import { GrassField, ClipPool, CUT, HIGH, M_NOGRASS, M_WCLUMP, M_TRIM, mulberry, dotTex } from './grass.js';
import { buildYard, makeMower, makeTrimmer, discoveryMesh } from './props.js';
import { buildStreet } from './street.js';
import { buildLife } from './life.js';
import { buildHood } from './hood.js';
import { jobDiscoveries } from './yards.js';
import * as sfx from './sfx.js';

export const GEARS = {
  push:  { name: 'Old Faithful',      swath: 0.55, speed: 1.45, walk: 2.3, cam: 1.62, bob: 1.0 },
  self:  { name: 'The Self-Propelled', swath: 0.55, speed: 1.75, walk: 2.3, cam: 1.62, bob: 0.85 },
  wide:  { name: 'The Wide-Deck',     swath: 0.78, speed: 1.55, walk: 2.3, cam: 1.62, bob: 1.1 },
  rider: { name: 'The Rider',         swath: 1.15, speed: 2.45, walk: 2.45, cam: 1.98, bob: 0.35 },
};

export class Game {
  constructor(scene, def, opts) {
    this.scene = scene; this.def = def; this.cb = opts.cb || {};
    this.quality = opts.quality || 'high';
    this.gearKey = def.gearLock || opts.gear || 'push';
    this.gear = GEARS[this.gearKey];

    // grass first, then the yard (props paint no-grass + trim rings), then finalize
    const g = this.grass = new GrassField(scene, def.lot.w, def.lot.h, this.quality);
    for (const t of def.tiers || []) {
      if (t.t === 'base') g.tierRect(0, 0, def.lot.w, def.lot.h, t.tier);
      else if (t.t === 'rect') g.tierRect(t.x, t.z, t.w, t.h, t.tier);
      else if (t.t === 'circle') g.tierCircle(t.x, t.z, t.r, t.tier);
    }
    for (const w of def.wclumps || []) g.wclump(w.x, w.z, w.r);
    this.zoneNames = [];
    (def.zones || []).forEach((z, i) => { g.zoneRect(z.x, z.z, z.w, z.h, i); this.zoneNames.push(z.name); });
    this.world = buildYard(scene, def, g, this.quality);
    // the street goes up after the yard so its windows join world.windows before the
    // light preset runs — then they warm with the house's at golden hour, for free
    this.world.street = buildStreet(scene, def, this.world, this.quality);
    this.world.hood = buildHood(scene, def, this.world, this.quality);
    this.world.life = buildLife(scene, def, this.world, g, this.quality);
    g.finalize();
    this.clips = new ClipPool(scene, this.quality === 'low' ? 400 : 900);

    // player
    const gate = this.world.gate || { x: 3, w: 1.4 };
    // pitch starts in mowing posture — eyes on the grass ahead of the deck, mower in frame
    this.p = { x: gate.x + (gate.w || 1.4) / 2, z: 2.0, yaw: 0, pitch: -0.42, vx: 0, vz: 0 };
    this.tool = 'mow'; this.highCut = false; this.load = 0; this.speedF = 0;
    this.mowerG = makeMower(this.gearKey); scene.add(this.mowerG);
    this.mowerOff = this.gearKey === 'rider' ? 0.4 : 0.86; // how far ahead of the player the mower rides
    // where the CUT lands: the drawn deck's own centre. These must agree or the cut line
    // floats ahead of the mower as you push (it used to be a flat 1.02 for every gear).
    this.deckAt = this.mowerOff + (this.mowerG.userData.deckLocal || 0);
    this.trimG = makeTrimmer(); this.trimG.visible = false; scene.add(this.trimG);
    this.trimming = false; this.trimEat = 0;

    // grass bag — fills as the deck eats, tips itself out when full (a beat, never a chore)
    this.bagFill = 0; this.bagsEmptied = 0; this.bagAnim = 0; this._bagVis = 0;
    this.bagCap = ({ push: 110, self: 110, wide: 140, rider: 190 }[this.gearKey] || 110) * 64; // m² → texels (8 texels/m)

    // zones / completion
    this.zoneDone = (def.zones || []).map(() => false);
    this.dingQ = []; this.dingT = 0;
    this.done = false; this.time = 0; this.dist = 0;

    // discoveries — and if authoring or scatter left one on a path/footprint, walk it to real grass
    this.disc = jobDiscoveries(def).map((d, i) => ({ ...d, i, state: 0, mesh: null, chimeT: 0, t: 0 }));
    for (const d of this.disc) {
      if (this.grass.stateAt(d.x, d.z).meta !== M_NOGRASS) continue;
      let placed = false;
      for (let r = 0.4; r <= 4.4 && !placed; r += 0.4) for (let a = 0; a < 6.28 && !placed; a += 0.8) {
        const nx2 = d.x + Math.sin(a) * r, nz2 = d.z + Math.cos(a) * r;
        if (nx2 > 1 && nz2 > 1 && nx2 < def.lot.w - 1 && nz2 < def.lot.h - 1 && this.grass.stateAt(nx2, nz2).meta !== M_NOGRASS) { d.x = nx2; d.z = nz2; placed = true; }
      }
    }
    this.found = [];

    // last blade
    this.lbOn = false; this.lbT = 0; this.lbSprites = [];
    const lbTex = makeGlowTex();
    this.lbMat = new THREE.SpriteMaterial({ map: lbTex, color: 0xfff2a8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

    // critters
    this.rabbit = def.rabbit ? makeRabbit(scene, def, g) : null;
    this.dog = def.dog ? makeDog(scene, def) : null;
    this.fireflies = (def.light === 'night' || def.light === 'dusk' || def.light === 'weird') ? makeFireflies(scene, def) : null;

    // golden hour state
    this.warm = 0; this.warmTarget = 0;
    applyLightPreset(this.world, this.scene, def.light || 'day', 0);

    this.blockHintT = 0; this.bumpT = 0;
  }

  // ---------------- per-tick (fixed 50 Hz) ----------------
  update(dt, input) {
    this.time += dt;
    const p = this.p, def = this.def;
    // look
    p.yaw -= input.mx * 0.0023 * input.sens;
    p.pitch = Math.max(-1.2, Math.min(0.6, p.pitch - input.my * 0.0023 * input.sens * (input.invY ? -1 : 1)));
    input.mx = 0; input.my = 0;

    // move
    const fw = (input.w ? 1 : 0) - (input.s ? 1 : 0);
    const st = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const mowing = this.tool === 'mow';
    const base = mowing ? this.gear.speed : this.gear.walk;
    this.load = mowing ? this.grass.loadAhead(p.x + Math.sin(p.yaw) * this.deckAt, p.z + Math.cos(p.yaw) * this.deckAt, p.yaw) : 0;
    const spd = base * (1 - this.load * 0.38) * (fw < 0 ? 0.6 : 1);
    // forward = (sin yaw, cos yaw), so screen-right = (-cos yaw, +sin yaw) — D must move right
    let dx = (Math.sin(p.yaw) * fw - Math.cos(p.yaw) * st) * spd * dt;
    let dz = (Math.cos(p.yaw) * fw + Math.sin(p.yaw) * st) * spd * dt;
    const moving = (fw !== 0 || st !== 0);
    this.speedF += ((moving ? 1 : 0) - this.speedF) * Math.min(1, dt * 6);

    // collide: lot bounds + prop circles (mower nose counts)
    const R = 0.38;
    let nx = p.x + dx, nz = p.z + dz;
    nx = Math.max(R + 0.15, Math.min(def.lot.w - R - 0.15, nx));
    nz = Math.max(R + 0.15, Math.min(def.lot.h - R - 0.15, nz));
    const noseD = mowing ? this.deckAt : 0.4; // collide with the deck itself, so you can cut right up to a prop
    for (let pass = 0; pass < 2; pass++) {
      for (const c of this.world.colliders) {
        for (const [px, pz, pr] of [[nx, nz, R], [nx + Math.sin(p.yaw) * noseD, nz + Math.cos(p.yaw) * noseD, mowing ? this.gear.swath * 0.5 : 0.2]]) {
          const ddx = px - c.x, ddz = pz - c.z, d = Math.hypot(ddx, ddz), min = c.r + pr;
          if (d < min && d > 0.0001) {
            const push = (min - d);
            nx += (ddx / d) * push; nz += (ddz / d) * push;
            if (this.bumpT <= 0 && moving) { this.bumpT = 0.8; (c.r < 0.2 ? sfx.squeak : sfx.thunk)(); }
          }
        }
      }
      // Rectangular things (the house, its porch) collide as rectangles. Approximating a
      // building with a row of circles gives every circle's radius in EVERY direction, so
      // the ends bulged metres past the walls — an invisible wall you couldn't mow up to.
      for (const r of this.world.rects || []) {
        for (const [px, pz, pr] of [[nx, nz, R], [nx + Math.sin(p.yaw) * noseD, nz + Math.cos(p.yaw) * noseD, mowing ? this.gear.swath * 0.5 : 0.2]]) {
          const qx = Math.max(r.x0, Math.min(r.x1, px)), qz = Math.max(r.z0, Math.min(r.z1, pz));
          const ddx = px - qx, ddz = pz - qz, d = Math.hypot(ddx, ddz);
          if (d > 0.0001 && d < pr) {
            const push = pr - d;
            nx += (ddx / d) * push; nz += (ddz / d) * push;
            if (this.bumpT <= 0 && moving) { this.bumpT = 0.8; sfx.thunk(); }
          }
        }
        // Escape is decided ONCE, from the body, and never per-probe: the body and the
        // mower nose sit at different depths, so each picking its own nearest wall made
        // them shove opposite ways and settle at an equilibrium INSIDE the porch.
        if (nx > r.x0 && nx < r.x1 && nz > r.z0 && nz < r.z1) {
          const dl = nx - r.x0, dr2 = r.x1 - nx, db = nz - r.z0, dt = r.z1 - nz;
          const m = Math.min(dl, dr2, db, dt);
          if (m === dl) nx = r.x0 - R; else if (m === dr2) nx = r.x1 + R;
          else if (m === db) nz = r.z0 - R; else nz = r.z1 + R;
          if (this.bumpT <= 0 && moving) { this.bumpT = 0.8; sfx.thunk(); }
        }
      }
    }
    this.dist += Math.hypot(nx - p.x, nz - p.z);
    p.x = nx; p.z = nz;
    this.bumpT -= dt;

    // stamp
    if (mowing && moving && this.speedF > 0.25) {
      const mx = p.x + Math.sin(p.yaw) * this.deckAt, mz = p.z + Math.cos(p.yaw) * this.deckAt;
      const res = this.grass.stamp(mx, mz, this.gear.swath / 2, 'mow', this.highCut, p.yaw);
      if (res.fresh > 0 || res.spots.length) for (const [sx, szz] of res.spots) this.clips.burst(sx, szz, p.yaw, 2, 1, true); // true = up the chute, into the bag
      // wheel tracks pressed into the lawn
      const side = this.gear.swath * 0.46, cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
      this.grass.stampTrack(mx + cy * side, mz - sy * side);
      this.grass.stampTrack(mx - cy * side, mz + sy * side);
      // the bag breathes in what the deck eats
      if (res.fresh > 0) {
        this.bagFill += res.fresh / this.bagCap;
        if (this.bagFill >= 1) this._dumpBag();
      }
      if (res.blocked > 8 && res.fresh === 0 && this.blockHintT <= 0) {
        this.blockHintT = 5;
        const probe = this.grass.stateAt(mx, mz);
        if (probe.tier >= 4 && !this.highCut && !(probe.meta & (M_WCLUMP | M_TRIM))) this.cb.hint?.("Jungle grass — pop the high-cut lever (F), knock it down, then finish it low.");
        else this.cb.hint?.("The mower can't reach in there — that's trimmer territory (E).");
      }
    }
    if (this.tool === 'trim' && input.act) {
      const tx = p.x + Math.sin(p.yaw) * 1.25, tz = p.z + Math.cos(p.yaw) * 1.25;
      const res = this.grass.stamp(tx, tz, 0.32, 'trim', false, p.yaw);
      this.trimEat += (Math.min(1, res.fresh / 5) - this.trimEat) * 0.25;
      if (res.spots.length) for (const [sx, szz] of res.spots) this.clips.burst(sx, szz, p.yaw, 2, 0.5);
      if (!this.trimming) { this.trimming = true; sfx.trimmerStart(); }
      sfx.trimmerSet(this.trimEat);
    } else if (this.trimming) { this.trimming = false; sfx.trimmerStop(); }
    this.blockHintT -= dt;

    // audio
    if (mowing) sfx.engineSet(this.load, this.speedF);

    // zone completion + mercy (throttled)
    this._zoneT = (this._zoneT || 0) - dt;
    if (this._zoneT <= 0 && !this.done) {
      this._zoneT = 0.25;
      for (let i = 0; i < this.zoneDone.length; i++) {
        if (this.zoneDone[i]) continue;
        if (this.grass.zonePct(i) >= 0.97) {
          this.grass.fillZone(i);
          this.zoneDone[i] = true;
          this.dingQ.push(this.zoneNames[i]);
        }
      }
      this.cb.pct?.(this.grass.pct());
      if (this.zoneDone.length && this.zoneDone.every(Boolean)) this._complete();
      if (this.lbOn) this._refreshLB();
    }
    // dings never stack — 120 ms sacred cooldown
    this.dingT -= dt;
    if (this.dingQ.length && this.dingT <= 0) {
      this.dingT = 0.34;
      const name = this.dingQ.shift();
      sfx.ding(); this.cb.zone?.(name, this.zoneDone.filter(Boolean).length, this.zoneDone.length);
    }

    // discoveries
    for (const d of this.disc) {
      if (d.state === 2) continue;
      const ddx = p.x - d.x, ddz = p.z - d.z, dist = Math.hypot(ddx, ddz);
      if (d.state === 0) {
        d.chimeT -= dt;
        if (dist < 1.6 && d.chimeT <= 0) { d.chimeT = 6; sfx.chime(1 - dist / 1.6); }
        const st = this.grass.stateAt(d.x, d.z);
        if (st.st !== 0 || st.meta === M_NOGRASS) {
          d.state = 1; d.t = 0;
          d.mesh = discoveryMesh(d.kind); d.mesh.position.set(d.x, 0, d.z); this.scene.add(d.mesh);
          if (d.tier === 'junk') { d.state = 2; this._collect(d, true); }
        }
      } else if (d.state === 1) {
        d.t += dt;
        d.mesh.position.y = 0.05 + Math.sin(d.t * 2.2) * 0.045 + 0.06;
        d.mesh.rotation.y += dt * 1.2;
        if (dist < 0.95) { d.state = 2; this._collect(d, false); }
      }
    }

    // critters & world life
    if (this.rabbit) this.rabbit.update(dt, p, this.grass);
    if (this.dog) this.dog.update(dt, p, this.speedF);
    if (this.fireflies) this.fireflies.update(dt);
    if (this._spin === undefined) { this._spin = []; this.world.group.traverse(o => { if (o.userData.spin) this._spin.push(o); }); }
    for (const s of this._spin) s.rotation.z += dt * s.userData.spin;

    // The afternoon moves while you work: the light walks toward gold as the yard comes in.
    // Driven by PROGRESS, not the clock, so the arc always lands however long you take —
    // and it stops well short of 1, because the full golden hour is the finish's to give.
    if (!this.done) this.warmTarget = Math.min(0.55, this.grass.pct() * 0.62);
    // golden hour lerp
    if (this.warm !== this.warmTarget) {
      this.warm += Math.sign(this.warmTarget - this.warm) * Math.min(Math.abs(this.warmTarget - this.warm), dt * 0.14);
      applyLightPreset(this.world, this.scene, this.def.light || 'day', this.warm);
      this.grass.setSun(this.warm);
    }
    // clouds drift like a long afternoon
    if (this.world.clouds) for (const cl of this.world.clouds) { cl.position.x += dt * (cl.userData.spd || 0.35); if (cl.position.x > this.def.lot.w / 2 + 110) cl.position.x = -this.def.lot.w / 2 - 110; }
    // the chute mouth travels with the mower, so clippings already in the air keep homing
    const bl = this.mowerG.userData.bagLocal;
    if (mowing && bl) {
      const fz = this.mowerOff + bl.z;
      this.clips.setBagMouth(p.x + Math.sin(p.yaw) * fz, bl.y, p.z + Math.cos(p.yaw) * fz);
    } else this.clips.noBag();
    this.clips.update(dt);
    this.grass.update(this.time);
  }

  // ---------------- render-frame cosmetics ----------------
  frame(camera, dt) {
    const p = this.p, mow = this.tool === 'mow';
    // the deck's presence: nearby tall grass shies away from a running mower
    this._mowStr = (this._mowStr || 0) + (((mow && this.speedF > 0.25) ? 1 : 0) - (this._mowStr || 0)) * Math.min(1, dt * 8);
    const mfx = p.x + Math.sin(p.yaw) * this.deckAt, mfz = p.z + Math.cos(p.yaw) * this.deckAt;
    this.grass.setMow(mfx, mfz, this._mowStr);
    this.mowerG.visible = mow; this.trimG.visible = !mow;
    if (mow) {
      const d = this.mowerOff;
      this.mowerG.position.set(p.x + Math.sin(p.yaw) * d, 0, p.z + Math.cos(p.yaw) * d);
      this.mowerG.rotation.y = p.yaw;
      const wob = Math.sin(this.time * 26) * 0.01 * this.speedF * (1 + this.load);
      this.mowerG.rotation.z = wob;
      this.mowerG.traverse(o => { if (o.userData.wheel) o.rotation.x += this.speedF * dt * 6 / o.userData.wheel * 0.4; });
      // the bag swells with the cut, jiggles with the engine, and slumps when it tips out
      const bag = this.mowerG.userData.bag;
      if (bag) {
        if (this.bagAnim > 0) this.bagAnim = Math.max(0, this.bagAnim - dt * 2.2);
        this._bagVis += (this.bagFill - this._bagVis) * Math.min(1, dt * (this.bagAnim > 0 ? 7 : 2.5));
        const v = this._bagVis, jig = 1 + Math.sin(this.time * 21) * 0.012 * this.speedF * (0.3 + v);
        bag.scale.set((0.72 + v * 0.34) * jig, (0.55 + v * 0.5) * jig, 0.72 + v * 0.38);
      }
    } else {
      // held to the player's RIGHT (screen-right = (-cos, +sin))
      this.trimG.position.set(p.x + Math.sin(p.yaw) * 0.55 - Math.cos(p.yaw) * 0.25, 1.0, p.z + Math.cos(p.yaw) * 0.55 + Math.sin(p.yaw) * 0.25);
      this.trimG.rotation.y = p.yaw;
      this.trimG.traverse(o => { if (o.userData.line) o.rotation.y += dt * (this.trimming ? 55 : 4); });
    }
    // the street and the yard's own life live on the render frame only — headless jobs
    // never run a car or an insect
    if (this.world.street) this.world.street.update(dt, sfx);
    if (this.world.life) {
      this.world.life.update(dt);
      this.world.life.setWarm(this.warm);
      if (mow && this.speedF > 0.25) this.world.life.scatter(mfx, mfz, 2.0);
    }
    // last blade pulse
    this.lbT += dt;
    for (const s of this.lbSprites) { const k = 0.8 + Math.sin(this.lbT * 3 + s.userData.ph) * 0.25; s.scale.set(k, k, 1); }
  }
  applyWarmNow() { this.warm = this.warmTarget; applyLightPreset(this.world, this.scene, this.def.light || 'day', this.warm); this.grass.setSun(this.warm); }
  camPos() {
    const p = this.p, bobA = this.gear.bob;
    const bob = Math.sin(this.time * 10.5) * 0.028 * this.speedF * bobA;
    return { x: p.x, y: this.gear.cam + bob, z: p.z, yaw: p.yaw, pitch: p.pitch };
  }

  // ---------------- actions ----------------
  swapTool() { if (this.gearKey === 'rider') { this.cb.hint?.("Hop-off trimming comes free with the rider — just walk the edges after."); } this.tool = this.tool === 'mow' ? 'trim' : 'mow'; if (this.tool === 'trim') { sfx.engineStop(); } else { sfx.engineStart(this.gearKey); if (this.trimming) { this.trimming = false; sfx.trimmerStop(); } } this.cb.tool?.(this.tool, this.highCut); sfx.click(); }
  lever() { if (this.tool !== 'mow') return; this.highCut = !this.highCut; this.cb.tool?.(this.tool, this.highCut); sfx.click(); this.cb.hint?.(this.highCut ? 'High-cut lever UP — deck raised for jungle passes.' : 'Deck low — finish height.'); }
  toggleLB() {
    this.lbOn = !this.lbOn;
    if (this.lbOn) this._refreshLB(); else this._clearLB();
    return this.lbOn;
  }
  _refreshLB() {
    this._clearLB();
    if (this.grass.pct() < 0.5) return;
    for (const c of this.grass.remaining()) {
      const s = new THREE.Sprite(this.lbMat);
      s.position.set(c.x, 0.5, c.z); s.userData.ph = Math.random() * 6.28;
      this.scene.add(s); this.lbSprites.push(s);
    }
  }
  _clearLB() { for (const s of this.lbSprites) s.removeFromParent(); this.lbSprites = []; }
  _dumpBag() {
    // no spray here on purpose: a dumped pile is exactly the litter the bag exists to prevent.
    // the bag deflates (frame()) and thumps — the fiction is that it went to the curb.
    this.bagFill = 0; this.bagsEmptied++; this.bagAnim = 1;
    sfx.bagDump();
    this.cb.bagDump?.(this.bagsEmptied);
  }
  _collect(d, junk) {
    this.found.push(d.i);
    if (junk) { sfx.plink(); }
    else if (d.tier === 'keep') sfx.treasure();
    else sfx.treasure();
    if (d.mesh && !junk) { const m = d.mesh; let t = 0; const iv = setInterval(() => { t += 0.05; m.position.y += 0.05; m.scale.setScalar(Math.max(0.01, 1 - t * 1.6)); if (t > 0.6) { clearInterval(iv); m.removeFromParent(); } }, 50); }
    else if (d.mesh) { d.mesh.removeFromParent(); }
    this.cb.discover?.(d);
  }
  _complete() {
    if (this.done) return;
    this.done = true;
    sfx.engineStop(); if (this.trimming) { this.trimming = false; sfx.trimmerStop(); }
    sfx.completeChord();
    this.warmTarget = 1;
    sfx.ambStart('night');
    this._clearLB();
    this.cb.complete?.({
      time: this.time, dist: this.dist,
      found: this.found.length, totalDisc: this.disc.length,
      keeps: this.disc.filter(d => d.tier === 'keep' && d.state === 2).length,
    });
  }

  // ---------------- save / resume ----------------
  snapshot() {
    return {
      cuts: this.grass.snapshotCuts(),
      p: { x: this.p.x, z: this.p.z, yaw: this.p.yaw },
      time: this.time, dist: this.dist,
      // copies, not the live arrays — restore() appends to this.found, so an aliased
      // snapshot iterates an array it is growing (hangs until the length overflows)
      found: this.found.slice(), zoneDone: this.zoneDone.slice(),
      tool: this.tool, highCut: this.highCut,
      bag: this.bagFill, bags: this.bagsEmptied,
    };
  }
  restore(snap) {
    if (!snap) return;
    this.grass.restoreCuts(snap.cuts);
    this.p.x = snap.p.x; this.p.z = snap.p.z; this.p.yaw = snap.p.yaw;
    this.time = snap.time || 0; this.dist = snap.dist || 0;
    this.zoneDone = (snap.zoneDone || this.zoneDone).slice();
    this.tool = snap.tool || 'mow'; this.highCut = !!snap.highCut;
    this.bagFill = snap.bag || 0; this.bagsEmptied = snap.bags || 0; this._bagVis = this.bagFill;
    this.found = []; // rebuild from the snapshot rather than appending to whatever was live
    for (const i of snap.found || []) {
      const d = this.disc.find(dd => dd.i === i);
      if (d) { d.state = 2; this.found.push(i); }
    }
    this.cb.pct?.(this.grass.pct());
  }
  dispose() {
    sfx.engineStop(); sfx.trimmerStop();
    this._clearLB();
    this.grass.dispose();
    this.scene.clear();
  }
}

// ---------------- lighting presets + golden hour ----------------
function applyLightPreset(world, scene, kind, warm) {
  const lerpC = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  // porch-light physics: windows warm up as the day goes gold (always lit at night)
  if (world.windows && world.windows.length) {
    const glow = kind === 'night' ? 0.85 : kind === 'weird' ? 0.35 : Math.max(0, (warm - 0.3) / 0.7) * 0.8;
    for (const wm of world.windows) wm.emissive.setRGB(0.95 * glow, 0.72 * glow, 0.34 * glow);
  }
  if (world.sunDisc) {
    world.sunDisc.material.color.set(lerpC(0xfff6d8, 0xffb864, warm));
    // the sun visibly sinks as the afternoon goes — same arc the directional light walks
    const LW = world.sun.target.position.x * 2, LH = world.sun.target.position.z * 2;
    world.sunDisc.position.set(LW / 2 + 62, 52 - warm * 26, LH / 2 - 66 + warm * 12);
    world.sunDisc.lookAt(LW / 2, 0, LH / 2);
    world.sunDisc.scale.setScalar(1 + warm * 0.35);
    if (kind === 'night') world.sunDisc.visible = false;
  }
  if (kind === 'night') {
    world.sun.intensity = 0.5; world.sun.color.set(0x9db3d8);
    world.hemi.intensity = 0.4; world.hemi.color.set(0x39466b); world.hemi.groundColor.set(0x1c2416);
    world.sky.material.color.set(0x2a3555);
    scene.fog.color.set(0x1c2438); scene.fog.near = 30; scene.fog.far = 90;
  } else if (kind === 'dusk') {
    world.sun.intensity = 1.0; world.sun.color.set(lerpC(0xffb36b, 0xff9a4d, warm));
    world.hemi.intensity = 0.6; world.hemi.color.set(0xc9a9d8);
    world.sky.material.color.set(0xc79ac2);
    scene.fog.color.set(0xd8a8b8);
  } else if (kind === 'weird') {
    world.sun.intensity = 1.2; world.sun.color.set(0xc8ffd8);
    world.hemi.intensity = 0.7; world.hemi.color.set(0x8adfc0); world.hemi.groundColor.set(0x2a4a3a);
    world.sky.material.color.set(0x5a9a80);
    scene.fog.color.set(0x7ab89a); scene.fog.near = 25; scene.fog.far = 70;
  } else {
    // day → golden hour with `warm`
    world.sun.intensity = 1.65 - warm * 0.35;
    world.sun.color.set(lerpC(0xfff2dc, 0xffc87a, warm));
    world.hemi.intensity = 0.85 - warm * 0.25;
    world.hemi.color.set(lerpC(0xd6ecf5, 0xf5d9b8, warm));
    world.sky.material.color.set(lerpC(0xffffff, 0xffcf9a, warm * 0.85));
    scene.fog.color.set(lerpC(0xcfe3e0, 0xf0c894, warm));
    const W = world.sun.target.position.x * 2, H = world.sun.target.position.z * 2;
    world.sun.position.set(W / 2 + 14, 22 - warm * 12, H / 2 - 10 + warm * 16);
  }
}

// ---------------- critters ----------------
function makeRabbit(scene, def, grass) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshLambertMaterial({ color: 0xb8a58e })); body.position.y = 0.14; body.scale.z = 1.35; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshLambertMaterial({ color: 0xb8a58e })); head.position.set(0, 0.26, 0.16); g.add(head);
  for (const sx of [-0.035, 0.035]) { const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.12, 3, 6), new THREE.MeshLambertMaterial({ color: 0xb8a58e })); ear.position.set(sx, 0.4, 0.14); g.add(ear); }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshLambertMaterial({ color: 0xf2ead8 })); tail.position.set(0, 0.16, -0.2); g.add(tail);
  g.visible = false; scene.add(g);
  const r = { g, on: false, x: 0, z: 0, t: 8 + Math.random() * 10, hopT: 0, dir: 0, flee: false };
  r.update = (dt, p, gr) => {
    if (!r.on) {
      r.t -= dt;
      if (r.t <= 0) {
        // spawn somewhere tall & uncut, away from the player
        const rng = mulberry((Date.now() / 1000 | 0) % 100000);
        for (let tries = 0; tries < 20; tries++) {
          const x = 2 + rng() * (def.lot.w - 4), z = 2 + rng() * (def.lot.h - 4);
          const st = gr.stateAt(x, z);
          if (st.st === 0 && st.tier >= 2 && Math.hypot(x - p.x, z - p.z) > 7) { r.on = true; r.x = x; r.z = z; r.flee = false; g.visible = true; break; }
        }
        if (!r.on) r.t = 6;
      }
      return;
    }
    const d = Math.hypot(r.x - p.x, r.z - p.z);
    if (!r.flee && d < 3.2) { r.flee = true; r.dir = Math.atan2(r.x - p.x, r.z - p.z); }
    r.hopT -= dt;
    if (r.flee) {
      r.x += Math.sin(r.dir) * dt * 3.6; r.z += Math.cos(r.dir) * dt * 3.6;
      g.position.y = Math.abs(Math.sin(performance.now() * 0.012)) * 0.14;
      if (r.x < 0.5 || r.z < 0.5 || r.x > def.lot.w - 0.5 || r.z > def.lot.h - 0.5) { r.on = false; g.visible = false; r.t = 30 + Math.random() * 25; }
    } else if (r.hopT <= 0) {
      r.hopT = 1.2 + Math.random() * 2.4;
      r.dir = Math.random() * 6.28;
      r.x += Math.sin(r.dir) * 0.5; r.z += Math.cos(r.dir) * 0.5;
      r.x = Math.max(1, Math.min(def.lot.w - 1, r.x)); r.z = Math.max(1, Math.min(def.lot.h - 1, r.z));
    }
    g.position.x = r.x; g.position.z = r.z; g.rotation.y = r.dir;
  };
  return r;
}
function makeDog(scene, def) {
  const g = new THREE.Group();
  const c = 0xc9944a;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.34, 4, 8), new THREE.MeshLambertMaterial({ color: c })); body.rotation.x = Math.PI / 2; body.position.y = 0.3; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color: c })); head.position.set(0, 0.45, 0.3); g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.12), new THREE.MeshLambertMaterial({ color: 0x8a6432 })); snout.position.set(0, 0.41, 0.42); g.add(snout);
  for (const sx of [-0.09, 0.09]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.03), new THREE.MeshLambertMaterial({ color: 0x8a6432 })); ear.position.set(sx, 0.55, 0.28); ear.rotation.z = sx * 3; g.add(ear); }
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.2, 3, 6), new THREE.MeshLambertMaterial({ color: c })); tail.position.set(0, 0.38, -0.32); tail.rotation.x = -0.9; g.add(tail);
  for (const [sx, szz] of [[-0.1, 0.14], [0.1, 0.14], [-0.1, -0.14], [0.1, -0.14]]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.16, 3, 6), new THREE.MeshLambertMaterial({ color: c })); leg.position.set(sx, 0.12, szz); g.add(leg); }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  // start at the doghouse if there is one
  const dh = (def.props || []).find(p => p.k === 'doghouse');
  const home = dh ? { x: dh.x, z: dh.z } : { x: def.lot.w - 3, z: def.lot.h - 3 };
  g.position.set(home.x + 1, 0, home.z);
  scene.add(g);
  const d = { g, mode: 'rest', t: 0, x: home.x + 1, z: home.z, tw: tail };
  d.update = (dt, p, speedF) => {
    d.t += dt;
    const dist = Math.hypot(d.x - p.x, d.z - p.z);
    d.tw.rotation.z = Math.sin(d.t * (d.mode === 'escort' ? 18 : 6)) * 0.5;
    if (d.mode === 'rest') {
      if (speedF > 0.5 && dist < 8) d.mode = 'escort';
    } else {
      // run alongside — Biscuit thinks you two are a team now
      const side = Math.sin(d.t * 0.3) > 0 ? 1 : -1;
      const tx = p.x + Math.cos(p.yaw) * 1.7 * side + Math.sin(p.yaw) * 0.6;
      const tz = p.z - Math.sin(p.yaw) * 1.7 * side + Math.cos(p.yaw) * 0.6;
      const ddx = tx - d.x, ddz = tz - d.z, dd = Math.hypot(ddx, ddz);
      if (dd > 0.1) {
        const sp = Math.min(3.4, dd * 2.4);
        d.x += ddx / dd * sp * dt; d.z += ddz / dd * sp * dt;
        d.g.rotation.y = Math.atan2(ddx, ddz);
        d.g.position.y = Math.abs(Math.sin(d.t * 11)) * 0.09 * Math.min(1, dd);
      }
      if (speedF < 0.2 && dist > 6) { d.mode = 'rest'; }
      d.x = Math.max(0.8, Math.min(p.x + 30, d.x)); d.z = Math.max(0.8, Math.min(p.z + 30, d.z));
    }
    d.g.position.x = d.x; d.g.position.z = d.z;
  };
  return d;
}
function makeFireflies(scene, def) {
  const n = 60, pos = new Float32Array(n * 3), ph = new Float32Array(n);
  const rng = mulberry(def.seed || 9);
  for (let i = 0; i < n; i++) { pos[i * 3] = rng() * def.lot.w; pos[i * 3 + 1] = 0.4 + rng() * 1.4; pos[i * 3 + 2] = rng() * def.lot.h; ph[i] = rng() * 6.28; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xd8f090, size: 0.09, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: dotTex(), alphaTest: 0.1 });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
  const f = { pts, t: 0 };
  f.update = (dt) => {
    f.t += dt;
    for (let i = 0; i < n; i++) {
      pos[i * 3] += Math.sin(f.t * 0.5 + ph[i]) * dt * 0.3;
      pos[i * 3 + 1] += Math.cos(f.t * 0.4 + ph[i] * 2) * dt * 0.15;
      pos[i * 3 + 2] += Math.cos(f.t * 0.45 + ph[i]) * dt * 0.3;
    }
    m.opacity = 0.5 + Math.sin(f.t * 2) * 0.35;
    g.attributes.position.needsUpdate = true;
  };
  return f;
}
function makeGlowTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,250,200,0.95)'); g.addColorStop(0.4, 'rgba(255,240,160,0.4)'); g.addColorStop(1, 'rgba(255,240,160,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); return t;
}
