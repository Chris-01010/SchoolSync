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