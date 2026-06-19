import { revenueByDay, allOrders, ordersByStatus } from '../data';
import { Icons } from '../components/Icons';

const STATUS_COLORS = { new: '#3B82F6', preparing: '#F59E0B', on_the_way: '#8B5CF6', delivered: '#22C55E', cancelled: '#EF4444' };
const STATUS_LABELS = { new: 'New', preparing: 'Preparing', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const entries = Object.entries(data);
  let cumAngle = 0;
  const R = 55, cx = 70, cy = 70, strokeW = 16;

  const segments = entries.map(([key, value]) => {
    const angle = (value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const sRad = (startAngle - 90) * (Math.PI / 180);
    const eRad = (startAngle + angle - 90) * (Math.PI / 180);
    return (
      <path key={key}
        d={`M ${cx + R * Math.cos(sRad)} ${cy + R * Math.sin(sRad)} A ${R} ${R} 0 ${angle > 180 ? 1 : 0} 1 ${cx + R * Math.cos(eRad)} ${cy + R * Math.sin(eRad)}`}
        fill="none" stroke={STATUS_COLORS[key]} strokeWidth={strokeW} strokeLinecap="round"
      />
    );
  });

  return (
    <div className="donut-container">
      <svg width="140" height="140">
        {segments}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#1A1D26" fontSize="22" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="500">total</text>
      </svg>
      <div className="donut-legend">
        {entries.map(([key, value]) => (
          <div className="legend-item" key={key}>
            <div className="legend-dot" style={{ background: STATUS_COLORS[key] }} />
            <span className="legend-label">{STATUS_LABELS[key]}</span>
            <span className="legend-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const maxRev = Math.max(...revenueByDay.map(r => r.amount));
  const totalRevenue = revenueByDay.reduce((sum, d) => sum + d.amount, 0);
  const avgRevenue = Math.round(totalRevenue / revenueByDay.length);

  const paymentMethods = {};
  allOrders.forEach(o => { paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1; });

  const restaurantPerf = {};
  allOrders.forEach(o => {
    if (!restaurantPerf[o.restaurant]) restaurantPerf[o.restaurant] = { orders: 0, revenue: 0 };
    restaurantPerf[o.restaurant].orders++;
    restaurantPerf[o.restaurant].revenue += o.total;
  });

  const customerSpend = {};
  allOrders.forEach(o => {
    if (!customerSpend[o.customer]) customerSpend[o.customer] = { orders: 0, total: 0, avatar: o.customerAvatar };
    customerSpend[o.customer].orders++;
    customerSpend[o.customer].total += o.total;
  });
  const topCustomers = Object.entries(customerSpend).sort((a, b) => b[1].total - a[1].total).slice(0, 5);

  return (
    <div>
      {/* Metrics */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: 'var(--info)' }}>{Icons.barChart()}</div>
          <div className="stat-info"><div className="stat-value" style={{ fontSize: 20 }}>${totalRevenue.toLocaleString()}</div><div className="stat-label">Weekly Revenue</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.trendUp()}</div>
          <div className="stat-info"><div className="stat-value" style={{ fontSize: 20 }}>${avgRevenue}</div><div className="stat-label">Daily Average</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.check()}</div>
          <div className="stat-info"><div className="stat-value" style={{ fontSize: 20 }}>{ordersByStatus.delivered}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FEF2F2', color: 'var(--danger)' }}>{Icons.x()}</div>
          <div className="stat-info"><div className="stat-value" style={{ fontSize: 20 }}>{ordersByStatus.cancelled}</div><div className="stat-label">Cancelled</div></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <h3>Revenue by Day</h3>
          <div className="bar-chart">
            {revenueByDay.map(d => (
              <div className="bar-col" key={d.day}>
                <div className="bar-value">${d.amount}</div>
                <div className="bar" style={{ height: `${(d.amount / maxRev) * 120}px` }} />
                <div className="bar-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <h3>Orders by Status</h3>
          <DonutChart data={ordersByStatus} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="table-card">
          <div className="table-header"><h3>Restaurant Performance</h3></div>
          <table>
            <thead><tr><th>Restaurant</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {Object.entries(restaurantPerf).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data]) => (
                <tr key={name}>
                  <td style={{ fontWeight: 600 }}>{name}</td>
                  <td>{data.orders}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${data.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-card">
          <div className="table-header"><h3>Top Customers</h3></div>
          <table>
            <thead><tr><th>Customer</th><th>Orders</th><th>Spent</th></tr></thead>
            <tbody>
              {topCustomers.map(([name, data]) => (
                <tr key={name}>
                  <td>
                    <div className="user-cell">
                      <img src={data.avatar} alt="" className="user-avatar" />
                      <div className="user-name">{name}</div>
                    </div>
                  </td>
                  <td>{data.orders}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${data.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="chart-card">
        <h3>Payment Methods</h3>
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {Object.entries(paymentMethods).map(([method, count]) => {
            const pct = Math.round((count / allOrders.length) * 100);
            return (
              <div key={method} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{method}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
