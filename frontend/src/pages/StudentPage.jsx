import React, { useState, useEffect, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import StudentDashboardTable from '../components/StudentDashboardTable';

// Custom hook for student data
const useStudentData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://gradeinsight.com:8083/api/student/data', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/StudentLogin';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

// Custom hook for teacher notes
const useStudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('https://gradeinsight.com:8083/api/student/notes', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return { notes, loading };
};

const StudentPage = () => {
  const { data: assignments, loading: assignmentsLoading, error } = useStudentData();
  const { notes, loading: notesLoading } = useStudentNotes();
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('https://gradeinsight.com:8083/api/auth/studentLogout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/StudentLogin';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-['Inter']">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">Grade Insight</h1>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg backdrop-blur-sm border border-red-500/30 text-red-300 text-sm transition-all"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignments Table */}
        <div className="mb-8">
          <StudentDashboardTable
            data={assignments}
            loading={assignmentsLoading}
            error={error}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>

        {/* Teacher Notes Section */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Teacher Notes</h3>
          
          {notesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-400"></div>
              <p className="mt-2 text-sky-300 text-sm">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-gray-400">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border-l-4 border-sky-400/50">
                  <p className="text-gray-300 mb-2">{note.note}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-medium">{note.teacher}</span>
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;