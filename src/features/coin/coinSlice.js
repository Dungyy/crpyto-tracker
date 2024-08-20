import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CoinURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false";

export const fetchCoins = createAsyncThunk("coins/fetchCoins", async () => {
  if (process.env.REACT_APP_ENV === 'development') {
    return require('../../components/mockData/mockData.json');
  }
  const response = await axios.get(CoinURL);
  return response.data;
});

const initialRangeFilters = {
  price: 50000,
  marketCap: 500000000000,
  volume: 5000000000,
  priceChange: 50,
};

export const coinSlice = createSlice({
  name: "coins",
  initialState: {
    coins: [],
    status: "idle",
    error: null,
    search: "",
    displayCount: 52,
    filter: 'all',
    darkMode: true,
    rangeFilters: initialRangeFilters,
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
  clearFilters
} = coinSlice.actions;

export default coinSlice.reducer;