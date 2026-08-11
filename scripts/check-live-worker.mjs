import { readFile } from 'node:fs/promises';

import { site } from '../src/data.mjs';
import { createLeadId, deliverLead } from '../src/lead-delivery.mjs';

const endpoint = process.env.LEAD_ENDPOINT || site.leadEndpoint;
const mode = process.argv[2] || 'all';

function productionFetch(url, options) {
  const headers = new Headers(options.headers);
  headers.set('Origin', site.baseUrl);
  return fetch(url, { ...options, headers });
}

function basePayload(leadId, service, comment) {
  const fields = {
    service,
    phone: site.phone,
    name: 'Проверка сайта',
    city: 'Московская область',
    comment
  };
  return {
    lead_id: leadId,
    created_at: new Date().toISOString(),
    source: 'codex-live-check',
    page: `${site.baseUrl}/#lead-form`,
    entry_page: site.baseUrl,
    utm: {},
    phone: fields.phone,
    service: fields.service,
    name: fields.name,
    city: fields.city,
    comment: fields.comment,
    fields
  };
}

function verify(result, leadId, label) {
  if (result.ok !== true || result.lead_id !== leadId) {
    throw new Error(`${label}: Worker вернул некорректное подтверждение`);
  }
  console.log(`${label}: ok=true, lead_id=${result.lead_id}, photos_sent=${result.photos_sent}`);
}

if (mode === 'all' || mode === 'quick') {
  const quickId = `codex-quick-${createLeadId()}`;
  const quickPayload = basePayload(
    quickId,
    'ТЕСТ: быстрая форма',
    'Автоматическая проверка JSON. Действий не требуется.'
  );
  const quickResult = await deliverLead(endpoint, quickPayload, [], productionFetch);
  verify(quickResult, quickId, 'quick JSON');
}

const photoBytes = await readFile(new URL('../assets/logo-zelenyi-srez.png', import.meta.url));
const photo = new File([photoBytes], 'codex-test-logo.png', { type: 'image/png' });
if (mode === 'all' || mode === 'full') {
  const fullId = `codex-full-${createLeadId()}`;
  const fullPayload = {
    ...basePayload(
      fullId,
      'ТЕСТ: полная двухшаговая форма',
      'Автоматическая проверка multipart/form-data. Действий не требуется.'
    ),
    files: [{ name: photo.name, size: photo.size, type: photo.type }]
  };
  const fullResult = await deliverLead(endpoint, fullPayload, [photo], productionFetch);
  verify(fullResult, fullId, 'full multipart');
}
