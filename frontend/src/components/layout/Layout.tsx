import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { DropzoneUpload } from '../explorer/DropzoneUpload';
import { CreateFolderModal } from '../explorer/CreateFolderModal';

export interface LayoutOutletContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openUploadModal: () => void;
  openCreateFolderModal: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              searchQuery,
              setSearchQuery,
              openUploadModal: () => setIsUploadOpen(true),
              openCreateFolderModal: () => setIsCreateFolderOpen(true),
              refreshTrigger,
              triggerRefresh,
            } satisfies LayoutOutletContext}
          />
        </main>
      </div>

      {/* Upload File Drag & Drop Modal */}
      <DropzoneUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={() => {
          triggerRefresh();
        }}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onFolderCreated={() => {
          triggerRefresh();
        }}
      />
    </div>
  );
};

export function useLayoutContext() {
  return useOutletContext<LayoutOutletContext>();
}
