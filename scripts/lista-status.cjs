/* Extrai os rótulos de status exibidos no ecossistema (uso local). */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const arquivos = ['ecosistema.html', 'portfolio.html', 'index.html'];
const regexes = [
  /class="eco-status[^"]*"[^>]*>([^<]+)</g,
  /class="badge bg-success[^"]*"[^>]*>([^<]+)</g,
  /<span class="release-tag">([^<]+)</g
];

for (const rel of arquivos) {
  const linhas = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  linhas.forEach((linha, indice) => {
    for (const regex of regexes) {
      regex.lastIndex = 0;
      const match = regex.exec(linha);
      if (match) {
        process.stdout.write(`${rel}:${indice + 1}: ${match[1].trim()}\n`);
      }
    }
  });
}
