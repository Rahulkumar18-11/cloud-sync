import React from 'react';
import { ActivityLog, ActionType } from '../../types/activity';
import { formatRelativeTime } from '../../utils/formatters';
import { CloudProviderBadge } from '../common/CloudProviderBadge';
import { 
  UploadCloud, 
  Download, 
  Trash2, 
  FolderPlus, 
  Share2, 
  RotateCcw, 
  User, 
  Activity as ActivityIcon,
  Edit2,
  Move
} from 'lucide-react';

interface ActivityListProps {
  activities: ActivityLog[];
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case 'UPLOAD_FILE':
        return { label: 'Upload', icon: UploadCloud, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'DOWNLOAD_FILE':
        return { label: 'Download', icon: Download, color: 'text-brand-700 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800' };
      case 'DELETE_FILE':
      case 'DELETE_FOLDER':
        return { label: 'Delete', icon: Trash2, color: 'text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800' };
      case 'CREATE_FOLDER':
        return { label: 'New Folder', icon: FolderPlus, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'SHARE_FILE':
        return { label: 'Shared', icon: Share2, color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'RESTORE_VERSION':
        return { label: 'Restored', icon: RotateCcw, color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'RENAME_FILE':
        return { label: 'Renamed', icon: Edit2, color: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' };
      case 'MOVE_FILE':
        return { label: 'Moved', icon: Move, color: 'text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
      default:
        return { label: 'User Activity', icon: User, color: 'text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-brand-500" />
          <h3 className="font-semibold text-base text-gray-900 dark:text-white">
            User Activity Stream
          </h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Total Logs: {activities.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {activities.map((act) => {
          const badge = getActionBadge(act.action);
          const Icon = badge.icon;

          return (
            <div
              key={act.id}
              className="p-4 sm:p-5 hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl border ${badge.color} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {act.userName}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${badge.color}`}>
                      {badge.label}
                    </span>
                    {act.provider && (
                      <CloudProviderBadge provider={act.provider} size="sm" />
                    )}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                    {act.targetName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {act.details}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
