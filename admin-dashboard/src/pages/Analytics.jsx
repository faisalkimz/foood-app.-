import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons } from '../components/Icons';

const STATUS_LABELS = { new: 'New', preparing: 'Preparing', ready: 'Ready', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Analytics({ token }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          adminApi.getStats(token),
          adminApi.getOrders(token),
        ]);
        setStats(statsRes);
        setOrders(ordersRes.orders || []);
      } catch (err) {
        console.error('Analytics load error:', err);
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

  const revenueByDay = stats?.revenueByDay || [];
  const ordersByStatus = stats?.ordersByStatus || {};
  const maxRev = Math.max(...revenueByDay.map(r => r.amount), 1);

  // Total revenue
  const totalRev = revenueByDay.reduce((s, d) => s + d.amount, 0);

  // Order status distribution
  const statusEntries = Object.entries(ordersByStatus).filter(([, v]) => v > 0);
  const totalStatusOrders = statusEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const statusColors = {
    new: 'var(--info)', preparing: 'var(--warning)', ready: 'var(--purple)',
    on_the_way: '#FF6B35', delivered: 'var(--success)', cancelled: 'var(--danger)',
  };

  // Top restaurants by order count
  const restaurantMap = {};
  orders.forEach((o) => {
    if (!restaurantMap[o.restaurant]) restaurantMap[o.restaurant] = { name: o.restaurant, orders: 0, revenue: 0 };
    restaurantMap[o.restaurant].orders++;
    restaurantMap[o.restaurant].revenue += o.total;
  });
  const topRestaurants = Object.values(restaurantMap).sort((a, b) => b.orders - a.orders).slice(0, 5);

  return (
    <div>
      {/* Overview stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: 'var(--purple)' }}>{Icons.revenue()}</div>
          <div className="stat-info">
            <div className="stat-value">UGX {(stats?.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">All-Time Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: 'var(--warning)' }}>{Icons.orders()}</div>
          <div className="stat-info">
            <div className="stat-value">{(stats?.totalOrders || 0).toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.check()}</div>
          <div className="stat-info">
            <div className="stat-value">{ordersByStatus.delivered || 0}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FEF2F2', color: 'var(--danger)' }}>{Icons.x()}</div>
          <div className="stat-info">
            <div className="stat-value">{ordersByStatus.cancelled || 0}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Revenue chart */}
        <div className="chart-card">
          <h3>Revenue Last 7 Days <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>Total: UGX {totalRev.toLocaleString()}</span></h3>
          <div className="bar-chart">
            {revenueByDay.map((d) => (
              <div className="bar-col" key={d.day}>
                <div className="bar-value">UGX {d.amount.toLocaleString()}</div>
                <div className="bar" style={{ height: `${Math.max((d.amount / maxRev) * 140, 4)}px` }} />
                <div className="bar-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="card">
          <div className="card-header"><h3>Orders by Status</h3></div>
          <div style={{ padding: '12px 20px' }}>
            {statusEntries.length > 0 ? statusEntries.map(([status, count]) => {
              const pct = Math.round((count / totalStatusOrders) * 100);
              return (
                <div key={status} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{STATUS_LABELS[status] || status}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: statusColors[status] || 'var(--primary)', borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Restaurants */}
      <div className="table-card">
        <div className="table-header"><h3>Top Restaurants</h3></div>
        <table>
          <thead><tr><th>Restaurant</th><th>Orders</th><th>Revenue</th></tr></thead>
          <tbody>
            {topRestaurants.map((r) => (
              <tr key={r.name}>
                <td><div className="user-name">{r.name}</div></td>
                <td>{r.orders}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>UGX {r.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {topRestaurants.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
