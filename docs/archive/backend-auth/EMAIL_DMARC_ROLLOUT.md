# Plano de Rollout DMARC - caracore.com.br

## Objetivo

Fortalecer a autenticidade de e-mails do dominio caracore.com.br, reduzindo spoofing e melhorando entregabilidade, sem interromper operacao.

Template operacional de mudanca:
- Consulte [EMAIL_DMARC_CHANGE_TICKET_TEMPLATE.md](./EMAIL_DMARC_CHANGE_TICKET_TEMPLATE.md) para abrir e registrar cada fase com evidencias.

## Escopo

- Dominio: caracore.com.br
- Caixa de suporte: suporte@caracore.com.br
- Foco: DMARC (com SPF e DKIM alinhados)

## Estado atual observado

- MX configurado (UOL Suite + UH Server)
- SPF publicado: `v=spf1 include:spf.whservidor.com include:spf.suite.uol ~all`
- DMARC ausente
- SMTP submission ativo em 587 (smtp.uhserver.com)

## Recomendacao de rollout sem risco

### Fase 1 (monitoramento) - Semana 1

Publicar TXT em `_dmarc.caracore.com.br`:

```txt
v=DMARC1; p=none; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
```

Objetivo:
- Coletar relatorios sem bloquear mensagens.

### Fase 2 (mitigacao) - Semana 3

Se relatorios estiverem limpos, ajustar para:

```txt
v=DMARC1; p=quarantine; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
```

Objetivo:
- Enviar suspeitos para spam/quarentena.

### Fase 3 (protecao forte) - Semana 6

Se validacao continuar estavel:

```txt
v=DMARC1; p=reject; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
```

Objetivo:
- Rejeitar spoofing no nivel de servidor.

## Checklist tecnico antes de avancar de fase

1. Confirmar DKIM ativo em cada provedor que envia pelo dominio.
2. Confirmar SPF sem includes obsoletos.
3. Verificar se todos os sistemas que enviam e-mail estao autorizados.
4. Validar recebimento real em suporte@caracore.com.br (entrada e resposta).
5. Monitorar relatorios DMARC por ao menos 7 dias por fase.

## Validacao via PowerShell

### Verificar DMARC

```powershell
Resolve-DnsName _dmarc.caracore.com.br -Type TXT
```

### Verificar SPF

```powershell
Resolve-DnsName caracore.com.br -Type TXT
```

### Verificar MX

```powershell
Resolve-DnsName caracore.com.br -Type MX
```

## Critério de sucesso

- 0 falhas legitimas recorrentes em relatorios DMARC.
- Nenhum impacto em fluxo de atendimento via suporte@caracore.com.br.
- Politica final em `p=reject` com operacao estavel.

## Plano de rollback

Se houver impacto de entrega legitima:

1. Reverter temporariamente DMARC para `p=none`.
2. Corrigir origem de envio (SPF/DKIM/alinhamento).
3. Recoletar relatorios por 7 dias.
4. Retomar evolucao gradual.

## Governanca e conflito de interesse

Para evitar conflitos e erros operacionais:

- Um responsavel tecnico aplica DNS.
- Um revisor de compliance aprova mudanca de fase.
- Evidencias (prints/consultas DNS/relatorios) devem ser arquivadas por fase.

## Ultima atualizacao

14/03/2026
