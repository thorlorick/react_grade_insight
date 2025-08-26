// src/components/StudentDetailsPanel.jsx
import React from "react";
import styles from "./StudentDetailsPanel.module.css";

const StudentDetailsPanel = ({ student }) => {
  if (!student) return null;

  return (
    <div className={styles.panel}>
      <h2>
        {student.first_name} {student.last_name}
      </h2>
      <p>Email: {student.email}</p>

      <h3>Assignments</h3>
      {student.assignments && student.assignments.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Date</th>
              <th>Score</th>
              <th>Max Points</th>
            </tr>
          </thead>
          <tbody>
            {student.assignments.map((a, i) => (
              <tr key={i}>
                <td>{a.assignment_name}</td>
                <td>{a.assignment_date}</td>
                <td>{a.score}</td>
                <td>{a.max_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assignments yet.</p>
      )}
    </div>
  );
};

export default StudentDetailsPanel;
