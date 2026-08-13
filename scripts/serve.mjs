import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 8787);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return path.join(root, normalized);
}

async function resolveFile(urlPath) {
  let file = safePath(urlPath);
  if (!file.startsWith(root)) return path.join(root, '404', 'index.html');
  if (existsSync(file)) {
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, 'index.html');
  } else if (!path.extname(file)) {
    file = path.join(file, 'index.html');
  }
  return existsSync(file) ? file : path.join(root, '404', 'index.html');
}

const server = http.createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url || '/');
    const ext = path.extname(file);
    res.writeHead(file.includes(`${path.sep}404${path.sep}`) && !(req.url || '').includes('/404') ? 404 : 200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600'
    });
    createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.message);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local site: http://127.0.0.1:${port}/`);
});
