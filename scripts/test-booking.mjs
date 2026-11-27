// End to end tests for POST /api/book.
// Starts a fake Apps Script endpoint (answers POST with a 302, like Google does),
// runs the built site with `next start` pointed at it, and checks what arrives.
// Run with: npm run test:booking   (builds first)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TOKEN = "test-token-7f3a9c";
const SITE_PORT = 3917;
const EMAIL_MSG = "Sorry, that didn't go through. Please email contact@truepose.ai.";
const OK_MSG = "Thanks, we'll be in touch.";

// Values that must never show up in the server logs.
const SECRET_VALUES = ["Asha Tester", "Test Studio", "9876543210", "98765 43210", "Spam Bot", "Rate Tester", "HYPERLINK", TOKEN];

let mode = "ok"; // ok | fail500 | html200 | hang
let received = [];
let fake, site, logPath, fakeUrl;

before(async () => {
  fake = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/exec") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        received.push({ contentType: req.headers["content-type"], body: JSON.parse(body) });
        if (mode === "hang") return; // never answer
        res.writeHead(302, { Location: "/result" }).end();
      });
      return;
    }
    if (req.method === "GET" && req.url === "/result") {
      if (mode === "fail500") return res.writeHead(500).end("boom");
      if (mode === "html200") return res.writeHead(200, { "Content-Type": "text/html" }).end("<html>Script error</html>");
      return res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
    }
    res.writeHead(404).end();
  });
  await new Promise((r) => fake.listen(0, "127.0.0.1", r));
  fakeUrl = `http://127.0.0.1:${fake.address().port}/exec`;

  logPath = join(mkdtempSync(join(tmpdir(), "booking-test-")), "server.log");
  const log = createWriteStream(logPath);
  site = spawn("npx", ["next", "start", "-p", String(SITE_PORT)], {
    env: { ...process.env, BOOKING_SHEET_URL: fakeUrl, BOOKING_SHEET_TOKEN: TOKEN },
    stdio: ["ignore", "pipe", "pipe"],
  });
  site.stdout.pipe(log);
  site.stderr.pipe(log);
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${SITE_PORT}/`); return; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  throw new Error("site did not start");
});

after(async () => {
  site?.kill();
  fake?.close();
});

let ipCounter = 1;
function post(body, { ip = `10.0.0.${ipCounter++}`, raw } = {}) {
  return fetch(`http://127.0.0.1:${SITE_PORT}/api/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: raw ?? JSON.stringify(body),
  }).then(async (res) => ({ status: res.status, json: await res.json() }));
}

const valid = { name: "Asha Tester", gym: "Test Studio", phone: "98765 43210", consent: true, company_site: "" };

test("valid entry sends the right JSON through the redirect", async () => {
  mode = "ok"; received = [];
  const r = await post(valid);
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true, message: OK_MSG });
  assert.equal(received.length, 1);
  assert.equal(received[0].contentType, "application/json");
  assert.deepEqual(received[0].body, { token: TOKEN, name: "Asha Tester", gym: "Test Studio", phone: "+919876543210", agreed: true });
});

test("phone with +91 or 0 in front is stored as +91 and 10 digits", async () => {
  mode = "ok"; received = [];
  assert.equal((await post({ ...valid, phone: "+91 9876543210" })).status, 200);
  assert.equal((await post({ ...valid, phone: "09876543210" })).status, 200);
  assert.deepEqual(received.map((x) => x.body.phone), ["+919876543210", "+919876543210"]);
});

test("bad phone numbers are refused", async () => {
  received = [];
  for (const phone of ["12345", "5876543210", "98765432101", "+1 9876543210", "919876543210", "98765-43210", "abcdefghij", ""]) {
    const r = await post({ ...valid, phone });
    assert.equal(r.status, 400, phone);
    assert.equal(r.json.field, "phone");
    assert.equal(r.json.error, "Please enter a 10 digit Indian mobile number.");
  }
  assert.equal(received.length, 0);
});

test("missing or false consent is refused", async () => {
  received = [];
  const { consent, ...noConsent } = valid;
  for (const body of [noConsent, { ...valid, consent: false }, { ...valid, consent: "true" }]) {
    const r = await post(body);
    assert.equal(r.status, 400);
    assert.equal(r.json.field, "consent");
  }
  assert.equal(received.length, 0);
});

test("too long and too short name or gym are refused", async () => {
  received = [];
  for (const body of [{ ...valid, name: "A".repeat(81) }, { ...valid, name: "A" }, { ...valid, gym: "G".repeat(81) }, { ...valid, gym: " " }]) {
    const r = await post(body);
    assert.equal(r.status, 400);
  }
  assert.equal((await post({ ...valid, name: "A".repeat(80) })).status, 200); // 80 is fine
  assert.equal(received.length, 1);
});

test("unknown fields, wrong types and broken JSON are refused", async () => {
  received = [];
  assert.equal((await post({ ...valid, email: "x@example.com" })).status, 400);
  assert.equal((await post({ ...valid, name: 42 })).status, 400);
  assert.equal((await post({ ...valid, name: "Asha\nTester" })).status, 400);
  assert.equal((await post(null, { raw: "{not json" })).status, 400);
  assert.equal((await post([valid])).status, 400);
  assert.equal(received.length, 0);
});

test("body over 2 KB is refused", async () => {
  received = [];
  const r = await post(null, { raw: JSON.stringify({ ...valid, name: "A".repeat(2100) }) });
  assert.equal(r.status, 413);
  assert.equal(received.length, 0);
});

test("trap field filled: success shown, nothing sent", async () => {
  mode = "ok"; received = [];
  const r = await post({ ...valid, name: "Spam Bot", company_site: "http://spam.example" });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true, message: OK_MSG });
  assert.equal(received.length, 0);
});

test("6th submission in an hour from one address is refused", async () => {
  mode = "ok"; received = [];
  for (let i = 0; i < 5; i++) assert.equal((await post({ ...valid, name: "Rate Tester" }, { ip: "10.9.9.9" })).status, 200);
  const sixth = await post({ ...valid, name: "Rate Tester" }, { ip: "10.9.9.9" });
  assert.equal(sixth.status, 429);
  assert.match(sixth.json.error, /contact@truepose\.ai/);
  assert.equal(received.length, 5);
  assert.equal((await post({ ...valid, name: "Rate Tester" }, { ip: "10.9.9.10" })).status, 200); // other address still fine
});

test('"=HYPERLINK(...)" as a name arrives without the leading "="', async () => {
  mode = "ok"; received = [];
  const r = await post({ ...valid, name: '=HYPERLINK("http://evil.example","click")', gym: "+@-=Test Studio" });
  assert.equal(r.status, 200);
  assert.equal(received[0].body.name, 'HYPERLINK("http://evil.example","click")');
  assert.equal(received[0].body.gym, "Test Studio");
});

test("sheet failure (500, script error page, timeout) shows the email message", async () => {
  for (const m of ["fail500", "html200"]) {
    mode = m;
    const r = await post(valid);
    assert.equal(r.status, 502, m);
    assert.deepEqual(r.json, { ok: false, error: EMAIL_MSG });
  }
  mode = "hang";
  const t0 = Date.now();
  const r = await post(valid);
  const secs = (Date.now() - t0) / 1000;
  assert.equal(r.status, 502);
  assert.deepEqual(r.json, { ok: false, error: EMAIL_MSG });
  assert.ok(secs >= 7.5 && secs < 11, `timed out after ${secs}s`);
  mode = "ok";
});

test("logs hold only booking: ok / booking: failed, never name, gym, phone or token", async () => {
  await new Promise((r) => setTimeout(r, 300)); // let the log stream flush
  const log = readFileSync(logPath, "utf8");
  console.log("---- server log ----\n" + log + "---- end log ----");
  for (const v of SECRET_VALUES) assert.ok(!log.includes(v), `log contains ${v}`);
  assert.ok(!log.includes(fakeUrl), "log contains the sheet URL");
  const bookingLines = log.split("\n").filter((l) => l.includes("booking"));
  assert.ok(bookingLines.length > 0);
  for (const l of bookingLines) assert.match(l.trim(), /^booking: (ok|failed)$/);
});
