/* Text "decrypt" effect: characters cycle through measurement glyphs, then resolve
   left to right into the real text. Mutates the existing text node (not textContent),
   so React keeps ownership of the DOM. Glyphs avoid hyphens and dashes (client brief). */

const GLYPHS = "0123456789#+/<>°";
const running = new WeakMap<HTMLElement, number>();

function textNodeOf(el: HTMLElement): Text | null {
  for (const n of Array.from(el.childNodes)) if (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim()) return n as Text;
  return null;
}

export function scramble(el: HTMLElement, { duration = 600, lockWidth = false } = {}) {
  const node = textNodeOf(el);
  if (!node) return;
  const final = el.dataset.scrambleText ?? node.nodeValue ?? "";
  el.dataset.scrambleText = final;
  if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", final.trim());

  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  if (lockWidth) el.style.minWidth = `${el.getBoundingClientRect().width}px`;

  const start = performance.now();
  const len = final.length;
  let lastSwap = 0;

  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    if (now - lastSwap > 28 || p === 1) {
      lastSwap = now;
      const reveal = Math.floor(len * p);
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = final[i] ?? "";
        out += i < reveal || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.nodeValue = out;
    }
    if (p < 1) running.set(el, requestAnimationFrame(tick));
    else {
      node.nodeValue = final;
      running.delete(el);
      if (lockWidth) el.style.minWidth = "";
    }
  };
  running.set(el, requestAnimationFrame(tick));
}
