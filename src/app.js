import { createLeadId, deliverLead } from './lead-delivery.mjs?v=20260824-metrika-goals-1';
import { getFirstTouchAttribution, getMessengerChannel } from './tracking.mjs?v=20260824-metrika-goals-1';

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
    return getFirstTouchAttribution(window.location.href, localStorage);
  }

  function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
      return '+7' + digits.slice(1);
    }
    if (digits.length === 10 && digits[0] !== '7' && digits[0] !== '8') {
      return '+7' + digits;
    }
    return raw.trim();
  }

  function isValidPhone(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) return true;
    if (digits.length === 10 && digits[0] !== '7' && digits[0] !== '8') return true;
    return false;
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
    const siteHeader = document.querySelector('[data-header]');

    // Scroll-based header style
    if (siteHeader) {
      const onScroll = () => {
        siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (!toggle || !nav) return;

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    }

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) {
        closeNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

  function initGoals() {
    document.addEventListener('click', (event) => {
      const goalNode = event.target.closest('[data-goal]');
      const goal = goalNode ? goalNode.dataset.goal : '';
      if (goal && goal !== 'click_phone' && goal !== 'click_messenger') {
        reachGoal(goal, { href: goalNode.getAttribute('href') });
      }
      const phoneLink = event.target.closest('a[href^="tel:"]');
      if (phoneLink) reachGoal('click_phone', { href: phoneLink.getAttribute('href') });
      const messengerChannel = goalNode ? getMessengerChannel(goalNode.getAttribute('href'), goal) : '';
      if (messengerChannel) reachGoal('click_messenger', { channel: messengerChannel });
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

    document.querySelectorAll('[data-open-form]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (trigger.dataset.service) {
          document.querySelectorAll('[data-lead-form] [name="service"]').forEach((input) => {
            input.value = trigger.dataset.service;
          });
        }
        const targetHref = trigger.getAttribute('href');
        if (targetHref && targetHref.startsWith('#')) {
          const target = document.querySelector(targetHref);
          if (target) {
            const phoneInTarget = target.querySelector('[data-phone-input]');
            if (phoneInTarget) {
              setTimeout(() => phoneInTarget.focus(), 200);
            }
          }
        }
      });
    });

    document.querySelectorAll('[data-lead-form]').forEach((form) => {
      const phoneInput = form.querySelector('[data-phone-input]');
      const nameInput  = form.querySelector('[name="name"]');
      const submitBtn  = form.querySelector('[data-submit-btn]');
      const successEl  = form.querySelector('[data-form-success]');
      const errorEl    = form.querySelector('[data-form-error]');
      if (!phoneInput || !submitBtn) return;

      phoneInput.addEventListener('input', () => {
        phoneInput.setCustomValidity('');
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (form.dataset.submitting === 'true') return;

        // honeypot
        const hp = form.querySelector('[name="website"]');
        if (hp && hp.value) return;

        const rawPhone = phoneInput.value.trim();
        if (!isValidPhone(rawPhone)) {
          phoneInput.setCustomValidity('Введите корректный номер телефона');
          phoneInput.reportValidity();
          return;
        }
        phoneInput.setCustomValidity('');

        const phone = normalizePhone(rawPhone);
        form.dataset.submitting = 'true';

        const leadId  = createLeadId();
        const formId  = form.dataset.formId || 'form';
        const service = form.querySelector('[name="service"]')?.value || 'Заявка с сайта';
        const name    = nameInput ? nameInput.value.trim() : '';
        const fields = { phone, service };
        if (name) fields.name = name;

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
        if (name) payload.name = name;

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
          reachGoal('lead_form', { form: formId, service });
          reachGoal('lead_form_success', { form: formId, service });
          reachGoal('lead_sent', { form: formId, phone });
          phoneInput.value = '';
          if (nameInput) nameInput.value = '';
          if (successEl) successEl.hidden = false;
          const fieldsWrap = form.querySelector('[data-form-fields]');
          if (fieldsWrap) fieldsWrap.hidden = true;
          const consent = form.querySelector('.form-consent');
          if (consent) consent.hidden = true;

        } catch (error) {
          saveError({ at: new Date().toISOString(), message: error.message, payload });
          if (errorEl) errorEl.hidden = false;
        } finally {
          form.dataset.submitting = 'false';
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
