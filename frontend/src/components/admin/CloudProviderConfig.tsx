import React, { useState } from 'react';
import { CloudProvider } from '../../types/file';
import { SystemCloudConfig } from '../../types/admin';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';
import { Cloud, Database, Check, Server } from 'lucide-react';

interface CloudProviderConfigProps {
  config: SystemCloudConfig;
  onConfigUpdated: (newConfig: SystemCloudConfig) => void;
}

export const CloudProviderConfig: React.FC<CloudProviderConfigProps> = ({
  config,
  onConfigUpdated,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(config.defaultProvider);
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const handleProviderToggle = async (provider: CloudProvider) => {
    if (provider === selectedProvider || isUpdating) return;

    setIsUpdating(true);
    try {
      const updated = await adminApi.updateDefaultProvider(provider);
      setSelectedProvider(provider);
      onConfigUpdated(updated);
      toast.success(
        'Cloud Provider Switch Updated',
        `Primary default cloud provider set to ${provider === 'AZURE' ? 'Microsoft Azure Blob Storage' : 'Google Cloud Storage (GCP)'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update provider config', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs space-y-5">
      <div className="flex items-center gap-2">
        <Server className="w-5 h-5 text-brand-500" />
        <div>
          <h3 className="font-semibold text-base text-gray-900 dark:text-white">
            Default Storage Engine Configuration
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select the primary cloud provider used for new user uploads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Azure Option */}
        <div
          onClick={() => handleProviderToggle('AZURE')}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative ${
            selectedProvider === 'AZURE'
              ? 'bg-sky-50/70 dark:bg-sky-950/60 border-sky-500 shadow-md shadow-sky-500/10'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-sky-300'
          }`}
        >
          {selectedProvider === 'AZURE' && (
            <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-sky-500 text-white shadow-xs">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                Microsoft Azure Blob Storage
              </h4>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                Active Container: {config.azureContainerName}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            High-availability hot storage for unstructured blobs with built-in Azure Active Directory & Spring Security integration.
          </p>
        </div>

        {/* GCP Option */}
        <div
          onClick={() => handleProviderToggle('GCP')}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative ${
            selectedProvider === 'GCP'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
          }`}
        >
          {selectedProvider === 'GCP' && (
            <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-indigo-500 text-white shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                Google Cloud Storage (GCP)
              </h4>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Active Bucket: {config.gcpBucketName}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Scalable object store with global multi-region replication, high throughput, and Google Cloud IAM key integration.
          </p>
        </div>
      </div>
    </div>
  );
};
