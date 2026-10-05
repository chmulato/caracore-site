const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html');
const config = JSON.parse(read('vercel.json'));

test('both logo placements use one hashed WebP and a smaller PNG fallback', () => {
  const pictures = [...home.matchAll(/<picture>([\s\S]*?)<\/picture>/g)];
  assert.equal(pictures.length, 2);
  for (const [, picture] of pictures) {
    assert.match(picture, /<source srcset="\/assets\/images\/logo_branca\.[a-f0-9]{12}\.webp" type="image\/webp">/);
    assert.match(picture, /<img src="\/assets\/images\/logo_branca\.[a-f0-9]{12}\.png" width="1024" height="1536"/);
  }
  assert.doesNotMatch(home, /(?:src|srcset)=["'](?:\/)?assets\/images\/logo_branca\.png/);
});

test('immutable logo names match their content and stay below bandwidth budgets', () => {
  const names = [...new Set([...home.matchAll(/\/assets\/images\/logo_branca\.[a-f0-9]{12}\.(?:webp|png)/g)].map(match => match[0]))];
  assert.equal(names.length, 2);
  for (const name of names) {
    const bytes = fs.readFileSync(path.join(root, name));
    const digest = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    assert.ok(name.includes(`.${digest}.`), `Stale hash in ${name}`);
    assert.ok(bytes.length < (name.endsWith('.webp') ? 130000 : 500000));
    const rule = config.headers.find(rule => rule.source === name);
    assert.ok(rule, `Missing cache rule for ${name}`);
    assert.ok(rule.headers.some(header => header.key === 'Cache-Control'
      && header.value === 'public, max-age=31536000, immutable'));
  }
});

test('legacy logo URLs remain valid and optimized', () => {
  for (const name of ['assets/images/logo.png', 'images/logo.png', 'assets/images/logo_branca.png']) {
    const bytes = fs.readFileSync(path.join(root, name));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.ok(bytes.length < (name.includes('branca') ? 500000 : 10000));
  }
  assert.deepEqual(fs.readFileSync(path.join(root, 'assets/images/logo.png')),
    fs.readFileSync(path.join(root, 'images/logo.png')));
});

test('mutable vendor caching is bounded and never immutable; HTML is not long-cached', () => {
  for (const source of ['/css/vendor/:path*', '/js/vendor/:path*']) {
    const rule = config.headers.find(rule => rule.source === source);
    assert.ok(rule);
    assert.ok(rule.headers.some(header => header.key === 'Cache-Control' && header.value === 'public, max-age=86400'));
  }
  assert.ok(config.headers.filter(rule => rule.headers.some(header => header.key === 'Cache-Control'))
    .every(rule => rule.source.startsWith('/assets/images/') || rule.source.startsWith('/images/')
      || rule.source.startsWith('/css/vendor/') || rule.source.startsWith('/js/vendor/')));
});

test('404 remains an error page without automatic navigation or heavy resources', () => {
  const page = read('404.html');
  assert.doesNotMatch(page, /<script\b|location\s*\.|http-equiv=["']refresh/i);
  assert.doesNotMatch(page, /<img\b|<iframe\b|<link[^>]+stylesheet/i);
  assert.match(page, /name="robots" content="noindex"/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/secure\/index\.html"/);
});

test('known missing legacy pages redirect once to canonical domains', () => {
  assert.deepEqual(config.redirects, [
    { source: '/sala/redes/retro/articles.html', destination: 'https://retro.caracore.com.br/', permanent: true },
    { source: '/wiki/projetos-overview.html', destination: 'https://wiki.caracore.com.br/projetos-overview.html', permanent: true },
  ]);
  for (const file of ['aligned/en/articles.html', 'aligned/it/articles.html', 'publications/livros/apostila_ms365.html', 'handbook/HANDBOOK.html']) {
    assert.doesNotMatch(read(file), /https:\/\/www\.caracore\.com\.br\/(?:sala\/redes\/retro\/articles\.html|wiki\/projetos-overview\.html)/);
  }
  assert.doesNotMatch(read('sitemap.xml'), /https:\/\/www\.caracore\.com\.br\/sala\/redes\/retro\/articles\.html/);
  for (const file of ['aligned/en/articles.html', 'aligned/it/articles.html', 'sitemap.xml']) {
    assert.doesNotMatch(read(file), /https:\/\/retro\.caracore\.com\.br\/articles\.html/);
  }
});

test('home loads Bootstrap once, declares one favicon and contains no network polling', () => {
  assert.equal((home.match(/<script[^>]+src="[^"]*bootstrap\.bundle\.min\.js"/g) || []).length, 1);
  assert.equal((home.match(/<link[^>]+rel="(?:shortcut )?icon"/g) || []).length, 1);
  assert.doesNotMatch(home, /location\s*\.\s*reload|setInterval\s*\(|http-equiv=["']refresh|rel=["'](?:prefetch|preload)|serviceWorker/);
  assert.match(home, /rel="canonical" href="https:\/\/www\.caracore\.com\.br\/"/);
  assert.match(home, /property="og:image" content="https:\/\/www\.caracore\.com\.br\/assets\/images\/logo\.png"/);
});

test('local preview serves cache headers, preserves real 404s and redirects legacy links once', async () => {
  const { createPreviewServer } = require('../preview-static.cjs');
  const server = createPreviewServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const logo = await fetch(`${base}/assets/images/logo_branca.65d940959999.webp`);
    assert.equal(logo.status, 200);
    assert.equal(logo.headers.get('content-type'), 'image/webp');
    assert.equal(logo.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    assert.equal((await logo.arrayBuffer()).byteLength, 117882);
    const vendor = await fetch(`${base}/css/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2`, { method: 'HEAD' });
    assert.equal(vendor.status, 200);
    assert.equal(vendor.headers.get('cache-control'), 'public, max-age=86400');
    const missing = await fetch(`${base}/missing-validation-route`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
    assert.doesNotMatch(await missing.text(), /<script\b|location\s*\./);
    for (const rule of config.redirects) {
      const response = await fetch(base + rule.source, { redirect: 'manual' });
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), rule.destination);
    }
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
