(() => {
  'use strict';

  if (window.__TTP_APP_READY__) return;
  window.__TTP_APP_READY__ = true;

  const PHONE = '+14698857589';
  const EMAIL = 'info@ttpkitchen.com';
  const DEFAULT_EXPERIENCE = 'Private Chef';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const clean = (value) =>
    String(value ?? '').trim();

  const encode = (value) =>
    encodeURIComponent(String(value ?? ''));

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  const createSmsLink = (body) => {
    const separator = isIOS() ? '&' : '?';
    return `sms:${PHONE}${separator}body=${encode(body)}`;
  };

  const createEmailLink = (subject, body) =>
    `mailto:${EMAIL}?subject=${encode(subject)}&body=${encode(body)}`;

  const elements = {
    chips: $$('[data-experience]'),
    experience: $('#experience'),
    experienceAssist: $('#experienceAssist'),

    name: $('#name'),
    updates: $('#updates'),
    date: $('#date'),
    guests: $('#guests'),
    area: $('#area'),
    notes: $('#notes'),

    fieldNameWrap: $('#fieldNameWrap'),
    fieldUpdatesWrap: $('#fieldUpdatesWrap'),
    fieldDateWrap: $('#fieldDateWrap'),
    fieldGuestsWrap: $('#fieldGuestsWrap'),
    fieldAreaWrap: $('#fieldAreaWrap'),
    fieldNotesWrap: $('#fieldNotesWrap'),

    heroSms: $('#heroSms'),
    heroEmail: $('#heroEmail'),
    startSms: $('#startSms'),
    startEmail: $('#startEmail'),
    barSms: $('#barSms'),
    barEmail: $('#barEmail'),

    heroPurchase: $('#heroPurchase'),

    steps: $$('.step[data-step]'),
    rosTitle: $('#rosTitle'),
    rosBody: $('#rosBody'),
    needBooking: $('#needBooking'),
    needDrops: $('#needDrops'),

    toast: $('#toast'),
    toastText: $('#toastText'),
    year: $('#year')
  };

  const experienceContent = {
    'Private Chef': {
      assist: 'For nights that deserve a memory.',
      title: 'Pick the experience',
      body:
        'Private Chef service begins with your date, guest count, area, and any helpful notes.'
    },

    Catering: {
      assist: 'For gatherings served with intention.',
      title: 'Share the event details',
      body:
        'Catering begins with your date, guest count, service area, and the details that shape the moment.'
    },

    'Plate Drops': {
      assist: 'For flavor that meets you where you are.',
      title: 'Join the next plate drop',
      body:
        'Send your name and any optional updates so Chef CP can follow up with the next available drop.'
    }
  };

  const stepContent = {
    1: {
      title: 'Pick the experience',
      body:
        'Private Chef, Catering, or Plate Drops. Start with the service that fits the moment.'
    },

    2: {
      title: 'Share the essentials',
      body:
        'Send the details needed to review your request clearly and prepare the right next step.'
    },

    3: {
      title: 'Chef CP follows through',
      body:
        'Your request opens in text or email so the plan can be confirmed directly.'
    }
  };

  let toastTimer = null;

  const getExperience = () => {
    const selected = clean(elements.experience?.value);

    if (selected) return selected;

    const activeChip = $(
      '[data-experience][aria-pressed="true"]'
    );

    return (
      clean(activeChip?.dataset.experience) ||
      DEFAULT_EXPERIENCE
    );
  };

  const setVisible = (element, visible) => {
    if (!element) return;

    element.hidden = !visible;
    element.setAttribute(
      'aria-hidden',
      visible ? 'false' : 'true'
    );
  };

  const formatDate = (value) => {
    const raw = clean(value);

    if (!raw) return '';

    const date = new Date(`${raw}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return raw;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const showToast = (message = 'REQUEST READY') => {
    if (!elements.toast) return;

    const target =
      elements.toastText || elements.toast;

    target.textContent = message;

    elements.toast.classList.add('is-on');
    elements.toast.setAttribute(
      'aria-hidden',
      'false'
    );

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('is-on');
      elements.toast.setAttribute(
        'aria-hidden',
        'true'
      );
    }, 1500);
  };

  const syncChips = (experience) => {
    elements.chips.forEach((chip) => {
      const isActive =
        clean(chip.dataset.experience) ===
        experience;

      chip.classList.toggle(
        'is-active',
        isActive
      );

      chip.setAttribute(
        'aria-pressed',
        isActive ? 'true' : 'false'
      );
    });
  };

  const syncExperienceFields = () => {
    const experience = getExperience();
    const isPlateDrops =
      experience === 'Plate Drops';

    setVisible(
      elements.fieldNameWrap,
      isPlateDrops
    );

    setVisible(
      elements.fieldUpdatesWrap,
      isPlateDrops
    );

    setVisible(
      elements.fieldDateWrap,
      !isPlateDrops
    );

    setVisible(
      elements.fieldGuestsWrap,
      !isPlateDrops
    );

    setVisible(
      elements.fieldAreaWrap,
      !isPlateDrops
    );

    setVisible(
      elements.fieldNotesWrap,
      !isPlateDrops
    );

    setVisible(
      elements.needBooking,
      !isPlateDrops
    );

    setVisible(
      elements.needDrops,
      isPlateDrops
    );

    const content =
      experienceContent[experience] ||
      experienceContent[DEFAULT_EXPERIENCE];

    if (elements.experienceAssist) {
      elements.experienceAssist.textContent =
        content.assist;
    }

    if (elements.rosTitle) {
      elements.rosTitle.textContent =
        content.title;
    }

    if (elements.rosBody) {
      elements.rosBody.textContent =
        content.body;
    }
  };

  const buildMessage = () => {
    const experience = getExperience();

    const lines = [
      'Hey Chef CP,',
      '',
      `Experience: ${experience}`
    ];

    if (experience === 'Plate Drops') {
      const name = clean(
        elements.name?.value
      );

      const updates = clean(
        elements.updates?.value
      );

      if (name) {
        lines.push(`Name: ${name}`);
      }

      if (updates) {
        lines.push(`Updates: ${updates}`);
      }
    } else {
      const date = formatDate(
        elements.date?.value
      );

      const guests = clean(
        elements.guests?.value
      );

      const area = clean(
        elements.area?.value
      );

      const notes = clean(
        elements.notes?.value
      );

      if (date) {
        lines.push(`Date: ${date}`);
      }

      if (guests) {
        lines.push(`Guests: ${guests}`);
      }

      if (area) {
        lines.push(`Area: ${area}`);
      }

      if (notes) {
        lines.push(`Notes: ${notes}`);
      }
    }

    lines.push('', 'Thank you.');

    return lines.join('\n');
  };

  const refreshLinks = () => {
    const experience = getExperience();
    const body = buildMessage();

    const sms = createSmsLink(body);

    const email = createEmailLink(
      `TTP Kitchen — ${experience} Request`,
      body
    );

    [
      elements.heroSms,
      elements.startSms,
      elements.barSms
    ]
      .filter(Boolean)
      .forEach((link) => {
        link.href = sms;
      });

    [
      elements.heroEmail,
      elements.startEmail,
      elements.barEmail
    ]
      .filter(Boolean)
      .forEach((link) => {
        link.href = email;
      });
  };

  const setExperience = (
    experience,
    announce = false
  ) => {
    const next =
      clean(experience) ||
      DEFAULT_EXPERIENCE;

    if (elements.experience) {
      elements.experience.value = next;
    }

    syncChips(next);
    syncExperienceFields();
    refreshLinks();

    if (announce) {
      showToast('EXPERIENCE SET');
    }
  };

  const setStep = (stepNumber) => {
    const content =
      stepContent[stepNumber] ||
      stepContent[1];

    elements.steps.forEach((step) => {
      const active =
        Number(step.dataset.step) ===
        Number(stepNumber);

      step.classList.toggle(
        'is-active',
        active
      );

      step.setAttribute(
        'aria-selected',
        active ? 'true' : 'false'
      );

      step.tabIndex = active ? 0 : -1;
    });

    if (elements.rosTitle) {
      elements.rosTitle.textContent =
        content.title;
    }

    if (elements.rosBody) {
      elements.rosBody.textContent =
        content.body;
    }
  };

  const initializeRevealMotion = () => {
    const items = $$('.reveal');

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => {
        item.classList.add('is-visible');
      });

      return;
    }

    document.documentElement.classList.add(
      'reveal-on'
    );

    const observer =
      new IntersectionObserver(
        (entries, instance) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              'is-visible'
            );

            instance.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -6% 0px'
        }
      );

    items.forEach((item) => {
      observer.observe(item);
    });
  };

  const bindEvents = () => {
    elements.chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        setExperience(
          chip.dataset.experience,
          true
        );
      });
    });

    if (elements.experience) {
      elements.experience.addEventListener(
        'change',
        () => {
          setExperience(
            elements.experience.value,
            true
          );
        }
      );
    }

    [
      elements.name,
      elements.updates,
      elements.date,
      elements.guests,
      elements.area,
      elements.notes
    ]
      .filter(Boolean)
      .forEach((field) => {
        field.addEventListener(
          'input',
          refreshLinks,
          { passive: true }
        );

        field.addEventListener(
          'change',
          refreshLinks,
          { passive: true }
        );
      });

    [
      elements.heroSms,
      elements.startSms,
      elements.barSms,
      elements.heroEmail,
      elements.startEmail,
      elements.barEmail
    ]
      .filter(Boolean)
      .forEach((link) => {
        link.addEventListener(
          'click',
          () => {
            refreshLinks();
            showToast('REQUEST READY');
          },
          { capture: true }
        );
      });

    if (elements.heroPurchase) {
      elements.heroPurchase.addEventListener(
        'click',
        () => {
          showToast(
            'OPENING SECURE CHECKOUT'
          );
        }
      );
    }

    elements.steps.forEach((step) => {
      step.addEventListener('click', () => {
        setStep(
          Number(step.dataset.step)
        );
      });

      step.addEventListener(
        'keydown',
        (event) => {
          const allowedKeys = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown'
          ];

          if (
            !allowedKeys.includes(event.key)
          ) {
            return;
          }

          event.preventDefault();

          const currentIndex =
            elements.steps.indexOf(step);

          const direction =
            event.key === 'ArrowRight' ||
            event.key === 'ArrowDown'
              ? 1
              : -1;

          const nextIndex =
            (
              currentIndex +
              direction +
              elements.steps.length
            ) %
            elements.steps.length;

          const nextStep =
            elements.steps[nextIndex];

          nextStep.focus();

          setStep(
            Number(nextStep.dataset.step)
          );
        }
      );
    });
  };

  const initialize = () => {
    document.documentElement.classList.add(
      'js'
    );

    if (elements.year) {
      elements.year.textContent =
        String(new Date().getFullYear());
    }

    bindEvents();
    setExperience(getExperience());
    setStep(1);
    initializeRevealMotion();
  };

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
