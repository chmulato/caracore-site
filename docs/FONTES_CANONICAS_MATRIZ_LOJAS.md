# Fontes canónicas — matriz e lojas (anti-redundância)

Este ficheiro é a **referência única** para “onde vive a verdade” sobre conteúdo. Os outros documentos (`RUNBOOK_*`, `CHECKLIST_*`, `docs/DELIVERY_RESTRUCTURA.md`, etc.) devem **remeter aqui** em vez de repetir tabelas ou regras longas.

**Nota (repo):** a pasta legada `delivery_old/` foi desativada para remoção. As **URLs** públicas de legado mantêm-se por redirects no edge (ex.: `/delivery/...` e `/delivery_old/...`), sem depender de conteúdo estático local.

---

## 1. Objetivo

- **Reduzir acoplamento:** uma alteração editorial ou comercial deve ter **um** repositório e **um** URL canónico.
- **Evitar cópias:** não manter o mesmo texto, vitrine ou wiki em dois sítios “oficiais”.

### 1.0b Alinhamento canónico **sem** descaracterizar cada loja

**Canónico** aqui significa **uma fonte de verdade por tipo de informação e um URL oficial** — **não** significa que todas as lojas tenham de parecer a home institucional da matriz.

- **Cada produto** mantém a **sua** apresentação na respetiva loja (`caracore-*-releases`, subdomínio): narrativa, hierarquia de páginas, tom (ex.: vitrine comercial, jogo/narrativa OIDC, documentação técnica ETE), CSS/JS e componentes próprios onde o produto já os define. Isso é **desejável** e faz parte da identidade do ecossistema.
- A **matriz** (`caracore.com.br`) transmite a **Cara Core Informática** institucional (home, portfólio, ecossistema, sala): resumo, contexto e CTAs para a loja — **sem** substituir a vitrine completa nem forçar um “template único” que apague a diferença entre produtos.
- **Evitar:** copiar blocos inteiros da loja para a matriz como segunda fonte; **evitar:** reescrever todas as lojas num único estilo genérico “só para alinhar”; **evitar:** manter conteúdo comercial longo em `delivery/` em paralelo à loja.

Quem definir o detalhe de layout por loja continua a ser o repositório `*-releases` e documentos de apoio (ex.: `COMPONENTES_LOJA.md` no `caracore-site`, quando aplicável ao produto).

### 1.0c Os sites de cada produto **são** o produto (na web)

Para o utilizador e para o negócio, o site em **`https://{produto}.caracore.com.br`** (repositório **`caracore-*-releases`**) **não** é um anexo à matriz nem material promocional descartável: é a **superfície oficial** do produto — oferta, download, documentação, licenças, feedback e jornada típica. **Não** se perdem, **não** se fundem na home institucional e **não** se tratam como opcionais no plano de arquitetura.

O que o plano remove é a **pasta `delivery/` na matriz** e a **duplicação** de conteúdo, **não** as lojas. Redirects e URLs canónicas existem para **proteger** esses sites e o tráfego que já os usa.

---

## 1.0 Plano acordado — `delivery/` na matriz é legado; o destino são as lojas

Este é o **plano fixado** (detalhe histórico em `docs/archive/delivery-migracao/`; mapa activo em `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` e `_redirects`):

1. Na matriz (`caracore.com.br`), a pasta **`delivery/`** existe **só** como **legado / compatibilidade de URL**: redirecionar tráfego antigo para as **respetivas lojas** por subdomínio (`https://{produto}.caracore.com.br/...`).
2. A **informação real de produto** (vitrine, wiki, downloads, manuais) **não** se mantém na matriz como fonte principal; vive nos repositórios **`caracore-*-releases`** e nos sites das **lojas**.
3. Qualquer resíduo de legado deve ficar fora da superfície pública do repositório; a compatibilidade HTTP permanece por regras de redirect no edge e no gateway, sem expansão de conteúdo comercial fora das lojas.

### 1.0a Estado-alvo do plano — **não precisar da pasta legada** (`D:\dev\caracore-site\delivery_old`; antes `delivery/`)

O **fim pretendido** é o repositório **sem** a pasta `delivery/`: não haver cópia de rotas legadas em ficheiros estáticos na matriz; compatibilidade com URLs antigas fica **só** no **hospedeiro** (regras de redirect na CDN, gateway, ou serviço equivalente), alinhadas com `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`.

**Antes de remover `delivery/` do Git**, deve estar garantido:

1. **Redirects HTTP** para todas as rotas legadas relevantes (`/delivery/{produto}/...`, `publications`, `assets` partilhados, etc.) — equivalente funcional ao mapa atual.
2. **Migração** do que for canónico e ainda estiver só sob `delivery/` (ex.: `delivery/assets/` → local documentado na raiz da matriz; `delivery/publications/` → `/publications/` ou redirects explícitos).
3. **Validação** de tráfego / campanhas: acordo interno de que não há dependência crítica em ficheiros estáticos em `/delivery/` (ou SLA de legado cumprido).
4. **Links internos** da matriz sem destinos permanentes a `/delivery/` como fonte (só até migrar).

Enquanto isso não estiver fechado, a pasta `delivery/` permanece como **transição**; o plano continua a ser **reduzir** o seu conteúdo e **não** aumentar dependências novas.

---

## 1.1 Sala canónica — informação real e completa

Toda a **informação operacional** da Sala de Operações vive na sua versão oficial em `https://tools.caracore.com.br/sala/`. A matriz mantém apenas links institucionais e redirects de compatibilidade para encaminhar o acesso corretamente.

---

## 2. Tabela de fontes canónicas

| Tipo de informação | Onde editar (caminho no repo) | URL pública canónica | O que **não** fazer |
|--------------------|-------------------------------|----------------------|---------------------|
| **Sala de Operações** (plano, campanhas, redes, retro, artefatos operacionais) | Portal oficial da Sala de Operações | `https://tools.caracore.com.br/sala/` | Não duplicar conteúdo real na matriz nem em `delivery/`; URLs legadas `/delivery/sala/` via redirect no hospedeiro (`docs/DELIVERY_RESTRUCTURA.md`). |
| **Produto** (vitrine, wiki, downloads comerciais, manuais de loja) | Repositório `caracore-*-releases` do produto + site gerado | `https://{produto}.caracore.com.br/...` | Não manter páginas completas em `caracore-site/delivery/{produto}/` além do mínimo de **compatibilidade** (redirect). Cada loja preserva **a sua** apresentação (§1.0b); a matriz não a duplica como fonte paralela. |
| **Matriz institucional** (home, portfólio, ecossistema, secure, publications onde aplicável) | Raiz e pastas próprias em `caracore-site` (ex.: `publications/`) | `https://www.caracore.com.br/...` | Não copiar vitrines de produto para a matriz como fonte principal. |
| **Compatibilidade URL antiga (legado → loja)** | *Transitório:* `caracore-site/delivery/` até **eliminação da pasta** (§1.0a); depois só redirects no hospedeiro | `https://www.caracore.com.br/delivery/...` → **redirect** para lojas / matriz canónica | Estado-alvo: **sem** pasta `delivery/` no repo; `MAPA_ROTAS_*` passa a descrever só regras no edge. |

**Produtos com subdomínio:** mapa de redirects em `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` e `_redirects`. PDV Rust: canónico **pdv-rust.caracore.com.br** (sem conteúdo em `/delivery/pdv-rust`).

---

## 3. Regras operacionais curtas

1. **Sala:** alterações editoriais da Sala devem respeitar a sua versão oficial em `https://tools.caracore.com.br/sala/`; a matriz só deve apontar para esse destino e não manter cópia paralela.
2. **Lojas:** CTAs e campanhas novas → sempre URL do **subdomínio** do produto, nunca `/delivery/{produto}/` como destino principal.
3. **Delivery:** camada **legado/redirect** na matriz até remoção (§1.0a); destino = **loja** do produto. Alterações de texto comercial fazem-se na loja ou na Sala, conforme a tabela acima.
4. **Identidade por loja:** alinhar URLs e repositórios (§1.0b) **sem** uniformizar narrativa ou UI entre produtos; respeitar o que já está desenhado em cada `*-releases`.
5. **Produto = site da loja (§1.0c):** manter e priorizar os subdomínios; nunca planear a sua extinção em favor de só a matriz.

---

## 4. Documentos relacionados (papel de cada um)

| Documento | Papel |
|-----------|--------|
| **Este ficheiro** | Define fontes canónicas e anti-redundância. |
| `docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md` | Operação, SEO, rollback, observabilidade. |
| `docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` | Estado por ciclo e gates. |
| `docs/PLANO_GRAU_EXECUCAO.md` | Escala 0–9, grau atual, rota e preparação para os graus 7–9. |
| `docs/EVIDENCIA_BASELINE_TECNICO_PRE_GRAU7.md` | Baseline técnica do repositório antes do gate Ciclo 4 (pré-grau 7). |

| `docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md` | Plano por fases: redundância delivery → consolidação nas lojas. |
| `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` | Mapeamento rota legado na matriz → URL oficial na loja. |
| `docs/DELIVERY_RESTRUCTURA.md` | Transição até eliminar `delivery/`; redirects; legado `/delivery/sala/`. |
| `docs/DELIVERY_RESTRUCTURA.md` | Resumo operacional da transição de legado e regra de redirects. |

---
