# Validação de negócio — ecossistema Cara Core

Objetivo: checklist de coerência comercial — produtos, preços, fluxos e discurso.
Uso interno. Atualizado: 2026-06-07.

Referências: ECOSYSTEM_LOJAS.md · VALIDACAO_LOJAS_MATRIZ.md · portfolio.html · docs/SITE_MATRIZ.md · DILEMA.md
Histórico detalhado (delivery/): docs/archive/sessoes-trabalho/VALIDACAO_NEGOCIO_HISTORICO.md


---


PREMISSA

- Foco em **engenharia B2B boutique** + produtos Bunker como prova de entrega; capacidade limitada (sem braço de startup).
- Matriz = home B2B (`#engenharia-b2b`), portfólio (`#decisoes-engenharia`), ecossistema; loja = vitrine e download (*.caracore.com.br).
- Filosofia Bunker: desktop soberano, operação local, SQLite onde aplicável.
- Copy comercial: frase-guia B2B (ver DILEMA.md) — sem “PJ” na vitrine institucional.


---


PRODUTOS EM FOCO

  #  Produto                         Loja canónica              Release / preço
  -- ------------------------------- -------------------------- ---------------------------
  1  CaraCore PDV Desktop (Java)     pdv.caracore.com.br        v3.2.2-free · Free/Premium
  2  Cara Core PDV Desktop (Rust)    rust-pdv + GitHub Releases   v0.1.2 · piloto · transparência loja
  3  chmulatoETE Minerador 4.0       ete.caracore.com.br        Free · Ouro 4.0 R$ 29,90
  4  Reino OIDC                      oidc.caracore.com.br        FREE · upgrade R$ 29,90
  5  Circuito Ferradura              circuito.caracore.com.br   FREE PF · escolas R$ 5/aluno/mês
  6  Cara Core Hub                   hub.caracore.com.br        B2B / sob consulta
  7  Suporte Área 51                 area51.caracore.com.br     serviço institucional
  8  Ink Agenda                      ink.caracore.com.br        v2.0.0-RC8
  9  CaraCore Seed                   seed.caracore.com.br       app não disponível (interno)

Garagem (portfólio + loja no ar):
 10  RU Soberano                       ru.caracore.com.br         lanç. 18/06/2027 · R$ 29,90
 11  Cara Core CSO                     cso.caracore.com.br        lanç. 08/11/2028

Gratuito institucional:
  - Cara Core Mkt / Sala — mkt.caracore.com.br · tools.caracore.com.br/sala/


---


PDV — DUAS LINHAS DESKTOP (discurso fixo)

  Java (maduro)     Rust + Tauri 2 (piloto)
  pdv.*             rust-pdv.*
  v3.2.2-free       v0.1.2
  Win/Linux/macOS   Windows · MSI pt-BR

  - Mesmo produto CaraCore PDV; stacks distintas; nenhuma substitui a outra.
  - Comparação única no portfólio: #pdv-coexistencia
  - Evitar: "PDV v3" sozinho, "substitui", "nova geração"


---


VALIDAÇÃO POR PRODUTO (resumo)


### 2.1 PDV Java

  Escopo          OK   localhost, SQLite, multi-plataforma
  Matriz          OK   portfolio#caracore-pdv, #pdv-coexistencia, #decisoes-engenharia (case coexistência)
  Loja            OK   pdv.caracore.com.br
  Preço           Atenção  Premium sem valor no portfólio (pode ser intencional)


### 2.2 PDV Rust

  Matriz          OK   portfolio#caracore-pdv-rust, #pdv-coexistencia
  Loja            OK   rust-pdv.caracore.com.br (sem SEED)
  Legado          OK   /delivery/pdv-rust → redirect


### 2.3 Minerador 4.0

  Matriz          OK   portfolio#minerador-ete
  Loja            OK   ete.caracore.com.br
  Ação            OK   Ouro 4.0 R$ 29,90 citado na loja; confirmar no portfólio se desejado


### 2.4 Reino OIDC

  Matriz          OK   portfolio#reino-oidc
  Loja            OK   oidc.caracore.com.br · EXE FREE + upgrade R$ 29,90


### 2.5 Circuito Ferradura

  Matriz          OK   portfolio#circuito-python
  Loja            OK   circuito.caracore.com.br · portal escolas


### 2.6 Hub

  Matriz          OK   portfolio#caracore-hub
  Loja            OK   hub.caracore.com.br · slides Tia Sócia


### 2.7 Área 51

  Matriz          OK   portfolio#area-51
  Loja            OK   area51.caracore.com.br


### 2.8 Seed

  Matriz          OK   portfolio#caracore-seed (sem download/compra)
  Loja            OK   mensagem "aplicação não disponível"


### 2.9 Ink Agenda

  Matriz          OK   portfolio#caracore-ink-agenda
  Loja            OK   ink.caracore.com.br · RC8


### 2.10 RU / CSO (garagem)

  Matriz          OK   portfolio + ecosistema (Garagem)
  Datas           OK   RU 18/06/2027 · CSO 08/11/2028


---


FLUXOS DO CLIENTE (smoke test)

  Portfólio → #decisoes-engenharia → index#engenharia-b2b (contratação B2B)
  Portfólio → loja do produto → download (ou feedback)
  Portfólio → #pdv-coexistencia → escolher Java ou Rust
  Ecossistema → link subdomínio
  URL legado /delivery/* → redirect para loja


---


CONSISTÊNCIA DE PREÇOS (onde visível)

  R$ 29,90 único: Minerador Ouro 4.0 · Reino upgrade · RU simulador
  R$ 5/aluno/mês: Circuito Ferradura (escolas)
  Free/Premium: PDV Java
  B2B / consulta: Hub · Área 51


---


AÇÕES RECOMENDADAS (prioridade)


## 1. Revisão periódica com VALIDACAO_LOJAS_MATRIZ.md antes de deploy matriz


## 2. Novos CTAs sempre → subdomínio da loja


## 3. Release nova → actualizar #portfolio-releases no portfólio


## 4. PDV Rust: manter valor comercial da stack na loja rust-pdv (não na matriz)


## 5. Premium PDV Java: decidir se divulga valor no portfólio ou mantém sob consulta



---


Cara Core Informática — CNPJ 23.969.028/0001-37
