import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Search, Menu, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE = 'http://localhost:8000';
function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { Authorization: `Bearer ${token}` };
}

function getNavUrl(n) {
  switch (n.notification_type) {
    case 'LEAVE_REQUEST':
      return `/hod/leave?leave_id=${n.action_url?.split('=')[1] ?? ''}&tab=pending`;
    case 'LEAVE_APPROVED':
      return '/hod/leave?tab=approved';
    case 'LEAVE_REJECTED':
      return '/hod/leave?tab=rejected';
    case 'RELIEF_REQUEST':
      return n.action_url ?? '/hod/relief';
    default:
      return n.action_url ?? null;
  }
}

const Navbar = ({ onMenuClick, user }) => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HD';

  const unread = notifs.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch(`${BASE}/leaves/notifications/`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((d) => setNotifs(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch(`${BASE}/leaves/notifications/read-all`, {
      method: 'PUT', headers: getHeaders(),
    }).catch(console.error);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotifClick = async (n) => {
    setOpen(false);
    setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
    fetch(`${BASE}/leaves/notifications/${n.id}/read`, {
      method: 'PUT', headers: getHeaders(),
    }).catch(console.error);
    const url = getNavUrl(n);
    if (url) navigate(url);
  };

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      >
        <Menu size={18} />
      </button>

      <div className="relative flex-1 max-w-xs">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search department data..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-colors"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { window.location.href = '/hod/relief#create-relief'; }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[12px] font-medium"
        >
          <Plus size={13} /> Create Relief
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <span className="text-[12px] font-bold text-gray-800">Notifications</span>
                {unread > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <p className="text-center text-[11px] text-gray-400 py-8">No notifications</p>
                ) : (
                  notifs.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !n.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && (
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <div className={!n.is_read ? '' : 'ml-3.5'}>
                          <p className="text-[11px] font-semibold text-gray-800">{n.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{n.content}</p>
                          <p className="text-[9px] text-gray-400 mt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short',
                              hour: '2-digit', minute: '2-digit',
                            }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifs.length > 10 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => { setOpen(false); navigate('/hod/notifications'); }}
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings size={16} />
        </button>

        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold ml-1 cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;