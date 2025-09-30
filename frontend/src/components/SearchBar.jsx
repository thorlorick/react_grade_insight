import React from "react";
import styles from "./SearchBar.module.css";

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <input
      className={`${styles.input} search-input`}
      type="text"
      placeholder="Search students..."
      onChange={handleChange}
    />
  );
};

export default SearchBar;
