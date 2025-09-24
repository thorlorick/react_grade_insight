import React, { useState } from 'react';

const StudentModal = ({ studentData, onClose }) => {
  const { student, assignments, notes } = studentData;
  const [newNote, setNewNote] = useState('');
  const [allNotes, setAllNotes] = useState(notes || []);

  // Handle adding a note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/teacher_notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          note: newNote
        })
      });

      if (res.ok) {
        const savedNote = await res.json();
        setAllNotes([...allNotes, savedNote]);
        setNewNote('');
      } else {
        console.error('Failed to save note');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Close modal if background clicked
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
      }}
      onClick={handleBackgroundClick}
    >
      <div 
        style={{
          backgroundColor: '#fff', padding: 20, borderRadius: 8,
          width: '400px', maxHeight: '80%', overflowY: 'auto', position: 'relative'
        }}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          ✕
        </button>

        {/* Student Info */}
        <h2>{student.name}</h2>
        <p>{student.email}</p>

        {/* Assignments */}
        <h3>Assignments</h3>
        <ul>
          {assignments.map(a => {
            const grade = a.score !== undefined ? `${a.score}/${a.max_points}` : '—';
            return <li key={a.assignment_id}>{a.assignment_name}: {grade}</li>;
          })}
        </ul>

        {/* Notes */}
        <h3>Teacher Notes</h3>
        <ul>
          {allNotes.map(n => (
            <li key={n.id}>{n.note} <small>({new Date(n.created_at).toLocaleString()})</small></li>
          ))}
        </ul>

        {/* Add Note */}
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
