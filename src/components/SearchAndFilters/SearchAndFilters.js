import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    InputGroup,
    Form,
    Button,
    DropdownButton,
    Dropdown,
    Badge,
    Card,
    OverlayTrigger,
    Popover
} from 'react-bootstrap';
import {
    Search,
    Filter,
    Star,
    Briefcase,
    RefreshCw,
    LoaderCircle,
    AlertTriangle,
    Zap
} from 'lucide-react';
import {
    setSearch,
    setFilter,
    setSortBy,
    toggleShowFavorites,
    clearFilters,
    setRangeFilter,
    resetPagination,
    fetchCoins,
    setLastUpdated
} from '../../features/coin/coinSlice';
import { debounce } from 'lodash';
// import './SearchAndFilters.css';

const SearchAndFilters = ({
    onOpenPortfolio,
    totalCoinsLoaded,
    filteredCount,
    displayedCount
}) => {
    const dispatch = useDispatch();

    // Redux state
    const search = useSelector(state => state.coins.search);
    const filter = useSelector(state => state.coins.filter);
    const sortBy = useSelector(state => state.coins.sortBy);
    const darkMode = useSelector(state => state.coins.darkMode);
    const favorites = useSelector(state => state.coins.favorites);
    const portfolio = useSelector(state => state.coins.portfolio);
    const showFavoritesOnly = useSelector(state => state.coins.showFavoritesOnly);
    const coins = useSelector(state => state.coins.coins);
    const status = useSelector(state => state.coins.status);
    const rangeFilters = useSelector(state => state.coins.rangeFilters);
    const hasMorePages = useSelector(state => state.coins.hasMorePages);
    const loadingMore = useSelector(state => state.coins.loadingMore);
    const currentPage = useSelector(state => state.coins.currentPage);

    // Local state for UI
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

    // Refresh cooldown logic (2 minutes)
    const REFRESH_COOLDOWN = 120000; // 2 minutes
    const canRefresh = Date.now() - lastRefreshTime > REFRESH_COOLDOWN;
    const remainingTime = Math.ceil(
        (REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000
    );

    // --- TURBO cooldown config ---
    const TURBO_THRESHOLD = 500;       // after you reach 500 loaded coins
    const TURBO_COOLDOWN_MS = 120000;  // 2 minutes cooldown

    const [turboCooldownUntil, setTurboCooldownUntil] = useState(0);
    const [nowTick, setNowTick] = useState(Date.now()); // tick to update countdown display

    const canTurbo = Date.now() > turboCooldownUntil;
    const turboRemaining = Math.max(
        0,
        Math.ceil((turboCooldownUntil - Date.now()) / 1000)
    );

    // tick each second to update countdown UI
    useEffect(() => {
        const id = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Filter and sort labels
    const FILTER_LABELS = {
        all: 'All Coins',
        highPrice: 'High Price ($50k+)',
        lowPrice: 'Low Price (<$2)',
        highVolume: 'High Volume ($500M+)',
        lowVolume: 'Low Volume (<$10M)',
        highPriceChange: 'Gaining (+5%)',
        lowPriceChange: 'Losing (-5%)',
        highMarketCap: 'Large Cap ($50B+)',
        lowMarketCap: 'Small Cap (<$5B)',
        highCirculatingSupply: 'High Supply (100M+)',
        lowCirculatingSupply: 'Low Supply (<10M)',
    };

    const SORT_OPTIONS = {
        market_cap_desc: 'Market Cap ↓',
        market_cap_asc: 'Market Cap ↑',
        price_desc: 'Price ↓',
        price_asc: 'Price ↑',
        change_desc: '24h Change ↓',
        change_asc: '24h Change ↑',
        name_asc: 'Name A-Z'
    };

    // Search handling with suggestions
    const generateSearchSuggestions = useCallback((value) => {
        if (value.length >= 2 && coins.length > 0) {
            const lowerValue = value.toLowerCase();
            const suggestions = coins
                .filter(coin => {
                    const nameMatch = coin.name.toLowerCase().includes(lowerValue);
                    const symbolMatch = coin.symbol.toLowerCase().includes(lowerValue);
                    return nameMatch || symbolMatch;
                })
                .sort((a, b) => {
                    const aSymbolMatch = a.symbol.toLowerCase().startsWith(lowerValue);
                    const bSymbolMatch = b.symbol.toLowerCase().startsWith(lowerValue);
                    if (aSymbolMatch && !bSymbolMatch) return -1;
                    if (!aSymbolMatch && bSymbolMatch) return 1;
                    return (b.market_cap || 0) - (a.market_cap || 0);
                })
                .slice(0, 6)
                .map(coin => ({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    image: coin.image,
                    price: coin.current_price
                }));
            setSearchSuggestions(suggestions);
        } else {
            setSearchSuggestions([]);
        }
    }, [coins]);

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        dispatch(setSearch(value));
        generateSearchSuggestions(value);
    }, [dispatch, generateSearchSuggestions]);

    const handleSuggestionClick = useCallback((suggestion) => {
        dispatch(setSearch(suggestion.name));
        setSearchSuggestions([]);
    }, [dispatch]);

    const clearSearch = useCallback(() => {
        dispatch(setSearch(''));
        setSearchSuggestions([]);
    }, [dispatch]);

    // Filter handling
    const handleFilterChange = debounce((filterValue) => {
        dispatch(setFilter(filterValue));
    }, 300);

    const handleFilterSelect = (filterValue) => {
        handleFilterChange(filterValue);
    };

    const handleSortSelect = (sortValue) => {
        dispatch(setSortBy(sortValue));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const handleToggleFavorites = useCallback(() => {
        dispatch(toggleShowFavorites());
    }, [dispatch]);

    // Refresh (single page reload) handling
    const handleRefresh = useCallback(async () => {
        if (!canRefresh) {
            console.log(`Please wait ${remainingTime} seconds before refreshing again`);
            return;
        }

        try {
            setRefreshing(true);
            setLastRefreshTime(Date.now());

            dispatch(resetPagination());
            await dispatch(fetchCoins({ page: 1, append: false })).unwrap();
            dispatch(setLastUpdated());

            console.log('Data refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setRefreshing(false);
        }
    }, [canRefresh, remainingTime, dispatch]);

    // 🚀 TURBO SEARCH - Load multiple pages at once
    const handleTurboSearch = useCallback(async (pages) => {
        if (!hasMorePages || loadingMore || refreshing || !canTurbo) return;

        try {
            setRefreshing(true);

            const promises = [];
            for (let i = 1; i <= pages; i++) {
                if (currentPage + i <= 50) {
                    promises.push(
                        dispatch(fetchCoins({ page: currentPage + i, append: true })).unwrap()
                    );
                }
            }

            await Promise.all(promises);

            // Estimate total after turbo; adjust if your API page size != 100
            const estimatedLoaded = totalCoinsLoaded + (pages * 100);
            if (estimatedLoaded >= TURBO_THRESHOLD) {
                setTurboCooldownUntil(Date.now() + TURBO_COOLDOWN_MS);
            }

            console.log(`🚀 Turbo loaded ${pages} pages - Total coins: ~${estimatedLoaded}`);
        } catch (error) {
            console.error('Failed to turbo load coins:', error);
        } finally {
            setRefreshing(false);
        }
    }, [
        hasMorePages,
        loadingMore,
        refreshing,
        currentPage,
        dispatch,
        totalCoinsLoaded,
        canTurbo
    ]);

    // Turbo popover content
    const turboPopover = (
        <Popover id="turbo-popover" className={darkMode ? 'bg-dark text-light' : ''}>
            <Popover.Header as="h6" className={darkMode ? 'bg-dark text-light' : ''}>
                <div className="d-flex align-items-center">
                    <AlertTriangle size={16} className="me-2" />
                    Heads up
                </div>
            </Popover.Header>
            <Popover.Body className={darkMode ? 'bg-dark text-light' : ''}>
                Turbo fires multiple requests quickly and may hit API rate limits.
                {canTurbo ? (
                    <div className="mt-2 small text-muted">
                        A cooldown will start once you’ve loaded {TURBO_THRESHOLD.toLocaleString()}+ coins.
                    </div>
                ) : (
                    <div className="mt-2 small">
                        Cooling down… try again in <strong>{turboRemaining}s</strong>.
                    </div>
                )}
            </Popover.Body>
        </Popover>
    );

    const turboLabel = canTurbo
        ? 'Turbo: Load 100+ coins'
        : `Turbo cooling down… ${turboRemaining}s`;

    return (
        <div className="search-and-filters">
            {/* Search Bar Row */}
            <Row className="search-row mb-3">
                <Col md={6}>
                    <div className="mb-3 search-container position-relative">
                        <InputGroup>
                            <InputGroup.Text>
                                <Search size={16} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder={`Search within ${totalCoinsLoaded} loaded coins...`}
                                value={search}
                                onChange={handleSearchChange}
                                onBlur={() => setTimeout(() => setSearchSuggestions([]), 200)}
                            />
                            {search && (
                                <Button
                                    variant={darkMode ? 'outline-light' : 'outline-dark'}
                                    onClick={clearSearch}
                                >
                                    ✕
                                </Button>
                            )}
                            <Button
                                variant={canRefresh ? (darkMode ? 'outline-light' : 'outline-dark') : 'secondary'}
                                onClick={handleRefresh}
                                disabled={refreshing || status === 'loading' || !canRefresh}
                                title={canRefresh ? 'Refresh data' : 'Refresh cooling down...'}
                            >
                                {refreshing ? <LoaderCircle size={16} /> : <RefreshCw size={16} />}
                            </Button>
                        </InputGroup>

                        {/* Search Suggestions */}
                        {searchSuggestions.length > 0 && (
                            <Card
                                className={`search-suggestions position-absolute w-100 mt-1 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'
                                    }`}
                            >
                                <Card.Body className="p-2">
                                    <small className="text-muted">Quick matches:</small>
                                    {searchSuggestions.map(suggestion => (
                                        <div
                                            key={suggestion.id}
                                            className="suggestion-item d-flex align-items-center p-2 rounded"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            role="button"
                                        >
                                            <img
                                                src={suggestion.image}
                                                width="20"
                                                height="20"
                                                className="me-2 rounded-circle"
                                                alt={suggestion.name}
                                            />
                                            <span>{suggestion.name} ({suggestion.symbol})</span>
                                        </div>
                                    ))}
                                    {filteredCount > 5 && (
                                        <small className="text-muted">
                                            +{filteredCount - 5} more results
                                        </small>
                                    )}
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </Col>

                <Col md={6}>
                    <div className="action-buttons d-flex gap-2 justify-content-end">
                        {/* TURBO button with hover popover + cooldown */}
                        <OverlayTrigger placement="bottom" trigger={['hover', 'focus']} overlay={turboPopover}>
                            <span className="d-inline-block">
                                <Button
                                    variant={darkMode ? 'outline-light' : 'outline-dark'}
                                    onClick={() => handleTurboSearch(1)} // adjust pages as needed
                                    disabled={!canTurbo || loadingMore || refreshing}
                                    size="sm"
                                    style={{ pointerEvents: 'auto' }} // keep popover working when disabled
                                >
                                    <Zap size={16} className="me-1" />
                                    {turboLabel}
                                </Button>
                            </span>
                        </OverlayTrigger>

                        <Button
                            variant={showFavoritesOnly ? 'warning' : 'outline-warning'}
                            onClick={handleToggleFavorites}
                            size="sm"
                        >
                            <Star size={16} className="me-1" />
                            Favorites
                            {favorites.length > 0 && (
                                <Badge bg="secondary" className="ms-1">{favorites.length}</Badge>
                            )}
                        </Button>

                        <Button
                            variant="outline-primary"
                            onClick={onOpenPortfolio}
                            size="sm"
                        >
                            <Briefcase size={16} className="me-1" />
                            Portfolio
                            {portfolio.length > 0 && (
                                <Badge bg="secondary" className="ms-1">{portfolio.length}</Badge>
                            )}
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Filters and Sort Row */}
            <Row className="filters-row mb-3">
                <Col md={8}>
                    <div className="filter-controls d-flex gap-2 align-items-center">
                        {/* Filter Dropdown */}
                        <DropdownButton
                            title={
                                <>
                                    <Filter size={16} className="me-1" />
                                    {FILTER_LABELS[filter]}
                                </>
                            }
                            onSelect={handleFilterSelect}
                            variant={darkMode ? 'dark' : 'light'}
                            size="sm"
                        >
                            <Dropdown.Item eventKey="all">All Coins</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Price Filters</Dropdown.Header>
                            <Dropdown.Item eventKey="highPrice">High Price ($50k+)</Dropdown.Item>
                            <Dropdown.Item eventKey="lowPrice">Low Price (&lt;$2)</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Volume Filters</Dropdown.Header>
                            <Dropdown.Item eventKey="highVolume">High Volume ($500M+)</Dropdown.Item>
                            <Dropdown.Item eventKey="lowVolume">Low Volume (&lt;$10M)</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Performance</Dropdown.Header>
                            <Dropdown.Item eventKey="highPriceChange">Gainers (+5%)</Dropdown.Item>
                            <Dropdown.Item eventKey="lowPriceChange">Losers (-5%)</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Market Cap</Dropdown.Header>
                            <Dropdown.Item eventKey="highMarketCap">Large Cap ($50B+)</Dropdown.Item>
                            <Dropdown.Item eventKey="lowMarketCap">Small Cap (&lt;$5B)</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Header>Advanced Filters</Dropdown.Header>
                            <Dropdown.ItemText>
                                <RangeSlider label="Max Price ($)" type="price" min={0} max={100000} step={100} />
                                <RangeSlider label="Max Market Cap ($)" type="marketCap" min={0} max={1000000000000} step={1000000000} />
                                <RangeSlider label="Max Volume ($)" type="volume" min={0} max={10000000000} step={10000000} />
                                <RangeSlider label="Max Price Change %" type="priceChange" min={0} max={100} step={0.1} />
                            </Dropdown.ItemText>
                        </DropdownButton>

                        {/* Sort Dropdown */}
                        <DropdownButton
                            title={SORT_OPTIONS[sortBy]}
                            onSelect={handleSortSelect}
                            variant={darkMode ? 'outline-light' : 'outline-dark'}
                            size="sm"
                        >
                            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                                <Dropdown.Item key={key} eventKey={key}>
                                    {label}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>

                        {/* Clear Filters */}
                        {(filter !== 'all' || showFavoritesOnly) && (
                            <Button
                                variant="outline-danger"
                                onClick={handleClearFilters}
                                size="sm"
                                className="clear-filters-btn"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Col>

                <Col lg={3} md={4}>
                    <div className="results-info text-end">
                        <small className={`text-muted ${darkMode ? 'text-light' : ''}`}>
                            <strong>{displayedCount.toLocaleString()}</strong> of{' '}
                            <strong>{filteredCount.toLocaleString()}</strong> coins
                            <div className="d-block d-md-inline ms-md-2">
                                ({totalCoinsLoaded.toLocaleString()} total loaded)
                            </div>
                        </small>
                        {!canTurbo && (
                            <div className="small text-muted mt-1">
                                Turbo cooldown: {turboRemaining}s
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// Range slider subcomponent
const RangeSlider = ({ label, type, min, max, step }) => {
    const dispatch = useDispatch();
    const valueFromStore = useSelector(state => state.coins.rangeFilters[type]);
    const [inputValue, setInputValue] = useState(valueFromStore);

    const debouncedDispatch = useCallback(
        debounce((value) => {
            dispatch(setRangeFilter({ filterType: type, value }));
        }, 1000),
        [dispatch, type]
    );

    useEffect(() => {
        return () => {
            debouncedDispatch.cancel();
        };
    }, [debouncedDispatch]);

    useEffect(() => {
        setInputValue(valueFromStore);
    }, [valueFromStore]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value === '' || isNaN(value)) return;
        const numValue = Number(value);
        if (numValue >= min && numValue <= max) {
            debouncedDispatch(numValue);
        }
    };

    const handleSliderChange = (e) => {
        const value = Number(e.target.value);
        setInputValue(value);
        dispatch(setRangeFilter({ filterType: type, value }));
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <div className="d-flex align-items-center">
                <Form.Control
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    step={step}
                    style={{ width: '100px' }}
                />
                <Form.Range
                    min={min}
                    max={max}
                    step={step}
                    value={Number(inputValue) || 0}
                    onChange={handleSliderChange}
                    className="mx-2 flex-grow-1"
                />
            </div>
        </Form.Group>
    );
};

export default SearchAndFilters;
