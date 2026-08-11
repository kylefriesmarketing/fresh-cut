// FRESH CUT — life.js
// The small living things in the yard itself: insects over the uncut grass, pollen in the
// light, and the wind moving everything that should move.
//
// View-only, like street.js — ticked from Game.frame(), never from the sim, so a headless
// job never runs an insect. Nothing here touches the mask, the player or collision.
import * as THREE from 'three';
import { mat, box, sph } from './props.js';
import { mulberry, CUT } from './grass.js';

// insects fly to a wander target, then pick a new one; they scatter from a running deck
function makeInsect(kind, rng) {
  const g = new THREE.Group();
  const body = kind === 'bee'
    ? sph(0.045, 0xe8b53a, 0, 0, 0, 6)
    : sph(0.035, [0xe4763f, 0xd8d2e8, 0xf0c94a][Math.floor(rng() * 3)], 0, 0, 0, 6);
  g.add(body);
  if (kind === 'bee') { g.add(box(0.05, 0.03, 0.03, 0x2b2b2b, -0.02, 0, 0)); }
  const wings = [];
  for (const s of [-1, 1]) {
    const w = kind === 'bee'
      ? box(0.05, 0.005, 0.07, 0xdfe9f2, 0, 0.02, s * 0.04)
      : box(0.11, 0.006, 0.13, body.material.color.getHex(), 0, 0.015, s * 0.07);
    const pv = new THREE.Group(); pv.add(w); g.add(pv); wings.push({ pv, s });
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });
  g.userData.wings = wings;
  return g;
}

export function buildLife(scene, def, world, grass, quality) {
  const root = new THREE.Group(); world.group.add(root);
  const rng = mulberry((def.seed || 42) * 11 + 5);
  const W = def.lot.w, H = def.lot.h;
  const low = quality === 'low';
  const night = def.light === 'night';

  // ---- insects over the uncut grass ----
  const bugs = [];
  const nBugs = low ? 0 : night ? 0 : (quality === 'med' ? 5 : 9);
  for (let i = 0; i < nBugs; i++) {
    const kind = rng() < 0.4 ? 'bee' : 'fly';
    const g = makeInsect(kind, rng);
    const x = 2 + rng() * (W - 4), z = 2 + rng() * (H - 4);
    g.position.set(x, 0.35 + rng() * 0.4, z);
    root.add(g);
    bugs.push({ g, kind, x, z, y: g.position.y, tx: x, tz: z, ty: g.position.y, spd: 0.5 + rng() * 0.7, ph: rng() * 6.28, retarget: rng() * 3 });
  }

  // ---- pollen / seed fluff drifting in the light ----
  let pollen = null;
  const nP = low ? 0 : (quality === 'med' ? 90 : 190);
  if (nP) {
    const pos = new Float32Array(nP * 3), vel = new Float32Array(nP * 2);
    for (let i = 0; i < nP; i++) {
      pos[i * 3] = rng() * W; pos[i * 3 + 1] = 0.2 + rng() * 2.6; pos[i * 3 + 2] = rng() * H;
      vel[i * 2] = 0.05 + rng() * 0.14; vel[i * 2 + 1] = rng() * 6.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color: 0xfff2c8, size: 0.045, sizeAttenuation: true, transparent: true,
      opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, m); pts.frustumCulled = false; root.add(pts);
    pollen = { pts, pos, vel, geo, m, n: nP };
  }

  // ---- everything that should move in the wind ----
  // props register their canopies here; each keeps its rest rotation so sway composes
  const sway = [];
  const collect = (obj, amp) => {
    obj.updateMatrixWorld(true);
    obj.traverse(o => {
      if (!o.isMesh || o.userData.noSway) return;
      const g = o.geometry;
      if (!g.boundingSphere) g.computeBoundingSphere();
      // only leafy things: rounded, above the ground, not the trunk
      if (g.type !== 'SphereGeometry' || o.position.y < 0.35) return;
      sway.push({ o, rx: o.rotation.x, rz: o.rotation.z, amp: amp * (0.5 + Math.min(1, g.boundingSphere.radius)) , ph: rng() * 6.28 });
    });
  };
  for (const g of world.swayRoots || []) collect(g, 0.045);

  let t = 0;
  return {
    group: root,
    _dbg: { bugs, pollen, sway },
    update(dt, camY) {
      t += dt;
      // wind: the same gust shape the grass shader uses, so the yard breathes together
      const gust = Math.max(0, Math.sin(t * 0.55)) + 0.5 * Math.max(0, Math.sin(t * 0.23));
      for (const s of sway) {
        const a = Math.sin(t * 1.1 + s.ph) * s.amp * (1 + gust * 1.1);
        s.o.rotation.z = s.rz + a;
        s.o.rotation.x = s.rx + a * 0.4;
      }
      for (const b of bugs) {
        b.retarget -= dt;
        if (b.retarget <= 0) {
          b.retarget = 1.5 + Math.random() * 3;
          // insects prefer the parts that are still long — that's where the flowers are
          let bx = 2 + Math.random() * (W - 4), bz = 2 + Math.random() * (H - 4);
          for (let k = 0; k < 6; k++) {
            const cx = 2 + Math.random() * (W - 4), cz = 2 + Math.random() * (H - 4);
            if (grass.stateAt(cx, cz).st !== CUT) { bx = cx; bz = cz; break; }
          }
          b.tx = bx; b.tz = bz; b.ty = 0.3 + Math.random() * (b.kind === 'bee' ? 0.35 : 0.7);
        }
        const dx = b.tx - b.x, dz = b.tz - b.z, dy = b.ty - b.y;
        const d = Math.hypot(dx, dz) || 1;
        b.x += (dx / d) * b.spd * dt; b.z += (dz / d) * b.spd * dt; b.y += dy * dt * 1.2;
        b.g.position.set(b.x, b.y + Math.sin(t * 6 + b.ph) * 0.03, b.z);
        b.g.rotation.y = Math.atan2(dx, dz);
        const f = Math.sin(t * (b.kind === 'bee' ? 46 : 17) + b.ph);
        for (const w of b.g.userData.wings) w.pv.rotation.x = f * (b.kind === 'bee' ? 0.5 : 0.75) * w.s;
      }
      if (pollen) {
        const { pos, vel, n } = pollen;
        for (let i = 0; i < n; i++) {
          pos[i * 3] += (vel[i * 2] * (0.6 + gust * 0.5)) * dt;
          pos[i * 3 + 1] += Math.sin(t * 0.7 + vel[i * 2 + 1]) * dt * 0.09;
          pos[i * 3 + 2] += Math.cos(t * 0.5 + vel[i * 2 + 1]) * dt * 0.06;
          if (pos[i * 3] > W + 1) { pos[i * 3] = -1; pos[i * 3 + 2] = Math.random() * H; }
          if (pos[i * 3 + 1] < 0.1) pos[i * 3 + 1] = 0.1;
          if (pos[i * 3 + 1] > 3.2) pos[i * 3 + 1] = 3.2;
        }
        pollen.geo.attributes.position.needsUpdate = true;
      }
    },
    // golden hour is when motes really catch — driven from the same warm the grade uses
    setWarm(warm) { if (pollen) pollen.m.opacity = 0.34 + warm * 0.5; },
    scatter(x, z, r) {
      for (const b of bugs) {
        const d = Math.hypot(b.x - x, b.z - z);
        if (d < r) {
          const a = Math.atan2(b.x - x, b.z - z);
          b.tx = b.x + Math.sin(a) * 4; b.tz = b.z + Math.cos(a) * 4;
          b.ty = 0.8 + Math.random() * 0.6; b.retarget = 1.2 + Math.random();
        }
      }
    },
  };
}
