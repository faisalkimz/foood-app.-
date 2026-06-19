import { useState } from 'react';
import { chefs as initialChefs } from '../data';
import { Icons } from '../components/Icons';

export default function Chefs({ searchQuery }) {
  const [chefList, setChefList] = useState(initialChefs);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editChef, setEditChef] = useState(null);

  const filtered = chefList.filter((c) => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id) => setChefList(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
  const handleDeactivate = (id) => setChefList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  const handleDelete = (id) => { if (confirm('Remove this chef?')) setChefList(prev => prev.filter(c => c.id !== id)); };

  const handleAddChef = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setChefList(prev => [{
      id: `c${Date.now()}`, name: form.get('name'), email: form.get('email'), restaurant: form.get('restaurant'),
      status: 'pending', orders: 0, revenue: 0, rating: 0, joined: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100', menuItems: 0, avgPrepTime: '—',
    }, ...prev]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setChefList(prev => prev.map(c =>
      c.id === editChef.id ? { ...c, name: form.get('name'), email: form.get('email'), restaurant: form.get('restaurant') } : c
    ));
    setEditChef(null);
  };

  const pendingCount = chefList.filter(c => c.status === 'pending').length;

  return (
    <div>
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
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: 'var(--purple)' }}>{Icons.plate()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{chefList.reduce((sum, c) => sum + c.menuItems, 0)}</div>
            <div className="stat-label">Menu Items</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'pending', 'inactive'].map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${chefList.length})` : f.charAt(0).toUpperCase() + f.slice(1)}{f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Register Chef</button>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Chefs ({filtered.length})</h3></div>
        <table>
          <thead>
            <tr><th>Chef</th><th>Restaurant</th><th>Orders</th><th>Revenue</th><th>Menu Items</th><th>Avg Prep</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="user-cell">
                    <img src={c.avatar} alt="" className="user-avatar" />
                    <div><div className="user-name">{c.name}</div><div className="user-email">{c.email}</div></div>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{c.restaurant}</td>
                <td>{c.orders}</td>
                <td style={{ fontWeight: 600 }}>${c.revenue.toLocaleString()}</td>
                <td>{c.menuItems}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.avgPrepTime}</td>
                <td style={{ color: 'var(--warning)' }}>{c.rating > 0 ? c.rating : '—'}</td>
                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm" onClick={() => setEditChef(c)}>Edit</button>
                    {c.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleApprove(c.id)}>Approve</button>}
                    {c.status !== 'pending' && <button className="btn btn-sm" onClick={() => handleDeactivate(c.id)}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</button>}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9}><div className="empty-state"><p>No chefs found</p></div></td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Register New Chef</h3><button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button></div>
            <form onSubmit={handleAddChef}>
              <div className="modal-body">
                <div className="form-group"><label>Full Name</label><input className="form-input" name="name" placeholder="Chef's full name" required /></div>
                <div className="form-group"><label>Email</label><input className="form-input" name="email" type="email" placeholder="chef@restaurant.com" required /></div>
                <div className="form-group"><label>Restaurant</label><input className="form-input" name="restaurant" placeholder="Restaurant name" required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editChef && (
        <div className="modal-overlay" onClick={() => setEditChef(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Chef</h3><button className="modal-close" onClick={() => setEditChef(null)}>✕</button></div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group"><label>Full Name</label><input className="form-input" name="name" defaultValue={editChef.name} required /></div>
                <div className="form-group"><label>Email</label><input className="form-input" name="email" type="email" defaultValue={editChef.email} required /></div>
                <div className="form-group"><label>Restaurant</label><input className="form-input" name="restaurant" defaultValue={editChef.restaurant} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setEditChef(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
