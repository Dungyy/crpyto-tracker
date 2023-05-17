import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoins,
  setSearch,
  setDisplayCount,
} from "../features/coin/coinSlice";
import { Container, Form, InputGroup, Button } from "react-bootstrap";
import Coin from "./Coin";
import "./App.css";
import Navbar from "./Navbar";
import CoinModal from "./CoinModal";
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

  const filterCoins = coins
    .filter((coin) => coin.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, displayCount);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <div className="App">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Container className="mt-3">
        <h2 className="text-center">Instant Crypto Search</h2>
        {/* <Info darkMode={darkMode} setDarkMode={setDarkMode} /> */}
        <Form className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search Crypto Coin"
              onChange={handleChange}
            />
          </InputGroup>
        </Form>
        {filterCoins.map((coin) => (
          <Coin
            key={coin.id}
            name={coin.name}
            image={coin.image}
            symbol={coin.symbol}
            marketcap={coin.market_cap}
            price={coin.current_price}
            priceChange={coin.price_change_percentage_24h}
            volume={coin.total_volume}
            onClick={() => handleCoinClick(coin)} // add the onClick prop here
          />
        ))}
        <CoinModal
          coin={selectedCoin}
          show={!!selectedCoin}
          handleClose={() => setSelectedCoin(null)}
          darkMode={darkMode}
        />
        {displayCount < coins.length && (
          <Button className="w-100 mt-3" onClick={handleLoadMore}>
            Load More
          </Button>
        )}
      </Container>
    </div>
  );
};

export default App;
