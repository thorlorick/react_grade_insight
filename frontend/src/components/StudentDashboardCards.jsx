import React from 'react';
import styles from './StudentDashboardCards.module.css';

const StudentDashboardCards = ({ data, loading, error, onSort, sortConfig }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your grades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Error loading grades: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          No grades found. Check back later for updates!
        </div>
      </div>
    );
  }

  const formatGrade = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return "Not Graded";
    if (maxPoints) return `${grade}/${maxPoints}`;
    return grade.toString();
  };

  const getPercentage = (grade, maxPoints) => {
    if (grade === null || grade === undefined || !maxPoints) return null;
    return ((grade / maxPoints) * 100).toFixed(1);
  };

  const getGradeColorClass = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return styles.nograde;

    const percentage = maxPoints ? (grade / maxPoints) * 100 : grade;
    if (percentage >= 90) return styles.excellent;
    if (percentage >= 80) return styles.high;
    if (percentage >= 70) return styles.good;
    if (percentage >= 60) return styles.mid;
    return styles.low;
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  // Sort data based on current config
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' ? 
        aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className={styles.container}>
      {/* Sort Controls */}
      <div className={styles.controls}>
        <label>Sort by:</label>
        <select 
          value={sortConfig.key || ''} 
          onChange={(e) => onSort(e.target.value)}
        >
          <option value="">Default</option>
          <option value="assignment_name">Assignment Name{getSortIndicator('assignment_name')}</option>
          <option value="grade">Grade{getSortIndicator('grade')}</option>
        </select>
      </div>

      {/* Card Grid */}
      <div className={styles.grid}>
        {sortedData.map((assignment, index) => {
          const percentage = getPercentage(assignment.grade, assignment.max_points);
          const colorClass = getGradeColorClass(assignment.grade, assignment.max_points);
          
          return (
            <div key={index} className={`${styles.card} ${colorClass}`}>
              <div className={styles.name}>
                {assignment.assignment_name || "Unnamed Assignment"}
              </div>
              
              <div className={styles.average}>
                {percentage ? `${percentage}%` : formatGrade(assignment.grade, assignment.max_points)}
              </div>
              
              {percentage && (
                <div className={styles.gradeDetail}>
                  {formatGrade(assignment.grade, assignment.max_points)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboardCards;
