import { useState } from 'react';
import { activityLog } from '../data';
import { Icons } from '../components/Icons';

const TYPE_ICONS = { order: Icons.box(16), chef: Icons.chef(16), user: Icons.user(16), menu: Icons.plate(16), payment: Icons.creditCard(16), review: Icons.star(16) };
const TYPE_BG = { order: '#EFF6FF', chef: '#F0FDF4', user: '#F5F3FF', menu: '#FFFBEB', payment: '#F0FDF4', review: '#FFF7ED' };
const TYPE_LABELS = { order: 'Orders', chef: 'Chefs', user: 'Users', menu: 'Menu', payment: 'Payments', review: 'Reviews' };

export default function Activity({ searchQuery }) {
  const [filter, setFilter] = useState('all');
  const types = [...new Set(activityLog.map(a => a.type))];

  const filtered = activityLog.filter((a) => {
    const matchesSearch = !searchQuery ||
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const typeCounts = {};
  activityLog.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });

  return (
    <div>
      {/* Type cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: `repeat(${types.length}, 1fr)`, marginBottom: 16 }}>
        {types.map(type => (
          <div className="stat-card" key={type}
            style={{ cursor: 'pointer', borderColor: filter === type ? 'var(--primary)' : undefined }}
            onClick={() => setFilter(filter === type ? 'all' : type)}
          >
            <div className="stat-icon-wrap" style={{ background: TYPE_BG[type] }}>{TYPE_ICONS[type]}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize: 18 }}>{typeCounts[type]}</div>
              <div className="stat-label">{TYPE_LABELS[type]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({activityLog.length})</button>
        {types.map(type => (
          <button key={type} className={`filter-pill ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>
            {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({typeCounts[type]})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>Activity Log ({filtered.length})</h3></div>
        <div className="activity-feed">
          {filtered.map(a => (
            <div className="activity-item" key={a.id}>
              <div className="activity-icon" style={{ background: TYPE_BG[a.type] }}>{TYPE_ICONS[a.type]}</div>
              <div className="activity-content">
                <div className="activity-action">{a.action}</div>
                <div className="activity-detail">{a.detail}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div className="activity-time">{a.time}</div>
                <span className={`badge badge-${a.type === 'order' ? 'new' : a.type === 'chef' ? 'active' : 'pending'}`} style={{ fontSize: 10 }}>{TYPE_LABELS[a.type]}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state"><p>No activities found</p></div>}
        </div>
      </div>
    </div>
  );
}
