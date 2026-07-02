import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

export default function Chefs({ searchQuery, token }) {
  const [chefList, setChefList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const { chefs } = await adminApi.getChefs(token);
        if (!cancelled) setChefList(chefs);
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load chefs', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, showToast, refreshTrigger]);

  const filtered = chefList.filter((c) => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = async (chef) => {
    const newStatus = chef.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.updateChefStatus(token, chef.id, newStatus);
      setChefList(prev => prev.map(c => c.id === chef.id ? { ...c, status: newStatus } : c));
      showToast(`Chef ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      showToast(err.message || 'Failed to update chef status', 'error');
    }
  };

  const handleDelete = async (chef) => {
    if (!confirm(`Remove ${chef.name}? This will permanently delete their account.`)) return;
    try {
      await adminApi.deleteChef(token, chef.id);
      setChefList(prev => prev.filter(c => c.id !== chef.id));
      showToast('Chef removed successfully');
    } catch (err) {
      showToast(err.message || 'Failed to remove chef', 'error');
    }
  };

  const handleAddChef = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get('name');
    const email = form.get('email');
    const restaurantName = form.get('restaurant');
    const phone = form.get('phone');

    setSaving(true);
    try {
      const { chef } = await adminApi.createChef(token, { name, email, restaurantName, phone });
      setChefList(prev => [{
        ...chef,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF6B35&color=fff`,
        rating: 0, orders: 0, revenue: 0, menuItems: 0, avgPrepTime: '—',
      }, ...prev]);
      setShowAddModal(false);
      e.target.reset();
      showToast(`✅ Chef account created! ${email} can now log in via the mobile app.`);
    } catch (err) {
      showToast(err.message || 'Failed to create chef account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = chefList.filter(c => c.status === 'pending').length;

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, maxWidth: 380,
          background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
          color: toast.type === 'error' ? '#DC2626' : '#16A34A',
          border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 14, fontWeight: 500,
        }}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.chef()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{chefList.length}</div>
            <div className="stat-label">Total Chefs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.check()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{chefList.filter(c => c.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: 'var(--warning)' }}>{Icons.clock()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: '#3B82F6' }}>{Icons.plate()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{chefList.filter(c => c.status === 'inactive').length}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'inactive'].map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${chefList.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Register Chef</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Chefs ({filtered.length})</h3>
          <button className="btn" onClick={() => setRefreshTrigger(prev => prev + 1)} style={{ fontSize: 13 }}>↺ Refresh</button>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading chefs...</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Chef</th>
                <th>Restaurant</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="user-cell">
                      <img src={c.avatar} alt="" className="user-avatar" />
                      <div>
                        <div className="user-name">{c.name}</div>
                        <div className="user-email">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.restaurant}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.cuisine}</td>
                  <td style={{ color: 'var(--warning)' }}>{c.rating > 0 ? `⭐ ${c.rating}` : '—'}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.joined}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm" onClick={() => handleToggleStatus(c)}>
                        {c.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <p>{searchQuery ? 'No chefs match your search.' : 'No chefs yet. Register one to get started!'}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Chef Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Chef</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)} disabled={saving}>✕</button>
            </div>
            <form onSubmit={handleAddChef}>
              <div className="modal-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                  This creates a real Supabase account. The chef will be able to log in on the mobile app using their email + OTP code.
                </p>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-input" name="name" placeholder="Chef's full name" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input className="form-input" name="email" type="email" placeholder="chef@restaurant.com" required />
                </div>
                <div className="form-group">
                  <label>Restaurant Name *</label>
                  <input className="form-input" name="restaurant" placeholder="Restaurant name" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input className="form-input" name="phone" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating Account...' : 'Register Chef'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
