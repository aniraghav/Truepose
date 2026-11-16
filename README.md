# Truepose website

Single page site. Next.js 14 (App Router, static export) + TypeScript strict + Tailwind 3.4,
Framer Motion 11, GSAP 3.12 ScrollTrigger, Lenis smooth scroll, Three.js r169 via react-three-fiber.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build      # static site in ./out (upload anywhere: Vercel, Netlify, S3)
    npm run typecheck

## Where things are
- lib/content.ts      ALL website text, the form endpoint and the email. Edit copy here only.
- components/         One file per part of the page (Hero, HowItWorks, Sections, Book, ...)
- components/HeroScene.tsx   3D goniometer (Three.js). Falls back to components/Dial.tsx (SVG)
                             for reduced motion or devices without WebGL.
- components/ui.tsx   Logo placeholder (swap for the final logo here), icons, buttons.
- app/globals.css     Styles. Colour tokens at the top; tailwind.config.ts maps them into Tailwind.
- COPY-REVIEW.md      Lines added beyond the client brief, for approval. Preview without them: ?copy=client
- v1-static/          The first plain HTML version, kept for reference.

## Before launch
- Set FORM_ENDPOINT in lib/content.ts (Formspree or Google Apps Script). Empty = demo mode, nothing is saved.
- Check the domain in app/layout.tsx (SITE) so the WhatsApp preview image resolves.
