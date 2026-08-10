// FRESH CUT — street.js
// The world beyond the fence: the neighbourhood, and the afternoon going on inside it.
//
// EVERYTHING here is view-only. It never touches the cut mask, the player, collision or
// the save, and nothing on the street is reachable. Its update runs from Game.frame(),
// so headless jobs (which only call Game.update) never pay for a single car.
//
// Layout along -Z, measured from the lot's front edge at z = 0:
//   -0.3 … -1.9  sidewalk      (people walk here — closest to the player, so most read)
//   -1.9 … -6.9  road          (two lanes)
//   -6.9 … -9.2  neighbour front lawns + driveways
//   -9.2         neighbour house fronts
import * as THREE from 'three';
import { mat, box, cyl, sph, cone, gableRoof } from './props.js';
import { mulberry } from './grass.js';

const WALK_Z = -1.1;
const LANE_NEAR = -3.2, LANE_FAR = -5.6;   // near lane drives +x, far lane drives -x
const DRIVE_Z = -8.0, HOUSE_Z = -11.5, HOUSE_D = 4.6, HOUSE_FRONT = HOUSE_Z + HOUSE_D / 2;

const CAR_PAINT = [0xb8443a, 0x2f6ea5, 0xe8e3d8, 0x3b4046, 0x4f7a52, 0xc9a13f, 0x8d6a9a, 0xd8823f, 0x6f8fa8];

// The sun shines from behind the houses across the street (it is aimed at the lot from
// +x/-z), so every street-facing surface out there gets ambient only and reads as a grey
// slab. Rather than move the sun — the yard's whole look hangs off it — background pieces
// carry a little emissive of their own colour, which lifts the shaded side without
// flattening it. Meshes tagged keepMat are skipped: window/lamp materials belong to
// world.windows and applyLightPreset drives their emissive at golden hour.
const LITS = {};
function lit(hex, k) {
  const key = hex + '|' + k;
  if (!LITS[key]) LITS[key] = new THREE.MeshLambertMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(k) });
  return LITS[key];
}
function brighten(g, k = 0.3) {
  g.traverse(o => {
    if (!o.isMesh || o.userData.keepMat || !o.material || !o.material.color) return;
    o.material = lit(o.material.color.getHex(), k);
  });
}
const SHIRTS = [0xc4553f, 0x4a7fa5, 0xd8c05a, 0x5f8a5f, 0xb0736f, 0x6a6f9a, 0xd9d3c4];
const PANTS = [0x3c4657, 0x5a4a3c, 0x2f3a42, 0x6b6255];

// cars are built pointing +X.  rotation.y: 0 = +X, PI = -X, PI/2 = facing -Z (into a drive)
function wheels(g, xs, halfW = 0.82, r = 0.32) {
  const out = [];
  for (const x of xs) for (const z of [-halfW, halfW]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.2, 9), mat(0x1b1b1e));
    w.rotation.x = Math.PI / 2; w.position.set(x, r, z); g.add(w); out.push(w);
  }
  return out;
}
function lamps(g, xFront, xBack, halfW, y) {
  for (const z of [-halfW, halfW]) {
    g.add(box(0.1, 0.14, 0.22, 0xfff3cf, xFront, y, z));
    g.add(box(0.08, 0.13, 0.2, 0x8e2f2a, xBack, y, z));
  }
}
export function makeCar(kind, color) {
  const g = new THREE.Group();
  const glass = 0x39505c;
  if (kind === 'bus') {
    g.add(box(8.4, 1.5, 2.3, 0xe8b830, 0, 1.35, 0));
    g.add(box(8.0, 0.5, 2.32, glass, -0.1, 2.0, 0));
    g.add(box(8.4, 0.35, 2.32, 0x2b2b2b, 0, 0.75, 0));
    g.add(box(0.5, 1.1, 2.2, 0xe8b830, 4.1, 1.5, 0));
    g.userData.wheels = wheels(g, [-2.9, 3.0], 1.08, 0.44);
    lamps(g, 4.32, -4.22, 0.9, 1.0);
  } else if (kind === 'icecream') {
    g.add(box(4.6, 1.5, 1.95, 0xf4f1e6, 0, 1.15, 0));
    g.add(box(2.0, 0.62, 1.98, glass, 1.4, 1.62, 0));
    g.add(box(2.2, 0.7, 2.0, 0xef9ec0, -0.7, 1.35, 0));   // the painted panel
    g.add(box(2.2, 0.16, 2.0, 0x63c3d8, -0.7, 0.95, 0));
    const c = cone(0.34, 0.8, 0xf6d9a0, -0.6, 2.3, 0, 10); g.add(c);
    g.add(sph(0.3, 0xf2a0b4, -0.6, 2.72, 0, 8));
    g.userData.wheels = wheels(g, [-1.45, 1.5], 0.9, 0.34);
    lamps(g, 2.36, -2.36, 0.78, 0.85);
  } else if (kind === 'mail') {
    g.add(box(4.2, 1.35, 1.9, 0xf1efe6, 0, 1.05, 0));
    g.add(box(1.9, 0.58, 1.92, glass, 1.2, 1.5, 0));
    g.add(box(3.4, 0.22, 1.94, 0x2f5b9a, -0.3, 1.0, 0));
    g.userData.wheels = wheels(g, [-1.35, 1.4], 0.87, 0.33);
    lamps(g, 2.16, -2.16, 0.76, 0.8);
  } else if (kind === 'pickup') {
    g.add(box(4.7, 0.6, 1.86, color, 0, 0.72, 0));
    g.add(box(1.9, 0.66, 1.72, color, 0.75, 1.32, 0));
    g.add(box(1.7, 0.42, 1.74, glass, 0.75, 1.5, 0));
    for (const z of [-0.9, 0.9]) g.add(box(2.3, 0.42, 0.09, color, -1.35, 1.2, z)); // bed sides
    g.add(box(0.1, 0.42, 1.8, color, -2.3, 1.2, 0));
    g.userData.wheels = wheels(g, [-1.5, 1.5], 0.86, 0.36);
    lamps(g, 2.4, -2.4, 0.76, 0.72);
  } else if (kind === 'van') {
    g.add(box(4.5, 1.45, 1.92, color, 0, 1.1, 0));
    g.add(box(1.5, 0.6, 1.94, glass, 1.42, 1.55, 0));
    g.add(box(2.2, 0.5, 1.94, glass, -0.6, 1.5, 0));
    g.userData.wheels = wheels(g, [-1.45, 1.5], 0.88, 0.34);
    lamps(g, 2.3, -2.3, 0.8, 0.85);
  } else { // sedan
    g.add(box(4.25, 0.62, 1.8, color, 0, 0.68, 0));
    g.add(box(2.15, 0.6, 1.66, color, -0.2, 1.26, 0));
    g.add(box(1.95, 0.4, 1.68, glass, -0.2, 1.36, 0));
    g.userData.wheels = wheels(g, [-1.32, 1.36], 0.82, 0.32);
    lamps(g, 2.16, -2.16, 0.74, 0.66);
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });   // background: keep the shadow map for the yard
  brighten(g, 0.26);
  return g;
}

// people are built facing +X too, so they share the traffic maths
function makePerson(shirt, pants) {
  const g = new THREE.Group();
  const legs = [], arms = [];
  for (const z of [-0.1, 0.1]) {
    const l = box(0.14, 0.46, 0.15, pants, 0, -0.23, z); l.position.set(0, 0.46, z);
    const pv = new THREE.Group(); pv.position.set(0, 0.46, z); l.position.set(0, -0.23, 0); pv.add(l); g.add(pv); legs.push(pv);
    const a = box(0.1, 0.42, 0.11, shirt, 0, -0.21, 0);
    const av = new THREE.Group(); av.position.set(0, 1.16, z * 2.0); av.add(a); g.add(av); arms.push(av);
  }
  g.add(box(0.34, 0.5, 0.22, shirt, 0, 0.94, 0));
  g.add(sph(0.13, 0xe0b48c, 0, 1.32, 0, 8));
  g.userData.legs = legs; g.userData.arms = arms;
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });
  brighten(g, 0.26);
  return g;
}
function makeDog() {
  const g = new THREE.Group(), c = 0xa9803f;
  const b = cyl(0.11, 0.11, 0.42, c, 0, 0.34, 0, 7); b.rotation.z = Math.PI / 2; g.add(b);
  g.add(sph(0.1, c, 0.26, 0.44, 0, 7));
  g.add(box(0.1, 0.06, 0.07, 0x6b4f27, 0.36, 0.42, 0));
  const t = cyl(0.02, 0.02, 0.2, c, -0.26, 0.44, 0, 5); t.rotation.z = 0.7; g.add(t);
  const legs = [];
  for (const x of [-0.14, 0.14]) for (const z of [-0.08, 0.08]) {
    const pv = new THREE.Group(); pv.position.set(x, 0.28, z);
    pv.add(box(0.05, 0.28, 0.05, c, 0, -0.14, 0)); g.add(pv); legs.push(pv);
  }
  g.userData.legs = legs;
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });
  brighten(g, 0.26);
  return g;
}
function makeBike(shirt, pants) {
  const g = new THREE.Group();
  const wh = [];
  for (const x of [-0.52, 0.52]) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 5, 14), mat(0x24262a));
    w.position.set(x, 0.32, 0); w.rotation.y = Math.PI / 2; g.add(w); wh.push(w);
  }
  g.add(box(1.0, 0.05, 0.05, 0xc23b3b, 0, 0.55, 0));
  g.add(box(0.05, 0.34, 0.05, 0xc23b3b, 0.42, 0.55, 0));
  g.add(box(0.06, 0.05, 0.44, 0x2c2c2c, 0.5, 0.86, 0));   // bars
  const rider = makePerson(shirt, pants);
  rider.position.set(-0.1, 0.5, 0); rider.scale.setScalar(0.86);
  rider.userData.legs.forEach(l => l.rotation.x = 0);
  g.add(rider);
  g.userData.wheels = wh; g.userData.rider = rider;
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });
  brighten(g, 0.26);
  return g;
}

// a neighbour's house: body, roof, porch, windows that light up, drive, mailbox, planting
function makeNeighbourHouse(rng, world) {
  const g = new THREE.Group();
  const w = 5.2 + rng() * 3.2, h = 2.9 + rng() * 1.1;
  const bodyC = [0xd8cbb4, 0xc9d4dd, 0xd4c2c2, 0xcfd8c0, 0xe0d3bb, 0xbfc9c4][Math.floor(rng() * 6)];
  const roofC = [0x6b5844, 0x574c46, 0x6d5f52, 0x4f5a5e][Math.floor(rng() * 4)];
  const trimC = 0xf2ead8;
  g.add(box(w, h, HOUSE_D, bodyC, 0, h / 2, 0));
  const roof = gableRoof(w, HOUSE_D, 1.5 + rng() * 0.6, roofC, bodyC); roof.position.y = h; g.add(roof);
  if (rng() < 0.6) g.add(box(0.5, 1.2, 0.5, 0x9a7360, w * 0.3, h + 0.6, 0));   // chimney

  // windows share one material per house so they warm together at golden hour
  const winMat = new THREE.MeshLambertMaterial({ color: 0x8fb6c9 });
  world.windows.push(winMat);
  const front = HOUSE_D / 2 + 0.03;
  for (const sx of [-w * 0.28, w * 0.28]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.06), winMat);
    win.position.set(sx, 1.7, front); win.userData.keepMat = true; g.add(win);
    for (const s2 of [-0.58, 0.58]) g.add(box(0.14, 1.0, 0.05, roofC, sx + s2, 1.7, front));
    g.add(box(1.04, 0.07, 0.12, trimC, sx, 1.14, front + 0.02));
  }
  if (h > 3.4) { const up = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.06), winMat); up.position.set(0, h - 0.5, front); up.userData.keepMat = true; g.add(up); }
  // door + porch
  g.add(box(0.95, 1.95, 0.08, [0x7a4a33, 0x3f5d55, 0x8a3f3f, 0x415a78][Math.floor(rng() * 4)], 0, 1.0, front));
  const porch = box(w * 0.5, 0.14, 1.5, 0xb59d78, 0, 0.07, front + 0.75); g.add(porch);
  for (const sx of [-w * 0.22, w * 0.22]) g.add(cyl(0.07, 0.07, 2.1, trimC, sx, 1.05, front + 1.4, 7));
  g.add(box(w * 0.54, 0.1, 1.7, roofC, 0, 2.15, front + 0.8));
  // porch light — same warm-up machinery as the windows
  const lampMat = new THREE.MeshLambertMaterial({ color: 0xf6edd2 });
  world.windows.push(lampMat);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 6), lampMat);
  lamp.position.set(0.72, 1.95, front + 0.08); lamp.userData.keepMat = true; g.add(lamp);
  // shrubs along the front
  for (let i = 0; i < 3; i++) g.add(sph(0.32 + rng() * 0.18, 0x4d7340, -w * 0.34 + i * w * 0.34, 0.28, front + 0.35, 7));
  g.traverse(m => { if (m.isMesh) m.castShadow = false; });
  brighten(g, 0.32);
  return { g, w, porchZ: HOUSE_Z + front + 0.75, doorX: 0 };
}

export function buildStreet(scene, def, world, quality) {
  const root = new THREE.Group(); world.group.add(root);
  const W = def.lot.w;
  const rng = mulberry((def.seed || 42) * 7 + 13);
  const night = def.light === 'night' || def.light === 'weird';
  // the finale is written to be quiet; night streets are sleepy. Anything else is a lived-in afternoon.
  const quiet = !!def.finale || def.street === false;
  const gapRange = def.street === false ? null : quiet ? [30, 55] : night ? [13, 26] : [5.5, 11.5];
  const X0 = -16, X1 = W + 16;                 // spawn / despawn line either side

  // ---- the houses across the street, each with a drive and a mailbox ----
  const drives = [];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const hx = -10 + i * (W + 20) / n + rng() * 2.2;
    const built = makeNeighbourHouse(rng, world);
    built.g.position.set(hx, 0, HOUSE_Z);
    root.add(built.g);
    // driveway from the kerb up to the house, offset to one side of the door
    const dx = hx + (rng() < 0.5 ? -1 : 1) * (built.w * 0.32 + 0.4);
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.0), mat(0xb9b2a4));
    drive.rotation.x = -Math.PI / 2; drive.position.set(dx, 0.005, -7.9); root.add(drive);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.2), mat(0xc4bdae));
    path.rotation.x = -Math.PI / 2; path.position.set(hx, 0.005, HOUSE_FRONT + HOUSE_Z + 1.6); root.add(path);
    const mb = new THREE.Group();
    mb.add(cyl(0.05, 0.05, 0.9, 0x8a6a4a, hx + built.w * 0.5 + 0.6, 0.45, -6.6, 6));
    mb.add(box(0.36, 0.2, 0.24, [0x3f5d55, 0x8a3f3f, 0x4a5a70][i % 3], hx + built.w * 0.5 + 0.6, 1.0, -6.6));
    brighten(mb, 0.3); root.add(mb);
    drives.push({ x: dx, taken: false, porchZ: built.porchZ, doorX: hx });
    // trees between the houses, as before
    if (rng() < 0.75) {
      const t = new THREE.Group();
      t.add(cyl(0.16, 0.2, 1.5, 0x6b4f31, 0, 0.75, 0, 7));
      for (let k = 0; k < 3; k++) t.add(sph(0.9 + rng() * 0.5, 0x3f6b34, (rng() - .5) * 0.7, 1.9 + k * 0.42, (rng() - .5) * 0.7, 7));
      t.position.set(hx + built.w / 2 + 1.6, 0, -9.4 + rng() * 1.4);
      t.traverse(m => { if (m.isMesh) m.castShadow = false; });
      brighten(t, 0.24); root.add(t);
    }
  }

  // ---- road markings ----
  for (let x = X0; x < X1; x += 3.2) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.14), mat(0xd8d2bc));
    dash.rotation.x = -Math.PI / 2; dash.position.set(x, 0.004, -4.4); root.add(dash);
  }

  // ---- parked cars: a couple of drives occupied from the start, one at the kerb ----
  const parked = [];
  if (def.street !== false) {
    for (const d of drives) {
      if (rng() > 0.45) continue;
      const c = makeCar(rng() < 0.3 ? 'pickup' : 'sedan', CAR_PAINT[Math.floor(rng() * CAR_PAINT.length)]);
      c.position.set(d.x, 0, DRIVE_Z + 0.2); c.rotation.y = Math.PI / 2;
      root.add(c); parked.push(c); d.taken = true;
    }
    if (rng() < 0.7) {
      const c = makeCar('sedan', CAR_PAINT[Math.floor(rng() * CAR_PAINT.length)]);
      c.position.set(2 + rng() * (W - 4), 0, LANE_FAR - 0.35); c.rotation.y = Math.PI;
      root.add(c); parked.push(c);
    }
  }

  // ---- moving traffic: a recycled pool, so nothing allocates mid-job ----
  const pool = [];
  if (gapRange) {
    const kinds = ['sedan', 'sedan', 'sedan', 'pickup', 'van'];
    for (let i = 0; i < 5; i++) {
      const c = makeCar(kinds[i], CAR_PAINT[Math.floor(rng() * CAR_PAINT.length)]);
      c.visible = false; root.add(c);
      pool.push({ g: c, live: false, dir: 1, spd: 7, x: 0 });
    }
  }
  // one special that shows up rarely and is worth looking up for
  let special = null;
  if (gapRange && !quiet && !night) {
    const kind = ['icecream', 'mail', 'bus'][Math.floor(rng() * 3)];
    const c = makeCar(kind, 0xffffff); c.visible = false; root.add(c);
    special = { g: c, kind, live: false, dir: 1, spd: kind === 'bus' ? 6 : 5, x: 0, chimed: false };
  }

  // ---- the neighbour who comes home (one authored arrival per job) ----
  let arrival = null;
  const freeDrive = drives.find(d => !d.taken);
  if (gapRange && !quiet && freeDrive) {
    const c = makeCar(rng() < 0.35 ? 'van' : 'sedan', CAR_PAINT[Math.floor(rng() * CAR_PAINT.length)]);
    c.visible = false; root.add(c);
    const who = makePerson(SHIRTS[Math.floor(rng() * SHIRTS.length)], PANTS[Math.floor(rng() * PANTS.length)]);
    who.visible = false; root.add(who);
    arrival = { g: c, who, drive: freeDrive, t: 45 + rng() * 70, phase: 'wait', u: 0, x: 0, dir: 1 };
  }

  // ---- people on the sidewalk ----
  const walkers = [];
  if (gapRange && !quiet) {
    const dw = new THREE.Group();
    const p = makePerson(SHIRTS[Math.floor(rng() * SHIRTS.length)], PANTS[Math.floor(rng() * PANTS.length)]);
    const dog = makeDog(); dog.position.set(1.1, 0, 0.35);
    dw.add(p); dw.add(dog); dw.visible = false; root.add(dw);
    walkers.push({ g: dw, person: p, dog, kind: 'dog', live: false, spd: 1.15, dir: 1, x: 0 });
    const bike = makeBike(SHIRTS[Math.floor(rng() * SHIRTS.length)], PANTS[Math.floor(rng() * PANTS.length)]);
    bike.visible = false; root.add(bike);
    walkers.push({ g: bike, kind: 'bike', live: false, spd: 3.1, dir: 1, x: 0 });
  }
  // someone out on a porch for the whole afternoon
  let porch = null;
  if (gapRange && !quiet && rng() < 0.8) {
    const d = drives[Math.floor(rng() * drives.length)];
    const p = makePerson(SHIRTS[Math.floor(rng() * SHIRTS.length)], PANTS[Math.floor(rng() * PANTS.length)]);
    p.position.set(d.doorX + 1.0, 0, HOUSE_Z + HOUSE_D / 2 + 0.8);
    p.rotation.y = Math.PI / 2 + 0.5;
    p.userData.legs.forEach(l => l.rotation.x = -1.4);   // sitting
    p.position.y = 0.12;
    root.add(box(0.5, 0.06, 0.5, 0x8a6a4a, d.doorX + 1.0, 0.42, HOUSE_Z + HOUSE_D / 2 + 0.8));
    root.add(p);
    porch = { g: p, ph: rng() * 6.28 };
  }

  // ---- birds ----
  const birds = new THREE.Group(); birds.visible = false; root.add(birds);
  const wings = [];
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group();
    for (const s of [-1, 1]) {
      const wg = box(0.06, 0.02, 0.34, 0x3b3b42, 0, 0, s * 0.17);
      const pv = new THREE.Group(); pv.add(wg); b.add(pv); wings.push({ pv, s });
    }
    b.position.set(i * 1.3 - 2.6, (i % 2) * 0.7, (i % 3) * 1.1);
    birds.add(b);
  }
  let birdT = 25 + rng() * 40, birdX = 0, birdDir = 1;

  let t = 0, carT = gapRange ? gapRange[0] * 0.6 : 0, specT = 70 + rng() * 90, walkT = 12 + rng() * 18;
  const pick = (a) => a[Math.floor(rng() * a.length)];

  function launch(c, dir, spd) {
    c.dir = dir; c.spd = spd; c.heard = false;
    c.x = dir > 0 ? X0 : X1;
    c.g.position.set(c.x, 0, dir > 0 ? LANE_NEAR : LANE_FAR);
    c.g.rotation.y = dir > 0 ? 0 : Math.PI;
    c.g.visible = true; c.live = true;
  }
  // returns true on the frame the car reaches the near point — the moment it is passing
  // the player, which is when it should be heard rather than when it spawned off-screen
  function rollCar(c, dt) {
    const trigger = W / 2 - c.dir * 5;
    const was = c.x;
    c.x += c.dir * c.spd * dt;
    c.g.position.x = c.x;
    const wl = c.g.userData.wheels;
    if (wl) for (const w of wl) w.rotation.y -= c.spd * dt * 2.6;
    if ((c.dir > 0 && c.x > X1) || (c.dir < 0 && c.x < X0)) { c.live = false; c.g.visible = false; }
    if (!c.heard && ((c.dir > 0 && was < trigger && c.x >= trigger) || (c.dir < 0 && was > trigger && c.x <= trigger))) {
      c.heard = true; return true;
    }
    return false;
  }
  function stride(parts, phase, amp) {
    if (!parts) return;
    parts.forEach((p, i) => { p.rotation.x = Math.sin(phase + (i % 2 ? Math.PI : 0)) * amp; });
  }

  return {
    group: root,
    _dbg: { pool, walkers, drives, parked, birds, get arrival() { return arrival; }, get special() { return special; }, get t() { return t; } },
    // called once per rendered frame from Game.frame — never from the sim
    update(dt, sfx) {
      if (!gapRange) return;
      t += dt;

      carT -= dt;
      if (carT <= 0) {
        const free = pool.find(c => !c.live);
        if (free) launch(free, rng() < 0.5 ? 1 : -1, 5.5 + rng() * 3.5);
        carT = gapRange[0] + rng() * (gapRange[1] - gapRange[0]);
      }
      for (const c of pool) if (c.live && rollCar(c, dt) && sfx && sfx.carPass) sfx.carPass(0.6 + c.spd / 18);

      if (special) {
        if (!special.live) {
          specT -= dt;
          if (specT <= 0) { launch(special, rng() < 0.5 ? 1 : -1, special.spd); specT = 130 + rng() * 120; }
        } else if (rollCar(special, dt) && sfx) {
          if (special.kind === 'icecream' && sfx.jingle) sfx.jingle();
          else if (sfx.carPass) sfx.carPass(1);
        }
      }

      if (arrival) {
        if (arrival.phase === 'wait') {
          arrival.t -= dt;
          if (arrival.t <= 0) {
            arrival.dir = arrival.drive.x > W / 2 ? -1 : 1;
            arrival.x = arrival.dir > 0 ? X0 : X1;
            arrival.g.position.set(arrival.x, 0, LANE_FAR);
            arrival.g.rotation.y = arrival.dir > 0 ? 0 : Math.PI;
            arrival.g.visible = true; arrival.phase = 'approach';
          }
        } else if (arrival.phase === 'approach') {
          const lead = arrival.drive.x - arrival.dir * 4.2;
          const left = (lead - arrival.x) * arrival.dir;
          const spd = Math.max(1.6, Math.min(7, left * 0.9));
          arrival.x += arrival.dir * spd * dt;
          arrival.g.position.x = arrival.x;
          for (const w of arrival.g.userData.wheels) w.rotation.y -= spd * dt * 2.6;
          if (left <= 0.05) { arrival.phase = 'turn'; arrival.u = 0; }
        } else if (arrival.phase === 'turn') {
          arrival.u = Math.min(1, arrival.u + dt / 2.1);
          const u = arrival.u, iu = 1 - u;
          const p0 = { x: arrival.drive.x - arrival.dir * 4.2, z: LANE_FAR };
          const p1 = { x: arrival.drive.x, z: LANE_FAR };
          const p2 = { x: arrival.drive.x, z: DRIVE_Z + 0.2 };
          arrival.g.position.x = iu * iu * p0.x + 2 * iu * u * p1.x + u * u * p2.x;
          arrival.g.position.z = iu * iu * p0.z + 2 * iu * u * p1.z + u * u * p2.z;
          const from = arrival.dir > 0 ? 0 : Math.PI;
          arrival.g.rotation.y = from + (Math.PI / 2 - from) * u;
          for (const w of arrival.g.userData.wheels) w.rotation.y -= 2.4 * dt * (1 - u);
          if (u >= 1) { arrival.phase = 'park'; arrival.u = 0; }
        } else if (arrival.phase === 'park') {
          arrival.u += dt;
          if (arrival.u > 1.2) {
            arrival.who.position.set(arrival.drive.x + 1.0, 0, DRIVE_Z + 0.2);
            arrival.who.rotation.y = Math.PI / 2;
            arrival.who.visible = true; arrival.phase = 'walk'; arrival.u = 0;
          }
        } else if (arrival.phase === 'walk') {
          arrival.u += dt;
          const tgt = arrival.drive.porchZ;
          const p = arrival.who.position;
          p.z += (tgt - p.z) * Math.min(1, dt * 0.9);
          p.x += (arrival.drive.doorX - p.x) * Math.min(1, dt * 0.9);
          stride(arrival.who.userData.legs, t * 7, 0.5);
          stride(arrival.who.userData.arms, t * 7 + Math.PI, 0.35);
          if (Math.abs(p.z - tgt) < 0.35) { arrival.who.visible = false; arrival.phase = 'done'; }
        }
      }

      walkT -= dt;
      if (walkT <= 0) {
        const free = walkers.filter(w => !w.live);
        if (free.length) {
          const w = pick(free);
          w.dir = rng() < 0.5 ? 1 : -1;
          w.x = w.dir > 0 ? X0 * 0.6 : X1 * 0.9;
          w.g.position.set(w.x, 0, WALK_Z + (rng() - 0.5) * 0.4);
          w.g.rotation.y = w.dir > 0 ? 0 : Math.PI;
          w.g.visible = true; w.live = true;
        }
        walkT = 16 + rng() * 26;
      }
      for (const w of walkers) {
        if (!w.live) continue;
        w.x += w.dir * w.spd * dt; w.g.position.x = w.x;
        if (w.kind === 'bike') {
          for (const wh of w.g.userData.wheels) wh.rotation.x -= w.spd * dt * 3;
          w.g.position.y = Math.sin(t * 9) * 0.015;
          stride(w.g.userData.rider.userData.legs, t * 9, 0.55);
        } else {
          stride(w.person.userData.legs, t * 5.5, 0.5);
          stride(w.person.userData.arms, t * 5.5 + Math.PI, 0.3);
          stride(w.dog.userData.legs, t * 9, 0.5);
          w.dog.position.y = Math.abs(Math.sin(t * 9)) * 0.03;
        }
        if ((w.dir > 0 && w.x > X1 * 0.9) || (w.dir < 0 && w.x < X0 * 0.6)) { w.live = false; w.g.visible = false; }
      }

      if (porch) porch.g.rotation.y = Math.PI / 2 + 0.5 + Math.sin(t * 0.6 + porch.ph) * 0.16;

      // birds cross now and then, wings going
      if (!birds.visible) {
        birdT -= dt;
        if (birdT <= 0) {
          birdDir = rng() < 0.5 ? 1 : -1;
          birdX = birdDir > 0 ? -70 : 70;
          birds.position.set(birdX, 26 + rng() * 10, -40 - rng() * 30);
          birds.rotation.y = birdDir > 0 ? 0 : Math.PI;
          birds.visible = true;
        }
      } else {
        birdX += birdDir * 7.5 * dt;
        birds.position.x = birdX;
        const f = Math.sin(t * 7);
        for (const w of wings) w.pv.rotation.x = f * 0.6 * w.s;
        if (Math.abs(birdX) > 75) { birds.visible = false; birdT = 40 + rng() * 60; }
      }
    },
  };
}
