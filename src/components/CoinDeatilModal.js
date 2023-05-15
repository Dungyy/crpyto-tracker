import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const CoinDetailsModal = ({ coin, onHide }) => {
  if (!coin) return null;

  return (
    <Modal show={!!coin} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{coin.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Display coin data here... */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinDetailsModal;
