import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MessageSquare, CheckSquare, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getDocument, getDocumentPages, searchDocument, askQuestion, runChecklist } from '../api/documents';
import { Document, DocumentPage, SearchResult, QuestionAnswerResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ChecklistPanel from '../components/checklist/ChecklistPanel';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../api/client';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReviewer = user?.role === 'ADMIN' || user?.role === 'LEGAL_REVIEWER';

  const [doc, setDoc] = useState<Document | null>(null);
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pages' | 'search' | 'qa' | 'checklist'>('pages');
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set([1]));

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // QA state
  const [question, setQuestion] = useState('');
  const [qaResult, setQaResult] = useState<QuestionAnswerResult | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState('');

  // Checklist state
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState('');
  const [checklistRan, setChecklistRan] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [docRes, pagesRes] = await Promise.all([getDocument(id), getDocumentPages(id)]);
        if (docRes.success && docRes.data) setDoc(docRes.data.document);
        if (pagesRes.success && pagesRes.data) setPages(pagesRes.data.pages);
      } catch (err) { setError(getErrorMessage(err)); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !id) return;
    setSearchLoading(true); setSearchError(''); setSearchResults(null);
    try {
      const res = await searchDocument(id, searchQuery.trim());
      if (res.success && res.data) setSearchResults(res.data.results);
    } catch (err) { setSearchError(getErrorMessage(err)); }
    finally { setSearchLoading(false); }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !id) return;
    setQaLoading(true); setQaError(''); setQaResult(null);
    try {
      const res = await askQuestion(id, question.trim());
      if (res.success && res.data) setQaResult(res.data);
    } catch (err) { setQaError(getErrorMessage(err)); }
    finally { setQaLoading(false); }
  };

  const handleRunChecklist = async () => {
    if (!id) return;
    setChecklistLoading(true); setChecklistError('');
    try {
      await runChecklist(id);
      setChecklistRan(true);
    } catch (err) { setChecklistError(getErrorMessage(err)); }
    finally { setChecklistLoading(false); }
  };

  const togglePage = (n: number) => {
    setExpandedPages(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  };

  if (loading) return <><header className="app-header"><div className="header-title">Document Details</div></header><main className="app-content"><LoadingSpinner label="Loading document…" /></main></>;
  if (error || !doc) return <><header className="app-header"><div className="header-title">Document Details</div></header><main className="app-content"><ErrorMessage message={error || 'Document not found'} /></main></>;

  const tabs = [
    { key: 'pages', label: 'Extracted Text', icon: <Search size={15} /> },
    { key: 'search', label: 'Search', icon: <Search size={15} /> },
    { key: 'qa', label: 'Ask a Question', icon: <MessageSquare size={15} /> },
    ...(isReviewer ? [{ key: 'checklist', label: 'Checklist', icon: <CheckSquare size={15} /> }] : []),
  ];

  return (
    <>
      <header className="app-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/documents')} style={{ marginBottom: 4 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="header-title">{doc.title}</div>
          <div className="header-breadcrumb">{doc.originalFilename} · {doc.pageCount} pages · uploaded {formatDateTime(doc.createdAt)}</div>
        </div>
        <div className="header-actions">
          <StatusBadge type="extraction" value={doc.extractionStatus} />
          <StatusBadge type="review" value={doc.reviewStatus} />
        </div>
      </header>

      <main className="app-content">
        {/* Disclaimer */}
        <div className="disclaimer" style={{ marginBottom: 20 }}>
          ⚠️ Results are preliminary. They do not constitute legal advice and require human verification.
        </div>

        {doc.extractionStatus === 'OCR_REQUIRED' && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            <RefreshCw size={15} /> This PDF appears to be scanned. No text was extracted. OCR is required to analyse this document.
          </div>
        )}
        {doc.extractionStatus === 'FAILED' && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            Text extraction failed for this document. Please verify the file is a valid text-based PDF.
          </div>
        )}

        {/* Meta card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'File Hash (SHA-256)', value: doc.fileHash.slice(0, 16) + '…' },
              { label: 'Owner', value: (doc as any).owner?.username || '—' },
              { label: 'Pages', value: doc.pageCount?.toString() || '0' },
              { label: 'Uploaded', value: formatDateTime(doc.createdAt) },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Pages tab */}
        {activeTab === 'pages' && (
          <div>
            {pages.length === 0 ? (
              <div className="empty-state"><p>No text was extracted from this document.</p></div>
            ) : (
              pages.map(p => (
                <div key={p.id} className="page-text-viewer" style={{ marginBottom: 12 }}>
                  <div className="page-text-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => togglePage(p.pageNumber)}>
                    <span>Page {p.pageNumber}</span>
                    {expandedPages.has(p.pageNumber) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {expandedPages.has(p.pageNumber) && (
                    <div className="page-text-content">
                      {p.extractedText || <em style={{ color: 'var(--color-text-muted)' }}>No text on this page</em>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Search tab */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" placeholder="Search within this document… e.g. termination, confidential"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                {searchLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Search size={15} />} Search
              </button>
            </form>
            {searchError && <ErrorMessage message={searchError} />}
            {searchResults !== null && searchResults.length === 0 && (
              <div className="empty-state"><p>No matching passages found for "{searchQuery}".</p></div>
            )}
            {searchResults && searchResults.map((r, i) => (
              <div key={i} className="evidence-card">
                <div className="evidence-card-header">
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Page {r.pageNumber}</span>
                  <span className="evidence-page-ref">Score: {r.score}</span>
                </div>
                <div className="evidence-text">"{r.snippet}"</div>
                {r.matchedTerms.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.matchedTerms.map(t => <span key={t} className="badge badge-info" style={{ fontSize: 11 }}>{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QA tab */}
        {activeTab === 'qa' && (
          <div>
            <div className="card" style={{ marginBottom: 20, background: 'var(--color-primary-light)', border: '1px solid var(--color-accent)' }}>
              <p style={{ fontSize: 13 }}>Ask a question about this document. Answers are based only on retrieved document passages — the system will not invent information.</p>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['What is the termination notice period?', 'Is there a confidentiality clause?', 'What governing law is mentioned?', 'What is the effective date?'].map(q => (
                  <button key={q} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setQuestion(q)}>{q}</button>
                ))}
              </div>
            </div>
            <form onSubmit={handleAsk} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" placeholder="Type your question…"
                value={question} onChange={e => setQuestion(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={qaLoading || !question.trim()}>
                {qaLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <MessageSquare size={15} />} Ask
              </button>
            </form>
            {qaError && <ErrorMessage message={qaError} />}
            {qaResult && (
              <div>
                <div className="card" style={{ marginBottom: 16, borderLeft: `4px solid ${qaResult.hasEvidence ? 'var(--color-primary)' : 'var(--color-warning)'}` }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>Answer</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7 }}>{qaResult.answer}</p>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>Retrieval method: {qaResult.retrievalMethod}</div>
                </div>
                {qaResult.evidence.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Supporting Evidence</h4>
                    {qaResult.evidence.map((e, i) => (
                      <div key={i} className="evidence-card">
                        <div className="evidence-card-header">
                          <span style={{ fontSize: 13, fontWeight: 500 }}>Page {e.pageNumber}</span>
                          <span className="evidence-page-ref">Relevance: {e.relevanceScore}</span>
                        </div>
                        <div className="evidence-text">"{e.text.slice(0, 400)}{e.text.length > 400 ? '…' : ''}"</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="disclaimer" style={{ marginTop: 16 }}>{qaResult.disclaimer}</div>
              </div>
            )}
          </div>
        )}

        {/* Checklist tab */}
        {activeTab === 'checklist' && isReviewer && (
          <div>
            {checklistError && <ErrorMessage message={checklistError} onDismiss={() => setChecklistError('')} />}
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleRunChecklist} disabled={checklistLoading || doc.extractionStatus !== 'EXTRACTED'}>
                {checklistLoading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Running…</> : <><CheckSquare size={15} /> Run Checklist</>}
              </button>
              {doc.extractionStatus !== 'EXTRACTED' && (
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Checklist requires successfully extracted text.</span>
              )}
            </div>
            {id && <ChecklistPanel documentId={id} refreshKey={checklistRan ? 1 : 0} />}
          </div>
        )}
      </main>
    </>
  );
}
