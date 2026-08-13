import { createLeadId, deliverLead } from './lead-delivery.mjs?v=20260813-video-sections-4';

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

  function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && digits[0] === '8') return '+7' + digits.slice(1);
    if (digits.length === 11 && digits[0] === '7') return '+' + digits;
    if (digits.length === 10) return '+7' + digits;
    return raw.trim();
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
      const phoneLink = event.target.closest('a[href^="tel:"]');
      if (phoneLink) reachGoal('click_phone', { href: phoneLink.getAttribute('href') });
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
      '.video-section .section-head',
      '.video-section .video-card',
      '.video-section .video-safety',
      '.video-section .video-cta',
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

  /* ─── ЕДИНЫЙ ОБРАБОТЧИК ВСЕХ ФОРМ ─── */
  function initLeadForms() {
    const utm = getUtm();

    document.querySelectorAll('[data-open-form][data-service]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const serviceInput = document.querySelector('#main-lead-form [name="service"]');
        if (serviceInput) serviceInput.value = trigger.dataset.service;
      });
    });

    document.querySelectorAll('[data-lead-form]').forEach((form) => {
      const phoneInput = form.querySelector('[data-phone-input]');
      const submitBtn  = form.querySelector('[data-submit-btn]');
      const successEl  = form.querySelector('[data-form-success]');
      const errorEl    = form.querySelector('[data-form-error]');
      if (!phoneInput || !submitBtn) return;

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // honeypot
        const hp = form.querySelector('[name="website"]');
        if (hp && hp.value) return;

        const rawPhone = phoneInput.value.trim();
        const phone    = normalizePhone(rawPhone);
        const digits   = phone.replace(/\D/g, '');

        if (digits.length < 10) {
          phoneInput.setCustomValidity('Введите корректный номер телефона');
          phoneInput.reportValidity();
          return;
        }
        phoneInput.setCustomValidity('');

        const leadId  = createLeadId();
        const formId  = form.dataset.formId || 'form';
        const service = form.querySelector('[name="service"]')?.value || 'Заявка с сайта';
        const fields = { phone, service };

        const payload = {
          lead_id:     leadId,
          created_at:  new Date().toISOString(),
          source:      document.referrer || 'direct',
          page:        window.location.href,
          page_title:  document.title,
          entry_page:  localStorage.getItem('tree_site_entry_page') || window.location.href,
          form:        formId,
          utm,
          phone:       fields.phone,
          service:     fields.service,
          fields
        };

        saveLead(payload);

        // UI: загрузка
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем…';
        if (successEl) successEl.hidden = true;
        if (errorEl)   errorEl.hidden   = true;

        try {
          await deliverLead(config.leadEndpoint, payload);

          // Успех — только после реального ответа сервера
          reachGoal('lead_form_success', { form: formId, service });
          reachGoal('lead_sent', { form: formId, phone });
          phoneInput.value = '';
          if (successEl) successEl.hidden = false;
          const fields = form.querySelector('[data-form-fields]');
          if (fields) fields.hidden = true;

        } catch (error) {
          saveError({ at: new Date().toISOString(), message: error.message, payload });
          if (errorEl) errorEl.hidden = false;
        } finally {
          submitBtn.disabled   = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  }

  loadIntegrations();
  initNav();
  initGoals();
  initHomeAnimations();
  initLeadForms();
})();
