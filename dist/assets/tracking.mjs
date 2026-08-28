export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'yclid'
];

function readStoredObject(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function getFirstTouchAttribution(locationHref, storage) {
  const stored = readStoredObject(storage, 'tree_site_utm');
  if (Object.keys(stored).length) return stored;

  const url = new URL(locationHref, 'https://zelsrez.ru/');
  const current = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = url.searchParams.get(key);
    if (value) current[key] = value;
  }

  if (!Object.keys(current).length) return {};

  try {
    storage.setItem('tree_site_utm', JSON.stringify(current));
    storage.setItem('tree_site_entry_page', url.href);
  } catch {
    // The current-page attribution is still returned when storage is unavailable.
  }
  return current;
}

export function getMessengerChannel(href, goal = '') {
  const goalChannels = {
    click_whatsapp: 'whatsapp',
    click_telegram: 'telegram',
    click_max: 'max'
  };
  if (goalChannels[goal]) return goalChannels[goal];
  if (!href) return '';

  try {
    const host = new URL(href, 'https://zelsrez.ru/').hostname.toLowerCase();
    if (host === 'wa.me' || host.endsWith('.whatsapp.com')) return 'whatsapp';
    if (host === 't.me' || host === 'telegram.me' || host.endsWith('.telegram.me')) return 'telegram';
    if (host === 'max.ru' || host.endsWith('.max.ru')) return 'max';
  } catch {
    return '';
  }
  return '';
}
