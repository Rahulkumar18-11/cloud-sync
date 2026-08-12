import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-500">
          <Cloud className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">404</h1>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Page Not Found</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The page or folder path you are looking for does not exist in CloudSync.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
