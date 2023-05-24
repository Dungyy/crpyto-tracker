import React from "react";
import { Card, Row, Col } from "react-bootstrap";

const Coin = ({
  image,
  name,
  symbol,
  price,
  volume,
  priceChange,
  marketcap,
  onClick,
}) => {
  return (
    <Col className="mb-3" onClick={onClick}>
      <Card>
        <Card.Body>
          <Row>
            <Col xs={3}>
              <img src={image} alt="crypto" className="img-fluid" />
            </Col>
            <Col xs={9}>
              <Card.Title>
                <h4>
                  {name} ({symbol.toUpperCase()})
                </h4>
              </Card.Title>
              <div>
                <h5>Price: $ {price}</h5>
                <h5>Volume: $ {volume.toLocaleString()}</h5>
                <h5>
                  Price Change:
                  <span
                    className={priceChange > 0 ? "text-success" : "text-danger"}
                  >
                    {priceChange ? priceChange.toFixed(2) : "N/A"}%
                  </span>
                </h5>
                <h5>Market Cap: ${marketcap.toLocaleString()}</h5>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Coin;
