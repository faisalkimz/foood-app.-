import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

const STATUS_LABELS = { new: 'New', preparing: 'Preparing', ready: 'Ready', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_FLOW_DB = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
const STATUS_FLOW_UI = ['new', 'preparing', 'ready', 'on_the_way', 'delivered'];

function nextDbStatus(currentDbStatus) {
  const idx = STATUS_FLOW_DB.indexOf(currentDbStatus);
  if (idx >= 0 && idx < STATUS_FLOW_DB.length - 1) return STATUS_FLOW_DB[idx + 1];
  return null;
}

export default function Orders({ searchQuery, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.getOrders(token);
        if (!cancelled) setOrders(res.orders || []);
      } catch (err) {
        if (!cancelled) console.error('Load orders error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, refreshTrigger]);

  const filtered = orders.filter((o) => {
    const matchesSearch = !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCancelOrder = async (order) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await adminApi.updateOrderStatus(token, order.fullId, 'cancelled');
      setOrders(prev => prev.map(o => o.fullId === order.fullId ? { ...o, status: 'cancelled', dbStatus: 'cancelled' } : o));
      setSelectedOrder(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdvanceStatus = async (order) => {
    const next = nextDbStatus(order.dbStatus);
    if (!next) return;
    try {
      await adminApi.updateOrderStatus(token, order.fullId, next);
      // Map back to UI status
      const uiMap = { pending: 'new', confirmed: 'preparing', preparing: 'preparing', ready: 'ready', delivering: 'on_the_way', delivered: 'delivered' };
      setOrders(prev => prev.map(o => o.fullId === order.fullId ? { ...o, status: uiMap[next] || next, dbStatus: next } : o));
      if (selectedOrder?.fullId === order.fullId) {
        setSelectedOrder(prev => ({ ...prev, status: uiMap[next] || next, dbStatus: next }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div className="auth-loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Status stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 16 }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const colors = { new: '#EFF6FF', preparing: '#FFFBEB', on_the_way: '#F5F3FF', delivered: '#F0FDF4', cancelled: '#FEF2F2' };
          const iconMap = { new: Icons.box(18), preparing: Icons.chef(18), on_the_way: Icons.truck(18), delivered: Icons.check(18), cancelled: Icons.x(18) };
          const colorMap = { new: 'var(--info)', preparing: 'var(--warning)', on_the_way: 'var(--purple)', delivered: 'var(--success)', cancelled: 'var(--danger)' };
          return (
            <div className="stat-card" key={key} style={{ cursor: 'pointer' }} onClick={() => setFilter(filter === key ? 'all' : key)}>
              <div className="stat-icon-wrap" style={{ background: colors[key], color: colorMap[key] }}>{iconMap[key]}</div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: 20 }}>{counts[key] || 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="filter-bar">
        {['all', ...Object.keys(STATUS_LABELS)].map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${counts.all})` : `${STATUS_LABELS[f]} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="table-card">
        <div className="table-header">
          <h3>Orders ({filtered.length})</h3>
          <button className="btn btn-sm" onClick={() => setRefreshTrigger(prev => prev + 1)} style={{ fontSize: 12 }}>↻ Refresh</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.fullId}>
                <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 12 }}>{o.id}</td>
                <td>
                  <div className="user-cell">
                    <img src={o.customerAvatar} alt="" className="user-avatar" />
                    <div className="user-name">{o.customer}</div>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.restaurant}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160 }}>{o.items.join(', ') || '—'}</td>
                <td style={{ fontWeight: 700 }}>UGX {o.total.toLocaleString()}</td>
                <td><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm" onClick={() => setSelectedOrder(o)}>View</button>
                    {o.dbStatus !== 'delivered' && o.dbStatus !== 'cancelled' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleAdvanceStatus(o)}>→</button>
                    )}
                    {o.dbStatus !== 'cancelled' && o.dbStatus !== 'delivered' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancelOrder(o)}>✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><div className="empty-state"><p>No orders found</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ width: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                <img src={selectedOrder.customerAvatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.customer}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedOrder.restaurant} · {selectedOrder.chef}</div>
                </div>
                <span className={`badge badge-${selectedOrder.status}`} style={{ marginLeft: 'auto' }}>{STATUS_LABELS[selectedOrder.status]}</span>
              </div>

              <div className="order-detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Payment</div>
                  <div className="detail-value">{selectedOrder.paymentMethod}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date</div>
                  <div className="detail-value">{selectedOrder.date}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Total</div>
                  <div className="detail-value" style={{ color: 'var(--primary)', fontSize: 16 }}>UGX {selectedOrder.total.toLocaleString()}</div>
                </div>
              </div>

              <div className="detail-label" style={{ marginBottom: 8, marginTop: 16 }}>Order Items</div>
              <div className="order-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div className="order-item-row" key={idx}><span>{item}</span></div>
                ))}
                {selectedOrder.items.length === 0 && (
                  <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>No items</div>
                )}
              </div>

              {/* Progress */}
              <div style={{ marginTop: 20 }}>
                <div className="detail-label" style={{ marginBottom: 10 }}>Progress</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {STATUS_FLOW_UI.map((step, idx) => {
                    const ci = STATUS_FLOW_UI.indexOf(selectedOrder.status);
                    const done = idx <= ci;
                    const isCancelled = selectedOrder.status === 'cancelled';
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 4 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: isCancelled ? 'var(--danger)' : done ? 'var(--primary)' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0,
                        }}>
                          {isCancelled ? '✕' : done ? '✓' : idx + 1}
                        </div>
                        {idx < STATUS_FLOW_UI.length - 1 && (
                          <div style={{ flex: 1, height: 2, borderRadius: 1, background: done && idx < ci ? 'var(--primary)' : 'var(--border)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {STATUS_FLOW_UI.map(s => (
                    <span key={s} style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>{STATUS_LABELS[s]}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedOrder.dbStatus !== 'delivered' && selectedOrder.dbStatus !== 'cancelled' && (
                <>
                  <button className="btn btn-danger" onClick={() => handleCancelOrder(selectedOrder)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => handleAdvanceStatus(selectedOrder)}>
                    Advance →
                  </button>
                </>
              )}
              {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                <button className="btn" onClick={() => setSelectedOrder(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
