# Análise de Custos - Infraestrutura Azure Docker

**Documento:** Análise de Custos Operacionais  
**Sistema:** CaraCore OAuth 2.1 + OIDC  
**Data:** 02 de novembro de 2025  
**Versão:** 1.0  

---

## Resumo Executivo

O sistema CaraCore utiliza infraestrutura Azure baseada em containers Docker para hospedar a aplicação de autenticação OAuth 2.1 + OIDC. Este documento apresenta uma análise detalhada dos custos operacionais atuais e projeções para diferentes cenários de utilização.

**Custo Atual:** USD 5,00/mês (desenvolvimento)  
**Custo Recomendado Produção:** USD 18,14/mês  
**ROI Estimado:** Excelente para aplicação empresarial  

---

## Configuração Atual

### Infraestrutura Implementada

**Azure Container Registry (ACR)**

- SKU: Basic
- Localização: East US
- Armazenamento: 10 GB incluídos
- Status: Operacional

**Azure App Service**

- SKU: F1 (Free Tier)
- Localização: Brazil South
- RAM: 1 GB
- CPU: Compartilhado
- Status: Operacional com limitações

**Aplicação Docker**

- Base Image: Python 3.10-slim
- Tamanho Estimado: 200-300 MB
- Dependências: Otimizadas (5 packages principais)
- Arquitetura: Multi-stage build

---

## Análise de Custos por Componente

### 1. Azure Container Registry

**Tier Atual: [Basic]**

- Custo mensal: USD 5,00
- Armazenamento incluído: 10 GB
- Transferência de dados: Ilimitada
- Webhooks: Incluídos
- Geo-replicação: Não disponível

**Justificativa do Tier:**

- Capacidade de 10 GB suporta aproximadamente 30-50 versões da imagem
- Sem necessidade de geo-replicação para escopo atual
- Webhooks essenciais para automação de deploy

### 2. Azure App Service

**Configuração Atual: [F1 Free]**

- Custo mensal: USD 0,00
- Limitações críticas:
  - 60 minutos CPU/dia
  - Sleep automático após 20 minutos inatividade
  - Sem SLA garantido
  - Sem SSL customizado

**Limitações de Produção:**

- Indisponibilidade durante sleep periods
- Performance inconsistente
- Não adequado para ambiente corporativo

---

## Cenários de Custo

### Cenário 1: Desenvolvimento/Teste (Atual)

| Componente | Tier | Custo Mensal |
|------------|------|--------------|
| Container Registry | Basic | USD 5,00 |
| App Service | F1 Free | USD 0,00 |
| **Total** | | **USD 5,00** |

**Limitações:**

- Disponibilidade não garantida
- Sleep automático
- Performance limitada

### Cenário 2: Produção Recomendada

| Componente | Tier | Custo Mensal |
|------------|------|--------------|
| Container Registry | Basic | USD 5,00 |
| App Service | B1 Basic | USD 13,14 |
| **Total** | | **USD 18,14** |

**Benefícios:**

- SLA 99,95%
- 1,75 GB RAM
- 1 Core CPU dedicado
- Sem sleep automático
- SSL customizado disponível

### Cenário 3: Enterprise/Alto Tráfego

| Componente | Tier | Custo Mensal |
|------------|------|--------------|
| Container Registry | Basic | USD 5,00 |
| App Service | S1 Standard | USD 73,00 |
| **Total** | | **USD 78,00** |

**Recursos Adicionais:**

- Auto-scaling (até 10 instâncias)
- 50 GB armazenamento
- Backup automático
- Staging slots
- Traffic Manager

---

## Comparação com Concorrentes

| Provedor | Configuração Equivalente | Custo Mensal | SLA |
|----------|--------------------------|--------------|-----|
| Azure | B1 + ACR Basic | USD 18,14 | 99,95% |
| AWS | ECS Fargate + ECR | USD 25-30 | 99,99% |
| Google Cloud | Cloud Run + Registry | USD 15-20 | 99,95% |
| DigitalOcean | App Platform | USD 12-18 | 99,0% |

**Análise:**

- Azure apresenta custo competitivo
- SLA adequado para ambiente corporativo
- Integração nativa com ferramentas Microsoft

---

## Otimizações Implementadas

### Eficiência de Imagem Docker

**Base Image Otimizada:**

- Python 3.10-slim vs. full Python (redução ~70% tamanho)
- Multi-stage build eliminando ferramentas de desenvolvimento
- Cache de layers otimizado para builds incrementais

**Dependências Minimalistas:**

- 5 packages essenciais vs. 20+ packages típicos
- Remoção de bibliotecas de desenvolvimento
- Validação de compatibilidade entre versões

**Resultado:**

- Tamanho da imagem: ~250 MB (vs. ~800 MB típico)
- Build time: ~2 minutos (vs. ~8 minutos típico)
- Transfer time: ~30 segundos (vs. ~2 minutos típico)

### Localização Estratégica

**Azure Container Registry:**

- East US (custo 15% menor que Brazil South)
- Transferência para Brazil South sem cobrança adicional

**App Service:**

- Brazil South (latência otimizada para usuários brasileiros)
- Redução de 40-60ms vs. US regions

---

## Projeção de Custos Anuais

### Cenário Conservador (B1)

```text
Custo mensal: USD 18,14
Custo anual: USD 217,68
Custo por usuário/mês (100 usuários): USD 0,18
```

### Cenário Crescimento (S1)

```text
Custo mensal: USD 78,00
Custo anual: USD 936,00
Custo por usuário/mês (500 usuários): USD 0,16
```

### Análise ROI

**Benefícios Quantificáveis:**

- Redução de downtime: 99,95% SLA vs. ~90% free tier
- Economia de recursos TI: Deploy automatizado
- Segurança enterprise: OAuth 2.1 + PKCE compliance

**Custo por Incidente Evitado:**

- 1 hora downtime ~ USD 500-2000 (dependendo do negócio)
- Investimento anual B1: USD 217,68
- Break-even: 1 incidente crítico evitado a cada 3-12 meses

---

## Recomendações

### Imediato (30 dias)

1. **Migração para B1 Basic**
   - Custo adicional: USD 13,14/mês
   - Benefício: Disponibilidade 24/7 garantida
   - Risco: Baixo (rollback em 5 minutos)

2. **Implementação de Monitoramento**
   - Azure Monitor (incluído no B1)
   - Alertas de performance e disponibilidade
   - Dashboard executivo

### Médio Prazo (90 dias)

1. **Otimização de Custos**
   - Reserved Instances (desconto 20-30%)
   - Review de utilização mensal
   - Cleanup automático de imagens antigas

2. **Disaster Recovery**
   - Backup automatizado (incluído S1+)
   - Geo-redundância se necessário
   - Procedimentos de restore documentados

### Longo Prazo (12 meses)

1. **Análise de Migração**
   - Avaliar Azure Functions (serverless)
   - Container Instances para cargas variáveis
   - Kubernetes para múltiplas aplicações

---

## Conclusão

A configuração atual de USD 5,00/mês é adequada para desenvolvimento, mas requer upgrade para USD 18,14/mês (B1) para atender requisitos de produção empresarial.

**Principais Fatores:**

- SLA 99,95% essencial para aplicação crítica de autenticação
- Custo por usuário extremamente baixo (USD 0,18/mês)
- ROI positivo com prevenção de um único incidente por trimestre
- Arquitetura escalável para crescimento futuro

**Aprovação Recomendada:** Upgrade imediato para B1 Basic (USD 18,14/mês)

---

**Documento preparado por:** Equipe Técnica CaraCore  
**Revisão:** 02/11/2025  
**Próxima revisão:** 02/02/2026