import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, AlertCircle, Info, RefreshCw, Plus, Edit2, Trash2, X, Zap, CheckCircle } from "lucide-react";
import BlockedSlotsPanel from "../components/BlockedSlotsPanel";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const viewTabs = ["Class-Wise", "Teacher-Wise", "Room-Wise", "Dept-Wise"];
const days = [{ label: "MONDAY" }, { label: "TUESDAY" }, { label: "WEDNESDAY" }, { label: "THURSDAY" }, { label: "FRIDAY" }];
const periods = [1, 2, 3, 4, 5, 6];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function SlotModal({ mode, slot, day, period, isHOD, myDeptId, allTeachers, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    teacher_id: slot?.teacher_id || "",
    class_id: slot?.class_id || "",
    room_id: slot?.room_id || "",
    subject_id: slot?.subject_id || "",
    day_of_week: day ?? 0,
    period: period ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const excludeParam = mode === "edit" && slot?.id ? `&exclude_slot_id=${String(slot.id)}` : "";
        const subjectParam = form.subject_id ? `&subject_id=${form.subject_id}` : "";
        const res = await api.get(`/timetable/available?day=${day}&period=${period}${excludeParam}${subjectParam}`);
        let apiTeachers = res?.teachers || [];
if (isHOD && myDeptId && Array.isArray(allTeachers) && allTeachers.length) {
  const mine = new Set(
    allTeachers.filter(t => String(t.department_id) === String(myDeptId)).map(t => String(t.id))
  );
  apiTeachers = apiTeachers.filter(t => mine.has(String(t.id)));
}
setTeachers(apiTeachers);
        setRooms(res?.rooms || []);
        setClasses(res?.classes || []);
        setSubjects(res?.subjects || []);
      } catch (e) {
        console.error("load error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form.subject_id]);

  const availableRooms = rooms.filter(r => r.available || r.id === String(slot?.room_id));
  const availableClasses = classes.filter(c => c.available || c.id === String(slot?.class_id));

  const handleSave = async () => {
    if (!form.teacher_id || !form.class_id || !form.room_id || !form.subject_id) {
      setError("All fields are required"); return;
    }
    setSaving(true); setError(null);
    try { await onSave(form); onClose(); }
    catch (err) { setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await onDelete(); onClose(); }
    catch (err) { setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message)); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "assign" ? "Assign Slot" : "Edit Slot"} — {dayNames[day]}, Period {period}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        {error && <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle size={14} /> {error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Subject</label>
              <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value, teacher_id: "" }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Teacher {teachers.filter(t => t.available).length > 0 ? `(${teachers.filter(t => t.available).length} free)` : "(none free)"}
              </label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select teacher...</option>
                {teachers.filter(t => t.group === "qualified" && t.available).length > 0 && (
                  <optgroup label="✓ Qualified for this subject">
                    {teachers.filter(t => t.group === "qualified" && t.available).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                )}
                {teachers.filter(t => t.group === "substitute" && t.available).length > 0 && (
                  <optgroup label="⚠ Can substitute">
                    {teachers.filter(t => t.group === "substitute" && t.available).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                )}
                {teachers.filter(t => (t.group === "other" || t.group === "all") && t.available).length > 0 && (
                  <optgroup label="↓ Other available teachers">
                    {teachers.filter(t => (t.group === "other" || t.group === "all") && t.available).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                )}
                {teachers.filter(t => !t.available && t.id === String(slot?.teacher_id)).map(t => (
                  <option key={t.id} value={t.id}>{t.name} (currently assigned)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Class</label>
              <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select class...</option>
                {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Room</label>
              <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select room...</option>
                {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mt-6">
          {mode === "edit" && (
            <button onClick={handleDelete} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {saving ? "Saving..." : mode === "assign" ? "Assign" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SlotCell({ data, label, sublabel, isAdmin, onClick }) {
  if (!data) {
    return (
      <div onClick={isAdmin ? onClick : undefined}
        className={`flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white transition ${isAdmin ? "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 group" : ""}`}>
        {isAdmin
          ? <span className="text-xs text-gray-300 group-hover:text-indigo-400 flex items-center gap-1"><Plus size={12} /> Assign</span>
          : <span className="text-xs italic text-gray-400">Free</span>}
      </div>
    );
  }
  return (
    <div onClick={isAdmin ? onClick : undefined}
      className={`relative flex min-h-[72px] flex-col justify-center rounded-lg border border-gray-100 bg-white border-l-[3px] border-l-indigo-500 px-3 py-2.5 transition ${isAdmin ? "cursor-pointer hover:shadow-md hover:border-indigo-300 group" : ""}`}>
      <p className="text-[12px] font-bold leading-tight text-indigo-700">{label || "—"}</p>
      <p className="mt-0.5 text-[11px] text-gray-500">{sublabel || "—"}</p>
      {isAdmin && <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition"><Edit2 size={11} className="text-indigo-400" /></div>}
    </div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function TimetablePage() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const isHOD = String(user?.role || "").toLowerCase() === "hod";
  const [myDeptId, setMyDeptId] = useState(null);
  const [activeTab, setActiveTab] = useState("Class-Wise");
  const [versions, setVersions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [teacherMap, setTeacherMap] = useState({});
  const [subjectMap, setSubjectMap] = useState({});
  const [classMap, setClassMap] = useState({});
  const [roomMap, setRoomMap] = useState({});
  const [meta, setMeta] = useState({ teachers: [], classes: [], rooms: [], subjects: [], departments: [] });
  const [modal, setModal] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [deptTeacherIds, setDeptTeacherIds] = useState([]);

  const fetchVersions = async () => {
    try { const data = await api.get("/timetable/versions"); setVersions(Array.isArray(data) ? data : []); } catch {}
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await api.get("/timetable/slots");
      setSlots(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    try {
      const [teachersData, subjectsData, metaData, deptsData] = await Promise.all([
        api.get("/api/v1/teachers"),
        api.get("/api/v1/subjects"),
        api.get("/timetable/meta"),
        api.get("/api/v1/departments"),
      ]);
      const tMap = {};
      if (Array.isArray(teachersData)) teachersData.forEach(t => tMap[t.id] = t.name);
      setTeacherMap(tMap);
      const sMap = {};
      if (Array.isArray(subjectsData)) subjectsData.forEach(s => sMap[s.id] = s.name);
      setSubjectMap(sMap);
      const m = metaData || { teachers: [], classes: [], rooms: [], subjects: [] };
      const cMap = {};
      m.classes?.forEach(c => cMap[c.id] = c.name);
      setClassMap(cMap);
      const rMap = {};
      m.rooms?.forEach(r => rMap[r.id] = r.name);
      setRoomMap(rMap);
      const depts = Array.isArray(deptsData) ? deptsData : [];
      setMeta({ ...m, departments: depts });
      if (m.classes?.length > 0 && !selectedClassId) setSelectedClassId(m.classes[0].id);
      if (m.teachers?.length > 0 && !selectedTeacherId) setSelectedTeacherId(m.teachers[0].id);
      if (m.rooms?.length > 0 && !selectedRoomId) setSelectedRoomId(m.rooms[0].id);
      if (depts.length > 0 && !selectedDeptId) setSelectedDeptId(depts[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchVersions(); fetchSlots(); fetchMeta();
    if (isHOD && user?.email) {
  api.get("/api/v1/teachers").then(list => {
    if (Array.isArray(list)) {
      const me = list.find(t => String(t.email).toLowerCase() === String(user.email).toLowerCase());
      if (me?.department_id) setMyDeptId(me.department_id);
    }
  }).catch(() => {});
}
  }, [isHOD, user?.email]);

  useEffect(() => {
    if (isHOD && myDeptId) setSelectedDeptId(myDeptId);
  }, [isHOD, myDeptId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true); setGenerateSuccess(false); setError(null);
      const data = await api.post("/generate-timetable-sync/");
      if (data?.task_id || data?.version_id) {
        setTaskId(data.task_id || data.version_id);
        setGenerateSuccess(true);
        setTimeout(() => { fetchVersions(); fetchSlots(); setGenerating(false); }, 1500);
      } else { setError(data?.message || "Generation failed"); setGenerating(false); }
    } catch (err) { setError(err.message); setGenerating(false); }
  };

  const handleActivate = async (versionId) => {
    try { await api.post(`/timetable/versions/${versionId}/activate`); fetchVersions(); fetchSlots(); } catch {}
  };

  const handleCellClick = (slot, dayIdx, period) => {
    if (!canEditSlot(slot)) return;
    if (slot) setModal({ mode: "edit", slot, day: dayIdx, period });
    else setModal({ mode: "assign", slot: null, day: dayIdx, period });
  };

  const handleSave = async (form) => {
    const payload = { ...form };
    if (modal.mode === "assign" && selectedClassId && !payload.class_id) payload.class_id = selectedClassId;
    if (modal.mode === "assign") await api.post("/timetable/slots/assign", payload);
    else await api.put(`/timetable/slots/${String(modal.slot.id)}`, payload);
    await fetchSlots();
  };

  const handleDelete = async () => {
    await api.delete(`/timetable/slots/${String(modal.slot.id)}`);
    await fetchSlots();
  };

  const getFilteredSlots = () => {
    let result = slots;
    if (activeTab === "Class-Wise" && selectedClassId) result = slots.filter(s => String(s.class_id) === String(selectedClassId));
    else if (activeTab === "Teacher-Wise" && selectedTeacherId) result = slots.filter(s => String(s.teacher_id) === String(selectedTeacherId));
    else if (activeTab === "Room-Wise" && selectedRoomId) result = slots.filter(s => String(s.room_id) === String(selectedRoomId));
    else if (activeTab === "Dept-Wise" && deptTeacherIds.length > 0) result = slots.filter(s => deptTeacherIds.includes(String(s.teacher_id)));

    // HOD: restrict to their own department's teachers' slots only
    if (isHOD && myDeptId && meta.teachers?.length) {
      const myDeptTeacherIds = new Set(
        meta.teachers.filter(t => String(t.department_id) === String(myDeptId)).map(t => String(t.id))
      );
      result = result.filter(s => myDeptTeacherIds.has(String(s.teacher_id)));
    }

    return result;
  };
  const filteredSlots = getFilteredSlots();
  const slotsByDay = days.map((_, dayIdx) => filteredSlots.filter(s => s.day_of_week === dayIdx));

  const getCellContent = (slot) => {
    if (!slot) return { label: null, sublabel: null };
    if (activeTab === "Class-Wise") return { label: subjectMap[slot.subject_id] || "Subject", sublabel: teacherMap[slot.teacher_id] || "Teacher" };
    if (activeTab === "Teacher-Wise") return { label: subjectMap[slot.subject_id] || "Subject", sublabel: classMap[slot.class_id] || "Class" };
    if (activeTab === "Room-Wise") return { label: classMap[slot.class_id] || "Class", sublabel: teacherMap[slot.teacher_id] || "Teacher" };
    if (activeTab === "Dept-Wise") return { label: subjectMap[slot.subject_id] || "Subject", sublabel: `${teacherMap[slot.teacher_id] || "Teacher"} · ${classMap[slot.class_id] || "Class"}` };
    return { label: subjectMap[slot.subject_id], sublabel: teacherMap[slot.teacher_id] };
  };

  const getSelectorLabel = () => {
    if (activeTab === "Class-Wise") return "Class";
    if (activeTab === "Teacher-Wise") return "Teacher";
    if (activeTab === "Room-Wise") return "Room";
    if (activeTab === "Dept-Wise") return "Department";
  };

  const getSelectorOptions = () => {
    if (activeTab === "Class-Wise") return { value: selectedClassId, onChange: setSelectedClassId, options: meta.classes || [] };
    if (activeTab === "Teacher-Wise") {
      const opts = isHOD && myDeptId
        ? (meta.teachers || []).filter(t => String(t.department_id) === String(myDeptId))
        : (meta.teachers || []);
      return { value: selectedTeacherId, onChange: setSelectedTeacherId, options: opts };
    }
    if (activeTab === "Room-Wise") return { value: selectedRoomId, onChange: setSelectedRoomId, options: meta.rooms || [] };
    if (activeTab === "Dept-Wise") return { value: selectedDeptId, onChange: setSelectedDeptId, options: meta.departments || [] };
    return { value: "", onChange: () => {}, options: [] };
  };

  const selector = getSelectorOptions();

  const canEditSlot = (slot) => {
    if (isAdmin) return true;
    if (!isHOD || !myDeptId) return false;
    if (!slot) return true;
    const t = (meta.teachers || []).find(x => String(x.id) === String(slot.teacher_id));
    return t && String(t.department_id) === String(myDeptId);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8 h-full overflow-y-auto">
      <motion.div variants={itemVariants} className="flex items-center justify-between"> 
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Timetable Management</h1>
        {isAdmin && (
          <button onClick={handleGenerate} disabled={generating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${generating ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {generating ? (<><RefreshCw size={15} className="animate-spin" /> Generating...</>)
              : generateSuccess ? (<><CheckCircle size={15} /> Generated!</>)
              : (<><Zap size={15} /> Generate Timetable</>)}
          </button>
        )}
      </motion.div>

        {error && <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle size={14} /> {error}</motion.div>}

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {viewTabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${
                active ? "bg-indigo-600 text-white shadow-sm" : "border border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              }`}>
              {tab}
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Viewing Week</label>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
            <CalendarDays size={14} className="text-gray-400" />
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(Date.now() + 4 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">{getSelectorLabel()}</label>
          <select value={selector.value} onChange={e => selector.onChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {selector.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          <Info size={13} /> {filteredSlots.length} slots
        </div>
        {(isAdmin || isHOD) && <div className="ml-auto text-xs text-gray-400 italic">Click any cell to assign or edit</div>}
      </motion.div>

      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="w-20 whitespace-nowrap px-4 py-3 text-center"><Clock size={16} className="mx-auto text-gray-400" /></th>
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
                    <td className="whitespace-nowrap px-4 py-2 text-center text-xs font-bold text-gray-500">Period {period}</td>
                    {days.map((_, dayIdx) => {
                      const slot = slotsByDay[dayIdx]?.find(s => s.period === period);
                      const { label, sublabel } = getCellContent(slot);
                      return (
                        <td key={dayIdx} className="px-2 py-2">
                          <SlotCell data={slot} label={label} sublabel={sublabel} isAdmin={canEditSlot(slot)}
                            onClick={() => handleCellClick(slot, dayIdx, period)} />
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
        <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Conflict</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 bg-white" /> Free</div>
      </motion.div>

      <AnimatePresence>
        {modal && (
  <SlotModal mode={modal.mode} slot={modal.slot} day={modal.day} period={modal.period}
    isHOD={isHOD} myDeptId={myDeptId} allTeachers={meta.teachers}
    onClose={() => setModal(null)} onSave={handleSave} onDelete={handleDelete} />
)}
      </AnimatePresence>
      <BlockedSlotsPanel />
    </motion.div>
  );
}

