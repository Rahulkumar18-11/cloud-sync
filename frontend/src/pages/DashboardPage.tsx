import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FilePlus2, FileQuestion, LayoutGrid, List, RefreshCw, Search, Share2, Trash2 } from 'lucide-react';
import { useLayoutContext } from '../components/layout/Layout';
import { CloudProviderBadge } from '../components/common/CloudProviderBadge';
import { FileIcon } from '../components/common/FileIcon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShareModal } from '../components/file/ShareModal';
import { useToast } from '../hooks/useToast';
import { fileApi } from '../api/fileApi';
import { FileItem, ViewMode } from '../types/file';
import { formatBytes, formatRelativeTime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { searchQuery, openUploadModal, refreshTrigger } = useLayoutContext();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedShareFile, setSelectedShareFile] = useState<FileItem | null>(null);
  const toast = useToast();

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      setFiles(await fileApi.getFiles({ search: searchQuery }));
    } catch (error) {
      const message = (error as any)?.response?.data?.detail || (error as Error).message;
      toast.error('Could not load your files', message || 'Check that the API is running.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles, refreshTrigger]);

  const totalBytes = useMemo(() => files.reduce((total, file) => total + file.sizeBytes, 0), [files]);

  const handleDownload = async (file: FileItem) => {
    try {
      await fileApi.downloadFile(file.id, file.name);
      toast.success('Download started', file.name);
    } catch (error) {
      const message = (error as any)?.response?.data?.detail || (error as Error).message;
      toast.error('Download failed', message);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    try {
      await fileApi.deleteFile(file.id);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      toast.success('File deleted', file.name);
    } catch (error) {
      const message = (error as any)?.response?.data?.detail || (error as Error).message;
      toast.error('Delete failed', message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Your workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">My files</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {files.length} files · {formatBytes(totalBytes)} stored
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadFiles()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={openUploadModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-700"
          >
            <FilePlus2 className="h-4 w-4" /> Upload files
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Search className="h-4 w-4" />
          {searchQuery ? `Results for "${searchQuery}"` : 'All files in your account'}
        </div>
        <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <button
            aria-label="Grid view"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700' : 'text-gray-500'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            aria-label="List view"
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700' : 'text-gray-500'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading your files..." className="py-20" />
      ) : files.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <FileQuestion className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {searchQuery ? 'No matching files' : 'Your workspace is empty'}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try another search term.' : 'Upload your first file. It will be stored securely and linked to your account.'}
          </p>
          {!searchQuery && (
            <button onClick={openUploadModal} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Upload your first file
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <article key={file.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                    <FileIcon type={file.fileType} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={file.name}>{file.name}</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.sizeBytes)} · {formatRelativeTime(file.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                <CloudProviderBadge provider={file.provider} />
                <div className="flex items-center gap-1">
                  <button onClick={() => void handleDownload(file)} title="Download" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => setSelectedShareFile(file)} title="Share" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => void handleDelete(file)} title="Delete" className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-[minmax(0,1fr)_130px_100px] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900/60">
            <span>Name</span><span>Storage</span><span className="text-right">Size</span>
          </div>
          {files.map((file) => (
            <div key={file.id} className="grid grid-cols-[minmax(0,1fr)_130px_100px] items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0 dark:border-gray-700">
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon type={file.fileType} className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(file.createdAt)}</p>
                </div>
              </div>
              <CloudProviderBadge provider={file.provider} />
              <div className="flex items-center justify-end gap-1">
                <span className="mr-1 text-xs text-gray-500">{formatBytes(file.sizeBytes)}</span>
                <button onClick={() => void handleDownload(file)} title="Download" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"><Download className="h-4 w-4" /></button>
                <button onClick={() => setSelectedShareFile(file)} title="Share" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"><Share2 className="h-4 w-4" /></button>
                <button onClick={() => void handleDelete(file)} title="Delete" className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ShareModal isOpen={!!selectedShareFile} onClose={() => setSelectedShareFile(null)} file={selectedShareFile} />
    </div>
  );
};
