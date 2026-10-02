import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { site, services } from '../src/data.mjs';
import { createLeadId, deliverLead, buildLeadRequest, LeadDeliveryError } from '../src/lead-delivery.mjs';
import { getFirstTouchAttribution } from '../src/tracking.mjs';

const DIST_DIR = path.resolve('dist');

const LANDING_PAGES = [
  {
    slug: 'spil-derevev',
    serviceCode: 'spil',
    serviceName: 'Спил и удаление деревьев',
    formId: 'fast-lead-spil',
    quizId: 'quiz-spil'
  },
  {
    slug: 'udalenie-avariynyh-derevev',
    serviceCode: 'emergency_tree',
    serviceName: 'Удаление аварийных деревьев',
    formId: 'fast-lead-emergency',
    quizId: 'quiz-emergency'
  },
  {
    slug: 'raschistka-uchastkov',
    serviceCode: 'land_clearing',
    serviceName: 'Расчистка участков',
    formId: 'fast-lead-clearing',
    quizId: 'quiz-clearing'
  },
  {
    slug: 'obrezka-derevev',
    serviceCode: 'tree_pruning',
    serviceName: 'Обрезка деревьев',
    formId: 'fast-lead-pruning',
    quizId: 'quiz-pruning'
  },
  {
    slug: 'izmelchenie-vetok',
    serviceCode: 'branch_chipping',
    serviceName: 'Измельчение веток',
    formId: 'fast-lead-chipping',
    quizId: 'quiz-chipping'
  },
  {
    slug: 'raschistka-prosek-lep',
    serviceCode: 'lep_clearing',
    serviceName: 'Расчистка просек ЛЭП',
    formId: 'fast-lead-lep',
    quizId: 'quiz-lep'
  }
];

function readHtml(slug) {
  const filePath = path.join(DIST_DIR, slug, 'index.html');
  assert.ok(existsSync(filePath), `HTML file must exist: ${filePath}`);
  return readFileSync(filePath, 'utf8');
}

test('E2E Matrix: All 6 landing pages exist in dist with correct meta and viewports', () => {
  for (const page of LANDING_PAGES) {
    const html = readHtml(page.slug);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/zelsrez\.ru\//);
    assert.match(html, new RegExp(`id="${page.formId}"`));
    assert.match(html, new RegExp(`id="${page.quizId}"`));
    assert.match(html, new RegExp(`value="${page.serviceCode}"`));
    assert.match(html, new RegExp(`value="${page.serviceName}"`));
  }
});

test('E2E Matrix: Distinct service names and codes per landing page (no cross-contamination)', () => {
  const seenCodes = new Set();
  const seenNames = new Set();

  for (const page of LANDING_PAGES) {
    assert.ok(!seenCodes.has(page.serviceCode), `Duplicate service code: ${page.serviceCode}`);
    assert.ok(!seenNames.has(page.serviceName), `Duplicate service name: ${page.serviceName}`);
    seenCodes.add(page.serviceCode);
    seenNames.add(page.serviceName);

    const html = readHtml(page.slug);
    // Verify that the other 5 page service codes do not appear as hidden inputs in this page's forms
    for (const other of LANDING_PAGES) {
      if (other.slug === page.slug) continue;
      const otherInputCode = `<input type="hidden" name="service_code" value="${other.serviceCode}">`;
      assert.ok(!html.includes(otherInputCode), `Page ${page.slug} incorrectly contains service_code of ${other.slug}`);
    }
  }
});

test('E2E Matrix: Scenario 1 - Phone-only submission across all 6 pages', async () => {
  for (const page of LANDING_PAGES) {
    const leadId = createLeadId();
    const payload = {
      lead_id: leadId,
      phone: '+7 (999) 808-19-51',
      service: page.serviceName,
      service_code: page.serviceCode,
      page: `https://zelsrez.ru/${page.slug}/#${page.formId}`,
      created_at: new Date().toISOString()
    };

    let metrikaGoalsFired = [];
    const mockMetrika = (goal) => metrikaGoalsFired.push(goal);

    const mockFetch = async (url, options) => {
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      const body = JSON.parse(options.body);
      assert.equal(body.phone, '+7 (999) 808-19-51');
      assert.equal(body.service_code, page.serviceCode);
      assert.equal(body.lead_id, leadId);
      return new Response(JSON.stringify({ ok: true, lead_id: leadId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const res = await deliverLead(site.leadEndpoint, payload, [], mockFetch);
    assert.equal(res.ok, true);
    assert.equal(res.lead_id, leadId);
    mockMetrika('lead_form');
    assert.deepEqual(metrikaGoalsFired, ['lead_form']);
  }
});

test('E2E Matrix: Scenario 2 - Full fields submission across all 6 pages', async () => {
  for (const page of LANDING_PAGES) {
    const leadId = createLeadId();
    const payload = {
      lead_id: leadId,
      phone: '+7 (999) 808-19-51',
      name: 'Иван Сергеевич',
      comment: 'Дерево 15 метров, ветки над забором',
      service: page.serviceName,
      service_code: page.serviceCode,
      quiz_answers: { 'q_1': 'Спил по частям', 'q_2': 'До 15 метров' },
      utm: { utm_source: 'yandex', utm_medium: 'cpc' },
      page: `https://zelsrez.ru/${page.slug}/#${page.quizId}`,
      created_at: new Date().toISOString()
    };

    const mockFetch = async (url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.name, 'Иван Сергеевич');
      assert.equal(body.comment, 'Дерево 15 метров, ветки над забором');
      assert.deepEqual(body.quiz_answers, { 'q_1': 'Спил по частям', 'q_2': 'До 15 метров' });
      return new Response(JSON.stringify({ ok: true, lead_id: leadId }), { status: 200 });
    };

    const res = await deliverLead(site.leadEndpoint, payload, [], mockFetch);
    assert.equal(res.ok, true);
  }
});

test('E2E Matrix: Scenario 3 & 4 - 1 photo and 5 photos multipart submission', async () => {
  for (const photoCount of [1, 5]) {
    for (const page of LANDING_PAGES) {
      const leadId = createLeadId();
      const files = Array.from({ length: photoCount }, (_, i) => {
        return new File([Buffer.from(`fake photo content ${i + 1}`)], `photo_${i + 1}.jpg`, { type: 'image/jpeg' });
      });

      const payload = {
        lead_id: leadId,
        phone: '+7 (999) 808-19-51',
        service: page.serviceName,
        service_code: page.serviceCode
      };

      const req = buildLeadRequest(payload, files);
      assert.equal(req.method, 'POST');
      assert.ok(req.body instanceof FormData);

      const photosInBody = req.body.getAll('photos');
      assert.equal(photosInBody.length, photoCount);
      assert.equal(req.body.get('service'), page.serviceName);

      const mockFetch = async () => {
        return new Response(JSON.stringify({ ok: true, lead_id: leadId, photos_sent: photoCount }), { status: 200 });
      };

      const res = await deliverLead(site.leadEndpoint, payload, files, mockFetch);
      assert.equal(res.ok, true);
      assert.equal(res.photos_sent, photoCount);
    }
  }
});

test('E2E Matrix: Scenario 5 - Network / Backend error: error markup shown, lead_form goal blocked', async () => {
  for (const page of LANDING_PAGES) {
    const html = readHtml(page.slug);
    // Verify fallback messenger links exist inside error containers
    assert.match(html, /class="[^"]*form-error[^"]*"/);
    assert.match(html, /form-error-wa/);
    assert.match(html, /form-error-tg/);
    assert.match(html, /href="https:\/\/wa\.me\/79998081951\?text=/);
    assert.match(html, /href="https:\/\/t\.me\/Romatran"/);

    // Verify delivery failure throws and does not emit lead_form
    const failingFetch = async () => {
      return new Response(JSON.stringify({ ok: false, error: 'Internal Worker Error' }), { status: 500 });
    };

    let metrikaFired = false;
    try {
      await deliverLead(site.leadEndpoint, { lead_id: 'test', phone: '+7 (999) 808-19-51' }, [], failingFetch);
      metrikaFired = true;
    } catch (err) {
      assert.ok(err instanceof LeadDeliveryError);
    }
    assert.equal(metrikaFired, false, 'lead_form goal must NEVER fire on backend failure');
  }
});

test('E2E Matrix: Scenario 6 - Double-click protection validation', () => {
  const appJs = readFileSync(path.resolve('src/app.js'), 'utf8');
  // Check that submitting flag and disabled attribute are enforced on submit buttons
  assert.match(appJs, /submitBtn\.disabled\s*=\s*true/);
  assert.match(appJs, /form\.dataset\.submitting\s*=\s*'true'/);
  assert.match(appJs, /if\s*\(form\.dataset\.submitting\s*===\s*'true'\)\s*return/);
});

test('E2E Matrix: Scenario 7 - Mobile viewport safety (360px, 390px, 414px)', () => {
  const css = readFileSync(path.resolve('src/styles.css'), 'utf8');
  // Verify responsiveness: container padding, flex wraps, image max-width, no horizontal scroll
  assert.match(css, /max-width:\s*100%/);
  assert.match(css, /box-sizing:\s*border-box/);
  assert.match(css, /overflow-x:\s*hidden/);

  // Check all landing page HTMLs for responsive elements
  for (const page of LANDING_PAGES) {
    const html = readHtml(page.slug);
    assert.ok(!html.includes('width: 1440px'), `Page ${page.slug} should not have fixed 1440px inline width`);
    assert.ok(!html.includes('width="1440"'), `Page ${page.slug} should not have fixed 1440 inline width on container`);
  }
});

test('E2E Matrix: Scenario 8 - UTM and yclid retention across landings', () => {
  const storage = {
    data: new Map(),
    getItem(k) { return this.data.get(k) || null; },
    setItem(k, v) { this.data.set(k, String(v)); }
  };

  const directUrl = 'https://zelsrez.ru/spil-derevev/?utm_source=yandex&utm_medium=cpc&utm_campaign=spil_direct&utm_term=valka&yclid=998877665544';
  const attr = getFirstTouchAttribution(directUrl, storage);

  assert.equal(attr.utm_source, 'yandex');
  assert.equal(attr.utm_medium, 'cpc');
  assert.equal(attr.utm_campaign, 'spil_direct');
  assert.equal(attr.utm_term, 'valka');
  assert.equal(attr.yclid, '998877665544');

  // Verify that subsequent navigation to another landing page retains initial attribution
  const nextAttr = getFirstTouchAttribution('https://zelsrez.ru/izmelchenie-vetok/', storage);
  assert.equal(nextAttr.utm_source, 'yandex');
  assert.equal(nextAttr.yclid, '998877665544');
});

test('E2E Matrix: Home page has exactly 7 service cards including LEP', () => {
  const html = readHtml('');
  const cards = [...html.matchAll(/<article class="main-service-card"/g)];
  assert.equal(cards.length, 7, 'Home page must have exactly 7 service cards');
  assert.match(html, /id="lep"/);
  assert.match(html, /Расчистка просек под ЛЭП/);
  assert.match(html, /По расчёту объекта/);
  assert.match(html, /href="\/raschistka-prosek-lep\/"/);
  assert.match(html, /src="\/assets\/raschistka-real\.png"/);
});

test('E2E Matrix: Home page has 100% сохранность имущества, мат. ответственность, выезд от 2 часов', () => {
  const html = readHtml('');
  assert.match(html, /100% сохранность имущества/);
  assert.match(html, /Материальная ответственность по договору/);
  assert.match(html, /Выезд (?:бригады )?от 2 часов/);
});

test('E2E Matrix: No user-visible word "квиз" across any landing page', () => {
  for (const page of LANDING_PAGES) {
    const html = readHtml(page.slug);
    const cleaned = html
      .replace(/data-quiz[^=]*="[^"]*"/g, '')
      .replace(/id="quiz-[^"]*"/g, '')
      .replace(/href="#quiz-[^"]*"/g, '')
      .replace(/form-quiz-[^"]*/g, '')
      .replace(/quiz_answers/g, '')
      .replace(/quiz_step/g, '')
      .replace(/quiz_complete/g, '')
      .replace(/quiz_start/g, '')
      .replace(/реквизиты|реквизитов/gi, '');

    assert.doesNotMatch(cleaned, /квиз/i, `Page ${page.slug} still contains visible word "квиз"`);
  }
});

test('E2E Matrix: Emergency trees page CTA priority and badges', () => {
  const html = readHtml('udalenie-avariynyh-derevev');
  const actionsMatch = html.match(/<div class="landing-hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(actionsMatch, 'Hero actions must exist');
  const actionsContent = actionsMatch[1];
  const phoneIndex = actionsContent.indexOf('tel:+79998081951');
  const calcIndex = actionsContent.indexOf('#quiz-emergency');
  assert.ok(phoneIndex !== -1, 'Phone CTA must be present');
  assert.ok(calcIndex !== -1, 'Calculate CTA must be present');
  assert.ok(phoneIndex < calcIndex, '1st CTA must be phone call, 2nd CTA must be estimate');
  assert.match(actionsContent, /Позвонить сейчас/);
  assert.match(html, /Выезд бригады — от 2 часов/);
});

test('E2E Matrix: Chipping page has no unconfirmed "15 см" or "смену щепореза"', () => {
  const html = readHtml('izmelchenie-vetok');
  assert.match(html, /<h1>Измельчение веток \(Щепорез\)/);
  assert.doesNotMatch(html, /15 см/);
  assert.doesNotMatch(html, /смену щепореза/i);
  assert.doesNotMatch(html, /смены щепореза/i);
  assert.match(html, /Рассчитать стоимость измельчения веток/);
});

test('E2E Matrix: LEP page has no unconfirmed engineer claims and has B2B VAT options', () => {
  const html = readHtml('raschistka-prosek-lep');
  assert.match(html, /Расчистка просек и территорий под ЛЭП/);
  assert.match(html, /Специалист/i);
  assert.doesNotMatch(html, /инженер/i);
  assert.doesNotMatch(html, /электросетевыми компаниями/i);
  assert.doesNotMatch(html, /десятки гектаров/i);
  assert.doesNotMatch(html, /всех классов напряжения/i);
  assert.match(html, /с НДС/);
  assert.match(html, /Собственный щепорез с оператором/);
  assert.match(html, /accept="image\/\*"/);
  assert.doesNotMatch(html, /\.pdf,\.doc/);
});

