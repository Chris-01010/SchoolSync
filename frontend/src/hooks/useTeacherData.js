import { useState, useEffect } from 'react';

const BASE = 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { 'Authorization': `Bearer ${token}` };
}

// Maps backend NotificationType enum values → what ICON_MAP/NOTIF_ICONS expect
function normalizeNotifType(raw) {
  if (!raw) return 'announcement';
  switch (raw.toUpperCase()) {
    case 'LEAVE_APPROVED':  return 'leave_approved';
    case 'LEAVE_REJECTED':  return 'leave_rejected';
    case 'RELIEF_REQUEST':
    case 'RELIEF_ACCEPTED':
    case 'RELIEF_REJECTED': return 'relief_assigned';
    case 'LEAVE_REQUEST':   return 'announcement';
    case 'ANNOUNCEMENT':    return 'announcement';
    default:                return 'announcement';
  }
}

export function useTeacherProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/v1/my/teacher-profile`, { headers: getHeaders() })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Uses the 2-step approach from the branch: get teacher.id first, then fetch timetable with scope_id
export function useTeacherTimetable() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch(`${BASE}/api/v1/teachers/me`, { headers: getHeaders() });
        const profile = await profileRes.json();
        const teacherId = profile?.id;
        if (!teacherId) throw new Error('Teacher profile not found');

        const res = await fetch(
          `${BASE}/timetable/view?scope=teacher&scope_id=${teacherId}`,
          { headers: getHeaders() }
        );
        const json = await res.json();
        setData(json?.timetable ?? {});
      } catch (e) {
        setError(e.message);
        setData({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}

export function useTeacherLeaves() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/leaves/my`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Full implementation from HEAD — includes refetch for real-time updates after responding
export function useTeacherReliefPending() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/leaves/relief/my/pending`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tick]);

  const refetch = () => setTick(t => t + 1);

  return { data, loading, refetch };
}

// Full implementation from HEAD
export function useTeacherReliefConfirmed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/leaves/relief/my/confirmed`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Uses normalizeNotifType from HEAD for consistent icon mapping across components
export function useTeacherNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/leaves/notifications/`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const raw = Array.isArray(d?.data) ? d.data : [];
        setData(raw.map(n => ({
          ...n,
          read:    n.is_read,
          message: n.content,
          type:    normalizeNotifType(n.notification_type),
          time:    n.created_at
            ? new Date(n.created_at).toLocaleString('en-IN', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })
            : '',
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}