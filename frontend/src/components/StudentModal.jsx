import React, { useState, useEffect } from 'react';

const StudentModal = ({ studentId, teacherId, onClose }) => {
  const [studentData, setStudentData] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`/api/student/${studentId}/details`);
        const data = await res.json();
        setStudentData(data);
      } catch (err) {
        console.error('Failed to fetch student data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/student/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, note: newNote })
      });

      if (res.ok) {
        const savedNote = await res.json();
        setStudentData({
          ...studentData,
          notes: [...studentData.notes, savedNote]
        });
        setNewNote('');
      } else {
        console.error('Failed to save note');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!studentData) return <div>Student data not found.</div>;

  const { student, assignments, notes } = studentData;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#fff', padding: 20, borderRadius: 8,
        width: '400px', maxHeight: '80%', overflowY: 'auto', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>✕</button>

        <h2>{student.name}</h2>
        <p>{student.email}</p>

        <h3>Assignments</h3>
        <ul>
          {assignments.map(a => {
            const grade = a.score !== null && a.score !== undefined ? `${a.score}/${a.max_points}` : '—';
            return <li key={a.assignment_id}>{a.assignment_name}: {grade}</li>;
          })}
        </ul>

        <h3>Teacher Notes</h3>
        <ul>
          {notes.map(n => (
            <li key={n.id}>{n.note} <small>({new Date(n.created_at).toLocaleString()})</small></li>
          ))}
        </ul>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          style={{ width: '100%', minHeight: 60, marginTop: 10 }}
        />
        <button onClick={handleAddNote} style={{ marginTop: 5 }}>Add Note</button>
      </div>
    </div>
  );
};

export default StudentModal;
