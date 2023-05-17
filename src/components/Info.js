import React from "react";
import "./App.css";
import { Button } from "react-bootstrap";

const Info = ({ darkMode, setDarkMode }) => {
  return (
    <div bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"}>
      <Button onClick={() => setDarkMode(!darkMode)}>
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </Button>
      <br />
    </div>
  );
};

export default Info;
