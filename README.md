# 📊 Economic Indicators Dashboard

[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](https://github.com/yourusername/economic-indicators-dashboard)
[![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow.svg)](https://github.com/yourusername/economic-indicators-dashboard)

A comprehensive, real-time web application that displays various economic indicators, market sentiment indexes, and unofficial recession indicators in an interactive dashboard format.

**✨ No build process • No dependencies • Just open and run!**

> **Note:** This is a private repository for personal use and development.

## ✨ Features

### Market Sentiment
- **📈 Stock Market Fear & Greed Index**: Real-time sentiment from CNN's API
- **₿ Crypto Market Fear & Greed Index**: Real-time crypto sentiment from Alternative.me API
- **Side-by-side comparison**: Compare stock vs crypto market sentiment

### Interactive Charts
- **📊 Historical Data Visualization**: Click any indicator to view detailed historical charts
- **Multiple Timeframes**: View 7-day, 30-day, 90-day, or 1-year trends
- **Statistics**: See current value, average, high, low, and percentage change
- **Beautiful Charts**: Powered by Chart.js with smooth animations

### Export & Share
- **📸 Export as PNG**: Download a high-quality snapshot of the entire dashboard
- **📊 Export as CSV**: Download all indicator data in spreadsheet format
- **🔗 Share URL**: Generate a shareable link with current dashboard state

### Unofficial Recession Indexes
Shows multiple economic indicators:
  - **Sahm Rule** (unemployment-based recession indicator)
  - **Yield Curve** (10Y-2Y Treasury spread)
  - **Unemployment Rate** (from FRED API)
  - **GDP Growth** (from FRED API)
  - **Lipstick Index** (cosmetic sales trend indicator)
  - **R-Word Index** (recession mentions in news)
  - **Stripper Index** (anecdotal economic stress indicator)
  - **Vibecession** (sentiment vs data disconnect)
  - **ADS Index** (Aruoba-Diebold-Scotti Business Conditions Index)
  - **Used Car Index**, **Lego Index**, **Frozen Pizza Index**
  - **Men's Underwear Index**, **Big Mac Index**
- **Major Stock Indices**: Real-time prices for S&P 500, NASDAQ, FTSE 100, DAX, STOXX 600, Nikkei 225, Shanghai Composite, Hang Seng
- **Overall Assessment**: Calculates an average conclusion based on all indicators

### UI/UX Features
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **🎨 Modern UI**: Gradient backgrounds, smooth animations, and intuitive interactions
- **♿ Accessible**: Keyboard navigation and screen reader support
- **🐛 Debug Console**: Built-in debugging tools for the Fear & Greed Index

## Setup

1. **No API Keys Required for Basic Functionality!** 🎉
   
   The dashboard works out-of-the-box with:
   - ✅ Real-time Stock Market Fear & Greed (CNN)
   - ✅ Real-time Crypto Fear & Greed (Alternative.me)
   - ✅ Real-time Stock Indices (Yahoo Finance)
   - ⚠️ Estimated recession indicators (can upgrade with FRED key)

2. **Optional API Keys (For Enhanced Data)**:
   
   **FRED API Key** (for real economic data):
   - Visit https://fred.stlouisfed.org/docs/api/api_key.html
   - Sign up for a free API key
   - Open `script.js` and replace `'demo'` with your API key on line 2
   
   **Finnhub API Key** (backup for stock indices):
   - Visit https://finnhub.io/register
   - Sign up for a free API key (60 calls/minute)
   - Open `script.js` and replace `'demo'` with your API key
   - Used as fallback if Yahoo Finance fails

3. **Open the Dashboard**:
   - Simply open `index.html` in a web browser
   - No build process or dependencies required
   - All data loads automatically from free APIs
   - Graceful fallbacks if any API is temporarily unavailable

## 🚀 How to Use

### Viewing Historical Data
- **Click on any indicator card** to open a detailed chart modal
- **Select timeframe** (7 days, 30 days, 90 days, or 1 year)
- View statistics: current value, average, high, low, and change percentage

### Exporting Data
- **📸 PNG Export**: Click the camera icon to download dashboard as image
- **📊 CSV Export**: Click the chart icon to download all data as spreadsheet
- **🔗 Share**: Click the link icon to copy a shareable URL to clipboard

### Customization
- **Toggle Dark Mode**: Click the moon/sun icon in the header
- **Debug Console**: Click the 🐛 button on Fear & Greed section for detailed API logs

## Data Sources

### Real-Time Data Sources

#### Stock Indices (NEW! Real Data)
- **Primary**: Yahoo Finance API (free, no key required)
  - S&P 500, NASDAQ, FTSE 100, DAX, STOXX 600
  - Nikkei 225, Shanghai Composite, Hang Seng
  - Real-time prices, changes, and percentages
- **Backup**: Finnhub API (optional free key, 60 calls/min)
- **Fallback**: Realistic mock data if APIs unavailable

#### Market Sentiment
- **Stock Market Fear & Greed**: CNN Production API (free, no key)
- **Crypto Fear & Greed**: Alternative.me API (free, no key)

#### Economic Data
- **FRED API**: Federal Reserve Economic Data (optional free key)
  - Unemployment Rate (UNRATE)
  - GDP Growth (A191RL1Q225SBEA)
  - 10-Year Treasury (DGS10)
  - 2-Year Treasury (DGS2)

### Calculated/Estimated Indexes
Some indexes use calculated or estimated values based on available data:
- **Sahm Rule**: Calculated from unemployment trends
- **Lipstick Index**: Estimated based on economic conditions
- **R-Word Index**: Estimated based on current economic sentiment
- **Stripper Index**: Estimated based on economic stress indicators
- **Vibecession**: Estimated based on sentiment vs data disconnect
- **ADS Index**: Estimated business conditions index

## Technical Details

### Technologies Used
- **Chart.js 4.4.1**: Interactive and responsive charts
- **html2canvas 1.4.1**: High-quality PNG export
- **Vanilla JavaScript**: No framework dependencies
- **CSS Grid & Flexbox**: Modern responsive layouts
- **LocalStorage**: Caching for offline resilience

### Performance
- **Direct API Calls**: No proxy needed for CNN and Alternative.me APIs
- **Auto-Refresh**: Data refreshes every 5 minutes
- **Caching**: Smart caching with fallback to previous values
- **Error Handling**: Graceful degradation if APIs are unavailable
- **Lazy Loading**: Stock indices load asynchronously

## File Structure

```
.
├── index.html      # Main HTML structure (with modal and export UI)
├── styles.css      # Styling, animations, and responsive design
├── script.js       # JavaScript logic, API calls, charts, and export
├── test-api.html   # API testing dashboard (debug tool)
└── README.md       # This file
```

## 🔬 API Testing Tool

Open `test-api.html` in your browser to:
- Test all API endpoints individually
- View real-time logs and responses
- Check API response times
- Debug connection issues
- Verify data structures
- See success/failure statistics

**Features:**
- ✅ Test Stock Market Fear & Greed (CNN)
- ✅ Test Crypto Fear & Greed (Alternative.me)
- ✅ Test Yahoo Finance (with CORS fallback)
- ✅ Test FRED Economic Data
- 📊 Real-time logging with timestamps
- 📈 Response time tracking
- 🎯 Success/failure statistics

## 🎯 Recent Enhancements (December 2024)

### ✅ Completed
1. **Historical Charts**: Interactive Chart.js visualizations with multiple timeframes
2. **Crypto Fear & Greed**: Added crypto market sentiment alongside stock market
3. **Export Functionality**: PNG, CSV, and shareable URL generation
4. **Side-by-side Comparison**: Stock vs Crypto sentiment comparison
5. **Modal System**: Click any indicator for detailed historical view
6. **Enhanced UI**: Modern gradients, animations, and micro-interactions

### 🚀 Potential Future Enhancements

1. **Real-Time Updates**: WebSocket connections for live data
2. **Predictive Analytics**: ML-based recession probability forecasting
3. **Social Sentiment**: Twitter/Reddit sentiment integration
4. **Customizable Dashboard**: Drag-and-drop layout customization
5. **Mobile App**: Progressive Web App (PWA) support
6. **Alerts System**: Email/push notifications for threshold breaches
7. **More Data Sources**: Additional APIs for more accurate indicators
8. **Backend Service**: Node.js/Python backend for rate limiting and caching

## 📸 Screenshots

> **Note:** Add screenshots here after deploying to GitHub

```
Coming soon: Dashboard screenshots showing Fear & Greed indexes, stock indices, and charts
```

## 🔒 Repository Status

This is a **private repository** for personal use and development. It is not currently accepting contributions.

## 📝 License

All rights reserved. This is a private project.

## 🙏 Acknowledgments

- **CNN** for the Fear & Greed Index API
- **Alternative.me** for the Crypto Fear & Greed Index API
- **Yahoo Finance** for stock market data
- **FRED** (Federal Reserve Economic Data) for economic indicators
- **Chart.js** for beautiful charts
- **html2canvas** for PNG export functionality

## 📧 Contact

Project Link: [https://github.com/yourusername/economic-indicators-dashboard](https://github.com/yourusername/economic-indicators-dashboard)

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
