import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const CoinURL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

const App = () => {
  const [coins, setCoins] = useState([]);
  useEffect(() => {
    axios.get(CoinURL).then((res) => {
      setCoins(res.data);
    }).catch(err => console.log(err))
  }, []);

  return (
    <div className="App">
      <h1> API </h1>
    </div>
  );
};

export default App;
