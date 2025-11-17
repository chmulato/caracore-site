# Setup do Favicon para GitHub Pages

## Problema

GitHub Pages não suporta redirecionamentos de servidor (`.htaccess` ou `web.config`). O navegador tenta buscar `/favicon.ico` automaticamente antes de ler o HTML, causando erro 404 se o arquivo não estiver na raiz.

## Solução

O arquivo `favicon.ico` precisa estar na **raiz do projeto** para funcionar no GitHub Pages.

## Como configurar

### Opção 1: Usando npm scripts (Recomendado)

**Windows:**
```bash
npm run setup:favicon:windows
```

**Linux/Mac:**
```bash
npm run setup:favicon
```

### Opção 2: Executar script diretamente

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-favicon.ps1
```

**Linux/Mac (Bash):**
```bash
bash scripts/setup-favicon.sh
```

### Opção 3: Copiar manualmente

```bash
# Windows
copy images\favicon.ico favicon.ico

# Linux/Mac
cp images/favicon.ico favicon.ico
```

## Quando executar

Execute o script sempre que:
- Fizer deploy para produção
- Atualizar o favicon em `images/favicon.ico`
- Antes de fazer commit/push para o GitHub

## Nota sobre Netlify

Se você também usa Netlify, o arquivo `_redirects` na raiz já está configurado para redirecionar `/favicon.ico` → `/images/favicon.ico`.

## Verificação

Após executar o script, verifique se o arquivo foi criado:
```bash
# Windows
dir favicon.ico

# Linux/Mac
ls -la favicon.ico
```

