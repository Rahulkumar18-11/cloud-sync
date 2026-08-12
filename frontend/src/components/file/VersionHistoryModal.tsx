import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { fileApi } from '../../api/fileApi';
import { useToast } from '../../hooks/useToast';
import { FileVersion, FileItem } from '../../types/file';
import { formatBytes, formatDate } from '../../utils/formatters';
import { Download, RotateCcw, CheckCircle2, User, Clock } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onVersionRestored: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  file,
  onVersionRestored,
}) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && file) {
      setIsLoading(true);
      fileApi
        .getFileVersions(file.id)
        .then(setVersions)
        .catch((err) => toast.error('Failed to load versions', err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, file]);

  if (!file) return null;

  const handleRestore = async (version: FileVersion) => {
    setRestoringId(version.id);
    try {
      await fileApi.restoreVersion(file.id, version.id);
      toast.success(
        'Version Restored',
        `Restored "${file.name}" to version v${version.versionNumber}.`
      );
      onVersionRestored();
      onClose();
    } catch (err: any) {
      toast.error('Failed to restore version', err.message || 'An error occurred.');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDownloadVersion = async (version: FileVersion) => {
    toast.info('Downloading Version', `Fetching v${version.versionNumber} of ${file.name}`);
    await fileApi.downloadFile(file.id, `v${version.versionNumber}_${file.name}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="File Version History"
      subtitle={`Audit logs and version tree for ${file.name}`}
      maxWidth="lg"
    >
      {isLoading ? (
        <LoadingSpinner label="Fetching version history..." />
      ) : (
        <div className="space-y-4">
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className={`p-4 rounded-xl border transition-all ${
                  ver.isCurrent
                    ? 'bg-brand-50/70 dark:bg-brand-950/50 border-brand-200 dark:border-brand-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        Version {ver.versionNumber}
                      </span>

                      {ver.isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Current Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(ver.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {ver.createdBy}
                      </span>
                      <span>{formatBytes(ver.sizeBytes)}</span>
                    </div>

                    {ver.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic pt-1">
                        "{ver.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadVersion(ver)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                      title="Download this version"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {!ver.isCurrent && (
                      <button
                        onClick={() => handleRestore(ver)}
                        disabled={restoringId === ver.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-white dark:bg-gray-800 hover:bg-brand-50 border border-brand-200 dark:border-brand-800 rounded-lg transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {restoringId === ver.id ? 'Restoring...' : 'Restore'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
