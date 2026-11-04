import React, { useState } from 'react';
import { Check, Clock, Copy, Link as LinkIcon, Share2, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { shareApi } from '../../api/shareApi';
import { useToast } from '../../hooks/useToast';
import { FileItem, ShareLink } from '../../types/file';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, file }) => {
  const [expiryDays, setExpiryDays] = useState(7);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  const handleGenerate = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const link = await shareApi.createShareLink(file.id, file.name, 'DOWNLOAD', expiryDays);
      setGeneratedLink(link);
      toast.success('Share link created', 'Anyone with this link can download the file until it expires.');
    } catch (error) {
      const message = (error as any)?.response?.data?.detail || (error as Error).message;
      toast.error('Could not create share link', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink.shareableUrl);
      setIsCopied(true);
      toast.success('Copied to clipboard', 'The share link is ready to send.');
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Copy failed', 'Select and copy the link manually.');
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setExpiryDays(7);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Share file"
      subtitle={file ? `Create a download link for "${file.name}"` : 'Create a secure download link'}
      maxWidth="lg"
    >
      {!file ? null : generatedLink ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-200">
              <Shield className="h-4 w-4" /> Share link is ready
            </div>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              {generatedLink.expiresAt
                ? `Expires ${new Date(generatedLink.expiresAt).toLocaleString()}`
                : 'This link does not expire.'}
            </p>
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Shareable link</label>
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900">
              <LinkIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <input readOnly value={generatedLink.shareableUrl} className="w-full min-w-0 bg-transparent py-2 text-xs text-gray-800 outline-none dark:text-gray-100" />
            </div>
            <button onClick={() => void handleCopy()} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex justify-end">
            <button onClick={handleClose} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">Done</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Link expiration</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: '7 days', value: 7 }, { label: '30 days', value: 30 }, { label: 'Never', value: 0 }].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setExpiryDays(option.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${expiryDays === option.value ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Clock className="mx-auto mb-1 h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Anyone who has the link can download this file. You can delete the file to invalidate the link.</p>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" />
            {isGenerating ? 'Creating link...' : 'Create share link'}
          </button>
        </div>
      )}
    </Modal>
  );
};
