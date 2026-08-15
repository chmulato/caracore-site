// Static simulation mode. The live OIDC / Azure / Google auth stack has been removed.
window.OIDC_CONFIGS = {};

window.CARA_CORE_CONFIG = {
  mode: 'static-simulation',
  enabled: false,
  provider: null,
  oidc: null,
  logsEndpoint: null,
  API_BASE_URL: null,
  googleTokenEndpoint: null,
  microsoftTokenEndpoint: null,
  pseudoSaltHint: 'static-only',
  environment: 'static',
  note: 'Autenticação real removida para manter o site estático.'
};
