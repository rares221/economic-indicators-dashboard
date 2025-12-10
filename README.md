# 📊 Economic Indicators Dashboard

[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)]()
[![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow.svg)]()

A comprehensive, real-time web application that displays various economic indicators, market sentiment indexes, and unofficial recession indicators in an interactive dashboard format.

**✨ No build process • No dependencies • Just open and run!**

---

## ✨ Features

### 📈 Market Sentiment
- **Stock Market Fear & Greed Index**: Real-time sentiment from CNN's API
- **Crypto Market Fear & Greed Index**: Real-time crypto sentiment from Alternative.me API
- **Side-by-side comparison**: Compare stock vs crypto market sentiment

### 📊 Stock Market Data
- **8 Major Global Indices**: S&P 500, NASDAQ, FTSE 100, DAX, STOXX 600, Nikkei 225, Shanghai Composite, Hang Seng
- **Real-time prices** with smart decimal formatting (e.g., "6,050.6 pts")
- **Daily changes** and percentage movements
- **Sparkline charts** showing recent trends

### 📉 Recession Indicators
- **Sahm Rule** (unemployment-based)
- **Yield Curve** (10Y-2Y Treasury spread)
- **Unemployment Rate**
- **GDP Growth**
- **Lipstick Index** (consumer behavior)
- **R-Word Index** (recession mentions)
- **Stripper Index** (economic stress)
- **Vibecession** (sentiment disconnect)
- **ADS Index** (business conditions)
- Plus: Used Car, Lego, Frozen Pizza, Men's Underwear, and Big Mac indexes

### 📈 Interactive Charts
- **Click any indicator** to view detailed historical charts
- **Multiple timeframes**: 7 days, 30 days, 90 days, or 1 year
- **Statistics panel**: Current, average, high, low, and change percentage
- **Beautiful visualizations** powered by Chart.js

### 💾 Export & Share
- **📸 PNG Export**: Download high-quality dashboard screenshot
- **📊 CSV Export**: Export all data to spreadsheet format
- **🔗 Share URL**: Generate shareable link with current state

### 🎨 UI/UX
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🎨 Modern Gradients**: Beautiful visual design
- **⚡ Smooth Animations**: Polished micro-interactions
- **🐛 Debug Console**: Built-in API debugging tools

---

## 🚀 Quick Start

### Option 1: Just Open It
```
1. Download/clone the repository
2. Open index.html in your browser
3. That's it! No installation needed.
```

### Option 2: Test APIs First
```
1. Open test-api.html in your browser
2. Click "Test All APIs" to verify connections
3. Then open index.html
```

---

## 🔧 Setup

### No API Keys Required!
The dashboard works immediately with:
- ✅ Stock Market Fear & Greed (CNN API)
- ✅ Crypto Fear & Greed (Alternative.me API)
- ✅ Stock Indices (Yahoo Finance API)
- ⚠️ Recession indicators (estimated values)

### Optional: Add API Keys for Enhanced Data

**FRED API Key** (for real economic data):
1. Visit https://fred.stlouisfed.org/docs/api/api_key.html
2. Sign up for free
3. Open `script.js` and replace `const FRED_API_KEY = 'demo'` with your key

**Finnhub API Key** (backup for stock data):
1. Visit https://finnhub.io/register
2. Sign up for free (60 calls/minute)
3. Open `script.js` and replace `const FINNHUB_API_KEY = 'demo'` with your key

---

## 📖 How to Use

### View Historical Data
- Click any Fear & Greed panel, recession indicator card, or stock index card
- A modal opens with an interactive chart
- Use the dropdown to change timeframe (7d, 30d, 90d, 1y)
- View detailed statistics below the chart

### Export Data
- **📸 Camera icon**: Export dashboard as PNG image
- **📊 Chart icon**: Export all data as CSV file
- **🔗 Link icon**: Copy shareable URL to clipboard

### Toggle Dark Mode
- Click the 🌙/☀️ icon in the header
- Preference is saved to localStorage

### Debug APIs
- Click the 🐛 button on Fear & Greed section
- View detailed API logs and responses
- Or open `test-api.html` for comprehensive API testing

---

## 🌐 Data Sources

### Real-Time APIs (No Keys Required)
| Source | Data | Status |
|--------|------|--------|
| **CNN API** | Stock Fear & Greed Index | ✅ Free |
| **Alternative.me** | Crypto Fear & Greed Index | ✅ Free |
| **Yahoo Finance** | 8 Major Stock Indices | ✅ Free |

### Optional APIs (Free Keys Available)
| Source | Data | Limit |
|--------|------|-------|
| **FRED** | Economic indicators | 120/min |
| **Finnhub** | Stock data backup | 60/min |

### Fallback Strategy
```
Primary API → Backup API → Cached Data → Estimated Values
```
The dashboard always shows something useful, even if APIs are down.

---

## 🛠️ Technical Details

### Technologies
- **Vanilla JavaScript** - No frameworks
- **Chart.js 4.4.1** - Interactive charts
- **html2canvas 1.4.1** - PNG export
- **CSS Grid & Flexbox** - Responsive layout
- **LocalStorage** - Data caching

### Performance
- Direct API calls (no proxy for main APIs)
- Auto-refresh every 5 minutes
- Smart caching with fallbacks
- Lazy loading for stock indices
- Optimized for speed and reliability

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

---

## 📁 File Structure

```
economic-indicators-dashboard/
├── index.html       # Main dashboard
├── styles.css       # All styling and animations
├── script.js        # All functionality and API calls
├── test-api.html    # API testing tool
└── README.md        # This file
```

**Total Size**: ~200KB (no dependencies!)

---

## 🔬 API Testing Tool

Open `test-api.html` for comprehensive API testing:

### Features
- Test all 4 data sources individually or together
- Real-time logging with timestamps
- Response time tracking
- Success/failure statistics
- Detailed error messages
- JSON response inspection

### Use Cases
- Debug API connection issues
- Verify data structures
- Check response times
- Test CORS fallbacks
- Learn how APIs work

---

## 🎯 Recent Updates

### December 2024
- ✅ Added Crypto Fear & Greed Index
- ✅ Implemented historical charts with Chart.js
- ✅ Added export features (PNG, CSV, Share URL)
- ✅ Integrated Yahoo Finance for real stock data
- ✅ Created comprehensive API testing tool
- ✅ Added smart decimal formatting for indices
- ✅ Improved error handling and fallbacks

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Esc` - Close chart modal
- `F12` - Open browser console for debugging

### Best Practices
- Open during market hours for real-time data
- Use test-api.html to verify API connections
- Check debug console (🐛) if data seems stuck
- Export data regularly for historical tracking

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Data not loading | Open test-api.html to check APIs |
| Charts not showing | Ensure Chart.js CDN is accessible |
| Export not working | Check browser console (F12) |
| CORS errors | APIs will automatically use proxy fallback |

---

## 🔒 Privacy & Data

- **No data collection**: Everything runs in your browser
- **No tracking**: No analytics or cookies
- **No server**: Pure client-side application
- **Your data**: Exports and shares are yours only
- **API calls**: Direct to public APIs, no intermediary

---

## 🙏 Acknowledgments

This project uses data from:
- **CNN** - Stock Market Fear & Greed Index
- **Alternative.me** - Crypto Fear & Greed Index
- **Yahoo Finance** - Stock market data
- **FRED** - Federal Reserve economic data

Built with:
- **Chart.js** - Beautiful charts
- **html2canvas** - Screenshot functionality

---

## 📝 License

All rights reserved. Private project for personal use.

---

**Made with ❤️ for economic data enthusiasts**
