import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle2,
  File,
  Clock,
  Trash2,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import UploadPanel from '../components/UploadPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Documents() {
  const navigate = useNavigate();
  const { documents, count, isLoading, isRebuilding, error, loadDocuments, rebuildIndex, clearError, deleteDocument } =
    useDocumentStore();
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';
  const [rebuildStatus, setRebuildStatus] = useState(null); // 'success' | 'error'
  const [rebuildMsg, setRebuildMsg] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleRebuild = async () => {
    try {
      const result = await rebuildIndex();
      setRebuildStatus('success');
      setRebuildMsg(result?.message || 'Vector database rebuilt successfully!');
      toast.success('Vector database rebuilt!');
    } catch (err) {
      setRebuildStatus('error');
      setRebuildMsg(err.response?.data?.detail || 'Rebuild failed.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-2 px-4 py-3 border-b md:flex-nowrap md:gap-4 md:px-6 md:py-4"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
      >
        <button onClick={() => navigate('/chat')} className="flex items-center gap-1.5 btn-ghost text-sm">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Chat</span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0891B2, #2563EB)' }}
          >
            <FileText size={14} className="text-white" />
          </div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Documents
          </h1>
        </div>
        <button onClick={loadDocuments} disabled={isLoading} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'lg:grid-cols-3' : ''}`}>
          {/* Left Column: Upload + Rebuild (admin only) */}
          {isAdmin && (
            <div className="lg:col-span-1 space-y-5">
              {/* Upload Section */}
              <div className="card">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FileText size={16} style={{ color: '#2563EB' }} />
                  Upload Document
                </h2>
                <UploadPanel />
              </div>

              {/* Rebuild Section */}
              <div className="card">
                <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Database size={16} style={{ color: '#7C3AED' }} />
                  Vector Database
                </h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Rebuild the vector index after uploading new documents to make them searchable.
                </p>

                {rebuildStatus && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mb-3 animate-slideUp"
                    style={{
                      background:
                        rebuildStatus === 'success'
                          ? 'rgba(22, 163, 74, 0.1)'
                          : 'rgba(220, 38, 38, 0.1)',
                      border: `1px solid ${rebuildStatus === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
                      color: rebuildStatus === 'success' ? '#16A34A' : '#DC2626',
                    }}
                  >
                    {rebuildStatus === 'success' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {rebuildMsg}
                  </div>
                )}

                <button
                  onClick={handleRebuild}
                  disabled={isRebuilding}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isRebuilding ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Rebuilding…
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Rebuild Index
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Right Column: Document List */}
          <div className={isAdmin ? 'lg:col-span-2' : ''}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={18} />
                <span className="hidden sm:inline">Uploaded Documents</span>
                <span className="sm:hidden">Documents</span>
              </h2>
              <span className="badge badge-blue">{count} files</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin-slow" style={{ color: '#2563EB' }} />
              </div>
            ) : documents.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <FileText size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>No documents yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  Upload a PDF to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, idx) => {
                  const docName = typeof doc === 'string' ? doc : doc.filename || doc.name || idx;
                  return (
                    <DocumentRow
                      key={doc.id || docName}
                      doc={doc}
                      idx={idx}
                      isAdmin={isAdmin}
                      onDelete={deleteDocument}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ doc, idx, isAdmin, onDelete }) {
  const name = typeof doc === 'string' ? doc : doc.filename || doc.name || `Document ${idx + 1}`;
  const size = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : null;
  const date = doc.uploaded_at || doc.created_at;
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(name);
      toast.success(`"${name}" deleted successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to delete "${name}".`);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 md:gap-4 md:px-4 md:py-3.5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        opacity: isDeleting ? 0.6 : 1,
      }}
      onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.15)' }}
      >
        <File size={15} style={{ color: '#2563EB' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="badge badge-blue text-xs">PDF</span>
          {size && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{size}</span>}
          {date && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={10} />
              {new Date(date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {isAdmin && (
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          title="Delete document"
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0"
          style={{
            color: isDeleting ? 'var(--text-muted)' : '#DC2626',
            background: 'transparent',
            border: '1px solid transparent',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {isDeleting
            ? <Loader2 size={14} className="animate-spin" />
            : <Trash2 size={14} />}
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        variant="danger"
        title="Delete Document?"
        message={`"${name}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
