"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copy } from "@/lib/content";
import { LogoMark } from "./ui";
import { accent, cssVar } from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);
const ease = [0.2, 0.8, 0.2, 1] as const;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- The report: sheet tilts and lifts with scroll (Framer Motion) ---------- */
function Pair({ a, b, flag }: { a: number; b: number; flag?: boolean }) {
  return (
    <div className={`pair ${flag ? "pair--flag" : ""}`}>
      <motion.span style={{ originX: 1 }} initial={{ scaleX: 0.08 }} whileInView={{ scaleX: a }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1, ease }} />
      <motion.span style={{ originX: 0 }} initial={{ scaleX: 0.08 }} whileInView={{ scaleX: b }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1, ease, delay: 0.1 }} />
    </div>
  );
}

export function Report() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-9, -2, 3]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const r = copy.report;

  return (
    <section className="section section--alt" id="report" aria-labelledby="report-title" ref={ref}>
      <div className="wrap report">
        <div className="report__copy">
          <h2 className="h2" data-decrypt id="report-title">{r.heading}</h2>
          <p className="report__text">{r.lead} <span>{r.text}</span></p>
        </div>
        <motion.figure className="sheet" aria-hidden="true" style={{ rotate, y }}>
          <div className="sheet__top"><LogoMark className="sheet__mark" tone="dark" /><span className="skel w-[40%]" /></div>
          <div className="sheet__block">
            <p className="sheet__label"><i className="dot dot--ok" />{r.labels[0]}</p>
            <Pair a={0.86} b={0.84} />
            <Pair a={0.78} b={0.8} />
          </div>
          <div className="sheet__block">
            <p className="sheet__label"><i className="dot dot--work" />{r.labels[1]}</p>
            <Pair a={0.74} b={0.46} flag />
          </div>
          <div className="sheet__block">
            <p className="sheet__label"><i className="dot dot--start" />{r.labels[2]}</p>
            <span className="skel w-[90%]" /><span className="skel w-[70%]" />
          </div>
        </motion.figure>
      </div>
      <Metrics />
    </section>
  );
}

/* ---------- Monitored metrics (sample data) ---------- */
type Metric = (typeof copy.report.metrics)[number];
const pct = (m: Metric, v: number) => ((v - m.min) / (m.max - m.min)) * 100;

function Trend({ pts }: { pts: readonly number[] }) {
  const lo = Math.min(...pts), hi = Math.max(...pts), w = 120, h = 36;
  const d = pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * w} ${h - 4 - ((v - lo) / (hi - lo || 1)) * (h - 8)}`).join(" ");
  return (
    <svg viewBox={`-4 0 ${w + 8} ${h}`} className="mx__trend" aria-hidden="true">
      <motion.path d={d} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} />
      {pts.map((v, i) => <circle key={i} cx={(i / (pts.length - 1)) * w} cy={h - 4 - ((v - lo) / (hi - lo || 1)) * (h - 8)} r={i === pts.length - 1 ? 3.5 : 2} />)}
    </svg>
  );
}

function Metrics() {
  const r = copy.report;
  const arrow = { up: "▲", down: "▼", same: "●" } as const;
  return (
    <div className="wrap mx" data-extra>
      <div className="mx__head">
        <span className="mx__tag">{r.metricsTag}</span>
        <span className="mx__note"><i aria-hidden="true">▲▼</i> {r.metricsNote}</span>
      </div>
      <ul className="mx__grid">
        {r.metrics.map((m, i) => {
          const trend = "trend" in m ? m.trend : undefined;
          const change = m.dir === "same" ? "No change" : `${arrow[m.dir]} ${m.delta}`;
          return (
            <li key={m.name} className={`mx__cell ${i === 0 ? "mx__cell--lead" : ""}`}>
              <p className="mx__name">{m.name}</p>
              <p className="mx__val">{m.value}<span className="mx__unit">{m.unit}</span></p>
              <p className={`mx__delta mx__delta--${m.dir}`}>
                <span className="sr-only">Change since last check: </span>{change}
              </p>
              {trend && <Trend pts={trend} />}
              <div className="mx__bar" aria-hidden="true">
                <span className="mx__band" style={{ left: `${pct(m, m.lo)}%`, width: `${pct(m, m.hi) - pct(m, m.lo)}%` }} />
                <motion.span className="mx__pin" initial={{ left: "0%", opacity: 0 }} whileInView={{ left: `${pct(m, m.at)}%`, opacity: 1 }}
                  viewport={{ once: true, amount: 0.8 }} transition={{ duration: 1, ease, delay: 0.05 * i }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- What we measure: words light up as you scroll (GSAP scrub) ---------- */
export function Measure() {
  const ref = useRef<HTMLParagraphElement>(null);
  const m = copy.measure;
  const words = m.sentence.split(" ");

  useEffect(() => {
    if (!ref.current || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".mw", { color: cssVar("--dim", "#8592a3") }, {
        color: (_: number, el: Element) => (el.classList.contains("mw--hl") ? accent() : cssVar("--text", "#f5f3ee")),
        stagger: 0.12,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section statement" id="measure" aria-labelledby="measure-title">
      <div className="wrap">
        <h2 className="label" data-decrypt id="measure-title">{m.heading}</h2>
        <p className="statement__text" ref={ref}>
          {words.map((w, i) => {
            const hl = m.highlight.some((h) => w.toLowerCase().startsWith(h));
            return <span key={i} className={`mw ${hl ? "mw--hl" : ""}`}>{w} </span>;
          })}
        </p>
      </div>
    </section>
  );
}

/* ---------- What we don't claim ---------- */
export function Claims() {
  return (
    <section className="section section--alt" aria-labelledby="claim-title">
      <div className="wrap split">
        <h2 className="h2" data-decrypt id="claim-title">{copy.claims.heading}</h2>
        <ul className="claims">
          {copy.claims.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </section>
  );
}
