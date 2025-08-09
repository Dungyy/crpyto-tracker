import { useState, useCallback } from 'react';

export const useRefreshCooldown = () => {
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [showCooldownAlert, setShowCooldownAlert] = useState(false);

    const REFRESH_COOLDOWN = 120000; // 2 minutes

    const canRefresh = Date.now() - lastRefreshTime > REFRESH_COOLDOWN;

    const handleRefreshAttempt = useCallback(() => {
        if (!canRefresh) {
            setShowCooldownAlert(true);
            // Auto-hide alert trigger after showing
            setTimeout(() => setShowCooldownAlert(false), 100);
            return false;
        }

        setLastRefreshTime(Date.now());
        return true;
    }, [canRefresh, lastRefreshTime]);

    const getRemainingTime = useCallback(() => {
        return Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000);
    }, [lastRefreshTime]);

    return {
        canRefresh,
        handleRefreshAttempt,
        getRemainingTime,
        lastRefreshTime,
        setLastRefreshTime,
        REFRESH_COOLDOWN,
        showCooldownAlert
    };
};