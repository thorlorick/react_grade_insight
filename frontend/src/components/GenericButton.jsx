import React from "react";
import styles from "./GenericButton.module.css";

const GenericButton = ({ label, onClick, type = "button", variant = "primary" }) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default GenericButton;

