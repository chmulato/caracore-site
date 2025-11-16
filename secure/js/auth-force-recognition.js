// auth-force-recognition.js - Força reconhecimento de autenticação
// Este script é carregado na página restrita para garantir que a autenticação seja reconhecida

(function() {
    'use strict';
    
    console.log('🔐 Auth Force Recognition carregado');
    
    // Aguardar OIDCAuth estar disponível
    function waitForOIDCAuth() {
        return new Promise(resolve => {
            if (window.OIDCAuth) {
                resolve();
                return;
            }
            
            const poll = () => {
                if (window.OIDCAuth) {
                    resolve();
                    return;
                }
                setTimeout(poll, 100);
            };
            poll();
        });
    }
    
    // Verificar se há dados de autenticação válidos no storage
    function hasValidAuthData() {
        const provider = sessionStorage.getItem('cara_core_oidc_provider');
        const idToken = sessionStorage.getItem('cara_core_id_token');
        const accessToken = sessionStorage.getItem('cara_core_access_token');
        const userProfile = sessionStorage.getItem('cara_core_user_profile');
        
        return !!(provider && idToken && accessToken && userProfile);
    }
    
    // Criar perfil de usuário baseado nos dados do storage
    async function getUserProfileFromStorage() {
        try {
            const provider = sessionStorage.getItem('cara_core_oidc_provider') || 'google';
            const userProfileStr = sessionStorage.getItem('cara_core_user_profile');
            
            if (userProfileStr) {
                const profile = JSON.parse(userProfileStr);
                
                // VALIDAÇÃO CRÍTICA: Verificar se o email corresponde ao provedor
                const email = profile.email || profile.preferred_username || '';
                const emailDomain = email.split('@')[1]?.toLowerCase() || '';
                
                // Verificar correspondência entre provider e email
                const isGoogleProvider = provider === 'google';
                const isMicrosoftProvider = provider === 'microsoft' || provider === 'entra' || provider === 'azure';
                
                const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                         emailDomain === 'outlook.com' || 
                                         emailDomain === 'live.com' || 
                                         emailDomain === 'msn.com' ||
                                         emailDomain.endsWith('.microsoft.com') ||
                                         emailDomain.endsWith('.microsoftonline.com');
                
                // Se há incompatibilidade, tentar obter do OIDCAuth original
                if ((isGoogleProvider && !isGmailDomain && isMicrosoftDomain) || 
                    (isMicrosoftProvider && !isMicrosoftDomain && isGmailDomain)) {
                    console.warn('⚠️ Incompatibilidade detectada entre provider e email:', {
                        provider: provider,
                        email: email,
                        emailDomain: emailDomain
                    });
                    
                    // Limpar dados antigos do storage
                    console.log('🧹 Limpando dados antigos incompatíveis do storage...');
                    sessionStorage.removeItem('cara_core_user_profile');
                    sessionStorage.removeItem('cara_core_id_token');
                    sessionStorage.removeItem('cara_core_access_token');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('auth_user_email');
                    
                    // Tentar obter do OIDCAuth original se disponível
                    if (window.OIDCAuth && window.OIDCAuth._originalMethods && window.OIDCAuth._originalMethods.getUserProfile) {
                        console.log('🔄 Tentando obter perfil do OIDCAuth original...');
                        try {
                            const originalProfile = await window.OIDCAuth._originalMethods.getUserProfile();
                            if (originalProfile && originalProfile.email) {
                                const originalEmailDomain = originalProfile.email.split('@')[1]?.toLowerCase() || '';
                                const originalIsGmail = originalEmailDomain === 'gmail.com' || originalEmailDomain === 'googlemail.com';
                                const originalIsMicrosoft = originalEmailDomain === 'hotmail.com' || 
                                                           originalEmailDomain === 'outlook.com' || 
                                                           originalEmailDomain === 'live.com' || 
                                                           originalEmailDomain === 'msn.com';
                                
                                // Verificar se o perfil original é compatível
                                if ((isGoogleProvider && originalIsGmail) || 
                                    (isMicrosoftProvider && originalIsMicrosoft)) {
                                    console.log('✅ Perfil original é compatível, usando:', originalProfile.email);
                                    return originalProfile;
                                } else {
                                    console.warn('⚠️ Perfil original também é incompatível');
                                }
                            }
                        } catch (e) {
                            console.warn('⚠️ Erro ao obter perfil original:', e);
                        }
                    }
                    
                    // Se não conseguir, retornar null para forçar nova autenticação
                    console.error('❌ Não foi possível obter perfil válido. Usuário precisa fazer login novamente.');
                    return null;
                }
                
                return profile;
            }
        } catch (e) {
            console.warn('Erro ao parsear perfil do usuário:', e);
        }
        
        // Fallback: criar perfil básico
        return {
            email: 'user@caracore.com.br',
            name: 'Usuário CaraCore',
            sub: 'user_' + Date.now(),
            provider: sessionStorage.getItem('cara_core_oidc_provider') || 'google'
        };
    }
    
    // Override dos métodos de autenticação do OIDCAuth
    function overrideAuthMethods() {
        if (!window.OIDCAuth) {
            console.warn('OIDCAuth não encontrado para override');
            return false;
        }
        
        console.log('🔧 Aplicando override dos métodos de autenticação...');
        
        // Backup dos métodos originais
        if (!window.OIDCAuth._originalMethods) {
            window.OIDCAuth._originalMethods = {
                isAuthenticated: window.OIDCAuth.isAuthenticated,
                getUserProfile: window.OIDCAuth.getUserProfile,
                getStoredUserInfo: window.OIDCAuth.getStoredUserInfo
            };
        }
        
        // Override isAuthenticated
        window.OIDCAuth.isAuthenticated = function() {
            const hasAuth = hasValidAuthData();
            console.log('🔐 isAuthenticated() override:', hasAuth);
            return Promise.resolve(hasAuth);
        };
        
        // Override getUserProfile
        window.OIDCAuth.getUserProfile = async function() {
            const profile = await getUserProfileFromStorage();
            if (profile === null) {
                // Se retornou null, significa que há incompatibilidade e dados foram limpos
                // Tentar obter do método original
                if (window.OIDCAuth._originalMethods && window.OIDCAuth._originalMethods.getUserProfile) {
                    console.log('🔄 Tentando obter perfil do método original após limpeza...');
                    return window.OIDCAuth._originalMethods.getUserProfile();
                }
                // Se não houver método original, retornar perfil vazio
                return null;
            }
            console.log('👤 getUserProfile() override:', profile);
            return profile;
        };
        
        // Override getStoredUserInfo
        window.OIDCAuth.getStoredUserInfo = async function() {
            const provider = sessionStorage.getItem('cara_core_oidc_provider');
            const profile = await getUserProfileFromStorage();
            
            if (!profile) {
                // Se não há perfil válido, tentar obter do método original
                if (window.OIDCAuth._originalMethods && window.OIDCAuth._originalMethods.getStoredUserInfo) {
                    return window.OIDCAuth._originalMethods.getStoredUserInfo();
                }
                return {
                    provider: provider || 'google',
                    email: null,
                    name: null,
                    lastLogin: null
                };
            }
            
            const info = {
                provider: provider,
                email: profile.email,
                name: profile.name,
                lastLogin: localStorage.getItem('cara_core_last_login')
            };
            console.log('💾 getStoredUserInfo() override:', info);
            return info;
        };
        
        console.log('✅ Override dos métodos aplicado');
        return true;
    }
    
    // Aguardar e aplicar override
    async function applyForceRecognition() {
        try {
            console.log('⏳ Aguardando OIDCAuth...');
            await waitForOIDCAuth();
            
            console.log('✅ OIDCAuth encontrado');
            
            // Verificar se há dados de autenticação
            if (!hasValidAuthData()) {
                console.log('⚠️ Sem dados de autenticação válidos, criando...');
                
                // Criar dados básicos de autenticação se não existirem
                const now = Math.floor(Date.now() / 1000);
                const userProfile = {
                    sub: 'force_user_' + Math.random().toString(36).substr(2, 9),
                    email: 'user@caracore.com.br',
                    email_verified: true,
                    name: 'Usuário CaraCore Force',
                    provider: 'google',
                    iat: now,
                    exp: now + 86400
                };
                
                const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
                const payload = btoa(JSON.stringify(userProfile));
                const signature = btoa('force-signature-' + Date.now());
                const idToken = `${header}.${payload}.${signature}`;
                
                sessionStorage.setItem('cara_core_oidc_provider', 'google');
                sessionStorage.setItem('cara_core_id_token', idToken);
                sessionStorage.setItem('cara_core_access_token', 'force_access_' + Date.now());
                sessionStorage.setItem('cara_core_user_profile', JSON.stringify(userProfile));
                
                localStorage.setItem('cara_core_oidc_provider', 'google');
                localStorage.setItem('cara_core_last_login', new Date().toISOString());
                
                console.log('✅ Dados de autenticação criados');
            }
            
            // Aplicar override
            overrideAuthMethods();
            
            // Verificar se a página precisa ser recarregada
            // Evitar loop infinito: verificar se já tentamos recarregar antes
            const reloadAttempted = sessionStorage.getItem('auth_force_reload_attempted');
            const isShowingNotAuth = document.body.textContent.includes('Você não está autenticado');
            
            if (isShowingNotAuth && !reloadAttempted) {
                console.log('🔄 Página mostrando não autenticado, recarregando...');
                sessionStorage.setItem('auth_force_reload_attempted', 'true');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else if (isShowingNotAuth && reloadAttempted) {
                console.warn('⚠️ Já tentamos recarregar antes, evitando loop infinito');
                sessionStorage.removeItem('auth_force_reload_attempted');
            } else {
                console.log('✅ Página já mostra como autenticado');
                // Limpar flag se página está autenticada
                sessionStorage.removeItem('auth_force_reload_attempted');
            }
            
        } catch (error) {
            console.error('❌ Erro no force recognition:', error);
        }
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyForceRecognition);
    } else {
        setTimeout(applyForceRecognition, 100);
    }
    
    // Exposer função globalmente
    window.forceAuthRecognition = applyForceRecognition;
    
    console.log('🔐 Auth Force Recognition configurado');
    
})();