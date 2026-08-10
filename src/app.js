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

  function createLeadId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function selectService(form, requestedService) {
    if (!form || !requestedService) return;
    const radios = [...form.querySelectorAll('input[name="service"]')];
    const normalized = String(requestedService).toLowerCase();
    const exact = radios.find((radio) => {
      const value = radio.value.toLowerCase();
      return normalized.includes(value) || value.includes(normalized);
    });

    let match = exact;
    if (!match) {
      const mappings = [
        { words: ['аварийн'], value: 'Аварийное дерево' },
        { words: ['обрез', 'плодов'], value: 'Обрезать дерево' },
        { words: ['вывоз'], value: 'Вывоз веток' },
        { words: ['ветк', 'щеп', 'измельч'], value: 'Измельчить ветки' },
        { words: ['пень', 'пня', 'пней', 'корч'], value: 'Удалить пень' },
        { words: ['расчист'], value: 'Расчистить участок' },
        { words: ['спил', 'сух', 'дерев'], value: 'Спилить дерево' }
      ];
      const mapping = mappings.find((item) => item.words.some((word) => normalized.includes(word)));
      match = radios.find((radio) => radio.value === (mapping ? mapping.value : 'Другое'));
    }

    if (match) {
      match.checked = true;
      match.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function formatLeadMessage(payload) {
    const fields = payload.fields || {};
    const lines = [
      '🌳 Новая заявка с zelsrez.ru',
      payload.lead_id ? `Номер: ${payload.lead_id}` : '',
      fields.service ? `Услуга: ${fields.service}` : '',
      fields.phone ? `Телефон: ${fields.phone}` : '',
      fields.name ? `Имя: ${fields.name}` : '',
      fields.city ? `Населенный пункт: ${fields.city}` : '',
      fields.comment ? `Комментарий: ${fields.comment}` : '',
      payload.files && payload.files.length
        ? `Выбрано фото: ${payload.files.length}. Прикрепите их к сообщению в WhatsApp.`
        : '',
      payload.page ? `Страница: ${payload.page}` : ''
    ];
    return lines.filter(Boolean).join('\n');
  }

  function whatsappDraftUrl(payload) {
    if (!config.messengerUrl) return '';
    try {
      const url = new URL(config.messengerUrl, window.location.origin);
      if (url.hostname !== 'wa.me' && url.hostname !== 'api.whatsapp.com') return '';
      url.searchParams.set('text', formatLeadMessage(payload));
      return url.toString();
    } catch {
      return '';
    }
  }

  function openWhatsAppDraft(payload) {
    const url = whatsappDraftUrl(payload);
    if (!url) return { opened: false, url: '' };
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    return { opened: Boolean(opened), url };
  }

  async function deliverLead(payload, files = []) {
    if (!config.leadEndpoint) {
      return { method: 'whatsapp', ...openWhatsAppDraft(payload) };
    }

    const requestOptions = { method: 'POST' };
    if (files.length) {
      const body = new FormData();
      body.append('payload', JSON.stringify(payload));
      files.forEach((file) => body.append('photos', file, file.name));
      requestOptions.body = body;
    } else {
      requestOptions.headers = { 'Content-Type': 'application/json' };
      requestOptions.body = JSON.stringify(payload);
      requestOptions.keepalive = true;
    }

    const response = await fetch(config.leadEndpoint, requestOptions);
    const responseData = await response.json().catch(() => null);

    if (!response.ok || (responseData && responseData.ok === false)) {
      throw new Error(`Сервис заявок ответил с кодом ${response.status}`);
    }

    return { method: 'endpoint', opened: false, url: '', response: responseData };
  }

  function showSubmissionState(node, { title, text, messengerUrl = '' }) {
    if (!node) return;
    const titleNode = node.querySelector('[data-submission-title]');
    const textNode = node.querySelector('[data-submission-text]');
    const linkNode = node.querySelector('[data-submission-link]');
    if (titleNode) titleNode.textContent = title;
    if (textNode) textNode.textContent = text;
    node.classList.toggle('is-messenger-fallback', Boolean(messengerUrl));
    if (linkNode) {
      linkNode.hidden = !messengerUrl;
      if (messengerUrl) linkNode.href = messengerUrl;
    }
    node.hidden = false;
  }

  function recordDeliveryError(error, payload) {
    const key = 'tree_site_form_errors';
    const errors = JSON.parse(localStorage.getItem(key) || '[]');
    errors.push({
      at: new Date().toISOString(),
      lead_id: payload.lead_id,
      message: error instanceof Error ? error.message : String(error)
    });
    localStorage.setItem(key, JSON.stringify(errors.slice(-10)));
  }

  function loadIntegrations() {
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
      const formLink = event.target.closest('[data-open-form]');
      if (formLink) {
        const service = formLink.dataset.service;
        const form = document.querySelector('[data-lead-form]');
        selectService(form, service);
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
      ...document.querySelectorAll('.hero-copy > .hero-badge, .hero-copy h1, .hero-lead, .hero-actions'),
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
      '#videos .section-head',
      '#videos .short-card',
      '#prices .section-head',
      '#factors .factor-card',
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
              lead_id: createLeadId(),
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

          try {
            const result = await deliverLead(payload);
            reachGoal('lead_phone');
            if (result.method === 'endpoint') {
              showSubmissionState(successMsg, {
                title: 'Заявка отправлена.',
                text: 'Менеджер свяжется с вами.'
              });
            } else {
              showSubmissionState(successMsg, {
                title: result.opened ? 'Открылся WhatsApp.' : 'Отправьте заявку в WhatsApp.',
                text: 'Проверьте сообщение и нажмите «Отправить».',
                messengerUrl: result.url
              });
              reachGoal('lead_whatsapp_fallback');
            }
            phoneInput.closest('.quick-lead-field').hidden = true;
          } catch (error) {
             recordDeliveryError(error, payload);
             const fallback = openWhatsAppDraft(payload);
             showSubmissionState(successMsg, {
               title: 'Автоматическая отправка не сработала.',
               text: fallback.url
                 ? 'Мы открыли WhatsApp: проверьте сообщение и нажмите «Отправить».'
                 : 'Пожалуйста, позвоните нам по номеру в шапке сайта.',
               messengerUrl: fallback.url
             });
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
      selectService(form, requestedService);

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
          lead_id: createLeadId(),
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

        try {
          const result = await deliverLead(payload, files);
          form.querySelectorAll('fieldset').forEach((fieldset) => { fieldset.hidden = true; });
          if (progress) progress.parentElement.hidden = true;
          if (result.method === 'endpoint') {
            reachGoal('lead_form', { service: payload.fields.service });
            reachGoal('form_complete', { service: payload.fields.service });
            showSubmissionState(success, {
              title: 'Спасибо! Заявка отправлена.',
              text: 'Менеджер компании свяжется с вами для уточнения информации.'
            });
          } else {
            reachGoal('lead_whatsapp_fallback', { service: payload.fields.service });
            showSubmissionState(success, {
              title: result.opened ? 'Открылся WhatsApp.' : 'Отправьте заявку в WhatsApp.',
              text: files.length
                ? 'Проверьте сообщение, прикрепите выбранные фотографии и нажмите «Отправить».'
                : 'Проверьте сообщение и нажмите «Отправить».',
              messengerUrl: result.url
            });
          }
          form.reset();
        } catch (error) {
          recordDeliveryError(error, payload);
          const fallback = openWhatsAppDraft(payload);
          if (fallback.url) {
            form.querySelectorAll('fieldset').forEach((fieldset) => { fieldset.hidden = true; });
            if (progress) progress.parentElement.hidden = true;
          }
          showSubmissionState(success, {
            title: 'Автоматическая отправка не сработала.',
            text: fallback.url
              ? 'Мы открыли WhatsApp: проверьте сообщение, при необходимости добавьте фотографии и нажмите «Отправить».'
              : 'Пожалуйста, позвоните нам по номеру в шапке сайта или попробуйте еще раз.',
            messengerUrl: fallback.url
          });
        } finally {
          if (submit) submit.disabled = false;
        }
      });

      showStep(0);
    });
  }

  loadIntegrations();
  initNav();
  initGoals();
  initHomeAnimations();
  initQuickLead();
  initForms();
})();
