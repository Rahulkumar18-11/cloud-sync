import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  Download, 
  Share2, 
  History, 
  Edit2, 
  Move, 
  Trash2, 
  Folder
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types/file';
import { FileIcon } from '../common/FileIcon';
import { CloudProviderBadge } from '../common/CloudProviderBadge';
import { formatBytes, formatRelativeTime } from '../../utils/formatters';

interface FileCardProps {
  item: { type: 'folder'; data: FolderItem } | { type: 'file'; data: FileItem };
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onVersionHistory?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onMove?: (file: FileItem) => void;
  onDelete: (id: string, isFolder: boolean) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  onDownload,
  onShare,
  onVersionHistory,
  onRename,
  onMove,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (item.type === 'folder') {
    const folder = item.data;
    return (
      <div className="group relative bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all hover:border-amber-400 dark:hover:border-amber-500/50">
        <div className="flex items-start justify-between">
          <Link
            to={`/dashboard/folder/${folder.id}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 group-hover:scale-105 transition-transform">
              <Folder className="w-6 h-6 text-amber-500 fill-amber-500/20" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {folder.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {folder.itemsCount} items
              </p>
            </div>
          </Link>

          {/* Context Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 text-xs">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(folder.id, true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Folder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const file = item.data;

  return (
    <div className="group relative bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all hover:border-brand-300 dark:hover:border-brand-600/50 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 group-hover:scale-105 transition-transform flex-shrink-0">
            <FileIcon type={file.fileType} className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={file.name}>
              {file.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatBytes(file.sizeBytes)} • {formatRelativeTime(file.updatedAt)}
            </p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 text-xs">
              {onDownload && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDownload(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-brand-500" /> Download
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onShare(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" /> Share Link
                </button>
              )}

              {onVersionHistory && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onVersionHistory(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <History className="w-3.5 h-3.5 text-purple-500" /> Version History ({file.versionsCount})
                </button>
              )}

              {onRename && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRename(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-500" /> Rename
                </button>
              )}

              {onMove && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMove(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <Move className="w-3.5 h-3.5 text-cyan-500" /> Move to Folder
                </button>
              )}

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(file.id, false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Badge & Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <CloudProviderBadge provider={file.provider} size="sm" />

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDownload && (
            <button
              onClick={() => onDownload(file)}
              className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(file)}
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
