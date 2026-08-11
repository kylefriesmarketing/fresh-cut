// FRESH CUT — grass.js
// The heart: CPU-authoritative cut mask + chunked instanced blades + ground overlay.
// Mask RGBA per texel: R = cut state (0 uncut / 128 high-cut / 255 cut)
//                      G = cut direction (angle 0..255 → 0..2π), written at cut time (stripes)
//                      B = meta: low 4 bits tier (1-4), bit4 (16) weed clump (trimmer-only),
//                          bit5 (32) trim ring (mower blocked), 255 = no grass here
// All satisfaction flows from this array. Zone counting is incremental — never a full rescan.
import * as THREE from 'three';

export const TPM = 8;                 // texels per meter (12.5 cm)
const CHUNK = 4;                      // meters per blade chunk
export const CUT = 255, HIGH = 128, UNCUT = 0;
export const M_WCLUMP = 16, M_TRIM = 32, M_NOGRASS = 255;
const TIER_H = [0, 0.11, 0.24, 0.40, 0.66];      // blade height by tier
const DENSITY = { high: 80, med: 44, low: 20 };  // blades per m²
const FLOWER_DENS = { high: 0.85, med: 0.55, low: 0 };  // per m² of tall grass

// Cloud shadow, shared by every big surface so they darken as ONE patch — the blades, the
// ground overlay and the painted ground all call this with the same p (world XZ) and t.
// Analytic rather than a texture: two crossed warped sines make soft blobs ~14m across
// drifting at about 1.3 m/s, which crosses a lot in roughly fifteen seconds.
export const CLOUD_GLSL = `
  uniform float uCloudAmt;
  float cloudShade(vec2 p, float t){
    vec2 q = p * 0.26 - vec2(t * 0.21, t * 0.06);
    // SUM the two warped sines, don't multiply them: a product clusters hard around 0.5,
    // which measured as only 3-23% of the lawn ever in shadow. Summing gives an even
    // field — 25-32% shaded at any moment, with the overall brightness steady (mean
    // swing 0.017) so patches visibly cross instead of the whole yard pulsing.
    float n = (sin(q.x * 1.3 + sin(q.y * 0.9) * 1.9) + sin(q.y * 1.1 + sin(q.x * 0.7) * 1.6)) * 0.25 + 0.5;
    return mix(1.0, mix(0.72, 1.0, smoothstep(0.10, 0.46, n)), uCloudAmt);
  }`;

export class GrassField {
  constructor(scene, W, H, quality = 'high') {
    this.scene = scene; this.W = W; this.H = H;
    this.tw = Math.ceil(W * TPM); this.th = Math.ceil(H * TPM);
    const n = this.tw * this.th;
    this.mask = new Uint8Array(n * 4);
    this.zone = new Uint8Array(n).fill(255);
    for (let i = 0; i < n; i++) { this.mask[i * 4 + 2] = 1; this.mask[i * 4 + 3] = 255; } // default tier 1
    this.zoneTotal = new Uint32Array(64); this.zoneCut = new Uint32Array(64); this.zoneHigh = new Uint32Array(64);
    this.total = 0; this.cut = 0; this.high = 0;
    this.dirty = false; this.quality = quality;
    // shared uniform objects — one write drives the blades, the overlay, the flowers and
    // the painted ground, so a cloud shadow can never drift out of step between them
    this.uTime = { value: 0 };
    this.uWarm = { value: 0 };
    this.uCloudAmt = { value: quality === 'low' ? 0 : 1 };
    this.uLotV = { value: new THREE.Vector2(W, H) };
    this.chunks = []; this.group = new THREE.Group(); scene.add(this.group);
    this._noGrassCircles = []; this._clipCB = null;
    this.tex = new THREE.DataTexture(this.mask, this.tw, this.th, THREE.RGBAFormat);
    this.tex.magFilter = THREE.LinearFilter; this.tex.minFilter = THREE.LinearFilter;
    this.tex.needsUpdate = true;
    // wheel tracks: a persistent low-res canvas the overlay darkens with
    this.trackC = document.createElement('canvas');
    this.trackC.width = Math.ceil(W * 4); this.trackC.height = Math.ceil(H * 4);
    this.trackX = this.trackC.getContext('2d');
    this.trackX.fillStyle = '#000'; this.trackX.fillRect(0, 0, this.trackC.width, this.trackC.height);
    this.trackTex = new THREE.CanvasTexture(this.trackC);
    this.trackDirty = false;
  }
  stampTrack(x, z, r = 0.07) {
    this.trackX.fillStyle = 'rgba(255,255,255,0.14)';
    this.trackX.beginPath(); this.trackX.arc(x * 4, z * 4, Math.max(1.1, r * 4), 0, 7); this.trackX.fill();
    this.trackDirty = true;
  }
  idx(tx, tz) { return tz * this.tw + tx; }
  inb(tx, tz) { return tx >= 0 && tz >= 0 && tx < this.tw && tz < this.th; }

  // ---------- authoring (call before finalize) ----------
  tierRect(x, z, w, h, tier) { this._each(x, z, w, h, i => { const m = this.mask[i * 4 + 2]; if (m !== M_NOGRASS) this.mask[i * 4 + 2] = (m & ~15) | tier; }); }
  tierCircle(cx, cz, r, tier) { this._eachC(cx, cz, r, i => { const m = this.mask[i * 4 + 2]; if (m !== M_NOGRASS) this.mask[i * 4 + 2] = (m & ~15) | tier; }); }
  wclump(cx, cz, r) { this._eachC(cx, cz, r, i => { const m = this.mask[i * 4 + 2]; if (m !== M_NOGRASS) this.mask[i * 4 + 2] = m | M_WCLUMP; }); }
  noGrassRect(x, z, w, h) { this._each(x, z, w, h, i => { this.mask[i * 4 + 2] = M_NOGRASS; }); }
  noGrassCircle(cx, cz, r) { this._noGrassCircles.push({ cx, cz, r }); this._eachC(cx, cz, r, i => { this.mask[i * 4 + 2] = M_NOGRASS; }); }
  trimRing(cx, cz, rIn, rOut) { // mower can't reach — trimmer's territory (fence lines, prop skirts)
    this._eachC(cx, cz, rOut, (i, tx, tz) => {
      const dx = (tx + .5) / TPM - cx, dz = (tz + .5) / TPM - cz, d = Math.hypot(dx, dz);
      if (d >= rIn) { const m = this.mask[i * 4 + 2]; if (m !== M_NOGRASS) this.mask[i * 4 + 2] = m | M_TRIM; }
    });
  }
  trimBorder(w) { // perimeter band along the fence
    const t = Math.round(w * TPM);
    for (let tz = 0; tz < this.th; tz++) for (let tx = 0; tx < this.tw; tx++) {
      if (tx < t || tz < t || tx >= this.tw - t || tz >= this.th - t) {
        const i = this.idx(tx, tz), m = this.mask[i * 4 + 2]; if (m !== M_NOGRASS) this.mask[i * 4 + 2] = m | M_TRIM;
      }
    }
  }
  zoneRect(x, z, w, h, zid) { this._each(x, z, w, h, i => { if (this.mask[i * 4 + 2] !== M_NOGRASS) this.zone[i] = zid; }); }
  _each(x, z, w, h, fn) {
    const x0 = Math.max(0, Math.floor(x * TPM)), z0 = Math.max(0, Math.floor(z * TPM));
    const x1 = Math.min(this.tw, Math.ceil((x + w) * TPM)), z1 = Math.min(this.th, Math.ceil((z + h) * TPM));
    for (let tz = z0; tz < z1; tz++) for (let tx = x0; tx < x1; tx++) fn(this.idx(tx, tz), tx, tz);
  }
  _eachC(cx, cz, r, fn) {
    const x0 = Math.max(0, Math.floor((cx - r) * TPM)), z0 = Math.max(0, Math.floor((cz - r) * TPM));
    const x1 = Math.min(this.tw, Math.ceil((cx + r) * TPM)), z1 = Math.min(this.th, Math.ceil((cz + r) * TPM));
    const r2 = r * r;
    for (let tz = z0; tz < z1; tz++) for (let tx = x0; tx < x1; tx++) {
      const dx = (tx + .5) / TPM - cx, dz = (tz + .5) / TPM - cz;
      if (dx * dx + dz * dz <= r2) fn(this.idx(tx, tz), tx, tz);
    }
  }

  // ---------- finalize: totals + blade meshes ----------
  finalize() {
    const n = this.tw * this.th;
    for (let i = 0; i < n; i++) {
      if (this.mask[i * 4 + 2] === M_NOGRASS) continue;
      this.total++; const z = this.zone[i]; if (z < 64) this.zoneTotal[z]++;
    }
    this._buildBlades();
    this.tex.needsUpdate = true;
  }
  _buildBlades() {
    const dens = DENSITY[this.quality] || DENSITY.med;
    const mat = makeBladeMaterial(this.tex, this);
    this.bladeMat = mat;
    // one tapered, slightly bent blade: 4 verts / 2 tris, shaped in the shader
    const base = new THREE.PlaneGeometry(1, 1, 1, 2); base.translate(0, 0.5, 0);
    const cx = Math.ceil(this.W / CHUNK), cz = Math.ceil(this.H / CHUNK);
    const rng = mulberry(1234567);
    for (let j = 0; j < cz; j++) for (let i = 0; i < cx; i++) {
      const x0 = i * CHUNK, z0 = j * CHUNK;
      const w = Math.min(CHUNK, this.W - x0), h = Math.min(CHUNK, this.H - z0);
      const count = Math.floor(w * h * dens);
      const offs = new Float32Array(count * 2), rnds = new Float32Array(count * 4);
      let put = 0;
      for (let k = 0; k < count; k++) {
        const x = x0 + rng() * w, z = z0 + rng() * h;
        const tx = Math.floor(x * TPM), tz = Math.floor(z * TPM);
        if (!this.inb(tx, tz) || this.mask[this.idx(tx, tz) * 4 + 2] === M_NOGRASS) continue;
        offs[put * 2] = x; offs[put * 2 + 1] = z;
        rnds[put * 4] = rng(); rnds[put * 4 + 1] = rng() * 6.283; rnds[put * 4 + 2] = rng() * 2 - 1; rnds[put * 4 + 3] = rng();
        put++;
      }
      if (!put) continue;
      const g = new THREE.InstancedBufferGeometry();
      g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.uv = base.attributes.uv;
      g.setAttribute('aOff', new THREE.InstancedBufferAttribute(offs.subarray(0, put * 2), 2));
      g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnds.subarray(0, put * 4), 4));
      g.instanceCount = put;
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(x0 + w / 2, 0.35, z0 + h / 2), Math.hypot(w, h) / 2 + 1.2);
      const m = new THREE.Mesh(g, mat); m.frustumCulled = true;
      this.group.add(m); this.chunks.push(m);
    }
    this._buildFlowers();
    // ground overlay: mask-driven wrongness + stripes, readable at any distance
    const og = new THREE.PlaneGeometry(this.W, this.H);
    const om = makeOverlayMaterial(this.tex, this.trackTex, this);
    this.overlay = new THREE.Mesh(og, om);
    this.overlay.rotation.x = -Math.PI / 2;
    this.overlay.position.set(this.W / 2, 0.012, this.H / 2);
    this.scene.add(this.overlay);
  }

  // Wildflowers standing in the uncut grass. They are mask-driven exactly like the blades:
  // the vertex shader collapses an instance to nothing the moment its texel reads CUT, so
  // mowing them away costs the CPU nothing and can never fall out of sync with the cut.
  _buildFlowers() {
    const dens = FLOWER_DENS[this.quality] ?? FLOWER_DENS.med;
    if (!dens) return;
    const rng = mulberry(90210);
    const tries = Math.floor(this.W * this.H * dens * 2.2);
    const offs = new Float32Array(tries * 2), rnds = new Float32Array(tries * 4);
    let put = 0;
    for (let k = 0; k < tries; k++) {
      const x = rng() * this.W, z = rng() * this.H;
      const tx = Math.floor(x * TPM), tz = Math.floor(z * TPM);
      if (!this.inb(tx, tz)) continue;
      const meta = this.mask[this.idx(tx, tz) * 4 + 2];
      if (meta === M_NOGRASS || (meta & 15) < 2) continue;   // only stands in real growth
      offs[put * 2] = x; offs[put * 2 + 1] = z;
      rnds[put * 4] = 0.22 + rng() * 0.2;      // height
      rnds[put * 4 + 1] = rng() * 6.283;       // yaw
      rnds[put * 4 + 2] = Math.floor(rng() * 3); // which flower
      rnds[put * 4 + 3] = rng() * 6.283;       // sway phase
      put++;
    }
    if (!put) return;
    const base = crossQuads();
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.uv = base.attributes.uv;
    g.setAttribute('aOff', new THREE.InstancedBufferAttribute(offs.subarray(0, put * 2), 2));
    g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnds.subarray(0, put * 4), 4));
    g.instanceCount = put;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(this.W / 2, 0.3, this.H / 2), Math.hypot(this.W, this.H) / 2 + 1);
    this.flowerCount = put;
    this.flowers = new THREE.Mesh(g, makeFlowerMaterial(this.tex, flowerAtlas(), this));
    this.flowers.frustumCulled = false;
    this.group.add(this.flowers);
  }

  // ---------- the verb: stamp a cut ----------
  // tool: 'mow' | 'trim'   high: deck lever   dir: radians of travel
  // returns { fresh: newly-finished texels, blocked: hit trimmer-territory, spots: [x,z] sample for particles }
  stamp(x, z, r, tool, high, dir) {
    const d8 = Math.round(((dir % 6.283) + 6.283) % 6.283 / 6.283 * 255);
    let fresh = 0, blocked = 0; const spots = [];
    const x0 = Math.max(0, Math.floor((x - r) * TPM)), z0 = Math.max(0, Math.floor((z - r) * TPM));
    const x1 = Math.min(this.tw, Math.ceil((x + r) * TPM)), z1 = Math.min(this.th, Math.ceil((z + r) * TPM));
    const r2 = r * r * TPM * TPM, xc = x * TPM, zc = z * TPM;
    for (let tz = z0; tz < z1; tz++) for (let tx = x0; tx < x1; tx++) {
      const ddx = tx + .5 - xc, ddz = tz + .5 - zc;
      if (ddx * ddx + ddz * ddz > r2) continue;
      const i = this.idx(tx, tz), b = i * 4, meta = this.mask[b + 2];
      if (meta === M_NOGRASS) continue;
      const st = this.mask[b];
      const noMow = (tool === 'mow') && (meta & (M_WCLUMP | M_TRIM));
      if (st === CUT) {
        // The LAST mower pass lays the nap. Without this, an overlapping pass leaves the
        // overlap wearing the PREVIOUS pass's direction, so the stripe edge ends up
        // somewhere you never drove — which is exactly "the strips don't line up with the
        // mower". Direction only; cut counts are untouched, so nothing gameplay-side moves.
        if (tool === 'mow' && !noMow && this.mask[b + 1] !== d8) { this.mask[b + 1] = d8; this.dirty = true; }
        continue;
      }
      if (tool === 'mow') {
        if (noMow) { blocked++; continue; }
        const tier = meta & 15;
        if (tier >= 4 && st === UNCUT && !high) { blocked++; continue; }  // jungle needs the lever first
        if (high && st === UNCUT && tier >= 3) {                          // high pass knocks it down
          this.mask[b] = HIGH; this.mask[b + 1] = d8; this.high++; const zi = this.zone[i]; if (zi < 64) this.zoneHigh[zi]++;
          if (spots.length < 6 && Math.random() < .15) spots.push([(tx + .5) / TPM, (tz + .5) / TPM]);
          this.dirty = true; continue;
        }
      }
      // full cut (mow finish pass, or trimmer anywhere)
      if (st === HIGH) { this.high--; const zi = this.zone[i]; if (zi < 64) this.zoneHigh[zi]--; }
      this.mask[b] = CUT; this.mask[b + 1] = d8;
      this.cut++; fresh++;
      const zi = this.zone[i]; if (zi < 64) this.zoneCut[zi]++;
      if (spots.length < 6 && Math.random() < .22) spots.push([(tx + .5) / TPM, (tz + .5) / TPM]);
      this.dirty = true;
    }
    return { fresh, blocked, spots };
  }

  // mercy: a zone at ≥ threshold rounds itself to done, with a soft sweep
  fillZone(zid) {
    const n = this.tw * this.th; let filled = 0;
    for (let i = 0; i < n; i++) {
      if (this.zone[i] !== zid) continue;
      const b = i * 4; if (this.mask[b + 2] === M_NOGRASS || this.mask[b] === CUT) continue;
      if (this.mask[b] === HIGH) { this.high--; this.zoneHigh[zid]--; }
      this.mask[b] = CUT; this.cut++; this.zoneCut[zid]++; filled++;
    }
    if (filled) this.dirty = true;
    return filled;
  }
  zonePct(zid) { const t = this.zoneTotal[zid]; return t ? (this.zoneCut[zid] + this.zoneHigh[zid] * .5) / t : 1; }
  pct() { return this.total ? (this.cut + this.high * .5) / this.total : 1; }
  stateAt(x, z) { const tx = Math.floor(x * TPM), tz = Math.floor(z * TPM); if (!this.inb(tx, tz)) return { st: CUT, meta: M_NOGRASS, tier: 0 }; const b = this.idx(tx, tz) * 4; const meta = this.mask[b + 2]; return { st: this.mask[b], meta, tier: meta === M_NOGRASS ? 0 : meta & 15 }; }
  // density of uncut grass just ahead — drives engine load + push slowdown
  loadAhead(x, z, dir, r = 0.5) {
    let tall = 0, tot = 0;
    for (let s = 0; s < 10; s++) {
      const a = dir + (s % 5 - 2) * 0.22, d = 0.35 + 0.5 * ((s / 5) | 0);
      const p = this.stateAt(x + Math.sin(a) * d, z + Math.cos(a) * d);
      if (p.meta === M_NOGRASS) continue; tot++;
      if (p.st !== CUT) tall += p.st === HIGH ? 0.45 : (0.35 + 0.25 * p.tier);
    }
    return tot ? Math.min(1, tall / tot) : 0;
  }
  // uncut clusters for the Last Blade glow (1 m grid)
  remaining() {
    const cell = TPM, out = new Map();
    for (let tz = 0; tz < this.th; tz++) for (let tx = 0; tx < this.tw; tx++) {
      const b = this.idx(tx, tz) * 4;
      if (this.mask[b + 2] === M_NOGRASS || this.mask[b] === CUT) continue;
      const k = ((tx / cell) | 0) + '_' + ((tz / cell) | 0);
      const e = out.get(k) || { x: 0, z: 0, n: 0 };
      e.x += (tx + .5) / TPM; e.z += (tz + .5) / TPM; e.n++; out.set(k, e);
    }
    return [...out.values()].map(e => ({ x: e.x / e.n, z: e.z / e.n, n: e.n }));
  }
  // save / restore: RLE of the cut channel (mid-job resume)
  snapshotCuts() {
    const n = this.tw * this.th, runs = []; let cur = this.mask[0], len = 0;
    for (let i = 0; i < n; i++) { const v = this.mask[i * 4]; if (v === cur && len < 65535) len++; else { runs.push(cur, len); cur = v; len = 1; } }
    runs.push(cur, len);
    return { w: this.tw, h: this.th, runs, dirs: null };
  }
  restoreCuts(snap) {
    if (!snap || snap.w !== this.tw || snap.h !== this.th) return false;
    let i = 0;
    for (let r = 0; r < snap.runs.length; r += 2) {
      const v = snap.runs[r], len = snap.runs[r + 1];
      for (let k = 0; k < len; k++, i++) {
        const b = i * 4; if (this.mask[b + 2] === M_NOGRASS) continue;
        const prev = this.mask[b]; if (prev === v) continue;
        const zi = this.zone[i];
        if (prev === HIGH) { this.high--; if (zi < 64) this.zoneHigh[zi]--; }
        if (prev === CUT) { this.cut--; if (zi < 64) this.zoneCut[zi]--; }
        this.mask[b] = v; if (v !== UNCUT) this.mask[b + 1] = 64;
        if (v === HIGH) { this.high++; if (zi < 64) this.zoneHigh[zi]++; }
        if (v === CUT) { this.cut++; if (zi < 64) this.zoneCut[zi]++; }
      }
    }
    this.dirty = true; return true;
  }
  update(t) {
    if (this.dirty) { this.tex.needsUpdate = true; this.dirty = false; }
    if (this.trackDirty) { this.trackTex.needsUpdate = true; this.trackDirty = false; }
    this.uTime.value = t;   // shared: blades, overlay, flowers and the ground all read it
  }
  setMow(x, z, s) { if (this.bladeMat) this.bladeMat.uniforms.uMow.value.set(x, z, s); }
  setSun(warm) { this.uWarm.value = warm; }
  dispose() { this.group.removeFromParent(); if (this.overlay) this.overlay.removeFromParent(); }
}

// ---------- materials ----------
function makeBladeMaterial(tex, F) {
  return new THREE.ShaderMaterial({
    uniforms: { uMask: { value: tex }, uLot: F.uLotV, uTime: F.uTime, uWarm: F.uWarm, uCloudAmt: F.uCloudAmt, uMow: { value: new THREE.Vector3(-99, -99, 0) } },
    side: THREE.DoubleSide,
    vertexShader: `
      attribute vec2 aOff; attribute vec4 aRnd;
      uniform sampler2D uMask; uniform vec2 uLot; uniform float uTime; uniform vec3 uMow;
      varying float vShade; varying float vTone; varying float vTip; varying float vTier; varying float vCut;
      varying float vCloud;
      ${CLOUD_GLSL}
      void main(){
        vCloud = cloudShade(aOff, uTime);
        vec4 m = texture2D(uMask, aOff / uLot);
        float meta = m.b * 255.0;
        float noG = step(249.0, meta);
        float wcl = step(0.5, mod(floor(meta / 16.0), 2.0));
        float tier = mod(meta, 16.0);
        float st = m.r;                                  // 0 / ~0.5 / 1
        float hgt = (tier < 1.5 ? 0.11 : tier < 2.5 ? 0.24 : tier < 3.5 ? 0.40 : 0.66);
        hgt = max(hgt, wcl * 0.52);
        hgt *= (0.72 + 0.55 * aRnd.x);
        float cut = step(0.9, st), high = step(0.25, st) * (1.0 - cut);
        hgt = mix(hgt, 0.21 * (0.8 + 0.4 * aRnd.x), high);
        hgt = mix(hgt, 0.038, cut);   // a tidy nap, not visible individual blades
        hgt *= (1.0 - noG);
        float y = uv.y;                                   // 0 root → 1 tip
        vTip = y; vTier = tier; vCut = cut;
        // stripe tone from cut direction
        float ang = m.g * 6.28318;
        vTone = mix(1.0, 1.0 + 0.16 * cos(ang - 0.785), cut);
        // wrongness shade for tall grass
        vShade = mix(1.0, 0.82, (1.0 - cut) * (1.0 - high) * clamp((tier - 1.0) / 3.0, 0.0, 1.0)) - wcl * (1.0 - cut) * 0.14;
        // build the blade
        float w = 0.027 * (1.0 + 0.5 * aRnd.w) * (1.0 - y * 0.82);
        // lean must scale with the blade, or a 5cm cut blade gets its tip thrown 35cm
        // sideways and reads as a loose clipping lying on the lawn. Tall grass is unchanged
        // (0.66 * 0.55 ≈ the old 0.35); cut stubble now stands up.
        float lean = aRnd.z * 0.55 * hgt;
        float gust = max(sin(uTime * 0.55 - (aOff.x + aOff.y) * 0.14), 0.0) + 0.5 * max(sin(uTime * 0.23 - aOff.x * 0.07), 0.0);
        float sway = sin(uTime * 1.35 + aRnd.y + aOff.x * 0.4) * (0.05 + 0.10 * hgt) * (1.0 + gust * 1.3) * (1.0 - cut * 0.85);
        // anticipation: tall blades shy away from the running deck just before the cut lands
        vec2 dm = aOff - uMow.xy;
        float dd = max(length(dm), 0.001);
        float shy = uMow.z * smoothstep(1.25, 0.3, dd) * (1.0 - cut) * hgt;
        vec2 shyDir = dm / dd;
        float c = cos(aRnd.y * 7.0), s = sin(aRnd.y * 7.0);
        vec3 p;
        p.x = aOff.x + (position.x * w) * c + y * y * (lean + sway) * s + y * y * sway * 0.6 + y * y * shy * shyDir.x * 0.9;
        p.z = aOff.y - (position.x * w) * s + y * y * (lean + sway) * c + y * y * shy * shyDir.y * 0.9;
        p.y = y * hgt;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform float uWarm;
      varying float vShade; varying float vTone; varying float vTip; varying float vTier; varying float vCut;
      varying float vCloud;
      void main(){
        vec3 root = vec3(0.16, 0.30, 0.10);
        vec3 tip  = mix(vec3(0.38, 0.60, 0.22), vec3(0.30, 0.48, 0.26), clamp((vTier - 1.0) / 3.0, 0.0, 1.0) * (1.0 - vCut));
        // cut stubble sits almost exactly on the overlay's fresh-cut green, so the nap reads
        // as turf texture instead of pale specks scattered over the lawn
        tip = mix(tip, vec3(0.45, 0.665, 0.245), vCut);
        // cut stubble skips the dark root entirely — at 4cm a root→tip gradient just
        // reads as speckle, which is what made a finished lawn look dirty rather than clean
        float tmix = mix(vTip, 0.58 + 0.42 * vTip, vCut);
        vec3 col = mix(root, tip, tmix) * vShade * vTone;
        col = mix(col, col * vec3(1.12, 1.0, 0.82), uWarm * 0.55);  // golden hour
        col *= vCloud;                                               // a cloud went over
        gl_FragColor = vec4(col, 1.0);
      }`
  });
}
// two quads crossed at right angles, so a flower reads from every direction without
// billboarding (billboards visibly spin when you turn, which fights a still summer lawn)
function crossQuads() {
  const pos = [], uv = [], idx = [];
  [[1, 0], [0, 1]].forEach(([dx, dz], qi) => {
    const b = qi * 4;
    pos.push(-0.5 * dx, 0, -0.5 * dz, 0.5 * dx, 0, 0.5 * dz, 0.5 * dx, 1, 0.5 * dz, -0.5 * dx, 1, -0.5 * dz);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
let FLOWER_TEX = null;
function flowerAtlas() {  // dandelion | clover | daisy — head at the top, stem to the base
  if (FLOWER_TEX) return FLOWER_TEX;
  const C = 96, c = document.createElement('canvas'); c.width = C * 3; c.height = C;
  const x = c.getContext('2d');
  const stem = (ox) => { x.strokeStyle = '#4e7a34'; x.lineWidth = 5; x.beginPath(); x.moveTo(ox + C / 2, C); x.lineTo(ox + C / 2, C * 0.42); x.stroke(); };
  // dandelion
  stem(0);
  x.fillStyle = '#f0c22e';
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; x.beginPath(); x.ellipse(C / 2 + Math.cos(a) * 13, 32 + Math.sin(a) * 13, 9, 5, a, 0, 6.283); x.fill(); }
  x.fillStyle = '#f6d75a'; x.beginPath(); x.arc(C / 2, 32, 13, 0, 6.283); x.fill();
  // clover
  stem(C);
  x.fillStyle = '#e6dce8';
  for (let i = 0; i < 11; i++) { const a = i / 11 * 6.283; x.beginPath(); x.arc(C + C / 2 + Math.cos(a) * 10, 34 + Math.sin(a) * 9, 7, 0, 6.283); x.fill(); }
  x.fillStyle = '#f4eef5'; x.beginPath(); x.arc(C + C / 2, 32, 10, 0, 6.283); x.fill();
  // daisy
  stem(C * 2);
  x.fillStyle = '#fbf7ee';
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; x.beginPath(); x.ellipse(C * 2 + C / 2 + Math.cos(a) * 12, 32 + Math.sin(a) * 12, 10, 5, a, 0, 6.283); x.fill(); }
  x.fillStyle = '#f2c33c'; x.beginPath(); x.arc(C * 2 + C / 2, 32, 8, 0, 6.283); x.fill();
  FLOWER_TEX = new THREE.CanvasTexture(c);
  FLOWER_TEX.colorSpace = THREE.SRGBColorSpace;
  return FLOWER_TEX;
}
function makeFlowerMaterial(mask, atlas, F) {
  return new THREE.ShaderMaterial({
    uniforms: { uMask: { value: mask }, uAtlas: { value: atlas }, uLot: F.uLotV, uTime: F.uTime, uWarm: F.uWarm, uCloudAmt: F.uCloudAmt },
    side: THREE.DoubleSide, transparent: false,
    vertexShader: `
      attribute vec2 aOff; attribute vec4 aRnd;
      uniform sampler2D uMask; uniform vec2 uLot; uniform float uTime;
      varying vec2 vUv; varying float vCloud;
      ${CLOUD_GLSL}
      void main(){
        vec4 m = texture2D(uMask, aOff / uLot);
        float meta = m.b * 255.0;
        float noG = step(249.0, meta);
        float tier = mod(meta, 16.0);
        float cut = step(0.9, m.r);
        float high = step(0.25, m.r) * (1.0 - cut);
        // gone the instant the deck reaches it; knocked down by a high-cut pass
        float alive = (1.0 - cut) * (1.0 - noG) * step(1.5, tier) * (1.0 - high * 0.7);
        float s = aRnd.x * alive;
        float cy = cos(aRnd.y), sy = sin(aRnd.y);
        vec3 p = position * s;
        float yy = position.y * position.y;
        float gust = max(sin(uTime * 0.55 - (aOff.x + aOff.y) * 0.14), 0.0);
        float sway = sin(uTime * 1.2 + aRnd.w + aOff.x * 0.4) * 0.06 * (1.0 + gust * 1.4);
        vec3 w;
        w.x = aOff.x + (p.x * cy - p.z * sy) + yy * sway;
        w.z = aOff.y + (p.x * sy + p.z * cy) + yy * sway * 0.5;
        w.y = p.y;
        vUv = vec2((uv.x + aRnd.z) / 3.0, uv.y);
        vCloud = cloudShade(aOff, uTime);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(w, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D uAtlas; uniform float uWarm;
      varying vec2 vUv; varying float vCloud;
      void main(){
        vec4 t = texture2D(uAtlas, vUv);
        if (t.a < 0.5) discard;
        vec3 col = t.rgb * vCloud;
        col = mix(col, col * vec3(1.12, 1.0, 0.82), uWarm * 0.55);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}
function makeOverlayMaterial(tex, trackTex, F) {
  return new THREE.ShaderMaterial({
    uniforms: { uMask: { value: tex }, uWarm: F.uWarm, uTracks: { value: trackTex }, uTime: F.uTime, uCloudAmt: F.uCloudAmt, uLot: F.uLotV },
    transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uMask; uniform float uWarm; uniform sampler2D uTracks; varying vec2 vUv;
      uniform float uTime; uniform vec2 uLot;
      ${CLOUD_GLSL}
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        // ⚠️ The plane's uv.y is 1 at worldZ=0 and 0 at worldZ=H (PlaneGeometry rotated -90°
        // about X), but uMask is a DataTexture with flipY:false, so ITS row 0 is worldZ=0 —
        // which is how the blades sample it (uv = worldPos / lot). Sampling the mask with the
        // raw uv therefore mirrors the cut mask along Z: the bright fresh-cut paint landed at
        // H-z instead of z, so it slid the OPPOSITE way to the mower as you mowed.
        // uTracks stays on vUv: it is a CanvasTexture (flipY:true), so it is already correct.
        vec2 mUv = vec2(vUv.x, 1.0 - vUv.y);
        vec4 m = texture2D(uMask, mUv);
        float meta = m.b * 255.0;
        if (meta > 249.0) { discard; }
        float tier = mod(meta, 16.0);
        float st = m.r;
        float cut = step(0.9, st), high = step(0.25, st) * (1.0 - cut);
        float n = hash(floor(vUv * 420.0)) * 0.06;
        vec3 col; float a;
        if (cut > 0.5) {
          // fresh cut is ALWAYS the clean bright green; the mow direction only tilts it
          // +-10% for stripes. (It used to lerp the whole way down to a dark green, so
          // mowing in one direction painted the new cut nearly as dark as uncut grass —
          // you couldn't see the cut happen under the deck, only the stripes behind you.)
          float ang = m.g * 6.28318;
          float tone = 0.5 + 0.5 * cos(ang - 0.785);
          col = vec3(0.42, 0.66, 0.24) * (0.90 + 0.20 * tone);
          a = 0.60;
        } else if (high > 0.5) {
          col = vec3(0.20, 0.34, 0.13) * (1.0 - n); a = 0.30;
        } else {
          col = mix(vec3(0.16, 0.27, 0.12), vec3(0.11, 0.19, 0.10), clamp((tier - 1.0) / 3.0, 0.0, 1.0)) * (1.0 - n);
          a = 0.42 + 0.12 * clamp((tier - 1.0) / 3.0, 0.0, 1.0);
        }
        col = mix(col, col * vec3(1.14, 1.02, 0.80), uWarm * 0.5);
        // the overlay's uv.y is flipped against world Z (see the mask note above), so the
        // cloud must be sampled at the same world point the blades used or the shadow
        // would slide the other way across the lawn
        col *= cloudShade(vec2(vUv.x * uLot.x, (1.0 - vUv.y) * uLot.y), uTime);
        float tr = texture2D(uTracks, vUv).r;
        col *= (1.0 - tr * 0.30);
        a = min(1.0, a + tr * 0.18);
        gl_FragColor = vec4(col, a);
      }`
  });
}

// ---------- clippings ----------
export class ClipPool {
  constructor(scene, max = 900) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3); this.life = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fce62, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, map: dotTex(), alphaTest: 0.3 }));
    this.pts.frustumCulled = false; scene.add(this.pts);
    this.head = 0;
    // clippings tagged for the bag get vacuumed to the mouth instead of falling to the lawn
    this.tag = new Float32Array(max);
    this.bagOn = false; this.bx = 0; this.by = 0; this.bz = 0;
  }
  setBagMouth(x, y, z) { this.bx = x; this.by = y; this.bz = z; this.bagOn = true; }
  noBag() { this.bagOn = false; }
  burst(x, z, dir, k = 3, spread = 1, toBag = false) {
    for (let i = 0; i < k; i++) {
      const j = this.head; this.head = (this.head + 1) % this.max;
      const a = dir + Math.PI / 2 * (Math.random() < .5 ? 1 : -1) + (Math.random() - .5) * 1.1;
      const sp = (0.9 + Math.random() * 1.8) * spread;
      this.pos[j * 3] = x; this.pos[j * 3 + 1] = 0.14 + Math.random() * 0.16; this.pos[j * 3 + 2] = z;
      this.vel[j * 3] = Math.sin(a) * sp; this.vel[j * 3 + 1] = 1.1 + Math.random() * 1.6; this.vel[j * 3 + 2] = Math.cos(a) * sp;
      this.life[j] = 0.55 + Math.random() * 0.5;
      this.tag[j] = toBag ? 1 : 0;
    }
  }
  update(dt) {
    for (let j = 0; j < this.max; j++) {
      if (this.life[j] <= 0) { this.pos[j * 3 + 1] = -5; continue; }
      this.life[j] -= dt;
      if (this.tag[j] && this.bagOn) {
        // pulled up the chute: no gravity, no ground contact — it ends up in the bag
        const dx = this.bx - this.pos[j * 3], dy = this.by - this.pos[j * 3 + 1], dz = this.bz - this.pos[j * 3 + 2];
        const d = Math.hypot(dx, dy, dz);
        if (d < 0.24) { this.life[j] = 0; this.pos[j * 3 + 1] = -5; continue; } // swallowed
        const k = 34 / d; // unit vector × suck accel
        this.vel[j * 3] += (dx * k - this.vel[j * 3] * 4.5) * dt;
        this.vel[j * 3 + 1] += (dy * k - this.vel[j * 3 + 1] * 4.5) * dt;
        this.vel[j * 3 + 2] += (dz * k - this.vel[j * 3 + 2] * 4.5) * dt;
        this.pos[j * 3] += this.vel[j * 3] * dt; this.pos[j * 3 + 1] += this.vel[j * 3 + 1] * dt; this.pos[j * 3 + 2] += this.vel[j * 3 + 2] * dt;
        continue;
      }
      this.vel[j * 3 + 1] -= 7.5 * dt;
      this.pos[j * 3] += this.vel[j * 3] * dt; this.pos[j * 3 + 1] += this.vel[j * 3 + 1] * dt; this.pos[j * 3 + 2] += this.vel[j * 3 + 2] * dt;
      if (this.pos[j * 3 + 1] < 0.02) { this.pos[j * 3 + 1] = 0.02; this.vel[j * 3 + 1] = 0; this.vel[j * 3] *= .82; this.vel[j * 3 + 2] *= .82; }
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
  }
}

export function mulberry(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

let DOT = null;
export function dotTex() {
  if (DOT) return DOT;
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(16, 16, 2, 16, 16, 15);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
  DOT = new THREE.CanvasTexture(c); return DOT;
}
