/* Reads a colour token from app/globals.css so JS driven visuals (Three.js, GSAP)
   follow the same accent as the CSS. Switch accents with ?accent=green in the address. */
export function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export const accent = () => cssVar("--neon", "#7cc8ff");
