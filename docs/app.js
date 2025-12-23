
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
  const clean = (v) => (v ?? "").toString().trim();

  // Ticket form fields (actual IDs in your markup)
  const expEl = document.getElementById("experience");
  const dateEl = document.getElementById("date");
  const guestsEl = document.getElementById("guests");
  const areaEl = document.getElementById("area");
  const notesEl = document.getElementById("notes");

  const exp = clean(expEl?.value);
  const d = clean(dateEl?.value);
  const g = clean(guestsEl?.value);
  const a = clean(areaEl?.value);
  const n = clean(notesEl?.value);

  const parts = ["Hey Chef CP,"];
  if (exp) parts.push(`Experience: ${exp}`);
  if (g) parts.push(`Guests: ${g}`);
  if (d) parts.push(`Date: ${d}`);
  if (a) parts.push(`Area: ${a}`);
  if (n) parts.push(`Notes: ${n}`);

  // Single line only (no line breaks)
  return parts.join(" | ");
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
  const body = encodeURIComponent(msg);
  const subject = encodeURIComponent("TTP Kitchen — Ticket");

  // Buttons inside ticket form
  const startSms = document.getElementById("startSms");
  const startEmail = document.getElementById("startEmail");

  // Sticky bar
  const barSms = document.getElementById("barSms");
  const barEmail = document.getElementById("barEmail");

  const smsHref = `sms:+14698857589?&body=${body}`;
  const emailHref = `mailto:info@ttpkitchen.com?subject=${subject}&body=${body}`;

  [startSms, barSms].filter(Boolean).forEach((a) => (a.href = smsHref));
  [startEmail, barEmail].filter(Boolean).forEach((a) => (a.href = emailHref));
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

/* DELEGATED_PREFILL: always push latest ticket values at click-time */
(function(){
  const push = () => { try { refreshLinks(); } catch(e){} };
  const ids = ["startSms","startEmail","barSms","barEmail"];
  ids.forEach((id)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", push, {capture:true});
  });

  // Update as user types
  ["experience","date","guests","area","notes"].forEach((id)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("input", push, {passive:true});
    el.addEventListener("change", push, {passive:true});
  });

  // initial set
  document.addEventListener("DOMContentLoaded", push, {once:true});
  push();
})();
