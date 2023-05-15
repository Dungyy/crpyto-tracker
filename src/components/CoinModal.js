import React from "react";
import { Modal, Button } from "react-bootstrap";

const CoinModal = ({ show, handleClose, coin, darkMode }) => {
  if (!coin) {
    return null;
  }

  const modalClass = darkMode ? "modal-dark" : "modal-light";

  return (
    <Modal show={show} onHide={handleClose} className={modalClass}>
      <Modal.Header closeButton>
        <Modal.Title>{coin.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img src={coin.image} alt={coin.name} />
        <p>Symbol: {coin.symbol}</p>
        <p>Current Price: ${coin.current_price}</p>
        <p>Market Cap: ${coin.market_cap}</p>
        <p>24h Price Change: {coin.price_change_percentage_24h}%</p>
        <p>Total Volume: {coin.total_volume}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;
