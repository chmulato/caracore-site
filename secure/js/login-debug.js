// login-debug.js - Script de debug para botões de login
// Execute este script no console para diagnosticar problemas de login

(function() {
    'use strict';
    
    console.log('🔍 LOGIN DEBUG - Iniciando diagnóstico...');
    
    // Verificar se elementos existem
    const btnGoogle = document.getElementById('btnLoginGoogle');
    const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
    
    console.log('📋 Elementos encontrados:');
    console.log('🔵 Botão Google:', !!btnGoogle, btnGoogle);
    console.log('🔵 Botão Microsoft:', !!btnMicrosoft, btnMicrosoft);
    
    // Verificar se OIDCAuth está disponível
    console.log('🔐 OIDCAuth disponível:', !!window.OIDCAuth);
    if (window.OIDCAuth) {
        console.log('📋 Métodos OIDCAuth:', Object.keys(window.OIDCAuth));
    }
    
    // Verificar event listeners existentes
    function checkEventListeners(element, name) {
        if (!element) return;
        
        const listeners = getEventListeners ? getEventListeners(element) : 'Não disponível (use DevTools)';
        console.log(`🎯 Event listeners ${name}:`, listeners);
    }
    
    checkEventListeners(btnGoogle, 'Google');
    checkEventListeners(btnMicrosoft, 'Microsoft');
    
    // Testar clique programático
    function testClick(button, name) {
        if (!button) {
            console.log(`❌ Botão ${name} não encontrado para teste`);
            return;
        }
        
        console.log(`🧪 Testando clique programático ${name}...`);
        try {
            button.click();
            console.log(`✅ Clique ${name} executado`);
        } catch (error) {
            console.error(`❌ Erro no clique ${name}:`, error);
        }
    }
    
    // Adicionar event listeners de debug
    if (btnGoogle) {
        btnGoogle.addEventListener('click', function(e) {
            console.log('🔵 DEBUG: Clique Google detectado!', e);
        }, { capture: true });
    }
    
    if (btnMicrosoft) {
        btnMicrosoft.addEventListener('click', function(e) {
            console.log('🔵 DEBUG: Clique Microsoft detectado!', e);
        }, { capture: true });
    }
    
    // Verificar estilos CSS que podem estar bloqueando
    function checkButtonStyles(button, name) {
        if (!button) return;
        
        const styles = window.getComputedStyle(button);
        const relevantStyles = {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            position: styles.position,
            zIndex: styles.zIndex,
            disabled: button.disabled
        };
        
        console.log(`🎨 Estilos ${name}:`, relevantStyles);
        
        // Verificar se há problemas
        const problems = [];
        if (styles.display === 'none') problems.push('display: none');
        if (styles.visibility === 'hidden') problems.push('visibility: hidden');
        if (styles.opacity === '0') problems.push('opacity: 0');
        if (styles.pointerEvents === 'none') problems.push('pointer-events: none');
        if (button.disabled) problems.push('disabled');
        
        if (problems.length > 0) {
            console.warn(`⚠️ Problemas detectados em ${name}:`, problems);
        } else {
            console.log(`✅ Estilos ${name} parecem OK`);
        }
    }
    
    checkButtonStyles(btnGoogle, 'Google');
    checkButtonStyles(btnMicrosoft, 'Microsoft');
    
    // Função para forçar teste de login
    window.debugLoginTest = function(provider) {
        console.log(`🧪 TESTE FORÇADO: Login ${provider}`);
        
        if (!window.OIDCAuth) {
            console.error('❌ OIDCAuth não disponível');
            return;
        }
        
        try {
            console.log(`🔐 Tentando login ${provider}...`);
            window.OIDCAuth.switchProvider(provider);
            window.OIDCAuth.login();
        } catch (error) {
            console.error('❌ Erro no teste de login:', error);
        }
    };
    
    console.log('✅ Debug configurado!');
    console.log('🧪 Para testar login manualmente:');
    console.log('   debugLoginTest("google")');
    console.log('   debugLoginTest("entra")');
    
    // Auto-teste se solicitado
    const autoTest = false; // Mude para true se quiser teste automático
    if (autoTest) {
        console.log('🤖 Executando auto-teste...');
        setTimeout(() => testClick(btnGoogle, 'Google'), 2000);
    }
    
})();