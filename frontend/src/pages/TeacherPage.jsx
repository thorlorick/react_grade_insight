// src/pages/TeacherPage.jsx
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
  const [isUploading, setIsUploading] = useState(false);

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

  // Handle template download
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.csv";
    link.download = "template.csv";
    link.click();
  };

  // Handle upload success (matching your original UploadButton pattern)
  const handleUploadSuccess = (data) => {
    if (data.ok) {
      setUploadSummary(data);
      setUploadError(null);
      refreshData();
    } else {
      setUploadError(data.error);
      setUploadSummary(null);
    }
  };

  // Refresh teacher data
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

  // Handle upload button click (simplified to match original pattern)
  const handleUploadClick = () => {
    if (isUploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.style.display = "none";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setUploadError("Please upload a CSV file");
        setUploadSummary(null);
        document.body.removeChild(input);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadSummary(null);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        handleUploadSuccess(data);
      } catch (err) {
        console.error("Upload error:", err);
        setUploadError("Upload failed. Please try again.");
        setUploadSummary(null);
      } finally {
        setIsUploading(false);
      }
      
      // Clean up
      document.body.removeChild(input);
    };
    
    // Add to DOM temporarily and click
    document.body.appendChild(input);
    input.click();
  };

  return (
    <div className={styles.body}>
      {/* Navbar */}
      <Navbar
        brand="Grade Insight"
        links={[
          {
            label: isUploading ? 'Uploading...' : 'Upload',
            onClick: handleUploadClick,
            disabled: isUploading
          },
          { 
            label: 'Download Template', 
            onClick: handleDownloadTemplate 
          }
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
          <button 
            onClick={() => setUploadSummary(null)}
            className={styles.dismissButton}
          >
            ✕
          </button>
        </div>
      )}

      {uploadError && (
        <div className={styles.uploadError}>
          <p>❌ Upload failed: {uploadError}</p>
          <button 
            onClick={() => setUploadError(null)}
            className={styles.dismissButton}
          >
            ✕
          </button>
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
