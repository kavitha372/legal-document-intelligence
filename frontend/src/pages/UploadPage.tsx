import { useState, useRef, DragEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../api/documents';
import { getErrorMessage } from '../api/client';
import ErrorMessage from '../components/common/ErrorMessage';

const MAX_SIZE_MB = 10;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragover, setDragover] = useState(false);
  const [success, setSuccess] = useState<{ id: string; message: string } | null>(null);
  const [titleError, setTitleError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const validateFile = (f: File): string => {
    if (!f.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are accepted';
    if (f.type !== 'application/pdf' && f.type !== '') return 'Invalid file type — PDF required';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB`;
    return '';
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError('');
    if (!title) setTitle(f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragover(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setTitleError('Document title is required'); return; }
    if (!file) { setError('Please select a PDF file'); return; }
    setTitleError(''); setError(''); setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());

    try {
      const res = await uploadDocument(formData);
      if (res.success && res.data) {
        setSuccess({ id: res.data.document.id, message: res.message || 'Document uploaded successfully' });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <header className="app-header">
          <div className="header-title">Upload Document</div>
        </header>
        <main className="app-content">
          <div className="card" style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Upload Successful</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>{success.message}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/documents/${success.id}`)}>
                View Document
              </button>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setTitle(''); setDescription(''); setSuccess(null); }}>
                Upload Another
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Upload Document</div>
          <div className="header-breadcrumb">Upload a text-based legal PDF for extraction and analysis</div>
        </div>
      </header>
      <main className="app-content">
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
          <div className="card" style={{ marginTop: error ? 16 : 0 }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Dropzone */}
              <div
                className={`upload-dropzone${dragover ? ' dragover' : ''}`}
                style={{ marginBottom: 24 }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload PDF file"
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              >
                {file ? (
                  <>
                    <FileText size={40} color="var(--color-primary)" />
                    <p style={{ fontWeight: 600, color: 'var(--color-gray-800)', marginTop: 8 }}>{file.name}</p>
                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
                      onClick={e => { e.stopPropagation(); setFile(null); }}>
                      <X size={14} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={40} color="var(--color-gray-400)" />
                    <p style={{ fontWeight: 500, color: 'var(--color-gray-700)', marginTop: 8 }}>
                      Drag & drop a PDF here, or <span style={{ color: 'var(--color-primary)' }}>click to browse</span>
                    </p>
                    <p>Text-based PDFs only · Max {MAX_SIZE_MB} MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="doc-title">Document Title</label>
                <input id="doc-title" type="text" className={`form-input${titleError ? ' error' : ''}`}
                  value={title} onChange={e => { setTitle(e.target.value); setTitleError(''); }}
                  placeholder="e.g. Service Agreement — Acme Corp" maxLength={200} disabled={loading} />
                {titleError && <p className="form-error">{titleError}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-desc">Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea id="doc-desc" className="form-textarea"
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this document…" maxLength={500} disabled={loading}
                  style={{ minHeight: 80 }} />
              </div>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                <AlertCircle size={15} />
                <span style={{ fontSize: 13 }}>
                  Only text-based PDFs are supported. Scanned PDFs will be flagged as requiring OCR. Do not upload confidential client documents.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={loading || !file}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Processing…</> : <><Upload size={16} /> Upload & Extract</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
