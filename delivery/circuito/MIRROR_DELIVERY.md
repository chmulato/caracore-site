# MIRROR â€” Circuito Ferradura (Delivery)

Este diretÃ³rio Ã© a **matriz** do delivery do **Circuito Ferradura** (Cara Core InformÃ¡tica): controle centralizado, vitrine e links para o curso, feedback, licenÃ§a e portal escolas.

## Regra: apresentaÃ§Ã£o de loja sÃ³ na Matriz e na Filial

- **RepositÃ³rios privados** (ex.: circuito_python) **nÃ£o** contÃªm apresentaÃ§Ã£o de loja filial; apenas curso (HTML), app e cÃ³digo-fonte.
- **Loja filial:** apenas em **circuito-python-releases** (vitrine pÃºblica).
- **ApresentaÃ§Ã£o (delivery):** apenas na **Matriz** Cara Core InformÃ¡tica (este diretÃ³rio: delivery/circuito).
- **Matriz e filial** devem estar alinhadas com a **mesma transparÃªncia de negÃ³cio** (FREE Ã— escolas, aviso legal).

## Espelho Filial

A **filial** (balcÃ£o de vendas, feedback e portal para escolas) fica em:

- **RepositÃ³rio:** [chmulato/circuito-python-releases](https://circuito.caracore.com.br/)
- **Site (GitHub Pages):** `https://circuito.caracore.com.br/`

O conteÃºdo da filial espelha este delivery (matriz): balcÃ£o, canal-feedback, licenÃ§a de uso e portal escolas. Na filial Ã© feito o controle do **valor recorrente mensal** (R$ 5,00/aluno) para escolas de ensino mÃ©dio.

## Produto (mesma lÃ³gica do Minerador 4.0)

- **Circuito Ferradura:** versÃ£o **gratuita para pessoas fÃ­sicas** (jovens entusiastas e curiosos da programaÃ§Ã£o). O curso, as narrativas e os materiais sÃ£o **propriedade exclusiva** da Cara Core InformÃ¡tica (nÃ£o Ã© open source).
- **InstituiÃ§Ãµes de ensino (Brasil):** uso em ambiente escolar exige **licenÃ§a obrigatÃ³ria** â€” R$ 5,00 mensais por aluno matriculado. Uso sem licenÃ§a pode configurar **pirataria** e **responsabilizaÃ§Ã£o legal** (legislaÃ§Ã£o de direitos autorais). Cara Core atua com profissionalismo e transparÃªncia.
- **Curso:** disponÃ­vel em formato HTML no repositÃ³rio do produto (`circuito_python`) e em `https://circuito.caracore.com.br/`. **Diploma/certificado:** assinatura e verificaÃ§Ã£o criptogrÃ¡fica implementadas no repositÃ³rio do produto.

## PÃ¡ginas (matriz)

| PÃ¡gina | DescriÃ§Ã£o |
|--------|-----------|
| `index.html` | BalcÃ£o: vitrine, versÃ£o gratuita para pessoas fÃ­sicas Ã— licenÃ§a para escolas, links curso/feedback/licenÃ§a/portal escolas |
| `curso/` | **Curso HTML completo â€” 6 fases** (copiado de `caracore-circuito/pages_ferradura/`). TambÃ©m copiado para `caracore-circuito-releases/docs/curso/`. CTA primary aponta para `curso/index.html` em ambas. |
| `canal-feedback.html` | E-mail, WhatsApp, Telegram. NÃ£o atendemos ligaÃ§Ãµes. |
| `licenca-uso.html` | Uso gratuito para pessoas fÃ­sicas; licenÃ§a a pagamento escolas; **curso proprietÃ¡rio â€” nÃ£o Ã© MIT, nÃ£o Ã© open source** |
| `portal-escolas.html` | Para escolas: regularizar licenÃ§a R$ 5,00/aluno/mÃªs |

> âš ï¸ **DecisÃ£o 19/02/2026:** Curso HTML copiado para `delivery/circuito/curso/` (matriz) e `caracore-circuito-releases/docs/curso/` (loja). CTAs primary atualizados de link externo GitHub Pages para `curso/index.html` relativo. Mensagem "LicenÃ§a proprietÃ¡ria â€” nÃ£o Ã© MIT, nÃ£o Ã© open source" adicionada a ambas as pÃ¡ginas `index.html`.

## AtualizaÃ§Ã£o do espelho

Ao alterar pÃ¡ginas na matriz, considerar atualizar as equivalentes na filial (`circuito-python-releases/docs/`) para manter mensagem e links alinhados (principalmente canal de feedback, valor e contatos).

