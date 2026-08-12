import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { fileApi } from '../../api/fileApi';
import { useToast } from '../../hooks/useToast';
import { Edit2 } from 'lucide-react';
import { FileItem } from '../../types/file';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onRenamed: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  file,
  onRenamed,
}) => {
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (file) {
      setNewName(file.name);
    }
  }, [file]);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === file.name) return;

    setIsSubmitting(true);
    try {
      await fileApi.renameFile(file.id, newName.trim());
      toast.success('Renamed Successfully', `Updated to "${newName.trim()}".`);
      onRenamed();
      onClose();
    } catch (err: any) {
      toast.error('Failed to rename', err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename File"
      subtitle={`Update filename for ${file.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            New Name
          </label>
          <div className="relative">
            <Edit2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
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
            disabled={isSubmitting || !newName.trim() || newName.trim() === file.name}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-md transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Rename'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
