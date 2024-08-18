import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoins,
  setSearch,
  setDisplayCount,
} from "../features/coin/coinSlice";
import { Container, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import Coin from "./Coin";
import "./App.css";
import Navbar from "./Navbar";
import CoinModal from "./CoinModal";
import { ErrorMessage } from "./utils/ErrorMessage";
// import Info from "./Info";

const App = () => {
  const dispatch = useDispatch();
  const coins = useSelector((state) => state.coins.coins);
  const search = useSelector((state) => state.coins.search);
  const displayCount = useSelector((state) => state.coins.displayCount);

  const [darkMode, setDarkMode] = useState(true);
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

  const handleLoadMore = () => {
    dispatch(setDisplayCount(displayCount + 20));
  };

  const allFilterCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  const filterCoins = allFilterCoins.slice(0, displayCount);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <div className="App">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Container className="mt-4 ">
        <h1 className="title">Instant Crypto Search</h1>
        <Form className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search Crypto Coin"
              onChange={handleChange}
            />
          </InputGroup>
        </Form>
        {filterCoins.length > 0 ? (
          <Row>
            {filterCoins.map((coin) => (
              <Col key={coin.id} sm={6} md={4} lg={3}>
                <Coin
                  key={coin.id}
                  name={coin.name}
                  image={coin.image}
                  symbol={coin.symbol}
                  marketcap={coin.market_cap}
                  price={coin.current_price}
                  priceChange={coin.price_change_percentage_24h}
                  volume={coin.total_volume}
                  onClick={() => handleCoinClick(coin)}
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
        {displayCount < allFilterCoins.length && filterCoins.length > 0 && (
          <Button className="w-100 mt-3" onClick={handleLoadMore}>
            Load More
          </Button>
        )}
      </Container>
    </div>
  );
};

export default App;
