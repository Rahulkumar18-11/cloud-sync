import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { ActivityLog } from '../types/activity';
import { ActivityList } from '../components/activity/ActivityList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { Activity } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminApi
      .getActivityLogs()
      .then(setActivities)
      .catch((err) => toast.error('Failed to load activity logs', err.message))
      .finally(() => setIsLoading(false));
  }, [toast]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" /> Activity Audit Trail
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Chronological audit of uploads, downloads, sharing links, and folder management
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading activity events..." className="py-20" />
      ) : (
        <ActivityList activities={activities} />
      )}
    </div>
  );
};
