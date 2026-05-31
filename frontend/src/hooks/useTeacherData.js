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
    fetch(`${BASE}/auth/me`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useTeacherTimetable() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/timetable/view?scope=teacher`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
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