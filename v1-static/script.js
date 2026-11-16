/* Truepose · site behaviour */

/* ---------------------------------------------------------
   FORM CONFIG
   Paste the endpoint once the client picks where leads go:
   - Formspree:     "https://formspree.io/f/XXXXXXX"
   - Google Sheets: the Apps Script web app URL ending in /exec
   Left empty, the form runs in demo mode (logs to console).
   --------------------------------------------------------- */
const FORM_ENDPOINT = "";

/* Messages shown after submit (EXTRA COPY, pending client approval) */
const MSG_OK = "Thank you. We'll call you soon.";
const MSG_ERR = "That didn't go through. Please email anisha@truepose.ai";

(() => {
  const root = document.documentElement;

  /* Preview the page with only the client's verbatim copy: add ?copy=client */
  if (new URLSearchParams(location.search).get("copy") === "client") {
    root.classList.add("client-copy");
  }

  /* Header border on scroll */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const btn = document.querySelector(".menu-btn");
  const list = document.getElementById("nav-list");
  const setMenu = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    list.classList.toggle("is-open", open);
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  list.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
  });

  /* Animate only the two data visuals, once, when they come into view */
  const visuals = document.querySelectorAll(".balance, .sheet");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    visuals.forEach((v) => io.observe(v));
  } else {
    visuals.forEach((v) => v.classList.add("is-in"));
  }

  /* Sticky mobile CTA: show after the hero, hide while the booking section is on screen */
  const sticky = document.querySelector(".sticky-cta");
  const hero = document.querySelector(".hero");
  const book = document.getElementById("book");
  if (sticky && "IntersectionObserver" in window) {
    let pastHero = false, atBook = false;
    const update = () => sticky.classList.toggle("is-visible", pastHero && !atBook);
    new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([en]) => { atBook = en.isIntersecting; update(); }, { threshold: 0.1 }).observe(book);
  }

  /* Form */
  const form = document.getElementById("book-form");
  const status = form.querySelector(".form__status");
  const submit = form.querySelector("button[type=submit]");

  const validate = () => {
    let first = null;
    form.querySelectorAll("input[required]").forEach((input) => {
      const ok = input.value.trim() !== "" && input.checkValidity();
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  };

  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity() && e.target.value.trim()) {
      e.target.setAttribute("aria-invalid", "false");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status";
    status.textContent = "";
    const f = form.elements;                      // form.name would be the form's own name, so use elements
    if (f["company_site"].value) return;          // bot
    if (!validate()) return;

    const data = {
      name: f["name"].value.trim(),
      gym: f["gym"].value.trim(),
      phone: f["phone"].value.trim(),
      page: location.href,
      submitted_at: new Date().toISOString(),
    };

    submit.disabled = true;
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new URLSearchParams(data),         // works with Formspree and Apps Script
        });
        if (!res.ok) throw new Error(res.status);
      } else {
        console.info("[Truepose demo mode] submission:", data);
      }
      form.reset();
      form.querySelectorAll("input").forEach((i) => i.removeAttribute("aria-invalid"));
      status.classList.add("is-ok");
      status.textContent = MSG_OK;
    } catch (err) {
      status.classList.add("is-err");
      status.textContent = MSG_ERR;
    } finally {
      submit.disabled = false;
    }
  });
})();
