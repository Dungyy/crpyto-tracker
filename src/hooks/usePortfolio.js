import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const usePortfolio = () => {
    const portfolio = useSelector(state => state.coins.portfolio);
    const coins = useSelector(state => state.coins.coins);

    const portfolioValue = useMemo(() => {
        return portfolio.reduce((total, holding) => {
            const coin = coins.find(c => c.id === holding.coinId);
            if (coin) {
                return total + (coin.current_price * holding.amount);
            }
            return total;
        }, 0);
    }, [portfolio, coins]);

    const portfolioPnL = useMemo(() => {
        return portfolio.reduce((total, holding) => {
            const coin = coins.find(c => c.id === holding.coinId);
            if (coin) {
                const currentValue = coin.current_price * holding.amount;
                const purchaseValue = holding.purchasePrice * holding.amount;
                return total + (currentValue - purchaseValue);
            }
            return total;
        }, 0);
    }, [portfolio, coins]);

    const portfolioPercentage = useMemo(() => {
        const totalInvested = portfolioValue - portfolioPnL;
        return totalInvested > 0 ? (portfolioPnL / totalInvested) * 100 : 0;
    }, [portfolioValue, portfolioPnL]);

    const topPerformers = useMemo(() => {
        return portfolio
            .map(holding => {
                const coin = coins.find(c => c.id === holding.coinId);
                if (!coin) return null;

                const currentValue = coin.current_price * holding.amount;
                const purchaseValue = holding.purchasePrice * holding.amount;
                const pnl = currentValue - purchaseValue;
                const pnlPercentage = purchaseValue > 0 ? (pnl / purchaseValue) * 100 : 0;

                return {
                    ...holding,
                    coin,
                    currentValue,
                    purchaseValue,
                    pnl,
                    pnlPercentage
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.pnlPercentage - a.pnlPercentage);
    }, [portfolio, coins]);

    return {
        portfolio,
        portfolioValue,
        portfolioPnL,
        portfolioPercentage,
        topPerformers,
        hasPortfolio: portfolio.length > 0
    };
};