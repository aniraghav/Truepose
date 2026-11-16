"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useVelocity, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { copy } from "@/lib/content";

/* Neon band that drifts sideways and speeds up (and flips) with scroll velocity */
export default function Marquee() {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const boost = useTransform(vel, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const track = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (reduce || !track.current) return;
    const b = boost.get();
    if (b < -0.05) dir.current = -1; else if (b > 0.05) dir.current = 1;
    const half = track.current.scrollWidth / 2;
    let next = x.get() - dir.current * 0.045 * delta * Math.max(1, Math.abs(b));
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  const group = Array.from({ length: 4 }).flatMap((_, k) =>
    copy.marquee.words.map((w, i) => (
      <span className="marquee__item" key={`${k}-${i}`}>{w}<i className="marquee__dot" /></span>
    ))
  );

  return (
    <div className="marquee" aria-hidden="true" data-extra>
      <motion.div className="marquee__track" ref={track} style={{ x }}>
        {group}
        {group.map((g, i) => <span key={`b${i}`} className="contents">{g}</span>)}
      </motion.div>
    </div>
  );
}
