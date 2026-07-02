import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

export default function Users({ searchQuery, token }) {
  const [userList, setUserList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { users } = await adminApi.getUsers(token);
        if (!cancelled) setUserList(users);
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load users', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, showToast, refreshTrigger]);

  const filtered = userList.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, maxWidth: 380,
          background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
          color: toast.type === 'error' ? '#DC2626' : '#16A34A',
          border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 14, fontWeight: 500,
        }}>{toast.message}</div>
      )}

      {/* Quick stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: 'var(--info)' }}>{Icons.users()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{userList.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.check()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{userList.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: 'var(--warning)' }}>{Icons.clock()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{new Date().toLocaleDateString()}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active'].map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${userList.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => setRefreshTrigger(prev => prev + 1)} style={{ fontSize: 13 }}>↺ Refresh</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Customers ({filtered.length})</h3>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading customers...</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <img src={u.avatar} alt="" className="user-avatar" />
                      <div>
                        <div className="user-name">{u.name}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.joined}</td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={4}>
                  <div className="empty-state">
                    <p>{searchQuery ? 'No customers match your search.' : 'No customers yet.'}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
