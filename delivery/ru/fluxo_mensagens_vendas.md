# Fluxo de Mensagens — Portal de Vendas RU Soberano
## Cara Core Informática · Conversion & Technical Support

Este documento define o fluxo de mensagens para WhatsApp/Telegram e e-mail no portal de vendas do RU Soberano. Use os blocos abaixo em automação ou copie/cole nas conversas.

---

## 1. Script de Boas-Vindas (WhatsApp / Telegram)

**Quando:** Primeiro contato do aluno interessado na versão FULL (SOVEREIGN).

**Objetivo:** Coletar o HWID de forma técnica e explicar a Sintonização Fina.

---

*Olá! Bem-vindo ao fluxo de ativação do **RU Soberano** — simulador de reator PFR com kernel Langmuir-Hinshelwood.*

*Para gerar sua licença pessoal e intransferível, precisamos do **identificador de hardware (HWID)** da máquina em que o simulador será executado.*

*Como obter o HWID:*
1. *Execute o RU Soberano (versão FREE ou o executável que você já tenha).*
2. *Se ocorrer qualquer desestabilização do reator, o **Painel de Reporte Soberano** será exibido — no corpo do e-mail de reporte já virá o código no formato `BUG_REPORT: [XXXXXXXX]`. Esse valor de 8 caracteres em hexadecimal é o seu HWID.*
3. *Se preferir obter sem falha: na pasta do executável, rode o coletor de HWID (ou use o próprio simulador; em versões futuras haverá opção "Gerar HWID" no menu). Alternativa: envie o código que aparece em "Reporte Soberano" em qualquer momento.*

*Por que pedimos o HWID? O simulador exige uma **Sintonização Fina** com o hardware para garantir a precisão dos cálculos termodinâmicos (Gibbs) e do kernel de processos. A chave de licença é vinculada a esse identificador para assegurar que você tenha a melhor experiência de engenharia possível.*

*Assim que você enviar o HWID (8 caracteres hexadecimais, ex.: `6B4ABD64`), seguimos para os próximos passos.*

---

**Variante curta (se o aluno já sabe o que é HWID):**

*Olá! Para ativar o RU Soberano (SOVEREIGN) nesta máquina, precisamos do **HWID** (8 caracteres hex). Ele aparece no Painel de Reporte Soberano ou no e-mail de reporte de bug. O simulador usa esse ID para Sintonização Fina com o hardware e precisão dos cálculos de Gibbs. Envie o código quando tiver.*

---

## 2. Visualização de Valor (O Teaser)

**Quando:** Após o aluno confirmar interesse ou antes do checkout (automático ou ao solicitar “quero ver o que vou receber”).

**Ação:** Enviar **uma imagem do Data Sheet Profissional** que ele receberá na versão FULL.

**Asset sugerido:** Captura ou export do Data Sheet do ciclo (RMSE sim vs L-H, parâmetros, snapshot) — gerado pelo kernel do simulador (ex.: `src/telemetry.py`, `src/dashboard_pro.py` ou relatório de operação). Criar uma imagem estática “Data Sheet Profissional” (ex.: PNG/JPG) e armazenar em `delivery/ru/assets/` ou no repositório da loja para envio automático.

**Frase a enviar junto da imagem:**

*O Café Mania 2.0 termina aqui. O que você está prestes a desbloquear é o **Kernel de Processos Soberano**: Data Sheet profissional por ciclo, relatórios de operação e a Cena Final (35 anos) no simulador. Esta é a amostra do que você recebe na versão FULL.*

---

**Texto alternativo (só texto, sem imagem):**

*O Café Mania 2.0 termina aqui. O que você está prestes a desbloquear é o Kernel de Processos Soberano — Data Sheet profissional por ciclo de simulação, RMSE Langmuir-Hinshelwood, snapshot de estado e Dossiê Soberano em PDF. Tudo isso na versão FULL.*

---

## 3. Automação de Checkout (resposta pós-PIX)

**Quando:** Imediatamente após confirmação de pagamento (PIX) no seu sistema ou manualmente após conferência.

**Mensagem (WhatsApp / Telegram):**

*Identidade validada. Gerando sua chave de criptografia RSA para o simulador...*

*(aguarde alguns segundos na automação, se possível)*

*Sua licença está sendo preparada. Em instantes você receberá um e-mail com o anexo **license.key**, o link para download do executável blindado (PyArmor) e o **Dossiê Soberano** em PDF. Obrigado por escolher a Cara Core Informática.*

---

**Variante mínima (uma única mensagem):**

*Identidade validada. Gerando sua chave de criptografia RSA para o simulador. Você receberá em breve o e-mail de entrega com license.key, link do executável e Dossiê Soberano em PDF. Parabéns pela ascensão.*

---

## 4. Instruções Pós-Venda — E-mail de Entrega

**Quando:** Após geração do `license.key` e disponibilização do link do executável e do Dossiê em PDF.

**Assunto sugerido:** `RU Soberano — Sua licença e Dossiê Soberano (Cara Core Informática)`

**Template em HTML:** ver arquivo `email_pos_venda.html` nesta pasta.

**Tom:** Parabéns pela Ascensão Acadêmica; entrega clara e técnica.

**Elementos obrigatórios no e-mail:**
- Saudação pelo nome (ou “Prezado(a) aluno(a)”).
- Parabéns pela aquisição / “ascensão acadêmica”.
- Anexo: **Dossiê Soberano** (PDF).
- Link para download do **executável blindado** (PyArmor) — Windows.
- Instrução: colocar o arquivo `license.key` (anexo ou enviado em mensagem separada) na pasta `config/` junto ao executável.
- Lembrete: licença pessoal e intransferível; suporte: suporte@caracore.com.br, WhatsApp ou Telegram +55 (41) 9 9909-7797. Não atendemos ligações telefônicas.
- Assinatura: Cara Core Informática.

---

## Resumo do fluxo

| Etapa | Canal | Conteúdo |
|-------|--------|----------|
| 1. Boas-vindas | WhatsApp/Telegram | Pedir HWID; explicar Sintonização Fina e precisão Gibbs |
| 2. Teaser | WhatsApp/Telegram | Imagem do Data Sheet + frase “Café Mania 2.0 termina aqui…” / Kernel Soberano |
| 3. Pós-PIX | WhatsApp/Telegram | “Identidade validada. Gerando chave RSA…” + confirmação do e-mail de entrega |
| 4. Entrega | E-mail | Parabéns Ascensão Acadêmica; anexo Dossiê PDF; link executável; instrução license.key |

---

*Documento gerado para o portal de vendas da Cara Core Informática. RU Soberano — Lançamento 18/Junho/2026 · R$ 29,90.*
