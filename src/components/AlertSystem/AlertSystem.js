import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { Info } from 'lucide-react';
import { useRefreshCooldown } from '../../hooks/useRefreshCooldown';
// import './AlertSystem.css';

const AlertSystem = ({ totalCoinsLoaded }) => {
    const [showInfoAlert, setShowInfoAlert] = useState(true);
    const [showCooldownMessage, setShowCooldownMessage] = useState(false);
    const [cooldownTimer, setCooldownTimer] = useState(0);

    const { lastRefreshTime, REFRESH_COOLDOWN, showCooldownAlert } = useRefreshCooldown();

    // Auto-hide info alert after 6 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInfoAlert(false);
        }, 6000);

        return () => clearTimeout(timer);
    }, []);

    // Handle cooldown alert display
    useEffect(() => {
        if (showCooldownAlert) {
            const remainingTime = Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000);
            setShowCooldownMessage(true);
            setCooldownTimer(remainingTime);

            // Start live countdown
            const interval = setInterval(() => {
                const newRemainingTime = Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000);
                if (newRemainingTime <= 0) {
                    setShowCooldownMessage(false);
                    setCooldownTimer(0);
                    clearInterval(interval);
                } else {
                    setCooldownTimer(newRemainingTime);
                }
            }, 1000);

            // Auto-hide after countdown completes or 6 seconds max
            setTimeout(() => {
                setShowCooldownMessage(false);
                clearInterval(interval);
            }, Math.min(remainingTime * 1000, 6000));

            return () => clearInterval(interval);
        }
    }, [showCooldownAlert, lastRefreshTime, REFRESH_COOLDOWN]);

    return (
        <div className="alert-system mb-10">
            {/* API Usage Notice */}
            {showInfoAlert && (
                <Alert
                    variant="info"
                    className="mb-3 info-alert"
                    dismissible
                    onClose={() => setShowInfoAlert(false)}
                >
                    <div className="d-flex align-items-center">
                        <Info size={16} className="me-2 flex-shrink-0" />
                        <div>
                            <strong>Efficient Search:</strong> Search works within {totalCoinsLoaded} loaded coins.
                            Load more pages to search through additional cryptocurrencies.
                        </div>
                    </div>
                </Alert>
            )}

            {/* Cooldown Message */}
            {showCooldownMessage && (
                <Alert
                    variant="warning"
                    className="mb-3 cooldown-alert"
                    dismissible
                    onClose={() => setShowCooldownMessage(false)}
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <strong>Please wait!</strong> Refresh available in{' '}
                            <strong className="countdown-timer">{cooldownTimer}</strong> seconds to prevent API rate limiting.
                        </div>
                        <div className="cooldown-progress">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${((REFRESH_COOLDOWN / 1000 - cooldownTimer) / (REFRESH_COOLDOWN / 1000)) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </Alert>
            )}
        </div>
    );
};

export default AlertSystem;