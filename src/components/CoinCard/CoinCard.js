import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { TrendingUp, TrendingDown, Eye, Star } from "lucide-react";
import { toggleFavorite } from "../../features/coin/coinSlice";
import { formatPrice, formatLargeNumber } from "../../components/utils/formatting";
// import "./CoinCard.css";

const CoinCard = ({ coin, onClick, darkMode }) => {
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.coins.favorites);

    const isFavorite = favorites.includes(coin.id);

    const getPriceChangeColor = (change) => {
        if (change > 0) return "success";
        if (change < 0) return "danger";
        return "secondary";
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        dispatch(toggleFavorite(coin.id));
    };

    const cardStyle = {
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        border: darkMode ? "1px solid #495057" : "1px solid #dee2e6",
        backgroundColor: darkMode ? "#2d3748" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "140px"
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
                className={`coin-card ${darkMode ? "text-white" : "text-dark"}`}
                onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, hoverStyle);
                }}
                onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, cardStyle);
                }}
            >
                <Card.Body className="position-relative p-3">
                    {/* Actions - Eye in top left, Star in top right */}
                    <div className="position-absolute top-0 start-0 m-2">
                        <Eye
                            size={16}
                            className={`${darkMode ? "text-light" : "text-muted"}`}
                            style={{ opacity: 0.5 }}
                        />
                    </div>

                    <div className="position-absolute top-0 end-0 m-2">
                        <button
                            className={`btn btn-sm p-1 ${isFavorite ? 'text-warning' : 'text-muted'}`}
                            onClick={handleFavoriteClick}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            style={{
                                background: 'none',
                                border: 'none',
                                opacity: 0.7,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = 1}
                            onMouseLeave={(e) => e.target.style.opacity = 0.7}
                        >
                            <Star size={14} fill={isFavorite ? "#ffc107" : "none"} />
                        </button>
                    </div>

                    <Row className="align-items-center h-100">
                        {/* Coin Image and Info */}
                        <Col xs={4} className="text-center">
                            <div className="position-relative d-inline-block">
                                <img
                                    src={coin.image}
                                    alt={`${coin.name} logo`}
                                    className="img-fluid rounded-circle"
                                    style={{
                                        width: "64px",
                                        height: "64px",
                                        objectFit: "cover",
                                        border: darkMode ? "2px solid #495057" : "2px solid #dee2e6"
                                    }}
                                />
                            </div>

                            {/* Rank Number below image */}
                            {coin.market_cap_rank && (
                                <div className="mt-1">
                                    <Badge
                                        bg="secondary"
                                        style={{ fontSize: "0.65rem" }}
                                    >
                                        #{coin.market_cap_rank}
                                    </Badge>
                                </div>
                            )}
                        </Col>

                        {/* Coin Info */}
                        <Col xs={8}>
                            {/* Coin Name and Symbol */}
                            <div className="mb-2">
                                <h6 className={`coin-name mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                    {coin.name.length > 12 ? `${coin.name.substring(0, 12)}...` : coin.name}
                                </h6>
                                <small className={`coin-symbol ${darkMode ? "text-light" : "text-muted"}`}>
                                    {coin.symbol.toUpperCase()}
                                </small>
                            </div>

                            {/* Price and Change */}
                            <div className="mb-2">
                                <div className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`} style={{ fontSize: "1.1rem" }}>
                                    {formatPrice(coin.current_price)}
                                </div>
                                <div className={`small text-${getPriceChangeColor(coin.price_change_percentage_24h)}`}>
                                    <span className="d-flex align-items-center">
                                        {coin.price_change_percentage_24h > 0 ? (
                                            <TrendingUp size={12} className="me-1" />
                                        ) : coin.price_change_percentage_24h < 0 ? (
                                            <TrendingDown size={12} className="me-1" />
                                        ) : null}
                                        {coin.price_change_percentage_24h ?
                                            `${coin.price_change_percentage_24h.toFixed(2)}%` :
                                            "N/A"
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Market Data */}
                            <Row className="small">
                                <Col xs={6}>
                                    <div className={`text-truncate ${darkMode ? "text-light" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                                        Vol: {formatLargeNumber(coin.total_volume)}
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className={`text-truncate ${darkMode ? "text-light" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                                        Cap: {formatLargeNumber(coin.market_cap)}
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

export default CoinCard;