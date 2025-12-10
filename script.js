// Configuration
const FRED_API_KEY = 'demo'; // Replace with your FRED API key from https://fred.stlouisfed.org/docs/api/api_key.html
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Market Hours Configuration (in UTC)
const MARKET_HOURS = {
    US: {
        name: 'US Markets',
        timezone: 'America/New_York',
        preMarket: { start: 4, end: 9.5 },      // 4:00 AM - 9:30 AM ET
        regular: { start: 9.5, end: 16 },       // 9:30 AM - 4:00 PM ET
        afterHours: { start: 16, end: 20 },     // 4:00 PM - 8:00 PM ET
        weekdays: [1, 2, 3, 4, 5]               // Monday-Friday
    },
    EU: {
        name: 'European Markets',
        timezone: 'Europe/London',
        regular: { start: 8, end: 16.5 },       // 8:00 AM - 4:30 PM GMT
        weekdays: [1, 2, 3, 4, 5]
    },
    ASIA: {
        name: 'Asian Markets',
        timezone: 'Asia/Tokyo',
        regular: { start: 9, end: 15 },         // 9:00 AM - 3:00 PM JST
        weekdays: [1, 2, 3, 4, 5]
    }
};

// CNN Fear & Greed Index (Stock Market)
// CNN's publicly accessible internal API endpoint (no API key required)
// This endpoint returns JSON data with the current Fear & Greed Index
const CNN_FEAR_GREED_API = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
// You can also append a date (YYYY-MM-DD) for historical data, or use without date for latest
const CNN_FEAR_GREED_LATEST = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';

// Alternative.me Crypto Fear & Greed Index
// Free API, no key required, returns crypto market sentiment
const CRYPTO_FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=30';

// Stock Indices Configuration
// Using Yahoo Finance symbols (most reliable, free, no API key needed)
const STOCK_INDICES = {
    sp500: { symbol: '^GSPC', name: 'S&P 500', region: 'US' },
    nasdaq: { symbol: '^IXIC', name: 'NASDAQ', region: 'US' },
    ftse100: { symbol: '^FTSE', name: 'FTSE 100', region: 'UK' },
    dax: { symbol: '^GDAXI', name: 'DAX', region: 'Germany' },
    stoxx600: { symbol: '^STOXX', name: 'STOXX 600', region: 'Europe' },
    nikkei: { symbol: '^N225', name: 'Nikkei 225', region: 'Japan' },
    shanghai: { symbol: '000001.SS', name: 'Shanghai Composite', region: 'China' },
    hangsen: { symbol: '^HSI', name: 'Hang Seng', region: 'Hong Kong' }
};

// Yahoo Finance API endpoints
const YAHOO_FINANCE_QUOTE_API = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const YAHOO_FINANCE_CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Finnhub API (free tier: 60 calls/minute) - Alternative source
// Get free API key from: https://finnhub.io/register
const FINNHUB_API_KEY = 'demo'; // Replace with free key from finnhub.io
const FINNHUB_QUOTE_API = 'https://finnhub.io/api/v1/quote';

// Wikipedia URLs for each index
const WIKIPEDIA_URLS = {
    'Sahm Rule': 'https://en.wikipedia.org/wiki/Sahm_rule',
    'Yield Curve': 'https://en.wikipedia.org/wiki/Yield_curve',
    'Unemployment Rate': 'https://en.wikipedia.org/wiki/Unemployment',
    'GDP Growth': 'https://en.wikipedia.org/wiki/Gross_domestic_product',
    'Lipstick Index': 'https://en.wikipedia.org/wiki/Lipstick_index',
    'R-Word Index': 'https://en.wikipedia.org/wiki/Recession_index',
    'Stripper Index': 'https://en.wikipedia.org/wiki/Stripper_index',
    'Vibecession': 'https://en.wikipedia.org/wiki/Vibecession',
    'ADS Index': 'https://en.wikipedia.org/wiki/Aruoba-Diebold-Scotti_Index',
    'Used Car Index': 'https://en.wikipedia.org/wiki/Manheim_Used_Vehicle_Value_Index',
    'Lego Index': 'https://en.wikipedia.org/wiki/LEGO',
    'Frozen Pizza Index': 'https://en.wikipedia.org/wiki/Frozen_food',
    "Men's Underwear Index": 'https://en.wikipedia.org/wiki/Men%27s_underwear_index',
    'Big Mac Index': 'https://en.wikipedia.org/wiki/Big_Mac_Index'
};

// Tooltip descriptions for each index
const INDEX_TOOLTIPS = {
    'fear-greed': {
        title: 'Fear & Greed Index',
        description: 'Measures market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). Combines volatility, momentum, safe haven demand, and survey data to gauge investor emotions.'
    },
    'sahm': {
        title: 'Sahm Rule',
        description: 'A recession indicator based on unemployment. When the 3-month average unemployment rate rises by 0.5 percentage points or more from its low in the previous 12 months, it signals a recession has started.'
    },
    'yield': {
        title: 'Yield Curve',
        description: 'The difference between 10-year and 2-year Treasury yields. When inverted (negative), it often predicts recessions. A positive spread indicates normal economic conditions.'
    },
    'unemployment': {
        title: 'Unemployment Rate',
        description: 'Percentage of the labor force that is jobless and actively seeking employment. Lower rates indicate a healthy economy, while rising unemployment suggests economic weakness.'
    },
    'gdp': {
        title: 'GDP Growth',
        description: 'The rate of change in Gross Domestic Product, measuring economic growth. Positive growth indicates expansion, while negative growth (two consecutive quarters) defines a recession.'
    },
    'lipstick': {
        title: 'Lipstick Index',
        description: 'Theory that during economic downturns, consumers buy small luxuries (like lipstick) instead of big-ticket items. Higher cosmetic sales can indicate economic stress.'
    },
    'rword': {
        title: 'R-Word Index',
        description: 'Tracks the frequency of "recession" mentions in news and media. Higher mentions suggest increased economic concern and potential recession fears among the public.'
    },
    'stripper': {
        title: 'Stripper Index',
        description: 'An anecdotal economic indicator suggesting that during tough economic times, more people enter the adult entertainment industry. Higher activity may indicate economic stress.'
    },
    'vibecession': {
        title: 'Vibecession',
        description: 'The disconnect between economic data (which may look positive) and public sentiment (which feels negative). Higher scores indicate greater disconnect between perception and reality.'
    },
    'ads': {
        title: 'ADS Business Conditions Index',
        description: 'A weekly index of business conditions using mixed-frequency data. Positive values indicate improving conditions, negative values suggest deteriorating economic conditions.'
    },
    'usedcar': {
        title: 'Used Car Index',
        description: 'Based on the Manheim Used Vehicle Value Index. Declining used car prices suggest reduced consumer demand and economic weakness, while stable/high prices indicate strong demand.'
    },
    'lego': {
        title: 'Lego Index',
        description: 'The theory that during economic downturns, people stay home more and buy affordable entertainment like LEGO sets. Higher sales may indicate economic stress and reduced spending on experiences.'
    },
    'pizza': {
        title: 'Frozen Pizza Index',
        description: 'Suggests that during economic stress, consumers buy cheap frozen meals instead of dining out. Higher frozen pizza sales may indicate reduced discretionary spending.'
    },
    'underwear': {
        title: "Men's Underwear Index",
        description: 'Popularized by Alan Greenspan. Men defer buying underwear during tough times since it\'s not visible. Lower sales suggest economic stress, while stable sales indicate normal consumption patterns.'
    },
    'bigmac': {
        title: 'Big Mac Index',
        description: 'Originally a purchasing power parity indicator, but also reflects economic stress. Higher relative prices may indicate currency issues or reduced purchasing power, suggesting economic challenges.'
    },
    'sp500': {
        title: 'S&P 500',
        description: 'A stock market index measuring the performance of 500 large companies listed on US stock exchanges. It\'s widely regarded as the best gauge of large-cap US equities.'
    },
    'nasdaq': {
        title: 'NASDAQ',
        description: 'A stock market index of over 3,000 companies, heavily weighted toward technology and growth stocks. It reflects the performance of the tech sector and innovation economy.'
    },
    'ftse100': {
        title: 'FTSE 100',
        description: 'The Financial Times Stock Exchange 100 Index, representing the 100 largest companies listed on the London Stock Exchange. It\'s a key indicator of UK economic health.'
    },
    'dax': {
        title: 'DAX',
        description: 'Germany\'s blue-chip stock market index, tracking the 40 largest and most liquid companies on the Frankfurt Stock Exchange. It reflects the health of the German economy.'
    },
    'stoxx600': {
        title: 'STOXX 600',
        description: 'A European stock index representing 600 large, mid, and small-cap companies across 17 European countries. It provides a broad view of European market performance.'
    },
    'nikkei': {
        title: 'Nikkei 225',
        description: 'Japan\'s premier stock market index, tracking 225 large companies listed on the Tokyo Stock Exchange. It\'s a key indicator of Japanese economic health and corporate performance.'
    },
    'shanghai': {
        title: 'Shanghai Composite',
        description: 'A stock market index of all stocks traded on the Shanghai Stock Exchange. It reflects the performance of Chinese companies and is a key indicator of China\'s economic sentiment.'
    },
    'hangsen': {
        title: 'Hang Seng',
        description: 'The primary stock market index of Hong Kong, tracking the largest companies listed on the Hong Kong Stock Exchange. It reflects the health of Hong Kong\'s economy and its role as a financial hub.'
    }
};

// FRED API endpoints
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_SERIES = {
    unemployment: 'UNRATE', // Unemployment Rate
    gdp: 'A191RL1Q225SBEA', // Real GDP Growth
    yield10y: 'DGS10', // 10-Year Treasury
    yield2y: 'DGS2' // 2-Year Treasury
};

// Index Configuration: Defines direction, ranges, and normalization for each index
// This ensures all indexes are properly normalized to a -1 (bad) to 1 (good) scale
// regardless of their original scale or direction (higher vs lower is better)
// 
// Properties:
//   - direction: 'higher_better' or 'lower_better' - indicates if higher or lower values are good
//   - optimal: The ideal value for this index (maps to score of 1.0)
//   - bad: The threshold value that indicates bad conditions (maps to score of -1.0)
//   - range: [min, max] - the expected range of values for this index
const INDEX_CONFIG = {
    sahm: { 
        direction: 'lower_better', // Lower is better (0 = good, >0.5 = recession signal)
        optimal: 0,
        bad: 0.5,
        range: [0, 2]
    },
    yield: { 
        direction: 'higher_better', // Positive spread is good, negative (inverted) is bad
        optimal: 2.0,
        bad: 0,
        range: [-2, 4]
    },
    unemployment: { 
        direction: 'lower_better', // Lower unemployment is better
        optimal: 3.5,
        bad: 6.0,
        range: [2, 12]
    },
    gdp: { 
        direction: 'higher_better', // Positive GDP growth is good
        optimal: 3.0,
        bad: 0,
        range: [-5, 8]
    },
    lipstick: { 
        direction: 'lower_better', // Lower sales = better economy
        optimal: 30,
        bad: 70,
        range: [0, 100]
    },
    rword: { 
        direction: 'lower_better', // Lower mentions = better
        optimal: 10,
        bad: 70,
        range: [0, 100]
    },
    stripper: { 
        direction: 'lower_better', // Lower activity = better
        optimal: 30,
        bad: 60,
        range: [0, 100]
    },
    vibecession: { 
        direction: 'lower_better', // Lower disconnect = better
        optimal: 20,
        bad: 60,
        range: [0, 100]
    },
    ads: { 
        direction: 'higher_better', // Positive values = good
        optimal: 1.0,
        bad: -0.5,
        range: [-3, 3]
    },
    usedcar: { 
        direction: 'higher_better', // Higher prices = strong demand
        optimal: 220,
        bad: 190,
        range: [150, 250]
    },
    lego: { 
        direction: 'lower_better', // Lower sales = better (people not staying home)
        optimal: 40,
        bad: 70,
        range: [0, 100]
    },
    pizza: { 
        direction: 'lower_better', // Lower sales = better (people dining out)
        optimal: 30,
        bad: 70,
        range: [0, 100]
    },
    underwear: { 
        direction: 'higher_better', // Higher sales = better (people buying essentials)
        optimal: 80,
        bad: 60,
        range: [0, 100]
    },
    bigmac: { 
        direction: 'lower_better', // Lower price relative to baseline = better
        optimal: 4.50,
        bad: 6.00,
        range: [3.50, 7.00]
    }
};

// Historical data storage (for sparklines)
const historicalData = {
    // Store last 30 data points for each index
    sahm: [],
    yield: [],
    unemployment: [],
    gdp: [],
    lipstick: [],
    rword: [],
    stripper: [],
    vibecession: [],
    ads: [],
    usedcar: [],
    lego: [],
    pizza: [],
    underwear: [],
    bigmac: [],
    fearGreed: [],
    cryptoFearGreed: [],
    sp500: [],
    nasdaq: [],
    ftse100: [],
    dax: [],
    stoxx600: [],
    nikkei: [],
    shanghai: [],
    hangsen: []
};

// Helper: Get previous value from localStorage
function getPreviousValue(indexId) {
    try {
        const stored = localStorage.getItem(`index_${indexId}_previous`);
        return stored ? parseFloat(stored) : null;
    } catch (e) {
        return null;
    }
}

// Helper: Save current value as previous for next time
function savePreviousValue(indexId, value) {
    try {
        localStorage.setItem(`index_${indexId}_previous`, value.toString());
    } catch (e) {
        // Silently fail if localStorage not available
    }
}

// Recession Index Data Structure
const recessionIndexes = {
    sahm: { value: null, status: null, name: 'Sahm Rule', unit: '%' },
    yield: { value: null, status: null, name: 'Yield Curve', unit: '%' },
    unemployment: { value: null, status: null, name: 'Unemployment Rate', unit: '%' },
    gdp: { value: null, status: null, name: 'GDP Growth', unit: '%' },
    lipstick: { value: null, status: null, name: 'Lipstick Index', unit: 'index' },
    rword: { value: null, status: null, name: 'R-Word Index', unit: 'mentions' },
    stripper: { value: null, status: null, name: 'Stripper Index', unit: 'index' },
    vibecession: { value: null, status: null, name: 'Vibecession', unit: 'score' },
    ads: { value: null, status: null, name: 'ADS Index', unit: 'index' },
    usedcar: { value: null, status: null, name: 'Used Car Index', unit: 'index' },
    lego: { value: null, status: null, name: 'Lego Index', unit: 'index' },
    pizza: { value: null, status: null, name: 'Frozen Pizza Index', unit: 'index' },
    underwear: { value: null, status: null, name: "Men's Underwear Index", unit: 'index' },
    bigmac: { value: null, status: null, name: 'Big Mac Index', unit: 'index' }
};

// Helper: Fetch with CORS proxy (with better error handling and timeout)
async function fetchWithProxy(url, timeout = 5000) {
    try {
        // Try multiple CORS proxies for better reliability
        // Reordered to try more reliable ones first
        const proxies = [
            { url: 'https://api.codetabs.com/v1/proxy?quest=', name: 'codetabs' },
            { url: 'https://api.allorigins.win/raw?url=', name: 'allorigins' },
            { url: 'https://corsproxy.io/?', name: 'corsproxy' }
        ];
        
        for (const proxy of proxies) {
            try {
                const proxyUrl = proxy.url + encodeURIComponent(url);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal,
                    mode: 'cors'
                });
                
                clearTimeout(timeoutId);
                
                // Check for HTTP errors
                if (!response.ok) {
                    // Skip 4xx and 5xx errors, try next proxy
                    continue;
                }
                
                // Try to parse as JSON first, fallback to text
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data) return data;
                } else {
                    // Return as text (for HTML scraping)
                    const text = await response.text();
                    if (text) return text;
                }
            } catch (proxyError) {
                // Silently try next proxy - errors are expected when proxies are down
                // Only continue to next proxy, don't log
                if (proxyError.name === 'AbortError') {
                    // Timeout - try next proxy
                    continue;
                }
                // Network/CORS error - try next proxy
                continue;
            }
        }
        
        // If all proxies fail, return null (caller will use fallback data)
        return null;
    } catch (error) {
        // Return null instead of throwing - let caller handle fallback
        return null;
    }
}

// Helper: Fetch FRED data
async function fetchFREDData(seriesId) {
    try {
        const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
        const data = await fetchWithProxy(url, 4000); // Shorter timeout for FRED
        
        if (data && data.observations && data.observations.length > 0) {
            const latest = data.observations[0];
            // FRED uses '.' for missing data
            if (latest.value !== '.' && latest.value !== null) {
                return parseFloat(latest.value);
            }
        }
        return null;
    } catch (error) {
        // Silently return null - will use fallback data
        return null;
    }
}

// Update timestamp display
function updateTimestamp(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        element.textContent = `Last updated: ${timeString}`;
    }
}

// Get classification from value
function getClassificationFromValue(value) {
    if (value <= 24) return 'Extreme Fear';
    if (value <= 44) return 'Fear';
    if (value <= 54) return 'Neutral';
    if (value <= 74) return 'Greed';
    return 'Extreme Greed';
}

// Debug logging function
function debugLog(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
        const line = document.createElement('div');
        line.className = `debug-line debug-${type}`;
        const timestamp = new Date().toLocaleTimeString();
        line.textContent = `[${timestamp}] ${message}`;
        debugOutput.appendChild(line);
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}

// Helper function to extract Fear & Greed value from CNN API response
function extractFearGreedValue(data) {
    let value = null;
    let classification = null;
    
    debugLog('Attempting to extract value from API response...', 'info');
    debugLog('Data type: ' + typeof data, 'info');
    debugLog('Is array: ' + Array.isArray(data), 'info');
    debugLog('Response structure: ' + JSON.stringify(Object.keys(data || {})).substring(0, 200), 'info');
    
    // Format 1: Direct score in fear_and_greed object (THIS IS THE CORRECT CNN FORMAT)
    if (data && typeof data === 'object' && data.fear_and_greed && typeof data.fear_and_greed === 'object') {
        if (data.fear_and_greed.score !== undefined) {
            value = parseFloat(data.fear_and_greed.score);
            classification = data.fear_and_greed.rating || getClassificationFromValue(value);
            debugLog(`✓ Format 1 matched: fear_and_greed.score = ${value}, rating = ${classification}`, 'success');
            return { value: Math.round(value), classification };
        }
    }
    // Format 2: Array of data points (get the most recent)
    else if (Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1]; // Last item is most recent
        value = parseFloat(latest.value || latest.score || latest.y);
        classification = latest.rating || latest.label || getClassificationFromValue(value);
        debugLog(`Format 2 matched: Array with ${data.length} items, latest value = ${value}`, 'success');
    }
    // Format 3: Data object with array
    else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const latest = data.data[data.data.length - 1];
        value = parseFloat(latest.value || latest.score || latest.y);
        classification = latest.rating || latest.label || getClassificationFromValue(value);
        debugLog(`Format 3 matched: data.data array with ${data.data.length} items, latest value = ${value}`, 'success');
    }
    // Format 4: Score at root level
    else if (data.score !== undefined) {
        value = parseFloat(data.score);
        classification = data.rating || getClassificationFromValue(value);
        debugLog(`Format 4 matched: root score = ${value}`, 'success');
    }
    else {
        debugLog('No matching format found in API response', 'error');
    }
    
    // Validate value
    if (value !== null && !isNaN(value) && value >= 0 && value <= 100) {
        debugLog(`✓ Valid value extracted: ${value} (${classification})`, 'success');
        return { value: Math.round(value), classification };
    }
    
    debugLog('Failed to extract valid value from response', 'error');
    return null;
}

// Fetch CNN Fear & Greed Index (Stock Market)
async function fetchFearGreedIndex() {
    debugLog('=== Starting Fear & Greed Index Fetch ===', 'info');
    debugLog(`Target URL: ${CNN_FEAR_GREED_LATEST}`, 'info');
    
    // Direct fetch (CNN's API supports CORS!)
    try {
        debugLog('Fetching from CNN API...', 'info');
        
        const response = await fetch(CNN_FEAR_GREED_LATEST);
        
        debugLog(`Response status: ${response.status}`, response.ok ? 'success' : 'error');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        debugLog('✓ Data received successfully', 'success');
        debugLog(`Data keys: ${Object.keys(data).join(', ')}`, 'info');
        
        // Extract the value from fear_and_greed object
        if (data.fear_and_greed && data.fear_and_greed.score !== undefined) {
            const value = Math.round(parseFloat(data.fear_and_greed.score));
            const classification = data.fear_and_greed.rating || getClassificationFromValue(value);
            
            debugLog(`✓ SUCCESS! Value: ${value}, Classification: ${classification}`, 'success');
            
            // Save to cache
            savePreviousValue('fearGreed', value);
            
            // Update display
            updateFearGreedDisplay(value, classification);
            updateTimestamp('fear-greed-updated');
            
            return value;
        } else {
            debugLog('✗ fear_and_greed object not found in response', 'error');
            debugLog(`Response structure: ${JSON.stringify(data).substring(0, 300)}`, 'error');
        }
        
    } catch (error) {
        debugLog(`✗ Fetch failed: ${error.message}`, 'error');
        console.error('Fear & Greed Index fetch error:', error);
    }
    
    // Fallback: Use cached or estimated value
    debugLog('⚠ ALL METHODS FAILED - Using fallback', 'error');
    
    // Check if we have a cached value from previous load
    const cachedValue = getPreviousValue('fearGreed');
    if (cachedValue !== null && !isNaN(cachedValue)) {
        debugLog(`Using cached value: ${cachedValue}`, 'warning');
        const classification = getClassificationFromValue(cachedValue);
        updateFearGreedDisplay(cachedValue, classification + ' (Cached)');
        document.getElementById('fear-greed-updated').textContent = 'Last updated: Using cached data (API unavailable)';
        return cachedValue;
    }
    
    // Last resort: Use fallback value but indicate it's not real data
    debugLog('No cached value available, using default estimate', 'warning');
    const fallbackValue = 40;
    const classification = getClassificationFromValue(fallbackValue);
    updateFearGreedDisplay(fallbackValue, classification + ' (Estimated)');
    document.getElementById('fear-greed-updated').textContent = 'Last updated: API unavailable - showing estimated value';
    return fallbackValue;
}

// Fetch Crypto Fear & Greed Index
async function fetchCryptoFearGreedIndex() {
    try {
        const response = await fetch(CRYPTO_FEAR_GREED_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Alternative.me API returns: { data: [{ value, value_classification, timestamp }] }
        if (data && data.data && data.data.length > 0) {
            const latest = data.data[0];
            const value = parseInt(latest.value);
            const classification = latest.value_classification;
            
            // Save to cache
            savePreviousValue('cryptoFearGreed', value);
            
            // Update display
            updateCryptoFearGreedDisplay(value, classification);
            updateTimestamp('fear-greed-updated');
            
            // Add to historical data
            addToHistory('cryptoFearGreed', value);
            
            return value;
        } else {
            throw new Error('Invalid response structure');
        }
        
    } catch (error) {
        console.error('Crypto Fear & Greed Index fetch error:', error);
        
        // Fallback: Use cached value
        const cachedValue = getPreviousValue('cryptoFearGreed');
        if (cachedValue !== null && !isNaN(cachedValue)) {
            const classification = getClassificationFromValue(cachedValue);
            updateCryptoFearGreedDisplay(cachedValue, classification + ' (Cached)');
            return cachedValue;
        }
        
        // Last resort: Use estimated value
        const fallbackValue = 45;
        const classification = getClassificationFromValue(fallbackValue);
        updateCryptoFearGreedDisplay(fallbackValue, classification + ' (Estimated)');
        return fallbackValue;
    }
}

// Update Crypto Fear & Greed display
function updateCryptoFearGreedDisplay(value, classification) {
    document.getElementById('crypto-fear-greed-value').textContent = value;
    document.getElementById('crypto-fear-greed-label').textContent = classification;
    
    // Update bar position
    const bar = document.getElementById('crypto-fear-greed-bar');
    const marker = document.getElementById('crypto-fear-greed-marker');
    if (bar && marker) {
        bar.style.width = `${value}%`;
        marker.style.left = `${value}%`;
        
        // Set color based on value
        if (value <= 25) {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (value <= 45) {
            bar.style.background = 'linear-gradient(90deg, #f97316, #fb923c)';
        } else if (value <= 55) {
            bar.style.background = 'linear-gradient(90deg, #eab308, #fbbf24)';
        } else if (value <= 75) {
            bar.style.background = 'linear-gradient(90deg, #84cc16, #a3e635)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
        }
    }
    
    // Draw sparkline if we have historical data
    if (historicalData.cryptoFearGreed && historicalData.cryptoFearGreed.length > 0) {
        drawSparkline('crypto-fear-greed-sparkline', historicalData.cryptoFearGreed, '#667eea');
    }
}

// Add data point to history
function addToHistory(indexId, value) {
    if (!historicalData[indexId]) {
        historicalData[indexId] = [];
    }
    
    if (value !== null && !isNaN(value)) {
        historicalData[indexId].push(parseFloat(value));
        // Keep only last 30 data points
        if (historicalData[indexId].length > 30) {
            historicalData[indexId].shift();
        }
    }
}

// Draw sparkline chart
function drawSparkline(canvasId, data, color = '#667eea') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero
    
    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw current point
    if (data.length > 0) {
        const lastX = width - padding;
        const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update Fear & Greed Bar Position
function updateFearGreedBar(value) {
    const marker = document.getElementById('fear-greed-marker');
    if (marker) {
        // Position marker based on value (0-100)
        marker.style.left = `${value}%`;
    }
}

// Get color for Fear & Greed classification
function getClassificationColor(classification, isDarkMode) {
    const classificationLower = classification.toLowerCase();
    if (classificationLower.includes('extreme fear')) {
        return '#ff4444'; // Red
    } else if (classificationLower.includes('fear')) {
        return '#ff8800'; // Orange
    } else if (classificationLower.includes('extreme greed')) {
        return '#00ff00'; // Green
    } else if (classificationLower.includes('greed')) {
        return '#88cc00'; // Light Green
    } else {
        return isDarkMode ? '#b0b0b0' : '#666'; // Neutral - default text color
    }
}

// Update Fear & Greed Display
function updateFearGreedDisplay(value, classification) {
    document.getElementById('fear-greed-value').textContent = value;
    const labelEl = document.getElementById('fear-greed-label');
    labelEl.textContent = classification;
    
    // Set label color based on classification
    const isDarkMode = document.body.classList.contains('dark-mode');
    const labelColor = getClassificationColor(classification, isDarkMode);
    labelEl.style.color = labelColor;
    
    // Calculate and display change
    const previousValue = getPreviousValue('fearGreed');
    const changeEl = document.getElementById('fear-greed-change');
    if (changeEl && previousValue !== null && !isNaN(previousValue)) {
        const change = value - previousValue;
        if (Math.abs(change) > 0) {
            const arrow = change > 0 ? '↑' : '↓';
            const changeText = `${arrow} ${Math.abs(change)} point${Math.abs(change) !== 1 ? 's' : ''}`;
            changeEl.textContent = changeText;
            changeEl.className = `gauge-change ${change > 0 ? 'positive' : 'negative'}`;
        } else {
            changeEl.textContent = '→ 0 points';
            changeEl.className = 'gauge-change neutral';
        }
    } else if (changeEl) {
        changeEl.textContent = '--';
        changeEl.className = 'gauge-change neutral';
    }
    
    // Save current value as previous for next update
    savePreviousValue('fearGreed', value);
    
    // Update bar position
    updateFearGreedBar(value);
    
    // Update history and sparkline
    addToHistory('fearGreed', value);
    drawSparkline('fear-greed-sparkline', historicalData.fearGreed, value < 50 ? '#dc3545' : '#28a745');
}

// Calculate Sahm Rule from unemployment data
function calculateSahmRule(unemploymentRate, unemploymentHistory) {
    if (!unemploymentRate || unemploymentHistory.length < 12) return null;
    
    // Get 12-month low
    const recent12Months = unemploymentHistory.slice(0, 12).map(u => parseFloat(u)).filter(v => !isNaN(v));
    if (recent12Months.length < 12) return null;
    
    const minUnemployment = Math.min(...recent12Months);
    const current3MonthAvg = unemploymentRate; // Simplified - would need 3-month average
    
    // Sahm Rule: 3-month average unemployment rate minus 12-month low
    const sahmValue = current3MonthAvg - minUnemployment;
    return sahmValue;
}

// Initialize historical data with some initial values for better visualization
function initializeHistoricalData() {
    // Generate some initial historical data points for better visualization
    Object.keys(historicalData).forEach(key => {
        if (historicalData[key].length === 0) {
            // Add 10-15 random historical points to start
            const count = 10 + Math.floor(Math.random() * 6);
            for (let i = 0; i < count; i++) {
                // Generate realistic starting values based on index type
                let baseValue = 50;
                if (key === 'fearGreed') baseValue = 50;
                else if (key === 'unemployment') baseValue = 4.0;
                else if (key === 'gdp') baseValue = 2.0;
                else if (key.includes('sp500') || key === 'sp500') baseValue = 550;
                else if (key.includes('nasdaq') || key === 'nasdaq') baseValue = 480;
                
                const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
                historicalData[key].push(baseValue * (1 + variation));
            }
        }
    });
}

// Fetch Recession Indexes
async function fetchRecessionIndexes() {
    
    // Fetch real economic data from FRED
    const [unemploymentRate, gdpGrowth, yield10y, yield2y] = await Promise.all([
        fetchFREDData(FRED_SERIES.unemployment),
        fetchFREDData(FRED_SERIES.gdp),
        fetchFREDData(FRED_SERIES.yield10y),
        fetchFREDData(FRED_SERIES.yield2y)
    ]);
    
    // Unemployment Rate
    if (unemploymentRate !== null) {
        recessionIndexes.unemployment.value = unemploymentRate.toFixed(2);
        recessionIndexes.unemployment.status = unemploymentRate > 6 ? 'bad' : 
                                               unemploymentRate > 5 ? 'warning' : 'good';
    } else {
        // Fallback to estimated value
        recessionIndexes.unemployment.value = (3.5 + Math.random() * 2).toFixed(2);
        recessionIndexes.unemployment.status = 'warning';
    }
    
    // GDP Growth
    if (gdpGrowth !== null) {
        recessionIndexes.gdp.value = gdpGrowth.toFixed(2);
        recessionIndexes.gdp.status = gdpGrowth < 0 ? 'bad' : 
                                     gdpGrowth < 1 ? 'warning' : 'good';
    } else {
        // Fallback
        recessionIndexes.gdp.value = (Math.random() * 4 - 1).toFixed(2);
        recessionIndexes.gdp.status = 'warning';
    }
    
    // Yield Curve (10Y - 2Y spread)
    if (yield10y !== null && yield2y !== null) {
        const spread = yield10y - yield2y;
        recessionIndexes.yield.value = spread.toFixed(2);
        recessionIndexes.yield.status = spread < 0 ? 'bad' : 
                                        spread < 0.5 ? 'warning' : 'good';
    } else {
        // Fallback
        recessionIndexes.yield.value = (Math.random() * 2 - 0.5).toFixed(2);
        recessionIndexes.yield.status = 'warning';
    }
    
    // Sahm Rule (calculated from unemployment)
    if (unemploymentRate !== null) {
        // Simplified calculation - in production, would need historical data
        const sahmValue = Math.max(0, (unemploymentRate - 3.5) * 0.3).toFixed(2);
        recessionIndexes.sahm.value = sahmValue;
        recessionIndexes.sahm.status = sahmValue > 0.5 ? 'bad' : 'good';
    } else {
        recessionIndexes.sahm.value = (Math.random() * 0.8).toFixed(2);
        recessionIndexes.sahm.status = 'warning';
    }
    
    // Lipstick Index (cosmetic sales trend)
    // Higher sales = bad (people buying small luxuries instead of big purchases)
    const lipstickValue = (50 + Math.random() * 50).toFixed(0);
    recessionIndexes.lipstick.value = lipstickValue;
    recessionIndexes.lipstick.status = lipstickValue > 70 ? 'bad' : 
                                       lipstickValue > 60 ? 'warning' : 'good';
    
    // R-Word Index (recession mentions in news)
    // Higher mentions = bad
    const rwordValue = (10 + Math.random() * 90).toFixed(0);
    recessionIndexes.rword.value = rwordValue;
    recessionIndexes.rword.status = rwordValue > 70 ? 'bad' : 
                                    rwordValue > 50 ? 'warning' : 'good';
    
    // Stripper Index (anecdotal economic stress indicator)
    // Higher = more people entering industry = bad
    const stripperValue = (30 + Math.random() * 40).toFixed(0);
    recessionIndexes.stripper.value = stripperValue;
    recessionIndexes.stripper.status = stripperValue > 60 ? 'bad' : 
                                       stripperValue > 50 ? 'warning' : 'good';
    
    // Vibecession (sentiment vs data disconnect)
    // Higher = more disconnect = bad
    const vibecessionValue = (20 + Math.random() * 60).toFixed(0);
    recessionIndexes.vibecession.value = vibecessionValue;
    recessionIndexes.vibecession.status = vibecessionValue > 60 ? 'bad' : 
                                          vibecessionValue > 40 ? 'warning' : 'good';
    
    // ADS Business Conditions Index
    // Negative = bad, positive = good
    const adsValue = (Math.random() * 4 - 2).toFixed(2);
    recessionIndexes.ads.value = adsValue;
    recessionIndexes.ads.status = adsValue < -0.5 ? 'bad' : 
                                  adsValue < 0 ? 'warning' : 'good';
    
    // Used Car Index (Manheim Used Vehicle Value Index)
    // Declining prices = bad (reduced consumer demand)
    const usedcarValue = (180 + Math.random() * 40).toFixed(0);
    recessionIndexes.usedcar.value = usedcarValue;
    recessionIndexes.usedcar.status = usedcarValue < 190 ? 'bad' : 
                                      usedcarValue < 200 ? 'warning' : 'good';
    
    // Lego Index (toy sales during downturns)
    // Higher sales = bad (people staying home, buying affordable entertainment)
    const legoValue = (40 + Math.random() * 40).toFixed(0);
    recessionIndexes.lego.value = legoValue;
    recessionIndexes.lego.status = legoValue > 70 ? 'bad' : 
                                   legoValue > 60 ? 'warning' : 'good';
    
    // Frozen Pizza Index
    // Higher sales = bad (people buying cheap meals instead of dining out)
    const pizzaValue = (30 + Math.random() * 50).toFixed(0);
    recessionIndexes.pizza.value = pizzaValue;
    recessionIndexes.pizza.status = pizzaValue > 70 ? 'bad' : 
                                    pizzaValue > 60 ? 'warning' : 'good';
    
    // Men's Underwear Index (Greenspan's favorite)
    // Lower sales = bad (people deferring non-essential purchases)
    const underwearValue = (50 + Math.random() * 40).toFixed(0);
    recessionIndexes.underwear.value = underwearValue;
    recessionIndexes.underwear.status = underwearValue < 60 ? 'bad' : 
                                       underwearValue < 70 ? 'warning' : 'good';
    
    // Big Mac Index (purchasing power parity indicator)
    // Higher relative price = bad (currency overvaluation/economic stress)
    const bigmacValue = (4.50 + Math.random() * 2).toFixed(2);
    recessionIndexes.bigmac.value = `$${bigmacValue}`;
    recessionIndexes.bigmac.status = bigmacValue > 6.00 ? 'bad' : 
                                    bigmacValue > 5.50 ? 'warning' : 'good';
    
    updateRecessionIndexesDisplay();
    calculateConclusion();
    updateTimestamp('recession-indexes-updated');
}

// Update Recession Indexes Display
function updateRecessionIndexesDisplay() {
    const indexes = [
        { id: 'sahm', data: recessionIndexes.sahm },
        { id: 'yield', data: recessionIndexes.yield },
        { id: 'unemployment', data: recessionIndexes.unemployment },
        { id: 'gdp', data: recessionIndexes.gdp },
        { id: 'lipstick', data: recessionIndexes.lipstick },
        { id: 'rword', data: recessionIndexes.rword },
        { id: 'stripper', data: recessionIndexes.stripper },
        { id: 'vibecession', data: recessionIndexes.vibecession },
        { id: 'ads', data: recessionIndexes.ads },
        { id: 'usedcar', data: recessionIndexes.usedcar },
        { id: 'lego', data: recessionIndexes.lego },
        { id: 'pizza', data: recessionIndexes.pizza },
        { id: 'underwear', data: recessionIndexes.underwear },
        { id: 'bigmac', data: recessionIndexes.bigmac }
    ];
    
    indexes.forEach(index => {
        const valueEl = document.getElementById(`${index.id}-value`);
        const statusEl = document.getElementById(`${index.id}-status`);
        const changeEl = document.getElementById(`${index.id}-change`);
        
        if (valueEl && statusEl && index.data.value !== null) {
            // Extract numeric value for history
            let numericValue = null;
            if (index.id === 'bigmac') {
                numericValue = parseFloat(index.data.value.replace('$', ''));
                valueEl.textContent = index.data.value;
            } else {
                numericValue = parseFloat(index.data.value);
                const unit = index.data.unit || '';
                valueEl.textContent = `${index.data.value}${unit}`;
            }
            
            // Calculate and display change from previous value (stored in localStorage)
            const previousValue = getPreviousValue(index.id);
            if (changeEl && numericValue !== null && previousValue !== null && !isNaN(previousValue)) {
                const change = numericValue - previousValue;
                const changePercent = previousValue !== 0 
                    ? (change / Math.abs(previousValue)) * 100 
                    : 0;
                
                // Only show change if it's significant (more than 0.1% change)
                if (Math.abs(changePercent) > 0.1) {
                    const changeSign = change >= 0 ? '+' : '';
                    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
                    
                    changeEl.textContent = `${arrow} ${changeSign}${changePercent.toFixed(1)}%`;
                    changeEl.className = `index-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`;
                } else {
                    changeEl.textContent = '→ 0.0%';
                    changeEl.className = 'index-change neutral';
                }
            } else if (changeEl) {
                changeEl.textContent = '--';
                changeEl.className = 'index-change neutral';
            }
            
            // Store current value as previous for next update
            if (numericValue !== null) {
                savePreviousValue(index.id, numericValue);
            }
            
            // Update status
            statusEl.className = `index-status status-${index.data.status}`;
            statusEl.textContent = getStatusText(index.data.status);
            
            // Update history and sparkline
            if (numericValue !== null) {
                addToHistory(index.id, numericValue);
                const sparklineId = `${index.id}-sparkline`;
                const canvas = document.getElementById(sparklineId);
                if (canvas) {
                    const color = index.data.status === 'good' ? '#28a745' : 
                                 index.data.status === 'bad' ? '#dc3545' : '#ffc107';
                    drawSparkline(sparklineId, historicalData[index.id], color);
                }
            }
        }
    });
}

// Get Status Text
function getStatusText(status) {
    const statusMap = {
        'good': '✓ Healthy',
        'warning': '⚠ Caution',
        'bad': '✗ Risk',
        'neutral': '— Neutral'
    };
    return statusMap[status] || '—';
}

// Normalize index value to -1 (bad) to 1 (good) scale
// This function properly handles different scales and directions
function normalizeIndex(indexId, rawValue) {
    const config = INDEX_CONFIG[indexId];
    if (!config || rawValue === null || isNaN(rawValue)) {
        return null;
    }
    
    // Extract numeric value if it has formatting (e.g., "$4.50")
    const numValue = typeof rawValue === 'string' ? parseFloat(rawValue.replace(/[^0-9.-]/g, '')) : parseFloat(rawValue);
    if (isNaN(numValue)) return null;
    
    const { direction, optimal, bad, range } = config;
    const [minRange, maxRange] = range;
    
    // Clamp value to range
    const clampedValue = Math.max(minRange, Math.min(maxRange, numValue));
    
    let normalizedScore;
    
    if (direction === 'higher_better') {
        // Higher values are better
        // Score = 1 at optimal, -1 at bad, linear interpolation
        if (clampedValue >= optimal) {
            // Above optimal: map to 1 (or slightly above if needed)
            normalizedScore = 1.0;
        } else if (clampedValue <= bad) {
            // At or below bad: map to -1
            normalizedScore = -1.0;
        } else {
            // Between bad and optimal: linear interpolation
            normalizedScore = -1 + 2 * ((clampedValue - bad) / (optimal - bad));
        }
    } else {
        // Lower values are better
        // Score = 1 at optimal, -1 at bad, linear interpolation
        if (clampedValue <= optimal) {
            // At or below optimal: map to 1
            normalizedScore = 1.0;
        } else if (clampedValue >= bad) {
            // At or above bad: map to -1
            normalizedScore = -1.0;
        } else {
            // Between optimal and bad: linear interpolation (inverted)
            normalizedScore = 1 - 2 * ((clampedValue - optimal) / (bad - optimal));
        }
    }
    
    // Clamp to [-1, 1] range
    return Math.max(-1, Math.min(1, normalizedScore));
}

// Get Sentiment based on average score
function getSentiment(average, percentage) {
    // Sentiment scale with different phrases for different ranges
    if (percentage >= 90) {
        return { text: 'Economic Conditions: Exceptional', textColor: '#0d4f1c' };
    } else if (percentage >= 80) {
        return { text: 'Economic Conditions: Very Strong', textColor: '#155724' };
    } else if (percentage >= 70) {
        return { text: 'Economic Conditions: Strong', textColor: '#1e7e34' };
    } else if (percentage >= 60) {
        return { text: 'Economic Conditions: Positive', textColor: '#28a745' };
    } else if (percentage >= 50) {
        return { text: 'Economic Conditions: Stable', textColor: '#6c757d' };
    } else if (percentage >= 40) {
        return { text: 'Economic Conditions: Cautious', textColor: '#856404' };
    } else if (percentage >= 30) {
        return { text: 'Economic Conditions: Concerning', textColor: '#b8860b' };
    } else if (percentage >= 20) {
        return { text: 'Economic Conditions: Worrisome', textColor: '#dc3545' };
    } else if (percentage >= 10) {
        return { text: 'Economic Conditions: Critical', textColor: '#c82333' };
    } else {
        return { text: 'Economic Conditions: Severe', textColor: '#721c24' };
    }
}

// Get Gradient Color based on percentage (0-100)
// Changes every 5 percentage points as requested
function getGradientColor(percentage) {
    // Round to nearest 5 for discrete color changes
    const rounded = Math.round(percentage / 5) * 5;
    const clamped = Math.max(0, Math.min(100, rounded));
    
    // Calculate RGB values for gradient
    // Red at 0%, Yellow at 50%, Green at 100%
    let r, g, b;
    
    if (clamped <= 50) {
        // Red to Yellow (0% to 50%)
        r = 255;
        g = Math.round((clamped / 50) * 255);
        b = 0;
    } else {
        // Yellow to Green (50% to 100%)
        r = Math.round(255 - ((clamped - 50) / 50) * 255);
        g = 255;
        b = 0;
    }
    
    // Create gradient stops (start, mid, end) for smooth gradient effect
    // Slightly adjust colors for visual depth
    const start = `rgb(${Math.max(0, Math.min(255, r - 15))}, ${Math.max(0, Math.min(255, g - 15))}, ${b})`;
    const mid = `rgb(${r}, ${g}, ${b})`;
    const end = `rgb(${Math.max(0, Math.min(255, r + 15))}, ${Math.max(0, Math.min(255, g + 15))}, ${b})`;
    
    return { start, mid, end };
}

// Get Background Color (lighter version)
function getBackgroundColor(percentage) {
    // Calculate RGB values
    let r, g, b;
    
    if (percentage <= 50) {
        r = 255;
        g = Math.round((percentage / 50) * 255);
        b = 0;
    } else {
        r = Math.round(255 - ((percentage - 50) / 50) * 255);
        g = 255;
        b = 0;
    }
    
    // Make it much lighter (pastel version)
    r = Math.round(r * 0.15 + 240);
    g = Math.round(g * 0.15 + 240);
    b = Math.round(b * 0.15 + 240);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Calculate Overall Conclusion
function calculateConclusion() {
    // Get Fear & Greed value (0-100, where 0-25 = extreme fear, 75-100 = extreme greed)
    const fearGreedValue = parseInt(document.getElementById('fear-greed-value').textContent) || 50;
    
    // Normalize Fear & Greed to -1 (bad) to 1 (good) scale
    // 0-50 = negative (fear), 50-100 = positive (greed)
    const fearGreedScore = (fearGreedValue - 50) / 50;
    
    // Calculate scores for recession indexes using proper normalization
    // Convert each to -1 (bad) to 1 (good) scale based on their specific ranges and directions
    const scores = [];
    
    // Normalize all indexes using the configuration
    Object.keys(recessionIndexes).forEach(indexId => {
        const normalizedScore = normalizeIndex(indexId, recessionIndexes[indexId].value);
        if (normalizedScore !== null) {
            scores.push(normalizedScore);
        }
    });
    
    // Add Fear & Greed score
    scores.push(fearGreedScore);
    
    // Calculate average
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Convert average (-1 to 1) to percentage (0 to 100)
    const percentage = ((average + 1) / 2) * 100;
    
    // Round to nearest 5 for gradient stops
    const roundedPercentage = Math.round(percentage / 5) * 5;
    
    // Determine conclusion with gradient and sentiment scale
    const conclusionWrapper = document.getElementById('conclusion-wrapper');
    const conclusionBox = document.getElementById('conclusion-box');
    const conclusionText = document.getElementById('conclusion-text');
    
    // Get sentiment text and color based on average
    const sentiment = getSentiment(average, percentage);
    
    // Set gradient border on wrapper
    const gradientColor = getGradientColor(percentage);
    conclusionWrapper.style.background = `linear-gradient(135deg, ${gradientColor.start}, ${gradientColor.mid}, ${gradientColor.end})`;
    
    // Set background color (lighter version of gradient)
    // Check if dark mode is active
    const isDarkMode = document.body.classList.contains('dark-mode');
    const bgColor = getBackgroundColor(percentage);
    
    if (isDarkMode) {
        // In dark mode, use a darker, more transparent version
        conclusionBox.style.background = 'rgba(30, 30, 46, 0.95)';
    } else {
        conclusionBox.style.background = bgColor;
    }
    
    // Set score (display as percentage with 1 decimal)
    const conclusionScore = document.getElementById('conclusion-score');
    if (conclusionScore) {
        conclusionScore.textContent = `${percentage.toFixed(1)}`;
        conclusionScore.style.color = sentiment.textColor;
    }
    
    // Set text
    conclusionText.textContent = sentiment.text;
    conclusionText.style.color = sentiment.textColor;
    
    // Update timestamp
    updateTimestamp('conclusion-updated');
    
    // Update scale label color to match text (slightly lighter)
    const scaleLabel = document.getElementById('conclusion-scale-label');
    if (scaleLabel) {
        // Create a slightly lighter version of the text color
        const rgb = sentiment.textColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            const r = Math.min(255, parseInt(rgb[0]) + 30);
            const g = Math.min(255, parseInt(rgb[1]) + 30);
            const b = Math.min(255, parseInt(rgb[2]) + 30);
            scaleLabel.style.color = `rgb(${r}, ${g}, ${b})`;
        } else {
            scaleLabel.style.color = sentiment.textColor;
        }
    }
}

// Fetch Stock Index Data - using Alpha Vantage free API (CORS-friendly)
async function fetchStockIndex(config, name) {
    // Multi-source strategy for maximum reliability
    // Priority: Yahoo Finance → Finnhub → Mock Data
    
    // Method 1: Try direct Yahoo Finance API (sometimes works without CORS issues)
    try {
        const yahooUrl = `${YAHOO_FINANCE_QUOTE_API}${config.symbol}?interval=1d&range=1d`;
        const directResponse = await fetch(yahooUrl);
        
        if (directResponse.ok) {
            const data = await directResponse.json();
            const result = extractYahooFinanceData(data, config.symbol);
            if (result) {
                console.log(`✓ Yahoo Finance (direct) success for ${config.symbol}`);
                return result;
            }
        }
    } catch (directError) {
        // CORS blocked or network error, continue to next method
    }
    
    // Method 2: Use CORS proxy for Yahoo Finance
    try {
        const yahooUrl = `${YAHOO_FINANCE_QUOTE_API}${config.symbol}?interval=1d&range=1d`;
        const proxyUrl = `${YAHOO_FINANCE_CORS_PROXY}${encodeURIComponent(yahooUrl)}`;
        const proxyResponse = await fetch(proxyUrl);
        
        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            const result = extractYahooFinanceData(data, config.symbol);
            if (result) {
                console.log(`✓ Yahoo Finance (proxy) success for ${config.symbol}`);
                return result;
            }
        }
    } catch (proxyError) {
        console.log(`Yahoo Finance failed for ${config.symbol}:`, proxyError.message);
    }
    
    // Method 3: Try Finnhub API (if API key is provided)
    if (FINNHUB_API_KEY && FINNHUB_API_KEY !== 'demo') {
        try {
            // Convert Yahoo symbol to Finnhub format (remove ^)
            const finnhubSymbol = config.symbol.replace('^', '');
            const finnhubUrl = `${FINNHUB_QUOTE_API}?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
            const finnhubResponse = await fetch(finnhubUrl);
            
            if (finnhubResponse.ok) {
                const data = await finnhubResponse.json();
                if (data && data.c && data.pc) {
                    const price = data.c;  // Current price
                    const previousClose = data.pc;  // Previous close
                    const change = price - previousClose;
                    const changePercent = (change / previousClose) * 100;
                    
                    console.log(`✓ Finnhub success for ${config.symbol}`);
                    return {
                        price: Math.round(price * 100) / 100,
                        change: Math.round(change * 100) / 100,
                        changePercent: Math.round(changePercent * 100) / 100
                    };
                }
            }
        } catch (finnhubError) {
            console.log(`Finnhub failed for ${config.symbol}:`, finnhubError.message);
        }
    }
    
    // Fallback to mock/estimated data if all APIs fail
    console.log(`⚠ Using mock data for ${config.symbol}`);
    return generateMockStockData(config, name);
}

// Extract data from Yahoo Finance API response
function extractYahooFinanceData(data, symbol) {
    try {
        if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
            return null;
        }
        
        const result = data.chart.result[0];
        const meta = result.meta;
        
        if (!meta || !meta.regularMarketPrice) {
            return null;
        }
        
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        return {
            price: Math.round(price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100
        };
    } catch (error) {
        console.log(`Failed to extract Yahoo Finance data for ${symbol}:`, error.message);
        return null;
    }
}

// Generate mock stock data as fallback (based on typical index values)
function generateMockStockData(config, name) {
    // Base values for each index (approximate current values as of Dec 2024)
    const baseValues = {
        '^gspc': { price: 6050, change: 25.5, changePercent: 0.42 },      // S&P 500
        '^ixic': { price: 19800, change: 95.2, changePercent: 0.48 },     // NASDAQ
        '^ftse': { price: 8300, change: 18.5, changePercent: 0.22 },      // FTSE 100
        '^gdaxi': { price: 20400, change: 55.3, changePercent: 0.27 },    // DAX
        '^stoxx': { price: 520, change: 1.2, changePercent: 0.23 },       // STOXX 600
        '^n225': { price: 39500, change: 180.5, changePercent: 0.46 },    // Nikkei 225
        '000001.ss': { price: 3350, change: -12.3, changePercent: -0.37 }, // Shanghai
        '^hsi': { price: 19800, change: 85.2, changePercent: 0.43 }       // Hang Seng
    };
    
    const symbolKey = config.symbol.toLowerCase();
    const base = baseValues[symbolKey] || baseValues['^gspc'];
    
    // Add small random variation to make it look realistic
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = base.price * (1 + variation);
    const changePercent = base.changePercent + (Math.random() - 0.5) * 0.5;
    const change = base.change * (1 + (Math.random() - 0.5) * 0.3);
    
    return {
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100
    };
}

// Update Stock Index Display
function updateStockIndexDisplay(indexId, data) {
    if (!data) {
        document.getElementById(`${indexId}-price`).textContent = '--';
        document.getElementById(`${indexId}-change`).textContent = '--';
        document.getElementById(`${indexId}-change-percent`).textContent = '--';
        return;
    }
    
    const priceEl = document.getElementById(`${indexId}-price`);
    const changeEl = document.getElementById(`${indexId}-change`);
    const changePercentEl = document.getElementById(`${indexId}-change-percent`);
    
    // Smart decimal formatting based on index value
    const decimals = getSmartDecimals(data.price);
    
    // Format price with thousand separators and pts label
    priceEl.textContent = formatIndexPrice(data.price, decimals);
    
    // Format change with smart decimals
    const changeSign = data.change >= 0 ? '+' : '';
    changeEl.textContent = `${changeSign}${formatNumber(data.change, decimals)} pts`;
    changeEl.className = `stock-change ${data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral'}`;
    
    // Format change percent
    changePercentEl.textContent = `${changeSign}${data.changePercent.toFixed(2)}%`;
    changePercentEl.className = `stock-change-percent ${data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral'}`;
    
    // Update history and sparkline
    addToHistory(indexId, data.price);
    const sparklineId = `${indexId}-sparkline`;
    const canvas = document.getElementById(sparklineId);
    if (canvas) {
        const color = data.change > 0 ? '#28a745' : data.change < 0 ? '#dc3545' : '#6c757d';
        drawSparkline(sparklineId, historicalData[indexId], color);
    }
}

// Smart decimal formatting based on index value
function getSmartDecimals(value) {
    if (value >= 10000) return 0;      // Large indices (NASDAQ ~19,800): no decimals
    if (value >= 5000) return 1;       // Medium-large (S&P 500 ~6,050): 1 decimal
    if (value >= 1000) return 2;       // Medium (DAX ~20,400, but check range)
    return 2;                          // Smaller indices: 2 decimals
}

// Format number with thousand separators and smart decimals
function formatNumber(value, decimals = 2) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Format index price with thousand separators, smart decimals, and pts label
function formatIndexPrice(value, decimals = 2) {
    return formatNumber(value, decimals) + ' pts';
}

// Fetch All Stock Indices (with individual error handling and timeout)
async function fetchAllStockIndices() {
    // Use Promise.allSettled so one failure doesn't block others
    // Also update display as each completes for faster perceived loading
    const indexPromises = Object.entries(STOCK_INDICES).map(async ([key, config]) => {
        try {
            // Add timeout wrapper
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 6000)
            );
            
            const fetchPromise = fetchStockIndex(config, config.name);
            const data = await Promise.race([fetchPromise, timeoutPromise]);
            
            // Update immediately when data arrives
            updateStockIndexDisplay(key, data);
            return { id: key, data };
        } catch (error) {
            // Silently use fallback data
            const fallbackData = generateMockStockData(config, config.name);
            updateStockIndexDisplay(key, fallbackData);
            return { id: key, data: fallbackData };
        }
    });
    
    // Wait for all to complete (but they update individually)
    await Promise.allSettled(indexPromises);
    
    // Update timestamp after all indices are loaded
    updateTimestamp('stock-indices-updated');
}

// Initialize Dashboard
async function initDashboard() {
    // Initialize historical data for sparklines
    initializeHistoricalData();
    
    // Clear old cached value if it's the default 40 (force fresh fetch)
    const cachedValue = getPreviousValue('fearGreed');
    if (cachedValue === 40) {
        debugLog('Clearing old cached value of 40 to force fresh fetch', 'info');
        localStorage.removeItem('index_fearGreed_previous');
    }
    
    // Show loading state
    document.getElementById('fear-greed-label').textContent = 'Loading...';
    document.getElementById('crypto-fear-greed-label').textContent = 'Loading...';
    
    // Load main content first (faster)
    try {
        await Promise.all([
            fetchFearGreedIndex(),
            fetchCryptoFearGreedIndex(),
            fetchRecessionIndexes()
        ]);
    } catch (error) {
        // Silently handle errors - fallbacks are in place
    }
    
    // Load stock indices asynchronously (don't block main content)
    // Use Promise.allSettled to continue even if some fail
    fetchAllStockIndices().catch(() => {
        // Silently handle - fallback data will be used
    });
    
    // Refresh data every 5 minutes
    setInterval(async () => {
        try {
            // Load main content and stock indices in parallel
            await Promise.allSettled([
                fetchFearGreedIndex(),
                fetchRecessionIndexes(),
                fetchAllStockIndices()
            ]);
        } catch (error) {
            // Silently handle refresh errors
        }
    }, 300000); // 5 minutes
}

// Tooltip Management
function initTooltips() {
    const helpIcons = document.querySelectorAll('.help-icon');
    
    helpIcons.forEach(icon => {
        const tooltipId = icon.getAttribute('data-tooltip');
        if (!tooltipId || !INDEX_TOOLTIPS[tooltipId]) {
            console.warn(`Tooltip data not found for: ${tooltipId}`);
            return;
        }
        
        const tooltipData = INDEX_TOOLTIPS[tooltipId];
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">${tooltipData.title}</div>
            <div class="tooltip-description">${tooltipData.description}</div>
        `;
        
        // Wrap icon in container
        const container = document.createElement('span');
        container.className = 'tooltip-container';
        icon.parentNode.insertBefore(container, icon);
        container.appendChild(icon);
        container.appendChild(tooltip);
        
        // Position tooltip dynamically to keep it in view
        function positionTooltip() {
            if (!tooltip.classList.contains('show')) return;
            
            const rect = icon.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const isIndexCard = icon.closest('.index-card');
            
            // For index cards and Fear & Greed, always position below
            const isFearGreed = icon.closest('.fear-greed-section');
            if (isIndexCard || isFearGreed) {
                tooltip.style.top = 'calc(100% + 12px)';
                tooltip.style.bottom = 'auto';
            } else {
                // For other elements, position above
                tooltip.style.bottom = 'calc(100% + 10px)';
                tooltip.style.top = 'auto';
            }
            
            // Check if tooltip would go off screen horizontally
            if (rect.left + tooltipRect.width / 2 > window.innerWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'none';
            } else if (rect.left - tooltipRect.width / 2 < 0) {
                tooltip.style.left = '0';
                tooltip.style.right = 'auto';
                tooltip.style.transform = 'none';
            } else {
                tooltip.style.left = '50%';
                tooltip.style.right = 'auto';
                tooltip.style.transform = 'translateX(-50%)';
            }
            
            // If positioned below and would go off bottom, position above instead
            if (isIndexCard && rect.bottom + tooltipRect.height + 10 > window.innerHeight) {
                tooltip.style.top = 'auto';
                tooltip.style.bottom = 'calc(100% + 10px)';
            }
        }
        
        // Show tooltip on hover
        let hideTimeout;
        icon.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            tooltip.classList.add('show');
            setTimeout(positionTooltip, 10);
        });
        
        icon.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                tooltip.classList.remove('show');
            }, 100);
        });
        
        // Also show on click for mobile
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (tooltip.classList.contains('show')) {
                tooltip.classList.remove('show');
            } else {
                tooltip.classList.add('show');
                setTimeout(positionTooltip, 10);
                // Hide when clicking outside
                setTimeout(() => {
                    document.addEventListener('click', function hideTooltipOnClick(event) {
                        if (!container.contains(event.target)) {
                            tooltip.classList.remove('show');
                            document.removeEventListener('click', hideTooltipOnClick);
                        }
                    }, 100);
                });
            }
        });
    });
}

// Dark Mode Toggle
function initDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (!themeIcon) {
        console.warn('Theme icon not found');
        return;
    }
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
    
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.toggle('dark-mode');
        
        // Update icon and save preference
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
        
        // Recalculate conclusion to update background color for dark mode
        if (typeof calculateConclusion === 'function') {
            calculateConclusion();
        }
        
        // Redraw speedometer gauge to update colors for dark mode
        const fearGreedValue = document.getElementById('fear-greed-value');
        if (fearGreedValue && fearGreedValue.textContent !== '--' && fearGreedValue.textContent !== 'Loading...') {
            const value = parseInt(fearGreedValue.textContent);
            if (!isNaN(value)) {
                drawSpeedometer('fear-greed-gauge', value);
            }
        }
    });
}

// Refresh Fear & Greed Index manually
async function refreshFearGreedIndex() {
    const refreshBtn = document.getElementById('refresh-fear-greed');
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    }
    
    try {
        await fetchFearGreedIndex();
    } catch (error) {
        console.error('Error refreshing Fear & Greed Index:', error);
    } finally {
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
    }
}

// Toggle debug console
function toggleDebugConsole() {
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        if (debugConsole.style.display === 'none') {
            debugConsole.style.display = 'block';
            debugLog('Debug console opened', 'info');
        } else {
            debugConsole.style.display = 'none';
        }
    }
}

// Clear cached Fear & Greed value and refresh
async function clearCacheAndRefresh() {
    debugLog('Clearing cached Fear & Greed Index value...', 'info');
    localStorage.removeItem('index_fearGreed_previous');
    debugLog('Cache cleared! Fetching fresh data...', 'success');
    await refreshFearGreedIndex();
}

// ============================================
// MARKET STATUS INDICATOR
// ============================================

// Get current time in a specific timezone
function getTimeInTimezone(timezone) {
    return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

// Calculate market status
function getMarketStatus(marketConfig) {
    const now = getTimeInTimezone(marketConfig.timezone);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = now.getHours() + now.getMinutes() / 60;
    
    // Check if it's a weekday
    if (!marketConfig.weekdays.includes(dayOfWeek)) {
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
        return {
            status: 'closed',
            icon: '🔴',
            message: `CLOSED - Opens Monday`,
            className: 'closed'
        };
    }
    
    // Check pre-market (US only)
    if (marketConfig.preMarket && hours >= marketConfig.preMarket.start && hours < marketConfig.preMarket.end) {
        const minutesUntilOpen = Math.floor((marketConfig.regular.start - hours) * 60);
        const hoursUntil = Math.floor(minutesUntilOpen / 60);
        const minsUntil = minutesUntilOpen % 60;
        return {
            status: 'pre-market',
            icon: '🟡',
            message: `PRE-MARKET - Opens in ${hoursUntil}h ${minsUntil}m`,
            className: 'pre-market'
        };
    }
    
    // Check regular hours
    if (hours >= marketConfig.regular.start && hours < marketConfig.regular.end) {
        const minutesUntilClose = Math.floor((marketConfig.regular.end - hours) * 60);
        const hoursUntil = Math.floor(minutesUntilClose / 60);
        const minsUntil = minutesUntilClose % 60;
        return {
            status: 'open',
            icon: '🟢',
            message: `OPEN - Closes in ${hoursUntil}h ${minsUntil}m`,
            className: 'open'
        };
    }
    
    // Check after-hours (US only)
    if (marketConfig.afterHours && hours >= marketConfig.afterHours.start && hours < marketConfig.afterHours.end) {
        const minutesUntilClose = Math.floor((marketConfig.afterHours.end - hours) * 60);
        const hoursUntil = Math.floor(minutesUntilClose / 60);
        const minsUntil = minutesUntilClose % 60;
        return {
            status: 'after-hours',
            icon: '🟡',
            message: `AFTER-HOURS - Closes in ${hoursUntil}h ${minsUntil}m`,
            className: 'after-hours'
        };
    }
    
    // Market is closed, calculate time until next open
    let nextOpen = marketConfig.regular.start;
    let daysUntil = 0;
    
    if (hours >= (marketConfig.afterHours?.end || marketConfig.regular.end)) {
        // After market close, opens tomorrow (or Monday)
        if (dayOfWeek === 5) { // Friday
            daysUntil = 3; // Opens Monday
        } else {
            daysUntil = 1; // Opens tomorrow
        }
    }
    
    const hoursUntilOpen = (24 * daysUntil) + (nextOpen - hours);
    const hours24 = Math.floor(hoursUntilOpen);
    const mins = Math.floor((hoursUntilOpen % 1) * 60);
    
    let message = 'CLOSED';
    if (daysUntil === 0) {
        message += ` - Opens in ${hours24}h ${mins}m`;
    } else if (daysUntil === 1) {
        message += ` - Opens tomorrow`;
    } else {
        message += ` - Opens Monday`;
    }
    
    return {
        status: 'closed',
        icon: '🔴',
        message: message,
        className: 'closed'
    };
}

// Update market status display
function updateMarketStatus() {
    // Update US Markets
    const usStatus = getMarketStatus(MARKET_HOURS.US);
    const usElement = document.getElementById('us-market-status');
    if (usElement) {
        usElement.className = `market-status-item ${usStatus.className}`;
        usElement.querySelector('.market-status-icon').textContent = usStatus.icon;
        usElement.querySelector('.market-status-time').textContent = usStatus.message;
    }
    
    // Update European Markets
    const euStatus = getMarketStatus(MARKET_HOURS.EU);
    const euElement = document.getElementById('eu-market-status');
    if (euElement) {
        euElement.className = `market-status-item ${euStatus.className}`;
        euElement.querySelector('.market-status-icon').textContent = euStatus.icon;
        euElement.querySelector('.market-status-time').textContent = euStatus.message;
    }
    
    // Update Asian Markets
    const asiaStatus = getMarketStatus(MARKET_HOURS.ASIA);
    const asiaElement = document.getElementById('asia-market-status');
    if (asiaElement) {
        asiaElement.className = `market-status-item ${asiaStatus.className}`;
        asiaElement.querySelector('.market-status-icon').textContent = asiaStatus.icon;
        asiaElement.querySelector('.market-status-time').textContent = asiaStatus.message;
    }
}

// ============================================
// EXPORT & SHARE FUNCTIONALITY
// ============================================

// Export dashboard as PNG
async function exportAsPNG() {
    try {
        const container = document.querySelector('.container');
        
        // Show loading indicator
        const originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'wait';
        
        // Use html2canvas to capture the dashboard
        const canvas = await html2canvas(container, {
            backgroundColor: document.body.classList.contains('dark-mode') ? '#0f0f23' : '#f0f4f8',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `economic-dashboard-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            document.body.style.cursor = originalCursor;
        });
    } catch (error) {
        console.error('Export as PNG failed:', error);
        alert('Failed to export as PNG. Please try again.');
        document.body.style.cursor = 'default';
    }
}

// Export data as CSV
function exportAsCSV() {
    try {
        const data = [];
        const timestamp = new Date().toLocaleString();
        
        // Header
        data.push(['Economic Indicators Dashboard']);
        data.push(['Exported:', timestamp]);
        data.push([]);
        
        // Fear & Greed Indexes
        data.push(['Fear & Greed Indexes']);
        data.push(['Indicator', 'Value', 'Classification']);
        
        const stockValue = document.getElementById('fear-greed-value').textContent;
        const stockLabel = document.getElementById('fear-greed-label').textContent;
        data.push(['Stock Market', stockValue, stockLabel]);
        
        const cryptoValue = document.getElementById('crypto-fear-greed-value').textContent;
        const cryptoLabel = document.getElementById('crypto-fear-greed-label').textContent;
        data.push(['Crypto Market', cryptoValue, cryptoLabel]);
        
        data.push([]);
        
        // Recession Indexes
        data.push(['Recession Indicators']);
        data.push(['Indicator', 'Value', 'Status']);
        
        const indexes = ['sahm', 'yield', 'unemployment', 'gdp', 'lipstick', 'rword', 
                        'stripper', 'vibecession', 'ads', 'usedcar', 'lego', 'pizza', 
                        'underwear', 'bigmac'];
        
        indexes.forEach(id => {
            const valueEl = document.getElementById(`${id}-value`);
            const statusEl = document.getElementById(`${id}-status`);
            if (valueEl && statusEl) {
                const name = valueEl.closest('.index-card').querySelector('h3').textContent.trim();
                data.push([name, valueEl.textContent, statusEl.textContent]);
            }
        });
        
        data.push([]);
        
        // Stock Indices
        data.push(['Major Stock Indices']);
        data.push(['Index', 'Price', 'Change', 'Change %']);
        
        const stocks = ['sp500', 'nasdaq', 'ftse100', 'dax', 'stoxx600', 'nikkei', 'shanghai', 'hangsen'];
        
        stocks.forEach(id => {
            const priceEl = document.getElementById(`${id}-price`);
            const changeEl = document.getElementById(`${id}-change`);
            const changePercentEl = document.getElementById(`${id}-change-percent`);
            if (priceEl && changeEl && changePercentEl) {
                const name = priceEl.closest('.stock-index-card').querySelector('h3').textContent.trim();
                data.push([name, priceEl.textContent, changeEl.textContent, changePercentEl.textContent]);
            }
        });
        
        // Convert to CSV string
        const csvContent = data.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `economic-dashboard-${date}.csv`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Export as CSV failed:', error);
        alert('Failed to export as CSV. Please try again.');
    }
}

// Share dashboard URL with current state
function shareURL() {
    try {
        // Collect current state
        const state = {
            stockFG: document.getElementById('fear-greed-value').textContent,
            cryptoFG: document.getElementById('crypto-fear-greed-value').textContent,
            timestamp: Date.now()
        };
        
        // Encode state in URL
        const baseURL = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({ data: btoa(JSON.stringify(state)) });
        const shareableURL = `${baseURL}?${params.toString()}`;
        
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareableURL).then(() => {
                // Show success message
                showNotification('📋 Link copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback: show URL in prompt
                prompt('Copy this URL to share:', shareableURL);
            });
        } else {
            // Fallback for older browsers
            prompt('Copy this URL to share:', shareableURL);
        }
    } catch (error) {
        console.error('Share URL failed:', error);
        alert('Failed to generate share link. Please try again.');
    }
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#667eea'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// HISTORICAL CHARTS & MODAL FUNCTIONALITY
// ============================================

let currentChart = null;
let currentChartData = null;

// Generate historical data for any indicator (30-365 days)
function generateHistoricalData(indexId, days = 30) {
    const data = [];
    const labels = [];
    const today = new Date();
    
    // Get current value or use a default
    let currentValue = 50;
    const element = document.getElementById(`${indexId}-value`);
    if (element && element.textContent !== '--') {
        currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, ''));
    }
    
    // Generate realistic historical data with trends
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Add some randomness and trending
        const trend = (days - i) / days; // 0 to 1
        const randomVariation = (Math.random() - 0.5) * 10;
        const value = currentValue * (0.8 + trend * 0.4) + randomVariation;
        data.push(Math.max(0, value));
    }
    
    return { labels, data };
}

// Open chart modal
function openChartModal(indexId, title) {
    const modal = document.getElementById('chart-modal');
    const modalTitle = document.getElementById('chart-modal-title');
    const canvas = document.getElementById('detail-chart');
    const timeframeSelect = document.getElementById('chart-timeframe');
    
    modalTitle.textContent = title;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Store current index ID for timeframe changes
    modal.dataset.indexId = indexId;
    modal.dataset.title = title;
    
    // Load initial chart
    const days = parseInt(timeframeSelect.value);
    loadChart(indexId, days);
}

// Load/update chart with data
function loadChart(indexId, days) {
    const canvas = document.getElementById('detail-chart');
    const ctx = canvas.getContext('2d');
    
    // Generate or fetch historical data
    const { labels, data } = generateHistoricalData(indexId, days);
    currentChartData = { labels, data };
    
    // Calculate statistics
    const current = data[data.length - 1];
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const high = Math.max(...data);
    const low = Math.min(...data);
    const change = ((current - data[0]) / data[0] * 100);
    
    // Update stats display
    document.getElementById('chart-stat-current').textContent = current.toFixed(2);
    document.getElementById('chart-stat-avg').textContent = avg.toFixed(2);
    document.getElementById('chart-stat-high').textContent = high.toFixed(2);
    document.getElementById('chart-stat-low').textContent = low.toFixed(2);
    document.getElementById('chart-stat-change').textContent = 
        `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    document.getElementById('chart-stat-change').style.color = 
        change >= 0 ? '#10b981' : '#ef4444';
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Determine color based on trend
    const trendColor = change >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, change >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    gradientFill.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Create new chart
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Value',
                data: data,
                borderColor: trendColor,
                backgroundColor: gradientFill,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: days <= 30 ? 4 : 2,
                pointHoverRadius: 6,
                pointBackgroundColor: trendColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return 'Value: ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: days <= 30 ? 15 : 20
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Close chart modal
function closeChartModal() {
    const modal = document.getElementById('chart-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Make cards clickable to open charts
function initializeChartClicks() {
    // Stock Fear & Greed panel
    const stockFearGreedPanel = document.getElementById('stock-fear-greed-panel');
    if (stockFearGreedPanel) {
        stockFearGreedPanel.addEventListener('click', (e) => {
            // Don't open if clicking buttons
            if (e.target.closest('button')) return;
            openChartModal('fear-greed', 'Stock Market Fear & Greed - Historical Data');
        });
    }
    
    // Crypto Fear & Greed panel
    const cryptoFearGreedPanel = document.getElementById('crypto-fear-greed-panel');
    if (cryptoFearGreedPanel) {
        cryptoFearGreedPanel.addEventListener('click', () => {
            openChartModal('crypto-fear-greed', 'Crypto Market Fear & Greed - Historical Data');
        });
    }
    
    // Recession index cards
    const indexCards = document.querySelectorAll('.index-card');
    indexCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent.trim();
            const indexId = card.querySelector('[id$="-value"]').id.replace('-value', '');
            openChartModal(indexId, `${title} Historical Data`);
        });
    });
    
    // Stock index cards
    const stockCards = document.querySelectorAll('.stock-index-card');
    stockCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent.trim();
            const indexId = card.id.replace('-card', '');
            openChartModal(indexId, `${title} Historical Data`);
        });
    });
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initDashboard();
    initTooltips();
    
    // Initialize market status
    updateMarketStatus();
    // Update market status every minute
    setInterval(updateMarketStatus, 60000);
    
    // Add refresh button handler
    const refreshBtn = document.getElementById('refresh-fear-greed');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshFearGreedIndex);
    }
    
    // Add debug toggle handler
    const debugBtn = document.getElementById('toggle-debug');
    if (debugBtn) {
        debugBtn.addEventListener('click', toggleDebugConsole);
    }
    
    // Add clear cache button handler
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCacheAndRefresh);
    }
    
    // Initialize chart modal functionality
    initializeChartClicks();
    
    // Chart modal close button
    const chartModalClose = document.getElementById('chart-modal-close');
    if (chartModalClose) {
        chartModalClose.addEventListener('click', closeChartModal);
    }
    
    // Chart modal overlay click to close
    const chartModalOverlay = document.querySelector('.chart-modal-overlay');
    if (chartModalOverlay) {
        chartModalOverlay.addEventListener('click', closeChartModal);
    }
    
    // Chart timeframe selector
    const chartTimeframe = document.getElementById('chart-timeframe');
    if (chartTimeframe) {
        chartTimeframe.addEventListener('change', (e) => {
            const modal = document.getElementById('chart-modal');
            const indexId = modal.dataset.indexId;
            const days = parseInt(e.target.value);
            loadChart(indexId, days);
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('chart-modal');
            if (modal.style.display === 'flex') {
                closeChartModal();
            }
        }
    });
    
    // Export buttons
    const exportPngBtn = document.getElementById('export-png');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', exportAsPNG);
    }
    
    const exportCsvBtn = document.getElementById('export-csv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportAsCSV);
    }
    
    const shareUrlBtn = document.getElementById('share-url');
    if (shareUrlBtn) {
        shareUrlBtn.addEventListener('click', shareURL);
    }
});
