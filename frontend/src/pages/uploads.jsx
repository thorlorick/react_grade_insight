// src/pages/Uploads.jsx
import React from "react";

export default function Uploads() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload Grades</h1>
      <form>
        <label htmlFor="file">Select CSV File:</label>
        <input type="file" id="file" name="file" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
