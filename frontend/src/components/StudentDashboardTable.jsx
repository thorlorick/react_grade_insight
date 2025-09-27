import React from 'react';

const StudentDashboardTable = ({ data, loading, error, onSort, sortConfig }) => {
  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
          <p className="mt-4 text-sky-300">Loading your grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <p className="text-red-400">Error loading grades: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <p className="text-gray-400">No grades found. Check back later for updates!</p>
        </div>
      </div>
    );
  }

  const formatGrade = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return "Not graded";
    if (maxPoints) return `${grade}/${maxPoints}`;
    return grade.toString();
  };

  const getGradeColorClass = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return 'text-red-400';
    const percentage = maxPoints ? (grade / maxPoints) * 100 : grade;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
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
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 sticky top-0 z-10">
              <th
                className="text-left p-4 text-sky-300 font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                onClick={() => onSort('assignment_name')}
              >
                Assignment{getSortIndicator('assignment_name')}
              </th>
              <th
                className="text-center p-4 text-sky-300 font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                onClick={() => onSort('grade')}
              >
                Grade{getSortIndicator('grade')}
              </th>
              <th
                className="text-center p-4 text-sky-300 font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                onClick={() => onSort('due_date')}
              >
                Due Date{getSortIndicator('due_date')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="text-white font-medium">
                    {row.assignment_name || "Unnamed Assignment"}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`font-mono font-semibold ${getGradeColorClass(row.grade, row.max_points)}`}>
                    {formatGrade(row.grade, row.max_points)}
                  </span>
                  {row.percentage && (
                    <div className="text-xs text-gray-400 mt-1">
                      ({row.percentage}%)
                    </div>
                  )}
                </td>
                <td className="p-4 text-center text-gray-300">
                  {row.due_date ? new Date(row.due_date).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboardTable;