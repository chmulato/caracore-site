/**
 * Script Diagnóstico Completo para Botões de Login
 * Verifica eventos, estilos, posicionamento e interações
 */

function runComprehensiveDiagnostic() {
    console.clear();
    console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DOS BOTÕES DE LOGIN');
    console.log('================================================');

    // 1. Verificar existência dos elementos
    const btnGoogle = document.getElementById('btnLoginGoogle');
    const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
    
    console.log('\n📍 1. VERIFICAÇÃO DE ELEMENTOS:');
    console.log('btnLoginGoogle encontrado:', !!btnGoogle);
    console.log('btnLoginMicrosoft encontrado:', !!btnMicrosoft);
    
    if (!btnGoogle || !btnMicrosoft) {
        console.error('❌ Um ou ambos os botões não foram encontrados!');
        return;
    }

    // 2. Verificar propriedades CSS importantes
    console.log('\n🎨 2. VERIFICAÇÃO DE ESTILOS CSS:');
    
    [
        { name: 'Google', element: btnGoogle },
        { name: 'Microsoft', element: btnMicrosoft }
    ].forEach(({ name, element }) => {
        const computed = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        console.log(`\n--- Botão ${name} ---`);
        console.log('display:', computed.display);
        console.log('visibility:', computed.visibility);
        console.log('opacity:', computed.opacity);
        console.log('pointer-events:', computed.pointerEvents);
        console.log('position:', computed.position);
        console.log('z-index:', computed.zIndex);
        console.log('disabled:', element.disabled);
        console.log('Posição (x,y,w,h):', Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height));
        console.log('Está visível na viewport:', rect.width > 0 && rect.height > 0);
    });

    // 3. Verificar elementos sobrepostos
    console.log('\n🎯 3. VERIFICAÇÃO DE SOBREPOSIÇÃO:');
    
    [btnGoogle, btnMicrosoft].forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        const btnName = index === 0 ? 'Google' : 'Microsoft';
        
        console.log(`\nBotão ${btnName}:`);
        console.log('Centro do botão (x,y):', Math.round(centerX), Math.round(centerY));
        console.log('Elemento no centro:', elementAtPoint?.tagName, elementAtPoint?.id || elementAtPoint?.className);
        console.log('É o próprio botão ou filho?:', elementAtPoint === btn || btn.contains(elementAtPoint));
        
        if (elementAtPoint !== btn && !btn.contains(elementAtPoint)) {
            console.warn(`⚠️ PROBLEMA: Elemento diferente detectado sobre o botão ${btnName}!`);
            console.log('Elemento sobrepost:', elementAtPoint);
        }
    });

    // 4. Verificar event listeners
    console.log('\n🎧 4. VERIFICAÇÃO DE EVENT LISTENERS:');
    
    // Função para verificar listeners
    function checkEventListeners(element, eventType) {
        const listeners = getEventListeners ? getEventListeners(element) : null;
        if (listeners && listeners[eventType]) {
            return listeners[eventType].length;
        }
        return 'N/A (getEventListeners não disponível)';
    }
    
    console.log('Google - click listeners:', checkEventListeners(btnGoogle, 'click'));
    console.log('Microsoft - click listeners:', checkEventListeners(btnMicrosoft, 'click'));

    // 5. Teste de clique manual
    console.log('\n🖱️ 5. TESTE DE CLIQUE PROGRAMÁTICO:');
    
    let googleClicked = false;
    let microsoftClicked = false;
    
    // Adicionar listeners temporários para teste
    const tempGoogleListener = () => {
        googleClicked = true;
        console.log('✅ Clique no botão Google detectado!');
    };
    
    const tempMicrosoftListener = () => {
        microsoftClicked = true;
        console.log('✅ Clique no botão Microsoft detectado!');
    };
    
    btnGoogle.addEventListener('click', tempGoogleListener);
    btnMicrosoft.addEventListener('click', tempMicrosoftListener);
    
    // Simular cliques
    console.log('Simulando clique no Google...');
    btnGoogle.click();
    
    console.log('Simulando clique no Microsoft...');
    btnMicrosoft.click();
    
    setTimeout(() => {
        console.log('\n📊 RESULTADO DOS CLIQUES:');
        console.log('Google respondeu:', googleClicked ? '✅' : '❌');
        console.log('Microsoft respondeu:', microsoftClicked ? '✅' : '❌');
        
        // Remover listeners temporários
        btnGoogle.removeEventListener('click', tempGoogleListener);
        btnMicrosoft.removeEventListener('click', tempMicrosoftListener);
        
        // 6. Verificar se OIDCAuth está disponível
        console.log('\n🔐 6. VERIFICAÇÃO DE DEPENDÊNCIAS:');
        console.log('window.OIDCAuth disponível:', !!window.OIDCAuth);
        console.log('Tipo:', typeof window.OIDCAuth);
        
        if (window.OIDCAuth) {
            console.log('Métodos disponíveis:', Object.getOwnPropertyNames(window.OIDCAuth));
        }
        
        // 7. Análise final
        console.log('\n🎯 7. ANÁLISE E RECOMENDAÇÕES:');
        
        if (!googleClicked || !microsoftClicked) {
            console.error('❌ PROBLEMA IDENTIFICADO: Um ou ambos botões não respondem a cliques!');
            
            if (btnGoogle.disabled || btnMicrosoft.disabled) {
                console.log('💡 CAUSA POSSÍVEL: Botões estão desabilitados');
            }
            
            const googlePointerEvents = window.getComputedStyle(btnGoogle).pointerEvents;
            const microsoftPointerEvents = window.getComputedStyle(btnMicrosoft).pointerEvents;
            
            if (googlePointerEvents === 'none' || microsoftPointerEvents === 'none') {
                console.log('💡 CAUSA POSSÍVEL: pointer-events: none aplicado aos botões');
            }
            
            console.log('💡 SOLUÇÕES SUGERIDAS:');
            console.log('1. Verificar se há elementos sobrepostos');
            console.log('2. Verificar CSS pointer-events');
            console.log('3. Verificar se botões estão desabilitados');
            console.log('4. Verificar se event listeners estão sendo anexados após DOM carregar');
            
        } else {
            console.log('✅ BOTÕES FUNCIONANDO: Ambos respondem a cliques programáticos');
            console.log('💡 Se o usuário não consegue clicar, pode ser:');
            console.log('1. Problema de timing (JavaScript não carregou)');
            console.log('2. Elementos sobrepostos invisíveis');
            console.log('3. Problema específico do navegador/dispositivo');
        }
        
        console.log('\n🏁 DIAGNÓSTICO CONCLUÍDO');
        console.log('================================================');
        
    }, 500);
}

// Auto-executar quando incluído
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runComprehensiveDiagnostic);
} else {
    runComprehensiveDiagnostic();
}

// Também disponibilizar para execução manual
window.runComprehensiveDiagnostic = runComprehensiveDiagnostic;

console.log('📋 Script carregado. Execute runComprehensiveDiagnostic() no console se necessário.');