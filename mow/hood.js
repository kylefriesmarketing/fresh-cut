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
  // ---- The Odd Sizes need backdrops that sell the SCALE joke ----
  indoor: {    // you are inside: a lounge, a club room, a model railway hall. No sky at all.
    residential: false, indoor: true, wallH: 9, wallC: 0xc9bda8, ceilC: 0xe4ddc9, skirtC: 0x8a7a63,
    body: [0xc9bda8], roof: [0x6a6258], rise: 0.3, w: [6, 8], h: [3, 4],
    tree: 'sparse', treeN: 0, hedge: 0, far: [], spacing: 20,
  },
  giant: {     // an ordinary street, except everything on it is enormous
    residential: false,
    body: [0xd8cbb4, 0xc9d4dd, 0xd4c2c2, 0xcfd8c0], roof: [0x6b5844, 0x574c46],
    rise: 9, w: [30, 52], h: [20, 34],
    tree: 'tall', treeN: 1, hedge: 0, far: ['roofs', 'trees'], spacing: 40,
    ringDens: 0.75, ringNear: 54, ringTreeScale: 9,
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

// ---- THE TOWN'S OWN SKYLINE ----
// Pop's route is not the goofy book. These are the things a small town actually puts on
// its horizon, and Hazel Park only has one of each — so the same water tower, the same
// spire and the same elevator recur from yard to yard at different bearings, which is
// exactly what living somewhere looks like. All built FRONT-TOWARD +Z (the player looks
// down -z at the street), and `h.rot` turns any of them.
const TOWN = {
  tower(g, s, h) {                              // the water tower: this town's whole silhouette
    const legR = 5.2 * s, tankY = 15 * s, steel = h.c2 || 0x8f9490;
    const tilt = Math.atan2(legR - 3.2 * s, tankY);
    for (let i = 0; i < 4; i++) {
      const hold = new THREE.Group(); hold.rotation.y = i * Math.PI / 2 + Math.PI / 4;
      const leg = cyl(0.30 * s, 0.42 * s, tankY, steel, (legR + 3.2 * s) / 2, tankY / 2, 0, 6);
      leg.rotation.z = tilt; hold.add(leg); g.add(hold);
    }
    for (const [y, r] of [[tankY * 0.42, 4.6 * s], [tankY * 0.78, 3.7 * s]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.11 * s, 4, 12), mat(steel));
      ring.position.y = y; ring.rotation.x = Math.PI / 2; g.add(ring);
    }
    g.add(cyl(0.5 * s, 0.5 * s, tankY, steel, 0, tankY / 2, 0, 8));          // the standpipe
    const c = h.c || 0xcfd4d2;
    // ⚠️ Object3D.add returns the PARENT. Chaining `.rotation.x` off it flipped the whole
    // tower under the ground — invisible, and it looked exactly like the hero never built.
    const und = cone(4.6 * s, 3.4 * s, c, 0, tankY + 1.7 * s, 0, 14);
    und.rotation.x = Math.PI; g.add(und);                                    // tank underside
    g.add(cyl(4.6 * s, 4.6 * s, 6.2 * s, c, 0, tankY + 6.5 * s, 0, 14));
    g.add(cyl(0.001, 4.6 * s, 2.2 * s, c, 0, tankY + 10.7 * s, 0, 14));      // the domed top
    g.add(cyl(4.75 * s, 4.75 * s, 1.5 * s, h.band || 0x4f7a8a, 0, tankY + 6 * s, 0, 14)); // the name band
    const walk = new THREE.Mesh(new THREE.TorusGeometry(5.0 * s, 0.09 * s, 4, 14), mat(steel));
    walk.position.y = tankY + 3.6 * s; walk.rotation.x = Math.PI / 2; g.add(walk);
  },
  elevator(g, s, h) {                           // the grain elevator on the rail line
    // ⚠️⚠️ THIS READ AS A GREEK TEMPLE for two versions. Six pale cylinders in a row, under
    // a slab wider than they are tall, with a base course under them, IS a portico — and my
    // first fix (a skirt across the silo bases) made it worse, because that skirt reads as
    // a stylobate. **The thing that separates an elevator from a temple is PROPORTION, not
    // detail**: fewer, slimmer, much taller silos (21 m wide × 30 m tall, not 31 × 22), a
    // headhouse that is taller than it is wide and spans only the middle, and dirty concrete
    // instead of marble. Verified by looking at it from two maps, which is how it was caught.
    const c = h.c || 0xc6c0b1, r = 2.7 * s, n = 5, span = (n - 1) * r * 1.96, H = 30 * s;
    for (let i = 0; i < n; i++) g.add(cyl(r, r, H, c, -span / 2 + i * r * 1.96, H / 2, 0, 12));
    g.add(box(span * 0.54, 13 * s, r * 2.4, 0xb5ae9e, 0, H + 6.5 * s, 0));   // headhouse, TALL
    g.add(box(span * 0.62, 0.8 * s, r * 3.0, 0x82796c, 0, H + 13.4 * s, 0)); // its eave
    g.add(box(3.4 * s, 7 * s, 3.4 * s, 0xa8a294, 0, H + 16.6 * s, 0));       // the leg that lifts the grain
    g.add(cone(3.0 * s, 2.6 * s, 0x6f6a60, 0, H + 21.4 * s, 0, 6));
    for (const sx of [-1, 1]) g.add(box(0.5 * s, 2.2 * s, 0.5 * s, 0x8f8578, sx * span * 0.2, H + 14.5 * s, 0)); // roof stubs
    g.add(box(span * 0.9, 2.6 * s, 0.5 * s, 0x8f8578, 0, H * 0.78, r * 1.02)); // the band the town's name is on
    // the conveyor gallery, sloping down to the tip shed — the other unmistakable bit
    const gal = box(1.8 * s, 2.0 * s, 17 * s, 0xa8a294, -span / 2 - 3.6 * s, 21 * s, r * 1.1);
    gal.rotation.x = 0.62; gal.rotation.y = 0.30; g.add(gal);
    g.add(box(10 * s, 5.5 * s, 8 * s, h.shed || 0x9c4f42, -span / 2 - 6 * s, 2.75 * s, r * 2.0));  // the tip shed
    const rf = gableRoof(10 * s, 8 * s, 1.6 * s, 0x4f4a44, h.shed || 0x9c4f42);
    rf.position.set(-span / 2 - 6 * s, 5.5 * s, r * 2.0); g.add(rf);
  },
  church(g, s, h) {                             // nave, tower, clock, spire
    const c = h.c || 0xe6dfcb, roof = h.roof || 0x5f5750;
    g.add(box(10 * s, 7 * s, 19 * s, c, 0, 3.5 * s, -2 * s));
    const r = gableRoof(10 * s, 19 * s, 3.4 * s, roof, c); r.position.set(0, 7 * s, -2 * s); g.add(r);
    for (let i = 0; i < 4; i++) for (const sx of [-5.1 * s, 5.1 * s])       // lancet windows down the nave
      g.add(box(0.3 * s, 2.6 * s, 1.2 * s, 0x6b7f86, sx, 3.6 * s, -8.5 * s + i * 4.4 * s));
    g.add(box(6 * s, 17 * s, 6 * s, c, 0, 8.5 * s, 8.5 * s));               // the tower
    for (const sz of [11.6 * s, 5.4 * s]) for (const sx of [-0.7 * s, 0.7 * s])   // paired belfry louvres
      g.add(box(1.0 * s, 3.4 * s, 0.3 * s, 0x4a4a44, sx, 14.5 * s, sz));
    const face = cyl(1.5 * s, 1.5 * s, 0.3 * s, 0xf4eedd, 0, 10.2 * s, 11.65 * s, 14); face.rotation.x = Math.PI / 2; g.add(face);
    for (const [len, ang] of [[0.8, -0.9], [1.15, 0.5]]) {   // ten past two, and it has been for years
      const hd = new THREE.Group(); hd.position.set(0, 10.2 * s, 11.85 * s); hd.rotation.z = ang;
      hd.add(box(0.13 * s, len * s, 0.1 * s, 0x3a3a36, 0, len * s / 2, 0));   // pivot at the boss, not the middle
      g.add(hd);
    }
    const sp = cone(4.4 * s, 11 * s, roof, 0, 22.5 * s, 8.5 * s, 4); sp.rotation.y = Math.PI / 4; g.add(sp);
    g.add(box(0.22 * s, 2.2 * s, 0.22 * s, 0xd9c88a, 0, 29 * s, 8.5 * s));
    g.add(box(1.1 * s, 0.22 * s, 0.22 * s, 0xd9c88a, 0, 29.4 * s, 8.5 * s));
  },
  mill(g, s, h) {                               // the old mill, and the chimney you steer by
    const c = h.c || 0x9c6a55;
    g.add(box(30 * s, 12 * s, 12 * s, c, 0, 6 * s, 0));
    for (let f = 0; f < 3; f++) for (let i = 0; i < 9; i++)
      g.add(box(1.5 * s, 2.1 * s, 0.4 * s, 0x6f7c84, -12.6 * s + i * 3.15 * s, 2.6 * s + f * 4 * s, 6.1 * s));
    const r = gableRoof(30 * s, 12 * s, 2.4 * s, 0x4f4a44, c); r.position.y = 12 * s; g.add(r);
    g.add(cyl(1.4 * s, 2.1 * s, 30 * s, h.stack || 0xa4644d, -11 * s, 15 * s, -7 * s, 12));
    g.add(cyl(1.8 * s, 1.6 * s, 1.6 * s, 0x7d4a3a, -11 * s, 30.4 * s, -7 * s, 12));   // the crown
    g.add(box(9 * s, 6 * s, 8 * s, 0xb0a89a, 16 * s, 3 * s, 3 * s));                  // boiler house
    g.add(box(9.4 * s, 0.5 * s, 8.4 * s, 0x6b6258, 16 * s, 6.2 * s, 3 * s));
  },
  hospital(g, s, h) {                           // the county hospital: a slab with a lit stair tower
    const c = h.c || 0xdcd8cc;
    g.add(box(32 * s, 17 * s, 13 * s, c, 0, 8.5 * s, 0));
    for (let f = 0; f < 5; f++) g.add(box(29 * s, 1.8 * s, 0.4 * s, 0x7f95a4, 0, 2.8 * s + f * 3.2 * s, 6.6 * s));
    g.add(box(6 * s, 21 * s, 6.4 * s, 0xcfcabd, -13 * s, 10.5 * s, 0));               // stair tower
    for (let f = 0; f < 6; f++) g.add(box(2.6 * s, 1.2 * s, 0.4 * s, 0x93a9b4, -13 * s, 3 * s + f * 3.2 * s, 3.3 * s));
    g.add(box(17 * s, 6 * s, 10 * s, c, 15 * s, 3 * s, 3 * s));                       // the entrance wing
    g.add(box(8 * s, 0.5 * s, 4.4 * s, 0xb9b2a4, 15 * s, 6.3 * s, 8.4 * s));          // the canopy over the doors
    g.add(box(9 * s, 2.6 * s, 4 * s, 0xc9c2b2, 3 * s, 18.3 * s, 0));                  // rooftop plant
    // ⚠️ Window bands alone are exactly what the city ring towers wear, so from the roof
    // at Vance & Co. this read as one more office block. The things that say HOSPITAL at
    // half a kilometre are the red cross, the helipad and the mast — so it has all three.
    // The cross goes BIG and on the face you actually see. A slab with window bands is
    // exactly what the city ring towers wear, so from the roof at Vance & Co. this was just
    // another office block — the red is the whole identity, and it was too small to work.
    for (const [px, pz, ry] of [[0, 6.7 * s, 0], [-16.2 * s, 0, Math.PI / 2]]) {
      const arm1 = box(6.4 * s, 1.9 * s, 0.35 * s, 0xc0392b, px, 14.2 * s, pz); arm1.rotation.y = ry; g.add(arm1);
      const arm2 = box(1.9 * s, 6.4 * s, 0.35 * s, 0xc0392b, px, 14.2 * s, pz); arm2.rotation.y = ry; g.add(arm2);
    }
    g.add(cyl(4.4 * s, 4.4 * s, 0.5 * s, 0xb0aca0, 9 * s, 17.4 * s, 0, 16));          // helipad
    g.add(cyl(3.1 * s, 3.1 * s, 0.12 * s, 0xe8e2d2, 9 * s, 17.7 * s, 0, 16));
    for (const sx of [-1.1 * s, 1.1 * s]) g.add(box(0.5 * s, 0.14 * s, 3.2 * s, 0xe8e2d2, 9 * s + sx, 17.8 * s, 0));  // the H, lying flat
    g.add(box(2.2 * s, 0.14 * s, 0.5 * s, 0xe8e2d2, 9 * s, 17.8 * s, 0));
    const mast = cyl(0.16 * s, 0.22 * s, 9 * s, 0xb9bcc0, -9 * s, 22 * s, -3 * s, 6); g.add(mast);
    g.add(sph(0.4 * s, 0xd8483c, -9 * s, 26.8 * s, -3 * s, 8));                       // its night light
  },
  civic(g, s, h) {                              // town hall: portico, pediment, a clock that is slow
    const c = h.c || 0xd8d2c0, trim = 0xefe9da;
    g.add(box(26 * s, 11 * s, 14 * s, c, 0, 5.5 * s, 0));
    const r = gableRoof(26 * s, 14 * s, 3 * s, h.roof || 0x5f5750, c); r.position.y = 11 * s; g.add(r);
    for (let i = 0; i < 6; i++) g.add(cyl(0.6 * s, 0.6 * s, 9.4 * s, trim, -6.5 * s + i * 2.6 * s, 4.7 * s, 7.4 * s, 8));
    g.add(box(16 * s, 1.3 * s, 3.2 * s, trim, 0, 10 * s, 7.2 * s));                   // entablature
    g.add(box(16 * s, 0.6 * s, 4 * s, trim, 0, 0.3 * s, 7.6 * s));                    // the steps
    g.add(box(6.4 * s, 4.6 * s, 6.4 * s, trim, 0, 14.4 * s, 0));                      // cupola base
    const face = cyl(1.5 * s, 1.5 * s, 0.3 * s, 0xf6f1e2, 0, 14.6 * s, 3.35 * s, 14); face.rotation.x = Math.PI / 2; g.add(face);
    g.add(cyl(2.4 * s, 2.9 * s, 3 * s, trim, 0, 18.2 * s, 0, 10));
    g.add(sph(2.5 * s, h.dome || 0x6f8a78, 0, 20 * s, 0, 12));
    g.add(cyl(0.16 * s, 0.16 * s, 4.5 * s, 0xd9c88a, 0, 23.4 * s, 0, 6));
  },
  school(g, s, h) {                             // brick, two storeys, a bell nobody rings
    const c = h.c || 0xb4735c;
    g.add(box(30 * s, 9 * s, 12 * s, c, 0, 4.5 * s, 0));
    for (let f = 0; f < 2; f++) for (let i = 0; i < 10; i++)
      g.add(box(1.8 * s, 2.2 * s, 0.4 * s, 0x8fa8b4, -13 * s + i * 2.9 * s, 2.6 * s + f * 4.2 * s, 6.1 * s));
    g.add(box(31 * s, 0.8 * s, 13 * s, 0x6b6258, 0, 9.3 * s, 0));                     // parapet
    g.add(box(7 * s, 3.4 * s, 7 * s, 0xefe9da, 0, 11.4 * s, 0));                      // bell cupola
    g.add(cone(3.6 * s, 4 * s, h.roof || 0x5f6b70, 0, 15.2 * s, 0, 8));
    g.add(box(15 * s, 6.5 * s, 15 * s, 0xc4b9a4, 21 * s, 3.25 * s, -1 * s));          // the gym
    g.add(box(15.4 * s, 0.6 * s, 15.4 * s, 0x6b6258, 21 * s, 6.8 * s, -1 * s));
    g.add(cyl(0.14 * s, 0.14 * s, 11 * s, 0xe4dfd4, -17 * s, 5.5 * s, 8 * s, 6));     // flagpole
  },
  bridge(g, s, h) {                             // the truss the road crosses the water on
    const c = h.c || 0x8a8f8a, L = 44 * s, T = 8 * s, y0 = 5.6 * s;
    g.add(box(L, 0.9 * s, 7.4 * s, 0x9c9a92, 0, 5 * s, 0));
    for (const sz of [-3.6 * s, 3.6 * s]) {
      g.add(box(L, 0.7 * s, 0.6 * s, c, 0, y0, sz));
      g.add(box(L, 0.7 * s, 0.6 * s, c, 0, y0 + T, sz));
      for (let i = 0; i <= 6; i++) g.add(box(0.5 * s, T, 0.45 * s, c, -L / 2 + i * L / 6, y0 + T / 2, sz));
      for (let i = 0; i < 6; i++) {
        const d = box(0.4 * s, Math.hypot(L / 6, T), 0.4 * s, c, -L / 2 + (i + 0.5) * L / 6, y0 + T / 2, sz);
        d.rotation.z = (i % 2 ? 1 : -1) * Math.atan2(L / 6, T); g.add(d);
      }
    }
    for (const sx of [-L / 2 + 1.5 * s, L / 2 - 1.5 * s]) g.add(box(5 * s, 5 * s, 9.5 * s, h.pier || 0xb0a89a, sx, 2.5 * s, 0));
  },
  radio(g, s, h) {                              // the mast out past the last streetlight
    const H2 = 38 * s, c = h.c || 0xb9bcc0;
    for (let i = 0; i < 3; i++) {
      const hold = new THREE.Group(); hold.rotation.y = i * 2.094;
      const leg = cyl(0.14 * s, 0.2 * s, H2, c, 1.5 * s, H2 / 2, 0, 5);
      leg.rotation.z = Math.atan2(1.1 * s, H2); hold.add(leg); g.add(hold);
    }
    for (let i = 1; i < 10; i++) {
      const y = i * H2 / 10;
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.5 * s * (1 - y / H2 * 0.55), 0.07 * s, 3, 3), mat(c));
      r.position.y = y; r.rotation.x = Math.PI / 2; g.add(r);
    }
    for (let i = 0; i < 3; i++) {                // guy wires, which is what makes it read as a mast
      const hold = new THREE.Group(); hold.rotation.y = i * 2.094 + 1.0;
      const len = Math.hypot(11 * s, H2 * 0.82);
      const w = cyl(0.05 * s, 0.05 * s, len, 0x8f9490, 5.5 * s, H2 * 0.41, 0, 4);
      w.rotation.z = Math.atan2(11 * s, H2 * 0.82); hold.add(w); g.add(hold);
    }
    g.add(sph(0.55 * s, 0xd8483c, 0, H2 + 0.7 * s, 0, 8));   // the red light that is on all night
  },
};

// ---- FURNITURE ----
// The rooms were dressed but EMPTY. The lot itself is the carpet, so anything standing in a
// room has to live in the 3.5-unit band between the edge of the lawn and the wall.
// ⚠️ The player is hard-clamped to the lot (`game.js` ~132), so none of this needs a collider,
// a no-grass footprint or a trim ring — it is pure view, exactly like the room around it.
// ⚠️ SCALE: these rooms are a normal room seen by a mower-sized person — wall height ~7 units
// is about 2.4 m, so a unit is roughly a third of a metre. A sideboard is 2.2 units tall, not
// 1. Build at s=1 for a 7-unit room; the shorter rooms pass s ≈ 0.9.
// Every piece is built with its BACK toward −z: north wall rot 0, south π, west π/2, east −π/2.
const FURN = {
  sideboard(g, s, o) {
    const c = o.c || 0x7a5236, L = 4.6 * s;
    g.add(box(L, 1.5 * s, 1.25 * s, c, 0, 1.15 * s, 0));
    g.add(box(L + 0.22 * s, 0.16 * s, 1.4 * s, o.top || 0x8a6242, 0, 1.98 * s, 0));
    for (let i = 0; i < 3; i++) {
      // ⚠️ the body is 1.25 deep, so its face is at 0.625 — drawer fronts at 0.65 were
      // 25mm proud and z-fought into invisibility. Stand them properly off the carcass.
      const x = (i - 1) * L * 0.31;
      g.add(box(L * 0.27, 1.0 * s, 0.10 * s, o.face || 0x6b4830, x, 1.2 * s, 0.70 * s));
      g.add(box(L * 0.13, 0.10 * s, 0.10 * s, 0xd9c88a, x, 1.2 * s, 0.79 * s));
    }
    for (const sx of [-L * 0.44, L * 0.44]) for (const sz of [-0.42 * s, 0.42 * s])
      g.add(box(0.14 * s, 0.5 * s, 0.14 * s, 0x4a3626, sx, 0.25 * s, sz));
  },
  armchair(g, s, o) {
    const c = o.c || 0x6f7a4a;
    g.add(box(2.1 * s, 0.6 * s, 2.0 * s, c, 0, 1.05 * s, 0));                 // cushion
    g.add(box(2.1 * s, 1.7 * s, 0.5 * s, c, 0, 1.7 * s, -0.85 * s));          // back
    for (const sx of [-1.1 * s, 1.1 * s]) g.add(box(0.4 * s, 0.8 * s, 2.0 * s, c, sx, 1.15 * s, 0));
    for (const sx of [-0.85 * s, 0.85 * s]) for (const sz of [-0.8 * s, 0.8 * s])
      g.add(box(0.16 * s, 0.75 * s, 0.16 * s, 0x4a3626, sx, 0.38 * s, sz));
  },
  tv(g, s, o) {                                                              // a boxy set on legs
    g.add(box(2.2 * s, 1.7 * s, 1.4 * s, o.c || 0x6b4830, 0, 1.9 * s, 0));
    g.add(box(1.6 * s, 1.25 * s, 0.10 * s, 0x2b3138, -0.15 * s, 1.95 * s, 0.72 * s));
    for (let i = 0; i < 2; i++) {
      const d = cyl(0.13 * s, 0.13 * s, 0.09 * s, 0xd9c88a, 0.82 * s, 2.2 * s - i * 0.42 * s, 0.72 * s, 8);
      d.rotation.x = Math.PI / 2; g.add(d);
    }
    for (const sx of [-0.8 * s, 0.8 * s]) for (const sz of [-0.5 * s, 0.5 * s])
      g.add(box(0.15 * s, 1.05 * s, 0.15 * s, 0x4a3626, sx, 0.52 * s, sz));
    g.add(cyl(0.04 * s, 0.04 * s, 1.8 * s, 0x8a8f94, 0.7 * s, 3.6 * s, 0, 5));  // the aerial
  },
  trestle(g, s, o) {                                                         // a folding table with crates
    const L = 5.2 * s;
    g.add(box(L, 0.16 * s, 1.6 * s, o.top || 0xa8916a, 0, 2.15 * s, 0));
    for (const sx of [-L * 0.4, L * 0.4]) for (const d of [-1, 1]) {
      const lg = box(0.14 * s, 2.1 * s, 0.14 * s, 0x6b5a42, sx + d * 0.24 * s, 1.05 * s, d * 0.55 * s);
      lg.rotation.x = d * 0.14; g.add(lg);
    }
    for (let i = 0; i < 3; i++)
      g.add(box(1.0 * s, 0.75 * s, 1.0 * s, [0x8a6a4a, 0x9a8b74, 0x6f7a63][i], (i - 1) * 1.5 * s, 2.6 * s, 0));
  },
  shelf(g, s, o) {                                                           // shelving, with things on it
    const W2 = 3.4 * s, H2 = 5.0 * s, c = o.c || 0x6b5a42;
    for (const sx of [-W2 / 2, W2 / 2]) g.add(box(0.18 * s, H2, 1.1 * s, c, sx, H2 / 2, 0));
    for (let i = 0; i < 4; i++) g.add(box(W2, 0.14 * s, 1.1 * s, c, 0, 0.35 * s + i * 1.5 * s, 0));
    const cols = [0x8a3f3f, 0x3f5d55, 0x7a4a33, 0xd9c88a, 0x415a78];
    for (let i = 0; i < 3; i++) for (let k = 0; k < 6; k++)
      g.add(box(0.26 * s, 0.85 * s, 0.8 * s, cols[(i * 6 + k) % 5], -W2 * 0.4 + k * 0.32 * s, 0.85 * s + i * 1.5 * s, 0));
  },
  bench(g, s, o) {                                                           // fixed seating along a wall
    const L = 5.0 * s, c = o.c || 0x7a3f3a;
    g.add(box(L, 0.45 * s, 1.5 * s, c, 0, 1.25 * s, 0));
    g.add(box(L, 1.6 * s, 0.4 * s, c, 0, 2.1 * s, -0.75 * s));
    g.add(box(L * 0.98, 1.0 * s, 1.3 * s, 0x4a3626, 0, 0.5 * s, 0));
  },
  counter(g, s, o) {                                                         // kitchen base units
    const L = 5.0 * s;
    g.add(box(L, 2.3 * s, 1.5 * s, o.c || 0xd8dee2, 0, 1.15 * s, 0));
    g.add(box(L + 0.16 * s, 0.18 * s, 1.65 * s, o.top || 0x8a8f94, 0, 2.4 * s, 0));
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * L * 0.32;
      g.add(box(L * 0.28, 1.9 * s, 0.08 * s, o.face || 0xc4ccd2, x, 1.15 * s, 0.78 * s));
      g.add(box(L * 0.19, 0.09 * s, 0.09 * s, 0x9aa0a6, x, 1.95 * s, 0.86 * s));
    }
    g.add(box(0.75 * s, 0.55 * s, 0.6 * s, 0xf0ead8, L * 0.3, 2.77 * s, 0));   // something left on the top
  },
  fridge(g, s, o) {
    g.add(box(1.9 * s, 5.0 * s, 1.7 * s, o.c || 0xe8eef0, 0, 2.5 * s, 0));
    g.add(box(1.94 * s, 0.08 * s, 1.74 * s, 0xb0b6bb, 0, 3.4 * s, 0));          // the freezer split
    g.add(box(0.12 * s, 1.4 * s, 0.12 * s, 0x9aa0a6, 0.75 * s, 2.2 * s, 0.75 * s));
    g.add(box(0.12 * s, 0.7 * s, 0.12 * s, 0x9aa0a6, 0.75 * s, 4.1 * s, 0.75 * s));
  },
};
function placeFurniture(room, R) {
  for (const f of R.furn || []) {
    if (!FURN[f.k]) continue;
    const g = new THREE.Group();
    FURN[f.k](g, f.s || 1, f);
    g.position.set(f.x, 0, f.z); g.rotation.y = f.rot || 0;
    room.add(g);
  }
}

// ---- WHAT MAKES A ROOM A ROOM ----
// The indoor maps had four walls, a ceiling, a dado and a window: they read as "indoors"
// and nothing more. A box with a window is still a box. What says *room* is the stuff a
// room can't be without — a way out, something overhead making the light, and things hung
// on the walls at human heights. All authored per map through `def.room`.
function dressRoom(room, R, W, H, cx, cz, wh, m, skirtC) {
  const total = W + m * 2, deep = H + m * 2;
  const trim = R.trim ?? skirtC, wallIn = { n: -m + 0.36, s: H + m - 0.36, w: -m + 0.36, e: W + m - 0.36 };
  // cornice where the wall meets the ceiling, and a dark contact line where it meets the floor
  for (const [bx, bz, bw, bd] of [[cx, -m + 0.5, total, 0.5], [cx, H + m - 0.5, total, 0.5]]) {
    room.add(box(bw, 0.30, bd, trim, bx, wh - 0.16, bz));
    room.add(box(bw, 0.10, bd * 0.7, 0x2e2820, bx, 0.05, bz));
  }
  for (const sx of [-m + 0.5, W + m - 0.5]) {
    room.add(box(0.5, 0.30, deep, trim, sx, wh - 0.16, cz));
    room.add(box(0.35, 0.10, deep, 0x2e2820, sx, 0.05, cz));
  }
  // ---- the way out. A room you cannot leave is a box with a rug in it. ----
  const dh = wh * 0.62, dw = dh * 0.42, dz = cz + (R.doorZ ?? -H * 0.18);
  const dx = R.doorSide === 'e' ? wallIn.e : wallIn.w, inward = R.doorSide === 'e' ? -1 : 1;
  room.add(box(0.34, dh + 0.5, dw + 0.7, trim, dx, (dh + 0.5) / 2, dz));            // architrave
  room.add(box(0.22, dh, dw, R.door ?? 0x6f5540, dx + inward * 0.12, dh / 2, dz));  // the leaf
  room.add(box(0.10, dh * 0.34, dw * 0.62, R.doorPanel ?? 0x5e4736, dx + inward * 0.22, dh * 0.32, dz));  // its panels
  room.add(box(0.10, dh * 0.26, dw * 0.62, R.doorPanel ?? 0x5e4736, dx + inward * 0.22, dh * 0.72, dz));
  room.add(sph(0.13, 0xd9b44a, dx + inward * 0.26, dh * 0.47, dz + dw * 0.34, 8));  // handle
  room.add(box(0.08, 0.34, 0.24, 0xf0ead8, dx + inward * 0.14, dh * 0.62, dz - dw * 0.95)); // light switch
  // ---- things on the walls, at the heights people hang things ----
  const picW = R.picC || [0x8a6a4a, 0x6f7a63, 0x9a8b74];
  const hang = (x, z, ry, w2, h2, i) => {
    const f = new THREE.Group(); f.position.set(x, wh * 0.55, z); f.rotation.y = ry;
    f.add(box(0.16, h2 + 0.26, w2 + 0.26, picW[i % picW.length], 0, 0, 0));
    f.add(box(0.08, h2, w2, R.picInk ?? 0xe4dcc4, 0.10, 0, 0));
    room.add(f);
  };
  const nPic = R.pics ?? 3;
  for (let i = 0; i < nPic; i++) {
    const t = (i + 1) / (nPic + 1);
    if (i % 2 === 0) hang(wallIn.w, cz + (t - 0.5) * H * 1.4, 0, 1.5 + (i % 3) * 0.5, 1.1 + (i % 2) * 0.6, i);
    else hang(cx + (t - 0.5) * W * 1.4, wallIn.s, Math.PI / 2, 1.7, 1.2, i);
  }
  if (R.clock !== false) {                                   // and a clock, because rooms have one
    // ⚠️ no group rotation here. Rotating it π put the hands (local −x) INTO the wall, and
    // the clock rendered as a plain white disc — the face is symmetric, so it needs none.
    const c = new THREE.Group(); c.position.set(wallIn.e, wh * 0.62, cz + H * 0.2);
    const face = cyl(0.9, 0.9, 0.16, 0xf4eedd, 0, 0, 0, 14); face.rotation.z = Math.PI / 2; c.add(face);
    for (const [len, ang] of [[0.42, -0.7], [0.66, 1.9]]) {
      const hd = new THREE.Group(); hd.position.set(-0.1, 0, 0); hd.rotation.x = ang;
      hd.add(box(0.06, len, 0.09, 0x3a3a36, 0, len / 2, 0)); c.add(hd);
    }
    room.add(c);
  }
  // ---- the light, which is the thing the room is actually lit by ----
  const lamp = new THREE.Group(); lamp.position.set(cx, 0, cz + (R.lampZ ?? 0));
  const K = R.lamp || 'dome';
  if (K === 'strip') {                                       // club-room fluorescents
    for (const sx of [-W * 0.22, W * 0.22]) {
      lamp.add(box(1.1, 0.34, H * 0.5, 0xcfd4d2, sx, wh - 0.36, 0));
      lamp.add(box(0.9, 0.10, H * 0.48, 0xfff6d8, sx, wh - 0.56, 0));
    }
  } else if (K === 'shade') {
    // ⚠️ the long low shade over a table — at W*0.58 and wh*0.64 this spanned half the room
    // and read as a structural BEAM across the top of frame, not a light. Keep it short and
    // keep it up: a lamp is small and far away, or it stops being a lamp.
    const L = Math.min(W * 0.34, 7);
    for (const sz of [-L * 0.36, L * 0.36]) lamp.add(cyl(0.05, 0.05, wh * 0.2, 0x3a3a36, sz, wh - wh * 0.1, 0, 5));
    lamp.add(box(L, 0.42, 1.2, R.lampC ?? 0x2f5b3f, 0, wh * 0.80, 0));
    lamp.add(box(L * 0.94, 0.10, 1.05, 0xfff2c8, 0, wh * 0.766, 0));
  } else if (K === 'flush') {                                // a kitchen ceiling light
    lamp.add(cyl(1.1, 1.3, 0.34, 0xf4f0e2, 0, wh - 0.2, 0, 14));
    lamp.add(cyl(1.0, 1.0, 0.10, 0xfff6d8, 0, wh - 0.38, 0, 14));
  } else {                                                   // a pendant on a flex
    lamp.add(cyl(0.05, 0.05, wh * 0.26, 0x2e2820, 0, wh - wh * 0.13, 0, 5));
    lamp.add(cyl(0.32, 1.25, 0.95, R.lampC ?? 0xd8a23f, 0, wh * 0.70, 0, 14));
    lamp.add(cyl(1.2, 1.2, 0.10, 0xfff2c8, 0, wh * 0.657, 0, 14));
  }
  lamp.traverse(o => { if (o.isMesh) o.castShadow = false; });
  brighten(lamp, 0.62);                                      // it is the light source; it reads brighter
  // ⚠️ keepMat, or the room's own brighten() pass runs afterwards and stomps the lamp back
  // down to wall brightness — the same guard street.js uses for its window materials.
  lamp.traverse(o => { if (o.isMesh) o.userData.keepMat = true; });
  room.add(lamp);
  placeFurniture(room, R);   // and the things that stand in it, out in the margin band
  // ---- curtains, so the window is a window and not a hole ----
  if (R.window !== false) {
    const winW = Math.min(9, W * 0.4), wy = wh * 0.68;
    room.add(box(winW + 2.2, 0.22, 0.22, trim, cx, wy + 1.95, -m + 0.3));           // the rail
    for (const sx of [-1, 1]) {                                                     // drapes, not posts
      const cur = box(winW * 0.40, 3.7, 0.30, R.curtain ?? 0xb0a48c, cx + sx * (winW * 0.66), wy + 0.05, -m + 0.34);
      cur.rotation.z = sx * 0.015; room.add(cur);
      room.add(box(winW * 0.42, 0.3, 0.34, R.curtain ?? 0xb0a48c, cx + sx * (winW * 0.66), wy + 1.78, -m + 0.34));
    }
  }
}

// The heroes are built by both paths — the indoor rooms open a real window in the north
// wall (v1.26) and used to look out at NOTHING, because that branch returns early.
function buildHeroes(root, def, cx, cz) {
  for (const h of def.hero || []) {
    const g = new THREE.Group();
    const s = h.s || 1;
    if (h.k === 'ball') {                       // a colossal ball of twine, on its shelter
      const b = sph(9 * s, h.c || 0xc9a86a, 0, 9 * s, 0, 16); g.add(b);
      // wound bands. ⚠️ Their radius must follow the SPHERE'S SILHOUETTE — sqrt(R²-dy²) —
      // not a linear taper, or near the poles the bands stand proud of the ball and you
      // see straight through the gap into a hollow shell.
      const R = 9 * s;
      for (let i = 0; i < 15; i++) {
        const dy = (i - 7) * (R * 0.125);
        const rr = Math.sqrt(Math.max(0.0001, R * R - dy * dy)) * 1.005;
        if (rr < 0.6 * s) continue;
        const r = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.26 * s, 5, 26), mat(0xb08f52));
        r.position.y = R + dy; r.rotation.x = Math.PI / 2 + (i - 7) * 0.02; g.add(r);
      }
      g.add(cyl(11 * s, 11 * s, 0.7 * s, 0x9c968a, 0, 0.35 * s, 0, 18));
      // ⚠️ NO SHELTER ROOF. It was a 28m cone at y34 — from anywhere on the lot it read as
      // a black canopy over the entire sky, and I mistook it for a treeline twice.
      // The ball IS the landmark; it does not need a hat.
    } else if (h.k === 'chess') {               // pieces the size of gasholders
      const c = h.c || 0xf2ead8;
      g.add(cyl(3.2 * s, 4.0 * s, 2.2 * s, c, 0, 1.1 * s, 0, 14));
      g.add(cyl(1.5 * s, 2.6 * s, 9 * s, c, 0, 6.7 * s, 0, 14));
      g.add(cyl(3.4 * s, 2.2 * s, 1.6 * s, c, 0, 12 * s, 0, 14));
      if (h.piece === 'king') { g.add(cyl(2.4 * s, 2.6 * s, 3 * s, c, 0, 14.3 * s, 0, 14)); g.add(box(0.8 * s, 3.4 * s, 0.8 * s, c, 0, 17 * s, 0)); g.add(box(2.6 * s, 0.8 * s, 0.8 * s, c, 0, 16.4 * s, 0)); }
      else g.add(sph(2.6 * s, c, 0, 14 * s, 0, 12));
    } else if (h.k === 'can') {                 // a watering can you could park in
      g.add(cyl(5.5 * s, 6.2 * s, 9 * s, h.c || 0x4f7a52, 0, 4.5 * s, 0, 16));
      g.add(cyl(5.6 * s, 5.0 * s, 0.8 * s, h.c || 0x4f7a52, 0, 9.2 * s, 0, 16));
      const sp = cyl(1.0 * s, 1.8 * s, 12 * s, h.c || 0x4f7a52, -7 * s, 6.5 * s, 0, 10); sp.rotation.z = 0.9; g.add(sp);
      g.add(cyl(2.4 * s, 2.4 * s, 0.7 * s, 0x8a8f94, -11.5 * s, 10.6 * s, 0, 12));
      const hd = new THREE.Mesh(new THREE.TorusGeometry(3.4 * s, 0.55 * s, 6, 16, Math.PI), mat(h.c || 0x4f7a52));
      hd.position.set(2 * s, 9.4 * s, 0); hd.rotation.y = Math.PI / 2; g.add(hd);
    } else if (h.k === 'door') {                // the front door of something enormous
      g.add(box(26 * s, 34 * s, 1.4 * s, h.c || 0xd8cbb4, 0, 17 * s, 0));
      g.add(box(11 * s, 22 * s, 0.9 * s, h.door || 0x7a4a33, 0, 11 * s, 0.9 * s));
      g.add(sph(1.1 * s, 0xd9b44a, 3.6 * s, 11 * s, 1.5 * s, 10));
      g.add(box(28 * s, 2.2 * s, 3.4 * s, 0x8f8578, 0, 34 * s, 0.6 * s));
    } else if (h.k === 'pagoda') {              // a castle keep, tiered, above the bonsai
      g.add(box(34 * s, 11 * s, 27 * s, 0xb9b2a4, 0, 5.5 * s, 0));          // stone base
      g.add(box(30 * s, 1.6 * s, 23 * s, 0x8f8578, 0, 11.6 * s, 0));
      for (let t = 0; t < 4; t++) {
        const w = (24 - t * 4.4) * s, d = (18 - t * 3.2) * s, y = 12.4 * s + t * 7.4 * s;
        g.add(box(w, 5.4 * s, d, 0xf4efe2, 0, y + 2.7 * s, 0));             // plaster storey
        for (let k = 0; k < 3; k++) g.add(box(w * 0.16, 3.2 * s, 0.3 * s, 0x3f4750, (k - 1) * w * 0.3, y + 2.9 * s, d / 2 + 0.2 * s));
        const roof = cone(Math.hypot(w, d) * 0.66, 3.6 * s, h.roof || 0x39434c, 0, y + 7.3 * s, 0, 4);
        roof.rotation.y = Math.PI / 4; g.add(roof);
        g.add(box(w + 3.4 * s, 0.6 * s, d + 3.4 * s, 0x2b3138, 0, y + 5.5 * s, 0));  // flared eave
      }
      g.add(cyl(0.55 * s, 0.55 * s, 6 * s, 0xd9b44a, 0, 45 * s, 0, 8));
      g.add(sph(1.3 * s, 0xd9b44a, 0, 48 * s, 0, 10));
    } else if (h.k === 'village') {             // a fairy-tale village, roofs like witches' hats
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.283 + 0.3, rad = (13 + ((i * 37) % 11)) * s;
        const w = (4.4 + ((i * 13) % 3)) * s, hh = (5 + ((i * 7) % 4)) * s;
        const body = [0xe8dfc9, 0xdcc9b0, 0xd8c0a8, 0xe4d2b8][i % 4];
        const roofC = [0x8f5a3f, 0x6b4a38, 0x7a5240, 0x5e4433][i % 4];
        const cot = new THREE.Group();
        cot.add(box(w, hh, w * 0.9, body, 0, hh / 2, 0));
        cot.add(cone(w * 0.86, hh * 1.35, roofC, 0, hh + hh * 0.66, 0, 7));   // steep pointed roof
        cot.add(box(w * 0.24, hh * 0.46, 0.25 * s, 0x5e4a35, 0, hh * 0.23, w * 0.46));
        cot.add(box(w * 0.2, w * 0.2, 0.2 * s, 0xf2d98a, -w * 0.28, hh * 0.62, w * 0.46));
        cot.add(box(0.7 * s, 2 * s, 0.7 * s, 0x9a7360, w * 0.3, hh + 1.1 * s, 0));
        cot.position.set(Math.sin(a) * rad, 0, Math.cos(a) * rad * 0.55);
        cot.rotation.y = a + Math.PI;
        g.add(cot);
      }
      for (let i = 0; i < 6; i++) {              // toadstools, because it is that kind of village
        const a = i * 1.21, r = (19 + i * 2.2) * s;
        const x = Math.sin(a) * r, z = Math.cos(a) * r * 0.55;
        g.add(cyl(0.9 * s, 1.15 * s, 5.5 * s, 0xf4efe2, x, 2.75 * s, z, 8));
        g.add(sph(3.2 * s, i % 2 ? 0xc0392b : 0xd8823f, x, 6.1 * s, z, 11));
      }
    } else if (h.k === 'manor') {               // the big house the gardens belong to
      const W2 = 46 * s, H2 = 13 * s, D2 = 15 * s;
      g.add(box(W2, H2, D2, h.c || 0xd8cbb4, 0, H2 / 2, 0));
      const r1 = gableRoof(W2, D2, 5.2 * s, 0x574c46, h.c || 0xd8cbb4); r1.position.y = H2; g.add(r1);
      g.add(box(13 * s, H2 + 3.4 * s, D2 + 1.2 * s, 0xe4dac4, 0, (H2 + 3.4 * s) / 2, 0));
      const r2 = gableRoof(13 * s, D2 + 1.2 * s, 4.2 * s, 0x574c46, 0xe4dac4); r2.position.y = H2 + 3.4 * s; g.add(r2);
      for (let i = 0; i < 9; i++) {
        const x = -W2 / 2 + 3.4 * s + i * (W2 - 6.8 * s) / 8;
        for (const y of [4.2 * s, 9.4 * s]) g.add(box(1.9 * s, 2.8 * s, 0.4 * s, 0x8fb6c9, x, y, D2 / 2 + 0.12 * s));
      }
      g.add(box(3 * s, 5 * s, 0.5 * s, 0x6a4a33, 0, 2.5 * s, D2 / 2 + 0.3 * s));
      for (const sx of [-W2 * 0.36, W2 * 0.36]) g.add(box(2.4 * s, 6 * s, 2.4 * s, 0x9a7360, sx, H2 + 6.5 * s, 0));
    } else if (h.k === 'gnome') {               // one titanic gnome, watching
      g.add(cyl(3.4 * s, 4.2 * s, 7 * s, 0x3b6ea5, 0, 3.5 * s, 0, 14));
      g.add(sph(3.0 * s, 0xe8b48c, 0, 8.6 * s, 0, 12));
      g.add(cone(3.2 * s, 6 * s, 0xc0392b, 0, 13 * s, 0, 14));
      g.add(sph(2.2 * s, 0xf2ead8, 0, 7.2 * s, 2.2 * s, 12));
      for (const sx of [-3.6, 3.6]) g.add(cyl(0.9 * s, 0.9 * s, 4.5 * s, 0x3b6ea5, sx * s, 4.6 * s, 0, 8));
    } else if (TOWN[h.k]) {
      TOWN[h.k](g, s, h);
    }
    g.position.set(cx + (h.x || 0), 0, cz + (h.z || 0));
    if (h.rot) g.rotation.y = h.rot;
    g.traverse(o => { if (o.isMesh) o.castShadow = false; });
    g.userData.hero = h.k;      // so they can be toggled for a measured A/B (see __fc.heroCost)
    brighten(g, h.lift ?? 0.26); root.add(g);
  }
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

  // ---- indoors: four walls and a ceiling, and nothing else. A sunken lounge does not
  // have a horizon, and leaving one there was what made the shag carpet read as a field. ----
  if (P.indoor) {
    // per-map room dressing: def.room overrides the archetype, so the shag lounge is
    // 1974 brown, the snooker room is club green and the kitchen windowsill is tiled
    const R = def.room || {};
    const wallC = R.wall ?? P.wallC, ceilC = R.ceil ?? P.ceilC, skirtC = R.skirt ?? P.skirtC;
    const wh = R.h || P.wallH || 9, m = 3.5;
    const room = new THREE.Group();
    const total = W + m * 2, winW = Math.min(9, W * 0.4), winY = wh * 0.68, winH = 3.0;
    // The north wall is built AROUND the window instead of straight through it, so an
    // indoor map can put a hero outside and you actually see it. A room with a painted-on
    // window is still a box; a room you can see out of is a place.
    if (R.window === false) {
      room.add(box(total, wh, 0.7, wallC, cx, wh / 2, -m));
    } else {
      const side = (total - winW) / 2;
      room.add(box(side, wh, 0.7, wallC, cx - winW / 2 - side / 2, wh / 2, -m));
      room.add(box(side, wh, 0.7, wallC, cx + winW / 2 + side / 2, wh / 2, -m));
      const above = wh - (winY + winH / 2);
      room.add(box(winW, above, 0.7, wallC, cx, winY + winH / 2 + above / 2, -m));
      room.add(box(winW, winY - winH / 2, 0.7, wallC, cx, (winY - winH / 2) / 2, -m));
    }
    room.add(box(total, wh, 0.7, wallC, cx, wh / 2, H + m));
    room.add(box(0.7, wh, H + m * 2, wallC, -m, wh / 2, cz));
    room.add(box(0.7, wh, H + m * 2, wallC, W + m, wh / 2, cz));
    // a dado rail and skirting, so the walls are a ROOM and not a beige box
    for (const [bx, bz, bw, bd] of [[cx, -m + 0.4, W + m * 2, 0.34], [cx, H + m - 0.4, W + m * 2, 0.34]]) {
      room.add(box(bw, 0.55, bd, skirtC, bx, 0.27, bz));
      room.add(box(bw, 0.22, bd * 0.8, skirtC, bx, wh * 0.42, bz));
    }
    for (const sx of [-m + 0.4, W + m - 0.4]) {
      room.add(box(0.34, 0.55, H + m * 2, skirtC, sx, 0.27, cz));
      room.add(box(0.27, 0.22, H + m * 2, skirtC, sx, wh * 0.42, cz));
    }
    // and something on the far wall to look at
    if (R.window !== false) {
      const wy = wh * 0.68, ww = Math.min(9, W * 0.4);
      // frame and mullion only — no glass pane, or it would block the view we just opened
      room.add(box(ww + 0.7, 0.34, 0.34, skirtC, cx, wy + 1.65, -m + 0.35));
      room.add(box(ww + 0.7, 0.34, 0.34, skirtC, cx, wy - 1.65, -m + 0.35));
      room.add(box(0.3, 3.0, 0.3, skirtC, cx, wy, -m + 0.32));
    }
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W + m * 2, H + m * 2), mat(ceilC));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(cx, wh, cz); room.add(ceil);
    dressRoom(room, R, W, H, cx, cz, wh, m, skirtC);   // a door, a light, and things on the walls
    room.traverse(o => { if (o.isMesh) o.castShadow = false; });
    brighten(room, R.lift ?? 0.34); root.add(room);
    buildHeroes(root, def, cx, cz);      // the thing beyond the window — the whole point of opening one
    return { group: root, hood: P };     // no ring, no landmarks, no sky business
  }

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
      const t = treeOf(P.tree, rng, (P.ringTreeScale || 2.0) + rng() * 1.6);
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

  buildHeroes(root, def, cx, cz);   // the landmark this map is named for, if it has one

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
