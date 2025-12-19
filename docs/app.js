const CONTACT={phone:"+14698857589",email:"info@ttpkitchen.com"};const HELP={ "Private Chef":"A dinner that feels like you did it right.","Catering":"Your gathering — handled.","Plate Drops":"When you want TTP on your time."};const enc=v=>encodeURIComponent(v);const trim=v=>(v||"").trim();function addLine(lines,label,value){const v=trim(value);if(v)lines.push(`${label}: ${v}`);}function buildSmsBody(d){const lines=[];if(d.experience==="Plate Drops"){lines.push("Hey Chef CP — I want in on the next plate drop.");addLine(lines,"Name",d.name);addLine(lines,"Notes",d.updates);lines.push("","Send the next drop details when you can.");return lines.join("\n");}lines.push("Hey Chef CP — I’m ready to book the TTP experience.");lines.push("");addLine(lines,"Experience",d.experience);addLine(lines,"Date",d.date);addLine(lines,"Guests",d.guests);addLine(lines,"Area",d.area);addLine(lines,"Notes",d.notes);lines.push("","Let me know what you need from me to lock it in.");return lines.join("\n");}function smsHref(body){return `sms:${CONTACT.phone}?&body=${enc(body)}`;}function mailHref(d){const subject=enc("TTP Kitchen Inquiry");const lines=["Hey Chef CP,","", "I’m ready to move forward.",""];addLine(lines,"Experience",d.experience);if(d.experience==="Plate Drops"){addLine(lines,"Name",d.name);addLine(lines,"Notes",d.updates);lines.push("","Send the next drop details when you can.","","Thanks!");}else{addLine(lines,"Date",d.date);addLine(lines,"Guests",d.guests);addLine(lines,"Area",d.area);addLine(lines,"Notes",d.notes);lines.push("","Let me know what you need from me to lock it in.","","Thanks!");}return `mailto:${CONTACT.email}?subject=${subject}&body=${enc(lines.join("\n"))}`;}async function silentCopy(text){try{await navigator.clipboard.writeText(text);}catch{}}function haptic(ms=10){if("vibrate"in navigator)navigator.vibrate(ms);}const toast=document.getElementById("toast");const toastText=document.getElementById("toastText");let toastTimer=null;function showToast(msg="READY"){if(!toast||!toastText)return;toastText.textContent=msg;toast.classList.add("is-showing");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("is-showing"),900);}const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!reduceMotion){const revealEls=document.querySelectorAll(".reveal");const io=new IntersectionObserver((entries)=>{entries.forEach((e)=>{if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target);}});},{threshold:.14});revealEls.forEach(el=>io.observe(el));}else{document.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible"));}const yearEl=document.getElementById("year");if(yearEl)yearEl.textContent=new Date().getFullYear();const picks=Array.from(document.querySelectorAll(".pick[data-experience]"));const tabs=Array.from(document.querySelectorAll(".tab[data-filter]"));const tiles=Array.from(document.querySelectorAll(".tile[data-type]"));const chooseBtns=Array.from(document.querySelectorAll("[data-choose]"));const experienceSel=document.getElementById("experience");const helpEl=document.getElementById("experienceHelp");const summaryChip=document.getElementById("summaryChip");const nameWrap=document.getElementById("fieldNameWrap");const dateWrap=document.getElementById("fieldDateWrap");const guestsWrap=document.getElementById("fieldGuestsWrap");const areaWrap=document.getElementById("fieldAreaWrap");const notesWrap=document.getElementById("fieldNotesWrap");const updatesWrap=document.getElementById("fieldUpdatesWrap");const elName=document.getElementById("name");const elDate=document.getElementById("date");const elGuests=document.getElementById("guests");const elArea=document.getElementById("area");const elNotes=document.getElementById("notes");const elUpdates=document.getElementById("updates");const heroSms=document.getElementById("heroSms");const heroEmail=document.getElementById("heroEmail");const startSms=document.getElementById("startSms");const startEmail=document.getElementById("startEmail");const barSms=document.getElementById("barSms");function clearErrors(){[elName,elDate,elGuests,elArea].filter(Boolean).forEach(el=>el.classList.remove("is-error"));}function markError(el){if(!el)return;el.classList.add("is-error");setTimeout(()=>el.classList.remove("is-error"),950);}function setHelp(ex){if(helpEl)helpEl.textContent=HELP[ex]||"";if(summaryChip)summaryChip.textContent=(ex||"").toUpperCase();}function applyExperienceUI(ex){setHelp(ex);const isDrops=ex==="Plate Drops";if(nameWrap)nameWrap.hidden=!isDrops;if(updatesWrap)updatesWrap.hidden=!isDrops;if(dateWrap)dateWrap.hidden=isDrops;if(guestsWrap)guestsWrap.hidden=isDrops;if(areaWrap)areaWrap.hidden=isDrops;if(notesWrap)notesWrap.hidden=isDrops;clearErrors();}function setActivePick(ex){picks.forEach(b=>{const on=b.dataset.experience===ex;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",on?"true":"false");});}function setActiveTab(btn){tabs.forEach(b=>{const on=b===btn;b.classList.toggle("is-active",on);b.setAttribute("aria-selected",on?"true":"false");});}function applyFilter(key){tiles.forEach(t=>{const show=key==="all"||t.dataset.type===key;t.style.display=show?"":"none";});}function getData(){return{experience:experienceSel?.value||"Private Chef",name:elName?.value||"",date:elDate?.value||"",guests:elGuests?.value||"",area:elArea?.value||"",notes:elNotes?.value||"",updates:elUpdates?.value||""};}function validate(d){
  // Plate Drops: name required
  if(d.experience==="Plate Drops"){
    if(!trim(d.name)) return {ok:false,msg:"ADD NAME",field:elName};
    return {ok:true};
  }
  // Standard booking: require date -> guests -> area
  if(!trim(d.date)) return {ok:false,msg:"ADD DATE",field:elDate};
  if(!trim(d.guests)) return {ok:false,msg:"ADD GUESTS",field:elGuests};
  if(!trim(d.area)) return {ok:false,msg:"ADD AREA",field:elArea};
  return {ok:true};
}if(!trim(d.date))return{ok:false,msg:"ADD DATE",field:elDate};if(!trim(d.guests))return{ok:false,msg:"ADD GUESTS",field:elGuests};if(!trim(d.area))return{ok:false,msg:"ADD AREA",field:elArea};return{ok:true};}async function refresh(andToast=false){const d=getData();const body=buildSmsBody(d);const sms=smsHref(body);const mail=mailHref(d);if(heroSms)heroSms.href=sms;if(startSms)startSms.href=sms;if(barSms)barSms.href=sms;if(heroEmail)heroEmail.href=mail;if(startEmail)startEmail.href=mail;await silentCopy(body);if(andToast&&!reduceMotion){showToast("READY");haptic(10);}}function attachValidation(linkEl,mode){if(!linkEl)return;linkEl.addEventListener("click",(e)=>{const d=getData();const v=validate(d);if(!v.ok){e.preventDefault();showToast(v.msg);haptic(14);clearErrors();markError(v.field);v.field?.focus();return;}showToast(mode==="sms"?"TEXT READY":"EMAIL READY");});}picks.forEach(btn=>{btn.addEventListener("click",async()=>{const ex=btn.dataset.experience||"Private Chef";if(experienceSel)experienceSel.value=ex;setActivePick(ex);applyExperienceUI(ex);await refresh(true);});});chooseBtns.forEach(btn=>{btn.addEventListener("click",async()=>{const ex=btn.getAttribute("data-choose")||"Private Chef";if(experienceSel)experienceSel.value=ex;setActivePick(ex);applyExperienceUI(ex);document.getElementById("start")?.scrollIntoView({behavior: reduceMotion?"auto":"smooth",block:"start"});await refresh(true);});});tabs.forEach(btn=>{btn.addEventListener("click",()=>{setActiveTab(btn);applyFilter(btn.dataset.filter||"all");});});experienceSel?.addEventListener("change",async()=>{const ex=experienceSel.value;setActivePick(ex);applyExperienceUI(ex);await refresh(true);});[elName,elDate,elGuests,elArea,elNotes,elUpdates].filter(Boolean).forEach(el=>{el.addEventListener("input",()=>refresh(false));});attachValidation(heroSms,"sms");attachValidation(startSms,"sms");attachValidation(barSms,"sms");attachValidation(heroEmail,"email");attachValidation(startEmail,"email");const heroImg=document.getElementById("heroImg");function parallax(){if(!heroImg||reduceMotion)return;const rect=heroImg.getBoundingClientRect();const vh=window.innerHeight||800;if(!(rect.bottom>0&&rect.top<vh))return;const progress=rect.top/vh;const translate=Math.max(-10,Math.min(10,progress*-10));heroImg.style.transform=`scale(1.05) translateY(${translate}px)`;}window.addEventListener("scroll",()=>requestAnimationFrame(parallax),{passive:true});window.addEventListener("resize",()=>requestAnimationFrame(parallax));parallax();setActivePick("Private Chef");applyExperienceUI("Private Chef");refresh(false);



/* === Enhanced UX Layer === */
(function(){
  const $ = (id)=>document.getElementById(id);

  const startSection = $("start");
  const focusOverlay = $("focusOverlay");
  const body = document.body;

  // time-aware note
  const timeNote = $("timeNote");
  try{
    const h = new Date().getHours();
    if(timeNote){
      if(h >= 17 && h <= 23){
        timeNote.textContent = "Evenings carry the most magic — we’ll confirm availability and the best next move.";
      } else {
        timeNote.textContent = "Tell us what you’re planning — we’ll confirm availability and the best next move.";
      }
    }
  }catch{}

  // Focus mode (guided attention)
  function setFocusMode(on){
    body.classList.toggle("is-focus", !!on);
  }
  function onFocusIn(e){
    if(!startSection) return;
    if(startSection.contains(e.target)) setFocusMode(true);
  }
  function onFocusOut(e){
    if(!startSection) return;
    // if focus moved outside start section, turn off
    const to = e.relatedTarget;
    if(!to || !startSection.contains(to)) setFocusMode(false);
  }
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  focusOverlay?.addEventListener("click", ()=> setFocusMode(false));

  // Progressive disclosure
  const experienceSel = $("experience");
  const fieldDateWrap = $("fieldDateWrap");
  const fieldGuestsWrap = $("fieldGuestsWrap");
  const fieldAreaWrap = $("fieldAreaWrap");
  const fieldNotesWrap = $("fieldNotesWrap");
  const fieldNameWrap = $("fieldNameWrap");
  const fieldUpdatesWrap = $("fieldUpdatesWrap");

  const dateEl = $("date");
  const guestsEl = $("guests");
  const areaEl = $("area");
  const notesEl = $("notes");
  const nameEl = $("name");
  const updatesEl = $("updates");

  function hide(el){ if(!el) return; el.classList.add("is-hidden"); }
  function show(el){ if(!el) return; if(el.classList.contains("is-hidden")){ el.classList.remove("is-hidden"); el.classList.add("revealField"); setTimeout(()=>el.classList.remove("revealField"), 520);} }

  function applyProgress(ex){
    const isDrops = ex === "Plate Drops";
    // Start state
    if(isDrops){
      show(fieldNameWrap); show(fieldUpdatesWrap);
      hide(fieldDateWrap); hide(fieldGuestsWrap); hide(fieldAreaWrap); hide(fieldNotesWrap);
    } else {
      hide(fieldNameWrap); hide(fieldUpdatesWrap);
      show(fieldDateWrap);
      // gate rest until filled
      if(dateEl && dateEl.value){ show(fieldGuestsWrap); } else { hide(fieldGuestsWrap); hide(fieldAreaWrap); hide(fieldNotesWrap); }
      if(guestsEl && guestsEl.value){ show(fieldAreaWrap); } else { hide(fieldAreaWrap); hide(fieldNotesWrap); }
      if(areaEl && areaEl.value){ show(fieldNotesWrap); } else { hide(fieldNotesWrap); }
    }
  }

  function currentExperience(){ return experienceSel?.value || "Private Chef"; }

  // Input gating
  dateEl?.addEventListener("change", ()=> applyProgress(currentExperience()));
  guestsEl?.addEventListener("change", ()=> applyProgress(currentExperience()));
  areaEl?.addEventListener("input", ()=> applyProgress(currentExperience()));

  experienceSel?.addEventListener("change", ()=> applyProgress(currentExperience()));
  // initial
  applyProgress(currentExperience());

  // Intent memory (localStorage)
  const KEY = "ttp_cp_intent_v1";
  function readSaved(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return null;
      return JSON.parse(raw);
    }catch{ return null; }
  }
  function saveIntent(){
    try{
      const data = {
        experience: currentExperience(),
        name: nameEl?.value || "",
        date: dateEl?.value || "",
        guests: guestsEl?.value || "",
        area: areaEl?.value || "",
        notes: notesEl?.value || "",
        updates: updatesEl?.value || ""
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    }catch{}
  }

  const saved = readSaved();
  if(saved){
    try{
      if(experienceSel && saved.experience) experienceSel.value = saved.experience;
      if(nameEl && saved.name) nameEl.value = saved.name;
      if(dateEl && saved.date) dateEl.value = saved.date;
      if(guestsEl && saved.guests){
        // if guests select has that option, set it; else ignore
        const opt = Array.from(guestsEl.options || []).find(o => o.value === saved.guests);
        if(opt) guestsEl.value = saved.guests;
      }
      if(areaEl && saved.area) areaEl.value = saved.area;
      if(notesEl && saved.notes) notesEl.value = saved.notes;
      if(updatesEl && saved.updates) updatesEl.value = saved.updates;
      applyProgress(currentExperience());
    }catch{}
  }

  [experienceSel, nameEl, dateEl, guestsEl, areaEl, notesEl, updatesEl].filter(Boolean).forEach(el=>{
    el.addEventListener("input", saveIntent);
    el.addEventListener("change", saveIntent);
  });

})();
