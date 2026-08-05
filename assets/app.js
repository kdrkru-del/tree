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
      if (phone) reachGoal('click_phone', { href: phone.getAttribute('href') });
      const formLink = event.target.closest('[data-open-form]');
      if (formLink) {
        const service = formLink.dataset.service;
        const form = document.querySelector('[data-lead-form]');
        if (form && service) {
          const radio = form.querySelector(`input[name="service"][value="${service}"]`);
          if (radio) {
            radio.checked = true;
          } else {
             // If not an exact match, check 'Другое'
             const otherRadio = form.querySelector(`input[name="service"][value="Другое"]`);
             if (otherRadio) otherRadio.checked = true;
          }
        }
        reachGoal('click_calculate', { service });
      }
    });
  }

  function initHomeAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    document.body.classList.add('motion-ready');

    const heroItems = [
      ...document.querySelectorAll('.hero-copy > .hero-badge, .hero-copy h1, .hero-lead, .hero-actions, .hero-benefits'),
      document.querySelector('.hero-prices')
    ].filter(Boolean);

    heroItems.forEach((item, index) => {
      item.classList.add('hero-motion');
      item.style.setProperty('--motion-index', index);
    });

    const revealItems = document.querySelectorAll([
      '#problems .section-head',
      '#problems .problem-card',
      '#services .section-head',
      '#services .service-card',
      '#process .section-head',
      '#process .timeline article',
      '.trust-cards > *',
      '#works .section-head',
      '#works .work-card',
      '#prices .section-head',
      '#factors .factor-card',
      '#organizations .org-grid > *',
      '#areas .section-head',
      '#areas .area-grid span',
      '#faq .section-head',
      '#faq details',
      '.lead-section .lead-grid > *',
      '.branch-upsell-inner > *'
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

  function initQuickLead() {
      const quickForm = document.querySelector('[data-quick-lead-form]');
      if(!quickForm) return;

      const utm = getUtm();

      quickForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const btn = quickForm.querySelector('button[type="submit"]');
          const phoneInput = quickForm.querySelector('input[name="quick_phone"]');
          const phone = phoneInput.value;
          const successMsg = quickForm.querySelector('[data-quick-success]');

          if (btn) btn.disabled = true;

          const payload = {
              created_at: new Date().toISOString(),
              source: document.referrer || 'direct',
              page: window.location.href,
              entry_page: localStorage.getItem('tree_site_entry_page') || window.location.href,
              utm,
              fields: {
                  phone: phone,
                  service: 'Быстрый расчет',
                  comment: 'Заявка из формы "Узнайте стоимость вашего дерева"'
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
            reachGoal('lead_phone', { phone });
            if(successMsg) successMsg.hidden = false;
            phoneInput.closest('.quick-lead-field').hidden = true;
          } catch (error) {
             saveError({ at: new Date().toISOString(), message: error.message, payload });
             alert('Заявка сохранена в резерве. Пожалуйста, позвоните нам.');
          } finally {
             if (btn) btn.disabled = false;
          }
      });
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
      const branchAfterBlock = form.querySelector('[data-branch-after]');
      const serviceRadios = form.querySelectorAll('input[name="service"]');
      let current = 0;
      let started = false;

      if (entryPage) {
        entryPage.value = localStorage.getItem('tree_site_entry_page') || window.location.href;
      }

      // Check URL parameters for requested service
      const requestedService = new URLSearchParams(window.location.search).get('service');
      if (requestedService) {
        const normalized = requestedService.toLowerCase();
        const matchingRadio = [...serviceRadios].find((radio) =>
          normalized.includes(radio.value.toLowerCase()) || radio.value.toLowerCase().includes(normalized)
        );
        if (matchingRadio) {
            matchingRadio.checked = true;
        }
      }

      function updateBranchAfterVisibility() {
          if (!branchAfterBlock) return;
          const selected = form.querySelector('input[name="service"]:checked');
          if (selected && ['Спилить дерево', 'Аварийное дерево', 'Обрезать дерево', 'Расчистить участок'].includes(selected.value)) {
              branchAfterBlock.hidden = false;
          } else {
              branchAfterBlock.hidden = true;
              const afterInputs = branchAfterBlock.querySelectorAll('input');
              afterInputs.forEach(i => i.checked = false);
          }
      }

      serviceRadios.forEach(radio => radio.addEventListener('change', updateBranchAfterVisibility));
      updateBranchAfterVisibility(); // Init

      function showStep(index) {
        current = Math.max(0, Math.min(index, steps.length - 1));
        steps.forEach((step, stepIndex) => {
          step.hidden = stepIndex !== current;
        });
        if (progress) {
             progress.style.width = index === 0 ? '50%' : '100%';
        }
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

      // Save contact step
      const saveContactBtn = form.querySelector('[data-save-contact]');
      if (saveContactBtn) {
          saveContactBtn.addEventListener('click', async () => {
              if (validCurrentStep()) {
                  reachGoal('form_contact_saved');
                  reachGoal('form_step_1');
                  
                  // Optionally send partial lead here if needed.
                  // For now, just advance to step 2.
                  showStep(current + 1);
              }
          });
      }

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
          reachGoal('lead_photo', { count: files.length });
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
        
        let commentText = data.get('comment') || '';
        if (data.get('branch_after')) {
            commentText += `\nПосле работы с ветками: ${data.get('branch_after')}`;
        }

        const payload = {
          created_at: new Date().toISOString(),
          source: document.referrer || 'direct',
          page: window.location.href,
          entry_page: data.get('entry_page') || window.location.href,
          utm,
          fields: {
            service: data.get('service'),
            city: data.get('city'),
            name: data.get('name'),
            phone: data.get('phone'),
            comment: commentText.trim()
          },
          files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
          crm: {
            stage: 'новая заявка'
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
          reachGoal('lead_form', { service: payload.fields.service });
          reachGoal('form_complete', { service: payload.fields.service });
          form.querySelectorAll('fieldset').forEach((fieldset) => { fieldset.hidden = true; });
          if (progress) progress.parentElement.hidden = true;
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
  initQuickLead();
  initForms();
})();
