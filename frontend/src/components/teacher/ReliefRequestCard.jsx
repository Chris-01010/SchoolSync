import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X, ArrowLeftRight, PlusCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!deadline || deadline === '45 mins') { setTimeLeft('45 min'); return; }
    const tick = () => {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) { setExpired(true); setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
      expired ? 'bg-gray-100 text-gray-400' : 'bg-amber-50 text-amber-600'
    }`}>
      {expired ? 'Expired' : `⏱ ${timeLeft}`}
    </span>
  );
}

// ─── Flag Modal ───────────────────────────────────────────────────────────────
const FLAG_REASONS = [
  { value: 'conflict',         label: 'Schedule conflict' },
  { value: 'not_qualified',    label: 'Not qualified for this subject' },
  { value: 'already_assigned', label: 'Already assigned relief for overlapping period' },
  { value: 'other',            label: 'Other' },
];

function FlagModal({ onSubmit, onClose, loading }) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason) { setError('Please select a reason.'); return; }
    if (reason === 'other' && !comment.trim()) {
      setError("Please provide a comment for 'Other' reason.");
      return;
    }
    setError('');
    onSubmit(reason, comment.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-gray-800">Why are you flagging this?</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="space-y-2 mb-3">
          {FLAG_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="flag_reason" value={r.value}
                checked={reason === r.value}
                onChange={() => { setReason(r.value); setError(''); }}
                className="accent-amber-500" />
              <span className="text-[12px] text-gray-700">{r.label}</span>
            </label>
          ))}
        </div>
        {reason === 'other' && (
          <textarea
            className="w-full border border-gray-200 rounded-lg p-2 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={3} maxLength={200} placeholder="Please describe the issue..."
            value={comment} onChange={(e) => { setComment(e.target.value); setError(''); }} />
        )}
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-[12px] font-semibold hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Flag'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Relief Request Card ──────────────────────────────────────────────────────
// view: 'actions' | 'mode' | 'swap' | 'consume'
export default function ReliefRequestCard({ request, onResponded }) {
  const [loading, setLoading]           = useState(false);
  const [flagOpen, setFlagOpen]         = useState(false);
  const [toast, setToast]               = useState(null);
  const [view, setView]                 = useState('actions');
  const [mySlots, setMySlots]           = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetView = () => {
    setView('actions');
    setSelectedSlotId(null);
    setMySlots([]);
  };

  // Fetch swappable slots when entering swap view
  const enterSwapView = async () => {
    setView('swap');
    setSlotsLoading(true);
    try {
      const data = await api.get('/relief/my-slots');
      setMySlots(data.slots ?? []);
    } catch {
      showToast('Could not load your slots.', 'error');
      setView('mode');
    } finally {
      setSlotsLoading(false);
    }
  };

  const respond = async (status, extras = {}) => {
    setLoading(true);
    try {
      if (status === 'accepted') {
        const body = { response: 'accepted', mode: extras.mode };
        if (extras.mode === 'swap') body.swap_slot_id = extras.swap_slot_id;
        await api.post(`/relief/assignments/${request.id}/respond`, body);
        const msg = extras.mode === 'consume'
          ? 'Consume request sent — awaiting absent teacher confirmation.'
          : 'Swap accepted! Your timetable has been updated.';
        showToast(msg);
      } else if (status === 'rejected') {
        await api.post(`/relief/assignments/${request.id}/respond`, { response: 'rejected' });
        showToast('Relief request rejected.');
      } else if (status === 'flagged') {
        await api.post(`/relief/assignments/${request.id}/respond`, {
          response: 'flagged',
          flag_reason: extras.flag_reason,
          flag_comment: extras.flag_comment,
        });
        showToast('Request flagged for admin review.');
      }
      setTimeout(() => onResponded?.(request.id), 1200);
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
      setFlagOpen(false);
    }
  };

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-[12px] font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {flagOpen && (
        <FlagModal
          loading={loading}
          onClose={() => setFlagOpen(false)}
          onSubmit={(reason, comment) => respond('flagged', { flag_reason: reason, flag_comment: comment })}
        />
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
        {/* Header — always visible */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-[13px] font-bold text-gray-800">{request.absentTeacher}</p>
            <p className="text-[11px] text-gray-500">{request.subject} · {request.class}</p>
          </div>
          <CountdownTimer deadline={request.deadline} />
        </div>
        <p className="text-[11px] text-gray-500 mb-3">{request.day} · Period {request.period}</p>

        {/* ── VIEW: actions (default) ── */}
        {view === 'actions' && (
          <div className="flex gap-2">
            <button onClick={() => respond('rejected')} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-colors">
              <XCircle size={12} /> Reject
            </button>
            <button onClick={() => setFlagOpen(true)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-amber-400 hover:bg-amber-500 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-colors">
              <AlertTriangle size={12} /> Flag
            </button>
            {/* Accept now opens mode picker */}
            <button onClick={() => setView('mode')} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-colors">
              <CheckCircle size={12} /> Accept
            </button>
          </div>
        )}

        {/* ── VIEW: mode picker ── */}
        {view === 'mode' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 mb-1">
              <button onClick={resetView} className="text-gray-400 hover:text-gray-600">
                <ChevronLeft size={14} />
              </button>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">How would you like to cover this?</p>
            </div>
            <button onClick={enterSwapView}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all text-left">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowLeftRight size={13} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-blue-900">Swap a Period</p>
                <p className="text-[10px] text-blue-700">Trade one of your future slots. No workload change.</p>
              </div>
            </button>
            <button onClick={() => setView('consume')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <PlusCircle size={13} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-emerald-900">Take Extra Hour</p>
                <p className="text-[10px] text-emerald-700">Absent teacher confirms before workload updates.</p>
              </div>
            </button>
          </div>
        )}

        {/* ── VIEW: swap slot picker ── */}
        {view === 'swap' && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <button onClick={() => setView('mode')} className="text-gray-400 hover:text-gray-600">
                <ChevronLeft size={14} />
              </button>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Pick a slot to vacate</p>
            </div>
            {slotsLoading ? (
              <p className="text-center py-4 text-[11px] text-gray-400">Loading your slots…</p>
            ) : mySlots.length === 0 ? (
              <p className="text-center py-4 text-[11px] text-gray-400">No future slots available to swap.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
                {mySlots.map((s) => (
                  <button key={s.slot_id} onClick={() => setSelectedSlotId(s.slot_id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 text-[11px] font-semibold transition-all ${
                      selectedSlotId === s.slot_id
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}>
                    <span>{DAY_NAMES[s.day_of_week] ?? `Day ${s.day_of_week}`} · Period {s.period}</span>
                    {selectedSlotId === s.slot_id && <CheckCircle2 size={13} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
            {!slotsLoading && mySlots.length > 0 && (
              <button
                onClick={() => respond('accepted', { mode: 'swap', swap_slot_id: selectedSlotId })}
                disabled={!selectedSlotId || loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold disabled:opacity-50 transition-colors">
                {loading ? 'Confirming…' : 'Confirm Swap'}
              </button>
            )}
          </div>
        )}

        {/* ── VIEW: consume confirmation ── */}
        {view === 'consume' && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <button onClick={() => setView('mode')} className="text-gray-400 hover:text-gray-600">
                <ChevronLeft size={14} />
              </button>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Confirm extra hour</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">Before confirming:</p>
              <p>· Absent teacher must approve before your relief hours are credited</p>
              <p>· If they reject, the slot reverts back to them</p>
            </div>
            <button
              onClick={() => respond('accepted', { mode: 'consume' })}
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold disabled:opacity-50 transition-colors">
              {loading ? 'Sending…' : 'Send Consume Request'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}