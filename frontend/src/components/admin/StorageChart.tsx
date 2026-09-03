import React from 'react';
import { SystemStorageStats } from '../../types/admin';
import { formatBytes } from '../../utils/formatters';
import { Cloud, Database, HardDrive } from 'lucide-react';

interface StorageChartProps {
  stats: SystemStorageStats;
}

export const StorageChart: React.FC<StorageChartProps> = ({ stats }) => {
  const azurePercent = Math.min(100, (stats.azureStorageBytes / stats.totalCapacityBytes) * 100);
  const gcpPercent = Math.min(100, (stats.gcpStorageBytes / stats.totalCapacityBytes) * 100);
  const freeBytes = Math.max(0, stats.totalCapacityBytes - stats.usedCapacityBytes);
  const freePercent = Math.max(0, 100 - azurePercent - gcpPercent);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-gray-900 dark:text-white">
            Multi-Cloud Storage Allocation
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time breakdown across Azure Blob Storage & Google Cloud Storage
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800">
          Capacity: {formatBytes(stats.totalCapacityBytes)}
        </span>
      </div>

      {/* Multi-Segment Stacked Visual Bar */}
      <div className="space-y-2">
        <div className="h-5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${azurePercent}%` }}
            className="h-full bg-sky-500 hover:opacity-90 transition-all duration-500"
            title={`Azure: ${formatBytes(stats.azureStorageBytes)}`}
          />
          <div
            style={{ width: `${gcpPercent}%` }}
            className="h-full bg-indigo-500 hover:opacity-90 transition-all duration-500"
            title={`GCP: ${formatBytes(stats.gcpStorageBytes)}`}
          />
          <div
            style={{ width: `${freePercent}%` }}
            className="h-full bg-emerald-400/30 dark:bg-emerald-900/30 transition-all duration-500"
            title={`Free Space: ${formatBytes(freeBytes)}`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium pt-1">
          <span>Used: {formatBytes(stats.usedCapacityBytes)}</span>
          <span>Free: {formatBytes(freeBytes)}</span>
        </div>
      </div>

      {/* Cloud Provider Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-1">
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
            <span className="text-xs font-semibold">Microsoft Azure</span>
            <Cloud className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-sky-950 dark:text-sky-100">
            {formatBytes(stats.azureStorageBytes)}
          </p>
          <p className="text-[11px] text-sky-700 dark:text-sky-300">
            {azurePercent.toFixed(1)}% of total capacity
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
            <span className="text-xs font-semibold">Google Cloud Storage</span>
            <Database className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-indigo-950 dark:text-indigo-100">
            {formatBytes(stats.gcpStorageBytes)}
          </p>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
            {gcpPercent.toFixed(1)}% of total capacity
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-xs font-semibold">Available Space</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
            {formatBytes(freeBytes)}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
            {freePercent.toFixed(1)}% free
          </p>
        </div>
      </div>
    </div>
  );
};
