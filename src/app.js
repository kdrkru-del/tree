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

  function initFloatingRail() {
    const rail = document.querySelector('.floating-contact-rail');
    if (!rail) return;
    const hero = document.getElementById('hero') || document.querySelector('.hero, .landing-hero, .inner-hero, .simple-hero');
    const updateRail = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const threshold = hero ? Math.max(600, hero.offsetTop + hero.offsetHeight - 80) : 600;
      rail.classList.toggle('is-visible', scrollY > threshold);
    };
    window.addEventListener('scroll', updateRail, { passive: true });
    updateRail();
  }

  function initGoals() {
    document.addEventListener('click', (event) => {
      const goalNode = event.target.closest('[data-goal]');
      const goal = goalNode ? goalNode.dataset.goal : '';
      if (goal && goal !== 'click_phone' && goal !== 'click_messenger') {
        reachGoal(goal, { href: goalNode.getAttribute('href') });
      }
      const phoneLink = event.target.closest('a[href^="tel:"]');
      if (phoneLink) {
        reachGoal('click_phone', { href: phoneLink.getAttribute('href') });
        reachGoal('phone_click', { href: phoneLink.getAttribute('href') });
      }
      const messengerChannel = goalNode ? getMessengerChannel(goalNode.getAttribute('href'), goal) : '';
      if (messengerChannel) {
        reachGoal('click_messenger', { channel: messengerChannel });
        if (messengerChannel === 'telegram') {
          reachGoal('telegram_click', { channel: 'telegram' });
        }
      }
    });

    document.addEventListener('play', (event) => {
      if (event.target && event.target.tagName === 'VIDEO') {
        reachGoal('video_play', { src: event.target.currentSrc || event.target.src });
      }
    }, true);

    const priceSection = document.getElementById('prices');
    if (priceSection && 'IntersectionObserver' in window) {
      let priceViewed = false;
      const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !priceViewed) {
            priceViewed = true;
            reachGoal('price_view');
            priceObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });
      priceObserver.observe(priceSection);
    }
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

  function syncErrorFallback(errorEl, payload) {
    if (!errorEl || !payload) return;
    const phone = payload.phone || (payload.fields && payload.fields.phone) || '';
    const name = payload.name || (payload.fields && payload.fields.name) || '';
    const service = payload.service || (payload.fields && payload.fields.service) || 'Спил деревьев';
    const textMsg = encodeURIComponent(
      `Здравствуйте! Заявка с сайта zelsrez.ru:\n• Услуга: ${service}\n• Телефон: ${phone}${name ? `\n• Имя: ${name}` : ''}`
    );
    const waLink = errorEl.querySelector('.form-error-wa');
    if (waLink && config.messengerUrl) {
      waLink.href = `${config.messengerUrl}?text=${textMsg}`;
    }
    const tgLink = errorEl.querySelector('.form-error-tg');
    if (tgLink && config.telegramUrl) {
      tgLink.href = `${config.telegramUrl}?text=${textMsg}`;
    }
  }

  /* ─── ЕДИНЫЙ ОБРАБОТЧИК ВСЕХ ФОРМ ─── */
  function initLeadForms() {
    const utm = getUtm();

    document.querySelectorAll('[data-open-form]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const popup = document.querySelector('[data-calc-popup]');
        if (popup) {
          event.preventDefault();
        }
        if (trigger.dataset.service) {
          document.querySelectorAll('[data-lead-form] [name="service"]').forEach((input) => {
            input.value = trigger.dataset.service;
          });
        }
        if (!popup) {
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
        }
      });
    });

    document.querySelectorAll('.hero-task-chips').forEach((chipGroup) => {
      const form = chipGroup.closest('form');
      if (!form) return;
      const serviceInput = form.querySelector('[name="service"]');
      chipGroup.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-set-service]');
        if (!chip) return;
        chipGroup.querySelectorAll('[data-set-service]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        if (serviceInput) {
          serviceInput.value = chip.dataset.setService;
        }
      });
    });

    document.querySelectorAll('[data-lead-form], [data-fast-lead-form], [data-quiz-form]').forEach((form) => {
      const phoneInput = form.querySelector('[data-phone-input]');
      const nameInput  = form.querySelector('[name="name"]');
      const submitBtn  = form.querySelector('[data-submit-btn]');
      const successEl  = form.querySelector('[data-form-success]');
      const errorEl    = form.querySelector('[data-form-error]');
      if (!phoneInput || !submitBtn) return;

      let abandonedTimer = null;
      const onPhoneEntered = (delayMs = 12000) => {
        if (form.dataset.submitting === 'true' || form.dataset.submitted === 'true') return;
        const raw = phoneInput.value.trim();
        if (!isValidPhone(raw)) return;
        if (sessionStorage.getItem('tree_abandon_tracked')) return;

        if (abandonedTimer) clearTimeout(abandonedTimer);
        abandonedTimer = setTimeout(() => {
          sendAbandoned();
        }, delayMs);
      };

      const sendAbandoned = () => {
        if (form.dataset.submitting === 'true' || form.dataset.submitted === 'true') return;
        if (sessionStorage.getItem('tree_abandon_tracked')) return;
        sessionStorage.setItem('tree_abandon_tracked', '1');

        const fId = form.dataset.formId || form.dataset.quizId || 'form';
        reachGoal('lead_form_abandon', { form: fId });
      };

      phoneInput.addEventListener('input', () => {
        phoneInput.setCustomValidity('');
        onPhoneEntered(15000);
      });

      phoneInput.addEventListener('blur', () => {
        onPhoneEntered(6000);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          const raw = phoneInput.value.trim();
          if (isValidPhone(raw)) {
            sendAbandoned();
          }
        }
      });

      phoneInput.addEventListener('focus', () => {
        if (!form.dataset.started) {
          form.dataset.started = 'true';
          reachGoal('lead_form_start', { form: form.dataset.formId || form.dataset.quizId || 'form' });
        }
      }, { once: true });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (abandonedTimer) clearTimeout(abandonedTimer);
        form.dataset.submitted = 'true';

        if (form.dataset.submitting === 'true') return;
        form.dataset.submitting = 'true'; // guard moved up — prevents double-submit

        // honeypot
        const hp = form.querySelector('[name="website"]');
        if (hp && hp.value) { form.dataset.submitting = 'false'; return; }

        const rawPhone = phoneInput.value.trim();
        if (!isValidPhone(rawPhone)) {
          form.dataset.submitting = 'false';
          phoneInput.setCustomValidity('Введите корректный номер телефона');
          phoneInput.reportValidity();
          return;
        }
        phoneInput.setCustomValidity('');

        const phone = normalizePhone(rawPhone);

        const leadId  = createLeadId();
        const formId  = form.dataset.formId || form.dataset.quizId || 'form';
        const service = form.querySelector('[name="service"]')?.value || 'Заявка с сайта';
        const name    = nameInput ? nameInput.value.trim() : '';
        const cityInput = form.querySelector('[name="city"]');
        const city = cityInput ? cityInput.value.trim() : '';
        const serviceCode = form.dataset.serviceCode || form.querySelector('[name="service_code"]')?.value || '';

        let comment = form.querySelector('[name="comment"]')?.value?.trim() || '';
        if (form.hasAttribute('data-quiz-form')) {
          const steps = Array.from(form.querySelectorAll('.quiz-step'));
          const totalSteps = steps.length;
          const answersSummary = [];
          steps.slice(0, totalSteps - 1).forEach((stepEl) => {
            const qText = stepEl.dataset.question || 'Вопрос';
            const checked = Array.from(stepEl.querySelectorAll('.quiz-option-input:checked')).map((i) => i.value);
            if (checked.length) {
              answersSummary.push(`• ${qText}: ${checked.join(', ')}`);
            }
          });
          if (answersSummary.length) {
            comment = `Параметры расчёта (${service}):\n` + answersSummary.join('\n');
          }
        }

        const fields = { phone, service };
        if (name) fields.name = name;
        if (city) fields.city = city;
        if (comment) fields.comment = comment;
        if (serviceCode) fields.service_code = serviceCode;

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
        if (city) payload.city = city;
        if (comment) payload.comment = comment;
        if (serviceCode) payload.service_code = serviceCode;

        saveLead(payload);
        reachGoal('lead_form_submit', { form: formId, service });

        // UI: загрузка
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем…';
        if (successEl) successEl.hidden = true;
        if (errorEl)   errorEl.hidden   = true;

        try {
          const files = form._selectedFiles || [];
          if (files.length) {
            await deliverLead(config.leadEndpoint, payload, files);
          } else {
            await deliverLead(config.leadEndpoint, payload);
          }

          // Успех — только после реального ответа сервера
          reachGoal('lead_form', { form: formId, service });
          reachGoal('lead_form_success', { form: formId, service });
          reachGoal('lead_sent', { form: formId, phone });
          phoneInput.value = '';
          if (nameInput) nameInput.value = '';
          if (cityInput) cityInput.value = '';
          const commentEl = form.querySelector('[name="comment"]');
          if (commentEl) commentEl.value = '';
          form._selectedFiles = [];
          const previewList = form.querySelector('[data-file-preview]');
          if (previewList) previewList.innerHTML = '';

          const fieldsWrap = form.querySelector('[data-form-fields]');
          if (fieldsWrap) fieldsWrap.hidden = true;

          const step1 = form.querySelector('[data-fast-step-1]');
          if (step1) step1.hidden = true;
          const step2Wrap = form.querySelector('[data-fast-step-2]');
          if (step2Wrap) step2Wrap.hidden = true;
          const trustMicro = form.querySelector('.fast-micro-trust');
          if (trustMicro) trustMicro.hidden = true;

          if (form.hasAttribute('data-quiz-form')) {
            const steps = Array.from(form.querySelectorAll('.quiz-step'));
            steps.forEach((s) => s.classList.remove('is-active'));
            const finalStep = form.querySelector('.quiz-step-final');
            if (finalStep) finalStep.style.display = 'none';
            const progressFill = form.closest('.quiz-container')?.querySelector('[data-quiz-progress-fill]');
            const progressLabel = form.closest('.quiz-container')?.querySelector('[data-quiz-step-num]');
            if (progressFill) progressFill.style.width = '100%';
            if (progressLabel) progressLabel.textContent = 'Завершено';
          }

          const consent = form.querySelector('.form-consent');
          if (consent) consent.hidden = true;

          if (successEl) successEl.hidden = false;

        } catch (error) {
          saveError({ at: new Date().toISOString(), message: error.message, payload });
          reachGoal('lead_delivery_error', { form: formId, message: error.message });
          if (errorEl) {
            errorEl.hidden = false;
            syncErrorFallback(errorEl, payload);
          }
        } finally {
          form.dataset.submitting = 'false';
          submitBtn.disabled   = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  }

  function initPhoneMasks() {
    function formatPhone(val) {
      let digits = val.replace(/\D/g, '');
      if (!digits.length) return '';
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      else if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);

      let res = '+7 (';
      if (digits.length > 1) res += digits.slice(1, Math.min(4, digits.length));
      if (digits.length >= 4) res += ') ' + digits.slice(4, Math.min(7, digits.length));
      if (digits.length >= 7) res += '-' + digits.slice(7, Math.min(9, digits.length));
      if (digits.length >= 9) res += '-' + digits.slice(9, 11);
      return res;
    }

    document.querySelectorAll('[data-phone-input], input[type="tel"]').forEach((input) => {
      input.addEventListener('focus', () => {
        if (!input.value || input.value.trim() === '') {
          input.value = '+7 (';
          setTimeout(() => {
            input.setSelectionRange(input.value.length, input.value.length);
          }, 0);
        }
      });

      input.addEventListener('input', (e) => {
        const cur = input.value;
        const digits = cur.replace(/\D/g, '');
        if (!digits || (digits === '7' && cur.length <= 4)) {
          if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
            input.value = '';
            return;
          }
        }
        input.value = formatPhone(cur);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length <= 4) {
          input.value = '';
        }
      });

      input.addEventListener('blur', () => {
        const digits = input.value.replace(/\D/g, '');
        if (digits.length <= 1) {
          input.value = '';
        }
      });
    });
  }

  function initPhotoPopup() {
    const popup = document.querySelector('[data-calc-popup]');
    if (!popup) return;

    let lastActive = null;

    function openPopup(serviceName) {
      lastActive = document.activeElement;
      popup.classList.add('is-active');
      popup.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-modal-open');

      if (serviceName) {
        const srvInput = popup.querySelector('[name="service"]');
        if (srvInput) srvInput.value = serviceName;

        let matched = false;
        popup.querySelectorAll('.popup-task-chips [data-set-service]').forEach((chip) => {
          const isMatch = chip.dataset.setService === serviceName;
          chip.classList.toggle('is-active', isMatch);
          if (isMatch) matched = true;
        });
        if (!matched) {
          popup.querySelectorAll('.popup-task-chips [data-set-service]').forEach((chip) => {
            chip.classList.toggle('is-active', chip.dataset.setService === 'Комплекс / Другое');
          });
        }
      }

      const phoneInput = popup.querySelector('[data-phone-input]');
      if (phoneInput) {
        setTimeout(() => {
          phoneInput.focus();
        }, 120);
      }
    }

    function closePopup() {
      if (!popup.classList.contains('is-active')) return;
      popup.classList.remove('is-active');
      popup.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-modal-open');

      if (lastActive && typeof lastActive.focus === 'function') {
        lastActive.focus();
      }
    }

    document.querySelectorAll('[data-open-popup="calc-popup"]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup(trigger.dataset.service);
      });
    });

    document.querySelectorAll('[data-open-form]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup(trigger.dataset.service);
      });
    });

    popup.querySelectorAll('[data-popup-close]').forEach((el) => {
      el.addEventListener('click', closePopup);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('is-active')) {
        closePopup();
      }
    });

    popup.querySelectorAll('.popup-task-chips [data-set-service]').forEach((chip) => {
      chip.addEventListener('click', () => {
        popup.querySelectorAll('.popup-task-chips [data-set-service]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const srvInput = popup.querySelector('[name="service"]');
        if (srvInput) {
          srvInput.value = chip.dataset.setService;
        }
      });
    });
  }

  /* ─── ОБРАБОТЧИК БЫСТРЫХ ЛИД-ФОРМ (2 ШАГА) ─── */
  function initFastLeadForms() {
    document.querySelectorAll('[data-fast-lead-form]').forEach((form) => {
      const step2Wrap = form.querySelector('[data-fast-step-2]');
      const toggleStep2Btn = form.querySelector('[data-toggle-step-2]');
      const photosInput = form.querySelector('[data-photos-input]');
      const previewList = form.querySelector('[data-file-preview]');

      form._selectedFiles = [];

      // Шаг 2: раскрытие/скрытие
      if (toggleStep2Btn && step2Wrap) {
        toggleStep2Btn.addEventListener('click', () => {
          const isHidden = step2Wrap.hidden;
          step2Wrap.hidden = !isHidden;
          toggleStep2Btn.setAttribute('aria-expanded', String(isHidden));
        });
      }

      // Работа с загрузкой файлов
      if (photosInput && previewList) {
        const updatePreviews = () => {
          previewList.innerHTML = '';
          (form._selectedFiles || []).forEach((file, index) => {
            const chip = document.createElement('span');
            chip.className = 'file-preview-item';
            const sizeKb = Math.round(file.size / 1024);
            const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} МБ` : `${sizeKb} КБ`;
            chip.textContent = `${file.name} (${sizeStr}) `;
            const rmBtn = document.createElement('button');
            rmBtn.type = 'button';
            rmBtn.className = 'file-preview-remove';
            rmBtn.setAttribute('aria-label', `Удалить файл ${file.name}`);
            rmBtn.textContent = '×';
            rmBtn.addEventListener('click', () => {
              form._selectedFiles.splice(index, 1);
              updatePreviews();
            });
            chip.appendChild(rmBtn);
            previewList.appendChild(chip);
          });
        };

        photosInput.addEventListener('change', () => {
          const files = Array.from(photosInput.files || []);
          form._selectedFiles = form._selectedFiles || [];
          for (const f of files) {
            if (f.type && !f.type.startsWith('image/')) {
              alert(`Файл "${f.name}" не является изображением. Пожалуйста, прикрепляйте фото (JPG, PNG, WebP). Документы ТЗ можно отправить в WhatsApp/Telegram или на почту.`);
              continue;
            }
            if (f.size > 8 * 1024 * 1024) {
              alert(`Файл "${f.name}" превышает 8 МБ. Пожалуйста, выберите файл меньшего размера.`);
              continue;
            }
            if (form._selectedFiles.length >= 5) {
              alert('Максимальное количество файлов — 5.');
              break;
            }
            form._selectedFiles.push(f);
          }
          photosInput.value = '';
          updatePreviews();
        });
      }
    });
  }

  /* ─── ОБРАБОТЧИК ИНТЕРАКТИВНЫХ КВИЗОВ ─── */
  function initQuizzes() {
    document.querySelectorAll('[data-quiz-form]').forEach((form) => {
      const quizId = form.dataset.quizId || 'quiz';
      const serviceCode = form.dataset.serviceCode || 'quiz_lead';
      const steps = Array.from(form.querySelectorAll('.quiz-step'));
      const totalSteps = steps.length;
      const progressFill = form.closest('.quiz-container')?.querySelector('[data-quiz-progress-fill]');
      const progressLabel = form.closest('.quiz-container')?.querySelector('[data-quiz-step-num]');
      const photosInput = form.querySelector('[data-photos-input]');
      const previewList = form.querySelector('[data-file-preview]');

      let currentStep = 1;
      form._selectedFiles = [];
      let quizStarted = false;

      const updateProgress = () => {
        const pct = Math.round((currentStep / totalSteps) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressLabel) {
          progressLabel.textContent = currentStep;
        }
      };

      const goToStep = (stepNum) => {
        if (stepNum < 1 || stepNum > totalSteps) return;
        currentStep = stepNum;
        steps.forEach((s) => {
          const num = parseInt(s.dataset.step, 10);
          s.classList.toggle('is-active', num === currentStep);
        });
        updateProgress();

        if (currentStep === totalSteps) {
          reachGoal('quiz_complete', { quiz: quizId, service_code: serviceCode });
          const phoneInput = form.querySelector('[data-step="' + totalSteps + '"] [data-phone-input]');
          if (phoneInput) setTimeout(() => phoneInput.focus(), 150);
        }
      };

      // Выбор опций (radio/checkbox)
      steps.forEach((stepEl) => {
        const inputs = stepEl.querySelectorAll('.quiz-option-input');
        inputs.forEach((input) => {
          input.addEventListener('change', () => {
            if (!quizStarted) {
              quizStarted = true;
              reachGoal('quiz_start', { quiz: quizId, service_code: serviceCode });
            }
            if (input.type === 'radio') {
              stepEl.querySelectorAll('.quiz-option-card').forEach((card) => {
                const checked = card.querySelector('.quiz-option-input')?.checked;
                card.classList.toggle('is-selected', !!checked);
              });
              // Плавный переход к следующему шагу при клике на radio
              setTimeout(() => {
                if (currentStep < totalSteps - 1) {
                  goToStep(currentStep + 1);
                }
              }, 280);
            } else {
              const card = input.closest('.quiz-option-card');
              if (card) card.classList.toggle('is-selected', input.checked);
            }
          });
        });

        // Кнопка Далее
        const nextBtn = stepEl.querySelector('[data-quiz-next]');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            const checkedInputs = stepEl.querySelectorAll('.quiz-option-input:checked');
            if (!checkedInputs.length) {
              stepEl.classList.add('shake-anim');
              setTimeout(() => stepEl.classList.remove('shake-anim'), 500);
              alert('Пожалуйста, выберите хотя бы один вариант ответа для продолжения.');
              return;
            }
            if (!quizStarted) {
              quizStarted = true;
              reachGoal('quiz_start', { quiz: quizId, service_code: serviceCode });
            }
            goToStep(currentStep + 1);
          });
        }

        // Кнопка Назад
        const prevBtn = stepEl.querySelector('[data-quiz-prev]');
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            goToStep(currentStep - 1);
          });
        }
      });

      // Загрузка файлов на финальном шаге
      if (photosInput && previewList) {
        const updatePreviews = () => {
          previewList.innerHTML = '';
          (form._selectedFiles || []).forEach((file, index) => {
            const chip = document.createElement('span');
            chip.className = 'file-preview-item';
            const sizeKb = Math.round(file.size / 1024);
            const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} МБ` : `${sizeKb} КБ`;
            chip.textContent = `${file.name} (${sizeStr}) `;
            const rmBtn = document.createElement('button');
            rmBtn.type = 'button';
            rmBtn.className = 'file-preview-remove';
            rmBtn.setAttribute('aria-label', `Удалить файл ${file.name}`);
            rmBtn.textContent = '×';
            rmBtn.addEventListener('click', () => {
              form._selectedFiles.splice(index, 1);
              updatePreviews();
            });
            chip.appendChild(rmBtn);
            previewList.appendChild(chip);
          });
        };

        photosInput.addEventListener('change', () => {
          const files = Array.from(photosInput.files || []);
          form._selectedFiles = form._selectedFiles || [];
          for (const f of files) {
            if (f.type && !f.type.startsWith('image/')) {
              alert(`Файл "${f.name}" не является изображением. Пожалуйста, прикрепляйте фото (JPG, PNG, WebP). Документы ТЗ можно отправить в WhatsApp/Telegram или на почту.`);
              continue;
            }
            if (f.size > 8 * 1024 * 1024) {
              alert(`Файл "${f.name}" превышает 8 МБ. Пожалуйста, выберите файл меньшего размера.`);
              continue;
            }
            if (form._selectedFiles.length >= 5) {
              alert('Максимальное количество файлов — 5.');
              break;
            }
            form._selectedFiles.push(f);
          }
          photosInput.value = '';
          updatePreviews();
        });
      }
    });
  }

  loadIntegrations();
  initNav();
  initFloatingRail();
  initGoals();
  initHomeAnimations();
  initPhoneMasks();
  initLeadForms();
  initFastLeadForms();
  initQuizzes();
  initPhotoPopup();
})();
