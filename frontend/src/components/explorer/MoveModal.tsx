import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { fileApi } from '../../api/fileApi';
import { folderApi } from '../../api/folderApi';
import { useToast } from '../../hooks/useToast';
import { Folder, Home } from 'lucide-react';
import { FileItem, FolderItem } from '../../types/file';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onMoved: () => void;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  file,
  onMoved,
}) => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && file) {
      setSelectedFolderId(file.folderId);
      folderApi.getFolders(null).then(setFolders).catch(() => {});
    }
  }, [isOpen, file]);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFolderId === file.folderId) return;

    setIsSubmitting(true);
    try {
      await fileApi.moveFile(file.id, selectedFolderId);
      toast.success('File Moved', `Moved "${file.name}" successfully.`);
      onMoved();
      onClose();
    } catch (err: any) {
      toast.error('Failed to move file', err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Move File"
      subtitle={`Select destination folder for "${file.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Destination Directory
          </label>

          <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
            {/* Root Option */}
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedFolderId === null
                  ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Home className="w-4 h-4 text-brand-500" />
              <span>All Files (Root Directory)</span>
            </button>

            {/* Folder List */}
            {folders.map((fld) => (
              <button
                key={fld.id}
                type="button"
                onClick={() => setSelectedFolderId(fld.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedFolderId === fld.id
                    ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span className="truncate">{fld.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-normal">{fld.itemsCount} items</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedFolderId === file.folderId}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-md transition-all"
          >
            {isSubmitting ? 'Moving...' : 'Move File'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
