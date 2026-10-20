/* Normaliza rótulos de estágio do ecossistema para os quatro estágios canônicos. */
const fs = require('node:fs');
const path = require('node:path');

const arquivo = path.resolve(__dirname, '..', 'ecosistema.html');
const trocas = [
  ['>Concluído no roadmap<', '>Disponível<'],
  ['>Concluído<', '>Disponível<'],
  ['>Em produção<', '>Disponível<'],
  ['>Pré-release v2.1.0-rc1.2<', '>Beta (RC) · v2.1.0-rc1.2<'],
  ['>Piloto público · avaliação<', '>Piloto<'],
  ['>Frotas em produção<', '>Disponível (Frotas)<'],
  ['>Community 1.1.1<', '>Disponível · Community 1.1.1<'],
  ['>Gratuito<', '>Disponível<']
];

let texto = fs.readFileSync(arquivo, 'utf8');
let total = 0;
for (const [de, para] of trocas) {
  const partes = texto.split(de);
  const ocorrencias = partes.length - 1;
  if (ocorrencias > 0) {
    texto = partes.join(para);
    total += ocorrencias;
    process.stdout.write(`${de} -> ${para}: ${ocorrencias}\n`);
  }
}
fs.writeFileSync(arquivo, texto);
process.stdout.write(`Total: ${total}\n`);
