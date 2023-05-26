import React from "react";
import { Modal, Button, Row } from "react-bootstrap";
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
      <Modal.Body className="modal-body">
        <div className="left-half">
          <img src={coin.image} alt={coin.name} className="coin-image" />
          <p>
            <span>Current Price: $</span><span>{coin.current_price}</span>
          </p>
          <p>
            <span>Market Cap: $</span><span>{coin.market_cap.toLocaleString()}</span>
          </p>
          <p>
            <span>Market Cap Rank: </span><span>{coin.market_cap_rank}</span>
          </p>
          <p>
            <span>Fully Diluted Valuation:</span>{" "}
            <span>{coin.fully_diluted_valuation}</span>
          </p>
          <p>
            <span>Total Volume:</span>{" "}
            <span>{coin.total_volume.toLocaleString()}</span>
          </p>
          <p>
            <span>High 24h:</span> <span>{coin.high_24h}</span>
          </p>
        </div>
        <div className="right-half">
          <p>
            <span>Low 24h:</span> <span>{coin.low_24h}</span>
          </p>
          <p>
            <span>Price Change 24h:</span> <span>{coin.price_change_24h}</span>
          </p>
          <p>
            <span>Price Change Percentage 24h:</span>{" "}
            <span
              className={
                coin.price_change_percentage_24h > 0
                  ? "text-success"
                  : "text-danger"
              }
            >
              {coin.price_change_percentage_24h
                ? coin.price_change_percentage_24h.toFixed(2)
                : "N/A"}
              %
            </span>
          </p>
          <p>
            <span>Market Cap Change 24h:</span>{" "}
            <span>{coin.market_cap_change_24h}</span>
          </p>
          <p>
            <span>Market Cap Change Percentage 24h:</span>{" "}
            <span
              className={
                coin.market_cap_change_percentage_24h > 0
                  ? "text-success"
                  : "text-danger"
              }
            >
              {coin.market_cap_change_percentage_24h
                ? coin.market_cap_change_percentage_24h.toFixed(2)
                : "N/A"}
              %
            </span>
          </p>
          <p>
            <span>Circulating Supply: </span>
            <span>{coin.circulating_supply.toLocaleString()}</span>
          </p>
          <p>
            <span>Total Supply:</span>{" "}
            <span>{coin.total_supply}</span>
          </p>
          <p>
            <span>Max Supply:</span>{" "}
            <span>
              {coin.max_supply ? coin.max_supply.toLocaleString() : "N/A"}
            </span>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;
