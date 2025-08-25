import React from "react";
import styles from "./SearchBar.module.css";

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
  const handleChange = (e) => {
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      className={styles.searchBar}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default SearchBar;

