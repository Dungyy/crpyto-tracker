import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// FREE API lolz
const CoinURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false";

export const fetchCoins = createAsyncThunk("coins/fetchCoins", async () => {
  const response = await axios.get(CoinURL);
  return response.data;
});

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const serializedState = localStorage.getItem('cryptoTrackerState');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {};
  }
};

const initialRangeFilters = {
  price: 10000000,
  marketCap: 2000000000000,
  volume: 500000000000,
  priceChange: 100,
};

const persistedState = loadPersistedState();

export const coinSlice = createSlice({
  name: "coins",
  initialState: {
    coins: [],
    status: "idle",
    error: null,
    search: "",
    displayCount: 52,
    filter: 'all',
    darkMode: persistedState.darkMode ?? false,
    rangeFilters: persistedState.rangeFilters ?? initialRangeFilters,
    favorites: persistedState.favorites ?? [],
    portfolio: persistedState.portfolio ?? [], // { coinId, symbol, amount, purchasePrice, purchaseDate }
    showFavoritesOnly: false,
    sortBy: 'market_cap_desc', // market_cap_desc, price_desc, price_asc, change_desc, change_asc
    notifications: persistedState.notifications ?? [], // { coinId, targetPrice, type: 'above'|'below', enabled }
    lastUpdated: null,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setDisplayCount: (state, action) => {
      state.displayCount = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setRangeFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.rangeFilters[filterType] = Number(value);
    },
    clearFilters: (state) => {
      state.filter = 'all';
      state.rangeFilters = initialRangeFilters;
      state.showFavoritesOnly = false;
    },

    // Favorites functionality
    toggleFavorite: (state, action) => {
      const coinId = action.payload;
      const index = state.favorites.indexOf(coinId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(coinId);
      }
    },
    toggleShowFavorites: (state) => {
      state.showFavoritesOnly = !state.showFavoritesOnly;
    },

    // Portfolio functionality
    addToPortfolio: (state, action) => {
      const { coinId, symbol, amount, purchasePrice } = action.payload;
      const existingIndex = state.portfolio.findIndex(item => item.coinId === coinId);

      if (existingIndex > -1) {
        // Update existing holding
        const existing = state.portfolio[existingIndex];
        const totalValue = (existing.amount * existing.purchasePrice) + (amount * purchasePrice);
        const totalAmount = existing.amount + amount;
        existing.amount = totalAmount;
        existing.purchasePrice = totalValue / totalAmount; // Average price
      } else {
        // Add new holding
        state.portfolio.push({
          coinId,
          symbol,
          amount: Number(amount),
          purchasePrice: Number(purchasePrice),
          purchaseDate: new Date().toISOString(),
        });
      }
    },
    removeFromPortfolio: (state, action) => {
      const coinId = action.payload;
      state.portfolio = state.portfolio.filter(item => item.coinId !== coinId);
    },
    updatePortfolioAmount: (state, action) => {
      const { coinId, amount } = action.payload;
      const item = state.portfolio.find(item => item.coinId === coinId);
      if (item) {
        item.amount = Number(amount);
      }
    },

    // Sorting functionality
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // Price alerts functionality
    addPriceAlert: (state, action) => {
      const { coinId, targetPrice, type } = action.payload;
      state.notifications.push({
        id: Date.now().toString(),
        coinId,
        targetPrice: Number(targetPrice),
        type, // 'above' or 'below'
        enabled: true,
        created: new Date().toISOString(),
      });
    },
    removePriceAlert: (state, action) => {
      const alertId = action.payload;
      state.notifications = state.notifications.filter(alert => alert.id !== alertId);
    },
    togglePriceAlert: (state, action) => {
      const alertId = action.payload;
      const alert = state.notifications.find(alert => alert.id === alertId);
      if (alert) {
        alert.enabled = !alert.enabled;
      }
    },

    // Update last refresh time
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coins = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  setSearch,
  setDisplayCount,
  setFilter,
  toggleDarkMode,
  setRangeFilter,
  clearFilters,
  toggleFavorite,
  toggleShowFavorites,
  addToPortfolio,
  removeFromPortfolio,
  updatePortfolioAmount,
  setSortBy,
  addPriceAlert,
  removePriceAlert,
  togglePriceAlert,
  setLastUpdated,
} = coinSlice.actions;

export default coinSlice.reducer;

// Middleware to persist certain state to localStorage
export const persistStateMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only persist on certain actions
  const persistActions = [
    'coins/toggleDarkMode',
    'coins/setRangeFilter',
    'coins/toggleFavorite',
    'coins/addToPortfolio',
    'coins/removeFromPortfolio',
    'coins/updatePortfolioAmount',
    'coins/addPriceAlert',
    'coins/removePriceAlert',
    'coins/togglePriceAlert',
  ];

  if (persistActions.some(actionType => action.type === actionType)) {
    const state = store.getState();
    const persistedData = {
      darkMode: state.coins.darkMode,
      rangeFilters: state.coins.rangeFilters,
      favorites: state.coins.favorites,
      portfolio: state.coins.portfolio,
      notifications: state.coins.notifications,
    };

    try {
      localStorage.setItem('cryptoTrackerState', JSON.stringify(persistedData));
    } catch (err) {
      console.warn('Could not save state to localStorage:', err);
    }
  }

  return result;
};