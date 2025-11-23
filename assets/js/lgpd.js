/**
 * Gerenciamento de Consentimento LGPD
 * Lei Geral de Proteção de Dados - Brasil
 */

// Constantes
const LGPD_CONSENT_KEY = 'lgpd-consent';
const LGPD_BANNER_ID = 'lgpd-banner';

/**
 * Verifica se o consentimento já foi dado
 */
function checkLGPDConsent() {
  const consent = localStorage.getItem(LGPD_CONSENT_KEY);
  const banner = document.getElementById(LGPD_BANNER_ID);
  
  if (!consent && banner) {
    // Mostra o banner após 1 segundo
    setTimeout(() => {
      banner.style.display = 'block';
      banner.style.animation = 'slideUp 0.5s ease-out';
    }, 1000);
  }
}

/**
 * Aceita o consentimento LGPD
 */
function acceptLGPD() {
  localStorage.setItem(LGPD_CONSENT_KEY, 'accepted');
  localStorage.setItem('lgpd-consent-date', new Date().toISOString());
  hideLGPDBanner();
  
  // Log para analytics (se disponível)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'lgpd_consent', {
      'event_category': 'privacy',
      'event_label': 'accepted',
      'value': 1
    });
  }
  
  console.log('✅ LGPD: Consentimento aceito pelo usuário');
}

/**
 * Recusa o consentimento LGPD
 */
function declineLGPD() {
  localStorage.setItem(LGPD_CONSENT_KEY, 'declined');
  localStorage.setItem('lgpd-consent-date', new Date().toISOString());
  hideLGPDBanner();
  
  // Remove dados existentes se o usuário recusar
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== LGPD_CONSENT_KEY && key !== 'lgpd-consent-date') {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Log para analytics (se disponível)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'lgpd_consent', {
      'event_category': 'privacy',
      'event_label': 'declined',
      'value': 0
    });
  }
  
  alert('🛡️ Seus dados foram removidos. Algumas funcionalidades podem ser limitadas.');
  console.log('❌ LGPD: Consentimento recusado pelo usuário');
}

/**
 * Esconde o banner LGPD
 */
function hideLGPDBanner() {
  const banner = document.getElementById(LGPD_BANNER_ID);
  if (banner) {
    banner.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 300);
  }
}

/**
 * Função para mostrar preferências de privacidade
 */
function showLGPDPreferences() {
  const consent = localStorage.getItem(LGPD_CONSENT_KEY);
  const consentDate = localStorage.getItem('lgpd-consent-date');
  
  let message = '🛡️ **Suas Preferências de Privacidade**\n\n';
  
  if (consent) {
    const status = consent === 'accepted' ? '✅ Aceito' : '❌ Recusado';
    const date = consentDate ? new Date(consentDate).toLocaleString('pt-BR') : 'Data não disponível';
    message += `Status atual: ${status}\n`;
    message += `Data: ${date}\n\n`;
    message += 'Deseja alterar suas preferências?';
    
    if (confirm(message)) {
      // Remove consentimento atual e mostra banner novamente
      localStorage.removeItem(LGPD_CONSENT_KEY);
      localStorage.removeItem('lgpd-consent-date');
      
      // Mostra o banner novamente
      const banner = document.getElementById(LGPD_BANNER_ID);
      if (banner) {
        banner.style.display = 'block';
        banner.style.animation = 'slideUp 0.5s ease-out';
      }
    }
  } else {
    message += 'Você ainda não definiu suas preferências.\n';
    message += 'O banner será exibido automaticamente.';
    alert(message);
    
    // Mostra o banner
    checkLGPDConsent();
  }
}

/**
 * Verifica se o usuário deu consentimento
 * @returns {boolean} true se consentimento foi aceito
 */
function hasLGPDConsent() {
  return localStorage.getItem(LGPD_CONSENT_KEY) === 'accepted';
}

/**
 * Obtém informações do consentimento LGPD
 * @returns {Object} Objeto com status e data do consentimento
 */
function getLGPDConsentInfo() {
  return {
    status: localStorage.getItem(LGPD_CONSENT_KEY),
    date: localStorage.getItem('lgpd-consent-date')
  };
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  checkLGPDConsent();
  console.log('🛡️ LGPD: Sistema de consentimento inicializado');
});