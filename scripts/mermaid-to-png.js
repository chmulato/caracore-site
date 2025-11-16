#!/usr/bin/env node
/**
 * Script para converter diagramas Mermaid (.mmd) para PNG
 * Requer: @mermaid-js/mermaid-cli
 * 
 * Uso:
 *   node scripts/mermaid-to-png.js <input.mmd> [output.png]
 * 
 * Exemplo:
 *   node scripts/mermaid-to-png.js area51/wiki/assets/architecture-area51.mmd
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function convertMermaidToPng() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('❌ Erro: Forneça o caminho do arquivo .mmd');
        console.log('Uso: node scripts/mermaid-to-png.js <input.mmd> [output.png]');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.mmd', '.png');
    
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Erro: Arquivo não encontrado: ${inputFile}`);
        process.exit(1);
    }
    
    console.log('🚀 Convertendo Mermaid para PNG...');
    console.log(`📄 Input:  ${inputFile}`);
    console.log(`🖼️  Output: ${outputFile}`);
    
    const mmdc = spawn('npx', [
        'mmdc',
        '-i', inputFile,
        '-o', outputFile,
        '-b', 'white',
        '-w', '1920',
        '-H', '1080',
        '-s', '2'
    ]);
    
    mmdc.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    
    mmdc.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    
    mmdc.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Conversão concluída com sucesso!');
            console.log(`📁 Arquivo salvo em: ${path.resolve(outputFile)}`);
        } else {
            console.error(`❌ Erro ao converter diagrama (código: ${code})`);
            process.exit(1);
        }
    });
}

convertMermaidToPng();
