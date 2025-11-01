(function () {
    const PROVIDER_KEY = "cara_core_oidc_provider";
    const USER_KEY = "cara_core_oidc_user";
    const CONFIG_PATH = {
        google: "/secure/config/google.json",
        entra: "/secure/config/entra.json"
    };

    const managerCache = new Map();
    const configCache = new Map();

    function waitForOidc() {
        return new Promise((resolve, reject) => {
            const started = Date.now();
            const check = () => {
                if (window.oidc && window.oidc.UserManager) {
                    resolve(window.oidc);
                    return;
                }
                if (Date.now() - started > 5000) {
                    reject(new Error("oidc-client-ts not available"));
                    return;
                }
                setTimeout(check, 50);
            };
            check();
        });
    }

    function sanitizeReturnTo(value) {
        if (!value) {
            return "/secure/estrita.html";
        }
        const trimmed = String(value).trim();
        const normalized = trimmed.toLowerCase();
        if (!trimmed) {
            return "/secure/estrita.html";
        }
        if (/^https?:/.test(normalized)) {
            return "/secure/estrita.html";
        }
        if (!trimmed.startsWith("/")) {
            return "/secure/estrita.html";
        }
        return trimmed;
    }

    function persistProvider(provider) {
        if (!provider) {
            return;
        }
        try {
            sessionStorage.setItem(PROVIDER_KEY, provider);
        } catch (err) {
            console.warn("Unable to persist provider in sessionStorage", err);
        }
        try {
            localStorage.setItem(PROVIDER_KEY, provider);
        } catch (err) {
            console.warn("Unable to persist provider in localStorage", err);
        }
    }

    function readStoredProvider() {
        try {
            return sessionStorage.getItem(PROVIDER_KEY) || localStorage.getItem(PROVIDER_KEY) || null;
        } catch (err) {
            return null;
        }
    }

    function persistUser(user, provider) {
        if (!user) {
            return;
        }
        const payload = {
            profile: user.profile,
            access_token: user.access_token,
            id_token: user.id_token,
            expires_at: user.expires_at,
            provider
        };
        try {
            sessionStorage.setItem(USER_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn("Unable to cache user in sessionStorage", err);
        }
    }

    function readStoredUser() {
        try {
            const raw = sessionStorage.getItem(USER_KEY);
            if (!raw) {
                return null;
            }
            return JSON.parse(raw);
        } catch (err) {
            console.warn("Unable to read cached user", err);
            return null;
        }
    }

    function clearStoredUser() {
        try {
            sessionStorage.removeItem(USER_KEY);
        } catch (err) {
            console.warn("Unable to clear cached user", err);
        }
    }

    async function loadConfig(provider) {
        if (!CONFIG_PATH[provider]) {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        if (configCache.has(provider)) {
            return configCache.get(provider);
        }
        const response = await fetch(CONFIG_PATH[provider], { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Failed to load config for ${provider}`);
        }
        const config = await response.json();
        configCache.set(provider, config);
        return config;
    }

    async function getManager(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        if (managerCache.has(targetProvider)) {
            return managerCache.get(targetProvider);
        }
        const oidcLib = await waitForOidc();
        const config = await loadConfig(targetProvider);
        const settings = {
            ...config,
            userStore: new oidcLib.WebStorageStateStore({ store: window.sessionStorage }),
            monitorSession: true,
            automaticSilentRenew: config.automaticSilentRenew !== false,
            includeIdTokenInSilentRenew: true,
            loadUserInfo: config.loadUserInfo !== false
        };
        const manager = new oidcLib.UserManager(settings);
        managerCache.set(targetProvider, manager);
        return manager;
    }

    async function init(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        persistProvider(targetProvider);
        await getManager(targetProvider);
        return targetProvider;
    }

    async function login(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        persistProvider(targetProvider);
        const manager = await getManager(targetProvider);
        await manager.signinRedirect();
    }

    async function handleSigninCallback(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        const manager = await getManager(targetProvider);
        const user = await manager.signinCallback();
        persistProvider(targetProvider);
        persistUser(user, targetProvider);
        return user;
    }

    async function getUser(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        const manager = await getManager(targetProvider);
        const user = await manager.getUser();
        if (user && !user.expired) {
            persistUser(user, targetProvider);
            return { ...user, provider: targetProvider };
        }
        const cached = readStoredUser();
        if (!cached) {
            return null;
        }
        if (cached.expires_at && cached.expires_at * 1000 < Date.now()) {
            clearStoredUser();
            return null;
        }
        return {
            profile: cached.profile,
            access_token: cached.access_token,
            id_token: cached.id_token,
            expires_at: cached.expires_at,
            expired: cached.expires_at ? cached.expires_at * 1000 < Date.now() : false,
            provider: cached.provider || targetProvider
        };
    }

    async function isAuthenticated(provider) {
        const user = await getUser(provider);
        return Boolean(user) && !user.expired;
    }

    async function requireAuth(options = {}) {
        const user = await getUser(options.provider);
        if (user && !user.expired) {
            return user;
        }
        const targetProvider = options.provider || readStoredProvider() || "google";
        const config = await loadConfig(targetProvider);
        const redirectTarget = options.redirectTo || config.redirect_uri || "/secure/index.html";
        const safeReturnTo = sanitizeReturnTo(options.returnTo);
        const params = new URLSearchParams();
        params.set("returnTo", safeReturnTo);
        const glue = redirectTarget.includes("?") ? "&" : "?";
        window.location.href = `${redirectTarget}${glue}${params.toString()}`;
        return null;
    }

    async function logout(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        const manager = await getManager(targetProvider);
        clearStoredUser();
        try {
            await manager.signoutRedirect();
        } catch (err) {
            console.warn("Remote logout failed, falling back to local redirect", err);
            const config = await loadConfig(targetProvider);
            if (config.post_logout_redirect_uri) {
                window.location.href = config.post_logout_redirect_uri;
            }
        }
    }

    async function logoutLocal(provider) {
        const targetProvider = provider || readStoredProvider() || "google";
        clearStoredUser();
        persistProvider(targetProvider);
        const manager = await getManager(targetProvider);
        try {
            await manager.removeUser();
        } catch (err) {
            console.warn("Unable to remove local user", err);
        }
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
        getCurrentProvider: () => readStoredProvider() || "google",
        getCachedProfile: () => readStoredUser()?.profile || null,
        sanitizeReturnTo
    };
})();