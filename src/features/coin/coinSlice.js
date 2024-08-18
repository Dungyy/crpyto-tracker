import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CoinURL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false";

export const fetchCoins = createAsyncThunk("coins/fetchCoins", async () => {
  const response = await axios.get(CoinURL);
  return response.data;
});

export const coinSlice = createSlice({
  name: "coins",
  initialState: {
    coins: [],
    status: "idle",
    error: null,
    search: "",
    displayCount: 52,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setDisplayCount: (state, action) => {
      state.displayCount = action.payload;
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

export const { setSearch, setDisplayCount } = coinSlice.actions;

export default coinSlice.reducer;
