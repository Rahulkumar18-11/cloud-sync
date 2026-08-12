import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { CloudProvider, UploadProgressItem } from '../../types/file';
import { fileApi } from '../../api/fileApi';
import { useToast } from '../../hooks/useToast';
import { UploadCloud, Cloud, Database, CheckCircle2, AlertCircle, File, X } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface DropzoneUploadProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
  onUploadComplete: () => void;
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
  isOpen,
  onClose,
  folderId = null,
  onUploadComplete,
}) => {
  const [provider, setProvider] = useState<CloudProvider>('AZURE');
  const [uploads, setUploads] = useState<UploadProgressItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newUploads: UploadProgressItem[] = fileArray.map((f) => ({
      id: `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName: f.name,
      fileSize: f.size,
      progress: 0,
      status: 'uploading',
      provider,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadItem = newUploads[i];

      try {
        await fileApi.uploadFile(file, folderId, provider, (percent) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadItem.id ? { ...u, progress: percent } : u))
          );
        });

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id ? { ...u, progress: 100, status: 'completed' } : u
          )
        );
        toast.success('Upload Completed', `Uploaded "${file.name}" to ${provider === 'AZURE' ? 'Azure Blob' : 'GCP Storage'}.`);
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id ? { ...u, status: 'error', error: err.message || 'Upload failed' } : u
          )
        );
        toast.error('Upload Failed', `Could not upload "${file.name}".`);
      }
    }

    onUploadComplete();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Files to CloudSync"
      subtitle="Select multi-cloud storage provider & drop your files"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Provider Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Target Cloud Storage Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProvider('AZURE')}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                provider === 'AZURE'
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-sky-500 text-white">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Microsoft Azure</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blob Storage Container</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProvider('GCP')}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                provider === 'GCP'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-500 text-white">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Google Cloud (GCP)</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cloud Storage Bucket</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-400 bg-gray-50/50 dark:bg-gray-900/40'
          }`}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Drag & drop your files here, or <span className="text-brand-600 dark:text-brand-400 underline">browse</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supports PDF, DOCX, XLSX, Images, Videos & ZIP archives up to 1 GB
          </p>
        </div>

        {/* Live Upload Progress Queue */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Upload Queue ({uploads.length})
              </span>
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear Completed
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {uploads.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {item.fileName}
                      </span>
                      <span className="text-gray-400">({formatBytes(item.fileSize)})</span>
                    </div>

                    {item.status === 'completed' && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}

                    {item.status === 'error' && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}

                    {item.status === 'uploading' && (
                      <span className="text-brand-600 dark:text-brand-400 font-semibold">
                        {item.progress}%
                      </span>
                    )}
                  </div>

                  {item.status === 'uploading' && (
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.progress}%` }}
                        className="h-full bg-brand-500 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
