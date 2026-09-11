import {
  clearingVideos,
  complexVideos,
  experienceStats,
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
  return `<noscript><div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" width="1" height="1" alt=""></div></noscript>`;
}

export function renderPage({ title, description, path = '/', body, jsonLd = [], image = images.hero, leadHref = '#lead-form' }) {
  const canonical = pathUrl(path);
  const fullTitle = title.includes(site.region) ? title : `${title} | ${site.region}`;
  const schemas = [organizationSchema(), ...jsonLd];
  const absoluteImage = image.startsWith('http') ? image : `${site.baseUrl}${image}`;
  const usesWikimedia = image.includes('commons.wikimedia.org') || body.includes('commons.wikimedia.org');
  const wikimediaPreconnect = usesWikimedia ? '\n  <link rel="preconnect" href="https://commons.wikimedia.org">' : '';
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
  <meta property="og:image" content="${esc(absoluteImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#143d2b">
  <link rel="icon" href="/favicon.ico?v=20260811-tree" sizes="32x32">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20260811-tree">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png?v=20260811-tree">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=20260811-tree">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">${wikimediaPreconnect}
  <link rel="stylesheet" href="/assets/styles.css?v=20260912-glass-header-1">
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
  <script src="/assets/app.js?v=20260824-metrika-goals-1" type="module"></script>
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
      <img src="/assets/logo-zelenyi-srez.png" alt="${esc(site.brand)}" class="brand-logo brand-logo-header" width="177" height="59">
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
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><a href="/privacy/">Политика конфиденциальности</a><a href="/personal-data-consent/">Согласие на обработку данных</a><a href="/requisites/">Реквизиты</a><a href="https://voltrena.ru" target="_blank" rel="noopener" style="color: #6ee7b7; text-decoration: underline; text-underline-offset: 3px;">Создание и продвижение: voltrena.ru</a></div>
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
  const title = 'Спил деревьев, расчистка участков, измельчение веток в Москве и МО';
  const description = 'Профессиональный спил деревьев любой сложности, комплексная расчистка участков и измельчение веток щепорезом с оператором. Москва и Московская область.';
  const homeLeadOptions = {
    formId: 'main-lead-form',
    submitText: 'Рассчитать стоимость'
  };

  const body = `
  ${heroSection()}
  ${commercialHubSection()}
  ${servicesSection()}
  ${worksPreview()}
  ${trustSection()}
  ${experienceProofSection()}
  ${videosSection()}
  ${processSection()}
  ${organizationsSection()}
  ${faqSection(faq)}
  ${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', homeLeadOptions)}`;
  return renderPage({ title, description, path: '/', body, jsonLd: [professionalServiceSchema(), faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }])] });
}

function heroSection() {
  return `<section class="hero">
  <img class="hero-bg" src="${esc(images.hero)}" alt="Спил деревьев, расчистка участков и щепорез в Москве и МО" fetchpriority="high">
  <div class="hero-shade"></div>
  <div class="container hero-content">
    <div class="hero-copy">
      <p class="hero-badge">Предварительная оценка по фото до выезда</p>
      <h1>Спил деревьев, расчистка участков<br>и измельчение веток в Москве и МО</h1>
      <p class="hero-lead">Работаем на сложных участках возле домов, заборов и проводов. Собственная спецтехника, сертифицированные арбористы, щепорез с оператором. Предварительный расчет по фото до выезда.</p>
      <div class="hero-actions">
        <a class="btn btn-hero-primary" href="#main-directions" data-goal="click_calculate">Выбрать задачу и рассчитать</a>
        <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
      </div>
      <div class="trust-bar" aria-label="Преимущества">
        <span>10 лет опыта</span>
        <span class="trust-bar-dot">·</span>
        <span>Более 1000 заказов</span>
        <span class="trust-bar-dot">·</span>
        <span>Москва и МО</span>
        <span class="trust-bar-dot">·</span>
        <span>Своя техника</span>
      </div>
      <p class="hero-cta-note">Для предварительной оценки отправьте фотографию дерева и контактный номер.</p>
    </div>
    <aside class="hero-prices" aria-label="3 ключевых направления">
      <p class="hero-prices-label">3 основных направления</p>
      <ul>
        <li><span>1. Спил дерева</span><strong>от 1 000 ₽</strong></li>
        <li><span>2. Расчистка участка</span><strong>от 5 000 ₽</strong></li>
        <li><span>3. Измельчение веток</span><strong>от 2 500 ₽</strong></li>
      </ul>
      <p class="hero-prices-note">Фиксируем способ работы и диапазон стоимости по фото до выезда на объект.</p>
      <a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Рассчитать стоимость</a>
    </aside>
  </div>
</section>`;
}

function commercialHubSection() {
  return `<section class="section commercial-hub" id="main-directions">
  <div class="container">
    <div class="section-head">
      <h2>Выберите задачу для точного расчета стоимости</h2>
      <p>Специализированные бригады и профессиональная техника под каждую задачу в Москве и Московской области.</p>
    </div>
    <div class="hub-grid">
      <article class="hub-card">
        <div class="hub-card-image">
          <img src="/assets/spil-main.jpg" alt="Спил и удаление деревьев" width="1024" height="768" loading="lazy">
          <span class="hub-card-price">от 1 000 ₽</span>
        </div>
        <div class="hub-card-body">
          <h3>Спилить дерево</h3>
          <p>Спил целиком или безопасный разбор по частям возле дома, забора, крыши и проводов. Аварийные и сухие деревья.</p>
          <ul class="hub-card-list">
            <li>Валка целиком при наличии места</li>
            <li>Спил по частям арбористами и вышкой</li>
            <li>Контролируемый спуск частей на веревках</li>
          </ul>
          <div class="hub-card-actions">
            <a class="btn btn-accent btn-full" href="/spil-derevev/">Перейти к расчету спила</a>
          </div>
        </div>
      </article>

      <article class="hub-card">
        <div class="hub-card-image">
          <img src="/assets/raschistka-real.png" alt="Расчистка участков" width="1086" height="1448" loading="lazy">
          <span class="hub-card-price">от 5 000 ₽</span>
        </div>
        <div class="hub-card-body">
          <h3>Расчистить участок</h3>
          <p>Подготовка территории под строительство, благоустройство или продажу: деревья, кустарник, поросль и бурьян.</p>
          <ul class="hub-card-list">
            <li>Спил деревьев и вырубка подлеска</li>
            <li>Измельчение веток щепорезом на месте</li>
            <li>Дробление или корчевание пней</li>
          </ul>
          <div class="hub-card-actions">
            <a class="btn btn-accent btn-full" href="/raschistka-uchastkov/">Перейти к расчистке</a>
          </div>
        </div>
      </article>

      <article class="hub-card">
        <div class="hub-card-image">
          <img src="/assets/izmelchenie-main.jpg" alt="Измельчение веток щепорезом" width="1024" height="768" loading="lazy">
          <span class="hub-card-price">от 2 500 ₽</span>
        </div>
        <div class="hub-card-body">
          <h3>Измельчить ветки</h3>
          <p>Мощный щепорез с опытным оператором. Быстрая переработка веток и древесных отходов в полезную щепу на участке.</p>
          <ul class="hub-card-list">
            <li>Работаем только со своим оператором</li>
            <li>Значительное сокращение объёма веток</li>
            <li>Щепу можно оставить или вывезти</li>
          </ul>
          <div class="hub-card-actions">
            <a class="btn btn-accent btn-full" href="/izmelchenie-vetok/">Перейти к щепорезу</a>
          </div>
        </div>
      </article>
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
  return `<section class="section section-muted" id="prices"><div class="container"><div class="section-head"><h2>Сколько стоит спил дерева</h2><p>Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.</p></div><div class="price-table-wrap"><table class="price-table"><thead><tr><th>Услуга</th><th>Цена</th><th>Что влияет</th></tr></thead><tbody>${priceRows.map(([service, price, factors]) => `<tr><td>${esc(service)}</td><td class="price-cell">${esc(price)}</td><td class="price-factors-cell">${esc(factors)}</td></tr>`).join('')}</tbody></table></div><div class="price-cta"><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Узнать стоимость моего дерева</a><p class="price-cta-note">Пришлите фотографии — предварительно рассчитаем стоимость до выезда.</p></div></div></section>`;
}

function priceFactorsSection() {
  const icons = ['📏', '🌲', '⚠️', '🏠', '🚗', '🍃'];
  return `<section class="section" id="factors"><div class="container"><div class="section-head"><h2>От чего зависит цена</h2></div><div class="factors-grid">${priceFactors.map((factor, i) => `<div class="factor-card"><span class="factor-icon" aria-hidden="true">${icons[i] || '•'}</span><span>${esc(factor)}</span></div>`).join('')}</div></div></section>`;
}

function servicesSection() {
  return `<section class="section section-muted" id="services"><div class="container"><div class="section-head"><h2>Работы с деревьями, пнями и участками</h2><p>Каждая услуга рассчитывается индивидуально. Вывоз и уборка включаются только если они согласованы.</p></div><div class="service-grid">${services.slice(0, 9).map(serviceCard).join('')}</div></div></section>`;
}

function serviceCard(service) {
  return `<article class="service-card"><img src="${esc(service.image)}" alt="${esc(service.title)}" width="1024" height="768" loading="lazy"><div><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p><p class="card-note">Цена зависит от: ${service.priceFactors.slice(0, 3).map(esc).join(', ')}.</p><div class="card-actions"><a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать стоимость</a><a class="link-more" href="/${service.slug}/">Подробнее об услуге</a></div></div></article>`;
}

function worksPreview() {
  return `<section class="section" id="works"><div class="container"><div class="section-head"><h2>Типовые задачи</h2></div><div class="work-grid">${workExamples.map((work) => `<article class="work-card"><div class="before-after" aria-label="Сравнение до и стало"><figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure><figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" width="1024" height="1536" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure></div><h3>${esc(work.area)}</h3><p>${esc(work.service)}</p><ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><a class="btn btn-small btn-ghost" href="#lead-form" data-open-form data-service="${esc(work.service)}" data-goal="click_calculate">Рассчитать стоимость</a></article>`).join('')}</div><a class="btn btn-ghost" href="/works/">Открыть раздел работ</a></div></section>`;
}

function trustSection() {
  return `<section class="section section-muted"><div class="container"><div class="section-head"><h2>Почему нам доверяют</h2></div><div class="trust-cards">${trustPoints.map((point) => `<div class="trust-card"><h3>${esc(point.title)}</h3><p>${esc(point.text)}</p></div>`).join('')}</div></div></section>`;
}

function experienceProofSection() {
  return `<section class="section experience-proof" id="videos" aria-labelledby="experience-title"><div class="container"><div class="section-head experience-head"><h2 id="experience-title">10 лет работаем с деревьями любой сложности</h2><p>От одиночного дерева возле дома до комплексной расчистки участков и территорий.</p></div><dl class="experience-stats">${experienceStats.map((stat) => `<div class="experience-stat${stat.placeholder ? ' experience-stat-placeholder' : ''}"><dt>${esc(stat.value)}</dt><dd>${esc(stat.label)}</dd></div>`).join('')}</dl><p class="proof-transition">10 лет опыта лучше всего подтверждают реальные работы</p><div class="video-proof-heading"><h2>Посмотрите, как мы работаем на сложных объектах</h2><p>Не рассказываем о профессионализме — показываем реальную работу: спил по частям, работу над крышами, возле домов, заборов и в ограниченном пространстве.</p></div></div></section>`;
}

function videosSection() {
  return `${videoGroup({
    id: 'clearing-videos',
    title: 'Расчистка и подготовка территории',
    text: 'Показываем удаление поросли, работу техники, измельчение веток и пней.',
    videos: clearingVideos,
    ctaTitle: 'Нужно расчистить участок?',
    ctaText: 'Пришлите фото или оставьте номер телефона — оценим объём работ и предварительную стоимость.',
    ctaLabel: 'Отправить фото участка',
    service: 'Расчистка участка'
  })}${videoGroup({
    id: 'complex-videos',
    title: 'Удаление деревьев в сложных условиях',
    text: 'Показываем, как выбираем способ работы рядом с домами, крышами, заборами и другими объектами.',
    videos: complexVideos,
    muted: true,
    safety: true,
    ctaTitle: 'Похожая ситуация на вашем участке?',
    ctaText: 'Оставьте номер телефона — оценим расположение дерева и предложим подходящий способ выполнения работ.',
    ctaLabel: 'Рассчитать стоимость',
    service: 'Сложное удаление дерева'
  })}`;
}

function videoGroup({ id, title, text, videos, muted = false, safety = false, ctaTitle, ctaText, ctaLabel, service }) {
  return `<section class="section video-section${muted ? ' section-muted' : ''}" id="${esc(id)}"><div class="container"><div class="section-head video-group-head"><h2>${esc(title)}</h2><p>${esc(text)}</p></div><div class="video-grid">${videos.map(videoCard).join('')}</div>${safety ? videoSafety() : ''}<div class="video-cta"><div><h3>${esc(ctaTitle)}</h3><p>${esc(ctaText)}</p></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="${esc(service)}" data-goal="click_calculate">${esc(ctaLabel)}</a></div></div></section>`;
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

  return `<section class="section lead-section" id="lead-form"><div class="container lead-grid"><div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="lead-actions">${hasValue(site.phone) ? `<a class="btn btn-light" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>` : ''}${hasValue(site.messengerUrl) ? `<a class="btn btn-ghost-dark" href="${messengerHref('#lead-form')}" data-goal="click_whatsapp">WhatsApp</a>` : ''}${hasValue(site.maxUrl) ? `<a class="btn btn-ghost-dark" href="${maxHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_max">MAX</a>` : ''}${hasValue(site.telegramUrl) ? `<a class="btn btn-ghost-dark" href="${telegramHref('#lead-form')}" target="_blank" rel="noopener" data-goal="click_telegram">Telegram</a>` : ''}</div><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>${leadForm(selectedService, formOptions)}</div></section>`;
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
      <p class="form-success-title"><strong>Заявка отправлена.</strong> Чтобы точнее оценить работу, можете прислать фотографии удобным способом:</p>
    </div>
    <div class="form-success-channels">
      ${hasValue(site.messengerUrl) ? `<a class="btn-channel btn-channel-whatsapp" href="${messengerHref()}" target="_blank" rel="noopener" data-goal="click_whatsapp"><svg viewBox="0 0 24 24" class="channel-icon" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.8 8.2c.2 3 2 5 5 6.2l1.4-1.4 2 .9c.2.1.3.4.2.7-.5 1.4-1.6 2-3.2 1.8-4.3-.7-7.3-3.7-8-8-.2-1.5.4-2.6 1.8-3.2.3-.1.6 0 .7.3l.9 2-1.3 1.3"/></svg><span>WhatsApp</span></a>` : ''}
      ${hasValue(site.telegramUrl) ? `<a class="btn-channel btn-channel-telegram" href="${telegramHref()}" target="_blank" rel="noopener" data-goal="click_telegram"><svg viewBox="0 0 24 24" class="channel-icon" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span>Telegram</span></a>` : ''}
      ${hasValue(site.maxUrl) ? `<a class="btn-channel btn-channel-max" href="${maxHref()}" target="_blank" rel="noopener" data-goal="click_max"><span class="channel-max-badge" aria-hidden="true">M</span><span>MAX</span></a>` : ''}
      ${hasValue(site.email) ? `<a class="btn-channel btn-channel-email" href="mailto:${esc(site.email)}" data-goal="click_email"><svg viewBox="0 0 24 24" class="channel-icon" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span>Почта</span></a>` : ''}
    </div>
  </div>
  <div class="form-error" data-form-error hidden>Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.</div>
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

export function servicePage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);
  const isChipping = service.slug === 'izmelchenie-vetok';
  const body = `${innerHero(service.h1, service.lead, service.image, service.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Услуги', url: '/#services' }, { name: service.title, url: path }])}<h2>Что входит в работу</h2><ul class="rich-list">${service.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><div class="honest-note">${esc(service.warning)}</div><h2>Что влияет на расчет</h2><div class="factor-cloud">${service.priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div>${isChipping ? `<h2>Что делать со щепой после измельчения?</h2><div class="branch-what-block"><div><strong>Оставить</strong><p>Щепа остается заказчику.</p></div><div><strong>Измельчить</strong><p>Переработаем ветки в щепу.</p></div><div><strong>Вывезти</strong><p>Подготовим и организуем вывоз.</p></div></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Измельчение веток в щепу" data-goal="click_branch_chipping">Рассчитать работу под ключ</a>` : ''}<h2>Как проходит заявка</h2><div class="mini-steps">${processSteps.map(([step, text], index) => `<article><span class="mini-step-arrow" aria-hidden="true">${index < processSteps.length - 1 ? '→' : '✓'}</span><h3>${esc(step)}</h3><p>${esc(text)}</p></article>`).join('')}</div></article><aside class="side-panel"><h2>Расчет стоимости</h2><p>${esc(service.directTitle)}. Передайте фотографии, адрес объекта и желаемый результат.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать</a><a class="btn btn-ghost btn-full" href="${phoneHref()}" data-goal="click_phone">Позвонить</a></aside></div></section><section class="section section-muted"><div class="container"><div class="section-head"><h2>Может понадобиться вместе с услугой</h2></div><div class="service-grid compact">${related.map(serviceCard).join('')}</div></div></section>${faqSection([...service.faq, ...faq.slice(0, 4)])}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', service.title, { submitText: 'Рассчитать стоимость' })}`;
  return renderPage({ title: service.h1, description: `${service.short} Предварительная оценка по фото.`, path, image: service.image, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]), serviceSchema(service, path), faqSchema(service.faq)] });
}

export function spilLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug && !['spil-derevev-po-chastyam', 'udalenie-avariynyh-derevev', 'udalenie-suhih-derevev'].includes(item.slug)).slice(0, 4);

  // Оставляем только кейсы по спилу деревьев (исключаем расчистку и пни из первого экрана)
  const fellingWorks = workExamples.filter((work) =>
    work.service.toLowerCase().includes('спил') || work.service.toLowerCase().includes('удаление аварийного')
  );

  const hero = `
  <section class="landing-hero landing-hero--spil">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Спил и удаление деревьев<br><span class="hero-subline">в Москве и Московской области</span></h1>
        <p class="hero-lead">Спиливаем деревья целиком и по частям, в том числе возле домов, заборов и коммуникаций. Предварительно рассчитаем стоимость по фотографии.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#hero-form" data-open-form data-service="Спилить дерево" data-goal="click_calculate">Рассчитать стоимость</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        <div class="trust-bar" aria-label="Преимущества">
          <span>Сложные и опасные деревья</span>
          <span class="trust-bar-dot">·</span>
          <span>Спил целиком и по частям</span>
          <span class="trust-bar-dot">·</span>
          <span>Измельчение веток</span>
          <span class="trust-bar-dot">·</span>
          <span>Вывоз по согласованию</span>
        </div>
      </div>
      <aside class="landing-hero-card" aria-label="Расчет стоимости спила">
        <div class="landing-hero-media">
          <img src="/assets/sekcionnyj-main.png" alt="Спил дерева возле дома арбористом" width="519" height="905" fetchpriority="high">
          <span class="landing-hero-tag">Сложный спил возле строений</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтвержденные стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Спил дерева целиком</span><strong>от 1 000 ₽</strong></li>
            <li><span>Спил по частям</span><strong>от 3 500 ₽</strong></li>
            <li><span>Аварийное дерево</span><strong>от 4 000 ₽</strong></li>
          </ul>
          <p class="hero-prices-note">Окончательная цена зависит от высоты, диаметра и условий вокруг дерева.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form">
          <h2 class="landing-form-title">Рассчитать стоимость спила</h2>
          <p class="landing-form-sub">Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.</p>
          ${leadForm('Спилить дерево', { formId: 'hero-lead-form-spil', submitText: 'Рассчитать стоимость', customClass: 'lead-form--hero' })}
        </div>
      </aside>
    </div>
  </section>`;

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do">
    <div class="container">
      <div class="section-head">
        <h2>Что конкретно мы сделаем</h2>
        <p class="section-subhead">Подберём подходящий способ спила под вашу ситуацию и условия на участке.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌲</span>
          <h3>Спилим дерево целиком</h3>
          <p>Валка под корень в заданном направлении при наличии свободного сектора для безопасного падения.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🪜</span>
          <h3>Разберём дерево по частям</h3>
          <p>Аккуратный спил кроны и ствола фрагментами сверху вниз альпинистами или с автовышки в стеснённых условиях.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚠️</span>
          <h3>Удалим сухое или опасное дерево</h3>
          <p>Срочная и безопасная ликвидация аварийных, наклонённых и надломленных деревьев без риска для построек.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Работаем возле домов, заборов и коммуникаций</h3>
          <p>Контролируемый спуск частей на верёвках с полной защитой кровли, забора, фасада и проводов.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчим ветки</h3>
          <p>Собственный щепорез переработает ветки в щепу прямо на месте, значительно уменьшив объём порубочных остатков.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Организуем вывоз по согласованию</h3>
          <p>Распилим ствол на дрова или организуем погрузку и вывоз порубочных остатков контейнером.</p>
        </div>
      </div>
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Спилить дерево" data-goal="click_calculate">Рассчитать стоимость</a>
      </div>
    </div>
  </section>`;

  const realWorks = `
  <section class="section section-works-lp" id="real-works">
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

      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Спилить дерево" data-goal="click_calculate">Рассчитать стоимость</a>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-spil">
    <div class="container">
      <div class="section-head">
        <h2>Цена спила и от чего она зависит</h2>
        <p class="section-subhead">Показываем реальные стартовые цены. Окончательный расчет зависит от параметров задачи.</p>
      </div>
      <div class="pricing-summary-card">
        <div class="pricing-summary-prices">
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил дерева целиком (с земли)</span>
            <span class="pricing-dots"></span>
            <strong class="pricing-val">от 1 000 ₽</strong>
          </div>
          <div class="pricing-summary-row">
            <span class="pricing-name">Спил дерева по частям (в стесненных условиях)</span>
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
            <strong>Почему цена рассчитывается индивидуально?</strong>
            <p class="pricing-calc-text">Стоимость зависит от размера дерева (высота, толщина ствола), выбранного способа спила и условий вокруг объекта — наличия построек, забора, крыши, линий электропередач и возможности подъезда техники.</p>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#hero-form" data-open-form data-service="Спилить дерево" data-goal="click_calculate">Рассчитать стоимость</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const trustBlock = `
  <section class="section section-muted section-trust-spil" id="trust-spil">
    <div class="container">
      <div class="section-head">
        <h2>10 лет спиливаем деревья любой сложности</h2>
        <p>Работаем с частными участками, СНТ и коттеджными поселками по всей Москве и Подмосковью.</p>
      </div>
      <div class="trust-grid-lp">
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🌲</span>
          <h3>10 лет практического опыта</h3>
          <p>Опытные специалисты с профессиональной альпинистской подготовкой и надежным снаряжением.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">📋</span>
          <h3>Более 1000 выполненных заказов</h3>
          <p>Успешно удалили более тысячи деревьев — от садовых яблонь до 30-метровых аварийных сосен и елей.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🏡</span>
          <h3>Работаем возле домов и построек</h3>
          <p>Специализируемся на сложных деревьях, нависающих над крышами, заборами, беседками и газонами.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🚜</span>
          <h3>Собственная спецтехника</h3>
          <p>Свои автовышки, бензопилы Stihl/Husqvarna, такелажные лебедки, сертифицированные тросы и дробилки веток.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">📸</span>
          <h3>Реальные фотографии работ</h3>
          <p>Фиксируем процесс и результат каждого заказа. Показываем живые примеры без стоковых картинок.</p>
        </div>
        <div class="trust-item-lp">
          <span class="trust-icon-lp">🤝</span>
          <h3>Согласование до начала работ</h3>
          <p>Стоимость, способ спила и состав работ согласуются до начала выполнения. Без скрытых наценок.</p>
        </div>
      </div>
    </div>
  </section>`;

  const scenarios = `
  <section class="section section-scenarios" id="scenarios">
    <div class="container">
      <div class="section-head">
        <h2>Как удалим дерево: 3 способа</h2>
        <p class="section-subhead">Способ работы определяем после оценки дерева и пространства вокруг.</p>
      </div>
      <div class="scenarios-grid">
        <article class="scenario-card">
          <div class="scenario-number">01</div>
          <p class="scenario-condition">Есть свободное место</p>
          <h3>Валка целиком</h3>
          <p>Спил дерева под корень с земли с заданным направлением падения. Используем валочные клинья и направляющие оттяжки. Самый быстрый способ при наличии безопасного сектора для падения.</p>
          <div class="scenario-meta"><span>От 1 000 ₽</span> · При наличии места</div>
        </article>

        <article class="scenario-card">
          <div class="scenario-number">02</div>
          <p class="scenario-condition">Ограниченное пространство</p>
          <h3>Спил по частям</h3>
          <p>Арборист поднимается по стволу или задействуется автовышка. Крона и ствол последовательно разбираются фрагментами сверху вниз и аккуратно сбрасываются в отведенный периметр.</p>
          <div class="scenario-meta"><span>От 3 500 ₽</span> · Стесненные условия</div>
        </article>

        <article class="scenario-card scenario-card--featured">
          <div class="scenario-number">03</div>
          <p class="scenario-condition">Под деревом дом, забор, крыша или провода</p>
          <h3>Контролируемый спуск</h3>
          <p>Каждая ветвь и чурбак ствола перед спилом фиксируются канатами и аккуратно опускаются ассистентом на землю. Полная сохранность кровли, забора, фасада и прилегающих построек.</p>
          <div class="scenario-meta"><span>От 5 000 ₽</span> · Максимальная защита</div>
        </article>
      </div>
    </div>
  </section>`;

  const leadOptions = {
    formId: 'bottom-lead-form',
    submitText: 'Рассчитать стоимость'
  };

  const body = `
    ${hero}
    ${whatWeDo}
    ${realWorks}
    ${pricingSection}
    ${leadSection('Рассчитать стоимость спила', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Спилить дерево', leadOptions)}
    ${trustBlock}
    ${scenarios}
    ${faqSection(service.faq)}
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
    description: `${service.short} Предварительная оценка стоимости по фото. Выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(service.faq)
    ]
  });
}

export function raschistkaLandingPage(service) {
  const path = route(service.slug);
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);

  const hero = `
  <section class="landing-hero landing-hero--clearing">
    <div class="container landing-hero-inner">
      <div class="landing-hero-content">
        <h1>Расчистка участков в Москве и МО<br><span class="hero-subline">от деревьев, кустарника и поросли</span></h1>
        <p class="hero-lead">Уберём деревья, кустарник и поросль. Подготовим участок к дальнейшим работам, строительству или продаже. Измельчим ветки, вывоз — по согласованию.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#hero-form" data-open-form data-service="Расчистить участок" data-goal="click_calculate">Рассчитать стоимость</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        <div class="trust-bar" aria-label="Преимущества">
          <span>Деревья, кустарник и поросль</span>
          <span class="trust-bar-dot">·</span>
          <span>Заросшие участки</span>
          <span class="trust-bar-dot">·</span>
          <span>Измельчение веток</span>
          <span class="trust-bar-dot">·</span>
          <span>Вывоз по согласованию</span>
        </div>
      </div>
      <aside class="landing-hero-card" aria-label="Расчет стоимости расчистки">
        <div class="landing-hero-media">
          <img src="/assets/raschistka-real.png" alt="Расчистка заросшего участка техникой" width="1086" height="1448" fetchpriority="high">
          <span class="landing-hero-tag">Комплексная расчистка под ключ</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтвержденные стартовые цены</p>
          <ul class="hero-prices-list">
            <li><span>Расчистка участка</span><strong>от 5 000 ₽</strong></li>
            <li><span>Измельчение веток</span><strong>от 2 500 ₽</strong></li>
            <li><span>Удаление пней</span><strong>от 1 500 ₽</strong></li>
          </ul>
          <p class="hero-prices-note">Стоимость зависит от площади, густоты растительности и количества деревьев.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form">
          <h2 class="landing-form-title">Рассчитать стоимость расчистки</h2>
          <p class="landing-form-sub">Оставьте имя и телефон — уточним объём работ и рассчитаем стоимость.</p>
          ${leadForm('Расчистить участок', { formId: 'hero-lead-form-clearing', submitText: 'Рассчитать стоимость', customClass: 'lead-form--hero' })}
        </div>
      </aside>
    </div>
  </section>`;

  const whatWeDo = `
  <section class="section section-what-we-do" id="what-we-do-clearing">
    <div class="container">
      <div class="section-head">
        <h2>Что конкретно мы сделаем</h2>
        <p class="section-subhead">Приведём в порядок заросшую территорию под ключ или выполним отдельные операции.</p>
      </div>
      <div class="quick-scenarios-grid">
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌲</span>
          <h3>Уберём деревья</h3>
          <p>Спил сухих, аварийных, наклонённых и мешающих деревьев любого размера целиком или по частям.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌿</span>
          <h3>Уберём кустарник и поросль</h3>
          <p>Сплошная вырубка дикого кустарника, малинника, ивняка и плотного мелколесья под корень.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🌾</span>
          <h3>Расчистим заросший участок</h3>
          <p>Освободим территорию от многолетних завалов, бурьяна, высокой травы и застарелых зарослей.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🏡</span>
          <h3>Подготовим участок под дальнейшие работы</h3>
          <p>Чистая площадка под строительство дома, установку забора, благоустройство или продажу.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">⚙️</span>
          <h3>Измельчим ветки</h3>
          <p>Собственный щепорез переработает порубочные остатки прямо на участке, значительно уменьшив объём отходов.</p>
        </div>
        <div class="quick-scenario-card">
          <span class="quick-scenario-icon">🚛</span>
          <h3>Вывоз по согласованию</h3>
          <p>Организуем погрузку и вывоз растительных остатков и мусора контейнерами 8, 20 или 27 м³.</p>
        </div>
      </div>
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Расчистить участок" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
      </div>
    </div>
  </section>`;

  const realProof = `
  <section class="section section-muted section-clearing-proof" id="clearing-proof">
    <div class="container">
      <div class="section-head">
        <h2>Реальный результат расчистки: до и стало</h2>
        <p>Показываем, как участок из непроходимых зарослей превращается в чистую территорию под строительство.</p>
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
            <li>Спил мешающих и сухих деревьев</li>
            <li>Вырубка дикого кустарника и поросли</li>
            <li>Измельчение веток щепорезом на месте</li>
            <li>Дробление пней ниже уровня земли</li>
          </ul>
        </div>
      </div>

      <div class="video-proof-block" style="margin-top: 48px;">
        <h3 class="video-proof-title">Техника и процесс расчистки в работе</h3>
        <p class="video-proof-sub">Показываем работу измельчителя, трактора, удаление поросли и дробление пней:</p>
        <div class="video-grid">
          ${clearingVideos.map(videoCard).join('')}
        </div>
      </div>

      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Расчистить участок" data-goal="click_calculate">Рассчитать стоимость</a>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-clearing">
    <div class="container">
      <div class="section-head">
        <h2>Цена расчистки и от чего она зависит</h2>
        <p class="section-subhead">Показываем реальные стартовые цены. Точный расчет сметы формируем по вашим фотографиям.</p>
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
            <p class="pricing-calc-text">Стоимость зависит от площади, густоты растительности, количества деревьев и объёма работ. Также учитываются условия заезда техники и необходимость вывоза растительных остатков.</p>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#hero-form" data-open-form data-service="Расчистить участок" data-goal="click_calculate">Рассчитать стоимость расчистки</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const includesSection = `
  <section class="section section-clearing-includes" id="includes">
    <div class="container">
      <div class="section-head">
        <h2>Что входит в расчистку участка</h2>
        <p>Выполняем комплексную подготовку территории под ключ или отдельные операции по вашей задаче.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">🌲</span>
          <h3>Спил деревьев</h3>
          <p>Удаление аварийных, сухих и мешающих деревьев любого диаметра целиком или аккуратно по частям.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌿</span>
          <h3>Удаление кустарника</h3>
          <p>Сплошная вырубка дикого кустарника, малинника, ивняка и застарелых непроходимых зарослей.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌱</span>
          <h3>Вырубка поросли</h3>
          <p>Срез молодой поросли деревьев и плотного мелколесья под уровень земли.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌾</span>
          <h3>Покос высокой травы</h3>
          <p>Скашивание бурьяна, сухостоя, крапивы и борщевика мощными бензокосами.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🪵</span>
          <h3>Сбор и сортировка веток</h3>
          <p>Стягивание растительных остатков, подготовка к дроблению или складирование в кучи.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚙️</span>
          <h3>Измельчение в щепу</h3>
          <p>Собственный щепорез перерабатывает ветки в щепу прямо на участке, значительно снижая объём отходов.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚜</span>
          <h3>Дробление пней</h3>
          <p>Удаление пней фрезой на глубину до 20–30 см без рытья глубоких котлованов и разрушения грунта.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚛</span>
          <h3>Вывоз по согласованию</h3>
          <p>Организуем погрузку и вывоз порубочных остатков контейнерами 8, 20 или 27 м³.</p>
        </div>
      </div>
    </div>
  </section>`;

  const leadOptions = {
    formId: 'bottom-lead-form',
    submitText: 'Рассчитать стоимость'
  };

  const body = `
    ${hero}
    ${whatWeDo}
    ${realProof}
    ${pricingSection}
    ${leadSection('Рассчитать стоимость расчистки', 'Оставьте имя и телефон — уточним объём работ и рассчитаем стоимость.', 'Расчистить участок', leadOptions)}
    ${includesSection}
    ${faqSection(service.faq)}
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
    description: `${service.short} Предварительная оценка стоимости по фото. Собственная техника, выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(service.faq)
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
        <h1>Измельчение веток в щепу в Москве и МО<br><span class="hero-subline">Щепорез с опытным оператором на ваш участок</span></h1>
        <p class="hero-lead">Приедем со своим щепорезом и оператором и быстро переработаем ветки прямо на участке. Измельчение значительно уменьшает объём веток и упрощает их дальнейший вывоз или использование на участке.</p>
        <div class="landing-hero-actions">
          <a class="btn btn-hero-primary" href="#hero-form" data-open-form data-service="Измельчить ветки" data-goal="click_calculate">Рассчитать стоимость</a>
          <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
        </div>
        <div class="trust-bar" aria-label="Преимущества">
          <span>Собственный щепорез</span>
          <span class="trust-bar-dot">·</span>
          <span>Работа с оператором</span>
          <span class="trust-bar-dot">·</span>
          <span>Можно заказать отдельно</span>
          <span class="trust-bar-dot">·</span>
          <span>Щепу можно оставить или вывезти</span>
        </div>
      </div>
      <aside class="landing-hero-card" aria-label="Расчет стоимости измельчения">
        <div class="landing-hero-media">
          <img src="/assets/izmelchenie-main.jpg" alt="Измельчение веток дробилкой в щепу" width="1024" height="768" fetchpriority="high">
          <span class="landing-hero-tag">Щепорез высокой производительности</span>
        </div>
        <div class="landing-hero-prices">
          <p class="hero-prices-label">Подтвержденная стоимость</p>
          <ul class="hero-prices-list">
            <li><span>Измельчение веток</span><strong>от 2 500 ₽</strong></li>
            <li><span>Сокращение объема</span><strong>Значительное</strong></li>
            <li><span>Оператор в комплекте</span><strong>Включен</strong></li>
          </ul>
          <p class="hero-prices-note">Оценим необходимую смену работы щепореза по фотографии кучи веток.</p>
        </div>
        <div class="landing-hero-form-box" id="hero-form">
          <h2 class="landing-form-title">Рассчитать стоимость измельчения веток</h2>
          <p class="landing-form-sub">Оставьте имя и телефон — уточним объём веток и условия работы.</p>
          ${leadForm('Измельчить ветки', { formId: 'hero-lead-form-chipping', submitText: 'Рассчитать стоимость', customClass: 'lead-form--hero' })}
        </div>
      </aside>
    </div>
  </section>`;

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
          <p>Приезжаем с оборудованием прямо на объект. Нужен только свободный подъезд для автомобиля с прицепом.</p>
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
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Измельчить ветки" data-goal="click_calculate">Рассчитать стоимость</a>
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
      <div class="section-cta-repeat">
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Измельчить ветки" data-goal="click_calculate">Рассчитать стоимость</a>
      </div>
    </div>
  </section>`;

  const pricingSection = `
  <section class="section section-pricing-lp" id="pricing-chipping">
    <div class="container">
      <div class="section-head">
        <h2>Цена работы щепореза и от чего она зависит</h2>
        <p class="section-subhead">Показываем реальную стартовую цену. Точный расчет смены делаем по фото кучи веток.</p>
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
            <strong class="pricing-val">Значительное</strong>
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
            <p class="pricing-calc-text">Стоимость зависит от объёма веток и условий подъезда техники. Измельчение значительно уменьшает объём веток и упрощает их дальнейший вывоз или использование на участке.</p>
          </div>
          <div class="pricing-summary-cta">
            <a class="btn btn-accent btn-full" href="#hero-form" data-open-form data-service="Измельчить ветки" data-goal="click_calculate">Рассчитать стоимость по фото</a>
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
          <p>Плотная измельчённая щепа занимает значительно меньше места, упрощая погрузку и вывоз с территории при необходимости.</p>
        </article>
      </div>

      <div class="honest-banner">
        <div class="honest-banner-content">
          <h3>Можно ли заказать измельчение отдельно от спила?</h3>
          <p>Да! Если ветки уже спилены вами или другими рабочими и лежат на участке — мы приезжаем со щепорезом и оператором исключительно на задачу переработки.</p>
        </div>
        <a class="btn btn-accent" href="#hero-form" data-open-form data-service="Измельчить ветки" data-goal="click_calculate">Рассчитать выезд щепореза</a>
      </div>
    </div>
  </section>`;

  const leadOptions = {
    formId: 'bottom-lead-form',
    submitText: 'Рассчитать стоимость'
  };

  const body = `
    ${hero}
    ${whatWeDo}
    ${realProof}
    ${pricingSection}
    ${leadSection('Рассчитать стоимость измельчения веток', 'Оставьте имя и телефон — уточним объём веток и условия работы.', 'Измельчить ветки', leadOptions)}
    ${whatWithChips}
    ${faqSection(service.faq)}
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
    description: `${service.short} Предварительная оценка стоимости по фото. Выезд по Москве и Московской области.`,
    path,
    image: service.image,
    body,
    jsonLd: [
      breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]),
      serviceSchema(service, path),
      faqSchema(service.faq)
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
  const body = `${simpleHero('Стоимость спила, обрезки и расчистки участков', 'Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.')}${priceTableSection()}${priceFactorsSection()}${leadSection('Рассчитать стоимость работ', 'Оставьте имя и телефон — уточним задачу и рассчитаем стоимость.', 'Фото на оценку', universalLeadOptions)}`;
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
  return { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.brand, areaServed: ['Москва', 'Московская область'], telephone: hasValue(site.phone) ? site.phone : undefined, url: site.baseUrl, description: 'Спил, удаление, обрезка деревьев, корчевание пней и расчистка участков.' };
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
