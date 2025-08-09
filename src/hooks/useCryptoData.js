import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoins, setLastUpdated } from '../features/coin/coinSlice';

export const useCryptoData = () => {
    const dispatch = useDispatch();
    const status = useSelector(state => state.coins.status);
    const coins = useSelector(state => state.coins.coins);

    useEffect(() => {
        // Initial data fetch
        dispatch(fetchCoins());

        // Auto-refresh every 15 minutes
        const interval = setInterval(() => {
            dispatch(fetchCoins({ page: 1, append: false }));
            dispatch(setLastUpdated());
        }, 900000); // 15 minutes

        return () => clearInterval(interval);
    }, [dispatch]);

    return {
        status,
        coins,
        isLoading: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded'
    };
};