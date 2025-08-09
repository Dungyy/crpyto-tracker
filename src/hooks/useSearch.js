import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const useSearch = (coins) => {
    const search = useSelector(state => state.coins.search);
    const filter = useSelector(state => state.coins.filter);
    const sortBy = useSelector(state => state.coins.sortBy);
    const showFavoritesOnly = useSelector(state => state.coins.showFavoritesOnly);
    const favorites = useSelector(state => state.coins.favorites);
    const rangeFilters = useSelector(state => state.coins.rangeFilters);

    // Fuzzy search function
    const fuzzySearch = (text, searchTerm) => {
        const lowerText = text.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();

        if (lowerText.includes(lowerSearch)) return true;

        const words = lowerText.split(/\s+/);
        return words.some(word => word.startsWith(lowerSearch));
    };

    // Apply all filters
    const applyFilters = (coin) => {
        const matchesSearch = !search || search.length < 2 ||
            fuzzySearch(coin.name, search) ||
            fuzzySearch(coin.symbol, search) ||
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase());

        const matchesFavorites = showFavoritesOnly ? favorites.includes(coin.id) : true;

        const matchesBasicFilter = () => {
            switch (filter) {
                case "highPrice":
                    return coin.current_price > 50000;
                case "lowPrice":
                    return coin.current_price < 2;
                case "highVolume":
                    return coin.total_volume > 500000000;
                case "lowVolume":
                    return coin.total_volume < 10000000;
                case "highPriceChange":
                    return coin.price_change_percentage_24h > 5;
                case "lowPriceChange":
                    return coin.price_change_percentage_24h < -5;
                case "highMarketCap":
                    return coin.market_cap > 50000000000;
                case "lowMarketCap":
                    return coin.market_cap < 5000000000;
                case "highCirculatingSupply":
                    return coin.circulating_supply > 100000000;
                case "lowCirculatingSupply":
                    return coin.circulating_supply < 10000000;
                default:
                    return true;
            }
        };

        const matchesAdvancedFilters = () => {
            return (
                coin.current_price <= rangeFilters.price &&
                coin.market_cap <= rangeFilters.marketCap &&
                coin.total_volume <= rangeFilters.volume &&
                Math.abs(coin.price_change_percentage_24h) <= rangeFilters.priceChange
            );
        };

        return matchesSearch && matchesFavorites && matchesBasicFilter() && matchesAdvancedFilters();
    };

    // Sort coins
    const sortCoins = (coins) => {
        const sorted = [...coins];
        switch (sortBy) {
            case 'market_cap_desc':
                return sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
            case 'market_cap_asc':
                return sorted.sort((a, b) => (a.market_cap || 0) - (b.market_cap || 0));
            case 'price_desc':
                return sorted.sort((a, b) => b.current_price - a.current_price);
            case 'price_asc':
                return sorted.sort((a, b) => a.current_price - b.current_price);
            case 'change_desc':
                return sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
            case 'change_asc':
                return sorted.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
            case 'name_asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    };

    const filteredCoins = useMemo(() => {
        return sortCoins(coins.filter(applyFilters));
    }, [coins, search, showFavoritesOnly, filter, rangeFilters, sortBy, favorites]);

    return {
        filteredCoins,
        searchTerm: search,
        appliedFilters: {
            filter,
            sortBy,
            showFavoritesOnly,
            rangeFilters
        }
    };
};