import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewsSection } from '../src/templates.mjs';
import { reviews } from '../src/reviews.mjs';

test('блок не выводится без отзывов или без имени автора', () => {
  assert.equal(reviewsSection([]), '');
  assert.equal(reviewsSection([{ text: 'без имени' }]), '');
});

test('все опубликованные отзывы имеют автора, место, услугу и текст', () => {
  assert.ok(reviews.length >= 1);
  for (const r of reviews) {
    assert.ok(r.name && r.place && r.service && r.text, 'неполная запись: ' + r.name);
  }
  const html = reviewsSection();
  assert.match(html, /id="reviews"/);
  assert.equal((html.match(/class="review-card"/g) || []).length, reviews.length);
});

test('при наличии отзыва блок выводится и экранирует HTML', () => {
  const html = reviewsSection([{ name: 'Тест', place: 'Одинцово', service: 'Спил', date: '2026-11', text: 'Хорошо <b>очень</b>' }]);
  assert.match(html, /id="reviews"/);
  assert.match(html, /Одинцово · Спил · 2026-11/);
  assert.doesNotMatch(html, /<b>очень<\/b>/);
  assert.match(html, /&lt;b&gt;очень&lt;\/b&gt;/);
});
