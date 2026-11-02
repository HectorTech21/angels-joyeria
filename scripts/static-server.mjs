import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
export function serve({ preview = false } = {}) {
  const root = resolve(preview ? 'dist' : '.');
  const publicRoot = resolve('public');
  const port = Number(process.env.PORT) || (preview ? 4173 : 5173);
  const server = createServer(async (request, response) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/') pathname = '/index.html';
      if (!preview && !/^\/(index\.html|src\/|assets\/|fonts\/|vendor\/|favicon\.svg)/.test(pathname)) { response.writeHead(404).end('Not found'); return; }
      const sourceRoot = !preview && /^\/(assets|fonts|vendor|favicon\.svg)/.test(pathname) ? publicRoot : root;
      const file = resolve(sourceRoot, `.${pathname}`);
      if (!file.startsWith(sourceRoot + sep)) { response.writeHead(403).end(); return; }
      const info = await stat(file);
      if (!info.isFile()) throw new Error('Not a file');
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(file));
    } catch { response.writeHead(404).end('Not found'); }
  });
  server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
  return server;
}
