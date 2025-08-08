import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoins,
  setSearch,
  setDisplayCount,
  setFilter,
  toggleDarkMode,
  setRangeFilter,
  clearFilters,
  toggleShowFavorites,
  setSortBy,
  setLastUpdated,
  resetPagination
} from "../features/coin/coinSlice";
import {
  Container,
  Form,
  InputGroup,
  Button,
  Row,
  Col,
  DropdownButton,
  Dropdown,
  Badge,
  Alert,
  Spinner,
  Card
} from "react-bootstrap";
import Coin from "./Coin";
import "./App.css";
import Navbar from "./Navbar";
import CoinModal from "./CoinModal";
import PortfolioModal from "./PortfolioModal";
import { ErrorMessage } from "./utils/ErrorMessage";
import { createDebouncedDispatch } from "./utils/debounce";
import { debounce } from "lodash";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Star,
  Briefcase,
  Search,
  Info
} from "lucide-react";

const App = () => {
  const dispatch = useDispatch();
  const coins = useSelector((state) => state.coins.coins);
  const search = useSelector((state) => state.coins.search);
  const displayCount = useSelector((state) => state.coins.displayCount);
  const filter = useSelector((state) => state.coins.filter);
  const darkMode = useSelector((state) => state.coins.darkMode);
  const rangeFilters = useSelector((state) => state.coins.rangeFilters);
  const favorites = useSelector((state) => state.coins.favorites);
  const showFavoritesOnly = useSelector((state) => state.coins.showFavoritesOnly);
  const sortBy = useSelector((state) => state.coins.sortBy);
  const status = useSelector((state) => state.coins.status);
  const portfolio = useSelector((state) => state.coins.portfolio);
  const lastUpdated = useSelector((state) => state.coins.lastUpdated);
  const currentPage = useSelector((state) => state.coins.currentPage);
  const hasMorePages = useSelector((state) => state.coins.hasMorePages);
  const loadingMore = useSelector((state) => state.coins.loadingMore);
  const totalCoinsLoaded = useSelector((state) => state.coins.totalCoinsLoaded);

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Refresh rate limiting - only allow refresh every 30 seconds
  const REFRESH_COOLDOWN = 30000; // 30 seconds
  const canRefresh = Date.now() - lastRefreshTime > REFRESH_COOLDOWN;

  useEffect(() => {
    const bodyClass = document.body.classList;
    darkMode ? bodyClass.add("dark") : bodyClass.remove("dark");
    return () => bodyClass.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    dispatch(fetchCoins());
    setLastRefreshTime(Date.now());

    // Auto-refresh every 10 minutes (reduced from 5 to save API calls)
    const interval = setInterval(() => {
      dispatch(fetchCoins({ page: 1, append: false }));
      setLastRefreshTime(Date.now());
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  // Smart search that works with loaded coins and provides suggestions
  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(setSearch(value));

    // Generate search suggestions from loaded coins
    if (value.length >= 2) {
      const suggestions = coins
        .filter(coin =>
          coin.name.toLowerCase().includes(value.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5) // Show top 5 suggestions
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
  };

  const handleFilterChange = debounce((filterValue) => {
    dispatch(setFilter(filterValue));
  }, 300);

  const handleFilterSelect = (filterValue) => {
    handleFilterChange(filterValue);
  };

  const handleLoadMore = () => {
    dispatch(setDisplayCount(displayCount + 20));
  };

  const handleRefresh = async () => {
    if (!canRefresh) {
      alert(`Please wait ${Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000)} seconds before refreshing again.`);
      return;
    }

    setRefreshing(true);
    dispatch(resetPagination());
    await dispatch(fetchCoins({ page: 1, append: false }));
    setLastRefreshTime(Date.now());
    setRefreshing(false);
  };

  const handleLoadMorePages = async () => {
    if (hasMorePages && !loadingMore) {
      await dispatch(fetchCoins({ page: currentPage + 1, append: true }));
    }
  };

  const sortCoins = (coins) => {
    const sorted = [...coins];
    switch (sortBy) {
      case 'market_cap_desc':
        return sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
      case 'market_cap_asc':
        return sorted.sort((a, b) => (a.market_cap || 0) - (b.market_cap || 0));
      case 'price_desc':
        return sorted.sort((a, b) => b.current_price - a.current_price);
      case 'price_asc':
        return sorted.sort((a, b) => a.current_price - b.current_price);
      case 'change_desc':
        return sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
      case 'change_asc':
        return sorted.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  // Improved search function with fuzzy matching
  const fuzzySearch = (text, searchTerm) => {
    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();

    // Exact match gets highest priority
    if (lowerText.includes(lowerSearch)) return true;

    // Check if search term matches word boundaries
    const words = lowerText.split(/\s+/);
    return words.some(word => word.startsWith(lowerSearch));
  };

  const applyFilters = (coin) => {
    const matchesSearch = !search || search.length < 2 ||
      fuzzySearch(coin.name, search) ||
      fuzzySearch(coin.symbol, search) ||
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase());

    const matchesFavorites = showFavoritesOnly ? favorites.includes(coin.id) : true;

    const matchesBasicFilter = () => {
      switch (filter) {
        case "highPrice":
          return coin.current_price > 50000;
        case "lowPrice":
          return coin.current_price < 2;
        case "highVolume":
          return coin.total_volume > 500000000;
        case "lowVolume":
          return coin.total_volume < 10000000;
        case "highPriceChange":
          return coin.price_change_percentage_24h > 5;
        case "lowPriceChange":
          return coin.price_change_percentage_24h < -5;
        case "highMarketCap":
          return coin.market_cap > 50000000000;
        case "lowMarketCap":
          return coin.market_cap < 5000000000;
        case "highCirculatingSupply":
          return coin.circulating_supply > 100000000;
        case "lowCirculatingSupply":
          return coin.circulating_supply < 10000000;
        default:
          return true;
      }
    };

    const matchesAdvancedFilters = () => {
      return (
        coin.current_price <= rangeFilters.price &&
        coin.market_cap <= rangeFilters.marketCap &&
        coin.total_volume <= rangeFilters.volume &&
        Math.abs(coin.price_change_percentage_24h) <= rangeFilters.priceChange
      );
    };

    return matchesSearch && matchesFavorites && matchesBasicFilter() && matchesAdvancedFilters();
  };

  // Memoize filtered coins to improve performance
  const filteredCoins = useMemo(() => {
    return sortCoins(coins.filter(applyFilters));
  }, [coins, search, showFavoritesOnly, filter, rangeFilters, sortBy]);

  const coinsToDisplay = filteredCoins.slice(0, displayCount);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    setSearchSuggestions([]); // Hide suggestions when coin is selected
  };

  const handleSuggestionClick = (suggestion) => {
    const coin = coins.find(c => c.id === suggestion.id);
    if (coin) {
      setSelectedCoin(coin);
      dispatch(setSearch(''));
      setSearchSuggestions([]);
    }
  };

  const getPortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const coin = coins.find(c => c.id === holding.coinId);
      if (coin) {
        return total + (coin.current_price * holding.amount);
      }
      return total;
    }, 0);
  };

  const getPortfolioPnL = () => {
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

  const filterLabel = {
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

  const RangeSlider = ({ label, type, min, max, step }) => {
    const dispatch = useDispatch();
    const rangeFilters = useSelector((state) => state.coins.rangeFilters);
    const [inputValue, setInputValue] = useState(rangeFilters[type]);

    const debouncedDispatch = useCallback(
      createDebouncedDispatch((value) => {
        dispatch(setRangeFilter({ filterType: type, value }));
      }, 1000),
      [dispatch, type]
    );

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
    <div className="App">
      <Navbar />
      <div className="mt-5 p-3">
        <Container>
          {/* API Usage Notice */}
          <Alert variant="info" className="mb-3">
            <Info size={16} className="me-2" />
            <strong>Efficient Search:</strong> Search works within {totalCoinsLoaded} loaded coins.
            Load more pages to search through additional cryptocurrencies.
            {!canRefresh && (
              <span className="ms-2">
                ⏰ Refresh available in {Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000)}s
              </span>
            )}
          </Alert>

          {/* Header with Portfolio Summary */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="title mb-0">Dingy Crypto Tracker</h1>
              {lastUpdated && (
                <small className="text-muted">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </small>
              )}
            </div>

            {portfolio.length > 0 && (
              <div className="text-end">
                <div className="fw-bold">Portfolio Value: ${getPortfolioValue().toLocaleString()}</div>
                <div className={`small ${getPortfolioPnL() >= 0 ? 'text-success' : 'text-danger'}`}>
                  P&L: ${getPortfolioPnL().toFixed(2)} ({((getPortfolioPnL() / (getPortfolioValue() - getPortfolioPnL())) * 100).toFixed(2)}%)
                </div>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <div className="position-relative">
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={25} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={`Search within ${totalCoinsLoaded} loaded coins...`}
                    onChange={handleChange}
                    value={search}
                    onBlur={() => setTimeout(() => setSearchSuggestions([]), 200)}
                  />
                  {search && (
                    <Button
                      variant={darkMode ? "outline-light" : "outline-dark"}
                      onClick={() => {
                        dispatch(setSearch(''));
                        setSearchSuggestions([]);
                      }}
                    >
                      ✕
                    </Button>
                  )}
                  <Button
                    variant={canRefresh ? (darkMode ? "outline-light" : "outline-dark") : "secondary"}
                    onClick={handleRefresh}
                    disabled={refreshing || status === 'loading' || !canRefresh}
                    title={canRefresh ? "Refresh data" : `Wait ${Math.ceil((REFRESH_COOLDOWN - (Date.now() - lastRefreshTime)) / 1000)}s`}
                  >
                    {refreshing ? <Spinner size="sm" /> : <RefreshCw size={16} />}
                  </Button>
                </InputGroup>

                {/* Search Suggestions Dropdown */}
                {searchSuggestions.length > 0 && (
                  <Card className={`position-absolute w-100 mt-1 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`} style={{ zIndex: 1000 }}>
                    <Card.Body className="p-2">
                      <small className="text-muted">Quick matches:</small>
                      {searchSuggestions.map(suggestion => (
                        <div
                          key={suggestion.id}
                          className={`d-flex align-items-center p-2 rounded cursor-pointer ${darkMode ? 'hover-bg-secondary' : 'hover-bg-light'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <img src={suggestion.image} width="20" height="20" className="me-2 rounded-circle" />
                          <span>{suggestion.name} ({suggestion.symbol})</span>
                        </div>
                      ))}
                      <small className="text-muted">
                        {filteredCoins.length > 5 && `+${filteredCoins.length - 5} more results`}
                      </small>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant={showFavoritesOnly ? "warning" : "outline-warning"}
                  onClick={() => dispatch(toggleShowFavorites())}
                  size="sm"
                >
                  <Star size={16} className="me-1" />
                  Favorites {favorites.length > 0 && <Badge bg="secondary">{favorites.length}</Badge>}
                </Button>

                <Button
                  variant="outline-primary"
                  onClick={() => setShowPortfolio(true)}
                  size="sm"
                >
                  <Briefcase size={16} className="me-1" />
                  Portfolio {portfolio.length > 0 && <Badge bg="secondary">{portfolio.length}</Badge>}
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filter and Sort Bar */}
          <Row className="mb-3">
            <Col md={8}>
              <div className="d-flex gap-2 align-items-center">
                <DropdownButton
                  title={<><Filter size={16} className="me-1" />{filterLabel[filter]}</>}
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

                <DropdownButton
                  title={sortOptions[sortBy]}
                  onSelect={(value) => dispatch(setSortBy(value))}
                  variant={darkMode ? "outline-light" : "outline-dark"}
                  size="sm"
                >
                  <Dropdown.Item eventKey="market_cap_desc">Market Cap ↓</Dropdown.Item>
                  <Dropdown.Item eventKey="market_cap_asc">Market Cap ↑</Dropdown.Item>
                  <Dropdown.Item eventKey="price_desc">Price ↓</Dropdown.Item>
                  <Dropdown.Item eventKey="price_asc">Price ↑</Dropdown.Item>
                  <Dropdown.Item eventKey="change_desc">24h Change ↓</Dropdown.Item>
                  <Dropdown.Item eventKey="change_asc">24h Change ↑</Dropdown.Item>
                  <Dropdown.Item eventKey="name_asc">Name A-Z</Dropdown.Item>
                </DropdownButton>

                {(filter !== 'all' || showFavoritesOnly) && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => dispatch(clearFilters())}
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Col>

            <Col md={4} className="text-end">
              <small className="text-muted">
                Showing {coinsToDisplay.length} of {filteredCoins.length} coins
                <span className="ms-2">
                  ({totalCoinsLoaded} total loaded)
                </span>
              </small>
            </Col>
          </Row>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-5">
              <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
              <p className="mt-2">Loading cryptocurrency data...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'failed' && (
            <Alert variant="danger">
              Failed to load cryptocurrency data. Please try refreshing the page.
            </Alert>
          )}

          {/* Coins Grid */}
          {status === 'succeeded' && coinsToDisplay.length > 0 ? (
            <Row>
              {coinsToDisplay.map((coin) => (
                <Col key={coin.id} sm={6} md={4} lg={3}>
                  <Coin
                    name={coin.name}
                    image={coin.image}
                    symbol={coin.symbol}
                    marketcap={coin.market_cap}
                    price={coin.current_price}
                    priceChange={coin.price_change_percentage_24h}
                    volume={coin.total_volume}
                    lastUpdated={coin.last_updated}
                    onClick={() => handleCoinClick(coin)}
                    darkMode={darkMode}
                    rank={coin.market_cap_rank}
                  />
                </Col>
              ))}
            </Row>
          ) : status === 'succeeded' ? (
            <ErrorMessage message="No cryptocurrencies found matching your criteria. Try adjusting your filters or loading more pages." />
          ) : null}

          {/* Load More Button */}
          {displayCount < filteredCoins.length && coinsToDisplay.length > 0 && (
            <div className="text-center mt-4">
              <Button
                onClick={handleLoadMore}
                variant={darkMode ? "outline-light" : "outline-dark"}
                size="lg"
              >
                Load More ({filteredCoins.length - displayCount} remaining)
              </Button>
            </div>
          )}

          {/* Load More Pages Button */}
          {displayCount >= filteredCoins.length && hasMorePages && (
            <div className="text-center mt-4">
              <Button
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
            </div>
          )}

          {/* End of data message */}
          {!hasMorePages && totalCoinsLoaded > 100 && (
            <div className="text-center mt-4">
              <small className="text-muted">
                You've reached the end! {totalCoinsLoaded} cryptocurrencies loaded.
              </small>
            </div>
          )}

          {/* Modals */}
          <CoinModal
            coin={selectedCoin}
            show={!!selectedCoin}
            handleClose={() => setSelectedCoin(null)}
            darkMode={darkMode}
          />

          <PortfolioModal
            show={showPortfolio}
            handleClose={() => setShowPortfolio(false)}
            darkMode={darkMode}
          />
        </Container>
      </div>
    </div>
  );
};

export default App;