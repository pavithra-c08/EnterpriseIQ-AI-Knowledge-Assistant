import { useState } from 'react';
import { Trash2, RotateCcw, EyeOff, Shield, User, Loader2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function UserTable({ users, onDelete, onResetPassword }) {
  const [deletingId, setDeletingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Confirm-dialog state
  const [dialog, setDialog] = useState({ open: false, type: null, userId: null, username: '' });

  const openDeleteDialog = (userId, username) =>
    setDialog({ open: true, type: 'delete', userId, username });

  const openResetDialog = (userId, username) =>
    setDialog({ open: true, type: 'reset', userId, username });

  const closeDialog = () => setDialog({ open: false, type: null, userId: null, username: '' });

  const handleDialogConfirm = async () => {
    const { type, userId } = dialog;
    closeDialog();
    if (type === 'delete') {
      setDeletingId(userId);
      try { await onDelete(userId); } finally { setDeletingId(null); }
    } else if (type === 'reset') {
      setResettingId(userId);
      try {
        const result = await onResetPassword(userId);
        if (result?.default_password) {
          setRevealedPasswords((prev) => ({ ...prev, [userId]: result.default_password }));
        }
      } finally { setResettingId(null); }
    }
  };

  const handleDelete = (userId, username) => openDeleteDialog(userId, username);
  const handleReset  = (userId, username) => openResetDialog(userId, username);

  if (users.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <User size={32} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          No users found
        </p>
      </div>
    );
  }

  const sortedUsers = [...users].sort(
    (a, b) => (a.role === 'admin' ? -1 : 1) - (b.role === 'admin' ? -1 : 1)
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>

      {/* ── Desktop Table Header (hidden on mobile) ── */}
      <div
        className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span>Username</span>
        <span>Email</span>
        <span>Role</span>
        <span>Actions</span>
      </div>

      {/* ── Rows ── */}
      <div style={{ background: 'var(--bg-card)' }}>
        {sortedUsers.map((user, idx) => (
          <div
            key={user.id}
            style={{
              borderBottom: idx < users.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            {/* ── Mobile Card Layout ── */}
            <div
              className="flex flex-col gap-3 px-4 py-4 md:hidden transition-colors duration-150"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Top row: avatar + name + role badge */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </p>
                  {user.must_change_password && (
                    <span className="text-xs" style={{ color: '#f59e0b' }}>
                      Must change password
                    </span>
                  )}
                </div>
                <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'} flex-shrink-0`}>
                  {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                  {user.role}
                </span>
              </div>

              {/* Bottom row: email + actions */}
              <div className="flex items-center justify-between gap-2 pl-12">
                <p className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {user.email || '—'}
                </p>

                <div className="flex items-center gap-1.5">
                  {/* Revealed password */}
                  {revealedPasswords[user.id] && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                      }}
                    >
                      <code className="font-mono">{revealedPasswords[user.id]}</code>
                      <button
                        onClick={() =>
                          setRevealedPasswords((prev) => {
                            const next = { ...prev };
                            delete next[user.id];
                            return next;
                          })
                        }
                        className="ml-1 opacity-60 hover:opacity-100"
                      >
                        <EyeOff size={10} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleReset(user.id, user.username)}
                    disabled={resettingId === user.id}
                    title="Reset Password"
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                      e.currentTarget.style.color = '#f59e0b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    {resettingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  </button>

                  <button
                    onClick={() => user.role !== 'admin' && handleDelete(user.id, user.username)}
                    disabled={user.role === 'admin' || deletingId === user.id}
                    title={user.role === 'admin' ? 'Admin account cannot be deleted.' : 'Delete User'}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{
                      color: 'var(--text-muted)',
                      opacity: user.role === 'admin' ? 0.35 : 1,
                      cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (user.role === 'admin') return;
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      if (user.role === 'admin') return;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    {deletingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Desktop Table Row (hidden on mobile) ── */}
            <div
              className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors duration-150"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </p>
                  {user.must_change_password && (
                    <span className="text-xs" style={{ color: '#f59e0b' }}>
                      Must change password
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                {user.email || '—'}
              </p>

              <div>
                <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                  {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {revealedPasswords[user.id] && (
                  <div
                    className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                    }}
                  >
                    <code className="font-mono">{revealedPasswords[user.id]}</code>
                    <button
                      onClick={() =>
                        setRevealedPasswords((prev) => {
                          const next = { ...prev };
                          delete next[user.id];
                          return next;
                        })
                      }
                      className="ml-1 opacity-60 hover:opacity-100"
                    >
                      <EyeOff size={10} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleReset(user.id, user.username)}
                  disabled={resettingId === user.id}
                  className="p-1.5 rounded-lg transition-all duration-200"
                  title="Reset Password"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                    e.currentTarget.style.color = '#f59e0b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {resettingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                </button>

                <button
                  onClick={() => user.role !== 'admin' && handleDelete(user.id, user.username)}
                  disabled={user.role === 'admin' || deletingId === user.id}
                  className="p-1.5 rounded-lg transition-all duration-200"
                  title={user.role === 'admin' ? 'Admin account cannot be deleted.' : 'Delete User'}
                  style={{
                    color: user.role === 'admin' ? 'var(--text-muted)' : 'var(--text-muted)',
                    opacity: user.role === 'admin' ? 0.35 : 1,
                    cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (user.role === 'admin') return;
                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    if (user.role === 'admin') return;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {deletingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={dialog.open}
        variant={dialog.type === 'reset' ? 'warning' : 'danger'}
        title={dialog.type === 'reset' ? 'Reset Password?' : 'Delete User?'}
        message={
          dialog.type === 'reset'
            ? `This will generate a new temporary password for "${dialog.username}". They will need to change it on next login.`
            : `Are you sure you want to permanently delete "${dialog.username}"? This action cannot be undone.`
        }
        confirmText={dialog.type === 'reset' ? 'Reset Password' : 'Delete User'}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
