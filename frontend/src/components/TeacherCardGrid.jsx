// src/components/TeacherCardGrid.jsx
import React, { useState } from 'react';
import styles from './TeacherCardGrid.module.css';
import StudentCard from './StudentCard'; // reuse your existing student card modal

const TeacherCardGrid = ({ data, loading }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'average'

  if (loading) {
    return <div className={styles.loading}>Loading students...</div>;
  }

  // Group data by student and calculate averages
  const studentMap = {};
  data.forEach(row => {
    const key = row.email;
    if (!studentMap[key]) {
      studentMap[key] = {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        grades: [],
      };
    }
    if (row.grade !== null && row.grade !== undefined) {
      studentMap[key].grades.push(parseFloat(row.grade));
    }
  });

  // Convert to array and add averages
  const students = Object.values(studentMap).map(student => ({
    ...student,
    average: student.grades.length > 0
      ? (student.grades.reduce((a, b) => a + b, 0) / student.grades.length).toFixed(1)
      : null,
  }));

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
    } else {
      // Sort by average (null/no grades go to end)
      if (a.average === null) return 1;
      if (b.average === null) return -1;
      return parseFloat(b.average) - parseFloat(a.average);
    }
  });

  // Get grade color
  const getGradeColor = (avg) => {
    if (avg === null) return 'gray';
    if (avg >= 90) return 'green';
    if (avg >= 80) return 'blue';
    if (avg >= 70) return 'yellow';
    if (avg >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className={styles.container}>
      {/* Sort controls */}
      <div className={styles.controls}>
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name (A-Z)</option>
          <option value="average">Average (High to Low)</option>
        </select>
      </div>

      {/* Card grid */}
      <div className={styles.grid}>
        {sortedStudents.map((student) => (
          <div
            key={student.email}
            className={`${styles.card} ${styles[getGradeColor(student.average)]}`}
            onClick={() => setSelectedStudent(student)}
          >
            <div className={styles.name}>
              {student.first_name} {student.last_name}
            </div>
            <div className={styles.average}>
              {student.average !== null ? `${student.average}%` : 'No grades'}
            </div>
            <div className={styles.gradeCount}>
              {student.grades.length} assignment{student.grades.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Student detail modal (reuse your existing StudentCard) */}
      {selectedStudent && (
        <StudentCard
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default TeacherCardGrid;
