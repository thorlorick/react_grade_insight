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
      setTimeout(() => setRunTour(true), 500);
    }
  }, []);

  // Tour steps (no placement needed, handled globally)
  const tourSteps = [
    {
      target: 'body',
      content: 'Welcome to your Teacher Dashboard! Let\'s take a quick tour of the main features.',
      disableBeacon: true,
    },
    {
      target: '.download-template-button',
      content: 'Need a template? Download a properly formatted CSV template here to ensure your uploads work correctly.',
    },
     {
      target: '.upload-csv-button',
      content: 'Click here to upload a properly formatted CSV file with student grades. This is how you add or update grade data.',
    },
    {
      target: '.search-bar',
      content: 'Use the search bar to quickly find students by name.',
    },
    {
      target: '.teacher-dashboard',
      content: 'This is your grade table. Click any column header to sort by that column (name, email, or assignment grades).',
    },
    {
      target: '.teacher-dashboard',
      content: 'Click on any student row to see detailed information and to be able to leave notes for individual students.',
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
        floaterProps={{
          disableAnimation: false,
          styles: {
            floater: {
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))',
            }
          }
        }}
        styles={{
          options: {
            primaryColor: '#22c55e',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.85)',
            arrowColor: '#ffffff',
            zIndex: 10000,
          },
          overlay: {
            backdropFilter: 'none', // no blur so elements stay sharp
          },
          tooltip: {
            borderRadius: '16px',
            padding: '24px',
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          },
          tooltipContent: {
            padding: '8px 0',
            color: '#374151',
            fontSize: '15px',
            lineHeight: '1.6',
          },
          tooltipTitle: {
            color: '#111827',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
          },
          buttonNext: {
            backgroundColor: '#22c55e',
            borderRadius: '8px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ffffff',
          },
          buttonBack: {
            color: '#6b7280',
            marginRight: '12px',
            fontSize: '14px',
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: '14px',
          },
          buttonClose: {
            color: '#6b7280',
          },
        }}
        placement="top" // force all tooltips to appear at the top
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
