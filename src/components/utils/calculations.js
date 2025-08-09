export const calculatePortfolioValue = (portfolio, coins) => {
    return portfolio.reduce((total, holding) => {
        const coin = coins.find(c => c.id === holding.coinId);
        if (coin) {
            return total + (coin.current_price * holding.amount);
        }
        return total;
    }, 0);
};

export const calculatePortfolioPnL = (portfolio, coins) => {
    return portfolio.reduce((total, holding) => {
        const coin = coins.find(c => c.id === holding.coinId);
        if (coin) {
            const currentValue = coin.current_price * holding.amount;
            const purchaseValue = holding.purchasePrice * holding.amount;
            return total + (currentValue - purchaseValue);
        }
        return total;
    }, 0);
};

export const calculateHoldingStats = (holding, coin) => {
    if (!coin) return null;

    const currentValue = coin.current_price * holding.amount;
    const investedValue = holding.purchasePrice * holding.amount;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
        currentValue,
        investedValue,
        pnl,
        pnlPercentage,
        currentPrice: coin.current_price
    };
};

export const getPriceChangeColor = (change) => {
    if (change > 0) return "success";
    if (change < 0) return "danger";
    return "secondary";
};

export const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};