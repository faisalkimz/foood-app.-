import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

const STATUS_LABELS = { new: 'New', preparing: 'Preparing', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, ordersRes, chefsRes, activityRes] = await Promise.all([
          adminApi.getStats(token),
          adminApi.getOrders(token),
          adminApi.getChefs(token),
          adminApi.getActivity(token),
        ]);
        setStats(statsRes);
        setOrders(ordersRes.orders || []);
        setChefs(chefsRes.chefs || []);
        setActivities(activityRes.activities || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div className="auth-loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  const latestOrder = orders[0];
  const liveOrders = orders.filter(o => ['new', 'preparing', 'on_the_way'].includes(o.status));
  const recentActivities = activities.slice(0, 5);
  const revenueByDay = stats?.revenueByDay || [];
  const maxRev = Math.max(...revenueByDay.map(r => r.amount), 1);

  const activityIcons = {
    order: Icons.box(16), chef: Icons.chef(16), user: Icons.user(16),
    menu: Icons.plate(16), payment: Icons.creditCard(16), review: Icons.star(16),
    cancel: Icons.x(16),
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: 'var(--info)' }}>{Icons.users()}</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.chef()}</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalChefs || 0}</div>
            <div className="stat-label">Active Chefs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: 'var(--warning)' }}>{Icons.orders()}</div>
          <div className="stat-info">
            <div className="stat-value">{(stats?.totalOrders || 0).toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-change up">Today: {stats?.todayOrders || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: 'var(--purple)' }}>{Icons.revenue()}</div>
          <div className="stat-info">
            <div className="stat-value">UGX {(stats?.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-change up">Today: UGX {(stats?.todayRevenue || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main content — Order Items + Customer panel */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Latest Order (left panel) */}
        <div className="card">
          <div className="card-header">
            <h3>Latest Order</h3>
            {latestOrder && <span className={`badge badge-${latestOrder.status}`}>{STATUS_LABELS[latestOrder.status] || latestOrder.status}</span>}
          </div>
          {latestOrder ? (
            <>
              <div className="card-body-np">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Qty</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Details</span>
                </div>
                {latestOrder.items.length > 0 ? latestOrder.items.map((item, idx) => (
                  <div className="item-row" key={idx}>
                    <div style={{ flex: 2 }}>
                      <div className="item-name">{item}</div>
                    </div>
                    <div className="item-qty">—</div>
                    <div className="item-total">—</div>
                  </div>
                )) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No items</div>
                )}
              </div>
              <div className="summary-rows">
                <div className="summary-row total"><span>Total:</span><span>UGX {latestOrder.total.toLocaleString()}</span></div>
                <div className="summary-row"><span>Restaurant:</span><span style={{ fontWeight: 600 }}>{latestOrder.restaurant}</span></div>
                <div className="summary-row"><span>Date:</span><span>{latestOrder.date}</span></div>
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</div>
          )}
        </div>

        {/* Right side panels */}
        <div>
          {/* Customer info from latest order */}
          {latestOrder && (
            <div className="customer-panel" style={{ marginBottom: 16 }}>
              <div className="customer-panel-header">
                <img src={latestOrder.customerAvatar} alt="" className="customer-avatar-lg" />
                <div>
                  <div className="customer-name-lg">{latestOrder.customer}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer</div>
                </div>
              </div>
              <div className="customer-detail-row">
                <div>
                  <div className="customer-detail-label">Restaurant</div>
                  <div className="customer-detail-value">{latestOrder.restaurant}</div>
                </div>
              </div>
              <div className="customer-detail-row">
                <div>
                  <div className="customer-detail-label">Chef</div>
                  <div className="customer-detail-value">{latestOrder.chef}</div>
                </div>
              </div>
              <div className="customer-detail-row">
                <div>
                  <div className="customer-detail-label">Amount</div>
                  <div className="customer-detail-value" style={{ fontWeight: 700 }}>UGX {latestOrder.total.toLocaleString()}</div>
                </div>
              </div>
              <div className="customer-detail-row">
                <div>
                  <div className="customer-detail-label">Date</div>
                  <div className="customer-detail-value">{latestOrder.date}</div>
                </div>
              </div>
            </div>
          )}

          {/* Live orders side panel */}
          <div className="card">
            <div className="card-header">
              <h3>{Icons.dot('#EF4444')} Live ({liveOrders.length})</h3>
            </div>
            <div className="activity-feed">
              {liveOrders.length > 0 ? liveOrders.map((order) => (
                <div className="activity-item" key={order.fullId || order.id}>
                  <img src={order.customerAvatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="activity-content">
                    <div className="activity-action" style={{ fontSize: 12 }}>{order.id}</div>
                    <div className="activity-detail">{order.customer}</div>
                  </div>
                  <span className={`badge badge-${order.status}`} style={{ fontSize: 10 }}>{STATUS_LABELS[order.status]}</span>
                </div>
              )) : (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No live orders</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row — Revenue chart + Top chefs + Recent Activity */}
      <div className="grid-1-1-1" style={{ marginBottom: 20 }}>
        {/* Revenue chart */}
        <div className="chart-card">
          <h3>Weekly Revenue</h3>
          <div className="bar-chart">
            {revenueByDay.map((d) => (
              <div className="bar-col" key={d.day}>
                <div className="bar-value">UGX {d.amount.toLocaleString()}</div>
                <div className="bar" style={{ height: `${(d.amount / maxRev) * 120}px` }} />
                <div className="bar-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Chefs */}
        <div className="table-card">
          <div className="table-header"><h3>Top Chefs</h3></div>
          <table>
            <thead><tr><th>Chef</th><th>Restaurant</th><th>Rating</th></tr></thead>
            <tbody>
              {chefs.filter(c => c.status === 'active').slice(0, 4).map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="user-cell">
                      <img src={c.avatar} alt="" className="user-avatar" />
                      <div className="user-name">{c.name}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.restaurant}</td>
                  <td style={{ color: 'var(--warning)' }}>{c.rating || '—'}</td>
                </tr>
              ))}
              {chefs.filter(c => c.status === 'active').length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No chefs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="activity-feed">
            {recentActivities.length > 0 ? recentActivities.map((a) => (
              <div className="activity-item" key={a.id}>
                <div className="activity-icon" style={{ background: '#F5F7FA' }}>{activityIcons[a.type] || Icons.box(16)}</div>
                <div className="activity-content">
                  <div className="activity-action">{a.action}</div>
                  <div className="activity-detail">{a.detail}</div>
                </div>
                <div className="activity-time">{a.time}</div>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
