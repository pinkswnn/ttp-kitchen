const CONTACT = { phone: "+14698857589", email: "info@ttpkitchen.com" };

const LANE_HELP = {
  "Private Chef": "A dinner that feels like you did it right.",
  "Catering": "Your gathering — handled.",
  "Pre-Orders": "Plate drops when you want TTP on your time."
};

const enc = v => encodeURIComponent(v);
const trim = v => (v || "").trim();

function addLine(lines, label, value) {
  const v = trim(value);
  if (v) lines.push(`${label}: ${v}`);
}

function buildSmsBody(data) {
  const lines = [];

  if (data.lane === "Pre-Orders") {
    lines.push("Hey Chef CP — I want in on the next plate drop.");
    addLine(lines, "Name", data.name);
    addLine(lines, "Notes", data.updates);
    lines.push("", "Send the next drop details when you can.");
    return lines.join("\n");
  }

  lines.push("Hey Chef CP — I’m ready to book the TTP experience.");
  lines.push("");
  addLine(lines, "Experience", data.lane);
  addLine(lines, "Date", data.date);
  addLine(lines, "Guests", data.guests);
  addLine(lines, "Area", data.area);
  addLine(lines, "Notes", data.notes);
  lines.push("", "Let me know what you need from me to lock it in.");
  return lines.join("\n");
}

function smsHref(body) {
  return `sms:${CONTACT.phone}?&body=${enc(body)}`;
}

function mailHref(data) {
  const subject = enc("TTP Kitchen Inquiry");
  const lines = ["Hey Chef CP,", "", "I’m ready to move forward.", ""];

  addLine(lines, "Experience", data.lane);

  if (data.lane === "Pre-Orders") {
    addLine(lines, "Name", data.name);
    addLine(lines, "Notes", data.updates);
    lines.push("", "Send the next drop details when you can.", "", "Thanks!");
  } else {
    addLine(lines, "Date", data.date);
    addLine(lines, "Guests", data.guests);
    addLine(lines, "Area", data.area);
    addLine(lines, "Notes", data.notes);
    lines.push("", "Let me know what you need from me to lock it in.", "", "Thanks!");
  }

  return `mailto:${CONTACT.email}?subject=${subject}&body=${enc(lines.join("\n"))}`;
}

async function silentCopy(text) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

function haptic(ms = 10) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
let toastTimer = null;

function showToast(msg = "READY") {
  if (!toast || !toastText) return;
  toastText.textContent = msg;
  toast.classList.add("is-showing");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-showing"), 850);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: .14 });
  revealEls.forEach(el => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const chips = Array.from(document.querySelectorAll(".chip[data-lane]"));
const laneSelect = document.getElementById("lane");
const laneHelp = document.getElementById("laneHelp");

const nameWrap = document.getElementById("fieldNameWrap");
const dateWrap = document.getElementById("fieldDateWrap");
const guestsWrap = document.getElementById("fieldGuestsWrap");
const areaWrap = document.getElementById("fieldAreaWrap");
const notesWrap = document.getElementById("fieldNotesWrap");
const updatesWrap = document.getElementById("fieldUpdatesWrap");

const elName = document.getElementById("name");
const elDate = document.getElementById("date");
const elGuests = document.getElementById("guests");
const elArea = document.getElementById("area");
const elNotes = document.getElementById("notes");
const elUpdates = document.getElementById("updates");

const heroSms = document.getElementById("heroSms");
const heroEmail = document.getElementById("heroEmail");
const startSms = document.getElementById("startSms");
const startEmail = document.getElementById("startEmail");
const barSms = document.getElementById("barSms");

function getData() {
  return {
    lane: laneSelect?.value || "Private Chef",
    name: elName?.value || "",
    date: elDate?.value || "",
    guests: elGuests?.value || "",
    area: elArea?.value || "",
    notes: elNotes?.value || "",
    updates: elUpdates?.value || ""
  };
}

function applyLaneUI(lane) {
  if (laneHelp) laneHelp.textContent = LANE_HELP[lane] || "";

  const isPre = lane === "Pre-Orders";
  if (nameWrap) nameWrap.hidden = !isPre;
  if (updatesWrap) updatesWrap.hidden = !isPre;

  if (dateWrap) dateWrap.hidden = isPre;
  if (guestsWrap) guestsWrap.hidden = isPre;
  if (areaWrap) areaWrap.hidden = isPre;
  if (notesWrap) notesWrap.hidden = isPre;
}

function setActiveChip(lane) {
  chips.forEach(btn => {
    const active = btn.dataset.lane === lane;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

/* Smart validation: blocks CTAs until ready */
function validateForLane(data) {
  if (data.lane === "Pre-Orders") {
    if (!trim(data.name)) return { ok: false, msg: "ADD NAME" };
    return { ok: true };
  }
  if (!trim(data.date)) return { ok: false, msg: "ADD DATE" };
  if (!trim(data.guests)) return { ok: false, msg: "ADD GUESTS" };
  if (!trim(data.area)) return { ok: false, msg: "ADD AREA" };
  return { ok: true };
}

async function refreshLinks(andToast = false) {
  const data = getData();
  const body = buildSmsBody(data);
  const sms = smsHref(body);
  const mail = mailHref(data);

  if (heroSms) heroSms.href = sms;
  if (startSms) startSms.href = sms;
  if (barSms) barSms.href = sms;

  if (heroEmail) heroEmail.href = mail;
  if (startEmail) startEmail.href = mail;

  await silentCopy(body);
  if (andToast && !reduceMotion) { showToast("READY"); haptic(10); }
}

function attachValidation(linkEl, mode) {
  if (!linkEl) return;

  linkEl.addEventListener("click", (e) => {
    const data = getData();
    const v = validateForLane(data);

    if (!v.ok) {
      e.preventDefault();
      showToast(v.msg);
      haptic(14);

      if (v.msg === "ADD NAME") elName?.focus();
      if (v.msg === "ADD DATE") elDate?.focus();
      if (v.msg === "ADD GUESTS") elGuests?.focus();
      if (v.msg === "ADD AREA") elArea?.focus();
      return;
    }

    showToast(mode === "sms" ? "TEXT READY" : "EMAIL READY");
  });
}

/* Chip clicks */
chips.forEach(btn => {
  btn.addEventListener("click", async () => {
    const lane = btn.dataset.lane || "Private Chef";
    if (laneSelect) laneSelect.value = lane;

    setActiveChip(lane);
    applyLaneUI(lane);

    await refreshLinks(true);
  });
});

/* Dropdown change */
laneSelect?.addEventListener("change", async () => {
  const lane = laneSelect.value;
  setActiveChip(lane);
  applyLaneUI(lane);
  await refreshLinks(true);
});

/* Input updates */
[elName, elDate, elGuests, elArea, elNotes, elUpdates].filter(Boolean).forEach(el => {
  el.addEventListener("input", () => refreshLinks(false));
});

/* Validate on CTA click */
attachValidation(heroSms, "sms");
attachValidation(startSms, "sms");
attachValidation(barSms, "sms");
attachValidation(heroEmail, "email");
attachValidation(startEmail, "email");

/* Parallax */
const heroImg = document.getElementById("heroImg");
function parallax() {
  if (!heroImg || reduceMotion) return;
  const rect = heroImg.getBoundingClientRect();
  const vh = window.innerHeight || 800;
  if (!(rect.bottom > 0 && rect.top < vh)) return;
  const progress = rect.top / vh;
  const translate = Math.max(-10, Math.min(10, progress * -10));
  heroImg.style.transform = `scale(1.05) translateY(${translate}px)`;
}
window.addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
window.addEventListener("resize", () => requestAnimationFrame(parallax));
parallax();

/* Init */
applyLaneUI("Private Chef");
refreshLinks(false);
