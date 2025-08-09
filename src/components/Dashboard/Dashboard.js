import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import {
    setDisplayCount,
    fetchCoins,
} from '../../features/coin/coinSlice';
import { useCryptoData } from '../../hooks/useCryptoData';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSearch } from '../../hooks/useSearch';

import AlertSystem from '../AlertSystem/AlertSystem';
import SearchAndFilters from '../SearchAndFilters/SearchAndFilters';
import CoinCard from '../CoinCard/CoinCard';
import CoinModal from '../CoinModal';
import PortfolioManager from '../PortfolioManager/PortfolioManager';
// import './Dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();

    // Redux state
    const coins = useSelector(state => state.coins.coins);
    const displayCount = useSelector(state => state.coins.displayCount);
    const status = useSelector(state => state.coins.status);
    const darkMode = useSelector(state => state.coins.darkMode);
    const currentPage = useSelector(state => state.coins.currentPage);
    const hasMorePages = useSelector(state => state.coins.hasMorePages);
    const loadingMore = useSelector(state => state.coins.loadingMore);
    const totalCoinsLoaded = useSelector(state => state.coins.totalCoinsLoaded);

    // Local state
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [showPortfolio, setShowPortfolio] = useState(false);

    // Custom hooks
    const { filteredCoins } = useSearch(coins);
    const { portfolioValue, portfolioPnL } = usePortfolio();
    const { } = useCryptoData(); // Handles auto-refresh and API management

    // Memoized computed values
    const coinsToDisplay = useMemo(() =>
        filteredCoins.slice(0, displayCount),
        [filteredCoins, displayCount]
    );

    // Event handlers
    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
    };

    const handleLoadMore = () => {
        dispatch(setDisplayCount(displayCount + 20));
    };

    const handleLoadMorePages = async () => {
        if (hasMorePages && !loadingMore) {
            await dispatch(fetchCoins({ page: currentPage + 1, append: true }));
        }
    };

    const handleCloseModal = () => {
        setSelectedCoin(null);
    };

    const handleOpenPortfolio = () => {
        setShowPortfolio(true);
    };

    const handleClosePortfolio = () => {
        setShowPortfolio(false);
    };

    return (
        <div className="dashboard mt-10">
            <Container>
                {/* Alert System */}
                <AlertSystem totalCoinsLoaded={totalCoinsLoaded} />

                {/* Header with Portfolio Summary */}
                <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-4">
                    <div className="header-content">
                        <div className="title-section">
                            <h1 className="dashboard-title">Dingy Crypto Tracker</h1>
                            <small className="text-muted mt-5">
                                Real-time cryptocurrency tracking and portfolio management
                            </small>
                        </div>

                        {portfolioValue > 0 && (
                            <div className="portfolio-summary">
                                <div className="portfolio-value">
                                    Portfolio Value: ${portfolioValue.toLocaleString()}
                                </div>
                                <div className={`portfolio-pnl ${portfolioPnL >= 0 ? 'positive' : 'negative'}`}>
                                    P&L: ${portfolioPnL.toFixed(2)}
                                    ({((portfolioPnL / (portfolioValue - portfolioPnL)) * 100).toFixed(2)}%)
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search and Filters Section */}
                <SearchAndFilters
                    onOpenPortfolio={handleOpenPortfolio}
                    totalCoinsLoaded={totalCoinsLoaded}
                    filteredCount={filteredCoins.length}
                    displayedCount={coinsToDisplay.length}
                />

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="loading-container d-flex flex-column align-items-center justify-content-center">
                        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
                        <p className="loading-text">Loading cryptocurrency data...</p>
                    </div>
                )}

                {/* Error State */}
                {status === 'failed' && (
                    <div className="error-container">
                        <p className="error-message">
                            Failed to load cryptocurrency data. Please try refreshing the page.
                        </p>
                    </div>
                )}

                {/* Coins Grid */}
                {status === 'succeeded' && (
                    <>
                        {coinsToDisplay.length > 0 ? (
                            <Row className="coins-grid">
                                {coinsToDisplay.map((coin) => (
                                    <Col key={coin.id} sm={6} md={4} lg={3} className="coin-col">
                                        <CoinCard
                                            coin={coin}
                                            onClick={() => handleCoinClick(coin)}
                                            darkMode={darkMode}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="no-results">
                                <p>No cryptocurrencies found matching your criteria.</p>
                                <p>Try adjusting your filters or loading more pages.</p>
                            </div>
                        )}

                        {/* Load More Controls */}
                        <div className="load-more-controls d-flex flex-column align-items-center my-4">
                            {/* Load More from Current Data */}
                            {displayCount < filteredCoins.length && coinsToDisplay.length > 0 && (
                                <Button
                                    className="load-more-btn"
                                    onClick={handleLoadMore}
                                    variant={darkMode ? "outline-light" : "outline-dark"}
                                    size="lg"
                                >
                                    Load More ({filteredCoins.length - displayCount} remaining)
                                </Button>
                            )}

                            {/* Load More Pages */}
                            {displayCount >= filteredCoins.length && hasMorePages && (
                                <Button
                                    className="load-more-pages-btn"
                                    onClick={handleLoadMorePages}
                                    variant="primary"
                                    size="lg"
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Loading More Coins...
                                        </>
                                    ) : (
                                        <>
                                            Load More Cryptocurrencies
                                            <small className="d-block">
                                                Currently showing {totalCoinsLoaded} coins • More coins = Better search
                                            </small>
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* End of Data Message */}
                            {!hasMorePages && totalCoinsLoaded > 100 && (
                                <div className="end-message">
                                    <small className="text-muted">
                                        You've reached the end! {totalCoinsLoaded} cryptocurrencies loaded.
                                    </small>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Modals */}
                <CoinModal
                    coin={selectedCoin}
                    show={!!selectedCoin}
                    onClose={handleCloseModal}
                    darkMode={darkMode}
                />

                <PortfolioManager
                    show={showPortfolio}
                    onClose={handleClosePortfolio}
                    darkMode={darkMode}
                />
            </Container>
        </div>
    );
};

export default Dashboard;