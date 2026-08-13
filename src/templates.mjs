import {
  faq,
  imageCredits,
  images,
  nav,
  priceFactors,
  priceRows,
  processSteps,
  serviceAreas,
  services,
  site,
  trustPoints,
  workExamples,
  workVideos
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

function messengerHref(fallback = '#lead-form') {
  return hasValue(site.messengerUrl) ? site.messengerUrl : fallback;
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
  return `<noscript><div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt=""></div></noscript>`;
}

export function renderPage({ title, description, path = '/', body, jsonLd = [], image = images.hero, leadHref = '#lead-form' }) {
  const canonical = pathUrl(path);
  const fullTitle = title.includes(site.region) ? title : `${title} | ${site.region}`;
  const schemas = [organizationSchema(), ...jsonLd];
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#143d2b">
  <link rel="icon" href="/favicon.ico?v=20260811-tree" sizes="32x32">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20260811-tree">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png?v=20260811-tree">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=20260811-tree">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://commons.wikimedia.org">
  <link rel="stylesheet" href="/assets/styles.css?v=20260813-1">
  <script>window.TREE_SITE_CONFIG = ${JSON.stringify({ metrikaId: site.metrikaId, leadEndpoint: site.leadEndpoint, novofonScriptUrl: site.novofonScriptUrl, phoneHref: site.phoneHref, telegramUrl: site.telegramUrl, messengerUrl: site.messengerUrl, maxUrl: site.maxUrl, maxPhone: site.maxPhone })};</script>
  ${metrikaCounter()}
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body>
  ${metrikaNoScript()}
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  ${header(leadHref)}
  <main id="main">${body}</main>
  ${footer()}
  ${floatingContacts()}
  ${mobileBar(leadHref)}
  <script src="/assets/app.js?v=20260811-no-whatsapp" type="module"></script>
</body>
</html>`;
}

function header(leadHref) {
  const phoneEl = hasValue(site.phone)
    ? `<a class="phone-link" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>${hasValue(site.hours) ? `<span>${esc(site.hours)}</span>` : ''}`
    : '';
  return `<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.brand)}">
      <img src="/assets/logo-zelenyi-srez.png" alt="${esc(site.brand)}" class="brand-logo brand-logo-header" width="178" height="59">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
      <span></span><span></span><span></span><span class="sr-only">Открыть меню</span>
    </button>
    <nav class="main-nav" id="main-nav" data-nav>${nav.map((item) => `<a href="${item.href}">${esc(item.label)}</a>`).join('')}</nav>
    <div class="header-actions">
      ${phoneEl ? `<div class="header-contact">${phoneEl}</div>` : ''}
      <a class="btn btn-small btn-ghost" href="${leadHref}" data-open-form data-service="Расчет стоимости" data-goal="click_calculate">Рассчитать</a>
    </div>
  </div>
</header>`;
}

function footer() {
  const phoneEl = hasValue(site.phone) ? `<a class="phone-link" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : '';
  const emailEl = hasValue(site.email) ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : '';
  const messengerEl = hasValue(site.messengerUrl) ? `<a href="${messengerHref('/#lead-form')}" data-goal="click_whatsapp">WhatsApp</a>` : '';
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a class="brand footer-brand" href="/" aria-label="${esc(site.brand)}"><img src="/assets/logo-zelenyi-srez.png" alt="${esc(site.brand)}" class="brand-logo brand-logo-footer" width="210" height="70"></a>
      <p>Выполняем работы с деревьями на частных и коммерческих территориях. Стоимость и состав работ согласуются до начала выполнения.</p>
      <p class="muted">${esc(site.addressNote)}</p>
    </div>
    <div><h2>Услуги</h2>${services.slice(0, 7).map((service) => `<a href="/${service.slug}/">${esc(service.title)}</a>`).join('')}</div>
    <div><h2>Контакты</h2>${phoneEl}${emailEl}${messengerEl}<p class="call-note">В целях контроля качества разговор может быть записан.</p></div>
  </div>
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><a href="/privacy/">Политика конфиденциальности</a><a href="/personal-data-consent/">Согласие на обработку данных</a><a href="/requisites/">Реквизиты</a></div>
</footer>`;
}

function floatingContacts() {
  const buttons = [
    hasValue(site.maxUrl) ? `<a class="floating-contact-button floating-contact-max" href="${maxHref()}" target="_blank" rel="noopener" aria-label="Открыть MAX" data-goal="click_max"><span class="floating-contact-max-mark" aria-hidden="true">MAX</span><span class="floating-contact-label">MAX</span></a>` : '',
    hasValue(site.messengerUrl) ? `<a class="floating-contact-button floating-contact-whatsapp" href="${messengerHref()}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp" data-goal="click_whatsapp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg><span class="floating-contact-label">WhatsApp</span></a>` : '',
    hasValue(site.telegramUrl) ? `<a class="floating-contact-button floating-contact-telegram" href="${telegramHref()}" target="_blank" rel="noopener" aria-label="Написать в Telegram" data-goal="click_telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span class="floating-contact-label">Telegram</span></a>` : '',
    hasValue(site.email) ? `<a class="floating-contact-button floating-contact-email" href="mailto:${esc(site.email)}" aria-label="Написать на почту" data-goal="click_email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span class="floating-contact-label">Почта</span></a>` : ''
  ].filter(Boolean).join('');
  return buttons ? `<aside class="floating-contact-rail" aria-label="Быстрая связь">${buttons}</aside>` : '';
}

function mobileBar(leadHref) {
  const callBtn = `<a class="mobile-btn mobile-btn-call" href="${phoneHref()}" data-goal="click_phone"><span class="mobile-btn-icon">📞</span><span>Позвонить</span></a>`;
  const calcBtn = `<a class="mobile-btn mobile-btn-calc" href="${leadHref}" data-open-form data-service="Расчет стоимости" data-goal="click_calculate"><span class="mobile-btn-icon">📷</span><span>Рассчитать</span></a>`;
  const messengerBtn = hasValue(site.messengerUrl) ? `<a class="mobile-btn mobile-btn-msg" href="${messengerHref(leadHref)}" data-goal="click_whatsapp"><span class="mobile-btn-icon">✉</span><span>WhatsApp</span></a>` : '';
  return `<div class="mobile-action-bar" aria-label="Быстрые действия">${callBtn}${calcBtn}${messengerBtn}</div>`;
}

export function homePage() {
  const title = 'Спил и удаление деревьев в Московской области';
  const description = 'Спил, удаление и обрезка деревьев, аварийные деревья, пни, расчистка участков и вывоз веток. Предварительная оценка по фотографиям. Московская область.';
  const body = `
  ${heroSection()}
  ${quickLeadSection()}
  ${servicesSection()}
  ${worksPreview()}
  ${trustSection()}
  ${videosSection()}
  ${processSection()}
  ${organizationsSection()}
  ${faqSection(faq)}
  ${leadSection('Получите расчет по фотографиям', 'Пришлите 2–3 фотографии. Обычно по ним уже можно определить способ работы и ориентировочную стоимость.')}`;
  return renderPage({ title, description, path: '/', body, jsonLd: [professionalServiceSchema(), faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }])] });
}

function heroSection() {
  return `<section class="hero">
  <img class="hero-bg" src="${esc(images.hero)}" alt="Деревья в Московской области" fetchpriority="high">
  <div class="hero-shade"></div>
  <div class="container hero-content">
    <div class="hero-copy">
      <p class="hero-badge">Предварительная оценка по фото</p>
      <h1>Спил и удаление деревьев<br>в Москве и Московской области</h1>
      <p class="hero-lead">Спиливаем аварийные деревья, дробим ветки и пни, расчищаем участки. Работаем возле домов, заборов и коммуникаций. Оценим стоимость по фотографиям до выезда.</p>
      <div class="hero-actions">
        <a class="btn btn-hero-primary" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Рассчитать стоимость по фото</a>
        <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
      </div>
      <p class="hero-cta-note">Для предварительной оценки отправьте фотографию дерева и контактный номер.</p>
    </div>
    <aside class="hero-prices" aria-label="Ориентировочные цены">
      <p class="hero-prices-label">Стартовые цены</p>
      <ul>
        <li><span>Спил дерева</span><strong>от 1 000 ₽</strong></li>
        <li><span>По частям</span><strong>от 3 500 ₽</strong></li>
        <li><span>Аварийное дерево</span><strong>от 4 000 ₽</strong></li>
      </ul>
      <p class="hero-prices-note">Точная стоимость зависит от высоты, диаметра, доступа и объектов рядом.</p>
      <a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Узнать стоимость</a>
    </aside>
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
          <div class="quick-lead-field" data-form-fields>
            <input type="tel" name="phone" id="quick_phone" placeholder="+7 999 999-99-99" required autocomplete="tel" data-phone-input>
            <button class="btn btn-accent" type="submit" data-submit-btn>Получить расчёт</button>
          </div>
          <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a>.</p>
          <div class="form-success quick-lead-success" data-form-success hidden><strong>Спасибо! Заявка отправлена.</strong> Мы скоро вам позвоним.</div>
          <div class="form-error quick-lead-error" data-form-error hidden>Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.</div>
        </form>
        ${hasValue(site.messengerUrl) ? `<a class="btn btn-outline" href="${messengerHref('#lead-form')}" data-goal="click_whatsapp">Отправить фото в WhatsApp</a>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

function priceTableSection() {
  return `<section class="section section-muted" id="prices"><div class="container"><div class="section-head"><p class="eyebrow">Стоимость</p><h2>Сколько стоит спил дерева</h2><p>Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.</p></div><div class="price-table-wrap"><table class="price-table"><thead><tr><th>Услуга</th><th>Цена</th><th>Что влияет</th></tr></thead><tbody>${priceRows.map(([service, price, factors]) => `<tr><td>${esc(service)}</td><td class="price-cell">${esc(price)}</td><td class="price-factors-cell">${esc(factors)}</td></tr>`).join('')}</tbody></table></div><div class="price-cta"><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Узнать стоимость моего дерева</a><p class="price-cta-note">Пришлите фотографии — предварительно рассчитаем стоимость до выезда.</p></div></div></section>`;
}

function priceFactorsSection() {
  const icons = ['📏', '🌲', '⚠️', '🏠', '🚗', '🍃'];
  return `<section class="section" id="factors"><div class="container"><div class="section-head"><p class="eyebrow">Ценообразование</p><h2>От чего зависит цена</h2></div><div class="factors-grid">${priceFactors.map((factor, i) => `<div class="factor-card"><span class="factor-icon" aria-hidden="true">${icons[i] || '•'}</span><span>${esc(factor)}</span></div>`).join('')}</div></div></section>`;
}

function servicesSection() {
  return `<section class="section section-muted" id="services"><div class="container"><div class="section-head"><p class="eyebrow">Основные услуги</p><h2>Работы с деревьями, пнями и участками</h2><p>Каждая услуга рассчитывается индивидуально. Вывоз и уборка включаются только если они согласованы.</p></div><div class="service-grid">${services.slice(0, 9).map(serviceCard).join('')}</div></div></section>`;
}

function serviceCard(service) {
  return `<article class="service-card"><img src="${esc(service.image)}" alt="${esc(service.title)}" loading="lazy"><div><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p><p class="card-note">Цена зависит от: ${service.priceFactors.slice(0, 3).map(esc).join(', ')}.</p><div class="card-actions"><a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать стоимость</a><a class="link-more" href="/${service.slug}/">Подробнее об услуге</a></div></div></article>`;
}

function worksPreview() {
  return `<section class="section" id="works"><div class="container"><div class="section-head"><p class="eyebrow">До / стало</p><h2>Типовые задачи</h2></div><div class="work-grid">${workExamples.map((work) => `<article class="work-card"><div class="before-after" aria-label="Сравнение до и стало"><figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure><figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure></div><h3>${esc(work.area)}</h3><p>${esc(work.service)}</p><ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><a class="btn btn-small btn-ghost" href="#lead-form" data-open-form data-service="${esc(work.service)}" data-goal="click_calculate">Рассчитать похожую работу</a></article>`).join('')}</div><a class="btn btn-ghost" href="/works/">Открыть раздел работ</a></div></section>`;
}

function trustSection() {
  return `<section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Доверие</p><h2>Почему нам доверяют работу возле домов и построек</h2></div><div class="trust-cards">${trustPoints.map((point) => `<div class="trust-card"><h3>${esc(point.title)}</h3><p>${esc(point.text)}</p></div>`).join('')}</div></div></section>`;
}

function videosSection() {
  return `<section class="section video-section" id="videos"><div class="container"><div class="section-head"><p class="eyebrow">Процесс</p><h2>Как мы выполняем спил деревьев</h2><p>Реальные кадры с наших объектов. Без монтажа и прикрас — просто показываем, как работаем.</p></div><div class="shorts-grid">${workVideos.map((video) => {
    if (video.local) {
      return `<article class="short-card">
        <video src="${esc(video.url)}" controls preload="metadata" width="360" height="640" style="object-fit: cover; width: 100%; height: 100%; border-radius: 12px;"></video>
      </article>`;
    }
    return `<article class="short-card">
      <iframe src="https://www.youtube.com/embed/${esc(video.youtubeId)}?rel=0" width="360" height="640" style="border: none; border-radius: 12px; width: 100%; height: 100%;" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </article>`;
  }).join('')}</div></div></section>`;
}

function processSection() {
  return `<section class="section" id="process"><div class="container"><div class="section-head"><p class="eyebrow">Порядок работы</p><h2>Как мы работаем</h2></div><div class="timeline">${processSteps.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div><div class="process-cta"><p>Есть фото дерева? Узнайте стоимость сейчас.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Отправить фото</a></div></div></section>`;
}

function organizationsSection() {
  return `<section class="section section-dark" id="organizations"><div class="container org-grid"><div><p class="eyebrow">Для организаций</p><h2>Работаем с организациями</h2><p>Выполняем разовые и регулярные работы для территорий СНТ, коттеджных поселков, управляющих компаний, складов, производственных площадок и коммерческих объектов.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Расчет для организации" data-goal="organization_lead">Получить расчет для организации</a></div><ul><li>СНТ и коттеджные поселки</li><li>УК, ТСЖ и дворовые территории</li><li>Склады и производственные площадки</li><li>Базы отдыха и коммерческие объекты</li><li>Договор и смета по условиям компании</li><li>Безналичная оплата</li></ul></div></section>`;
}

function faqSection(items) {
  return `<section class="section section-muted" id="faq"><div class="container"><div class="section-head"><p class="eyebrow">Вопросы</p><h2>Частые вопросы</h2></div><div class="faq-list">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>`;
}

function leadSection(title, text, selectedService = 'Фото на оценку') {
  return `<section class="section lead-section" id="lead-form"><div class="container lead-grid"><div><p class="eyebrow">Заявка</p><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="lead-actions">${hasValue(site.phone) ? `<a class="btn btn-light" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>` : ''}${hasValue(site.messengerUrl) ? `<a class="btn btn-ghost-dark" href="${messengerHref('#lead-form')}" data-goal="click_whatsapp">WhatsApp</a>` : ''}${hasValue(site.maxUrl) ? `<a class="btn btn-ghost-dark" href="${maxHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_max">MAX</a>` : ''}${hasValue(site.telegramUrl) ? `<a class="btn btn-ghost-dark" href="${telegramHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_telegram">Telegram</a>` : ''}</div><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>${leadForm(selectedService)}</div></section>`;
}

function leadForm(selectedService) {
  return `<form class="lead-form" data-lead-form data-form-id="main-form" id="main-lead-form">
  <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>
  <div data-form-fields>
    <label class="lead-phone-label" for="main_phone">Номер телефона</label>
    <input id="main_phone" name="phone" type="tel" autocomplete="tel" required placeholder="+7 999 999-99-99" data-phone-input>
    <button class="btn btn-accent btn-full" type="submit" data-submit-btn>Получить расчёт</button>
  </div>
  <p class="form-consent">Нажимая кнопку, вы соглашаетесь на <a href="/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a>.</p>
  <div class="form-success" data-form-success hidden><strong>Спасибо! Заявка отправлена.</strong> Мы скоро вам позвоним.</div>
  <div class="form-error" data-form-error hidden>Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.</div>
</form>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Хлебные крошки">${items.map((item, index) => index === items.length - 1 ? `<span>${esc(item.name)}</span>` : `<a href="${item.url}">${esc(item.name)}</a>`).join('<span>/</span>')}</nav>`;
}

function innerHero(title, text, image, eyebrow, label) {
  return `<section class="inner-hero"><img src="${esc(image)}" alt="${esc(label)}" loading="eager"><div class="inner-hero-shade"></div><div class="container inner-hero-content"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>`;
}

function simpleHero(title, text) {
  return `<section class="simple-hero"><div class="container"><p class="eyebrow">${esc(site.brand)}</p><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>`;
}

export function servicePage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);
  const isChipping = service.slug === 'izmelchenie-vetok';
  const body = `${innerHero(service.h1, service.lead, service.image, 'Услуга', service.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Услуги', url: '/#services' }, { name: service.title, url: path }])}<h2>Что входит в работу</h2><ul class="rich-list">${service.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><div class="honest-note">${esc(service.warning)}</div><h2>Что влияет на расчет</h2><div class="factor-cloud">${service.priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div>${isChipping ? `<h2>Что делать со щепой после измельчения?</h2><div class="branch-what-block"><div><strong>Оставить</strong><p>Щепа остается заказчику.</p></div><div><strong>Измельчить</strong><p>Переработаем ветки в щепу.</p></div><div><strong>Вывезти</strong><p>Подготовим и организуем вывоз.</p></div></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Измельчение веток в щепу" data-goal="click_branch_chipping">Рассчитать работу под ключ</a>` : ''}<h2>Как проходит заявка</h2><div class="mini-steps">${processSteps.map(([step, text], index) => `<article><span>${index + 1}</span><h3>${esc(step)}</h3><p>${esc(text)}</p></article>`).join('')}</div></article><aside class="side-panel"><h2>Расчет стоимости</h2><p>${esc(service.directTitle)}. Передайте фотографии, адрес объекта и желаемый результат.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать</a><a class="btn btn-ghost btn-full" href="${phoneHref()}" data-goal="click_phone">Позвонить</a></aside></div></section><section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Связанные услуги</p><h2>Может понадобиться вместе с услугой</h2></div><div class="service-grid compact">${related.map(serviceCard).join('')}</div></div></section>${faqSection([...service.faq, ...faq.slice(0, 4)])}${leadSection('Получите предварительный расчет по фотографиям', 'Опишите задачу, укажите адрес объекта и приложите фотографии дерева, ствола, кроны и территории вокруг.', service.title)}`;
  return renderPage({ title: service.h1, description: `${service.short} Предварительная оценка по фото.`, path, image: service.image, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]), serviceSchema(service, path), faqSchema(service.faq)] });
}

export function legalPage(page) {
  const path = route(page.slug);
  const body = `${simpleHero(page.h1, 'Юридическая информация сайта и порядок обработки обращений.')}<section class="section"><div class="container text-page">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])}${page.sections.map(([heading, text]) => `<section><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join('')}</div></section>`;
  return renderPage({ title: page.title, description: `${page.title}: условия обработки данных и обращений.`, path, body, leadHref: '/#lead-form', jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])] });
}

export function pricesPage() {
  const body = `${simpleHero('Стоимость спила, обрезки и расчистки участков', 'Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.')}${priceTableSection()}${priceFactorsSection()}${leadSection('Получите расчет под ваш объект', 'Прикрепите фотографии, укажите адрес объекта и опишите, что требуется сделать.')}`;
  return renderPage({ title: 'Цены на спил и обрезку деревьев', description: 'От чего зависит стоимость спила, обрезки, удаления пней, расчистки участка и вывоза веток.', path: '/prices/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Цены', url: '/prices/' }])] });
}

export function worksPage() {
  const body = `${simpleHero('Фото до и стало', 'Подобранные фотопары показывают типовые задачи: аварийное дерево, расчистка территории и удаление пня.')}${worksPreview()}${leadSection('Хотите оценить похожую задачу?', 'Отправьте фотографии объекта, и менеджер компании уточнит детали для предварительного расчета.')}`;
  return renderPage({ title: 'Фото до и стало по работам с деревьями', description: 'Фото до и стало по типовым задачам: аварийное дерево, расчистка участка, удаление пня.', path: '/works/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'До / стало', url: '/works/' }])] });
}

export function faqPage() {
  const body = `${simpleHero('Частые вопросы', 'Подробные ответы о расчете по фото, разрешениях, уборке, вывозе, пнях, сезонности и работе с организациями.')}${faqSection(faq)}${leadSection('Остался вопрос по вашему участку?', 'Опишите ситуацию и приложите фотографии, чтобы менеджер компании понял задачу быстрее.')}`;
  return renderPage({ title: 'Вопросы о спиле и обрезке деревьев', description: 'Ответы на частые вопросы о спиле, обрезке, разрешениях, вывозе веток, удалении пней и расчете стоимости.', path: '/faq/', body, jsonLd: [faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Вопросы', url: '/faq/' }])] });
}

export function contactsPage() {
  const messengerBtns = [
    hasValue(site.messengerUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--whatsapp" href="${messengerHref()}" target="_blank" rel="noopener" data-goal="click_whatsapp"><svg class="contact-messenger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg>WhatsApp</a>` : '',
    hasValue(site.maxUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--max" href="${maxHref()}" target="_blank" rel="noopener" data-goal="click_max"><span class="contact-max-badge" aria-hidden="true">M</span>MAX</a>` : '',
    hasValue(site.telegramUrl) ? `<a class="contact-messenger-btn contact-messenger-btn--telegram" href="${telegramHref()}" target="_blank" rel="noopener" data-goal="click_telegram"><svg class="contact-messenger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>Telegram</a>` : ''
  ].filter(Boolean).join('');
  const emailBlock = hasValue(site.email) ? `<div class="contact-email-block"><p class="contact-email-label">Электронная почта</p><a class="contact-email-link" href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>` : '';
  const body = `${simpleHero('Контакты компании', 'Позвоните, отправьте фотографии или оставьте заявку на предварительный расчет.')}<section class="section"><div class="container contact-grid"><div class="contact-card contact-card--contacts"><h2>Связаться</h2>${hasValue(site.phone) ? `<a class="big-contact" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : ''}<div class="contact-messenger-btns">${messengerBtns}</div>${emailBlock}</div><div class="contact-card"><h2>Что подготовить</h2><ul class="rich-list"><li>фото дерева целиком</li><li>фото ствола и кроны</li><li>фото препятствий рядом</li><li>адрес объекта и желаемый результат</li></ul></div></div></section>${leadSection('Отправьте заявку', 'Чем подробнее фотографии и описание, тем точнее предварительный расчет.')}`;
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
  return { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.brand, areaServed: ['Московская область'], telephone: hasValue(site.phone) ? site.phone : undefined, url: site.baseUrl, description: 'Спил, удаление, обрезка деревьев, корчевание пней и расчистка участков.' };
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
