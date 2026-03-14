/**
 * GDPR Consent Management
 * General Data Protection Regulation - European Union / Switzerland
 */

// Constants
const GDPR_CONSENT_KEY = 'gdpr-consent';
const GDPR_BANNER_ID = 'gdpr-banner';

/**
 * Checks if consent has already been given
 */
function checkGDPRConsent() {
  const consent = localStorage.getItem(GDPR_CONSENT_KEY);
  const banner = document.getElementById(GDPR_BANNER_ID);
  
  if (!consent && banner) {
    // Show banner after 1 second
    setTimeout(() => {
      banner.style.display = 'block';
      banner.style.animation = 'slideUp 0.5s ease-out';
    }, 1000);
  }
}

/**
 * Accepts GDPR consent
 */
function acceptGDPR() {
  localStorage.setItem(GDPR_CONSENT_KEY, 'accepted');
  localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  hideGDPRBanner();
  
  // Log for analytics (if available)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'gdpr_consent', {
      'event_category': 'privacy',
      'event_label': 'accepted',
      'value': 1
    });
  }
  
  console.log('✅ GDPR: Consent accepted by user');
}

/**
 * Declines GDPR consent
 */
function declineGDPR() {
  localStorage.setItem(GDPR_CONSENT_KEY, 'declined');
  localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  hideGDPRBanner();
  
  // Remove existing data if user declines
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== GDPR_CONSENT_KEY && key !== 'gdpr-consent-date') {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Log for analytics (if available)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'gdpr_consent', {
      'event_category': 'privacy',
      'event_label': 'declined',
      'value': 0
    });
  }
  
  // Get language from page
  const lang = document.documentElement.lang || 'en';
  const message = lang === 'it' 
    ? '🛡️ I tuoi dati sono stati rimossi. Alcune funzionalità potrebbero essere limitate.'
    : '🛡️ Your data has been removed. Some features may be limited.';
  
  alert(message);
  console.log('❌ GDPR: Consent declined by user');
}

/**
 * Hides the GDPR banner
 */
function hideGDPRBanner() {
  const banner = document.getElementById(GDPR_BANNER_ID);
  if (banner) {
    banner.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 300);
  }
}

/**
 * Function to show privacy preferences
 */
function showGDPRPreferences() {
  const consent = localStorage.getItem(GDPR_CONSENT_KEY);
  const consentDate = localStorage.getItem('gdpr-consent-date');
  const lang = document.documentElement.lang || 'en';
  
  let message = '🛡️ **Your Privacy Preferences**\n\n';
  
  if (lang === 'it') {
    message = '🛡️ **Le Tue Preferenze di Privacy**\n\n';
  }
  
  if (consent) {
    const status = consent === 'accepted' 
      ? (lang === 'it' ? '✅ Accettato' : '✅ Accepted')
      : (lang === 'it' ? '❌ Rifiutato' : '❌ Declined');
    const date = consentDate 
      ? new Date(consentDate).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')
      : (lang === 'it' ? 'Data non disponibile' : 'Date not available');
    message += lang === 'it' 
      ? `Stato attuale: ${status}\nData: ${date}\n\nVuoi modificare le tue preferenze?`
      : `Current status: ${status}\nDate: ${date}\n\nDo you want to change your preferences?`;
    
    if (confirm(message)) {
      // Remove current consent and show banner again
      localStorage.removeItem(GDPR_CONSENT_KEY);
      localStorage.removeItem('gdpr-consent-date');
      
      // Show banner again
      const banner = document.getElementById(GDPR_BANNER_ID);
      if (banner) {
        banner.style.display = 'block';
        banner.style.animation = 'slideUp 0.5s ease-out';
      }
    }
  } else {
    message += lang === 'it'
      ? 'Non hai ancora definito le tue preferenze.\nIl banner verrà visualizzato automaticamente.'
      : 'You have not yet set your preferences.\nThe banner will be displayed automatically.';
    alert(message);
    
    // Show banner
    checkGDPRConsent();
  }
}

/**
 * Checks if user has given consent
 * @returns {boolean} true if consent was accepted
 */
function hasGDPRConsent() {
  return localStorage.getItem(GDPR_CONSENT_KEY) === 'accepted';
}

/**
 * Gets GDPR consent information
 * @returns {Object} Object with consent status and date
 */
function getGDPRConsentInfo() {
  return {
    status: localStorage.getItem(GDPR_CONSENT_KEY),
    date: localStorage.getItem('gdpr-consent-date')
  };
}

// Initialization when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkGDPRConsent();
  console.log('🛡️ GDPR: Consent system initialized');
});

