// frontend/src/components/shared/NotificationDropdown.jsx
// ─────────────────────────────────────────────────────────────
// Real-time notification bell + dropdown for all roles.
// Connects to SSE stream for instant push notifications.
//
// Usage:
//   <NotificationDropdown notificationsPath="/dashboard/notifications" />
//   <NotificationDropdown notificationsPath="/hod/notifications" />
//   <NotificationDropdown notificationsPath="/admin/notifications" />
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Repeat2, Users, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

// ─── Icon config per notification_type ────────────────────────────────────────
const ICON_MAP = {
  LEAVE_REQUEST:   { Icon: CheckCircle2,   bg: 'bg-amber-50',   color: 'text-amber-600'   },
  LEAVE_APPROVED:  { Icon: CheckCircle2,   bg: 'bg-emerald-50', color: 'text-emerald-600' },
  LEAVE_REJECTED:  { Icon: X,              bg: 'bg-red-50',     color: 'text-red-500'     },
  RELIEF_REQUEST:  { Icon: Repeat2,        bg: 'bg-orange-50',  color: 'text-orange-500'  },
  RELIEF_ACCEPTED: { Icon: Repeat2,        bg: 'bg-emerald-50', color: 'text-emerald-600' },
  RELIEF_REJECTED: { Icon: Repeat2,        bg: 'bg-red-50',     color: 'text-red-500'     },
  ANNOUNCEMENT:    { Icon: Users,          bg: 'bg-blue-50',    color: 'text-blue-500'    },
  GENERAL:         { Icon: Bell,           bg: 'bg-gray-50',    color: 'text-gray-500'    },
};

const getIcon = (type) => ICON_MAP[type] ?? ICON_MAP.GENERAL;

const timeAgo = (isoString) => {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const API_BASE = 'http://localhost:8000';

export default function NotificationDropdown({ notificationsPath }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFlash, setNewFlash] = useState(false); // flash the bell on new notif
  const dropdownRef = useRef(null);
  const sseRef = useRef(null);

  // ── Fetch all notifications from API ─────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/leaves/notifications/');
      const list = Array.isArray(data) ? data : (data?.data || []);
      setNotifs(list);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // ── Re-fetch when dropdown opens ─────────────────────────────────────────
  useEffect(() => { if (open) fetchNotifs(); }, [open, fetchNotifs]);

  // ── SSE: connect to real-time notification stream ────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('schoolsync_token') || localStorage.getItem('token');
    if (!token) return;

    // Use the query-param SSE endpoint (EventSource can't set headers)
    const es = new EventSource(
      `${API_BASE}/leaves/notifications/stream-sse?token=${encodeURIComponent(token)}`
    );

    es.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        if (notif && notif.id) {
          // Prepend new notification (avoid duplicates)
          setNotifs((prev) => {
            if (prev.some((n) => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });

          // Flash the bell icon
          setNewFlash(true);
          setTimeout(() => setNewFlash(false), 3000);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    es.addEventListener('connected', () => {
      console.log('[NotificationDropdown] SSE connected');
    });

    es.onerror = () => {
      // EventSource auto-reconnects; just log it
      console.warn('[NotificationDropdown] SSE connection error, will retry...');
    };

    sseRef.current = es;

    return () => {
      es.close();
      sseRef.current = null;
    };
  }, []); // only once on mount

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Mark single as read ──────────────────────────────────────────────────
  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await api.put(`/leaves/notifications/${id}/read`, {});
    } catch {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
    }
  };

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllRead = async () => {
    const prev = [...notifs];
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })));
    try {
      await api.put('/leaves/notifications/read-all', {});
    } catch {
      setNotifs(prev);
    }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const displayed = notifs.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors ${
          newFlash ? 'animate-bounce' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-800">Notifications</span>
              <div className="flex items-center gap-2">
                {notificationsPath && (
                  <>
                    <button
                      onClick={() => { setOpen(false); navigate(notificationsPath); }}
                      className="text-[10px] text-blue-600 font-semibold hover:underline"
                    >
                      Show all
                    </button>
                    <span className="text-gray-300">·</span>
                  </>
                )}
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-[10px] text-blue-600 font-semibold hover:underline disabled:text-gray-300 disabled:no-underline"
                >
                  Mark all read
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {loading && displayed.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-gray-400">Loading…</div>
              ) : displayed.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-gray-400">No notifications</div>
              ) : (
                displayed.map((n) => {
                  const cfg = getIcon(n.notification_type);
                  const IconEl = cfg.Icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.is_read) markRead(n.id);
                        if (n.action_url) {
                          setOpen(false);
                          navigate(n.action_url);
                        } else if (notificationsPath) {
                          setOpen(false);
                          navigate(notificationsPath);
                        }
                      }}
                      className={`flex items-start gap-2.5 px-4 py-3 cursor-pointer transition-colors ${
                        n.is_read ? 'hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <IconEl size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold leading-snug ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                          {n.content || 'Tap to view details'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[9px] text-gray-400 whitespace-nowrap">
                          {timeAgo(n.created_at)}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifs.length > 5 && notificationsPath && (
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => { setOpen(false); navigate(notificationsPath); }}
                  className="w-full text-center text-[10px] font-semibold text-blue-600 hover:underline"
                >
                  View all {notifs.length} notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}