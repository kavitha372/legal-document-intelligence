import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { getAuditLogs } from '../api/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../api/client';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getAuditLogs(page, 50);
      if (res.success && res.data) { setLogs(res.data.logs); if (res.meta) setTotalPages(res.meta.totalPages); }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const outcomeColor = (o: string) => ({ SUCCESS: 'badge-success', FAILURE: 'badge-danger', DENIED: 'badge-warning' })[o] || 'badge-gray';

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Audit Logs</div>
          <div className="header-breadcrumb">Security and activity records</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </header>
      <main className="app-content">
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <ShieldCheck size={15} />
          <span style={{ fontSize: 13 }}>Audit logs record security-relevant events. Sensitive content such as passwords and tokens is never logged.</span>
        </div>
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner label="Loading audit logs…" /> : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Outcome</th><th>Request ID</th></tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                      <td style={{ fontSize: 13 }}>{log.user?.username || <em style={{ color: 'var(--color-text-muted)' }}>system</em>}</td>
                      <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{log.action}</td>
                      <td style={{ fontSize: 12 }}>{log.entityType ? `${log.entityType}` : '—'}</td>
                      <td><span className={`badge ${outcomeColor(log.outcome)}`}>{log.outcome}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{log.requestId?.slice(0, 20) || '—'}</td>
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
      </main>
    </>
  );
}
