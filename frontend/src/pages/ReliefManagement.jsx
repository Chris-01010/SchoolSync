import React, { useState, useEffect, useRef } from 'react';

const ReliefManagement = () => {
  // Store data in window object to bypass React state issues
  const [pendingCount, setPendingCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  
  // Use window.__reliefData to store data that persists
  if (!window.__reliefData) {
    window.__reliefData = {
      pending: [
        { id: 'p2', name: 'Dr. Patel', dept: 'Science', period: 'Period 2', class: '10B' },
        { id: 'p4', name: 'Dr. Johnson', dept: 'Math', period: 'Period 4', class: '11A' },
        { id: 'p5', name: 'Prof. Kumar', dept: 'Science', period: 'Period 5', class: '10C' },
      ],
      assigned: [
        { id: 'r1', name: 'Mr. Smith', detail: 'Math - Period 1', class: '10A', reliefTeacher: 'Mr. Smith' },
      ]
    };
  }

  // Force refresh function
  const refresh = () => {
    setPendingCount(window.__reliefData.pending.length);
    setAssignedCount(window.__reliefData.assigned.length);
  };

  useEffect(() => {
    refresh();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const teachers = ['Mr. Adams', 'Ms. Garcia', 'Dr. Brown', 'Mrs. Wilson', 'Mr. Davis', 'Ms. Chen'];

  const handleAssign = () => {
    console.log("=== ASSIGNING ===");
    console.log("Selected:", selected);
    
    if (!selected) return;
    
    const teacher = selectedTeacher || teachers[Math.floor(Math.random() * teachers.length)];
    
    // Remove from pending
    const newPending = window.__reliefData.pending.filter(p => p.id !== selected.id);
    window.__reliefData.pending = newPending;
    
    // Add to assigned
    const newAssigned = {
      ...selected,
      reliefTeacher: teacher,
      assignedAt: new Date().toLocaleTimeString()
    };
    window.__reliefData.assigned = [newAssigned, ...window.__reliefData.assigned];
    
    console.log("New pending:", window.__reliefData.pending);
    console.log("New assigned:", window.__reliefData.assigned);
    
    // Force re-render
    refresh();
    
    // Close modal
    setShowModal(false);
    setSelected(null);
    setSelectedTeacher('');
    
    alert(`✅ Assigned ${teacher} to ${selected.name}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Relief Management</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-2xl font-bold">{window.__reliefData.pending.length + window.__reliefData.assigned.length}</p>
          <p className="text-sm text-gray-500">Total Requests</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-2xl font-bold text-orange-600">{window.__reliefData.pending.length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-2xl font-bold text-green-600">{window.__reliefData.assigned.length}</p>
          <p className="text-sm text-gray-500">Assigned</p>
        </div>
      </div>
      
      {/* Pending Table */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="p-4 border-b font-semibold">Pending Assignments ({window.__reliefData.pending.length})</div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs">TEACHER</th>
              <th className="p-3 text-left text-xs">DEPT</th>
              <th className="p-3 text-left text-xs">PERIOD</th>
              <th className="p-3 text-left text-xs">CLASS</th>
              <th className="p-3 text-left text-xs">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {window.__reliefData.pending.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.dept}</td>
                <td className="p-3">{p.period}</td>
                <td className="p-3">{p.class}</td>
                <td className="p-3">
                  <button 
                    onClick={() => { setSelected(p); setShowModal(true); }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
            {window.__reliefData.pending.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">All assigned!</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Assigned Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b font-semibold">Recent Assignments ({window.__reliefData.assigned.length})</div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs">TEACHER</th>
              <th className="p-3 text-left text-xs">DEPT/PERIOD</th>
              <th className="p-3 text-left text-xs">CLASS</th>
              <th className="p-3 text-left text-xs">RELIEF</th>
            </tr>
          </thead>
          <tbody>
            {window.__reliefData.assigned.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td className="p-3">{a.dept} - {a.period}</td>
                <td className="p-3">{a.class}</td>
                <td className="p-3 text-green-600">{a.reliefTeacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Assign Relief Teacher</h3>
            <div className="mb-4">
              <p><strong>Teacher:</strong> {selected.name}</p>
              <p><strong>Class:</strong> {selected.class}</p>
              <p><strong>Period:</strong> {selected.period}</p>
            </div>
            <select 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">-- Auto-assign --</option>
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReliefManagement;