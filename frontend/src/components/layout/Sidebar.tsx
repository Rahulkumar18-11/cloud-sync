import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Activity, 
  User, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Cloud,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { StorageProgressBar } from '../common/StorageProgressBar';
import { userApi } from '../../api/userApi';
import { StorageQuota } from '../../types/user';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [quota, setQuota] = useState<StorageQuota>({
    usedBytes: 254890000,
    totalBytes: 10737418240,
    azureUsedBytes: 160000000,
    gcpUsedBytes: 94890000,
    filesCount: 7,
    foldersCount: 4,
  });

  useEffect(() => {
    userApi.getStorageQuota().then(setQuota).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'File Explorer', path: '/dashboard', icon: FolderKanban },
    { label: 'Activity Logs', path: '/activity', icon: Activity },
    { label: 'Profile & Quota', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Dashboard', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/80 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight leading-none">
                CloudSync
              </h1>
              <span className="text-[10px] uppercase font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
                Multi-Cloud Storage
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-[11px] uppercase font-semibold text-gray-400 dark:text-gray-500 px-3 pb-2">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section: Storage Meter, Theme Toggle, Profile */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700/60 space-y-4">
          {/* Storage Meter Widget */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-700/40">
            <StorageProgressBar
              usedBytes={quota.usedBytes}
              totalBytes={quota.totalBytes}
              azureUsedBytes={quota.azureUsedBytes}
              gcpUsedBytes={quota.gcpUsedBytes}
              showDetails={true}
            />
          </div>

          {/* Controls & User Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </button>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
