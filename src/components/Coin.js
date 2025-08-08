import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";

const Coin = ({
  image,
  name,
  symbol,
  price,
  volume,
  priceChange,
  marketcap,
  onClick,
  darkMode,
  rank
}) => {
  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return "success";
    if (change < 0) return "danger";
    return "secondary";
  };

  const cardStyle = {
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: darkMode ? "1px solid #495057" : "1px solid #dee2e6",
    backgroundColor: darkMode ? "#2d3748" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000"
  };

  const hoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: darkMode
      ? "0 4px 12px rgba(255, 255, 255, 0.1)"
      : "0 4px 12px rgba(0, 0, 0, 0.15)"
  };

  return (
    <Col className="mb-3" onClick={onClick}>
      <Card
        style={cardStyle}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, hoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, cardStyle);
        }}
      >
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={4}>
              <div className="position-relative">
                <img src={image} alt="crypto" className="img-fluid" />
                {rank && (
                  <Badge
                    bg="secondary"
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: "0.6rem" }}
                  >
                    #{rank}
                  </Badge>
                )}
              </div>
            </Col>
            <Col xs={10}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <Card.Title className="mb-1">
                    <h6 className="mb-0">
                      {name}
                      <small className="text-muted ms-1">
                        {symbol.toUpperCase()}
                      </small>
                    </h6>
                  </Card.Title>
                </div>
                <div className="text-end top-0 right-0 left-0">
                  <Eye size={16} className="text-muted" />
                </div>
              </div>

              <Row>
                <Col xs={6}>
                  <div className="mb-1">
                    <small className="text-muted">Price</small>
                    <div className="fw-bold">{formatPrice(price)}</div>
                  </div>
                  <div>
                    <small className="text-muted">Volume</small>
                    <div className="small">{formatLargeNumber(volume)}</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-1">
                    <small className="text-muted">24h Change</small>
                    <div className={`fw-bold text-${getPriceChangeColor(priceChange)}`}>
                      <span className="d-flex align-items-center justify-content-end">
                        {priceChange > 0 ? (
                          <TrendingUp size={14} className="me-1" />
                        ) : priceChange < 0 ? (
                          <TrendingDown size={14} className="me-1" />
                        ) : null}
                        {priceChange ? `${priceChange.toFixed(2)}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <small className="text-muted">Market Cap</small>
                    <div className="small">{formatLargeNumber(marketcap)}</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Coin;