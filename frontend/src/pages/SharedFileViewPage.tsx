import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Cloud, Download, ShieldCheck } from 'lucide-react';
import { shareApi } from '../api/shareApi';
import { useToast } from '../hooks/useToast';
import { FileItem, ShareLink } from '../types/file';
import { FileIcon } from '../components/common/FileIcon';
import { CloudProviderBadge } from '../components/common/CloudProviderBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatBytes, formatDate } from '../utils/formatters';

export const SharedFileViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ shareLink: ShareLink; file: FileItem } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setError('This share link is invalid.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    shareApi.getSharedFileByToken(token)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError?.response?.data?.detail || 'This share link is invalid or has expired.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  const handleDownload = async () => {
    if (!data || !token) return;
    setIsDownloading(true);
    try {
      await shareApi.downloadSharedFile(token, data.file.name);
      toast.success('Download started', data.file.name);
    } catch (downloadError) {
      const message = (downloadError as any)?.response?.data?.detail || (downloadError as Error).message;
      toast.error('Download failed', message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><LoadingSpinner size="lg" label="Checking share link..." /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Share link unavailable</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'This link is invalid or has expired.'}</p>
          <Link to="/login" className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Open CloudSync</Link>
        </div>
      </div>
    );
  }

  const { shareLink, file } = data;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-4">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-white/20 bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white"><Cloud className="h-6 w-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">CloudSync shared file</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Secure file sharing</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 dark:bg-gray-900/60">
          <FileIcon type={file.fileType} className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-gray-900 dark:text-white">{file.name}</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.sizeBytes)}</p>
            <div className="mt-2"><CloudProviderBadge provider={file.provider} /></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Link created: {formatDate(shareLink.createdAt)}</span>
          <span>{shareLink.expiresAt ? `Expires: ${formatDate(shareLink.expiresAt)}` : 'Never expires'}</span>
        </div>
        <button
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Download className="h-4 w-4" /> {isDownloading ? 'Preparing download...' : 'Download shared file'}
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Share token verified by CloudSync</p>
      </div>
    </div>
  );
};
