/**
 * Google Analytics Configuration
 * Cara Core Informática
 * 
 * Este arquivo centraliza a configuração do Google Analytics
 * para todas as páginas do site caracore.com.br
 */

// Measurement ID do Google Analytics
const GA_MEASUREMENT_ID = 'G-MKFC9G3CL0';

// Função para inicializar o Google Analytics
function initializeGoogleAnalytics() {
    // Adicionar o script do Google Tag Manager
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gtagScript);

    // Configurar o Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    
    console.log('Google Analytics inicializado com ID:', GA_MEASUREMENT_ID);
}

// Função para rastrear eventos personalizados
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log('Evento rastreado:', eventName, parameters);
    }
}

// Função para rastrear downloads
function trackDownload(fileName, fileType = 'pdf') {
    trackEvent('file_download', {
        'file_name': fileName,
        'file_type': fileType,
        'link_url': window.location.href
    });
}

// Função para rastrear cliques em links externos
function trackExternalLink(url, linkText = '') {
    trackEvent('click', {
        'link_url': url,
        'link_text': linkText,
        'outbound': true
    });
}

// Função para rastrear tempo de leitura (para artigos)
function trackReadingTime(articleTitle, timeSpent) {
    trackEvent('reading_time', {
        'article_title': articleTitle,
        'time_spent_seconds': timeSpent,
        'page_location': window.location.href
    });
}

// Inicializar automaticamente quando o arquivo for carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGoogleAnalytics);
} else {
    initializeGoogleAnalytics();
}

// Exportar funções para uso global
window.CaraCoreAnalytics = {
    trackEvent,
    trackDownload,
    trackExternalLink,
    trackReadingTime
};
