import React from 'react';
import { Menu, Search, UploadCloud } from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  searchQuery,
  onSearchChange,
  onOpenUpload,
}) => (
  <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-800/80 lg:px-8">
    <div className="flex items-center justify-between gap-4">
      <div className="flex max-w-2xl flex-1 items-center gap-3">
        <button onClick={onToggleMobileSidebar} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search your files..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white"
          />
          {searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">Clear</button>}
        </div>
      </div>
      <button onClick={onOpenUpload} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-700">
        <UploadCloud className="h-4 w-4" /><span className="hidden sm:inline">Upload file</span><span className="sm:hidden">Upload</span>
      </button>
    </div>
  </header>
);
