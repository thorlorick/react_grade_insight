// src/pages/TeacherPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";
import SearchBar from "../components/SearchBar";
import GenericButton from "../components/GenericButton";
import StudentListTable from "../components/StudentListTable";
import StudentDetailsPanel from "../components/StudentDetailsPanel";
import styles from './Gradeinsight.module.css';
import { getTeacherData } from "../api/teacherApi";

const TeacherPage = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // Handle CSV upload (placeholder)
  const handleUpload = async () => {
    console.log("Upload CSV clicked");
    // Call your API to upload CSV, then refresh data
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
    <GenericButton onClick={handleUpload}>Upload CSV</GenericButton>
    <GenericButton onClick={handleDownloadTemplate}>Download Template</GenericButton>
  </Navbar>

      <BackgroundContainer image={null}> {/* No background image */}
        <StudentListTable
          data={filteredStudents}
          onSelectStudent={setSelectedStudent} // optional, for clicking rows
        />

        {selectedStudent && (
          <StudentDetailsPanel student={selectedStudent} />
        )}
      </BackgroundContainer>
    </div>
  );
};

export default TeacherPage;
