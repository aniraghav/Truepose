import type { Config } from "tailwindcss";

/* Truepose theme: dark grey + neon green. Colours map to CSS variables in app/globals.css */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        alt: "var(--bg-alt)",
        surface: "var(--surface)",
        line: "var(--line)",
        ink: "var(--text)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        neon: { DEFAULT: "var(--neon)", ink: "var(--neon-ink)" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { panel: "32px", card: "28px" },
      maxWidth: { site: "1240px" },
      transitionTimingFunction: { out: "cubic-bezier(.2,.8,.2,1)" },
    },
  },
  plugins: [],
};
export default config;
