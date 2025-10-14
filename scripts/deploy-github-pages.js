#!/usr/bin/env node

/**
 * Script para preparar e fazer deploy do site para GitHub Pages
 * Este script configura os arquivos necessários para o GitHub Pages
 * e garante que a autenticação OIDC funcione corretamente com o domínio personalizado
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const REPO = 'chmulato/cara-core';
const BRANCH = 'gh-pages';
const CNAME = 'www.caracore.com.br';
const BACKEND_URL = 'https://caracore-backend.azurewebsites.net';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

console.log(`${colors.bright}${colors.green}Iniciando deploy para GitHub Pages${colors.reset}`);

// Verificar se estamos no diretório raiz do projeto
if (!fs.existsSync('index.html') || !fs.existsSync('js/config.js')) {
  console.error(`${colors.red}Este script deve ser executado no diretório raiz do projeto!${colors.reset}`);
  process.exit(1);
}

// Função para executar comandos
function execute(command) {
  try {
    console.log(`${colors.yellow}> ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Falha ao executar: ${command}${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

// Verifica se os arquivos de configuração para GitHub Pages existem
function checkAndCreateFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}Criando ${filePath}${colors.reset}`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Criar arquivos necessários para GitHub Pages
checkAndCreateFile('.nojekyll', '');
checkAndCreateFile('_redirects', `/*    /index.html   200\n/secure/*    /secure/index.html   200`);
checkAndCreateFile('CNAME', CNAME);

// Verificar se os arquivos de configuração OIDC estão apontando para o backend correto
const configFilePath = path.join('js', 'config.js');
let configContent = fs.readFileSync(configFilePath, 'utf8');

// Verificar e atualizar os endpoints de token
const googleEndpointRegex = /googleTokenEndpoint:\s*['"]([^'"]+)['"]/;
const msEndpointRegex = /microsoftTokenEndpoint:\s*['"]([^'"]+)['"]/;

let googleEndpoint = googleEndpointRegex.exec(configContent);
let msEndpoint = msEndpointRegex.exec(configContent);

if (!googleEndpoint || !googleEndpoint[1].includes('caracore-backend.azurewebsites.net')) {
  console.log(`${colors.yellow}Atualizando endpoint do Google no config.js${colors.reset}`);
  configContent = configContent.replace(
    googleEndpointRegex,
    `googleTokenEndpoint: '${BACKEND_URL}/oauth/google/token'`
  );
}

if (!msEndpoint || !msEndpoint[1].includes('caracore-backend.azurewebsites.net')) {
  console.log(`${colors.yellow}Atualizando endpoint do Microsoft no config.js${colors.reset}`);
  configContent = configContent.replace(
    msEndpointRegex,
    `microsoftTokenEndpoint: '${BACKEND_URL}/oauth/microsoft/token'`
  );
  
  // Se não existir, adiciona a configuração
  if (!msEndpoint) {
    const googleEndpointLine = `googleTokenEndpoint: '${BACKEND_URL}/oauth/google/token',`;
    const microsoftEndpointLine = `microsoftTokenEndpoint: '${BACKEND_URL}/oauth/microsoft/token',`;
    
    configContent = configContent.replace(
      googleEndpointLine,
      `${googleEndpointLine}\n  ${microsoftEndpointLine}`
    );
  }
}

fs.writeFileSync(configFilePath, configContent);

// Verificar arquivo dynamic-config.js
const dynamicConfigPath = path.join('secure', 'dynamic-config.js');
let dynamicConfigContent = fs.readFileSync(dynamicConfigPath, 'utf8');

// Verificar e atualizar as linhas de serverTokenEndpoint e microsoftTokenEndpoint
if (!dynamicConfigContent.includes(`"${BACKEND_URL}/oauth/google/token"`)) {
  console.log(`${colors.yellow}Atualizando serverTokenEndpoint no dynamic-config.js${colors.reset}`);
  dynamicConfigContent = dynamicConfigContent.replace(
    /const serverTokenEndpoint = [^;]+;/,
    `const serverTokenEndpoint = (window.CARA_CORE_CONFIG && window.CARA_CORE_CONFIG.googleTokenEndpoint) || "${BACKEND_URL}/oauth/google/token";`
  );
}

if (!dynamicConfigContent.includes(`"${BACKEND_URL}/oauth/microsoft/token"`)) {
  console.log(`${colors.yellow}Atualizando microsoftTokenEndpoint no dynamic-config.js${colors.reset}`);
  dynamicConfigContent = dynamicConfigContent.replace(
    /const microsoftTokenEndpoint = [^;]+;/,
    `const microsoftTokenEndpoint = window.CARA_CORE_CONFIG?.microsoftTokenEndpoint || "${BACKEND_URL}/oauth/microsoft/token";`
  );
}

fs.writeFileSync(dynamicConfigPath, dynamicConfigContent);

// Confirmar mudanças
console.log(`${colors.green}Arquivos de configuração atualizados para apontar para: ${BACKEND_URL}${colors.reset}`);

// Perguntar se deseja prosseguir com o deploy
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`${colors.bright}Deseja prosseguir com o deploy para GitHub Pages? (S/N) ${colors.reset}`, answer => {
  readline.close();
  
  if (answer.toLowerCase() !== 's') {
    console.log(`${colors.yellow}Deploy cancelado.${colors.reset}`);
    process.exit(0);
  }
  
  // Prosseguir com o deploy
  console.log(`${colors.bright}${colors.green}Iniciando deploy...${colors.reset}`);
  
  // Adicionar mudanças ao git
  if (!execute('git add .')) process.exit(1);
  
  // Commit das mudanças
  if (!execute('git commit -m "Configuração para GitHub Pages e OIDC"')) {
    console.log(`${colors.yellow}Não há mudanças para commit ou ocorreu um erro.${colors.reset}`);
  }
  
  // Deploy para GitHub Pages usando gh-pages ou git subtree
  const deployCommand = `npx gh-pages -d . -b ${BRANCH} -r git@github.com:${REPO}.git`;
  if (!execute(deployCommand)) {
    console.error(`${colors.red}Falha no deploy. Tente manualmente:${colors.reset}`);
    console.log(`git subtree push --prefix . origin ${BRANCH}`);
    process.exit(1);
  }
  
  console.log(`${colors.bright}${colors.green}Deploy concluído com sucesso!${colors.reset}`);
  console.log(`${colors.bright}Site disponível em: https://${CNAME}${colors.reset}`);
});