// FRESH CUT — props.js
// The procedural prop kit + yard builder. Storybook Americana from primitives.
// Every prop registers collision circles; some claim no-grass footprints and trim rings.
import * as THREE from 'three';
import { mulberry } from './grass.js';
import { drapePlane } from './terrain.js';

const MATS = {};
export function mat(hex, opts = {}) {
  const k = hex + JSON.stringify(opts);
  if (!MATS[k]) MATS[k] = new THREE.MeshLambertMaterial({ color: hex, ...opts });
  return MATS[k];
}
export function box(w, h, d, hex, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
export function cyl(r1, r2, h, hex, x = 0, y = 0, z = 0, seg = 10) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
export function sph(r, hex, x = 0, y = 0, z = 0, seg = 9) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
export function cone(r, h, hex, x = 0, y = 0, z = 0, seg = 9) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }


// gable roof: two sloped panels + end gables + ridge cap (box normals light cleanly)
export function gableRoof(w, d, rise, roofC, gableC) {
  const g = new THREE.Group();
  const half = d / 2 + 0.25, slope = Math.hypot(half, rise), pitch = Math.atan2(rise, half);
  for (const s of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.1, slope + 0.15), mat(roofC));
    panel.rotation.x = s * pitch;
    panel.position.set(0, rise / 2, s * half / 2);
    panel.castShadow = true; g.add(panel);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.75, 0.12, 0.22), mat(roofC)); ridge.position.y = rise; g.add(ridge);
  const tri = new THREE.Shape(); tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, rise); tri.closePath();
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.ShapeGeometry(tri), mat(gableC));
    end.rotation.y = Math.PI / 2; end.position.set(s * w / 2 - 0.01 * s, 0, 0);
    if (s < 0) end.rotation.y = -Math.PI / 2;
    g.add(end);
  }
  return g;
}

// ---------------- prop builders ----------------
// each returns { g, col: [{x,z,r}], noGrass: [{x,z,r}] , trim: [{x,z,rIn,rOut}] } in LOCAL coords
export const PROPS = {
  tree(o = {}) {
    const g = new THREE.Group(); const s = o.s || 1; const rng = mulberry(o.seed || 7);
    const trunkC = o.birch ? 0xdfd8c8 : 0x6b4a2f;
    const t = cyl(0.14 * s, 0.2 * s, 1.7 * s, trunkC, 0, 0.85 * s, 0); g.add(t);
    const leaf = o.leaf || 0x4d7a35;
    for (let i = 0; i < 3; i++) g.add(sph((0.85 + rng() * 0.5) * s, leaf, (rng() - .5) * 1.1 * s, (2 + rng() * 0.9) * s, (rng() - .5) * 1.1 * s));
    if (o.tire) { const sw = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 7, 14), mat(0x2c2c2c)); sw.position.set(1.15 * s, 0.75, 0); sw.castShadow = true; g.add(sw); const rope = cyl(0.02, 0.02, 1.5, 0xcbb389, 1.15 * s, 1.85, 0); g.add(rope); }
    return { g, col: [{ x: 0, z: 0, r: 0.28 * s }], noGrass: [{ x: 0, z: 0, r: 0.3 * s }], trim: [{ x: 0, z: 0, rIn: 0.3 * s, rOut: 0.62 * s }] };
  },
  pine(o = {}) {
    const g = new THREE.Group(); const s = o.s || 1;
    g.add(cyl(0.12 * s, 0.16 * s, 0.9 * s, 0x5d4027, 0, 0.45 * s, 0));
    for (let i = 0; i < 3; i++) g.add(cone((1.05 - i * 0.26) * s, 1.0 * s, 0x39603a, 0, (1.1 + i * 0.62) * s, 0));
    return { g, col: [{ x: 0, z: 0, r: 0.26 * s }], noGrass: [{ x: 0, z: 0, r: 0.28 * s }], trim: [{ x: 0, z: 0, rIn: 0.28 * s, rOut: 0.55 * s }] };
  },
  shrub(o = {}) {
    const g = new THREE.Group(); const s = o.s || 1;
    g.add(sph(0.42 * s, o.c || 0x50803a, 0, 0.34 * s, 0, 8));
    g.add(sph(0.3 * s, o.c || 0x50803a, 0.25 * s, 0.26 * s, 0.12 * s, 7));
    return { g, col: [{ x: 0, z: 0, r: 0.4 * s }], noGrass: [{ x: 0, z: 0, r: 0.34 * s }], trim: [{ x: 0, z: 0, rIn: 0.34 * s, rOut: 0.6 * s }] };
  },
  flowerbed(o = {}) {
    const g = new THREE.Group(); const r = o.r || 1.1; const rng = mulberry(o.seed || 5);
    const bed = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat(0x5a4230)); bed.rotation.x = -Math.PI / 2; bed.position.y = 0.02; bed.receiveShadow = true; g.add(bed);
    const cols = o.cols || [0xe86a92, 0xf2c14e, 0xe8e4f0, 0xd95d3b];
    const n = Math.floor(r * r * 6);
    for (let i = 0; i < n; i++) {
      const a = rng() * 6.28, d = Math.sqrt(rng()) * (r - 0.18);
      const x = Math.sin(a) * d, z = Math.cos(a) * d;
      g.add(cyl(0.015, 0.015, 0.26, 0x3f6b2d, x, 0.13, z, 5));
      g.add(sph(0.06 + rng() * 0.035, cols[(rng() * cols.length) | 0], x, 0.3, z, 6));
    }
    return { g, col: [], noGrass: [{ x: 0, z: 0, r }], trim: [{ x: 0, z: 0, rIn: r, rOut: r + 0.3 }], soft: true };
  },
  mailbox(o = {}) {
    const g = new THREE.Group();
    g.add(cyl(0.04, 0.05, 1.05, 0x7b5836, 0, 0.52, 0));
    const bx = box(0.24, 0.2, 0.42, o.c || 0x38536b, 0, 1.12, 0); g.add(bx);
    g.add(box(0.03, 0.14, 0.03, 0xd95d3b, 0.14, 1.24, 0.1));
    return { g, col: [{ x: 0, z: 0, r: 0.14 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.1, rOut: 0.4 }] };
  },
  birdbath() {
    const g = new THREE.Group();
    g.add(cyl(0.09, 0.16, 0.75, 0xb9b2a4, 0, 0.37, 0));
    g.add(cyl(0.42, 0.3, 0.12, 0xb9b2a4, 0, 0.8, 0, 14));
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.34, 14), mat(0x7db6c9)); w.rotation.x = -Math.PI / 2; w.position.y = 0.87; g.add(w);
    return { g, col: [{ x: 0, z: 0, r: 0.3 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.28, rOut: 0.55 }] };
  },
  swingset() {
    const g = new THREE.Group(); const H = 2.1, W = 2.6;
    for (const sx of [-W / 2, W / 2]) { const a = cyl(0.05, 0.05, 2.35, 0xc4574e, sx, H / 2, -0.55); a.rotation.x = 0.42; g.add(a); const b = cyl(0.05, 0.05, 2.35, 0xc4574e, sx, H / 2, 0.55); b.rotation.x = -0.42; g.add(b); }
    const top = cyl(0.05, 0.05, W, 0xc4574e, 0, H, 0); top.rotation.z = Math.PI / 2; g.add(top);
    for (const sx of [-0.6, 0.6]) { g.add(cyl(0.015, 0.015, 0.85, 0x777, sx - 0.18, H - 0.45, 0, 5)); g.add(cyl(0.015, 0.015, 0.85, 0x777, sx + 0.18, H - 0.45, 0, 5)); g.add(box(0.44, 0.05, 0.2, 0x8a5c33, sx, H - 0.9, 0)); }
    return { g, col: [{ x: -W / 2, z: -0.55, r: 0.14 }, { x: -W / 2, z: 0.55, r: 0.14 }, { x: W / 2, z: -0.55, r: 0.14 }, { x: W / 2, z: 0.55, r: 0.14 }], noGrass: [], trim: [{ x: -W / 2, z: 0, rIn: 0.1, rOut: 0.5 }, { x: W / 2, z: 0, rIn: 0.1, rOut: 0.5 }] };
  },
  sandbox() {
    const g = new THREE.Group(); const s = 1.9;
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(s - 0.2, s - 0.2), mat(0xe0c98f)); sand.rotation.x = -Math.PI / 2; sand.position.y = 0.12; g.add(sand);
    for (const [x, z, w, d] of [[0, -s / 2, s, 0.14], [0, s / 2, s, 0.14], [-s / 2, 0, 0.14, s], [s / 2, 0, 0.14, s]]) g.add(box(w, 0.22, d, 0x8a5c33, x, 0.11, z));
    g.add(cone(0.3, 0.24, 0xe0c98f, 0.3, 0.24, -0.2, 8));
    return { g, col: [{ x: 0, z: 0, r: s / 2 + 0.1 }], noGrass: [{ x: 0, z: 0, r: s / 2 + 0.15 }], trim: [{ x: 0, z: 0, rIn: s / 2 + 0.15, rOut: s / 2 + 0.45 }] };
  },
  gnome(o = {}) {
    const g = new THREE.Group(); const s = o.s || 1;
    g.add(cyl(0.09 * s, 0.12 * s, 0.22 * s, 0x3b6ea5, 0, 0.11 * s, 0, 8));
    g.add(sph(0.08 * s, 0xe8bfa2, 0, 0.28 * s, 0, 8));
    g.add(sph(0.055 * s, 0xf2f2f2, 0, 0.24 * s, 0.05 * s, 7));
    g.add(cone(0.075 * s, 0.2 * s, 0xd95d3b, 0, 0.42 * s, 0, 8));
    return { g, col: [{ x: 0, z: 0, r: 0.12 * s }], noGrass: [], trim: [] };
  },
  grill() {
    const g = new THREE.Group();
    const drum = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), mat(0x262b2e)); drum.position.y = 0.72; drum.castShadow = true; g.add(drum);
    for (const a of [0, 2.1, 4.2]) g.add(cyl(0.02, 0.02, 0.7, 0x555, Math.sin(a) * 0.2, 0.35, Math.cos(a) * 0.2, 5));
    g.add(sph(0.035, 0xc4574e, 0, 1.05, 0));
    return { g, col: [{ x: 0, z: 0, r: 0.34 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.3, rOut: 0.55 }] };
  },
  chair(o = {}) {
    const g = new THREE.Group(); const c = o.c || 0x6fa3c7;
    g.add(box(0.5, 0.05, 0.45, c, 0, 0.35, 0));
    const bk = box(0.5, 0.55, 0.05, c, 0, 0.62, -0.24); bk.rotation.x = -0.25; g.add(bk);
    for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) g.add(cyl(0.025, 0.025, 0.35, 0xd8d2c4, x, 0.17, z, 5));
    return { g, col: [{ x: 0, z: 0, r: 0.3 }], noGrass: [], trim: [] };
  },
  shed(o = {}) {
    const g = new THREE.Group(); const w = o.w || 2.6, d = o.d || 2.0, h = 1.9;
    g.add(box(w, h, d, o.c || 0x8a7358, 0, h / 2, 0));
    const roof = gableRoof(w, d, d * 0.4, 0x5f4a38, o.c || 0x8a7358); roof.position.y = h; g.add(roof);
    g.add(box(0.7, 1.3, 0.06, 0x5f4a38, 0, 0.65, d / 2 + 0.01));
    return { g, col: [{ x: -w / 3, z: 0, r: d / 2 + 0.15 }, { x: w / 3, z: 0, r: d / 2 + 0.15 }, { x: 0, z: 0, r: d / 2 + 0.2 }], noGrass: [{ x: 0, z: 0, r: Math.max(w, d) / 2 + 0.1 }], trim: [{ x: 0, z: 0, rIn: Math.max(w, d) / 2 + 0.1, rOut: Math.max(w, d) / 2 + 0.45 }] };
  },
  kiddiepool() {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.14, 8, 18), mat(0x4f8fc0)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.14; g.add(ring);
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.72, 18), mat(0x8fd0dd)); w.rotation.x = -Math.PI / 2; w.position.y = 0.16; g.add(w);
    const duck = sph(0.09, 0xf2c14e, 0.2, 0.22, 0.1); g.add(duck); g.add(sph(0.05, 0xf2c14e, 0.28, 0.28, 0.1)); g.add(cone(0.02, 0.05, 0xd95d3b, 0.33, 0.27, 0.1, 6));
    return { g, col: [{ x: 0, z: 0, r: 0.9 }], noGrass: [{ x: 0, z: 0, r: 0.88 }], trim: [{ x: 0, z: 0, rIn: 0.88, rOut: 1.15 }] };
  },
  flagpole() {
    const g = new THREE.Group();
    g.add(cyl(0.035, 0.05, 4.6, 0xd8d2c4, 0, 2.3, 0));
    const flag = box(0.85, 0.5, 0.02, 0xc0392b, 0.46, 4.1, 0); g.add(flag); flag.userData.flag = true;
    return { g, col: [{ x: 0, z: 0, r: 0.1 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.08, rOut: 0.4 }] };
  },
  hydrant() {
    const g = new THREE.Group();
    g.add(cyl(0.12, 0.14, 0.5, 0xd95d3b, 0, 0.25, 0, 9));
    g.add(sph(0.12, 0xd95d3b, 0, 0.52, 0));
    g.add(cyl(0.05, 0.05, 0.3, 0xd95d3b, 0, 0.32, 0, 6)).children;
    return { g, col: [{ x: 0, z: 0, r: 0.16 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.14, rOut: 0.42 }] };
  },
  hosereel() {
    const g = new THREE.Group();
    const reel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 7, 14), mat(0x3e7247)); reel.position.y = 0.3; g.add(reel);
    g.add(box(0.1, 0.6, 0.1, 0x777, 0, 0.3, -0.12));
    return { g, col: [{ x: 0, z: 0, r: 0.25 }], noGrass: [], trim: [] };
  },
  stump() {
    const g = new THREE.Group(); g.add(cyl(0.3, 0.36, 0.4, 0x77573a, 0, 0.2, 0, 10));
    return { g, col: [{ x: 0, z: 0, r: 0.36 }], noGrass: [{ x: 0, z: 0, r: 0.36 }], trim: [{ x: 0, z: 0, rIn: 0.36, rOut: 0.6 }] };
  },
  bench() {
    const g = new THREE.Group();
    g.add(box(1.4, 0.06, 0.4, 0x8a5c33, 0, 0.42, 0));
    g.add(box(1.4, 0.4, 0.05, 0x8a5c33, 0, 0.68, -0.19));
    for (const x of [-0.6, 0.6]) g.add(box(0.06, 0.42, 0.36, 0x4a4a4a, x, 0.21, 0));
    return { g, col: [{ x: 0, z: 0, r: 0.75 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.5, rOut: 0.85 }] };
  },
  doghouse() {
    const g = new THREE.Group();
    g.add(box(1.0, 0.75, 0.9, 0xa04b3c, 0, 0.375, 0));
    const roof = gableRoof(1.0, 0.9, 0.4, 0x5f4a38, 0xa04b3c); roof.position.y = 0.75; g.add(roof);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), mat(0x241d15)); hole.position.set(0, 0.35, 0.451); g.add(hole);
    return { g, col: [{ x: 0, z: 0, r: 0.65 }], noGrass: [{ x: 0, z: 0, r: 0.6 }], trim: [{ x: 0, z: 0, rIn: 0.6, rOut: 0.9 }] };
  },
  trampoline() {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.06, 7, 20), mat(0x33607d)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.75; g.add(ring);
    const matt = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), mat(0x22303a)); matt.rotation.x = -Math.PI / 2; matt.position.y = 0.73; g.add(matt);
    for (const a of [0.5, 1.7, 2.9, 4.1, 5.3]) g.add(cyl(0.035, 0.035, 0.75, 0x557, Math.sin(a) * 1.05, 0.37, Math.cos(a) * 1.05, 6));
    return { g, col: [{ x: 0, z: 0, r: 1.28 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 1.2, rOut: 1.5 }] };
  },
  planter(o = {}) {
    const g = new THREE.Group();
    g.add(cyl(0.22, 0.16, 0.3, 0xa8654f, 0, 0.15, 0, 10));
    g.add(sph(0.2, o.c || 0x50803a, 0, 0.4, 0, 8));
    return { g, col: [{ x: 0, z: 0, r: 0.24 }], noGrass: [], trim: [] };
  },
  // ---- props for the Wider Job Book (and the Odd Jobs that referenced kinds nobody built:
  // windmill, holeflag and gravestone were silently skipped by the PROPS lookup) ----
  hedgewall(o = {}) {   // a maze wall. Long, solid, and the mower will not fit through it.
    const g = new THREE.Group();
    const L = o.l || 4, h = o.h || 1.5;
    for (let i = 0; i * 0.8 < L; i++) {
      g.add(sph(0.62 + Math.sin(i * 2.3) * 0.06, o.c || 0x2f5b2a, 0, h - 0.55, i * 0.8 - L / 2, 7));
      g.add(sph(0.58, o.c || 0x35632e, 0, h - 1.05, i * 0.8 - L / 2, 6));
    }
    g.add(box(0.9, h - 0.5, L, 0x2a4f26, 0, (h - 0.5) / 2, 0));
    const col = []; for (let i = 0; i * 1.0 < L; i++) col.push({ x: 0, z: i * 1.0 - L / 2, r: 0.6 });
    return { g, col, noGrass: col.map(c => ({ ...c, r: 0.5 })), trim: col.map(c => ({ x: c.x, z: c.z, rIn: 0.5, rOut: 0.95 })) };
  },
  bleacher(o = {}) {
    const g = new THREE.Group();
    const w = o.w || 6, rows = o.rows || 4;
    for (let r = 0; r < rows; r++) {
      g.add(box(w, 0.12, 0.62, 0xa8a49a, 0, 0.38 + r * 0.42, -r * 0.62));
      g.add(box(w, 0.34, 0.1, 0x8f8b82, 0, 0.55 + r * 0.42, -r * 0.62 - 0.3));
    }
    for (const sx of [-w / 2 + 0.2, w / 2 - 0.2]) g.add(box(0.12, 0.4 + rows * 0.42, 0.12, 0x6f6b63, sx, (0.4 + rows * 0.42) / 2, -rows * 0.31));
    return { g, col: [{ x: 0, z: -rows * 0.31, r: Math.max(1.4, w * 0.42) }], noGrass: [{ x: 0, z: -rows * 0.31, r: w * 0.4 }], trim: [{ x: 0, z: -rows * 0.31, rIn: w * 0.4, rOut: w * 0.5 }] };
  },
  tyrestack(o = {}) {
    const g = new THREE.Group();
    const n = o.n || 3;
    for (let i = 0; i < n; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 6, 12), mat(0x24262a)); t.rotation.x = Math.PI / 2; t.position.y = 0.18 + i * 0.3; g.add(t); }
    if (o.c) g.add(cyl(0.3, 0.3, 0.06, o.c, 0, 0.18 + n * 0.3, 0, 10));
    return { g, col: [{ x: 0, z: 0, r: 0.6 }], noGrass: [{ x: 0, z: 0, r: 0.55 }], trim: [{ x: 0, z: 0, rIn: 0.55, rOut: 0.9 }] };
  },
  statue(o = {}) {
    const g = new THREE.Group();
    g.add(box(1.0, 0.22, 1.0, 0x9c968a, 0, 0.11, 0));
    g.add(box(0.72, 0.5, 0.72, 0xa9a396, 0, 0.47, 0));
    g.add(cyl(0.17, 0.22, 1.15, o.c || 0x8e9aa0, 0, 1.29, 0, 8));
    g.add(sph(0.2, o.c || 0x8e9aa0, 0, 2.0, 0, 8));
    return { g, col: [{ x: 0, z: 0, r: 0.72 }], noGrass: [{ x: 0, z: 0, r: 0.7 }], trim: [{ x: 0, z: 0, rIn: 0.7, rOut: 1.15 }] };
  },
  fountain() {
    const g = new THREE.Group();
    g.add(cyl(1.5, 1.6, 0.42, 0xb3ada0, 0, 0.21, 0, 16));
    const w = new THREE.Mesh(new THREE.CircleGeometry(1.36, 16), mat(0x6fb3c4)); w.rotation.x = -Math.PI / 2; w.position.y = 0.36; g.add(w);
    g.add(cyl(0.2, 0.26, 0.9, 0xb3ada0, 0, 0.85, 0, 10));
    g.add(cyl(0.62, 0.5, 0.14, 0xb3ada0, 0, 1.35, 0, 12));
    return { g, col: [{ x: 0, z: 0, r: 1.66 }], noGrass: [{ x: 0, z: 0, r: 1.62 }], trim: [{ x: 0, z: 0, rIn: 1.62, rOut: 2.0 }] };
  },
  acunit() {   // rooftop plant
    const g = new THREE.Group();
    g.add(box(1.5, 0.9, 1.2, 0xa9aeb2, 0, 0.45, 0));
    g.add(box(1.1, 0.08, 0.9, 0x8d9298, 0, 0.93, 0));
    const f = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 5, 12), mat(0x6f757a)); f.position.set(0, 0.95, 0); f.rotation.x = Math.PI / 2; g.add(f);
    return { g, col: [{ x: 0, z: 0, r: 1.0 }], noGrass: [{ x: 0, z: 0, r: 0.95 }], trim: [{ x: 0, z: 0, rIn: 0.95, rOut: 1.35 }] };
  },
  booth(o = {}) {
    const g = new THREE.Group();
    g.add(box(2.0, 2.3, 1.8, o.c || 0xd8534f, 0, 1.15, 0));
    g.add(box(2.4, 0.16, 2.2, 0xf2ead8, 0, 2.35, 0));
    g.add(box(1.2, 0.7, 0.08, 0x2b3a44, 0, 1.5, -0.92));
    for (let i = 0; i < 6; i++) g.add(box(0.36, 0.5, 0.06, i % 2 ? 0xf4efe2 : (o.c || 0xd8534f), -1.0 + i * 0.4, 2.5, -1.0));
    return { g, col: [{ x: 0, z: 0, r: 1.35 }], noGrass: [{ x: 0, z: 0, r: 1.3 }], trim: [{ x: 0, z: 0, rIn: 1.3, rOut: 1.7 }] };
  },
  parapet(o = {}) {   // the low wall round a roof — the thing that makes a roof read as a roof
    const g = new THREE.Group();
    const L = o.l || 6, h = o.h || 0.85;
    g.add(box(0.34, h, L, o.c || 0xb0a695, 0, h / 2, 0));
    g.add(box(0.44, 0.1, L, o.c2 || 0x8f8578, 0, h + 0.05, 0));   // coping stone
    const col = []; for (let i = 0; i * 1.2 < L; i++) col.push({ x: 0, z: i * 1.2 - L / 2 + 0.6, r: 0.34 });
    return { g, col, noGrass: col.map(c => ({ ...c, r: 0.3 })), trim: col.map(c => ({ x: c.x, z: c.z, rIn: 0.3, rOut: 0.7 })) };
  },
  backstop(o = {}) {  // ballpark: the tall mesh screen behind home plate
    const g = new THREE.Group();
    const w = o.w || 7, h = o.h || 3.4;
    for (const sx of [-w / 2, 0, w / 2]) g.add(cyl(0.08, 0.09, h, 0x6f757a, sx, h / 2, 0, 6));
    g.add(box(w, 0.09, 0.09, 0x6f757a, 0, h, 0));
    const c = document.createElement('canvas'); c.width = 32; c.height = 32; const cx2 = c.getContext('2d');
    cx2.strokeStyle = 'rgba(200,206,212,0.85)'; cx2.lineWidth = 2;
    for (let i = -32; i < 64; i += 9) { cx2.beginPath(); cx2.moveTo(i, 0); cx2.lineTo(i + 32, 32); cx2.stroke(); cx2.beginPath(); cx2.moveTo(i + 32, 0); cx2.lineTo(i, 32); cx2.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 1.2, h / 1.2);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    mesh.position.set(0, h / 2, 0); g.add(mesh);
    return { g, col: [{ x: 0, z: 0, r: 0.4 }, { x: -w / 2, z: 0, r: 0.4 }, { x: w / 2, z: 0, r: 0.4 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.4, rOut: 0.9 }] };
  },
  holeflag(o = {}) {
    const g = new THREE.Group();
    g.add(cyl(0.02, 0.02, 1.25, 0xf2ead8, 0, 0.62, 0, 5));
    const f = box(0.34, 0.24, 0.02, o.c || 0xc0392b, 0.17, 1.12, 0); g.add(f);
    g.add(cyl(0.14, 0.14, 0.03, 0x2b2b2b, 0, 0.015, 0, 12));
    return { g, col: [{ x: 0, z: 0, r: 0.16 }], noGrass: [{ x: 0, z: 0, r: 0.16 }], trim: [] };
  },
  windmill() {
    const g = new THREE.Group();
    g.add(box(1.1, 2.2, 1.1, 0xe4dbc6, 0, 1.1, 0));
    const r = gableRoof(1.2, 1.2, 0.5, 0xc0392b, 0xe4dbc6); r.position.y = 2.2; g.add(r);
    const hub = new THREE.Group(); hub.position.set(0, 1.7, -0.62);
    for (let i = 0; i < 4; i++) { const b = box(0.16, 1.15, 0.05, 0xf4efe2, 0, 0.6, 0); b.rotation.z = i * Math.PI / 2; const p = new THREE.Group(); p.rotation.z = i * Math.PI / 2; p.add(box(0.16, 1.15, 0.05, 0xf4efe2, 0, 0.6, 0)); hub.add(p); }
    hub.userData.spin = 0.7; g.add(hub);
    return { g, col: [{ x: 0, z: 0, r: 0.85 }], noGrass: [{ x: 0, z: 0, r: 0.8 }], trim: [{ x: 0, z: 0, rIn: 0.8, rOut: 1.2 }] };
  },
  gravestone(o = {}) {
    const g = new THREE.Group();
    const h = o.h || 0.8;
    g.add(box(0.62, 0.12, 0.34, 0x9c968a, 0, 0.06, 0));
    const s = box(0.5, h, 0.16, o.c || 0xa9a396, 0, 0.12 + h / 2, 0);
    s.rotation.z = (o.lean || 0); g.add(s);
    if (o.cross) { g.add(box(0.12, 0.5, 0.12, o.c || 0xa9a396, 0, 0.12 + h + 0.25, 0)); g.add(box(0.4, 0.12, 0.12, o.c || 0xa9a396, 0, 0.12 + h + 0.3, 0)); }
    return { g, col: [{ x: 0, z: 0, r: 0.34 }], noGrass: [{ x: 0, z: 0, r: 0.32 }], trim: [{ x: 0, z: 0, rIn: 0.32, rOut: 0.72 }] };
  },
  wheelbarrow() {
    const g = new THREE.Group();
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.3, 10, 1, false, 0, Math.PI * 2), mat(0x3e7247)); tub.position.y = 0.38; tub.scale.z = 0.65; g.add(tub);
    g.add(cyl(0.14, 0.14, 0.06, 0x2c2c2c, 0, 0.16, 0.45).rotateZ?.(0) || box(0, 0, 0, 0));
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 7, 12), mat(0x2c2c2c)); wheel.position.set(0, 0.16, 0.45); g.add(wheel);
    for (const sx of [-0.16, 0.16]) g.add(box(0.05, 0.05, 0.9, 0x8a5c33, sx, 0.3, -0.15));
    return { g, col: [{ x: 0, z: 0, r: 0.45 }], noGrass: [], trim: [] };
  },
};

// ---------------- discovery meshes ----------------
export function discoveryMesh(kind) {
  const g = new THREE.Group();
  switch (kind) {
    case 'ball': g.add(sph(0.09, 0xd8e04a, 0, 0.09, 0)); break;
    case 'cap': g.add(cyl(0.05, 0.055, 0.02, 0xc0392b, 0, 0.02, 0, 10)); break;
    case 'car': g.add(box(0.14, 0.05, 0.07, 0x3b6ea5, 0, 0.05, 0)); g.add(box(0.07, 0.04, 0.06, 0x9fc4e8, 0, 0.09, 0)); break;
    case 'frisbee': { const d = cyl(0.14, 0.12, 0.025, 0xe8792c, 0, 0.03, 0, 14); g.add(d); break; }
    case 'ring': { const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 16), mat(0xf2c14e)); r.rotation.x = Math.PI / 2; r.position.y = 0.03; g.add(r); break; }
    case 'glasses': { for (const sx of [-0.05, 0.05]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12), mat(0x704214)); r.position.set(sx, 0.03, 0); r.rotation.x = Math.PI / 2; g.add(r); } g.add(box(0.02, 0.006, 0.006, 0x704214, 0, 0.03, 0)); break; }
    case 'key': g.add(cyl(0.03, 0.03, 0.01, 0xb9a24a, 0, 0.02, 0, 8)); g.add(box(0.07, 0.008, 0.016, 0xb9a24a, 0.05, 0.02, 0)); break;
    case 'dogtag': g.add(box(0.05, 0.008, 0.07, 0xc7c7c7, 0, 0.02, 0)); break;
    case 'plank': g.add(box(0.5, 0.03, 0.11, 0xc9a86a, 0, 0.03, 0)); break;
    case 'arrowhead': g.add(cone(0.045, 0.1, 0x777a80, 0, 0.03, 0, 5)).rotation; g.children[0].rotation.x = Math.PI / 2; break;
    case 'coin': g.add(cyl(0.045, 0.045, 0.012, 0xd9b44a, 0, 0.02, 0, 12)); break;
    case 'fossil': { const s = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 12, 4.5), mat(0xb9b2a4)); s.rotation.x = Math.PI / 2; s.position.y = 0.025; g.add(s); break; }
    case 'photo': g.add(box(0.12, 0.006, 0.09, 0xf2ead8, 0, 0.02, 0)); break;
    case 'trowel': g.add(box(0.04, 0.015, 0.14, 0xc7c7c7, 0, 0.02, 0.02)); g.add(cyl(0.016, 0.02, 0.1, 0xa04b3c, 0, 0.02, -0.1, 6)); break;
    case 'medal': { g.add(cyl(0.05, 0.05, 0.012, 0xd9b44a, 0, 0.02, 0, 12)); g.add(box(0.03, 0.006, 0.06, 0xc0392b, 0, 0.02, -0.07)); break; }
    default: g.add(sph(0.06, 0xcccccc, 0, 0.06, 0));
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}

// ---------------- mowers ----------------
// The player looks at this object for the entire game, from about 1.2 m, and the top of the
// deck sits dead centre of frame — so detail goes on TOP surfaces, not underneath.
//
// The contract with game.js is four fields and nothing else:
//   userData.deckLocal      where the CUT lands, in +z local metres (must match the drawn deck)
//   userData.bag            the group whose .scale is driven by the fill
//   userData.bagLocal {y,z} the chute mouth, so in-flight clippings keep homing
//   userData.wheel = radius on any mesh that should roll
//
// Seven machines, and they are meant to read as seven machines: Old Faithful is the tired
// one, the Self-Propelled has a drive belt and a bail, the Wide-Deck is commercial kit with
// two spindles, the Titan is a walk-behind the size of a door, the Hover has no wheels at
// all, and the Tweezers is not really a mower.
const MOWERS = {
  push:  { w: 0.55, k: 1.00, drive: false, spindles: 1, handle: 'bar',    wear: 5, wheel: 0.090 },
  self:  { w: 0.55, k: 1.00, drive: true,  spindles: 1, handle: 'bail',   wear: 1, wheel: 0.095 },
  wide:  { w: 0.78, k: 1.12, drive: true,  spindles: 2, handle: 'brace',  wear: 2, wheel: 0.105 },
  titan: { w: 2.20, k: 1.85, drive: true,  spindles: 3, handle: 'levers', wear: 0, wheel: 0.185 },
};
const RUSTS = [0x8f5b3a, 0x7d4a30, 0x9c6a45, 0x6f4a38];

// A wheel that rolls: tyre, hub caps and tread blocks, the caps and blocks PARENTED to the
// tyre so they turn with it. ⚠️ the tyre's own axis is its local +Y (it is laid over by
// rotation.z), so a child's "across the wheel" direction is local y, not x.
function roadWheel(g, x, z, r, wide = 0.06, hub = 0x9aa0a6) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, wide, 12), mat(0x2c2c2c));
  t.rotation.z = Math.PI / 2; t.position.set(x, r, z); t.userData.wheel = r; t.castShadow = true; g.add(t);
  for (const sy of [-1, 1]) t.add(cyl(r * 0.5, r * 0.5, 0.012, hub, 0, sy * (wide / 2 + 0.006), 0, 8));
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047;
    const b = box(r * 0.4, wide * 0.86, 0.014, 0x232323, Math.cos(a) * r, 0, Math.sin(a) * r);
    b.rotation.y = -(a + Math.PI / 2); t.add(b);
  }
  return t;
}
// the height-adjust lever every walk-behind has, one at each wheel: a notched quadrant
// plate, a raked lever and the little knob you actually pull
function heightLever(g, x, z, s, flip) {
  const q = new THREE.Group(); q.position.set(x, 0.15 * s, z); q.rotation.y = flip ? Math.PI : 0;
  q.add(box(0.018 * s, 0.13 * s, 0.10 * s, 0x8a8f94, 0, 0.02 * s, 0));            // quadrant plate
  for (let i = 0; i < 4; i++) q.add(box(0.024 * s, 0.012 * s, 0.014 * s, 0x6f7479, 0, -0.02 * s + i * 0.03 * s, 0.05 * s));  // its notches
  const arm = cyl(0.011 * s, 0.011 * s, 0.17 * s, 0x35383b, 0, 0.06 * s, 0.05 * s, 5);
  arm.rotation.x = 0.75; q.add(arm);
  q.add(sph(0.021 * s, 0xc9302c, 0, 0.11 * s, 0.115 * s, 6));                      // the knob
  g.add(q);
}
// rust, chips and scuffs. Old Faithful gets five; the commercial kit gets a couple of honest
// scrapes; the Titan is box-fresh, because the Petersons' shed is where new things go.
function wearMarks(g, w, n, seed, y, side = 0) {
  const rng = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const x = (rng() - 0.5) * w * 0.86, z = (rng() - 0.5) * w * 0.62;
    g.add(box(0.06 + rng() * 0.12, 0.010, 0.05 + rng() * 0.09, RUSTS[(rng() * 4) | 0], x, y, z));
  }
  // and the same again down the deck's SIDES, which is the face you actually walk behind
  for (let i = 0; i < side; i++) {
    const sx = rng() < 0.5 ? -1 : 1;
    g.add(box(0.012, 0.05 + rng() * 0.05, 0.07 + rng() * 0.10, RUSTS[(rng() * 4) | 0],
      sx * (w / 2 + 0.004), 0.15 + rng() * 0.07, (rng() - 0.5) * w * 0.6));
  }
}

export function makeMower(gear, paint) {
  const g = new THREE.Group();
  // earned paint overrides the factory colour on the walk-behinds; the odd-size machines
  // keep their own livery so they stay recognisable as the special gear
  const stock = { push: 0xc0392b, self: 0x3e7247, wide: 0xe8792c, rider: 0xc0392b, titan: 0x8e44ad, hover: 0x2f9fb5, tweezer: 0xd8a23f }[gear] || 0xc0392b;
  const deckC = (paint && ['push', 'self', 'wide', 'rider'].includes(gear)) ? paint : stock;
  const w = { push: 0.55, self: 0.55, wide: 0.78, rider: 1.15, titan: 2.2, hover: 0.95, tweezer: 0.22 }[gear] || 0.55;

  if (gear === 'rider') {
    // ---- THE RIDER: a small tractor. You sit in it, so it needs a seat with a back you can
    // see, a column under the wheel, a bonnet over the engine and a stack to breathe through.
    g.add(box(w * 0.86, 0.14, 1.62, 0x3a3d40, 0, 0.34, 0.05));                 // chassis frame
    g.add(box(w * 0.8, 0.30, 1.5, deckC, 0, 0.42, 0.1));                       // body tub
    g.add(box(w * 0.85, 0.16, 0.8, 0x2c2c2c, 0, 0.2, 0.35));                   // the cutting deck
    g.add(box(w * 0.88, 0.04, 0.84, 0x1f1f1f, 0, 0.115, 0.35));                // deck lip
    for (const sx of [-w * 0.38, w * 0.38]) {                                  // anti-scalp rollers
      const r = cyl(0.045, 0.045, 0.07, 0x4a4a4a, sx, 0.05, 0.72, 8);
      r.rotation.z = Math.PI / 2; r.userData.wheel = 0.045; g.add(r);
    }
    const chute = box(0.2, 0.16, 0.3, deckC, w * 0.44, 0.24, 0.3); chute.rotation.z = -0.3; g.add(chute);
    g.add(box(w * 0.62, 0.26, 0.5, deckC, 0, 0.66, 0.52));                     // bonnet
    g.add(box(w * 0.58, 0.06, 0.04, 0xd8d2c4, 0, 0.66, 0.78));                 // grille
    for (const sx of [-w * 0.22, w * 0.22]) {                                  // headlamps
      const l = cyl(0.055, 0.055, 0.03, 0xf6efd2, sx, 0.74, 0.77, 10); l.rotation.x = Math.PI / 2; g.add(l);
    }
    g.add(cyl(0.035, 0.035, 0.30, 0x6f7479, w * 0.26, 0.94, 0.36, 8));         // exhaust stack
    g.add(cyl(0.048, 0.042, 0.05, 0x4a4a4a, w * 0.26, 1.11, 0.36, 8));         // its rain cap
    g.add(cyl(0.05, 0.05, 0.02, 0x1f1f1f, -w * 0.24, 0.81, 0.42, 8));          // fuel cap
    const col = cyl(0.032, 0.036, 0.42, 0x4a4a4a, 0, 0.66, 0.2, 8); col.rotation.x = -0.42; g.add(col);
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 14), mat(0x222));
    sw.rotation.x = 1.1; sw.position.set(0, 0.85, 0.15); g.add(sw);
    const boss = cyl(0.05, 0.05, 0.02, 0x333, 0, 0.85, 0.152, 8); boss.rotation.x = 1.1; g.add(boss);
    g.add(box(0.5, 0.08, 0.46, 0x333, 0, 0.7, -0.45));                         // seat pan
    const back = box(0.5, 0.42, 0.09, 0x333, 0, 0.9, -0.66); back.rotation.x = 0.16; g.add(back);
    g.add(box(0.54, 0.03, 0.5, 0x2a2a2a, 0, 0.655, -0.45));                    // seat frame
    g.add(box(0.46, 0.04, 0.3, 0x3a3d40, 0, 0.34, 0.62));                      // footplate
    const lift = cyl(0.016, 0.016, 0.34, 0x8a8f94, w * 0.3, 0.82, -0.28, 6); lift.rotation.x = -0.3; g.add(lift);
    g.add(sph(0.03, 0xc9302c, w * 0.3, 0.98, -0.33, 7));                       // deck-lift knob
    for (const sx of [-1, 1]) g.add(box(0.06, 0.20, 0.42, 0x3a3d40, sx * w * 0.44, 0.62, -0.42));  // fenders
    // rear catcher — same fill contract as the walk-behind bag (game drives .scale via userData.bag)
    const bagG = new THREE.Group(); bagG.position.set(0, 0.72, -0.82); g.add(bagG);
    const bin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.3), mat(0x565e42)); bin.position.set(0, -0.16, -0.02); bagG.add(bin);
    bagG.add(box(0.62, 0.03, 0.32, 0x8a8f94, 0, 0, -0.02));
    g.userData.bag = bagG;
    g.userData.bagLocal = { y: 0.72, z: -0.82 }; // mouth, in mower-local space (+z forward)
    g.userData.deckLocal = 0.35;                 // the cutting deck's centre — the cut must land HERE
    for (const [x, z, r] of [[-w / 2 + 0.1, 0.75, 0.16], [w / 2 - 0.1, 0.75, 0.16], [-w / 2 + 0.05, -0.5, 0.24], [w / 2 - 0.05, -0.5, 0.24]]) {
      roadWheel(g, x, z, r, r < 0.2 ? 0.12 : 0.18, 0xb0b6bb);
    }
    wearMarks(g, w * 0.7, 1, 71, 0.575);

  } else if (gear === 'hover') {
    // ---- THE HOVER: no wheels, none, ever. A shell on a cushion of air, one pole, and it
    // rides a few centimetres off the grass — the lift is baked into the geometry.
    const R = w / 2, L = 0.07;
    g.add(cyl(R * 0.98, R * 0.86, 0.09, 0x2b2b2b, 0, L + 0.05, 0, 20));        // the skirt
    g.add(cyl(R, R * 0.99, 0.10, deckC, 0, L + 0.15, 0, 20));                  // the shell
    g.add(cyl(R * 0.62, R * 0.66, 0.10, deckC, 0, L + 0.25, 0, 16));           // motor hump
    g.add(cyl(R * 0.66, R * 0.66, 0.015, 0x1f1f1f, 0, L + 0.305, 0, 16));      // intake grille
    for (let i = 0; i < 9; i++) {
      const v = box(R * 0.5, 0.012, 0.022, 0x8a8f94, 0, L + 0.312, 0); v.rotation.y = i * 0.349; g.add(v);
    }
    g.add(cyl(R * 0.2, R * 0.2, 0.05, 0x9aa0a6, 0, L + 0.35, 0, 12));          // hub cap
    g.add(box(R * 1.1, 0.02, 0.05, 0xe8e2d2, 0, L + 0.205, R * 0.72));         // badge band
    const Py = L + 0.28, Pz = 0, Gy = 1.05, Gz = -0.8;
    const ang = Math.atan2(Gz - Pz, Gy - Py), len = Math.hypot(Gy - Py, Gz - Pz);
    const pole = cyl(0.021, 0.021, len, 0x8a8f94, 0, (Py + Gy) / 2, (Pz + Gz) / 2, 8); pole.rotation.x = ang; g.add(pole);
    const flex = cyl(0.007, 0.007, len * 0.9, 0x2b2b2b, 0.026, (Py + Gy) / 2, (Pz + Gz) / 2 + 0.01, 4); flex.rotation.x = ang; g.add(flex);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 6, 16), mat(0x333));
    loop.position.set(0, Gy - 0.02, Gz); loop.rotation.x = Math.PI / 2 + ang; g.add(loop);
    g.add(box(0.06, 0.03, 0.014, 0x1f1f1f, 0.07, Gy - 0.06, Gz + 0.03));       // trigger
    const bagG = new THREE.Group(); bagG.position.set(0, 0.5, -0.42); g.add(bagG);   // a pouch, not a box
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat(0x565e42));
    pouch.scale.set(1, 0.8, 0.72); pouch.position.set(0, -0.14, 0); bagG.add(pouch);
    bagG.add(cyl(0.15, 0.15, 0.02, 0x8a8f94, 0, 0, 0, 12));
    g.userData.bag = bagG; g.userData.bagLocal = { y: 0.5, z: -0.42 };
    g.userData.deckLocal = 0;

  } else if (gear === 'tweezer') {
    // ---- THE TWEEZERS: a 22 cm head on a battery wand. Gordon asked for the smallest thing
    // you have, and he meant it.
    const R = w / 2;
    g.add(cyl(R, R * 0.94, 0.05, deckC, 0, 0.09, 0, 14));                      // head shroud
    g.add(cyl(R * 0.96, R * 0.96, 0.010, 0x9aa0a6, 0, 0.055, 0, 14));          // the blade disc
    for (let i = 0; i < 3; i++) { const b = box(R * 1.7, 0.006, 0.014, 0xd8d2c4, 0, 0.052, 0); b.rotation.y = i * 1.047; g.add(b); }
    g.add(cyl(R * 0.34, R * 0.34, 0.04, 0x2b2b2b, 0, 0.13, 0, 10));            // motor can
    g.add(box(0.05, 0.012, 0.03, 0xf2efd8, 0, 0.10, R * 0.9));                 // the little work light
    const Ay = 0.13, Az = 0, Gy = 1.02, Gz = -0.66;
    const ang = Math.atan2(Gz - Az, Gy - Ay), len = Math.hypot(Gy - Ay, Gz - Az);
    const sh2 = cyl(0.014, 0.017, len, 0xb0b6bb, 0, (Ay + Gy) / 2, (Az + Gz) / 2, 7); sh2.rotation.x = ang; g.add(sh2);
    const grip = box(0.055, 0.16, 0.07, 0x35383b, 0, Gy - 0.05, Gz - 0.02); grip.rotation.x = ang * 0.4; g.add(grip);
    g.add(box(0.07, 0.09, 0.10, 0x2b2b2b, 0, Gy - 0.14, Gz - 0.06));           // battery pack
    g.add(box(0.02, 0.012, 0.02, 0x4fd07a, 0.04, Gy - 0.12, Gz - 0.01));       // its charge light
    const bagG = new THREE.Group(); bagG.position.set(0, 0.30, -0.2); g.add(bagG);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.11, 10), mat(0x565e42));
    cup.position.set(0, -0.06, 0); bagG.add(cup);
    bagG.add(cyl(0.072, 0.072, 0.012, 0x8a8f94, 0, 0, 0, 10));
    g.userData.bag = bagG; g.userData.bagLocal = { y: 0.30, z: -0.2 };
    g.userData.deckLocal = 0;

  } else {
    // ---- THE WALK-BEHINDS: one frame, four genuinely different machines on top of it ----
    const S = MOWERS[gear] || MOWERS.push, k = S.k, d = w * 0.82;
    g.add(box(w, 0.16, d, deckC, 0, 0.18, 0));                             // the deck
    g.add(box(w * 0.96, 0.07, w * 0.78, 0x2b2b2b, 0, 0.10, 0));            // the shadowed lip under it
    // ⚠️ NO full-width top plate here. A dark plate over the whole deck hid the paint, which
    // is an earned reward — the machine read as one grey blob. Only a rim rail and the
    // engine's own plate sit on top; the deck colour is the thing you see.
    for (const sz of [d * 0.48, -d * 0.48]) g.add(box(w * 0.99, 0.035, 0.04, 0x1f1f1f, 0, 0.265, sz));
    for (const sx of [-w * 0.49, w * 0.49]) g.add(box(0.04, 0.035, d * 0.99, 0x1f1f1f, sx, 0.265, 0));
    for (let i = 0; i < S.spindles; i++) {                                 // one bump per blade — the Wide-Deck has two
      const sx = S.spindles === 1 ? 0 : (i - (S.spindles - 1) / 2) * (w / S.spindles) * 0.9;
      g.add(cyl(0.055 * k, 0.07 * k, 0.05 * k, 0x4a4a4a, sx, 0.28, -d * 0.12, 10));
    }
    // ---- the engine, which is the bit you look at ----
    const ex = 0.06 * k, ey = 0.26;
    g.add(box(0.30 * k, 0.10, 0.28 * k, 0x3a3a3a, ex, ey + 0.02, 0.04));                        // engine deck plate
    g.add(cyl(0.13 * k, 0.15 * k, 0.16 * k, 0x2c2c2c, ex + 0.02, ey + 0.08 * k, 0.05, 10));     // block
    for (let i = 0; i < 4; i++) g.add(box(0.005, 0.09 * k, 0.24 * k, 0x4a4a4a, ex - 0.04 + i * 0.03 * k, ey + 0.14 * k, 0.05)); // cooling fins
    g.add(cyl(0.045 * k, 0.045 * k, 0.1 * k, 0x555, ex + 0.02, ey + 0.18 * k, 0.05, 8));        // filler neck
    g.add(cyl(0.05 * k, 0.05 * k, 0.02, 0x1f1f1f, ex + 0.02, ey + 0.24 * k, 0.05, 8));          // fuel cap
    g.add(box(0.13 * k, 0.11 * k, 0.13 * k, 0xb8b3a8, ex - 0.12 * k, ey + 0.10 * k, 0.02));     // air filter housing
    const muff = cyl(0.035 * k, 0.035 * k, 0.16 * k, 0x8a8f94, ex + 0.13 * k, ey + 0.04, 0.02, 8);
    if (S.wear > 3) muff.rotation.z = 0.18;                                                     // Old Faithful's is bent
    g.add(muff);
    g.add(cyl(0.022 * k, 0.022 * k, 0.06 * k, 0x5f5f5f, ex + 0.13 * k, ey + 0.04, -0.09, 6));   // exhaust tip
    g.add(box(0.03, 0.05, 0.03, 0xd8d2c4, ex - 0.04, ey + 0.12 * k, -0.09));                    // spark plug cap
    // pull-cord: the handle sits proud on its little bracket, cord running to the shroud
    g.add(cyl(0.012, 0.012, 0.13 * k, 0xe8e2d2, ex + 0.14 * k, ey + 0.15 * k, 0.10, 5));
    const pull = cyl(0.018, 0.018, 0.09 * k, 0x9c7a4f, ex + 0.14 * k, ey + 0.22 * k, 0.10, 6); pull.rotation.z = Math.PI / 2; g.add(pull);
    // a maker's badge on the deck nose — every mower in the world has one, and this one's faded
    g.add(box(Math.min(w * 0.34, 0.30), 0.012, 0.07, S.wear > 3 ? 0xbdb6a4 : 0xe8e2d2, 0, 0.27, d * 0.4));
    // side discharge chute, angled out over the cut
    const chute = box(0.16 * k, 0.13 * k, 0.22 * k, deckC, w * 0.5, 0.20, -0.02);
    chute.rotation.z = -0.35; g.add(chute);
    g.add(box(0.17 * k, 0.02, 0.23 * k, 0x2b2b2b, w * 0.53, 0.15, -0.02));
    // wheels: drive machines run bigger rears, and every wheel gets its height-adjust lever
    const fr = S.wheel, rr = S.drive ? S.wheel * 1.35 : S.wheel;
    for (const [x, z, r] of [[-w / 2 + 0.06 * k, d * 0.4, fr], [w / 2 - 0.06 * k, d * 0.4, fr],
                             [-w / 2 + 0.06 * k, -d * 0.4, rr], [w / 2 - 0.06 * k, -d * 0.4, rr]]) {
      roadWheel(g, x, z, r, 0.055 * k);
      // ⚠️ OUTBOARD of the deck, on the wheel bracket. Tucked inboard they sat INSIDE the
      // deck box and all you ever saw was the red knob poking through the paint.
      heightLever(g, x + Math.sign(x) * 0.075 * k, z * 0.74, k, x < 0);
    }
    if (S.drive) {   // the belt cover along the deck TOP, and the transmission it runs into
      g.add(box(0.11 * k, 0.055, d * 0.55, 0x35383b, -w * 0.2, 0.29, -d * 0.16));
      g.add(box(0.13 * k, 0.03, 0.10 * k, 0x8a8f94, -w * 0.2, 0.32, -d * 0.40));
      g.add(box(w * 0.46, 0.10 * k, 0.12 * k, 0x35383b, -w * 0.02, 0.19, -d * 0.44));    // the axle housing
      const pul = cyl(rr * 0.55, rr * 0.55, 0.02, 0x4a4a4a, -w / 2 + 0.12 * k, rr, -d * 0.4, 10);
      pul.rotation.z = Math.PI / 2; g.add(pul);
    }
    // ---- the handle: two tubes from the deck's rear edge up to the grip in your hands ----
    const Ay = 0.24, Az = -d * 0.5 + 0.02;
    const Gy = 1.05, Gz = -0.84;
    const hang = Math.atan2(Gz - Az, Gy - Ay);
    const hl = Math.hypot(Gy - Ay, Gz - Az);
    const hw = S.handle === 'levers' ? 0.34 : 0.17;
    for (const sx of [-hw, hw]) { const h = cyl(0.018 * k, 0.018 * k, hl, 0x8a8f94, sx, (Ay + Gy) / 2, (Az + Gz) / 2, 6); h.rotation.x = hang; g.add(h); }
    // throttle cable: off the engine, clipped up the right tube, to the lever under the grip
    const cab = cyl(0.006, 0.006, hl * 0.92, 0x2b2b2b, hw + 0.022, (Ay + Gy) / 2 + 0.02, (Az + Gz) / 2 + 0.012, 4);
    cab.rotation.x = hang; g.add(cab);
    const drop = cyl(0.006, 0.006, 0.30, 0x2b2b2b, ex + 0.10 * k, ey + 0.10, -0.16, 4);
    drop.rotation.set(-0.8, 0, -0.5); g.add(drop);
    for (const t of [0.34, 0.68]) g.add(box(0.026, 0.013, 0.013, 0x1f1f1f, hw + 0.012, Ay + (Gy - Ay) * t + 0.02, Az + (Gz - Az) * t + 0.006));
    g.add(box(0.06, 0.022, 0.014, 0x1f1f1f, hw - 0.06, Gy - 0.03, Gz + 0.05));   // the throttle lever itself
    if (S.handle === 'levers') {
      // the Titan is steered on two drive levers, not pushed on a bar
      for (const sx of [-hw, hw]) {
        const lv = cyl(0.016, 0.016, 0.30, 0x35383b, sx, Gy - 0.06, Gz + 0.06, 6); lv.rotation.x = -0.5; g.add(lv);
        g.add(box(0.07, 0.05, 0.14, 0x222, sx, Gy + 0.06, Gz - 0.04));
      }
      g.add(box(0.30, 0.10, 0.05, 0x3a3d40, 0, Gy - 0.02, Gz + 0.02));           // control panel between them
      g.add(cyl(0.02, 0.02, 0.02, 0xc9302c, -0.07, Gy + 0.04, Gz + 0.02, 8));    // kill switch
      g.add(cyl(0.02, 0.02, 0.02, 0x4fd07a, 0.07, Gy + 0.04, Gz + 0.02, 8));
    } else {
      const grip = cyl(0.026, 0.026, hw * 2.7, 0x333, 0, Gy, Gz, 8); grip.rotation.z = Math.PI / 2; g.add(grip);
      if (S.wear > 3) for (const sx of [-0.13, 0.13]) {                           // Old Faithful's taped grip
        const tp = cyl(0.030, 0.030, 0.07, 0x2b2b2b, sx, Gy, Gz, 8); tp.rotation.z = Math.PI / 2; g.add(tp);
      }
      const cross = cyl(0.014 * k, 0.014 * k, hw * 2, 0x8a8f94, 0, Ay + (Gy - Ay) * 0.38, Az + (Gz - Az) * 0.38, 6); cross.rotation.z = Math.PI / 2; g.add(cross);
      if (S.handle === 'brace') {   // commercial kit: a second brace and rubber hand pads
        const c2 = cyl(0.013 * k, 0.013 * k, hw * 2, 0x8a8f94, 0, Ay + (Gy - Ay) * 0.68, Az + (Gz - Az) * 0.68, 6); c2.rotation.z = Math.PI / 2; g.add(c2);
        for (const sx of [-0.2, 0.2]) { const p = cyl(0.032, 0.032, 0.13, 0x1f1f1f, sx, Gy, Gz, 8); p.rotation.z = Math.PI / 2; g.add(p); }
      }
      if (S.handle === 'bail') {    // the self-propelled's drive bail, hooped over the grip
        const b = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 5, 14, Math.PI), mat(0x35383b));
        b.position.set(0, Gy + 0.02, Gz + 0.09); b.rotation.set(-1.2, 0, 0); g.add(b);
      }
    }
    // rear grass bag — hangs from the tubes behind the deck; the game inflates it as it fills
    const bagG = new THREE.Group(); bagG.position.set(0, 0.62, (Az + Gz) / 2 + 0.02); g.add(bagG);
    const bagW = Math.min(0.80, 0.34 * (0.6 + w * 0.9));
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(bagW, 0.36, 0.30), mat(0x565e42)); cloth.position.set(0, -0.20, 0.02); cloth.rotation.x = hang * 0.4; bagG.add(cloth);
    const rim = box(bagW + 0.03, 0.028, 0.32, 0x8a8f94, 0, 0, 0.02); rim.rotation.x = hang * 0.4; bagG.add(rim);
    bagG.add(box(bagW * 0.5, 0.02, 0.03, 0x8a8f94, 0, -0.30, 0.16));            // the bag's carry strap
    // the duct from the deck's rear opening up into the bag mouth — without it the bag
    // reads as a box floating behind the machine
    const duct = box(bagW * 0.6, 0.13, 0.30, 0x2f3330, 0, 0.34, Az - 0.1);
    duct.rotation.x = -0.6; g.add(duct);
    g.userData.bag = bagG;
    g.userData.bagLocal = { y: 0.62, z: (Az + Gz) / 2 + 0.02 }; // mouth, in mower-local space (+z forward)
    g.userData.deckLocal = 0;                                   // deck box sits at the group origin
    wearMarks(g, w, S.wear, 1957, 0.272, S.wear);
    if (S.wear > 3) {                                           // and the dent Pop never hammered out
      const dent = box(0.12, 0.05, 0.16, 0x8f2f26, -w * 0.46, 0.19, d * 0.2); dent.rotation.z = 0.25; g.add(dent);
    }
  }
  // soft contact shadow — polygonOffset, never a raised Y (it depth-fails on real ground)
  const sh = new THREE.Mesh(new THREE.CircleGeometry(w * 0.72, 18),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: gear === 'hover' ? 0.16 : 0.28, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.01; g.add(sh);
  g.traverse(m => { if (m.isMesh && m !== sh) m.castShadow = true; });
  return g;
}
export function makeTrimmer() {
  const g = new THREE.Group();
  const shaft = cyl(0.02, 0.02, 1.25, 0xe8792c, 0, 0, 0, 7); shaft.rotation.x = Math.PI / 2 - 0.5; shaft.position.set(0, 0, -0.1); g.add(shaft);
  const head = cyl(0.1, 0.12, 0.06, 0x2c2c2c, 0, -0.27, 0.44, 10); g.add(head);
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.03, 12, 1, false, 0, Math.PI), mat(0x3e7247)); guard.position.set(0, -0.25, 0.38); g.add(guard);
  const line = box(0.4, 0.008, 0.008, 0xe8e4d0, 0, -0.3, 0.44); line.userData.line = true; g.add(line);
  return g;
}

// ---------------- yard builder ----------------
export function buildYard(scene, def, grass, quality) {
  const world = { colliders: [], rects: [], group: new THREE.Group(), sway: [], swayRoots: [] };
  scene.add(world.group);
  const W = def.lot.w, H = def.lot.h;

  // --- ground: painted lawn canvas ---
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * H / W);
  const x = c.getContext('2d'); const px = c.width / W;
  x.fillStyle = '#67953f'; x.fillRect(0, 0, c.width, c.height);
  const rng = mulberry(def.seed || 42);
  for (let i = 0; i < 2600; i++) { // mottling
    x.fillStyle = `rgba(${40 + rng() * 40 | 0},${90 + rng() * 50 | 0},${30 + rng() * 30 | 0},${0.05 + rng() * 0.10})`;
    const rr = 4 + rng() * 26; x.beginPath(); x.arc(rng() * c.width, rng() * c.height, rr, 0, 7); x.fill();
  }
  // worn dirt blotches
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(122,94,60,0.10)'; x.beginPath(); x.arc(rng() * c.width, rng() * c.height, 24 + rng() * 40, 0, 7); x.fill(); }
  // paths (flagstone)
  for (const p of def.paths || []) {
    x.fillStyle = p.c || '#b9b2a4';   // dirt tracks and infields are not flagstone grey
    if (p.stones) {
      const n = Math.max(3, Math.round(Math.max(p.w, p.h) / 0.8));
      for (let i = 0; i < n; i++) {
        const sx = (p.x + (p.w > p.h ? (i + .5) / n * p.w : p.w / 2)) * px;
        const sz = (p.z + (p.h >= p.w ? (i + .5) / n * p.h : p.h / 2)) * px;
        x.beginPath(); x.ellipse(sx, sz, 0.34 * px, 0.28 * px, rng(), 0, 7); x.fill();
      }
    } else x.fillRect(p.x * px, p.z * px, p.w * px, p.h * px);
    grass.noGrassRect(p.x, p.z, p.w, p.h);
  }
  const gtex = new THREE.CanvasTexture(c); gtex.colorSpace = THREE.SRGBColorSpace;
  const T = grass.terrain && grass.terrain.enabled ? grass.terrain : null;
  const groundGeo = T
    ? drapePlane(new THREE.PlaneGeometry(W, H, Math.ceil(W * 2), Math.ceil(H * 2)), T, W, H)
    : new THREE.PlaneGeometry(W, H);
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ map: gtex }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true;
  world.group.add(ground); world.ground = ground;

  // --- surround: street, sidewalk, neighbor silhouettes, horizon ---
  const sur = new THREE.Group(); world.group.add(sur);
  // no tarmac where there is no street (see the same list in street.js — kept literal here
  // rather than importing hood.js, which would make props <-> hood circular)
  if (!['parkland', 'openfield', 'water', 'city', 'orchardland'].includes(def.hood)) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(W + 24, 5), mat(0x4a4a4e)); road.rotation.x = -Math.PI / 2; road.position.set(W / 2, -0.02, -4.4); sur.add(road);
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(W + 24, 1.6), mat(0xbdb6a6)); walk.rotation.x = -Math.PI / 2; walk.position.set(W / 2, -0.01, -1.1); sur.add(walk);
  }
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 60), mat(0x5c8747)); apron.rotation.x = -Math.PI / 2; apron.position.set(W / 2, -0.03, H + 30); sur.add(apron);
  const apron2 = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 24), mat(0x5c8747)); apron2.rotation.x = -Math.PI / 2; apron2.position.set(W / 2, -0.03, -18.8); sur.add(apron2);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(30, H + 90), mat(0x5c8747)); side.rotation.x = -Math.PI / 2; side.position.set(sx < 0 ? -15.2 : W + 15.2, -0.03, H / 2 - 10); sur.add(side); }
  // the neighbourhood across the street (houses, drives, traffic, people) is street.js —
  // game.js builds it right after this, so it can push its windows into world.windows
  // water tower on the hill
  const wt = new THREE.Group();
  wt.add(cyl(1.6, 1.9, 2.6, 0x9db3bd, 0, 9.4, 0, 10));
  wt.add(cone(1.95, 1.1, 0x86232a, 0, 11.6, 0, 10));
  for (const a of [0, 1.57, 3.14, 4.71]) wt.add(cyl(0.12, 0.12, 8.6, 0x7a8a92, Math.sin(a) * 1.2, 4.2, Math.cos(a) * 1.2, 6));
  wt.position.set(W + 26, 0, H + 34); world.group.add(wt);

  // --- house on the lot (door + porch face the street at -z) ---
  world.windows = [];
  if (def.house) {
    const hd = def.house, hg = new THREE.Group();
    const HW = hd.w, HD = hd.d, HH = hd.h || 2.9;
    const der = !!hd.derelict;
    const bodyC = der ? 0x9a988e : (hd.c || 0xe7dcc3);
    const roofC = der ? 0x4a463e : 0x6b5844;
    hg.add(box(HW + 0.2, 0.3, HD + 0.2, 0x8a8578, 0, 0.15, 0));            // foundation
    hg.add(box(HW, HH, HD, bodyC, 0, HH / 2 + 0.1, 0));
    const roof = gableRoof(HW, HD, HD * 0.42, roofC, bodyC); roof.position.y = HH + 0.1; hg.add(roof);
    if (hd.steeple) {
      hg.add(box(1.3, 2.4, 1.3, bodyC, 0, HH + 1.2, 0));
      hg.add(cone(1.0, 1.7, roofC, 0, HH + 3.2, 0, 4));
    } else if (!der) {
      hg.add(box(0.5, 1.3, 0.5, 0x8a5c4a, HW * 0.28, HH + 0.55, HD * 0.1)); // chimney
    }
    // windows (glow at golden hour) + shutters
    const winMat = new THREE.MeshLambertMaterial({ color: der ? 0x39414a : 0x8fb6c9 });
    world.windows.push(winMat);
    for (const sx of [-HW / 4, HW / 4]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.06), winMat); win.position.set(sx, 1.65, -HD / 2 - 0.03); hg.add(win);
      if (!der) for (const s2 of [-0.55, 0.55]) hg.add(box(0.16, 0.95, 0.05, hd.shutter || 0x5c7286, sx + s2, 1.65, -HD / 2 - 0.03));
      const sill = box(1.0, 0.07, 0.1, 0xf2ead8, sx, 1.12, -HD / 2 - 0.05); hg.add(sill);
    }
    // door — boarded over on the derelict
    hg.add(box(0.95, 1.95, 0.07, der ? 0x6a6459 : (hd.door || 0x7a4a33), HW * 0.02, 1.08, -HD / 2 - 0.04));
    if (der) { const b1 = box(1.3, 0.16, 0.05, 0x9c7a4f, 0, 1.3, -HD / 2 - 0.09); b1.rotation.z = 0.5; hg.add(b1); const b2 = box(1.3, 0.16, 0.05, 0x9c7a4f, 0, 1.0, -HD / 2 - 0.1); b2.rotation.z = -0.4; hg.add(b2); }
    // porch: slab, posts, awning
    const porch = new THREE.Mesh(new THREE.BoxGeometry(HW * 0.55, 0.16, 1.6), mat(der ? 0x8a8578 : 0xb59d78)); porch.position.set(0, 0.1, -HD / 2 - 0.85); porch.receiveShadow = true; hg.add(porch);
    for (const sx of [-HW * 0.24, HW * 0.24]) hg.add(cyl(0.06, 0.06, 2.0, der ? 0x8a8578 : 0xe3dbc8, sx, 1.1, -HD / 2 - 1.5, 7));
    hg.add(box(HW * 0.58, 0.1, 1.8, roofC, 0, 2.14, -HD / 2 - 0.9));
    hg.position.set(hd.x, 0, hd.z);
    hg.traverse(m => { if (m.isMesh) { m.castShadow = true; } });
    world.group.add(hg); world.house = hg;
    grass.noGrassRect(hd.x - HW / 2 - 0.3, hd.z - HD / 2 - 2.0, HW + 0.6, HD + 2.4);
    // the walls themselves, with only a hair of margin, so you can mow the full way in
    world.rects.push({ x0: hd.x - HW / 2 - 0.08, x1: hd.x + HW / 2 + 0.08, z0: hd.z - HD / 2 - 0.08, z1: hd.z + HD / 2 + 0.08 });
    // The porch stays a CIRCLE. As a rect it butted against the house rect, and two
    // touching rects resolved in sequence shove a body back and forth between them —
    // it settled inside. One rect (the house) plus one circle can't do that, and the
    // porch is round-ish, small, and sits on no-grass anyway.
    world.colliders.push({ x: hd.x, z: hd.z - HD / 2 - 0.85, r: 0.9 });
  }

  // --- fence ---
  if (def.fence !== 'none') {
    const fg = new THREE.Group(); world.group.add(fg);
    const gate = def.gate || { x: W * 0.28, w: 1.4 };
    const kind = def.fence || 'picket';
    const post = (px2, pz) => { fg.add(box(0.09, 0.85, 0.09, kind === 'chain' ? 0x9aa0a6 : 0xe3dbc8, px2, 0.42, pz)); };
    const seg = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 2);
      for (let i = 0; i <= n; i++) post(x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ang = Math.atan2(x1 - x0, z1 - z0);
      if (kind === 'picket') {
        const pk = Math.floor(len / 0.24);
        for (let i = 0; i < pk; i++) { const t = (i + .5) / pk; const p = box(0.11, 0.68, 0.03, 0xefe8d6, x0 + (x1 - x0) * t, 0.4, z0 + (z1 - z0) * t); p.rotation.y = ang; fg.add(p); }
        for (const ry of [0.28, 0.58]) { const r = box(0.05, 0.07, len, 0xe3dbc8, mx, ry, mz); r.rotation.y = ang; fg.add(r); }
      } else if (kind === 'rail') {
        for (const ry of [0.3, 0.62]) { const r = box(0.07, 0.1, len, 0x9c7a4f, mx, ry, mz); r.rotation.y = ang; fg.add(r); }
      } else if (kind === 'chain') {
        const cc = document.createElement('canvas'); cc.width = 64; cc.height = 32; const cx3 = cc.getContext('2d');
        cx3.strokeStyle = 'rgba(190,196,204,0.9)'; cx3.lineWidth = 2;
        for (let i = -32; i < 64; i += 8) { cx3.beginPath(); cx3.moveTo(i, 0); cx3.lineTo(i + 32, 32); cx3.stroke(); cx3.beginPath(); cx3.moveTo(i + 32, 0); cx3.lineTo(i, 32); cx3.stroke(); }
        const ct = new THREE.CanvasTexture(cc); ct.wrapS = THREE.RepeatWrapping; ct.repeat.x = len / 1.2;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.8), new THREE.MeshBasicMaterial({ map: ct, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        mesh.position.set(mx, 0.45, mz); mesh.rotation.y = ang + Math.PI / 2; fg.add(mesh);
      }
    };
    // front (street side, with gate), back, left, right — all just inside the lot bounds
    seg(0.05, 0.05, gate.x, 0.05); seg(gate.x + gate.w, 0.05, W - 0.05, 0.05);
    seg(0.05, H - 0.05, W - 0.05, H - 0.05);
    seg(0.05, 0.05, 0.05, H - 0.05); seg(W - 0.05, 0.05, W - 0.05, H - 0.05);
    fg.traverse(m => { if (m.isMesh) m.castShadow = true; });
    grass.trimBorder(0.28);
    world.gate = gate;
  }

  // --- props from the def ---
  for (const p of def.props || []) {
    const b = PROPS[p.k]; if (!b) continue;
    const built = b(p.o || {});
    built.g.position.set(p.x, T ? T.heightAt(p.x, p.z) : 0, p.z);   // props stand ON the ground
    if (p.rot) built.g.rotation.y = p.rot;
    if (p.s) built.g.scale.setScalar(p.s);
    world.group.add(built.g);
    world.swayRoots.push(built.g);   // life.js finds the leafy bits and gives them the wind
    const s = p.s || 1;
    const cs = Math.cos(p.rot || 0), sn = Math.sin(p.rot || 0);
    const tf = (lx, lz) => [p.x + (lx * cs + lz * sn) * s, p.z + (-lx * sn + lz * cs) * s];
    for (const col of built.col) { const [wx, wz] = tf(col.x, col.z); world.colliders.push({ x: wx, z: wz, r: col.r * s }); }
    for (const ng of built.noGrass || []) { const [wx, wz] = tf(ng.x, ng.z); grass.noGrassCircle(wx, wz, ng.r * s); }
    for (const tr of built.trim || []) { const [wx, wz] = tf(tr.x, tr.z); grass.trimRing(wx, wz, tr.rIn * s, tr.rOut * s); }
  }

  // --- sky + light ---
  const sc = document.createElement('canvas'); sc.width = 16; sc.height = 256; const sx2 = sc.getContext('2d');
  const gr = sx2.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#5d9fc8'); gr.addColorStop(0.22, '#79b7d6'); gr.addColorStop(0.48, '#a9d4e8');
  gr.addColorStop(0.66, '#cfe6ee'); gr.addColorStop(0.82, '#e8ecd2'); gr.addColorStop(1, '#f6e8c2');
  sx2.fillStyle = gr; sx2.fillRect(0, 0, 16, 256);
  const skyTex = new THREE.CanvasTexture(sc); skyTex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 20, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }));
  sky.position.set(W / 2, 0, H / 2); world.group.add(sky); world.sky = sky;
  // clouds — three layers at different heights, sizes and speeds (game drifts them by
  // userData.spd, so the sky has parallax instead of one sheet sliding along)
  world.clouds = [];
  const LAYERS = [
    { n: 6, y: 19, yv: 6, s: 1.7, op: 0.90, spd: 1.15, puff: 5 },   // low, fat, quickest
    { n: 5, y: 33, yv: 10, s: 2.6, op: 0.74, spd: 0.62, puff: 5 },  // mid
    { n: 4, y: 52, yv: 12, s: 3.8, op: 0.40, spd: 0.28, puff: 6 },  // high thin cirrus
  ];
  let ci = 0;
  for (const L of LAYERS) for (let i = 0; i < L.n; i++, ci++) {
    const cl = new THREE.Group(); const crng = mulberry(ci * 31 + 7);
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: L.op, fog: false, depthWrite: false });
    for (let j = 0; j < L.puff; j++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry((2.4 + crng() * 3.6) * L.s, 8, 6), m);
      p.position.set(j * 4 * L.s - 6 * L.s + crng() * 2, crng() * 1.4, crng() * 2 * L.s);
      cl.add(p);
    }
    cl.position.set(W / 2 - 90 + ci * 17 + crng() * 10, L.y + crng() * L.yv, H / 2 - 80 + crng() * 60);
    cl.scale.y = L.s > 2 ? 0.2 : 0.45;
    cl.userData.spd = L.spd * (0.8 + crng() * 0.5);
    cl.renderOrder = -1;
    world.group.add(cl); world.clouds.push(cl);
  }
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(7, 24), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false, transparent: true, opacity: 0.95 }));
  sunDisc.position.set(W / 2 + 62, 52, H / 2 - 66); sunDisc.lookAt(W / 2, 0, H / 2); world.group.add(sunDisc); world.sunDisc = sunDisc;
  const hemi = new THREE.HemisphereLight(0xd6ecf5, 0x5d7a44, 0.95); scene.add(hemi); world.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff2dc, 1.65);
  sun.position.set(W / 2 + 14, 22, H / 2 - 10); sun.target.position.set(W / 2, 0, H / 2);
  sun.castShadow = true; sun.shadow.mapSize.set(quality === 'low' ? 1024 : 2048, quality === 'low' ? 1024 : 2048);
  const ext = Math.max(W, H) * 0.72;
  sun.shadow.camera.left = -ext; sun.shadow.camera.right = ext; sun.shadow.camera.top = ext; sun.shadow.camera.bottom = -ext;
  sun.shadow.camera.far = 80; sun.shadow.bias = -0.0015;
  scene.add(sun); scene.add(sun.target); world.sun = sun;
  scene.fog = new THREE.Fog(0xcfe3e0, 60, 150);
  world.fog = scene.fog;
  return world;
}
