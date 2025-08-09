export const formatPrice = (price) => {
    if (price >= 1) {
        return `$${price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    return `$${price.toFixed(6)}`;
};

export const formatLargeNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
};

export const formatNumber = (number) => (number ? number.toLocaleString() : "N/A");

export const formatCurrency = (number) => (number ? number.toFixed(2) : "N/A");

export const formatPercentage = (percentage, decimals = 2) => {
    if (percentage === null || percentage === undefined) return "N/A";
    return `${percentage.toFixed(decimals)}%`;
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
};

export const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
};