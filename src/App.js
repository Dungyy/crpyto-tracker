import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import Coin from "./Coin";
// import Info from "./Info";

const CoinURL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false";

const App = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    axios
      .get(CoinURL)
      .then((res) => {
        setCoins(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleLoadMore = () => {
    setDisplayCount(displayCount + 20);
  };


  const filterCoins = coins
    .filter((coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, displayCount);

  return (
    <div className="coin-app">
      <div className="coin-search">
        <h1 className="coin-text">Dingy</h1>
        {/* <Info /> */}
        <br /> <br />
        <form>
          <br />
          <input
            type="text"
            placeholder="Search Crypto Coin"
            className="coin-input"
            onChange={handleChange}
          />
        </form>
        <br />
      </div>
      {filterCoins.map((coin) => {
        return (
          <div className="coin-wrap">
            <Coin
              name={coin.name}
              image={coin.image}
              symbol={coin.symbol}
              marketcap={coin.market_cap}
              price={coin.current_price}
              priceChange={coin.price_change_percentage_24h}
              volume={coin.total_volume}
            />
          </div>
        );
      })}
      <br />
      {displayCount < coins.length && (
        <button onClick={handleLoadMore}>Load More</button>
      )}
      <br />
    </div>
  );
};

export default App;
