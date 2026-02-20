# MIRROR — Circuito Ferradura (Delivery)

Este diretório é a **matriz** do delivery do **Circuito Ferradura** (Cara Core Informática): controle centralizado, vitrine e links para o curso, feedback, licença e portal escolas.

## Regra: apresentação de loja só na Matriz e na Filial

- **Repositórios privados** (ex.: circuito_python) **não** contêm apresentação de loja filial; apenas curso (HTML), app e código-fonte.
- **Loja filial:** apenas em **circuito-python-releases** (vitrine pública).
- **Apresentação (delivery):** apenas na **Matriz** Cara Core Informática (este diretório: delivery/circuito).
- **Matriz e filial** devem estar alinhadas com a **mesma transparência de negócio** (FREE × escolas, aviso legal).

## Espelho Filial

A **filial** (balcão de vendas, feedback e portal para escolas) fica em:

- **Repositório:** [chmulato/circuito-python-releases](https://github.com/chmulato/circuito-python-releases)
- **Site (GitHub Pages):** `https://chmulato.github.io/circuito-python-releases/`

O conteúdo da filial espelha este delivery (matriz): balcão, canal-feedback, licença de uso e portal escolas. Na filial é feito o controle do **valor recorrente mensal** (R$ 5,00/aluno) para escolas de ensino médio.

## Produto (mesma lógica do Minerador 4.0)

- **Circuito Ferradura:** versão **gratuita para pessoas físicas** (jovens entusiastas e curiosos da programação). O curso, as narrativas e os materiais são **propriedade exclusiva** da Cara Core Informática (não é open source).
- **Instituições de ensino (Brasil):** uso em ambiente escolar exige **licença obrigatória** — R$ 5,00 mensais por aluno matriculado. Uso sem licença pode configurar **pirataria** e **responsabilização legal** (legislação de direitos autorais). Cara Core atua com profissionalismo e transparência.
- **Curso:** disponível em formato HTML no repositório do produto (`circuito_python`) e em `https://chmulato.github.io/circuito_python/`. **Diploma/certificado:** assinatura e verificação criptográfica implementadas no repositório do produto.

## Páginas (matriz)

| Página | Descrição |
|--------|-----------|
| `index.html` | Balcão: vitrine, versão gratuita para pessoas físicas × licença para escolas, links curso/feedback/licença/portal escolas |
| `curso/` | **Curso HTML completo — 6 fases** (copiado de `caracore-circuito/pages_ferradura/`). Também copiado para `caracore-circuito-releases/docs/curso/`. CTA primary aponta para `curso/index.html` em ambas. |
| `canal-feedback.html` | E-mail, WhatsApp, Telegram. Não atendemos ligações. |
| `licenca-uso.html` | Uso gratuito para pessoas físicas; licença a pagamento escolas; **curso proprietário — não é MIT, não é open source** |
| `portal-escolas.html` | Para escolas: regularizar licença R$ 5,00/aluno/mês |

> ⚠️ **Decisão 19/02/2026:** Curso HTML copiado para `delivery/circuito/curso/` (matriz) e `caracore-circuito-releases/docs/curso/` (loja). CTAs primary atualizados de link externo GitHub Pages para `curso/index.html` relativo. Mensagem "Licença proprietária — não é MIT, não é open source" adicionada a ambas as páginas `index.html`.

## Atualização do espelho

Ao alterar páginas na matriz, considerar atualizar as equivalentes na filial (`circuito-python-releases/docs/`) para manter mensagem e links alinhados (principalmente canal de feedback, valor e contatos).
