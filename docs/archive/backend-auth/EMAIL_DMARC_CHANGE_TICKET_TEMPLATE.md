# Template de Change Ticket - DMARC

## Como usar

- Copie este template para cada fase do rollout (Fase 1, Fase 2, Fase 3).
- Preencha os campos obrigatorios antes da janela de mudanca.
- Anexe evidencias apos execucao e validacao.

---

## 1. Metadados da mudanca

- ID da mudanca:
- Titulo:
- Fase DMARC: (1 monitoramento / 2 mitigacao / 3 protecao forte)
- Ambiente: Producao
- Dominio: caracore.com.br
- Solicitante:
- Implementador tecnico:
- Revisor de compliance:
- Aprovador final:
- Data/hora planejada:
- Janela de mudanca:

## 2. Objetivo

Descrever em 2-4 linhas o objetivo da fase e o resultado esperado.

## 3. Escopo

- DNS a alterar:
  - Host: _dmarc.caracore.com.br
  - Tipo: TXT
- Servicos impactados: envio/recebimento de e-mail do dominio
- Fora de escopo: alteracoes em SPF/DKIM (salvo aprovacao adicional)

## 4. Mudanca tecnica proposta

- Valor anterior do registro DMARC:
- Novo valor do registro DMARC:

### Valores recomendados por fase

- Fase 1:
  - v=DMARC1; p=none; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
- Fase 2:
  - v=DMARC1; p=quarantine; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
- Fase 3:
  - v=DMARC1; p=reject; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100

## 5. Analise de risco

- Probabilidade de impacto: Baixa / Media / Alta
- Impacto potencial:
- Principais riscos:
  1. Rejeicao indevida de e-mails legitimos por falta de alinhamento DKIM/SPF.
  2. Atraso de entrega durante propagacao DNS.
  3. Falta de cobertura de todos os remetentes autorizados.
- Mitigacoes:
  1. Evolucao em fases (none -> quarantine -> reject).
  2. Monitoramento por 7 dias entre fases.
  3. Checklist tecnico validado antes de avancar.

## 6. Plano de execucao

1. Confirmar aprovacao formal da mudanca.
2. Registrar snapshot do DNS atual (evidencia).
3. Aplicar novo TXT DMARC no provedor DNS.
4. Validar propagacao com consultas DNS.
5. Validar envio e recebimento real com suporte@caracore.com.br.
6. Registrar resultados e status final.

## 7. Plano de validacao (comandos)

```powershell
Resolve-DnsName _dmarc.caracore.com.br -Type TXT
Resolve-DnsName caracore.com.br -Type TXT
Resolve-DnsName caracore.com.br -Type MX
```

Testes funcionais:

- Enviar e-mail externo (Gmail/Outlook) para suporte@caracore.com.br.
- Responder a partir de suporte@caracore.com.br.
- Verificar spam/quarentena dos dois lados.

## 8. Critério de aceite

- Registro DMARC publicado conforme fase.
- Sem incidente de indisponibilidade no atendimento.
- Evidencias anexadas (DNS + testes de fluxo).
- Aprovacao do revisor de compliance.

## 9. Plano de rollback

1. Reverter DMARC para politica anterior (ou `p=none`).
2. Revalidar DNS e fluxo de e-mail.
3. Abrir analise de causa raiz.
4. Replanejar fase com ajustes de SPF/DKIM/alinhamento.

## 10. Evidencias (anexos)

- Screenshot/saida de DNS antes.
- Screenshot/saida de DNS depois.
- Logs de envio/recebimento.
- Relatorio resumido de impacto.

## 11. Encerramento

- Status final: Sucesso / Sucesso com ressalvas / Falha
- Data/hora de encerramento:
- Responsavel pelo encerramento:
- Licoes aprendidas:

---

# Exemplo preenchido - Fase 1 (monitoramento)

## 1. Metadados da mudanca

- ID da mudanca: CHG-DMARC-2026-001
- Titulo: Publicacao inicial DMARC em modo monitoramento (p=none)
- Fase DMARC: 1 monitoramento
- Ambiente: Producao
- Dominio: caracore.com.br
- Solicitante: Operacao TI
- Implementador tecnico: Infra DNS
- Revisor de compliance: Governanca LGPD
- Aprovador final: Responsavel de negocio
- Data/hora planejada: 2026-03-18 19:00 BRT
- Janela de mudanca: 30 minutos

## 2. Objetivo

Publicar DMARC em modo monitoramento para iniciar coleta de relatorios sem bloqueio de mensagens e preparar endurecimento gradual da politica.

## 3. Escopo

- DNS a alterar:
  - Host: _dmarc.caracore.com.br
  - Tipo: TXT
- Servicos impactados: autenticidade de e-mail do dominio
- Fora de escopo: alteracoes em SPF e DKIM

## 4. Mudanca tecnica proposta

- Valor anterior do registro DMARC: inexistente
- Novo valor do registro DMARC:
  - v=DMARC1; p=none; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100

## 5. Analise de risco

- Probabilidade de impacto: Baixa
- Impacto potencial: Muito baixo (modo monitoramento)
- Mitigacao principal: sem bloqueio de entrega nesta fase.

## 6. Plano de execucao

Executar os 6 passos do plano de execucao do template.

## 7. Plano de validacao

Executar os 3 comandos de DNS e os 2 testes funcionais.

## 8. Critério de aceite

Registro visivel em DNS publico e fluxo de suporte sem impacto.

## 9. Plano de rollback

Remover registro ou manter p=none (ja e configuracao de menor risco).

## 10. Evidencias

Anexar saidas de DNS e testes de envio/recebimento.

## 11. Encerramento

- Status final: A preencher
- Data/hora de encerramento: A preencher
- Responsavel pelo encerramento: A preencher
- Licoes aprendidas: A preencher
