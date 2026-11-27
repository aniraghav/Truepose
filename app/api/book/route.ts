/*
  POST /api/book  — receives the booking form and forwards it to the
  Google Apps Script web address in BOOKING_SHEET_URL.

  Privacy: never log name, gym, phone, the token or the URL. The only log
  lines are "booking: ok" and "booking: failed".
*/
import { checkBooking } from "@/lib/booking";
import { EMAIL } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2048;
const TIMEOUT_MS = 8000;
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

const MSG_OK = "Thanks, we'll be in touch.";
const MSG_FAIL = `Sorry, that didn't go through. Please email ${EMAIL}.`;
const MSG_LIMIT = `Too many tries from here. Please try again later or email ${EMAIL}.`;
const MSG_BIG = "That was too long. Please shorten your details.";
const MSG_BAD = "Please fill in the form.";

/*
  Rate limit: 5 accepted submissions per address per hour.
  Best effort only: the counts live in this server instance's memory, so
  each Vercel instance (and each cold start) keeps its own count.
*/
const hits = new Map<string, number[]>();

function overLimit(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, ts] of hits) if (ts.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

function clientIp(req: Request): string {
  // On Vercel, x-forwarded-for is set by the platform; the first entry is the visitor.
  const fwd = req.headers.get("x-forwarded-for");
  const first = fwd?.split(",")[0]?.trim();
  if (first) return first;
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function sendToSheet(entry: { name: string; gym: string; phone: string }): Promise<boolean> {
  const url = process.env.BOOKING_SHEET_URL;
  const token = process.env.BOOKING_SHEET_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: entry.name, gym: entry.gym, phone: entry.phone, agreed: true }),
      redirect: "follow", // Apps Script answers POST with a 302 to the result page
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return false;
    // Apps Script reports script errors as a 200 HTML page, so require {"ok":true}.
    const data = (await res.json().catch(() => null)) as { ok?: unknown } | null;
    return data?.ok === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) return reply(413, { ok: false, error: MSG_BIG });

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return reply(400, { ok: false, error: MSG_BAD });
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) return reply(413, { ok: false, error: MSG_BIG });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: MSG_BAD });
  }

  // Trap field: a person never sees it. If filled, pretend it worked and send nothing.
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const trap = (body as Record<string, unknown>).company_site;
    if (trap !== undefined && trap !== "") return reply(200, { ok: true, message: MSG_OK });
  }

  const checked = checkBooking(body);
  if (!checked.ok) return reply(400, { ok: false, field: checked.field, error: checked.error });

  if (overLimit(clientIp(req), Date.now())) return reply(429, { ok: false, error: MSG_LIMIT });

  const sent = await sendToSheet(checked.value);
  if (!sent) {
    console.error("booking: failed");
    return reply(502, { ok: false, error: MSG_FAIL });
  }
  console.log("booking: ok");
  return reply(200, { ok: true, message: MSG_OK });
}
