/* Busca de rótulos e termos no site da matriz (uso local, não publicado). */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const alvos = [
  'index.html',
  'portfolio.html',
  'ecosistema.html',
  'planning.html',
  'assets/js/planning-data.js',
  'assets/js/planning.js'
];

const padroes = [
  /desenvolvimento de sites/i,
  /essencial/i,
  /profissional/i,
  /premium/i,
  /990/,
  /1\.790/,
  /2\.990/,
  /planos de sites/i,
  /<footer/i,
  /<\/main>/,
  /<\/body>/,
  /onze/i,
  /funding/i
];

const saida = [];
for (const rel of alvos) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    saida.push(`${rel}: ARQUIVO AUSENTE`);
    continue;
  }
  const linhas = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  linhas.forEach((linha, indice) => {
    for (const padrao of padroes) {
      if (padrao.test(linha)) {
        saida.push(`${rel}:${indice + 1}: ${linha.trim().slice(0, 220)}`);
        break;
      }
    }
  });
}

process.stdout.write(saida.join('\n') + '\n');
