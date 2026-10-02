import {
  chippingDirectFaq,
  clearingDirectFaq,
  clearingVideos,
  complexSteps,
  complexVideos,
  emergencyDirectFaq,
  experienceStats,
  faq,
  homeFaq,
  imageCredits,
  images,
  lepDirectFaq,
  nav,
  priceFactors,
  priceRows,
  processSteps,
  pruningDirectFaq,
  scenarioCards,
  serviceAreas,
  services,
  site,
  spilDirectFaq,
  trustGroups,
  trustPoints,
  waDirectTexts,
  workExamples
} from './data.mjs';

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const pathUrl = (path) => `${site.baseUrl}${path}`;
const route = (slug = '') => `/${slug.replace(/^\/|\/$/g, '')}${slug ? '/' : ''}`;

export function pagePath(slug) {
  return slug ? `${slug.replace(/^\/|\/$/g, '')}/index.html` : 'index.html';
}

function hasValue(str) {
  return str && !String(str).startsWith('[');
}

function phoneHref() {
  if (site.phoneHref) return site.phoneHref;
  if (hasValue(site.phone)) return `tel:${site.phone.replace(/[^\d+]/g, '')}`;
  return '#lead-form';
}

function messengerHref(fallback = '#lead-form', text = '') {
  if (!hasValue(site.messengerUrl)) return fallback;
  if (text) {
    const sep = site.messengerUrl.includes('?') ? '&' : '?';
    return `${site.messengerUrl}${sep}text=${encodeURIComponent(text)}`;
  }
  return site.messengerUrl;
}

function maxHref(fallback = '#lead-form') {
  return hasValue(site.maxUrl) ? site.maxUrl : fallback;
}

function telegramHref(fallback = '#lead-form') {
  return hasValue(site.telegramUrl) ? site.telegramUrl : fallback;
}

function metrikaCounter() {
  const id = Number.parseInt(site.metrikaId, 10);
  if (!Number.isFinite(id)) return '';
  return `<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

    ym(${id}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
  </script>`;
}

function metrikaNoScript() {
  const id = Number.parseInt(site.metrikaId, 10);
  if (!Number.isFinite(id)) return '';
  return `<noscript><div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" width="1" height="1" alt=""></div></noscript>`;
}

export function renderPage({ title, description, path = '/', body, jsonLd = [], image = images.hero, leadHref = '#lead-form', waText = '' }) {
  const canonical = pathUrl(path);
  const hasRegion = /(?:Москв|Московск)/i.test(title);
  const fullTitle = hasRegion ? title : `${title} | ${site.region}`;
  const schemas = [organizationSchema(), ...jsonLd];
  const absoluteImage = image.startsWith('http') ? image : `${site.baseUrl}${image}`;
  const usesWikimedia = image.includes('commons.wikimedia.org') || body.includes('commons.wikimedia.org');
  const wikimediaPreconnect = usesWikimedia ? '\n  <link rel="preconnect" href="https://commons.wikimedia.org">' : '';
  const mailruMeta = (path === '/' && site.mailruDomainVerification)
    ? `\n  <meta name="mailru-domain" content="${esc(site.mailruDomainVerification)}" />`
    : '';
  const yandexMeta = (path === '/' && site.yandexVerification)
    ? `\n  <meta name="yandex-verification" content="${esc(site.yandexVerification)}" />`
    : '';
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">${mailruMeta}${yandexMeta}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(absoluteImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#143d2b">
  <link rel="icon" href="/favicon.ico?v=20260811-tree" sizes="32x32">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20260811-tree">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png?v=20260811-tree">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=20260811-tree">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">${wikimediaPreconnect}
  <link rel="stylesheet" href="/assets/styles.css?v=20261002-conv-direct-1">
  <script>window.TREE_SITE_CONFIG = ${JSON.stringify({ metrikaId: site.metrikaId, leadEndpoint: site.leadEndpoint, novofonScriptUrl: site.novofonScriptUrl, phoneHref: site.phoneHref, telegramUrl: site.telegramUrl, messengerUrl: site.messengerUrl, maxUrl: site.maxUrl, maxPhone: site.maxPhone })};</script>
  ${metrikaCounter()}
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body>
  ${metrikaNoScript()}
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  ${header(leadHref, waText)}
  <main id="main">${body}</main>
  ${footer(waText)}
  ${floatingContacts(waText)}
  ${mobileBar(leadHref)}
  ${photoModal(waText)}
  <script src="/assets/app.js?v=20261002-conv-direct-1" type="module"></script>
</body>
</html>`;
}

function header(leadHref, waText = '') {
  const phoneEl = hasValue(site.phone)
    ? `<a class="phone-link" href="${phoneHref()}" data-goal="click_phone"><svg class="phone-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>${esc(site.phone)}</span></a>${hasValue(site.hours) ? `<span class="header-hours">${esc(site.hours)}</span>` : ''}`
    : '';
  return `<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.brand)}">
      <img src="/assets/logo-zelenyi-srez.png" alt="${esc(site.brand)}" class="brand-logo brand-logo-header" width="177" height="59">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
      <span></span><span></span><span></span><span class="sr-only">Открыть меню</span>
    </button>
    <nav class="main-nav" id="main-nav" data-nav>${nav.map((item) => {
      const desktopOnly = item.label === 'Комплекс' || item.label === 'FAQ';
      const cls = desktopOnly ? 'nav-link nav-link--desktop-only' : 'nav-link';
      return `<a class="${cls}" href="${item.href}">${esc(item.label)}</a>`;
    }).join('')}${mobileNavContacts(waText)}</nav>
    <div class="header-actions">
      ${phoneEl ? `<div class="header-contact">${phoneEl}</div>` : ''}
      <a class="btn btn-small btn-accent" href="${leadHref}" data-open-form data-service="Расчет стоимости" data-goal="click_calculate">Рассчитать стоимость</a>
    </div>
  </div>
</header>`;
}

function mobileNavContacts(waText = '') {
  const phoneBtn = hasValue(site.phone)
    ? `<a class="mobile-nav-phone-btn" href="${phoneHref()}" data-goal="click_phone">
        <svg class="mobile-nav-phone-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span class="mobile-nav-phone-content">
          <span class="mobile-nav-phone-num">${esc(site.phone)}</span>
          ${hasValue(site.hours) ? `<span class="mobile-nav-phone-hours">${esc(site.hours)}</span>` : ''}
        </span>
      </a>`
    : '';

  const waBtn = hasValue(site.messengerUrl)
    ? `<a class="mobile-nav-msg-btn mobile-nav-msg-wa" href="${messengerHref('#lead-form', waText)}" target="_blank" rel="noopener" data-goal="click_whatsapp" aria-label="Написать в WhatsApp">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg>
        <span>WhatsApp</span>
      </a>`
    : '';

  const tgBtn = hasValue(site.telegramUrl)
    ? `<a class="mobile-nav-msg-btn mobile-nav-msg-tg" href="${telegramHref()}" target="_blank" rel="noopener" data-goal="click_telegram" aria-label="Написать в Telegram">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        <span>Telegram</span>
      </a>`
    : '';

  const maxBtn = hasValue(site.maxUrl)
    ? `<a class="mobile-nav-msg-btn mobile-nav-msg-max" href="${maxHref()}" target="_blank" rel="noopener" data-goal="click_max" aria-label="Открыть MAX">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16V8l5 5 5-5v8"/></svg>
        <span>MAX</span>
      </a>`
    : '';

  const msgBtns = [waBtn, tgBtn, maxBtn].filter(Boolean).join('');

  return `<div class="mobile-nav-contacts">
    <div class="mobile-nav-contacts-title">Быстрая связь</div>
    ${phoneBtn}
    ${msgBtns ? `<div class="mobile-nav-messengers">${msgBtns}</div>` : ''}
  </div>`;
}

function footer(waText = '') {
  const phoneEl = hasValue(site.phone) ? `<a class="phone-link footer-phone" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : '';
  const emailEl = hasValue(site.email) ? `<a class="footer-email" href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : '';
  const waBtn = hasValue(site.messengerUrl)
    ? `<a class="footer-msg-btn footer-msg-wa" href="${messengerHref('/#lead-form', waText)}" target="_blank" rel="noopener" data-goal="click_whatsapp">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg>
        <span>WhatsApp</span>
      </a>`
    : '';
  const tgBtn = hasValue(site.telegramUrl)
    ? `<a class="footer-msg-btn footer-msg-tg" href="${telegramHref('/#lead-form')}" target="_blank" rel="noopener" data-goal="click_telegram">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        <span>Telegram</span>
      </a>`
    : '';
  const maxBtn = hasValue(site.maxUrl)
    ? `<a class="footer-msg-btn footer-msg-max" href="${maxHref('/#lead-form')}" target="_blank" rel="noopener" data-goal="click_max">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16V8l5 5 5-5v8"/></svg>
        <span>MAX</span>
      </a>`
    : '';
  const msgRow = [waBtn, tgBtn, maxBtn].filter(Boolean).join('');
  return `<footer class="site-footer" id="contacts">
  <div class="container footer-grid">
    <div>
      <a class="brand footer-brand" href="/" aria-label="${esc(site.brand)}"><img src="/assets/logo-zelenyi-srez.png" alt="${esc(site.brand)}" class="brand-logo brand-logo-footer" width="210" height="70"></a>
      <p>Выполняем работы с деревьями на частных и коммерческих территориях. Стоимость и состав работ согласуются до начала выполнения.</p>
      <p class="muted">${esc(site.addressNote)}</p>
    </div>
    <div><h2>Услуги</h2>${services.slice(0, 7).map((service) => `<a href="/${service.slug}/">${esc(service.title)}</a>`).join('')}</div>
    <div>
      <h2>Контакты</h2>
      ${phoneEl}
      ${msgRow ? `<div class="footer-messengers" aria-label="Мессенджеры">${msgRow}</div>` : ''}
      ${emailEl}
      <p class="call-note">В целях контроля качества разговор может быть записан.</p>
    </div>
  </div>
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><a href="/privacy/">Политика конфиденциальности</a><a href="/personal-data-consent/">Согласие на обработку данных</a><a href="/requisites/">Реквизиты</a><a href="https://voltrena.ru" target="_blank" rel="noopener" style="color: #6ee7b7; text-decoration: underline; text-underline-offset: 3px;">Создание и продвижение: voltrena.ru</a></div>
</footer>`;
}

function floatingContacts(waText = '') {
  const buttons = [
    hasValue(site.maxUrl) ? `<a class="floating-contact-button floating-contact-max" href="${maxHref()}" target="_blank" rel="noopener" aria-label="Открыть MAX" data-goal="click_max"><span class="floating-contact-max-mark" aria-hidden="true">MAX</span><span class="floating-contact-label">MAX</span></a>` : '',
    hasValue(site.messengerUrl) ? `<a class="floating-contact-button floating-contact-whatsapp" href="${messengerHref('#lead-form', waText)}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp" data-goal="click_whatsapp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg><span class="floating-contact-label">WhatsApp</span></a>` : '',
    hasValue(site.telegramUrl) ? `<a class="floating-contact-button floating-contact-telegram" href="${telegramHref()}" target="_blank" rel="noopener" aria-label="Написать в Telegram" data-goal="click_telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span class="floating-contact-label">Telegram</span></a>` : '',
    hasValue(site.email) ? `<a class="floating-contact-button floating-contact-email" href="mailto:${esc(site.email)}" aria-label="Написать на почту" data-goal="click_email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span class="floating-contact-label">Почта</span></a>` : ''
  ].filter(Boolean).join('');
  return buttons ? `<aside class="floating-contact-rail" aria-label="Быстрая связь">${buttons}</aside>` : '';
}

function mobileBar(leadHref = '#lead-form') {
  const callBtn = `<a class="mobile-btn mobile-btn-call" href="${phoneHref()}" data-goal="click_phone"><span class="mobile-btn-icon">📞</span><span>Позвонить</span></a>`;
  let calcBtn;
  if (leadHref && leadHref.startsWith('#') && leadHref !== '#calc-popup') {
    calcBtn = `<a class="mobile-btn mobile-btn-calc" href="${leadHref}" data-goal="click_calculate"><span class="mobile-btn-icon">📋</span><span>Рассчитать</span></a>`;
  } else {
    calcBtn = `<button type="button" class="mobile-btn mobile-btn-calc" data-open-popup="calc-popup" data-goal="click_calculate"><span class="mobile-btn-icon">📋</span><span>Рассчитать</span></button>`;
  }
  return `<div class="mobile-action-bar" aria-label="Быстрые действия">${calcBtn}${callBtn}</div>`;
}

function formErrorMarkup(customClass = '', waText = '') {
  const cls = customClass ? ` ${customClass}` : '';
  const waLink = messengerHref(site.messengerUrl, waText);
  return `<div class="form-error${cls}" data-form-error hidden>
    <div class="form-error-title">Не удалось отправить заявку через сервер. Попробуйте ещё раз или свяжитесь с нами напрямую:</div>
    <div class="form-error-actions">
      <a href="${esc(site.phoneHref)}" class="form-error-btn form-error-call" data-goal="click_phone">📞 Позвонить: ${esc(site.phone)}</a>
      <a href="${esc(waLink)}" target="_blank" rel="noopener" class="form-error-btn form-error-wa" data-goal="click_whatsapp">Написать в WhatsApp</a>
      <a href="${esc(site.telegramUrl)}" target="_blank" rel="noopener" class="form-error-btn form-error-tg" data-goal="click_telegram">Написать в Telegram</a>
    </div>
  </div>`;
}

function photoModal(waText = '') {
  return `<div class="photo-popup-overlay" id="calc-popup" data-calc-popup aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="popup-title">
  <div class="photo-popup-backdrop" data-popup-close tabindex="-1"></div>
  <div class="photo-popup-dialog">
    <div class="photo-popup-header">
      <div class="photo-popup-titles">
        <h2 class="photo-popup-title" id="popup-title">Рассчитать стоимость работ</h2>
        <p class="photo-popup-subtitle">Назовём ориентир цены и зафиксируем её до начала работ</p>
      </div>
      <button type="button" class="photo-popup-close" data-popup-close aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="photo-popup-body">
      <form class="lead-form popup-lead-form" data-lead-form data-form-id="popup-lead-form" id="popup-lead-form">
        <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>
        <input type="hidden" name="service" value="Спил деревьев">
        <div data-form-fields>
          <div class="hero-task-chips popup-task-chips" role="radiogroup" aria-label="Быстрый выбор задачи">
            <button type="button" class="task-chip is-active" data-set-service="Спил деревьев">Спил</button>
            <button type="button" class="task-chip" data-set-service="Расчистка участка">Расчистка</button>
            <button type="button" class="task-chip" data-set-service="Измельчение веток">Ветки</button>
            <button type="button" class="task-chip" data-set-service="Комплекс / Другое">Другое</button>
          </div>
          <div class="lead-field-group">
            <label class="lead-field-label sr-only" for="popup_name">Ваше имя</label>
            <input id="popup_name" name="name" type="text" autocomplete="name" placeholder="Ваше имя (необязательно)">
          </div>
          <div class="lead-field-group">
            <label class="lead-field-label sr-only" for="popup_phone">Номер телефона</label>
            <input id="popup_phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__" data-phone-input>
          </div>
          <button class="btn btn-accent btn-full" type="submit" data-submit-btn>Получить расчёт</button>
          <p class="popup-photo-note">Фото можно отправить после заявки через Telegram, WhatsApp или MAX.</p>
        </div>
        <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку данных</a>.</p>
        <div class="form-success" data-form-success hidden>
          <div class="form-success-header">
            <span class="form-success-badge" aria-hidden="true">✓</span>
            <div class="form-success-text">
              <h3 class="form-success-heading">Заявка принята!</h3>
              <p class="form-success-sub">Свяжемся после получения заявки для уточнения деталей и расчёта.</p>
            </div>
          </div>
        </div>
        ${formErrorMarkup('', waText)}
      </form>
      <div class="popup-messengers-divider"><span>или напишите напрямую</span></div>
      <div class="popup-messenger-row">
        ${hasValue(site.messengerUrl) ? `<a class="popup-msgr-chip popup-msgr-wa" href="${messengerHref('#calc-popup', waText)}" target="_blank" rel="noopener" data-goal="click_whatsapp" title="WhatsApp"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg><span>WhatsApp</span></a>` : ''}
        ${hasValue(site.telegramUrl) ? `<a class="popup-msgr-chip popup-msgr-tg" href="${telegramHref('#calc-popup')}" target="_blank" rel="noopener" data-goal="click_telegram" title="Telegram"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span>Telegram</span></a>` : ''}
        ${hasValue(site.maxUrl) ? `<a class="popup-msgr-chip popup-msgr-max" href="${maxHref('#calc-popup')}" target="_blank" rel="noopener" data-goal="click_max" title="MAX"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16V8l5 5 5-5v8"/></svg><span>MAX</span></a>` : ''}
      </div>
    </div>
  </div>
</div>`;
}

export function homePage() {
  const title = 'Спил деревьев, расчистка участков и измельчение веток в Москве и МО — Зеленый Срез';
  const description = 'Спиливаем деревья целиком и по частям, расчищаем участки, измельчаем ветки щепорезом, дробим пни и выполняем обрезку. Фиксированная цена по фото, материальная ответственность по договору. Москва и МО.';
  const homeLeadOptions = {
    formId: 'bottom-lead-form',
    submitText: 'Получить расчёт'
  };

  const body = `
  ${heroSection()}
  ${trustBarSection()}
  ${mainServicesSection()}
  ${scenariosSection()}
  ${safetySection()}
  ${complexSection()}
  ${priceTableSection()}
  ${whyTrustSection()}
  ${processSection()}
  ${organizationsSection()}
  ${experienceProofSection()}
  ${videosSection()}
  ${faqSection(homeFaq)}
  ${leadSection('Покажите задачу — рассчитаем стоимость', 'Можно начать с фотографии. После согласования фиксируем цену и выполняем работы с оплатой по факту.', 'Фото на оценку', homeLeadOptions)}
  ${seoContentSection()}`;
  return renderPage({ title, description, path: '/', body, jsonLd: [professionalServiceSchema(), faqSchema(homeFaq), breadcrumbSchema([{ name: 'Главная', url: '/' }])] });
}

function heroSection() {
  return `<section class="hero hero-direct" id="hero">
  <img class="hero-bg" src="${esc(images.hero)}" srcset="${esc(images.heroMobile)} 800w, ${esc(images.hero)} 1920w" sizes="100vw" alt="Спил деревьев, расчистка участков, корчевание пней и измельчение веток" fetchpriority="high">
  <div class="hero-shade"></div>
  <div class="container hero-content">
    <div class="hero-copy">
      <p class="hero-badge">Москва и Московская область • Работаем ежедневно</p>
      <h1>Спил деревьев, расчистка участков, корчевание пней и&nbsp;измельчение веток</h1>
      <p class="hero-lead">Безопасно удаляем деревья любой сложности, дробим пни и перерабатываем ветки в щепу. Фиксированная смета по фото до выезда, договор и материальная ответственность.</p>

      <div class="hero-price-anchors" aria-label="Стартовые ценовые ориентиры">
        <a href="#spil" class="hero-price-pill"><span>Спил дерева</span><strong>от 1 000 ₽</strong></a>
        <a href="#raschistka" class="hero-price-pill"><span>Расчистка участка</span><strong>от 5 000 ₽</strong></a>
        <a href="#korchevanie" class="hero-price-pill"><span>Корчевание пней</span><strong>от 1 500 ₽</strong></a>
        <a href="#izmelchenie" class="hero-price-pill"><span>Измельчение веток</span><strong>от 2 500 ₽</strong></a>
      </div>

      <div class="hero-messengers-compact" aria-label="Написать в мессенджер">
          <span class="hero-msgr-label">Написать:</span>
          <div class="hero-msgr-links">
            ${hasValue(site.messengerUrl) ? `<a class="hero-msgr-chip hero-msgr-wa" href="${messengerHref('#calc-popup')}" data-goal="click_whatsapp" title="Написать в WhatsApp"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg><span>WhatsApp</span></a>` : ''}
            ${hasValue(site.telegramUrl) ? `<a class="hero-msgr-chip hero-msgr-tg" href="${telegramHref('#calc-popup')}" target="_blank" rel="noopener" data-goal="click_telegram" title="Написать в Telegram"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span>Telegram</span></a>` : ''}
            ${hasValue(site.maxUrl) ? `<a class="hero-msgr-chip hero-msgr-max" href="${maxHref('#calc-popup')}" target="_blank" rel="noopener" data-goal="click_max" title="Открыть профиль в MAX"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16V8l5 5 5-5v8"/></svg><span>MAX</span></a>` : ''}
          </div>
        </div>

      <div class="hero-trust-line" aria-label="Преимущества">
        <span>100% сохранность имущества</span>
        <span class="trust-dot">·</span>
        <span>Материальная ответственность по договору</span>
        <span class="trust-dot">·</span>
        <span>Выезд от 2 часов</span>
        <span class="trust-dot">·</span>
        <span>Своя спецтехника</span>
        <span class="trust-dot">·</span>
        <span>Оплата по факту</span>
      </div>
      <p class="hero-cta-note">Для предварительной оценки отправьте фотографию дерева и контактный номер.</p>
    </div>
  </div>
</section>`;
}

function trustBarSection() {
  return `<section class="trust-bar-section" aria-label="Гарантии и факты">
  <div class="container">
    <div class="trust-bar-grid">
      <article class="trust-bar-card">
        <span class="trust-bar-card-icon" aria-hidden="true">🛡️</span>
        <div>
          <h3>100% сохранность имущества</h3>
          <p>Дом, забор, постройки и территория защищены при выполнении работ</p>
        </div>
      </article>
      <article class="trust-bar-card">
        <span class="trust-bar-card-icon" aria-hidden="true">📄</span>
        <div>
          <h3>Материальная ответственность по договору</h3>
          <p>Отвечаем за сохранность имущества при выполнении работ</p>
        </div>
      </article>
      <article class="trust-bar-card">
        <span class="trust-bar-card-icon" aria-hidden="true">⚡</span>
        <div>
          <h3>Выезд бригады от 2 часов</h3>
          <p>Оперативный выезд при срочных и аварийных задачах</p>
        </div>
      </article>
      <article class="trust-bar-card">
        <span class="trust-bar-card-icon" aria-hidden="true">🚜</span>
        <div>
          <h3>Свой парк техники</h3>
          <p>Используем собственную технику и щепорез</p>
        </div>
      </article>
    </div>
  </div>
</section>`;
}

function mainServicesSection() {
  const mainCards = [
    {
      id: 'spil',
      title: 'Спил и удаление деревьев',
      slug: 'spil-derevev',
      image: '/assets/spil-main.jpg',
      result: 'Безопасный спил целиком или разбор по частям рядом с домом, забором и проводами.',
      price: 'от 1 000 ₽',
      service: 'Спил и удаление деревьев'
    },
    {
      id: 'avariynye',
      title: 'Аварийные и сложные деревья',
      slug: 'udalenie-avariynyh-derevev',
      image: '/assets/avarijnoe-main.jpg',
      result: 'Срочный демонтаж опасных, наклонённых, сухих и треснувших стволов после ветра.',
      price: 'от 4 000 ₽',
      service: 'Удаление аварийных деревьев'
    },
    {
      id: 'raschistka',
      title: 'Расчистка участков',
      slug: 'raschistka-uchastkov',
      image: '/assets/raschistka-real.png',
      result: 'Комплексная расчистка от деревьев, кустарника, поросли и бурьяна под ключ.',
      price: 'от 5 000 ₽',
      service: 'Расчистка участков'
    },
    {
      id: 'izmelchenie',
      title: 'Измельчение веток (Щепорез)',
      slug: 'izmelchenie-vetok',
      image: '/assets/izmelchenie-main.jpg',
      result: 'Переработка веток мощным щепорезом с нашим оператором в чистую щепу на месте.',
      price: 'от 2 500 ₽',
      service: 'Измельчение веток'
    },
    {
      id: 'lep',
      title: 'Расчистка просек под ЛЭП',
      slug: 'raschistka-prosek-lep',
      image: '/assets/raschistka-real.png',
      result: 'Удаление деревьев, кустарника, поросли и ДКР вдоль линий электропередачи.',
      price: 'По расчёту объекта',
      service: 'Расчистка просек под ЛЭП'
    },
    {
      id: 'pni',
      title: 'Дробление и удаление пней',
      slug: 'droblenie-pney',
      image: '/assets/droblenie-main.png',
      result: 'Измельчение пня фрезой ниже уровня грунта без раскопки ям и повреждения газона.',
      price: 'от 1 500 ₽',
      service: 'Дробление пней'
    },
    {
      id: 'obrezka',
      title: 'Обрезка и кронирование',
      slug: 'obrezka-derevev',
      image: '/assets/obrezka-main.jpg',
      result: 'Санитарная и омолаживающая обрезка кроны, удаление опасных ветвей над постройками.',
      price: 'от 1 500 ₽',
      service: 'Обрезка деревьев'
    }
  ];

  return `<section class="section main-services-section" id="services">
  <div class="container">
    <div class="section-head">
      <h2>Все основные услуги</h2>
      <p>Выполняем работы любой сложности на частных и коммерческих объектах в Москве и Московской области.</p>
    </div>
    <div class="main-services-grid">
      ${mainCards.map((c) => `<article class="main-service-card" id="${esc(c.id)}">${c.id === 'pni' ? '<span id="korchevanie" class="anchor-target" aria-hidden="true"></span>' : ''}
        <div class="main-service-image">
          <img src="${esc(c.image)}" alt="${esc(c.title)}" width="1024" height="768" loading="lazy">
          <span class="main-service-price">${esc(c.price)}</span>
        </div>
        <div class="main-service-body">
          <h3>${esc(c.title)}</h3>
          <p class="main-service-result">${esc(c.result)}</p>
          <div class="main-service-actions">
            <a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(c.service)}" data-goal="click_calculate">Рассчитать стоимость</a>
            <a class="main-service-link-more" href="/${c.slug}/">Подробнее об услуге →</a>
          </div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

function scenariosSection() {
  return `<section class="section section-muted scenarios-section" id="scenarios">
  <div class="container">
    <div class="section-head">
      <h2>Какая у вас задача?</h2>
      <p>Подбираем проверенное решение под конкретную ситуацию на вашем участке.</p>
    </div>
    <div class="scenarios-grid">
      ${scenarioCards.map((s) => `<article class="scenario-card">
        <h3>${esc(s.title)}</h3>
        <p class="scenario-desc">${esc(s.desc)}</p>
        <a class="btn btn-small btn-ghost scenario-btn" href="#lead-form" data-open-form data-service="${esc(s.service)}" data-goal="click_calculate">Рассчитать эту задачу</a>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

function safetySection() {
  return `<section class="section safety-section" id="safety">
  <div class="container safety-grid">
    <div class="safety-media">
      <img src="${esc(images.sectionalCut)}" alt="Спил деревьев возле дома и забора" width="1024" height="768" loading="lazy">
      <div class="safety-media-badge">
        <span class="badge-icon">🛡️</span>
        <span>Спил фрагментами со спуском на верёвках</span>
      </div>
    </div>
    <div class="safety-content">
      <h2>Работаем рядом с домами, заборами и постройками</h2>
      <p class="safety-lead">Главный страх при спиле деревьев — повредить крышу, забор, теплицу, провода или газон. Мы исключаем такие риски благодаря отработанной технологии арбористики.</p>
      <ul class="safety-list">
        <li>
          <strong>100% сохранность имущества</strong>
          <p>Каждая часть дерева аккуратно подвязывается и плавно спускается вниз на верёвках строго в отведённую зону сброса.</p>
        </li>
        <li>
          <strong>Материальная ответственность закрепляется договором</strong>
          <p>Фиксируем официальную гарантию сохранности вашего дома, забора и коммуникаций в договоре.</p>
        </li>
        <li>
          <strong>Стоимость работ фиксируется до начала</strong>
          <p>Названная до выезда цена является окончательной и не повышается в процессе выполнения.</p>
        </li>
        <li>
          <strong>Работают обученные арбористы</strong>
          <p>Опытные специалисты, сертифицированное снаряжение и профессиональные бензопилы.</p>
        </li>
      </ul>
      <a class="btn btn-accent" href="#lead-form" data-open-form data-service="Сложный спил дерева" data-goal="click_calculate">Рассчитать безопасный спил</a>
    </div>
  </div>
</section>`;
}



function complexSection() {
  return `<section class="section section-muted complex-section" id="complex">
  <div class="container">
    <div class="section-head">
      <h2>Можно заказать весь комплекс работ одной бригадой</h2>
      <p>От спила дерева до готового участка — без поиска нескольких подрядчиков.</p>
    </div>

    <div class="complex-flow" aria-label="Этапы комплексной работы">
      ${complexSteps.map((step, idx) => `
        <div class="complex-flow-step">
          <h3>${esc(step.title)}</h3>
          <p>${esc(step.desc)}</p>
        </div>
        ${idx < complexSteps.length - 1 ? '<div class="complex-flow-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>' : ''}
      `).join('')}
    </div>

    <div class="complex-footer-note">
      <div class="complex-badges">
        <span class="complex-badge">🚜 Свой парк техники</span>
        <span class="complex-badge">🌲 Собственный щепорез с оператором</span>
        <span class="complex-badge">🤝 Состав работ согласуем заранее</span>
      </div>
      <p class="complex-desc-note">Вывоз порубочных остатков выполняется по согласованию. Щепу можно оставить для хозяйственных нужд или вывезти.</p>
      <a class="btn btn-accent" href="#lead-form" data-open-form data-service="Комплексные работы под ключ" data-goal="click_calculate">Рассчитать комплексную работу</a>
    </div>
  </div>
</section>`;
}

function priceTableSection() {
  return `<section class="section" id="prices">
  <div class="container">
    <div class="section-head">
      <h2>Цены на работы</h2>
      <p>Честные базовые ориентиры стоимости. Точную смету назовём по 2–3 фото до выезда на объект.</p>
    </div>
    <div class="price-table-wrap">
      <table class="price-table">
        <thead>
          <tr>
            <th>Вид работы</th>
            <th>Стоимость</th>
            <th>Что влияет на расчёт</th>
          </tr>
        </thead>
        <tbody>
          ${priceRows.map(([service, price, factors]) => `<tr>
            <td><strong>${esc(service)}</strong></td>
            <td class="price-cell">${esc(price)}</td>
            <td class="price-factors-cell">${esc(factors)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="price-factors-block">
      <h3>От чего зависит итоговая стоимость</h3>
      <div class="factors-grid">
        <div class="factor-card"><span>📏</span><strong>Размер и диаметр</strong><p>Толщина ствола и высота кроны определяют трудоёмкость и объём древесины.</p></div>
        <div class="factor-card"><span>⚠️</span><strong>Состояние дерева</strong><p>Сухостой, наклон, трещины и гниль требуют повышенного внимания и страховки.</p></div>
        <div class="factor-card"><span>🏠</span><strong>Постройки рядом</strong><p>Наличие дома, забора, теплицы, посадок или ЛЭП требует разбора по частям.</p></div>
        <div class="factor-card"><span>🎯</span><strong>Свободное место</strong><p>Наличие площадки для сброса частей или необходимость полного завешивания.</p></div>
        <div class="factor-card"><span>🚜</span><strong>Подъезд техники</strong><p>Возможность заезда автовышки или щепореза напрямую к месту работы.</p></div>
        <div class="factor-card"><span>🌱</span><strong>Площадь расчистки</strong><p>Плотность кустарника, поросль, бурьян и количество деревьев на сотку.</p></div>
        <div class="factor-card"><span>🍂</span><strong>Объём веток</strong><p>Количество древесных отходов для переработки щепорезом.</p></div>
        <div class="factor-card"><span>🚛</span><strong>Необходимость вывоза</strong><p>Складирование на участке, распил на дрова или заказ контейнера для вывоза.</p></div>
      </div>
    </div>

    <div class="price-photo-callout">
      <div>
        <h3>Пришлите фото — предварительно оценим стоимость</h3>
        <p>После оценки фиксируем стоимость и закрепляем её в договоре. Никаких скрытых доплат на месте.</p>
      </div>
      <a class="btn btn-accent" href="#lead-form" data-open-form data-service="Оценка по фото" data-goal="click_calculate">Рассчитать стоимость по фото</a>
    </div>
  </div>
</section>`;
}

function whyTrustSection() {
  return `<section class="section section-muted why-trust-section" id="why-trust">
  <div class="container">
    <div class="section-head">
      <h2>Почему нам доверяют</h2>
      <p>Конкретные факты и принципы нашей работы на каждом объекте в Москве и Московской области.</p>
    </div>
    <div class="trust-groups-grid">
      ${trustGroups.map((g) => `<article class="trust-group-card">
        <span class="trust-group-category">${esc(g.category)}</span>
        <ul class="trust-group-list">
          ${g.items.map((item) => `<li>${esc(item)}</li>`).join('')}
        </ul>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

function quickLeadSection() {
  return `<section class="quick-lead-section" id="quick-lead">
  <div class="container">
    <div class="quick-lead-inner">
      <div class="quick-lead-text">
        <h2>Узнайте стоимость вашего дерева</h2>
        <p>Пришлите 2–3 фотографии. Обычно по ним уже можно определить способ работы и ориентировочную стоимость.</p>
      </div>
      <div class="quick-lead-actions">
        <form class="quick-lead-form" data-lead-form data-form-id="quick-lead">
          <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>
          <input type="hidden" name="service" value="Быстрый расчет">
          <div class="quick-lead-field" data-form-fields>
            <input type="tel" name="phone" id="quick_phone" placeholder="+7 999 999-99-99" required autocomplete="tel" data-phone-input>
            <button class="btn btn-accent" type="submit" data-submit-btn>Получить расчёт</button>
          </div>
          <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку данных</a>.</p>
          <div class="form-success quick-lead-success" data-form-success hidden>
            <div class="form-success-header">
              <span class="form-success-badge" aria-hidden="true">✓</span>
              <div class="form-success-text">
                <p class="form-success-heading">Заявка принята!</p>
              </div>
            </div>
          </div>
          ${formErrorMarkup('quick-lead-error')}
        </form>
        ${hasValue(site.messengerUrl) ? `<a class="btn btn-outline" href="${messengerHref('#lead-form')}" data-goal="click_whatsapp">Отправить фото в WhatsApp</a>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

function seoContentSection() {
  return `<section class="section seo-content-section" id="about-info">
  <div class="container">
    <div class="seo-content-inner">
      <h2>Профессиональные услуги арбористов и расчистка территорий в Москве и МО</h2>
      <p>Компания «Зелёный Срез» специализируется на выполнении безопасных и технически сложных работ с зелёными насаждениями. Мы работаем по всей территории Москвы и Московской области, обслуживая как частные загородные участки, так и территории СНТ, коттеджных посёлков, предприятий и управляющих компаний.</p>
      <p>Основными направлениями нашей деятельности являются спил и удаление деревьев целиком и по частям, санитарная и омолаживающая обрезка, кронирование, ликвидация последствий ветровала и удаление аварийных деревьев. Для переработки древесных отходов мы используем собственный профессиональный щепорез (измельчитель веток) с оператором, что позволяет значительно уменьшить объём веток и сократить расходы на вывоз. Удаление пней выполняется методом фрезерования (дробления) пнедробилкой ниже уровня земли, благодаря чему сохраняется целостность газона и окружающего ландшафта.</p>
      <p>Все работы проводятся строго по договору с закреплением материальной ответственности за сохранность построек, кровли, заборов и коммуникаций. Выезд бригады возможен в день обращения или в согласованное удобное время. Предварительный расчёт стоимости производится по фотографиям до выезда бригады.</p>
    </div>
  </div>
</section>`;
}

function worksPreview() {
  return `<section class="section" id="works-preview"><div class="container"><div class="section-head"><h2>Реальные работы</h2><p>Показываем примеры выполненных задач на участках в Москве и Московской области.</p></div><div class="work-grid">${workExamples.map((work) => `<article class="work-card"><div class="before-after" aria-label="Сравнение до и стало"><figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure><figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure></div><h3>${esc(work.area)}</h3><p>${esc(work.service)}</p><ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><a class="btn btn-small btn-ghost" href="#lead-form" data-open-form data-service="${esc(work.service)}" data-goal="click_calculate">Рассчитать похожую задачу</a></article>`).join('')}</div><div class="works-all-action"><a class="btn btn-ghost" href="/works/">Открыть все примеры работ</a></div></div></section>`;
}

function experienceProofSection() {
  return `<section class="section experience-proof" id="experience" aria-labelledby="experience-title"><div class="container"><div class="section-head experience-head"><h2 id="experience-title">10 лет работаем с деревьями любой сложности</h2><p>От одиночного дерева возле дома до комплексной расчистки участков и территорий.</p></div><dl class="experience-stats">${experienceStats.map((stat) => `<div class="experience-stat${stat.placeholder ? ' experience-stat-placeholder' : ''}"><dt>${esc(stat.value)}</dt><dd>${esc(stat.label)}</dd></div>`).join('')}</dl><p class="proof-transition">10 лет опыта лучше всего подтверждают реальные работы</p></div></section>`;
}

function videosSection() {
  return `<section class="section video-section" id="works"><span id="videos" class="anchor-target" aria-hidden="true"></span><div class="container"><div class="section-head"><h2>Реальные работы</h2><p>Показываем реальные объекты и выполненные работы в Москве и Московской области.</p></div><div class="video-proof-subhead"><p>Посмотрите, как мы работаем на сложных объектах: спил по частям, работа над крышами, возле домов, заборов и в ограниченном пространстве.</p></div><div class="video-group" id="clearing-videos"><div class="video-group-head"><h3>Расчистка и подготовка территории</h3><p>Показываем удаление поросли, работу техники, измельчение веток и пней.</p></div><div class="video-grid">${clearingVideos.map(videoCard).join('')}</div><div class="video-cta"><div><h3>Нужно расчистить участок?</h3><p>Пришлите фото или оставьте номер телефона — оценим объём работ и предварительную стоимость.</p></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Расчистка участка" data-goal="click_calculate">Отправить фото участка</a></div></div><div class="video-group" id="complex-videos" style="margin-top: 56px;"><div class="video-group-head"><h3>Удаление деревьев в сложных условиях</h3><p>Показываем, как выбираем способ работы рядом с домами, крышами, заборами и другими объектами.</p></div><div class="video-grid">${complexVideos.map(videoCard).join('')}</div>${videoSafety()}<div class="video-cta"><div><h3>Похожая ситуация на вашем участке?</h3><p>Оставьте номер телефона — оценим расположение дерева и предложим подходящий способ выполнения работ.</p></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Сложное удаление дерева" data-goal="click_calculate">Рассчитать стоимость</a></div></div></div></section>`;
}

function videoCard(video) {
  const poster = video.poster ? ` poster="${esc(video.poster)}"` : '';
  const preload = video.poster ? 'none' : 'metadata';
  const media = `<video class="work-video" controls preload="${preload}" playsinline${poster} aria-label="${esc(video.title)}"><source src="${esc(video.src)}" type="video/mp4">Ваш браузер не поддерживает видео. <a href="${esc(video.src)}">Открыть ролик</a>.</video>`;
  return `<article class="video-card"><div class="video-media">${media}</div><div class="video-caption"><h3>${esc(video.caption)}</h3><p>${esc(video.description)}</p><span class="video-marker">✓ ${esc(video.marker)}</span></div></article>`;
}

function videoSafety() {
  const points = [
    { title: 'Оцениваем объект', text: 'Учитываем состояние дерева, его наклон, свободное пространство и объекты вокруг.', tag: 'Осмотр и наклон' },
    { title: 'Выбираем способ удаления', text: 'Определяем, можно ли удалить дерево целиком или требуется разбор по частям.', tag: 'Выбор метода' },
    { title: 'Разбираем сверху вниз', text: 'В сложных условиях последовательно удаляем ветви и части ствола.', tag: 'Спил фрагментов' },
    { title: 'Контролируем крупные элементы', text: 'При необходимости используем верёвочные системы и другое оборудование.', tag: 'Спуск на верёвках' },
    { title: 'Учитываем имущество вокруг', text: 'Дом, крыша, забор, автомобили и другие объекты учитываются при выборе технологии.', tag: 'Защита имущества' }
  ];
  return `<div class="video-safety">
    <div class="video-safety-head">
      <h3>Как мы снижаем риск повреждений</h3>
    </div>
    <div class="video-safety-steps">${points.map((point, index) => {
      const isLast = index === points.length - 1;
      const arrowHtml = isLast
        ? `<span class="safety-flow-done" aria-label="Безопасный финал" title="Безопасный финал" aria-hidden="true">✓</span>`
        : `<span class="safety-flow-arrow" aria-label="Переход к следующему этапу" title="Переход к следующему этапу" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>`;
      return `<article><span class="safety-step-flow"><span class="safety-flow-badge">${esc(point.tag)}</span>${arrowHtml}</span><h4>${esc(point.title)}</h4><p>${esc(point.text)}</p></article>`;
    }).join('')}</div>
  </div>`;
}

function processSection() {
  const stepIcons = [
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  ];

  return `<section class="section" id="process"><div class="container"><div class="section-head"><h2>Как мы работаем</h2></div><div class="timeline">${processSteps.map(([title, text], index) => {
    const isLast = index === processSteps.length - 1;
    const connector = isLast
      ? `<div class="timeline-flow-connector is-final" aria-hidden="true"><span class="flow-track"></span><span class="flow-badge-done">Готово</span></div>`
      : `<div class="timeline-flow-connector" aria-hidden="true"><span class="flow-track"></span><svg class="flow-arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>`;
    return `<article class="timeline-step-card">
      <div class="timeline-step-header">
        <div class="timeline-icon-bubble" aria-hidden="true">${stepIcons[index]}</div>
        ${connector}
      </div>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
    </article>`;
  }).join('')}</div><div class="process-cta"><p>Есть фото дерева? Узнайте стоимость сейчас.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Отправить фото</a></div></div></section>`;
}

function organizationsSection() {
  return `<section class="section section-dark" id="organizations"><div class="container org-grid"><div><h2>Работаем с организациями</h2><p>Выполняем разовые и регулярные работы для территорий СНТ, коттеджных поселков, управляющих компаний, складов, производственных площадок и коммерческих объектов.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Расчет для организации" data-goal="organization_lead">Получить расчет для организации</a></div><ul><li>СНТ и коттеджные поселки</li><li>УК, ТСЖ и дворовые территории</li><li>Склады и производственные площадки</li><li>Базы отдыха и коммерческие объекты</li><li>Договор и смета по условиям компании</li><li>Безналичная оплата</li></ul></div></section>`;
}

function faqSection(items) {
  return `<section class="section section-muted" id="faq"><div class="container"><div class="section-head"><h2>Частые вопросы</h2></div><div class="faq-list">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>`;
}

function leadSection(title, text, selectedService = 'Фото на оценку', options = {}) {
  const formOptions = {
    ...options,
    formId: options.formId || 'bottom-lead-form',
    submitText: options.submitText || 'Рассчитать стоимость'
  };

  return `<section class="section lead-section" id="lead-form"><span id="lead" class="lead-anchor" aria-hidden="true"></span><div class="container lead-grid"><div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="lead-actions">${hasValue(site.phone) ? `<a class="btn btn-light" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>` : ''}${hasValue(site.messengerUrl) ? `<a class="btn btn-ghost-dark" href="${messengerHref('#lead-form')}" data-goal="click_whatsapp">WhatsApp</a>` : ''}${hasValue(site.maxUrl) ? `<a class="btn btn-ghost-dark" href="${maxHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_max">MAX</a>` : ''}${hasValue(site.telegramUrl) ? `<a class="btn btn-ghost-dark" href="${telegramHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_telegram">Telegram</a>` : ''}</div><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>${leadForm(selectedService, formOptions)}</div></section>`;
}

function leadForm(selectedService, options = {}) {
  const btnText = options.submitText || 'Рассчитать стоимость';
  const formId = options.formId || 'main-lead-form';
  const customClass = options.customClass ? ` ${options.customClass}` : '';

  return `<form class="lead-form${customClass}" data-lead-form data-form-id="${esc(formId)}" id="${esc(formId)}">
  <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>
  <input type="hidden" name="service" value="${esc(selectedService)}">
  <div data-form-fields>
    <div class="lead-field-group">
      <label class="lead-field-label" for="${esc(formId)}_name">Ваше имя <span class="lead-field-opt">(необязательно)</span></label>
      <input id="${esc(formId)}_name" name="name" type="text" autocomplete="name" placeholder="Ваше имя">
    </div>
    <div class="lead-field-group">
      <label class="lead-field-label" for="${esc(formId)}_phone">Номер телефона <span class="lead-field-req">*</span></label>
      <input id="${esc(formId)}_phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__" data-phone-input>
    </div>
    <button class="btn btn-accent btn-full" type="submit" data-submit-btn>${esc(btnText)}</button>
    <p class="lead-photo-note">Фото можно отправить после заявки в удобный мессенджер или на почту.</p>
  </div>
  <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a>.</p>
  <div class="form-success" data-form-success hidden>
    <div class="form-success-header">
      <span class="form-success-badge" aria-hidden="true">✓</span>
      <div class="form-success-text">
        <h3 class="form-success-heading">Заявка принята!</h3>
      </div>
    </div>
  </div>
  ${formErrorMarkup()}
</form>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Хлебные крошки">${items.map((item, index) => index === items.length - 1 ? `<span>${esc(item.name)}</span>` : `<a href="${item.url}">${esc(item.name)}</a>`).join('<span>/</span>')}</nav>`;
}

function innerHero(title, text, image, label) {
  return `<section class="inner-hero"><img src="${esc(image)}" alt="${esc(label)}" width="1024" height="768" loading="eager"><div class="inner-hero-shade"></div><div class="container inner-hero-content"><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>`;
}

function simpleHero(title, text) {
  return `<section class="simple-hero"><div class="container"><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>`;
}

function serviceCard(service) {
  return `<article class="service-card"><img src="${esc(service.image)}" alt="${esc(service.title)}" width="1024" height="768" loading="lazy"><div><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p><p class="card-note">Цена зависит от: ${service.priceFactors.slice(0, 3).map(esc).join(', ')}.</p><div class="card-actions"><a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать стоимость</a><a class="link-more" href="/${service.slug}/">Подробнее об услуге</a></div></div></article>`;
}

export function servicePage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);
  const isChipping = service.slug === 'izmelchenie-vetok';
  const body = `${innerHero(service.h1, service.lead, service.image, service.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Услуги', url: '/#services' }, { name: service.title, url: path }])}<h2>Что входит в работу</h2><ul class="rich-list">${service.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><div class="honest-note">${esc(service.warning)}</div><h2>Что влияет на расчет</h2><div class="factor-cloud">${service.priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div>${isChipping ? `<h2>Что делать со щепой после измельчения?</h2><div class="branch-what-block"><div><strong>Оставить</strong><p>Щепа остается заказчику.</p></div><div><strong>Измельчить</strong><p>Переработаем ветки в щепу.</p></div><div><strong>Вывезти</strong><p>Подготовим и организуем вывоз.</p></div></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Измельчение веток в щепу" data-goal="click_branch_chipping">Рассчитать работу под ключ</a>` : ''}<h2>Как проходит заявка</h2><div class="mini-steps">${processSteps.map(([step, text], index) => `<article><span class="mini-step-arrow" aria-hidden="true">${index < processSteps.length - 1 ? '→' : '✓'}</span><h3>${esc(step)}</h3><p>${esc(text)}</p></article>`).join('')}</div></article><aside class="side-panel"><h2>Расчет стоимости</h2><p>${esc(service.directTitle)}. Передайте фотографии, адрес объекта и желаемый результат.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать</a><a class="btn btn-ghost btn-full" href="${phoneHref()}" data-goal="click_phone">Позвонить</a></aside></div></section><section class="section section-muted"><div class="container"><div class="section-head"><h2>Может понадобиться вместе с услугой</h2></div><div class="service-grid compact">${related.map(serviceCard).join('')}</div></div></section>${faqSection([...service.faq, ...faq.slice(0, 4)])}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', service.title, { submitText: 'Рассчитать стоимость' })}`;
  const descSuffix = /фото/i.test(service.short) ? '' : ' Предварительная оценка по фото.';
  const pageDescription = `${service.short}${descSuffix}`.trim();
  return renderPage({ title: service.h1, description: pageDescription, path, image: service.image, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]), serviceSchema(service, path), faqSchema(service.faq)] });
}

const spilQuizSteps = [
  {
    question: 'Что нужно сделать?',
    type: 'single',
    options: ['Спилить дерево целиком', 'Разобрать по частям', 'Удалить аварийное дерево', 'Не знаю — нужна оценка']
  },
  {
    question: 'Примерная высота дерева:',
    type: 'single',
    options: ['до 10 м', '10–20 м', 'выше 20 м', 'не знаю']
  },
  {
    question: 'Что находится рядом?',
    type: 'multi',
    options: ['Дом', 'Забор', 'Провода', 'Другие деревья', 'Свободное место']
  },
  {
    question: 'Можно ли подъехать технике?',
    type: 'single',
    options: ['Да', 'Нет', 'Не знаю']
  }
];

const emergencyQuizSteps = [
  {
    question: 'Что произошло?',
    type: 'multi',
    options: ['Дерево наклонено', 'Сухое', 'Повреждено ветром', 'Треснул ствол', 'Зависли крупные ветви', 'Стоит над домом', 'Стоит рядом с проводами', 'Не знаю — нужна оценка']
  },
  {
    question: 'Что находится рядом?',
    type: 'multi',
    options: ['Дом', 'Забор', 'Провода', 'Дорога', 'Машины', 'Другие объекты']
  },
  {
    question: 'Можно ли подъехать технике?',
    type: 'single',
    options: ['Да', 'Нет', 'Не знаю']
  }
];

const clearingQuizSteps = [
  {
    question: 'Площадь:',
    type: 'single',
    options: ['до 6 соток', '6–10 соток', '10–20 соток', 'более 20 соток', 'не знаю']
  },
  {
    question: 'Что находится на участке?',
    type: 'multi',
    options: ['Деревья', 'Поросль', 'Кустарник', 'Мелколесье', 'Пни', 'Смешанная растительность']
  },
  {
    question: 'Что требуется?',
    type: 'multi',
    options: ['Расчистить', 'Спилить деревья', 'Удалить пни', 'Измельчить ветки', 'Вывезти', 'Подготовить под дальнейшие работы']
  },
  {
    question: 'Есть подъезд?',
    type: 'single',
    options: ['Да', 'Нет', 'Не знаю']
  }
];

const pruningQuizSteps = [
  {
    question: 'Что требуется?',
    type: 'multi',
    options: ['Санитарная обрезка', 'Удалить сухие ветви', 'Уменьшить высоту', 'Убрать ветви над домом', 'Убрать ветви над проводами', 'Формовочная обрезка', 'Не знаю']
  },
  {
    question: 'Примерная высота дерева:',
    type: 'single',
    options: ['до 10 м', '10–20 м', 'выше 20 м', 'не знаю']
  },
  {
    question: 'Что рядом?',
    type: 'multi',
    options: ['Дом', 'Забор', 'Провода', 'Свободно']
  }
];

const chippingQuizSteps = [
  {
    question: 'Что нужно переработать?',
    type: 'single',
    options: ['Ветки после спила', 'Ветки после обрезки', 'Кустарник / поросль', 'Большая куча веток', 'Не знаю']
  },
  {
    question: 'Примерный объём:',
    type: 'single',
    options: ['Несколько небольших куч', 'Средний объём', 'Большой объём', 'Очень большой объём', 'Не могу оценить']
  },
  {
    question: 'Есть подъезд к веткам?',
    type: 'single',
    options: ['Да', 'Ограниченный подъезд', 'Нет', 'Не знаю']
  },
  {
    question: 'Что сделать со щепой?',
    type: 'single',
    options: ['Оставить на участке', 'Сложить в выбранном месте', 'Нужен вывоз', 'Пока не знаю']
  }
];

const lepQuizSteps = [
  {
    question: 'Кто заказчик?',
    type: 'single',
    options: ['Частное лицо', 'СНТ / ДНП', 'Организация', 'Подрядчик', 'Другое']
  },
  {
    question: 'Что требуется?',
    type: 'multi',
    options: ['Расчистить существующую просеку', 'Удалить кустарник / поросль', 'Удалить деревья', 'Удалить аварийные деревья', 'Измельчить ветки', 'Вывезти остатки', 'Нужна оценка специалиста']
  },
  {
    question: 'Размер объекта:',
    type: 'single',
    options: ['до 100 м', '100–500 м', '500 м–1 км', 'более 1 км', 'площадь известна в га', 'не знаю']
  },
  {
    question: 'Растительность:',
    type: 'multi',
    options: ['Кустарник', 'Молодая поросль', 'Мелколесье', 'Крупные деревья', 'Смешанная']
  },
  {
    question: 'Линия действующая?',
    type: 'single',
    options: ['Да', 'Нет', 'Не знаю']
  },
  {
    question: 'Есть ТЗ?',
    type: 'single',
    options: ['Да', 'Нет']
  }
];

function heroTrustBadges(extraBadges = []) {
  const baseBadges = [
    '✓ 100% сохранность имущества',
    '✓ Материальная ответственность по договору',
    '✓ Стоимость согласовываем до начала работ',
    '✓ Предварительная оценка по фото',
    '✓ Москва и Московская область'
  ];
  const all = [...baseBadges, ...extraBadges];
  return `<div class="hero-trust-badges" aria-label="Гарантии">${all.map((b) => `<span class="hero-trust-pill">${esc(b)}</span>`).join('')}</div>`;
}

function renderFastLeadForm({ serviceCode, serviceName, formId, title, subtitle, submitText, commentPlaceholder, waText = '', isLep = false }) {
  const waLink = messengerHref('#lead-form', waText);
  const tgLink = telegramHref('#lead-form');

  return `
  <section class="section section-fast-lead" id="lead-${serviceCode}">
    <span id="lead-form" class="sr-only" aria-hidden="true"></span>
    <div class="container">
      <div class="fast-lead-wrapper">
        <div class="fast-lead-header">
          <h2>${esc(title)}</h2>
          <p class="fast-lead-subtitle">${esc(subtitle)}</p>
        </div>

        <form class="lead-form fast-lead-form" data-fast-lead-form data-service-code="${serviceCode}" data-form-id="${formId}" id="${formId}">
          <input type="hidden" name="service" value="${esc(serviceName)}">
          <input type="hidden" name="service_code" value="${serviceCode}">
          <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>

          <!-- Шаг 1: Телефон и быстрая отправка -->
          <div class="fast-step-1" data-fast-step-1>
            <div class="fast-phone-row">
              <div class="lead-field-group fast-phone-group">
                <label class="lead-field-label sr-only" for="fast_phone_${serviceCode}">Номер телефона</label>
                <input id="fast_phone_${serviceCode}" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__" data-phone-input>
              </div>
              <button class="btn btn-accent fast-submit-btn" type="submit" data-submit-btn>${esc(submitText)}</button>
            </div>
            <div class="fast-step-toggle-wrap">
              <button type="button" class="fast-step-toggle" data-toggle-step-2 aria-expanded="false">
                <span>+ ${isLep ? 'Прикрепить ТЗ / фото или указать реквизиты (необязательно)' : 'Уточнить задачу и прикрепить фото (необязательно)'}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>

          <!-- Шаг 2: Необязательные детали -->
          <div class="fast-step-2" data-fast-step-2 hidden>
            <div class="fast-fields-grid">
              <div class="lead-field-group">
                <label class="lead-field-label" for="fast_name_${serviceCode}">${isLep ? 'Контактное лицо / Имя' : 'Ваше имя'}</label>
                <input id="fast_name_${serviceCode}" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться">
              </div>
              <div class="lead-field-group">
                <label class="lead-field-label" for="fast_city_${serviceCode}">${isLep ? 'Организация / СНТ / Район' : 'Город / район / СНТ'}</label>
                <input id="fast_city_${serviceCode}" name="city" type="text" placeholder="${isLep ? 'Например, СНТ Березка, Дмитровский р-н' : 'Например, Истринский район'}">
              </div>
            </div>
            <div class="lead-field-group">
              <label class="lead-field-label" for="fast_comment_${serviceCode}">Комментарий к задаче</label>
              <textarea id="fast_comment_${serviceCode}" name="comment" rows="2" placeholder="${esc(commentPlaceholder)}"></textarea>
            </div>
            <div class="lead-field-group file-upload-group">
              <label class="file-upload-label" for="fast_photos_${serviceCode}">
                <span class="file-upload-icon">📷</span>
                <span class="file-upload-text"><strong>${isLep ? 'Прикрепить ТЗ, документы или фото (до 5 файлов)' : 'Прикрепить фотографии (до 5 шт.)'}</strong><br><small>${isLep ? 'Файлы ТЗ, карты местности, схемы, фото растительности' : 'Подойдут фото с телефона: общий вид, ствол, окружение'}</small></span>
              </label>
              <input id="fast_photos_${serviceCode}" name="photos" type="file" accept="${isLep ? 'image/*,.pdf,.doc,.docx,.xls,.xlsx' : 'image/*'}" multiple data-photos-input class="sr-only">
              <div class="file-preview-list" data-file-preview></div>
            </div>
          </div>

          <div class="fast-micro-trust">
            <span class="micro-trust-badge">✓ Стоимость до начала работ</span>
            <span class="micro-trust-badge">✓ Москва и МО</span>
            <span class="micro-trust-badge">✓ Работа по договору</span>
          </div>

          <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a>.</p>

          <!-- Успех -->
          <div class="form-success fast-form-success" data-form-success hidden>
            <div class="form-success-header">
              <span class="form-success-badge" aria-hidden="true">✓</span>
              <div class="form-success-text">
                <h3 class="form-success-heading">Заявка принята!</h3>
                <p class="form-success-sub">Свяжемся после получения заявки для предварительной оценки стоимости.</p>
              </div>
            </div>
            <div class="fast-success-step2-prompt" data-success-step2-prompt>
              <p class="fast-step2-invite">Хотите прислать фото или ТЗ напрямую мастеру?</p>
              <div class="fast-success-msgr-chips">
                <a class="btn btn-small btn-wa" href="${waLink}" target="_blank" rel="noopener" data-goal="click_whatsapp">Отправить в WhatsApp</a>
                <a class="btn btn-small btn-tg" href="${tgLink}" target="_blank" rel="noopener" data-goal="click_telegram">Отправить в Telegram</a>
              </div>
            </div>
          </div>

          ${formErrorMarkup('fast-form-error', waText)}
        </form>
      </div>
    </div>
  </section>`;
}

function renderQuiz({ serviceCode, serviceName, quizId, title, subtitle, steps, finalCtaText, submitNote, waText = '', isLep = false }) {
  const totalSteps = steps.length + 1;
  const waLink = messengerHref('#lead-form', waText);
  const tgLink = telegramHref('#lead-form');

  return `
  <section class="section section-quiz" id="${quizId}">
    <div class="container">
      <div class="section-head text-center">
        <h2>${esc(title)}</h2>
        <p class="section-subhead">${esc(subtitle)}</p>
      </div>

      <div class="quiz-container" data-quiz data-service-code="${serviceCode}" data-total-steps="${totalSteps}">
        <div class="quiz-progress-wrap" aria-label="Прогресс расчёта стоимости">
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width: ${Math.round(100 / totalSteps)}%;"></div></div>
          <div class="quiz-step-meta">
            <span class="quiz-step-label">Шаг <strong data-quiz-step-num>1</strong> из ${totalSteps}</span>
          </div>
        </div>

        <form class="quiz-form" data-quiz-form id="form-${quizId}">
          <input type="hidden" name="service" value="${esc(serviceName)}">
          <input type="hidden" name="service_code" value="${serviceCode}">
          <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>

          ${steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isSingle = step.type === 'single';
            return `
            <div class="quiz-step${stepNum === 1 ? ' is-active' : ''}" data-step="${stepNum}" data-question="${esc(step.question)}">
              <div class="quiz-question-box">
                <h3 class="quiz-question-title">${esc(step.question)}</h3>
                <p class="quiz-question-hint">${isSingle ? 'Выберите один вариант:' : 'Можно выбрать несколько вариантов:'}</p>
              </div>
              <div class="quiz-options-grid${isSingle ? ' quiz-options-grid--single' : ' quiz-options-grid--multi'}">
                ${step.options.map((opt) => `
                  <label class="quiz-option-card">
                    <input type="${isSingle ? 'radio' : 'checkbox'}" name="q_${stepNum}" value="${esc(opt)}" class="sr-only quiz-option-input">
                    <span class="quiz-option-box">
                      <span class="quiz-option-indicator" aria-hidden="true">${isSingle ? '○' : '□'}</span>
                      <span class="quiz-option-text">${esc(opt)}</span>
                    </span>
                  </label>
                `).join('')}
              </div>
              <div class="quiz-step-actions">
                ${stepNum > 1 ? `<button type="button" class="btn btn-secondary quiz-btn-prev" data-quiz-prev>← Назад</button>` : ''}
                <button type="button" class="btn btn-primary quiz-btn-next" data-quiz-next>Далее →</button>
              </div>
            </div>`;
          }).join('')}

          <!-- Финальный шаг: Контакты и отправка -->
          <div class="quiz-step quiz-step-final" data-step="${totalSteps}">
            <div class="quiz-question-box">
              <h3 class="quiz-question-title">Куда прислать предварительный расчёт?</h3>
              <p class="quiz-question-hint">Оценим параметры задачи и свяжемся с вами после получения ответов.</p>
            </div>
            <div class="quiz-final-grid">
              <div class="lead-field-group">
                <label class="lead-field-label" for="phone_${quizId}">Номер телефона <span class="required">*</span></label>
                <input id="phone_${quizId}" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__" data-phone-input>
              </div>
              <div class="lead-field-group">
                <label class="lead-field-label" for="name_${quizId}">${isLep ? 'Контактное лицо / Организация' : 'Ваше имя (необязательно)'}</label>
                <input id="name_${quizId}" name="name" type="text" autocomplete="name" placeholder="${isLep ? 'Имя или организация' : 'Как к вам обращаться'}">
              </div>
              <div class="lead-field-group file-upload-group">
                <label class="file-upload-label" for="photos_${quizId}">
                  <span class="file-upload-icon">📷</span>
                  <span class="file-upload-text"><strong>${isLep ? 'Прикрепить ТЗ, документы или фото (до 5 файлов)' : 'Прикрепить фото объекта (необязательно)'}</strong><br><small>${isLep ? 'Файлы ТЗ, схемы, фото растительности' : 'По фото назовём точный ориентир стоимости до выезда'}</small></span>
                </label>
                <input id="photos_${quizId}" name="photos" type="file" accept="${isLep ? 'image/*,.pdf,.doc,.docx,.xls,.xlsx' : 'image/*'}" multiple data-photos-input class="sr-only">
                <div class="file-preview-list" data-file-preview></div>
              </div>
            </div>
            <div class="quiz-step-actions quiz-final-actions">
              <button type="button" class="btn btn-secondary quiz-btn-prev" data-quiz-prev>← Назад</button>
              <button type="submit" class="btn btn-accent quiz-submit-btn" data-submit-btn>${esc(finalCtaText)}</button>
            </div>
            <p class="quiz-submit-note">${esc(submitNote)}</p>
            <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a>.</p>
          </div>

          <!-- Состояние успеха -->
          <div class="form-success quiz-form-success" data-form-success hidden>
            <div class="form-success-header">
              <span class="form-success-badge" aria-hidden="true">✓</span>
              <div class="form-success-text">
                <h3 class="form-success-heading">Данные приняты!</h3>
                <p class="form-success-sub">Свяжемся после получения заявки для уточнения деталей и расчёта стоимости.</p>
              </div>
            </div>
            <div class="quiz-success-footer">
              <p>Также вы можете сразу отправить фото и задать вопрос мастеру в мессенджерах:</p>
              <div class="quiz-success-msgr-chips">
                <a class="btn btn-small btn-wa" href="${waLink}" target="_blank" rel="noopener" data-goal="click_whatsapp">Написать в WhatsApp</a>
                <a class="btn btn-small btn-tg" href="${tgLink}" target="_blank" rel="noopener" data-goal="click_telegram">Написать в Telegram</a>
              </div>
            </div>
          </div>

          ${formErrorMarkup('quiz-form-error', waText)}
        </form>
      </div>
    </div>
  </section>`;
}

export function spilLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug && !['spil-derevev-po-chastyam', 'udalenie-avariynyh-derevev', 'udalenie-suhih-derevev'].includes(item.slug)).slice(0, 4);

  const fellingWorks = workExamples.filter((work) =>
    work.service.toLowerCase().includes('спил') || work.service.toLowerCase().includes('удаление аварийного')
  );

  const hero = `
  <section class="landing-hero landing-hero--spil">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Спил и удаление деревьев<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Спилим дерево целиком или безопасно разберём по частям возле дома, забора, проводов и других объектов. Предварительно рассчитаем стоимость по фотографии.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#quiz-spil" data-goal="click_calculate">Рассчитать стоимость спила</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        ${heroTrustBadges(['✓ Опытные арбористы'])}
      </div>
      <aside class="landing-hero-card" aria-label="Расчёт стоимости спила">
        <div class="landing-hero-media">
          <img src="/assets/sekcionnyj-main.png" alt="Спил дерева возле дома арбористом" width="519" height="905" fetchpriority="high">
          <span class="landing-hero-tag">Сложный спил возле строений</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтверждённые стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Спил дерева целиком</span><strong>от 1 000 ₽</strong></li>
            <li><span>Спил по частям</span><strong>от 3 500 ₽</strong></li>
            <li><span>Контролируемый спуск частей</span><strong>от 5 000 ₽</strong></li>
            <li><span>Аварийное дерево</span><strong>от 4 000 ₽</strong></li>
          </ul>
          <p class="hero-prices-note">Окончательная цена зависит от высоты, диаметра и условий вокруг дерева.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-spil">
          <a class="btn btn-accent btn-full" href="#quiz-spil" data-goal="click_calculate">Рассчитать стоимость спила</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'spil',
    serviceName: 'Спил и удаление деревьев',
    formId: 'fast-lead-spil',
    title: 'Быстрый расчёт стоимости спила',
    subtitle: 'Оставьте номер телефона — свяжемся после получения заявки и предварительно оценим стоимость.',
    submitText: 'Получить расчёт спила',
    commentPlaceholder: 'Укажите породу дерева, примерную высоту или опишите окружение (дом, забор, провода)',
    waText: waDirectTexts.spil
  });

  const quiz = renderQuiz({
    serviceCode: 'spil',
    serviceName: 'Спил и удаление деревьев',
    quizId: 'quiz-spil',
    title: 'Предварительный расчёт стоимости спила',
    subtitle: 'Ответьте на несколько вопросов — предварительно оценим стоимость и технологию удаления',
    steps: spilQuizSteps,
    finalCtaText: 'Получить предварительный расчёт',
    submitNote: 'Окончательная смета подтверждается по фото или при осмотре до начала работ.',
    waText: waDirectTexts.spil
  });

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-spil">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в работу</h2>
        <p class="section-subhead">Подберём подходящий способ спила под вашу ситуацию и условия на участке.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌲</span>
          <h3>Спил дерева целиком</h3>
          <p>Валка под корень в заданном направлении при наличии свободного сектора для безопасного падения.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🪜</span>
          <h3>Разбор дерева по частям</h3>
          <p>Аккуратный спил кроны и ствола фрагментами сверху вниз альпинистами или с автовышки в стеснённых условиях.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚠️</span>
          <h3>Удаление сухого или аварийного дерева</h3>
          <p>Срочная и безопасная ликвидация аварийных, наклонённых и надломленных деревьев без риска для построек.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Работа возле домов, заборов и коммуникаций</h3>
          <p>Контролируемый спуск частей на верёвках с полной защитой кровли, забора, фасада и проводов.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчение веток в щепу</h3>
          <p>Собственный щепорез переработает ветки в щепу прямо на месте, значительно уменьшив объём порубочных остатков.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Организация вывоза по согласованию</h3>
          <p>Распилим ствол на дрова или организуем погрузку и вывоз порубочных остатков контейнером.</p>
        </div>
      </div>
    </div>
  </section>`;

  const realWorks = `
  <section class="section section-works-lp" id="real-works-spil">
    <div class="container">
      <div class="section-head">
        <h2>Примеры выполненного спила деревьев</h2>
        <p>Показываем реальные кейсы аккуратного удаления деревьев в стеснённых условиях и возле домов.</p>
      </div>
      <div class="work-grid work-grid--felling${fellingWorks.length === 1 ? ' work-grid--single' : ''}">
        ${fellingWorks.map((work) => `
          <article class="work-card">
            <div class="before-after" aria-label="Сравнение до и стало">
              <figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure>
              <figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure>
            </div>
            <h3>${esc(work.area)}</h3>
            <p>${esc(work.service)}</p>
            <ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </article>
        `).join('')}
      </div>

      <div class="video-proof-block">
        <h3 class="video-proof-title">Видео удаления деревьев в сложных условиях</h3>
        <p class="video-proof-sub">Разбор высоких деревьев арбористом сверху вниз, работа с автовышки и контролируемый спуск частей:</p>
        <div class="video-grid">
          ${complexVideos.slice(0, 4).map(videoCard).join('')}
        </div>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-spil">
    <div class="container">
      <div class="section-head">
        <h2>Цена спила и от чего зависит стоимость</h2>
        <p class="section-subhead">Показываем реальные подтверждённые цены. Окончательный расчёт зависит от параметров дерева и окружения.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил дерева целиком (с земли)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 1 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил дерева по частям (стеснённые условия)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 3 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил с контролируемым спуском частей</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 5 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Удаление сложного аварийного дерева</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 4 000 ₽</strong>
          </div>
        </div>
        <div class="pricing-summary-explanation">
          <div>
            <strong>От чего зависит цена спила?</strong>
            <ul class="pricing-factors-list">
              <li>Высота и диаметр ствола дерева;</li>
              <li>Естественный наклон и возможность свободного падения;</li>
              <li>Наличие зданий, крыши, забора, теплицы или посадок под деревом;</li>
              <li>Проходящие рядом линии электропередачи или связи;</li>
              <li>Возможность подъезда техники (автовышки);</li>
              <li>Необходимость распила на дрова, измельчения веток и вывоза.</li>
            </ul>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#quiz-spil" data-goal="click_calculate">Рассчитать стоимость спила</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-spil">
    <div class="container text-center">
      <h2>Нужно спилить дерево аккуратно и без повреждений?</h2>
      <p class="repeat-cta-sub">Предварительно оценим стоимость по фото. Итоговую стоимость согласуем и фиксируем до начала работ.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-spil" data-goal="click_calculate">Рассчитать стоимость спила</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${quiz}
    ${whatWeDo}
    ${realWorks}
    ${pricingSection}
    ${faqSection(spilDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: service.h1,
    description: `${service.short} Предварительная оценка стоимости по фото. Работаем возле домов и заборов, выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    leadHref: '#quiz-spil',
    waText: waDirectTexts.spil,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(spilDirectFaq)
    ]
  });
}

export function emergencyLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug && !['spil-derevev-po-chastyam', 'spil-derevev', 'udalenie-suhih-derevev'].includes(item.slug)).slice(0, 4);

  const emergencyWorks = workExamples.filter((work) =>
    work.service.toLowerCase().includes('аварийного') || work.service.toLowerCase().includes('спил')
  );

  const hero = `
  <section class="landing-hero landing-hero--emergency">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Удаление аварийных деревьев<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Срочное и безопасное удаление опасных, наклонённых, сухих и повреждённых деревьев после ветра. Работаем рядом с домами, крышами, заборами и проводами.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить сейчас</a>
          <a class="btn btn-hero-secondary" href="#quiz-emergency" data-goal="click_calculate">Оценить дерево по фото</a>
        </div>
        ${heroTrustBadges(['✓ Выезд бригады — от 2 часов'])}
      </div>
      <aside class="landing-hero-card" aria-label="Оценка опасного дерева">
        <div class="landing-hero-media">
          <img src="/assets/avarijnoe-main.jpg" alt="Удаление опасного аварийного дерева" width="1024" height="768" fetchpriority="high">
          <span class="landing-hero-tag">Выезд бригады — от 2 часов</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтверждённые стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Аварийное дерево</span><strong>от 4 000 ₽</strong></li>
            <li><span>Спил по частям</span><strong>от 3 500 ₽</strong></li>
            <li><span>Контролируемый спуск частей</span><strong>от 5 000 ₽</strong></li>
            <li><span>Спил с автовышки</span><strong>от 3 000 ₽</strong></li>
          </ul>
          <p class="hero-prices-note">Окончательная цена зависит от степени аварийности, наклона и строений рядом.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-emergency">
          <a class="btn btn-accent btn-full" href="#quiz-emergency" data-goal="click_calculate">Оценить дерево по фото</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'emergency_tree',
    serviceName: 'Удаление аварийных деревьев',
    formId: 'fast-lead-emergency',
    title: 'Срочная оценка аварийного дерева',
    subtitle: 'Введите номер телефона — свяжемся после получения заявки для оценки опасности и расчёта.',
    submitText: 'Оценить опасное дерево',
    commentPlaceholder: 'Опишите проблему: угол наклона, трещины, нависание над крышей или проводами',
    waText: waDirectTexts.emergency_tree
  });

  const quiz = renderQuiz({
    serviceCode: 'emergency_tree',
    serviceName: 'Удаление аварийных деревьев',
    quizId: 'quiz-emergency',
    title: 'Предварительная оценка аварийного дерева',
    subtitle: 'Ответьте на несколько вопросов — подберём безопасный способ и назовём ориентир стоимости',
    steps: emergencyQuizSteps,
    finalCtaText: 'Оценить дерево по фото',
    submitNote: 'Оценка носит предварительный характер. Окончательные условия подтверждаются до начала работ.',
    waText: waDirectTexts.emergency_tree
  });

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-emergency">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в работу</h2>
        <p class="section-subhead">Безопасные технологии ликвидации опасных деревьев любой категории сложности.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚠️</span>
          <h3>Оценка степени аварийности</h3>
          <p>Определяем наклон, прочность древесины, точки механического напряжения и угрозу строениям.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🪜</span>
          <h3>Разбор по частям сверху вниз</h3>
          <p>Аккуратное спиливание ветвей и фрагментов ствола арбористом или с автовышки без неконтролируемого падения.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Спуск частей на верёвках над строениями</h3>
          <p>Контролируемое опускание каждого элемента в зону сброса при нависании над крышей, забором или беседкой.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚡</span>
          <h3>Работы возле линий коммуникаций</h3>
          <p>Оценка расстояния до проводов, аккуратное снятие ветвей и освобождение проездов.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Распил и измельчение веток</h3>
          <p>Распиливаем ствол на части, перерабатываем ветки собственным щепорезом в щепу прямо на месте.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Уборка и вывоз по согласованию</h3>
          <p>Организуем погрузку и вывоз порубочных остатков контейнером по условиям договора.</p>
        </div>
      </div>
    </div>
  </section>`;

  const realWorks = `
  <section class="section section-works-lp" id="real-works-emergency">
    <div class="container">
      <div class="section-head">
        <h2>Реальные примеры удаления аварийных деревьев</h2>
        <p>Показываем ликвидацию последствий сильного ветра и удаление опасных наклонённых стволов.</p>
      </div>
      <div class="work-grid work-grid--felling">
        ${emergencyWorks.map((work) => `
          <article class="work-card">
            <div class="before-after" aria-label="Сравнение до и стало">
              <figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure>
              <figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure>
            </div>
            <h3>${esc(work.area)}</h3>
            <p>${esc(work.service)}</p>
            <ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </article>
        `).join('')}
      </div>

      <div class="video-proof-block">
        <h3 class="video-proof-title">Видео удаления деревьев в сложных аварийных условиях</h3>
        <p class="video-proof-sub">Разбор стволов над постройками, автовышка и контролируемый спуск частей:</p>
        <div class="video-grid">
          ${complexVideos.slice(0, 4).map(videoCard).join('')}
        </div>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-emergency">
    <div class="container">
      <div class="section-head">
        <h2>Стоимость и от чего зависит цена</h2>
        <p class="section-subhead">Показываем реальные подтверждённые стартовые цены. Окончательный расчёт зависит от параметров задачи.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Удаление сложного аварийного дерева</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 4 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил дерева по частям (стеснённые условия)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 3 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил с контролируемым спуском частей</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 5 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил с автовышки</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 3 000 ₽</strong>
          </div>
        </div>
        <div class="pricing-summary-explanation">
          <div>
            <strong>От чего зависит цена удаления опасного дерева?</strong>
            <ul class="pricing-factors-list">
              <li>Степень аварийности (надломлен ствол, вывернут корень, зависло на постройке);</li>
              <li>Угроза объектам рядом (дом, крыша, забор, припаркованные машины);</li>
              <li>Срочность выполнения работ;</li>
              <li>Способ безопасного разбора (целиком, фрагментами, автовышкой);</li>
              <li>Доступ техники и необходимость вывоза порубочных остатков.</li>
            </ul>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#quiz-emergency" data-goal="click_calculate">Оценить опасное дерево</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-emergency">
    <div class="container text-center">
      <h2>Опасное дерево на участке? Не рискуйте постройками</h2>
      <p class="repeat-cta-sub">Сделайте фото с безопасного расстояния — предварительно оценим стоимость и сложность работ до выезда.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-emergency" data-goal="click_calculate">Оценить дерево по фото</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить сейчас</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${quiz}
    ${pricingSection}
    ${whatWeDo}
    ${realWorks}
    ${faqSection(emergencyDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: service.h1,
    description: `${service.short} Предварительная оценка опасности по фото. Срочный выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    leadHref: '#quiz-emergency',
    waText: waDirectTexts.emergency_tree,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(emergencyDirectFaq)
    ]
  });
}

export function raschistkaLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug && !['izmelchenie-vetok', 'droblenie-pney', 'korchevanie-pney'].includes(item.slug)).slice(0, 4);

  const hero = `
  <section class="landing-hero landing-hero--clearing">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Расчистка участков от деревьев, кустарника и поросли<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Спил деревьев, вырубка мелколесья, измельчение веток в щепу, корчевание или дробление пней. Предварительно оценим стоимость по фото и площади участка.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#quiz-clearing" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        ${heroTrustBadges(['✓ Собственный щепорез и бензоинструмент'])}
      </div>
      <aside class="landing-hero-card" aria-label="Расчёт стоимости расчистки">
        <div class="landing-hero-media">
          <img src="/assets/raschistka-real.png" alt="Расчистка заросшего участка техникой" width="1086" height="1448" fetchpriority="high">
          <span class="landing-hero-tag">Комплексная расчистка под ключ</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтверждённые стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Расчистка участка</span><strong>от 5 000 ₽</strong></li>
            <li><span>Измельчение веток</span><strong>от 2 500 ₽</strong></li>
            <li><span>Удаление пней</span><strong>от 1 500 ₽</strong></li>
            <li><span>Вывоз порубочных остатков</span><strong>по согласованию</strong></li>
          </ul>
          <p class="hero-prices-note">Стоимость зависит от площади в сотках, плотности кустарника и объёма деревьев.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-clearing">
          <a class="btn btn-accent btn-full" href="#quiz-clearing" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'land_clearing',
    serviceName: 'Расчистка участков',
    formId: 'fast-lead-clearing',
    title: 'Быстрый расчёт стоимости расчистки',
    subtitle: 'Оставьте номер телефона — свяжемся после получения заявки и предварительно оценим объём и стоимость.',
    submitText: 'Получить расчёт расчистки',
    commentPlaceholder: 'Укажите примерную площадь в сотках, степень зарослей или что нужно сделать',
    waText: waDirectTexts.land_clearing
  });

  const quiz = renderQuiz({
    serviceCode: 'land_clearing',
    serviceName: 'Расчистка участков',
    quizId: 'quiz-clearing',
    title: 'Предварительный расчёт расчистки участка',
    subtitle: 'Ответьте на несколько вопросов — определим фронт работ и назовём ориентировочную стоимость',
    steps: clearingQuizSteps,
    finalCtaText: 'Получить предварительный расчёт',
    submitNote: 'Окончательная смета подтверждается по фото или при осмотре до начала работ.',
    waText: waDirectTexts.land_clearing
  });

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-clearing">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в работу</h2>
        <p class="section-subhead">Приведём в порядок заросшую территорию под ключ или выполним отдельные операции.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌲</span>
          <h3>Спил деревьев</h3>
          <p>Спил сухих, аварийных, наклонённых и мешающих деревьев любого размера целиком или по частям.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌿</span>
          <h3>Вырубка кустарника и поросли</h3>
          <p>Сплошная вырубка дикого кустарника, малинника, ивняка и плотного мелколесья под корень.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌾</span>
          <h3>Покос бурьяна и высокой травы</h3>
          <p>Скашивание бурьяна, сухостоя, крапивы и борщевика мощными профессиональными бензокосами.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчение веток в щепу</h3>
          <p>Собственный мобильный щепорез переработает ветки прямо на месте, значительно сократив объём порубочных остатков.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚜</span>
          <h3>Дробление и корчевание пней</h3>
          <p>Удаление пней ниже уровня земли фрезой без рытья котлованов или аккуратное корчевание с корнями.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Уборка и вывоз по согласованию</h3>
          <p>Сложим древесину в аккуратные штабели или организуем погрузку и вывоз порубочных остатков контейнерами.</p>
        </div>
      </div>
    </div>
  </section>`;

  const realWorks = `
  <section class="section section-works-lp" id="real-works-clearing">
    <div class="container">
      <div class="section-head">
        <h2>Реальный результат расчистки: до и стало</h2>
        <p>Показываем, как участок из непроходимых зарослей превращается в чистую территорию под строительство или продажу.</p>
      </div>
      <div class="clearing-showcase">
        <div class="clearing-before-after">
          <figure>
            <img src="/assets/works/zarosli-real-do.png" alt="Заросший участок до расчистки" width="1024" height="1536" loading="lazy">
            <figcaption>До расчистки: сплошные заросли кустарника и поросли</figcaption>
          </figure>
          <figure>
            <img src="/assets/works/zarosli-real-posle.png" alt="Расчищенный участок после работы" width="1024" height="1536" loading="lazy">
            <figcaption>После расчистки: чистое пространство, готовое к строительству</figcaption>
          </figure>
        </div>
        <div class="clearing-case-details">
          <h3>Кейс: комплексная подготовка заросшего участка</h3>
          <ul class="rich-list">
            <li>Спил мешающих и сухих деревьев;</li>
            <li>Вырубка дикого кустарника и поросли под уровень земли;</li>
            <li>Измельчение веток мобильным щепорезом на месте;</li>
            <li>Дробление оставшихся пней ниже уровня грунта.</li>
          </ul>
        </div>
      </div>

      <div class="video-proof-block" style="margin-top: 48px;">
        <h3 class="video-proof-title">Техника и процесс расчистки в работе</h3>
        <p class="video-proof-sub">Работа мобильного измельчителя веток, удаление подлеска и дробление пней:</p>
        <div class="video-grid">
          ${clearingVideos.map(videoCard).join('')}
        </div>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-clearing">
    <div class="container">
      <div class="section-head">
        <h2>Цена расчистки и от чего зависит стоимость</h2>
        <p class="section-subhead">Показываем реальные стартовые цены. Точный расчёт сметы формируем по вашим фотографиям и параметрам участка.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Комплексная расчистка участка</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 5 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Измельчение веток щепорезом</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 2 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Удаление и дробление пней</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 1 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Вывоз растительных остатков</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">по согласованию</strong>
          </div>
        </div>
        <div class="pricing-summary-explanation">
          <div>
            <strong>От чего зависит стоимость расчистки?</strong>
            <ul class="pricing-factors-list">
              <li>Площадь территории в сотках или гектарах;</li>
              <li>Плотность и высота кустарника, поросли, бурьяна;</li>
              <li>Количество, порода и диаметр деревьев под спил;</li>
              <li>Необходимость удаления или дробления пней;</li>
              <li>Необходимость измельчения веток в щепу;</li>
              <li>Условия заезда техники и вывоз порубочных остатков.</li>
            </ul>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#quiz-clearing" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-clearing">
    <div class="container text-center">
      <h2>Нужно привести заросший участок в порядок?</h2>
      <p class="repeat-cta-sub">Пришлите 2–3 фото участка и примерную площадь. Стоимость согласуем и фиксируем до начала выполнения работ.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-clearing" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${quiz}
    ${whatWeDo}
    ${realWorks}
    ${pricingSection}
    ${faqSection(clearingDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: service.h1,
    description: `${service.short} Предварительный расчёт по фото и площади. Собственная техника, выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    leadHref: '#quiz-clearing',
    waText: waDirectTexts.land_clearing,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(clearingDirectFaq)
    ]
  });
}

export function pruningLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug && !['spil-derevev-po-chastyam', 'udalenie-avariynyh-derevev', 'udalenie-suhih-derevev'].includes(item.slug)).slice(0, 4);

  const hero = `
  <section class="landing-hero landing-hero--pruning">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Обрезка деревьев<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Санитарная, омолаживающая и формовочная обрезка, удаление сухих и нависающих ветвей арбористами и с автовышки. Предварительно оценим стоимость по фото до выезда.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#quiz-pruning" data-goal="click_calculate">Рассчитать стоимость обрезки</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        ${heroTrustBadges(['✓ Профессиональные арбористы'])}
      </div>
      <aside class="landing-hero-card" aria-label="Расчёт стоимости обрезки">
        <div class="landing-hero-media">
          <img src="/assets/obrezka-main.jpg" alt="Обрезка веток дерева арбористом" width="1024" height="768" fetchpriority="high">
          <span class="landing-hero-tag">Аккуратная обрезка и кронирование</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтверждённые стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Санитарная обрезка</span><strong>от 1 500 ₽</strong></li>
            <li><span>Омолаживающая обрезка</span><strong>от 2 500 ₽</strong></li>
            <li><span>Формовочная обрезка</span><strong>от 2 000 ₽</strong></li>
            <li><span>Спил сучьев над крышей</span><strong>от 2 500 ₽</strong></li>
          </ul>
          <p class="hero-prices-note">Окончательная цена зависит от высоты, густоты кроны и условий вокруг дерева.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-pruning">
          <a class="btn btn-accent btn-full" href="#quiz-pruning" data-goal="click_calculate">Рассчитать стоимость обрезки</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'tree_pruning',
    serviceName: 'Обрезка деревьев',
    formId: 'fast-lead-pruning',
    title: 'Быстрый расчёт стоимости обрезки',
    subtitle: 'Оставьте номер телефона — свяжемся после получения заявки и предварительно оценим объём и стоимость.',
    submitText: 'Получить расчёт обрезки',
    commentPlaceholder: 'Укажите породу дерева, примерную высоту, количество деревьев или что мешает',
    waText: waDirectTexts.tree_pruning
  });

  const quiz = renderQuiz({
    serviceCode: 'tree_pruning',
    serviceName: 'Обрезка деревьев',
    quizId: 'quiz-pruning',
    title: 'Предварительный расчёт стоимости обрезки',
    subtitle: 'Ответьте на несколько вопросов — определим вид обрезки и назовём ориентир стоимости',
    steps: pruningQuizSteps,
    finalCtaText: 'Получить расчёт обрезки',
    submitNote: 'Окончательная цена подтверждается по фото или при осмотре до начала работ.',
    waText: waDirectTexts.tree_pruning
  });

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-pruning">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в работу</h2>
        <p class="section-subhead">Профессиональный уход за кроной деревьев с сохранением их здоровья и безопасности.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌿</span>
          <h3>Санитарная обрезка</h3>
          <p>Удаление сухих, больных, надломленных и перекрещивающихся ветвей для защиты здоровья дерева и безопасности.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌳</span>
          <h3>Омолаживающая обрезка</h3>
          <p>Глубокое прореживание кроны, удаление старых ветвей, стимуляция роста молодых сильных побегов.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">✂️</span>
          <h3>Формовочная обрезка</h3>
          <p>Придание кроне аккуратной геометрической или естественной формы, ограничение разрастания в ширину и высоту.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Спил нависающих ветвей над постройками</h3>
          <p>Аккуратное срезание и спуск на верёвках тяжелых ветвей, нависающих над крышами, загородными домами и заборами.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчение веток в щепу</h3>
          <p>Собственный мобильный щепорез переработает все спиленные ветви в щепу прямо на месте без захламления участка.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Уборка и вывоз по согласованию</h3>
          <p>Очистим газон от мелких веток, аккуратно сложим древесину или организуем вывоз порубочных остатков.</p>
        </div>
      </div>
    </div>
  </section>`;

  const realWorks = `
  <section class="section section-works-lp" id="real-works-pruning">
    <div class="container">
      <div class="section-head">
        <h2>Примеры аккуратной работы с кроной</h2>
        <p>Показываем работу альпинистов и автовышки при санитарной и сложной обрезке в стеснённых условиях.</p>
      </div>
      <div class="video-proof-block">
        <h3 class="video-proof-title">Видео обрезки и спила ветвей в сложных условиях</h3>
        <p class="video-proof-sub">Снятие сучьев над строениями и проводами, работа арбориста на высоте:</p>
        <div class="video-grid">
          ${complexVideos.slice(0, 4).map(videoCard).join('')}
        </div>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-pruning">
    <div class="container">
      <div class="section-head">
        <h2>Цена обрезки и от чего зависит стоимость</h2>
        <p class="section-subhead">Показываем реальные подтверждённые цены. Окончательный расчёт зависит от параметров дерева и условий работы.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Санитарная обрезка (сухие ветки)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 1 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Омолаживающая обрезка кроны</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 2 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Формовочная обрезка</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 2 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил опасных сучьев над строениями</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 2 500 ₽</strong>
          </div>
        </div>
        <div class="pricing-summary-explanation">
          <div>
            <strong>От чего зависит цена обрезки дерева?</strong>
            <ul class="pricing-factors-list">
              <li>Порода дерева, высота и диаметр ствола;</li>
              <li>Объём и плотность кроны, количество спиливаемых ветвей;</li>
              <li>Наличие строений, теплиц, заборов или проводов под кроной;</li>
              <li>Способ выполнения: верхолазное снаряжение (арбористы) или автовышка;</li>
              <li>Необходимость измельчения ветвей в щепу и вывоза с участка.</li>
            </ul>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#quiz-pruning" data-goal="click_calculate">Рассчитать стоимость обрезки</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-pruning">
    <div class="container text-center">
      <h2>Нужно обрезать дерево аккуратно и безопасно?</h2>
      <p class="repeat-cta-sub">Сделайте фото дерева с расстояния — предварительно оценим стоимость и сложность работ до выезда.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-pruning" data-goal="click_calculate">Рассчитать стоимость обрезки</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${quiz}
    ${whatWeDo}
    ${realWorks}
    ${pricingSection}
    ${faqSection(pruningDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: service.h1,
    description: `${service.short} Предварительная оценка стоимости по фото. Санитарная, омолаживающая и формовочная обрезка по Москве и МО.`,
    path,
    image: service.image,
    body,
    leadHref: '#quiz-pruning',
    waText: waDirectTexts.tree_pruning,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(pruningDirectFaq)
    ]
  });
}

export function raschistkaProsekLepLandingPage() {
  const path = '/raschistka-prosek-lep/';
  const related = services.filter((item) =>
    ['raschistka-uchastkov', 'izmelchenie-vetok', 'spil-derevev', 'korchevanie-pney'].includes(item.slug)
  );

  const hero = `
  <section class="landing-hero landing-hero--lep">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        ${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Расчистка просек и охранных зон ЛЭП', url: path }])}
        <div class="warning-callout" role="note">
          <span class="warning-icon">⚠️</span>
          <span>Важно: условия работ возле действующих линий определяются после оценки объекта. При необходимости согласуется регламент допуска с балансодержателем сетей.</span>
        </div>
        <h1>Расчистка просек и территорий под ЛЭП<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Удаление деревьев, кустарника, поросли и ДКР вдоль линий электропередачи. Расчистка отдельных участков и протяжённых территорий. Для СНТ, организаций, подрядчиков и частных заказчиков.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#quiz-lep" data-goal="click_calculate">Получить расчёт по фото или ТЗ</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">📞 Связаться со специалистом</a>
        </div>
        ${heroTrustBadges(['✓ Официальный договор (ООО «ЮНАТ»)', '✓ Безналичный расчёт, с НДС / без НДС', '✓ Собственный щепорез с оператором'])}
      </div>
      <aside class="landing-hero-card" aria-label="Расчёт стоимости расчистки просеки">
        <div class="landing-hero-media">
          <img src="/assets/raschistka-real.png" alt="Расчистка просеки и охранной зоны ЛЭП в Подмосковье" width="1086" height="1448" fetchpriority="high">
          <span class="landing-hero-tag">Комплексная расчистка под ключ</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Параметры и условия расчёта</p>
          <ul class="hero-prices-list">
            <li><span>Стоимость объекта</span><strong>после оценки объекта</strong></li>
            <li><span>Оценка объекта</span><strong>по фото, ТЗ или выезду</strong></li>
            <li><span>Форма оплаты</span><strong>безнал / договор</strong></li>
            <li><span>Утилизация веток</span><strong>щепорез на месте</strong></li>
          </ul>
          <p class="hero-prices-note">Итоговая стоимость рассчитывается индивидуально по площади, протяжённости и плотности ДКР.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-lep">
          <a class="btn btn-accent btn-full" href="#quiz-lep" data-goal="click_calculate">Рассчитать стоимость объекта</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'lep_clearing',
    serviceName: 'Расчистка просек ЛЭП',
    formId: 'fast-lead-lep',
    isLep: true,
    title: 'Расчёт по объекту или техническому заданию',
    subtitle: 'Оставьте контакты — свяжемся после получения заявки, уточним параметры объекта или примем ТЗ на расчёт.',
    submitText: 'Получить расчёт объекта',
    commentPlaceholder: 'Укажите протяжённость трассы (км), ширину полосы (м), площадь в га или особенности',
    waText: waDirectTexts.lep_clearing
  });

  const quiz = renderQuiz({
    serviceCode: 'lep_clearing',
    serviceName: 'Расчистка просек ЛЭП',
    quizId: 'quiz-lep',
    steps: lepQuizSteps,
    isLep: true,
    title: 'Расчёт стоимости расчистки просеки / территории под ЛЭП',
    subtitle: 'Ответьте на несколько вопросов — специалист подготовит предварительную смету или согласует осмотр',
    finalCtaText: 'Получить расчёт по объекту',
    submitNote: 'Окончательная смета формируется на основании дефектной ведомости, ТЗ или после выезда специалиста.',
    waText: waDirectTexts.lep_clearing
  });

  const whatWeClear = `
  <section class="section section-what-we-clear" id="what-we-clear-lep">
    <div class="container">
      <div class="section-head">
        <h2>Что мы расчищаем</h2>
        <p class="section-subhead">Выполняем полный комплекс работ по расчистке полос отвода линейных объектов, охранных зон и прилегающих территорий.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">⚡</span>
          <h3>Просеки ЛЭП</h3>
          <p>Систематическая вырубка деревьев и кустарника в пределах установленной ширины просеки для безаварийной эксплуатации линий электропередачи всех классов напряжения.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🛡️</span>
          <h3>Охранные зоны ЛЭП</h3>
          <p>Удаление древесно-кустарниковой растительности в границах охранных зон вдоль трасс воздушных линий с обеспечением безопасных расстояний.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">📐</span>
          <h3>Трассы воздушных линий (ВЛ)</h3>
          <p>Расчистка коридоров прохождения воздушных линий ВЛ 0,4–10 кВ и выше, опиловка нависающих ветвей и крон, приближающихся к токоведущим проводам.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌿</span>
          <h3>Древесно-кустарниковую растительность (ДКР)</h3>
          <p>Сплошное и выборочное удаление дикорастущего кустарника, ивняка, мелколесья, подлеска и самосевной поросли под уровень земли.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚠️</span>
          <h3>Аварийные и угрожающие деревья</h3>
          <p>Спил деревьев с опасным наклоном, сухих, треснувших стволов за пределами охранной зоны, способных упасть на провода при сильном ветре или снегопаде.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚜</span>
          <h3>Заросшие территории вдоль линий</h3>
          <p>Ликвидация многолетних завалов, бурьяна, поваленных стволов и застарелых зарослей вдоль технологических проездов и подъездных путей к опорам.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏗️</span>
          <h3>Территории под новые линейные объекты</h3>
          <p>Подготовка и расчистка лесных коридоров перед проектированием, строительством, расширением и монтажом новых линий электропередачи.</p>
        </div>
      </div>
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#quiz-lep" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
      </div>
    </div>
  </section>`;

  const workflow = `
  <section class="section section-muted section-workflow-lep" id="workflow-lep">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в работу: полный цикл расчистки</h2>
        <p class="section-subhead">Организуем полный технологический процесс от предварительного обследования до сдачи чистой полосы заказчику.</p>
      </div>
      <div class="features-grid">
        <div class="lep-step-card">
          <span class="lep-step-badge">1</span>
          <h3>Осмотр объекта</h3>
          <p>Выезд специалистов на трассу, обследование рельефа, подъездных путей, типа грунта и видового состава насаждений.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">2</span>
          <h3>Оценка площади и плотности</h3>
          <p>Точный замер площади в гектарах или сотках, протяжённости трассы, таксация древостоя и определение густоты ДКР.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">3</span>
          <h3>Определение способа расчистки</h3>
          <p>Подбор оптимальной технологии: сплошная валка с земли, спил по частям в стеснённых условиях, обрезка крон, измельчение на месте.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">4</span>
          <h3>Валка / спил / обрезка</h3>
          <p>Безопасная валка деревьев в заданном направлении, спил аварийных стволов рядом с опорами, опиловка нависающих ветвей.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">5</span>
          <h3>Удаление кустарника и мелколесья</h3>
          <p>Сплошной срез дикорастущего кустарника, ивняка и поросли мощными кусторезами и бензопилами под уровень земли.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">6</span>
          <h3>Измельчение веток и порубочных остатков</h3>
          <p>Переработка срезанных ветвей и древесных отходов собственным мобильным щепорезом в щепу прямо на трассе (сокращение объёма до 7 раз).</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">7</span>
          <h3>Сбор или вывоз отходов</h3>
          <p>Складирование щепы в валы на границе полосы отвода, распределение по грунту либо погрузка и вывоз контейнерами на утилизацию.</p>
        </div>
        <div class="lep-step-card">
          <span class="lep-step-badge">8</span>
          <h3>Сдача очищенной территории заказчику</h3>
          <p>Совместный контрольный осмотр выполненного участка с заказчиком, подписание двустороннего акта сдачи-приёмки и передача закрывающих документов.</p>
        </div>
      </div>
    </div>
  </section>`;

  const b2bSection = `
  <section class="section section-dark section-b2b-lep" id="b2b-lep">
    <div class="container">
      <div class="lep-b2b-header">
        <span class="lep-b2b-badge">Для юридических лиц и подрядчиков</span>
        <h2>Расчистка ЛЭП для организаций и подрядчиков</h2>
        <p>Работаем с электросетевыми компаниями, подрядчиками энергетического сектора, строительными организациями, СНТ, промышленными предприятиями и балансодержателями линейных объектов.</p>
      </div>
      <div class="features-grid">
        <div class="lep-b2b-card">
          <h3>Расчистка больших площадей</h3>
          <p>Формируем автономные звенья специалистов для оперативной расчистки протяжённых трасс и участков площадью в десятки гектаров.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Работа по техническому заданию</h3>
          <p>Строго соблюдаем требования ТЗ, дефектных ведомостей, проектных коридоров, габаритов охранных зон и регламентов заказчика.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Поэтапная сдача работ</h3>
          <p>Возможность разбивки линейного объекта на согласованные технологические захватки и пикеты с промежуточным подписанием актов.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Официальный договор</h3>
          <p>Работаем как юридическое лицо (ООО «ЮНАТ», ИНН 2536345868), несём полную договорную и материальную ответственность.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Безналичный расчёт</h3>
          <p>Оплата по безналичному расчёту (варианты с НДС и без НДС) с предоставлением полного комплекта закрывающих документов (договор, смета, акты выполненных работ).</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Фото- и видеофиксация</h3>
          <p>Подробные отчёты состояния объекта «до / в процессе / после» на каждом этапе расчистки для удалённого контроля технадзором.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Предварительный осмотр объекта</h3>
          <p>Оперативный выезд специалистов для детального обследования трассы, рельефа и сложности до согласования сметы.</p>
        </div>
        <div class="lep-b2b-card">
          <h3>Расчёт по площади и сложности</h3>
          <p>Прозрачное сметное ценообразование на основе объективных параметров без скрытых затрат и непредвиденных наценок.</p>
        </div>
      </div>
      <div class="lep-tz-banner">
        <div class="lep-tz-banner-text">
          <h3>Есть проектная документация или ТЗ?</h3>
          <p>Присылайте файлы технического задания, дефектные ведомости и схемы трассы на почту <strong>${esc(site.email)}</strong> или в мессенджеры WhatsApp и Telegram — оперативно изучим материалы и подготовим коммерческое предложение.</p>
        </div>
        <div class="lep-tz-banner-actions">
          <a class="btn btn-accent" href="#lead-lep_clearing" data-goal="click_calculate">Отправить ТЗ для расчёта</a>
          ${hasValue(site.messengerUrl) ? `<a class="btn btn-outline" href="${messengerHref('#lead-lep_clearing', waDirectTexts.lep_clearing)}" target="_blank" rel="noopener" data-goal="click_whatsapp">WhatsApp</a>` : ''}
          ${hasValue(site.telegramUrl) ? `<a class="btn btn-outline" href="${telegramHref('#lead-lep_clearing')}" target="_blank" rel="noopener" data-goal="click_telegram">Telegram</a>` : ''}
        </div>
      </div>
    </div>
  </section>`;

  const pricingFactors = `
  <section class="section section-pricing-factors-lep" id="pricing-factors-lep">
    <div class="container">
      <div class="section-head">
        <h2>От чего зависит стоимость расчистки</h2>
        <p class="section-subhead">Мы не выдумываем фиксированные цены — точный расчёт сметы формируется под конкретные параметры вашего линейного объекта.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">📏</span>
          <h3>Площадь в га / сотках</h3>
          <p>Общий объём территории определяет количество задействованных вальщиков, операторов и продолжительность смен.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🛣️</span>
          <h3>Протяжённость трассы</h3>
          <p>Линейная длина коридора просеки и её проектная ширина (от 10 до 50+ метров в зависимости от напряжения линии).</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌳</span>
          <h3>Плотность ДКР</h3>
          <p>Густота кустарниковых зарослей, ивняка, подлеска и самосевной поросли на квадратный метр полосы.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌲</span>
          <h3>Диаметр и высота деревьев</h3>
          <p>Соотношение тонкомера, среднемерной древесины и вековых стволов диаметром от 30–40 см.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚠️</span>
          <h3>Количество аварийных деревьев</h3>
          <p>Стволы с опасным наклоном в сторону проводов, гнилью или сухостой, требующие аккуратного пофрагментного разбора.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏞️</span>
          <h3>Доступность территории</h3>
          <p>Заболоченность, перепады высот, овраги, наличие технологических проездов для перемещения людей и техники.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚙️</span>
          <h3>Необходимость измельчения</h3>
          <p>Переработка веток и древесных остатков в технологическую щепу мобильным измельчителем прямо на полосе отвода.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚛</span>
          <h3>Необходимость вывоза</h3>
          <p>Вывоз порубочных остатков контейнерами 8, 20 или 27 м³ либо складирование в валы и распределение щепы по грунту.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚙</span>
          <h3>Возможность подъезда техники</h3>
          <p>Условия подъезда транспорта для доставки рабочих бригад, заправки оборудования и буксировки измельчителя.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">📍</span>
          <h3>Удалённость объекта</h3>
          <p>Логистическое плечо от МКАД по районам Москвы, Новой Москвы и Московской области.</p>
        </div>
      </div>
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#quiz-lep" data-goal="click_calculate">Получить расчёт</a>
      </div>
    </div>
  </section>`;

  const objectsSection = `
  <section class="section section-muted section-objects-lep" id="objects-lep">
    <div class="container">
      <div class="section-head">
        <h2>Для каких объектов выполняем расчистку</h2>
        <p class="section-subhead">Работаем с линейными, промышленными, поселковыми и частными территориями любого назначения по всей Московской области.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">⚡</span>
          <h3>Линии электропередачи</h3>
          <p>Магистральные и распределительные ЛЭП всех классов напряжения, расширение и поддержание нормативной полосы просеки.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🔌</span>
          <h3>Воздушные линии ВЛ</h3>
          <p>Трассы ВЛ 0,4, 6, 10 кВ и выше, защита проводов от касания ветвей и обрывов при падении сухостоя.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏘️</span>
          <h3>СНТ и коттеджные посёлки</h3>
          <p>Расчистка коридоров внутренних и подводящих электросетей, предотвращение аварийных отключений электричества в посёлках.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏭</span>
          <h3>Промышленные предприятия</h3>
          <p>Заводские территории, технологические коридоры, эстакады коммуникаций и площадки собственных трансформаторных подстанций.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏗️</span>
          <h3>Строительные объекты</h3>
          <p>Подготовка трасс и технологических полос перед прокладкой линейных коммуникаций и строительством объектов.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌐</span>
          <h3>Линейные объекты</h3>
          <p>Технологические полосы вдоль трубопроводов, автомобильных и железных дорог, оптико-волоконных линий связи.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏢</span>
          <h3>Территории организаций</h3>
          <p>Складские комплексы, логистические парки, автобазы и базы отдыха с расположенными на территории электросетями.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🏡</span>
          <h3>Частные земельные участки</h3>
          <p>Загородные участки, где деревья, кустарник и поросль угрожают проводам абонентского ввода и наружным сетям.</p>
        </div>
      </div>
    </div>
  </section>`;

  const trustBlock = `
  <section class="section section-trust-lep" id="trust-lep">
    <div class="container">
      <div class="section-head">
        <h2>Подтверждённый опыт и оснащение «Зелёного Среза»</h2>
        <p class="section-subhead">Опытные специалисты, профессиональный бензоинструмент, собственная база измельчителей и проверенные технологии.</p>
      </div>
      <div class="trust-grid-lp">
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🌲</span>
          <h3>Опытные специалисты и отработанные технологии</h3>
          <p>Регулярно выполняем работы по спилу сложных деревьев и комплексной расчистке заросших участков в Москве и Подмосковье.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">⚙️</span>
          <h3>Собственный щепорез с оператором</h3>
          <p>Измельчитель веток с опытным оператором перерабатывает порубочные остатки в щепу на месте, значительно сокращая объём порубочных остатков.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🪓</span>
          <h3>Профессиональный бензоинструмент</h3>
          <p>Профессиональные бензопилы, кусторезы и высоторезы — полная автономность на объектах без электричества и коммуникаций.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🧗</span>
          <h3>Опытные вальщики и арбористы</h3>
          <p>Специальное альпинистское и такелажное снаряжение для безопасного разбора аварийных деревьев рядом с опорами и проводами.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">📄</span>
          <h3>Официальный договор и безнал</h3>
          <p>Работаем как юридическое лицо (ООО «ЮНАТ», ИНН 2536345868). Договор, подробная смета, безналичный расчёт (с НДС и без НДС), закрывающие акты.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🛡️</span>
          <h3>Материальная ответственность</h3>
          <p>Отвечаем по договору за сохранность проводов, опор, ограждений и инфраструктуры заказчика при выполнении работ.</p>
        </div>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-lep">
    <div class="container text-center">
      <h2>Требуется расчистка полосы ЛЭП или охранной зоны?</h2>
      <p class="repeat-cta-sub">Отправьте параметры трассы или техническое задание — оперативно предоставим смету и согласуем выезд специалиста.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-lep" data-goal="click_calculate">Рассчитать стоимость объекта</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Связаться со специалистом</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${quiz}
    ${whatWeClear}
    ${workflow}
    ${b2bSection}
    ${pricingFactors}
    ${objectsSection}
    ${trustBlock}
    ${faqSection(lepDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: 'Расчистка просек под ЛЭП в Москве и МО | Вырубка деревьев и ДКР — Зелёный Срез',
    description: 'Расчистка просек и охранных зон ЛЭП в Москве и Московской области. Вырубка деревьев и кустарника, удаление ДКР, аварийных деревьев, измельчение и вывоз. Расчёт стоимости по объекту.',
    path,
    image: images.clearing,
    leadHref: '#quiz-lep',
    waText: waDirectTexts.lep_clearing,
    body,
    jsonLd: [
      breadcrumbSchema([
        { name: 'Главная', url: '/' },
        { name: 'Расчистка просек и охранных зон ЛЭП', url: path }
      ]),
      serviceSchema({
        title: 'Расчистка просек и охранных зон ЛЭП в Москве и Московской области',
        short: 'Расчистка просек и охранных зон ЛЭП в Москве и Московской области. Вырубка деревьев и кустарника, удаление ДКР, аварийных деревьев, измельчение и вывоз. Расчёт стоимости по объекту.'
      }, path),
      faqSchema(lepDirectFaq)
    ]
  });
}

export function izmelchenieLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);

  const hero = `
  <section class="landing-hero landing-hero--chipping">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <div class="operator-badge" role="note">
          <span class="operator-badge-icon">✓</span>
          <span>Работаем с оператором. Технику без оператора не сдаём.</span>
        </div>
        <h1>Измельчение веток (Щепорез)<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Собственный мощный измельчитель с опытным оператором на ваш участок. Быстро переработаем ветки после спила или расчистки в однородную щепу, значительно уменьшив объём порубочных остатков.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#quiz-chipping" data-goal="click_calculate">Рассчитать измельчение веток</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        ${heroTrustBadges(['✓ Собственный щепорез с оператором'])}
      </div>
      <aside class="landing-hero-card" aria-label="Расчёт стоимости измельчения веток">
        <div class="landing-hero-media">
          <img src="/assets/izmelchenie-main.jpg" alt="Измельчение веток дробилкой в щепу" width="1024" height="768" fetchpriority="high">
          <span class="landing-hero-tag">Щепорез высокой производительности</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтверждённая стоимость</p>
          <ul class="hero-prices-list">
            <li><span>Измельчение веток</span><strong>от 2 500 ₽</strong></li>
            <li><span>Работа опытного оператора</span><strong>Включена</strong></li>
            <li><span>Сокращение объёма отходов</span><strong>значительное</strong></li>
            <li><span>Вывоз щепы (по желанию)</span><strong>по согласованию</strong></li>
          </ul>
          <p class="hero-prices-note">Оценим объём работ и стоимость по фотографии веток.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form-chipping">
          <a class="btn btn-accent btn-full" href="#quiz-chipping" data-goal="click_calculate">Рассчитать стоимость измельчения веток</a>
        </div>
      </aside>
    </div>
  </section>`;

  const fastLead = renderFastLeadForm({
    serviceCode: 'branch_chipping',
    serviceName: 'Измельчение веток',
    formId: 'fast-lead-chipping',
    title: 'Быстрый расчёт стоимости измельчения веток',
    subtitle: 'Оставьте номер телефона — свяжемся после получения заявки, оценим объём работ и стоимость.',
    submitText: 'Получить расчёт измельчения',
    commentPlaceholder: 'Опишите примерный объём кучи веток (длина, ширина, высота) или породу',
    waText: waDirectTexts.branch_chipping
  });

  const branchesReadyBlock = `
  <section class="section section-chipping-ready" id="branches-ready">
    <div class="container">
      <div class="chipping-ready-card">
        <div class="chipping-ready-content">
          <span class="chipping-ready-badge">Заказ дробилки отдельно от спила</span>
          <h2>Ветки уже лежат на участке?</h2>
          <p>Если деревья уже спилены вами или другими рабочими, а ветки лежат на участке — вам не нужно заказывать комплексный спил. Мы приедем со своим щепорезом и опытным оператором исключительно на измельчение.</p>
          <ul class="rich-list">
            <li>Сделайте 1–2 фото кучи веток сбоку;</li>
            <li>Оценим объём работ и стоимость по фотографии веток;</li>
            <li>Оператор сам безопасно подаёт ветки в бункер;</li>
            <li>Щепу можно оставить как мульчу или вывезти.</li>
          </ul>
          <div class="chipping-ready-actions">
            <a class="btn btn-accent" href="#quiz-chipping" data-goal="click_calculate">Показать ветки и получить расчёт</a>
            <a class="btn btn-outline" href="${phoneHref()}" data-goal="click_phone">📞 Уточнить по телефону</a>
          </div>
        </div>
        <div class="chipping-ready-media">
          <img src="/assets/izmelchenie-main.jpg" alt="Куча веток и щепорез" width="1024" height="768" loading="lazy">
        </div>
      </div>
    </div>
  </section>`;

  const quiz = renderQuiz({
    serviceCode: 'branch_chipping',
    serviceName: 'Измельчение веток',
    quizId: 'quiz-chipping',
    title: 'Расчёт стоимости измельчения веток',
    subtitle: 'Ответьте на несколько вопросов — определим объём работ и назовём стоимость',
    steps: chippingQuizSteps,
    finalCtaText: 'Получить предварительный расчёт',
    submitNote: 'Окончательная смета подтверждается по фото кучи веток до выезда.',
    waText: waDirectTexts.branch_chipping
  });

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-chipping">
    <div class="container">
      <div class="section-head">
        <h2>Что конкретно мы сделаем</h2>
        <p class="section-subhead">Быстро переработаем любые объёмы веток прямо на вашем участке.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчим ветки в щепу</h3>
          <p>Мощная дробилка быстро перерабатывает ветви, сучья и кроны деревьев в однородную мульчу.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Работаем на участке заказчика</h3>
          <p>Приезжаем со своим оборудованием прямо на объект. Нужен только свободный подъезд для автомобиля с прицепом.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">👷</span>
          <h3>Собственный щепорез с оператором</h3>
          <p>Опытный оператор непрерывно и безопасно подаёт ветки в бункер, обеспечивая максимальную скорость.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">📋</span>
          <h3>Можно заказать отдельно от спила</h3>
          <p>Приедем исключительно на переработку, если ветки уже спилены вами или другими рабочими и лежат на участке.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌿</span>
          <h3>Переработаем ветки после спила или расчистки</h3>
          <p>Подходят ветки любых пород, кроны спиленных деревьев, садовая обрезка, дикий кустарник и поросль.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Щепу можно оставить или организовать вывоз</h3>
          <p>Щепу можно использовать как натуральную мульчу на клумбах и дорожках, либо организуем её вывоз.</p>
        </div>
      </div>
    </div>
  </section>`;

  const realProof = `
  <section class="section" id="chipping-proof">
    <div class="container">
      <div class="section-head">
        <h2>Посмотрите, как быстро щепорез перерабатывает ветки</h2>
        <p>Оператор непрерывно подает ветки в приемный бункер, на выходе получается чистая однородная мульча.</p>
      </div>
      <div class="video-grid" style="grid-template-columns: minmax(0, 560px); justify-content: center;">
        ${videoCard(clearingVideos[0])}
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-chipping">
    <div class="container">
      <div class="section-head">
        <h2>Цена работы щепореза и от чего зависит стоимость</h2>
        <p class="section-subhead">Показываем реальную стартовую цену. Предварительную оценку объёма работ и стоимости делаем по фото веток.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Измельчение веток щепорезом</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 2 500 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Работа опытного оператора</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">Включена</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Сокращение объёма отходов</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">значительное</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Вывоз щепы (по желанию)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">по согласованию</strong>
          </div>
        </div>
        <div class="pricing-summary-explanation">
          <div>
            <strong>От чего зависит стоимость работы щепореза?</strong>
            <ul class="pricing-factors-list">
              <li>Объём и высота сложенной кучи веток;</li>
              <li>Диаметр стволов и сучьев;</li>
              <li>Порода древесины (свежая или высохшая плотная древесина);</li>
              <li>Расстояние от кучи веток до места стоянки щепореза;</li>
              <li>Необходимость перемещения щепы по участку или погрузки в контейнер.</li>
            </ul>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#quiz-chipping" data-goal="click_calculate">Рассчитать стоимость измельчения веток</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const whatWithChips = `
  <section class="section section-muted" id="chipping-dest">
    <div class="container">
      <div class="section-head">
        <h2>Что происходит со щепой: 3 сценария</h2>
        <p>Вы сами выбираете, как поступить с полученной щепой после переработки.</p>
      </div>
      <div class="scenarios-grid">
        <article class="scenario-card">
          <div class="scenario-number">01</div>
          <p class="scenario-condition">Экологичная польза для сада</p>
          <h3>Оставить на участке</h3>
          <p>Древесная щепа — натуральная мульча. Ей посыпают клумбы, приствольные круги деревьев, междурядья и дорожки. Она сохраняет влагу и подавляет сорняки.</p>
        </article>

        <article class="scenario-card">
          <div class="scenario-number">02</div>
          <p class="scenario-condition">Компактное хранение</p>
          <h3>Складировать в аккуратную кучу</h3>
          <p>Гора раскидистых веток превращается в компактную кучу щепы, освобождая полезное пространство и проезд на участке.</p>
        </article>

        <article class="scenario-card">
          <div class="scenario-number">03</div>
          <p class="scenario-condition">Экономия на утилизации</p>
          <h3>Подготовить к вывозу</h3>
          <p>Плотная измельчённая щепа занимает значительно меньше места, упрощая погрузку и существенно удешевляя вывоз с территории.</p>
        </article>
      </div>
    </div>
  </section>`;

  const repeatCta = `
  <section class="section section-repeat-cta" id="cta-chipping">
    <div class="container text-center">
      <h2>Нужно быстро переработать ветки на участке?</h2>
      <p class="repeat-cta-sub">Пришлите 1–2 фотографии веток — оценим объём работ и стоимость до выезда.</p>
      <div class="repeat-cta-actions">
        <a class="btn btn-accent btn-large" href="#quiz-chipping" data-goal="click_calculate">Рассчитать стоимость измельчения веток</a>
        <a class="btn btn-secondary btn-large" href="${phoneHref()}" data-goal="click_phone">📞 Позвонить</a>
      </div>
    </div>
  </section>`;

  const body = `
    ${hero}
    ${fastLead}
    ${branchesReadyBlock}
    ${quiz}
    ${whatWeDo}
    ${realProof}
    ${pricingSection}
    ${whatWithChips}
    ${faqSection(chippingDirectFaq)}
    ${repeatCta}
    <section class="section section-muted section-related-bottom">
      <div class="container">
        <div class="section-head">
          <h2>Также выполняем на объектах</h2>
        </div>
        <div class="service-grid compact">${related.map(serviceCard).join('')}</div>
      </div>
    </section>
  `;

  return renderPage({
    title: service.h1,
    description: `${service.short} Предварительная оценка стоимости по фото. Щепорез с опытным оператором, выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    leadHref: '#quiz-chipping',
    waText: waDirectTexts.branch_chipping,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(chippingDirectFaq)
    ]
  });
}

export function legalPage(page) {
  const path = route(page.slug);
  const renderParagraphs = (content) => {
    if (Array.isArray(content)) {
      return content.map((item) => `<p>${esc(item)}</p>`).join('');
    }
    return String(content)
      .split('\n\n')
      .map((item) => `<p>${esc(item.trim())}</p>`)
      .join('');
  };
  const body = `${simpleHero(page.h1, 'Официальная юридическая информация сервиса «Зеленый Срез».')}<section class="section"><div class="container text-page">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])}${page.sections.map(([heading, text]) => `<section><h2>${esc(heading)}</h2>${renderParagraphs(text)}</section>`).join('')}</div></section>`;
  return renderPage({ title: page.title, description: `${page.title}: условия обработки данных и обращений.`, path, body, leadHref: '/#lead-form', jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])] });
}

const universalLeadOptions = {
  submitText: 'Рассчитать стоимость'
};

export function pricesPage() {
  const body = `${simpleHero('Стоимость спила, обрезки и расчистки участков', 'Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.')}${priceTableSection()}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', universalLeadOptions)}`;
  return renderPage({ title: 'Цены на спил и обрезку деревьев', description: 'От чего зависит стоимость спила, обрезки, удаления пней, расчистки участка и вывоза веток.', path: '/prices/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Цены', url: '/prices/' }])] });
}

export function worksPage() {
  const body = `${simpleHero('Фото до и стало', 'Подобранные фотопары показывают типовые задачи: аварийное дерево, расчистка территории и удаление пня.')}${worksPreview()}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', universalLeadOptions)}`;
  return renderPage({ title: 'Фото до и стало по работам с деревьями', description: 'Фото до и стало по типовым задачам: аварийное дерево, расчистка участка, удаление пня.', path: '/works/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'До / стало', url: '/works/' }])] });
}

export function faqPage() {
  const body = `${simpleHero('Частые вопросы', 'Подробные ответы о расчете по фото, разрешениях, уборке, вывозе, пнях, сезонности и работе с организациями.')}${faqSection(faq)}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', universalLeadOptions)}`;
  return renderPage({ title: 'Вопросы о спиле и обрезке деревьев', description: 'Ответы на частые вопросы о спиле, обрезке, разрешениях, вывозе веток, удалении пней и расчете стоимости.', path: '/faq/', body, jsonLd: [faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Вопросы', url: '/faq/' }])] });
}

export function contactsPage() {
  const messengerBtns = [
    hasValue(site.messengerUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--whatsapp" href="${messengerHref()}" target="_blank" rel="noopener" data-goal="click_whatsapp"><svg class="contact-messenger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg>WhatsApp</a>` : '',
    hasValue(site.maxUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--max" href="${maxHref()}" target="_blank" rel="noopener" data-goal="click_max"><span class="contact-max-badge" aria-hidden="true">M</span>MAX</a>` : '',
    hasValue(site.telegramUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--telegram" href="${telegramHref()}" target="_blank" rel="noopener" data-goal="click_telegram"><svg class="contact-messenger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>Telegram</a>` : ''
  ].filter(Boolean).join('');
  const emailBlock = hasValue(site.email) ? `<div class="contact-email-block"><p class="contact-email-label">Электронная почта</p><a class="contact-email-link" href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>` : '';
  const body = `${simpleHero('Контакты компании', 'Позвоните, отправьте фотографии или оставьте заявку на предварительный расчет.')}<section class="section"><div class="container contact-grid"><div class="contact-card contact-card--contacts"><h2>Связаться</h2>${hasValue(site.phone) ? `<a class="big-contact" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : ''}<div class="contact-messenger-btns">${messengerBtns}</div>${emailBlock}</div><div class="contact-card"><h2>Что подготовить</h2><ul class="rich-list"><li>фото дерева целиком</li><li>фото ствола и кроны</li><li>фото препятствий рядом</li><li>адрес объекта и желаемый результат</li></ul></div></div></section>${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', universalLeadOptions)}`;
  return renderPage({ title: 'Контакты', description: 'Контакты компании по уходу за деревьями: телефон, email и форма заявки.', path: '/contacts/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Контакты', url: '/contacts/' }])] });
}

export function notFoundPage() {
  const body = `${simpleHero('Страница не найдена', 'Такой страницы нет или адрес изменился.')}<section class="section"><div class="container center"><a class="btn btn-accent" href="/">На главную</a><a class="btn btn-ghost" href="/#services">К услугам</a></div></section>`;
  return renderPage({ title: 'Страница не найдена', description: 'Страница не найдена.', path: '/404/', body, leadHref: '/#lead-form' });
}

function organizationSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: site.brand, url: site.baseUrl, telephone: hasValue(site.phone) ? site.phone : undefined, email: hasValue(site.email) ? site.email : undefined };
}

function professionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.brand,
    image: pathUrl('/assets/logo-zelenyi-srez.png'),
    url: site.baseUrl,
    telephone: hasValue(site.phone) ? site.phone : undefined,
    email: hasValue(site.email) ? site.email : undefined,
    priceRange: '1000 - 150000 RUB',
    description: 'Спил, удаление, обрезка деревьев, корчевание пней и расчистка участков в Москве и Московской области.',
    areaServed: [
      { '@type': 'City', name: 'Москва' },
      { '@type': 'AdministrativeArea', name: 'Московская область' }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Москва',
      addressRegion: 'Московская область',
      addressCountry: 'RU'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '22:00'
      }
    ]
  };
}

function serviceSchema(service, path) {
  return { '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.short, provider: { '@type': 'Organization', name: site.brand }, areaServed: serviceAreas, url: pathUrl(path) };
}

function faqSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) };
}

function breadcrumbSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: pathUrl(item.url) })) };
}
