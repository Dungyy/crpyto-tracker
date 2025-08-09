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
    Badge,
    Card,
} from "react-bootstrap";
import {
    addToPortfolio,
    removeFromPortfolio,
    updatePortfolioAmount
} from "../../features/coin/coinSlice";
import { usePortfolio } from "../../hooks/usePortfolio";
import { calculateHoldingStats } from "../utils/calculations";
import { formatPrice, formatPercentage } from "../utils/formatting";
import { Trash2, Plus, TrendingUp, TrendingDown, Briefcase } from "lucide-react";
// import "./PortfolioManager.css";

const PortfolioManager = ({ show, onClose, darkMode }) => {
    const dispatch = useDispatch();
    const coins = useSelector(state => state.coins.coins);

    const {
        portfolio,
        portfolioValue,
        portfolioPnL,
        portfolioPercentage,
        topPerformers
    } = usePortfolio();

    const [newHolding, setNewHolding] = useState({
        coinId: '',
        symbol: '',
        amount: '',
        purchasePrice: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

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

    const handleCoinSelect = (coinId) => {
        const selectedCoin = coins.find(c => c.id === coinId);
        if (selectedCoin) {
            setNewHolding({
                ...newHolding,
                coinId: coinId,
                symbol: selectedCoin.symbol,
                purchasePrice: selectedCoin.current_price.toString()
            });
        }
    };

    const contentClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";

    return (
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            contentClassName={contentClass}
            className="portfolio-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <Briefcase className="me-2" size={24} />
                    Portfolio Management
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Portfolio Summary Cards */}
                <Row className="mb-4 g-2">
                    <Col xs={6} md={3}>
                        <Card className={`summary-card ${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total Value</h6>
                                <h4 className="mb-0 portfolio-value">
                                    {formatPrice(portfolioValue)}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className={`summary-card ${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total Invested</h6>
                                <h4 className="mb-0">
                                    {formatPrice(portfolioValue - portfolioPnL)}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className={`summary-card ${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">Total P&L</h6>
                                <h4 className={`mb-0 ${portfolioPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {portfolioPnL >= 0 ? (
                                        <TrendingUp className="me-1" size={20} />
                                    ) : (
                                        <TrendingDown className="me-1" size={20} />
                                    )}
                                    {formatPrice(Math.abs(portfolioPnL))}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className={`summary-card ${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                            <Card.Body className="text-center">
                                <h6 className="text-muted mb-1">P&L %</h6>
                                <h4 className={`mb-0 ${portfolioPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatPercentage(portfolioPercentage)}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Stats */}
                {topPerformers.length > 0 && (
                    <Row className="mb-4 g-2">
                        <Col xs={12} md={6}>
                            <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                                <Card.Body>
                                    <h6 className="card-title">Top Performer</h6>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={topPerformers[0].coin.image}
                                            width="24"
                                            height="24"
                                            className="me-2 rounded-circle"
                                            alt={topPerformers[0].coin.name}
                                        />
                                        <div>
                                            <strong>{topPerformers[0].coin.name}</strong>
                                            <div className="text-success">
                                                +{formatPercentage(topPerformers[0].pnlPercentage)}
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card className={`${darkMode ? 'bg-secondary' : 'bg-light'} border-0`}>
                                <Card.Body>
                                    <h6 className="card-title">Holdings Count</h6>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h4 className="mb-0">{portfolio.length}</h4>
                                            <small className="text-muted">Different cryptocurrencies</small>
                                        </div>
                                        <Badge bg="primary" className="holdings-badge">
                                            Active
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Add New Holding Section */}
                <div className="add-holding-section mb-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                        <h5 className="section-title mb-2 mb-md-0">Your Holdings</h5>
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
                        <Card className={`add-form-card mb-3 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                            <Card.Body>
                                <h6 className="form-title mb-3">Add New Cryptocurrency Holding</h6>
                                <Row className="g-2">
                                    <Col xs={12} md={3}>
                                        <Form.Group>
                                            <Form.Label>Cryptocurrency</Form.Label>
                                            <Form.Select
                                                value={newHolding.coinId}
                                                onChange={(e) => handleCoinSelect(e.target.value)}
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
                                    <Col xs={12} md={3}>
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
                                    <Col xs={12} md={3}>
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
                                    <Col xs={12} md={3} className="d-flex flex-column flex-md-row align-items-stretch">
                                        <Button
                                            variant="success"
                                            onClick={handleAddHolding}
                                            disabled={!newHolding.coinId || !newHolding.amount || !newHolding.purchasePrice}
                                            className="me-md-2 mb-2 mb-md-0 w-100"
                                        >
                                            Add Holding
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowAddForm(false)}
                                            className="w-100"
                                        >
                                            Cancel
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </div>

                {/* Portfolio Holdings Table */}
                {portfolio.length > 0 ? (
                    <div className="holdings-table-container table-responsive">
                        <Table striped bordered hover variant={darkMode ? "dark" : "light"} className="holdings-table mb-0">
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
                                    const coin = coins.find(c => c.id === holding.coinId);
                                    const stats = calculateHoldingStats(holding, coin);

                                    if (!stats) return null;

                                    return (
                                        <tr key={holding.coinId} className="holding-row">
                                            <td>
                                                <div className="d-flex align-items-center asset-cell">
                                                    <img
                                                        src={coin.image}
                                                        alt={coin.name}
                                                        width="24"
                                                        height="24"
                                                        className="me-2 rounded-circle"
                                                    />
                                                    <div>
                                                        <div className="fw-bold asset-name">{coin.name}</div>
                                                        <small className="text-muted asset-symbol">
                                                            {coin.symbol.toUpperCase()}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    step="any"
                                                    value={holding.amount}
                                                    onChange={(e) => handleUpdateAmount(holding.coinId, e.target.value)}
                                                    className="amount-input"
                                                    size="sm"
                                                />
                                            </td>
                                            <td className="price-cell">{formatPrice(holding.purchasePrice)}</td>
                                            <td className="price-cell">{formatPrice(stats.currentPrice)}</td>
                                            <td className="value-cell">{formatPrice(stats.currentValue)}</td>
                                            <td className={`pnl-cell ${stats.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {stats.pnl >= 0 ? '+' : ''}{formatPrice(Math.abs(stats.pnl))}
                                            </td>
                                            <td className={`pnl-percent-cell ${stats.pnlPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {stats.pnlPercentage >= 0 ? '+' : ''}{formatPercentage(stats.pnlPercentage)}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveHolding(holding.coinId)}
                                                    className="remove-btn"
                                                    title="Remove holding"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="info" className="empty-portfolio-alert">
                        <div className="text-center">
                            <Briefcase size={48} className="mb-3 opacity-50" />
                            <h5>No Holdings Yet</h5>
                            <p>Start building your portfolio by adding your first cryptocurrency holding!</p>
                        </div>
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer className="portfolio-footer">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 gap-2">
                    <small className="text-muted">
                        Portfolio last updated: {new Date().toLocaleTimeString()}
                    </small>
                    <Button variant="secondary" onClick={onClose}>
                        Close Portfolio
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PortfolioManager;