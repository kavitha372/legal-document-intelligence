import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, Trash2, Eye, RefreshCw } from 'lucide-react';
import { listDocuments, deleteDocument } from '../api/documents';
import { Document } from '../types';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, formatRelative } from '../utils/formatters';
import { getErrorMessage } from '../api/client';

export default function DocumentLibraryPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [extractionFilter, setExtractionFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isReviewer = user?.role === 'ADMIN' || user?.role === 'LEGAL_REVIEWER';

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await listDocuments({ page, limit: 20, search: search || undefined, extractionStatus: extractionFilter || undefined, reviewStatus: reviewFilter || undefined });
      if (res.success && res.data) {
        setDocs(res.data.documents);
        if (res.meta) setTotalPages(res.meta.totalPages);
      }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [page, search, extractionFilter, reviewFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteDocument(deleteId); setDeleteId(null); load(); }
    catch (err) { setError(getErrorMessage(err)); setDeleteId(null); }
  };

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Document Library</div>
          <div className="header-breadcrumb">View and manage uploaded legal documents</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
          {isReviewer && <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}><Upload size={14} /> Upload</button>}
        </div>
      </header>

      <main className="app-content">
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <form onSubmit={handleSearch} style={{ flex: '1 1 260px', display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Search by title or filename…"
                value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-secondary"><Search size={14} /></button>
            </form>
            <select className="form-select" style={{ flex: '0 1 180px' }} value={extractionFilter} onChange={e => { setExtractionFilter(e.target.value); setPage(1); }}>
              <option value="">All Extraction Statuses</option>
              <option value="EXTRACTED">Text Extracted</option>
              <option value="OCR_REQUIRED">OCR Required</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <select className="form-select" style={{ flex: '0 1 180px' }} value={reviewFilter} onChange={e => { setReviewFilter(e.target.value); setPage(1); }}>
              <option value="">All Review Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
            {(search || extractionFilter || reviewFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setExtractionFilter(''); setReviewFilter(''); setPage(1); }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading && <LoadingSpinner label="Loading documents…" />}

        {!loading && docs.length === 0 && (
          <EmptyState title="No documents found" description={search ? 'No documents match your search criteria.' : 'Upload your first legal PDF to get started.'}
            action={isReviewer ? <button className="btn btn-primary" onClick={() => navigate('/upload')}><Upload size={16} /> Upload Document</button> : undefined}
          />
        )}

        {!loading && docs.length > 0 && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Uploaded By</th>
                    <th>Pages</th>
                    <th>Extraction</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{doc.originalFilename}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{doc.owner?.username || '—'}</td>
                      <td style={{ fontSize: 13 }}>{doc.pageCount || '—'}</td>
                      <td><StatusBadge type="extraction" value={doc.extractionStatus} /></td>
                      <td><StatusBadge type="review" value={doc.reviewStatus} /></td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        <span title={formatDate(doc.createdAt)}>{formatRelative(doc.createdAt)}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm btn-icon" title="View document" onClick={() => navigate(`/documents/${doc.id}`)}>
                            <Eye size={14} />
                          </button>
                          {isReviewer && (
                            <button className="btn btn-danger btn-sm btn-icon" title="Delete document" onClick={() => setDeleteId(doc.id)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}

        {deleteId && (
          <ConfirmDialog
            title="Delete Document"
            message="This will permanently delete the document, all extracted text, and checklist results. This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
            danger
          />
        )}
      </main>
    </>
  );
}
