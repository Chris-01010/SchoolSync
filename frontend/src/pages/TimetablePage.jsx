import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Info, RefreshCw, Zap, CheckCircle, AlertCircle, X, Trash2, Edit2, Plus } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const viewTabs = ["Dept-Wise", "Teacher-Wise", "Room-Wise", "Class-Wise"];
const days = [
  { label: "MONDAY" },
  { label: "TUESDAY" },
  { label: "WEDNESDAY" },
  { label: "THURSDAY" },
  { label: "FRIDAY" },
];
const periods = [1, 2, 3, 4, 5, 6];

function SlotModal({ mode, slot, day, period, meta, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    teacher_id: slot?.teacher_id || "",
    class_id: slot?.class_id || "",
    room_id: slot?.room_id || "",
    subject_id: slot?.subject_id || "",
    day_of_week: day ?? slot?.day_of_week ?? 0,
    period: period ?? slot?.period ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!form.teacher_id || !form.class_id || !form.room_id || !form.subject_id) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err.message));
    
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err.message));
    } finally {
      setSaving(false);
    }
  };

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "assign" ? "Assign Slot" : "Edit Slot"} — {dayNames[form.day_of_week]}, Period {form.period}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Teacher</label>
            <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select teacher...</option>
              {meta.teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Subject</label>
            <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select subject...</option>
              {meta.subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Class</label>
            <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select class...</option>
              {meta.classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Room</label>
            <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select room...</option>
              {meta.rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {mode === "edit" && (
            <button onClick={handleDelete} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {saving ? "Saving..." : mode === "assign" ? "Assign" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TimetableCell({ data, teacherMap, subjectMap, isAdmin, onClick }) {
  if (!data) {
    return (
      <div
        onClick={isAdmin ? onClick : undefined}
        className={`flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white transition ${isAdmin ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 group' : ''}`}
      >
        {isAdmin ? (
          <span className="text-xs text-gray-300 group-hover:text-indigo-400 transition flex items-center gap-1">
            <Plus size={12} /> Assign
          </span>
        ) : (
          <span className="text-xs italic text-gray-400">Available</span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={isAdmin ? onClick : undefined}
      className={`relative flex min-h-[72px] flex-col justify-center rounded-lg border border-gray-100 bg-white border-l-[3px] border-l-indigo-500 px-3 py-2.5 transition ${isAdmin ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 group' : ''}`}
    >
      <p className="text-[12px] font-bold leading-tight text-indigo-700">
        {subjectMap[data.subject_id] || "Subject"}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">
        {teacherMap[data.teacher_id] || "Teacher"}
      </p>
      {isAdmin && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition">
          <Edit2 size={11} className="text-indigo-400" />
        </div>
      )}
    </div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function TimetablePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("Dept-Wise");
  const [versions, setVersions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [teacherMap, setTeacherMap] = useState({});
  const [subjectMap, setSubjectMap] = useState({});
  const [meta, setMeta] = useState({ teachers: [], classes: [], rooms: [], subjects: [] });
  const [modal, setModal] = useState(null); // { mode: 'assign'|'edit', slot, day, period }

  const fetchVersions = async () => {
    try {
      const data = await api.get("/timetable/versions");
      setVersions(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await api.get("/timetable/slots");
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    try {
      const [teachersData, subjectsData, metaData] = await Promise.all([
        api.get("/api/v1/teachers"),
        api.get("/api/v1/subjects"),
        api.get("/timetable/meta"),
      ]);
      const tMap = {};
      if (Array.isArray(teachersData)) teachersData.forEach(t => tMap[t.id] = t.name);
      setTeacherMap(tMap);
      const sMap = {};
      if (Array.isArray(subjectsData)) subjectsData.forEach(s => sMap[s.id] = s.name);
      setSubjectMap(sMap);
      setMeta(metaData || { teachers: [], classes: [], rooms: [], subjects: [] });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchVersions();
    fetchSlots();
    fetchMeta();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGenerateSuccess(false);
      setError(null);
      const data = await api.post("/generate-timetable-sync/");
      if (data?.task_id || data?.version_id) {
        setTaskId(data.task_id || data.version_id);
        setGenerateSuccess(true);
        setTimeout(() => { fetchVersions(); fetchSlots(); setGenerating(false); }, 1500);
      } else {
        setError(data?.message || "Generation failed");
        setGenerating(false);
      }
    } catch (err) { setError(err.message); setGenerating(false); }
  };

  const handleActivate = async (versionId) => {
    try {
      await api.post(`/timetable/versions/${versionId}/activate`);
      fetchVersions();
      fetchSlots();
    } catch (err) { console.error(err); }
  };

  const handleCellClick = (slot, dayIdx, period) => {
    if (!isAdmin) return;
    if (slot) {
      setModal({ mode: "edit", slot, day: dayIdx, period });
    } else {
      setModal({ mode: "assign", slot: null, day: dayIdx, period });
    }
  };

  const handleSave = async (form) => {
    if (modal.mode === "assign") {
      await api.post("/timetable/slots/assign", form);
    } else {
      await api.put(`/timetable/slots/${String(modal.slot.id)}`, form);
    }
    await fetchSlots();
  };

  const handleDelete = async () => {
    await api.delete(`/timetable/slots/${String(modal.slot.id)}`);
    await fetchSlots();
  };

  const slotsByDay = days.map((_, dayIdx) =>
    slots.filter(s => s.day_of_week === dayIdx)
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Timetable Management</h1>
        {isAdmin && (
          <button onClick={handleGenerate} disabled={generating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${generating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {generating ? (<><RefreshCw size={15} className="animate-spin" /> Generating...</>)
              : generateSuccess ? (<><CheckCircle size={15} /> Generated!</>)
              : (<><Zap size={15} /> Generate Timetable</>)}
          </button>
        )}
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      {taskId && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle size={14} /> Timetable generated — Version ID: <code className="font-mono font-bold">{taskId}</code>
        </motion.div>
      )}

      {versions.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
          {versions.map((v) => (
            <div key={v.id} className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-sm font-medium ${v.is_active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}>
              <span>Version {v.id.slice(0, 8)}...</span>
              {v.is_active ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">ACTIVE</span>
              ) : (
                <button onClick={() => handleActivate(v.id)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
                  Activate
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {viewTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "border border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600"}`}>
            {tab}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Viewing Week</label>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
            <CalendarDays size={14} className="text-gray-400" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 4*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          <Info size={13} /> {slots.length} slots loaded
        </div>
        {isAdmin && (
          <div className="ml-auto text-xs text-gray-400 italic">Click any cell to assign or edit</div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                    <th key={d.label} className="whitespace-nowrap px-3 py-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-700">{d.label}</p>
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
                          <TimetableCell
                            data={slot}
                            teacherMap={teacherMap}
                            subjectMap={subjectMap}
                            isAdmin={isAdmin}
                            onClick={() => handleCellClick(slot, dayIdx, period)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] bg-indigo-500" /> Standard Schedule</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] bg-purple-500" /> Relief Assigned</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Conflict / Action Required</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 bg-white" /> Free / Unassigned</div>
      </motion.div>

      <AnimatePresence>
        {modal && (
          <SlotModal
            mode={modal.mode}
            slot={modal.slot}
            day={modal.day}
            period={modal.period}
            meta={meta}
            onClose={() => setModal(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}


