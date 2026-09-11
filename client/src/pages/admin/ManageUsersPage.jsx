import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import UserAvatar from '../../components/common/UserAvatar';

const ManageUsersPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (searchQuery) q.set('keyword', searchQuery);
      if (roleFilter && roleFilter !== 'all') q.set('role', roleFilter);
      q.set('page', page);
      q.set('limit', '10');

      const res = await api.get(`/users?${q.toString()}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleBlock = async (user) => {
    try {
      const res = await api.put(`/users/${user._id}/block`);
      showToast(res.data.message, 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBlocked: res.data.isBlocked } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user block status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser._id}`);
      showToast('User account deleted', 'info');
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      setDeleteModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" />
          Manage Platform Users
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review collector profiles, manage access permissions, and block/unblock accounts
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-medium w-full sm:w-auto">
          {['all', 'user', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : users.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No users found.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} size="sm" />
                        <span className="font-bold text-slate-200">{u.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.isBlocked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block/Unblock toggle */}
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            u.isBlocked
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Block</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for ${selectedUser?.name} (${selectedUser?.email})? This action cannot be undone.`}
        confirmText="Delete User"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ManageUsersPage;
