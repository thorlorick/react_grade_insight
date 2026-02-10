// src/pages/ParentPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GenericButton from "../components/GenericButton";
import ParentGradesTable from "../components/ParentGradesTable";
import styles from './ParentPage.module.css';
import { getParentChildren, getChildGrades, getChildNotes } from "../api/parentApi";

const ParentPage = () => {
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [gradesData, setGradesData] = useState({});
  const [notesData, setNotesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Fetch children when component mounts
  useEffect(() => {
    async function fetchChildren() {
      try {
        setLoading(true);
        const childrenData = await getParentChildren();
        setChildren(childrenData);
        
        // Set first child as active if any exist
        if (childrenData.length > 0) {
          setActiveChildId(childrenData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch children data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChildren();
  }, []);

  // Fetch grades and notes when active child changes
  useEffect(() => {
    if (activeChildId) {
      fetchChildData(activeChildId);
    }
  }, [activeChildId]);

  const fetchChildData = async (childId) => {
    try {
      setGradesLoading(true);
      
      // Fetch grades and notes in parallel
      const [grades, notes] = await Promise.all([
        getChildGrades(childId),
        getChildNotes(childId)
      ]);
      
      setGradesData(prev => ({ ...prev, [childId]: grades }));
      setNotesData(prev => ({ ...prev, [childId]: notes }));
    } catch (error) {
      console.error(`Failed to fetch data for child ${childId}:`, error);
    } finally {
      setGradesLoading(false);
    }
  };

  const handleTabClick = (childId) => {
    setActiveChildId(childId);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/studentLogout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.body}>
        <Navbar brand="Grade Insight" />
        <div className={styles.pageWrapper}>
          <div className={styles.loading}>Loading your children's data...</div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={styles.body}>
        <Navbar brand="Grade Insight">
          <GenericButton onClick={handleLogout}>
            Logout
          </GenericButton>
        </Navbar>
        <div className={styles.pageWrapper}>
          <div className={styles.emptyState}>
            No children found in your account. Please contact your school's administrator.
          </div>
        </div>
      </div>
    );
  }

  const activeChild = children.find(child => child.id === activeChildId);
  const currentGrades = gradesData[activeChildId] || [];
  const currentNotes = notesData[activeChildId] || null;

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight">
        <GenericButton onClick={handleLogout}>
          Logout
        </GenericButton>
      </Navbar>

      <div className={styles.pageWrapper}>
        {/* Child Tabs */}
        <div className={styles.tabsContainer}>
          {children.map((child) => (
            <button
              key={child.id}
              className={`${styles.tab} ${
                activeChildId === child.id ? styles.activeTab : ''
              }`}
              onClick={() => handleTabClick(child.id)}
            >
              {child.first_name} {child.last_name}
            </button>
          ))}
        </div>

        {/* Grades Table */}
        {activeChild && (
          <>
            <ParentGradesTable 
              data={currentGrades} 
              loading={gradesLoading}
              studentName={`${activeChild.first_name} ${activeChild.last_name}`}
            />

            {/* Notes Section */}
            <div className={styles.notesSection}>
              <h3 className={styles.notesTitle}>Teacher Notes</h3>
              <div className={styles.notesContent}>
                {currentNotes ? (
                  <>
                    <div className={styles.noteText}>
                      {typeof currentNotes === 'string' ? currentNotes : currentNotes.notes}
                    </div>
                    {typeof currentNotes === 'object' && currentNotes.teacherName && (
                      <div className={styles.noteMetadata}>
                        <span className={styles.teacherName}>
                          — {currentNotes.teacherName}
                        </span>
                        {currentNotes.lastUpdated && (
                          <span className={styles.noteDate}>
                            {new Date(currentNotes.lastUpdated).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  "No notes from teachers at this time."
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default ParentPage;
