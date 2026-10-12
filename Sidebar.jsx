import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquarePlus,
  Trash2,
  LogOut,
  Bot,
  Users,
  FileText,
  ChevronRight,
  Loader2,
  MessageSquare,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

export default function Sidebar({ onSessionSelect }) {
  const navigate = useNavigate();
  const { username, role, logout } = useAuthStore();
  const {
    sessions,
    selectedSession,
    createSession,
    deleteSession,
    renameSession,
    selectSession,
    isLoading,
  } = useSessionStore();

  const [deletingId, setDeletingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const session = await createSession('New Chat');
      if (onSessionSelect) onSessionSelect(session);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteSession(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (id, newTitle) => {
    try {
      await renameSession(id, newTitle);
      toast.success('Session renamed');
    } catch {
      toast.error('Failed to rename session');
      throw new Error('rename failed');
    }
  };

  const handleSelect = (session) => {
    selectSession(session);
    if (onSessionSelect) onSessionSelect(session);
  };

  const handleLogout = () => setLogoutDialogOpen(true);
  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    ...(role === 'admin'
      ? [
          { label: 'Admin', icon: Users, path: '/admin' },
          { label: 'Documents', icon: FileText, path: '/documents' },
        ]
      : [{ label: 'Documents', icon: FileText, path: '/documents' }]),
  ];

  return (
    <>
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center glow-blue"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            <Bot size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              EnterpriseIQ
            </h1>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              Intelligent Enterprise Knowledge Assistant
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <Loader2 size={14} className="animate-spin-slow" />
          ) : (
            <MessageSquarePlus size={14} />
          )}
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare size={32} style={{ color: 'var(--text-muted)' }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No chats yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              Start a new conversation
            </p>
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={selectedSession?.id === session.id}
                isDeleting={deletingId === session.id}
                onSelect={() => handleSelect(session)}
                onDelete={(e) => handleDelete(e, session.id)}
                onRename={(newTitle) => handleRename(session.id, newTitle)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nav Links */}
      <div
        className="px-2 pb-2 space-y-1 border-t pt-2"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {navItems.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Icon size={16} />
            {label}
            <ChevronRight
              size={14}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-xl"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
          >
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {username}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Logout"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      open={logoutDialogOpen}
      variant="logout"
      title="Sign out?"
      message="You'll be returned to the login screen. Any unsaved work may be lost."
      confirmText="Sign Out"
      cancelText="Stay"
      onConfirm={confirmLogout}
      onCancel={() => setLogoutDialogOpen(false)}
    />
  </>
  );
}

// ─── Session Item ──────────────────────────────────────────────────────────────

function SessionItem({ session, isActive, isDeleting, onSelect, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Sync editValue when title changes externally (optimistic updates, etc.)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(session.title || '');
    }
  }, [session.title, isEditing]);

  // Autofocus & select-all when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = (e) => {
    e.stopPropagation();
    setEditValue(session.title || '');
    setIsEditing(true);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditValue(session.title || '');
  };

  const commitEdit = async (e) => {
    e?.stopPropagation();
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === session.title) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onRename(trimmed);
      setIsEditing(false);
    } catch {
      // Parent already showed error toast; restore local value
      setEditValue(session.title || '');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(e);
    } else if (e.key === 'Escape') {
      cancelEdit(e);
    }
  };

  return (
    <div
      onClick={isEditing ? undefined : onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 relative"
      style={{
        background: isActive ? 'var(--bg-hover)' : 'transparent',
        borderLeft: isActive ? '2px solid #2563EB' : '2px solid transparent',
        cursor: isEditing ? 'default' : 'pointer',
      }}
    >
      <MessageSquare
        size={14}
        className="flex-shrink-0"
        style={{ color: isActive ? '#2563EB' : 'var(--text-muted)' }}
      />

      {isEditing ? (
        /* ── Inline Edit Mode ── */
        <div
          className="flex items-center gap-1 flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 text-sm bg-transparent border-b outline-none"
            style={{
              color: 'var(--text-primary)',
              borderColor: '#2563EB',
              padding: '1px 2px',
            }}
            disabled={isSaving}
          />

          {/* Save button */}
          <button
            id={`session-save-${session.id}`}
            onClick={commitEdit}
            disabled={isSaving}
            title="Save"
            className="flex-shrink-0 p-1 rounded-lg transition-all duration-200"
            style={{ color: '#22c55e' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </button>

          {/* Cancel button */}
          <button
            id={`session-cancel-${session.id}`}
            onClick={cancelEdit}
            disabled={isSaving}
            title="Cancel"
            className="flex-shrink-0 p-1 rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        /* ── Normal Display Mode ── */
        <>
          <span
            className="text-sm truncate flex-1"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {session.title || 'Untitled Chat'}
          </span>

          {(hovered || isActive) && (
            <div
              className="flex items-center gap-0.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rename (✏️) button */}
              <button
                id={`session-rename-${session.id}`}
                onClick={startEdit}
                title="Rename"
                className="p-1 rounded-lg transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                  e.currentTarget.style.color = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <Pencil size={12} />
              </button>

              {/* Delete (🗑️) button */}
              <button
                id={`session-delete-${session.id}`}
                onClick={onDelete}
                disabled={isDeleting}
                title="Delete"
                className="p-1 rounded-lg transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
                  e.currentTarget.style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {isDeleting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
