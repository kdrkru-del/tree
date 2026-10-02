import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

const execFileAsync = promisify(execFile);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = 'C:\\Users\\roman\\.gemini\\antigravity\\brain\\9cff0a7d-0792-4b8e-98d7-4a497f412a31\\screenshots';

const pages = [
  { slug: 'spil-derevev', name: 'spil' },
  { slug: 'udalenie-avariynyh-derevev', name: 'emergency' },
  { slug: 'raschistka-uchastkov', name: 'clearing' },
  { slug: 'obrezka-derevev', name: 'pruning' },
  { slug: 'izmelchenie-vetok', name: 'chipping' },
  { slug: 'raschistka-prosek-lep', name: 'lep' }
];

async function capture(url, outPath, width, height) {
  const tempUserDir = await mkdtemp(path.join(tmpdir(), 'edge-shot-'));
  try {
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${tempUserDir}`,
      `--window-size=${width},${height}`,
      `--screenshot=${outPath}`,
      url
    ];
    await execFileAsync(edgePath, args, { timeout: 15000 });
  } catch (err) {
    // If screenshot was written, ignore non-zero exit code or timeout
    if (!existsSync(outPath)) {
      console.error(`Failed to capture ${outPath}:`, err.message);
    }
  } finally {
    try {
      await rm(tempUserDir, { recursive: true, force: true });
    } catch {}
  }
}

console.log('Starting screenshot captures...');
for (const page of pages) {
  const url = `http://127.0.0.1:8787/${page.slug}/`;
  const deskFile = path.join(outDir, `${page.name}-desktop.png`);
  const mobFile = path.join(outDir, `${page.name}-mobile.png`);

  console.log(`Capturing ${page.name} desktop (1440x900)...`);
  await capture(url, deskFile, 1440, 900);
  if (existsSync(deskFile)) {
    console.log(`  ✓ ${page.name}-desktop: ${statSync(deskFile).size} bytes`);
  }

  console.log(`Capturing ${page.name} mobile (390x844)...`);
  await capture(url, mobFile, 390, 844);
  if (existsSync(mobFile)) {
    console.log(`  ✓ ${page.name}-mobile: ${statSync(mobFile).size} bytes`);
  }
}

console.log('All screenshots completed.');
