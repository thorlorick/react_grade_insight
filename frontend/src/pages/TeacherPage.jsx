// src/pages/TeacherPage.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
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
  
  // Joyride tour state
  const [runTour, setRunTour] = useState(false);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTeacherTour');
    if (!hasSeenTour) {
      // Small delay so elements are rendered before tour starts
      setTimeout(() => setRunTour(true), 500);
    }
  }, []);

  // Tour steps
  const tourSteps = [
    {
      target: 'body',
      content: 'Welcome to your Teacher Dashboard! Let\'s take a quick tour of the main features.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.upload-csv-button',
      content: 'Click here to upload a CSV file with student grades. This is how you add or update grade data.',
      placement: 'bottom',
    },
    {
      target: '.download-template-button',
      content: 'Need a template? Download a properly formatted CSV template here to ensure your uploads work correctly.',
      placement: 'bottom',
    },
    {
      target: '.search-bar',
      content: 'Use the search bar to quickly find students by name, email, or assignment.',
      placement: 'bottom',
    },
    {
      target: '.teacher-dashboard',
      content: 'This is your grade table. Click any column header to sort by that column (name, email, or assignment grades).',
      placement: 'top',
    },
    {
      target: '.teacher-dashboard',
      content: 'Click on any student row to see detailed information and performance insights for that student.',
      placement: 'top',
    },
  ];

  // Handle tour completion
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenTeacherTour', 'true');
    }
  };

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

  // Handle upload success
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

  // Handle upload button click
  const handleUploadClick = () => {
    if (isUploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.style.display = "none";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      console.log('Selected CSV file:', file.name);
      
      const formData = new FormData();
      formData.append('csv', file);

      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadSummary(null);

        const res = await fetch('https://gradeinsight.com:8083/api/uploads/template', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await res.json();
        console.log('Upload response:', data);
        handleUploadSuccess(data);

        if (data.ok && refreshData) {
          await refreshData();
        }
      } catch (err) {
        console.error('Upload failed:', err);
        handleUploadSuccess({ ok: false, error: err.message });
      } finally {
        setIsUploading(false);
      }
      
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  };

  return (
    <div className={styles.body}>
      {/* Joyride Tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#22c55e',
            textColor: '#d1fae5',
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            arrowColor: 'rgba(15, 15, 15, 0.95)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          buttonNext: {
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
          },
          buttonBack: {
            color: '#6ee7b7',
            marginRight: '10px',
          },
          buttonSkip: {
            color: '#86efac',
          },
        }}
      />

      {/* Navbar */}
      <Navbar
        brand="Grade Insight"
        links={[
          {
            label: isUploading ? 'Uploading...' : 'Upload CSV',
            onClick: handleUploadClick,
            disabled: isUploading,
            className: 'upload-csv-button'
          },
          { 
            label: 'Download Template', 
            onClick: handleDownloadTemplate,
            className: 'download-template-button'
          }
        ]}
      >
        <div className="search-bar">
          <SearchBar onSearch={handleSearch} />
        </div>
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
