import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Search, List, RefreshCw } from 'lucide-react';
import { getDashboardStats } from '../api/documents';
import { DashboardStats } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatusBadge from '../components/common/StatusBadge';
import { formatRelative } from '../utils/formatters';
import { getErrorMessage } from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getDashboardStats();
      if (res.success && res.data) setStats(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isReviewer = user?.role === 'ADMIN' || user?.role === 'LEGAL_REVIEWER';

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Dashboard</div>
          <div className="header-breadcrumb">Welcome back, {user?.username}</div>        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={load} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          {isReviewer && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
              <Upload size={14} /> Upload Document
            </button>
          )}
        </div>
      </header>

      <main className="app-content">
        {loading && <LoadingSpinner label="Loading dashboard…" />}
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {stats && !loading && (
          <>
            {/* Stats */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
              {[
                { label: 'Total Documents', value: stats.stats.total, icon: <FileText size={22} />, color: '#3b5bdb', bg: '#dbe4ff' },
                { label: 'Pending Review', value: stats.stats.pendingReview, icon: <Clock size={22} />, color: '#e67700', bg: '#fff9db' },
                { label: 'Text Extracted', value: stats.stats.extracted, icon: <CheckCircle size={22} />, color: '#2f9e44', bg: '#ebfbee' },
                { label: 'OCR Required', value: stats.stats.ocrRequired, icon: <AlertCircle size={22} />, color: '#c92a2a', bg: '#fff5f5' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">Quick Actions</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                {isReviewer && (
                  <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                    <Upload size={16} /> Upload Document
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => navigate('/documents')}>
                  <List size={16} /> Document Library
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/search')}>
                  <Search size={16} /> Search Documents
                </button>
              </div>
            </div>

            <div className="grid-2">
              {/* Recent documents */}
              <div className="card">
                <div className="card-title">Recent Documents</div>
                {stats.recentDocuments.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 16 }}>No documents yet.</p>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    {stats.recentDocuments.map((doc: any) => (
                      <div key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-gray-100)', cursor: 'pointer' }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatRelative(doc.createdAt)}</div>
                        </div>
                        <StatusBadge type="extraction" value={doc.extractionStatus} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent activity (admin only) */}
              {user?.role === 'ADMIN' && (
                <div className="card">
                  <div className="card-title">Recent Activity</div>
                  {stats.recentActivity.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 16 }}>No activity yet.</p>
                  ) : (
                    <div style={{ marginTop: 12 }}>
                      {stats.recentActivity.map((log: any) => (
                        <div key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ fontWeight: 500 }}>{log.action.replace(/_/g, ' ')}</span>
                            <span className={`badge ${log.outcome === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>{log.outcome}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {log.user?.username && <span>{log.user.username} · </span>}
                            {formatRelative(log.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
