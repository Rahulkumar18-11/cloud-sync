import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileItem, 
  FolderItem 
} from '../../types/file';
import { FileIcon } from '../common/FileIcon';
import { CloudProviderBadge } from '../common/CloudProviderBadge';
import { formatBytes, formatDate } from '../../utils/formatters';
import { 
  Folder, 
  MoreVertical, 
  Download, 
  Share2, 
  History, 
  Edit2, 
  Trash2 
} from 'lucide-react';

interface FileListProps {
  folders: FolderItem[];
  files: FileItem[];
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onVersionHistory: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onDelete: (id: string, isFolder: boolean) => void;
}

export const FileList: React.FC<FileListProps> = ({
  folders,
  files,
  onDownload,
  onShare,
  onVersionHistory,
  onRename,
  onMove,
  onDelete,
}) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-4 py-3.5">Cloud Provider</th>
              <th className="px-4 py-3.5">Size</th>
              <th className="px-4 py-3.5">Last Modified</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
            {/* Folder Rows */}
            {folders.map((folder) => (
              <tr
                key={folder.id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors group"
              >
                <td className="px-6 py-3.5">
                  <Link
                    to={`/dashboard/folder/${folder.id}`}
                    className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <span>{folder.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-gray-400 text-xs">—</td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs font-medium">
                  {folder.itemsCount} items
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                  {formatDate(folder.updatedAt)}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => onDelete(folder.id, true)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* File Rows */}
            {files.map((file) => (
              <tr
                key={file.id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors group"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <FileIcon type={file.fileType} className="w-5 h-5" />
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-md">
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <CloudProviderBadge provider={file.provider} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs font-medium">
                  {formatBytes(file.sizeBytes)}
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                  {formatDate(file.updatedAt)}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onDownload(file)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onShare(file)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onVersionHistory(file)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Versions"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRename(file)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(file.id, false)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
