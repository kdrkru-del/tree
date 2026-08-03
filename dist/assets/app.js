(function () {
  const config = window.TREE_SITE_CONFIG || {};
  const metrikaId = config.metrikaId;

  function reachGoal(goal, params) {
    if (!goal) return;
    if (metrikaId && window.ym) {
      window.ym(metrikaId, 'reachGoal', goal, params || {});
    }
    window.dispatchEvent(new CustomEvent('treeSiteGoal', { detail: { goal, params } }));
  }

  function getUtm() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];
    const current = {};
    keys.forEach((key) => {
      const value = params.get(key);
      if (value) current[key] = value;
    });
    if (Object.keys(current).length) {
      localStorage.setItem('tree_site_utm', JSON.stringify(current));
      localStorage.setItem('tree_site_entry_page', window.location.href);
    }
    try {
      return JSON.parse(localStorage.getItem('tree_site_utm') || '{}');
    } catch {
      return {};
    }
  }

  function loadIntegrations() {
    if (metrikaId) {
      (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
      window.ym(metrikaId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }

    if (config.novofonScriptUrl) {
      const script = document.createElement('script');
      script.src = config.novofonScriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
      }
    });
  }

  function initGoals() {
    document.addEventListener('click', (event) => {
      const goalNode = event.target.closest('[data-goal]');
      if (goalNode) reachGoal(goalNode.dataset.goal, { href: goalNode.getAttribute('href') });
      const phone = event.target.closest('a[href^="tel:"]');
      if (phone) reachGoal('phone_click', { href: phone.getAttribute('href') });
      const formLink = event.target.closest('[data-open-form]');
      if (formLink) {
        const service = formLink.dataset.service;
        const form = document.querySelector('[data-lead-form]');
        if (form && service) {
          const select = form.querySelector('[name="service"]');
          if (select) {
            const matching = [...select.options].find((option) => service.toLowerCase().includes(option.text.toLowerCase()));
            if (matching) select.value = matching.value;
          }
        }
        reachGoal('request_intent', { service });
      }
    });
  }

  function initCredits() {
    const toggle = document.querySelector('[data-credits-toggle]');
    const list = document.querySelector('[data-credits-list]');
    if (!toggle || !list) return;
    toggle.addEventListener('click', () => {
      list.hidden = !list.hidden;
    });
  }


  function initHomeAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    document.body.classList.add('motion-ready');

    const heroItems = [
      ...document.querySelectorAll('.hero-copy > .eyebrow, .hero-copy h1, .hero-lead, .hero-copy > p:not(.eyebrow):not(.hero-lead), .hero-actions'),
      ...document.querySelectorAll('.hero-points li'),
      ...document.querySelectorAll('.hero-panel')
    ];

    heroItems.forEach((item, index) => {
      item.classList.add('hero-motion');
      item.style.setProperty('--motion-index', index);
    });

    const revealItems = document.querySelectorAll([
      '#problems .section-head',
      '#problems .problem-card',
      '#services .section-head',
      '#services .service-card',
      '.split-panel > *',
      '#process .section-head',
      '#process .timeline article',
      '.trust-grid > *',
      '#works .section-head',
      '#works .work-card',
      '#prices .section-head',
      '#prices .factor-cloud span',
      '#organizations .org-grid > *',
      '#areas .section-head',
      '#areas .area-grid span',
      '#faq .section-head',
      '#faq details',
      '.lead-section .lead-grid > *'
    ].join(','));

    revealItems.forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-index', index % 8);
    });

    requestAnimationFrame(() => {
      document.body.classList.add('hero-animated');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item) => observer.observe(item));
  }

  function initForms() {
    const utm = getUtm();
    document.querySelectorAll('[data-lead-form]').forEach((form) => {
      const steps = [...form.querySelectorAll('[data-step]')];
      const progress = form.querySelector('[data-progress]');
      const success = form.querySelector('[data-form-success]');
      const fileInput = form.querySelector('[data-photo-input]');
      const fileStatus = form.querySelector('[data-file-status]');
      const entryPage = form.querySelector('[name="entry_page"]');
      const requestedService = new URLSearchParams(window.location.search).get('service');
      let current = 0;
      let started = false;

      if (entryPage) {
        entryPage.value = localStorage.getItem('tree_site_entry_page') || window.location.href;
      }

      if (requestedService) {
        const select = form.querySelector('[name="service"]');
        if (select) {
          const normalized = requestedService.toLowerCase();
          const matching = [...select.options].find((option) => normalized.includes(option.text.toLowerCase()) || option.text.toLowerCase().includes(normalized));
          if (matching) select.value = matching.value;
        }
      }

      function showStep(index) {
        current = Math.max(0, Math.min(index, steps.length - 1));
        steps.forEach((step, stepIndex) => {
          step.hidden = stepIndex !== current;
        });
        if (progress) progress.style.width = `${((current + 1) / steps.length) * 100}%`;
      }

      function validCurrentStep() {
        const fields = [...steps[current].querySelectorAll('input, select, textarea')].filter((field) => !field.disabled);
        return fields.every((field) => field.reportValidity());
      }

      form.addEventListener('input', () => {
        if (!started) {
          started = true;
          reachGoal('form_start');
        }
      }, { once: true });

      form.querySelectorAll('[data-next]').forEach((button) => {
        button.addEventListener('click', () => {
          if (validCurrentStep()) showStep(current + 1);
        });
      });

      form.querySelectorAll('[data-prev]').forEach((button) => {
        button.addEventListener('click', () => showStep(current - 1));
      });

      if (fileInput && fileStatus) {
        fileInput.addEventListener('change', () => {
          const files = [...fileInput.files].slice(0, 10);
          if (fileInput.files.length > 10) {
            fileInput.value = '';
            fileStatus.textContent = 'Можно загрузить до 10 файлов';
            return;
          }
          const totalMb = files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;
          fileStatus.textContent = files.length ? `${files.length} файл(ов), ${totalMb.toFixed(1)} МБ` : 'Файлы не выбраны';
          reachGoal('photo_upload', { count: files.length });
        });
      }

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validCurrentStep()) return;
        if (form.website && form.website.value) return;

        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.disabled = true;

        const data = new FormData(form);
        const files = [...(fileInput ? fileInput.files : [])].slice(0, 10);
        const payload = {
          created_at: new Date().toISOString(),
          source: document.referrer || 'direct',
          page: window.location.href,
          entry_page: data.get('entry_page') || window.location.href,
          utm,
          fields: {
            service: data.get('service'),
            region: data.get('region'),
            city: data.get('city'),
            address: data.get('address'),
            tree_count: data.get('tree_count'),
            height: data.get('height'),
            desired_date: data.get('desired_date'),
            conditions: data.getAll('conditions'),
            name: data.get('name'),
            phone: data.get('phone'),
            contact_method: data.get('contact_method'),
            comment: data.get('comment')
          },
          files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
          crm: {
            stage: 'новая заявка',
            status_order: '',
            responsible_manager: '',
            assigned_team: '',
            preliminary_price: '',
            final_price: '',
            commission_amount: ''
          }
        };

        saveLead(payload);

        try {
          if (config.leadEndpoint) {
            await fetch(config.leadEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              keepalive: true
            });
          }
          reachGoal('form_submit', { service: payload.fields.service });
          reachGoal('estimate_request', { service: payload.fields.service });
          form.querySelectorAll('fieldset').forEach((fieldset) => { fieldset.hidden = true; });
          if (success) success.hidden = false;
          form.reset();
        } catch (error) {
          saveError({ at: new Date().toISOString(), message: error.message, payload });
          alert('Заявка сохранена в резерве. Пожалуйста, позвоните нам или попробуйте отправить еще раз.');
        } finally {
          if (submit) submit.disabled = false;
        }
      });

      showStep(0);
    });
  }

  function saveLead(payload) {
    const key = 'tree_site_leads_backup';
    const leads = JSON.parse(localStorage.getItem(key) || '[]');
    leads.push(payload);
    localStorage.setItem(key, JSON.stringify(leads.slice(-30)));
  }

  function saveError(error) {
    const key = 'tree_site_form_errors';
    const errors = JSON.parse(localStorage.getItem(key) || '[]');
    errors.push(error);
    localStorage.setItem(key, JSON.stringify(errors.slice(-30)));
  }

  loadIntegrations();
  initNav();
  initHomeAnimations();
  initGoals();
  initCredits();
  initForms();
})();
