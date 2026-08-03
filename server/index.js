const htmlHeaders = {
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
