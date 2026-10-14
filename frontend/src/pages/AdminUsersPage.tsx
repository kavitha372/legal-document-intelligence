import { useState, useEffect } from 'react';
import { UserPlus, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { listUsers, createUser, updateUser } from '../api/auth';
import { User } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatDate } from '../utils/formatters';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'LEGAL_REVIEWER' });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);
  const { user: me } = useAuth();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await listUsers();
      if (res.success && res.data) setUsers(res.data.users);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setFormError('All fields are required'); return; }
    setCreating(true); setFormError('');
    try {
      await createUser(form);
      setShowCreate(false);
      setForm({ username: '', email: '', password: '', role: 'LEGAL_REVIEWER' });
      load();
    } catch (err) { setFormError(getErrorMessage(err)); }
    finally { setCreating(false); }
  };

  const handleToggleActive = async (u: User) => {
    if (u.id === me?.id) return;
    try { await updateUser(u.id, { isActive: !u.isActive }); load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <>
      <header className="app-header">
        <div>
          <div className="header-title">Manage Users</div>
          <div className="header-breadcrumb">Create accounts and manage user roles</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
            <UserPlus size={14} /> {showCreate ? 'Cancel' : 'Create User'}
          </button>
        </div>
      </header>
      <main className="app-content">
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {showCreate && (
          <div className="card" style={{ marginBottom: 20, maxWidth: 520 }}>
            <div className="card-title">Create New User</div>
            {formError && <ErrorMessage message={formError} />}
            <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label required">Username</label>
                <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="alphanumeric, no spaces" />
              </div>
              <div className="form-group">
                <label className="form-label required">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label required">Password</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label required">Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="READ_ONLY">Read Only</option>
                  <option value="LEGAL_REVIEWER">Legal Reviewer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <UserPlus size={14} />} Create User
              </button>
            </form>
          </div>
        )}

        {loading ? <LoadingSpinner label="Loading users…" /> : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.username} {u.id === me?.id && <span className="badge badge-primary" style={{ fontSize: 10 }}>You</span>}</td>
                      <td style={{ fontSize: 13 }}>{u.email}</td>
                      <td><StatusBadge type="role" value={u.role} /></td>
                      <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.id !== me?.id && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                            {u.isActive ? <ToggleRight size={14} color="var(--color-success)" /> : <ToggleLeft size={14} />}
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
