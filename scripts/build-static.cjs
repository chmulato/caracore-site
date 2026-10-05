const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  cwd: root, encoding: 'utf8',
}).split('\0').filter(Boolean);
const baselineFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], {
  cwd: root, encoding: 'utf8',
}).trim().split('\n'));
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const errors = [];
const warnings = [];
let checked = 0;

function checkResource(file, value) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return;
  let resource;
  try {
    resource = decodeURIComponent(value.replace(/&amp;/g, '&').split(/[?#]/)[0]);
  } catch (error) {
    errors.push(`${file}: invalid resource URL ${value}: ${error.message}`);
    return;
  }
  if (!resource) return;
  const target = resource.startsWith('/')
    ? path.join(root, resource)
    : path.resolve(root, path.dirname(file), resource);
  checked++;
  if (!fs.existsSync(target)) errors.push(`${file}: missing resource ${value}`);
}

for (const file of files) {
  if (!/\.(?:html|css)$/i.test(file) || /^(?:infra|node_modules)\//.test(file)) continue;
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (/\.html$/i.test(file)) {
    for (const tag of text.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(img|script|link|source|video|audio|iframe)\b([^>]+)>/gi)) {
      const attributes = Object.fromEntries([...tag[2].matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)]
        .map(match => [match[1].toLowerCase(), match[2]]));
      const name = tag[1].toLowerCase();
      if (name === 'link' && !/\b(?:stylesheet|icon|preload|modulepreload|prefetch)\b/.test(attributes.rel || '')) continue;
      checkResource(file, attributes[name === 'link' ? 'href' : 'src']);
      checkResource(file, attributes.poster);
      if (attributes.srcset && !attributes.srcset.startsWith('data:')) {
        for (const entry of attributes.srcset.split(',')) checkResource(file, entry.trim().split(/\s+/)[0]);
      }
    }
  } else {
    for (const match of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*["']?([^)'"]+)["']?\s*\)/gi)) {
      checkResource(file, match[1].trim());
    }
  }
}

for (const file of files.filter(file => /\.(?:css|js)$/i.test(file))) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of text.matchAll(/sourceMappingURL=([^\s*]+)/g)) {
    if (!match[1].startsWith('data:') && !fs.existsSync(path.resolve(root, path.dirname(file), match[1]))) {
      warnings.push(`${file}: optional source map absent (${match[1]})`);
    }
  }
}

const scripts = files.filter(file => /\.(?:js|cjs)$/i.test(file));
for (const file of scripts) {
  try {
    execFileSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    if (!error.stderr) throw error;
    const current = fs.readFileSync(path.join(root, file));
    const baseline = baselineFiles.has(file)
      ? execFileSync('git', ['show', `HEAD:${file}`], { cwd: root })
      : null;
    const details = error.stderr.trim();
    if (baseline && current.equals(baseline)) {
      warnings.push(`${file}: pre-existing JavaScript syntax error (unchanged from HEAD)\n${details}`);
    } else {
      errors.push(`${file}: JavaScript syntax error\n${details}`);
    }
  }
}

if (!Array.isArray(config.headers)) errors.push('vercel.json: headers must be an array');
if (config.rewrites?.length) errors.push('Unexpected rewrites: this is a multipage static site');
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

execFileSync(process.execPath, ['--test', 'scripts/tests/cdn-assets.test.cjs'], {
  cwd: root, stdio: 'inherit',
});
console.log(`Static build passed: ${files.filter(file => /\.html$/i.test(file)).length} HTML files; ${checked} resource references; ${scripts.length} JavaScript syntax checks.`);
console.log('Publish the existing static root (output directory "."); no bundling or runtime dependencies required.');
