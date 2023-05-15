import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./App.css";

const CoinModal = ({ show, handleClose, coin, darkMode }) => {
  if (!coin) {
    return null;
  }

  const contentClass = darkMode ? "content-dark" : "content-light";

  return (
    <Modal show={show} onHide={handleClose} contentClassName={contentClass}>
      <Modal.Header closeButton>
        <Modal.Title>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={coin.image}
          alt={coin.name}
          style={{ width: "100px", height: "100px" }}
        />
        <p>Current Price: {coin.current_price}</p>
        <p>Market Cap: {coin.market_cap}</p>
        <p>Market Cap Rank: {coin.market_cap_rank}</p>
        <p>Fully Diluted Valuation: {coin.fully_diluted_valuation}</p>
        <p>Total Volume: {coin.total_volume}</p>
        <p>High 24h: {coin.high_24h}</p>
        <p>Low 24h: {coin.low_24h}</p>
        <p>Price Change 24h: {coin.price_change_24h}</p>
        <p>Price Change Percentage 24h: {coin.price_change_percentage_24h}</p>
        <p>Market Cap Change 24h: {coin.market_cap_change_24h}</p>
        <p>
          Market Cap Change Percentage 24h:{" "}
          {coin.market_cap_change_percentage_24h}
        </p>
        <p>Circulating Supply: {coin.circulating_supply}</p>
        <p>Total Supply: {coin.total_supply}</p>
        <p>Max Supply: {coin.max_supply}</p>
        <p>All Time High: {coin.ath}</p>
        <p>All Time High Change Percentage: {coin.ath_change_percentage}</p>
        <p>All Time High Date: {new Date(coin.ath_date).toLocaleString()}</p>
        <p>All Time Low: {coin.atl}</p>
        <p>All Time Low Change Percentage: {coin.atl_change_percentage}</p>
        <p>All Time Low Date: {new Date(coin.atl_date).toLocaleString()}</p>
        <p>Last Updated: {new Date(coin.last_updated).toLocaleString()}</p>
      </Modal.Body>
    </Modal>
  );
};

export default CoinModal;


