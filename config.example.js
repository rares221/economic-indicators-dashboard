/**
 * API Keys Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to 'config.local.js'
 * 2. Replace the placeholder values with your actual API keys
 * 3. The config.local.js file is gitignored (your keys stay private!)
 * 
 * GET YOUR FREE API KEYS:
 * - Apify: https://console.apify.com/sign-up (instant, $5/month free credit)
 *   → Get token from: https://console.apify.com/account/integrations
 * - FRED: https://fred.stlouisfed.org/docs/api/api_key.html (instant, unlimited free)
 * 
 * SECURITY NOTE:
 * The Apify token uses Bearer authentication (Authorization header)
 * which is more secure than URL query parameters. Your token is never
 * exposed in browser history or server logs.
 */

const API_CONFIG = {
    // Apify API Token (for news scrapers, capitol trades, etc.)
    // Get yours at: https://console.apify.com/account/integrations
    APIFY_TOKEN: 'YOUR_APIFY_TOKEN_HERE',
    
    // FRED API Key (for economic data: GDP, unemployment, yields)
    // Get yours at: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED_API_KEY: 'YOUR_FRED_API_KEY_HERE',
    
    // Add more API keys as needed:
    // EXAMPLE_API_KEY: 'your_key_here',
};

// Make config available globally
window.API_CONFIG = API_CONFIG;
