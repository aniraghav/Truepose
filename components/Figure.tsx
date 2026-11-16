/* Realistic, gender neutral standing figure (front view, ~8 heads tall), drawn as one smooth
   outline. The right half is defined by hand; the left half is its mirror. Catmull-Rom smoothing
   turns the points into soft, organic curves. viewBox: 0 0 200 430. */

type P = [number, number];

/* Right side outline, top of head clockwise down the outer edge and back up the inner leg */
const RIGHT: P[] = [
  [100, 10], [111, 12], [118, 20], [121, 32], [120, 44], [117, 53], [112, 60], [106, 64],
  [107, 69], [110, 75],                                   // neck
  [122, 79], [137, 82], [149, 87], [156, 96],             // trapezius to deltoid
  [159, 110], [160, 128], [161, 147], [163, 166],         // outer upper arm to elbow
  [165, 184], [166, 202], [165, 219], [163, 232],         // outer forearm to wrist
  [166, 244], [167, 256], [164, 266], [159, 270],         // hand
  [155, 264], [153, 251], [154, 240], [152, 229],         // fingers and inner wrist
  [150, 211], [148, 192], [147, 175],                     // inner forearm
  [145, 158], [143, 140], [141, 124], [138, 113],         // inner upper arm to armpit
  [136, 124], [134, 141], [131, 160], [132, 178],         // ribcage to waist
  [136, 195], [139, 211],                                 // hip
  [140, 229], [139, 251], [136, 276], [132, 300], [131, 313], // outer thigh to knee
  [133, 331], [132, 351], [128, 372], [124, 388],         // calf to ankle
  [126, 398], [130, 405], [128, 411], [113, 411], [110, 402], // foot
  [111, 388], [110, 369], [108, 348], [109, 327], [108, 310], // inner calf and knee
  [107, 290], [106, 263], [104, 239], [100, 222],         // inner thigh to crotch
];

function outline(): P[] {
  const mid = RIGHT.slice(1, -1).reverse().map(([x, y]) => [200 - x, y] as P);
  return [...RIGHT, ...mid];
}

/* Closed Catmull-Rom spline as cubic Bezier path */
function smoothClosed(pts: P[]): string {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n] as P;
  let d = `M${at(0)[0]} ${at(0)[1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
}

export const FIGURE_PATH = smoothClosed(outline());

/* Subtle anatomy contours (mirrored pairs) */
const CONTOURS = [
  "M86 83 Q93 87 100 86 Q107 87 114 83",                    // clavicles
  "M80 111 Q90 123 100 117", "M120 111 Q110 123 100 117",   // chest
  "M100 120 L100 172",                                      // centre line
  "M91 137 Q100 140 109 137", "M92 154 Q100 157 108 154",   // abdomen
  "M76 196 Q88 208 97 220", "M124 196 Q112 208 103 220",    // hip creases
  "M146 96 Q149 111 147 124", "M54 96 Q51 111 53 124",      // deltoids
  "M115 304 Q120 314 126 304", "M85 304 Q80 314 74 304",    // knees
  "M127 336 Q124 352 122 366", "M73 336 Q76 352 78 366",    // calves
];

/* Joint centres used for markers and angle readings */
export const JOINTS = {
  shoulder: [[52, 97], [148, 97]] as P[],
  elbow: [[45, 168], [155, 168]] as P[],
  hip: [[84, 214], [116, 214]] as P[],
  knee: [[80, 312], [120, 312]] as P[],
  ankle: [[82, 390], [118, 390]] as P[],
};

/* The figure itself. `id` keeps gradient ids unique when used twice on a page. */
export function Figure({ id = "fig", className = "fig" }: { id?: string; className?: string }) {
  return (
    <g className={className}>
      <defs>
        <radialGradient id={`${id}-shade`} cx="50%" cy="38%" r="70%">
          <stop offset="0" style={{ stopColor: "var(--fig-light)" }} />
          <stop offset="1" style={{ stopColor: "var(--fig-dark)" }} />
        </radialGradient>
        {/* Rim light: bright on the upper left edge, fading toward the lower right */}
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--fig-rim-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--fig-rim-b)" }} />
        </linearGradient>
        {/* Fine horizontal measurement lines inside the body */}
        <pattern id={`${id}-lines`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="0.8" style={{ fill: "var(--fig-line)" }} />
        </pattern>
        <clipPath id={`${id}-clip`}><path d={FIGURE_PATH} /></clipPath>
      </defs>
      <path d={FIGURE_PATH} fill={`url(#${id}-shade)`} className="fig__body" />
      <rect x="0" y="0" width="200" height="430" fill={`url(#${id}-lines)`} clipPath={`url(#${id}-clip)`} className="fig__lines" />
      <g clipPath={`url(#${id}-clip)`} className="fig__contours">
        {CONTOURS.map((d) => <path key={d} d={d} />)}
      </g>
      <path d={FIGURE_PATH} className="fig__rim" stroke={`url(#${id}-rim)`} />
    </g>
  );
}
