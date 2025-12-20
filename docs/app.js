(() => {
  const PHONE = "sms:+14698857589";
  const EMAIL = "mailto:info@ttpkitchen.com";
  const IG_DM = "https://ig.me/m/ttp_kitchen";

  const state = {
    exp: "private", // private | catering | drops
    fields: { name:"", date:"", guests:"", area:"", notes:"", updates:"" }
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    segBtns: $$(".seg__btn"),
    pickBtns: $$(".card__pick"),
    toast: $("#toast"),

    panel: $("#panel"),
    overlay: $("#focusOverlay"),
    form: $("#leadForm"),

    name: $("#name"),
    date: $("#date"),
    guests: $("#guests"),
    area: $("#area"),
    notes: $("#notes"),
    updates: $("#updates"),

    heroText: $("#heroText"),
    heroEmail: $("#heroEmail"),
    formText: $("#formText"),
    formEmail: $("#formEmail"),
    stickyText: $("#stickyText"),
  };

  function load() {
    try{
      const saved = JSON.parse(localStorage.getItem("ttpkitchen_state") || "null");
      if(saved && saved.exp) state.exp = saved.exp;
      if(saved && saved.fields) state.fields = { ...state.fields, ...saved.fields };
    }catch(e){}
  }

  function save() {
    try{
      localStorage.setItem("ttpkitchen_state", JSON.stringify({ exp: state.exp, fields: state.fields }));
    }catch(e){}
  }

  function toast(msg){
    if(!els.toast) return;
    els.toast.textContent = msg;
    els.toast.style.opacity = "1";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { els.toast.textContent = ""; }, 1400);
  }

  function setExp(exp){
    state.exp = exp;
    els.segBtns.forEach(b => b.setAttribute("aria-selected", b.dataset.exp === exp ? "true":"false"));

    // Progressive disclosure: drops uses NAME + UPDATES only
    toggleField("date", exp !== "drops");
    toggleField("guests", exp !== "drops");
    toggleField("area", exp !== "drops");
    toggleField("notes", exp !== "drops");
    toggleField("name", exp === "drops");
    toggleField("updates", exp === "drops");

    updateCTAs();
    silentCopy(buildMessage());
    toast(exp === "private" ? "PRIVATE CHEF SELECTED" : exp === "catering" ? "CATERING SELECTED" : "PLATE DROPS SELECTED");
    save();
  }

  function toggleField(key, on){
    const wrap = document.querySelector(`.field[data-field="${key}"]`);
    if(!wrap) return;
    wrap.style.display = on ? "" : "none";
  }

  function setField(key, val){
    state.fields[key] = val;
    save();
    updateCTAs();
  }

  function expLabel(){
    return state.exp === "private" ? "PRIVATE CHEF" : state.exp === "catering" ? "CATERING" : "PLATE DROPS";
  }

  function buildMessage(){
    const f = state.fields;
    const lines = [];
    lines.push("Hey Chef CP —");
    lines.push(`I WANT TO LOCK IN THE ${expLabel()} EXPERIENCE.`);

    if(state.exp === "drops"){
      if(f.name) lines.push(`NAME: ${f.name}`);
      if(f.updates) lines.push(`UPDATES: ${f.updates}`);
      lines.push("ADD ME TO DROP ALERTS + PREORDERS.");
      return lines.join("\n");
    }

    if(f.date) lines.push(`DATE: ${f.date}`);
    if(f.guests) lines.push(`GUESTS: ${f.guests}`);
    if(f.area) lines.push(`AREA: ${f.area}`);
    if(f.notes) lines.push(`NOTES: ${f.notes}`);
    lines.push("WHAT’S THE NEXT STEP?");
    return lines.join("\n");
  }

  function makeSmsHref(msg){
    const encoded = encodeURIComponent(msg);
    return `${PHONE}?&body=${encoded}`;
  }

  function makeMailtoHref(msg){
    const subject = encodeURIComponent(`TTP KITCHEN — ${expLabel()} INQUIRY`);
    const body = encodeURIComponent(msg);
    return `${EMAIL}?subject=${subject}&body=${body}`;
  }

  async function silentCopy(text){
    try{
      if(navigator.clipboard) await navigator.clipboard.writeText(text);
    }catch(e){}
  }

  function clearErrors(){
    $$(".field").forEach(f => f.classList.remove("isError"));
    $$(".hint").forEach(h => h.textContent = "");
  }

  function setError(key, msg){
    const wrap = document.querySelector(`.field[data-field="${key}"]`);
    const hint = document.querySelector(`#hint-${key}`);
    if(wrap) wrap.classList.add("isError");
    if(hint) hint.textContent = msg;
  }

  function prefersReducedMotion(){
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollToField(key, canFocus){
    const el = document.querySelector(`.field[data-field="${key}"]`);
    if(!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto":"smooth", block:"center" });
    if(canFocus){
      const input = el.querySelector("input,textarea");
      if(input) input.focus({ preventScroll: true });
    }
  }

  function validate(){
    clearErrors();
    const f = state.fields;

    if(state.exp === "drops"){
      if(!f.name.trim()){
        setError("name", "ADD YOUR NAME.");
        scrollToField("name", true);
        return false;
      }
      return true;
    }

    if(!f.date){
      setError("date", "CHOOSE A DATE.");
      scrollToField("date", true);
      return false;
    }
    if(!f.guests){
      setError("guests", "SELECT GUESTS.");
      scrollToField("guests", false); // do NOT auto-focus select
      return false;
    }
    if(!f.area.trim()){
      setError("area", "ADD YOUR AREA.");
      scrollToField("area", true);
      return false;
    }
    return true;
  }

  function updateCTAs(){
    const msg = buildMessage();
    const sms = makeSmsHref(msg);
    const mail = makeMailtoHref(msg);

    [els.heroText, els.formText, els.stickyText].forEach(a => a && a.setAttribute("href", sms));
    [els.heroEmail, els.formEmail].forEach(a => a && a.setAttribute("href", mail));
  }

  function attach(){
    els.segBtns.forEach(btn => btn.addEventListener("click", () => setExp(btn.dataset.exp)));
    els.pickBtns.forEach(btn => btn.addEventListener("click", () => {
      setExp(btn.dataset.pick);
      $("#start").scrollIntoView({ behavior: prefersReducedMotion() ? "auto":"smooth" });
    }));

    const bindInput = (el, key, evt="input") => el && el.addEventListener(evt, (e) => setField(key, e.target.value));
    bindInput(els.name, "name");
    bindInput(els.date, "date", "change");
    bindInput(els.guests, "guests", "change");
    bindInput(els.area, "area");
    bindInput(els.notes, "notes");
    bindInput(els.updates, "updates");

    // Focus mode
    const on = () => { els.panel.classList.add("isFocus"); els.overlay.classList.add("isOn"); };
    const off = () => { els.panel.classList.remove("isFocus"); els.overlay.classList.remove("isOn"); };
    els.form.addEventListener("focusin", on);
    els.overlay.addEventListener("click", off);
    document.addEventListener("keydown", (e) => { if(e.key === "Escape") off(); });

    // Validation intercept
    const intercept = async (e) => {
      const msg = buildMessage();
      await silentCopy(msg);
      if(!validate()){
        e.preventDefault();
      }
    };
    [els.heroText, els.heroEmail, els.formText, els.formEmail, els.stickyText].forEach(a => a && a.addEventListener("click", intercept));
  }

  function hydrate(){
    els.name.value = state.fields.name || "";
    els.date.value = state.fields.date || "";
    els.guests.value = state.fields.guests || "";
    els.area.value = state.fields.area || "";
    els.notes.value = state.fields.notes || "";
    els.updates.value = state.fields.updates || "";
  }

  // Scroll reveal (cheap but premium)
  function initReveal(){
    const nodes = $$(".reveal");
    if(!("IntersectionObserver" in window)){
      nodes.forEach(n => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if(en.isIntersecting){
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -10% 0px" });
    nodes.forEach(n => io.observe(n));
  }

  load();
  attach();
  hydrate();
  setExp(state.exp);
  initReveal();
})();
