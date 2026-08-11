const DEFAULT_ALLOWED_ORIGINS = ['https://zelsrez.ru', 'https://www.zelsrez.ru'];
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 30 * 1024 * 1024;

function allowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin'
  };
  if (allowedOrigins(env).includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(request, env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request, env)
  });
}

function clean(value, maxLength = 1000) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 4000)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function splitBranchAfter(comment) {
  const value = clean(comment, 1000);
  const match = value.match(/(?:^|\n)После работы с ветками:\s*([^\n]*)\s*$/u);
  if (!match) return { comment: value, branchAfter: '' };
  return {
    comment: value.slice(0, match.index).trim(),
    branchAfter: clean(match[1], 160)
  };
}

function validatePayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    throw new Error('Invalid JSON');
  }

  const rawFields = rawPayload.fields && typeof rawPayload.fields === 'object'
    ? rawPayload.fields
    : {};
  const fields = {
    service: clean(rawPayload.service || rawFields.service, 120),
    phone: clean(rawPayload.phone || rawFields.phone, 40),
    name: clean(rawPayload.name || rawFields.name, 120),
    city: clean(rawPayload.city || rawFields.city, 160),
    comment: clean(rawPayload.comment || rawFields.comment, 1000)
  };
  const phoneDigits = fields.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw new Error('Введите корректный телефон');
  }

  return {
    lead_id: clean(rawPayload.lead_id, 100) || crypto.randomUUID(),
    created_at: clean(rawPayload.created_at, 80),
    source: clean(rawPayload.source, 300),
    page: clean(rawPayload.page, 350),
    entry_page: clean(rawPayload.entry_page, 350),
    utm: rawPayload.utm && typeof rawPayload.utm === 'object' ? rawPayload.utm : {},
    fields
  };
}

function validatePhotos(items) {
  const photos = items.filter((item) => item instanceof File).slice(0, MAX_PHOTOS);
  let totalBytes = 0;
  for (const photo of photos) {
    if (!photo.type.startsWith('image/')) throw new Error('Можно прикреплять только изображения');
    if (photo.size > MAX_PHOTO_BYTES) throw new Error('Размер одного изображения не должен превышать 8 МБ');
    totalBytes += photo.size;
  }
  if (totalBytes > MAX_TOTAL_PHOTO_BYTES) throw new Error('Общий размер изображений не должен превышать 30 МБ');
  return photos;
}

async function readRequest(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const serializedPayload = String(form.get('payload') || '').trim();
    const rawPayload = serializedPayload ? JSON.parse(serializedPayload) : {};
    const directFields = [
      'lead_id', 'phone', 'service', 'name', 'city', 'comment',
      'created_at', 'source', 'page', 'entry_page'
    ];
    directFields.forEach((key) => {
      if (form.has(key)) rawPayload[key] = String(form.get(key) || '');
    });
    if (form.has('utm')) {
      rawPayload.utm = JSON.parse(String(form.get('utm') || '{}'));
    }
    return {
      payload: validatePayload(rawPayload),
      photos: validatePhotos(form.getAll('photos'))
    };
  }

  if (!contentType.includes('application/json')) {
    throw new Error('Unsupported Content-Type');
  }
  return { payload: validatePayload(await request.json()), photos: [] };
}

function leadText(payload, photoCount) {
  const fields = payload.fields;
  const details = splitBranchAfter(fields.comment);
  const utm = Object.entries(payload.utm)
    .slice(0, 6)
    .map(([key, value]) => `${escapeHtml(clean(key, 60))}=${escapeHtml(clean(value, 120))}`)
    .join(', ');
  const lines = [
    '<b>🌳 Новая заявка</b>',
    `<b>ID:</b> <code>${escapeHtml(payload.lead_id)}</code>`,
    `<b>Телефон:</b> ${escapeHtml(fields.phone)}`,
    fields.name ? `<b>Имя:</b> ${escapeHtml(fields.name)}` : '',
    fields.service ? `<b>Услуга:</b> ${escapeHtml(fields.service)}` : '',
    fields.city ? `<b>Адрес / район:</b> ${escapeHtml(fields.city)}` : '',
    details.comment ? `<b>Комментарий:</b> ${escapeHtml(details.comment)}` : '',
    details.branchAfter ? `<b>После работы с ветками:</b> ${escapeHtml(details.branchAfter)}` : '',
    payload.page ? `<b>Страница:</b> ${escapeHtml(payload.page)}` : '',
    payload.source ? `<b>Источник:</b> ${escapeHtml(payload.source)}` : '',
    payload.created_at ? `<b>Дата:</b> ${escapeHtml(payload.created_at)}` : '',
    photoCount ? `<b>Фото к заявке:</b> ${photoCount}` : '',
    utm ? `<b>UTM:</b> ${utm}` : ''
  ];
  return lines.filter(Boolean).join('\n');
}

async function telegramRequest(env, method, body) {
  const isForm = body instanceof FormData;
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.ok !== true) {
    throw new Error(`Telegram API error (${response.status})`);
  }
  return result.result;
}

async function sendPhotos(env, photos, leadId) {
  if (!photos.length) return;
  const caption = `Фото к заявке <code>${escapeHtml(leadId)}</code>`;

  if (photos.length === 1) {
    const body = new FormData();
    body.append('chat_id', env.TELEGRAM_CHAT_ID);
    body.append('photo', photos[0], photos[0].name || 'photo.jpg');
    body.append('caption', caption);
    body.append('parse_mode', 'HTML');
    await telegramRequest(env, 'sendPhoto', body);
    return;
  }

  const body = new FormData();
  const media = photos.map((photo, index) => {
    const item = { type: 'photo', media: `attach://photo${index}` };
    if (index === 0) {
      item.caption = caption;
      item.parse_mode = 'HTML';
    }
    body.append(`photo${index}`, photo, photo.name || `photo-${index + 1}.jpg`);
    return item;
  });
  body.append('chat_id', env.TELEGRAM_CHAT_ID);
  body.append('media', JSON.stringify(media));
  await telegramRequest(env, 'sendMediaGroup', body);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const originAllowed = !origin || allowedOrigins(env).includes(origin);

    if (request.method === 'OPTIONS') {
      return originAllowed
        ? new Response(null, { status: 204, headers: corsHeaders(request, env) })
        : json(request, env, 403, { ok: false, error: 'Origin not allowed' });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return json(request, env, 200, { ok: true, service: 'zelsrez-leads', status: 'ready' });
    }
    if (request.method !== 'POST' || !['/', '/api/lead'].includes(url.pathname)) {
      return json(request, env, 404, { ok: false, error: 'Not found' });
    }
    if (!originAllowed) return json(request, env, 403, { ok: false, error: 'Origin not allowed' });
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json(request, env, 503, { ok: false, error: 'Lead service is not configured' });
    }

    try {
      const { payload, photos } = await readRequest(request);
      await telegramRequest(env, 'sendMessage', {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: leadText(payload, photos.length),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      await sendPhotos(env, photos, payload.lead_id);
      return json(request, env, 200, { ok: true, lead_id: payload.lead_id, photos_sent: photos.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обработать заявку';
      const status = /телефон|изображен|размер|JSON|заявк|Unsupported/i.test(message) ? 400 : 502;
      return json(request, env, status, { ok: false, error: message });
    }
  }
};
