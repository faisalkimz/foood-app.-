import { useState } from 'react';
import { users as initialUsers } from '../data';
import { Icons } from '../components/Icons';

export default function Users({ searchQuery }) {
  const [userList, setUserList] = useState(initialUsers);
  const [filter, setFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);

  const filtered = userList.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = (id) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const handlePromoteToChef = (user) => {
    if (confirm(`Promote "${user.name}" to Chef role?`)) {
      setUserList(prev => prev.map(u => u.id === user.id ? { ...u, role: 'chef' } : u));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this user permanently?')) {
      setUserList(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setUserList(prev => prev.map(u =>
      u.id === editUser.id ? { ...u, name: form.get('name'), email: form.get('email'), role: form.get('role') } : u
    ));
    setEditUser(null);
  };

  return (
    <div>
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
          <div className="stat-icon-wrap" style={{ background: '#FEF2F2', color: 'var(--danger)' }}>{Icons.pause()}</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{userList.filter(u => u.status === 'inactive').length}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'inactive'].map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${userList.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Customers ({filtered.length})</h3>
        </div>
        <table>
          <thead>
            <tr><th>Customer</th><th>Role</th><th>Orders</th><th>Spent</th><th>Last Active</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <img src={u.avatar} alt="" className="user-avatar" />
                    <div><div className="user-name">{u.name}</div><div className="user-email">{u.email}</div></div>
                  </div>
                </td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>{u.orders}</td>
                <td style={{ fontWeight: 600 }}>${u.spent.toFixed(2)}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.lastActive}</td>
                <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm" onClick={() => setEditUser(u)}>Edit</button>
                    <button className="btn btn-sm" onClick={() => handleToggleStatus(u.id)}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    {u.role === 'customer' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handlePromoteToChef(u)}>→ Chef</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><div className="empty-state"><p>No customers found</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group"><label>Full Name</label><input className="form-input" name="name" defaultValue={editUser.name} required /></div>
                <div className="form-group"><label>Email</label><input className="form-input" name="email" type="email" defaultValue={editUser.email} required /></div>
                <div className="form-group"><label>Role</label>
                  <select className="form-select" name="role" defaultValue={editUser.role}>
                    <option value="customer">Customer</option><option value="chef">Chef</option><option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
