document.documentElement.classList.add('reveal-on');

/* TTP Kitchen — Interaction layer (value build, feels premium)
   - Experience selector sync (chips + select)
   - Progressive form disclosure
   - Warm validation (no focus hijack on selects)
   - Prefilled SMS + email templates
   - Silent copy of final message
   - Toast feedback (no leakage)
   - Intent memory (localStorage)
*/

const CONTACT = {
  phone: "+14698857589",
  email: "info@ttpkitchen.com",
};

const EXPERIENCE_ASSIST = {
  "Private Chef": "For nights that deserve a memory.",
  "Catering": "For gatherings that need to feel handled.",
  "Plate Drops": "For when you want it on your schedule.",
};

const STORE_KEY = "ttpkitchen_intent_v1";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const enc = (v) => encodeURIComponent(v || "");
const trim = (v) => (v || "").trim();

function safeSetText(el, text) {
  if (!el) return;
  el.textContent = text || "";
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildSmsBody(data) {
  const lines = [];
  lines.push("Hey Chef CP,");

  if (data.experience === "Plate Drops") {
    lines.push("Put us on the plate drop list.");
    lines.push("");
    lines.push(`Name: ${data.name || ""}`);
    lines.push(`Updates: ${data.updates || ""}`);
    lines.push("");
    lines.push("What’s the next step?");
    return lines.join("\n");
  }

  lines.push("We want to lock in.");
  lines.push("");
  lines.push(`Experience: ${data.experience || ""}`);
  lines.push(`Date: ${data.date || ""}`);
  lines.push(`Guests: ${data.guests || ""}`);
  lines.push(`Area: ${data.area || ""}`);
  lines.push(`Notes: ${data.notes || ""}`);
  lines.push("");
  lines.push("What’s the next step?");
  return lines.join("\n");
}

function buildEmail(data) {
  const subjectBase = data.experience ? `${data.experience} — TTP Kitchen` : "TTP Kitchen — Lock In";
  const body = buildSmsBody(data);
  return {
    subject: subjectBase,
    body,
  };
}

function smsHref(body) {
  // Most mobile clients accept sms:+number?&body=...
  return `sms:${CONTACT.phone}?&body=${enc(body)}`;
}

function mailHref(subject, body) {
  return `mailto:${CONTACT.email}?subject=${enc(subject)}&body=${enc(body)}`;
}

async function silentCopy(text) {
  if (!text) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {}
  // fallback: hidden textarea
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch {}
}

/* Toast */
const toast = $("#toast");
const toastText = $("#toastText");
let toastTimer = null;

function showToast(msg) {
  if (!toast || !toastText) return;
  safeSetText(toastText, msg);
  toast.classList.add("is-showing");
  toast.setAttribute("aria-hidden", "false");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-showing");
    toast.setAttribute("aria-hidden", "true");
    safeSetText(toastText, "");
  }, 850);
}

/* Reveal */
(function initReveal() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = $$(".reveal");
  if (reduceMotion) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  els.forEach((el) => io.observe(el));
})();

/* Year */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Elements */
const chips = $$('button.chip[data-experience]');
const experienceSelect = $("#experience");
const experienceAssist = $("#experienceAssist");

const formCard = $("#formCard");
const focusOverlay = $("#focusOverlay");
const inquiryForm = $("#inquiryForm");

const fieldNameWrap = $("#fieldNameWrap");
const fieldUpdatesWrap = $("#fieldUpdatesWrap");
const fieldDateWrap = $("#fieldDateWrap");
const fieldGuestsWrap = $("#fieldGuestsWrap");
const fieldAreaWrap = $("#fieldAreaWrap");
const fieldNotesWrap = $("#fieldNotesWrap");

const elName = $("#name");
const elUpdates = $("#updates");
const elDate = $("#date");
const elGuests = $("#guests");
const elArea = $("#area");
const elNotes = $("#notes");

const heroSms = $("#heroSms");
const heroEmail = $("#heroEmail");
const startSms = $("#startSms");
const startEmail = $("#startEmail");
const barSms = $("#barSms");

const hints = {
  experience: $("#experienceHint"),
  name: $("#nameHint"),
  date: $("#dateHint"),
  guests: $("#guestsHint"),
  area: $("#areaHint"),
};

/* Helpers */
function setActiveChip(experience) {
  chips.forEach((btn) => {
    const active = btn.dataset.experience === experience;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function currentData() {
  return {
    experience: experienceSelect?.value || "Private Chef",
    name: trim(elName?.value),
    updates: trim(elUpdates?.value),
    date: trim(elDate?.value),
    guests: trim(elGuests?.value),
    area: trim(elArea?.value),
    notes: trim(elNotes?.value),
  };
}

function persistIntent() {
  const data = currentData();
  saveState({
    experience: data.experience,
    fields: {
      name: data.name,
      updates: data.updates,
      date: data.date,
      guests: data.guests,
      area: data.area,
      notes: data.notes,
    },
    savedAt: Date.now(),
  });
}

function applyExperienceUI(experience) {
  safeSetText(experienceAssist, EXPERIENCE_ASSIST[experience] || "");

  const isDrops = experience === "Plate Drops";

  // Reset hints
  Object.values(hints).forEach((el) => safeSetText(el, ""));
  $$(".is-error").forEach((row) => row.classList.remove("is-error"));

  // Progressive disclosure by experience
  if (fieldNameWrap) fieldNameWrap.hidden = !isDrops;
  if (fieldUpdatesWrap) fieldUpdatesWrap.hidden = !isDrops;

  if (fieldDateWrap) fieldDateWrap.hidden = isDrops;
  if (fieldGuestsWrap) fieldGuestsWrap.hidden = true; // revealed after date
  if (fieldAreaWrap) fieldAreaWrap.hidden = true;     // revealed after guests
  if (fieldNotesWrap) fieldNotesWrap.hidden = true;   // revealed after area

  if (isDrops) {
    // Keep drops fields visible; booking fields hidden
    // Do not wipe—respect intent memory
    if (fieldNameWrap) fieldNameWrap.hidden = false;
    if (fieldUpdatesWrap) fieldUpdatesWrap.hidden = false;
  } else {
    if (fieldDateWrap) fieldDateWrap.hidden = false;
  }
}

function updateProgressiveDisclosure() {
  const data = currentData();
  if (data.experience === "Plate Drops") return;

  const hasDate = !!data.date;
  const hasGuests = !!data.guests;
  const hasArea = !!data.area;

  if (fieldGuestsWrap) fieldGuestsWrap.hidden = !hasDate;
  if (fieldAreaWrap) fieldAreaWrap.hidden = !(hasDate && hasGuests);
  if (fieldNotesWrap) fieldNotesWrap.hidden = !(hasDate && hasGuests && hasArea);
}

/* Validation (warm, no select hijack) */
function markError(fieldWrap, hintEl, msg) {
  if (fieldWrap) fieldWrap.classList.add("is-error");
  safeSetText(hintEl, msg);
}

function clearError(fieldWrap, hintEl) {
  if (fieldWrap) fieldWrap.classList.remove("is-error");
  safeSetText(hintEl, "");
}

function validateForPrefill() {
  // We do NOT block CTAs. This only guides + improves message completeness.
  const data = currentData();
  let ok = true;

  // clear all
  [fieldNameWrap, fieldDateWrap, fieldGuestsWrap, fieldAreaWrap, fieldNotesWrap].forEach((w) => w && w.classList.remove("is-error"));
  Object.values(hints).forEach((h) => safeSetText(h, ""));

  if (data.experience === "Plate Drops") {
    if (!data.name) {
      markError(fieldNameWrap, hints.name, "Name helps us keep it clean.");
      ok = false;
    }
    return ok;
  }

  if (!data.date) {
    markError(fieldDateWrap, hints.date, "Drop the date — we’ll handle the rest.");
    ok = false;
  }
  if (data.date && !data.guests) {
    markError(fieldGuestsWrap, hints.guests, "Guest count keeps the timing right.");
    ok = false;
  }
  if (data.date && data.guests && !data.area) {
    markError(fieldAreaWrap, hints.area, "What part of town are we serving?");
    ok = false;
  }
  return ok;
}

/* Links + silent copy */
async function refreshLinks({ toast = false } = {}) {
  const data = currentData();
  updateProgressiveDisclosure();

  const body = buildSmsBody(data);
  const mail = buildEmail(data);

  const sms = smsHrefPlatform(body);
  const email = mailHref(mail.subject, mail.body);

  if (heroSms) heroSms.href = sms;
  if (startSms) startSms.href = sms;
  if (barSms) barSms.href = sms;

  if (heroEmail) heroEmail.href = email;
  if (startEmail) startEmail.href = email;

  // Silent copy to clipboard (best effort)
  await silentCopy(body);

  persistIntent();

  if (toast) {
    showToast("LOCKED");
    if ("vibrate" in navigator) navigator.vibrate(10);
  }
}

/* Focus mode */
function enableFocusMode() {
  if (!focusOverlay || !formCard) return;
  focusOverlay.classList.add("is-on");
  formCard.classList.add("is-focused");
}
function disableFocusMode() {
  if (!focusOverlay || !formCard) return;
  focusOverlay.classList.remove("is-on");
  formCard.classList.remove("is-focused");
}

function attachFocusMode() {
  if (!inquiryForm) return;

  });

  if (focusOverlay) {
    focusOverlay.addEventListener("click", () => {
      disableFocusMode();
    });
  }

  // Escape exits
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") disableFocusMode();
  });
}

/* Event wiring */
function onExperienceChange(experience, source = "select") {
  if (experienceSelect) experienceSelect.value = experience;
  setActiveChip(experience);
  applyExperienceUI(experience);
  refreshLinks({ toast: source === "chip" });
  if(source === "chip"){ showToast("SET"); }

}

chips.forEach((btn) => {
  btn.addEventListener("click", () => {
    const exp = btn.dataset.experience || "Private Chef";
    onExperienceChange(exp, "chip");
  });
});

experienceSelect?.addEventListener("change", () => {
  onExperienceChange(experienceSelect.value, "select");
});

// Field listeners: no autofocus, no forced .focus() on select
[elName, elUpdates, elDate, elGuests, elArea, elNotes].filter(Boolean).forEach((el) => {
  el.addEventListener("input", () => refreshLinks({ toast: false }));
  el.addEventListener("blur", () => {
    validateForPrefill();
    refreshLinks({ toast: false });
  });
});

// Friendly guidance (without blocking CTA clicks)
[startSms, startEmail, heroSms, heroEmail, barSms].filter(Boolean).forEach((a) => {
  a.addEventListener("click", () => {
    validateForPrefill();
    refreshLinks({ toast: true });
  });
});

/* Restore intent */
(function restoreIntent() {
  const st = loadState();
  if (!st) return;

  const experience = st.experience || "Private Chef";
  if (experienceSelect) experienceSelect.value = experience;
  setActiveChip(experience);
  applyExperienceUI(experience);

  const f = st.fields || {};
  if (elName && typeof f.name === "string") elName.value = f.name;
  if (elUpdates && typeof f.updates === "string") elUpdates.value = f.updates;
  if (elDate && typeof f.date === "string") elDate.value = f.date;
  if (elGuests && typeof f.guests === "string") elGuests.value = f.guests;
  if (elArea && typeof f.area === "string") elArea.value = f.area;
  if (elNotes && typeof f.notes === "string") elNotes.value = f.notes;

  updateProgressiveDisclosure();
})();

attachFocusMode();
refreshLinks({ toast: false });


// --- Run Of Service stepper (interactive content, synced to experience) ---
const rosTitle = document.querySelector("#rosTitle");
const rosBody = document.querySelector("#rosBody");
const rosSteps = Array.from(document.querySelectorAll(".step[data-step]"));
const needBooking = document.querySelector("#needBooking");
const needDrops = document.querySelector("#needDrops");

function setRosStep(step) {
  rosSteps.forEach((b) => {
    const active = b.dataset.step === String(step);
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });

  const exp = experienceSelect?.value || "Private Chef";

  if (step === 1) {
    if (rosTitle) rosTitle.textContent = "Pick the experience";
    if (rosBody) rosBody.textContent = "Private Chef, Catering, or Plate Drops. Start where you are.";
  } else if (step === 2) {
    if (rosTitle) rosTitle.textContent = "Send the details";
    if (rosBody) {
      rosBody.textContent =
        exp === "Plate Drops"
          ? "Name + optional updates. We’ll keep you in rotation."
          : "Date, guest count, and area. Notes are optional — standard is not.";
    }
  } else if (step === 3) {
    if (rosTitle) rosTitle.textContent = "Follow-through";
    if (rosBody) rosBody.textContent = "We confirm. We execute. You enjoy the moment.";
  }

  // Visual emphasis for the experience (compare absorbed)
  if (needBooking && needDrops) {
    const isDrops = exp === "Plate Drops";
    needDrops.style.opacity = isDrops ? "1" : ".6";
    needBooking.style.opacity = isDrops ? ".6" : "1";
  }
}

rosSteps.forEach((btn) => {
  btn.addEventListener("click", () => setRosStep(Number(btn.dataset.step || "1")));
});

// When experience changes, keep ROS step context but refresh highlight
const _origOnExperienceChange = onExperienceChange;
onExperienceChange = function(experience, source="select"){
  _origOnExperienceChange(experience, source);
  // keep current step selection
  const active = rosSteps.find((b)=>b.classList.contains("is-active"));
  const step = active ? Number(active.dataset.step) : 1;
  setRosStep(step);
};

// Initialize
setRosStep(1);



/* V5: Reliable CTA push + date picker assist (no select hijack) */
function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function smsHrefPlatform(body){
  const base = `sms:${CONTACT.phone}`;
  const b = enc(body);
  // iOS commonly prefers &body= (no ?), Android accepts ?body=
  return isIOS() ? `${base}&body=${b}` : `${base}?body=${b}`;
}

async function handlePush(linkEl, kind){
  // kind: 'sms' | 'email'
  const ok = validateForPrefill(); // guidance only
  const data = currentData();

  // If booking and missing date, scroll + focus date to open native picker
  if (data.experience !== "Plate Drops" && !data.date) {
    if (fieldDateWrap) {
      fieldDateWrap.scrollIntoView({behavior:"smooth", block:"center"});
      // focusing date is acceptable; it helps open native picker
      setTimeout(()=>{ try{ elDate && elDate.focus(); }catch(e){} }, 260);
    }
  }

  // If plate drops and missing name, scroll + focus name
  if (data.experience === "Plate Drops" && !data.name) {
    if (fieldNameWrap) {
      fieldNameWrap.scrollIntoView({behavior:"smooth", block:"center"});
      setTimeout(()=>{ try{ elName && elName.focus(); }catch(e){} }, 260);
    }
  }

  // Build links with platform-safe sms format
  const body = buildSmsBody(data);
  const mail = buildEmail(data);

  const sms = smsHrefPlatform(body);
  const email = mailHref(mail.subject, mail.body);

  if (heroSms) heroSms.href = sms;
  if (startSms) startSms.href = sms;
  if (barSms) barSms.href = sms;

  if (heroEmail) heroEmail.href = email;
  if (startEmail) startEmail.href = email;

  await silentCopy(body);
  persistIntent();
  showToast("LOCKED");

  // Navigate after href update
  const href = (kind === "sms") ? sms : email;
  window.location.href = href;
}

// Override click handlers to prevent stale href / race on mobile
[heroSms, startSms, barSms].filter(Boolean).forEach((a)=>{
  a.addEventListener("click", (e)=>{
    e.preventDefault();
    handlePush(a, "sms");
  }, {passive:false});
});
[heroEmail, startEmail].filter(Boolean).forEach((a)=>{
  a.addEventListener("click", (e)=>{
    e.preventDefault();
    handlePush(a, "email");
  }, {passive:false});
});

if (lo) requestAnimationFrame(()=> lo.classList.add("is-in"));
});

/* V10: CTA prefill guard — always refresh links before navigation */
[heroSms, startSms, barSms].filter(Boolean).forEach((a)=>{
  a.addEventListener("click", ()=>{
    validateForPrefill();
    refreshLinks({ toast:true });
  });
});
[heroEmail, startEmail].filter(Boolean).forEach((a)=>{
  a.addEventListener("click", ()=>{
    validateForPrefill();
    refreshLinks({ toast:true });
  });
});
