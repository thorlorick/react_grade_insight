// src/pages/TeacherPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";
import SearchBar from "../components/SearchBar";
import GenericButton from "../components/GenericButton";
import TeacherDashboardTable from "../components/TeacherDashboardTable";
import UploadButton from "../components/UploadButton";
import styles from './TeacherPage.module.css';
import { getTeacherData } from "../api/teacherApi";

// Import the tour component
import AppTour from "../components/AppTour";

const TeacherPage = () => {
  const [teacherData, setTeacherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getTeacherData();
        setTeacherData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle search input
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredData(teacherData);
      return;
    }

    const filtered = teacherData.filter(
      (row) =>
        row.first_name.toLowerCase().includes(query.toLowerCase()) ||
        row.last_name.toLowerCase().includes(query.toLowerCase()) ||
        row.email.toLowerCase().includes(query.toLowerCase()) ||
        row.assignment_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.csv";
    link.download = "template.csv";
    link.click();
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await getTeacherData();
      setTeacherData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Failed to refresh teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      {/* Add the tour component */}
      <AppTour />

      {/* Navbar */}
      <Navbar brand="Grade Insight">
        <SearchBar onSearch={handleSearch} />

        <UploadButton 
          className={styles.uploadButton}
          onUploadSuccess={(data) => {
            if (data.ok) {
              setUploadSummary(data);
              setUploadError(null);
              refreshData();
            } else {
              setUploadError(data.error);
              setUploadSummary(null);
            }
          }} 
          refreshStudents={refreshData}
        />

        <GenericButton 
          className={styles.downloadTemplate}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </GenericButton>
      </Navbar>

      {/* Upload feedback */}
      {uploadSummary && (
        <div className={styles.uploadSuccess}>
          <p>✅ Upload successful!</p>
          <p>File: {uploadSummary.file}</p>
          <p>Assignments processed: {uploadSummary.assignmentsCount}</p>
          <p>Students processed: {uploadSummary.studentsCount}</p>
        </div>
      )}
      
      {uploadError && (
        <div className={styles.uploadError}>
          <p>❌ Upload failed: {uploadError}</p>
        </div>
      )}

      {/* Dashboard */}
      <div className={`${styles.pageWrapper} teacher-dashboard`}>
        <TeacherDashboardTable 
          data={filteredData} 
          loading={loading}
        />
      </div>
    </div>
  );
};

export default TeacherPage;
