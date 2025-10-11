// Configuração para desenvolvimento local com backend local
// Este arquivo sobrescreve config.js quando carregado
window.CARA_CORE_CONFIG_OVERRIDE = {
    provider: 'google',
    oidc: {
        clientId: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
        authority: "https://accounts.google.com",
        redirectUri: "http://localhost:8000/secure/callback.html",
        postLogoutRedirectUri: "http://localhost:8000/secure/logout.html",
        cacheLocation: "sessionStorage",
        scopes: ["openid", "profile", "email"],
        tokenEndpoint: "http://localhost:5051/oauth/google/token"  // Backend local
    },
    googleTokenEndpoint: 'http://localhost:5051/oauth/google/token',
    environment: 'dev'
};

console.log('🔧 CONFIG LOCAL: Backend local configurado para Google OAuth');
