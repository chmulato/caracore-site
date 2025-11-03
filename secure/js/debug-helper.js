/**
 * Debug Helper - Injeta ferramentas de diagnóstico na página
 * Execute este código no console da página de login
 */

(function() {
    'use strict';
    
    console.log('🔧 INICIANDO FERRAMENTAS DE DEBUG');
    
    // Criar painel de debug
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.innerHTML = `
        <div style="
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🔍 DEBUG PANEL</strong>
                <button onclick="document.getElementById('debugPanel').remove()" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 2px 6px;
                    cursor: pointer;
                ">✕</button>
            </div>
            <div id="debugContent">Carregando...</div>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Função para atualizar o conteúdo do debug
    function updateDebugInfo() {
        const content = document.getElementById('debugContent');
        if (!content) return;
        
        const btnGoogle = document.getElementById('btnLoginGoogle');
        const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
        
        let info = '';
        
        // Status dos botões
        info += '<div style="margin-bottom: 8px;"><strong>📍 Botões:</strong></div>';
        info += `Google: ${btnGoogle ? '✅' : '❌'}<br>`;
        info += `Microsoft: ${btnMicrosoft ? '✅' : '❌'}<br>`;
        
        if (btnGoogle && btnMicrosoft) {
            // Status de interatividade
            info += '<div style="margin: 8px 0;"><strong>🎯 Status:</strong></div>';
            info += `Google disabled: ${btnGoogle.disabled}<br>`;
            info += `Microsoft disabled: ${btnMicrosoft.disabled}<br>`;
            
            // CSS crítico
            const googleStyle = window.getComputedStyle(btnGoogle);
            const microsoftStyle = window.getComputedStyle(btnMicrosoft);
            
            info += '<div style="margin: 8px 0;"><strong>🎨 CSS:</strong></div>';
            info += `Google pointer-events: ${googleStyle.pointerEvents}<br>`;
            info += `Microsoft pointer-events: ${microsoftStyle.pointerEvents}<br>`;
            info += `Google display: ${googleStyle.display}<br>`;
            info += `Microsoft display: ${microsoftStyle.display}<br>`;
            
            // Verificar sobreposição
            const googleRect = btnGoogle.getBoundingClientRect();
            const microsoftRect = btnMicrosoft.getBoundingClientRect();
            
            const googleCenter = {
                x: googleRect.left + googleRect.width / 2,
                y: googleRect.top + googleRect.height / 2
            };
            
            const microsoftCenter = {
                x: microsoftRect.left + microsoftRect.width / 2,
                y: microsoftRect.top + microsoftRect.height / 2
            };
            
            const googleTopElement = document.elementFromPoint(googleCenter.x, googleCenter.y);
            const microsoftTopElement = document.elementFromPoint(microsoftCenter.x, microsoftCenter.y);
            
            info += '<div style="margin: 8px 0;"><strong>🎯 Sobreposição:</strong></div>';
            info += `Google OK: ${googleTopElement === btnGoogle || btnGoogle.contains(googleTopElement) ? '✅' : '❌'}<br>`;
            info += `Microsoft OK: ${microsoftTopElement === btnMicrosoft || btnMicrosoft.contains(microsoftTopElement) ? '✅' : '❌'}<br>`;
        }
        
        // OIDCAuth
        info += '<div style="margin: 8px 0;"><strong>🔐 OIDCAuth:</strong></div>';
        info += `Disponível: ${window.OIDCAuth ? '✅' : '❌'}<br>`;
        
        // Botões de teste
        info += `
            <div style="margin: 10px 0;">
                <button onclick="testButtonClicks()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-right: 5px;
                    font-size: 10px;
                ">🖱️ Testar Cliques</button>
                <button onclick="forceEnableButtons()" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                ">🔧 Force Enable</button>
            </div>
        `;
        
        content.innerHTML = info;
    }
    
    // Função para testar cliques nos botões
    window.testButtonClicks = function() {
        console.log('🖱️ TESTANDO CLIQUES NOS BOTÕES');
        
        const btnGoogle = document.getElementById('btnLoginGoogle');
        const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
        
        if (btnGoogle) {
            console.log('Clicando no botão Google...');
            btnGoogle.click();
        }
        
        if (btnMicrosoft) {
            console.log('Clicando no botão Microsoft...');
            btnMicrosoft.click();
        }
    };
    
    // Função para forçar habilitação dos botões
    window.forceEnableButtons = function() {
        console.log('🔧 FORÇANDO HABILITAÇÃO DOS BOTÕES');
        
        const btnGoogle = document.getElementById('btnLoginGoogle');
        const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
        
        [btnGoogle, btnMicrosoft].forEach((btn, index) => {
            if (btn) {
                const name = index === 0 ? 'Google' : 'Microsoft';
                
                // Remover disabled
                btn.disabled = false;
                
                // Forçar pointer-events
                btn.style.pointerEvents = 'auto';
                
                // Garantir visibilidade
                btn.style.display = 'flex';
                btn.style.visibility = 'visible';
                btn.style.opacity = '1';
                
                // Remover classes que possam interferir
                btn.classList.remove('loading', 'disabled');
                
                console.log(`✅ Botão ${name} forçadamente habilitado`);
            }
        });
        
        // Atualizar debug info
        setTimeout(updateDebugInfo, 100);
    };
    
    // Monitorar mudanças nos botões
    const observer = new MutationObserver(() => {
        updateDebugInfo();
    });
    
    const btnGoogle = document.getElementById('btnLoginGoogle');
    const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
    
    if (btnGoogle) observer.observe(btnGoogle, { attributes: true, attributeFilter: ['disabled', 'class', 'style'] });
    if (btnMicrosoft) observer.observe(btnMicrosoft, { attributes: true, attributeFilter: ['disabled', 'class', 'style'] });
    
    // Inicializar
    updateDebugInfo();
    
    // Atualizar a cada 2 segundos
    setInterval(updateDebugInfo, 2000);
    
    console.log('✅ Ferramentas de debug carregadas! Painel disponível no canto superior direito.');
    console.log('🔧 Funções disponíveis: testButtonClicks(), forceEnableButtons()');
    
})();