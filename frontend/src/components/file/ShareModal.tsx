import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { shareApi } from '../../api/shareApi';
import { useToast } from '../../hooks/useToast';
import { FileItem, SharePermission, ShareLink } from '../../types/file';
import { Share2, Copy, Check, Shield, Clock, Link as LinkIcon, Eye, Download } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, file }) => {
  const [permission, setPermission] = useState<SharePermission>('DOWNLOAD');
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  if (!file) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const link = await shareApi.createShareLink(file.id, file.name, permission, expiryDays);
      setGeneratedLink(link);
      toast.success('Share Link Created', 'Anyone with this link can now access the file according to permissions.');
    } catch (err: any) {
      toast.error('Failed to generate share link', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink.shareableUrl);
      setIsCopied(true);
      toast.success('Copied to Clipboard!', 'Shareable URL is copied.');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setGeneratedLink(null);
        onClose();
      }}
      title="Secure File Sharing"
      subtitle={`Generate public or restricted share link for "${file.name}"`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Permission Configuration */}
        {!generatedLink ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Access Permission
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPermission('DOWNLOAD')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      permission === 'DOWNLOAD'
                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Download className="w-5 h-5 text-brand-500" />
                    <div>
                      <h4 className="text-sm font-semibold">View & Download</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Recipients can download raw file</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermission('VIEW')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      permission === 'VIEW'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/20'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Eye className="w-5 h-5 text-purple-500" />
                    <div>
                      <h4 className="text-sm font-semibold">View Only</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Restricted browser view only</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Link Expiration
                </label>
                <div className="space-y-2">
                  {[
                    { label: '7 Days', value: 7 },
                    { label: '30 Days', value: 30 },
                    { label: 'Never Expire', value: 0 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setExpiryDays(item.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        expiryDays === item.value
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" /> {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-xl shadow-md transition-all"
              >
                <Share2 className="w-4 h-4" />
                {isGenerating ? 'Generating Link...' : 'Create Shareable Link'}
              </button>
            </div>
          </>
        ) : (
          /* Generated Share Link View */
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-sm">
                <Shield className="w-4 h-4 text-emerald-500" /> Share Link Generated!
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Permission: <strong className="uppercase">{generatedLink.permission}</strong> • Expires:{' '}
                {generatedLink.expiresAt ? new Date(generatedLink.expiresAt).toLocaleDateString() : 'Never'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Shareable Link URL
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value={generatedLink.shareableUrl}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-all flex-shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setGeneratedLink(null)}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                Configure New Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
