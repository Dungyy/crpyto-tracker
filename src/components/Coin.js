import React from "react";
import { Card, Row, Col } from 'react-bootstrap';

const Coin = ({ image, name, symbol, price, volume, priceChange, marketcap, onClick  }) => {
  return (
    <div onClick={onClick}> 
    <Card className="mb-3">
      <Card.Body>
        <Row>
          <Col xs={2}>
            <img src={image} alt="crypto" className="img-fluid"/>
          </Col>
          <Col>
            <Card.Title>{name} ({symbol.toUpperCase()})</Card.Title>
            <Card.Text>
              Price: ${price}<br />
              Volume: ${volume.toLocaleString()}<br />
              Price Change: <span className={priceChange > 0 ? "text-success" : "text-danger"}>{priceChange ? priceChange.toFixed(2) : 'N/A'}%</span><br />
              Market Cap: ${marketcap.toLocaleString()}
            </Card.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
    </div>
  );
};

export default Coin;
