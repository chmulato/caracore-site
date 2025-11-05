// Basic config for OIDC and logging
// Switch provider: 'azure' or 'google'
const OIDC_PROVIDER = 'google'; // 'azure' or 'google'

const OIDC_CONFIGS = {
  azure: {
    // Microsoft Entra (Azure AD) Application (Client) ID for Cara-Core Area51
    // Obtained from Azure Portal -> App registrations -> Cara-Core Area51 -> Overview -> Application (client) ID
    clientId: "8ef17663-438f-4777-99ca-c5ad5b2a2993",
    // Consumer authority so personal Microsoft accounts (@outlook.com, etc.) can authenticate
    authority: "https://login.microsoftonline.com/consumers/v2.0",
    redirectUri: window.location.origin + "/secure/callback.html",
    postLogoutRedirectUri: window.location.origin + "/secure/logout.html",
    cacheLocation: "sessionStorage",
    scopes: ["openid", "profile", "email"]
  },
  google: {
    clientId: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
    authority: "https://accounts.google.com",
    redirectUri: window.location.origin + "/secure/callback.html",
    postLogoutRedirectUri: window.location.origin + "/secure/logout.html",
    cacheLocation: "sessionStorage",
    scopes: ["openid", "profile", "email"],
    // Usando endpoint direto no backend, já que estamos no domínio personalizado com CORS configurado
    tokenEndpoint: "https://caracore-backend-docker.azurewebsites.net/oauth/google/token"
  }
};

// Expose configs for runtime switching
window.OIDC_CONFIGS = OIDC_CONFIGS;

const CARA_CORE_DEFAULT_CONFIG = {
  // initial provider selected at load time; can be changed at runtime by OIDC.setProvider()
  provider: OIDC_PROVIDER,
  oidc: OIDC_CONFIGS[OIDC_PROVIDER],
  // logging is opt-in; configure a full HTTPS endpoint when available (e.g., App Insights collector)
  logsEndpoint: null,
  // API Base URL for backend services
  API_BASE_URL: 'https://caracore-backend-docker.azurewebsites.net',
  googleTokenEndpoint: 'https://caracore-backend-docker.azurewebsites.net/oauth/google/token',
  microsoftTokenEndpoint: 'https://caracore-backend-docker.azurewebsites.net/oauth/microsoft/token',
  pseudoSaltHint: "set-server-side",
  environment: (location.protocol === 'https:') ? 'prod' : 'dev',
};

// Allow overrides by defining window.CARA_CORE_CONFIG_OVERRIDE before loading this script
window.CARA_CORE_CONFIG = Object.assign(
  {},
  CARA_CORE_DEFAULT_CONFIG,
  (typeof window.CARA_CORE_CONFIG_OVERRIDE === 'object' && window.CARA_CORE_CONFIG_OVERRIDE) || {}
);
