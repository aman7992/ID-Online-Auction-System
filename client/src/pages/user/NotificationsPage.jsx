import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast('Notification removed', 'info');
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading notification feed..." />;
  }

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time updates regarding your live bids, outbid alerts, and won auctions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}

          {/* Filter tabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                filter === 'unread'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
          description="You are all caught up! When you place bids or are outbid, you will receive updates here."
        />
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notif) => {
            let icon = <Bell className="w-5 h-5 text-amber-400" />;
            if (notif.type === 'won') icon = <Trophy className="w-5 h-5 text-amber-400" />;
            else if (notif.type === 'outbid') icon = <AlertTriangle className="w-5 h-5 text-rose-400" />;
            else if (notif.type === 'bid') icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;

            return (
              <div
                key={notif._id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-slate-900/95 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 flex-shrink-0">
                    {icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-200">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                      title="View Auction"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
