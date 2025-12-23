(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const clean = v => (v ?? '').toString().trim();
  const enc = s => encodeURIComponent((s ?? '').toString());

  const PHONE = '+14698857589';
  const EMAIL = 'info@ttpkitchen.com';

  const els = {
    experience: $('#experience'),
    guests: $('#guests'),
    date: $('#date'),
    area: $('#area'),
    notes: $('#notes'),
    startSms: $('#startSms'),
    startEmail: $('#startEmail'),
    barSms: $('#barSms'),
    barEmail: $('#barEmail'),
    toast: $('#toast')
  };

  const getChipExp = () => {
    const active = document.querySelector('[data-experience][aria-pressed="true"]');
    return clean(active?.getAttribute('data-experience') || active?.textContent);
  };

  const build = () => {
    const exp = clean(els.experience?.value) || getChipExp();
    const guests = clean(els.guests?.value);
    const date = clean(els.date?.value);
    const area = clean(els.area?.value);
    const notes = clean(els.notes?.value);

    const parts = ['Hey Chef CP,'];
    if (exp) parts.push(`Experience: ${exp}`);
    if (guests) parts.push(`Guests: ${guests}`);
    if (date) parts.push(`Date: ${date}`);
    if (area) parts.push(`Area: ${area}`);
    if (notes) parts.push(`Notes: ${notes}`);
    return parts.join(' | ');
  };

  const setLinks = () => {
    const body = enc(build());
    const subject = enc('TTP Kitchen — Ticket');

    const sms = `sms:${PHONE}?&body=${body}`;
    const mail = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    [els.startSms, els.barSms].filter(Boolean).forEach(a => a.href = sms);
    [els.startEmail, els.barEmail].filter(Boolean).forEach(a => a.href = mail);
  };

  const toast = (t='LOCKED') => {
    if (!els.toast) return;
    els.toast.textContent = t;
    els.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove('show'), 1400);
  };

  // Pills clickable + sync dropdown
  document.querySelectorAll('[data-experience]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('[data-experience]').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      const v = clean(btn.getAttribute('data-experience') || btn.textContent);
      if (els.experience) els.experience.value = v;
      setLinks();
    }, {passive:false});
  });

  // Update links on input/change
  ['input','change'].forEach(evt => {
    ['experience','guests','date','area','notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(evt, setLinks, {passive:true});
    });
  });

  // Push latest at click-time
  ['startSms','startEmail','barSms','barEmail'].forEach(id => {
    const a = document.getElementById(id);
    if (!a) return;
    a.addEventListener('click', () => { setLinks(); toast(); }, {capture:true});
  });

  setLinks();
})();