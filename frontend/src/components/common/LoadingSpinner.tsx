import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  label, 
  className = '' 
}) => {
  const dimensions = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div
        className={`${dimensions} border-brand-500 border-t-transparent rounded-full animate-spin`}
      />
      {label && (
        <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
      )}
    </div>
  );
};
