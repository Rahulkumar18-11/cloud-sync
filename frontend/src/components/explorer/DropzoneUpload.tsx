import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, File, UploadCloud } from 'lucide-react';
import { Modal } from '../common/Modal';
import { UploadProgressItem } from '../../types/file';
import { fileApi } from '../../api/fileApi';
import { useToast } from '../../hooks/useToast';
import { formatBytes } from '../../utils/formatters';

interface DropzoneUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const [uploads, setUploads] = useState<UploadProgressItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;

    const queue = selected.map((file, index) => ({
      id: `${Date.now()}_${index}_${file.name}`,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'uploading' as const,
      provider: 'LOCAL' as const,
    }));
    setUploads((current) => [...current, ...queue]);

    let succeeded = 0;
    for (let index = 0; index < selected.length; index += 1) {
      const file = selected[index];
      const item = queue[index];
      try {
        await fileApi.uploadFile(file, null, 'LOCAL', (progress) => {
          setUploads((current) => current.map((upload) =>
            upload.id === item.id ? { ...upload, progress } : upload,
          ));
        });
        succeeded += 1;
        setUploads((current) => current.map((upload) =>
          upload.id === item.id ? { ...upload, progress: 100, status: 'completed' } : upload,
        ));
      } catch (error) {
        const message = (error as any)?.response?.data?.detail || (error as Error).message;
        setUploads((current) => current.map((upload) =>
          upload.id === item.id ? { ...upload, status: 'error', error: message } : upload,
        ));
        toast.error('Upload failed', `${file.name}: ${message}`);
      }
    }

    if (succeeded > 0) {
      toast.success('Upload complete', `${succeeded} file(s) uploaded successfully.`);
      onUploadComplete();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload files" subtitle="Files are stored in your CloudSync local storage for now." maxWidth="lg">
      <div className="space-y-4">
        <div
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-gray-300 bg-gray-50 hover:border-brand-400 dark:border-gray-700 dark:bg-gray-900/50'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files);
              event.currentTarget.value = '';
            }}
          />
          <UploadCloud className="mx-auto h-10 w-10 text-brand-600" />
          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Drop files here or browse</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum file size: 50 MB per file</p>
        </div>

        {uploads.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {uploads.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <File className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{item.fileName}</span>
                    <span className="text-xs text-gray-500">{formatBytes(item.fileSize)}</span>
                  </div>
                  {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {item.status === 'uploading' && <span className="text-xs text-brand-600">{item.progress}%</span>}
                </div>
                {item.status === 'uploading' && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full bg-brand-500 transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.error && <p className="mt-1 text-xs text-red-500">{item.error}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">Close</button>
        </div>
      </div>
    </Modal>
  );
};
