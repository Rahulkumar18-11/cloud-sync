import React from 'react';
import { CloudProvider } from '../../types/file';
import { Cloud, Database, HardDrive } from 'lucide-react';

interface CloudProviderBadgeProps {
  provider: CloudProvider;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const CloudProviderBadge: React.FC<CloudProviderBadgeProps> = ({
  provider,
  size = 'sm',
  showLabel = true,
}) => {
  const isAws = provider === 'AWS_S3';
  const isLocal = provider === 'LOCAL';
  const isAzure = provider === 'AZURE';

  const badgeStyles = isLocal
    ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
    : isAws
      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      : isAzure
        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300'
        : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const label = isLocal ? 'Local Storage' : isAws ? 'Amazon S3' : isAzure ? 'Azure Blob' : 'GCP Storage';
  const Icon = isLocal ? HardDrive : isAzure || isAws ? Cloud : Database;

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${badgeStyles} ${padding}`}>
      <Icon className={iconSize} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
