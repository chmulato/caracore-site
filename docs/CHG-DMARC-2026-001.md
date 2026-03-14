# CHG-DMARC-2026-001

## Metadados

- ID da mudanca: CHG-DMARC-2026-001
- Titulo: Publicacao inicial DMARC em modo monitoramento (Fase 1)
- Fase DMARC: 1 (monitoramento)
- Ambiente: Producao
- Dominio: caracore.com.br
- Data: 14/03/2026
- Status: Aguardando aplicacao DNS

## Mudanca tecnica

- Host/Name: `_dmarc`
- Tipo: `TXT`
- TTL: `3600` (ou padrao do provedor)
- Valor:

```txt
v=DMARC1; p=none; rua=mailto:suporte@caracore.com.br; adkim=s; aspf=s; fo=1; pct=100
```

## Passos de execucao

1. Abrir painel DNS do dominio `caracore.com.br`.
2. Criar registro TXT com os dados acima.
3. Salvar mudanca.
4. Aguardar 5-15 minutos.

## Validacao

```powershell
Resolve-DnsName _dmarc.caracore.com.br -Type TXT
```

Resultado esperado: retorno com o valor DMARC publicado.

## Critério de aceite

- DMARC visivel em DNS publico.
- Sem impacto no fluxo de e-mail de `suporte@caracore.com.br`.

## Rollback (se necessario)

- Remover o registro `_dmarc` criado nesta mudanca.
- Revalidar DNS.

## Evidencias

- [ ] Screenshot do registro no painel DNS
- [ ] Saida do comando `Resolve-DnsName`
- [ ] Teste de envio/recebimento em `suporte@caracore.com.br`
