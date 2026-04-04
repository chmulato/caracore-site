# Checklist de Publicacao de Artefatos - ETE e PDV

Data base: 2026-03-14
Escopo: endpoints institucionais no dominio da matriz

## Objetivo

Publicar os binarios finais e checksums reais nos endpoints:

- `/delivery/ete/artifacts/`
- `/delivery/pdv/artifacts/`

Sem reintroduzir dependencia de owner pessoal, API externa ou `releases/latest` no fluxo principal comercial.

Modelo de seguranca adotado:

- Entrega publica direta de `.exe` desabilitada por padrao.
- Distribuicao via solicitacao institucional para ambientes remotos controlados.
- Checksums e guia tecnico permanecem publicados para validacao.

Regra comercial obrigatoria:

- Versao Free: entrega sem cobranca, com registro minimo LGPD (nome da loja, canal, consentimento, timestamp).
- Versao Premium: entrega/licenciamento somente apos confirmacao de pagamento.
- Toda entrega Premium deve possuir registro LGPD completo (finalidade, base legal, retencao e operador responsavel).

## Pre-condicoes

1. Binarios finais disponiveis localmente:

- `Minerador40.exe`
- `CaraCorePDV.exe`

1. Acesso de escrita ao repositorio `caracore-site`.

1. Branch correto selecionado e working tree revisado.

## Publicacao - ETE

1. Copiar binario para a pasta de artefatos:

```powershell
Copy-Item "<CAMINHO_LOCAL>\Minerador40.exe" "d:\dev\caracore-site\delivery\ete\artifacts\Minerador40.exe" -Force
```

1. Gerar checksums reais (SHA-256 e MD5):

```powershell
Set-Location "d:\dev\caracore-site\delivery\ete\artifacts"
(Get-FileHash -Path ".\Minerador40.exe" -Algorithm SHA256).Hash + "  Minerador40.exe" | Set-Content -Path ".\checksum.sha256" -Encoding ASCII
(Get-FileHash -Path ".\Minerador40.exe" -Algorithm MD5).Hash + "  Minerador40.exe" | Set-Content -Path ".\checksum.md5" -Encoding ASCII
```

1. Verificar se os checksums nao estao com placeholder:

```powershell
Get-Content ".\checksum.sha256"
Get-Content ".\checksum.md5"
```

## Publicacao - PDV

1. Copiar binario para a pasta de artefatos:

```powershell
Copy-Item "<CAMINHO_LOCAL>\CaraCorePDV.exe" "d:\dev\caracore-site\delivery\pdv\artifacts\CaraCorePDV.exe" -Force
```

1. Gerar checksums reais (SHA-256 e MD5):

```powershell
Set-Location "d:\dev\caracore-site\delivery\pdv\artifacts"
(Get-FileHash -Path ".\CaraCorePDV.exe" -Algorithm SHA256).Hash + "  CaraCorePDV.exe" | Set-Content -Path ".\checksum.sha256" -Encoding ASCII
(Get-FileHash -Path ".\CaraCorePDV.exe" -Algorithm MD5).Hash + "  CaraCorePDV.exe" | Set-Content -Path ".\checksum.md5" -Encoding ASCII
```

1. Verificar se os checksums nao estao com placeholder:

```powershell
Get-Content ".\checksum.sha256"
Get-Content ".\checksum.md5"
```

## Smoke test funcional (URL)

1. Abrir:

- `/delivery/ete/download-oficial.html`
- `/delivery/pdv/download-oficial.html`

1. Confirmar:

- CTA principal abre solicitacao de entrega segura (canal institucional)
- Arquivos `checksum.sha256` e `checksum.md5` abrem sem erro
- Guia tecnico abre sem erro

## Revalidacao de sanidade

Executar varredura no escopo de download:

```powershell
Set-Location "d:\dev\caracore-site"
rg -n "caracore.com.br|api.github.com/repos|OWNER|REPO|releases/latest" delivery/ete/download*.html delivery/pdv/download*.html
```

Esperado: zero matches.

## Handoff de fechamento

1. Atualizar `docs/SANIDADE_TAREFAS_HARDENING.md` com data/hora da publicacao binaria.
1. Registrar versao publicada de cada binario.
1. Confirmar que o fallback institucional (`canal-feedback.html`) permanece ativo.
1. Registrar atendimento no modelo LGPD em `docs/REGISTRO_LGPD_ENTREGA_CLIENTES.md` (ou sistema interno equivalente).

## Registro operacional LGPD (entrega)

Campos minimos por atendimento:

- Protocolo interno (ex.: `LGPD-<timestamp>`)
- Produto e versao (ETE Free, ETE Premium, PDV Free, PDV Premium)
- Nome da loja/cliente e canal de contato
- Consentimento e finalidade declarada
- Status de pagamento (obrigatorio para Premium)
- Data/hora da liberacao e responsavel
- Prazo de retencao e status de descarte

## Automacao de fechamento (opcional)

ApÃ³s publicar binarios e checksums reais, execute:

```powershell
Set-Location "d:\dev\caracore-site\scripts"
.\finalize-artifact-go-live.ps1
```

Esse script valida artefatos/checksums e troca os CTAs primarios de `download-oficial.html` para apontarem diretamente aos arquivos `.exe`.

No modo padrao, o script **nao** habilita `.exe` publico. Para excecao controlada:

```powershell
Set-Location "d:\dev\caracore-site\scripts"
.\finalize-artifact-go-live.ps1 -AllowPublicExe
```

