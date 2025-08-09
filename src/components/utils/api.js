import axios from 'axios';
import { API_CONFIG } from './constants';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
});

// Request interceptor for rate limiting
api.interceptors.request.use(
    (config) => {
        // Add timestamp for rate limiting
        config.metadata = { startTime: new Date() };
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Log response time for debugging
        const duration = new Date() - response.config.metadata.startTime;
        console.log(`API call to ${response.config.url} took ${duration}ms`);
        return response;
    },
    (error) => {
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded');
        }
        return Promise.reject(error);
    }
);

export const fetchCoinsFromAPI = async (page = 1) => {
    const response = await api.get('/coins/markets', {
        params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: API_CONFIG.COINS_PER_PAGE,
            page: page,
            sparkline: false
        }
    });
    return response.data;
};

export const fetchCoinHistory = async (coinId, days = 1) => {
    const response = await api.get(`/coins/${coinId}/market_chart`, {
        params: {
            vs_currency: 'usd',
            days: days.toString(),
        }
    });
    return response.data;
};

export const searchCoinsFromAPI = async (query) => {
    const response = await api.get('/search', {
        params: { query }
    });
    return response.data;
};

export default api;