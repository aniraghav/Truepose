# Truepose website

Single page site for Truepose: dark grey with the brand green.
Next.js 14 (App Router, one server route for the form) + TypeScript strict + Tailwind 3.4,
Framer Motion 11, GSAP 3.12 ScrollTrigger, Lenis smooth scroll.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build
    npm run test:booking  # booking form route tests (builds first)
    npm run typecheck

Deployed on Vercel as a Next.js app. The booking form posts to app/api/book/route.ts,
which forwards it to a Google Apps Script web address (see "Booking form" below).

## Where things are
- lib/content.ts             ALL website text and the email. Edit copy here only.
- components/Site.tsx        The page: loader, number band, Why gyms use it cards, FAQ, footer, and the order of every section.
- components/HeroPhoto.tsx   Hero: headline on the left, photo on the right (stacks on mobile).
- components/HowItWorks.tsx  Auto playing scan of the figure: Check, Measure, Report.
- components/Sections.tsx    The member report (sample report), What we measure, What we don't claim.
- components/Book.tsx        Booking form and the sticky mobile button.
- app/api/book/route.ts      Server route for the form: checks, spam limits, sends to the sheet.
- lib/booking.ts             Form rules shared by the form and the route.
- components/ui.tsx          Logo, icons, buttons.
- app/fonts/                 Bundled fonts (Archivo, Inter, JetBrains Mono; SIL Open Font License).
- public/assets/             Logo (light and dark tones), hero photo, share image.
- app/globals.css            Styles. Site colour tokens are in ":root:has(.page-site)".
- COPY-REVIEW.md             Lines added beyond the client brief, for approval. Preview without them: ?copy=client

## Before launch
- Set BOOKING_SHEET_URL and BOOKING_SHEET_TOKEN in Vercel (see .env.example). Without them the form shows the email fallback.
- Check the domain in app/layout.tsx (SITE) so the WhatsApp preview image resolves.
- Replace public/assets/og-image.png with a share image in the site colours.

## Booking form
The route sends `{token, name, gym, phone, agreed: true}` as JSON to BOOKING_SHEET_URL
and counts it as saved only if the script answers `{"ok": true}`. Phone arrives as +91 and 10 digits.
Logs only ever say "booking: ok" or "booking: failed".

The 5 per hour limit per visitor address is kept in memory, so it is best effort:
each server instance (and each cold start) has its own count.

A matching Apps Script (Extensions > Apps Script in the sheet, deploy as a web app,
"Execute as: Me", "Who has access: Anyone"; put the token in Project Settings > Script properties as TOKEN):

    function doPost(e) {
      var out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
      try {
        var d = JSON.parse(e.postData.contents);
        if (d.token !== PropertiesService.getScriptProperties().getProperty("TOKEN")) return out({ ok: false });
        SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
          .appendRow([new Date(), String(d.name), String(d.gym), "'" + String(d.phone), d.agreed === true]);
        return out({ ok: true });
      } catch (err) { return out({ ok: false }); }
    }
