// src/pages/TeacherPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";
import SearchBar from "../components/SearchBar";
import TeacherDashboardTable from "../components/TeacherDashboardTable";
import { useUploadCSV } from '../hooks/useUploadCSV';
import styles from './TeacherPage.module.css';
import { getTeacherData } from "../api/teacherApi";

const TeacherPage = () => {
  const [teacherData, setTeacherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload feedback
  const [uploadSummary, setUploadSummary] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Hook for uploading CSVs
  const { uploadCSV } = useUploadCSV(async (refreshedData) => {
    setTeacherData(refreshedData);
    setFilteredData(refreshedData);
  });

  // Fetch teacher data on mount
  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, []);

  // Search handler
  const handleSearch = (query) => {
    if (!query.trim()) return setFilteredData(teacherData);

    const filtered = teacherData.filter(
      (row) =>
        row.first_name.toLowerCase().includes(query.toLowerCase()) ||
        row.last_name.toLowerCase().includes(query.toLowerCase()) ||
        row.email.toLowerCase().includes(query.toLowerCase()) ||
        row.assignment_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // File upload handler triggered from Navbar
  const handleUploadCSV = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = await uploadCSV(file);
      if (data.ok) {
        setUploadSummary(data);
        setUploadError(null);
      } else {
        setUploadError(data.error);
        setUploadSummary(null);
      }
    };
    fileInput.click();
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/upload_template.csv";
    link.download = "upload_template.csv";
    link.click();
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <div className={styles.body}>
      <Navbar
        brand="Grade Insight"
        links={[
          { label: 'Upload CSV', onClick: handleUploadCSV },
          { label: 'Download Template', onClick: handleDownloadTemplate },
          { label: 'Logout', onClick: handleLogout },
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

      <div className={styles.pageWrapper}>
        <TeacherDashboardTable 
          data={filteredData} 
          loading={loading}
        />
      </div>
    </div>
  );
};

export default TeacherPage;
