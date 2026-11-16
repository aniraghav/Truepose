import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* Fonts are bundled in app/fonts (Latin subsets from Fontsource 5.3.0, SIL Open Font License) instead of
   next/font/google, so builds never depend on downloading from Google Fonts at build time. */

/* Archivo variable (weight + width axes): set very condensed for the big display type */
const display = localFont({
  src: "./fonts/archivo-wdth.woff2",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-display",
  display: "swap",
});
const body = localFont({ src: "./fonts/inter-wght.woff2", weight: "100 900", variable: "--font-body", display: "swap" });
/* Utility face for small labels: loader, counters, figure readings */
const mono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const SITE = "https://truepose.ai"; // update if the domain changes

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Truepose",
  description: "A quick check shows each member what to work on first, even without a trainer.",
  icons: { icon: "/assets/logo-mark-dark.png" },
  openGraph: {
    type: "website",
    siteName: "Truepose",
    title: "Truepose",
    description: "Most members never get a trainer. We give every one of them a starting point.",
    url: SITE,
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#121412",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* ?copy=client hides every line that is not in the client brief (see COPY-REVIEW.md) */
/* Also works as #client-copy (for hosts that strip query strings) */
const clientCopyScript = `try{var q=new URLSearchParams(location.search),h=location.hash,d=document.documentElement;if(q.get("copy")==="client"||h==="#client-copy")d.classList.add("client-copy")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: clientCopyScript }} />
        <noscript><style>{`.preloader{display:none!important}`}</style></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
