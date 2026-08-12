import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { UserProfile } from '../types/user';
import { StorageProgressBar } from '../components/common/StorageProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { User, Mail, Lock, ShieldCheck, HardDrive, Save, KeyRound } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const toast = useToast();

  useEffect(() => {
    userApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      })
      .catch((err) => toast.error('Failed to load profile', err.message))
      .finally(() => setIsLoading(false));
  }, [toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsUpdatingProfile(true);
    try {
      const updated = await userApi.updateProfile({ name, email });
      setProfile(updated);
      await refreshUser();
      toast.success('Profile Updated', 'Your profile info has been saved.');
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password Changed', 'Your security credentials were updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Password Change Failed', err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !profile) {
    return <LoadingSpinner size="lg" label="Loading account profile..." className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Profile Summary Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-md"
          />
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
            <p className="text-[11px] text-gray-400">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        {/* Quota Overview Card */}
        <div className="w-full sm:w-72 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">Storage Quota</span>
          </div>
          <StorageProgressBar
            usedBytes={profile.storageQuota.usedBytes}
            totalBytes={profile.storageQuota.totalBytes}
            azureUsedBytes={profile.storageQuota.azureUsedBytes}
            gcpUsedBytes={profile.storageQuota.gcpUsedBytes}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* View/Edit Profile Info Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <User className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your display name and email address
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                Security & Credentials
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update account password & authentication state
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
