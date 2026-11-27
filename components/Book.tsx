"use client";

import { forwardRef, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { copy } from "@/lib/content";
import { NAME_MAX, NAME_MIN, normalisePhone, stripFormula } from "@/lib/booking";
import { CTA } from "./ui";

const ease = [0.2, 0.8, 0.2, 1] as const;
type Status = "idle" | "sending" | "ok" | "err";

export const Book = forwardRef<HTMLElement>(function Book(_, ref) {
  const b = copy.book;
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || status === "sending") return;
    const get = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;
    const val = (name: string) => get(name)?.value.trim() ?? "";

    // Quick checks in the browser; the server checks again and has the final say.
    const bad: Record<string, boolean> = {};
    for (const n of ["name", "gym"]) {
      const len = stripFormula(val(n)).length;
      if (len < NAME_MIN || len > NAME_MAX) bad[n] = true;
    }
    if (!normalisePhone(val("phone"))) bad.phone = true;
    if (!get("consent")?.checked) bad.consent = true;
    setInvalid(bad);
    const first = ["name", "gym", "phone", "consent"].find((n) => bad[n]);
    if (first) { setErrMsg(""); setStatus("idle"); get(first)?.focus(); return; }

    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: val("name"), gym: val("gym"), phone: val("phone"),
          consent: true, company_site: get("company_site")?.value ?? "",
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; field?: string; error?: string } | null;
      if (res.ok && data?.ok) { setStatus("ok"); return; }
      // 400 and 429 carry a plain message meant for the visitor; anything else gets the email fallback.
      if ((res.status === 400 || res.status === 413 || res.status === 429) && data?.error) {
        if (data.field) { setInvalid({ [data.field]: true }); get(data.field)?.focus(); }
        setErrMsg(data.error);
      } else {
        setErrMsg(b.err);
      }
      setStatus("err");
    } catch {
      setErrMsg(b.err);
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
                      maxLength={fd.name === "phone" ? 20 : NAME_MAX} required
                      aria-invalid={invalid[fd.name] ? true : undefined}
                      onInput={() => { if (invalid[fd.name]) setInvalid((s) => ({ ...s, [fd.name]: false })); }} />
                  </div>
                ))}
                <label className="consent" htmlFor="f-consent">
                  <input id="f-consent" name="consent" type="checkbox" required
                    aria-invalid={invalid.consent ? true : undefined}
                    onChange={() => { if (invalid.consent) setInvalid((s) => ({ ...s, consent: false })); }} />
                  <span>{b.consent}</span>
                </label>
                <input className="hp" type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <CTA type="submit" block className={status === "sending" ? "is-sending" : ""}>{b.cta}</CTA>
                <p className="form__status" role="status" aria-live="polite">{status === "err" ? errMsg : ""}</p>
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

export function StickyCTA({ visible }: { visible: boolean }) {
  return (
    <motion.div className="sticky-cta" aria-hidden={!visible}
      initial={false} animate={{ y: visible ? "0%" : "130%" }} transition={{ duration: 0.3, ease }}>
      <CTA block tabIndex={visible ? 0 : -1}>{copy.nav.cta}</CTA>
    </motion.div>
  );
}
