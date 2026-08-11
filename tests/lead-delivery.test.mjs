import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  LeadDeliveryError,
  buildLeadRequest,
  createLeadId,
  deliverLead
} from '../src/lead-delivery.mjs';

function payload(leadId = 'lead-test-1') {
  return {
    lead_id: leadId,
    phone: '+7 999 808-19-51',
    service: 'Тестовая заявка',
    fields: {
      phone: '+7 999 808-19-51',
      service: 'Тестовая заявка'
    }
  };
}

test('createLeadId creates a unique non-empty id for every lead', () => {
  const ids = new Set(Array.from({ length: 50 }, () => createLeadId()));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.ok(id.length > 10);
});

test('lead without photos is sent as JSON with phone and lead_id', async () => {
  const lead = payload();
  let captured;
  const result = await deliverLead('https://worker.example/', lead, [], async (url, options) => {
    captured = { url, options };
    return Response.json({ ok: true, lead_id: lead.lead_id });
  });

  assert.equal(captured.url, 'https://worker.example/');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');
  assert.equal(captured.options.keepalive, true);
  assert.deepEqual(JSON.parse(captured.options.body), lead);
  assert.equal(result.ok, true);
});

test('lead with photos is sent as multipart/form-data without a manual content-type', () => {
  const lead = payload('lead-photo-1');
  const photo = new File(['image-bytes'], 'tree.jpg', { type: 'image/jpeg' });
  const request = buildLeadRequest(lead, [photo]);

  assert.equal(request.method, 'POST');
  assert.equal(request.headers, undefined);
  assert.ok(request.body instanceof FormData);
  assert.deepEqual(JSON.parse(request.body.get('payload')), lead);
  assert.equal(request.body.get('lead_id'), lead.lead_id);
  assert.equal(request.body.get('phone'), lead.phone);
  assert.equal(request.body.get('service'), lead.service);
  assert.equal(request.body.getAll('photos').length, 1);
  assert.equal(request.body.get('photos').name, 'tree.jpg');
});

test('delivery succeeds only for HTTP 2xx with JSON ok true', async (t) => {
  const cases = [
    ['HTTP error with ok true', new Response(JSON.stringify({ ok: true }), { status: 500 })],
    ['2xx with ok false', Response.json({ ok: false, error: 'rejected' })],
    ['2xx without ok true', Response.json({ lead_id: 'lead-test-1' })],
    ['2xx with invalid JSON', new Response('not-json', { status: 200 })]
  ];

  for (const [name, response] of cases) {
    await t.test(name, async () => {
      await assert.rejects(
        deliverLead('https://worker.example/', payload(), [], async () => response),
        LeadDeliveryError
      );
    });
  }
});

test('missing endpoint, phone, lead_id, and network failures are errors', async () => {
  await assert.rejects(deliverLead('', payload()), /не настроен/i);
  await assert.rejects(deliverLead('https://worker.example/', { fields: { phone: '+79998081951' } }), /номер заявки/i);
  await assert.rejects(deliverLead('https://worker.example/', { lead_id: 'lead-no-phone', fields: {} }), /телефон/i);
  await assert.rejects(
    deliverLead('https://worker.example/', payload(), [], async () => { throw new Error('offline'); }),
    /связаться/i
  );
});

test('a hanging Worker times out instead of locking the form forever', async () => {
  const hangingFetch = (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  await assert.rejects(
    deliverLead('https://worker.example/', payload(), [], hangingFetch, 5),
    /не ответил вовремя/i
  );
});

test('quick and full form keep data on errors and never count WhatsApp as delivery', () => {
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.equal([...source.matchAll(/lead_id:\s*createLeadId\(\)/g)].length, 2);
  assert.match(source, /const fields = \{\s*phone,/);
  assert.equal([...source.matchAll(/phone:\s*fields\.phone/g)].length, 2);
  assert.match(source, /deliverLead\(config\.leadEndpoint, payload\)/);
  assert.match(source, /deliverLead\(config\.leadEndpoint, payload, files\)/);
  assert.doesNotMatch(source, /openWhatsAppDraft|lead_whatsapp_fallback|window\.open/);

  const catches = [...source.matchAll(/\} catch \(error\) \{/g)];
  assert.equal(catches.length, 2);
  for (const match of catches) {
    const end = source.indexOf('} finally {', match.index);
    const catchBlock = source.slice(match.index, end);
    assert.match(catchBlock, /status:\s*'error'/);
    assert.doesNotMatch(catchBlock, /form\.reset\(\)|fieldset\.hidden|progress\.parentElement\.hidden/);
  }
});
