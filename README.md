# Truepose website

Single page site (Draft 4: dark grey and light neon green).
Next.js 14 (App Router, static export) + TypeScript strict + Tailwind 3.4,
Framer Motion 11, GSAP 3.12 ScrollTrigger, Lenis smooth scroll.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build      # static site in ./out (upload anywhere: Vercel, Netlify, S3)
    npm run typecheck

## Where things are
- lib/content.ts           ALL website text, the form endpoint and the email. Edit copy here only.
- components/Draft4.tsx    The page: loader, number band, Why gyms use it cards, FAQ, footer, and the layout of every section.
- components/HeroPhoto.tsx Hero: headline on the left, client photo on the right (stacks on mobile).
- components/HowItWorks.tsx  Auto playing scan of the figure: Check, Measure, Report.
- components/Sections.tsx  The report with sample metrics, What we measure, What we don't claim.
- components/Book.tsx      Booking form and the sticky mobile button.
- components/ui.tsx        Logo, icons, buttons.
- public/assets/           Logo (light and dark tones), hero photo (960 and 1672 wide), share image.
- app/globals.css          Styles. Draft 4 colour tokens are in ":root:has(.page-draft4)".
- COPY-REVIEW.md           Lines added beyond the client brief, for approval. Preview without them: ?copy=client

Earlier design drafts (1 to 3) are in the git history (first commit).

## Before launch
- Set FORM_ENDPOINT in lib/content.ts (Formspree or Google Apps Script). Empty = demo mode, nothing is saved.
- Check the domain in app/layout.tsx (SITE) so the WhatsApp preview image resolves.
- public/assets/og-image.png still uses the earlier navy and sky blue colours; replace it with a Draft 4 version.
