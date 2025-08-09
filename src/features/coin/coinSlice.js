import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCoinsFromAPI } from "../../components/utils/api";
import { loadFromLocalStorage } from "../../components/utils/storage";
import { RANGE_FILTER_DEFAULTS } from "../../components/utils/constants";

// Async thunk for fetching coins
export const fetchCoins = createAsyncThunk(
  "coins/fetchCoins",
  async ({ page = 1, append = false } = {}) => {
    const data = await fetchCoinsFromAPI(page);
    return { data, page, append };
  }
);

// Load persisted state from localStorage
const loadPersistedState = () => {
  return loadFromLocalStorage('cryptoTrackerState', {});
};

const persistedState = loadPersistedState();

const initialState = {
  // Core data
  coins: [],
  status: "idle", // idle, loading, succeeded, failed
  error: null,
  lastUpdated: null,

  // Pagination
  currentPage: 1,
  hasMorePages: true,
  loadingMore: false,
  totalCoinsLoaded: 0,

  // UI state
  search: "",
  displayCount: 52,
  filter: 'all',
  sortBy: 'market_cap_desc',
  darkMode: persistedState.darkMode ?? true,

  // Filters
  rangeFilters: persistedState.rangeFilters ?? RANGE_FILTER_DEFAULTS,
  showFavoritesOnly: false,

  // User data
  favorites: persistedState.favorites ?? [],
  portfolio: persistedState.portfolio ?? [],
  notifications: persistedState.notifications ?? [],
};

export const coinSlice = createSlice({
  name: "coins",
  initialState,
  reducers: {
    // Search and display
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setDisplayCount: (state, action) => {
      state.displayCount = action.payload;
    },

    // Filters and sorting
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setRangeFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.rangeFilters[filterType] = Number(value);
    },
    clearFilters: (state) => {
      state.filter = 'all';
      state.rangeFilters = RANGE_FILTER_DEFAULTS;
      state.showFavoritesOnly = false;
    },

    // UI state
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },

    // Pagination
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMorePages = true;
      state.coins = [];
      state.totalCoinsLoaded = 0;
    },

    // Favorites
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

    // Portfolio management
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

    // Price alerts
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

        // Check if we have more pages
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

// Export actions
export const {
  setSearch,
  setDisplayCount,
  setFilter,
  setSortBy,
  setRangeFilter,
  clearFilters,
  toggleDarkMode,
  setLastUpdated,
  resetPagination,
  toggleFavorite,
  toggleShowFavorites,
  addToPortfolio,
  removeFromPortfolio,
  updatePortfolioAmount,
  addPriceAlert,
  removePriceAlert,
  togglePriceAlert,
} = coinSlice.actions;

export default coinSlice.reducer;