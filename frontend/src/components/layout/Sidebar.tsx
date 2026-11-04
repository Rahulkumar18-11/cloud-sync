import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Cloud, FolderKanban, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {isOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-gray-100 bg-white transition-transform dark:border-gray-700/80 dark:bg-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="flex items-center gap-3 border-b border-gray-100 p-6 dark:border-gray-700/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md"><Cloud className="h-6 w-6" /></div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">CloudSync</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">File storage</span>
            </div>
          </div>
          <nav className="space-y-1 px-4 py-6">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-gray-400">Workspace</p>
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 font-semibold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'}`}
            >
              <FolderKanban className="h-5 w-5" /> My files
            </NavLink>
          </nav>
        </div>

        <div className="space-y-4 border-t border-gray-100 p-4 dark:border-gray-700/60">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
