import { configureStore } from '@reduxjs/toolkit';
import coinReducer, { persistStateMiddleware } from './features/coin/coinSlice';

export default configureStore({
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