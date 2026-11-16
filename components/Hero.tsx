"use client";

import { Fragment, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { copy } from "@/lib/content";
import { CTA, Icon } from "./ui";
import Dial from "./Dial";
import { useIntro } from "./Intro";
import type { Angles } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const ease = [0.2, 0.8, 0.2, 1] as const;

/* Word by word rise for the headline: the one orchestrated load moment */
function Words({ text, start = 0 }: { text: string; start?: number }) {
  const { ready } = useIntro();
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className="word">
            <motion.span
              className="word__in"
              initial={{ y: "108%" }}
              animate={{ y: ready ? "0%" : "108%" }}
              transition={{ delay: start + i * 0.045, duration: 0.85, ease }}
            >
              {w}
            </motion.span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

function canUse3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Visual() {
  const wrap = useRef<HTMLDivElement>(null);
  const hover = useRef<number | null>(null);
  const lRef = useRef<HTMLElement>(null);
  const rRef = useRef<HTMLElement>(null);
  const last = useRef<[number, number]>([0, 0]);
  const [use3d, setUse3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [effects, setEffects] = useState(false);
  const inView = useInView(wrap, { margin: "100px" });

  useEffect(() => {
    setUse3d(canUse3D());
    setEffects(window.matchMedia("(min-width: 900px)").matches);
  }, []);

  /* Writes the live L / R readout straight to the DOM (no re-render per frame) */
  const onAngles = useCallback((a: Angles) => {
    const l = Math.round(a.l), r = Math.round(a.r);
    if (l !== last.current[0] && lRef.current) lRef.current.textContent = `${l}°`;
    if (r !== last.current[1] && rRef.current) rRef.current.textContent = `${r}°`;
    last.current = [l, r];
  }, []);

  const intro = useIntro().ready;
  return (
    <motion.div
      ref={wrap}
      className="visual"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={intro ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 1.2, ease, delay: 0.2 }}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        hover.current = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      }}
      onPointerLeave={() => { hover.current = null; }}
    >
      <div className={`visual__fallback ${ready ? "is-hidden" : ""}`}><Dial /></div>
      {use3d && (
        <HeroScene hover={hover} onAngles={onAngles} onReady={() => setReady(true)} active={inView} effects={effects} />
      )}
      <div className="readout">
        <span><i className="sw sw--l" />L <b ref={lRef}>138°</b></span>
        <span><i className="sw sw--r" />R <b ref={rRef}>112°</b></span>
      </div>
    </motion.div>
  );
}

/* Live Bengaluru time for the HUD frame (extra copy, pending client approval) */
function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="hud__clock">Bengaluru <b suppressHydrationWarning>{t || "00:00:00"}</b></span>;
}

const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  const h = copy.hero;
  const { ready } = useIntro();
  const show = (d: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { delay: d, duration: 0.6, ease },
  });
  return (
    <section className="hero" ref={ref}>
      {/* HUD frame: corner brackets + live clock */}
      <div className={`hud ${ready ? "is-on" : ""}`} aria-hidden="true">
        <i className="hud__c hud__c--tl" /><i className="hud__c hud__c--tr" />
        <i className="hud__c hud__c--bl" /><i className="hud__c hud__c--br" />
        <div className="hud__bar" data-extra><Clock /></div>
      </div>
      <div className="hero__panel">
        <div className="hero__copy">
          <motion.p className="eyebrow" data-extra data-decrypt {...show(0.1)}>
            {h.eyebrow.text}
          </motion.p>
          <h1 className="hero__title">
            <span className="hero__lead"><Words text={h.lead} /></span>
            <Words text={h.main} start={0.25} />
            <span className="hl"><Words text={h.highlight} start={0.55} /></span>
          </h1>
          <motion.div className="hero__sub" {...show(0.75)}>
            <p className="hero__line">{h.line}</p>
            <div className="hero__actions">
              <CTA>{h.cta}</CTA>
              <a className="link-down" href="#how"><span data-scramble>{h.secondary}</span><Icon name="down" /></a>
            </div>
          </motion.div>
        </div>

        <Visual />

        <ul className="pills" data-extra>
          {h.facts.items.map((f, i) => (
            <motion.li key={f.strong} className={`pill pill--${i}`}
              initial={{ x: 140, opacity: 0 }} animate={ready ? { x: 0, opacity: 1 } : { x: 140, opacity: 0 }}
              transition={{ delay: 0.95 + i * 0.12, duration: 0.85, ease }}>
              <span className="pill__icon"><Icon name={f.icon} /></span>
              <strong>{f.strong}</strong><span className="pill__text">{f.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export default Hero;
