import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('app.js includes abandoned input capture watcher and handles blur and visibility', () => {
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  // Verify functions and event listeners exist
  assert.match(source, /onPhoneEntered/);
  assert.match(source, /sendAbandoned/);
  assert.match(source, /abandoned:\s*true/);
  assert.match(source, /reachGoal\('lead_abandoned_captured'/);
  assert.match(source, /tree_abandoned_/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /form\.dataset\.submitted\s*=\s*'true'/);
});

test('lead-worker.mjs handles abandoned leads with prominent title', () => {
  const workerSource = readFileSync(new URL('../worker/lead-worker.mjs', import.meta.url), 'utf8');

  assert.match(workerSource, /isAbandoned/);
  assert.match(workerSource, /БРОШЕННЫЙ ВВОД/);
});
