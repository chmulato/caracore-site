/**
 * enhanced-error-handler.js - Extensão do gerenciador de erros para autenticação OIDC
 * Fornece detecção avançada e orientações para erros comuns
 */

// Estender o gerenciador de erros existente
(function() {
  // Verificar se o gerenciador de erros básico já foi carregado
  if (!window.AuthErrorHandler) {
    console.error('❌ Erro: AuthErrorHandler não encontrado. Certifique-se de carregar error-handler.js primeiro.');
    return;
  }
  
  const errorHandler = window.AuthErrorHandler;
  const originalProcessError = errorHandler.processError;
  
  // Implementar sistema de dicas de resolução para cada tipo de erro
  errorHandler.getErrorSolution = function(error) {
    if (!error || !error.category) {
      return null;
    }
    
    // Obter o código e a categoria
    const code = error.code || '';
    const category = error.category;
    
    // Dicas específicas baseadas na categoria e código
    const solutions = {
      // Soluções para timeouts
      timeout: {
        default: [
          'Verifique sua conexão com a internet',
          'Tente usar uma conexão mais estável (cabo em vez de Wi-Fi)',
          'Feche outras guias e aplicativos que estejam usando a internet',
          'Limpe o cache do navegador'
        ],
        redirect_timeout: [
          'Verifique se cookies de terceiros estão habilitados no navegador',
          'Desative extensões de bloqueio de anúncios temporariamente',
          'Tente outro navegador (Chrome, Firefox, Edge)',
          'Verifique se o JavaScript está habilitado'
        ],
        response_timeout: [
          'O serviço de autenticação pode estar sobrecarregado, tente novamente em alguns minutos',
          'Verifique se seu firewall não está bloqueando as requisições',
          'Tente usar uma VPN se estiver em uma rede pública ou corporativa'
        ]
      },
      
      // Soluções para problemas de rede
      network: {
        default: [
          'Verifique sua conexão com a internet',
          'Reinicie seu roteador',
          'Tente usar uma conexão alternativa (dados móveis)',
          'Verifique se o site está acessível por outros meios'
        ],
        cors_error: [
          'Se estiver usando o navegador em modo privado, tente o modo normal',
          'Limpe cookies e cache do navegador',
          'Desative extensões que afetam a segurança do navegador',
          'Verifique se está acessando o site pelo protocolo correto (http/https)'
        ]
      },
      
      // Soluções para problemas de autenticação
      authentication: {
        default: [
          'Limpe cookies e cache do navegador',
          'Tente fazer login em uma janela privada/anônima',
          'Use outro provedor de identidade disponível',
          'Verifique se sua conta está ativa e confirme seu e-mail se necessário'
        ],
        popup_blocked: [
          'Permita popups para este site nas configurações do navegador',
          'Procure por um ícone de bloqueio na barra de endereço e clique para permitir',
          'Desative temporariamente o bloqueador de popups',
          'Use o método de redirecionamento em vez de popup'
        ],
        popup_closed: [
          'Não feche a janela de autenticação antes que o processo seja concluído',
          'Verifique se não há extensões fechando automaticamente as janelas',
          'Tente completar o processo de autenticação mais rapidamente'
        ],
        cookie_blocked: [
          'Permita cookies de terceiros nas configurações do navegador',
          'Verifique se o modo "Prevenção contra rastreamento" não está bloqueando os cookies',
          'Em navegadores Safari e Firefox, ajuste as configurações de privacidade',
          'Tente usar o Google Chrome, que geralmente é mais permissivo com cookies'
        ]
      },
      
      // Soluções para problemas de autorização
      authorization: {
        default: [
          'Verifique se sua conta tem permissão para acessar este recurso',
          'Entre em contato com o administrador para solicitar acesso',
          'Tente usar outra conta com as permissões necessárias',
          'Verifique se aceitou todas as solicitações de permissão durante o login'
        ],
        microsoft_account_type_error: [
          'Use uma conta Microsoft pessoal (@outlook.com, @hotmail.com, etc.)',
          'Não use contas corporativas ou educacionais (@empresa.com, @universidade.edu)',
          'Se não tiver uma conta pessoal, crie uma em outlook.com'
        ],
        google_account_type_error: [
          'Tente usar outra conta Google que tenha as permissões necessárias',
          'Verifique se sua conta Google não está restrita por controles organizacionais',
          'Se estiver usando uma conta G Suite/Workspace corporativa, tente uma conta Gmail pessoal'
        ]
      },
      
      // Soluções para problemas de configuração
      configuration: {
        default: [
          'Entre em contato com o suporte técnico informando este erro',
          'Verifique se está acessando a versão correta do site',
          'Tente limpar completamente o cache e os dados do navegador',
          'Verifique se seu navegador está atualizado'
        ]
      }
    };
    
    // Obter soluções baseadas na categoria e código
    const categorySolutions = solutions[category];
    if (!categorySolutions) {
      return null;
    }
    
    // Tentar obter soluções específicas para o código, ou usar o padrão
    return categorySolutions[code] || categorySolutions.default || null;
  };
  
  // Sobreescrever o método processError para adicionar as soluções
  errorHandler.processError = function(error, context, onRecoverableError) {
    // Chamar o método original primeiro
    const processedError = originalProcessError.call(this, error, context, onRecoverableError);
    
    // Adicionar soluções ao erro processado
    processedError.solutions = this.getErrorSolution(processedError) || [];
    
    // Adicionar informações de diagnóstico
    processedError.diagnosticInfo = {
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      cookiesEnabled: navigator.cookieEnabled,
      privateMode: !window.localStorage
    };
    
    return processedError;
  };
  
  // Adicionar um método para obter dicas detalhadas de solução
  errorHandler.getDetailedErrorHelp = function(error = this.lastError) {
    if (!error) return null;
    
    const solutions = error.solutions || this.getErrorSolution(error);
    if (!solutions || solutions.length === 0) {
      return null;
    }
    
    return {
      title: `Como resolver: ${this.getFriendlyErrorMessage(error)}`,
      steps: solutions,
      moreHelp: "Se o problema persistir após tentar estas soluções, entre em contato com o suporte técnico fornecendo o código de erro: " + error.code
    };
  };
  
  // Integração com UI Feedback
  if (window.AuthUIFeedback) {
    const uiFeedback = window.AuthUIFeedback;
    const originalShowError = uiFeedback.showError;
    
    // Sobreescrever o método showError para incluir dicas de solução
    uiFeedback.showError = function(message) {
      // Verificar se é um erro processado pelo nosso sistema
      let errorHelp = null;
      if (window.AuthErrorHandler && window.AuthErrorHandler.lastError) {
        errorHelp = window.AuthErrorHandler.getDetailedErrorHelp();
      }
      
      if (!this.elements.authAlerts) return;
      
      if (errorHelp && errorHelp.steps && errorHelp.steps.length > 0) {
        // Formatar mensagem de erro com dicas de solução
        let solutionsHtml = errorHelp.steps.map(step => 
          `<li>${step}</li>`
        ).join('');
        
        this.elements.authAlerts.innerHTML = `
          <div class="auth-alert auth-alert-error">
            <div class="auth-alert-header">
              <svg class="icon icon-sm" aria-hidden="true"><use href="#icon-warning"></use></svg>
              <div>${message}</div>
            </div>
            <div class="auth-alert-solutions">
              <div class="auth-alert-solutions-title">Possíveis soluções:</div>
              <ul>${solutionsHtml}</ul>
            </div>
          </div>
        `;
      } else {
        // Chamar o método original para erros sem soluções específicas
        originalShowError.call(this, message);
      }
    };
    
    console.log('✅ UI Feedback estendido com suporte para dicas de solução de problemas');
  }
  
  console.log('✅ Enhanced Error Handler inicializado - Melhorias no tratamento de erros disponíveis');
})();