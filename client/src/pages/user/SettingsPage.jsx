import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Palette,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = () => {
  const { showToast } = useToast();
  const { theme, setTheme, effectiveTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preference switches
  const [outbidAlerts, setOutbidAlerts] = useState(true);
  const [countdownAlerts, setCountdownAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/password', { currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('Notification preferences saved', 'success');
  };

  const themeOptions = [
    {
      id: 'light',
      title: 'Light Theme',
      description: 'Clean bright layout for high-visibility daylight environments',
      icon: Sun,
    },
    {
      id: 'dark',
      title: 'Dark Theme',
      description: 'Sleek luxury dark palette tailored for nighttime bidding',
      icon: Moon,
    },
    {
      id: 'system',
      title: 'System Automatic',
      description: 'Synchronize automatically with your operating system preferences',
      icon: Laptop,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure appearance theme, security credentials, notification preferences, and session controls
        </p>
      </div>

      {/* 1. Theme Appearance Selection (Requirement 3) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Appearance & Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your interface color scheme. Currently active: <span className="font-bold capitalize text-amber-600 dark:text-amber-400">{effectiveTheme}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  showToast(`Theme switched to ${opt.title}`, 'info');
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <span className="font-bold text-xs block text-slate-900 dark:text-white mb-1">
                    {opt.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                    {opt.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Password Change Box */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Change Security Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a strong, unique password</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl font-bold text-xs text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* 3. Notification Preferences */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Live Bidding Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control real-time notifications for outbid status and countdowns</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 block">Immediate Outbid Alert</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive instant notifications when another collector outbids your offer</span>
            </div>
            <input
              type="checkbox"
              checked={outbidAlerts}
              onChange={(e) => setOutbidAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 block">Ending Soon Reminders</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Alert me when watchlisted items enter their final 60 minutes</span>
            </div>
            <input
              type="checkbox"
              checked={countdownAlerts}
              onChange={(e) => setCountdownAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 block">Weekly Rare Lot Digest</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive weekly curated drops of high-value Indian auction lots</span>
            </div>
            <input
              type="checkbox"
              checked={marketingAlerts}
              onChange={(e) => setMarketingAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl font-semibold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Save Alert Preferences
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
