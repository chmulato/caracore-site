# Registro LGPD - Entrega de Clientes (Free e Premium)

Data base: 2026-03-14
Escopo: vitrines de apps no delivery (PDV, ETE, OIDC, RU)

## Objetivo

Padronizar o registro de atendimento para entrega de versoes Free e liberacao Premium com conformidade LGPD.

## Regras obrigatorias

- Versao Free:
  - Sem cobranca.
  - Exige registro minimo de consentimento e finalidade.
- Versao Premium:
  - Liberacao somente apos confirmacao de pagamento.
  - Exige registro completo LGPD + trilha de auditoria.

## Campos minimos (Free)

- Protocolo interno (ex.: LGPD-YYYYMMDDHHMMSS)
- Produto e versao
- Nome da loja/cliente
- Canal de contato (WhatsApp, Telegram, E-mail)
- Consentimento (sim/nao)
- Finalidade (entrega Free, onboarding, suporte inicial)
- Data/hora do atendimento
- Operador responsavel

## Campos obrigatorios adicionais (Premium)

- Status de pagamento (confirmado/pendente)
- Evidencia de pagamento (id do comprovante ou referencia financeira)
- Data/hora da confirmacao financeira
- Data/hora da liberacao premium
- Base legal declarada (execucao contratual / consentimento)
- Prazo de retencao

## Modelo de registro (copiar e preencher)

```text
PROTOCOLO:
PRODUTO:
VERSAO: (Free / Premium)
CLIENTE/LOJA:
CANAL DE CONTATO:
CONSENTIMENTO LGPD: (Sim / Nao)
FINALIDADE:
STATUS PAGAMENTO: (N/A para Free / Confirmado / Pendente)
REFERENCIA PAGAMENTO:
DATA/HORA ATENDIMENTO:
DATA/HORA CONFIRMACAO FINANCEIRA:
DATA/HORA LIBERACAO:
OPERADOR RESPONSAVEL:
BASE LEGAL:
PRAZO DE RETENCAO:
OBSERVACOES:
```

## Retencao e descarte

- Manter apenas o minimo necessario para atendimento, auditoria e obrigacoes legais.
- Revisar periodicamente os registros e descartar dados fora do prazo de retencao.
- Restringir acesso aos operadores autorizados (comercial e suporte).
