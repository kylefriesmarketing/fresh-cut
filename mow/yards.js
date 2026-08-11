// FRESH CUT — yards.js
// Every job is data. The town lives here: 19 notebook pages + the odd jobs + the Daily Lawn.
import { PROPS } from './props.js';
import { mulberry } from './grass.js';
import * as THREE from 'three';

// a few extra kit pieces the odd jobs need
const _m = (hex) => new THREE.MeshLambertMaterial({ color: hex });
PROPS.headstone = (o = {}) => {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.12), _m(0x9a9a92)); s.position.y = 0.35; s.castShadow = true; g.add(s);
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12, 1, false, 0, Math.PI), _m(0x9a9a92)); t.rotation.z = Math.PI / 2; t.rotation.y = Math.PI / 2; t.position.y = 0.7; g.add(t);
  return { g, col: [{ x: 0, z: 0, r: 0.3 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.26, rOut: 0.55 }] };
};
PROPS.windmill = () => {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 2.4, 4), _m(0xc94f42)); base.position.y = 1.2; base.castShadow = true; g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.6, 4), _m(0x6b5844)); roof.position.y = 2.7; g.add(roof);
  const hub = new THREE.Group(); hub.position.set(0, 2.1, 0.55); hub.userData.spin = 0.8;
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.03), _m(0xefe8d6)); b.position.y = 0.55; const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(b); hub.add(arm); }
  g.add(hub);
  return { g, col: [{ x: 0, z: 0, r: 0.85 }], noGrass: [{ x: 0, z: 0, r: 0.8 }], trim: [{ x: 0, z: 0, rIn: 0.8, rOut: 1.1 }] };
};
PROPS.speaker = () => {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 7), _m(0x777c80)); p.position.y = 0.5; g.add(p);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.16), _m(0x4a4f52)); b.position.y = 1.05; b.castShadow = true; g.add(b);
  return { g, col: [{ x: 0, z: 0, r: 0.14 }], noGrass: [], trim: [{ x: 0, z: 0, rIn: 0.1, rOut: 0.38 }] };
};
PROPS.screen = (o = {}) => {
  const g = new THREE.Group(); const w = o.w || 14, h = o.h || 8;
  const sc = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), _m(0xf2efe4)); sc.position.y = h / 2 + 1.4; sc.castShadow = true; g.add(sc);
  for (const sx of [-w / 2 + 0.5, w / 2 - 0.5]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), _m(0x5a5f63)); leg.position.set(sx, 0.8, 0); g.add(leg); }
  return { g, col: [{ x: -w / 2, z: 0, r: 0.6 }, { x: w / 2, z: 0, r: 0.6 }], noGrass: [], trim: [] };
};
PROPS.holeflag = (o = {}) => {
  const g = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 10), _m(0xf4f1e8)); cup.position.y = 0.01; g.add(cup);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), _m(0xe8e4d0)); pole.position.y = 0.75; g.add(pole);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.02), _m(o.c || 0xd95d3b)); fl.position.set(0.2, 1.35, 0); g.add(fl);
  return { g, col: [{ x: 0, z: 0, r: 0.08 }], noGrass: [], trim: [] };
};

// ---------- helpers ----------
function junkScatter(seed, n, W, H, avoid = []) {
  const rng = mulberry(seed * 7 + 3), out = [];
  const KINDS = ['ball', 'cap', 'car', 'coin', 'frisbee'];
  let guard = 0;
  while (out.length < n && guard++ < 300) {
    const x = 2.5 + rng() * (W - 5), z = 2.5 + rng() * (H - 5);
    if (avoid.some(a => Math.hypot(x - a.x, z - a.z) < (a.r || 2))) continue;
    out.push({ x, z, tier: 'junk', kind: KINDS[(rng() * KINDS.length) | 0] });
  }
  return out;
}
function quadZones(W, H, names) {
  return [
    { x: 0, z: 0, w: W / 2, h: H / 2, name: names[0] },
    { x: W / 2, z: 0, w: W / 2, h: H / 2, name: names[1] },
    { x: 0, z: H / 2, w: W / 2, h: H / 2, name: names[2] },
    { x: W / 2, z: H / 2, w: W / 2, h: H / 2, name: names[3] },
  ];
}

// ---------- THE NOTEBOOK ----------
import { TOUR } from './tour.js';
import { GOOFY } from './goofy.js';

export const BLOCKS = [
  { name: 'The Route', sub: "Pop's people. They're yours now." },
  { name: 'The Favors', sub: 'Word gets around in a town this size.' },
  { name: 'The Rescues', sub: 'The yards nobody asked you to fix.' },
  { name: 'The Landmarks', sub: 'When the town itself calls.' },
  { name: 'After the Route', sub: 'The weird calls. Pop kept a separate page.' },
  { name: 'The Wider Job Book', sub: 'Ten places that are not somebody\'s front lawn.' },
  { name: 'The Odd Sizes', sub: 'Pop kept these in a different notebook. He never said why.' },
];

export const JOBS = [
  // ================= BLOCK 1 — THE ROUTE =================
  {
    id: 'marge', block: 0, name: "Marge's Place", client: 'Marge, retired 41 years', who: 'MARGE',
    blurb: "First page of the notebook. A neat little yard gone shaggy since spring — nothing scary, but Marge notices everything, and her peonies are her whole heart.",
    pop: 'Gate sticks. Lift and push. Never charge Marge.',
    lot: { w: 20, h: 15 }, seed: 11, fence: 'picket', gate: { x: 5.4, w: 1.4 },
    house: { x: 13.2, z: 5.2, w: 6.5, d: 4.4, c: 0xe7dcc3 },
    paths: [{ x: 5.6, z: 0.4, w: 1.1, h: 7.2, stones: true }],
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 0, w: 20, h: 6, tier: 1 }],
    props: [
      { k: 'flowerbed', x: 18.1, z: 3.3, o: { r: 1.35, cols: [0xe86a92, 0xf0a9c0, 0xfdfdf8], seed: 2 } },
      { k: 'tree', x: 3.6, z: 11.2, o: { s: 1.15, seed: 4 } },
      { k: 'birdbath', x: 10.4, z: 9.6 },
      { k: 'mailbox', x: 4.4, z: 1.0, o: { c: 0x38536b } },
      { k: 'shrub', x: 18.2, z: 12.8 }, { k: 'shrub', x: 16.4, z: 13.4 },
      { k: 'bench', x: 12.8, z: 13.2, rot: 3.14 },
    ],
    zones: [
      { x: 0, z: 0, w: 12, h: 6, name: 'Front Walk Strip' }, { x: 12, z: 0, w: 8, h: 6, name: "Peony Border" },
      { x: 0, z: 6, w: 9, h: 9, name: 'Under the Oak' }, { x: 9, z: 6, w: 11, h: 9, name: 'The Back Corner' },
    ],
    disc: [
      { x: 9.8, z: 10.3, tier: 'story', kind: 'glasses', label: "Marge's reading glasses", text: "OH. My reading glasses!! I blamed the church bake sale committee. I owe several apologies." },
      { x: 17.2, z: 11.5, tier: 'keep', kind: 'coin', label: 'Buffalo nickel, 1936' },
    ],
    junk: 3, rabbit: false,
    texts: {
      arrive: "You must be the grandkid. Gate sticks, hon — lift and push. Pop always did.",
      mid: [{ pct: 50, t: "I can see the stripes from my kitchen window. He'd be proud, you know." }],
      reply: "It looks like Sunday again. Lemonade on the porch rail — payment. Don't argue.",
    },
  },
  {
    id: 'twins', block: 0, name: "The Twins' Yard", client: 'Dana & Dev, age 8 (via their mom)', who: 'KELLY (MOM)',
    blurb: "Small yard, two tornadoes. The grass isn't tall so much as booby-trapped — the twins have lost half their toy chest out here and Kelly's given up finding any of it.",
    pop: 'Count the toys you throw back on the porch. They count.',
    lot: { w: 18, h: 14 }, seed: 22, fence: 'chain', gate: { x: 4.2, w: 1.3 },
    house: { x: 4.6, z: 5.0, w: 6, d: 4.2, c: 0xcfd8e8, shutter: 0x40566b },
    paths: [],
    tiers: [{ t: 'base', tier: 2 }],
    props: [
      { k: 'trampoline', x: 13.2, z: 9.8 },
      { k: 'sandbox', x: 4.2, z: 10.6 },
      { k: 'swingset', x: 11.4, z: 4.6, rot: 0.3 },
      { k: 'doghouse', x: 16.0, z: 3.0, rot: -0.5 },
      { k: 'planter', x: 1.3, z: 9.0 },
    ],
    zones: quadZones(18, 14, ['Front Gate Patch', 'Swing Set Run', 'Sandbox Corner', 'Trampoline Zone']),
    disc: [
      { x: 6.8, z: 7.4, tier: 'story', kind: 'frisbee', label: 'The good frisbee', text: "THE GOOD FRISBEE. Dana said Dev threw it over the fence. Dev has been in frisbee jail for a MONTH. Justice at last." },
      { x: 15.3, z: 12.1, tier: 'story', kind: 'car', label: 'Red racecar (front left wheel missing)', text: "That's Wheels. Dev sleeps better knowing Wheels is inside. I wish I was joking." },
    ],
    junk: 7, rabbit: true,
    texts: {
      arrive: "Fair warning: the yard eats toys. Whatever you find is legally yours but emotionally theirs.",
      mid: [{ pct: 60, t: "The twins are watching from the window and narrating you like a nature documentary." }],
      reply: "They saluted you when you left. You're in the club now. There's no getting out of the club.",
    },
  },
  {
    id: 'coach', block: 0, name: "Coach Whitfield's", client: 'Coach Whitfield, 34 seasons', who: 'COACH',
    blurb: "Flat, honest, wide open — a scrimmage field pretending to be a lawn. Coach doesn't care that it's cut. Coach cares that it's cut in LINES.",
    pop: "Stripe it N-S. He'll talk about it at the diner either way.",
    lot: { w: 24, h: 16 }, seed: 33, fence: 'rail', gate: { x: 6.5, w: 1.5 },
    house: { x: 5.0, z: 4.8, w: 7, d: 4.6, c: 0xd8cbb4, shutter: 0x7a3c34 },
    paths: [],
    tiers: [{ t: 'base', tier: 2 }],
    props: [
      { k: 'flagpole', x: 21.5, z: 2.2 },
      { k: 'bench', x: 12.5, z: 1.4 },
      { k: 'tree', x: 2.6, z: 13.4, o: { s: 1.3, seed: 8, tire: true } },
      { k: 'shed', x: 21.2, z: 13.6, rot: -0.7 },
    ],
    zones: [
      { x: 0, z: 0, w: 24, h: 5.3, name: 'The Front Line' },
      { x: 0, z: 5.3, w: 24, h: 5.3, name: 'Midfield' },
      { x: 0, z: 10.6, w: 24, h: 5.4, name: 'The Back Forty' },
    ],
    disc: [
      { x: 12.5, z: 8.2, tier: 'story', kind: 'medal', label: "'86 District Champs medal", text: "Where in the — I gave that to Tommy Reyes in '86 and he 'lost' it the same week. THIRTY-EIGHT YEARS, REYES." },
      { x: 3.4, z: 14.6, tier: 'keep', kind: 'arrowhead', label: 'Quartz arrowhead' },
    ],
    junk: 4,
    texts: {
      arrive: "Son. Lines. North-south. I'll know.",
      mid: [{ pct: 50, t: "HALF TIME. Hydrate. I mean it, that's not a joke, it's ninety-four degrees." }],
      reply: "Those lines are VARSITY. First string. Tell your Pop— ...tell your Pop's memory I said so.",
    },
  },
  {
    id: 'duplex', block: 0, name: "Miss Ana's Duplex", client: 'Ana & the Riveras, one fence between them', who: 'ANA',
    blurb: "Two little lawns sharing one spine of fence. Ana texts in paragraphs; the Riveras text in thumbs-ups. Both sides notice everything the other side gets.",
    pop: 'Do both sides the same day or start a cold war.',
    lot: { w: 22, h: 12 }, seed: 44, fence: 'picket', gate: { x: 10.3, w: 1.4 },
    house: { x: 11, z: 9.4, w: 9, d: 4.0, c: 0xd4c2c2, shutter: 0x6b4a52 },
    paths: [{ x: 10.5, z: 0.4, w: 1.0, h: 6.8 }],
    tiers: [{ t: 'base', tier: 2 }, { t: 'circle', x: 17, z: 8, r: 3.4, tier: 3 }],
    props: [
      { k: 'planter', x: 1.6, z: 1.6 }, { k: 'planter', x: 20.4, z: 1.6, o: { c: 0x9a3d5e } },
      { k: 'chair', x: 3.4, z: 9.4, rot: 0.7 }, { k: 'chair', x: 4.6, z: 10.0, rot: -0.4, o: { c: 0xc7885e } },
      { k: 'grill', x: 18.6, z: 2.6 },
      { k: 'shrub', x: 5.2, z: 11.0 }, { k: 'shrub', x: 16.8, z: 11.0 },
      { k: 'hosereel', x: 21.0, z: 10.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 10.5, h: 6, name: "Ana's Front" }, { x: 0, z: 6, w: 10.5, h: 6, name: "Ana's Porch Side" },
      { x: 11.5, z: 0, w: 10.5, h: 6, name: "Riveras' Front" }, { x: 11.5, z: 6, w: 10.5, h: 6, name: "Riveras' Back Patch" },
    ],
    disc: [
      { x: 5.6, z: 6.8, tier: 'story', kind: 'ring', label: 'A thin gold ring', text: "Dios mío. My mother's ring. It's been two summers. I lit candles. I need to sit down." },
    ],
    junk: 4,
    texts: {
      arrive: "Both sides please!! I will hear about it at dinner forever if the Riveras' half looks better. FOREVER.",
      mid: [{ pct: 55, t: "👍👍 — the Riveras" }],
      reply: "Perfectly even. You have prevented a war. My mother's ring is on my hand as I type this. Thank you, mijo.",
    },
  },
  {
    id: 'corner', block: 0, name: 'The Corner Lot', client: 'Mr. Okafor, precision enthusiast', who: 'MR. OKAFOR',
    blurb: "The pride of the block: a corner lot with sidewalk on two sides, which means edges, which means everyone walking to church on Sunday grades your work.",
    pop: 'The edges ARE the job here. The middle is just commuting.',
    lot: { w: 20, h: 16 }, seed: 55, fence: 'none',
    house: { x: 15.2, z: 5.0, w: 6.5, d: 4.4, c: 0xcfd8c0, shutter: 0x445e40 },
    paths: [{ x: 0, z: 7.6, w: 12, h: 1.0 }],
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 12, z: 8, w: 8, h: 8, tier: 3 }],
    props: [
      { k: 'hydrant', x: 1.3, z: 1.3 },
      { k: 'mailbox', x: 3.2, z: 0.9, o: { c: 0x3e7247 } },
      { k: 'tree', x: 16.9, z: 11.4, o: { s: 1.2, seed: 12 } },
      { k: 'flowerbed', x: 6.4, z: 12.8, o: { r: 1.3, cols: [0xf2c14e, 0xe8792c], seed: 9 } },
      { k: 'shrub', x: 12.4, z: 15.0 }, { k: 'shrub', x: 14.2, z: 15.0 }, { k: 'shrub', x: 16.0, z: 15.0 },
      { k: 'wheelbarrow', x: 18.8, z: 13.4, rot: 1.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 10, h: 7.6, name: 'Hydrant Corner' }, { x: 10, z: 0, w: 10, h: 7.6, name: 'Maple Side' },
      { x: 0, z: 8.6, w: 10, h: 7.4, name: 'Flower Walk' }, { x: 10, z: 8.6, w: 10, h: 7.4, name: 'The Deep End' },
    ],
    disc: [
      { x: 9.2, z: 4.4, tier: 'story', kind: 'key', label: 'A brass house key', text: "That would be the spare I accused my brother-in-law of losing in 2024. I will be issuing no apology. He's lost others." },
      { x: 17.8, z: 14.2, tier: 'keep', kind: 'fossil', label: 'Spiral fossil' },
    ],
    junk: 4,
    texts: {
      arrive: "The hydrant corner is the whole neighborhood's first impression of this street. No pressure. Considerable pressure.",
      mid: [{ pct: 70, t: "Mrs. Attaway just slowed her walk to look. That's the Michelin star of this block." }],
      reply: "Crisp. CRISP. Pop trained you or it's in the blood — either way the street thanks you.",
    },
  },

  // ================= BLOCK 2 — THE FAVORS =================
  {
    id: 'bakery', block: 1, name: 'The Bakery Strip', client: 'Rosa, Hazel Park Bakehouse', who: 'ROSA',
    blurb: "The grass strip behind the bakehouse plus the little seating patch out front. Rosa pays in muffins and holds the town's gossip, which is worth more.",
    pop: 'Thistle by the bins comes back every year. Bring the trimmer.',
    lot: { w: 26, h: 12 }, seed: 66, fence: 'rail', gate: { x: 7.2, w: 1.5 },
    house: { x: 4.4, z: 9.2, w: 7, d: 4, c: 0xe0b48a, door: 0x8a3c3c },
    paths: [{ x: 12.4, z: 0.4, w: 1.2, h: 11.2 }],
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 14, z: 0, w: 12, h: 12, tier: 3 }],
    wclumps: [{ x: 23.6, z: 9.8, r: 0.8 }, { x: 21.2, z: 10.6, r: 0.6 }, { x: 24.4, z: 6.4, r: 0.55 }],
    props: [
      { k: 'chair', x: 3.2, z: 3.4, rot: 0.5 }, { k: 'chair', x: 4.8, z: 2.6, rot: -0.9, o: { c: 0xd9a05b } }, { k: 'bench', x: 8.6, z: 2.0 },
      { k: 'planter', x: 1.6, z: 1.6, o: { c: 0x9a3d5e } }, { k: 'planter', x: 1.3, z: 5.4 },
      { k: 'shed', x: 22.8, z: 2.4, rot: 0.4, o: { c: 0x7c6a52 } },
      { k: 'stump', x: 17.4, z: 8.8 },
    ],
    zones: [
      { x: 0, z: 0, w: 13, h: 12, name: 'The Seating Patch' },
      { x: 13, z: 0, w: 13, h: 6, name: 'Behind the Ovens' },
      { x: 13, z: 6, w: 13, h: 6, name: 'The Bin Run' },
    ],
    disc: [
      { x: 19.6, z: 10.4, tier: 'story', kind: 'plank', label: "A hand-painted 'PIE TODAY' sign", text: "MY SIGN! The wind took it in March and took my will to bake pies with it. Pies are BACK, tell everyone." },
    ],
    junk: 5,
    texts: {
      arrive: "Muffins are on the windowsill. The blueberry ones are payment, the bran ones are a test of character.",
      mid: [{ pct: 50, t: "Every regular in here is watching you instead of eating. You're better than cable." }],
      reply: "The strip looks like frosting. PIE TODAY is back on the wall where it belongs. Extra muffin in the bag — you know which kind you earned.",
    },
  },
  {
    id: 'hendersons', block: 1, name: "The Hendersons'", client: 'The Hendersons + Biscuit', who: 'JIM H.',
    blurb: "Family backyard with a dog who believes the mower is either a threat or the greatest game ever invented, depending on the minute. His name is Biscuit. He will find you.",
    pop: "The dog is a good dog. The dog is also the reason the hose has nine holes in it.",
    lot: { w: 22, h: 16 }, seed: 77, fence: 'picket', gate: { x: 5.8, w: 1.4 },
    house: { x: 4.6, z: 5.0, w: 6.5, d: 4.4, c: 0xe7d8c0, shutter: 0x5c7286 },
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 8, w: 22, h: 8, tier: 3 }],
    props: [
      { k: 'doghouse', x: 18.6, z: 12.8, rot: -0.7 },
      { k: 'swingset', x: 6.4, z: 12.0, rot: 0.15 },
      { k: 'kiddiepool', x: 13.6, z: 10.2 },
      { k: 'sandbox', x: 2.9, z: 9.8 },
      { k: 'hosereel', x: 20.8, z: 1.6 },
      { k: 'tree', x: 16.8, z: 4.0, o: { s: 1.1, seed: 3 } },
    ],
    zones: quadZones(22, 16, ['Front Patch', 'Maple Corner', 'Swing Side', "Biscuit's Territory"]),
    disc: [
      { x: 10.4, z: 13.6, tier: 'story', kind: 'ball', label: "Biscuit's tennis ball (the original)", text: "You found THE ball?? He has six. He has grieved THIS one since Easter. I'm actually a little emotional." },
      { x: 2.2, z: 14.4, tier: 'keep', kind: 'dogtag', label: "A tag reading 'BUDDY' — before Biscuit's time" },
    ],
    junk: 6, rabbit: true, dog: true,
    texts: {
      arrive: "Biscuit is OUT. He's friendly. He's too friendly. Godspeed.",
      mid: [{ pct: 40, t: "He's doing the thing where he runs exactly alongside the mower. He thinks you two are a team now." }],
      reply: "Biscuit has the ball. Biscuit has not put the ball down. Biscuit will sleep with the ball. Ten out of ten, no notes.",
    },
  },
  {
    id: 'delgado', block: 1, name: "Widow Delgado's Half-Acre", client: 'Mrs. Delgado', who: 'MRS. DELGADO',
    blurb: "The biggest lawn on the route — the orchard rows out back haven't seen a blade since her husband passed in the spring. She watches from the kitchen and waves exactly once.",
    pop: 'Do the orchard rows in long straight passes. Miguel liked them straight.',
    lot: { w: 30, h: 20 }, seed: 88, fence: 'rail', gate: { x: 8.4, w: 1.6 },
    house: { x: 4.4, z: 4.6, w: 7, d: 4.4, c: 0xf0ead8, shutter: 0x3d5a3a, h: 3.3 },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 0, w: 30, h: 7, tier: 2 }],
    props: [
      { k: 'tree', x: 6, z: 12, o: { s: 1.0, seed: 21, leaf: 0x5d8a3f } }, { k: 'tree', x: 12, z: 12, o: { s: 1.05, seed: 22, leaf: 0x5d8a3f } },
      { k: 'tree', x: 18, z: 12, o: { s: 0.95, seed: 23, leaf: 0x5d8a3f } }, { k: 'tree', x: 24, z: 12, o: { s: 1.1, seed: 24, leaf: 0x5d8a3f } },
      { k: 'tree', x: 6, z: 17, o: { s: 1.0, seed: 25, leaf: 0x5d8a3f } }, { k: 'tree', x: 12, z: 17, o: { s: 0.9, seed: 26, leaf: 0x5d8a3f } },
      { k: 'tree', x: 18, z: 17, o: { s: 1.05, seed: 27, leaf: 0x5d8a3f } }, { k: 'tree', x: 24, z: 17, o: { s: 1.0, seed: 28, leaf: 0x5d8a3f } },
      { k: 'bench', x: 27.2, z: 8.6, rot: -1.6 },
      { k: 'wheelbarrow', x: 2.4, z: 18.2, rot: 0.4 },
      { k: 'flowerbed', x: 3.0, z: 9.2, o: { r: 1.2, cols: [0xfdfdf8, 0xf2c14e], seed: 31 } },
    ],
    zones: [
      { x: 0, z: 0, w: 30, h: 7, name: 'The Front Field' },
      { x: 0, z: 7, w: 15, h: 6.5, name: 'Orchard West' }, { x: 15, z: 7, w: 15, h: 6.5, name: 'Orchard East' },
      { x: 0, z: 13.5, w: 15, h: 6.5, name: 'Back Rows West' }, { x: 15, z: 13.5, w: 15, h: 6.5, name: 'Back Rows East' },
    ],
    disc: [
      { x: 27.4, z: 9.4, tier: 'story', kind: 'trowel', label: "A worn garden trowel, 'M.D.' on the handle", text: "Miguel's. He'd lose it every October and buy the same one again every April. Leave it on the bench, please. Just there." },
      { x: 9.4, z: 15.2, tier: 'keep', kind: 'coin', label: 'Silver peso, 1962' },
    ],
    junk: 5,
    texts: {
      arrive: "The back rows are bad, I know. It got away from me. It all got away from me a little.",
      mid: [{ pct: 60, t: "I can see the rows again from the kitchen. I made too much coffee. Habit. Would you want a cup, after?" }],
      reply: "Straight as he ever made them. I sat on the bench with the coffee. Both cups. Thank you isn't the right size of word.",
    },
  },
  {
    id: 'rental', block: 1, name: 'The Rental on Birch', client: 'Tenants (landlord unreachable)', who: 'SAM (TENANT)',
    blurb: "The landlord's 'lawn guy' has been 'coming next week' since April. The tenants chipped in for you instead. Knee-high and full of the previous tenants' archaeology.",
    pop: "A rental yard holds five families' worth of lost things. Dig gently.",
    lot: { w: 21, h: 15 }, seed: 99, fence: 'chain', gate: { x: 5.0, w: 1.3 },
    house: { x: 5.4, z: 5.2, w: 6.5, d: 4.4, c: 0xb8b4a4, shutter: 0x6a6f73 },
    tiers: [{ t: 'base', tier: 3 }],
    wclumps: [{ x: 2.2, z: 12.8, r: 0.7 }, { x: 18.8, z: 2.4, r: 0.6 }],
    props: [
      { k: 'stump', x: 15.8, z: 11.6 },
      { k: 'chair', x: 8.4, z: 10.8, rot: 2.4, o: { c: 0x8a8f94 } },
      { k: 'planter', x: 1.5, z: 1.5, o: { c: 0x777c80 } },
      { k: 'gnome', x: 19.4, z: 13.6, rot: 1.1 },
    ],
    zones: quadZones(21, 15, ['Street Side', 'Driveway Edge', 'The Clothesline Patch', 'The Wild Corner']),
    disc: [
      { x: 11.6, z: 6.4, tier: 'story', kind: 'plank', label: 'A doorframe plank — pencil marks: EMMA 3\'2", EMMA 3\'9", EMMA 4\'4"', text: "oh man. previous tenants' kid I think. that's going on the porch in case they ever come back for it. some things shouldn't be in the grass." },
      { x: 11.2, z: 3.0, tier: 'keep', kind: 'ring', label: 'A class ring, HPHS ’91' },
    ],
    junk: 7,
    texts: {
      arrive: "we pooled $40 and a sincere promise that Dave will 'get you back.' Dave will not. thank you for coming anyway",
      mid: [{ pct: 50, t: "three neighbors have stopped to ask who finally called someone. you're famous on Birch St" }],
      reply: "it looks like someone LIVES here. because we do!! Dave says he'll 'square up next week.' classic Dave. WE square up — porch, envelope, real money",
    },
  },
  {
    id: 'creek', block: 1, name: 'The Creek Lot', client: 'Tomás, ends at the water', who: 'TOMÁS',
    blurb: "A long irregular lot that runs down to Miller Creek. Ducks own the bottom third and they know it. The bank is trimmer country — one wheel in the water and you'll be the town's next cautionary tale.",
    pop: "Mow TO the bank, never ON it. The ducks take the toll either way.",
    lot: { w: 28, h: 14 }, seed: 111, fence: 'none',
    house: { x: 20.2, z: 2.8, w: 4.8, d: 3.4, c: 0x9c8a6a, door: 0x5a4a34 },
    paths: [{ x: 3.0, z: 0.4, w: 1.0, h: 9.0, stones: true }],
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 9, w: 28, h: 5, tier: 3 }],
    wclumps: [{ x: 6.4, z: 12.4, r: 0.7 }, { x: 13.2, z: 12.9, r: 0.8 }, { x: 21.6, z: 12.2, r: 0.7 }, { x: 25.8, z: 12.8, r: 0.5 }],
    props: [
      { k: 'tree', x: 24.2, z: 3.4, o: { s: 1.25, seed: 41, tire: true } },
      { k: 'bench', x: 10.2, z: 10.4, rot: 3.14 },
      { k: 'pine', x: 1.8, z: 11.8 }, { k: 'pine', x: 27.0, z: 10.9, o: { s: 0.85 } },
      { k: 'wheelbarrow', x: 13.6, z: 2.2, rot: -0.8 },
    ],
    zones: [
      { x: 0, z: 0, w: 14, h: 9, name: 'Upper Lawn West' }, { x: 14, z: 0, w: 14, h: 9, name: 'Upper Lawn East' },
      { x: 0, z: 9, w: 28, h: 5, name: 'The Creek Bank' },
    ],
    disc: [
      { x: 19.2, z: 12.6, tier: 'story', kind: 'cap', label: "A kid-size baseball cap, 'HP TADPOLES'", text: "Ha! Tadpoles! That's the pee-wee league. Some kid cried the whole ride home over that cap, guaranteed. I'll pin it to the notice board." },
      { x: 26.6, z: 13.1, tier: 'keep', kind: 'fossil', label: 'Creek-worn fossil stone' },
    ],
    junk: 5, rabbit: true,
    texts: {
      arrive: "Ducks charge a crossing fee at the bottom. It's bread. I leave some on the bench — you'll see.",
      mid: [{ pct: 65, t: "The ducks have convened a committee about you. Verdict pending." }],
      reply: "Bank's clean, ducks approve, committee adjourned. It looks like a postcard down there. Wait — it IS one now.",
    },
  },

  // ================= BLOCK 3 — THE RESCUES =================
  {
    id: 'foreclosure', block: 2, name: 'The Foreclosure on Maple', client: 'Nobody asked.', who: 'THE BLOCK',
    blurb: "Empty eighteen months. Waist-high, gone to seed, the yard every kid crosses the street to avoid. Nobody's paying for this one. Pop kept a page for it anyway — sometimes you cut a lawn so the street remembers it's a street.",
    pop: "Nobody has to ask. That's the whole point.",
    lot: { w: 24, h: 17 }, seed: 133, fence: 'chain', gate: { x: 6.2, w: 1.4 },
    house: { x: 6.0, z: 6.6, w: 7, d: 4.6, derelict: true },
    tiers: [{ t: 'base', tier: 4 }, { t: 'rect', x: 0, z: 0, w: 24, h: 4, tier: 3 }],
    wclumps: [{ x: 3.2, z: 11.2, r: 0.8 }, { x: 19.6, z: 6.6, r: 0.9 }, { x: 12.2, z: 14.2, r: 0.8 }, { x: 21.8, z: 15.0, r: 0.6 }],
    props: [
      { k: 'stump', x: 8.8, z: 11.2 },
      { k: 'tree', x: 19.0, z: 12.4, o: { s: 1.3, seed: 51, leaf: 0x4a6a30 } },
      { k: 'planter', x: 2.0, z: 15.2, o: { c: 0x6a6f73 } },
    ],
    zones: [
      { x: 0, z: 0, w: 24, h: 4, name: 'The Sidewalk Apron' },
      { x: 0, z: 4, w: 12, h: 6.5, name: 'The Front Jungle' }, { x: 12, z: 4, w: 12, h: 6.5, name: 'The Driveway Side' },
      { x: 0, z: 10.5, w: 12, h: 6.5, name: 'The Deep Back' }, { x: 12, z: 10.5, w: 12, h: 6.5, name: 'Under the Elm' },
    ],
    disc: [
      { x: 14.6, z: 8.8, tier: 'story', kind: 'key', label: 'House keys on a sunflower keychain', text: "(You pocket them for whoever comes next. Somebody always comes next. The sunflower's still bright.)", self: true },
      { x: 6.2, z: 13.4, tier: 'story', kind: 'photo', label: 'A photograph — a birthday party on this lawn', text: "(Balloons on the fence. A cake on a card table. This grass remembers being a backyard. You leave the photo on the porch rail, weighted with a pebble.)", self: true },
      { x: 21.0, z: 14.4, tier: 'keep', kind: 'coin', label: 'Wheat penny, 1944' },
    ],
    junk: 6, rabbit: true,
    texts: {
      arrive: "(No client. Just the notebook page in Pop's hand: 'Maple St. house — when it needs it.')",
      mid: [{ pct: 50, t: "A woman across the street is watching from her porch. She raises her coffee mug at you, slow, like a salute." }],
      reply: "(No one to text. But the porch light two doors down blinks twice as you pack up, and somehow that's the whole paycheck.)",
    },
  },
  {
    id: 'gary', block: 2, name: "Gary's Bad Year", client: 'Gary, femur, ladder, April', who: 'GARY',
    blurb: "Gary fell off a ladder in April doing the gutters. The backyard has been growing since with a grill trapped somewhere in the middle of it like a shipwreck. Gary narrates from a lawn chair he cannot get out of quickly.",
    pop: "Gary will offer to help. Do not let Gary help.",
    lot: { w: 22, h: 16 }, seed: 144, fence: 'picket', gate: { x: 5.6, w: 1.4 },
    house: { x: 5.0, z: 4.6, w: 6.5, d: 4.2, c: 0xd0dce0, shutter: 0x3e5668 },
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 6, w: 22, h: 10, tier: 4 }],
    wclumps: [{ x: 3.2, z: 13.6, r: 0.7 }, { x: 18.4, z: 14.4, r: 0.8 }],
    props: [
      { k: 'grill', x: 12.4, z: 10.6 },
      { k: 'chair', x: 10.8, z: 3.2, rot: 0.9, o: { c: 0x6fa3c7 } },
      { k: 'tree', x: 18.6, z: 3.6, o: { s: 1.1, seed: 61 } },
      { k: 'hosereel', x: 1.6, z: 8.0 },
      { k: 'shed', x: 19.4, z: 13.2, rot: -0.5 },
    ],
    zones: [
      { x: 0, z: 0, w: 22, h: 6, name: "Gary's Observation Deck" },
      { x: 0, z: 6, w: 11, h: 10, name: 'The Overgrowth West' }, { x: 11, z: 6, w: 11, h: 10, name: 'The Grill Expedition' },
    ],
    disc: [
      { x: 13.0, z: 11.4, tier: 'story', kind: 'cap', label: "Gary's grilling cap ('KISS THE COOK, CAREFULLY')", text: "MY CAP. The grill AND the cap. This is the best day of my recovery and my physical therapist SAYS I'm not allowed to have those words." },
      { x: 8.6, z: 14.2, tier: 'keep', kind: 'arrowhead', label: 'Flint arrowhead' },
    ],
    junk: 5,
    texts: {
      arrive: "I'd help but my leg is titanium now. Partially. I tell people mostly. IMPORTANT: the grill is in there somewhere. She's called Brenda.",
      mid: [{ pct: 45, t: "BRENDA ON THE HORIZON. You magnificent kid. She's been out there since the ladder incident." }],
      reply: "Brenda's cleaned up, cap's on my head, doctor says the leg's ahead of schedule. First burgers off Brenda are yours. That's a legal contract now.",
    },
  },
  {
    id: 'missvi', block: 2, name: "Miss Vi's", client: 'Miss Vi, collector of everything', who: 'MISS VI',
    blurb: "Miss Vi never met a yard ornament she didn't adopt. Somewhere under the overgrowth is a gnome army, a birdbath, and — her words — 'the good flamingo.' Mow around what you find. They're family.",
    pop: "Every gnome has a name. Do NOT bring one to the curb, even the chipped one. ESPECIALLY the chipped one.",
    lot: { w: 20, h: 15 }, seed: 155, fence: 'picket', gate: { x: 4.8, w: 1.4 },
    house: { x: 4.8, z: 5.2, w: 6, d: 4.2, c: 0xead8e8, shutter: 0x7a4a6a, door: 0x9a3d5e },
    tiers: [{ t: 'base', tier: 4 }, { t: 'rect', x: 0, z: 0, w: 20, h: 4.5, tier: 2 }],
    wclumps: [{ x: 17.0, z: 6.2, r: 0.6 }, { x: 3.0, z: 10.0, r: 0.6 }],
    props: [
      { k: 'gnome', x: 7.2, z: 7.6, rot: 0.6 }, { k: 'gnome', x: 8.1, z: 8.3, rot: -1.1, o: { s: 0.85 } },
      { k: 'gnome', x: 6.4, z: 8.6, rot: 2.2, o: { s: 1.15 } }, { k: 'gnome', x: 13.8, z: 11.6, rot: -0.4 },
      { k: 'gnome', x: 16.6, z: 9.0, rot: 1.7, o: { s: 0.9 } },
      { k: 'birdbath', x: 11.0, z: 9.8 },
      { k: 'flowerbed', x: 3.4, z: 12.6, o: { r: 1.4, cols: [0xe86a92, 0xb87fd9, 0xfdfdf8], seed: 71 } },
      { k: 'planter', x: 18.4, z: 13.4, o: { c: 0x9a3d5e } },
      { k: 'shrub', x: 1.5, z: 9.8 },
    ],
    zones: [
      { x: 0, z: 0, w: 20, h: 4.5, name: 'The Front Parade' },
      { x: 0, z: 4.5, w: 10, h: 10.5, name: 'Gnome Country' }, { x: 10, z: 4.5, w: 10, h: 10.5, name: 'The Birdbath Wilds' },
    ],
    disc: [
      { x: 14.8, z: 13.0, tier: 'story', kind: 'ball', label: 'The good flamingo (deflated)', text: "FERNANDO!!! Oh, he's flat. He's been flat since the hailstorm. But he's FOUND, that's what matters — inflation is a Tuesday problem." },
      { x: 2.4, z: 8.4, tier: 'story', kind: 'gnomekind', kind2: 'coin', label: "A tiny gnome hat (ceramic)", text: "That's Bartholomew's hat!! He's been bareheaded by the birdbath ALL YEAR. The dignity you have restored to this garden." },
      { x: 18.0, z: 5.4, tier: 'keep', kind: 'ring', label: 'Costume ring, enormous ruby (glass)' },
    ],
    junk: 6,
    texts: {
      arrive: "Mow AROUND the residents please!! If you meet a gnome, say hello, they can tell when people don't.",
      mid: [{ pct: 55, t: "I can see Bartholomew from the window!! Hello Bartholomew!! (You'll know him. Chipped. Distinguished.)" }],
      reply: "The whole family visible at once — it's a REUNION. Fernando's at the pump station getting his figure back. You're in the garden's good graces forever.",
    },
  },
  {
    id: 'bell', block: 2, name: "Mr. Bell's", client: 'Mr. Bell, taught 3rd grade for 31 years', who: 'MR. BELL',
    blurb: "'It used to be something,' is all he said on the phone. Under the jungle there's a designed garden — flagstone paths, beds in a pattern — laid by his late wife. He stopped mowing when she passed. Cut carefully. You're excavating.",
    pop: "June laid those stones by hand the summer of the flood. Find them all.",
    lot: { w: 22, h: 16 }, seed: 166, fence: 'picket', gate: { x: 5.4, w: 1.4 },
    house: { x: 17.4, z: 3.4, w: 6, d: 4.2, c: 0xf0e2c8, shutter: 0x6a5a3a },
    paths: [
      { x: 5.6, z: 0.4, w: 1.0, h: 6.0, stones: true },
      { x: 5.6, z: 6.4, w: 10.0, h: 1.0, stones: true },
      { x: 14.6, z: 7.4, w: 1.0, h: 6.2, stones: true },
      { x: 7.0, z: 10.8, w: 7.6, h: 1.0, stones: true },
    ],
    tiers: [{ t: 'base', tier: 4 }, { t: 'rect', x: 0, z: 0, w: 22, h: 3.6, tier: 2 }],
    props: [
      { k: 'flowerbed', x: 9.4, z: 4.4, o: { r: 1.15, cols: [0xb87fd9, 0xfdfdf8], seed: 81 } },
      { k: 'flowerbed', x: 17.0, z: 7.4, o: { r: 1.0, cols: [0xe86a92, 0xf2c14e], seed: 82 } },
      { k: 'flowerbed', x: 3.4, z: 9.2, o: { r: 1.2, cols: [0xf2c14e, 0xfdfdf8], seed: 83 } },
      { k: 'flowerbed', x: 18.6, z: 12.2, o: { r: 1.15, cols: [0xb87fd9, 0xe86a92], seed: 84 } },
      { k: 'birdbath', x: 10.8, z: 13.4 },
      { k: 'bench', x: 2.6, z: 14.2, rot: 2.6 },
      { k: 'tree', x: 20.6, z: 8.2, o: { s: 1.0, seed: 85, birch: true, leaf: 0x6f9c48 } },
    ],
    zones: [
      { x: 0, z: 0, w: 22, h: 3.6, name: 'The Street Face' },
      { x: 0, z: 3.6, w: 11, h: 6.2, name: "June's West Beds" }, { x: 11, z: 3.6, w: 11, h: 6.2, name: 'The Birch Quarter' },
      { x: 0, z: 9.8, w: 11, h: 6.2, name: 'The Bench Corner' }, { x: 11, z: 9.8, w: 11, h: 6.2, name: 'The Birdbath Round' },
    ],
    disc: [
      { x: 6.2, z: 12.0, tier: 'story', kind: 'glasses', label: 'Gardening gloves, rolled together like socks', text: "June's. She rolled them like that so they wouldn't 'wander off.' Leave them on the bench arm, if you would. Right side. Her side." },
      { x: 16.4, z: 9.6, tier: 'keep', kind: 'coin', label: 'A silver thimble' },
    ],
    junk: 3,
    texts: {
      arrive: "The paths make a loop, if they're still under there. She called it 'the circuit.' We walked it every evening after supper.",
      mid: [{ pct: 60, t: "There it is. The circuit. I'm standing at the window with my tea and I can walk it with my eyes." }],
      reply: "I walked it tonight. First time in two years. Every stone right where she put it. You didn't mow a lawn today, son. You opened a door.",
    },
  },
  {
    id: 'church', block: 2, name: 'The Field Behind the Church', client: 'Everybody, apparently', who: 'PASTOR DEE',
    blurb: "The old picnic field went feral and the harvest supper is in two weeks. Half the congregation has opinions, three have lemonade, one has a megaphone he does not need. Biggest cut of your life so far.",
    pop: "Somebody will bring you lemonade every 20 minutes. Accept every one. That's the covenant.",
    lot: { w: 34, h: 22 }, seed: 177, fence: 'rail', gate: { x: 9.5, w: 2.0 },
    house: { x: 27.0, z: 4.0, w: 8, d: 5.6, c: 0xf4f1e8, steeple: true, door: 0x5a4a6a, h: 3.4 },
    tiers: [{ t: 'base', tier: 4 }, { t: 'rect', x: 0, z: 0, w: 34, h: 6, tier: 3 }],
    wclumps: [{ x: 6.2, z: 18.4, r: 0.9 }, { x: 27.6, z: 16.8, r: 0.8 }, { x: 16.4, z: 19.6, r: 0.7 }, { x: 30.8, z: 8.4, r: 0.6 }],
    props: [
      { k: 'bench', x: 6.4, z: 3.2 }, { k: 'bench', x: 12.4, z: 3.2 }, { k: 'bench', x: 18.4, z: 3.2 },
      { k: 'tree', x: 22.0, z: 9.0, o: { s: 1.35, seed: 91 } },
      { k: 'tree', x: 3.4, z: 12.4, o: { s: 1.2, seed: 92 } },
      { k: 'flagpole', x: 31.8, z: 2.2 },
      { k: 'shed', x: 30.6, z: 19.4, rot: 0.5 },
      { k: 'stump', x: 14.2, z: 13.0 },
    ],
    zones: [
      { x: 0, z: 0, w: 34, h: 6, name: 'The Bench Row' },
      { x: 0, z: 6, w: 17, h: 8, name: 'Supper Field West' }, { x: 17, z: 6, w: 17, h: 8, name: 'Supper Field East' },
      { x: 0, z: 14, w: 17, h: 8, name: 'The Far Meadow' }, { x: 17, z: 14, w: 17, h: 8, name: 'The Back Fence Line' },
    ],
    disc: [
      { x: 21.4, z: 11.2, tier: 'story', kind: 'medal', label: "A casserole dish lid (Pyrex, floral)", text: "THE LID. Eleanor has blamed the Hendersons for that lid since the 2023 supper. There will be a public reconciliation. Bring your appetite." },
      { x: 8.8, z: 17.2, tier: 'keep', kind: 'arrowhead', label: 'Obsidian arrowhead' },
    ],
    junk: 8, rabbit: true,
    texts: {
      arrive: "Lemonade station's by the benches. Walt has the megaphone. Ignore Walt. We're so glad you're here.",
      mid: [{ pct: 35, t: "WALT (megaphone): 'HE'S ROUNDING THE OLD STUMP. BEAUTIFUL FORM.' — please, again, ignore Walt." }, { pct: 75, t: "Eleanor says to tell you the good casserole is already promised to you. This is an enormous honor. Act accordingly." }],
      reply: "The field's ready and the whole supper list knows your name. Two weeks from Sunday. You're seated at the FIRST table — Pop's old seat.",
    },
  },

  // ================= BLOCK 4 — THE LANDMARKS =================
  {
    id: 'outfield', block: 3, name: 'Little League Outfield', client: 'Coach Whitfield (of course)', who: 'COACH',
    blurb: "Playoffs Saturday. The infield's dirt is sacred and handled — Coach wants the OUTFIELD striped 'like the majors.' Big, flat, glorious. The riding mower was built for this day.",
    pop: "Stripe it home-plate-out. When you finish, stand at the fence and look. That feeling is the wage.",
    lot: { w: 38, h: 24 }, seed: 188, fence: 'chain', gate: { x: 10.6, w: 2.0 },
    tiers: [{ t: 'base', tier: 3 }],
    props: [
      { k: 'bench', x: 4.4, z: 2.2 }, { k: 'bench', x: 9.0, z: 2.2 },
      { k: 'flagpole', x: 35.4, z: 2.4 },
      { k: 'speaker', x: 2.2, z: 21.6 }, { k: 'speaker', x: 35.8, z: 21.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 12.6, h: 12, name: 'Left Field' }, { x: 12.6, z: 0, w: 12.6, h: 12, name: 'Center Field' }, { x: 25.2, z: 0, w: 12.8, h: 12, name: 'Right Field' },
      { x: 0, z: 12, w: 19, h: 12, name: 'The Warning Track West' }, { x: 19, z: 12, w: 19, h: 12, name: 'The Warning Track East' },
    ],
    disc: [
      { x: 17.8, z: 9.4, tier: 'story', kind: 'ball', label: 'A game ball, signed by the whole ’19 team', text: "The '19 championship ball?! It went over the fence in the CELEBRATION and we never— kid. KID. Glass case. Trophy shelf. TONIGHT." },
      { x: 31.2, z: 18.8, tier: 'keep', kind: 'coin', label: 'A 50¢ piece — the old coin-toss coin' },
    ],
    junk: 5,
    texts: {
      arrive: "Playoffs. Saturday. Stripes. This is the World Series of lawns, kid. Mow like the majors are watching, because Walt will be, with the megaphone.",
      mid: [{ pct: 50, t: "I have goosebumps. It's the stripes or the humidity but I'm saying it's the stripes." }],
      reply: "I stood at home plate and got misty over GRASS. If we win Saturday the game ball's got your name on it. If we lose, the lawn was still perfect.",
    },
  },
  {
    id: 'commons', block: 3, name: 'Hazel Park Commons', client: 'The Town of Hazel Park', who: 'TOWN CLERK',
    blurb: "The town green: bandstand, war memorial, four benches with four regulars, and more square footage than everything on the Route combined. The clerk sent an actual work order. Pop's route just became official.",
    pop: "The memorial gets trimmed BY HAND. Hats off while you do it. That's not a rule, it's just what we do.",
    lot: { w: 40, h: 26 }, seed: 199, fence: 'none',
    paths: [{ x: 19.0, z: 0.4, w: 2.0, h: 25.2 }, { x: 0.4, z: 12.0, w: 39.2, h: 2.0 }],
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 0, w: 40, h: 8, tier: 2 }],
    wclumps: [{ x: 36.6, z: 22.4, r: 0.8 }, { x: 3.2, z: 23.0, r: 0.7 }],
    props: [
      { k: 'birdbath', x: 10.2, z: 6.4 },
      { k: 'bench', x: 14.4, z: 10.6 }, { k: 'bench', x: 25.6, z: 10.6, rot: 3.14 }, { k: 'bench', x: 14.4, z: 15.4, rot: 3.14 }, { k: 'bench', x: 25.6, z: 15.4 },
      { k: 'flagpole', x: 30.2, z: 6.6 },
      { k: 'headstone', x: 29.8, z: 8.0 },
      { k: 'shed', x: 36.8, z: 3.0, rot: 0.3, o: { c: 0x8b9a7a, w: 3.2, d: 2.4 } },
      { k: 'tree', x: 5.0, z: 18.6, o: { s: 1.4, seed: 101 } }, { k: 'tree', x: 34.8, z: 17.8, o: { s: 1.3, seed: 102 } },
      { k: 'windmill', x: 8.2, z: 22.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 20, h: 12, name: 'The Front Green' }, { x: 20, z: 0, w: 20, h: 12, name: 'Memorial Quarter' },
      { x: 0, z: 14, w: 20, h: 12, name: 'The Bandstand Lawn' }, { x: 20, z: 14, w: 20, h: 12, name: 'The Picnic Quarter' },
    ],
    disc: [
      { x: 22.6, z: 20.4, tier: 'story', kind: 'medal', label: 'A veteran’s service pin', text: "We checked the ledger — that's Earl Dawson's pin, lost at the '18 centennial. His daughter still lives on Birch. She cried on the phone. Town's covering your lunch for a month." },
      { x: 6.4, z: 24.0, tier: 'keep', kind: 'fossil', label: 'A trilobite, somehow' },
    ],
    junk: 7,
    texts: {
      arrive: "Work order #001 — first one we've ever issued for 'lawn, whole town green.' Invoice us properly this time. Pop never would.",
      mid: [{ pct: 50, t: "The bench regulars have rated your progress 'better than the fireworks.' Herb dissents. Herb always dissents." }],
      reply: "Invoice received AND paid — a town first. The green looks like the postcard in the pharmacy window. Which we should probably update. Know anyone with a camera?",
    },
  },
  {
    id: 'watertower', block: 3, name: 'Water Tower Hill', client: 'Hazel Park Utilities (and the view)', who: 'RAY (UTILITIES)',
    blurb: "The slope under the water tower — the last big cut before the notebook runs out of pages. From the top you can see every yard you've fixed all summer, green squares in a quilt. Bring the good mower. Stay for the sunset.",
    pop: "From up there you can see the whole route. I used to count the yards like sheep. —P.",
    lot: { w: 34, h: 22 }, seed: 211, fence: 'rail', gate: { x: 9.2, w: 1.8 },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 14, w: 34, h: 8, tier: 4 }],
    wclumps: [{ x: 8.4, z: 19.2, r: 0.9 }, { x: 24.6, z: 18.0, r: 0.8 }, { x: 30.2, z: 20.4, r: 0.6 }],
    props: [
      { k: 'pine', x: 4.2, z: 4.4, o: { s: 1.2 } }, { k: 'pine', x: 30.0, z: 5.8, o: { s: 1.1 } }, { k: 'pine', x: 27.2, z: 3.2, o: { s: 0.9 } },
      { k: 'bench', x: 17.0, z: 3.0, rot: 3.14 },
      { k: 'shed', x: 3.0, z: 19.0, rot: 0.8, o: { c: 0x9db3bd, w: 2.4, d: 2.0 } },
      { k: 'headstone', x: 16.2, z: 6.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 34, h: 7, name: 'The Overlook' },
      { x: 0, z: 7, w: 17, h: 7, name: 'The West Slope' }, { x: 17, z: 7, w: 17, h: 7, name: 'The East Slope' },
      { x: 0, z: 14, w: 17, h: 8, name: 'The Wild Shoulder' }, { x: 17, z: 14, w: 17, h: 8, name: 'Under the Tower' },
    ],
    disc: [
      { x: 15.4, z: 5.4, tier: 'story', kind: 'photo', label: "A photo wedged under the bench: Pop, younger, this exact view", text: "(He's got one boot on the bench and the whole green town behind him. On the back, in pencil: 'best office in the county.' You sit where he stood for a while.)", self: true },
      { x: 28.0, z: 19.6, tier: 'keep', kind: 'ring', label: "A utility worker's brass gauge key" },
    ],
    junk: 4, rabbit: true,
    texts: {
      arrive: "Gate code's 1-9-5-7 but the gate's broken so it's more of a trivia question. That slope's steep — trimmer country up top.",
      mid: [{ pct: 60, t: "You're a green dot on a green hill from down here. Prettiest work order of my year." }],
      reply: "Tower's dressed for the postcard. Stay up there a minute, kid. Sunset's on the house. Best office in the county.",
    },
  },

  // ================= FINALE =================
  {
    id: 'pops', block: 3, name: "Pop's House", client: '—', who: null, finale: true,
    blurb: "The last page isn't a client. It's an address you know by heart, and a yard that's been waiting a year, and his mower — the first one, the red one — still in your garage. It only ever wanted one more job. Just you, Old Faithful, and the quietest lawn in Hazel Park.",
    pop: "—",
    lot: { w: 22, h: 16 }, seed: 1957, fence: 'picket', gate: { x: 5.8, w: 1.4 },
    gearLock: 'push', noRadio: true,
    house: { x: 5.8, z: 6.4, w: 6.5, d: 4.4, c: 0xe7dcc3, shutter: 0x86232a, door: 0x86232a },
    paths: [{ x: 6.0, z: 0.4, w: 1.0, h: 3.6, stones: true }],
    tiers: [{ t: 'base', tier: 4 }, { t: 'rect', x: 0, z: 0, w: 22, h: 4, tier: 3 }],
    props: [
      { k: 'tree', x: 17.8, z: 11.6, o: { s: 1.4, seed: 57, tire: true } },
      { k: 'flowerbed', x: 3.0, z: 10.8, o: { r: 1.3, cols: [0xe86a92, 0xfdfdf8], seed: 58 } },
      { k: 'bench', x: 12.2, z: 14.0, rot: 3.14 },
      { k: 'mailbox', x: 4.6, z: 1.0, o: { c: 0xc0392b } },
      { k: 'shed', x: 20.0, z: 2.8, rot: -0.6, o: { c: 0x8a7358, w: 2.2, d: 1.8 } },
      { k: 'birdbath', x: 9.0, z: 10.0 },
    ],
    zones: [
      { x: 0, z: 0, w: 22, h: 4, name: 'The Front Walk' },
      { x: 0, z: 4, w: 11, h: 6, name: "The Peony Side" }, { x: 11, z: 4, w: 11, h: 6, name: 'The Shed Run' },
      { x: 0, z: 10, w: 11, h: 6, name: 'The Quiet Corner' }, { x: 11, z: 10, w: 11, h: 6, name: 'Under the Tire Swing' },
    ],
    disc: [
      { x: 9.4, z: 9.6, tier: 'story', kind: 'cap', label: "Pop's cap", text: "(Sun-bleached red, salt line on the band. You knock the dust off against your knee, the way he did, and put it on. It fits. Of course it fits.)", self: true },
      { x: 3.4, z: 12.2, tier: 'story', kind: 'trowel', label: "His trowel, standing in the flowerbed", text: "(Right where he left it, like he'd stepped inside for iced tea. You finish the bed's edge with it. The peonies made it through the year on their own. Tough, like him.)", self: true },
      { x: 16.8, z: 13.0, tier: 'story', kind: 'photo', label: 'A photograph under the tire swing', text: "(The route, drawn in marker on a diner placemat — every client's name in his handwriting. In the corner, small: a stick figure pushing a mower, and holding its hand, a smaller one. You, he wrote under it. Someday.)", self: true },
    ],
    junk: 0,
    texts: {
      arrive: "(The gate doesn't stick. He'd fixed it, at some point. Of course he had.)",
      mid: [{ pct: 50, t: "(The tire swing turns a little in the wind, like someone just left it.)" }],
      reply: "(You sit on the bench until the fireflies come out. The yard breathes. The porch light, on its old timer, clicks on like it knew.\n\nLast page. Both sides full now.\n\n— FRESH CUT —)",
    },
  },

  // ================= ODD JOBS =================
  {
    id: 'putthutt', block: 4, name: 'The Putt Hutt', client: "Big Stan's Mini Golf", who: 'BIG STAN', odd: true,
    blurb: "Nine 'greens,' one windmill, zero maintenance since Big Stan's nephew quit in June. The greens must be VELVET, Stan says. Stan has never touched velvet but he knows what he means.",
    pop: '—',
    lot: { w: 26, h: 18 }, seed: 501, fence: 'rail', gate: { x: 7.0, w: 1.6 },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 5, z: 5, r: 2.2, tier: 1 }, { t: 'circle', x: 12, z: 4, r: 2.0, tier: 1 }, { t: 'circle', x: 20, z: 5.5, r: 2.2, tier: 1 }, { t: 'circle', x: 6, z: 12.5, r: 2.0, tier: 1 }, { t: 'circle', x: 13.5, z: 11, r: 2.2, tier: 1 }, { t: 'circle', x: 21, z: 13, r: 2.0, tier: 1 }],
    props: [
      { k: 'windmill', x: 13.5, z: 15.5 },
      { k: 'holeflag', x: 5, z: 5 }, { k: 'holeflag', x: 12, z: 4, o: { c: 0x3b6ea5 } }, { k: 'holeflag', x: 20, z: 5.5, o: { c: 0xf2c14e } },
      { k: 'holeflag', x: 6, z: 12.5, o: { c: 0x3e7247 } }, { k: 'holeflag', x: 13.5, z: 11, o: { c: 0xb87fd9 } }, { k: 'holeflag', x: 21, z: 13, o: { c: 0xe8792c } },
      { k: 'bench', x: 2.2, z: 16.0, rot: 2.4 },
      { k: 'gnome', x: 24.2, z: 16.4, rot: -0.8, o: { s: 1.6 } },
    ],
    zones: [
      { x: 0, z: 0, w: 13, h: 9, name: 'Holes 1–3' }, { x: 13, z: 0, w: 13, h: 9, name: 'Holes 4–6' },
      { x: 0, z: 9, w: 13, h: 9, name: 'Holes 7–9' }, { x: 13, z: 9, w: 13, h: 9, name: 'Windmill Rough' },
    ],
    disc: [
      { x: 14.2, z: 16.8, tier: 'story', kind: 'ball', label: 'Forty-one lost golf balls (you stopped counting)', text: "THE MOTHERLODE. I sell those back at fifty cents each, kid. This is a business transaction now. Stan owes you lunch." },
      { x: 24.8, z: 17.0, tier: 'keep', kind: 'coin', label: 'A token: GOOD FOR ONE FREE GAME (1988)' },
    ],
    junk: 6,
    texts: {
      arrive: "VELVET, kid. The greens gotta be VELVET. The windmill hasn't turned since June — that's a metaphor, but also literally there's grass in the gears.",
      mid: [{ pct: 50, t: "She TURNS! THE WINDMILL TURNS! Stan is emotional! Stan is fine. STAN IS FINE." }],
      reply: "Nine velvet greens. The windmill turning. The gnome by hole 9 — his name's Stanley Jr., don't worry about it. Free games for life, kid.",
    },
  },
  {
    id: 'cemetery', block: 4, name: 'The Night Shift', client: 'Hazel Park Memorial Grounds', who: 'THE CARETAKER', odd: true,
    blurb: "The groundskeeper's hip is out and the memorial rows can't wait a month. He asks for after-dark — 'less foot traffic, cooler air, and they like the company, if you ask me.' Fireflies included. Read the stones as you trim. Take your time. They've got plenty.",
    pop: '—',
    lot: { w: 26, h: 18 }, seed: 502, fence: 'rail', gate: { x: 7.0, w: 1.6 }, light: 'night',
    tiers: [{ t: 'base', tier: 3 }],
    props: [
      { k: 'headstone', x: 5, z: 5 }, { k: 'headstone', x: 8.5, z: 5, rot: 0.05 }, { k: 'headstone', x: 12, z: 5, rot: -0.04 }, { k: 'headstone', x: 15.5, z: 5 }, { k: 'headstone', x: 19, z: 5, rot: 0.06 },
      { k: 'headstone', x: 5, z: 9.5, rot: -0.05 }, { k: 'headstone', x: 8.5, z: 9.5 }, { k: 'headstone', x: 12, z: 9.5, rot: 0.04 }, { k: 'headstone', x: 15.5, z: 9.5, rot: -0.06 }, { k: 'headstone', x: 19, z: 9.5 },
      { k: 'headstone', x: 5, z: 14 }, { k: 'headstone', x: 8.5, z: 14, rot: 0.05 }, { k: 'headstone', x: 12, z: 14 }, { k: 'headstone', x: 15.5, z: 14, rot: -0.04 },
      { k: 'pine', x: 23.4, z: 3.4, o: { s: 1.15 } }, { k: 'pine', x: 23.8, z: 15.2, o: { s: 1.0 } },
      { k: 'bench', x: 22.6, z: 9.4, rot: -1.57 },
    ],
    zones: [
      { x: 0, z: 0, w: 26, h: 7.2, name: 'The Old Rows' },
      { x: 0, z: 7.2, w: 26, h: 4.8, name: 'The Middle Rows' },
      { x: 0, z: 12, w: 26, h: 6, name: 'The New Rows' },
    ],
    disc: [
      { x: 9.8, z: 7.4, tier: 'story', kind: 'medal', label: 'A folded flag pin, polished', text: "(You set it on the nearest stone. In the morning the caretaker will know whose it is. They always know.)", self: true },
      { x: 21.0, z: 16.2, tier: 'keep', kind: 'coin', label: 'Two pennies, left heads-up' },
    ],
    junk: 0,
    texts: {
      arrive: "Lantern's on the bench, fireflies handle the rest. Mind the rows. And if you talk to 'em while you work, you won't be the first.",
      mid: [{ pct: 50, t: "(The fireflies keep pace with the mower, drifting a row ahead of you, like ushers.)" }],
      reply: "Neat as a folded flag. They rest easier in a kept field — and so do I. There's a thermos of the good coffee on the bench. It's still warm.",
    },
  },
  {
    id: 'drivein', block: 4, name: 'The Drive-In Lot', client: 'The Starlite (est. 1954)', who: 'PEGGY (BOX OFFICE)', odd: true,
    blurb: "The Starlite reopens Friday with a monster double-feature and the lot's gone to seed between the speaker posts. Peggy runs the projector while you mow — 'consider it a private screening, hon.' Dusk show. Big screen. Tall grass.",
    pop: '—',
    lot: { w: 32, h: 20 }, seed: 503, fence: 'chain', gate: { x: 9.0, w: 2.2 }, light: 'dusk',
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 14, w: 32, h: 6, tier: 4 }],
    props: [
      { k: 'screen', x: 16, z: 18.6, o: { w: 15, h: 8 } },
      { k: 'speaker', x: 5, z: 4 }, { k: 'speaker', x: 11, z: 4 }, { k: 'speaker', x: 17, z: 4 }, { k: 'speaker', x: 23, z: 4 }, { k: 'speaker', x: 28, z: 4 },
      { k: 'speaker', x: 5, z: 9 }, { k: 'speaker', x: 11, z: 9 }, { k: 'speaker', x: 17, z: 9 }, { k: 'speaker', x: 23, z: 9 }, { k: 'speaker', x: 28, z: 9 },
      { k: 'shed', x: 2.8, z: 17.0, rot: 0.7, o: { c: 0x86232a, w: 3.0, d: 2.4 } },
      { k: 'bench', x: 29.0, z: 14.6, rot: -2.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 16, h: 7, name: 'Front Row West' }, { x: 16, z: 0, w: 16, h: 7, name: 'Front Row East' },
      { x: 0, z: 7, w: 16, h: 7, name: 'The Middle Rows' }, { x: 16, z: 7, w: 16, h: 7, name: 'The Make-Out Rows' },
      { x: 0, z: 14, w: 32, h: 6, name: 'Under the Screen' },
    ],
    disc: [
      { x: 22.4, z: 8.2, tier: 'story', kind: 'ring', label: 'A promise ring + a note, 1979, never delivered', text: "Honey. HONEY. I know exactly who this belongs to. They're both at Shady Pines now — and both single again, if you can believe it. Peggy is going to DELIVER. Friday. Front row." },
      { x: 4.0, z: 16.6, tier: 'keep', kind: 'car', label: 'A chrome hood ornament, 1957 Bel Air' },
    ],
    junk: 7,
    texts: {
      arrive: "Projector's warm, hon. Tonight it's 'THE CREATURE FROM BENEATH THE LAWN' — felt appropriate. Mow with one eye on the screen like everybody else.",
      mid: [{ pct: 50, t: "(On the screen, enormous and silver: a creature rises from tall grass. You cut the real thing in its honor.)" }],
      reply: "Friday's ON, the lot's gorgeous, and re: the ring — Peggy has ARRANGEMENTS in motion. You didn't just mow a lot, hon. You restarted a love story. Free popcorn forever.",
    },
  },
  {
    id: 'terrarium', block: 4, name: '???', client: 'unknown', who: '???', odd: true,
    blurb: "You don't remember taking this job. The notebook's last page has an address written in handwriting that isn't Pop's and isn't yours. The yard is... your yard. The gate is your gate. But the sky is wrong, and the air hums like a refrigerator the size of weather, and something vast and patient is watching you mow.",
    pop: '—',
    lot: { w: 20, h: 15 }, seed: 504, fence: 'picket', gate: { x: 5.4, w: 1.4 }, light: 'weird', noSurround: true, noRadio: true,
    house: { x: 13.2, z: 5.2, w: 6.5, d: 4.4, c: 0xb8c8b0, shutter: 0x4a6a5a },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 10, z: 7.5, r: 3, tier: 4 }],
    props: [
      { k: 'tree', x: 3.6, z: 11.2, o: { s: 1.15, seed: 4, leaf: 0x7a9c8a } },
      { k: 'birdbath', x: 10.4, z: 9.6 },
      { k: 'mailbox', x: 4.4, z: 1.0, o: { c: 0x38536b } },
      { k: 'gnome', x: 16.6, z: 12.4, rot: 2.4, o: { s: 1.0 } },
    ],
    zones: [
      { x: 0, z: 0, w: 20, h: 7.5, name: 'The Familiar Half' },
      { x: 0, z: 7.5, w: 20, h: 7.5, name: 'The Other Half' },
    ],
    disc: [
      { x: 10.2, z: 7.2, tier: 'story', kind: 'photo', label: "A photograph of you, mowing, taken from very high up", text: "(It's a good photo. Whoever — whatever — took it waited for the light. On the back, in careful letters, like a child copying a language it loves but doesn't speak: 'GOOD. MORE?')", self: true },
      { x: 17.2, z: 13.2, tier: 'keep', kind: 'fossil', label: "A perfectly ordinary rock (it is warm) (it is slightly humming)" },
    ],
    junk: 3,
    texts: {
      arrive: "(The mower starts on the first pull. It always starts on the first pull here. That's the most unsettling part.)",
      mid: [{ pct: 50, t: "(Far above the wrong-colored sky, something enormous adjusts its grip on something, the way you'd steady a jar.)" }],
      reply: "(You finish. The stripes are perfect. The sky ripples once — approval? — and your postcard is already in the mailbox, stamped RETURN TO SENDER, with one addition in that careful hand: a heart. You take the long way home. The long way exists again.)",
    },
  },
  // THE WIDER JOB BOOK — ten places that are not somebody's front lawn (block 5)
  ...TOUR,
  ...GOOFY,
];

// ---------- gear unlock schedule ----------
export const GEAR_UNLOCKS = [
  { afterJobs: 0, gear: 'push', note: null },
  { afterJobs: 5, gear: 'self', note: "Pop's back-shed surprise: the self-propelled. 'For the big Favors,' says the tag. It PULLS." },
  { afterJobs: 10, gear: 'wide', note: "Rosa's cousin's wide-deck, on permanent loan for the Rescues. It's orange, it's hungry, it drinks a little." },
  { afterJobs: 15, gear: 'rider', note: 'The town shed keys: the riding mower. For the Landmarks. Try not to grin. You will fail.' },
];

// ---------- the Daily Lawn ----------
export function dailyDef(dateStr) {
  let seed = 0; for (const ch of dateStr) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rng = mulberry(seed);
  const W = 20 + Math.round(rng() * 10), H = 14 + Math.round(rng() * 8);
  const fence = ['picket', 'chain', 'rail'][(rng() * 3) | 0];
  const house = rng() < 0.5 ? { x: 4.2 + rng() * (W - 12), z: 4.8 + rng() * 1.4, w: 6, d: 4.2, c: [0xe7dcc3, 0xcfd8e8, 0xd4c2c2, 0xcfd8c0, 0xe7d8c0][(rng() * 5) | 0] } : null;
  const inHouse = (x, z) => house && x > house.x - house.w / 2 - 1 && x < house.x + house.w / 2 + 1 && z > house.z - house.d / 2 - 2.6 && z < house.z + house.d / 2 + 1;
  const spot = (zMin) => { for (let t = 0; t < 12; t++) { const x = 3 + rng() * (W - 6), z = zMin + rng() * (H - zMin - 2.5); if (!inHouse(x, z)) return [x, z]; } return [W - 3, H - 3]; };
  const props = [{ k: 'mailbox', x: 3 + rng() * 2, z: 1.0 }];
  const treeK = ['tree', 'pine'][(rng() * 2) | 0];
  const nT = 1 + (rng() * 3 | 0);
  for (let i = 0; i < nT; i++) { const [x, z] = spot(4); props.push({ k: treeK, x, z, o: { s: 0.9 + rng() * 0.5, seed: (rng() * 99) | 0 } }); }
  const extras = ['birdbath', 'bench', 'grill', 'sandbox', 'kiddiepool', 'gnome', 'shed', 'swingset', 'trampoline', 'wheelbarrow'];
  const nE = 2 + (rng() * 3 | 0);
  for (let i = 0; i < nE; i++) { const [x, z] = spot(3.5); props.push({ k: extras[(rng() * extras.length) | 0], x, z, rot: rng() * 6.28 }); }
  { const [x, z] = spot(3); props.push({ k: 'flowerbed', x, z, o: { r: 1 + rng() * 0.6, seed: (rng() * 99) | 0 } }); }
  const tiers = [{ t: 'base', tier: 2 + (rng() * 2 | 0) }];
  for (let i = 0; i < 2 + (rng() * 3 | 0); i++) tiers.push({ t: 'circle', x: rng() * W, z: rng() * H, r: 2.4 + rng() * 2.4, tier: 3 + (rng() < 0.4 ? 1 : 0) });
  const wclumps = [];
  for (let i = 0; i < 2 + (rng() * 3 | 0); i++) wclumps.push({ x: 2 + rng() * (W - 4), z: 2 + rng() * (H - 4), r: 0.5 + rng() * 0.4 });
  const KEEPS = [['coin', 'An odd coin'], ['ring', 'A glinting ring'], ['arrowhead', 'An arrowhead'], ['fossil', 'A small fossil'], ['dogtag', 'An old tag']];
  const kp = KEEPS[(rng() * KEEPS.length) | 0];
  return {
    id: 'daily', block: -1, name: 'The Daily Lawn', client: 'Somewhere in Hazel Park', who: 'THE NOTEBOOK', daily: true,
    blurb: `Every morning the notebook grows one page nobody wrote. Today's is a ${W}×${H} lot, seed ${seed % 10000}. Same lawn for everyone, everywhere, today only.`,
    pop: 'A lawn a day keeps the— he never finished writing this one.',
    lot: { w: W, h: H }, seed, fence, gate: { x: 4 + rng() * 3, w: 1.4 },
    house, tiers, wclumps, props,
    zones: quadZones(W, H, ['Northwest Patch', 'Northeast Patch', 'Southwest Patch', 'Southeast Patch']),
    disc: [{ x: 2.5 + rng() * (W - 5), z: 2.5 + rng() * (H - 5), tier: 'keep', kind: kp[0], label: kp[1] }],
    junk: 5,
    texts: { arrive: 'A new page. No name on it. The grass is real enough.', mid: [], reply: 'The page inks itself DONE. Tomorrow there will be another. There is always another. That’s the good part.' },
  };
}

export function jobDiscoveries(def) {
  const avoid = [...(def.props || []).map(p => ({ x: p.x, z: p.z, r: 2 })), ...(def.disc || []).map(d => ({ x: d.x, z: d.z, r: 1.5 }))];
  if (def.house) avoid.push({ x: def.house.x, z: def.house.z - 0.9, r: Math.max(def.house.w, def.house.d) / 2 + 2.4 });
  const junk = junkScatter(def.seed, def.junk || 0, def.lot.w, def.lot.h, avoid);
  return [...(def.disc || []), ...junk];
}
