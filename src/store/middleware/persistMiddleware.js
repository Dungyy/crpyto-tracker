import { saveToLocalStorage } from '../../components/utils/storage';

export const persistStateMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Actions that should trigger persistence
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

        saveToLocalStorage('cryptoTrackerState', persistedData);
    }

    return result;
};