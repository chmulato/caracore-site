const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const organizationId = 'https://caracore.com.br/#organization';
const websiteId = 'https://caracore.com.br/#website';
const bookId = 'https://eng.caracore.com.br/#book';
const pageTypes = new Set(['WebPage', 'CollectionPage', 'ContactPage']);
const metaPattern = /<meta\b[^>]*>/gi;
const linkPattern = /<link\b[^>]*>/gi;
const attrPattern = /([\w:-]+)\s*=\s*(["'])(.*?)\2/gs;
const schemaPattern = /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi;

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(attrPattern)].map(([, key, , value]) => [key.toLowerCase(), value]));
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function oneMeta(tags, attribute, key, pageUrl) {
  const found = tags
    .map(attributes)
    .filter(tag => tag[attribute] === key);
  assert.equal(found.length, 1, `${pageUrl}: expected one ${key} meta`);
  assert.ok(found[0].content, `${pageUrl}: ${key} content is empty`);
  return decodeHtml(found[0].content);
}

function sitemapPages() {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decodeHtml(url.trim()));
  assert.ok(urls.length > 0, 'sitemap.xml must contain URLs');
  assert.equal(new Set(urls).size, urls.length, 'sitemap.xml must not contain duplicate URLs');
  return urls.map(url => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://caracore.com.br', `${url}: sitemap URL must use the apex host`);
    const relative = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    let file = path.join(root, relative || 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    assert.ok(fs.existsSync(file), `${url}: local page is missing`);
    return { url, file, html: fs.readFileSync(file, 'utf8') };
  });
}

function schemaNodes(page) {
  const blocks = [...page.html.matchAll(schemaPattern)].map(([, json]) => JSON.parse(json));
  assert.equal(blocks.length, 1, `${page.url}: expected one JSON-LD block`);
  assert.equal(blocks[0]['@context'], 'https://schema.org', `${page.url}: schema context`);
  assert.ok(Array.isArray(blocks[0]['@graph']), `${page.url}: expected a JSON-LD graph`);
  return blocks[0]['@graph'];
}

function nodeTypes(node) {
  const value = node['@type'];
  return new Set(Array.isArray(value) ? value : [value]);
}

test('all sitemap pages have canonical, complete and consistent social metadata', () => {
  const pages = sitemapPages();
  for (const page of pages) {
    const metas = [...page.html.matchAll(metaPattern)].map(([tag]) => tag);
    const links = [...page.html.matchAll(linkPattern)].map(([tag]) => attributes(tag));
    const canonical = links
      .filter(tag => (tag.rel || '').toLowerCase() === 'canonical')
      .map(tag => tag.href);
    assert.deepEqual(canonical, [page.url], `${page.url}: canonical must match sitemap URL`);
    assert.equal(oneMeta(metas, 'property', 'og:url', page.url), page.url);

    const description = oneMeta(metas, 'name', 'description', page.url);
    const ogTitle = oneMeta(metas, 'property', 'og:title', page.url);
    assert.equal(oneMeta(metas, 'property', 'og:description', page.url), description);
    assert.equal(oneMeta(metas, 'property', 'og:type', page.url), 'website');
    assert.ok(oneMeta(metas, 'property', 'og:site_name', page.url));
    assert.equal(oneMeta(metas, 'name', 'twitter:card', page.url), 'summary_large_image');
    assert.equal(oneMeta(metas, 'name', 'twitter:title', page.url), ogTitle);
    assert.equal(oneMeta(metas, 'name', 'twitter:description', page.url), description);

    const ogImage = oneMeta(metas, 'property', 'og:image', page.url);
    const twitterImage = oneMeta(metas, 'name', 'twitter:image', page.url);
    assert.equal(twitterImage, ogImage, `${page.url}: OG and Twitter images must match`);
    const imageUrl = new URL(ogImage);
    assert.equal(imageUrl.origin, 'https://caracore.com.br', `${page.url}: social image must use the apex host`);
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(imageUrl.pathname.replace(/^\/+/, '')))),
      `${page.url}: social image is missing locally`);
    assert.doesNotMatch(page.html, /<meta\b[^>]+name=["'](?:robots|googlebot)["'][^>]+content=["'][^"']*\bnoindex\b/i,
      `${page.url}: noindex page must not be in sitemap`);
    assert.doesNotMatch(page.html, /<meta\b[^>]+http-equiv=["']refresh["']/i,
      `${page.url}: redirect page must not be in sitemap`);
  }
});

test('all sitemap pages expose one canonical page node and resolve shared entities', () => {
  const pages = sitemapPages();
  const declaredIds = new Set();
  const referenceIds = [];
  const nodesByUrl = new Map();

  for (const page of pages) {
    const schema = schemaNodes(page);
    const titleMatch = page.html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
    const languageMatch = page.html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);
    assert.ok(titleMatch, `${page.url}: title is missing`);
    assert.ok(languageMatch, `${page.url}: html lang is missing`);
    const title = decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').trim());
    const language = languageMatch[1];
    const description = [...page.html.matchAll(metaPattern)]
      .map(([tag]) => attributes(tag))
      .find(tag => tag.name === 'description').content;
    const descriptionText = decodeHtml(description);
    const pageNodes = schema.filter(node => [...nodeTypes(node)].some(type => pageTypes.has(type)));
    assert.equal(pageNodes.length, 1, `${page.url}: expected one WebPage/CollectionPage/ContactPage node`);
    const pageNode = pageNodes[0];
    assert.equal(pageNode['@id'], `${page.url}#webpage`);
    assert.equal(pageNode.url, page.url);
    assert.equal(pageNode.name, title);
    assert.equal(pageNode.description, descriptionText);
    assert.equal(pageNode.inLanguage, language);
    assert.deepEqual(pageNode.isPartOf, { '@id': websiteId });
    assert.deepEqual(pageNode.publisher, { '@id': organizationId });

    for (const node of schema) {
      if (node['@id']) {
        assert.ok(!declaredIds.has(node['@id']), `${page.url}: duplicate graph @id ${node['@id']}`);
        declaredIds.add(node['@id']);
      }
      for (const field of ['publisher', 'isPartOf', 'mainEntity', 'about']) {
        const reference = node[field];
        if (reference && reference['@id']) referenceIds.push([page.url, reference['@id']]);
      }
    }
    nodesByUrl.set(page.url, schema);
  }

  const home = nodesByUrl.get('https://caracore.com.br/');
  assert.ok(home.some(node => node['@id'] === organizationId && nodeTypes(node).has('Organization')));
  assert.ok(home.some(node => node['@id'] === websiteId && nodeTypes(node).has('WebSite')));
  assert.ok(home.some(node => node['@id'] === bookId && nodeTypes(node).has('Book')));
  assert.deepEqual(
    home.find(node => node['@type'] === 'WebSite').publisher,
    { '@id': organizationId },
  );

  for (const [pageUrl, reference] of referenceIds) {
    assert.ok(declaredIds.has(reference), `${pageUrl}: unresolved schema reference ${reference}`);
  }
});
