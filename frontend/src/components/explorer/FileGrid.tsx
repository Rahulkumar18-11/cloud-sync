import React from 'react';
import { FileItem, FolderItem } from '../../types/file';
import { FileCard } from './FileCard';

interface FileGridProps {
  folders: FolderItem[];
  files: FileItem[];
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onVersionHistory: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onDelete: (id: string, isFolder: boolean) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
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
    <div className="space-y-6">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Folders ({folders.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <FileCard
                key={folder.id}
                item={{ type: 'folder', data: folder }}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Files ({files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                item={{ type: 'file', data: file }}
                onDownload={onDownload}
                onShare={onShare}
                onVersionHistory={onVersionHistory}
                onRename={onRename}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
