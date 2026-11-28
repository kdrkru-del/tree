export class LeadDeliveryError extends Error {
  constructor(message, { status = 0, response = null } = {}) {
    super(message);
    this.name = 'LeadDeliveryError';
    this.status = status;
    this.response = response;
  }
}

export function createLeadId(cryptoApi = globalThis.crypto) {
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function assertRequiredFields(payload) {
  const leadId = String(payload && payload.lead_id || '').trim();
  const phone = String(payload && (payload.phone || payload.fields && payload.fields.phone) || '').trim();
  if (!leadId) throw new LeadDeliveryError('Не сформирован номер заявки');
  if (!phone) throw new LeadDeliveryError('Не указан телефон');
}

const MULTIPART_FIELDS = [
  'lead_id', 'phone', 'service', 'name', 'city', 'comment',
  'created_at', 'source', 'page', 'entry_page'
];

export function buildLeadRequest(payload, files = []) {
  assertRequiredFields(payload);
  const photos = Array.from(files || []);

  if (photos.length) {
    const body = new FormData();
    body.append('payload', JSON.stringify(payload));
    MULTIPART_FIELDS.forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) {
        body.append(key, String(payload[key]));
      }
    });
    if (payload.utm && typeof payload.utm === 'object') {
      body.append('utm', JSON.stringify(payload.utm));
    }
    photos.forEach((file, index) => {
      body.append('photos', file, file.name || `photo-${index + 1}.jpg`);
    });
    return { method: 'POST', body };
  }

  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

export async function deliverLead(endpoint, payload, files = [], fetchImpl = globalThis.fetch, timeoutMs) {
  if (!String(endpoint || '').trim()) {
    throw new LeadDeliveryError('Сервис заявок не настроен');
  }
  if (typeof fetchImpl !== 'function') {
    throw new LeadDeliveryError('Сервис заявок недоступен');
  }

  const request = buildLeadRequest(payload, files);
  const waitMs = Number.isFinite(timeoutMs) ? timeoutMs : (files.length ? 60000 : 10000);
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeout = controller && waitMs > 0
    ? setTimeout(() => controller.abort(), waitMs)
    : null;
  if (controller) request.signal = controller.signal;
  let response;
  try {
    response = await fetchImpl(endpoint, request);
  } catch (error) {
    const message = controller && controller.signal.aborted
      ? 'Сервис заявок не ответил вовремя'
      : 'Не удалось связаться с сервисом заявок';
    throw new LeadDeliveryError(message, {
      response: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const responseData = await response.json().catch(() => null);
  if (!response.ok || !responseData || responseData.ok !== true) {
    const detail = responseData && responseData.error
      ? `: ${responseData.error}`
      : '';
    throw new LeadDeliveryError(`Заявка не принята сервисом${detail}`, {
      status: response.status,
      response: responseData
    });
  }

  return responseData;
}

// Повтор имеет смысл, только если сервер не ответил или ответил сбоем (5xx).
export function isRetryableError(error) {
  const status = Number(error && error.status) || 0;
  return status === 0 || status >= 500;
}

export async function deliverLeadWithRetry(endpoint, payload, files = [], options = {}) {
  const { attempts = 2, delayMs = 2000, fetchImpl = globalThis.fetch, timeoutMs } = options;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await deliverLead(endpoint, payload, files, fetchImpl, timeoutMs);
    } catch (error) {
      if (attempt >= attempts || !isRetryableError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Очередь неотправленных заявок в браузере посетителя.
const PENDING_KEY = 'tree_site_pending_leads';
const PENDING_MAX_AGE_MS = 72 * 60 * 60 * 1000;
const PENDING_MAX_ITEMS = 5;

function readPending(storage, now) {
  try {
    const items = JSON.parse(storage.getItem(PENDING_KEY) || '[]');
    return items.filter((item) => item && item.payload && now - item.queuedAt < PENDING_MAX_AGE_MS);
  } catch {
    return [];
  }
}

function writePending(storage, items) {
  try {
    if (items.length) storage.setItem(PENDING_KEY, JSON.stringify(items.slice(-PENDING_MAX_ITEMS)));
    else storage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

function removePending(storage, leadId, now) {
  writePending(storage, readPending(storage, now).filter((item) => item.payload.lead_id !== leadId));
}

export function queuePendingLead(storage, payload, { photos = 0, now = Date.now() } = {}) {
  const items = readPending(storage, now).filter((item) => item.payload.lead_id !== payload.lead_id);
  items.push({ payload, photos, queuedAt: now });
  return writePending(storage, items);
}

// Клиент отправил новую заявку успешно: старые попытки с тем же номером больше не нужны.
export function dropPendingLeads(storage, phone, now = Date.now()) {
  writePending(storage, readPending(storage, now).filter((item) => item.payload.phone !== phone));
}

function asDelayedPayload({ payload, photos }) {
  const note = [
    'Повторная отправка: с первого раза заявка не прошла (возможен дубль).',
    photos ? `Фото не приложены (${photos} шт.), запросите у клиента.` : ''
  ].filter(Boolean).join(' ');
  const comment = [payload.fields && payload.fields.comment, note].filter(Boolean).join('\n');
  return { ...payload, comment, fields: { ...payload.fields, comment } };
}

export async function flushPendingLeads(storage, send, now = Date.now()) {
  const items = readPending(storage, now);
  writePending(storage, items);
  const sent = [];
  for (const item of items) {
    try {
      await send(asDelayedPayload(item));
      sent.push(item.payload);
    } catch (error) {
      if (isRetryableError(error)) continue;
      // Сервер отклонил данные: повторять бессмысленно.
    }
    removePending(storage, item.payload.lead_id, now);
  }
  return sent;
}
