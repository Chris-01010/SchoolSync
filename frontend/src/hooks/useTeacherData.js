import { useState, useEffect } from 'react';

const BASE = 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { 'Authorization': `Bearer ${token}` };
}

export function useTeacherProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/teacher/me/profile`, { headers: getHeaders() })
      .then(r => r.json())
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
    fetch(`${BASE}/teacher/me/timetable`, { headers: getHeaders() })
      .then(r => r.json())
      .then(setData)
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
      .then(r => r.json())
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useTeacherReliefPending() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/teacher/me/relief/pending`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useTeacherReliefConfirmed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/teacher/me/relief/confirmed`, { headers: getHeaders() })
      .then(r => r.json())
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
      .then(r => r.json())
      .then(d => {
        const raw = Array.isArray(d?.data) ? d.data : [];
        setData(raw.map(n => ({
          ...n,
          // normalize to what the component expects
          read: n.is_read,
          message: n.content,
          type: n.notification_type ?? 'announcement',
          time: n.created_at
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