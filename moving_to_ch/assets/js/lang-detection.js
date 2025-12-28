/**
 * Automatic Language Detection and Redirection
 * Detects user's preferred language and redirects to appropriate version
 */

(function() {
  'use strict';
  
  // Get current path
  const currentPath = window.location.pathname;
  const isEnglish = currentPath.includes('/en/');
  const isItalian = currentPath.includes('/it/');
  
  // Don't redirect if already in a language-specific path
  if (isEnglish || isItalian) {
    return;
  }
  
  // Get preferred language from:
  // 1. URL parameter (?lang=en or ?lang=it)
  // 2. localStorage
  // 3. Browser language
  // 4. Default to English
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const storedLang = localStorage.getItem('preferredLang');
  const browserLang = navigator.language || navigator.userLanguage;
  
  let preferredLang = urlLang || storedLang;
  
  // If no explicit preference, detect from browser
  if (!preferredLang) {
    if (browserLang.startsWith('it')) {
      preferredLang = 'it';
    } else {
      preferredLang = 'en'; // Default to English
    }
  }
  
  // Normalize language code
  preferredLang = preferredLang.toLowerCase().substring(0, 2);
  if (preferredLang !== 'en' && preferredLang !== 'it') {
    preferredLang = 'en'; // Fallback to English
  }
  
  // Store preference
  localStorage.setItem('preferredLang', preferredLang);
  
  // Redirect to appropriate language version
  const currentFile = currentPath.split('/').pop() || 'index.html';
  const newPath = `/moving_to_ch/${preferredLang}/${currentFile}`;
  
  // Only redirect if we're not already on the correct path
  if (!currentPath.includes(newPath)) {
    window.location.href = newPath;
  }
})();

