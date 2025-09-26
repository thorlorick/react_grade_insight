import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GenericButton from "../components/GenericButton";
import StudentDashboardTable from "../components/StudentDashboardTable";
import styles from './StudentPage.module.css';
import { getStudentData, logoutStudent } from "../api/studentApi";

const StudentPage = () => {
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchData();
    fetchNotes();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getStudentData();
      setStudentData(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/student/notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredData(studentData);
      return;
    }
    const filtered = studentData.filter(row =>
      row.assignment_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDownloadGrades = () => {
    const csvHeaders = ['Assignment', 'Grade'];
    const csvRows = studentData.map(row => [
      row.assignment_name || '',
      row.grade !== null && row.grade !== undefined
        ? row.max_points ? `${row.grade}/${row.max_points}` : row.grade
        : 'Not graded'
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

  const handleLogout = async () => {
    try {
      await logoutStudent();
      window.location.href = "/StudentLogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';

    const sorted = [...filteredData].sort((a, b) => {
      if (a[key] === null || a[key] === undefined) return 1;
      if (b[key] === null || b[key] === undefined) return -1;

      if (typeof a[key] === 'string') return a[key].localeCompare(b[key]);
      return a[key] - b[key];
    });

    if (direction === 'desc') sorted.reverse();

    setFilteredData(sorted);
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight">
        <GenericButton onClick={handleDownloadGrades}>Download My Grades</GenericButton>
        <GenericButton onClick={fetchData}>Refresh</GenericButton>
        <GenericButton onClick={handleLogout}>Logout</GenericButton>
      </Navbar>

      <div className={styles.pageWrapper}>
        <input
          type="text"
          placeholder="Search assignments..."
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />

        <StudentDashboardTable
          data={filteredData}
          loading={loading}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        <div className={styles.notesSection}>
          <h3>Teacher Notes</h3>
          {notes.length === 0 && <p>No notes yet.</p>}
          {notes.map((note, idx) => (
            <div key={idx} className={styles.noteItem}>
              <p>{note.note}</p>
              <small>{note.teacher} — {new Date(note.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
