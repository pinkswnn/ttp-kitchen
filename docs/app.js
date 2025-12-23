(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const enc = (s) => encodeURIComponent((s ?? "").toString());
  const clean = (v) => (v ?? "").toString().trim();

  const phone = "+14698857589";
  const email = "info@ttpkitchen.com";

  const els = {
    experience: $("#experience"),
    guests: $("#guests"),
    date: $("#date"),
    area: $("#area"),
    notes: $("#notes"),
    startSms: $("#startSms"),
    startEmail: $("#startEmail"),
    barSms: $("#barSms"),
    barEmail: $("#barEmail"),
    toast: $("#toast")
  };

  const getExperienceFromChips = () => {
    const active = document.querySelector('[data-experience][aria-pressed="true"]');
    return clean(active?.getAttribute("data-experience") || active?.textContent);
  };

  const buildMessage = () => {
    const exp = clean(els.experience?.value) || getExperienceFromChips();
    const guests = clean(els.guests?.value);
    const date = clean(els.date?.value);
    const area = clean(els.area?.value);
    const notes = clean(els.notes?.value);

    const parts = ["Hey Chef CP,"];
    if (exp) parts.push(`Experience: ${exp}`);
    if (guests) parts.push(`Guests: ${guests}`);
    if (date) parts.push(`Date: ${date}`);
    if (area) parts.push(`Area: ${area}`);
    if (notes) parts.push(`Notes: ${notes}`);
    return parts.join(" | "); // single-line only
  };

  const setLinks = () => {
    const msg = buildMessage();
    const body = enc(msg);
    const subject = enc("TTP Kitchen — Ticket");

    const smsHref = `sms:${phone}?&body=${body}`;
    const mailHref = `mailto:${email}?subject=${subject}&body=${body}`;

    [els.startSms, els.barSms].filter(Boolean).forEach(a => a.setAttribute("href", smsHref));
    [els.startEmail, els.barEmail].filter(Boolean).forEach(a => a.setAttribute("href", mailHref));
  };

  const showToast = (text) => {
    if (!els.toast) return;
    els.toast.textContent = text || "LOCKED";
    els.toast.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
  };

  // Experience chips/pills: clickable + sync to select
  document.querySelectorAll("[data-experience]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const val = clean(btn.getAttribute("data-experience") || btn.textContent);
      document.querySelectorAll("[data-experience]").forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      if (els.experience) els.experience.value = val;
      setLinks();
    }, { passive: false });
  });

  // Update links as user types
  ["change","input"].forEach(evt => {
    ["experience","guests","date","area","notes"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(evt, setLinks, { passive: true });
    });
  });

  // Always push latest values at click-time
  ["startSms","startEmail","barSms","barEmail"].forEach(id => {
    const a = document.getElementById(id);
    if (!a) return;
    a.addEventListener("click", () => {
      setLinks();
      showToast("LOCKED");
    }, { capture: true });
  });

  // Initial
  setLinks();
})();