import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./App.css";
import { formatTimestamp } from "./utils/formatTime";

const CoinModal = ({ show, handleClose, coin, darkMode }) => {
  if (!coin) return null;

  const contentClass = darkMode ? "content-dark" : "content-light";
  
  // Helper function to format numbers
  const formatNumber = (number) => number ? number.toLocaleString() : "N/A";
  const formatCurrency = (number) => number ? number.toFixed(2) : "N/A";

  return (
    <Modal
      show={show}
      onHide={handleClose}
      contentClassName={contentClass}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="left-half">
          <img src={coin.image} alt={`${coin.name} logo`} className="coin-image" />
          &nbsp;
          <p>
            <span>Current Price: $</span><span>{formatCurrency(coin.current_price)}</span>
          </p>
          <p>
            <span>Market Cap: $</span><span>{formatNumber(coin.market_cap)}</span>
          </p>
          <p>
            <span>Market Cap Rank: </span><span>{coin.market_cap_rank}</span>
          </p>
          <p>
            <span>Fully Diluted Valuation: $</span>
            <span>{formatNumber(coin.fully_diluted_valuation)}</span>
          </p>
          <p>
            <span>Total Volume: $</span>
            <span>{formatNumber(coin.total_volume)}</span>
          </p>
          <p>
            <span>High 24h: $</span><span>{formatCurrency(coin.high_24h)}</span>
          </p>
        </div>
        <div className="right-half">
          <p>
            <span>Low 24h: $</span><span>{formatCurrency(coin.low_24h)}</span>
          </p>
          <p>
            <span>Price Change 24h: $</span><span>{formatCurrency(coin.price_change_24h)}</span>
          </p>
          <p>
            <span>Price Change Percentage 24h:</span>{" "}
            <span className={coin.price_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
              {coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : "N/A"}%
            </span>
          </p>
          <p>
            <span>Market Cap Change 24h: $</span>
            <span>{formatNumber(coin.market_cap_change_24h)}</span>
          </p>
          <p>
            <span>Market Cap Change Percentage 24h:</span>{" "}
            <span className={coin.market_cap_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
              {coin.market_cap_change_percentage_24h ? coin.market_cap_change_percentage_24h.toFixed(2) : "N/A"}%
            </span>
          </p>
          <p>
            <span>Circulating Supply: </span><span>{formatNumber(coin.circulating_supply)}</span>
          </p>
          <p>
            <span>Total Supply: </span><span>{formatNumber(coin.total_supply)}</span>
          </p>
          <p>
            <span>Max Supply: </span>
            <span>{coin.max_supply ? formatNumber(coin.max_supply) : "N/A"}</span>
          </p>
          {coin.roi && (
            <>
              <p>
                <span>ROI Times: </span>
                <span className={coin.roi.times > 0 ? "text-success" : "text-danger"}>
                  {coin.roi.times ? coin.roi.times.toFixed(2) : "N/A"}
                </span>
              </p>
              <p>
                <span>ROI Currency: </span>{" "}
                <span>{coin.roi.currency ? coin.roi.currency : "N/A"}</span>
              </p>
              <p>
                <span>ROI Percentage: </span>
                <span className={coin.roi.percentage > 0 ? "text-success" : "text-danger"}>
                  {coin.roi.percentage ? coin.roi.percentage.toFixed(2) : "N/A"}%
                </span>
              </p>
            </>
          )}
          <p>
            <span>Last Updated: </span>
            <span>{formatTimestamp(coin.last_updated)}</span>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;
