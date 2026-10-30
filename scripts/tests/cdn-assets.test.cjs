const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html');

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

test('404 remains an error page without automatic navigation or heavy resources', () => {
  const page = read('404.html');
  assert.doesNotMatch(page, /<script\b|location\s*\.|http-equiv=["']refresh/i);
  assert.doesNotMatch(page, /<img\b|<iframe\b|<link[^>]+stylesheet/i);
  assert.match(page, /name="robots" content="noindex"/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/secure\/index\.html"/);
});

test('known missing legacy pages are declared once in _redirects and not linked', () => {
  const rules = read('_redirects').split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
  for (const [from, to] of [
    ['/sala/redes/retro/articles.html', 'https://retro.caracore.com.br/'],
    ['/wiki/projetos-overview.html', 'https://wiki.caracore.com.br/projetos-overview.html'],
  ]) {
    assert.ok(rules.some(rule => rule.from === from && rule.to === to && rule.status === '301'),
      `Missing ${from} -> ${to} in _redirects`);
  }
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

test('canonical catalog feeds portfolio and ecosystem; sites plans live in sites.html', () => {
  for (const file of ['portfolio.html', 'ecosistema.html']) {
    const page = read(file);
    assert.match(page, /assets\/css\/catalog\.css/);
    assert.match(page, /data-cc-catalog\b/);
    assert.match(page, /data-cc-catalog-legend/);
    assert.match(page, /assets\/js\/catalog-data\.js" defer>/);
    assert.match(page, /assets\/js\/catalog\.js" defer>/);
    assert.match(page, /href="sites\.html"/);
  }
  assert.match(read('assets/js/catalog-data.js'), /CARACORE_CATALOG\s*=/);
  const sites = read('sites.html');
  for (const price of ['R$ 990', 'R$ 1.790', 'R$ 2.990']) {
    assert.ok(sites.includes(price), `Missing plan price ${price} in sites.html`);
  }
  assert.match(home, /href="sites\.html"/);
  assert.doesNotMatch(home, /id="mostrar-planos"|id="fechar-planos"/);
});

test('local preview serves files and preserves real 404s without emulated host rules', async () => {
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
    assert.equal(logo.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
    assert.equal((await logo.arrayBuffer()).byteLength, 117882);
    const vendor = await fetch(`${base}/css/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2`, { method: 'HEAD' });
    assert.equal(vendor.status, 200);
    const homePage = await fetch(`${base}/`);
    assert.equal(homePage.status, 200);
    const secure = await fetch(`${base}/secure/index.html`);
    assert.equal(secure.status, 200);
    const missing = await fetch(`${base}/missing-validation-route`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
    assert.doesNotMatch(await missing.text(), /<script\b|location\s*\./);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
