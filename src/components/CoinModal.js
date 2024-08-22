import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
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

import axios from "axios";
import "./App.css";
import { formatTimestamp } from "./utils/formatTime";

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

  useEffect(() => {
    const fetchCoinHistory = async () => {
      if (coin && show && !coinHistory) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`, {
            params: {
              vs_currency: 'usd',
              days: '30',
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
    };

    fetchCoinHistory();
  }, [coin, show, coinHistory]);

  const contentClass = darkMode ? "content-dark" : "content-light";

  const formatNumber = (number) => (number ? number.toLocaleString() : "N/A");
  const formatCurrency = (number) => (number ? number.toFixed(2) : "N/A");

  return (
    <Modal show={show} onHide={handleClose} contentClassName={contentClass}>
      <Modal.Header closeButton>
        <Modal.Title>
          {coin?.name} ({coin?.symbol.toUpperCase()})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
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
            < >
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
        {loading && <p>Loading historical data...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && coinHistory && (
          <div className="chart-container">
            <h5>30-Day Price History</h5>
            <Line
              data={{
                labels: coinHistory.dates,
                datasets: [
                  {
                    label: `${coin?.name} Price`,
                    data: coinHistory.prices,
                    fill: false,
                    borderColor: 'rgba(75,192,192,1)',
                    tension: 0.1
                  }
                ]
              }}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CoinModal;
