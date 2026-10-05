const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
};

function createPreviewServer() {
  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end('Invalid URL');
      return;
    }
    for (const rule of config.headers) {
      const prefix = rule.source.endsWith('/:path*') ? rule.source.slice(0, -7) : null;
      if (rule.source === '/(.*)' || rule.source === pathname || (prefix && pathname.startsWith(`${prefix}/`))) {
        for (const header of rule.headers) res.setHeader(header.key, header.value);
      }
    }
    const redirect = config.redirects.find(rule => rule.source === pathname);
    if (redirect) {
      res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination }).end();
      return;
    }
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (/\/(?:\.|node_modules(?:\/|$))/.test(pathname)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    let status = 200;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      status = 404;
      file = path.join(root, '404.html');
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Content-Length', fs.statSync(file).size);
    if (!res.hasHeader('Cache-Control') || status === 404) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.writeHead(status);
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).on('error', error => {
      console.error(`Preview read failed: ${file}: ${error.message}`);
      res.destroy(error);
    }).pipe(res);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  createPreviewServer()
    .on('error', error => { console.error(error); process.exitCode = 1; })
    .listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}`));
}

module.exports = { createPreviewServer };
