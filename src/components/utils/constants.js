export const FILTER_LABELS = {
    all: "All Coins",
    highPrice: "High Price ($50k+)",
    lowPrice: "Low Price (<$2)",
    highVolume: "High Volume ($500M+)",
    lowVolume: "Low Volume (<$10M)",
    highPriceChange: "Gaining (+5%)",
    lowPriceChange: "Losing (-5%)",
    highMarketCap: "Large Cap ($50B+)",
    lowMarketCap: "Small Cap (<$5B)",
    highCirculatingSupply: "High Supply (100M+)",
    lowCirculatingSupply: "Low Supply (<10M)",
};

export const SORT_OPTIONS = {
    market_cap_desc: "Market Cap ↓",
    market_cap_asc: "Market Cap ↑",
    price_desc: "Price ↓",
    price_asc: "Price ↑",
    change_desc: "24h Change ↓",
    change_asc: "24h Change ↑",
    name_asc: "Name A-Z"
};

export const API_CONFIG = {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    COINS_PER_PAGE: 100,
    REFRESH_INTERVAL: 900000, // 15 minutes
    REFRESH_COOLDOWN: 120000, // 2 minutes
    SEARCH_DEBOUNCE: 800,
    FILTER_DEBOUNCE: 300
};

export const RANGE_FILTER_DEFAULTS = {
    price: 10000000,
    marketCap: 2000000000000,
    volume: 500000000000,
    priceChange: 100,
};

export const THEME_COLORS = {
    light: {
        bg: '#ffffff',
        bgSecondary: '#f8f9fa',
        text: '#212529',
        textMuted: '#6c757d',
        border: '#dee2e6',
        shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        bg: '#1a1a1a',
        bgSecondary: '#2d3748',
        text: '#ffffff',
        textMuted: '#a0aec0',
        border: '#4a5568',
        shadow: 'rgba(255, 255, 255, 0.1)',
    }
};