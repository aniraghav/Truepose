import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Archivo with its width axis: set very condensed for the big display type */
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
/* Utility face for HUD details: loader labels, counter, clock, coordinates */
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const SITE = "https://truepose.ai"; // update if the domain changes

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Truepose",
  description: "A quick check shows each member what to work on first, even without a trainer.",
  icons: { icon: "/assets/favicon.svg" },
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
  themeColor: "#0f141b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* ?copy=client hides every line that is not in the client brief (see COPY-REVIEW.md) */
/* ?accent=corporate|neon|green (or #corporate, #neon, #green) shows alternative palettes for comparison */
/* Same switches also work as #green / #client-copy (for hosts that strip query strings) */
const clientCopyScript = `try{var q=new URLSearchParams(location.search),h=location.hash,d=document.documentElement;if(q.get("copy")==="client"||h==="#client-copy")d.classList.add("client-copy");var a=q.get("accent")||h.slice(1);if(a==="green"||a==="neon"||a==="corporate")d.classList.add("accent-"+a)}catch(e){}`;

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
