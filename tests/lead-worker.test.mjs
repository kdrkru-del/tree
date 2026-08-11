import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import worker from '../worker/lead-worker.mjs';

const env = {
  get TELEGRAM_BOT_TOKEN() { return true; },
  get TELEGRAM_CHAT_ID() { return true; }
};
const origin = 'https://zelsrez.ru';

function makePayload(leadId) {
  return {
    lead_id: leadId,
    created_at: '2026-08-10T12:00:00.000Z',
    source: 'TEST source',
    page: 'https://zelsrez.ru/',
    phone: '+7 999 808-19-51',
    name: 'Иван',
    service: 'Тест Worker',
    city: 'Московская область',
    comment: 'Комментарий клиента\nПосле работы с ветками: Измельчить в щепу'
  };
}

function telegramOk() {
  return Response.json({ ok: true, result: { message_id: 1 } });
}

test('GET health-check matches the published Worker contract', async () => {
  const response = await worker.fetch(new Request('https://worker.example/', {
    headers: { Origin: origin }
  }), {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: 'zelsrez-leads',
    status: 'ready'
  });
});

test('OPTIONS allows the production site origin', async () => {
  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'OPTIONS',
    headers: { Origin: origin }
  }), {});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.match(response.headers.get('Access-Control-Allow-Methods'), /POST/);
});

test('JSON lead sends phone and lead_id to Telegram', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    return telegramOk();
  });
  const lead = makePayload('lead-json-1');
  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }), env);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, lead_id: lead.lead_id, photos_sent: 0 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /sendMessage$/);
  const telegramPayload = JSON.parse(calls[0].options.body);
  assert.equal(telegramPayload.chat_id, env.TELEGRAM_CHAT_ID);
  assert.match(telegramPayload.text, /lead-json-1/);
  assert.match(telegramPayload.text, /\+7 999 808-19-51/);
  for (const label of [
    'Новая заявка', 'ID', 'Телефон', 'Имя', 'Услуга', 'Адрес / район',
    'Комментарий', 'После работы с ветками', 'Страница', 'Источник', 'Дата'
  ]) {
    assert.ok(telegramPayload.text.includes(label), `Missing Telegram label: ${label}`);
  }
});

test('multipart lead sends the payload and photo to Telegram', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    return telegramOk();
  });
  const lead = makePayload('lead-photo-1');
  const form = new FormData();
  form.append('payload', JSON.stringify(lead));
  form.append('photos', new File(['photo-bytes'], 'tree.png', { type: 'image/png' }));

  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin },
    body: form
  }), env);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, lead_id: lead.lead_id, photos_sent: 1 });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /sendMessage$/);
  assert.match(calls[1].url, /sendPhoto$/);
  assert.ok(calls[1].options.body instanceof FormData);
  assert.equal(calls[1].options.body.get('chat_id'), String(env.TELEGRAM_CHAT_ID));
  assert.equal(calls[1].options.body.get('photo').name, 'tree.png');
  assert.equal(calls[1].options.body.get('caption'), 'Фото к заявке <code>lead-photo-1</code>');
});

test('Worker source is strict UTF-8 and contains no mojibake labels', () => {
  const bytes = readFileSync(new URL('../worker/lead-worker.mjs', import.meta.url));
  const source = bytes.toString('utf8');
  assert.ok(Buffer.from(source, 'utf8').equals(bytes), 'Worker source is not strict UTF-8');
  for (const label of [
    'Новая заявка', 'ID', 'Телефон', 'Имя', 'Услуга', 'Адрес / район',
    'Комментарий', 'После работы с ветками', 'Страница', 'Источник', 'Дата',
    'Фото к заявке'
  ]) {
    assert.ok(source.includes(label), `Missing Worker label: ${label}`);
  }
  assert.doesNotMatch(source, /РЎ|Рµ|Р°|РЅ|Рё|Р»|Рє|Рѕ|СЃ|СЂ|�/u);
});

test('multipart lead accepts direct phone and lead_id fields used in production', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => telegramOk());
  const form = new FormData();
  form.append('lead_id', 'lead-direct-fields');
  form.append('phone', '+7 999 808-19-51');
  form.append('service', 'Тест прямых полей');
  form.append('photos', new File(['photo-bytes'], 'tree.png', { type: 'image/png' }));

  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin },
    body: form
  }), env);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    lead_id: 'lead-direct-fields',
    photos_sent: 1
  });
});

test('invalid phone is rejected before Telegram is called', async (t) => {
  const telegram = t.mock.method(globalThis, 'fetch', async () => telegramOk());
  const lead = makePayload('lead-invalid-phone');
  lead.phone = '123';
  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }), env);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: 'Введите корректный телефон' });
  assert.equal(telegram.mock.callCount(), 0);
});

test('invalid JSON and unsupported content type match the published contract', async () => {
  const invalidJson = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: 'null'
  }), env);
  assert.equal(invalidJson.status, 400);
  assert.deepEqual(await invalidJson.json(), { ok: false, error: 'Invalid JSON' });

  const unsupported = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'text/plain' },
    body: '{}'
  }), env);
  assert.equal(unsupported.status, 400);
  assert.deepEqual(await unsupported.json(), { ok: false, error: 'Unsupported Content-Type' });
});

test('Telegram failure is never returned as a successful lead', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ ok: false }, { status: 502 }));
  const lead = makePayload('lead-telegram-error');
  const response = await worker.fetch(new Request('https://worker.example/', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }), env);

  assert.equal(response.status, 502);
  const result = await response.json();
  assert.equal(result.ok, false);
});
