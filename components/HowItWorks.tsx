"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { copy } from "@/lib/content";
import { Icon } from "./ui";
import { Figure, JOINTS } from "./Figure";

/* How it works: an illustrated figure in the centre, swept by a measuring line three times in a
   loop: 1 Check (joints get checked off), 2 Measure (angles on both sides), 3 Report (the one page
   result). Plays on its own while on screen; the steps below can also be picked by hand.
   Deliberately drawn, not photographic, and no camera framing or tracking dots (client brief). */

const PHASE_MS = 4800;
const SCAN_S = 1.7;
const H = 430; // viewBox height
const ease = [0.2, 0.8, 0.2, 1] as const;

type Pt = [number, number];
const J = JOINTS;
const CHECKS: Pt[] = [...J.shoulder, ...J.elbow, ...J.hip, ...J.knee, ...J.ankle];

/* Angle readings shown in Measure (illustrative): left°, right°, flagged side */
const READINGS: { at: Pt[]; l: number; r: number; flag?: 0 | 1 }[] = [
  { at: J.shoulder, l: 168, r: 164 },
  { at: J.hip, l: 42, r: 31, flag: 1 },
  { at: J.knee, l: 136, r: 138 },
];

const delayFor = (y: number) => 0.15 + (y / H) * SCAN_S;

function Body({ dim }: { dim: boolean }) {
  return (
    <motion.g animate={{ opacity: dim ? 0.35 : 1 }} transition={{ duration: 0.6 }}>
      <Figure id="scanfig" />
    </motion.g>
  );
}
function ScanLine({ run }: { run: number }) {
  return (
    <motion.g key={run} initial={{ y: -40, opacity: 0 }} animate={{ y: H + 10, opacity: [0, 1, 1, 0] }}
      transition={{ duration: SCAN_S, ease: "easeInOut", delay: 0.1, opacity: { duration: SCAN_S + 0.2, times: [0, 0.08, 0.85, 1], delay: 0.1 } }}>
      <rect x="-80" y="-34" width="360" height="34" fill="url(#scanband)" />
      <line x1="-80" x2="280" y1="0" y2="0" className="scan__line" />
      <circle cx="-76" cy="0" r="3" className="scan__tick" />
      <circle cx="276" cy="0" r="3" className="scan__tick" />
    </motion.g>
  );
}

function CheckPhase() {
  return (
    <g>
      {CHECKS.map(([x, y], i) => (
        <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delayFor(y), type: "spring", stiffness: 380, damping: 20 }}
          style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" }}>
          <circle cx={x} cy={y} r="9" className="mk" />
          <path d={`M${x - 4} ${y + 0.5} l3 3 l5.5 -6`} className="mk__tick" />
        </motion.g>
      ))}
    </g>
  );
}

function arcPath([x, y]: Pt, deg: number, side: 0 | 1) {
  const r = 17, a0 = -90, sweep = Math.min(deg, 180) * 0.75;
  const a1 = a0 + (side === 0 ? -sweep : sweep);
  const p = (a: number): Pt => [x + r * Math.cos((a * Math.PI) / 180), y + r * Math.sin((a * Math.PI) / 180)];
  const [sx, sy] = p(a0), [ex, ey] = p(a1);
  return `M${sx} ${sy} A${r} ${r} 0 0 ${side === 0 ? 0 : 1} ${ex} ${ey}`;
}

function MeasurePhase() {
  return (
    <g>
      {READINGS.map((rd, k) =>
        ([0, 1] as const).map((s) => {
          const pt = rd.at[s] as Pt;
          const deg = s === 0 ? rd.l : rd.r;
          const flag = rd.flag === s;
          const tagX = s === 0 ? -64 : 218;
          const d = delayFor(pt[1]);
          return (
            <g key={`${k}${s}`}>
              <circle cx={pt[0]} cy={pt[1]} r="4" className={flag ? "jt jt--flag" : "jt"} />
              <motion.path d={arcPath(pt, deg, s)} className={flag ? "arc arc--flag" : "arc"}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: d, duration: 0.6, ease }} />
              <motion.line x1={pt[0]} y1={pt[1]} x2={s === 0 ? tagX + 46 : tagX} y2={pt[1]} className="lead"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: d + 0.15, duration: 0.4 }} />
              <motion.g initial={{ opacity: 0, x: s === 0 ? -8 : 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d + 0.35, duration: 0.4 }}>
                <rect x={tagX} y={pt[1] - 11} width="46" height="22" rx="11" className={flag ? "tag tag--flag" : "tag"} />
                <text x={tagX + 23} y={pt[1] + 4} className={flag ? "tag__t tag__t--flag" : "tag__t"}>{s === 0 ? "L" : "R"} {deg}°</text>
              </motion.g>
            </g>
          );
        })
      )}
    </g>
  );
}

function ReportPhase() {
  const labels = copy.report.labels;
  const flagged = J.hip[1] as Pt;
  return (
    <g>
      <motion.circle cx={flagged[0]} cy={flagged[1]} r="10" className="jt jt--flag"
        initial={{ scale: 0.6 }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }}
        style={{ transformOrigin: `${flagged[0]}px ${flagged[1]}px`, transformBox: "view-box" }} />
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease }}>
        <g transform="translate(128 120) rotate(3)">
          <rect width="156" height="186" rx="14" className="rs" />
          <image href="/assets/logo-mark-dark.png" x="14" y="16" width="19" height="16" />
          <rect x="38" y="21" width="60" height="6" rx="3" className="rs__skel" />
          {labels.map((t, i) => (
            <g key={t} transform={`translate(14 ${60 + i * 42})`}>
              <circle cx="5" cy="-4" r="4.5" className={i === 1 ? "rs__dot rs__dot--flag" : "rs__dot"} />
              <text x="16" y="0" className="rs__t">{t}</text>
              <rect x="0" y="9" width={i === 2 ? 96 : 126} height="6" rx="3" className={i === 1 ? "rs__bar rs__bar--flag" : "rs__bar"} />
            </g>
          ))}
        </g>
      </motion.g>
    </g>
  );
}

export default function HowItWorks() {
  const steps = copy.how.steps;
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(0); // bumps on every pass so the sweep replays

  /* Replay the current pass whenever the section comes back into view */
  useEffect(() => { if (inView) setRun((r) => r + 1); }, [inView]);

  /* Autoplay: advance every PHASE_MS while visible (off for reduced motion) */
  useEffect(() => {
    if (!inView || reduce) return;
    const id = setTimeout(() => {
      setPhase((p) => (p + 1) % steps.length);
      setRun((r) => r + 1);
    }, PHASE_MS);
    return () => clearTimeout(id);
  }, [inView, reduce, run, steps.length]);

  const pick = (i: number) => { setPhase(i); setRun((r) => r + 1); };
  const playing = inView && !reduce;
  const icons = ["check", "repeat", "arrow"] as const;

  return (
    <section className="section how" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <h2 className="h2" data-decrypt id="how-title">{copy.how.heading}</h2>

        <div className="scan" ref={wrap}>
          <div className="scan__stage" aria-hidden="true">
            <i className="scan__c scan__c--tl" /><i className="scan__c scan__c--tr" />
            <i className="scan__c scan__c--bl" /><i className="scan__c scan__c--br" />
            <span className="scan__count">0{phase + 1} / 0{steps.length}</span>
            <span className="scan__legend"><i className="sw sw--l" />L<i className="sw sw--r" />R</span>
            <svg viewBox={`-80 -10 360 ${H + 20}`} className="scan__svg">
              <defs>
                <linearGradient id="scanband" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--scan)", stopOpacity: 0 }} />
                  <stop offset="1" style={{ stopColor: "var(--scan)", stopOpacity: 0.28 }} />
                </linearGradient>
              </defs>
              <line x1="-60" x2="260" y1="410" y2="410" className="scan__floor" />
              <line x1="100" x2="100" y1="0" y2="410" className="scan__axis" />
              {/* Height ruler (Draft 2 HUD detail) */}
              <g className="ruler">
                <line x1="-72" x2="-72" y1="10" y2="410" />
                {Array.from({ length: 21 }, (_, i) => {
                  const y = 10 + i * 20, major = i % 5 === 0;
                  return <line key={i} x1="-72" x2={major ? -82 : -78} y1={y} y2={y} className={major ? "ruler__major" : undefined} />;
                })}
              </g>
              <ellipse cx="100" cy="412" rx="46" ry="5" className="fig__ground" />
              <Body dim={phase === 2} />
              <AnimatePresence mode="wait">
                <motion.g key={`${phase}-${run}`} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {phase === 0 && <CheckPhase />}
                  {phase === 1 && <MeasurePhase />}
                  {phase === 2 && <ReportPhase />}
                </motion.g>
              </AnimatePresence>
              {!reduce && <ScanLine run={run} />}
            </svg>
          </div>

          <ol className="scan__steps">
            {steps.map((s, i) => (
              <li key={i} className={`sstep ${phase === i ? "is-active" : ""}`}>
                <button type="button" onClick={() => pick(i)} aria-pressed={phase === i}>
                  <span className="sstep__bar" aria-hidden="true">
                    {phase === i && (
                      <motion.i key={run} initial={{ scaleX: 0 }} animate={{ scaleX: playing ? 1 : 0 }}
                        transition={{ duration: PHASE_MS / 1000, ease: "linear" }} />
                    )}
                  </span>
                  <span className="sstep__head">
                    <span className="sstep__num" aria-hidden="true">0{i + 1}</span>
                    <span className="sstep__icon" aria-hidden="true"><Icon name={icons[i] ?? "arrow"} /></span>
                  </span>
                  <span className="sstep__text"><strong>{s.title}</strong> {s.text}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
