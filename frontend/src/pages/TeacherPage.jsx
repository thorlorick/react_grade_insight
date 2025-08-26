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

  // Fetch data when the component mounts
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
    const filtered = studentsData.filter((student) =>
      student.first_name.toLowerCase().includes(query.toLowerCase()) ||
      student.last_name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  // Optional: handle CSV upload
  const handleUpload = async (file) => {
    // Call your API to upload CSV, then refresh data
  };

  return (
    <>
      <Navbar
        brand="Grade Insight"
        rightElements={
          <>
            <SearchBar onSearch={handleSearch} />
            <GenericButton onClick={handleUpload}>Upload CSV</GenericButton>
          </>
        }
      />

      <BackgroundContainer image={null}> {/* No background image */}
        <StudentListTable
          students={filteredStudents}
          onSelectStudent={setSelectedStudent}
        />
        {selectedStudent && (
          <StudentDetailsPanel student={selectedStudent} />
        )}
      </BackgroundContainer>
    </>
  );
};

export default TeacherPage;
