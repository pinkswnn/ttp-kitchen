
/* TTP Kitchen — Functional Prefill (v12)
   Goals:
   - Experience chips sync to form
   - SMS/Email links are ALWAYS prefilled (Hero + Ticket + Sticky)
   - Message starts with: "Hey Chef CP,"
   - Safe fallbacks (copy + toast) if device blocks prefill
*/

(function () {
  const PHONE = "+14698857589";
  const EMAIL = "info@ttpkitchen.com";
  const STORAGE_KEY = "ttp_intent_v12";

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const enc = (v) => encodeURIComponent(v || "");

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") && !window.MSStream;

  function smsHref(body) {
    // iOS uses &body, others use ?body
    const base = `sms:${PHONE}`;
    return isIOS() ? `${base}&body=${enc(body)}` : `${base}?body=${enc(body)}`;
  }

  function mailHref(subject, body) {
    return `mailto:${EMAIL}?subject=${enc(subject)}&body=${enc(body)}`;
  }

  // Elements
  const chips = qsa(".chip[data-experience]");
  const experienceSelect = qs("#experience");

  const elName = qs("#name");
  const elUpdates = qs("#updates");
  const elDate = qs("#date");
  const elGuests = qs("#guests");
  const elArea = qs("#area");
  const elNotes = qs("#notes");

  const heroSms = qs("#heroSms");
  const heroEmail = qs("#heroEmail");
  const startSms = qs("#startSms");
  const startEmail = qs("#startEmail");
  const barSms = qs("#barSms");

  const toast = qs("#toast");
  const toastText = qs("#toastText");

  function showToast(msg) {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.setAttribute("aria-hidden", "false");
    toast.classList.add("is-on");
    window.setTimeout(() => {
      toast.classList.remove("is-on");
      toast.setAttribute("aria-hidden", "true");
    }, 2200);
  }

  function setActiveChip(experience) {
    chips.forEach((btn) => {
      const active = btn.dataset.experience === experience;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function currentData() {
    return {
      experience: (experienceSelect && experienceSelect.value) || "Private Chef",
      name: (elName && elName.value || "").trim(),
      date: (elDate && elDate.value || "").trim(),
      guests: (elGuests && elGuests.value || "").trim(),
      area: (elArea && elArea.value || "").trim(),
      notes: (elNotes && elNotes.value || "").trim(),
      updates: (elUpdates && elUpdates.value || "").trim(),
    };
  }

  function buildSmsBody(d) {
    const lines = [];
    lines.push("Hey Chef CP,");
    lines.push("");
    lines.push(`Experience: ${d.experience || ""}`.trim());
    if (d.date) lines.push(`Date: ${d.date}`);
    if (d.guests) lines.push(`Guests: ${d.guests}`);
    if (d.area) lines.push(`Area: ${d.area}`);
    if (d.name) lines.push(`Name: ${d.name}`);
    if (d.notes) {
      lines.push("");
      lines.push(d.notes);
    }
    if (d.updates) {
      lines.push("");
      lines.push(`Updates: ${d.updates}`);
    }
    lines.push("");
    lines.push("— sent from ttpkitchen.com");
    return lines.join("\n");
  }

  function buildEmail(d) {
    const subject = `TTP Kitchen — ${d.experience || "Inquiry"}`;
    const body = buildSmsBody(d);
    return { subject, body };
  }

  function persist(d) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch (e) {}
  }

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (experienceSelect && d.experience) experienceSelect.value = d.experience;
      if (elName && typeof d.name === "string") elName.value = d.name;
      if (elDate && typeof d.date === "string") elDate.value = d.date;
      if (elGuests && typeof d.guests === "string") elGuests.value = d.guests;
      if (elArea && typeof d.area === "string") elArea.value = d.area;
      if (elNotes && typeof d.notes === "string") elNotes.value = d.notes;
      if (elUpdates && typeof d.updates === "string") elUpdates.value = d.updates;
    } catch (e) {}
  }

  function refreshLinks({ copyHint = false } = {}) {
    const d = currentData();
    setActiveChip(d.experience);

    const smsBody = buildSmsBody(d);
    const email = buildEmail(d);

    const sms = smsHref(smsBody);
    const mail = mailHref(email.subject, email.body);

    if (heroSms) heroSms.href = sms;
    if (startSms) startSms.href = sms;
    if (barSms) barSms.href = sms;

    if (heroEmail) heroEmail.href = mail;
    if (startEmail) startEmail.href = mail;

    persist(d);

    if (copyHint) {
      // best-effort clipboard (some devices block prefilled body)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(smsBody).then(
          () => showToast("Copied — if your phone doesn’t prefill, paste it."),
          () => {}
        );
      }
    }
  }

  // Events
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const exp = btn.dataset.experience || "Private Chef";
      if (experienceSelect) experienceSelect.value = exp;
      refreshLinks();
      // gentle hint text swap if present
      const assist = qs("#experienceAssist");
      if (assist) {
        assist.textContent =
          exp === "Plate Drops"
            ? "Fast plates. Same standard."
            : exp === "Catering"
            ? "Crowd-ready, still personal."
            : "For nights that deserve a memory.";
      }
    });
  });

  [experienceSelect, elName, elDate, elGuests, elArea, elNotes, elUpdates]
    .filter(Boolean)
    .forEach((el) => {
      el.addEventListener("input", () => refreshLinks());
      el.addEventListener("change", () => refreshLinks());
    });

  // Make sure click always uses latest values (and offers paste fallback)
  [heroSms, startSms, barSms].filter(Boolean).forEach((a) => {
    a.addEventListener(
      "click",
      () => {
        refreshLinks({ copyHint: true });
      },
      { passive: true }
    );
  });

  [heroEmail, startEmail].filter(Boolean).forEach((a) => {
    a.addEventListener(
      "click",
      () => {
        refreshLinks();
      },
      { passive: true }
    );
  });

  // Init
  hydrate();
  refreshLinks();

})();
