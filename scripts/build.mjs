import { mkdir, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalPages, services, site } from '../src/data.mjs';
import {
  contactsPage,
  faqPage,
  homePage,
  legalPage,
  notFoundPage,
  pagePath,
  pricesPage,
  servicePage,
  worksPage
} from '../src/templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const staticWorker = `const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8'
};

function assetPath(pathname) {
  if (pathname.endsWith('/')) return pathname + 'index.html';
  if (!pathname.split('/').pop().includes('.')) return pathname + '/index.html';
  return pathname;
}

async function fetchAsset(request, env, pathname, status = 200) {
  const url = new URL(request.url);
  url.pathname = pathname;
  const response = await env.ASSETS.fetch(new Request(url, request));
  if (response.status === 404) return response;
  const headers = new Headers(response.headers);
  if (pathname.endsWith('.html')) headers.set('content-type', htmlHeaders['content-type']);
  return new Response(response.body, { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await fetchAsset(request, env, assetPath(url.pathname));
    if (response.status !== 404) return response;
    const notFound = await fetchAsset(request, env, '/404/index.html', 404);
    return notFound.status === 404 ? new Response('Not found', { status: 404 }) : notFound;
  }
};
`;

async function write(route, html) {
  const file = path.join(dist, pagePath(route));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function build() {
  if (!dist.startsWith(root)) {
    throw new Error('Refusing to write outside project root');
  }

  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, 'assets'), { recursive: true });
  await mkdir(path.join(dist, 'server'), { recursive: true });

  await copyFile(path.join(root, 'src', 'styles.css'), path.join(dist, 'assets', 'styles.css'));
  await copyFile(path.join(root, 'src', 'app.js'), path.join(dist, 'assets', 'app.js'));
  await copyFile(path.join(root, 'src', 'lead-delivery.mjs'), path.join(dist, 'assets', 'lead-delivery.mjs'));
  for (const asset of [
    'logo-zelenyi-srez.png',
    'favicon-32.png',
    'favicon-192.png',
    'favicon-512.png',
    'apple-touch-icon.png'
  ]) {
    await copyFile(path.join(root, 'assets', asset), path.join(dist, 'assets', asset));
  }
  await copyFile(path.join(root, 'assets', 'favicon.ico'), path.join(dist, 'favicon.ico'));
  await writeFile(path.join(dist, 'server', 'index.js'), staticWorker, 'utf8');

  const routes = [];
  const add = async (slug, html) => {
    await write(slug, html);
    routes.push(`/${slug ? `${slug.replace(/^\/|\/$/g, '')}/` : ''}`);
  };

  await add('', homePage());
  await add('prices', pricesPage());
  await add('works', worksPage());
  await add('faq', faqPage());
  await add('contacts', contactsPage());
  const notFoundHtml = notFoundPage();
  await write('404', notFoundHtml);
  await writeFile(path.join(dist, '404.html'), notFoundHtml, 'utf8');

  for (const service of services) {
    await add(service.slug, servicePage(service));
  }

  for (const page of legalPages) {
    await add(page.slug, legalPage(page));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${xmlEscape(site.baseUrl + route)}</loc></url>`).join('\n')}
</urlset>
`;

  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${site.baseUrl}/sitemap.xml
`, 'utf8');
  await writeFile(path.join(dist, 'CNAME'), 'zelsrez.ru\n', 'utf8');
  await writeFile(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
    name: site.brand,
    short_name: 'Деревья',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf7ef',
    theme_color: '#143d2b',
    icons: [
      { src: '/assets/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/favicon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    lang: 'ru'
  }, null, 2), 'utf8');

  console.log(`Built ${routes.length} pages into ${path.relative(root, dist)}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
