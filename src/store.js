// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import coinReducer from './features/coin/coinSlice';
import { persistStateMiddleware } from './store/middleware/persistMiddleware';

const store = configureStore({
  reducer: {
    coins: coinReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(persistStateMiddleware),
});

export default store;