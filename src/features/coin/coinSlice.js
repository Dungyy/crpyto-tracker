import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Updated to support pagination
export const fetchCoins = createAsyncThunk(
  "coins/fetchCoins",
  async ({ page = 1, append = false } = {}) => {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100, // Load 100 coins per page
        page: page,
        sparkline: false
      }
    });
    return { data: response.data, page, append };
  }
);

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
    darkMode: persistedState.darkMode ?? true,
    rangeFilters: persistedState.rangeFilters ?? initialRangeFilters,
    favorites: persistedState.favorites ?? [],
    portfolio: persistedState.portfolio ?? [],
    showFavoritesOnly: false,
    sortBy: 'market_cap_desc',
    notifications: persistedState.notifications ?? [],
    lastUpdated: null,
    // Pagination state
    currentPage: 1,
    hasMorePages: true,
    loadingMore: false,
    totalCoinsLoaded: 0,
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

    // Reset pagination when refreshing
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMorePages = true;
      state.coins = [];
      state.totalCoinsLoaded = 0;
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
        const existing = state.portfolio[existingIndex];
        const totalValue = (existing.amount * existing.purchasePrice) + (amount * purchasePrice);
        const totalAmount = existing.amount + amount;
        existing.amount = totalAmount;
        existing.purchasePrice = totalValue / totalAmount;
      } else {
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
        type,
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

    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state, action) => {
        const { append } = action.meta.arg || {};
        if (append) {
          state.loadingMore = true;
        } else {
          state.status = "loading";
        }
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        const { data, page, append } = action.payload;

        if (append) {
          // Append new coins to existing list
          state.coins = [...state.coins, ...data];
          state.loadingMore = false;
        } else {
          // Replace coins (for refresh)
          state.coins = data;
          state.status = "succeeded";
        }

        state.currentPage = page;
        state.totalCoinsLoaded = state.coins.length;
        state.lastUpdated = new Date().toISOString();

        // Check if we have more pages (CoinGecko has thousands of coins)
        // If we got less than 100 coins, we've reached the end
        state.hasMorePages = data.length === 100;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        const { append } = action.meta.arg || {};
        if (append) {
          state.loadingMore = false;
        } else {
          state.status = "failed";
        }
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
  resetPagination,
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