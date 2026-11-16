"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MotionConfig } from "framer-motion";
import { copy } from "@/lib/content";
import SmoothScroll from "./SmoothScroll";
import { IntroContext } from "./Intro";
import Preloader from "./Preloader";
import Effects from "./Effects";
import Header from "./Header";
import HowItWorks from "./HowItWorks";
import { Report, Measure, Claims, Faq } from "./Sections";
import { Book, Footer, StickyCTA } from "./Book";
import HeroPhoto from "./HeroPhoto";

/* DRAFT 3: off-white, corporate blue. Layout rhythm follows the 3dlook.ai reference
   (split hero with data cards over a figure, stat callouts, dark statistics band, closing CTA band),
   built entirely from Truepose copy and original illustration. */


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

function WhyBand() {
  return (
    <section className="section d3band" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <h2 className="h2" data-decrypt id="why-title">{copy.why.heading}</h2>
        <ol className="d3why">
          {copy.why.points.map((p, i) => (
            <li key={i}><span className="d3why__n" aria-hidden="true">0{i + 1}</span><p>{p}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function SiteDraft3() {
  const heroRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const heroIn = useOnScreen(heroRef, true);
  const bookIn = useOnScreen(bookRef, false, 0.1);
  const [ready, setReady] = useState(false);
  const onReveal = useCallback(() => setReady(true), []);

  return (
    <div className="page-draft3">
      <SmoothScroll>
        <IntroContext.Provider value={{ ready }}>
          <MotionConfig reducedMotion="user">
            <Preloader onReveal={onReveal} />
            <Effects />
            <a className="skip" href="#main">Skip to content</a>
            <Header />
            <main id="main">
              <HeroPhoto ref={heroRef} />
              <WhyBand />
              <HowItWorks />
              <Report />
              <Measure />
              <Claims />
              <Faq />
              <Book ref={bookRef} />
            </main>
            <Footer />
            <StickyCTA visible={ready && !heroIn && !bookIn} />
          </MotionConfig>
        </IntroContext.Provider>
      </SmoothScroll>
    </div>
  );
}
