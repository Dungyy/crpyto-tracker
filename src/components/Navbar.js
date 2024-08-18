import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";

const NavBar = ({ darkMode, setDarkMode }) => {
  return (
    <Navbar
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      expand="lg"
    >
      <Navbar.Brand href="#home">Dingy Crypto </Navbar.Brand>
        <Nav className="toggle">
          <Button
            className="btn btn-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light" : "Dark"} Mode
          </Button>
        </Nav>
    </Navbar>
  );
};

export default NavBar;
