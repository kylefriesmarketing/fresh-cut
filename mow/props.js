// FRESH CUT — props.js
// The procedural prop kit + yard builder. Storybook Americana from primitives.
// Every prop registers collision circles; some claim no-grass footprints and trim rings.
import * as THREE from 'three';
import { mulberry } from './grass.js';

const MATS = {};
export function mat(hex, opts = {}) {
  const k = hex + JSON.stringify(opts);
  if (!MATS[k]) MATS[k] = new THREE.MeshLambertMaterial({ color: hex, ...opts });
  return MATS[k];
}
function box(w, h, d, hex, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
function cyl(r1, r2, h, hex, x = 0, y = 0, z = 0, seg = 10) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
function sph(r, hex, x = 0, y = 0, z = 0, seg = 9) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }
function cone(r, h, hex, x = 0, y = 0, z = 0, seg = 9) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(hex)); m.position.set(x, y, z); m.castShadow = true; return m; }


// gable roof: two sloped panels + end gables + ridge cap (box normals light cleanly)
function gableRoof(w, d, rise, roofC, gableC) {
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

// ---------------- mowers & trimmer ----------------
export function makeMower(gear) {
  const g = new THREE.Group();
  const deckC = { push: 0xc0392b, self: 0x3e7247, wide: 0xe8792c, rider: 0xc0392b }[gear] || 0xc0392b;
  const w = { push: 0.55, self: 0.55, wide: 0.78, rider: 1.15 }[gear] || 0.55;
  if (gear === 'rider') {
    g.add(box(w * 0.8, 0.3, 1.5, deckC, 0, 0.42, 0.1));
    g.add(box(w * 0.85, 0.16, 0.8, 0x2c2c2c, 0, 0.2, 0.35));
    g.add(box(0.5, 0.4, 0.5, 0x333, 0, 0.75, -0.45)); // seat
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 14), mat(0x222)); sw.rotation.x = 1.1; sw.position.set(0, 0.85, 0.15); g.add(sw);
    for (const [x, z, r] of [[-w / 2 + 0.1, 0.75, 0.16], [w / 2 - 0.1, 0.75, 0.16], [-w / 2 + 0.05, -0.5, 0.24], [w / 2 - 0.05, -0.5, 0.24]]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 12), mat(0x2c2c2c)); wh.rotation.z = Math.PI / 2; wh.position.set(x, r, z); wh.userData.wheel = r; g.add(wh);
    }
  } else {
    const deck = box(w, 0.16, w * 0.82, deckC, 0, 0.18, 0); g.add(deck);
    g.add(cyl(0.13, 0.15, 0.16, 0x2c2c2c, 0.08, 0.34, 0.05, 10)); // engine
    g.add(cyl(0.045, 0.045, 0.1, 0x555, 0.08, 0.44, 0.05, 8));
    if (gear === 'self') g.add(box(0.3, 0.34, 0.24, 0x2c3b45, 0, 0.32, -w * 0.41 - 0.1)); // bag
    for (const [x, z] of [[-w / 2 + 0.06, w * 0.33], [w / 2 - 0.06, w * 0.33], [-w / 2 + 0.06, -w * 0.33], [w / 2 - 0.06, -w * 0.33]]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), mat(0x2c2c2c)); wh.rotation.z = Math.PI / 2; wh.position.set(x, 0.09, z); wh.userData.wheel = 0.09; g.add(wh);
    }
    // handle back toward the player
    for (const sx of [-0.16, 0.16]) { const h = cyl(0.018, 0.018, 1.15, 0x8a8f94, sx, 0.62, -0.52, 6); h.rotation.x = 0.62; g.add(h); }
    const grip = cyl(0.024, 0.024, 0.42, 0x333, 0, 0.98, -0.83, 6); grip.rotation.z = Math.PI / 2; g.add(grip);
    if (gear === 'push') { // Old Faithful's dents & rust patch
      g.add(box(0.12, 0.02, 0.1, 0x8f5b3a, -0.12, 0.27, 0.12));
    }
  }
  // soft contact shadow — polygonOffset, never a raised Y (it depth-fails on real ground)
  const sh = new THREE.Mesh(new THREE.CircleGeometry(w * 0.72, 18),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
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
  const world = { colliders: [], group: new THREE.Group(), sway: [] };
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
    x.fillStyle = '#b9b2a4';
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
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: gtex }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true;
  world.group.add(ground); world.ground = ground;

  // --- surround: street, sidewalk, neighbor silhouettes, horizon ---
  const sur = new THREE.Group(); world.group.add(sur);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(W + 24, 5), mat(0x4a4a4e)); road.rotation.x = -Math.PI / 2; road.position.set(W / 2, -0.02, -4.4); sur.add(road);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(W + 24, 1.6), mat(0xbdb6a6)); walk.rotation.x = -Math.PI / 2; walk.position.set(W / 2, -0.01, -1.1); sur.add(walk);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 60), mat(0x5c8747)); apron.rotation.x = -Math.PI / 2; apron.position.set(W / 2, -0.03, H + 30); sur.add(apron);
  const apron2 = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 24), mat(0x5c8747)); apron2.rotation.x = -Math.PI / 2; apron2.position.set(W / 2, -0.03, -18.8); sur.add(apron2);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(30, H + 90), mat(0x5c8747)); side.rotation.x = -Math.PI / 2; side.position.set(sx < 0 ? -15.2 : W + 15.2, -0.03, H / 2 - 10); sur.add(side); }
  const nrng = mulberry((def.seed || 42) * 3 + 1);
  for (let i = 0; i < 5; i++) { // houses across the street
    const hw = 5 + nrng() * 3, hx = -12 + i * (W + 24) / 5 + nrng() * 3;
    const hh = 3 + nrng() * 1.4;
    const hb = box(hw, hh, 4.5, [0xd8cbb4, 0xc9d4dd, 0xd4c2c2, 0xcfd8c0][i % 4], hx, hh / 2, -11.5); sur.add(hb);
    const hr = gableRoof(hw, 4.5, 1.7, 0x6b5844, [0xd8cbb4, 0xc9d4dd, 0xd4c2c2, 0xcfd8c0][i % 4]); hr.position.set(hx, hh, -11.5); sur.add(hr);
    const tr = PROPS.tree({ s: 0.9 + nrng() * 0.5, seed: i * 9 + 2 }); tr.g.position.set(hx + hw / 2 + 1.5, 0, -9 - nrng() * 3); sur.add(tr.g);
  }
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
    for (let cx2 = -HW / 2 + 0.5; cx2 <= HW / 2 - 0.5 + 0.01; cx2 += 1) world.colliders.push({ x: hd.x + cx2, z: hd.z, r: HD / 2 + 0.25 });
    world.colliders.push({ x: hd.x, z: hd.z - HD / 2 - 0.85, r: 0.9 }); // porch
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
    built.g.position.set(p.x, 0, p.z);
    if (p.rot) built.g.rotation.y = p.rot;
    if (p.s) built.g.scale.setScalar(p.s);
    world.group.add(built.g);
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
  gr.addColorStop(0, '#79b7d6'); gr.addColorStop(0.55, '#bfe0ee'); gr.addColorStop(0.78, '#e8ecd2'); gr.addColorStop(1, '#f4e6c0');
  sx2.fillStyle = gr; sx2.fillRect(0, 0, 16, 256);
  const skyTex = new THREE.CanvasTexture(sc); skyTex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 20, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }));
  sky.position.set(W / 2, 0, H / 2); world.group.add(sky); world.sky = sky;
  // clouds (game drifts these)
  world.clouds = [];
  for (let i = 0; i < 6; i++) {
    const cl = new THREE.Group(); const crng = mulberry(i * 31 + 7);
    for (let j = 0; j < 4; j++) cl.add(new THREE.Mesh(new THREE.SphereGeometry(3 + crng() * 4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false })));
    cl.children.forEach((m, j) => m.position.set(j * 4 - 6 + crng() * 2, crng() * 1.4, crng() * 2));
    cl.position.set(W / 2 - 60 + i * 26, 26 + crng() * 12, H / 2 - 70 + crng() * 40);
    cl.scale.y = 0.45; world.group.add(cl); world.clouds.push(cl);
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
