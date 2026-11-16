"use client";

import { forwardRef, useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copy, FORM_ENDPOINT, EMAIL } from "@/lib/content";
import { CTA } from "./ui";

gsap.registerPlugin(ScrollTrigger);
const ease = [0.2, 0.8, 0.2, 1] as const;
type Status = "idle" | "sending" | "ok" | "err";

export const Book = forwardRef<HTMLElement>(function Book(_, ref) {
  const b = copy.book;
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const get = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;
    if (get("company_site")?.value) return; // bot

    const bad: Record<string, boolean> = {};
    for (const fd of b.fields) {
      const el = get(fd.name);
      if (!el || !el.value.trim() || !el.checkValidity()) bad[fd.name] = true;
    }
    setInvalid(bad);
    const first = b.fields.find((fd) => bad[fd.name]);
    if (first) { get(first.name)?.focus(); return; }

    const data: Record<string, string> = {};
    for (const fd of b.fields) data[fd.name] = get(fd.name)?.value.trim() ?? "";
    data.page = window.location.href;
    data.submitted_at = new Date().toISOString();

    setStatus("sending");
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new URLSearchParams(data) });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        console.info("[Truepose demo mode] submission:", data);
        await new Promise((r) => setTimeout(r, 600));
      }
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  return (
    <section className="section book" id="book" aria-labelledby="book-title" ref={ref}>
      <div className="wrap book__grid">
        <div className="book__copy">
          <p className="eyebrow eyebrow--ink" data-extra>{b.eyebrow.text}</p>
          <h2 className="h2 h2--xl" data-decrypt id="book-title">{b.heading}</h2>
          <p className="book__text">{b.textBefore}<strong>{b.textStrong}</strong>{b.textAfter}</p>
        </div>

        <div className="form-wrap">
          <AnimatePresence mode="wait" initial={false}>
            {status !== "ok" ? (
              <motion.form key="form" ref={formRef} className="form" noValidate onSubmit={onSubmit}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                {b.fields.map((fd) => (
                  <div className="field" key={fd.id}>
                    <label htmlFor={fd.id}>{fd.label}</label>
                    <input id={fd.id} name={fd.name} type={fd.type} autoComplete={fd.autoComplete}
                      inputMode={"inputMode" in fd ? fd.inputMode : undefined}
                      pattern={"pattern" in fd ? fd.pattern : undefined} required
                      aria-invalid={invalid[fd.name] ? true : undefined}
                      onInput={() => { if (invalid[fd.name]) setInvalid((s) => ({ ...s, [fd.name]: false })); }} />
                  </div>
                ))}
                <input className="hp" type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <CTA type="submit" block className={status === "sending" ? "is-sending" : ""}>{b.cta}</CTA>
                <p className="form__status" role="status" aria-live="polite">{status === "err" ? b.err : ""}</p>
              </motion.form>
            ) : (
              <motion.div key="ok" className="form form--ok" role="status"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }}>
                <svg className="okmark" viewBox="0 0 64 64" aria-hidden="true">
                  <motion.circle cx="32" cy="32" r="28" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease }} />
                  <motion.path d="M20 33l8 8 16 -18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease }} />
                </svg>
                <p className="form__ok">{b.ok}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

/* Footer: the wordmark rises out of the page as you reach the end (GSAP scrub) */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".footer__big span", { yPercent: 55 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer" ref={ref}>
      <div className="wrap">
        <p className="footer__line">
          {copy.footer.items.map((t) => <span key={t}>{t}</span>)}
          <a href={`mailto:${EMAIL}`} data-scramble>{EMAIL}</a>
        </p>
        <p className="footer__legal">{copy.footer.legal}</p>
      </div>
      <div className="footer__big" aria-hidden="true"><span>Truepose</span></div>
    </footer>
  );
}

export function StickyCTA({ visible }: { visible: boolean }) {
  return (
    <motion.div className="sticky-cta" aria-hidden={!visible}
      initial={false} animate={{ y: visible ? "0%" : "130%" }} transition={{ duration: 0.3, ease }}>
      <CTA block tabIndex={visible ? 0 : -1}>{copy.nav.cta}</CTA>
    </motion.div>
  );
}
