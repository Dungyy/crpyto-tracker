import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";

const NavBar = ({ darkMode, setDarkMode }) => {
  return (
    <Navbar
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      expand="lg"
    >
      <Navbar.Brand href="#home" >Dingy Crypto </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Button
            className="btn btn-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
          {darkMode ? "Light" : "Dark"} Mode
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
