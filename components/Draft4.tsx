"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { MotionConfig, motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { copy, EMAIL } from "@/lib/content";
import SmoothScroll, { useLenis } from "./SmoothScroll";
import { IntroContext, useIntro } from "./Intro";
import Effects from "./Effects";
import Header from "./Header";
import HowItWorks from "./HowItWorks";
import { Report, Measure, Claims } from "./Sections";
import { Book, StickyCTA } from "./Book";
import { Icon, Logo } from "./ui";
import HeroPhoto from "./HeroPhoto";

/* DRAFT 4: dark grey, light neon green. Layout rhythm follows the fit-and-you.webflow.io reference
   (bracket counter loader, left text and right photo hero, number ticker,
   tilted cards, big list FAQ, round CTA, grid footer). Truepose copy and original graphics only:
   the hero photo is client supplied; no camera imagery. */

const ease = [0.2, 0.8, 0.2, 1] as const;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useOnScreen(ref: RefObject<Element>, initial: boolean, threshold = 0) {
  const [on, setOn] = useState(initial);
  useEffect(() => {
    if (!ref.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOn(!!e?.isIntersecting), { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

/* ---------- Loader: the Truepose "T" mark (logo 2) in dark grey on the brand green.
   A faint mark fills solid from the bottom up with the progress, settles, then the panel lifts away. ---------- */
const SEEN_KEY = "tp-intro-seen-d4";
function PreloaderD4({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLElement>(null);
  const fill = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();

  useEffect(() => { lenis?.stop(); return () => { lenis?.start(); }; }, [lenis]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* play it */ }
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");
    const finish = () => { document.documentElement.classList.remove("is-loading"); setGone(true); };
    if (reduced() || seen) {
      gsap.to(el, { autoAlpha: 0, duration: 0.3, onStart: onReveal, onComplete: finish });
      return;
    }
    const c = { v: 0 };
    const paint = () => {
      const v = c.v;
      if (num.current) num.current.textContent = String(Math.round(v));
      if (fill.current) fill.current.style.clipPath = `inset(${100 - v}% 0 0 0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
    };
    const tl = gsap.timeline();
    tl.from(".d4pl__mark", { y: 14, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 0)
      .from(".d4pl__meta", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0.25)
      .to(c, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: paint }, 0.2)
      .to(".d4pl__meta", { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 2.05)
      .to(".d4pl__mark", { scale: 0.9, autoAlpha: 0, duration: 0.55, ease: "power3.in" }, 2.15)
      .add(() => onReveal(), 2.45)
      .to(el, { yPercent: -100, duration: 0.95, ease: "power4.inOut" }, 2.35)
      .add(() => { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ } finish(); });
    return () => { tl.kill(); };
  }, [onReveal]);

  if (gone) return null;
  return (
    <div className="preloader d4pl" ref={root} aria-hidden="true">
      <div className="d4pl__stage">
        <div className="d4pl__mark">
          <i className="d4pl__ghost" />
          <i className="d4pl__fill" ref={fill} />
        </div>
        <div className="d4pl__meta">
          <span className="d4pl__bar"><i ref={bar} /></span>
          <span className="d4pl__pct"><b ref={num}>0</b>%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Number ticker (facts from the brief, two rows in opposite directions) ---------- */
const TICKS = [
  { n: "3", t: "steps" },
  { n: "1", t: "page" },
  { n: "4", t: "weeks to a retest" },
  { n: "3", t: "members free" },
];
function Ticker() {
  const row = (rev: boolean) => (
    <div className={`d4tick__row ${rev ? "d4tick__row--rev" : ""}`}>
      {[0, 1].map((k) => (
        <div className="d4tick__set" key={k} aria-hidden={k === 1 || rev ? true : undefined}>
          {TICKS.map((t, i) => <span key={i}><b>{t.n}</b> {t.t}</span>)}
        </div>
      ))}
    </div>
  );
  return (
    <section className="d4tick" data-extra aria-label="Truepose in numbers">
      {row(false)}
      {row(true)}
    </section>
  );
}

/* ---------- Why gyms use it: staggered headline + tilted cards ---------- */
function Spark() {
  return (
    <svg className="d4spark" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="4" y1="4" x2="96" y2="96" /><line x1="96" y1="4" x2="4" y2="96" />
      <path d="M50 30 C52 46 54 48 70 50 C54 52 52 54 50 70 C48 54 46 52 30 50 C46 48 48 46 50 30Z" />
    </svg>
  );
}
/* Simple original line graphics, one per point */
const GRAPHICS = [
  <g key="plan"><rect x="34" y="22" width="52" height="56" rx="6" /><path d="M44 38h28M44 50h28M44 62h18" /><circle cx="30" cy="30" r="10" className="fillg" /><path d="M25 30l4 4 7 -8" className="tick" /></g>,
  <g key="retest"><path d="M18 70 L40 58 L58 62 L82 30" /><circle cx="18" cy="70" r="5" className="fillg" /><circle cx="82" cy="30" r="7" className="fillg" /><path d="M18 80h64" /></g>,
  <g key="staff"><rect x="16" y="22" width="46" height="32" rx="10" /><path d="M28 54 l-4 10 12 -10" /><rect x="44" y="42" width="42" height="30" rx="10" className="fillg" /></g>,
  <g key="along"><circle cx="38" cy="50" r="22" /><circle cx="62" cy="50" r="22" /><circle cx="50" cy="50" r="8" className="fillg" /></g>,
];
const TILTS = [-5, 3.5, -2.5, 5];

function WhyD4() {
  return (
    <section className="section d4why" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <h2 className="d4why__title" id="why-title">
          <span className="d4why__a">Why gyms</span>
          <span className="d4why__b"><Spark /><em>use it</em></span>
        </h2>
        <ol className="d4cards">
          {copy.why.points.map((p, i) => (
            <motion.li key={i} className={`d4card d4card--${i}`}
              initial={{ opacity: 0, y: 90, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: TILTS[i] ?? 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease, delay: (i % 2) * 0.12 }}>
              <p className="d4card__text">{p}</p>
              <div className="d4card__oval" aria-hidden="true">
                <svg viewBox="0 0 100 100">{GRAPHICS[i]}</svg>
              </div>
              <span className="d4card__n" aria-hidden="true">0{i + 1}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- FAQ as a big condensed list ---------- */
function FaqD4() {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <section className="section d4faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <h2 className="d4faq__title" data-decrypt id="faq-title">{copy.faq.heading}</h2>
        <div className="d4faq__rule" />
        <ul className="d4faq__list">
          {copy.faq.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className={`d4faq__item ${isOpen ? "is-open" : ""}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`${base}-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{f.q}</span>
                    <i className="d4faq__plus" aria-hidden="true">[<b>+</b>]</i>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`${base}-${i}`} className="d4faq__a" role="region"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}>
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Grid footer ---------- */
function FooterD4() {
  return (
    <footer className="d4foot">
      <div className="d4foot__grid">
        <div className="d4foot__cell d4foot__logo"><Logo /></div>
        <nav className="d4foot__cell d4foot__nav" aria-label="Footer">
          {copy.nav.links.map((l) => <a key={l.href} href={l.href} data-scramble>{l.label}</a>)}
        </nav>
        <a className="d4foot__top" href="#top" aria-label="Back to top"><Icon name="arrow" /></a>
        <div className="d4foot__cell d4foot__info">
          <p className="d4foot__line">{copy.footer.items.map((t) => <span key={t}>{t}</span>)}<a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          <p className="d4foot__legal">{copy.footer.legal}</p>
        </div>
        <div className="d4foot__cell d4foot__big" aria-hidden="true">Truepose</div>
      </div>
    </footer>
  );
}

export default function SiteDraft4() {
  const heroRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const heroIn = useOnScreen(heroRef, true);
  const bookIn = useOnScreen(bookRef, false, 0.1);
  const [ready, setReady] = useState(false);
  const onReveal = useCallback(() => setReady(true), []);

  return (
    <div className="page-draft4">
      <SmoothScroll>
        <IntroContext.Provider value={{ ready }}>
          <MotionConfig reducedMotion="user">
            <PreloaderD4 onReveal={onReveal} />
            <Effects />
            <a className="skip" href="#main">Skip to content</a>
            <Header />
            <main id="main">
              <HeroPhoto ref={heroRef} />
              <Ticker />
              <HowItWorks />
              <Report />
              <WhyD4 />
              <Measure />
              <Claims />
              <FaqD4 />
              <Book ref={bookRef} />
            </main>
            <FooterD4 />
            <StickyCTA visible={ready && !heroIn && !bookIn} />
          </MotionConfig>
        </IntroContext.Provider>
      </SmoothScroll>
    </div>
  );
}
