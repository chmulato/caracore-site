/* Varredura local de termos a corrigir nas páginas públicas (uso interno). */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const arquivos = ['index.html', 'ecosistema.html', 'portfolio.html', 'planning.html'];
const padroes = [
  /\bonze\b/gi,
  /Funding/gi,
  /Actualiza\w*|actualiza\w*|\bactual\b|\bactiva\w*|activ[oa]s?\b/gi,
  /Subdominios|subdominios/g,
  /tr[eê]s pilares/gi,
  /Cara Core PDV\b/g,
  /Produto ETE/gi,
  /Disponibilidade|disponibilidade/g
];

for (const rel of arquivos) {
  const linhas = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  linhas.forEach((linha, indice) => {
    for (const padrao of padroes) {
      padrao.lastIndex = 0;
      if (padrao.test(linha)) {
        const texto = linha.trim().slice(0, 260);
        process.stdout.write(`${rel}:${indice + 1}: ${texto}\n`);
        break;
      }
    }
  });
}
