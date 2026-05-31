import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Flag, AlertTriangle } from 'lucide-react';

export default function ReliefRequestCard({
  request,
  flagReasons,
  isFlagOpen,
  onToggleFlag,
  onRespond
}) {
  const urgencyBadge = useMemo(() => {
    if (request.urgency === 'high') {
      return {
        cls: 'bg-error-container text-error',
        label: 'URGENT'
      };
    }

    return {
      cls: 'bg-surface-container-low border border-outline-variant text-slate-700',
      label: request.deadline
    };
  }, [request.deadline, request.urgency]);

  const [selectedReason, setSelectedReason] = useState('');

  useEffect(() => {
    if (!isFlagOpen) setSelectedReason('');
  }, [isFlagOpen]);

  const submitFlag = () => {
    if (!selectedReason) return;
    onRespond(request.id, 'flagged', selectedReason);
  };

  return (
    <div className="relative bg-white border border-outline-variant rounded-xl p-4 shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary rounded-l-xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-900 truncate">
              {request.absentTeacher} · {request.subject}
            </p>
            <span className={`text-[11px] font-black rounded-full px-3 py-1 uppercase tracking-wider ${urgencyBadge.cls}`}>
              {urgencyBadge.label}
            </span>
          </div>

          <p className="mt-2 text-[12px] font-semibold text-slate-600">
            {request.class} · {request.day} · Period {request.period}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          className="col-span-1 bg-secondary text-white rounded-lg px-3 py-2 text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95"
          onClick={() => onRespond(request.id, 'accepted')}
        >
          <Check size={16} /> Accept
        </button>
        <button
          className="col-span-1 bg-surface-container-low rounded-lg border border-outline-variant px-3 py-2 text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-surface-container-low"
          onClick={() => onRespond(request.id, 'rejected')}
        >
          <X size={16} /> Reject
        </button>
        <div className="relative" data-flag-dropdown="true">
          <button
            aria-label="Flag request"
            className="col-span-1 w-full bg-error-container text-error rounded-lg px-0 py-2 text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95"
            onClick={() => onToggleFlag()}
          >
            <Flag size={16} /> Flag
          </button>

          {isFlagOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant rounded-xl shadow-lg z-10 p-2">
              <div className="flex items-center gap-2 px-2 py-1">
                <AlertTriangle size={16} className="text-error" />
                <span className="text-[12px] font-bold text-error">Select a reason</span>
              </div>

              <div className="mt-2 space-y-1">
                {flagReasons.map((reason) => (
                  <button
                    key={reason}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-bold ${
                      selectedReason === reason ? 'bg-secondary-container/15 text-secondary' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                    onClick={() => {
                      setSelectedReason(reason);
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 py-2 rounded-lg text-[12px] font-black uppercase tracking-wider bg-surface-container-low border border-outline-variant"
                  onClick={() => onToggleFlag()}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2 rounded-lg text-[12px] font-black uppercase tracking-wider bg-error text-white disabled:opacity-50"
                  disabled={!selectedReason}
                  onClick={submitFlag}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

