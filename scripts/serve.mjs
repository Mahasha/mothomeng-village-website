import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const clean = pathname === '/' ? '/index.html' : pathname.replace(/\/$/, '') || '/index.html';
    let filePath = normalize(join(root, clean));
    if (!filePath.startsWith(root)) throw new Error('Invalid path');
    try { if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html'); }
    catch { if (!extname(filePath)) filePath += '.html'; }
    const data = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  } catch {
    const data = await readFile(join(root, '404.html'));
    response.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    response.end(data);
  }
}).listen(port, () => console.log(`Mothomeng preview: http://localhost:${port}`));
