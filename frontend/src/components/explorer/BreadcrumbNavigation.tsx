import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { BreadcrumbItem } from '../../types/file';

interface BreadcrumbNavigationProps {
  breadcrumbs: BreadcrumbItem[];
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ breadcrumbs }) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 overflow-x-auto py-1 scrollbar-none">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const targetPath = item.id ? `/dashboard/folder/${item.id}` : '/dashboard';

        return (
          <React.Fragment key={item.id || 'root'}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}

            {isLast ? (
              <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold flex-shrink-0">
                {index === 0 ? (
                  <Home className="w-4 h-4 text-brand-500" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                )}
                <span>{item.name}</span>
              </span>
            ) : (
              <Link
                to={targetPath}
                className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex-shrink-0"
              >
                {index === 0 ? (
                  <Home className="w-4 h-4" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-400" />
                )}
                <span>{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
