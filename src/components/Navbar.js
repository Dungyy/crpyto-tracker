import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Nav, Button } from "react-bootstrap";
import { toggleDarkMode } from "../features/coin/coinSlice";

const NavBar = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.coins.darkMode);

  return (
    <Navbar
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      expand="lg"
      fixed="top" 
    >
      <Navbar.Brand href="#home">Dingy Crypto </Navbar.Brand>
        <Nav >
          <Button
            className="btn btn-secondary"
            onClick={() => dispatch(toggleDarkMode())}
          >
            {darkMode ? "Light" : "Dark"} Mode
          </Button>
        </Nav>
    </Navbar>
  );
};

export default NavBar;