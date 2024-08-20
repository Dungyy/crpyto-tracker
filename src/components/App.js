import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from 'lodash.debounce';
import {
  fetchCoins,
  setSearch,
  setDisplayCount,
  setFilter,
  toggleDarkMode,
  setRangeFilter,
  clearFilters
} from "../features/coin/coinSlice";
import { Container, Form, InputGroup, Button, Row, Col, DropdownButton, Dropdown } from "react-bootstrap";
import Coin from "./Coin";
import "./App.css";
import Navbar from "./Navbar";
import CoinModal from "./CoinModal";
import { ErrorMessage  } from "./utils/ErrorMessage";
import { createDebouncedDispatch } from "./utils/debounce";

const App = () => {
  const dispatch = useDispatch();
  const coins = useSelector((state) => state.coins.coins);
  const search = useSelector((state) => state.coins.search);
  const displayCount = useSelector((state) => state.coins.displayCount);
  const filter = useSelector((state) => state.coins.filter);
  const darkMode = useSelector((state) => state.coins.darkMode);
  const rangeFilters = useSelector((state) => state.coins.rangeFilters);
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    dispatch(fetchCoins());
  }, [dispatch]);

  const handleChange = (e) => {
    dispatch(setSearch(e.target.value));
  };

  const handleFilterChange = (filterValue) => {
    dispatch(setFilter(filterValue));
  };

  const handleLoadMore = () => {
    dispatch(setDisplayCount(displayCount + 20));
  };

  const applyFilters = (coin) => {
    const matchesSearch = coin.name.toLowerCase().includes(search.toLowerCase());
    const matchesBasicFilter = () => {
      switch (filter) {
        case "highPrice":
          return coin.current_price > 5000;
        case "lowPrice":
          return coin.current_price < 10;
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

    return matchesSearch && matchesBasicFilter() && matchesAdvancedFilters();
  };

  const filteredCoins = coins.filter(applyFilters);
  const coinsToDisplay = filteredCoins.slice(0, displayCount);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
  };

  const filterLabel = {
    all: "All Coins",
    highPrice: "High Price",
    lowPrice: "Low Price",
    highVolume: "High Volume",
    lowVolume: "Low Volume",
    highPriceChange: "High Price Change",
    lowPriceChange: "Low Price Change",
    highMarketCap: "High Market Cap",
    lowMarketCap: "Low Market Cap",
    highCirculatingSupply: "High Circulating Supply",
    lowCirculatingSupply: "Low Circulating Supply",
  };

  // Advance filter slider 
  const RangeSlider = ({ label, type, min, max, step }) => {
    const dispatch = useDispatch();
    const rangeFilters = useSelector((state) => state.coins.rangeFilters);
    const [inputValue, setInputValue] = useState(rangeFilters[type]);
  
    // Create a debounced function
    const debouncedDispatch = useCallback(
      createDebouncedDispatch((value) => {
        dispatch(setRangeFilter({ filterType: type, value }));
      }, 1000), // Adjust debounce time as needed
      [dispatch, type]
    );
  
    // Cleanup debounce on component unmount
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
      <Navbar darkMode={darkMode} setDarkMode={() => dispatch(toggleDarkMode())} />
      <div className="mt-5 p-3">
        <Container>
          <h1 className="title">Dingy Crypto Search</h1>
          <Form className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Crypto Coin"
                onChange={handleChange}
              />
              <div className="mx-3">
                <DropdownButton
                  title={filterLabel[filter] || "Filter Options"}
                  onSelect={handleFilterChange}
                  variant={darkMode ? "dark" : "light"}
                  align="end"
                >
                  <Dropdown.Item eventKey="all">All Coins</Dropdown.Item>
                  <Dropdown.Item eventKey="highPrice">High Price</Dropdown.Item>
                  <Dropdown.Item eventKey="lowPrice">Low Price</Dropdown.Item>
                  <Dropdown.Item eventKey="highVolume">High Volume</Dropdown.Item>
                  <Dropdown.Item eventKey="lowVolume">Low Volume</Dropdown.Item>
                  <Dropdown.Item eventKey="highPriceChange">High Price Change</Dropdown.Item>
                  <Dropdown.Item eventKey="lowPriceChange">Low Price Change</Dropdown.Item>
                  <Dropdown.Item eventKey="highMarketCap">High Market Cap</Dropdown.Item>
                  <Dropdown.Item eventKey="lowMarketCap">Low Market Cap</Dropdown.Item>
                  <Dropdown.Item eventKey="highCirculatingSupply">High Circulating Supply</Dropdown.Item>
                  <Dropdown.Item eventKey="lowCirculatingSupply">Low Circulating Supply</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Header>Advanced Filters</Dropdown.Header>
                  <Dropdown.ItemText>
                    <RangeSlider label="Price ($)" type="price" min={0} max={100000} step={100} />
                    <RangeSlider label="Market Cap ($)" type="marketCap" min={0} max={1000000000000} step={1000000000} />
                    <RangeSlider label="Volume ($)" type="volume" min={0} max={10000000000} step={10000000} />
                    <RangeSlider label="Price Change %" type="priceChange" min={0} max={100} step={0.1} />
                  </Dropdown.ItemText>
                </DropdownButton>
              </div>
              <Button
                variant={darkMode ? "dark" : "light"}
                onClick={() => dispatch(clearFilters())}
              >
                Clear Filters
              </Button>
            </InputGroup>
          </Form>
          {coinsToDisplay.length > 0 ? (
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
                    onClick={() => handleCoinClick(coin)}
                    darkMode={darkMode}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <ErrorMessage message="No crypto coin was found matching your search :(" />
          )}
          <CoinModal
            coin={selectedCoin}
            show={!!selectedCoin}
            handleClose={() => setSelectedCoin(null)}
            darkMode={darkMode}
          />
          {displayCount < filteredCoins.length && coinsToDisplay.length > 0 && (
            <Button 
              className="w-100 mt-3" 
              onClick={handleLoadMore} 
              variant={darkMode ? "dark" : "light"}
            >
              Load More
            </Button>
          )}
        </Container>
      </div>
    </div>
  );
};

export default App;