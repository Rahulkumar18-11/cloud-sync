import React, { useState } from 'react';
import { AdminUser } from '../../types/admin';
import { formatBytes, formatDate } from '../../utils/formatters';
import { Search, ShieldCheck, User, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface UserManagementTableProps {
  users: AdminUser[];
  onToggleStatus: (userId: string, currentEnabled: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onToggleStatus,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-base text-gray-900 dark:text-white">
            User Accounts & Quotas
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage system access, enable/disable users, and review storage allocations
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3.5">User</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Storage Used</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last Active</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
            {filteredUsers.map((usr) => (
              <tr key={usr.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {usr.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {usr.email}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      usr.role === 'ADMIN'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {usr.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {usr.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {formatBytes(usr.usedStorageBytes)} / {formatBytes(usr.totalStorageBytes)}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onToggleStatus(usr.id, usr.enabled)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      usr.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100'
                    }`}
                  >
                    {usr.enabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-500" /> Disabled
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(usr.lastActive)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDeleteUser(usr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
