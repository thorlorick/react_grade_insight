// src/components/GenericButton.jsx
import React from "react";
import styles from "./GenericButton.module.css";

const GenericButton = ({ onClick, children, type = "button" }) => {
  return (
    <button className={styles.button} onClick={onClick} type={type}>
      {children || "Click Me"} {/* Default text if no children */}
    </button>
  );
};

export default GenericButton;
