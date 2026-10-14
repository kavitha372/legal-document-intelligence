import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';
import { getChecklistResults, updateChecklistItem } from '../../api/documents';
import { ChecklistItem } from '../../types';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

interface Props { documentId: string; refreshKey?: number; }

export default function ChecklistPanel({ documentId, refreshKey }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const isReviewer = user?.role === 'ADMIN' || user?.role === 'LEGAL_REVIEWER';

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getChecklistResults(documentId);
      if (res.success && res.data) setItems(res.data.items);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [documentId, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const handleSaveNote = async (item: ChecklistItem) => {
    setSaving(true);
    try {
      await updateChecklistItem(documentId, item.id, { reviewerNotes: noteText });
      setEditing(null);
      load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const statusIcon = (s: string) => {
    if (s === 'FOUND') return <CheckCircle size={16} color="var(--color-success)" />;
    if (s === 'NOT_DETECTED') return <XCircle size={16} color="var(--color-gray-400)" />;
    return <AlertCircle size={16} color="var(--color-warning)" />;
  };

  if (loading) return <LoadingSpinner label="Loading checklist…" />;
  if (error) return <ErrorMessage message={error} onDismiss={() => setError('')} />;
  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: 14 }}>
      No checklist results yet. Click "Run Checklist" above to analyse this document.
    </div>
  );

  return (
    <div>
      <div className="disclaimer" style={{ marginBottom: 16 }}>
        ⚠️ These results are keyword-based preliminary flags only. They cannot determine whether a clause is legally sufficient or that a contract is enforceable.
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['FOUND', 'NOT_DETECTED', 'NEEDS_REVIEW'] as const).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {statusIcon(s)}
            <span>{items.filter(i => i.detectionStatus === s).length} {s.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div key={item.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                {statusIcon(item.detectionStatus)}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.itemLabel}</div>
                  {item.pageNumber && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Detected on page {item.pageNumber}</div>
                  )}
                </div>
              </div>
              <StatusBadge type="detection" value={item.detectionStatus} />
            </div>

            {item.matchedText && (
              <div style={{ margin: '10px 0 0', padding: '10px 12px', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 600 }}>Matched Text</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--color-gray-700)' }}>"{item.matchedText}"</div>
              </div>
            )}

            {/* Reviewer notes */}
            <div style={{ marginTop: 10 }}>
              {editing === item.id ? (
                <div>
                  <textarea className="form-textarea" style={{ minHeight: 60, fontSize: 13 }}
                    value={noteText} onChange={e => setNoteText(e.target.value)}
                    placeholder="Add reviewer notes…" />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveNote(item)} disabled={saving}>
                      {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Save size={12} />} Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {item.reviewerNotes && (
                      <div style={{ fontSize: 13, color: 'var(--color-gray-700)', fontStyle: 'italic', marginBottom: 4 }}>
                        Note: {item.reviewerNotes}
                      </div>
                    )}
                    {item.reviewedBy && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        Reviewed by {item.reviewedBy.username} · {item.reviewedAt && formatDateTime(item.reviewedAt)}
                      </div>
                    )}
                  </div>
                  {isReviewer && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(item.id); setNoteText(item.reviewerNotes || ''); }}>
                      {item.reviewerNotes ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
