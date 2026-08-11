// FRESH CUT — hood.js
// The rest of the world. street.js owns the road in front; this owns everything else —
// the neighbours to your left and right, the backs of the houses behind you, and the
// horizon in every direction — so the lot never sits on an empty green plane.
//
// Each job gets an ARCHETYPE, so the block around Miss Vi's reads older and leafier than
// the one around the bakery, and a half-acre out by the creek reads rural. Static
// geometry, view-only, no shadows: the sim never sees any of it.
import * as THREE from 'three';
import { mat, box, cyl, sph, cone, gableRoof } from './props.js';
import { brighten } from './street.js';
import { mulberry } from './grass.js';

export const HOODS = {
  suburb: {
    body: [0xd8cbb4, 0xc9d4dd, 0xd4c2c2, 0xcfd8c0, 0xe0d3bb],
    roof: [0x6b5844, 0x574c46, 0x6d5f52], rise: 1.6, w: [5.4, 8.2], h: [2.9, 4.0],
    tree: 'round', treeN: 1.0, hedge: 0.5, far: ['roofs', 'trees'], spacing: 11,
  },
  oldtown: {   // older, denser, brick, big mature trees
    body: [0xb08b76, 0xa8907c, 0xc0a48c, 0x9d8a7a, 0xb59a86],
    roof: [0x4a4038, 0x55483f, 0x3f3833], rise: 2.3, w: [4.6, 6.6], h: [3.6, 5.0],
    tree: 'tall', treeN: 1.6, hedge: 0.9, far: ['roofs', 'trees', 'spire'], spacing: 9,
  },
  main: {      // the town strip: flat roofs, awnings, brick, pavement
    body: [0xc4b09a, 0xb8a894, 0xcfc0aa, 0xa89684],
    roof: [0x6a6258, 0x585349], rise: 0.35, w: [6.5, 10], h: [4.2, 5.6],
    tree: 'sparse', treeN: 0.35, hedge: 0.1, far: ['roofs', 'block'], spacing: 12, flat: true,
  },
  rural: {     // wide gaps, barns, silos, a treeline instead of a skyline
    body: [0xe2dccb, 0xd6cdb8, 0xc9bfa8],
    roof: [0x6d5f52, 0x7a4a3c, 0x55483f], rise: 1.9, w: [5.5, 8], h: [3.0, 4.2],
    tree: 'round', treeN: 1.3, hedge: 0.2, far: ['trees', 'barn', 'silo'], spacing: 20,
  },
  edge: {      // civic / open ground: sparse, utilitarian, scrubby
    body: [0xc8c4b8, 0xb4b2a8, 0xd0ccc0],
    roof: [0x5f5a52, 0x6a6258], rise: 0.9, w: [5, 9], h: [2.6, 3.6],
    tree: 'sparse', treeN: 0.7, hedge: 0.15, far: ['trees', 'masts'], spacing: 17,
  },

  // ---- backdrops for the Wider Job Book. `residential: false` means NO side or rear
  // neighbours: a reservoir bank, a stadium and a rooftop do not have next-door gardens,
  // and putting them there was what made those maps read as somebody's back lawn. ----
  parkland: {  // walled grounds, mature specimen trees: the maze, the quarry, the golf club
    residential: false,
    body: [0xc9bda8, 0xbfb49f], roof: [0x5a5048], rise: 1.9, w: [6, 9], h: [3.4, 4.6],
    tree: 'tall', treeN: 1, hedge: 1, far: ['trees', 'spire'], spacing: 14, ringDens: 1.25, ringNear: 46,
  },
  openfield: { // speedway, ballpark, fairground, the 3AM field
    residential: false,
    body: [0xe2dccb, 0xd6cdb8], roof: [0x6d5f52, 0x7a4a3c], rise: 1.8, w: [6, 9], h: [3, 4],
    tree: 'round', treeN: 1, hedge: 0, far: ['trees', 'barn', 'masts'], spacing: 22, ringDens: 0.8, ringNear: 72,
  },
  water: {     // the reservoir: open water, low hills, nothing built
    residential: false,
    body: [0xd6cdb8], roof: [0x6d5f52], rise: 1.6, w: [5, 7], h: [3, 4],
    tree: 'round', treeN: 1, hedge: 0, far: ['water', 'hills', 'trees'], spacing: 26, ringDens: 0.7, ringNear: 78,
  },
  city: {      // six floors up: a skyline, and it should be close enough to feel it
    residential: false,
    body: [0xa89684, 0x8f8378, 0xb3a493, 0x7d7268], roof: [0x585349], rise: 0.3, w: [9, 16], h: [10, 22],
    tree: 'sparse', treeN: 0.1, hedge: 0, far: ['towers'], spacing: 14, ringDens: 1.5, ringNear: 40, flat: true,
  },
  orchardland: { // more orchard, in every direction
    residential: false,
    body: [0xe2dccb], roof: [0x7a4a3c], rise: 1.8, w: [6, 8], h: [3, 4],
    tree: 'round', treeN: 1, hedge: 0, far: ['rows', 'trees', 'barn'], spacing: 24, ringDens: 1.1, ringNear: 58,
  },
};

// which block each job sits in — authored, so it makes sense per map
const JOB_HOOD = {
  marge: 'suburb', twins: 'suburb', duplex: 'suburb', hendersons: 'suburb',
  rental: 'suburb', gary: 'suburb', pops: 'suburb', terrarium: 'suburb', coach: 'suburb',
  missvi: 'oldtown', bell: 'oldtown', foreclosure: 'oldtown',
  bakery: 'main', corner: 'main', commons: 'main',
  delgado: 'rural', creek: 'rural', church: 'rural', watertower: 'rural',
  outfield: 'edge', putthutt: 'edge', drivein: 'edge', cemetery: 'edge',
};
export function hoodOf(def) { return HOODS[def.hood] || HOODS[JOB_HOOD[def.id]] || HOODS.suburb; }

const pick = (a, r) => a[Math.floor(r() * a.length)];

// a neighbour's house, built with its FRONT toward -z so it matches the player's own
function house(P, rng, { small = false } = {}) {
  const g = new THREE.Group();
  const w = P.w[0] + rng() * (P.w[1] - P.w[0]) * (small ? 0.7 : 1);
  const h = P.h[0] + rng() * (P.h[1] - P.h[0]);
  const d = 4.2 + rng() * 1.8;
  const bodyC = pick(P.body, rng), roofC = pick(P.roof, rng);
  g.add(box(w, h, d, bodyC, 0, h / 2, 0));
  if (P.flat) {
    g.add(box(w + 0.5, 0.35, d + 0.5, roofC, 0, h + 0.17, 0));       // parapet
    g.add(box(w * 0.8, 0.5, 0.25, pick(P.roof, rng), 0, h * 0.62, -d / 2 - 0.16)); // awning/sign
  } else {
    const r = gableRoof(w, d, P.rise, roofC, bodyC); r.position.y = h; g.add(r);
    if (rng() < 0.55) g.add(box(0.5, 1.1, 0.5, 0x9a7360, w * 0.3, h + 0.55, 0));
  }
  const winC = 0x8fb6c9;
  for (const sx of [-w * 0.27, w * 0.27]) {
    g.add(box(0.85, 0.95, 0.06, winC, sx, 1.65, -d / 2 - 0.03));
    if (rng() < 0.7) for (const s2 of [-0.55, 0.55]) g.add(box(0.13, 0.95, 0.05, roofC, sx + s2, 1.65, -d / 2 - 0.04));
  }
  if (h > 3.6) for (const sx of [-w * 0.22, w * 0.22]) g.add(box(0.65, 0.7, 0.06, winC, sx, h - 0.7, -d / 2 - 0.03));
  g.add(box(0.9, 1.9, 0.07, pick([0x7a4a33, 0x3f5d55, 0x8a3f3f, 0x415a78], rng), 0, 0.98, -d / 2 - 0.04));
  // side windows, because you will be looking at these from the side
  for (const sx of [-w / 2 - 0.03, w / 2 + 0.03]) {
    for (const zz of [-d * 0.22, d * 0.22]) g.add(box(0.06, 0.85, 0.75, winC, sx, 1.7, zz));
  }
  g.userData.w = w; g.userData.d = d;
  return g;
}
function treeOf(kind, rng, s = 1) {
  const g = new THREE.Group();
  if (kind === 'tall') {
    g.add(cyl(0.2 * s, 0.26 * s, 2.6 * s, 0x5f4733, 0, 1.3 * s, 0, 7));
    for (let i = 0; i < 4; i++) g.add(sph((1.0 + rng() * 0.5) * s, 0x35602c, (rng() - .5) * 0.9 * s, (2.9 + i * 0.55) * s, (rng() - .5) * 0.9 * s, 7));
  } else if (kind === 'sparse') {
    g.add(cyl(0.13 * s, 0.17 * s, 1.7 * s, 0x6b5a42, 0, 0.85 * s, 0, 6));
    for (let i = 0; i < 2; i++) g.add(sph((0.75 + rng() * 0.4) * s, 0x4d7038, (rng() - .5) * 0.6 * s, (2.0 + i * 0.5) * s, (rng() - .5) * 0.6 * s, 6));
  } else {
    g.add(cyl(0.17 * s, 0.22 * s, 1.6 * s, 0x6b4f31, 0, 0.8 * s, 0, 7));
    for (let i = 0; i < 3; i++) g.add(sph((0.95 + rng() * 0.5) * s, 0x3f6b34, (rng() - .5) * 0.8 * s, (2.0 + i * 0.45) * s, (rng() - .5) * 0.8 * s, 7));
  }
  return g;
}
function shed(rng) {
  const g = new THREE.Group();
  const w = 1.9 + rng() * 1.1, h = 1.8 + rng() * 0.4, d = 1.6 + rng() * 0.8;
  g.add(box(w, h, d, pick([0x8a6a4a, 0x6f7a63, 0x9a8b74], rng), 0, h / 2, 0));
  const r = gableRoof(w, d, 0.5, 0x574c46, 0x8a6a4a); r.position.y = h; g.add(r);
  g.add(box(0.7, 1.3, 0.05, 0x5e4a35, 0, 0.65, -d / 2 - 0.03));
  return g;
}
function washingLine(rng) {
  const g = new THREE.Group();
  for (const sx of [-1.9, 1.9]) { g.add(cyl(0.05, 0.05, 1.9, 0xbdb6a6, sx, 0.95, 0, 6)); g.add(box(0.7, 0.05, 0.05, 0xbdb6a6, sx, 1.85, 0)); }
  g.add(box(3.9, 0.02, 0.02, 0xe8e2d2, 0, 1.83, 0));
  const cols = [0xd8dce6, 0xe0c9b8, 0xc9d8c0, 0xe6dcc4, 0xb8c4d8];
  for (let i = 0; i < 5; i++) {
    const w = 0.42 + rng() * 0.22;
    g.add(box(w, 0.6 + rng() * 0.3, 0.02, cols[i % cols.length], -1.5 + i * 0.75, 1.45, 0));
  }
  return g;
}

export function buildHood(scene, def, world, quality) {
  const root = new THREE.Group(); world.group.add(root);
  const P = hoodOf(def);
  const rng = mulberry((def.seed || 42) * 17 + 3);
  const W = def.lot.w, H = def.lot.h;
  const cx = W / 2, cz = H / 2;
  const far = quality === 'low' ? 0.45 : 1;

  const add = (g, x, z, ry = 0, k = 0.3) => {
    g.position.set(x, 0, z); g.rotation.y = ry;
    g.traverse(m => { if (m.isMesh) m.castShadow = false; });
    brighten(g, k); root.add(g); return g;
  };

  // ---- the neighbours either side of you, fronts to the street like yours ----
  if (P.residential !== false) for (const sign of [-1, 1]) {
    const edge = sign < 0 ? -3.5 : W + 3.5;
    let z = -6 + rng() * 2;
    for (let i = 0; i < 3; i++) {
      const h = house(P, rng);
      const hx = edge + sign * (2.5 + h.userData.w / 2 + rng() * 1.5);
      add(h, hx, z + h.userData.d / 2, 0, 0.32);
      // their yard: a tree, sometimes a shed and a hedge along the boundary
      if (rng() < P.treeN) add(treeOf(P.tree, rng, 0.85 + rng() * 0.4), hx + sign * (h.userData.w / 2 + 1.6), z + 1.5 + rng() * 3, 0, 0.24);
      if (rng() < 0.45) add(shed(rng), hx + sign * 1.2, z + h.userData.d + 3.5 + rng() * 2, rng() * 6.28, 0.3);
      if (rng() < P.hedge) {
        const hedge = new THREE.Group();
        for (let k = 0; k < 9; k++) hedge.add(sph(0.5 + rng() * 0.16, 0x3d6b33, 0, 0.35, k * 0.85, 7));
        add(hedge, edge + sign * 1.2, z + 1, 0, 0.26);
      }
      z += P.spacing * (0.75 + rng() * 0.5);
    }
  }

  // ---- the backs of the houses on the next street over ----
  if (P.residential !== false) {
    let x = -8 + rng() * 4;
    while (x < W + 8) {
      const h = house(P, rng);
      // rotated so their BACKS face us — we're looking into their back gardens
      add(h, x, H + 13 + rng() * 2.5, Math.PI, 0.32);
      if (rng() < 0.5) add(shed(rng), x + (rng() - .5) * 4, H + 7.5 + rng() * 2, rng() * 6.28, 0.3);
      if (rng() < 0.4) add(washingLine(rng), x + (rng() - .5) * 3, H + 6 + rng() * 2, rng() * 1.2 - 0.6, 0.34);
      if (rng() < P.treeN * 0.8) add(treeOf(P.tree, rng, 0.9 + rng() * 0.5), x + (rng() - .5) * 5, H + 9 + rng() * 3, 0, 0.24);
      x += P.spacing * (0.8 + rng() * 0.6);
    }
    // a back hedge line so the gardens have a boundary
    const bh = new THREE.Group();
    for (let k = 0; k * 0.9 < W + 22; k++) bh.add(sph(0.55 + rng() * 0.18, 0x3a6330, k * 0.9, 0.4, 0, 6));
    add(bh, -11, H + 4.5, 0, 0.24);
  }

  // ---- the horizon, all the way round, so no angle is bare ----
  // open water, laid before the ring so the far bank sits on top of it
  if (P.far.includes('water')) {
    // ⚠️ above the surround aprons (y -0.03) or they show THROUGH the water as a green band
    const w = new THREE.Mesh(new THREE.PlaneGeometry(300, 220), mat(0x5d8ea8));
    w.rotation.x = -Math.PI / 2; w.position.set(cx, -0.012, cz - 118); root.add(w);
    // a shoreline strip so the water doesn't just stop at a hard line
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(300, 5), mat(0x9aa88f));
    sh.rotation.x = -Math.PI / 2; sh.position.set(cx, -0.008, cz - 9.5); root.add(sh);
    for (let i = 0; i < 7; i++) {   // low hills across the water
      const hl = new THREE.Group();
      const r = 16 + rng() * 14;
      hl.add(sph(r, 0x6d8a63, 0, -r * 0.42, 0, 10));
      hl.position.set(cx - 130 + i * 44 + rng() * 16, 0, cz - 150 - rng() * 40);
      hl.traverse(m => { if (m.isMesh) m.castShadow = false; }); brighten(hl, 0.2); root.add(hl);
    }
  }
  if (P.far.includes('hills')) for (let i = 0; i < 6; i++) {
    const hl = new THREE.Group(); const r = 20 + rng() * 16;
    hl.add(sph(r, 0x71906a, 0, -r * 0.5, 0, 10));
    const a = 0.6 + rng() * 4.2;
    hl.position.set(cx + Math.sin(a) * (120 + rng() * 40), 0, cz + Math.cos(a) * (120 + rng() * 40));
    hl.traverse(m => { if (m.isMesh) m.castShadow = false; }); brighten(hl, 0.2); root.add(hl);
  }
  if (P.far.includes('rows')) {   // the orchard carries on past the fence, in every direction
    for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
      const t = treeOf('round', rng, 0.9 + rng() * 0.3);
      const side = r % 2 ? 1 : -1;
      t.position.set(cx - 46 + c * 8 + rng() * 1.5, 0, cz + side * (26 + r * 7) + rng() * 1.5);
      t.traverse(m => { if (m.isMesh) m.castShadow = false; }); brighten(t, 0.24); root.add(t);
    }
  }

  const ring = new THREE.Group();
  const rings = Math.round(52 * far * (P.ringDens || 1));
  for (let i = 0; i < rings; i++) {
    const a = (i / rings) * 6.283 + rng() * 0.06;
    const rad = (P.ringNear || 62) + rng() * 34;
    const x = cx + Math.sin(a) * rad, z = cz + Math.cos(a) * rad;
    // don't crowd the road corridor in front
    if (z < -6 && z > -22 && Math.abs(x - cx) < W * 0.8) continue;
    const kind = rng();
    if (P.far.includes('water') && z < cz - 30) continue;    // that direction is the reservoir
    if (P.far.includes('towers')) {                          // a real skyline, seen from a roof
      const g = new THREE.Group();
      const w = P.w[0] + rng() * (P.w[1] - P.w[0]), h = P.h[0] + rng() * (P.h[1] - P.h[0]), d = 8 + rng() * 8;
      g.add(box(w, h, d, pick(P.body, rng), 0, h / 2, 0));
      g.add(box(w + 0.6, 0.5, d + 0.6, pick(P.roof, rng), 0, h + 0.25, 0));
      const winC = 0x9db4c4;                                  // window bands, so they read as buildings
      for (let f = 1; f * 2.4 < h - 1; f++) g.add(box(w * 0.86, 0.7, d + 0.05, winC, 0, f * 2.4, 0));
      g.position.set(x, 0, z); g.rotation.y = rng() * 6.283; ring.add(g);
      continue;
    }
    if (P.far.includes('trees') && kind < 0.55) {
      const t = treeOf(P.tree, rng, 2.0 + rng() * 1.6);
      t.position.set(x, 0, z); ring.add(t);
    } else if (P.far.includes('roofs') || P.far.includes('block')) {
      const g = new THREE.Group();
      const w = 6 + rng() * 7, h = 3 + rng() * (P.far.includes('block') ? 5 : 2.4), d = 5 + rng() * 4;
      g.add(box(w, h, d, pick(P.body, rng), 0, h / 2, 0));
      if (!P.flat) { const r = gableRoof(w, d, 1.6, pick(P.roof, rng), pick(P.body, rng)); r.position.y = h; g.add(r); }
      else g.add(box(w + 0.4, 0.3, d + 0.4, pick(P.roof, rng), 0, h + 0.15, 0));
      g.position.set(x, 0, z); g.rotation.y = rng() * 6.283; ring.add(g);
    } else {
      const t = treeOf('round', rng, 1.8 + rng() * 1.2);
      t.position.set(x, 0, z); ring.add(t);
    }
  }
  ring.traverse(m => { if (m.isMesh) m.castShadow = false; });
  brighten(ring, 0.22); root.add(ring);

  // ---- the one big thing on the skyline that tells you where you are ----
  const landmark = (mk, x, z) => { mk.traverse(m => { if (m.isMesh) m.castShadow = false; }); brighten(mk, 0.24); mk.position.set(x, 0, z); root.add(mk); };
  if (P.far.includes('spire')) {
    const s = new THREE.Group();
    s.add(box(4.5, 7, 5, 0xc9bda8, 0, 3.5, 0));
    s.add(box(2.2, 6, 2.2, 0xc9bda8, 0, 9, 0));
    s.add(cone(1.7, 4.2, 0x5a5048, 0, 14, 0, 4));
    landmark(s, cx - 48 - rng() * 18, cz - 52 - rng() * 20);
  }
  if (P.far.includes('barn')) {
    const b = new THREE.Group();
    b.add(box(11, 5.5, 8, 0x8f3f37, 0, 2.75, 0));
    const r = gableRoof(11, 8, 3.2, 0x4f4740, 0x8f3f37); r.position.y = 5.5; b.add(r);
    b.add(box(3, 3.4, 0.2, 0xd8cfbc, 0, 1.7, -4.1));
    landmark(b, cx + 44 + rng() * 16, cz + 38 + rng() * 18);
  }
  if (P.far.includes('silo')) {
    const s = new THREE.Group();
    s.add(cyl(2.1, 2.1, 13, 0xcfcabd, 0, 6.5, 0, 12));
    s.add(sph(2.1, 0xa8a396, 0, 13, 0, 10));
    landmark(s, cx + 56 + rng() * 14, cz + 30 + rng() * 16);
  }
  if (P.far.includes('masts')) {
    for (const sx of [-1, 1]) {
      const m = new THREE.Group();
      m.add(cyl(0.22, 0.3, 15, 0x8a8f94, 0, 7.5, 0, 6));
      for (let i = 0; i < 4; i++) m.add(box(0.9, 0.5, 0.35, 0xdfe4e8, -1.2 + i * 0.8, 15.4, 0));
      landmark(m, cx + sx * (30 + rng() * 12), cz + 44 + rng() * 12);
    }
  }
  return { group: root, hood: P };
}
