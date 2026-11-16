"use client";

import { useEffect, useRef, useState } from "react";
import { useIntro } from "./Intro";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring } from "framer-motion";
import { copy, EMAIL } from "@/lib/content";
import { Logo, CTA } from "./ui";
import { useLenis } from "./SmoothScroll";

const ease = [0.2, 0.8, 0.2, 1] as const;

/* Tracks which section is on screen so the menu can mark it */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = copy.nav.links.map((l) => l.href.slice(1));

export default function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const { ready } = useIntro();
  const entered = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  const active = useActiveSection(IDS);

  /* Hide on scroll down, show on scroll up */
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    if (y < prev - 2 || y < 240) setHidden(false);
    else if (y > prev + 2 && !open) setHidden(true);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); return; }
      if (e.key !== "Tab") return;
      /* Keep keyboard focus inside the open menu (close button + menu items) */
      const menu = document.getElementById("site-menu");
      const items = [btn.current, ...Array.from(menu?.querySelectorAll<HTMLElement>("a, button") ?? [])].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.toggle("menu-open", open);
    if (open) lenis?.stop(); else lenis?.start();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  /* Close the panel if the window grows past the full bar */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1180px)");
    const on = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <motion.header
        id="top"
        className={`header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}
        initial={{ y: "-130%" }}
        animate={{ y: (hidden && !open) || !ready ? "-130%" : "0%" }}
        transition={{ duration: ready && !entered.current ? 0.8 : 0.35, delay: ready && !entered.current ? 0.35 : 0, ease }}
        onAnimationComplete={() => { if (ready) entered.current = true; }}
      >
        <div className="header__bar">
          <Logo />
          <nav aria-label="Main" className="nav">
            <ul>
              {copy.nav.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-scramble aria-current={active === l.href.slice(1) ? "true" : undefined}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <CTA className="btn--sm header__cta">{copy.nav.cta}</CTA>
          <button
            ref={btn}
            className={`menu-btn ${open ? "is-open" : ""}`}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={copy.nav.menuLabel}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            className="mmenu"
            role="dialog"
            aria-modal="true"
            aria-label={copy.nav.menuLabel}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <nav aria-label="Menu" className="mmenu__nav">
              <ul>
                {copy.nav.links.map((l, i) => (
                  <motion.li key={l.href}
                    initial={{ y: 48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18 + i * 0.06, duration: 0.45, ease }}
                  >
                    <a href={l.href} onClick={close} aria-current={active === l.href.slice(1) ? "true" : undefined}
                      ref={i === 0 ? (el) => el?.focus({ preventScroll: true }) : undefined}>
                      <span className="mmenu__num" aria-hidden="true">0{i + 1}</span>
                      <span className="mmenu__label">{l.label}</span>
                      <svg className="mmenu__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div className="mmenu__foot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45, ease }}>
              <CTA block onClick={close}>{copy.nav.cta}</CTA>
              <a className="mmenu__mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
