import {
  faq,
  imageCredits,
  images,
  nav,
  priceFactors,
  priceRows,
  problemCards,
  processSteps,
  regions,
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
  return site.telegramUrl && !site.telegramUrl.startsWith('[') ? site.telegramUrl : fallback;
}

function serviceFormHref(href, service) {
  const [cleanHref] = href.split('#');
  return `${cleanHref}?service=${encodeURIComponent(service)}#lead-form`;
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
  <link rel="manifest" href="/tree/manifest.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://commons.wikimedia.org">
  <link rel="stylesheet" href="/tree/assets/styles.css">
  <script>window.TREE_SITE_CONFIG = ${JSON.stringify({ metrikaId: site.metrikaId, leadEndpoint: site.leadEndpoint, novofonScriptUrl: site.novofonScriptUrl, phoneHref: site.phoneHref, telegramUrl: site.telegramUrl, messengerUrl: site.messengerUrl })};</script>
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  ${header(leadHref)}
  <main id="main">${body}</main>
  ${footer()}
  ${mobileBar(leadHref)}
  <script src="/tree/assets/app.js" defer></script>
</body>
</html>`;
}

function header(leadHref) {
  const phoneEl = hasValue(site.phone)
    ? `<a class="phone-link" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>${hasValue(site.hours) ? `<span>${esc(site.hours)}</span>` : ''}`
    : '';
  return `<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="/tree/" aria-label="${esc(site.brand)}">
      <span class="brand-mark" aria-hidden="true">Д</span>
      <span><strong>${esc(site.brand)}</strong><small>${esc(site.region)}</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
      <span></span><span></span><span></span><span class="sr-only">Открыть меню</span>
    </button>
    <nav class="main-nav" id="main-nav" data-nav>${nav.map((item) => `<a href="${item.href}">${esc(item.label)}</a>`).join('')}</nav>
    <div class="header-actions">
      ${phoneEl ? `<div class="header-contact">${phoneEl}</div>` : ''}
      <a class="btn btn-small btn-ghost" href="${leadHref}" data-open-form data-service="Расчет стоимости" data-goal="click_calculate">Рассчитать</a>
      ${hasValue(site.telegramUrl) ? `<a class="btn btn-small btn-accent" href="${messengerHref(leadHref)}" data-goal="click_messenger">Написать</a>` : ''}
    </div>
  </div>
</header>`;
}

function footer() {
  const phoneEl = hasValue(site.phone) ? `<a class="phone-link" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : '';
  const emailEl = hasValue(site.email) ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : '';
  const messengerEl = hasValue(site.telegramUrl) ? `<a href="${messengerHref('/#lead-form')}" data-goal="click_messenger">Написать нам</a>` : '';
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a class="brand footer-brand" href="/tree/"><span class="brand-mark" aria-hidden="true">Д</span><span><strong>${esc(site.brand)}</strong><small>Спил, обрезка, пни и расчистка</small></span></a>
      <p>Выполняем работы с деревьями на частных и коммерческих территориях. Стоимость и состав работ согласуются до начала выполнения.</p>
      <p class="muted">${esc(site.addressNote)}</p>
    </div>
    <div><h2>Услуги</h2>${services.slice(0, 7).map((service) => `<a href="/tree/${service.slug}/">${esc(service.title)}</a>`).join('')}</div>
    <div><h2>Районы</h2>${regions.slice(0, 10).map((region) => `<a href="/tree/${region.slug}/">${esc(region.title)}</a>`).join('')}</div>
    <div><h2>Контакты</h2>${phoneEl}${emailEl}${messengerEl}<p class="call-note">В целях контроля качества разговор может быть записан.</p></div>
  </div>
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><a href="/tree/privacy/">Политика конфиденциальности</a><a href="/tree/personal-data-consent/">Согласие на обработку данных</a><a href="/tree/requisites/">Реквизиты</a></div>
</footer>`;
}

function mobileBar(leadHref) {
  const callBtn = `<a class="mobile-btn mobile-btn-call" href="${phoneHref()}" data-goal="click_phone"><span class="mobile-btn-icon">📞</span><span>Позвонить</span></a>`;
  const calcBtn = `<a class="mobile-btn mobile-btn-calc" href="${leadHref}" data-open-form data-service="Расчет стоимости" data-goal="click_calculate"><span class="mobile-btn-icon">📷</span><span>Рассчитать</span></a>`;
  const messengerBtn = hasValue(site.telegramUrl) ? `<a class="mobile-btn mobile-btn-msg" href="${messengerHref(leadHref)}" data-goal="click_messenger"><span class="mobile-btn-icon">✉</span><span>Написать</span></a>` : '';
  return `<div class="mobile-action-bar" aria-label="Быстрые действия">${callBtn}${calcBtn}${messengerBtn}</div>`;
}

export function homePage() {
  const title = 'Спил и удаление деревьев в Москве и Московской области';
  const description = 'Спил, удаление и обрезка деревьев, аварийные деревья, пни, расчистка участков и вывоз веток. Предварительная оценка по фотографиям. Москва и Московская область.';
  const body = `
  ${heroSection()}
  ${quickLeadSection()}
  ${problemsSection()}
  ${priceTableSection()}
  ${priceFactorsSection()}
  ${worksPreview()}
  ${trustSection()}
  ${processSection()}
  ${branchChippingUpsell()}
  ${organizationsSection()}
  ${areasSection()}
  ${faqSection(faq)}
  ${leadSection('Получите расчет по фотографиям', 'Пришлите 2–3 фотографии. Обычно по ним уже можно определить способ работы и ориентировочную стоимость.')}`;
  return renderPage({ title, description, path: '/', body, jsonLd: [professionalServiceSchema(), faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }])] });
}

function heroSection() {
  return `<section class="hero">
  <img class="hero-bg" src="${esc(images.hero)}" alt="Деревья в Москве" fetchpriority="high">
  <div class="hero-shade"></div>
  <div class="container hero-content">
    <div class="hero-copy">
      <p class="hero-badge">Предварительная оценка по фото</p>
      <h1>Спил и удаление деревьев<br>в Москве и Московской области</h1>
      <p class="hero-lead">Спиливаем обычные, большие и аварийные деревья. Работаем возле домов, заборов и коммуникаций. Оценим стоимость по фотографиям до выезда.</p>
      <div class="hero-actions">
        <a class="btn btn-hero-primary" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Рассчитать стоимость по фото</a>
        <a class="btn btn-hero-secondary" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>
      </div>
      <ul class="hero-benefits">
        <li>✓ Москва и Московская область</li>
        <li>✓ Работа в сложных условиях</li>
        <li>✓ Оценка по фото</li>
        <li>✓ Уборка и вывоз по договоренности</li>
      </ul>
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
        <form class="quick-lead-form" data-quick-lead-form>
          <div class="quick-lead-field">
            <input type="tel" name="quick_phone" id="quick_phone" placeholder="Ваш телефон" required autocomplete="tel">
            <button class="btn btn-accent" type="submit" data-goal="lead_phone">Получить расчет</button>
          </div>
          <p class="quick-lead-hint">Телефон — обязательно. Остальное — по желанию.</p>
          <div class="form-success quick-lead-success" data-quick-success hidden>
            <strong>Заявка принята.</strong> Менеджер свяжется с вами.
          </div>
        </form>
        ${hasValue(site.telegramUrl) ? `<a class="btn btn-outline" href="${messengerHref('#lead-form')}" data-goal="click_messenger">Отправить фото</a>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

function problemsSection() {
  return `<section class="section" id="problems"><div class="container"><div class="section-head"><p class="eyebrow">Выберите задачу</p><h2>Что необходимо сделать?</h2></div><div class="problem-grid">${problemCards.map((card) => `<a class="problem-card" href="${serviceFormHref(card.href, card.service)}" data-open-form data-service="${esc(card.service)}" data-goal="click_calculate"><div class="problem-card-top"><span class="problem-card-title">${esc(card.title)}</span><span class="problem-card-price">${esc(card.fromPrice)}</span></div><p>${esc(card.text)}</p><span class="problem-card-btn">Рассчитать стоимость</span></a>`).join('')}</div></div></section>`;
}

function priceTableSection() {
  return `<section class="section section-muted" id="prices"><div class="container"><div class="section-head"><p class="eyebrow">Стоимость</p><h2>Сколько стоит спил дерева</h2><p>Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.</p></div><div class="price-table-wrap"><table class="price-table"><thead><tr><th>Услуга</th><th>Цена</th><th>Что влияет</th></tr></thead><tbody>${priceRows.map(([service, price, factors]) => `<tr><td>${esc(service)}</td><td class="price-cell">${esc(price)}</td><td class="price-factors-cell">${esc(factors)}</td></tr>`).join('')}</tbody></table></div><div class="price-cta"><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Узнать стоимость моего дерева</a><p class="price-cta-note">Пришлите фотографии — предварительно рассчитаем стоимость до выезда.</p></div></div></section>`;
}

function priceFactorsSection() {
  const icons = ['📏', '🌲', '⚠️', '🏠', '🚗', '🍃'];
  return `<section class="section" id="factors"><div class="container"><div class="section-head"><p class="eyebrow">Ценообразование</p><h2>От чего зависит цена</h2></div><div class="factors-grid">${priceFactors.map((factor, i) => `<div class="factor-card"><span class="factor-icon" aria-hidden="true">${icons[i] || '•'}</span><span>${esc(factor)}</span></div>`).join('')}</div></div></section>`;
}

function servicesSection() {
  return `<section class="section section-muted" id="services"><div class="container"><div class="section-head"><p class="eyebrow">Основные услуги</p><h2>Работы с деревьями, пнями и участками</h2><p>Каждая услуга рассчитывается индивидуально. Вывоз и уборка включаются только если они согласованы.</p></div><div class="service-grid">${services.slice(0, 8).map(serviceCard).join('')}</div></div></section>`;
}

function serviceCard(service) {
  return `<article class="service-card"><img src="${esc(service.image)}" alt="${esc(service.title)}" loading="lazy"><div><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p><p class="card-note">Цена зависит от: ${service.priceFactors.slice(0, 3).map(esc).join(', ')}.</p><div class="card-actions"><a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать стоимость</a><a class="link-more" href="/tree/${service.slug}/">Подробнее об услуге</a></div></div></article>`;
}

function worksPreview() {
  return `<section class="section" id="works"><div class="container"><div class="section-head"><p class="eyebrow">До / стало</p><h2>Типовые задачи</h2></div><div class="work-grid">${workExamples.map((work) => `<article class="work-card"><div class="before-after" aria-label="Сравнение до и стало"><figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure><figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure></div><h3>${esc(work.area)}</h3><p>${esc(work.service)}</p><ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><a class="btn btn-small btn-ghost" href="#lead-form" data-open-form data-service="${esc(work.service)}" data-goal="click_calculate">Рассчитать похожую работу</a></article>`).join('')}</div><a class="btn btn-ghost" href="/tree/works/">Открыть раздел работ</a></div></section>`;
}

function trustSection() {
  return `<section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Доверие</p><h2>Почему нам доверяют работу возле домов и построек</h2></div><div class="trust-cards">${trustPoints.map((point) => `<div class="trust-card"><h3>${esc(point.title)}</h3><p>${esc(point.text)}</p></div>`).join('')}</div></div></section>`;
}

function processSection() {
  return `<section class="section" id="process"><div class="container"><div class="section-head"><p class="eyebrow">Порядок работы</p><h2>Как мы работаем</h2></div><div class="timeline">${processSteps.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div><div class="process-cta"><p>Есть фото дерева? Узнайте стоимость сейчас.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку" data-goal="click_calculate">Отправить фото</a></div></div></section>`;
}

function branchChippingUpsell() {
  return `<section class="section branch-upsell" id="izmelchenie"><div class="container"><div class="branch-upsell-inner"><div><p class="eyebrow">Дополнительная услуга</p><h2>Измельчение веток в щепу</h2><p>Измельчим ветки после спила, обрезки или расчистки участка. Дробилка (щепорез) существенно уменьшает объем древесных отходов.</p><p class="from-price-large">от 2 500 ₽</p><div class="branch-upsell-actions"><a class="btn btn-accent" href="/tree/izmelchenie-vetok/" data-goal="click_branch_chipping">Рассчитать стоимость измельчения</a><a class="link-more" href="/tree/izmelchenie-vetok/">Подробнее об услуге</a></div></div><div class="branch-upsell-options"><p><strong>Что делать с ветками после работы?</strong></p><ul><li>🌿 Оставить на участке</li><li>♻️ Измельчить в щепу</li><li>🚛 Подготовить к вывозу</li><li>✅ Измельчить и вывезти остатки</li></ul><p class="muted">Вариант согласовывается при оформлении заказа.</p></div></div></div></section>`;
}

function organizationsSection() {
  return `<section class="section section-dark" id="organizations"><div class="container org-grid"><div><p class="eyebrow">Для организаций</p><h2>Работаем с организациями</h2><p>Выполняем разовые и регулярные работы для территорий СНТ, коттеджных поселков, управляющих компаний, складов, производственных площадок и коммерческих объектов.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Расчет для организации" data-goal="organization_lead">Получить расчет для организации</a></div><ul><li>СНТ и коттеджные поселки</li><li>УК, ТСЖ и дворовые территории</li><li>Склады и производственные площадки</li><li>Базы отдыха и коммерческие объекты</li><li>Договор и смета по условиям компании</li><li>Безналичная оплата</li></ul></div></section>`;
}

function areasSection() {
  return `<section class="section" id="areas"><div class="container"><div class="section-head"><p class="eyebrow">Районы выезда</p><h2>Москва и Московская область</h2><p>Возможность и стоимость выезда уточняются по адресу, доступу и составу работ.</p></div><div class="area-grid">${regions.map((region) => `<span><a href="/tree/${region.slug}/">${esc(region.title)}</a></span>`).join('')}</div><div class="areas-cta"><a class="btn btn-ghost" href="/tree/moskovskaya-oblast/">Все районы выезда</a></div></div></section>`;
}

function faqSection(items) {
  return `<section class="section section-muted" id="faq"><div class="container"><div class="section-head"><p class="eyebrow">Вопросы</p><h2>Частые вопросы</h2></div><div class="faq-list">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>`;
}

function leadSection(title, text, selectedService = 'Фото на оценку') {
  return `<section class="section lead-section" id="lead-form"><div class="container lead-grid"><div><p class="eyebrow">Заявка</p><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="lead-actions">${hasValue(site.phone) ? `<a class="btn btn-light" href="${phoneHref()}" data-goal="click_phone">Позвонить</a>` : ''}${hasValue(site.telegramUrl) ? `<a class="btn btn-ghost-dark" href="${messengerHref('#lead-form')}" data-goal="click_messenger">Написать</a>` : ''}</div><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>${leadForm(selectedService)}</div></section>`;
}

function leadForm(selectedService) {
  const serviceOptions = [
    'Спилить дерево', 'Аварийное дерево', 'Обрезать дерево', 'Удалить пень',
    'Измельчить ветки', 'Расчистить участок', 'Вывоз веток', 'Другое'
  ];
  const afterBranchOptions = [
    'Оставить на участке', 'Измельчить в щепу', 'Подготовить к вывозу', 'Измельчить и вывезти', 'Пока не знаю'
  ];
  return `<form class="lead-form" data-lead-form id="main-lead-form">
  <div class="form-progress"><span data-progress></span></div>
  <fieldset data-step>
    <legend>1. Что нужно сделать?</legend>
    <div class="service-options">${serviceOptions.map((opt) => `<label class="service-option-label"><input type="radio" name="service" value="${esc(opt)}" ${opt === 'Спилить дерево' ? 'checked' : ''}><span>${esc(opt)}</span></label>`).join('')}</div>
    <div class="form-grid">
      <label>Телефон <span class="required">*</span><input name="phone" type="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__"></label>
    </div>
    <div class="branch-after-block" data-branch-after hidden>
      <p>Что сделать с ветками после работы?</p>
      <div class="branch-after-options">${afterBranchOptions.map((opt) => `<label class="service-option-label"><input type="radio" name="branch_after" value="${esc(opt)}"><span>${esc(opt)}</span></label>`).join('')}</div>
    </div>
    <label class="consent"><input type="checkbox" name="consent" required> Нажимая кнопку, я даю согласие на <a href="/tree/personal-data-consent/" target="_blank" rel="noopener">обработку персональных данных</a></label>
    <label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label>
    <div class="form-buttons">
      <button class="btn btn-accent btn-full" type="button" data-save-contact data-goal="form_contact_saved">Получить расчет</button>
    </div>
  </fieldset>
  <fieldset data-step hidden>
    <legend>2. Дополните заявку (необязательно)</legend>
    <div class="form-grid">
      <label>Населенный пункт<input name="city" placeholder="например, Истра"></label>
      <label>Имя<input name="name" autocomplete="name"></label>
    </div>
    <label class="file-drop">Добавьте фотографии дерева<input name="photos" type="file" accept="image/*" multiple data-photo-input><span class="form-hint" data-file-status>Файлы не выбраны</span></label>
    <label>Комментарий<textarea name="comment" rows="3" placeholder="Опишите задачу: высота, наклон, что рядом, что нужно сделать с остатками"></textarea></label>
    <input type="hidden" name="entry_page">
    <div class="form-buttons">
      <button class="btn btn-ghost" type="button" data-prev>Назад</button>
      <button class="btn btn-accent" type="submit">Отправить заявку</button>
    </div>
  </fieldset>
  <div class="form-success" data-form-success hidden><h3>Спасибо! Заявка принята.</h3><p>Менеджер компании свяжется с вами для уточнения информации.</p></div>
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
  const body = `${innerHero(service.h1, service.lead, service.image, 'Услуга', service.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Услуги', url: '/#services' }, { name: service.title, url: path }])}<h2>Что входит в работу</h2><ul class="rich-list">${service.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><div class="honest-note">${esc(service.warning)}</div><h2>Что влияет на расчет</h2><div class="factor-cloud">${service.priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div>${isChipping ? `<h2>Что делать со щепой после измельчения?</h2><div class="branch-what-block"><div><strong>Оставить</strong><p>Щепа остается заказчику.</p></div><div><strong>Измельчить</strong><p>Переработаем ветки в щепу.</p></div><div><strong>Вывезти</strong><p>Подготовим и организуем вывоз.</p></div></div><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Измельчение веток в щепу" data-goal="click_branch_chipping">Рассчитать работу под ключ</a>` : ''}<h2>Как проходит заявка</h2><div class="mini-steps">${processSteps.map(([step, text], index) => `<article><span>${index + 1}</span><h3>${esc(step)}</h3><p>${esc(text)}</p></article>`).join('')}</div></article><aside class="side-panel"><h2>Расчет стоимости</h2><p>${esc(service.directTitle)}. Передайте фотографии, населенный пункт и желаемый результат.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="${esc(service.title)}" data-goal="click_calculate">Рассчитать</a><a class="btn btn-ghost btn-full" href="${phoneHref()}" data-goal="click_phone">Позвонить</a></aside></div></section><section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Связанные услуги</p><h2>Может понадобиться вместе с услугой</h2></div><div class="service-grid compact">${related.map(serviceCard).join('')}</div></div></section>${faqSection([...service.faq, ...faq.slice(0, 4)])}${leadSection('Получите предварительный расчет по фотографиям', 'Опишите задачу, укажите населенный пункт и приложите фотографии дерева, ствола, кроны и территории вокруг.', service.title)}`;
  return renderPage({ title: service.h1, description: `${service.short} Предварительная оценка по фото.`, path, image: service.image, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]), serviceSchema(service, path), faqSchema(service.faq)] });
}

export function regionPage(region) {
  const path = route(region.slug);
  const body = `${innerHero(region.h1, region.intro, images.cottage, 'Район выезда', region.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Районы выезда', url: '/tree/moskovskaya-oblast/' }, { name: region.title, url: path }])}<h2>Особенности выезда</h2><ul class="rich-list">${region.details.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><h2>Какие работы можно заказать</h2><div class="service-grid compact">${services.slice(0, 6).map(serviceCard).join('')}</div></article><aside class="side-panel"><h2>Уточнить выезд</h2><p>Возможность и стоимость выезда уточняются по адресу объекта, доступу и составу работ.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="Выезд: ${esc(region.title)}" data-goal="click_calculate">Отправить фото</a></aside></div></section>${leadSection('Отправьте фотографии участка', 'Укажите населенный пункт, адрес или ориентир, количество деревьев и что нужно сделать.', `Выезд: ${region.title}`)}`;
  return renderPage({ title: region.h1, description: `${region.h1}. Спил, обрезка, пни и расчистка участков.`, path, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: region.title, url: path }])] });
}

export function legalPage(page) {
  const path = route(page.slug);
  const body = `${simpleHero(page.h1, 'Юридическая информация сайта и порядок обработки обращений.')}<section class="section"><div class="container text-page">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])}${page.sections.map(([heading, text]) => `<section><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join('')}</div></section>`;
  return renderPage({ title: page.title, description: `${page.title}: условия обработки данных и обращений.`, path, body, leadHref: '/tree/#lead-form', jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])] });
}

export function pricesPage() {
  const body = `${simpleHero('Стоимость спила, обрезки и расчистки участков', 'Показываем стартовые цены, чтобы вы понимали порядок стоимости. Точную цену определим после фото или осмотра.')}${priceTableSection()}${leadSection('Получите расчет под ваш объект', 'Прикрепите фотографии, укажите населенный пункт и опишите, что требуется сделать.')}`;
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
  const body = `${simpleHero('Контакты компании', 'Позвоните, отправьте фотографии или оставьте заявку на предварительный расчет.')}<section class="section"><div class="container contact-grid"><div class="contact-card"><h2>Связаться</h2>${hasValue(site.phone) ? `<a class="big-contact" href="${phoneHref()}" data-goal="click_phone">${esc(site.phone)}</a>` : ''}${hasValue(site.email) ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}<p>${esc(site.addressNote)}</p></div><div class="contact-card"><h2>Что подготовить</h2><ul class="rich-list"><li>фото дерева целиком</li><li>фото ствола и кроны</li><li>фото препятствий рядом</li><li>населенный пункт и желаемый результат</li></ul></div></div></section>${leadSection('Отправьте заявку', 'Чем подробнее фотографии и описание, тем точнее предварительный расчет.')}`;
  return renderPage({ title: 'Контакты', description: 'Контакты компании по уходу за деревьями: телефон, email и форма заявки.', path: '/contacts/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Контакты', url: '/contacts/' }])] });
}

export function notFoundPage() {
  const body = `${simpleHero('Страница не найдена', 'Такой страницы нет или адрес изменился.')}<section class="section"><div class="container center"><a class="btn btn-accent" href="/tree/">На главную</a><a class="btn btn-ghost" href="/tree/#services">К услугам</a></div></section>`;
  return renderPage({ title: 'Страница не найдена', description: 'Страница не найдена.', path: '/404/', body, leadHref: '/tree/#lead-form' });
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