import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';

export default function UploadPanel() {
  const { uploadDocument, isUploading } = useDocumentStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMsg, setStatusMsg] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus('error');
      setStatusMsg('Only PDF files are supported.');
      return;
    }
    setSelectedFile(file);
    setStatus(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadDocument(selectedFile);
      setStatus('success');
      setStatusMsg(result?.message || 'Document uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.response?.data?.detail || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl cursor-pointer transition-all duration-300"
        style={{
          border: `2px dashed ${dragOver ? '#2563EB' : 'var(--border-medium)'}`,
          background: dragOver ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-tertiary)',
          boxShadow: dragOver ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{
            background: dragOver
              ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
              : 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Upload size={24} style={{ color: dragOver ? '#fff' : '#2563EB' }} />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedFile ? selectedFile.name : 'Drop a PDF here or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF`
              : 'Supports PDF files up to 50 MB'}
          </p>
        </div>

        {selectedFile && (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
            className="absolute top-3 right-3 p-1.5 rounded-lg"
            style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-slideUp"
          style={{
            background:
              status === 'success'
                ? 'rgba(22, 163, 74, 0.1)'
                : 'rgba(220, 38, 38, 0.1)',
            border: `1px solid ${status === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
            color: status === 'success' ? '#16A34A' : '#DC2626',
          }}
        >
          {status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {statusMsg}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload size={14} />
            Upload Document
          </>
        )}
      </button>
    </div>
  );
}
