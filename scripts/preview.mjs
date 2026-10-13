import http from 'node:http';
import fs from 'node:fs/promises';

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  const cover = /^\/covers\/wasm-(?:pc|emu|flash)-[a-z0-9-]+\.webp$/.test(path);
  const portable = path === '/edy-games-catalogo.html';
  if (path !== '/' && !cover && !portable) { res.writeHead(404); res.end('Not found'); return; }
  const file = cover ? 'publish' + path : portable ? 'outputs/edy-games-catalogo.html' : 'publish/index.html';
  try {
    const content = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': cover ? 'image/webp' : 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Asset unavailable'); }
});
server.listen(55075, '127.0.0.1', () => console.log('PREVIEW http://127.0.0.1:55075'));
