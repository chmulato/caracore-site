// Stub de autenticação para modo público (sem OIDC)
// Este arquivo substitui o comportamento completo de OIDC por uma API
// compatível que retorna um usuário público. Mantém a interface para
// minimizar mudanças no frontend enquanto removemos infraestrutura de login.
(function () {
    const PUBLIC_USER = {
        profile: { name: "Visitante", email: "public@caracore.local" },
        access_token: null,
        id_token: null,
        expires_at: Number.POSITIVE_INFINITY,
        expired: false,
        provider: 'public'
    };

    async function init(provider) {
        return provider || 'public';
    }

    async function login(provider) {
        // No-op: modo público não redireciona para provedores
        return;
    }

    async function handleSigninCallback(provider) {
        return PUBLIC_USER;
    }

    async function getUser(provider) {
        return PUBLIC_USER;
    }

    async function isAuthenticated(provider) {
        return true;
    }

    async function requireAuth(options = {}) {
        return PUBLIC_USER;
    }

    async function logout(provider) {
        // No-op
        return;
    }

    async function logoutLocal(provider) {
        // No-op
        return;
    }

    window.CaraCoreOIDC = {
        init,
        login,
        handleSigninCallback,
        getUser,
        isAuthenticated,
        requireAuth,
        logout,
        logoutLocal,
        getCurrentProvider: () => 'public',
        getCachedProfile: () => PUBLIC_USER.profile,
        sanitizeReturnTo: (v) => v || '/secure/restrita.html'
    };
})();