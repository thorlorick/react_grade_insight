// components/gradeCalculations.js
export const calculateAverage = (assignments) => {
  const gradedAssignments = assignments.filter(
    a => a.grade !== null && a.grade !== undefined
  );
  if (gradedAssignments.length === 0) return null;

  const totalEarned = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);
  const totalPossible = gradedAssignments.reduce((sum, a) => sum + a.max_points, 0);

  if (totalPossible === 0) return null;

  return (totalEarned / totalPossible) * 100;
};

export const getLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const getGradeColorClass = (percentage, styles) => {
  if (percentage >= 90) return styles.gradeA;
  if (percentage >= 80) return styles.gradeB;
  if (percentage >= 70) return styles.gradeC;
  if (percentage >= 60) return styles.gradeD;
  return styles.gradeF;
};
