import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import TeacherDashboardTable from "../components/TeacherDashboardTable";
import styles from './TeacherPage.module.css';
import { getTeacherData } from "../api/teacherApi";

const TeacherPage = () => {
  const [teacherData, setTeacherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [uploadError, setUploadError] = useState(null);

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
      {/* Navbar */}
      <Navbar
        brand="Grade Insight"
        links={[
          { label: 'Upload', onClick: refreshData },
          { label: 'Download Template', onClick: handleDownloadTemplate }
        ]}
      >
        <SearchBar onSearch={handleSearch} />
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
