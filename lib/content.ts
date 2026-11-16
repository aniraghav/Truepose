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
    /* Sample member report, taken from the client's Truepose_Sample_Report.pdf (made up member). */
    sample: {
      tag: "Sample report",
      tagNote: "Not a real member",
      greeting: "Hi Priya, here's your",
      greetingHl: "starting point.",
      sub: "Whatever your goal, get strong on the way there.",
      meta: ["Checked on 16 Nov 2026", "Goal: Get stronger", "Trains 3 days a week"],

      glanceTitle: "Your plan at a glance",
      glance: [
        { k: "Training days", v: "3 a week" },
        { k: "Plan type", v: "Full body" },
        { k: "Each muscle", v: "3 times a week" },
        { k: "Cardio", v: "1 to 2 sessions" },
      ],

      moveTitle: "How you move",
      moves: [
        {
          name: "Ankle bend (knee to wall)", status: "Work on right side", tone: "work",
          value: "Left 10.5 cm · Right 8.2 cm",
          note: "Usual range about 9 to 11 cm. A gap over 1.5 cm between sides is worth fixing.",
          bars: { max: 13, band: [9, 11], vals: [{ k: "L", v: 10.5 }, { k: "R", v: 8.2, flag: true }] },
        },
        {
          name: "Squat to a bench", status: "Fine", tone: "ok",
          value: "Reached the bench with control, 5 of 5 reps",
          note: "Good depth for building leg strength safely.",
          bars: { max: 5, vals: [{ k: "Reps", v: 5 }] },
        },
        {
          name: "Single leg balance", status: "Work on right side", tone: "work",
          value: "Left 45 s · Right 31 s",
          note: "Average for ages 18 to 39 is about 45 s, eyes open.",
          bars: { max: 60, avg: 45, vals: [{ k: "L", v: 45 }, { k: "R", v: 31, flag: true }] },
        },
        {
          name: "30 second chair stand", status: "Room to grow", tone: "grow",
          value: "27 full stands",
          note: "Average for ages 18 to 35 is about 33. This is your leg strength baseline.",
          bars: { max: 40, avg: 33, vals: [{ k: "Now", v: 27, flag: true }] },
        },
      ],

      startTitle: "Where to start",
      start: [
        { b: "Right ankle:", t: "calf stretch against a wall, knee straight then bent. 3 holds of 30 s, right side first, on training days." },
        { b: "Right leg balance:", t: "stand on one leg while brushing your teeth. 3 × 30 s." },
        { b: "Leg strength:", t: "already built into every session below." },
      ],
      whyTitle: "Why this plan",
      why: [
        "Full body 3 times a week suits someone getting back into training.",
        "Each muscle is worked at least twice a week, so you build strength steadily.",
        "Heavier sets of 6 to 8 reps build strength. Start lighter and add weight slowly.",
      ],

      weekTitle: "Your week",
      busy: "If busy:",
      days: [
        { d: "Day 1", w: "Mon", ex: [
          ["Goblet squat", "2 × 6 to 8", "leg press"],
          ["Dumbbell bench press", "2 × 6 to 8", "chest press machine"],
          ["Seated cable row", "2 × 6 to 8", "one arm dumbbell row"],
          ["Dumbbell shoulder press", "2 × 6 to 8", "shoulder press machine"],
          ["Dumbbell curl", "1 × 6 to 8", "cable curl"],
          ["Plank", "1 × 20 to 30 s", "dead bug on a mat"],
        ] },
        { d: "Day 2", w: "Wed", ex: [
          ["Leg press", "2 × 6 to 8", "goblet squat"],
          ["Chest press machine", "2 × 6 to 8", "push up on a bench"],
          ["Lat pulldown", "2 × 6 to 8", "seated cable row"],
          ["Lateral raise", "2 × 6 to 8", "cable lateral raise"],
          ["Cable triceps pushdown", "1 × 6 to 8", "bench dips"],
          ["Dead bug", "1 × 8 each side", "plank"],
        ] },
        { d: "Day 3", w: "Fri", ex: [
          ["Romanian deadlift", "2 × 6 to 8", "leg curl machine"],
          ["Incline dumbbell press", "2 × 6 to 8", "chest press machine"],
          ["One arm dumbbell row", "2 × 6 to 8", "lat pulldown"],
          ["Machine shoulder press", "2 × 6 to 8", "dumbbell shoulder press"],
          ["Hammer curl", "1 × 6 to 8", "cable curl"],
          ["Side plank", "1 × 20 s each side", "plank"],
        ] },
      ],

      targetsTitle: "Your weekly targets",
      targets: [
        { b: "Legs, chest, back, shoulders:", t: "3 times a week, 6 sets in total each." },
        { b: "Arms and core:", t: "3 times a week, 3 sets in total each." },
        { b: "Cardio:", t: "1 to 2 easy sessions, like a brisk walk or cycle." },
      ],
      targetsSource: "Based on ACSM guidance for beginners, WHO physical activity guidelines and training frequency research.",
      knowTitle: "Good to know",
      know: [
        "Start each lift with a weight you could lift about 12 times, and learn the movement first.",
        "Stop any exercise that causes pain, and tell your trainer.",
      ],
      retestLabel: "Your retest",
      retestDate: "14 Dec 2026",
      retestText: "We'll repeat the check and show you what improved.",
      footnote: "Sample report with made up details.",
    },
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
