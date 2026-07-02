export default function Sidebar({ currentPage, onNavigate, admin, onLogout }) {

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🍔</div>
        <div>
          <h2>FoodOrder</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </button>

        <button className={`nav-item ${currentPage === 'orders' ? 'active' : ''}`} onClick={() => onNavigate('orders')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Orders
        </button>

        <div className="nav-section-label">Management</div>

        <button className={`nav-item ${currentPage === 'users' ? 'active' : ''}`} onClick={() => onNavigate('users')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Customers
        </button>

        <button className={`nav-item ${currentPage === 'chefs' ? 'active' : ''}`} onClick={() => onNavigate('chefs')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6 2 10c0 3 2 5 4 6v4h12v-4c2-1 4-3 4-6 0-4-4.48-8-10-8z"/><path d="M9 22h6"/></svg>
          Chefs
        </button>

        <button className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`} onClick={() => onNavigate('analytics')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          Analytics
        </button>

        <button className={`nav-item ${currentPage === 'activity' ? 'active' : ''}`} onClick={() => onNavigate('activity')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Activity
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar">{admin?.name?.charAt(0) || 'A'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-profile-name">{admin?.name || 'Admin'}</div>
            <div className="sidebar-profile-role">
              {admin?.role === 'super_admin' ? 'Super Admin' : 'Manager'}
            </div>
          </div>
        </div>
        <button className="create-order-btn" onClick={() => onNavigate('orders')}>
          + Orders
        </button>
        <button className="logout-btn" onClick={() => onLogout()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
