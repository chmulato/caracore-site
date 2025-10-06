// Example runtime configuration for Cara Core OIDC
// Copy this file to `secure/js/config.js` (or include it before dynamic-config.js in your build)
// and edit the values to match your deployment.

// WARNING: Only include non-sensitive values here. Do not commit secrets to the repo.

window.CARA_CORE_CONFIG = window.CARA_CORE_CONFIG || {};

// Additional Google scopes you want to request at login time.
// Keep the default openid/profile/email. Add full URLs for Google APIs when needed.
// Example of a sensitive scope: 'https://www.googleapis.com/auth/drive.readonly'
// If you add sensitive scopes, enable the corresponding API in Google Cloud Console
// and follow any verification steps required by Google.
window.CARA_CORE_CONFIG.googleScopes = [
  // Add extra scopes here as strings, for example:
  // 'https://www.googleapis.com/auth/drive.readonly',
  // 'https://www.googleapis.com/auth/calendar.events.readonly',
];

// Optional: remote log endpoint to receive logs from client-side logger
// Example: window.CARA_CORE_CONFIG.remoteLogEndpoint = 'https://logs.example.com/oidc-logs';

// Optional: override baseUrl when running behind a proxy or CDN
// window.CARA_CORE_CONFIG.baseUrl = 'https://www.caracore.com.br';

// Optional: other flags
// window.CARA_CORE_CONFIG.provider = 'google';

console.log('CARA_CORE_CONFIG example loaded', window.CARA_CORE_CONFIG);
