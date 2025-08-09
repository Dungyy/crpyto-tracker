import { useState, useCallback, useEffect } from 'react';
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
    Card
} from 'react-bootstrap';
import {
    Search,
    Filter,
    Star,
    Briefcase,
    RefreshCw,
    LoaderCircle
} from 'lucide-react';
import {
    setSearch,
    setFilter,
    setSortBy,
    toggleShowFavorites,
    clearFilters,
    setRangeFilter,
    resetPagination,
    fetchCoins
} from '../../features/coin/coinSlice';
import { useRefreshCooldown } from '../../hooks/useRefreshCooldown';
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

    // Local state
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Custom hooks
    const { canRefresh, handleRefreshAttempt } = useRefreshCooldown();

    // Filter and sort options
    const filterLabels = {
        all: "All Coins",
        highPrice: "High Price ($50k+)",
        lowPrice: "Low Price (<$2)",
        highVolume: "High Volume ($500M+)",
        lowVolume: "Low Volume (<$10M)",
        highPriceChange: "Gaining (+5%)",
        lowPriceChange: "Losing (-5%)",
        highMarketCap: "Large Cap ($50B+)",
        lowMarketCap: "Small Cap (<$5B)",
        highCirculatingSupply: "High Supply (100M+)",
        lowCirculatingSupply: "Low Supply (<10M)",
    };

    const sortOptions = {
        market_cap_desc: "Market Cap ↓",
        market_cap_asc: "Market Cap ↑",
        price_desc: "Price ↓",
        price_asc: "Price ↑",
        change_desc: "24h Change ↓",
        change_asc: "24h Change ↑",
        name_asc: "Name A-Z"
    };

    // Search handling
    const handleSearchChange = (e) => {
        const value = e.target.value;
        dispatch(setSearch(value));
        generateSearchSuggestions(value);
    };

    const generateSearchSuggestions = useCallback((value) => {
        if (value.length >= 2) {
            const suggestions = coins
                .filter(coin =>
                    coin.name.toLowerCase().includes(value.toLowerCase()) ||
                    coin.symbol.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 5)
                .map(coin => ({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    image: coin.image
                }));
            setSearchSuggestions(suggestions);
        } else {
            setSearchSuggestions([]);
        }
    }, [coins]);

    const handleSuggestionClick = (suggestion) => {
        dispatch(setSearch(suggestion.name));
        setSearchSuggestions([]);
        // Could trigger coin modal or other action here
    };

    const clearSearch = () => {
        dispatch(setSearch(''));
        setSearchSuggestions([]);
    };

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

    const handleToggleFavorites = () => {
        dispatch(toggleShowFavorites());
    };

    // Refresh handling
    const handleRefresh = async () => {
        const canProceed = handleRefreshAttempt();
        if (!canProceed) return;

        setRefreshing(true);
        dispatch(resetPagination());
        dispatch(fetchCoins({ page: 1, append: false }));
        setRefreshing(false);
    };

    // Range slider component
    const RangeSlider = ({ label, type, min, max, step }) => {
        const [inputValue, setInputValue] = useState(rangeFilters[type]);

        const debouncedDispatch = debounce((value) => {
            dispatch(setRangeFilter({ filterType: type, value }));
        }, 1000);

        useEffect(() => {
            return () => {
                debouncedDispatch.cancel();
            };
        }, [debouncedDispatch]);

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
                        style={{ width: "100px" }}
                    />
                    <Form.Range
                        min={min}
                        max={max}
                        step={step}
                        value={inputValue}
                        onChange={handleSliderChange}
                        className="mx-2 flex-grow-1"
                    />
                </div>
            </Form.Group>
        );
    };

    return (
        <div className="search-and-filters">
            {/* Search Bar Row */}
            <Row className="search-row mb-3">
                <Col md={6}>
                    <div className="search-container position-relative">
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
                                    variant={darkMode ? "outline-light" : "outline-dark"}
                                    onClick={clearSearch}
                                >
                                    ✕
                                </Button>
                            )}
                            <Button
                                variant={canRefresh ? (darkMode ? "outline-light" : "outline-dark") : "secondary"}
                                onClick={handleRefresh}
                                disabled={refreshing || status === 'loading' || !canRefresh}
                                title={canRefresh ? "Refresh data" : "Refresh cooling down..."}
                            >
                                {refreshing ? <LoaderCircle size="sm" /> : <RefreshCw size={16} />}
                            </Button>
                        </InputGroup>

                        {/* Search Suggestions */}
                        {searchSuggestions.length > 0 && (
                            <Card className={`search-suggestions position-absolute w-100 mt-1 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                                <Card.Body className="p-2">
                                    <small className="text-muted">Quick matches:</small>
                                    {searchSuggestions.map(suggestion => (
                                        <div
                                            key={suggestion.id}
                                            className="suggestion-item d-flex align-items-center p-2 rounded"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            onMouseDown={(e) => e.preventDefault()}
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
                        <Button
                            variant={showFavoritesOnly ? "warning" : "outline-warning"}
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
                                    {filterLabels[filter]}
                                </>
                            }
                            onSelect={handleFilterSelect}
                            variant={darkMode ? "dark" : "light"}
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
                            title={sortOptions[sortBy]}
                            onSelect={handleSortSelect}
                            variant={darkMode ? "outline-light" : "outline-dark"}
                            size="sm"
                        >
                            {Object.entries(sortOptions).map(([key, label]) => (
                                <Dropdown.Item key={key} eventKey={key}>
                                    {label}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>

                        {/* Clear Filters */}
                        {(filter !== 'all' || showFavoritesOnly) && (
                            <Button
                                variant="outline-secondary"
                                onClick={handleClearFilters}
                                size="sm"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Col>

                <Col md={4}>
                    <div className="results-info text-end">
                        <small className="text-muted">
                            Showing {displayedCount} of {filteredCount} coins
                            <span className="ms-2">
                                ({totalCoinsLoaded} total loaded)
                            </span>
                        </small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default SearchAndFilters;