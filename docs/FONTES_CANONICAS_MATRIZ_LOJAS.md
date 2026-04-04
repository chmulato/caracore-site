# Fontes canónicas — matriz e lojas (anti-redundância)

Este ficheiro é a **referência única** para “onde vive a verdade” sobre conteúdo. Os outros documentos (`RUNBOOK_*`, `CHECKLIST_*`, `delivery/README.md`, etc.) devem **remeter aqui** em vez de repetir tabelas ou regras longas.

---

## 1. Objetivo

- **Reduzir acoplamento:** uma alteração editorial ou comercial deve ter **um** repositório e **um** URL canónico.
- **Evitar cópias:** não manter o mesmo texto, vitrine ou wiki em dois sítios “oficiais”.

---

## 1.0 Plano acordado — `delivery/` na matriz é legado; o destino são as lojas

Este é o **plano fixado em MD** (também em `docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md`, `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`, `docs/DELIVERY_RESTRUCTURA.md`, `delivery/README.md`):

1. Na matriz (`caracore.com.br`), a pasta **`delivery/`** existe **só** como **legado / compatibilidade de URL**: redirecionar tráfego antigo para as **respetivas lojas** por subdomínio (`https://{produto}.caracore.com.br/...`).
2. A **informação real de produto** (vitrine, wiki, downloads, manuais) **não** se mantém na matriz como fonte principal; vive nos repositórios **`caracore-*-releases`** e nos sites das **lojas**.
3. O que permanece sob `caracore-site/delivery/{produto}/` deve ser, em princípio, o **mínimo técnico** (HTML de redirect, `MIRROR_DELIVERY.md`, mapeamento em `MAPA_ROTAS_*`) até o fecho do plano por ciclos; **não** expandir conteúdo comercial novo aqui.

### 1.0a Estado-alvo do plano — **não precisar da pasta `delivery/`** (`D:\dev\caracore-site\delivery`)

O **fim pretendido** é o repositório **sem** a pasta `delivery/`: não haver cópia de rotas legadas em ficheiros estáticos na matriz; compatibilidade com URLs antigas fica **só** no **hospedeiro** (regras de redirect na CDN, gateway, ou serviço equivalente), alinhadas com `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`.

**Antes de remover `delivery/` do Git**, deve estar garantido:

1. **Redirects HTTP** para todas as rotas legadas relevantes (`/delivery/{produto}/...`, `publications`, `assets` partilhados, etc.) — equivalente funcional ao mapa atual.
2. **Migração** do que for canónico e ainda estiver só sob `delivery/` (ex.: `delivery/assets/` → local documentado na raiz da matriz; `delivery/publications/` → `/publications/` ou redirects explícitos).
3. **Validação** de tráfego / campanhas: acordo interno de que não há dependência crítica em ficheiros estáticos em `/delivery/` (ou SLA de legado cumprido).
4. **Links internos** da matriz sem destinos permanentes a `/delivery/` como fonte (só até migrar).

Enquanto isso não estiver fechado, a pasta `delivery/` permanece como **transição**; o plano continua a ser **reduzir** o seu conteúdo e **não** aumentar dependências novas.

---

## 1.1 Sala canónica — informação real e completa

Toda a **informação operacional** que deve existir no site (páginas HTML, imagens e media em `assets/`, textos em `regis/`, redes sociais, retro, feeds, scripts de apoio em `sala/scripts/` quando aplicável) vive **apenas** em `sala/` na raiz do repositório. Não há cópia canónica noutra pasta; `delivery/sala/` não existe no repo (legado só por redirect HTTP).

---

## 2. Tabela de fontes canónicas

| Tipo de informação | Onde editar (caminho no repo) | URL pública canónica | O que **não** fazer |
|--------------------|-------------------------------|----------------------|---------------------|
| **Sala de Operações** (plano, campanhas, redes, retro, artefatos operacionais) | `D:\dev\caracore-site\sala\` | `https://caracore.com.br/sala/` | Não duplicar conteúdo real em `delivery/`; URLs legadas `/delivery/sala/` via redirect no hospedeiro (`docs/DELIVERY_RESTRUCTURA.md`). |
| **Produto** (vitrine, wiki, downloads comerciais, manuais de loja) | Repositório `caracore-*-releases` do produto + site gerado | `https://{produto}.caracore.com.br/...` | Não manter páginas completas em `caracore-site/delivery/{produto}/` além do mínimo de **compatibilidade** (redirect). |
| **Matriz institucional** (home, portfólio, ecossistema, secure, publications onde aplicável) | Raiz e pastas próprias em `caracore-site` (ex.: `publications/`) | `https://caracore.com.br/...` | Não copiar vitrines de produto para a matriz como fonte principal. |
| **Compatibilidade URL antiga (legado → loja)** | *Transitório:* `caracore-site/delivery/` até **eliminação da pasta** (§1.0a); depois só redirects no hospedeiro | `https://caracore.com.br/delivery/...` → **redirect** para lojas / matriz canónica | Estado-alvo: **sem** pasta `delivery/` no repo; `MAPA_ROTAS_*` passa a descrever só regras no edge. |

**Produtos com subdomínio:** lista e fases de trabalho continuam em `docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md` e `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` — sem duplicar a lista de subdomínios neste ficheiro.

---

## 3. Regras operacionais curtas

1. **Sala:** todo PR que altere páginas da Sala → apenas sob `sala/` na raiz do `caracore-site`; o conteúdo publicado deve estar completo nessa árvore. Ver `sala/README.txt` e `sala/ESTRUTURA_SALA.txt` (ou `.html`) quando existirem.
2. **Lojas:** CTAs e campanhas novas → sempre URL do **subdomínio** do produto, nunca `/delivery/{produto}/` como destino principal.
3. **Delivery:** camada **legado/redirect** na matriz até remoção (§1.0a); destino = **loja** do produto. Alterações de texto comercial fazem-se na loja ou na Sala, conforme a tabela acima.

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
| `delivery/README.md` | Resumo operacional para quem abre a pasta `delivery/`. |

---
