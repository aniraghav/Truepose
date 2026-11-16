"use client";

import { useEffect, useRef, useState } from "react";
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
      <SampleReport />
    </section>
  );
}

/* ---------- Sample member report (content from the client's sample report PDF) ---------- */
type Bars = { max: number; band?: number[]; avg?: number; vals: { k: string; v: number; flag?: boolean }[] };
type Move = { name: string; status: string; tone: "ok" | "work" | "grow"; value: string; note: string; bars: Bars };

function MoveBars({ b }: { b: Bars }) {
  const p = (v: number) => `${Math.min(100, (v / b.max) * 100)}%`;
  return (
    <div className="sr-bars" aria-hidden="true">
      {b.vals.map((x, i) => (
        <div className="sr-bars__row" key={x.k}>
          <span className="sr-bars__k">{x.k}</span>
          <span className="sr-bars__track">
            {b.band && <i className="sr-bars__band" style={{ left: p(b.band[0] ?? 0), width: `calc(${p(b.band[1] ?? 0)} - ${p(b.band[0] ?? 0)})` }} />}
            {b.avg !== undefined && <i className="sr-bars__avg" style={{ left: p(b.avg) }} />}
            <motion.i className={`sr-bars__fill ${x.flag ? "is-flag" : ""}`} style={{ originX: 0 }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: x.v / b.max }} viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 1, ease, delay: 0.1 * i }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function SampleReport() {
  const s = copy.report.sample;
  const moves = s.moves as unknown as Move[];
  const [day, setDay] = useState(0);
  const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.7, ease } };

  return (
    <div className="wrap sr">
      <motion.div className="sr__card" {...rise}>
        {/* Header */}
        <div className="sr__head">
          <div>
            <span className="sr__tag">{s.tag} <b>· {s.tagNote}</b></span>
            <h3 className="sr__hello">{s.greeting} <em>{s.greetingHl}</em></h3>
            <p className="sr__sub">{s.sub}</p>
          </div>
          <ul className="sr__meta">{s.meta.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>

        {/* Plan at a glance */}
        <h4 className="sr__h">{s.glanceTitle}</h4>
        <ul className="sr__glance">
          {s.glance.map((g) => <li key={g.k}><span>{g.k}</span><strong>{g.v}</strong></li>)}
        </ul>

        {/* How you move */}
        <h4 className="sr__h">{s.moveTitle}</h4>
        <ul className="sr__moves">
          {moves.map((m) => (
            <li key={m.name} className="sr-move">
              <div className="sr-move__top">
                <p className="sr-move__name">{m.name}</p>
                <span className={`sr-chip sr-chip--${m.tone}`}>{m.status}</span>
              </div>
              <p className="sr-move__val">{m.value}</p>
              <MoveBars b={m.bars} />
              <p className="sr-move__note">{m.note}</p>
            </li>
          ))}
        </ul>

        {/* Where to start / Why this plan */}
        <div className="sr__band">
          <div>
            <h4 className="sr__h sr__h--inv">{s.startTitle}</h4>
            <ul className="sr__list">{s.start.map((x) => <li key={x.b}><b>{x.b}</b> {x.t}</li>)}</ul>
          </div>
          <div>
            <h4 className="sr__h sr__h--inv">{s.whyTitle}</h4>
            <ul className="sr__list">{s.why.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>

        {/* Your week: three columns on desktop, tabs on mobile */}
        <h4 className="sr__h">{s.weekTitle}</h4>
        <div className="sr__tabs" role="tablist" aria-label={s.weekTitle}>
          {s.days.map((d, i) => (
            <button key={d.d} type="button" role="tab" aria-selected={day === i} className={day === i ? "is-on" : ""} onClick={() => setDay(i)}>
              {d.d}<span>{d.w}</span>
            </button>
          ))}
        </div>
        <div className="sr__week">
          {s.days.map((d, i) => (
            <div key={d.d} className={`sr-day ${day === i ? "is-on" : ""}`} role="tabpanel">
              <p className="sr-day__head"><strong>{d.d}</strong><span>{d.w}</span></p>
              <ul>
                {d.ex.map(([name, sets, alt]) => (
                  <li key={name}>
                    <span className="sr-day__ex"><b>{name}</b><small>{s.busy} {alt}</small></span>
                    <span className="sr-day__sets">{sets}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Targets / Good to know + retest */}
        <div className="sr__foot">
          <div className="sr-box">
            <h4 className="sr__h">{s.targetsTitle}</h4>
            <ul className="sr__plain">{s.targets.map((x) => <li key={x.b}><b>{x.b}</b> {x.t}</li>)}</ul>
            <p className="sr__source">{s.targetsSource}</p>
          </div>
          <div className="sr-box">
            <h4 className="sr__h">{s.knowTitle}</h4>
            <ul className="sr__plain">{s.know.map((x) => <li key={x}>{x}</li>)}</ul>
            <div className="sr-retest">
              <p><span>{s.retestLabel}</span><strong>{s.retestDate}</strong></p>
              <p className="sr-retest__t">{s.retestText}</p>
            </div>
          </div>
        </div>
        <p className="sr__footnote">{s.footnote}</p>
      </motion.div>
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
