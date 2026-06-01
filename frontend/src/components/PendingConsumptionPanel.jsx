import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Clock, RefreshCw } from 'lucide-react';

const BASE = 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('schoolsync_token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border
                  flex items-center gap-2 text-[12px] font-semibold
                  ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
                    : type === 'approve' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700'}`}
    >
      {type === 'approve' ? <CheckCircle2 size={14} /> : <X size={14} />}
      {msg}
    </motion.div>
  );
}

export default function PendingConsumptionPanel() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null); // assignment id currently being responded to
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = 'approve') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/leaves/relief/my/pending-consume-approvals`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const respond = async (id, action) => {
    setActing(id);
    try {
      const res = await fetch(`${BASE}/leaves/relief/${id}/consume-respond`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
          const err = await res.json();
          if (typeof err.detail === 'string') detail = err.detail;
        } catch { /* keep default */ }
        throw new Error(detail);
      }
      showToast(
        action === 'approve'
          ? 'Approved — substitute\'s hours have been credited.'
          : 'Rejected — the slot has been reassigned.',
        action === 'approve' ? 'approve' : 'reject',
      );
      // Remove the item from the list optimistically
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      showToast(e.message || 'Something went wrong.', 'error');
    } finally {
      setActing(null);
    }
  };

  // Don't render anything if no pending items and not loading
  if (!loading && items.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>

      <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-600" />
            <span className="text-[13px] font-bold text-amber-800">
              Pending Consume Approvals
            </span>
            {items.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-1 rounded-lg text-amber-500 hover:bg-amber-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <p className="text-center py-8 text-[12px] text-gray-400">Loading…</p>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-3"
              >
                {/* Info */}
                <div className="mb-3">
                  <p className="text-[13px] font-bold text-gray-800">
                    {item.substitute} wants to cover your class
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.subject && item.class
                      ? `${item.subject} · ${item.class}`
                      : item.subject || item.class || '—'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.day} · Period {item.period}
                  </p>
                  <p className="text-[10px] text-amber-700 bg-amber-50 rounded-md px-2 py-1 mt-2 inline-block font-medium">
                    Approving will credit their relief hours. Rejecting reassigns the slot.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(item.id, 'reject')}
                    disabled={acting === item.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500
                               hover:bg-red-600 text-white text-[11px] font-semibold rounded-lg
                               disabled:opacity-50 transition-colors"
                  >
                    <X size={12} /> Reject
                  </button>
                  <button
                    onClick={() => respond(item.id, 'approve')}
                    disabled={acting === item.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500
                               hover:bg-emerald-600 text-white text-[11px] font-semibold rounded-lg
                               disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    {acting === item.id ? 'Processing…' : 'Approve'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}