import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ExternalLink } from 'lucide-react';
import { listDocuments, searchDocument } from '../api/documents';
import { Document, SearchResult } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getErrorMessage } from '../api/client';

export default function SearchPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listDocuments({ limit: 100, extractionStatus: 'EXTRACTED' })
      .then(res => { if (res.success && res.data) setDocuments(res.data.documents); })
      .catch(() => {})
      .finally(() => setDocsLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !query.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await searchDocument(selectedDocId, query.trim());
      if (res.success && res.data) setResults(res.data.results);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const suggestions = ['termination', 'confidentiality', 'effective date', 'governing law', 'notice period', 'indemnification', 'warranty', 'liability'];

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Document Search</div>
          <div className="header-breadcrumb">Search for clauses and phrases within your documents</div>
        </div>
      </header>
      <main className="app-content">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label required" htmlFor="doc-select">Select Document</label>
                {docsLoading ? <LoadingSpinner /> : (
                  <select id="doc-select" className="form-select" value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}>
                    <option value="">— Choose a document —</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                )}
                {documents.length === 0 && !docsLoading && (
                  <p className="form-hint">No documents with extracted text found. Upload a text-based PDF first.</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label required" htmlFor="search-q">Search Query</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input id="search-q" className="form-input" placeholder="e.g. termination notice period"
                    value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-primary" disabled={loading || !selectedDocId || !query.trim()}>
                    {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Search size={15} />} Search
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Try:</span>
                {suggestions.map(s => (
                  <button type="button" key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
            </form>
          </div>

          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

          {results !== null && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </h3>
                {selectedDocId && (
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/documents/${selectedDocId}`)}>
                    <ExternalLink size={13} /> Open Document
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="empty-state">
                  <Search size={40} className="empty-state-icon" />
                  <h3>No results found</h3>
                  <p>No passages matching "{query}" were found in this document. Try a different search term.</p>
                </div>
              ) : (
                results.map((r, i) => (
                  <div key={i} className="evidence-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/documents/${selectedDocId}`)}>
                    <div className="evidence-card-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        <FileText size={14} /> Page {r.pageNumber}
                      </span>
                      <span className="evidence-page-ref">Score {r.score}</span>
                    </div>
                    <div className="evidence-text">"{r.snippet}"</div>
                    {r.matchedTerms.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {r.matchedTerms.map(t => <span key={t} className="badge badge-info" style={{ fontSize: 11 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
