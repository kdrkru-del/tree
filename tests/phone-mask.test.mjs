import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const match = source.match(/function formatPhone\(val\) \{[\s\S]*?\r?\n    \}\r?\n/);
assert.ok(match, 'formatPhone не найдена в src/app.js');
const formatPhone = new Function(`${match[0]}; return formatPhone;`)();

// Имитация набора по одному символу в поле, которое при фокусе заполняется «+7 (».
function typeInto(text, value = '+7 (') {
  for (const ch of text) value = formatPhone(value + ch);
  return value;
}

const EXPECTED = '+7 (999) 808-19-51';

test('набор с ведущей 8 даёт верный номер', () => {
  assert.equal(typeInto('89998081951'), EXPECTED);
});

test('набор с ведущей 7 даёт верный номер', () => {
  assert.equal(typeInto('79998081951'), EXPECTED);
});

test('набор без ведущей цифры и с +7 даёт верный номер', () => {
  assert.equal(typeInto('9998081951'), EXPECTED);
  assert.equal(typeInto('+79998081951'), EXPECTED);
});

test('вставка номера в любом формате даёт верный номер', () => {
  assert.equal(formatPhone('89998081951'), EXPECTED);
  assert.equal(formatPhone('+79998081951'), EXPECTED);
  assert.equal(formatPhone('8 (999) 808-19-51'), EXPECTED);
  assert.equal(formatPhone('+7 (89998081951'), EXPECTED);
  assert.equal(formatPhone('+7 (+79998081951'), EXPECTED);
});

test('форматирование идемпотентно и обрезает лишние цифры', () => {
  assert.equal(formatPhone(EXPECTED), EXPECTED);
  assert.equal(formatPhone('+7 (999) 808-19-519999'), EXPECTED);
});

test('пустое значение и одинокая 8 после префикса не ломают поле', () => {
  assert.equal(formatPhone(''), '');
  assert.equal(formatPhone('+7 (8'), '+7 (');
});
