# Conversor de Diagramas Mermaid para PNG

Scripts para converter arquivos `.mmd` (Mermaid) em imagens PNG de alta qualidade.

## Pré-requisitos

Instalar o Mermaid CLI:

```bash
# Via npm (recomendado)
npm install -g @mermaid-js/mermaid-cli

# Via Chocolatey (Windows)
choco install mermaid-cli
```

## Uso

### Python (Recomendado)

```bash
# Executar o script
python convert-diagrams.py

# Ou tornar executável (Linux/Mac)
chmod +x convert-diagrams.py
./convert-diagrams.py
```

### PowerShell (Alternativo)

```powershell
# Executar o script
.\convert-diagrams.ps1
```

## Funcionalidades

- Converte arquivos `.mmd` para `.png` com alta qualidade
- Resolução padrão: 1920x1080
- Escala 2x para melhor qualidade
- Fundo branco
- Lista todos os arquivos PNG após conversão
- Exibe tamanho dos arquivos gerados

## Diagramas Incluídos

1. `area51-architecture.mmd` - Arquitetura do sistema Área 51
2. `caracore-hub-architecture.mmd` - Arquitetura do sistema Hub
3. `caracore-seed-architecture.mmd` - Arquitetura do template Seed
4. `reino-oidc-journey.mmd` - Jornada educacional OIDC

## Configuração

Para alterar as configurações de qualidade, edite as variáveis no script:

```python
width = 1920           # Largura da imagem
height = 1080          # Altura da imagem
background_color = "white"  # Cor de fundo
scale = 2              # Escala (1-3, maior = melhor qualidade)
```

## Saída

Os arquivos PNG são gerados no mesmo diretório dos arquivos `.mmd`:

```text
D:\dev\site\cara-core\images\portfolio\
├── area51-architecture.mmd
├── area51-architecture.png            (gerado)
├── caracore-hub-architecture.mmd
├── caracore-hub-architecture.png      (gerado)
├── caracore-seed-architecture.mmd
├── caracore-seed-architecture.png     (gerado)
├── reino-oidc-journey.mmd
└── reino-oidc-journey.png             (gerado)
```

## Troubleshooting

### Erro: "mmdc não está instalado"

Solução:
```bash
npm install -g @mermaid-js/mermaid-cli
```

### Erro: "Arquivo não encontrado"

Verifique se os arquivos `.mmd` existem no diretório:
```bash
ls -la D:\dev\site\cara-core\images\portfolio\*.mmd
```

### Python não reconhecido

Certifique-se de que Python 3.7+ está instalado:
```bash
python --version
```

## Diferenças entre Versões

| Recurso | Python | PowerShell |
|---------|--------|------------|
| Cross-platform | Sim | Não (Windows only) |
| Colorização | Sim | Sim |
| Tratamento de erros | Robusto | Básico |
| Controle Ctrl+C | Sim | Parcial |
| Dependências | Python 3.7+ | PowerShell 5.1+ |

## Autor

Christian Vladimir Uhdre Mulato  
Cara Core Informática
