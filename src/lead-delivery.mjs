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
  const waitMs = Number.isFinite(timeoutMs) ? timeoutMs : (files.length ? 60000 : 20000);
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
