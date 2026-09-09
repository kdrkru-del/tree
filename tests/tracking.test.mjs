import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  ATTRIBUTION_KEYS,
  getFirstTouchAttribution,
  getMessengerChannel
} from '../src/tracking.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    values
  };
}

test('attribution captures all Direct parameters once and keeps the first touch', () => {
  const storage = memoryStorage();
  const firstUrl = 'https://zelsrez.ru/?utm_source=yandex&utm_medium=cpc&utm_campaign=first&utm_content=ad-1&utm_term=tree&yclid=test123';
  const first = getFirstTouchAttribution(firstUrl, storage);

  assert.deepEqual(Object.keys(first), ATTRIBUTION_KEYS);
  assert.equal(first.yclid, 'test123');
  assert.equal(storage.values.get('tree_site_entry_page'), firstUrl);

  const second = getFirstTouchAttribution('https://zelsrez.ru/prices/?utm_campaign=second&yclid=other', storage);
  assert.deepEqual(second, first);
  assert.equal(JSON.parse(storage.values.get('tree_site_utm')).utm_campaign, 'first');
});

test('attribution works on the current page when storage is unavailable', () => {
  const storage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  };
  assert.deepEqual(
    getFirstTouchAttribution('https://zelsrez.ru/?utm_source=yandex&yclid=test123', storage),
    { utm_source: 'yandex', yclid: 'test123' }
  );
});

test('all supported messengers map to one click_messenger channel', () => {
  assert.equal(getMessengerChannel('https://wa.me/79998081951'), 'whatsapp');
  assert.equal(getMessengerChannel('https://t.me/Romatran'), 'telegram');
  assert.equal(getMessengerChannel('https://max.ru/u/example'), 'max');
  assert.equal(getMessengerChannel('https://web.max.ru/'), 'max');
  assert.equal(getMessengerChannel('#lead-form', 'click_whatsapp'), 'whatsapp');
  assert.equal(getMessengerChannel('tel:+79998081951'), '');
});

test('Metrika is loaded only by the page template and business goals are emitted once', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const templates = readFileSync(new URL('../src/templates.mjs', import.meta.url), 'utf8');

  assert.doesNotMatch(app, /mc\.yandex\.ru\/metrika\/tag\.js/);
  assert.equal([...templates.matchAll(/mc\.yandex\.ru\/metrika\/tag\.js\?id=/g)].length, 1);
  assert.equal([...app.matchAll(/reachGoal\('lead_form',/g)].length, 1);
  assert.equal([...app.matchAll(/reachGoal\('click_phone',/g)].length, 1);
  assert.equal([...app.matchAll(/reachGoal\('click_messenger',/g)].length, 1);
  assert.match(app, /goal !== 'click_phone'/);
  assert.match(app, /goal !== 'click_messenger'/);
});
