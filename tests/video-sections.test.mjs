import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { clearingVideos, complexVideos, experienceStats, workVideos } from '../src/data.mjs';
import { homePage } from '../src/templates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allVideos = [...clearingVideos, ...complexVideos];

test('video sections contain 4 clearing and 8 unique complex-work videos', () => {
  assert.equal(clearingVideos.length, 4);
  assert.equal(complexVideos.length, 8);
  assert.equal(workVideos.length, 12);

  const mediaKeys = allVideos.map((video) => video.src);
  assert.equal(new Set(mediaKeys).size, 12);
  assert.deepEqual(
    new Set(mediaKeys),
    new Set([
      '/assets/WhatsApp Video 2026-08-11 at 14.26.53.mp4',
      '/assets/work-video-1.mp4',
      '/assets/work-video-3.mp4',
      '/assets/work-video-5.mp4',
      '/assets/videos/clearing/рас2.mp4',
      '/assets/videos/complex/без 6.mp4',
      '/assets/videos/complex/без 7.mp4',
      '/assets/videos/complex/без1.mp4',
      '/assets/videos/complex/без4.mp4',
      '/assets/videos/complex/без5.mp4',
      '/assets/videos/complex/без7.mp4',
      '/assets/videos/complex/bez2-vertical.mp4'
    ])
  );
});

test('clearing and complex sections use work-appropriate videos', () => {
  assert.deepEqual(
    clearingVideos.map((video) => video.caption),
    [
      'Сокращаем объём веток после спила',
      'Расчищаем заросшую территорию техникой',
      'Освобождаем участок от поросли',
      'Удаляем пни после расчистки'
    ]
  );
  assert.equal(complexVideos.some((video) => video.src.endsWith('/bez2-vertical.mp4')), true);
  assert.equal(complexVideos.some((video) => /пн[яе]|измельчение веток|удаление поросли/i.test(video.caption)), false);
});

test('every video has a short editable caption and every local asset exists', () => {
  for (const video of allVideos) {
    const words = video.caption.trim().split(/\s+/);
    assert.ok(words.length >= 2 && words.length <= 8, `Unexpected caption length: ${video.caption}`);
    assert.ok(video.title);
    assert.ok(video.description);
    assert.ok(video.marker);

    assert.equal(video.type, 'local');
    assert.ok(video.src.startsWith('/assets/'));
    assert.ok(existsSync(path.join(root, video.src.slice(1))), `Missing video: ${video.src}`);

    if (video.poster) {
      assert.ok(video.poster.startsWith('/assets/video-posters/'));
      assert.ok(existsSync(path.join(root, video.poster.slice(1))), `Missing poster: ${video.poster}`);
    }
  }
});

test('home page renders proof, useful captions, deferred videos, safety steps, and form CTAs', () => {
  const html = homePage();
  const cards = [...html.matchAll(/<article class="video-card">([\s\S]*?)<\/article>/g)].map((match) => match[1]);

  assert.equal(cards.length, 12);
  assert.equal((html.match(/class="video-caption"/g) || []).length, 12);
  assert.equal((html.match(/class="video-marker"/g) || []).length, 12);
  assert.equal((html.match(/<video class="work-video" controls/g) || []).length, 12);
  assert.equal((html.match(/preload="none"/g) || []).length, 12);
  assert.equal((html.match(/preload="metadata"/g) || []).length, 0);
  assert.equal((html.match(/poster="\/assets\/video-posters\//g) || []).length, 12);
  assert.doesNotMatch(html, /youtube(?:-nocookie)?\.com|data-youtube-video=/);
  assert.equal((html.match(/class="video-cta"/g) || []).length, 2);

  for (const card of cards) {
    assert.ok(card.indexOf('class="video-media"') < card.indexOf('class="video-caption"'));
  }

  assert.match(html, /10 лет работаем с деревьями любой сложности/);
  assert.match(html, /Более 1000/);
  assert.match(html, /Посмотрите, как мы работаем на сложных объектах/);
  assert.match(html, /Расчистка и подготовка территории/);
  assert.match(html, /Удаление деревьев в сложных условиях/);
  assert.match(html, /Как мы снижаем риск повреждений/);
  const safetySteps = html.match(/<div class="video-safety-steps">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.equal((safetySteps.match(/<article>/g) || []).length, 5);
  assert.match(html, /Похожая ситуация на вашем участке\?/);
  assert.match(html, />Рассчитать стоимость<\/a>/);
  assert.match(html, /class="video-cta"[\s\S]*?href="#lead-form"/);
});

test('trust figures remain explicit and video markers are varied', () => {
  assert.deepEqual(
    experienceStats.map(({ value, label }) => [value, label]),
    [
      ['10 лет', 'практического опыта'],
      ['Более 1000', 'выполненных заказов'],
      ['Москва + МО', 'выезжаем на объекты'],
      ['Сложные объекты', 'работаем рядом с домами, крышами и заборами']
    ]
  );
  assert.equal(new Set(allVideos.map((video) => video.marker)).size, 12);
});
