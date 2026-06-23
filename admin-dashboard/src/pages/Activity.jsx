import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

export default function Activity({ searchQuery, token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getActivity(token);
        setActivities(res.activities || []);
      } catch (err) {
        console.error('Activity load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const activityIcons = {
    order: Icons.box(16), chef: Icons.chef(16), user: Icons.user(16),
    menu: Icons.plate(16), payment: Icons.creditCard(16), review: Icons.star(16),
    cancel: Icons.x(16),
  };

  const activityColors = {
    order: '#EFF6FF', chef: '#F0FDF4', user: '#F5F3FF',
    menu: '#FFFBEB', payment: '#F0FDF4', review: '#FFFBEB',
    cancel: '#FEF2F2',
  };

  const filtered = activities.filter((a) => {
    const matchesSearch = !searchQuery ||
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const types = [...new Set(activities.map((a) => a.type))];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div className="auth-loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({activities.length})
        </button>
        {types.map((t) => (
          <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({activities.filter(a => a.type === t).length})
          </button>
        ))}
      </div>

      {/* Activity feed */}
      <div className="card">
        <div className="card-header">
          <h3>Activity Feed ({filtered.length})</h3>
        </div>
        <div className="activity-feed">
          {filtered.length > 0 ? filtered.map((a) => (
            <div className="activity-item" key={a.id}>
              <div className="activity-icon" style={{ background: activityColors[a.type] || '#F5F7FA' }}>
                {activityIcons[a.type] || Icons.box(16)}
              </div>
              <div className="activity-content">
                <div className="activity-action">{a.action}</div>
                <div className="activity-detail">{a.detail}</div>
              </div>
              <div className="activity-time">{a.time}</div>
            </div>
          )) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No activity found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
