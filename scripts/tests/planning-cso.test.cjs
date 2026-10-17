const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.resolve(__dirname, '../../assets/js/planning-data.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const planning = context.window.CARACORE_PLANNING;
const year = planning.YEARS.find(item => item.id === 'y2028');
const cso = planning.PRODUCTS.find(item => item.id === 'cso');

test('CSO targets the integrated delivery without claiming a confirmed GA', () => {
  assert.match(year.subtitle, /Transportes \+ Virtual Tracker/);
  assert.match(year.note, /08\/11\/2028, não GA garantido/);
  assert.match(year.note, /10 sprints locais estimadas \+ 21 tarefas INT em 6 etapas \(0\/21\)/);
  assert.match(year.note, /INT-03/);
  assert.match(cso.now, /em desenvolvimento/);
  assert.match(cso.now, /Sem contratação antecipada/);
});

test('funding includes integrated VT subject to capacity without increasing quota', () => {
  const funding = planning.FUNDING;
  assert.equal(funding.monthly, 20);
  assert.equal(funding.total, 800);
  assert.equal(funding.capPct, 80);
  assert.equal(funding.onDemand, false);
  assert.match(funding.verdict, /INT-03/);
  assert.ok(funding.covers.some(item => item.item.includes('Transportes + Virtual Tracker')));
  assert.ok(funding.queue.some(item => item.period === '2028' && item.owner.includes('integração VT')));
  assert.ok(!funding.notInEnvelope.some(item => /Virtual Tracker.*mesmo ano/.test(item)));
});

test('planned relay and cadence preserve desktop-only trajectory ownership', () => {
  assert.match(year.note, /E2EE sem ler ou persistir trajetos\/envelopes/);
  assert.match(year.note, /chave privada, mapa e histórico somente no desktop/);
  assert.match(year.note, /Conexão obrigatória, sem fila offline/);
  assert.match(year.note, /presença 120 s quando necessária e posição 60 s em viagem/);
  assert.match(year.note, /não instantânea/);
});

test('planning alignment does not claim implementation progress', () => {
  assert.equal(cso.history.at(-1).p, 40);
  assert.equal(cso.shop, 'https://cso-transp.caracore.com.br/');
  assert.match(cso.now, /sem GPS hoje/);
});
