import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoins,
  setSearch,
  setDisplayCount,
  setFilter,
  setRangeFilter,
  clearFilters,
  toggleShowFavorites,
  setSortBy,
  setLastUpdated
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
  Spinner
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
  RefreshCw,
  Filter,
  Star,
  Briefcase,
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

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const bodyClass = document.body.classList;
    darkMode ? bodyClass.add("dark") : bodyClass.remove("dark");
    return () => bodyClass.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    dispatch(fetchCoins());

    // Auto-refresh every 9 minutes
    const interval = setInterval(() => {
      dispatch(fetchCoins());
    }, 190000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleChange = (e) => {
    dispatch(setSearch(e.target.value));
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
    setRefreshing(true);
    await dispatch(fetchCoins());
    dispatch(setLastUpdated());
    setRefreshing(false);
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

  const applyFilters = (coin) => {
    const matchesSearch = coin.name.toLowerCase().includes(search.toLowerCase()) ||
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

  const filteredCoins = sortCoins(coins.filter(applyFilters));
  const coinsToDisplay = filteredCoins.slice(0, displayCount);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
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
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  onChange={handleChange}
                  value={search}
                />
                <Button
                  variant={darkMode ? "outline-light" : "outline-dark"}
                  onClick={handleRefresh}
                  disabled={refreshing || status === 'loading'}
                >
                  {refreshing ? <Spinner size="sm" /> : <RefreshCw size={16} />}
                </Button>
              </InputGroup>
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
                    variant="outline-danger"
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
            <ErrorMessage message="No cryptocurrencies found matching your criteria. Try adjusting your filters." />
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