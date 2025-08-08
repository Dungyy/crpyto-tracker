import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { toggleDarkMode } from "../features/coin/coinSlice";
import { Sun, Moon, TrendingUp } from "lucide-react";

const NavBar = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.coins.darkMode);
  const coins = useSelector((state) => state.coins.coins);

  const getTotalMarketCap = () => {
    return coins.reduce((total, coin) => total + (coin.market_cap || 0), 0);
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${(value / 1e6).toFixed(2)}M`;
  };

  return (
    <Navbar
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      expand="lg"
      fixed="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <TrendingUp className="me-2" size={24} />
          <span className="fw-bold">Dingy Crypto</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {coins.length > 0 && (
              <Nav.Item className="d-flex align-items-center">
                <small className="text-muted me-2">Total Market Cap:</small>
                <span className="fw-bold">
                  {formatMarketCap(getTotalMarketCap())}
                </span>
              </Nav.Item>
            )}
          </Nav>

          <Nav>
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              size="sm"
              onClick={() => dispatch(toggleDarkMode())}
              className="d-flex align-items-center"
            >
              {darkMode ? (
                <>
                  <Sun size={16} className="me-1" />
                  Light
                </>
              ) : (
                <>
                  <Moon size={16} className="me-1" />
                  Dark
                </>
              )}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;