import {
  editablePriceRows,
  faq,
  imageCredits,
  images,
  nav,
  priceFactors,
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

function phoneHref() {
  return site.phoneHref || `tel:${site.phone.replace(/[^\d+]/g, '')}`;
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
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="preconnect" href="https://commons.wikimedia.org">
  <link rel="stylesheet" href="/assets/styles.css">
  <script>window.TREE_SITE_CONFIG = ${JSON.stringify({ metrikaId: site.metrikaId, leadEndpoint: site.leadEndpoint, novofonScriptUrl: site.novofonScriptUrl, phoneHref: site.phoneHref, telegramUrl: site.telegramUrl, messengerUrl: site.messengerUrl })};</script>
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  ${header(leadHref)}
  <main id="main">${body}</main>
  ${footer()}
  ${mobileBar(leadHref)}
  <script src="/assets/app.js" defer></script>
</body>
</html>`;
}

function header(leadHref) {
  return `<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.brand)}">
      <span class="brand-mark" aria-hidden="true">Д</span>
      <span><strong>${esc(site.brand)}</strong><small>${esc(site.region)}</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
      <span></span><span></span><span></span><span class="sr-only">Открыть меню</span>
    </button>
    <nav class="main-nav" id="main-nav" data-nav>${nav.map((item) => `<a href="${item.href}">${esc(item.label)}</a>`).join('')}</nav>
    <div class="header-actions">
      <div class="header-contact"><a class="phone-link" href="${phoneHref()}" data-goal="phone_click">${esc(site.phone)}</a><span>${esc(site.hours)}</span></div>
      <a class="btn btn-small btn-ghost" href="${leadHref}" data-open-form data-service="Расчет стоимости">Рассчитать</a>
      <a class="btn btn-small btn-accent" href="${messengerHref(leadHref)}" data-goal="messenger_click">Написать</a>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a class="brand footer-brand" href="/"><span class="brand-mark" aria-hidden="true">Д</span><span><strong>${esc(site.brand)}</strong><small>Спил, обрезка, пни и расчистка</small></span></a>
      <p>Выполняем работы с деревьями на частных и коммерческих территориях. Стоимость и состав работ согласуются до начала выполнения.</p>
      <p class="muted">${esc(site.addressNote)}</p>
    </div>
    <div><h2>Услуги</h2>${services.slice(0, 7).map((service) => `<a href="/${service.slug}/">${esc(service.title)}</a>`).join('')}</div>
    <div><h2>Районы</h2>${regions.slice(0, 10).map((region) => `<a href="/${region.slug}/">${esc(region.title)}</a>`).join('')}</div>
    <div><h2>Контакты</h2><a class="phone-link" href="${phoneHref()}" data-goal="phone_click">${esc(site.phone)}</a><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${messengerHref('/#lead-form')}" data-goal="messenger_click">Написать нам</a><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>
  </div>
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><a href="/privacy/">Политика конфиденциальности</a><a href="/personal-data-consent/">Согласие на обработку данных</a><a href="/requisites/">Реквизиты</a></div>
</footer>`;
}

function mobileBar(leadHref) {
  return `<div class="mobile-action-bar" aria-label="Быстрые действия"><a href="${phoneHref()}" data-goal="phone_click">Позвонить</a><a href="${leadHref}" data-open-form data-service="Расчет стоимости">Рассчитать</a><a href="${messengerHref(leadHref)}" data-goal="messenger_click">Написать</a></div>`;
}

export function homePage() {
  const title = 'Спил и обрезка деревьев в Москве и Московской области';
  const description = 'Спил, удаление и обрезка деревьев, аварийные деревья, пни, расчистка участков и вывоз веток. Предварительная оценка по фотографиям.';
  const body = `
  <section class="hero">
    <img class="hero-bg" src="${esc(images.hero)}" alt="Березовая роща в Москве" fetchpriority="high">
    <div class="hero-shade"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Компания по спилу и уходу за деревьями</p>
        <h1>Спил и обрезка деревьев в Москве и Московской области</h1>
        <p class="hero-lead">Оценим задачу по фотографиям. Согласуем объем, стоимость и время выезда до начала работ.</p>
        <p>Удаляем аварийные и сухие деревья, обрезаем опасные ветви, корчуем пни, расчищаем участки и вывозим растительные отходы по согласованию.</p>
        <div class="hero-actions"><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку">Отправить фотографии</a><a class="btn btn-light" href="${phoneHref()}" data-goal="phone_click">Позвонить</a><a class="btn btn-ghost-dark" href="#lead-form" data-open-form data-service="Расчет стоимости">Получить расчет</a></div>
        <ul class="hero-points"><li>предварительная оценка по фото</li><li>выезд по Москве и области</li><li>частные и коммерческие объекты</li><li>уборка и вывоз по согласованию</li></ul>
      </div>
      <aside class="hero-panel" aria-label="Быстрый расчет"><h2>Что отправить для оценки</h2><ol><li>Дерево целиком</li><li>Ствол и крону</li><li>Дом, забор, дорогу или провода рядом</li><li>Населенный пункт и желаемый результат</li></ol><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="Фото на оценку">Рассчитать по фото</a></aside>
    </div>
  </section>
  <section class="section" id="problems"><div class="container"><div class="section-head"><p class="eyebrow">Выберите задачу</p><h2>Что необходимо сделать?</h2></div><div class="problem-grid">${problemCards.map((card) => `<a class="problem-card" href="${serviceFormHref(card.href, card.service)}" data-open-form data-service="${esc(card.service)}"><span>${esc(card.title)}</span><p>${esc(card.text)}</p></a>`).join('')}</div></div></section>
  ${servicesSection()}
  ${estimateSection()}
  ${processSection()}
  ${trustSection()}
  ${worksPreview()}
  ${priceSection(false)}
  ${organizationsSection()}
  ${areasSection()}
  ${reviewsSection()}
  ${faqSection(faq)}
  ${leadSection('Отправьте фотографии и получите предварительный расчет', 'Сфотографируйте дерево целиком, ствол, крону и территорию вокруг. Укажите населенный пункт и желаемый результат.')}
  ${imageCreditSection()}`;
  return renderPage({ title, description, path: '/', body, jsonLd: [professionalServiceSchema(), faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }])] });
}

function servicesSection() {
  return `<section class="section section-muted" id="services"><div class="container"><div class="section-head"><p class="eyebrow">Основные услуги</p><h2>Работы с деревьями, пнями и участками</h2><p>Каждая услуга рассчитывается индивидуально. Вывоз и уборка включаются только если они согласованы.</p></div><div class="service-grid">${services.slice(0, 8).map(serviceCard).join('')}</div></div></section>`;
}

function serviceCard(service) {
  return `<article class="service-card"><img src="${esc(service.image)}" alt="${esc(service.title)}" loading="lazy"><div><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p><p class="card-note">Факторы цены: ${service.priceFactors.slice(0, 3).map(esc).join(', ')}.</p><div class="card-actions"><a class="link-more" href="/${service.slug}/">Подробнее</a><a class="btn btn-small btn-accent" href="#lead-form" data-open-form data-service="${esc(service.title)}">Рассчитать</a></div></div></article>`;
}

function estimateSection() {
  return `<section class="section"><div class="container split-panel"><div><p class="eyebrow">Оценка по фото</p><h2>Узнайте предварительную стоимость по фотографиям</h2><p>Сфотографируйте дерево целиком, ствол, крону и окружающую территорию. Если рядом находятся дом, забор, дорога или коммуникации, добавьте их на фотографии.</p><p class="honest-note">Предварительную стоимость можно определить по фотографиям. Окончательная цена подтверждается после уточнения всех условий или осмотра объекта.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Фото на оценку">Отправить фотографии на оценку</a></div><div class="photo-checklist" aria-label="Какие фото нужны"><span>1. Общий вид</span><span>2. Ствол</span><span>3. Крона</span><span>4. Объекты рядом</span><span>5. Проход и подъезд</span><span>6. Пень или отходы</span></div></div></section>`;
}

function processSection() {
  return `<section class="section section-muted" id="process"><div class="container"><div class="section-head"><p class="eyebrow">Порядок работы</p><h2>Как мы работаем</h2></div><div class="timeline">${processSteps.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div></div></section>`;
}

function trustSection() {
  return `<section class="section"><div class="container trust-grid"><div><p class="eyebrow">Доверие</p><h2>Понятный порядок работы без неожиданных доплат</h2><p>Мы не публикуем неподтвержденные обещания, фиктивные награды, вымышленные отзывы или искусственно низкие цены. Расчет строится на реальных условиях объекта.</p></div><div class="check-grid">${trustPoints.map((point) => `<span>${esc(point)}</span>`).join('')}</div></div></section>`;
}

function worksPreview() {
  return `<section class="section section-muted" id="works"><div class="container"><div class="section-head"><p class="eyebrow">До / стало</p><h2>Фото до и стало по типовым задачам</h2><p>Подобраны уникальные открытые снимки под аварийные деревья, расчистку участка и удаление пней. Перед публикацией реальных кейсов компании эти фото можно заменить на собственные объекты.</p></div><div class="work-grid">${workExamples.map((work) => `<article class="work-card"><div class="before-after" aria-label="Сравнение до и стало"><figure><img src="${esc(work.beforeImage)}" alt="${esc(work.beforeAlt)}" loading="lazy"><figcaption>${esc(work.beforeLabel)}</figcaption></figure><figure><img src="${esc(work.afterImage)}" alt="${esc(work.afterAlt)}" loading="lazy"><figcaption>${esc(work.afterLabel)}</figcaption></figure></div><h3>${esc(work.area)}</h3><p>${esc(work.service)}</p><ul>${work.facts.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></article>`).join('')}</div><p class="media-note">Фотографии не повторяются в блоке основных услуг и в карточках до/стало. Источники указаны внизу сайта.</p><a class="btn btn-ghost" href="/works/">Открыть раздел работ</a></div></section>`;
}
function priceSection(withHeading = true) {
  const heading = withHeading ? '<div class="section-head"><p class="eyebrow">Стоимость</p><h2>От чего зависит стоимость</h2></div>' : '<div class="section-head"><p class="eyebrow">Стоимость</p><h2>От чего зависит стоимость</h2><p>Стоимость рассчитывается индивидуально. Отправьте фотографии, адрес и краткое описание задачи.</p></div>';
  return `<section class="section" id="prices"><div class="container">${heading}<div class="factor-cloud">${priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div><div class="table-wrap"><table><caption>Редактируемая таблица цен после утверждения настоящего прайса</caption><thead><tr><th>Услуга</th><th>Цена</th><th>Что влияет</th></tr></thead><tbody>${editablePriceRows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></section>`;
}

function organizationsSection() {
  return `<section class="section section-dark" id="organizations"><div class="container org-grid"><div><p class="eyebrow">Для организаций</p><h2>Обслуживание СНТ, управляющих компаний и коммерческих территорий</h2><p>Разовые выезды, регулярное обслуживание, расчистка территории, сезонная обрезка, удаление аварийных деревьев, обслуживание нескольких объектов.</p><a class="btn btn-accent" href="#lead-form" data-open-form data-service="Расчет для организации">Получить расчет для организации</a></div><ul><li>СНТ и коттеджные поселки</li><li>УК, ТСЖ и дворовые территории</li><li>склады и производственные площадки</li><li>базы отдыха и коммерческие объекты</li></ul></div></section>`;
}

function areasSection() {
  return `<section class="section" id="areas"><div class="container"><div class="section-head"><p class="eyebrow">Районы выезда</p><h2>Москва и Московская область</h2><p>Возможность и стоимость выезда уточняются по адресу, доступу и составу работ.</p></div><div class="area-grid">${regions.map((region) => `<span><a href="/${region.slug}/">${esc(region.title)}</a></span>`).join('')}</div></div></section>`;
}

function reviewsSection() {
  return `<section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Отзывы</p><h2>Блок готов для настоящих отзывов</h2></div><div class="empty-reviews"><p>Публикуйте здесь только реальные отзывы с разрешения клиентов. Вымышленные оценки и имена не используются.</p></div></div></section>`;
}

function faqSection(items) {
  return `<section class="section" id="faq"><div class="container"><div class="section-head"><p class="eyebrow">Вопросы</p><h2>Частые вопросы</h2></div><div class="faq-list">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>`;
}

function leadSection(title, text, selectedService = 'Фото на оценку') {
  return `<section class="section lead-section" id="lead-form"><div class="container lead-grid"><div><p class="eyebrow">Заявка</p><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="lead-actions"><a class="btn btn-light" href="${phoneHref()}" data-goal="phone_click">Позвонить</a><a class="btn btn-ghost-dark" href="${messengerHref('#lead-form')}" data-goal="messenger_click">Написать</a></div><p class="call-note">В целях контроля качества разговор может быть записан.</p></div>${leadForm(selectedService)}</div></section>`;
}

function leadForm(selectedService) {
  return `<form class="lead-form" data-lead-form>
  <div class="form-progress"><span data-progress></span></div>
  <fieldset data-step><legend>1. Услуга</legend><label>Что нужно сделать<select name="service" required>${services.map((service) => `<option ${service.title === selectedService ? 'selected' : ''}>${esc(service.title)}</option>`).join('')}<option>Фото на оценку</option><option>Расчет для организации</option></select></label><div class="form-buttons"><button class="btn btn-accent" type="button" data-next>Далее</button></div></fieldset>
  <fieldset data-step hidden><legend>2. Адрес</legend><div class="form-grid"><label>Населенный пункт<input name="city" required placeholder="например, Истра"></label><label>Адрес или ориентир<input name="address" placeholder="улица, СНТ или поселок"></label><label>Район<select name="region">${serviceAreas.map((area) => `<option>${esc(area)}</option>`).join('')}</select></label></div><div class="form-buttons"><button class="btn btn-ghost" type="button" data-prev>Назад</button><button class="btn btn-accent" type="button" data-next>Далее</button></div></fieldset>
  <fieldset data-step hidden><legend>3. Фотографии</legend><label class="file-drop">Загрузите фото дерева, ствола, кроны и объектов рядом<input name="photos" type="file" accept="image/*" multiple data-photo-input><span class="form-hint" data-file-status>Файлы не выбраны</span></label><label>Комментарий<textarea name="comment" rows="4" placeholder="Опишите высоту, наклон, препятствия и желаемый результат"></textarea></label><div class="form-buttons"><button class="btn btn-ghost" type="button" data-prev>Назад</button><button class="btn btn-accent" type="button" data-next>Далее</button></div></fieldset>
  <fieldset data-step hidden><legend>4. Контакты</legend><div class="form-grid"><label>Имя<input name="name" autocomplete="name" required></label><label>Телефон<input name="phone" autocomplete="tel" required></label><label>Удобный способ связи<select name="contact_method"><option>звонок</option><option>Telegram</option><option>другой мессенджер</option></select></label><input type="hidden" name="entry_page"></div><label class="consent"><input type="checkbox" name="consent" required> Нажимая кнопку, я даю согласие на обработку персональных данных. <a href="/personal-data-consent/" target="_blank" rel="noopener">Полный текст согласия</a></label><label class="hp-field">Не заполняйте<input name="website" tabindex="-1" autocomplete="off"></label><div class="form-buttons"><button class="btn btn-ghost" type="button" data-prev>Назад</button><button class="btn btn-accent" type="submit">Получить предварительный расчет</button></div></fieldset>
  <div class="form-success" data-form-success hidden><h3>Спасибо! Заявка принята.</h3><p>Менеджер компании свяжется с вами для уточнения информации.</p></div>
</form>`;
}

function imageCreditSection() {
  return `<section class="credits" aria-label="Источники медиа"><div class="container"><button type="button" class="credits-toggle" data-credits-toggle>Источники медиа</button><ul hidden data-credits-list>${imageCredits.map((credit) => `<li><a href="${esc(credit.url)}" target="_blank" rel="noopener">${esc(credit.title)}</a></li>`).join('')}</ul></div></section>`;
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
  const body = `${innerHero(service.h1, service.lead, service.image, 'Услуга', service.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Услуги', url: '/#services' }, { name: service.title, url: path }])}<h2>Что входит в работу</h2><ul class="rich-list">${service.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><div class="honest-note">${esc(service.warning)}</div><h2>Что влияет на расчет</h2><div class="factor-cloud">${service.priceFactors.map((factor) => `<span>${esc(factor)}</span>`).join('')}</div><h2>Как проходит заявка</h2><div class="mini-steps">${processSteps.slice(0, 6).map(([step, text], index) => `<article><span>${index + 1}</span><h3>${esc(step)}</h3><p>${esc(text)}</p></article>`).join('')}</div></article><aside class="side-panel"><h2>Расчет стоимости</h2><p>${esc(service.directTitle)}. Передайте фотографии, населенный пункт и желаемый результат.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="${esc(service.title)}">Рассчитать</a><a class="btn btn-ghost btn-full" href="${phoneHref()}" data-goal="phone_click">Позвонить</a></aside></div></section><section class="section section-muted"><div class="container"><div class="section-head"><p class="eyebrow">Связанные услуги</p><h2>Может понадобиться вместе с услугой</h2></div><div class="service-grid compact">${related.map(serviceCard).join('')}</div></div></section>${faqSection([...service.faq, ...faq.slice(0, 4)])}${leadSection('Получите предварительный расчет по фотографиям', 'Опишите задачу, укажите населенный пункт и приложите фотографии дерева, ствола, кроны и территории вокруг.', service.title)}`;
  return renderPage({ title: service.h1, description: `${service.short} Предварительная оценка по фото.`, path, image: service.image, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: service.title, url: path }]), serviceSchema(service, path), faqSchema(service.faq)] });
}

export function regionPage(region) {
  const path = route(region.slug);
  const body = `${innerHero(region.h1, region.intro, images.cottage, 'Район выезда', region.title)}<section class="section"><div class="container content-grid"><article class="content-main">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: 'Районы выезда', url: '/moskovskaya-oblast/' }, { name: region.title, url: path }])}<h2>Особенности выезда</h2><ul class="rich-list">${region.details.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><h2>Какие работы можно заказать</h2><div class="service-grid compact">${services.slice(0, 6).map(serviceCard).join('')}</div></article><aside class="side-panel"><h2>Уточнить выезд</h2><p>Возможность и стоимость выезда уточняются по адресу объекта, доступу и составу работ.</p><a class="btn btn-accent btn-full" href="#lead-form" data-open-form data-service="Выезд: ${esc(region.title)}">Отправить фото</a></aside></div></section>${leadSection('Отправьте фотографии участка', 'Укажите населенный пункт, адрес или ориентир, количество деревьев и что нужно сделать.', `Выезд: ${region.title}`)}`;
  return renderPage({ title: region.h1, description: `${region.h1}. Спил, обрезка, пни и расчистка участков.`, path, body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: region.title, url: path }])] });
}

export function legalPage(page) {
  const path = route(page.slug);
  const body = `${simpleHero(page.h1, 'Юридическая информация сайта и порядок обработки обращений.')}<section class="section"><div class="container text-page">${breadcrumbs([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])}${page.sections.map(([heading, text]) => `<section><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join('')}<p class="muted">Перед публикацией рекомендуется проверить текст с юристом и заполнить реквизиты.</p></div></section>`;
  return renderPage({ title: page.title, description: `${page.title}: условия обработки данных и обращений.`, path, body, leadHref: '/#lead-form', jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: page.title, url: path }])] });
}

export function pricesPage() {
  const body = `${simpleHero('Стоимость спила, обрезки и расчистки участков', 'Не публикуем искусственно низкие цены. Предварительный расчет готовится по фотографиям, адресу и описанию задачи.')}${priceSection(true)}${leadSection('Получите расчет под ваш объект', 'Прикрепите фотографии, укажите населенный пункт и опишите, что требуется сделать.')}`;
  return renderPage({ title: 'Цены на спил и обрезку деревьев', description: 'От чего зависит стоимость спила, обрезки, удаления пней, расчистки участка и вывоза веток.', path: '/prices/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Цены', url: '/prices/' }])] });
}

export function worksPage() {
  const body = `${simpleHero('Фото до и стало', 'Подобранные фотопары показывают типовые задачи: аварийное дерево, расчистка территории и удаление пня. Для реальных кейсов компании блок готов к замене на собственные материалы.')}${worksPreview()}${leadSection('Хотите оценить похожую задачу?', 'Отправьте фотографии объекта, и менеджер компании уточнит детали для предварительного расчета.')}`;
  return renderPage({ title: 'Фото до и стало по работам с деревьями', description: 'Фото до и стало по типовым задачам: аварийное дерево, расчистка участка, удаление пня. Уникальные изображения и источники медиа.', path: '/works/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'До / стало', url: '/works/' }])] });
}

export function faqPage() {
  const body = `${simpleHero('Частые вопросы', 'Подробные ответы о расчете по фото, разрешениях, уборке, вывозе, пнях, сезонности и работе с организациями.')}${faqSection(faq)}${leadSection('Остался вопрос по вашему участку?', 'Опишите ситуацию и приложите фотографии, чтобы менеджер компании понял задачу быстрее.')}`;
  return renderPage({ title: 'Вопросы о спиле и обрезке деревьев', description: 'Ответы на частые вопросы о спиле, обрезке, разрешениях, вывозе веток, удалении пней и расчете стоимости.', path: '/faq/', body, jsonLd: [faqSchema(faq), breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Вопросы', url: '/faq/' }])] });
}

export function contactsPage() {
  const body = `${simpleHero('Контакты компании', 'Позвоните, отправьте фотографии или оставьте заявку на предварительный расчет.')}<section class="section"><div class="container contact-grid"><div class="contact-card"><h2>Связаться</h2><a class="big-contact" href="${phoneHref()}" data-goal="phone_click">${esc(site.phone)}</a><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><p>${esc(site.hours)}</p><p>${esc(site.addressNote)}</p></div><div class="contact-card"><h2>Что подготовить</h2><ul class="rich-list"><li>фото дерева целиком</li><li>фото ствола и кроны</li><li>фото препятствий рядом</li><li>населенный пункт и желаемый результат</li></ul></div></div></section>${leadSection('Отправьте заявку', 'Чем подробнее фотографии и описание, тем точнее предварительный расчет.')}`;
  return renderPage({ title: 'Контакты', description: 'Контакты компании по уходу за деревьями: телефон, email и форма заявки.', path: '/contacts/', body, jsonLd: [breadcrumbSchema([{ name: 'Главная', url: '/' }, { name: 'Контакты', url: '/contacts/' }])] });
}

export function notFoundPage() {
  const body = `${simpleHero('Страница не найдена', 'Такой страницы нет или адрес изменился.')}<section class="section"><div class="container center"><a class="btn btn-accent" href="/">На главную</a><a class="btn btn-ghost" href="/#services">К услугам</a></div></section>`;
  return renderPage({ title: 'Страница не найдена', description: 'Страница не найдена.', path: '/404/', body, leadHref: '/#lead-form' });
}

function organizationSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: site.brand, url: site.baseUrl, telephone: site.phone, email: site.email };
}

function professionalServiceSchema() {
  return { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.brand, areaServed: ['Москва', 'Московская область'], telephone: site.phone, url: site.baseUrl, description: 'Спил, удаление, обрезка деревьев, корчевание пней и расчистка участков.' };
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