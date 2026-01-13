/**
 * Third-party script loader utility
 * Defers loading of analytics and tracking scripts to improve performance
 */

/**
 * Load script after page is interactive
 * @param {string} src - Script source URL
 * @param {Object} options - Script options
 */
export const loadScriptAsync = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Add attributes
    Object.keys(options).forEach(key => {
      script.setAttribute(key, options[key]);
    });

    script.onload = resolve;
    script.onerror = reject;
    
    document.body.appendChild(script);
  });
};

/**
 * Defer script loading until page is idle
 * @param {Function} callback - Function to execute when idle
 */
export const runWhenIdle = (callback) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1);
  }
};

/**
 * Load third-party scripts after initial render
 */
export const loadThirdPartyScripts = () => {
  runWhenIdle(() => {
    // Load analytics or other third-party scripts here
    // Example:
    // loadScriptAsync('https://example.com/analytics.js');
  });
};

/**
 * Preconnect to third-party domains
 * @param {Array} domains - Array of domain URLs
 */
export const preconnectDomains = (domains = []) => {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Export for use in components
export default {
  loadScriptAsync,
  runWhenIdle,
  loadThirdPartyScripts,
  preconnectDomains,
};
