import { mkdir, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalPages, regions, services, site } from '../src/data.mjs';
import {
  contactsPage,
  faqPage,
  homePage,
  legalPage,
  notFoundPage,
  pagePath,
  pricesPage,
  regionPage,
  servicePage,
  worksPage
} from '../src/templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

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

  await copyFile(path.join(root, 'src', 'styles.css'), path.join(dist, 'assets', 'styles.css'));
  await copyFile(path.join(root, 'src', 'app.js'), path.join(dist, 'assets', 'app.js'));

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
  await add('404', notFoundPage());

  for (const service of services) {
    await add(service.slug, servicePage(service));
  }

  for (const region of regions) {
    await add(region.slug, regionPage(region));
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
  await writeFile(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
    name: site.brand,
    short_name: 'Деревья',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf7ef',
    theme_color: '#143d2b',
    lang: 'ru'
  }, null, 2), 'utf8');

  console.log(`Built ${routes.length} pages into ${path.relative(root, dist)}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
