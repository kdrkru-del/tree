import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

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

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const h1Count = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1Count !== 1) problems.push(path.relative(root, file) + ' has ' + h1Count + ' h1 tags');

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

  if (/Lorem|lorem|undefined|\[object Object\]|NaN/.test(html)) problems.push(path.relative(root, file) + ' contains placeholder/debug text');
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Checked ' + htmlFiles.length + ' HTML files');
