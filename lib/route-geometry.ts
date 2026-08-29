/*
  route-geometry — pure geometry for the RouteThread ribbon (no React).

  Builds a smooth meandering centerline from section anchors via Catmull-Rom
  (tension 0.5), samples it evenly, and turns a per-sample width array into a
  closed filled-outline path. All the heavy math runs once at mount/resize; the
  animation loop only swaps precomputed outline strings.
*/

export interface Anchor {
  x: number;
  y: number;
}

export interface Sample {
  x: number;
  y: number;
  /** unit normal */
  nx: number;
  ny: number;
  /** cumulative arc length */
  s: number;
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Sample a Catmull-Rom spline through `anchors`, extended off both ends so the
 *  ribbon enters and exits beyond the viewport with no visible endpoints. */
export function sampleSpline(anchors: Anchor[], count: number, overshoot: number): Sample[] {
  if (anchors.length < 2) return [];
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  // Phantom endpoints extended vertically beyond the page edges.
  const pts: Anchor[] = [
    { x: first.x, y: first.y - overshoot },
    ...anchors,
    { x: last.x, y: last.y + overshoot },
  ];

  const raw: Anchor[] = [];
  const segs = pts.length - 1;
  const per = Math.max(2, Math.floor(count / segs));
  for (let i = 0; i < segs; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const steps = i === segs - 1 ? per : per; // even sampling
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      raw.push({ x: catmull(p0.x, p1.x, p2.x, p3.x, t), y: catmull(p0.y, p1.y, p2.y, p3.y, t) });
    }
  }
  raw.push({ x: last.x, y: last.y + overshoot });

  // normals + cumulative arc length
  const out: Sample[] = [];
  let acc = 0;
  for (let i = 0; i < raw.length; i++) {
    const prev = raw[Math.max(0, i - 1)];
    const next = raw[Math.min(raw.length - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    if (i > 0) acc += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    // normal = rotate tangent 90°
    out.push({ x: raw[i].x, y: raw[i].y, nx: -ty, ny: tx, s: acc });
  }
  return out;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
}

/** Per-sample width: swells to `peak` at each section arc-position, tapers to
 *  `base` in the gaps via smoothstep, scaled by a uniform velocity factor. */
export function widthArray(
  samples: Sample[],
  sectionArcs: number[],
  base: number,
  peak: number,
  velocityFactor: number,
): number[] {
  const window = sectionArcs.length > 1 ? (sectionArcs[sectionArcs.length - 1] - sectionArcs[0]) / (sectionArcs.length - 1) / 2 : 400;
  return samples.map((sm) => {
    let nearest = Infinity;
    for (const a of sectionArcs) nearest = Math.min(nearest, Math.abs(sm.s - a));
    const bump = 1 - smoothstep(0, window, nearest);
    return (base + (peak - base) * bump) * velocityFactor;
  });
}

/** Build the closed filled outline: forward edge then reverse edge.
 *  End caps land off-viewport (§2), so a plain close is invisible. */
export function buildOutline(samples: Sample[], widths: number[]): string {
  if (!samples.length) return "";
  const fwd: string[] = [];
  const rev: string[] = [];
  for (let i = 0; i < samples.length; i++) {
    const sm = samples[i];
    const h = widths[i] / 2;
    fwd.push(`${(sm.x + sm.nx * h).toFixed(2)} ${(sm.y + sm.ny * h).toFixed(2)}`);
    rev.push(`${(sm.x - sm.nx * h).toFixed(2)} ${(sm.y - sm.ny * h).toFixed(2)}`);
  }
  rev.reverse();
  return `M${fwd.join("L")}L${rev.join("L")}Z`;
}

/** Interpolate a point along samples at progress 0..1 (by sample index). */
export function pointAt(samples: Sample[], progress: number): { x: number; y: number } {
  if (!samples.length) return { x: 0, y: 0 };
  const idx = Math.min(samples.length - 1, Math.max(0, progress * (samples.length - 1)));
  const i = Math.floor(idx);
  const f = idx - i;
  const a = samples[i];
  const b = samples[Math.min(samples.length - 1, i + 1)];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

/** Point on the ribbon at a given document Y — matches the clip-rect reveal,
 *  which grows by vertical height. Finds the first segment straddling `targetY`
 *  and interpolates x, so the head lands exactly on the revealed leading edge. */
export function pointAtY(samples: Sample[], targetY: number): { x: number; y: number } {
  if (!samples.length) return { x: 0, y: targetY };
  if (targetY <= samples[0].y) return { x: samples[0].x, y: targetY };
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if ((a.y <= targetY && targetY <= b.y) || (a.y >= targetY && targetY >= b.y)) {
      const f = (targetY - a.y) / (b.y - a.y || 1);
      return { x: a.x + (b.x - a.x) * f, y: targetY };
    }
  }
  const last = samples[samples.length - 1];
  return { x: last.x, y: targetY };
}
