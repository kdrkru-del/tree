import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LeadDeliveryError, deliverLeadWithRetry, dropPendingLeads, flushPendingLeads, queuePendingLead
} from '../src/lead-delivery.mjs';

const lead = (id = 'a', phone = '+79990000000') => ({ lead_id: id, phone, fields: { phone, comment: 'вопрос' } });
const ok = () => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
function memory() {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)
  };
}

test('a network failure is retried and the second attempt delivers', async () => {
  let calls = 0;
  const fetchImpl = () => (++calls === 1 ? Promise.reject(new TypeError('Failed to fetch')) : ok());
  await deliverLeadWithRetry('https://x', lead(), [], { delayMs: 0, fetchImpl });
  assert.equal(calls, 2);
});

test('a validation error (400) is not retried', async () => {
  let calls = 0;
  const fetchImpl = () => { calls += 1; return Promise.resolve(new Response('{"ok":false}', { status: 400 })); };
  await assert.rejects(deliverLeadWithRetry('https://x', lead(), [], { delayMs: 0, fetchImpl }));
  assert.equal(calls, 1);
});

test('a queued lead stays until delivered, then is sent once with a note', async () => {
  const storage = memory();
  queuePendingLead(storage, lead(), { photos: 2, now: 1000 });
  const offline = () => Promise.reject(new LeadDeliveryError('нет связи'));
  assert.equal((await flushPendingLeads(storage, offline, 2000)).length, 0);
  const received = [];
  assert.equal((await flushPendingLeads(storage, async (p) => received.push(p), 3000)).length, 1);
  assert.match(received[0].fields.comment, /^вопрос\nПовторная отправка.*Фото не приложены \(2 шт\.\)/);
  assert.equal(received[0].lead_id, 'a');
  assert.equal((await flushPendingLeads(storage, async (p) => received.push(p), 4000)).length, 0);
  assert.equal(received.length, 1);
});

test('stale, superseded and rejected leads leave the queue', async () => {
  const storage = memory();
  const send = async () => {};
  queuePendingLead(storage, lead('old'), { now: 0 });
  assert.equal((await flushPendingLeads(storage, send, 73 * 3600 * 1000)).length, 0);
  queuePendingLead(storage, lead('b'), { now: 10 });
  dropPendingLeads(storage, '+79990000000', 20);
  assert.equal((await flushPendingLeads(storage, send, 30)).length, 0);
  queuePendingLead(storage, lead('c'), { now: 40 });
  await flushPendingLeads(storage, async () => { throw new LeadDeliveryError('bad', { status: 400 }); }, 50);
  assert.equal((await flushPendingLeads(storage, send, 60)).length, 0);
});
