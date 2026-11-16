"use client";

/* SVG range of motion dial, styled like a goniometer (the tool physios use to measure joint angles).
   Shown while the 3D scene loads, and kept as the fallback for reduced motion or no WebGL. */
const R1 = 168, R2 = 138, C = 200;
const circ = (r: number) => 2 * Math.PI * r;

export default function Dial({ l = 138, r = 112 }: { l?: number; r?: number }) {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i * 5 - 90) * (Math.PI / 180);
    const long = i % 6 === 0;
    const r0 = 188, r1 = long ? 176 : 182;
    return (
      <line key={i} x1={C + r0 * Math.cos(a)} y1={C + r0 * Math.sin(a)} x2={C + r1 * Math.cos(a)} y2={C + r1 * Math.sin(a)}
        className={long ? "tick tick--long" : "tick"} />
    );
  });
  return (
    <svg className="dial-svg" viewBox="0 0 400 400" aria-hidden="true">
      {ticks}
      <circle cx={C} cy={C} r={R1} className="dial__track" />
      <circle cx={C} cy={C} r={R2} className="dial__track" />
      <circle cx={C} cy={C} r={R1} className="dial__arc dial__arc--l" strokeDasharray={circ(R1)}
        strokeDashoffset={circ(R1) * (1 - l / 360)} transform={`rotate(-90 ${C} ${C})`} />
      <circle cx={C} cy={C} r={R2} className="dial__arc dial__arc--r" strokeDasharray={circ(R2)}
        strokeDashoffset={circ(R2) * (1 - r / 360)} transform={`rotate(-90 ${C} ${C})`} />
      <g transform={`rotate(${l} ${C} ${C})`}>
        <line x1={C} y1={C} x2={C} y2={C - R1 - 6} className="dial__arm" />
        <circle cx={C} cy={C - R1} r="9" className="dial__knob" />
      </g>
      <line x1={C} y1={C} x2={C} y2={C - R1 - 6} className="dial__arm dial__arm--fixed" />
      <circle cx={C} cy={C} r="7" className="dial__hub" />
    </svg>
  );
}
