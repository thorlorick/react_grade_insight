// src/pages/StudentPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";

import GenericButton from "../components/GenericButton";
import StudentDashboardTable from "../components/StudentDashboardTable";
import styles from './StudentPage.module.css';
import { getStudentData } from "../api/studentApi";

const StudentPage = () => {
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getStudentData();
        setStudentData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle search input - simplified for assignment names only
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredData(studentData);
      return;
    }

    const filtered = studentData.filter(
      (row) =>
        row.assignment_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDownloadGrades = () => {
    // Create simplified CSV content
    const csvHeaders = ['Assignment', 'Grade'];
    const csvRows = studentData.map(row => [
      row.assignment_name || '',
      row.grade ? (row.max_points ? `${row.grade}/${row.max_points}` : row.grade) : 'Not graded'
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my_grades.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await getStudentData();
      setStudentData(data);
    } catch (error) {
      console.error("Failed to refresh student data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight">
        <GenericButton onClick={handleDownloadGrades}>
          Download My Grades
        </GenericButton>

        <GenericButton onClick={refreshData}>
          Refresh
        </GenericButton>
      </Navbar>

      <div className={styles.pageWrapper}>
        <StudentDashboardTable 
          data={studentData} 
          loading={loading}
        />
      </div>
    </div>
  );
};

export default StudentPage;