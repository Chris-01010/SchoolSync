import React, { useState } from 'react';
import { Bell, Settings, Search, Menu, Plus } from 'lucide-react';

const Navbar = ({ onMenuClick, user }) => {
  const [searchVal, setSearchVal] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HD';

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search department data..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-colors"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={12} />
          Create Relief
        </button>

        <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings size={16} />
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold ml-1 cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
