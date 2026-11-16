# Truepose website

Single page site for Truepose: dark grey with the brand green.
Next.js 14 (App Router, static export) + TypeScript strict + Tailwind 3.4,
Framer Motion 11, GSAP 3.12 ScrollTrigger, Lenis smooth scroll.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build      # static site in ./out
    npm run typecheck

Deployed on Vercel; vercel.json builds the static export and publishes ./out.

## Where things are
- lib/content.ts             ALL website text, the form endpoint and the email. Edit copy here only.
- components/Site.tsx        The page: loader, number band, Why gyms use it cards, FAQ, footer, and the order of every section.
- components/HeroPhoto.tsx   Hero: headline on the left, photo on the right (stacks on mobile).
- components/HowItWorks.tsx  Auto playing scan of the figure: Check, Measure, Report.
- components/Sections.tsx    The member report (sample report), What we measure, What we don't claim.
- components/Book.tsx        Booking form and the sticky mobile button.
- components/ui.tsx          Logo, icons, buttons.
- app/fonts/                 Bundled fonts (Archivo, Inter, JetBrains Mono; SIL Open Font License).
- public/assets/             Logo (light and dark tones), hero photo, share image.
- app/globals.css            Styles. Site colour tokens are in ":root:has(.page-site)".
- COPY-REVIEW.md             Lines added beyond the client brief, for approval. Preview without them: ?copy=client

## Before launch
- Set FORM_ENDPOINT in lib/content.ts (Formspree or Google Apps Script). Empty = demo mode, nothing is saved.
- Check the domain in app/layout.tsx (SITE) so the WhatsApp preview image resolves.
- Replace public/assets/og-image.png with a share image in the site colours.
