import React from 'react';
import styles from './StudentListTable.module.css'; // optional CSS module

const StudentListTable = ({ data = [] }) => {
  if (!data.length) return <p>No students to display</p>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Email</th>
          <th>Assignment</th>
          <th>Date</th>
          <th>Score</th>
          <th>Max Points</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.first_name} {row.last_name}</td>
            <td>{row.email}</td>
            <td>{row.assignment_name}</td>
            <td>{row.assignment_date}</td>
            <td>{row.score}</td>
            <td>{row.max_points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentListTable;
