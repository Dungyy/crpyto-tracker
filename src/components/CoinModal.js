import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';
import { debounce } from 'lodash';
import PulseLoader from "react-spinners/PulseLoader";
import axios from "axios";
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

const CoinModal = ({ show, handleClose, coin, darkMode }) => {
  const [coinHistory, setCoinHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(1);
  const [inputVisible, setInputVisible] = useState(true);

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
    }, 3500), // Consider lowering debounce time to see if it affects behavior
    [coin, show] // Make sure dependencies are exactly needed ones
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


  useEffect(() => {
    fetchCoinHistoryDebounced(days);
    return () => {
      fetchCoinHistoryDebounced.cancel();
    };
  }, [days, fetchCoinHistoryDebounced]);

  const contentClass = darkMode ? "content-dark" : "content-light";

  const formatNumber = (number) => (number ? number.toLocaleString() : "N/A");
  const formatCurrency = (number) => (number ? number.toFixed(2) : "N/A");

  const handleDaysChange = (e) => {
    setDays(e.target.value);
  };

  const handleRefreshClick = () => {
    fetchCoinHistory(); // Trigger immediate fetch when the refresh button is clicked
  };

  const toggleInputVisibility = () => {
    setInputVisible(!inputVisible); // Toggle input visibility
  };

  // Determine the color of the line based on the trend
  const getColorForTrend = (prices) => {
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return lastPrice >= firstPrice ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'; // green for +, red for -
  };

  return (
    <Modal show={show} onHide={handleClose} contentClassName={contentClass}>
      <Modal.Header closeButton>
        <Modal.Title>
          {coin?.name} ({coin?.symbol.toUpperCase()})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body mt-3">
        <div className="coin-image-container">
          <img src={coin?.image} alt={`${coin?.name} logo`} className="coin-image" />
        </div>
        <div className="text-container">
          <div className="left-half">
            <p>
              <span>Current Price: $</span><span>{formatCurrency(coin?.current_price)}</span>
            </p>
            <p>
              <span>Market Cap: $</span><span>{formatNumber(coin?.market_cap)}</span>
            </p>
            <p>
              <span>Market Cap Rank: </span><span>{coin?.market_cap_rank}</span>
            </p>
            <p>
              <span>Fully Diluted Valuation: $</span>
              <span>{formatNumber(coin?.fully_diluted_valuation)}</span>
            </p>
            <p>
              <span>Total Volume: $</span>
              <span>{formatNumber(coin?.total_volume)}</span>
            </p>
            <p>
              <span>High 24h: $</span><span>{formatCurrency(coin?.high_24h)}</span>
            </p>
            <p>
              <span>Low 24h: $</span><span>{formatCurrency(coin?.low_24h)}</span>
            </p>
            <p>
              <span>Price Change 24h: $</span><span>{formatCurrency(coin?.price_change_24h)}</span>
            </p>
          </div>
          <div className="right-half">
            <p>
              <span>Price Change Percentage 24h:</span>{" "}
              <span className={coin?.price_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
                {coin?.price_change_percentage_24h ? coin?.price_change_percentage_24h.toFixed(2) : "N/A"}%
              </span>
            </p>
            <p>
              <span>Market Cap Change 24h: $</span>
              <span>{formatNumber(coin?.market_cap_change_24h)}</span>
            </p>
            <p>
              <span>Market Cap Change Percentage 24h:</span>{" "}
              <span className={coin?.market_cap_change_percentage_24h > 0 ? "text-success" : "text-danger"}>
                {coin?.market_cap_change_percentage_24h ? coin?.market_cap_change_percentage_24h.toFixed(2) : "N/A"}%
              </span>
            </p>
            <p>
              <span>Circulating Supply: </span><span>{formatNumber(coin?.circulating_supply)}</span>
            </p>
            <p>
              <span>Total Supply: </span><span>{formatNumber(coin?.total_supply)}</span>
            </p>
            <p>
              <span>Max Supply: </span>
              <span>{coin?.max_supply ? formatNumber(coin?.max_supply) : "N/A"}</span>
            </p>

            {coin?.roi && (
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
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <PulseLoader color={darkMode ? "#f8f9fa" : "#343a40"} loading={loading} size={40} />
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : coinHistory ? (
          <div className="chart-container">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="m-1 p-1">
                {days} Day Price History
                <span
                  onClick={toggleInputVisibility}
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                >
                  {inputVisible ? <FaCaretDown /> : <FaCaretRight />}
                </span>
              </h5>
              {inputVisible && (
                <div className="d-flex align-items-center m-1">
                  <Form.Control
                    type="number"
                    value={days}
                    onChange={handleDaysChange}
                    min="1"
                    max="365"
                    style={{ width: '80px', marginLeft: '10px' }}
                    size="sm"
                  />
                  <Button
                    variant={darkMode ? "dark" : "light"}
                    onClick={handleRefreshClick}
                    className="ms-2"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
            <Line
              data={{
                labels: coinHistory.dates,
                datasets: [
                  {
                    label: `${coin?.name} Price`,
                    data: coinHistory.prices,
                    fill: false,
                    borderColor: getColorForTrend(coinHistory.prices),
                    backgroundColor: getColorForTrend(coinHistory.prices),
                    tension: 0.1
                  }
                ]
              }}
            />
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={darkMode ? "dark" : "light"} onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;
