import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button, Form, Row, Col, Card, Badge, Alert, InputGroup } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FaCaretDown,
  FaCaretRight
} from 'react-icons/fa';
import {
  Heart,
  Plus,
  Bell,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Star,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { debounce } from 'lodash';
import PulseLoader from "react-spinners/PulseLoader";
import axios from "axios";
import {
  toggleFavorite,
  addToPortfolio,
  addPriceAlert
} from "../features/coin/coinSlice";
import "./App.css";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const CoinModal = ({ show, onClose, coin, darkMode }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.coins.favorites);
  const portfolio = useSelector((state) => state.coins.portfolio);
  const notifications = useSelector((state) => state.coins.notifications);

  const [coinHistory, setCoinHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(1);
  const [inputVisible, setInputVisible] = useState(true);

  // Portfolio form state
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    amount: '',
    purchasePrice: coin?.current_price || ''
  });

  // Price alert form state
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({
    targetPrice: '',
    type: 'above'
  });

  const isFavorite = coin ? favorites.includes(coin.id) : false;
  const existingHolding = coin ? portfolio.find(h => h.coinId === coin.id) : null;
  const existingAlerts = coin ? notifications.filter(n => n.coinId === coin.id) : [];

  // Update purchase price when coin changes
  useEffect(() => {
    if (coin) {
      setPortfolioForm(prev => ({
        ...prev,
        purchasePrice: coin.current_price.toString()
      }));
    }
  }, [coin]);

  // Debounced function to update the coin history based on days
  const fetchCoinHistoryDebounced = useCallback(
    debounce(async (days) => {
      if (coin && show) {
        setLoading(true);
        setError(null);
        setCoinHistory(null);
        try {
          const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`, {
            params: {
              vs_currency: 'usd',
              days: days.toString(),
            },
          });
          const data = response.data.prices.map((price) => ({
            date: new Date(price[0]),
            price: price[1],
          }));
          setCoinHistory({
            dates: data.map(d => d.date.toISOString().split('T')[0]),
            prices: data.map(d => d.price),
          });
        } catch (error) {
          setError("Error loading historical data: " + error.message);
        } finally {
          setLoading(false);
        }
      }
    }, 1000),
    [coin, show]
  );

  useEffect(() => {
    if (days > 0) {
      fetchCoinHistoryDebounced(days);
      return () => {
        fetchCoinHistoryDebounced.cancel();
      };
    }
  }, [days, fetchCoinHistoryDebounced]);

  // Immediate function to fetch data when refresh button is clicked
  const fetchCoinHistory = useCallback(async () => {
    if (coin && show) {
      setLoading(true);
      setError(null);
      setCoinHistory(null);
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days.toString(),
          },
        });
        const data = response.data.prices.map((price) => ({
          date: new Date(price[0]),
          price: price[1],
        }));

        setCoinHistory({
          dates: data.map(d => d.date.toISOString().split('T')[0]),
          prices: data.map(d => d.price),
        });
      } catch (error) {
        setError("Error loading historical data: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  }, [coin, show, days]);

  const contentClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";

  const formatNumber = (number) => (number ? number.toLocaleString() : "N/A");
  const formatCurrency = (number) => (number ? number.toFixed(2) : "N/A");

  const handleDaysChange = (e) => {
    setDays(e.target.value);
  };

  const handleRefreshClick = () => {
    fetchCoinHistory();
  };

  const toggleInputVisibility = () => {
    setInputVisible(!inputVisible);
  };

  const handleFavoriteToggle = () => {
    if (coin) {
      dispatch(toggleFavorite(coin.id));
    }
  };

  const handleAddToPortfolio = () => {
    if (coin && portfolioForm.amount && portfolioForm.purchasePrice) {
      dispatch(addToPortfolio({
        coinId: coin.id,
        symbol: coin.symbol,
        amount: parseFloat(portfolioForm.amount),
        purchasePrice: parseFloat(portfolioForm.purchasePrice)
      }));
      setShowPortfolioForm(false);
      setPortfolioForm({ amount: '', purchasePrice: coin.current_price.toString() });
    }
  };

  const handleAddPriceAlert = () => {
    if (coin && alertForm.targetPrice) {
      dispatch(addPriceAlert({
        coinId: coin.id,
        targetPrice: parseFloat(alertForm.targetPrice),
        type: alertForm.type
      }));
      setShowAlertForm(false);
      setAlertForm({ targetPrice: '', type: 'above' });
    }
  };

  // Determine the color of the line based on the trend
  const getColorForTrend = (prices) => {
    if (!prices || prices.length === 0) return 'rgba(75, 192, 192, 1)';
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return lastPrice >= firstPrice ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
  };

  const getPortfolioStats = () => {
    if (!existingHolding || !coin) return null;

    const currentValue = coin.current_price * existingHolding.amount;
    const investedValue = existingHolding.purchasePrice * existingHolding.amount;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return { currentValue, investedValue, pnl, pnlPercentage };
  };

  const portfolioStats = getPortfolioStats();

  return (
    <Modal
      show={show}
      onHide={onClose}
      contentClassName={contentClass}
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-3">
          <img
            src={coin?.image}
            alt={`${coin?.name} logo`}
            width="50"
            height="50"
            className="me-2"
          />
          {coin?.name} ({coin?.symbol.toUpperCase()})
          <Badge bg="secondary" className="ms-2 gap-5">
            #{coin?.market_cap_rank}
          </Badge>
        </Modal.Title>
        <div className="d-flex gap-4">
          <Button
            variant={isFavorite ? "warning" : "outline-warning"}
            size="sm"
            onClick={handleFavoriteToggle}
          >
            <Star size={25} className={isFavorite ? "text-white" : ""} />
          </Button>
          
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => window.open(`https://coingecko.com/en/coins/${coin?.id}`, '_blank')}
          >
            <ExternalLink size={25} />
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {/* Quick Actions Row */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => setShowPortfolioForm(!showPortfolioForm)}
              >
                <Plus size={16} className="me-1" />
                {existingHolding ? 'Update Portfolio' : 'Add to Portfolio'}
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowAlertForm(!showAlertForm)}
              >
                <Bell size={16} className="me-1" />
                Set Price Alert
              </Button>
            </div>
          </Col>
        </Row>

        {/* Portfolio Form */}
        {showPortfolioForm && (
          <Card className={`mb-3 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
            <Card.Body>
              <h6>Add to Portfolio</h6>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={portfolioForm.amount}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, amount: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Purchase Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      value={portfolioForm.purchasePrice}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, purchasePrice: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="success" onClick={handleAddToPortfolio} className="me-2">
                    Add
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPortfolioForm(false)}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Price Alert Form */}
        {showAlertForm && (
          <Card className={`mb-3 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
            <Card.Body>
              <h6>Set Price Alert</h6>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Target Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={alertForm.targetPrice}
                      onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Alert Type</Form.Label>
                    <Form.Select
                      value={alertForm.type}
                      onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                    >
                      <option value="above">When price goes above</option>
                      <option value="below">When price goes below</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="primary" onClick={handleAddPriceAlert} className="me-2">
                    Set Alert
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAlertForm(false)}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Existing Portfolio Holdings */}
        {portfolioStats && (
          <Alert variant={portfolioStats.pnl >= 0 ? "success" : "danger"}>
            <h6>Your Holdings</h6>
            <Row>
              <Col md={3}>
                <strong>Amount:</strong> {existingHolding.amount} {coin?.symbol.toUpperCase()}
              </Col>
              <Col md={3}>
                <strong>Current Value:</strong> ${portfolioStats.currentValue.toFixed(2)}
              </Col>
              <Col md={3}>
                <strong>P&L:</strong> ${portfolioStats.pnl.toFixed(2)}
              </Col>
              <Col md={3}>
                <strong>P&L %:</strong> {portfolioStats.pnlPercentage.toFixed(2)}%
              </Col>
            </Row>
          </Alert>
        )}

        {/* Existing Price Alerts */}
        {existingAlerts.length > 0 && (
          <Alert variant="info">
            <h6>Active Price Alerts</h6>
            {existingAlerts.map(alert => (
              <div key={alert.id}>
                Alert when price goes {alert.type} ${alert.targetPrice}
              </div>
            ))}
          </Alert>
        )}

        {/* Price and Stats Grid */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className={`h-100 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
              <Card.Body>
                <h5>Price Information</h5>
                <div className="row">
                  <div className="col-6">
                    <p><strong>Current Price:</strong> ${formatCurrency(coin?.current_price)}</p>
                    <p><strong>Market Cap:</strong> ${formatNumber(coin?.market_cap)}</p>
                    <p><strong>24h High:</strong> ${formatCurrency(coin?.high_24h)}</p>
                    <p><strong>24h Low:</strong> ${formatCurrency(coin?.low_24h)}</p>
                  </div>
                  <div className="col-6">
                    <p>
                      <strong>24h Change:</strong>{" "}
                      <span className={coin?.price_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
                        {coin?.price_change_percentage_24h > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {coin?.price_change_percentage_24h ? coin?.price_change_percentage_24h.toFixed(2) : "N/A"}%
                      </span>
                    </p>
                    <p><strong>Volume:</strong> ${formatNumber(coin?.total_volume)}</p>
                    <p><strong>Circulating Supply:</strong> {formatNumber(coin?.circulating_supply)}</p>
                    <p><strong>Max Supply:</strong> {coin?.max_supply ? formatNumber(coin?.max_supply) : "N/A"}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className={`h-100 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
              <Card.Body>
                <h5>Market Information</h5>
                <p><strong>Market Cap Rank:</strong> #{coin?.market_cap_rank}</p>
                <p><strong>Fully Diluted Valuation:</strong> ${formatNumber(coin?.fully_diluted_valuation)}</p>
                <p>
                  <strong>Market Cap Change 24h:</strong>{" "}
                  <span className={coin?.market_cap_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
                    {coin?.market_cap_change_percentage_24h ? coin?.market_cap_change_percentage_24h.toFixed(2) : "N/A"}%
                  </span>
                </p>
                <p><strong>Total Supply:</strong> {formatNumber(coin?.total_supply)}</p>

                {coin?.roi && (
                  <>
                    <p>
                      <strong>ROI:</strong>{" "}
                      <span className={coin.roi.times > 0 ? "text-success" : "text-danger"}>
                        {coin.roi.times ? coin.roi.times.toFixed(2) : "N/A"}x ({coin.roi.percentage ? coin.roi.percentage.toFixed(2) : "N/A"}%)
                      </span>
                    </p>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Chart Section */}
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <PulseLoader color={darkMode ? "#f8f9fa" : "#343a40"} loading={loading} size={40} />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : coinHistory ? (
          <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'}`}>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                  {days} Day Price History
                  <span
                    onClick={toggleInputVisibility}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                  >
                    {inputVisible ? <FaCaretDown /> : <FaCaretRight />}
                  </span>
                </h5>
                {inputVisible && (
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="number"
                      value={days}
                      onChange={handleDaysChange}
                      min="1"
                      max="365"
                      style={{ width: '80px' }}
                      size="sm"
                      className="me-2"
                    />
                    <Button
                      variant={darkMode ? "dark" : "light"}
                      onClick={handleRefreshClick}
                      size="sm"
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                )}
              </div>
              <Line
                data={{
                  labels: coinHistory.dates,
                  datasets: [
                    {
                      label: `${coin?.name} Price (USD)`,
                      data: coinHistory.prices,
                      fill: false,
                      borderColor: getColorForTrend(coinHistory.prices),
                      backgroundColor: getColorForTrend(coinHistory.prices),
                      tension: 0.1,
                      pointRadius: 0,
                      pointHoverRadius: 4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: darkMode ? '#f8f9fa' : '#343a40',
                        callback: function (value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      grid: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: darkMode ? '#f8f9fa' : '#343a40',
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        ) : null}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;