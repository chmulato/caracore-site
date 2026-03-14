# CaraCore PDV - Instalacao (Canal Institucional)

Status atual: artefato binario em publicacao institucional.

## Arquivos previstos neste endpoint

- CaraCorePDV.exe
- checksum.sha256
- checksum.md5

## Procedimento temporario

1. Use o canal institucional em ../canal-feedback.html para solicitar o pacote oficial.
1. Ao receber o pacote, valide o hash SHA-256 com PowerShell:

```powershell
Get-FileHash -Path .\CaraCorePDV.exe -Algorithm SHA256
```

1. Compare com o valor de checksum.sha256.

## Checklist de go-live

1. Publicar `CaraCorePDV.exe` nesta pasta.
1. Substituir `checksum.sha256` e `checksum.md5` com hashes reais.
1. Validar abertura de `/delivery/pdv/download-oficial.html` e do link do endpoint oficial.

## Observacao

Este endpoint foi publicado para estabilidade de URL no dominio da matriz. O binario sera colocado nesta pasta na proxima janela de publicacao.
