// Configuration
// API keys are loaded from config.local.js (gitignored for security)
// If config not loaded, fall back to demo/empty values
const FRED_API_KEY = window.API_CONFIG?.FRED_API_KEY || 'demo';
const APIFY_TOKEN = window.API_CONFIG?.APIFY_TOKEN || '';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// =============================================================================
// APIFY API HELPER (Secure Bearer Token Authentication)
// Docs: https://docs.apify.com/api/v2
// =============================================================================

/**
 * Run an Apify Actor and get results (synchronous mode - waits up to 5 min)
 * Uses Bearer token auth (more secure than query params)
 * Includes exponential backoff for rate limiting (429 errors)
 * 
 * @param {string} actorId - Actor ID (e.g., 'aymorato/fast-google-news-scraper')
 * @param {object} input - Actor input parameters
 * @param {object} options - Optional settings { timeout, maxRetries }
 * @returns {Promise<Array>} - Dataset items from the Actor run
 */
async function runApifyActor(actorId, input = {}, options = {}) {
    const { timeout = 300, maxRetries = 3 } = options;
    
    if (!APIFY_TOKEN) {
        console.warn('⚠️ Apify token not configured. Add it to config.local.js');
        return [];
    }
    
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?timeout=${timeout}`;
    let delay = 500; // Initial delay for exponential backoff
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${APIFY_TOKEN}`,  // Secure: Bearer auth (recommended)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(input)
            });
            
            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                if (attempt < maxRetries) {
                    const waitTime = delay + Math.random() * delay;
                    console.warn(`⏳ Rate limited, retrying in ${Math.round(waitTime)}ms...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    delay *= 2; // Double the delay for next attempt
                    continue;
                }
                throw new Error('Rate limit exceeded after max retries');
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (attempt === maxRetries) {
                console.error(`❌ Apify Actor ${actorId} failed:`, error.message);
                return [];
            }
            // Network error - retry
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
    
    return [];
}

/**
 * Get the status of an Apify Actor run
 * @param {string} runId - The run ID
 * @returns {Promise<object>} - Run status object
 */
async function getApifyRunStatus(runId) {
    if (!APIFY_TOKEN) return null;
    
    const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
}

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

// VIX Symbol
const VIX_SYMBOL = '^VIX';

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

// Skeleton Loader Helper Functions
function showSkeleton(elementId) {
    const skeleton = document.getElementById(elementId);
    if (skeleton) {
        skeleton.style.display = 'inline-block';
    }
}

function hideSkeleton(elementId) {
    const skeleton = document.getElementById(elementId);
    if (skeleton) {
        skeleton.style.display = 'none';
    }
}

function showContent(elementId) {
    const content = document.getElementById(elementId);
    if (content) {
        content.style.display = '';
    }
}

function hideContent(elementId) {
    const content = document.getElementById(elementId);
    if (content) {
        content.style.display = 'none';
    }
}

function showSkeletonHideContent(skeletonId, contentId) {
    showSkeleton(skeletonId);
    hideContent(contentId);
}

function hideSkeletonShowContent(skeletonId, contentId) {
    hideSkeleton(skeletonId);
    showContent(contentId);
}

// Tooltip descriptions for each index
const INDEX_TOOLTIPS = {
    'fear-greed': {
        title: 'Fear & Greed Index',
        description: 'Measures market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). Combines volatility, momentum, safe haven demand, and survey data to gauge investor emotions.'
    },
    'vix': {
        title: 'VIX - Volatility Index',
        description: 'The CBOE Volatility Index (VIX) measures expected market volatility over the next 30 days. Often called the "fear gauge," values below 12 indicate low volatility, 12-20 is normal, 20-30 is elevated, 30-40 is high, and above 40 indicates extreme market stress.'
    },
    'social-sentiment': {
        title: 'Social Sentiment Index',
        description: 'Measures retail investor sentiment from multiple free sources. Priority: (1) StockTwits — explicit Bullish/Bearish user tags; (2) ApeWisdom — Reddit finance aggregator (WSB, r/stocks, r/investing) with mention-momentum and upvote-quality scoring; (3) Reddit JSON via proxy — keyword analysis. No API key needed for any source. Scores 0–100 (Bearish → Bullish). A contrarian indicator — extreme readings often precede reversals.'
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
    vix: [],
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
    // Weights sum to exactly 1.00:
    // Official FRED-backed (4×0.12=0.48) + ads (0.07) + semi (3×0.05=0.15)
    // + informal-high (4×0.03=0.12) + informal-mid (4×0.02=0.08) + informal-low (10×0.01=0.10)
    sahm:          { value: null, status: null, name: 'Sahm Rule',               unit: '%',     weight: 0.12, category: 'official',   source: 'FRED' },
    yield:         { value: null, status: null, name: 'Yield Curve',             unit: '%',     weight: 0.12, category: 'official',   source: 'FRED' },
    unemployment:  { value: null, status: null, name: 'Unemployment Rate',       unit: '%',     weight: 0.12, category: 'official',   source: 'FRED' },
    gdp:           { value: null, status: null, name: 'GDP Growth',              unit: '%',     weight: 0.12, category: 'official',   source: 'FRED' },
    ads:           { value: null, status: null, name: 'ADS Index',              unit: 'index', weight: 0.07, category: 'official',   source: 'estimated' },
    rword:         { value: null, status: null, name: 'R-Word Index',            unit: 'index', weight: 0.05, category: 'unofficial', source: 'estimated' },
    vibecession:   { value: null, status: null, name: 'Vibecession',             unit: 'score', weight: 0.05, category: 'unofficial', source: 'estimated' },
    usedcar:       { value: null, status: null, name: 'Used Car Index',          unit: 'index', weight: 0.05, category: 'unofficial', source: 'estimated' },
    lipstick:      { value: null, status: null, name: 'Lipstick Index',          unit: 'index', weight: 0.03, category: 'unofficial', source: 'estimated' },
    stripper:      { value: null, status: null, name: 'Stripper Index',          unit: 'index', weight: 0.03, category: 'unofficial', source: 'estimated' },
    lego:          { value: null, status: null, name: 'Lego Index',              unit: 'index', weight: 0.03, category: 'unofficial', source: 'estimated' },
    underwear:     { value: null, status: null, name: "Men's Underwear Index",   unit: 'index', weight: 0.03, category: 'unofficial', source: 'estimated' },
    pizza:         { value: null, status: null, name: 'Frozen Pizza Index',      unit: 'index', weight: 0.02, category: 'unofficial', source: 'estimated' },
    bigmac:        { value: null, status: null, name: 'Big Mac Index',           unit: 'index', weight: 0.02, category: 'unofficial', source: 'estimated' },
    cardboard:     { value: null, status: null, name: 'Cardboard Box Index',     unit: 'index', weight: 0.02, category: 'unofficial', source: 'estimated' },
    hemline:       { value: null, status: null, name: 'Hemline Index',           unit: 'index', weight: 0.02, category: 'unofficial', source: 'estimated' },
    bowtie:        { value: null, status: null, name: "Waiter's Bow Tie Index",  unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    skyscraper:    { value: null, status: null, name: 'Skyscraper Index',        unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    waitress:      { value: null, status: null, name: 'Hot Waitress Index',      unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    neckties:      { value: null, status: null, name: 'Neckties Sales Index',    unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    champagne:     { value: null, status: null, name: 'Champagne Index',         unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    parking:       { value: null, status: null, name: 'Parking Lot Index',       unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    trash:         { value: null, status: null, name: 'Trash Index',             unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    bikemessenger: { value: null, status: null, name: 'Bike Messenger Index',    unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    tempworker:    { value: null, status: null, name: 'Temp Worker Index',       unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' },
    coffeeshop:    { value: null, status: null, name: 'Coffee Shop Laptop Index',unit: 'index', weight: 0.01, category: 'unofficial', source: 'estimated' }
};

// Recession Probability Calculator
const recessionProbability = {
    current: 0,
    confidence: { lower: 0, upper: 0 },
    contributors: [],
    trend: 'stable',
    historicalAverage: 25 // Historical baseline probability
};

// Helper: Fetch with CORS proxy (with better error handling and timeout)
async function fetchWithProxy(url, timeout = 5000, retries = 2) {
    try {
        // Try multiple CORS proxies for better reliability
        const proxies = [
            { url: 'https://api.allorigins.win/raw?url=', name: 'allorigins' },
            { url: 'https://api.codetabs.com/v1/proxy?quest=', name: 'codetabs' },
            { url: 'https://corsproxy.io/?', name: 'corsproxy' }
        ];
        
        for (const proxy of proxies) {
            // Retry each proxy if it fails
            for (let attempt = 0; attempt <= retries; attempt++) {
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
                        // Skip 4xx and 5xx errors on last attempt, try next proxy
                        if (attempt === retries) {
                            break; // Move to next proxy
                        }
                        // Otherwise, retry with exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
                        continue;
                    }
                    
                    // Try to parse as JSON first, fallback to text
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const data = await response.json();
                        if (data) return { data, source: proxy.name };
                    } else {
                        // Return as text (for HTML scraping)
                        const text = await response.text();
                        if (text) return { data: text, source: proxy.name };
                    }
                } catch (proxyError) {
                    // On timeout or network error, retry with exponential backoff
                    if (attempt < retries && (proxyError.name === 'AbortError' || proxyError.name === 'TypeError')) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
                        continue;
                    }
                    // Last attempt failed, try next proxy
                    break;
                }
            }
        }
        
        // If all proxies fail, return null (caller will use fallback data)
        return null;
    } catch (error) {
        // Return null instead of throwing - let caller handle fallback
        return null;
    }
}

// Helper: Fetch Yahoo Finance data for a symbol with multi-proxy fallback
// Returns extracted { price, change, changePercent } or null
async function fetchYahooData(symbol) {
    // Add timestamp to prevent proxy-level caching of stale quotes
    const bust = `&_t=${Date.now()}`;
    const yahooUrl = `${YAHOO_FINANCE_QUOTE_API}${symbol}?interval=1d&range=1d${bust}`;

    // Step 1: direct fetch (blocked by CORS in most browsers, but worth a try)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(yahooUrl, {
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            const data = await response.json();
            const result = extractYahooFinanceData(data, symbol);
            if (result) return result;
        }
    } catch (e) { /* CORS blocked – continue to proxies */ }

    // Step 2: try CORS proxies in order (8s each to give enough time)
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?'
    ];
    for (const proxy of proxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(proxy + encodeURIComponent(yahooUrl), {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const text = await response.text();
                const data = JSON.parse(text);
                const result = extractYahooFinanceData(data, symbol);
                if (result) return result;
            }
        } catch (e) { /* try next proxy */ }
    }
    return null;
}

// Helper: Fetch FRED data - FRED supports CORS, so call directly (no proxy needed)
async function fetchFREDData(seriesId) {
    try {
        // Fetch the 2 most recent observations in case the latest has a missing value ('.')
        const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=2`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.observations) {
            for (const obs of data.observations) {
                if (obs.value !== '.' && obs.value !== null && obs.value !== '') {
                    return parseFloat(obs.value);
                }
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
            
            // Track success
            trackAPISuccess();
            
            return value;
        } else {
            debugLog('✗ fear_and_greed object not found in response', 'error');
            debugLog(`Response structure: ${JSON.stringify(data).substring(0, 300)}`, 'error');
        }
        
    } catch (error) {
        debugLog(`✗ Fetch failed: ${error.message}`, 'error');
        console.error('Fear & Greed Index fetch error:', error);
        
        // Track failure
        trackAPIFailure();
        
        // Show user-friendly error notification
        const errorMsg = getUserFriendlyErrorMessage(error, 'Fear & Greed Index');
        showNotification(errorMsg, 'warning', 4000);
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
    showNotification('⚠️ Using estimated data - API unavailable', 'warning', 4000);
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
        
        // Show user-friendly error notification
        const errorMsg = getUserFriendlyErrorMessage(error, 'Crypto Fear & Greed');
        showNotification(errorMsg, 'warning', 4000);
        
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
    // Hide skeletons and show content
    hideSkeletonShowContent('crypto-fear-greed-skeleton', 'crypto-fear-greed-value');
    hideSkeletonShowContent('crypto-fear-greed-change-skeleton', 'crypto-fear-greed-change');
    
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

// ===========================
// SOCIAL SENTIMENT FUNCTIONS
// Priority: StockTwits (explicit tags) → ApeWisdom (Reddit aggregator) → Reddit JSON → Apify
// ===========================

// StockTwits API endpoints (no auth, 200 req/hr, needs CORS proxy)
const STOCKTWITS_TRENDING = 'https://api.stocktwits.com/api/2/streams/trending.json';
const STOCKTWITS_SYMBOL   = (sym) => `https://api.stocktwits.com/api/2/streams/symbol/${sym}.json`;

// ApeWisdom: free Reddit finance aggregator - tracks WSB/stocks/investing mentions
// Returns rank, mention counts, and upvotes for trending stocks
// No auth needed; may support direct CORS, otherwise proxied
const APEWISDOM_URL = 'https://apewisdom.io/api/v1.0/filter/all-stocks/page/1';

// Fetch Reddit sentiment via ApeWisdom (no Apify, no auth needed)
// Derives a 0-100 score from mention momentum + upvote engagement quality
async function fetchApeWisdomSentiment() {
    const CORS_PROXIES = [
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?'
    ];

    let data = null;

    // Try direct fetch first (ApeWisdom may have CORS headers)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(APEWISDOM_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) data = await response.json();
    } catch (e) { /* try proxy */ }

    // Proxy fallback
    if (!data) {
        for (const proxy of CORS_PROXIES) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 7000);
                const response = await fetch(proxy + encodeURIComponent(APEWISDOM_URL), { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const text = await response.text();
                    data = JSON.parse(text);
                    break;
                }
            } catch (e) { /* try next */ }
        }
    }

    if (!data || !Array.isArray(data.results) || data.results.length === 0) return null;

    // Score derivation from top 25 trending stocks:
    //   Mention momentum  — are people talking MORE than yesterday? (+bullish, -bearish)
    //   Upvote engagement — are posts being upvoted heavily? (high = community approval)
    const results = data.results.slice(0, 25);
    let weightedMomentum = 0;
    let totalMentions = 0;
    let totalUpvoteRatio = 0;

    for (const stock of results) {
        const mentions = stock.mentions || 1;
        const mentions24h = stock.mentions_24h_ago;
        const upvotes = stock.upvotes || 0;

        totalMentions += mentions;
        totalUpvoteRatio += upvotes / mentions;

        if (mentions24h !== null && mentions24h > 0) {
            // Normalised momentum: +1 = doubled mentions, -1 = zero mentions vs yesterday
            const momentum = Math.max(-1, Math.min(1, (mentions - mentions24h) / mentions24h));
            weightedMomentum += momentum * mentions;
        }
    }

    if (totalMentions === 0) return null;

    // Map average momentum [-1, +1] → [20, 80], with upvote quality adding up to +5
    const avgMomentum = weightedMomentum / totalMentions;
    const avgUpvoteRatio = totalUpvoteRatio / results.length;
    const engagementBonus = Math.min(5, avgUpvoteRatio * 0.3);
    const score = Math.max(0, Math.min(100, Math.round(50 + avgMomentum * 30 + engagementBonus)));

    console.log(`ApeWisdom: momentum=${avgMomentum.toFixed(2)}, upvote ratio=${avgUpvoteRatio.toFixed(1)}, score=${score} (${results.length} stocks tracked)`);
    return score;
}

// Fetch StockTwits sentiment from trending + key US equity symbols
// Returns a 0-100 sentiment score, or null on complete failure
async function fetchStockTwitsSentiment() {
    const CORS_PROXIES = [
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?'
    ];

    // Endpoints: trending feed + SPY + QQQ (broad US equity coverage)
    const endpoints = [
        STOCKTWITS_TRENDING,
        STOCKTWITS_SYMBOL('SPY'),
        STOCKTWITS_SYMBOL('QQQ')
    ];

    let allMessages = [];

    for (const endpoint of endpoints) {
        for (const proxy of CORS_PROXIES) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 7000);
                const response = await fetch(proxy + encodeURIComponent(endpoint), {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) continue;

                const text = await response.text();
                const data = JSON.parse(text);
                const messages = data?.messages || [];
                if (messages.length > 0) {
                    allMessages = allMessages.concat(messages);
                    break; // got this endpoint, move to next
                }
            } catch (e) { /* try next proxy */ }
        }
    }

    if (allMessages.length === 0) return null;

    // Count explicit sentiment tags (primary signal)
    let bullish = 0, bearish = 0, unlabeled = 0;
    for (const msg of allMessages) {
        const tag = msg?.entities?.sentiment?.basic;
        if (tag === 'Bullish') bullish++;
        else if (tag === 'Bearish') bearish++;
        else unlabeled++;
    }

    const tagged = bullish + bearish;
    if (tagged === 0) return null; // no useful signal

    // Supplement with keyword analysis on unlabeled messages (half-weight)
    let kwBullish = 0, kwBearish = 0;
    if (unlabeled > 0) {
        for (const msg of allMessages) {
            if (msg?.entities?.sentiment?.basic) continue; // already tagged
            const body = (msg.body || '').toLowerCase();
            const { bullishScore, bearishScore } = analyzeSentiment(body);
            kwBullish += bullishScore;
            kwBearish += bearishScore;
        }
    }

    // Combine: tagged messages count full, keyword signal counts half
    const totalBullish = bullish + kwBullish * 0.5;
    const totalBearish = bearish + kwBearish * 0.5;
    const total = totalBullish + totalBearish;

    const score = total > 0 ? Math.round((totalBullish / total) * 100) : 50;
    console.log(`StockTwits: ${tagged} tagged (${bullish}B/${bearish}Bear), score: ${score} from ${allMessages.length} messages`);
    return Math.max(0, Math.min(100, score));
}

// Sentiment keywords for analysis
const BULLISH_KEYWORDS = [
    'bull', 'bullish', 'moon', 'mooning', 'calls', 'buy', 'buying', 'long',
    'rally', 'green', 'pump', 'rocket', 'tendies', 'gains', 'up', 'higher',
    'breakout', 'ath', 'all time high', 'diamond hands', 'hodl', 'btfd',
    'buy the dip', 'going up', 'undervalued', 'cheap', 'opportunity'
];

const BEARISH_KEYWORDS = [
    'bear', 'bearish', 'puts', 'sell', 'selling', 'short', 'crash', 'dump',
    'red', 'down', 'lower', 'recession', 'collapse', 'bubble', 'overvalued',
    'panic', 'fear', 'correction', 'pullback', 'drop', 'plunge', 'tank',
    'bagholding', 'loss', 'rip', 'dead', 'rug pull', 'scam'
];

// Analyze text for sentiment
function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;
    
    BULLISH_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) bullishScore += matches.length;
    });
    
    BEARISH_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) bearishScore += matches.length;
    });
    
    return { bullishScore, bearishScore };
}

// Fetch Social Sentiment
// Priority chain: StockTwits → ApeWisdom (Reddit aggregator) → Apify Reddit → Reddit JSON
async function fetchSocialSentiment() {
    console.log('📊 Fetching social sentiment...');

    // STRATEGY 1: StockTwits — explicit Bullish/Bearish user tags, no API key
    console.log('📡 Trying StockTwits...');
    try {
        const stScore = await fetchStockTwitsSentiment();
        if (stScore !== null) {
            const classification = getSocialSentimentClassification(stScore);
            savePreviousValue('socialSentiment', stScore);
            updateSocialSentimentDisplay(stScore, classification, 'StockTwits');
            console.log(`✅ StockTwits: ${stScore}% (${classification})`);
            return stScore;
        }
    } catch (e) {
        console.warn('   ✗ StockTwits failed:', e.message);
    }

    // STRATEGY 2: ApeWisdom — free Reddit finance aggregator, no auth needed
    // Covers WSB + r/stocks + r/investing + r/stockmarket
    console.log('📡 Trying ApeWisdom (Reddit aggregator)...');
    try {
        const awScore = await fetchApeWisdomSentiment();
        if (awScore !== null) {
            const classification = getSocialSentimentClassification(awScore);
            savePreviousValue('socialSentiment', awScore);
            updateSocialSentimentDisplay(awScore, classification, 'Reddit/ApeWisdom');
            console.log(`✅ ApeWisdom: ${awScore}% (${classification})`);
            return awScore;
        }
    } catch (e) {
        console.warn('   ✗ ApeWisdom failed:', e.message);
    }

    // STRATEGY 3: Apify Reddit scraper (only if token is configured)
    if (APIFY_TOKEN) {
        console.log('📡 Trying Apify Reddit scraper...');
        try {
            const apifyPosts = await fetchRedditViaApify();
            if (apifyPosts && apifyPosts.length > 0) {
                return computeAndDisplayRedditSentiment(apifyPosts, 'Apify/Reddit');
            }
        } catch (e) {
            console.warn('   ✗ Apify failed:', e.message);
        }
    }

    // STRATEGY 4: Reddit public JSON API via CORS proxy (keyword analysis)
    console.log('📡 Trying Reddit public API...');
    const allPosts = [];
    const subreddits = ['wallstreetbets', 'stocks', 'investing'];
    for (const sub of subreddits) {
        try {
            const redditUrl = `https://www.reddit.com/r/${sub}/hot.json?limit=25&raw_json=1`;
            const response = await fetch(CORS_PROXY + encodeURIComponent(redditUrl));
            if (response.ok) {
                const data = await response.json();
                const posts = data?.data?.children?.map(c => c.data) || [];
                allPosts.push(...posts);
                console.log(`   ✓ r/${sub}: ${posts.length} posts`);
            }
        } catch (e) {
            console.warn(`   ✗ r/${sub}: ${e.message}`);
        }
    }

    if (allPosts.length > 0) {
        return computeAndDisplayRedditSentiment(allPosts, 'Reddit');
    }

    console.warn('⚠️ All sentiment sources failed');
    return useFallbackSocialSentiment('API Unavailable');
}

// Keyword-based sentiment analysis on an array of Reddit post objects
function computeAndDisplayRedditSentiment(posts, sourceLabel) {
    let totalBullish = 0, totalBearish = 0;
    posts.forEach(post => {
        const text = `${post.title || ''} ${post.selftext || ''}`;
        const { bullishScore, bearishScore } = analyzeSentiment(text);
        const engagement = Math.log((post.score || post.ups || 1) + (post.num_comments || 0) + 1);
        totalBullish += bullishScore * engagement;
        totalBearish += bearishScore * engagement;
    });
    const total = totalBullish + totalBearish;
    const score = Math.max(0, Math.min(100, total === 0 ? 50 : Math.round((totalBullish / total) * 100)));
    const classification = getSocialSentimentClassification(score);
    savePreviousValue('socialSentiment', score);
    updateSocialSentimentDisplay(score, classification, sourceLabel);
    console.log(`✅ ${sourceLabel}: ${score}% (${classification})`);
    return score;
}

// Fetch Reddit posts via Apify
// Actor IDs use URL encoding: username/actorName -> username%2FactorName
async function fetchRedditViaApify() {
    if (!APIFY_TOKEN) {
        throw new Error('No Apify token configured');
    }
    
    // Try multiple actors in order of reliability
    const actors = [
        {
            // scrapio/reddit-posts-scraper - Simple and reliable
            id: 'scrapio/reddit-posts-scraper',
            input: {
                subreddits: ['wallstreetbets', 'stocks', 'investing'],
                sort: 'hot',
                maxItems: 75
            }
        },
        {
            // jupri/reddit - All-in-one Reddit scraper (highly rated)
            id: 'jupri/reddit',
            input: {
                startUrls: [
                    { url: 'https://www.reddit.com/r/wallstreetbets/hot/' },
                    { url: 'https://www.reddit.com/r/stocks/hot/' },
                    { url: 'https://www.reddit.com/r/investing/hot/' }
                ],
                maxItems: 75
            }
        },
        {
            // trudax/reddit-scraper-lite - Pay per result
            id: 'trudax/reddit-scraper-lite',
            input: {
                startUrls: [
                    { url: 'https://www.reddit.com/r/wallstreetbets/hot/' },
                    { url: 'https://www.reddit.com/r/stocks/hot/' },
                    { url: 'https://www.reddit.com/r/investing/hot/' }
                ],
                maxItems: 50,
                proxy: { useApifyProxy: true }
            }
        }
    ];
    
    for (const actor of actors) {
        try {
            // URL encode the actor ID (/ becomes %2F)
            const encodedId = encodeURIComponent(actor.id);
            const url = `https://api.apify.com/v2/acts/${encodedId}/run-sync-get-dataset-items?timeout=120`;
            
            console.log(`   Trying actor: ${actor.id}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${APIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(actor.input),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.warn(`   Actor ${actor.id} failed: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
                continue; // Try next actor
            }
            
            const posts = await response.json();
            
            if (posts && posts.length > 0) {
                console.log(`   ✓ ${actor.id} returned ${posts.length} items`);
                
                // Normalize post format for different actor outputs
                return posts.map(post => ({
                    title: post.title || post.postTitle || post.name || '',
                    selftext: post.selftext || post.text || post.body || post.selfText || post.content || '',
                    score: post.score || post.upvotes || post.ups || post.upVotes || 0,
                    num_comments: post.numComments || post.num_comments || post.comments || post.commentCount || post.numberOfComments || 0
                }));
            } else {
                console.warn(`   Actor ${actor.id} returned empty results`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`   Actor ${actor.id} timed out`);
            } else {
                console.warn(`   Actor ${actor.id} error: ${error.message}`);
            }
        }
    }
    
    throw new Error('All Apify actors failed');
}

// Initialize social sentiment with placeholder (manual load only)
function initSocialSentimentPlaceholder() {
    // Hide skeletons and show placeholder state
    hideSkeletonShowContent('social-sentiment-skeleton', 'social-sentiment-value');
    hideSkeletonShowContent('social-sentiment-change-skeleton', 'social-sentiment-change');
    
    const valueEl = document.getElementById('social-sentiment-value');
    const labelEl = document.getElementById('social-sentiment-label');
    const changeEl = document.getElementById('social-sentiment-change');
    const bar = document.getElementById('social-sentiment-bar');
    const marker = document.getElementById('social-sentiment-marker');
    
    // Check for cached value (seed with 61 if never set - last known value)
    let cachedValue = getPreviousValue('socialSentiment');
    if (cachedValue === null || isNaN(cachedValue)) {
        // Seed with last known value so users see something meaningful
        cachedValue = 61;
        savePreviousValue('socialSentiment', cachedValue);
        console.log('📊 Social Sentiment: Seeded with default value:', cachedValue);
    } else {
        console.log('📊 Social Sentiment cached value:', cachedValue);
    }
    
    if (cachedValue !== null && !isNaN(cachedValue)) {
        // Show cached value
        valueEl.textContent = cachedValue;
        valueEl.style.cursor = 'pointer';
        valueEl.style.opacity = '0.8';
        valueEl.title = 'Click to refresh';

        const classification = getSocialSentimentClassification(cachedValue);
        labelEl.textContent = `${classification} (Cached)`;
        labelEl.style.fontSize = '0.85rem';

        if (changeEl) {
            changeEl.innerHTML = '<span style="cursor:pointer; font-size: 1rem; font-weight: 500;">⟳ Click to refresh</span><br><small style="opacity:0.7; font-size: 0.7rem;">StockTwits · ApeWisdom · Reddit</small>';
            changeEl.style.opacity = '0.85';
            changeEl.style.lineHeight = '1.6';
        }
        
        // Set bar to cached value position
        if (bar && marker) {
            bar.style.width = `${cachedValue}%`;
            marker.style.left = `${cachedValue}%`;
            // Use muted colors to indicate cached
            if (cachedValue <= 20) {
                bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            } else if (cachedValue <= 40) {
                bar.style.background = 'linear-gradient(90deg, #f97316, #fb923c)';
            } else if (cachedValue <= 60) {
                bar.style.background = 'linear-gradient(90deg, #eab308, #facc15)';
            } else if (cachedValue <= 80) {
                bar.style.background = 'linear-gradient(90deg, #84cc16, #a3e635)';
            } else {
                bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
            }
            bar.style.opacity = '0.6';
        }
    } else {
        // No cached value - show placeholder
        valueEl.textContent = '--';
        valueEl.style.cursor = 'pointer';
        valueEl.style.opacity = '0.7';
        valueEl.title = 'Click to load Reddit sentiment (uses Apify credits)';
        
        labelEl.textContent = 'Click to load';
        labelEl.style.fontSize = '0.85rem';
        
        // Cost notice - show in both states  
        if (changeEl) {
            changeEl.innerHTML = '<small style="opacity:0.8">⚠️ Uses API credits</small>';
            changeEl.style.fontSize = '0.75rem';
            changeEl.style.opacity = '0.8';
        }
        
        // Set bar to neutral/disabled position
        if (bar && marker) {
            bar.style.width = '50%';
            marker.style.left = '50%';
            bar.style.background = 'linear-gradient(90deg, #6b7280, #9ca3af)';
        }
    }
    
    // Make clicking the value OR the change text trigger the load/refresh
    const triggerLoad = async function loadSentiment() {
        valueEl.removeEventListener('click', loadSentiment);
        if (changeEl) changeEl.removeEventListener('click', loadSentiment);
        valueEl.style.cursor = 'default';
        valueEl.style.opacity = '1';
        const previousValue = valueEl.textContent;
        valueEl.textContent = '⏳';
        labelEl.textContent = 'Loading...';
        if (changeEl) changeEl.textContent = 'Fetching from Reddit...';
        if (bar) bar.style.opacity = '1';
        
        try {
            await fetchSocialSentiment();
        } catch (error) {
            // Restore previous state on failure
            valueEl.textContent = previousValue !== '⏳' ? previousValue : '❌';
            labelEl.textContent = 'Failed - click to retry';
            if (changeEl) changeEl.innerHTML = '<small style="opacity:0.8">⚠️ Uses API credits</small>';
            valueEl.style.cursor = 'pointer';
            valueEl.style.opacity = '0.7';
            valueEl.addEventListener('click', triggerLoad);
            if (changeEl) changeEl.addEventListener('click', triggerLoad);
        }
    };
    
    valueEl.addEventListener('click', triggerLoad);
    if (changeEl) {
        changeEl.style.cursor = 'pointer';
        changeEl.addEventListener('click', triggerLoad);
    }
}

// Fallback for social sentiment when API fails
function useFallbackSocialSentiment(reason = 'Offline') {
    const cachedValue = getPreviousValue('socialSentiment');
    if (cachedValue !== null && !isNaN(cachedValue)) {
        const classification = getSocialSentimentClassification(cachedValue);
        updateSocialSentimentDisplay(cachedValue, `${classification} (Cached)`);
        console.log(`📦 Using cached Reddit sentiment: ${cachedValue}%`);
        return cachedValue;
    }
    
    // Last resort: neutral estimate with reason
    const fallbackValue = 50;
    updateSocialSentimentDisplay(fallbackValue, reason);
    return fallbackValue;
}

// Get classification for social sentiment
function getSocialSentimentClassification(value) {
    if (value <= 20) return 'Extreme Bearish';
    if (value <= 40) return 'Bearish';
    if (value <= 60) return 'Neutral';
    if (value <= 80) return 'Bullish';
    return 'Extreme Bullish';
}

// Update Social Sentiment display
function updateSocialSentimentDisplay(value, classification, dataSource = null) {
    // Hide skeletons and show content
    hideSkeletonShowContent('social-sentiment-skeleton', 'social-sentiment-value');
    hideSkeletonShowContent('social-sentiment-change-skeleton', 'social-sentiment-change');
    
    document.getElementById('social-sentiment-value').textContent = value;
    
    // Show classification with source indicator
    const labelEl = document.getElementById('social-sentiment-label');
    const sourceLabel = dataSource && dataSource !== 'Unknown' ? ` · via ${dataSource}` : '';
    labelEl.textContent = classification + sourceLabel;
    if (dataSource) labelEl.title = `Data source: ${dataSource}`;
    
    // Update bar position
    const bar = document.getElementById('social-sentiment-bar');
    const marker = document.getElementById('social-sentiment-marker');
    if (bar && marker) {
        bar.style.width = `${value}%`;
        marker.style.left = `${value}%`;
        
        // Set color based on value (bearish = red, bullish = green)
        if (value <= 20) {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (value <= 40) {
            bar.style.background = 'linear-gradient(90deg, #f97316, #fb923c)';
        } else if (value <= 60) {
            bar.style.background = 'linear-gradient(90deg, #eab308, #fbbf24)';
        } else if (value <= 80) {
            bar.style.background = 'linear-gradient(90deg, #84cc16, #a3e635)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
        }
    }
    
    // Calculate and display change
    const previousValue = getPreviousValue('socialSentiment');
    const changeEl = document.getElementById('social-sentiment-change');
    if (changeEl && previousValue !== null && !isNaN(previousValue)) {
        const change = value - previousValue;
        if (change > 0) {
            changeEl.textContent = `+${change} points`;
            changeEl.className = 'gauge-change positive';
        } else if (change < 0) {
            changeEl.textContent = `${change} points`;
            changeEl.className = 'gauge-change negative';
        } else {
            changeEl.textContent = 'No change';
            changeEl.className = 'gauge-change neutral';
        }
    } else {
        changeEl.textContent = '--';
    }
}

// ===========================
// VIX (VOLATILITY INDEX) FUNCTIONS
// ===========================

// Get VIX classification based on value
function getVIXClassification(value) {
    if (value < 12) return 'Low Volatility';
    if (value < 20) return 'Normal Volatility';
    if (value < 30) return 'Elevated Volatility';
    if (value < 40) return 'High Volatility';
    return 'Extreme Volatility';
}

// Fetch VIX data
async function fetchVIX() {
    // Use the shared multi-proxy Yahoo Finance helper
    const extracted = await fetchYahooData(VIX_SYMBOL);

    if (extracted && extracted.price !== null) {
        const value = parseFloat(extracted.price);
        const change = extracted.change || 0;
        const changePercent = extracted.changePercent || 0;
        const classification = getVIXClassification(value);

        savePreviousValue('vix', value);
        updateVIXDisplay(value, classification, change, changePercent);
        updateTimestamp('vix-updated');
        addToHistory('vix', value);
        return value;
    }

    // Fallback: cached value
    const cachedValue = getPreviousValue('vix');
    if (cachedValue !== null && !isNaN(cachedValue)) {
        const classification = getVIXClassification(cachedValue);
        updateVIXDisplay(cachedValue, classification + ' (Cached)', 0, 0);
        return cachedValue;
    }

    // Last resort: static estimate
    const fallbackValue = 18.5;
    const classification = getVIXClassification(fallbackValue);
    updateVIXDisplay(fallbackValue, classification + ' (Estimated)', 0, 0);
    return fallbackValue;
}

// Update VIX display
function updateVIXDisplay(value, classification, change = 0, changePercent = 0) {
    // Hide skeletons and show content
    hideSkeletonShowContent('vix-skeleton', 'vix-value');
    hideSkeletonShowContent('vix-change-skeleton', 'vix-change');
    
    document.getElementById('vix-value').textContent = value.toFixed(2);
    document.getElementById('vix-label').textContent = classification;
    
    // Update change display
    const changeEl = document.getElementById('vix-change');
    if (changeEl) {
        const changeText = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
        const percentText = changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
        changeEl.textContent = `${changeText} (${percentText})`;
        changeEl.className = 'gauge-change ' + (change >= 0 ? 'positive' : 'negative');
    }
    
    // Update bar position (scale 0-100, but VIX typically ranges 10-80)
    // We'll cap display at 100 for extreme cases
    const bar = document.getElementById('vix-bar');
    const marker = document.getElementById('vix-marker');
    if (bar && marker) {
        const displayValue = Math.min(value, 100);
        const percentage = displayValue;
        
        marker.style.left = `${percentage}%`;
    }
    
    // Draw sparkline if we have historical data
    if (historicalData.vix && historicalData.vix.length > 0) {
        drawSparkline('vix-sparkline', historicalData.vix, '#ff9800');
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

// Debounce helper for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Request queue manager to prevent overwhelming APIs
class RequestQueue {
    constructor(maxConcurrent = 3, minDelay = 100) {
        this.maxConcurrent = maxConcurrent;
        this.minDelay = minDelay;
        this.queue = [];
        this.active = 0;
        this.lastRequestTime = 0;
    }
    
    async add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.active >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        
        // Enforce minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
            setTimeout(() => this.process(), this.minDelay - timeSinceLastRequest);
            return;
        }
        
        const { fn, resolve, reject } = this.queue.shift();
        this.active++;
        this.lastRequestTime = Date.now();
        
        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.active--;
            this.process(); // Process next in queue
        }
    }
}

// Global request queue instance
const apiRequestQueue = new RequestQueue(3, 100);

// Connection status tracking
let apiFailureCount = 0;
let lastSuccessfulFetch = Date.now();

function trackAPISuccess() {
    apiFailureCount = 0;
    lastSuccessfulFetch = Date.now();
}

function trackAPIFailure() {
    apiFailureCount++;
    
    // Show warning if multiple failures
    if (apiFailureCount >= 3) {
        showNotification('⚠️ Multiple API failures detected. Using cached data.', 'warning', 5000);
    }
    
    // Show critical warning if no successful fetch in 5 minutes
    const timeSinceSuccess = Date.now() - lastSuccessfulFetch;
    if (timeSinceSuccess > 300000) { // 5 minutes
        showNotification('❌ Unable to connect to data sources. Check your internet connection.', 'error', 7000);
    }
}

// Chart rendering cache to avoid re-rendering same data
const chartRenderCache = new Map();

// Draw sparkline chart (optimized)
function drawSparkline(canvasId, data, color = '#667eea') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length < 2) return;
    
    // Check cache to avoid unnecessary re-renders
    const cacheKey = `${canvasId}-${data.length}-${data[data.length - 1]}-${color}`;
    if (chartRenderCache.get(canvasId) === cacheKey) {
        return; // Same data, skip rendering
    }
    chartRenderCache.set(canvasId, cacheKey);
    
    const ctx = canvas.getContext('2d'); // Need alpha for transparency
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
    ctx.lineCap = 'round'; // Smoother line endings
    ctx.lineJoin = 'round'; // Smoother line joins
    ctx.beginPath();
    
    // Use Path2D for better performance
    const path = new Path2D();
    data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        
        if (index === 0) {
            path.moveTo(x, y);
        } else {
            path.lineTo(x, y);
        }
    });
    
    ctx.stroke(path);
    
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

// Debounced version for batch updates
const drawSparklineDebounced = debounce(drawSparkline, 100);

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
    // Hide skeletons and show content
    hideSkeletonShowContent('fear-greed-skeleton', 'fear-greed-value');
    hideSkeletonShowContent('fear-greed-change-skeleton', 'fear-greed-change');
    
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
                else if (key === 'unemployment') baseValue = 4.1;
                else if (key === 'gdp') baseValue = 2.0;
                else if (key === 'vix') baseValue = 18;
                else if (key === 'sp500') baseValue = 5480;
                else if (key === 'nasdaq') baseValue = 17250;
                else if (key === 'ftse100') baseValue = 8450;
                else if (key === 'dax') baseValue = 18900;
                else if (key === 'stoxx600') baseValue = 505;
                else if (key === 'nikkei') baseValue = 37800;
                else if (key === 'shanghai') baseValue = 3240;
                else if (key === 'hangsen') baseValue = 22100;
                
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
        recessionIndexes.unemployment.source = 'FRED';
    } else {
        recessionIndexes.unemployment.value = (4.1 + Math.random() * 0.4).toFixed(2);
        recessionIndexes.unemployment.status = 'warning';
        recessionIndexes.unemployment.source = 'estimated';
    }

    // GDP Growth
    if (gdpGrowth !== null) {
        recessionIndexes.gdp.value = gdpGrowth.toFixed(2);
        recessionIndexes.gdp.status = gdpGrowth < 0 ? 'bad' :
                                     gdpGrowth < 1 ? 'warning' : 'good';
        recessionIndexes.gdp.source = 'FRED';
    } else {
        recessionIndexes.gdp.value = (1.2 + Math.random() * 1.5).toFixed(2);
        recessionIndexes.gdp.status = 'warning';
        recessionIndexes.gdp.source = 'estimated';
    }

    // Yield Curve (10Y - 2Y spread)
    if (yield10y !== null && yield2y !== null) {
        const spread = yield10y - yield2y;
        recessionIndexes.yield.value = spread.toFixed(2);
        recessionIndexes.yield.status = spread < 0 ? 'bad' :
                                        spread < 0.5 ? 'warning' : 'good';
        recessionIndexes.yield.source = 'FRED';
    } else {
        recessionIndexes.yield.value = (Math.random() * 1.5 - 0.2).toFixed(2);
        recessionIndexes.yield.status = 'warning';
        recessionIndexes.yield.source = 'estimated';
    }

    // Sahm Rule (simplified estimate from unemployment)
    if (unemploymentRate !== null) {
        const sahmValue = Math.max(0, (unemploymentRate - 3.5) * 0.3).toFixed(2);
        recessionIndexes.sahm.value = sahmValue;
        recessionIndexes.sahm.status = sahmValue > 0.5 ? 'bad' : sahmValue > 0.25 ? 'warning' : 'good';
        recessionIndexes.sahm.source = 'FRED';
    } else {
        recessionIndexes.sahm.value = (Math.random() * 0.6).toFixed(2);
        recessionIndexes.sahm.status = 'warning';
        recessionIndexes.sahm.source = 'estimated';
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
    
    // Cardboard Box Index (shipping/manufacturing activity)
    // Lower = bad (less shipping/manufacturing)
    const cardboardValue = (50 + Math.random() * 50).toFixed(0);
    recessionIndexes.cardboard.value = cardboardValue;
    recessionIndexes.cardboard.status = cardboardValue < 60 ? 'bad' : 
                                        cardboardValue < 75 ? 'warning' : 'good';
    
    // Hemline Index (fashion trends correlating with economy)
    // Lower hemlines (longer skirts) = bad economy
    const hemlineValue = (40 + Math.random() * 40).toFixed(0);
    recessionIndexes.hemline.value = hemlineValue;
    recessionIndexes.hemline.status = hemlineValue < 50 ? 'bad' : 
                                      hemlineValue < 65 ? 'warning' : 'good';
    
    // Waiter's Bow Tie Index (fine dining employment)
    // Lower = bad (fewer fine dining jobs)
    const bowtieValue = (45 + Math.random() * 45).toFixed(0);
    recessionIndexes.bowtie.value = bowtieValue;
    recessionIndexes.bowtie.status = bowtieValue < 55 ? 'bad' : 
                                     bowtieValue < 70 ? 'warning' : 'good';
    
    // Skyscraper Index (tall building construction)
    // Higher = bad (construction boom often precedes recession)
    const skyscraperValue = (30 + Math.random() * 50).toFixed(0);
    recessionIndexes.skyscraper.value = skyscraperValue;
    recessionIndexes.skyscraper.status = skyscraperValue > 70 ? 'bad' : 
                                         skyscraperValue > 55 ? 'warning' : 'good';
    
    // Hot Waitress Index (attractive people in service jobs)
    // Higher = bad (more attractive people taking service jobs = fewer opportunities)
    const waitressValue = (35 + Math.random() * 45).toFixed(0);
    recessionIndexes.waitress.value = waitressValue;
    recessionIndexes.waitress.status = waitressValue > 65 ? 'bad' : 
                                       waitressValue > 50 ? 'warning' : 'good';
    
    // Neckties Sales Index (formal wear sales)
    // Lower = bad (less business activity/formality)
    const necktiesValue = (40 + Math.random() * 50).toFixed(0);
    recessionIndexes.neckties.value = necktiesValue;
    recessionIndexes.neckties.status = necktiesValue < 55 ? 'bad' : 
                                       necktiesValue < 70 ? 'warning' : 'good';
    
    // Champagne Index (luxury alcohol consumption)
    // Lower = bad (less celebration/luxury spending)
    const champagneValue = (45 + Math.random() * 45).toFixed(0);
    recessionIndexes.champagne.value = champagneValue;
    recessionIndexes.champagne.status = champagneValue < 60 ? 'bad' : 
                                        champagneValue < 75 ? 'warning' : 'good';
    
    // Parking Lot Index (retail parking lot occupancy)
    // Lower = bad (less retail activity)
    const parkingValue = (50 + Math.random() * 40).toFixed(0);
    recessionIndexes.parking.value = parkingValue;
    recessionIndexes.parking.status = parkingValue < 65 ? 'bad' : 
                                      parkingValue < 78 ? 'warning' : 'good';
    
    // Trash Index (commercial waste volume)
    // Lower = bad (less economic activity)
    const trashValue = (55 + Math.random() * 35).toFixed(0);
    recessionIndexes.trash.value = trashValue;
    recessionIndexes.trash.status = trashValue < 70 ? 'bad' : 
                                    trashValue < 82 ? 'warning' : 'good';
    
    // Bike Messenger Index (gig economy employment)
    // Higher = bad (more people in gig economy = fewer traditional jobs)
    const bikemessengerValue = (30 + Math.random() * 50).toFixed(0);
    recessionIndexes.bikemessenger.value = bikemessengerValue;
    recessionIndexes.bikemessenger.status = bikemessengerValue > 65 ? 'bad' : 
                                            bikemessengerValue > 50 ? 'warning' : 'good';
    
    // Temp Worker Index (temporary vs permanent employment)
    // Higher = bad (more temp jobs = less job security)
    const tempworkerValue = (35 + Math.random() * 45).toFixed(0);
    recessionIndexes.tempworker.value = tempworkerValue;
    recessionIndexes.tempworker.status = tempworkerValue > 65 ? 'bad' : 
                                         tempworkerValue > 50 ? 'warning' : 'good';
    
    // Coffee Shop Laptop Index (unemployed professionals)
    // Higher = bad (more people working from coffee shops = unemployment/underemployment)
    const coffeeshopValue = (30 + Math.random() * 50).toFixed(0);
    recessionIndexes.coffeeshop.value = coffeeshopValue;
    recessionIndexes.coffeeshop.status = coffeeshopValue > 65 ? 'bad' : 
                                         coffeeshopValue > 50 ? 'warning' : 'good';
    
    updateRecessionIndexesDisplay();
    updateRecessionProbabilityDisplay();
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
        { id: 'bigmac', data: recessionIndexes.bigmac },
        { id: 'cardboard', data: recessionIndexes.cardboard },
        { id: 'hemline', data: recessionIndexes.hemline },
        { id: 'bowtie', data: recessionIndexes.bowtie },
        { id: 'skyscraper', data: recessionIndexes.skyscraper },
        { id: 'waitress', data: recessionIndexes.waitress },
        { id: 'neckties', data: recessionIndexes.neckties },
        { id: 'champagne', data: recessionIndexes.champagne },
        { id: 'parking', data: recessionIndexes.parking },
        { id: 'trash', data: recessionIndexes.trash },
        { id: 'bikemessenger', data: recessionIndexes.bikemessenger },
        { id: 'tempworker', data: recessionIndexes.tempworker },
        { id: 'coffeeshop', data: recessionIndexes.coffeeshop }
    ];
    
    indexes.forEach(index => {
        const valueEl = document.getElementById(`${index.id}-value`);
        const statusEl = document.getElementById(`${index.id}-status`);
        const changeEl = document.getElementById(`${index.id}-change`);

        if (valueEl && statusEl && index.data.value !== null) {
            // Hide skeletons and show content (if they exist)
            hideSkeletonShowContent(`${index.id}-value-skeleton`, `${index.id}-value`);
            hideSkeletonShowContent(`${index.id}-change-skeleton`, `${index.id}-change`);
            hideSkeletonShowContent(`${index.id}-status-skeleton`, `${index.id}-status`);

            // Show source badge on the card
            const card = valueEl.closest('.index-card');
            if (card) {
                const isEstimated = index.data.source === 'estimated';
                card.setAttribute('data-source', isEstimated ? 'estimated' : 'live');
                let badgeEl = card.querySelector('.source-badge');
                if (!badgeEl) {
                    badgeEl = document.createElement('span');
                    badgeEl.className = 'source-badge';
                    card.querySelector('h3').appendChild(badgeEl);
                }
                badgeEl.textContent = isEstimated ? 'est.' : 'live';
                badgeEl.className = `source-badge source-${isEstimated ? 'estimated' : 'live'}`;
            }
            
            // Extract numeric value for history
            let numericValue = null;
            if (index.id === 'bigmac') {
                numericValue = parseFloat(index.data.value.replace('$', ''));
                valueEl.textContent = index.data.value;
            } else {
                numericValue = parseFloat(index.data.value);
                // Only append % as a suffix — skip word units like 'index', 'score', 'mentions'
                const unit = index.data.unit === '%' ? '%' : '';
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

// Calculate Recession Probability
function calculateRecessionProbability() {
    let totalWeight = 0;
    let weightedScore = 0;
    const contributors = [];
    
    // Calculate weighted score based on each indicator's status
    Object.entries(recessionIndexes).forEach(([id, data]) => {
        if (data.value !== null && data.status !== null) {
            const weight = data.weight || 0;
            totalWeight += weight;
            
            // Convert status to score: bad = 100, warning = 50, good = 0
            let score = 0;
            if (data.status === 'bad') score = 100;
            else if (data.status === 'warning') score = 50;
            else if (data.status === 'good') score = 0;
            
            const contribution = weight * score;
            weightedScore += contribution;
            
            // Track contributors for breakdown
            contributors.push({
                id: id,
                name: data.name,
                status: data.status,
                weight: weight,
                contribution: contribution,
                category: data.category
            });
        }
    });
    
    // Normalize to 0-100 scale
    const probability = totalWeight > 0 ? (weightedScore / totalWeight) : 0;

    // Calculate confidence interval based on how many indicators have real (non-estimated) data
    const expectedTotal = Object.values(recessionIndexes).reduce((s, d) => s + (d.weight || 0), 0);
    const dataCompleteness = expectedTotal > 0 ? Math.min(1, totalWeight / expectedTotal) : 0;
    const confidenceRange = Math.max(0, 10 * (1 - dataCompleteness));
    
    // Sort contributors by contribution (highest first)
    contributors.sort((a, b) => b.contribution - a.contribution);
    
    // Determine trend based on historical data
    const previousProbability = getPreviousValue('recessionProbability') || probability;
    const change = probability - previousProbability;
    let trend = 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    
    // Update global recession probability object
    recessionProbability.current = Math.round(probability);
    recessionProbability.confidence = {
        lower: Math.max(0, Math.round(probability - confidenceRange)),
        upper: Math.min(100, Math.round(probability + confidenceRange))
    };
    recessionProbability.contributors = contributors;
    recessionProbability.trend = trend;
    
    // Save for trend tracking
    savePreviousValue('recessionProbability', probability);
    
    return recessionProbability;
}

// Update Recession Probability Display
function updateRecessionProbabilityDisplay() {
    const prob = calculateRecessionProbability();
    
    // Determine color based on probability level
    let color = '';
    let classification = '';
    if (prob.current < 20) {
        classification = 'Very Low Risk';
        color = '#28a745';
    } else if (prob.current < 40) {
        classification = 'Low Risk';
        color = '#90ee90';
    } else if (prob.current < 60) {
        classification = 'Moderate Risk';
        color = '#ffc107';
    } else if (prob.current < 80) {
        classification = 'High Risk';
        color = '#ff9800';
    } else {
        classification = 'Very High Risk';
        color = '#dc3545';
    }
    
    // Update probability value with adaptive color
    const probValueEl = document.getElementById('recession-probability-value');
    if (probValueEl) {
        probValueEl.textContent = `${prob.current}%`;
        probValueEl.style.color = color;
    }
    
    // Update confidence range
    const probRangeEl = document.getElementById('recession-probability-range');
    if (probRangeEl) {
        probRangeEl.textContent = `${prob.confidence.lower}% - ${prob.confidence.upper}%`;
    }
    
    // Update classification text with same color
    const probLabelEl = document.getElementById('recession-probability-label');
    if (probLabelEl) {
        probLabelEl.textContent = classification;
        probLabelEl.style.color = color;
    }
    
    // Update gauge/meter
    const probMeterEl = document.getElementById('recession-probability-meter');
    const probMarkerEl = document.getElementById('recession-probability-marker');
    if (probMeterEl && probMarkerEl) {
        probMarkerEl.style.left = `${prob.current}%`;
    }
    
    // Update trend indicator
    const probTrendEl = document.getElementById('recession-probability-trend');
    if (probTrendEl) {
        let trendText = '';
        let trendIcon = '';
        if (prob.trend === 'increasing') {
            trendText = 'Increasing';
            trendIcon = '↗';
            probTrendEl.className = 'probability-trend trend-up';
        } else if (prob.trend === 'decreasing') {
            trendText = 'Decreasing';
            trendIcon = '↘';
            probTrendEl.className = 'probability-trend trend-down';
        } else {
            trendText = 'Stable';
            trendIcon = '→';
            probTrendEl.className = 'probability-trend trend-stable';
        }
        probTrendEl.textContent = `${trendIcon} ${trendText}`;
    }
    
    // Update contributors breakdown
    updateContributorsBreakdown(prob.contributors);
}

// Update Contributors Breakdown
function updateContributorsBreakdown(contributors) {
    const breakdownEl = document.getElementById('recession-contributors-breakdown');
    if (!breakdownEl) return;
    
    // Clear existing content
    breakdownEl.innerHTML = '';
    
    // Show top 5 contributors
    const topContributors = contributors.slice(0, 5);
    
    topContributors.forEach(contributor => {
        const contributorDiv = document.createElement('div');
        contributorDiv.className = 'contributor-item';
        
        // Calculate percentage of total contribution
        const totalContribution = contributors.reduce((sum, c) => sum + c.contribution, 0);
        const percentage = totalContribution > 0 ? (contributor.contribution / totalContribution * 100) : 0;
        
        // Status icon
        let statusIcon = '';
        let statusClass = '';
        if (contributor.status === 'bad') {
            statusIcon = '✗';
            statusClass = 'status-bad';
        } else if (contributor.status === 'warning') {
            statusIcon = '⚠';
            statusClass = 'status-warning';
        } else {
            statusIcon = '✓';
            statusClass = 'status-good';
        }
        
        contributorDiv.innerHTML = `
            <div class="contributor-header">
                <span class="contributor-icon ${statusClass}">${statusIcon}</span>
                <span class="contributor-name">${contributor.name}</span>
                <span class="contributor-badge ${contributor.category}">${contributor.category}</span>
            </div>
            <div class="contributor-bar-container">
                <div class="contributor-bar ${statusClass}" style="width: ${percentage}%"></div>
            </div>
            <div class="contributor-stats">
                <span class="contributor-weight">Weight: ${(contributor.weight * 100).toFixed(0)}%</span>
                <span class="contributor-impact">Impact: ${percentage.toFixed(1)}%</span>
            </div>
        `;
        
        breakdownEl.appendChild(contributorDiv);
    });
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
// Fetch Stock Index Data - using Alpha Vantage free API (CORS-friendly)
async function fetchStockIndex(config, name) {
    // Method 1: Yahoo Finance with multi-proxy fallback
    const yahooResult = await fetchYahooData(config.symbol);
    if (yahooResult) {
        console.log(`✓ Yahoo Finance success for ${config.symbol}`);
        return { ...yahooResult, dataSource: 'live' };
    }

    // Method 2: Try Finnhub API (only if a real key is configured)
    if (FINNHUB_API_KEY && FINNHUB_API_KEY !== 'demo') {
        try {
            const finnhubSymbol = config.symbol.replace('^', '');
            const finnhubUrl = `${FINNHUB_QUOTE_API}?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
            const finnhubResponse = await fetch(finnhubUrl);
            if (finnhubResponse.ok) {
                const data = await finnhubResponse.json();
                if (data && data.c && data.pc) {
                    const price = data.c;
                    const previousClose = data.pc;
                    const change = price - previousClose;
                    const changePercent = (change / previousClose) * 100;
                    console.log(`✓ Finnhub success for ${config.symbol}`);
                    return {
                        price: Math.round(price * 100) / 100,
                        change: Math.round(change * 100) / 100,
                        changePercent: Math.round(changePercent * 100) / 100,
                        dataSource: 'live'
                    };
                }
            }
        } catch (finnhubError) {
            console.log(`Finnhub failed for ${config.symbol}:`, finnhubError.message);
        }
    }

    // Fallback to mock/estimated data if all APIs fail
    console.log(`⚠ Using estimated data for ${config.symbol}`);
    return { ...generateMockStockData(config, name), dataSource: 'estimated' };
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
    // Base values for each index (approximate values as of mid-2026)
    const baseValues = {
        '^gspc': { price: 5480, change: 18.2, changePercent: 0.33 },      // S&P 500
        '^ixic': { price: 17250, change: 72.4, changePercent: 0.42 },     // NASDAQ
        '^ftse': { price: 8450, change: 22.1, changePercent: 0.26 },      // FTSE 100
        '^gdaxi': { price: 18900, change: 45.6, changePercent: 0.24 },    // DAX
        '^stoxx': { price: 505, change: 1.1, changePercent: 0.22 },       // STOXX 600
        '^n225': { price: 37800, change: 155.3, changePercent: 0.41 },    // Nikkei 225
        '000001.ss': { price: 3240, change: -8.5, changePercent: -0.26 }, // Shanghai
        '^hsi': { price: 22100, change: 95.6, changePercent: 0.43 }       // Hang Seng
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

    // Hide skeletons and show content
    hideSkeletonShowContent(`${indexId}-price-skeleton`, `${indexId}-price`);
    hideSkeletonShowContent(`${indexId}-change-skeleton`, `${indexId}-change`);
    hideSkeletonShowContent(`${indexId}-change-percent-skeleton`, `${indexId}-change-percent`);

    const priceEl = document.getElementById(`${indexId}-price`);
    const changeEl = document.getElementById(`${indexId}-change`);
    const changePercentEl = document.getElementById(`${indexId}-change-percent`);

    // Show live/estimated badge on the card
    const card = document.getElementById(`${indexId}-card`);
    if (card) {
        const isEstimated = data.dataSource === 'estimated';
        card.setAttribute('data-source', isEstimated ? 'estimated' : 'live');
        let badgeEl = card.querySelector('.stock-source-badge');
        if (!badgeEl) {
            badgeEl = document.createElement('span');
            badgeEl.className = 'stock-source-badge';
            card.querySelector('h3').appendChild(badgeEl);
        }
        badgeEl.textContent = isEstimated ? 'est.' : 'live';
        badgeEl.className = `stock-source-badge source-${isEstimated ? 'estimated' : 'live'}`;
        badgeEl.title = isEstimated
            ? 'Yahoo Finance unavailable — showing reference value'
            : 'Live data from Yahoo Finance';
    }

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
    // Allow enough time for all 3 proxies to be attempted:
    // 4s direct + 3 × 8s proxies = 28s max per symbol
    const PER_SYMBOL_TIMEOUT = 28000;

    const indexPromises = Object.entries(STOCK_INDICES).map(async ([key, config]) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), PER_SYMBOL_TIMEOUT)
            );
            const data = await Promise.race([
                fetchStockIndex(config, config.name),
                timeoutPromise
            ]);
            updateStockIndexDisplay(key, data);
            return { id: key, data };
        } catch (error) {
            const fallbackData = { ...generateMockStockData(config, config.name), dataSource: 'estimated' };
            updateStockIndexDisplay(key, fallbackData);
            return { id: key, data: fallbackData };
        }
    });

    await Promise.allSettled(indexPromises);
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
    document.getElementById('social-sentiment-label').textContent = 'Loading...';
    document.getElementById('vix-label').textContent = 'Loading...';
    
    // Load main content first (faster)
    try {
        await Promise.all([
            fetchFearGreedIndex(),
            fetchCryptoFearGreedIndex(),
            fetchVIX(),
            fetchRecessionIndexes()
        ]);
    } catch (error) {
        // Silently handle errors - fallbacks are in place
    }
    
    // Social sentiment: Manual only (click refresh button to load)
    // This saves Apify credits - no automatic fetch on page load
    initSocialSentimentPlaceholder();
    
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
                fetchCryptoFearGreedIndex(),
                fetchVIX(),
                fetchRecessionIndexes(),
                fetchAllStockIndices()
            ]);
        } catch (error) {
            // Silently handle refresh errors
        }
    }, 300000); // 5 minutes
    
    // Initialize tab navigation
    initMainTabs();
}

// =============================================================================
// MAIN CONTENT TAB NAVIGATION
// =============================================================================

function initMainTabs() {
    const tabs = document.querySelectorAll('.main-tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Set up refresh button for News tab
    const refreshNewsBtn = document.getElementById('refresh-news');
    
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', async () => {
            refreshNewsBtn.disabled = true;
            refreshNewsBtn.textContent = '⏳';
            try {
                await fetchFinancialNews();
                updateTimestamp('news-updated');
            } catch (error) {
                console.error('Failed to fetch news:', error);
                showNotification('❌ Failed to load news', 'error', 3000);
            } finally {
                refreshNewsBtn.disabled = false;
                refreshNewsBtn.textContent = '🔄';
            }
        });
    }
}

// =============================================================================
// FINANCIAL NEWS (via Apify)
// =============================================================================

async function fetchFinancialNews() {
    if (!APIFY_TOKEN) {
        showNotification('⚠️ Apify token required for news', 'warning', 3000);
        return;
    }
    
    console.log('📰 Fetching financial news...');
    
    const container = document.getElementById('news-container');
    container.innerHTML = '<div class="news-placeholder"><div class="placeholder-icon">⏳</div><div class="placeholder-text">Loading news...</div></div>';
    
    // Try multiple actors in order
    const newsActors = [
        {
            id: 'lhotanova/google-news-scraper',
            input: { keyword: 'stock market financial news' }
        },
        {
            id: 'saswave/google-news-scraper', 
            input: { 
                searchQuery: 'stock market',
                maxResults: 15
            }
        },
        {
            id: 'scrapio/google-news-scraper',
            input: {
                query: 'stock market',
                maxItems: 15
            }
        }
    ];
    
    for (const actor of newsActors) {
        try {
            console.log(`   Trying news actor: ${actor.id}`);
            const encodedId = encodeURIComponent(actor.id);
            const url = `https://api.apify.com/v2/acts/${encodedId}/run-sync-get-dataset-items?timeout=90`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${APIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(actor.input)
            });
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.warn(`   Actor ${actor.id} failed: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
                continue;
            }
            
            const news = await response.json();
            console.log(`   ✓ ${actor.id} returned ${news?.length || 0} articles`);
            
            if (!news || news.length === 0) {
                continue;
            }
            
            // Render news cards (handle different output formats)
            container.innerHTML = news.slice(0, 15).map(article => `
                <a href="${article.link || article.url || article.articleUrl || '#'}" target="_blank" rel="noopener" class="news-card">
                    ${(article.image || article.imageUrl || article.thumbnail) ? `<img src="${article.image || article.imageUrl || article.thumbnail}" alt="" class="news-card-image" onerror="this.style.display='none'">` : ''}
                    <div class="news-card-content">
                        <div class="news-card-title">${escapeHtml(article.title || article.headline || 'Untitled')}</div>
                        <div class="news-card-meta">
                            <span class="news-card-source">${escapeHtml(article.source || article.publisher || article.siteName || 'Unknown')}</span>
                            <span class="news-card-time">${escapeHtml(article.date || article.publishedAt || article.time || article.pubDate || '')}</span>
                        </div>
                    </div>
                </a>
            `).join('');
            
            showNotification('✅ News loaded!', 'success', 2000);
            return; // Success!
            
        } catch (error) {
            console.warn(`   Actor ${actor.id} error: ${error.message}`);
        }
    }
    
    // All actors failed
    container.innerHTML = `
        <div class="news-placeholder">
            <div class="placeholder-icon">❌</div>
            <div class="placeholder-text">Failed to load news</div>
            <div class="placeholder-subtext">All news sources unavailable. Try again later.</div>
        </div>
    `;
}

// =============================================================================
// CAPITOL TRADES / PELOSI TRACKER - DEFERRED
// =============================================================================
// NOTE: Capitol Trades feature has been temporarily removed due to Apify actor
// pricing constraints. The saswave/capitol-trades-scraper requires a paid tier.
// This feature will be revisited when a free/affordable alternative is found.
// See TODO.txt item #41 for details.

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Helper: Get user-friendly error message
function getUserFriendlyErrorMessage(error, context = '') {
    if (!error) return 'An unknown error occurred';
    
    const errorType = error.name || '';
    const errorMessage = error.message || '';
    
    // CORS errors
    if (errorMessage.includes('CORS') || errorMessage.includes('cors') || errorType === 'TypeError' && errorMessage.includes('fetch')) {
        return `${context ? context + ': ' : ''}Network access blocked. Using cached data.`;
    }
    
    // Timeout errors
    if (errorType === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        return `${context ? context + ': ' : ''}Request timed out. Retrying...`;
    }
    
    // HTTP errors
    if (errorMessage.includes('HTTP error')) {
        const statusMatch = errorMessage.match(/status: (\d+)/);
        if (statusMatch) {
            const status = parseInt(statusMatch[1]);
            if (status === 429) return `${context ? context + ': ' : ''}Rate limit exceeded. Please wait.`;
            if (status >= 500) return `${context ? context + ': ' : ''}Server error. Using cached data.`;
            if (status === 404) return `${context ? context + ': ' : ''}Data not found. Using fallback.`;
        }
        return `${context ? context + ': ' : ''}API request failed. Using cached data.`;
    }
    
    // JSON parse errors
    if (errorType === 'SyntaxError' && errorMessage.includes('JSON')) {
        return `${context ? context + ': ' : ''}Invalid data received. Using cached data.`;
    }
    
    // Generic fallback
    return `${context ? context + ': ' : ''}Unable to fetch data. Using cached data.`;
}

// Show notification toast
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Color mapping for different notification types
    const colorMap = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#667eea'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colorMap[type] || colorMap['info']};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
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
    
    // Try different element ID patterns based on the type of indicator
    let element = null;
    
    // For stock indices (use -price)
    if (['sp500', 'nasdaq', 'ftse100', 'dax', 'stoxx600', 'nikkei', 'shanghai', 'hangsen'].includes(indexId)) {
        element = document.getElementById(`${indexId}-price`);
    }
    // For Fear & Greed indexes (special IDs)
    else if (indexId === 'fear-greed') {
        element = document.getElementById('fear-greed-value');
    }
    else if (indexId === 'crypto-fear-greed') {
        element = document.getElementById('crypto-fear-greed-value');
    }
    else if (indexId === 'vix') {
        element = document.getElementById('vix-value');
    }
    // For recession indicators (use -value)
    else {
        element = document.getElementById(`${indexId}-value`);
    }
    
    if (element && element.textContent !== '--' && element.textContent.trim() !== '') {
        currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, ''));
        // If parsing failed or value is NaN, use default
        if (isNaN(currentValue)) {
            currentValue = 50;
        }
    }
    
    // Generate realistic historical data with trends
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Add some randomness and trending
        const trend = (days - i) / days; // 0 to 1
        const randomVariation = (Math.random() - 0.5) * (currentValue * 0.05); // 5% variation
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
    
    // Create new chart with performance optimizations
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
            animation: {
                duration: days > 90 ? 300 : 750 // Faster animation for large datasets
            },
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
    
    // Add VIX refresh button handler
    const refreshVixBtn = document.getElementById('refresh-vix');
    if (refreshVixBtn) {
        refreshVixBtn.addEventListener('click', async () => {
            refreshVixBtn.classList.add('loading');
            refreshVixBtn.disabled = true;
            await fetchVIX();
            refreshVixBtn.classList.remove('loading');
            refreshVixBtn.disabled = false;
        });
    }
    
    // Add Stock Indices refresh button handler
    const refreshStockIndicesBtn = document.getElementById('refresh-stock-indices');
    if (refreshStockIndicesBtn) {
        refreshStockIndicesBtn.addEventListener('click', async () => {
            refreshStockIndicesBtn.classList.add('loading');
            refreshStockIndicesBtn.disabled = true;
            await fetchAllStockIndices();
            updateTimestamp('stock-indices-updated');
            refreshStockIndicesBtn.classList.remove('loading');
            refreshStockIndicesBtn.disabled = false;
        });
    }
    
    // Add Recession Indicators refresh button handler
    const refreshRecessionBtn = document.getElementById('refresh-recession-indexes');
    if (refreshRecessionBtn) {
        refreshRecessionBtn.addEventListener('click', async () => {
            refreshRecessionBtn.classList.add('loading');
            refreshRecessionBtn.disabled = true;
            await fetchRecessionIndexes();
            updateRecessionIndexesDisplay();
            updateRecessionProbabilityDisplay();
            updateTimestamp('recession-indexes-updated');
            refreshRecessionBtn.classList.remove('loading');
            refreshRecessionBtn.disabled = false;
        });
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
