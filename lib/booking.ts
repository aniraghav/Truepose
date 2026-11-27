/*
  Booking form rules, shared by the form (components/Book.tsx) and the
  server route (app/api/book/route.ts). The server is the one that decides.
*/

export const NAME_MIN = 2;
export const NAME_MAX = 80;

/** Indian mobile: 10 digits starting 6 to 9, optionally +91 or 0 in front. Spaces are ignored. */
const PHONE_RE = /^(?:\+91|0)?([6-9]\d{9})$/;

export type BookingInput = { name: string; gym: string; phone: string };
export type BookingField = "name" | "gym" | "phone" | "consent";
export type Checked =
  | { ok: true; value: BookingInput }
  | { ok: false; field?: BookingField; error: string };

/** Fields the form may send. Anything else is refused. `company_site` is the hidden trap. */
export const ALLOWED_KEYS = ["name", "gym", "phone", "consent", "company_site"] as const;

/**
 * Remove leading characters a spreadsheet would read as a formula
 * (= + - @, plus tabs, returns and spaces between them), so "=HYPERLINK(..)"
 * arrives as plain text.
 */
export function stripFormula(s: string): string {
  return s.replace(/^[=+\-@\s]+/, "");
}

/** Returns "+91" followed by the 10 digits, or null if it is not an Indian mobile number. */
export function normalisePhone(raw: string): string | null {
  const m = raw.replace(/ /g, "").match(PHONE_RE);
  return m ? `+91${m[1]}` : null;
}

// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

function cleanText(v: unknown, label: string, field: BookingField): Checked | string {
  if (typeof v !== "string") return { ok: false, field, error: `Please enter your ${label}.` };
  if (CONTROL_RE.test(v)) return { ok: false, field, error: `Please check your ${label}.` };
  const s = stripFormula(v.trim()).trim();
  if (s.length < NAME_MIN) return { ok: false, field, error: `Please enter your ${label}.` };
  if (s.length > NAME_MAX) return { ok: false, field, error: `Please keep your ${label} under ${NAME_MAX + 1} characters.` };
  return s;
}

/** Validate a parsed body. Does not look at the trap field; the route handles that first. */
export function checkBooking(body: unknown): Checked {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Please fill in the form." };
  }
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => !(ALLOWED_KEYS as readonly string[]).includes(k))) {
    return { ok: false, error: "Please fill in the form." };
  }

  const name = cleanText(b.name, "name", "name");
  if (typeof name !== "string") return name;
  const gym = cleanText(b.gym, "gym name", "gym");
  if (typeof gym !== "string") return gym;

  const phone = typeof b.phone === "string" ? normalisePhone(b.phone.trim()) : null;
  if (!phone) return { ok: false, field: "phone", error: "Please enter a 10 digit Indian mobile number." };

  if (b.consent !== true) return { ok: false, field: "consent", error: "Please tick the box so we can contact you." };

  return { ok: true, value: { name, gym, phone } };
}
