import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Modal,
    Button,
    Table,
    Form,
    Row,
    Col,
    Alert,
    Card
} from "react-bootstrap";
import {
    addToPortfolio,
    removeFromPortfolio,
    updatePortfolioAmount
} from "../features/coin/coinSlice";
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const PortfolioModal = ({ show, onClose, darkMode }) => {
    const dispatch = useDispatch();
    const portfolio = useSelector((state) => state.coins.portfolio);
    const coins = useSelector((state) => state.coins.coins);

    const [newHolding, setNewHolding] = useState({
        coinId: '',
        symbol: '',
        amount: '',
        purchasePrice: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

    const getPortfolioStats = () => {
        let totalValue = 0;
        let totalPnL = 0;
        let totalInvested = 0;

        portfolio.forEach(holding => {
            const coin = coins.find(c => c.id === holding.coinId);
            if (coin) {
                const currentValue = coin.current_price * holding.amount;
                const investedValue = holding.purchasePrice * holding.amount;
                totalValue += currentValue;
                totalInvested += investedValue;
                totalPnL += (currentValue - investedValue);
            }
        });

        return {
            totalValue,
            totalPnL,
            totalInvested,
            totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
        };
    };

    const getHoldingStats = (holding) => {
        const coin = coins.find(c => c.id === holding.coinId);
        if (!coin) return null;

        const currentValue = coin.current_price * holding.amount;
        const investedValue = holding.purchasePrice * holding.amount;
        const pnl = currentValue - investedValue;
        const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

        return {
            coin,
            currentValue,
            investedValue,
            pnl,
            pnlPercentage,
            currentPrice: coin.current_price
        };
    };

    const handleAddHolding = () => {
        if (newHolding.coinId && newHolding.amount && newHolding.purchasePrice) {
            dispatch(addToPortfolio({
                coinId: newHolding.coinId,
                symbol: newHolding.symbol,
                amount: parseFloat(newHolding.amount),
                purchasePrice: parseFloat(newHolding.purchasePrice)
            }));

            setNewHolding({ coinId: '', symbol: '', amount: '', purchasePrice: '' });
            setShowAddForm(false);
        }
    };

    const handleRemoveHolding = (coinId) => {
        if (window.confirm('Are you sure you want to remove this holding?')) {
            dispatch(removeFromPortfolio(coinId));
        }
    };

    const handleUpdateAmount = (coinId, newAmount) => {
        if (newAmount > 0) {
            dispatch(updatePortfolioAmount({ coinId, amount: parseFloat(newAmount) }));
        }
    };

    const stats = getPortfolioStats();

    const contentClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";

    return (
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            contentClassName={contentClass}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <DollarSign className="me-2" size={24} />
                    Portfolio Management
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Portfolio Summary */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total Value</h6>
                                <h4 className="mb-0">${stats.totalValue.toLocaleString()}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total Invested</h6>
                                <h4 className="mb-0">${stats.totalInvested.toLocaleString()}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total P&L</h6>
                                <h4 className={`mb-0 ${stats.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stats.totalPnL >= 0 ? <TrendingUp className="me-1" size={20} /> : <TrendingDown className="me-1" size={20} />}
                                    ${stats.totalPnL.toFixed(2)}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">P&L %</h6>
                                <h4 className={`mb-0 ${stats.totalPnLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stats.totalPnLPercentage.toFixed(2)}%
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Add New Holding Button */}
                <div className="mb-3">
                    <Button
                        variant="primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="d-flex align-items-center"
                    >
                        <Plus size={16} className="me-1" />
                        Add New Holding
                    </Button>
                </div>

                {/* Add New Holding Form */}
                {showAddForm && (
                    <Card className={`mb-3 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Cryptocurrency</Form.Label>
                                        <Form.Select
                                            value={newHolding.coinId}
                                            onChange={(e) => {
                                                const selectedCoin = coins.find(c => c.id === e.target.value);
                                                setNewHolding({
                                                    ...newHolding,
                                                    coinId: e.target.value,
                                                    symbol: selectedCoin ? selectedCoin.symbol : ''
                                                });
                                            }}
                                        >
                                            <option value="">Select a cryptocurrency</option>
                                            {coins.slice(0, 100).map(coin => (
                                                <option key={coin.id} value={coin.id}>
                                                    {coin.name} ({coin.symbol.toUpperCase()})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            value={newHolding.amount}
                                            onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Purchase Price ($)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            value={newHolding.purchasePrice}
                                            onChange={(e) => setNewHolding({ ...newHolding, purchasePrice: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                    <Button
                                        variant="success"
                                        onClick={handleAddHolding}
                                        disabled={!newHolding.coinId || !newHolding.amount || !newHolding.purchasePrice}
                                        className="me-2"
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAddForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {/* Portfolio Holdings Table */}
                {portfolio.length > 0 ? (
                    <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Amount</th>
                                <th>Purchase Price</th>
                                <th>Current Price</th>
                                <th>Current Value</th>
                                <th>P&L</th>
                                <th>P&L %</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map((holding) => {
                                const stats = getHoldingStats(holding);
                                if (!stats) return null;

                                return (
                                    <tr key={holding.coinId}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={stats.coin.image}
                                                    alt={stats.coin.name}
                                                    width="24"
                                                    height="24"
                                                    className="me-2 rounded-circle"
                                                />
                                                <div>
                                                    <div className="fw-bold">{stats.coin.name}</div>
                                                    <small className="text-muted">{stats.coin.symbol.toUpperCase()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                step="any"
                                                value={holding.amount}
                                                onChange={(e) => handleUpdateAmount(holding.coinId, e.target.value)}
                                                style={{ width: '100px' }}
                                                size="sm"
                                            />
                                        </td>
                                        <td>${holding.purchasePrice.toFixed(4)}</td>
                                        <td>${stats.currentPrice.toFixed(4)}</td>
                                        <td>${stats.currentValue.toFixed(2)}</td>
                                        <td className={stats.pnl >= 0 ? 'text-success' : 'text-danger'}>
                                            {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                                        </td>
                                        <td className={stats.pnlPercentage >= 0 ? 'text-success' : 'text-danger'}>
                                            {stats.pnlPercentage >= 0 ? '+' : ''}{stats.pnlPercentage.toFixed(2)}%
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveHolding(holding.coinId)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info">
                        <h5>No Holdings Yet</h5>
                        <p>Start building your portfolio by adding your first cryptocurrency holding!</p>
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PortfolioModal;