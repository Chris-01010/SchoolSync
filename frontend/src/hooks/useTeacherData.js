import { useState, useEffect } from 'react';
const BASE = 'http://localhost:8000';
function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { 'Authorization': `Bearer ${token}` };
}
export function useTeacherProfile() {
  const [data, setData]       = useState(null);
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
export function useTeacherTimetable() {
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  useEffect(() => {
    async function load() {
      try {
        // Step 1: get teacher profile to obtain teacher.id (not user.id)
        const profileRes = await fetch(`${BASE}/api/v1/teachers/me`, { headers: getHeaders() });
        const profile    = await profileRes.json();
        const teacherId  = profile?.id;
        if (!teacherId) throw new Error('Teacher profile not found');
        // Step 2: fetch timetable with that UUID
        const res  = await fetch(
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
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${BASE}/leaves/my`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.data ?? []);
        setData(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}
// No backend endpoint yet — return empty silently to avoid 404s
export function useTeacherReliefPending() {
  return { data: [], loading: false };
}
export function useTeacherReliefConfirmed() {
  return { data: [], loading: false };
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