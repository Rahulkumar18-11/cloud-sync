import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shareApi } from '../api/shareApi';
import { fileApi } from '../api/fileApi';
import { useToast } from '../hooks/useToast';
import { FileItem, ShareLink } from '../types/file';
import { FileIcon } from '../components/common/FileIcon';
import { CloudProviderBadge } from '../components/common/CloudProviderBadge';
import { formatBytes, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Cloud, Download, ShieldCheck, AlertTriangle, Eye } from 'lucide-react';

export const SharedFileViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ shareLink: ShareLink; file: FileItem } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      shareApi
        .getSharedFileByToken(token)
        .then(setData)
        .catch((err) => setError(err.message || 'This share link is invalid or has expired.'))
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const handleDownload = async () => {
    if (!data) return;
    toast.info('Downloading Shared File', `Preparing ${data.file.name}`);
    await fileApi.downloadFile(data.file.id, data.file.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" label="Decrypting shared file link..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-4 border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Link Unavailable</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {error || 'This link has expired or been revoked by the owner.'}
          </p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-md"
          >
            Return to CloudSync
          </Link>
        </div>
      </div>
    );
  }

  const { shareLink, file } = data;
  const isExpired = shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/60 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight leading-none">
                CloudSync Shared File
              </h1>
              <span className="text-[10px] uppercase font-semibold text-brand-600 dark:text-brand-400">
                Secure Cloud Delivery
              </span>
            </div>
          </div>
          <CloudProviderBadge provider={file.provider} size="sm" />
        </div>

        {/* Shared File Details Card */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700">
              <FileIcon type={file.fileType} className="w-10 h-10" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white truncate" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Size: {formatBytes(file.sizeBytes)} • Owner: {file.ownerName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-gray-200/60 dark:border-gray-700/60">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Shared On</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(shareLink.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Permission</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase">{shareLink.permission}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isExpired ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs text-center font-medium">
            This share link expired on {formatDate(shareLink.expiresAt!)}.
          </div>
        ) : shareLink.permission === 'VIEW' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold border border-purple-200 dark:border-purple-800">
              <Eye className="w-4 h-4" /> Preview Mode Only (Downloads Restricted)
            </div>
          </div>
        ) : (
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" /> Download Shared File
          </button>
        )}

        <div className="text-center text-xs text-gray-400 pt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Protected by CloudSync JWT & TLS Encryption
        </div>
      </div>
    </div>
  );
};
