import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CalendarDays, Info, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("schoolsync_token") || localStorage.getItem("access_token") || localStorage.getItem("token");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  if (res.status === 204) return null;
  return res.json();
}

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const periods = [1, 2, 3, 4, 5, 6];

function HODEditModal({ slot, deptTeachers, teacherMap, subjectMap, onClose, onSave }) {
  const [teacherId, setTeacherId] = useState(String(slot.teacher_id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(String(slot.id), teacherId);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Change Teacher</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
          <p><span className="font-semibold">Subject:</span> {subjectMap[slot.subject_id] || "—"}</p>
          <p><span className="font-semibold">Day:</span> {days[slot.day_of_week]}, Period {slot.period}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Assign Teacher (Your Department)</label>
          <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {deptTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TimetableGrid() {
  const { user, role } = useAuth();
  const isHOD = role === 'hod';
  const isTeacher = role === 'teacher';

  const [slots, setSlots] = useState([]);
  const [teacherMap, setTeacherMap] = useState({});
  const [subjectMap, setSubjectMap] = useState({});
  const [deptTeachers, setDeptTeachers] = useState([]);
  const [hodDeptId, setHodDeptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsData, metaData] = await Promise.all([
        apiFetch("/timetable/slots"),
        apiFetch("/timetable/meta"),
      ]);

      setSlots(Array.isArray(slotsData) ? slotsData : []);

      const tMap = {};
      if (metaData?.teachers) metaData.teachers.forEach(t => tMap[t.id] = t.name);
      setTeacherMap(tMap);

      const sMap = {};
      if (metaData?.subjects) metaData.subjects.forEach(s => sMap[s.id] = s.name);
      setSubjectMap(sMap);

      // For HOD: fetch their department info and filter teachers
      if (isHOD) {
        try {
          const hodData = await apiFetch("/hod/dashboard");
          // Get all teachers from API to find department
          const teachersRes = await apiFetch("/api/v1/teachers");
          if (Array.isArray(teachersRes)) {
            // Filter teachers by department name match
            const deptName = hodData?.department_name;
            const depts = await apiFetch("/api/v1/departments");
            const dept = depts?.find(d => d.name === deptName);
            if (dept) {
              setHodDeptId(dept.id);
              const filtered = teachersRes.filter(t => t.department_id === dept.id);
              setDeptTeachers(filtered.map(t => ({ id: t.id, name: t.name })));
            } else {
              // fallback: show all teachers
              setDeptTeachers(metaData?.teachers || []);
            }
          }
        } catch {
          setDeptTeachers(metaData?.teachers || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSlotClick = (slot) => {
    if (!isHOD) return;
    setModal(slot);
  };

  const handleSave = async (slotId, newTeacherId) => {
    await apiFetch(`/timetable/slots/${slotId}`, {
      method: "PUT",
      body: JSON.stringify({ teacher_id: newTeacherId }),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    await fetchData();
  };

  const slotsByDay = days.map((_, dayIdx) =>
    slots.filter(s => s.day_of_week === dayIdx)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isHOD ? "Click a slot to reassign the teacher within your department" : "Your weekly schedule"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          <Info size={13} /> {slots.length} slots
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle size={14} /> Teacher reassigned successfully
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays size={32} className="text-indigo-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No timetable available</p>
            <p className="text-xs text-gray-400 mt-1">Ask admin to generate the timetable</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="w-20 whitespace-nowrap px-4 py-3 text-center">
                    <Clock size={16} className="mx-auto text-gray-400" />
                  </th>
                  {days.map((d) => (
                    <th key={d} className="whitespace-nowrap px-3 py-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-700">{d}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="whitespace-nowrap px-4 py-2 text-center text-xs font-bold text-gray-500">
                      Period {period}
                    </td>
                    {days.map((_, dayIdx) => {
                      const slot = slotsByDay[dayIdx]?.find(s => s.period === period);
                      return (
                        <td key={dayIdx} className="px-2 py-2">
                          {slot ? (
                            <div
                              onClick={() => handleSlotClick(slot)}
                              className={`relative flex min-h-[72px] flex-col justify-center rounded-lg border border-gray-100 bg-white border-l-[3px] border-l-indigo-500 px-3 py-2.5 transition ${isHOD ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 group' : ''}`}
                            >
                              <p className="text-[12px] font-bold leading-tight text-indigo-700">
                                {subjectMap[slot.subject_id] || "Subject"}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                {teacherMap[slot.teacher_id] || "Teacher"}
                              </p>
                              {isHOD && (
                                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition">
                                  <span className="text-[9px] font-bold text-indigo-400">EDIT</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
                              <span className="text-xs italic text-gray-400">Free</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] bg-indigo-500" /> Scheduled</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 bg-white" /> Free</div>
        {isHOD && <div className="flex items-center gap-1.5 text-indigo-500 font-medium">Click any slot to reassign teacher</div>}
      </div>

      <AnimatePresence>
        {modal && (
          <HODEditModal
            slot={modal}
            deptTeachers={deptTeachers.length > 0 ? deptTeachers : Object.entries(teacherMap).map(([id, name]) => ({ id, name }))}
            teacherMap={teacherMap}
            subjectMap={subjectMap}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
