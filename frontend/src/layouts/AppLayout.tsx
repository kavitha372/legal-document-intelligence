import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Search,
  Users, ClipboardList, LogOut, Scale
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin    = user?.role === 'ADMIN';
  const isReviewer = user?.role === 'LEGAL_REVIEWER' || isAdmin;
  const initials   = user?.username?.slice(0, 2).toUpperCase() ?? '??';

  const roleLabel = (role?: string) => {
    if (role === 'ADMIN')          return 'Administrator';
    if (role === 'LEGAL_REVIEWER') return 'Legal Reviewer';
    if (role === 'READ_ONLY')      return 'Read-Only';
    return role ?? '';
  };

  return (
    <div className="app-layout">
      <aside className="sidebar" role="navigation" aria-label="Main navigation">

        {/* Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">
              <Scale size={18} color="#fff" />
            </div>
            <div>
              <h1>LexAI</h1>
              <span>Legal Intelligence Platform</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Workspace</div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <LayoutDashboard size={17} /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <FileText size={17} /><span>Document Library</span>
            </NavLink>
            {isReviewer && (
              <NavLink to="/upload" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                <Upload size={17} /><span>Upload Document</span>
              </NavLink>
            )}
            <NavLink to="/search" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <Search size={17} /><span>Search</span>
            </NavLink>
          </div>

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">Administration</div>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                <Users size={17} /><span>Manage Users</span>
              </NavLink>
              <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                <ClipboardList size={17} /><span>Audit Logs</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.username}</div>
              <div className="sidebar-user-role">{roleLabel(user?.role)}</div>
            </div>
            <button
              className="sidebar-logout"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

      </aside>

      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
