"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MotionConfig } from "framer-motion";
import SmoothScroll from "./SmoothScroll";
import { IntroContext } from "./Intro";
import Preloader from "./Preloader";
import Effects from "./Effects";
import BarsCurtain from "./BarsCurtain";
import Header from "./Header";
import HeroPhoto from "./HeroPhoto";
import Marquee from "./Marquee";
import HowItWorks from "./HowItWorks";
import { Report, Why, Measure, Claims, Faq } from "./Sections";
import { Book, Footer, StickyCTA } from "./Book";

/* In view observer with an explicit starting value (avoids a flash of the sticky bar on load) */
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

export default function Site() {
  const heroRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const heroIn = useOnScreen(heroRef, true);
  const bookIn = useOnScreen(bookRef, false, 0.1);
  const [ready, setReady] = useState(false);
  const onReveal = useCallback(() => setReady(true), []);

  return (
    <SmoothScroll>
      <IntroContext.Provider value={{ ready }}>
      <MotionConfig reducedMotion="user">
        <Preloader onReveal={onReveal} />
        <Effects />
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">
          <HeroPhoto ref={heroRef} />
          <Marquee />
          <HowItWorks />
          <Report />
          <Why />
          <BarsCurtain />
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
  );
}
