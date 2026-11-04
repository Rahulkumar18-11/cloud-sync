import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { DropzoneUpload } from '../explorer/DropzoneUpload';

export interface LayoutOutletContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openUploadModal: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((current) => current + 1);

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((current) => !current)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{
            searchQuery,
            setSearchQuery,
            openUploadModal: () => setIsUploadOpen(true),
            refreshTrigger,
            triggerRefresh,
          } satisfies LayoutOutletContext} />
        </main>
      </div>

      <DropzoneUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={triggerRefresh}
      />
    </div>
  );
};

export function useLayoutContext() {
  return useOutletContext<LayoutOutletContext>();
}
