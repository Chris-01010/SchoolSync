import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('schoolsync_token');
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!deadline || deadline === '45 mins') {
      setTimeLeft('45 min');
      return;
    }
    const tick = () => {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('Expired');
        return;
      }
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
          <h3 className="text-[14px] font-bold text-gray-800">
            Why are you flagging this request?
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {FLAG_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="flag_reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => { setReason(r.value); setError(''); }}
                className="accent-amber-500"
              />
              <span className="text-[12px] text-gray-700">{r.label}</span>
            </label>
          ))}
        </div>

        {reason === 'other' && (
          <textarea
            className="w-full border border-gray-200 rounded-lg p-2 text-[12px] resize-none
                       focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={3}
            maxLength={200}
            placeholder="Please describe the issue..."
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError(''); }}
          />
        )}

        {error && (
          <p className="text-[11px] text-red-500 mt-1">{error}</p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-[12px]
                       font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-[12px]
                       font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Flag'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Relief Request Card ──────────────────────────────────────────────────────
export default function ReliefRequestCard({ request, onResponded }) {
  const [loading, setLoading] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const respond = async (status, flag_reason = null, flag_comment = null) => {
    setLoading(true);
    try {
      const body = { status };
      if (flag_reason) body.flag_reason = flag_reason;
      if (flag_comment) body.flag_comment = flag_comment;

      const res = await fetch(
        `${BASE}/relief-assignments/${request.id}/respond`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 409) {
        showToast('This request has already been taken.', 'error');
        onResponded?.(request.id);
        return;
      }
      if (res.status === 410) {
        showToast('This request has expired.', 'error');
        onResponded?.(request.id);
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || 'Something went wrong.', 'error');
        return;
      }

      const messages = {
        accepted: 'Relief request accepted!',
        rejected: 'Relief request rejected.',
        flagged:  'Request flagged for admin review.',
      };
      showToast(messages[status]);
      setTimeout(() => onResponded?.(request.id), 1000);
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
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-[12px]
                         font-semibold shadow-lg ${
                           toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                         }`}>
          {toast.msg}
        </div>
      )}

      {flagOpen && (
        <FlagModal
          loading={loading}
          onClose={() => setFlagOpen(false)}
          onSubmit={(reason, comment) => respond('flagged', reason, comment)}
        />
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-[13px] font-bold text-gray-800">{request.absentTeacher}</p>
            <p className="text-[11px] text-gray-500">{request.subject} · {request.class}</p>
          </div>
          <CountdownTimer deadline={request.deadline} />
        </div>

        {/* Period / Day */}
        <p className="text-[11px] text-gray-500 mb-3">
          {request.day} · Period {request.period}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => respond('accepted')}
            disabled={loading}
            aria-label={`Accept relief request for ${request.class}`}
            className="flex-1 flex items-center justify-center gap-1 py-1.5
                       bg-emerald-500 hover:bg-emerald-600 text-white
                       text-[11px] font-semibold rounded-lg disabled:opacity-50
                       transition-colors"
          >
            <CheckCircle size={12} /> Accept
          </button>

          <button
            onClick={() => respond('rejected')}
            disabled={loading}
            aria-label={`Reject relief request for ${request.class}`}
            className="flex-1 flex items-center justify-center gap-1 py-1.5
                       bg-red-500 hover:bg-red-600 text-white
                       text-[11px] font-semibold rounded-lg disabled:opacity-50
                       transition-colors"
          >
            <XCircle size={12} /> Reject
          </button>

          <button
            onClick={() => setFlagOpen(true)}
            disabled={loading}
            aria-label={`Flag relief request for ${request.class}`}
            className="flex-1 flex items-center justify-center gap-1 py-1.5
                       bg-amber-400 hover:bg-amber-500 text-white
                       text-[11px] font-semibold rounded-lg disabled:opacity-50
                       transition-colors"
          >
            <AlertTriangle size={12} /> Flag
          </button>
        </div>
      </div>
    </>
  );
}