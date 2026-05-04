import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Info, RefreshCw, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../services/api";

const viewTabs = ["Dept-Wise", "Teacher-Wise", "Room-Wise", "Class-Wise"];

const days = [
  { label: "MONDAY" },
  { label: "TUESDAY" },
  { label: "WEDNESDAY" },
  { label: "THURSDAY" },
  { label: "FRIDAY" },
];

function TimetableCell({ data, teacherMap, subjectMap }) {
  if (!data) {
    return (
      <div className="flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
        <span className="text-xs italic text-gray-400">Available</span>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-[72px] flex-col justify-center rounded-lg border border-gray-100 bg-white border-l-[3px] border-l-indigo-500 px-3 py-2.5">
      <p className="text-[12px] font-bold leading-tight text-indigo-700">
        {subjectMap[data.subject_id] || "Subject"}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">
        {teacherMap[data.teacher_id] || "Teacher"}
      </p>
    </div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState("Dept-Wise");
  const [editMode, setEditMode] = useState(false);
  const [versions, setVersions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [teacherMap, setTeacherMap] = useState({});
  const [subjectMap, setSubjectMap] = useState({});

  const fetchVersions = async () => {
    try {
      const data = await api.get("/timetable/versions");
      setVersions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await api.get("/timetable/slots");
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [teachersData, subjectsData] = await Promise.all([
        api.get("/api/v1/teachers"),
        api.get("/api/v1/subjects"),
      ]);
      const tMap = {};
      if (Array.isArray(teachersData)) teachersData.forEach(t => tMap[t.id] = t.name);
      setTeacherMap(tMap);
      const sMap = {};
      if (Array.isArray(subjectsData)) subjectsData.forEach(s => sMap[s.id] = s.name);
      setSubjectMap(sMap);
    } catch (err) {
      console.error('Failed to fetch meta', err);
    }
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
        setTimeout(() => {
          fetchVersions();
          fetchSlots();
          setGenerating(false);
        }, 1500);
      } else {
        setError(data?.message || "Generation failed");
        setGenerating(false);
      }
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const handleActivate = async (versionId) => {
    try {
      await api.post(`/timetable/versions/${versionId}/activate`);
      fetchVersions();
      fetchSlots();
    } catch (err) {
      console.error('Failed to activate version', err);
    }
  };

  const slotsByDay = days.map((_, dayIdx) =>
    slots.filter(s => s.day_of_week === dayIdx)
  );

  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Timetable Management</h1>
        <button onClick={handleGenerate} disabled={generating}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${generating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {generating ? (<><RefreshCw size={15} className="animate-spin" /> Generating...</>)
            : generateSuccess ? (<><CheckCircle size={15} /> Generated!</>)
            : (<><Zap size={15} /> Generate Timetable</>)}
        </button>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      {taskId && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle size={14} />
          Timetable generated — Version ID: <code className="font-mono font-bold">{taskId}</code>
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
        <div className="ml-auto flex items-center gap-2.5">
          <label className="text-xs font-medium text-gray-500">Edit Mode</label>
          <button onClick={() => setEditMode((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${editMode ? "bg-indigo-600" : "bg-gray-300"}`}>
            <motion.span animate={{ x: editMode ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block rounded-full bg-white shadow-sm" style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap size={32} className="text-indigo-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No timetable generated yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Generate Timetable" to create one</p>
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
                          <TimetableCell data={slot} teacherMap={teacherMap} subjectMap={subjectMap} />
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
        {editMode && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-6 rounded-2xl bg-gray-900 px-6 py-3.5 shadow-2xl">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-indigo-400" />
                <div>
                  <p className="text-sm font-bold text-white">Unsaved changes detected</p>
                  <p className="text-[11px] text-gray-400">Modifications pending publishing.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setEditMode(false)} className="rounded-lg border border-gray-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800">Discard</button>
                <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">Publish</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

