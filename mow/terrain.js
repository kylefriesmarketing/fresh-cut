// FRESH CUT — terrain.js
// Shaped ground. A lot is no longer necessarily flat: it can have mounds, bowls, banks and
// a general tilt, and everything that stands on it — grass, flowers, props, the mower, you —
// reads its height from here.
//
// TWO RULES make this safe to add to a shipped game:
//   1. `def.terrain` absent  ->  heightAt() is a constant 0 and `enabled` is false, so every
//      existing map stays byte-for-byte flat and pays nothing.
//   2. Height TAPERS TO ZERO at the lot boundary, so the fence, the street and the whole
//      neighbourhood beyond it never need to know terrain exists.
//
// Features (def.terrain.features):
//   { k:'mound',  x, z, r, h }            a smooth hill (h<0 makes a hollow)
//   { k:'bowl',   x, z, r, h }            same, sunk
//   { k:'ridge',  x1, z1, x2, z2, w, h }  a bank or levee along a line
//   { k:'slope',  ang, h }                the whole lot tilted, ang in radians
//   { k:'step',   x1, z1, x2, z2, w, h }  a terrace: flat above, flat below, ramp between

const smooth = (e0, e1, v) => { const x = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return x * x * (3 - 2 * x); };

function segDist(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const L = dx * dx + dz * dz;
  const t = L ? Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / L)) : 0;
  return { d: Math.hypot(px - (x1 + dx * t), pz - (z1 + dz * t)), t, side: Math.sign((px - x1) * dz - (pz - z1) * dx) };
}

export function makeTerrain(def) {
  const W = def.lot.w, H = def.lot.h;
  const cfg = def.terrain || null;
  const feats = (cfg && cfg.features) || [];
  const edge = (cfg && cfg.edge) || 3.0;

  // ground that must stay level: the house pad and any laid path
  const flats = [];
  if (def.house) {
    const hd = def.house;
    flats.push({ x0: hd.x - hd.w / 2 - 0.6, x1: hd.x + hd.w / 2 + 0.6, z0: hd.z - hd.d / 2 - 2.4, z1: hd.z + hd.d / 2 + 0.6, pad: 1.8 });
  }
  for (const p of def.paths || []) flats.push({ x0: p.x - 0.3, x1: p.x + p.w + 0.3, z0: p.z - 0.3, z1: p.z + p.h + 0.3, pad: 1.2 });

  if (!feats.length) {
    const zero = () => 0;
    return { enabled: false, heightAt: zero, normalAt: () => ({ nx: 0, nz: 0 }), maxY: 0, slopeAt: () => 0 };
  }

  function raw(x, z) {
    let h = 0;
    for (const f of feats) {
      if (f.k === 'mound' || f.k === 'bowl') {
        const d = Math.hypot(x - f.x, z - f.z);
        const s = 1 - smooth(0, f.r, d);          // 1 at centre, 0 at radius
        h += (f.k === 'bowl' ? -Math.abs(f.h) : f.h) * s * s * (3 - 2 * s) / 1;
      } else if (f.k === 'ridge') {
        const { d } = segDist(x, z, f.x1, f.z1, f.x2, f.z2);
        h += f.h * (1 - smooth(0, f.w, d));
      } else if (f.k === 'step') {
        const { d, side } = segDist(x, z, f.x1, f.z1, f.x2, f.z2);
        // flat on both sides, ramped across the band of width w
        const across = Math.min(1, d / f.w);
        h += f.h * (side >= 0 ? 0.5 + 0.5 * smooth(0, 1, across) : 0.5 - 0.5 * smooth(0, 1, across));
      } else if (f.k === 'slope') {
        h += f.h * ((Math.sin(f.ang) * (x - W / 2) + Math.cos(f.ang) * (z - H / 2)) / Math.max(W, H));
      }
    }
    return h;
  }

  function heightAt(x, z) {
    let h = raw(x, z);
    // taper to nothing at the lot boundary — the fence and the whole world beyond stay flat
    const e = Math.min(x, z, W - x, H - z);
    h *= smooth(0, edge, e);
    // and level off under buildings and paths, with a soft skirt so it isn't a cliff
    for (const f of flats) {
      const dx = Math.max(f.x0 - x, 0, x - f.x1), dz = Math.max(f.z0 - z, 0, z - f.z1);
      h *= smooth(0, f.pad, Math.hypot(dx, dz));
    }
    return h;
  }
  // finite-difference normal, for tilting anything that sits on the ground
  function normalAt(x, z, e = 0.35) {
    return { nx: (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e), nz: (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e) };
  }
  function slopeAt(x, z) { const n = normalAt(x, z); return Math.hypot(n.nx, n.nz); }

  let maxY = 0;
  for (let z = 0; z <= H; z += 1) for (let x = 0; x <= W; x += 1) maxY = Math.max(maxY, Math.abs(heightAt(x, z)));

  return { enabled: true, heightAt, normalAt, slopeAt, maxY };
}

// displace a flat PlaneGeometry (built in XY then laid down) onto the terrain.
// `plane` must be a PlaneGeometry(W,H) that the caller rotates -90° about X and centres
// at (W/2, y, H/2) — exactly how the ground and the cut overlay are built.
export function drapePlane(geo, terrain, W, H) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    // local (x,y) -> world (x + W/2, ?, H/2 - y) after the -90° rotation
    const wx = pos.getX(i) + W / 2, wz = H / 2 - pos.getY(i);
    pos.setZ(i, terrain.heightAt(wx, wz));   // local +z becomes world +y once rotated
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
