import React from 'react';
import { formatBytes } from '../../utils/formatters';

interface StorageProgressBarProps {
  usedBytes: number;
  totalBytes: number;
  azureUsedBytes?: number;
  gcpUsedBytes?: number;
  showDetails?: boolean;
}

export const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  usedBytes,
  totalBytes,
  azureUsedBytes = 0,
  gcpUsedBytes = 0,
  showDetails = true,
}) => {
  const percentage = Math.min(100, Math.round((usedBytes / totalBytes) * 100));
  const azurePercent = Math.min(100, (azureUsedBytes / totalBytes) * 100);
  const gcpPercent = Math.min(100, (gcpUsedBytes / totalBytes) * 100);

  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-brand-500';
  };

  return (
    <div className="w-full space-y-2">
      {showDetails && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            {formatBytes(usedBytes)} / {formatBytes(totalBytes)} ({percentage}%)
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700/80 rounded-full overflow-hidden flex">
        {azureUsedBytes > 0 || gcpUsedBytes > 0 ? (
          <>
            <div
              style={{ width: `${azurePercent}%` }}
              className="h-full bg-sky-500 transition-all duration-500"
              title={`Azure: ${formatBytes(azureUsedBytes)}`}
            />
            <div
              style={{ width: `${gcpPercent}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
              title={`GCP: ${formatBytes(gcpUsedBytes)}`}
            />
          </>
        ) : (
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
          />
        )}
      </div>

      {showDetails && (azureUsedBytes > 0 || gcpUsedBytes > 0) && (
        <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Azure: {formatBytes(azureUsedBytes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>GCP: {formatBytes(gcpUsedBytes)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
