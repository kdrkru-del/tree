import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { site } from '../src/data.mjs';

const root = path.resolve('dist');
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(file);
  }
}

function routeToFile(href) {
  if (href === '/manifest.webmanifest' || href === '/sitemap.xml' || href === '/robots.txt') return path.join(root, href.slice(1));
  const withoutHash = href.split('#')[0].split('?')[0];
  let target = path.join(root, withoutHash.replace(/^\//, ''));
  if (withoutHash.endsWith('/')) target = path.join(target, 'index.html');
  if (!path.extname(target)) target = path.join(target, 'index.html');
  return target;
}

walk(root);
const problems = [];
for (const asset of [
  'favicon.ico',
  'assets/favicon-32.png',
  'assets/favicon-192.png',
  'assets/favicon-512.png',
  'assets/apple-touch-icon.png'
]) {
  if (!existsSync(path.join(root, asset))) problems.push('missing favicon asset ' + asset);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relativeFile = path.relative(root, file);
  const h1Count = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1Count !== 1) problems.push(relativeFile + ' has ' + h1Count + ' h1 tags');

  const metrikaLoaderCount = [...html.matchAll(/mc\.yandex\.ru\/metrika\/tag\.js\?id=/g)].length;
  const metrikaInitCount = [...html.matchAll(/ym\(\d+,\s*'init'/g)].length;
  const metrikaNoscriptCount = [...html.matchAll(/mc\.yandex\.ru\/watch\/\d+/g)].length;
  const metrikaIds = new Set([
    ...html.matchAll(/mc\.yandex\.ru\/(?:metrika\/tag\.js\?id=|watch\/)(\d+)/g)
  ].map((match) => match[1]));
  if (metrikaLoaderCount !== 1 || metrikaInitCount !== 1 || metrikaNoscriptCount !== 1) {
    problems.push(`${relativeFile} must initialize exactly one Metrika counter`);
  }
  if (metrikaIds.size !== 1 || !metrikaIds.has(String(site.metrikaId))) {
    problems.push(`${relativeFile} uses unexpected Metrika counter IDs: ${[...metrikaIds].join(', ')}`);
  }

  for (const match of html.matchAll(/href=\"(\/[^\"]*)\"/g)) {
    const href = match[1];
    if (href.startsWith('//') || href.startsWith('/assets/')) continue;
    const target = routeToFile(href);
    if (!existsSync(target)) problems.push(path.relative(root, file) + ' links to missing ' + href);
  }

  for (const match of html.matchAll(/href=\"(#[^\"]*)\"/g)) {
    const id = match[1].slice(1);
    if (id && !html.includes('id=\"' + id + '\"')) problems.push(path.relative(root, file) + ' links to missing anchor #' + id);
  }

  if (/Lorem|lorem|undefined|\[object Object\]|NaN/.test(html)) problems.push(relativeFile + ' contains placeholder/debug text');
  if (!html.includes('rel="icon"') || !html.includes('rel="apple-touch-icon"')) {
    problems.push(relativeFile + ' is missing favicon links');
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Checked ' + htmlFiles.length + ' HTML files');
