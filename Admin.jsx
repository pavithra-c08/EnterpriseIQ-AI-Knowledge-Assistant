import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import UserTable from '../components/UserTable';
import toast from 'react-hot-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { users, isLoading, isCreating, error, loadUsers, createUser, deleteUser, resetPassword, clearError } =
    useAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [createdInfo, setCreatedInfo] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return;
    try {
      const result = await createUser(form);
      setCreatedInfo(result);
      setForm({ username: '', email: '' });
      toast.success('User created successfully!');
    } catch {
      // toast from error effect
    }
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    toast.success('User deleted');
  };

  const handleReset = async (userId) => {
    const result = await resetPassword(userId);
    toast.success('Password reset!');
    return result;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-2 px-4 py-3 border-b md:flex-nowrap md:gap-4 md:px-6 md:py-4"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
      >
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-1.5 btn-ghost text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Chat</span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
          >
            <Shield size={14} className="text-white" />
          </div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Refresh — icon only on mobile, icon+label on desktop */}
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          onClick={() => { setShowModal(true); setCreatedInfo(null); }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={14} />
          <span className="hidden xs:inline">Add User</span>
          <span className="xs:hidden sr-only">Add</span>
        </button>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3 sm:gap-4 md:mb-8">
          {[
            { label: 'Total Users', value: users.length, color: '#2563EB' },
            { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, color: '#7C3AED' },
            { label: 'Pending Password Change', value: users.filter((u) => u.must_change_password).length, color: '#F59E0B' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-sm mt-0 sm:mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users size={18} />
              Users
            </h2>
            <span className="badge badge-blue">{users.length} total</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin-slow" style={{ color: '#2563EB' }} />
            </div>
          ) : (
            <UserTable users={users} onDelete={handleDelete} onResetPassword={handleReset} />
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="card w-full max-w-md animate-slideUp" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New User
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={16} />
              </button>
            </div>

            {createdInfo ? (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-xl text-sm space-y-2"
                  style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)' }}
                >
                  <p className="font-semibold" style={{ color: '#16A34A' }}>
                    ✓ {createdInfo.message}
                  </p>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg mt-2"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Default password:</span>
                    <code className="text-sm font-mono font-bold" style={{ color: '#16A34A' }}>
                      {createdInfo.default_password}
                    </code>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Share this password securely. The user will be prompted to change it on first login.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCreatedInfo(null); setShowModal(false); }} className="btn-primary flex-1">
                    Done
                  </button>
                  <button onClick={() => setCreatedInfo(null)} className="btn-ghost flex-1">
                    Add Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="e.g. john_doe"
                    required
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. john@company.com"
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isCreating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {isCreating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    {isCreating ? 'Creating…' : 'Create User'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
