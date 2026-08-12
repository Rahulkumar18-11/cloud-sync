import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../hooks/useToast';
import { AdminUser, SystemStorageStats, SystemCloudConfig } from '../types/admin';
import { ActivityLog } from '../types/activity';
import { StatCard } from '../components/common/StatCard';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { StorageChart } from '../components/admin/StorageChart';
import { CloudProviderConfig } from '../components/admin/CloudProviderConfig';
import { ActivityList } from '../components/activity/ActivityList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Users, 
  HardDrive, 
  Files, 
  ShieldCheck, 
  Server
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const AdminPanelPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStorageStats | null>(null);
  const [cloudConfig, setCloudConfig] = useState<SystemCloudConfig | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

  const toast = useToast();

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedStats, fetchedConfig, fetchedLogs] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getStorageStats(),
        adminApi.getCloudConfig(),
        adminApi.getActivityLogs(),
      ]);

      setUsers(fetchedUsers);
      setStats(fetchedStats);
      setCloudConfig(fetchedConfig);
      setActivities(fetchedLogs);
    } catch (err: any) {
      toast.error('Failed to load admin metrics', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentEnabled: boolean) => {
    try {
      const updated = await adminApi.setUserStatus(userId, !currentEnabled);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(
        'User Status Changed',
        `${updated.name} account is now ${updated.enabled ? 'Active' : 'Disabled'}.`
      );
    } catch (err: any) {
      toast.error('Status Update Failed', err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!window.confirm(`Are you sure you want to permanently delete account for ${target?.name || 'this user'}?`)) return;

    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User Deleted', 'Account removed from system database.');
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    }
  };

  if (isLoading || !stats || !cloudConfig) {
    return <LoadingSpinner size="lg" label="Loading admin system metrics..." className="py-20" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Admin Command Center
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            System administration, multi-cloud storage metrics, user access & audit logs
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-gray-200/70 dark:bg-gray-700/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            System Audit
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="System Capacity"
              value={formatBytes(stats.totalCapacityBytes)}
              subtitle={`${formatBytes(stats.usedCapacityBytes)} used across clouds`}
              icon={HardDrive}
              iconBgColor="bg-brand-50 dark:bg-brand-950/60"
              iconColor="text-brand-600 dark:text-brand-400"
            />
            <StatCard
              title="Registered Users"
              value={stats.totalUsersCount}
              subtitle={`${stats.activeUsersCount} active session accounts`}
              icon={Users}
              iconBgColor="bg-purple-50 dark:bg-purple-950/60"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Total Files Managed"
              value={stats.totalFilesCount}
              subtitle={`${stats.totalFoldersCount} folders organized`}
              icon={Files}
              iconBgColor="bg-sky-50 dark:bg-sky-950/60"
              iconColor="text-sky-600 dark:text-sky-400"
            />
            <StatCard
              title="Default Storage Engine"
              value={cloudConfig.defaultProvider === 'AZURE' ? 'Azure Blob' : 'GCP Storage'}
              subtitle="Primary provider for new uploads"
              icon={Server}
              iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* Storage Breakdown Chart */}
          <StorageChart stats={stats} />

          {/* Cloud Provider Config Switcher */}
          <CloudProviderConfig config={cloudConfig} onConfigUpdated={setCloudConfig} />
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagementTable
          users={users}
          onToggleStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityList activities={activities} />
      )}
    </div>
  );
};
