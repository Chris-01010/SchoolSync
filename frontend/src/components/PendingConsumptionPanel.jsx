import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

/**
 * PendingConsumptionPanel
 *
 * Fetches GET /relief/assignments/pending-consumption and renders each
 * pending consume request. Allows absent teacher to Approve or Reject
 * via POST /relief/assignments/{id}/confirm-consumption.
 *
 * Props: none (reads auth token from localStorage, same as TeacherDashboard)
 */
export default function PendingConsumptionPanel() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState({});   // { [id]: bool }
  const [acting, setActing]     = useState({});   // { [id]: 'approve'|'reject'|null }
  const [feedback, setFeedback] = useState({});   // { [id]: { ok: bool, msg: string } }

  const headers = () => {
    const token = localStorage.getItem('schoolsync_token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchPending = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/relief/assignments/pending-consumption', { headers: headers() })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setItems(Array.isArray(data.assignments) ? data.assignments : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const respond = async (id, confirm) => {
    const action = confirm ? 'approve' : 'reject';
    setActing(prev => ({ ...prev, [id]: action }));
    setFeedback(prev => ({ ...prev, [id]: null }));

    try {
      const res = await fetch(
        `http://localhost:8000/relief/assignments/${id}/confirm-consumption`,
        { method: 'POST', headers: headers(), body: JSON.stringify({ confirm }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? `HTTP ${res.status}`);

      setFeedback(prev => ({
        ...prev,
        [id]: { ok: true, msg: confirm ? 'Approved — workload updated.' : 'Rejected — slot reverted.' }
      }));
      // Remove after short delay so the user sees the feedback
      setTimeout(() => setItems(prev => prev.filter(i => i.assignment_id !== id)), 1800);
    } catch (err) {
      setFeedback(prev => ({ ...prev, [id]: { ok: false, msg: err.message } }));
    } finally {
      setActing(prev => ({ ...prev, [id]: null }));
    }
  };

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Nothing to show ──────────────────────────────────────────────────────────
  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          <h2 className="text-[18px] font-bold text-slate-900">Pending Consume Approvals</h2>
        </div>
        {!loading && !error && (
          <span className="text-[12px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        )}
      </div>

      <p className="mt-1 text-[12px] font-semibold text-slate-500">
        A substitute has volunteered to cover your slot. Approve to confirm their extra hour.
      </p>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle size={16} />
          <span className="text-[13px] font-semibold">Failed to load: {error}</span>
          <button
            onClick={fetchPending}
            className="ml-auto text-[12px] font-bold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Item list */}
      {!loading && !error && (
        <div className="mt-4 space-y-3">
          {items.map(item => {
            const isExpanded = !!expanded[item.assignment_id];
            const fb         = feedback[item.assignment_id];
            const isActing   = !!acting[item.assignment_id];

            return (
              <div
                key={item.assignment_id}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  fb?.ok
                    ? 'border-green-200 bg-green-50'
                    : fb && !fb.ok
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-200 bg-surface-container-low'
                }`}
              >
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(item.assignment_id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                  aria-expanded={isExpanded}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-amber-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 truncate">
                      {item.subject ?? 'Class'} · {item.class_name ?? item.class ?? ''}
                    </p>
                    <p className="text-[12px] font-semibold text-slate-600">
                      {item.day} · Period {item.period}
                    </p>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Covered by: <span className="text-slate-700">{item.substitute_name ?? 'Substitute'}</span>
                    </p>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded detail + actions */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-slate-100 pt-3 space-y-3">
                    {/* Detail grid */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                      {item.substitute_name && (
                        <>
                          <dt className="font-semibold text-slate-500">Substitute</dt>
                          <dd className="font-bold text-slate-800">{item.substitute_name}</dd>
                        </>
                      )}
                      {item.absence_date && (
                        <>
                          <dt className="font-semibold text-slate-500">Absence date</dt>
                          <dd className="font-bold text-slate-800">{item.absence_date}</dd>
                        </>
                      )}
                      {item.reason && (
                        <>
                          <dt className="font-semibold text-slate-500">Leave reason</dt>
                          <dd className="font-bold text-slate-800">{item.reason}</dd>
                        </>
                      )}
                    </dl>

                    {/* Workload impact note */}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] font-semibold text-amber-800 leading-snug">
                        If you approve, {item.substitute_name ?? 'the substitute'}'s relief hours +1 and your total hours −1.
                        If you reject, the slot reverts to you.
                      </p>
                    </div>

                    {/* Feedback banner */}
                    {fb && (
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold ${
                        fb.ok
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {fb.ok
                          ? <CheckCircle size={15} />
                          : <AlertTriangle size={15} />
                        }
                        {fb.msg}
                      </div>
                    )}

                    {/* Action buttons — hidden once feedback is shown */}
                    {!fb && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => respond(item.assignment_id, true)}
                          disabled={isActing}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold transition-colors disabled:opacity-50"
                        >
                          {acting[item.assignment_id] === 'approve'
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <CheckCircle size={15} />
                          }
                          Approve
                        </button>

                        <button
                          onClick={() => respond(item.assignment_id, false)}
                          disabled={isActing}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-bold transition-colors disabled:opacity-50"
                        >
                          {acting[item.assignment_id] === 'reject'
                            ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            : <XCircle size={15} />
                          }
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
