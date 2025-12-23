
/* TTP Kitchen — interaction layer (stable) */
(() => {
  const PHONE = "+14698857589";
  const EMAIL = "info@ttpkitchen.com";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const form = $("#inquiryForm");
  const experienceSelect = $("#experience");
  const guests = $("#guests");
  const date = $("#date");
  const area = $("#area");
  const notes = $("#notes");

  const heroSms = $("#heroSms");
  const heroEmail = $("#heroEmail");
  const barSms = $("#barSms");
  const startSms = $("#startSms");
  const startEmail = $("#startEmail");

  const chips = $$("[data-experience]");

  // Toast
  const toast = $("#toast");
  let toastT;
  function showToast(msg = "LOCKED") {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("is-on"), 1400);
  }

  function clean(v) { return (v ?? "").toString().trim(); }

  function getExperience() {
    const fromSelect = clean(experienceSelect?.value);
    if (fromSelect) return fromSelect;
    const active = document.querySelector("[data-experience].is-active");
    return clean(active?.getAttribute("data-experience")) || "";
  }

  function buildMessage() {
    const exp = getExperience();
    const parts = [];
    const g = clean(guests?.value);
    const d = clean(date?.value);
    const a = clean(area?.value);
    const n = clean(notes?.value);

    if (exp) parts.push(`Experience: ${exp}`);
    if (g) parts.push(`Guests: ${g}`);
    if (d) parts.push(`Date: ${d}`);
    if (a) parts.push(`Location/Area: ${a}`);
    if (n) parts.push(`Notes: ${n}`);

    const opener = "Hey Chef CP,";
    const base = exp ? `${opener} I’d like to lock in for ${exp}.` : `${opener} I’d like to lock in.`;
    // No line breaks—single string
    return parts.length ? `${base} ${parts.join(" | ")}` : base;
  }

  function smsHref(msg) {
    return `sms:${PHONE}?&body=${encodeURIComponent(msg)}`;
  }

  function mailtoHref(msg) {
    const subject = encodeURIComponent("TTP Kitchen — Ticket");
    const body = encodeURIComponent(msg);
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }

  function refreshLinks() {
    const msg = buildMessage();
    const sms = smsHref(msg);
    const mail = mailtoHref(msg);

    [heroSms, barSms, startSms].filter(Boolean).forEach(a => a.setAttribute("href", sms));
    [heroEmail, startEmail].filter(Boolean).forEach(a => a.setAttribute("href", mail));
  }

  function setActiveChip(exp) {
    chips.forEach(c => {
      const isOn = clean(c.getAttribute("data-experience")) === exp;
      c.classList.toggle("is-active", isOn);
      c.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  }

  function wireChips() {
    if (!chips.length) return;
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const exp = clean(chip.getAttribute("data-experience"));
        if (experienceSelect) {
          // match option if exists
          const opt = Array.from(experienceSelect.options || []).find(o =>
            clean(o.value) === exp || clean(o.textContent) === exp
          );
          experienceSelect.value = opt ? opt.value : exp;
        }
        setActiveChip(exp);
        refreshLinks();
      });
    });
  }

  function wireForm() {
    if (!form) return;
    ["input", "change", "keyup"].forEach(evt => {
      form.addEventListener(evt, refreshLinks, { passive: true });
    });
  }

  function wireCtas() {
    const ctas = [heroSms, heroEmail, barSms, startSms, startEmail].filter(Boolean);
    ctas.forEach(a => {
      a.addEventListener("click", () => {
        refreshLinks();
        showToast();
        if ("vibrate" in navigator) navigator.vibrate(10);
      }, { capture: true });
    });
  }

  // Init
  wireChips();
  wireForm();
  wireCtas();

  // Default
  const defaultExp = getExperience() || "Private Chef";
  if (experienceSelect && !experienceSelect.value) experienceSelect.value = defaultExp;
  setActiveChip(defaultExp);
  refreshLinks();
})();
