/*
  TTP Kitchen — Prefill + Intent (stable)
  - Experience chips sync to form
  - SMS/Email links are ALWAYS prefilled (Hero + Ticket + Sticky)
  - Message starts with: "Hey Chef CP,"
  - Form shows the right fields for the chosen experience
*/

(() => {
  const PHONE = "+14698857589";
  const EMAIL = "info@ttpkitchen.com";
  const STORAGE_KEY = "ttp_intent";

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const enc = (v) => encodeURIComponent(v || "");

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") && !window.MSStream;

  const smsHref = (body) => {
    const base = `sms:${PHONE}`;
    // iOS uses &body; others use ?body
    return isIOS() ? `${base}&body=${enc(body)}` : `${base}?body=${enc(body)}`;
  };

  const mailHref = (subject, body) =>
    `mailto:${EMAIL}?subject=${enc(subject)}&body=${enc(body)}`;

  // Elements
  const chips = qsa(".chip[data-experience]");
  const experienceSelect = qs("#experience");
  const ticketHint = qs("#ticketHint");

  const bookingOnly = qsa(".bookingOnly");
  const dropsOnly = qsa(".dropsOnly");

  const elDate = qs("#date");
  const elGuests = qs("#guests");
  const elArea = qs("#area");
  const elNotes = qs("#notes");
  const elName = qs("#name");
  const elUpdates = qs("#updates");

  const heroSms = qs("#heroSms");
  const heroEmail = qs("#heroEmail");
  const startSms = qs("#startSms");
  const startEmail = qs("#startEmail");
  const barSms = qs("#barSms");

  const toast = qs("#toast");
  const toastText = qs("#toastText");

  const assist = qs("#experienceAssist");

  const showToast = (msg) => {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.setAttribute("aria-hidden", "false");
    toast.classList.add("is-on");
    window.setTimeout(() => {
      toast.classList.remove("is-on");
      toast.setAttribute("aria-hidden", "true");
    }, 2200);
  };

  const setActiveChip = (experience) => {
    chips.forEach((btn) => {
      const active = btn.dataset.experience === experience;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  const setFieldVisibility = (experience) => {
    const isDrops = experience === "Plate Drops";

    bookingOnly.forEach((el) => {
      el.style.display = isDrops ? "none" : "";
    });
    dropsOnly.forEach((el) => {
      el.style.display = isDrops ? "" : "none";
    });

    if (assist) {
      assist.textContent = isDrops
        ? "Fast plates. Same standard."
        : experience === "Catering"
        ? "Crowd-ready, still personal."
        : "For nights that deserve a memory.";
    }

    if (ticketHint) ticketHint.textContent = assist ? assist.textContent : "";
  };

  const currentData = () => ({
    experience: (experienceSelect && experienceSelect.value) || "Private Chef",
    date: (elDate && elDate.value) || "",
    guests: (elGuests && elGuests.value) || "",
    area: (elArea && elArea.value) || "",
    notes: (elNotes && elNotes.value) || "",
    name: (elName && elName.value) || "",
    updates: (elUpdates && elUpdates.value) || "",
  });

  const buildSmsBody = (d) => {
    const lines = ["Hey Chef CP,", ""];

    if (d.experience === "Plate Drops") {
      lines.push("Experience: Plate Drops");
      if (d.name.trim()) lines.push(`Name: ${d.name.trim()}`);
      if (d.updates.trim()) {
        lines.push("");
        lines.push(d.updates.trim());
      }
      return lines.join("\n");
    }

    // Private Chef / Catering
    lines.push(`Experience: ${d.experience}`);
    if (d.date.trim()) lines.push(`Date: ${d.date.trim()}`);
    if (d.guests.trim()) lines.push(`Guests: ${d.guests.trim()}`);
    if (d.area.trim()) lines.push(`Area: ${d.area.trim()}`);
    if (d.notes.trim()) {
      lines.push("");
      lines.push(d.notes.trim());
    }
    return lines.join("\n");
  };

  const buildEmail = (d) => {
    const subject =
      d.experience === "Plate Drops"
        ? "TTP Kitchen — Plate Drops"
        : `TTP Kitchen — ${d.experience}`;
    const body = buildSmsBody(d);
    return { subject, body };
  };

  const persist = (d) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch (_) {}
  };

  const hydrate = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);

      if (experienceSelect && d.experience) experienceSelect.value = d.experience;
      if (elDate && typeof d.date === "string") elDate.value = d.date;
      if (elGuests && typeof d.guests === "string") elGuests.value = d.guests;
      if (elArea && typeof d.area === "string") elArea.value = d.area;
      if (elNotes && typeof d.notes === "string") elNotes.value = d.notes;
      if (elName && typeof d.name === "string") elName.value = d.name;
      if (elUpdates && typeof d.updates === "string") elUpdates.value = d.updates;
    } catch (_) {}
  };

  const refreshLinks = ({ copyHint = false } = {}) => {
    const d = currentData();

    setActiveChip(d.experience);
    setFieldVisibility(d.experience);

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

    if (copyHint && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(smsBody).then(
        () => showToast("Copied — if your phone doesn’t prefill, paste it."),
        () => {}
      );
    }
  };

  // Chip clicks
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const exp = btn.dataset.experience || "Private Chef";
      if (experienceSelect) experienceSelect.value = exp;
      refreshLinks();
    });
  });

  // Field edits
  [
    experienceSelect,
    elDate,
    elGuests,
    elArea,
    elNotes,
    elName,
    elUpdates,
  ]
    .filter(Boolean)
    .forEach((el) => {
      el.addEventListener("input", () => refreshLinks());
      el.addEventListener("change", () => refreshLinks());
    });

  // Ensure click uses latest values (and offers paste fallback)
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

  // Footer year
  const year = qs("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Init
  hydrate();
  refreshLinks();
})();
