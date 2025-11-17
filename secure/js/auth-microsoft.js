/**
 * auth-microsoft.js - Lógica específica de autenticação Microsoft OIDC
 * 
 * Este módulo contém toda a lógica específica para autenticação com Microsoft,
 * incluindo validação de email, configuração de botões e processo de login.
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-17
 */

(function() {
  'use strict';

  const PROVIDER = 'microsoft';
  const PROVIDER_NAME = 'Microsoft';
  const OIDC_PROVIDER = 'entra'; // O sistema OIDC usa 'entra' como identificador interno

  /**
   * Detecta se o email é da Microsoft
   */
  function isMicrosoftEmail(email) {
    if (!email || !email.includes('@')) {
      return false;
    }
    
    const domain = email.toLowerCase().split('@')[1];
    
    return domain === 'hotmail.com' || 
           domain === 'outlook.com' || 
           domain === 'live.com' || 
           domain === 'msn.com' ||
           domain.startsWith('hotmail.') || 
           domain.startsWith('outlook.') || 
           domain.startsWith('live.') ||
           domain.endsWith('.microsoft.com') ||
           domain.endsWith('.microsoftonline.com');
  }

  /**
   * Valida formato de email
   */
  function isValidEmail(email) {
    if (!email || !email.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Configura validação de email específica para Microsoft
   */
  function setupMicrosoftEmailValidation() {
    const emailInput = document.getElementById('userEmailInput');
    const emailError = document.getElementById('emailError');
    const emailHint = document.getElementById('emailHint');
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const btnLoginMicrosoft = document.getElementById('btnLoginMicrosoft');
    
    if (!emailInput) {
      console.warn('⚠️ [Microsoft] Campo de email não encontrado');
      return;
    }
    
    // Validar email em tempo real
    let validationTimeout = null;
    emailInput.addEventListener('input', () => {
      // Limpar erro anterior
      if (emailError) {
        emailError.textContent = '';
        emailError.style.display = 'none';
      }
      
      // Debounce: aguardar 300ms após parar de digitar
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      
      validationTimeout = setTimeout(() => {
        const email = emailInput.value.trim();
        
        if (!email) {
          // Email vazio - desabilitar botões
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Informe o email que você usa para autenticação';
          }
          return;
        }
        
        if (!isValidEmail(email)) {
          // Email inválido - mostrar erro e desabilitar botões
          if (emailError) {
            emailError.textContent = 'Por favor, informe um email válido';
            emailError.style.display = 'block';
          }
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          return;
        }
        
        // Email válido - verificar se é Microsoft
        if (isMicrosoftEmail(email)) {
          // Email Microsoft: habilitar apenas botão Microsoft, desabilitar Google
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = false;
            btnLoginMicrosoft.style.opacity = '1';
            btnLoginMicrosoft.style.cursor = 'pointer';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Email da Microsoft detectado. Use o botão "Continuar com Microsoft"';
          }
          console.log('✅ [Microsoft] Email Microsoft detectado - Botão Microsoft habilitado, Google desabilitado');
        } else {
          // Email não é Microsoft - desabilitar botão Microsoft
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Este email não é da Microsoft. Use o provedor correto.';
          }
        }
        
        // Limpar erro se email for válido
        if (emailError) {
          emailError.textContent = '';
          emailError.style.display = 'none';
        }
      }, 300);
    });
    
    // Validar ao perder foco
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      if (email && !isValidEmail(email)) {
        if (emailError) {
          emailError.textContent = 'Por favor, informe um email válido';
          emailError.style.display = 'block';
        }
        if (btnLoginMicrosoft) {
          btnLoginMicrosoft.disabled = true;
          btnLoginMicrosoft.style.opacity = '0.5';
          btnLoginMicrosoft.style.cursor = 'not-allowed';
        }
      }
    });
  }

  /**
   * Manipula o login com Microsoft
   */
  async function handleMicrosoftLogin() {
    const emailInput = document.getElementById('userEmailInput');
    const emailError = document.getElementById('emailError');
    
    if (!emailInput) {
      console.error('❌ [Microsoft] Campo de email não encontrado');
      return;
    }
    
    const email = emailInput.value.trim();
    
    // Validar se email foi informado
    if (!email) {
      if (emailError) {
        emailError.textContent = 'Por favor, informe seu email antes de continuar';
        emailError.style.display = 'block';
      }
      emailInput.focus();
      return;
    }
    
    // Validar formato do email
    if (!isValidEmail(email)) {
      if (emailError) {
        emailError.textContent = 'Por favor, informe um email válido';
        emailError.style.display = 'block';
      }
      emailInput.focus();
      return;
    }
    
    // Validar se é email Microsoft
    if (!isMicrosoftEmail(email)) {
      if (emailError) {
        emailError.textContent = 'Este email requer autenticação com Microsoft. Por favor, use o botão "Continuar com Microsoft"';
        emailError.style.display = 'block';
      }
      emailInput.focus();
      return;
    }
    
    // Limpar erro se tudo estiver OK
    if (emailError) {
      emailError.textContent = '';
      emailError.style.display = 'none';
    }
    
    // Salvar email no localStorage antes de iniciar login
    // Isso garante que o email esteja disponível para o tratamento correto com o provedor OIDC do Entra ID
    const loginTimestamp = Date.now();
    localStorage.setItem('user_email', email);
    localStorage.setItem('auth_user_email', email);
    localStorage.setItem('auth_email_timestamp', loginTimestamp.toString());
    localStorage.setItem('auth_provider', PROVIDER);
    
    // Hash de segurança para validação de integridade
    const emailHash = btoa(`${email}:${loginTimestamp}:${PROVIDER}`).substring(0, 32);
    localStorage.setItem('auth_email_hash', emailHash);
    
    console.log(`🔐 [Microsoft] Iniciando login com Microsoft para email: ${email}`);
    console.log(`📧 [Microsoft] Email salvo no localStorage: ${email}`);
    console.log(`🔑 [Microsoft] Provider salvo: ${PROVIDER}`);
    console.log(`🔒 [Microsoft] Hash de segurança criado para validação de integridade`);
    
    // Iniciar login OIDC
    try {
      // Atualizar estado da UI
      if (window.AuthUIFeedback) {
        window.AuthUIFeedback.startLogin(PROVIDER);
      }
      
      // Limpar qualquer tentativa anterior
      if (window.AuthErrorHandler) {
        window.AuthErrorHandler.resetRetryCount();
      }
      
      console.log(`🔐 [Microsoft] Iniciando login com Microsoft (OIDC: ${OIDC_PROVIDER})...`);
      
      // Trocar o provedor (usar 'entra' para OIDC)
      if (window.OIDCAuth) {
        await window.OIDCAuth.switchProvider(OIDC_PROVIDER);
        
        // Atualizar UI para estado de redirecionamento
        if (window.AuthUIFeedback) {
          window.AuthUIFeedback.updateState('redirecting', { provider: PROVIDER });
        }
        
        // Iniciar login (será redirecionado para o provedor)
        await window.OIDCAuth.login();
      } else {
        throw new Error('OIDCAuth não disponível');
      }
    } catch (error) {
      console.error('❌ [Microsoft] Erro no login:', error);
      if (window.AuthUIFeedback) {
        window.AuthUIFeedback.loginFailed('Erro ao iniciar login com Microsoft. Tente novamente.');
      }
    }
  }

  /**
   * Processa autenticação após callback Microsoft
   */
  async function processMicrosoftAuthentication(user) {
    // SEGURANÇA: Obter email do token OIDC (fonte confiável)
    const tokenEmail = user?.profile?.email || user?.profile?.preferred_username;
    
    // Obter email do localStorage (pode ter sido manipulado - precisa validação)
    // IMPORTANTE: Priorizar email do localStorage que foi salvo ANTES do login (na página index.html)
    // Isso garante que o email informado pelo usuário seja usado para consultar o backend
    const storedEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
    const storedTimestamp = localStorage.getItem('auth_email_timestamp');
    const storedHash = localStorage.getItem('auth_email_hash');
    
    // SEGURANÇA: Validar integridade do email no localStorage
    let emailIntegrityValid = false;
    if (storedEmail && storedTimestamp && storedHash) {
      const expectedHash = btoa(`${storedEmail}:${storedTimestamp}:${PROVIDER}`).substring(0, 32);
      emailIntegrityValid = storedHash === expectedHash;
      
      // Verificar se o timestamp não é muito antigo (máximo 1 hora)
      const timestampAge = Date.now() - parseInt(storedTimestamp, 10);
      const maxAge = 60 * 60 * 1000; // 1 hora
      if (timestampAge > maxAge) {
        emailIntegrityValid = false;
        console.warn('⚠️ [Microsoft] SEGURANÇA: Timestamp do email muito antigo, pode ser manipulação');
      }
    }
    
    // SEGURANÇA: Validar correspondência entre email do token e email do localStorage
    let userEmail = tokenEmail;
    let emailMismatch = false;
    
    if (storedEmail && tokenEmail) {
      const storedEmailLower = storedEmail.toLowerCase().trim();
      const tokenEmailLower = tokenEmail.toLowerCase().trim();
      
      if (storedEmailLower !== tokenEmailLower) {
        emailMismatch = true;
        console.warn('⚠️ [Microsoft] SEGURANÇA: Email do localStorage não corresponde ao email do token OIDC!', {
          storedEmail: storedEmail,
          tokenEmail: tokenEmail,
          action: 'Usando email do token (fonte confiável)'
        });
        userEmail = tokenEmail; // Usar email do token (fonte confiável)
        // Limpar dados inválidos
        localStorage.removeItem('user_email');
        localStorage.removeItem('auth_user_email');
        localStorage.removeItem('auth_email_timestamp');
        localStorage.removeItem('auth_email_hash');
        console.error('🔒 [Microsoft] VIOLAÇÃO DE SEGURANÇA DETECTADA: Tentativa de usar email diferente do token OIDC');
      } else if (!emailIntegrityValid) {
        userEmail = tokenEmail;
        console.warn('⚠️ [Microsoft] SEGURANÇA: Integridade do email no localStorage falhou!');
      } else {
        // Emails correspondem e integridade OK - usar o do localStorage (email informado pelo usuário)
        userEmail = storedEmail;
      }
    } else if (tokenEmail) {
      userEmail = tokenEmail;
    } else if (storedEmail && emailIntegrityValid) {
      // Se não há email no token mas há no localStorage com integridade válida
      // Isso pode acontecer em casos legítimos (ex: erro no callback Microsoft)
      userEmail = storedEmail;
      console.warn('⚠️ [Microsoft] Email não encontrado no token OIDC, usando email do localStorage (integridade validada):', storedEmail);
    } else if (storedEmail) {
      userEmail = storedEmail;
      console.warn('⚠️ [Microsoft] Email não encontrado no token OIDC, usando email do localStorage (sem validação de integridade):', storedEmail);
    }
    
    return {
      email: userEmail,
      provider: PROVIDER,
      emailMismatch: emailMismatch,
      emailIntegrityValid: emailIntegrityValid,
      emailSource: tokenEmail ? 'OIDC token' : 'localStorage'
    };
  }

  // Exportar funções para uso global
  window.AuthMicrosoft = {
    PROVIDER: PROVIDER,
    PROVIDER_NAME: PROVIDER_NAME,
    OIDC_PROVIDER: OIDC_PROVIDER,
    isMicrosoftEmail: isMicrosoftEmail,
    isValidEmail: isValidEmail,
    setupEmailValidation: setupMicrosoftEmailValidation,
    handleLogin: handleMicrosoftLogin,
    processAuthentication: processMicrosoftAuthentication
  };

  console.log('✅ [Microsoft] AuthMicrosoft carregado e pronto para uso');

})();

