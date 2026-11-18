"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { copy } from "@/lib/content";
import { useIntro } from "./Intro";
import { CTA, Icon } from "./ui";

/* Hero: headline, line, actions and facts on the left,
   the client supplied runner photo on the right, on a backdrop matched to the photo.
   Desktop: the photo sits in the right two thirds, running toward the headline.
   Mobile: the photo stacks under the text. */

const ease = [0.2, 0.8, 0.2, 1] as const;

const HeroPhoto = forwardRef<HTMLElement>(function HeroPhoto(_, ref) {
  const h = copy.hero;
  const { ready } = useIntro();
  const rise = (d: number) => ({
    initial: { y: "105%" },
    animate: { y: ready ? "0%" : "105%" },
    transition: { delay: d, duration: 1, ease },
  });
  const fade = (d: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { delay: d, duration: 0.7, ease },
  });

  return (
    <section className="phero" ref={ref}>
      <div className="wrap phero__grid">
        <div className="phero__copy">
          <h1 className="phero__title">
            <span className="phmask"><motion.span className="phero__l1" {...rise(0.05)}>{h.lead}</motion.span></span>{" "}
            <span className="phmask"><motion.span className="phero__l2" {...rise(0.2)}>{h.highlight}</motion.span></span>
          </h1>
          <motion.p className="phero__line" {...fade(0.45)}>{h.line}</motion.p>
          <motion.div className="phero__actions" {...fade(0.55)}>
            <CTA>{h.cta}</CTA>
            <a className="phlink" href="#how"><span data-scramble>{h.secondary}</span> <Icon name="down" /></a>
          </motion.div>
          <motion.ul className="phero__facts" data-extra {...fade(0.7)}>
            {h.facts.items.map((f) => (
              <li key={f.strong}><strong>{f.strong}</strong><span>{f.text}</span></li>
            ))}
          </motion.ul>
        </div>
      </div>

      <motion.div className="phero__media" aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }} animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
        transition={{ duration: 1.4, ease, delay: 0.15 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="phero__img" src="/assets/hero-run-1218.webp"
          srcSet="/assets/hero-run-960.webp 960w, /assets/hero-run-1218.webp 1218w" sizes="(min-width: 900px) 66vw, 100vw"
          width={1218} height={864} alt="" fetchPriority="high" decoding="async" />
        <i className="phero__shade" />
      </motion.div>
    </section>
  );
});

export default HeroPhoto;
