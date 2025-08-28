// src/pages/TeacherPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";
import SearchBar from "../components/SearchBar";
import GenericButton from "../components/GenericButton";
import StudentListTable from "../components/StudentListTable";
import StudentDetailsPanel from "../components/StudentDetailsPanel";
import UploadButton from "../components/UploadButton"; // NEW
import styles from './TeacherPage.module.css';
import { getTeacherData } from "../api/teacherApi";

const TeacherPage = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTeacherData();
        setStudentsData(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      }
    }
    fetchData();
  }, []);

  // Handle search input
  const handleSearch = (query) => {
    const filtered = studentsData.filter(
      (student) =>
        student.first_name.toLowerCase().includes(query.toLowerCase()) ||
        student.last_name.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/upload_template.csv"; // file must be in /public
    link.download = "upload_template.csv";
    link.click();
  };

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight">
        <SearchBar onSearch={handleSearch} />

        {/* UploadButton replaces old GenericButton */}
        <UploadButton onUploadSuccess={(data) => {
          if (data.ok) {
            setUploadSummary(data);
            setUploadError(null);
            // Optionally refresh student data after upload
          } else {
            setUploadError(data.error);
            setUploadSummary(null);
          }
        }} 
         refreshStudents={(refreshed) => {
            setStudentsData(refreshed);
            setFilteredStudents(refreshed);
            }}
        />

        <GenericButton onClick={handleDownloadTemplate}>
          Download Template
        </GenericButton>
      </Navbar>

      {/* Show upload summary or error */}
      {uploadSummary && (
        <div style={{ padding: '1rem', color: 'green' }}>
          <p>File: {uploadSummary.file}</p>
          <p>Assignments processed: {uploadSummary.assignmentsCount}</p>
          <p>Students processed: {uploadSummary.studentsCount}</p>
        </div>
      )}
      {uploadError && (
        <div style={{ padding: '1rem', color: 'red' }}>
          <p>Error: {uploadError}</p>
        </div>
      )}

     <BackgroundContainer image={null}>
  <StudentListTable
    data={filteredStudents}
    onSelectStudent={setSelectedStudent}
  />

  {selectedStudent && (
    <StudentDetailsPanel student={selectedStudent} />
  )}
</BackgroundContainer>

    </div>
  );
};

export default TeacherPage;
