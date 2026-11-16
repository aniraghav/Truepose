/*
  ALL WEBSITE TEXT LIVES HERE.
  Text marked `extra: true` is NOT in the client brief. It is listed in
  COPY-REVIEW.md for approval and is hidden when the page is opened with
  ?copy=client at the end of the address.
  Rule from the brief: no hyphens or dashes in visible text.
*/

export type Extra = { text: string; extra?: boolean };
export type IconName = "arrow" | "down" | "clock" | "browser" | "repeat" | "check" | "plus";

/* Paste the form endpoint here once the client decides (Formspree or Google Apps Script /exec URL).
   Empty = demo mode: the form shows success and logs the data to the console. */
export const FORM_ENDPOINT = "";

export const EMAIL = "anisha@truepose.ai";

export const copy = {
  nav: {
    links: [
      /* Labels reuse the section headings from the brief */
      { label: "How it works", href: "#how" },
      { label: "What your member gets", href: "#report" },
      { label: "Why gyms use it", href: "#why" },
      { label: "What we measure", href: "#measure" },
      { label: "FAQ", href: "#faq" },
    ],
    menuLabel: "Menu", // extra copy, pending approval
    cta: "Book a free assessment",
  },

  hero: {
    eyebrow: { text: "Clarity for every member.", extra: true } as Extra,
    lead: "Most members never get a trainer.",
    main: "We give every one of them a",
    highlight: "starting point.",
    line: "A quick check shows each member what to work on first, even without a trainer.",
    cta: "Book a free assessment",
    secondary: "How it works",
    facts: {
      extra: true,
      items: [
        { icon: "clock" as IconName, strong: "A few minutes", text: "per member" },
        { icon: "repeat" as IconName, strong: "4 weeks", text: "to a retest" },
      ],
    },
  },

  marquee: { extra: true, words: ["Check", "Measure", "Report"] },

  how: {
    heading: "How it works",
    steps: [
      { title: "Check:", text: "a few simple tests, guided on a phone." },
      { title: "Measure:", text: "how they move, both sides." },
      { title: "Report:", text: "the member keeps it and knows where to start." },
    ],
  },

  report: {
    heading: "What your member gets",
    lead: "One page.",
    text: "What's fine, what to work on, where to start.",
    labels: ["What's fine", "What to work on", "Where to start"] as const,
    /* EXTRA (requested by the design lead, needs client approval). Dummy values for illustration. */
    metricsTag: "Sample report",
    metricsNote: "Change since last check",
    metrics: [
      { name: "Body fat ratio", value: "21.8", unit: "%", delta: 0.9, dir: "down", min: 5, max: 40, lo: 14, hi: 24, at: 21.8, trend: [23.4, 22.9, 22.3, 21.8] },
      { name: "BMI", value: "23.4", unit: "kg/m²", delta: 0.3, dir: "down", min: 15, max: 35, lo: 18.5, hi: 25, at: 23.4 },
      { name: "Muscle rate", value: "42.6", unit: "%", delta: 0.7, dir: "up", min: 25, max: 55, lo: 36, hi: 46, at: 42.6 },
      { name: "Body water", value: "55.1", unit: "%", delta: 0.4, dir: "up", min: 40, max: 70, lo: 50, hi: 65, at: 55.1 },
      { name: "Bone mass", value: "2.9", unit: "kg", delta: 0, dir: "same", min: 1.5, max: 4.5, lo: 2.5, hi: 3.5, at: 2.9 },
      { name: "BMR", value: "1,612", unit: "kcal", delta: 18, dir: "up", min: 1000, max: 2400, lo: 1400, hi: 1900, at: 1612 },
      { name: "Visceral fat", value: "8", unit: "level", delta: 1, dir: "down", min: 1, max: 20, lo: 1, hi: 9, at: 8 },
    ] as const,
  },

  why: {
    heading: "Why gyms use it",
    points: [
      "Every new member gets a clear plan from day one.",
      "A retest at 4 weeks shows members their progress.",
      "Your staff get an easy reason to check in with members.",
      "It works alongside your InBody and your trainers, not instead of them.",
    ],
  },

  measure: {
    heading: "What we measure",
    sentence: "We measure flexibility and mobility through a few simple exercises.",
    highlight: ["flexibility", "mobility"],
  },

  claims: {
    heading: "What we don't claim",
    points: [
      "We don't diagnose or treat anything.",
      "We only judge what has a clear standard behind it.",
      "If something hurts, see a physiotherapist.",
    ],
  },

  faq: {
    heading: "FAQ",
    items: [
      { q: "How long does it take?", a: "A few minutes per member." },
      { q: "Who runs the check?", a: "Our team, or your staff after a short walkthrough." },
      { q: "Is anyone filmed?", a: "No. Nothing is filmed or recorded." },
      { q: "Who sees the results?", a: "The member and your gym. We never sell anyone's data." },
      { q: "Do members need to install an app?", a: "No. It runs in the phone's browser." },
      { q: "Is this medical advice?", a: "No. It measures movement. For pain, see a physiotherapist." },
      { q: "What does it cost?", a: "Pilot pricing: talk to us." },
    ],
  },

  book: {
    eyebrow: { text: "Free. At your gym.", extra: true } as Extra,
    heading: "Try it at your gym",
    textBefore: "We come to you, measure ",
    textStrong: "3 members for free",
    textAfter: ", and leave the reports with you.",
    fields: [
      { id: "f-name", name: "name", label: "Name", type: "text", autoComplete: "name" },
      { id: "f-gym", name: "gym", label: "Gym", type: "text", autoComplete: "organization" },
      { id: "f-phone", name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel" as const, pattern: "[0-9+() ]{7,20}" },
    ],
    cta: "Book a free assessment",
    ok: "Thank you. We'll call you soon.",            // extra copy, pending approval
    err: `That didn't go through. Please email ${EMAIL}`, // extra copy, pending approval
  },

  footer: {
    items: ["Truepose", "Bengaluru"],
    legal: "Truepose measures movement. It is not a medical device and does not give medical advice.",
  },
};
