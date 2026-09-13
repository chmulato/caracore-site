# Cara Core Informática — Guia de Contexto e Memória para IAs (AGENTS.md)

> **Destinado a:** Todas as IAs, assistentes de código e agentes autônomos (Antigravity, Cursor, Copilot, Claude Code, Gemini).  
> **Data de Atualização:** 13/09/2026 (Free `v3.2.5-free` + RC2 + Rust `v0.1.4` + Minerador `v1.2.3` + Ink PWA **não antes de 2028**) 
> **Workspace Raiz:** `D:\dev` (ou `D:\onedrive\dev`) 
> **Cópia no Git:** `caracore-site/AGENTS.md` — manter igual a este ficheiro para IAs que clonam só a matriz.  
> **CNPJ:** 23.969.028/0001-37 — Cara Core Informática 
> **Cursor:** `.cursor/rules/ecosystem-cara-core.mdc` aponta para este ficheiro.

---

## 1. Visão Geral e Filosofia Arquitetural

A Cara Core Informática desenvolve soluções sob o modelo de **Engenharia B2B**, **Código Transparente no Ambiente do Cliente** e a filosofia do **Bunker Digital**:
- **Offline-First & Soberania de Dados:** Prioridade para persistência local (SQLite / arquivos locais) onde a operação do cliente nunca é interrompida por instabilidades de rede ou nuvem.
- **FinOps & Abordagem Híbrida Pragmática:** A nuvem é utilizada para colaboração, captação e telemetria gerencial, sem onerar o cliente com custos recorrentes desnecessários.
- **Transparência Radical:** O que está pronto é vendido; o que está em desenvolvimento é claramente rotulado como *Garagem*, *Piloto* ou *Roadmap*; ferramentas internas (como o Seed) são declaradas sem falsas promessas de download.

### Produtos principais (núcleo) e brincos

Os **únicos produtos principais** são **PDV**, **CSO** e **Hub**. O resto do portfólio (Ink, OIDC, Seed, Circuito, Área 51, RU, Helianto, MKT, Minerador) são **brincos**: existem, têm loja ou vitrine, e **não** mandam na fila de Agent, na headline pública nem no discurso de negócio. Em conflito de cota ou de data, o brinco **cede**.

| Chave | O que é | Status público honesto |
|---|---|---|
| **PDV** | Caixa no computador da loja (duas linhas desktop) | Java Free **`v3.2.5-free`** (100 vendas **por mês**; UI no navegador) · Java candidato **`v4.0.0-rc2`** (pré-release; GA **08/11/2026**) · Rust **`v0.1.4`** piloto Windows |
| **CSO** | Frota no navegador + Transportes no desktop (2028) | Frotas **em produção** em cso.caracore.com.br · vitrine `cso-transp.caracore.com.br` · **não é GPS** |
| **Hub** | Encomendas de Mercado Livre, Shopee e Temu | Vitrine pública · oficina web 2.1 · GA do instalador Windows **06/04/2027** |

### Snapshot 08/09/2026 (ler isto primeiro)

**Frentes até 08/11/2026 (não são o mesmo lançamento):**

| Frente | O que a data significa | O que não é |
|---|---|---|
| **PDV Java v4** | **GA público** se T032 + `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md`. **Código com Cursor: outubro–novembro/2026** (cota). | Não é o Free `v3.2.5-free`; não é copiloto PIX Split; não queimar cota em setembro neste plano |
| **CSO Gestão de Frotas** | App **já no ar**; **freeze Momento 1** (COE coerente). Trabalho **em andamento** (COE residual → FRO) | Não é FRO 24/24, Momento 2, GPS nem Transportes desktop |
| **CSO Transportes** | — | GA **08/11/2028**. Não usar a data do PDV |

Headline pública de 08/11/2026 = **PDV v4**. CSO Frotas continua em produção e no plano COE/FRO sem competir por essa promessa. Hub = 06/04/2027.

| Canal | O que está no ar | O que ainda não está |
|---|---|---|
| **PDV Java Free** | Tag `v3.2.5-free` · Maven `3.2.5` / display `3.2.5-free` · ZIP Windows/Linux/macOS · `http://localhost:8080/login` · `admin`/`admin` · shell com menu lateral (Início/Produtos/Caixa; mapa Premium com **Restrito**) · loja de exemplo opcional · badge `Plano Free · X/100 vendas · Y/100 produtos` · limites em `PlanoLicencaService` (abaixo) | Não é o RC2. Sem PIX integrado (QR/gateway) e sem NF-e/NFC-e. Nomes reais dos ZIP: `caracore-pdv-v3.2.5-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `e772ca5d57d1c368d80716ce2e8fce5ada488593cf65e2f00206694e79a00fc0` · Linux `85ca05555bb1da59dd0ca493a6a76f7071f7da97d4100cba92f288eec909c6ca` · macOS `dc6cb9666b07900dc01f5b54446281e841e55c854f4bdf84cd8981387b4f110d`. |
| **Loja PDV** | CTA primário = **Baixar Free (3.2.5)**. Premium via demonstração (`consultoria.html`). Qualidades: SQLite offline, venda no navegador, fechamento organizado. Copy Free **não** anuncia recibo. Sem depoimento inventado. | PWA da loja não é o caixa. RC2 não é o download Free |
| **PDV Java v4** | Pré-release **estacionada** `v4.0.0-rc2` · ZIP `caracore-pdv-4.0.0-rc2-qute-portable.zip` · Qute + launcher Edge (`iniciar_pdv.bat` underscore) · Java 25 + Python 3 · SHA256 `5e5d55b6d376c7f1d6ce91a9fb9a73f6d606289af27b508adf2d9eb2cdcd955d` · pasta nova + banco `./data/caracore-pdv.db` (não reabre `%APPDATA%/caracore/data/banco.db`) · tag git oficina `v4.0.0-rc2` · CI canónico `CI (Quarkus Qute)` + smoke HTTP `pdv-apps` `:8080` · plano de GA `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md` | **T032 não aprovado** (Edge real 1280×800, suíte `mvn -pl pdv-apps -am test`, instalador Windows assinado). Não substitui o Free. Não misturar pasta nem data com a 3.2.5. **Frente de GA 08/11/2026** se T032 passar. Electron/MSI não disparam em tag |
| **PWA** | Loja: vitrine em `pdv.caracore.com.br/pwa.html` (atalho/offline da loja). Oficina: shell local do Quarkus depois do launcher | A PWA da loja **não** é o caixa. Sem Electron |
| **PDV Rust** | Piloto `v0.1.4` Windows · **loja + artefatos no mesmo repo** `chmulato/caracore-rust-pdv-releases` (Pages = `pdv-rust.caracore.com.br`; Releases = NSIS/MSI/ZIP) | **Nunca** `/releases/latest` de `caracore-pdv-releases` (repo Java; `latest` = Free). Não substitui o Java |
| **CSO** | Frotas no ar em `cso.caracore.com.br` · loja `cso-transp.caracore.com.br` (home = conversão Frotas) · **em andamento** (COE → FRO; 08/nov = freeze M1, não lançamento novo) | Transportes desktop **08/11/2028**. Não é GPS. Sem depoimento inventado. 08/11/**2026** não é o GA do Transportes |
| **Hub** | Vitrine + oficina web 2.1 (Jakarta EE / Tomcat / PostgreSQL) | Instalador Windows SQLite **06/04/2027**. Não é Flask nem “central” da Cara Core |

### Planos Java Free / Premium (fonte: `PlanoLicencaService`)

| Limite | Free (R$ 0) | Premium (R$ 79,90/mês) |
|---|---|---|
| Vendas finalizadas / mês civil | 100 | Ilimitado |
| Produtos | 100 | Ilimitado |
| Operadores de caixa | 1 | Mais operadores |
| Vendedores | 4 | Sem o teto Free |
| Lojas | 1 | Sem o teto Free |
| Recibos SMS / mês | 10 no serviço | Sem o teto Free |
| PIX no caixa / emissão fiscal | Não | Sim (trilha Premium) |

Copy pública do Free **não** anuncia recibo: a 3.2.5 acrescenta shell com menu lateral (Início/Produtos/Caixa; itens Premium com Restrito), loja de exemplo opcional e badge de limites; o QA do balcão continua produto + venda + dinheiro no browser. Pagamentos Free: dinheiro, débito, crédito e outros — “outros” **não** é PIX integrado.

SHA256 Free (`v3.2.5-free`): Windows `e772ca5d57d1c368d80716ce2e8fce5ada488593cf65e2f00206694e79a00fc0` · Linux `85ca05555bb1da59dd0ca493a6a76f7071f7da97d4100cba92f288eec909c6ca` · macOS `dc6cb9666b07900dc01f5b54446281e841e55c854f4bdf84cd8981387b4f110d`. ZIP **sem** LEIA-ME interno; sidecar na release.

Rust piloto `v0.1.4`: teto de **100 vendas na vida do piloto**, não por mês. ZIP `CaraCore-PDV-v0.1.4-windows.zip` SHA256 `7d9cf69879eef8e12fd4972fcc3aaa5dc494df8630fa8554797bf47a98233a37`. Não misturar com o Free Java.

### Quem entra em cada PDV (fonte = loja da linha)

| Linha | Primeira venda | Perfis | Cliente lê em |
|---|---|---|---|
| **Java Free** | `admin` / `admin` (troca obrigatória) | **1 operador** no plano. Sem logins extras de demonstração. | https://pdv.caracore.com.br/download.html#perfis |
| **Rust piloto** | `admin` / `admin123` | `admin` (Administrador) · `operador` · `gestor` (tela **Financeiro**) · `auditoria`. “Acesso restrito” no operador é esperado. | https://pdv-rust.caracore.com.br/primeiros-passos.html#perfis |

Wiki **aponta** para essas âncoras; não é a fonte das senhas. Pasta Java `%APPDATA%\caracore\` ≠ Rust `%APPDATA%\caracore-pdv\`.

### Como IAs colaboram (desenvolvimento progressivo)

1. **Retomada:** este `AGENTS.md` → `.cursor/rules/ecosystem-cara-core.mdc` → `caracore-site/docs/ECOSYSTEM_MEMORIA.md` → `INICIAR_NOVA_TAREFA.md` → `.cursor/rules/project-memory.mdc` **do repo da tarefa**.
2. **Uma camada por vez:** matriz (`caracore-site`) · loja (`*-releases`) · oficina (`caracore-*`) · wiki (`caracore-wiki`). Não misturar Java e Rust no mesmo patch.
3. **Copy pública de login/perfis:** só na **loja daquela linha**. Wiki alinha produto e linka. Oficina guarda roteiro técnico (`contexto-rapido.md`, smokes).
4. **Depois de corte ou copy no ar:** atualizar este ficheiro, `ECOSYSTEM_MEMORIA.md` (linha no changelog), regras Cursor do repo tocado e da matriz. Não inventar depoimento, PIX no Free Java nem teto “/mês” no Rust.
5. **Git:** não commitar nem fazer push salvo pedido explícito. Exceção operacional: o dono pede “subir as novas”.

### Canais Java independentes (não misturar)

| Canal | Tag | Launcher | UI | Banco | Estado |
|---|---|---|---|---|---|
| **Free / loja** | `v3.2.5-free` (Latest) | `iniciar-pdv.bat` (hífen) | navegador `http://localhost:8080/login` | `%APPDATA%\caracore\` / `~/.caracore/` | **publicado** |
| **Candidato v4** | `v4.0.0-rc2` (pré-release) | `iniciar_pdv.bat` (underscore) | Edge modo app | `./data/caracore-pdv.db` | **estacionado** até T032 |

A oficina `caracore-pdv` (HEAD Maven `4.0.0-rc2`) **não** é o ZIP da loja. Retomada v4: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`. Não apagar AppData da v3 “para limpar” a v4.

---

## 2. Padrão Arquitetural em 4 Camadas

Todo o ecossistema é organizado rigorosamente em 4 camadas:

```
[ 1. MATRIZ ]        → caracore-site (www.caracore.com.br) — B2B, portfólio e prova de entrega
     │
[ 2. PRODUTOS ]      → Definições conceituais de domínio, licença e personas de negócio
     │
[ 3. OFICINAS ]      → caracore-<produto> (Código-fonte, testes automatizados, CI/CD, baseline)
     │
[ 4. LOJAS ]         → caracore-<produto>-releases (*.caracore.com.br) — vitrine, download, feedback
[ 4b. WIKI ]         → caracore-wiki (wiki.caracore.com.br) — documentação de todos os produtos
```

### Regra de Ouro: Desacoplamento Oficina ↔ Loja
1. **Oficina (`caracore-<produto>`):** Contém código-fonte, scripts, testes, Docker, `.mvn` e documentação técnica interna.
2. **Loja (`caracore-<produto>-releases`):** Site estático publicado no GitHub Pages com subdomínio próprio (`*.caracore.com.br`), servindo como a **verdade comercial do produto** (vitrine, download e canal de feedback). A documentação vive em `wiki.caracore.com.br`.
3. **Sem destinos `/delivery/`:** Links e CTAs institucionais apontam diretamente para os subdomínios oficiais das lojas (o diretório legado `/delivery/` é mantido apenas por redirecionamentos `_redirects`).
4. **CSO (duas URLs, uma loja):** a **aplicação** Frotas vive em `cso.caracore.com.br`; a **loja única** (Frotas + Transportes) vive em `cso-transp.caracore.com.br`. Clone local canónico: `D:\onedrive\dev\caracore-cso-releases`. A loja não substitui o SaaS. Em 08/11/2028 as duas frentes viram um só produto.

---

## 3. Mapa Canónico de Repositórios e Subdomínios

| Produto | Oficina (Código/Dev) | Loja (Vitrine/Release) | Subdomínio Oficial | Stack Principal |
|---|---|---|---|---|
| **Matriz Institucional** | `caracore-site` | — | `www.caracore.com.br` | HTML5 / Bootstrap / B2B |
| **Blog Christian Mulato** | `caracore-personal` | — | `personal.caracore.com.br` | Editorial / 259 artigos / RSS |
| **Wiki Institucional** | `caracore-wiki` | — | `wiki.caracore.com.br` | HTML5 / Multi-persona |
| **Artigos Retrô** | `caracore-retro` | — | `retro.caracore.com.br` | Editorial / 117 artigos |
| **PDV Desktop (Java)** | `caracore-pdv` | `caracore-pdv-releases` | `pdv.caracore.com.br` | Java 25 · Quarkus · SQLite · Free `v3.2.5-free` (navegador `localhost:8080/login`) · v4 RC2 Qute |
| **CaraCore PDV (Rust)** | `caracore-pdv-rust` | `caracore-rust-pdv-releases` (clone local `caracore-pdv-rust-releases`) | `pdv-rust.caracore.com.br` + [Releases](https://github.com/chmulato/caracore-rust-pdv-releases/releases) | Rust · Tauri 2 · React · SQLite |
| **CSO Frotas (Web)** | `caracore-cso-quarkus` | `caracore-cso-releases` (loja única · clone `D:\onedrive\dev\caracore-cso-releases`) | Aplicação: `cso.caracore.com.br` · Loja: `cso-transp.caracore.com.br` | Java 21 · Quarkus · PostgreSQL · Qute/HTMX |
| **CSO Transportes (Desktop)** | `caracore-cso-transportes` (oficina **sem** URL/copy de loja) | `caracore-cso-releases` (a **mesma** loja) | Loja: `cso-transp.caracore.com.br` · GA **08/11/2028** | Quarkus · JavaFX · Vue 3 · SQLite |
| **Ink Agenda** | `caracore-ink` | `caracore-ink-releases` | `ink.caracore.com.br` | Java 25 · JavaFX (Windows v2.0.0) · PWA em roadmap (**não antes de 2028**; Mac/Linux/Android; sem DMG/DEB) |
| **Minerador ETE 4.0** | `caracore-ete` | `caracore-ete-releases` | `ete.caracore.com.br` | Python · `v1.2.3` Ouro 4.0 · Windows/Linux/macOS |
| **CaraCore Hub** | `caracore-hub` | `caracore-hub-releases` | `hub.caracore.com.br` | Jakarta EE 10 · WAR/Tomcat · JSP |
| **Circuito Ferradura** | `caracore-circuito` | `caracore-circuito-releases` | `circuito.caracore.com.br` | Python · Lógica / Educação |
| **Reino OIDC** | `caracore-oidc` | `caracore-oidc-releases` | `oidc.caracore.com.br` | OAuth 2.1 · OIDC · Executável |
| **Área 51** | `caracore-area51` | `caracore-area51-releases` | `area51.caracore.com.br` | Python · Flask · Consultoria OIDC |
| **Helianto Condominium** | `caracore-helianto` | `caracore-helianto-releases` | `helianto.caracore.com.br` | Java 25 · Spring Boot 4 · React |
| **RU Soberano** | `caracore-ru` | `caracore-ru-releases` | `ru.caracore.com.br` | Java 25 · JavaFX · SQLite · Simulador |
| **Cara Core Seed** | `caracore-seed` | `caracore-seed-releases` | `seed.caracore.com.br` | Ferramenta interna (sem download) |
| **Cara Core MKT / Sala** | `caracore-mkt` / `caracore-tools` | `caracore-mkt-releases` | `mkt.caracore.com.br` | Ferramentas / `tools.caracore.com.br/sala/` |

---

## 4. Ambiente Centralizado Único (`AMBIENTE_CENTRALIZADO.md`)

Para garantir uniformidade e evitar retrabalho, todos os agentes devem obedecer ao setup unificado:
* **Python Centralizado:** Usar sempre o interpretador em `D:\dev\.venv\Scripts\python.exe`.
* **Maven Centralizado:** Usar o wrapper em `D:\dev\.mvn\bin\mvn.cmd` e o repositório em `D:\dev\.m2\repository`.
* **Script de Ativação:** `python D:\dev\bootstrap_env.py`.

---

## 5. Diretrizes de Comunicação e Discurso de Negócio

1. **Coexistência PDV (Java × Rust):**
 - Ambos são sistemas DESKTOP offline-first independentes.
 - NUNCA afirme que o PDV Rust *"substitui"* ou é uma *"migração forçada"* do PDV Java.
 - Java: canal maduro **`v3.2.5-free`** (Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; porta 8080 + `/login` no navegador; sem PIX integrado) · candidato **`v4.0.0-rc2`** (pré-release; não é o download Free). Loja: CTA = **Baixar Free**; Premium via demonstração.
 - Rust piloto `v0.1.4`.
 - V3 é a estratégia de negócio PME (com PIX Split 2027), comum a ambas as tecnologias.
 - Rust: loja própria (`pdv-rust.caracore.com.br`) e entrega própria de artefatos no **mesmo** repositório `chmulato/caracore-rust-pdv-releases` (GitHub Pages + GitHub Releases). Clone local da loja: `caracore-pdv-rust-releases` (nome da pasta ≠ nome no GitHub). Tag atual **`v0.1.4`**. Neste repo Rust, `/releases` e `/latest` são só o piloto. **Não** usar `caracore-pdv-releases` para o Rust (canal Java).
2. **CaraCore CSO (Estratégia Dual):**
   - **Frotas (Web):** Em produção ativa em `https://cso.caracore.com.br/` (Quarkus + Postgres). Oficina `caracore-cso-quarkus` (não existe oficina `caracore-cso-frotas`). **Em andamento** até 08/11/2026 = freeze Momento 1 (COE), não FRO completo nem GPS.
   - **Transportes (Desktop):** Produto bunker offline previsto para lançamento em **08/11/2028**. Oficina `caracore-cso-transportes` — **só código e docs técnicos**; sem URL, clone nem copy de loja. **Não** é a data do PDV v4.
   - **Vitrine (loja única):** clone canónico `D:\onedrive\dev\caracore-cso-releases` → `https://cso-transp.caracore.com.br/`. Home = conversão da Frotas (CTAs → `/cadastro` e planos). 2028/GPS/stack ficam abaixo. Sem instalador público até o GA do desktop. Em **08/11/2028** as duas frentes viram um só produto.
   - **Landing da aplicação (05/09/2026):** JSON-LD (Organization + SoftwareApplication + FAQPage), cache 5 min na `/`, LCP WebP. Copy lidera com “gestão de frotas”. Oficina `caracore-cso-quarkus`.
   - CSO de gestão **não** é rastreador GPS. Virtual Tracker™ é produto futuro, separado, 2028. Na loja: sem depoimento inventado e sem % de economia.
3. **CaraCore Hub:**
   - Gestão de **encomendas** para centros de distribuição (Mercado Livre, Shopee, Temu). **Não** é orquestrador interno da Cara Core nem Python/Flask (isso é Área 51).
   - Oficina web **2.1** (Jakarta EE 10 · WAR · Tomcat · JSP · PostgreSQL/Redis). O calendário oficial de GA é o **instalador Windows com SQLite** em **06/04/2027**.
   - Tia Sócia / Programa Tias Sócias é pitch ilustrativo, não o nome do produto.
   - Retomada para IAs na oficina: `caracore-hub/docs/contexto-rapido.md` · Cursor `.cursor/rules/project-memory.mdc`. Manual de uso público: `wiki.caracore.com.br/hub/`.
4. **Wiki única no portal:**
   - Toda a documentação de produto vive em `wiki.caracore.com.br` (`caracore-wiki`).
   - As lojas (`*.caracore.com.br`) ficam com vitrine, download e canal de feedback. URLs antigas `/wiki/` nas lojas redirecionam para o portal.
   - CSO: aplicação em `cso.caracore.com.br`; vitrine em `cso-transp.caracore.com.br`; alinhamento em `projeto-cso.html`.
5. **Cara Core Seed:**
   - Produto de licenciamento interno. A vitrine pública informa de forma honesta que o aplicativo não está em oferta aberta.

---

## 6. Calendário Oficial do Roadmap (Sincronizado)

* **Concluídos / Em Operação:**
 - PDV Desktop Java Free (`v3.2.5-free` · 100 vendas/mês · UI no navegador)
 - PDV Java v4 candidato (`v4.0.0-rc2` pré-release; corte T032 / GA **08/11/2026** ainda abertos)
 - Ink Agenda Desktop (`v2.0.0` estável em 26/06/2026)
  - Minerador 4.0 (`v1.2.3` Ouro 4.0)
  - Reino OIDC (`v2.0.0-RC1`)
  - Circuito Ferradura (Ativo)
  - Suporte Área 51 (Baseline `0.1.0-dev`)
  - CSO Frotas Web (Em produção)
* **Em Andamento (Garagem / Roadmap Público):**
  - **CaraCore PDV v4 (frente de GA público):** `08/11/2026` — plano `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md`
  - **CaraCore CSO Frotas (já no ar):** freeze Momento 1 em `08/11/2026` (`caracore-cso-quarkus/docs/plano-lancamento-2026-11-08.md`); FRO completo e Momento 2 **não** cabem neste dia
  - **CaraCore Hub (GA Instalador Windows):** `06/04/2027`
  - **RU Soberano (Simulador + Sala Retro):** `18/06/2027`
  - **CaraCore CSO Transportes (Desktop Bunker):** `08/11/2028` — **dois anos** depois do PDV v4
  - **Helianto Condominium (SaaS Condominial):** `30/12/2029` — Agent em 2029 (depois do Transportes)
  - **Ink Agenda PWA:** roadmap — Tab; **sem GA com Agent** até folga do núcleo (**não antes de 2028**); sem DMG/DEB; sprints `caracore-ink/docs/PLANO_PWA.md`
  - **Evolução de Negócio PDV V3 (PIX Split PME):** `2027` (papel; Agent depois do Hub no ar e com folga do FRO)

### Cota Cursor (fila única da empresa)

Assinatura **Pro US$ 20/mês**. A cota **não acumula**. Teto **80%**. Sem on-demand. **Um produto pesado por ciclo.** Tab não conta.

Canónico: [`caracore-site/docs/CALENDARIO_COTA_CURSOR.md`](caracore-site/docs/CALENDARIO_COTA_CURSOR.md)

| Período | Dono do Agent | Marco |
|---------|---------------|-------|
| set/2026 | CSO COE | Frotas já no ar |
| out–08/nov/2026 | **PDV v4** | GA 08/11/2026 |
| 09/nov–dez/2026 | PDV corte + CSO M1 | Freeze M1 |
| dez/2026–06/04/2027 | **Hub** | GA Windows 06/04/2027 |
| 08/04–dez/2027 | **CSO FRO** | núcleo frota 24/24 |
| 2028 | **CSO Transportes** | GA 08/11/2028 |
| 2029 | **Helianto** | GA 30/12/2029 |

Não abrir FRO-H em outubro/novembro (é PDV). Dezembro = **Hub**, não Ink. Ink PWA = Tab; Agent só com folga do núcleo (**não antes de 2028**). Momento 2 / PWA frota / Virtual Tracker **não** cabem neste envelope até depois de 2028. RU = Garagem sem mês de Agent. Helianto **não** abre Agent em 2027–2028. Guia se a decisão muda GA ou dono: [`RISCOS_ECOSSISTEMA.md`](caracore-site/docs/RISCOS_ECOSSISTEMA.md).

---

## 7. Documentos de Referência Rápida

- Este ficheiro (`AGENTS.md`) é a **fonte mestre para IAs** (Cursor, Copilot, Claude Code, Gemini, Antigravity).
- Cursor (sempre ativo): [`.cursor/rules/ecosystem-cara-core.mdc`](.cursor/rules/ecosystem-cara-core.mdc)
- Visão detalhada de ecossistema: [`caracore-site/docs/ECOSYSTEM_CARA_CORE.md`](caracore-site/docs/ECOSYSTEM_CARA_CORE.md)
- Cota Cursor (fila única da empresa): [`caracore-site/docs/CALENDARIO_COTA_CURSOR.md`](caracore-site/docs/CALENDARIO_COTA_CURSOR.md)
- Riscos / guia de decisão: [`caracore-site/docs/RISCOS_ECOSSISTEMA.md`](caracore-site/docs/RISCOS_ECOSSISTEMA.md)
- Memória de retomada de tarefas: [`caracore-site/docs/ECOSYSTEM_MEMORIA.md`](caracore-site/docs/ECOSYSTEM_MEMORIA.md)
- Guia para novas tarefas: [`caracore-site/docs/INICIAR_NOVA_TAREFA.md`](caracore-site/docs/INICIAR_NOVA_TAREFA.md)
- Validação matriz ↔ lojas: [`caracore-site/docs/VALIDACAO_LOJAS_MATRIZ.md`](caracore-site/docs/VALIDACAO_LOJAS_MATRIZ.md)
- Padrão de ambiente de dev: [`AMBIENTE_CENTRALIZADO.md`](AMBIENTE_CENTRALIZADO.md)
- Wiki do portal: [`caracore-wiki/docs/projeto-pdv.html`](caracore-wiki/docs/projeto-pdv.html) · [`projeto-cso.html`](caracore-wiki/docs/projeto-cso.html) · [`projeto-hub.html`](caracore-wiki/docs/projeto-hub.html) · manual Hub [`docs/hub/`](caracore-wiki/docs/hub/)
- Retomada Hub (GA Windows 2027): [`caracore-hub/docs/contexto-rapido.md`](caracore-hub/docs/contexto-rapido.md)
- Retomada PDV Java (candidato **estacionado** `v4.0.0-rc2`; canal maduro `v3.2.5-free`; **frente GA 08/11/2026**): [`caracore-pdv/AGENTS.md`](caracore-pdv/AGENTS.md) · [`PLANO_LANCAMENTO_V4.md`](caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md) · [`CONTINUIDADE_DESENVOLVIMENTO.md`](caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md)
- Retomada Minerador 4.0 (canal **v1.2.3**): [`caracore-ete/AGENTS.md`](caracore-ete/AGENTS.md) · loja `ete.caracore.com.br`

**Como outras IAs retomam (13/09/2026):** ler este `AGENTS.md` (bloco **Frentes até 08/11/2026** + **Cota Cursor**) → `.cursor/rules/ecosystem-cara-core.mdc` → `caracore-site/docs/CALENDARIO_COTA_CURSOR.md` → `caracore-site/docs/RISCOS_ECOSSISTEMA.md` (se mudar GA ou dono) → `caracore-site/docs/ECOSYSTEM_MEMORIA.md` (bloco **Status PDV Java**) → `INICIAR_NOVA_TAREFA.md` → `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` → `caracore-pdv/AGENTS.md`. **Patch Free** = checkout `v3.2.5-free` / `feature/free-shell-realista` (não o `master` Qute). **v4 PERF/T032** = `master` + `PLANO_LANCAMENTO_V4.md` (Cursor **out–nov/2026**). **Um produto pesado por ciclo** (US$ 20/mês). Hub: **dez/2026–06/04/2027**. CSO FRO: **08/04–dez/2027**. Ink PWA: Tab; **não antes de 2028**. 08/11/2026 = GA PDV v4 **e** freeze CSO M1; Transportes = **2028**; Helianto = **30/12/2029**. Loja Java = Free 3.2.5 (`admin`/`admin`, 1 operador). Rust piloto = `v0.1.4`. RC2 isolada até T032. Não misturar pasta, launcher, senha nem banco. Minerador ETE = **v1.2.3**.
