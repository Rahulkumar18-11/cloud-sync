import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLayoutContext } from '../components/layout/Layout';
import { useDebounce } from '../hooks/useDebounce';
import { fileApi } from '../api/fileApi';
import { folderApi } from '../api/folderApi';
import { useToast } from '../hooks/useToast';
import { FileItem, FolderItem, ViewMode, CloudProvider, FileType, BreadcrumbItem } from '../types/file';
import { BreadcrumbNavigation } from '../components/explorer/BreadcrumbNavigation';
import { FileGrid } from '../components/explorer/FileGrid';
import { FileList } from '../components/explorer/FileList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { VersionHistoryModal } from '../components/file/VersionHistoryModal';
import { ShareModal } from '../components/file/ShareModal';
import { RenameModal } from '../components/explorer/RenameModal';
import { MoveModal } from '../components/explorer/MoveModal';
import { LayoutGrid, List, Filter, Cloud, FolderPlus, UploadCloud, FileQuestion } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { folderId } = useParams<{ folderId?: string }>();
  const currentFolderId = folderId || null;

  const { searchQuery, openUploadModal, openCreateFolderModal, refreshTrigger, triggerRefresh } = useLayoutContext();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<CloudProvider | 'all'>('all');

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal active states
  const [selectedVersionFile, setSelectedVersionFile] = useState<FileItem | null>(null);
  const [selectedShareFile, setSelectedShareFile] = useState<FileItem | null>(null);
  const [selectedRenameFile, setSelectedRenameFile] = useState<FileItem | null>(null);
  const [selectedMoveFile, setSelectedMoveFile] = useState<FileItem | null>(null);

  const toast = useToast();

  const loadExplorerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFolders, fetchedFiles, fetchedCrumbs] = await Promise.all([
        folderApi.getFolders(currentFolderId),
        fileApi.getFiles({
          folderId: currentFolderId,
          search: debouncedSearch,
          fileType: fileTypeFilter,
          provider: providerFilter,
        }),
        folderApi.getBreadcrumbs(currentFolderId),
      ]);

      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
      setBreadcrumbs(fetchedCrumbs);
    } catch (err: any) {
      toast.error('Failed to load explorer files', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, debouncedSearch, fileTypeFilter, providerFilter, toast]);

  useEffect(() => {
    loadExplorerData();
  }, [loadExplorerData, refreshTrigger]);

  const handleDownload = async (file: FileItem) => {
    toast.info('Downloading File', `Starting download for ${file.name}`);
    await fileApi.downloadFile(file.id, file.name);
  };

  const handleDelete = async (id: string, isFolder: boolean) => {
    if (!window.confirm(`Are you sure you want to delete this ${isFolder ? 'folder and its contents' : 'file'}?`)) return;

    try {
      if (isFolder) {
        await folderApi.deleteFolder(id);
        toast.success('Folder Deleted', 'Folder removed successfully.');
      } else {
        await fileApi.deleteFile(id);
        toast.success('File Deleted', 'File removed from cloud storage.');
      }
      triggerRefresh();
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Breadcrumbs Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <BreadcrumbNavigation breadcrumbs={breadcrumbs} />

        <div className="flex items-center gap-3 flex-wrap">
          {/* File Type Filter */}
          <div className="relative">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="doc">Word / Text</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="code">Code & JSON</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Cloud Provider Filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Cloud Providers</option>
              <option value="AZURE">Microsoft Azure</option>
              <option value="GCP">Google Cloud (GCP)</option>
            </select>
            <Cloud className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Grid vs List View Mode Toggle */}
          <div className="flex items-center bg-gray-200/70 dark:bg-gray-700/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Workspace Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Scanning cloud storage contents..." className="py-20" />
      ) : folders.length === 0 && files.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-500">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No files or folders found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {debouncedSearch || fileTypeFilter !== 'all' || providerFilter !== 'all'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'Upload files or create folders to start organizing your multi-cloud storage.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openCreateFolderModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50"
            >
              <FolderPlus className="w-4 h-4 text-amber-500" /> Create Folder
            </button>
            <button
              onClick={openUploadModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md"
            >
              <UploadCloud className="w-4 h-4" /> Upload File
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <FileGrid
          folders={folders}
          files={files}
          onDownload={handleDownload}
          onShare={(file) => setSelectedShareFile(file)}
          onVersionHistory={(file) => setSelectedVersionFile(file)}
          onRename={(file) => setSelectedRenameFile(file)}
          onMove={(file) => setSelectedMoveFile(file)}
          onDelete={handleDelete}
        />
      ) : (
        <FileList
          folders={folders}
          files={files}
          onDownload={handleDownload}
          onShare={(file) => setSelectedShareFile(file)}
          onVersionHistory={(file) => setSelectedVersionFile(file)}
          onRename={(file) => setSelectedRenameFile(file)}
          onMove={(file) => setSelectedMoveFile(file)}
          onDelete={handleDelete}
        />
      )}

      {/* Feature Modals */}
      <VersionHistoryModal
        isOpen={!!selectedVersionFile}
        onClose={() => setSelectedVersionFile(null)}
        file={selectedVersionFile}
        onVersionRestored={triggerRefresh}
      />

      <ShareModal
        isOpen={!!selectedShareFile}
        onClose={() => setSelectedShareFile(null)}
        file={selectedShareFile}
      />

      <RenameModal
        isOpen={!!selectedRenameFile}
        onClose={() => setSelectedRenameFile(null)}
        file={selectedRenameFile}
        onRenamed={triggerRefresh}
      />

      <MoveModal
        isOpen={!!selectedMoveFile}
        onClose={() => setSelectedMoveFile(null)}
        file={selectedMoveFile}
        onMoved={triggerRefresh}
      />
    </div>
  );
};
