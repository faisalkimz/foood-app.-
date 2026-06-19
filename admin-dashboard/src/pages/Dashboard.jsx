import { dashboardStats, allOrders, activityLog, revenueByDay, chefs } from '../data';
import { Icons } from '../components/Icons';

const STATUS_LABELS = { new: 'New', preparing: 'Preparing', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Dashboard() {
  const latestOrder = allOrders[0];
  const liveOrders = allOrders.filter(o => ['new', 'preparing', 'on_the_way'].includes(o.status));
  const recentActivities = activityLog.slice(0, 5);
  const maxRev = Math.max(...revenueByDay.map(r => r.amount));
  const activityIcons = { order: Icons.box(16), chef: Icons.chef(16), user: Icons.user(16), menu: Icons.plate(16), payment: Icons.creditCard(16), review: Icons.star(16) };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: 'var(--info)' }}>{Icons.users()}</div>
          <div className="stat-info">
            <div className="stat-value">{dashboardStats.totalUsers}</div>
            <div className="stat-label">Total Customers</div>
            <div className="stat-change up">↑ {dashboardStats.userGrowth}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F0FDF4', color: 'var(--success)' }}>{Icons.chef()}</div>
          <div className="stat-info">
            <div className="stat-value">{dashboardStats.totalChefs}</div>
            <div className="stat-label">Active Chefs</div>
            <div className="stat-change up">↑ {dashboardStats.chefGrowth}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: 'var(--warning)' }}>{Icons.orders()}</div>
          <div className="stat-info">
            <div className="stat-value">{dashboardStats.totalOrders.toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-change up">↑ {dashboardStats.orderGrowth}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: 'var(--purple)' }}>{Icons.revenue()}</div>
          <div className="stat-info">
            <div className="stat-value">${dashboardStats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-change up">↑ {dashboardStats.revenueGrowth}</div>
          </div>
        </div>
      </div>

      {/* Main content — Order Items + Customer panel like reference */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Order Items (left panel) */}
        <div className="card">
          <div className="card-header">
            <h3>Order Items</h3>
            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Update</span>
          </div>
          <div className="card-body-np">
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Price</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Quantity</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Total</span>
            </div>

            {/* Item rows */}
            {[
              { name: 'BURGER', desc: 'Chicken curry special', price: 30, qty: 1, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100' },
              { name: 'SANDWICH', desc: 'Chicken curry special', price: 30, qty: 1, img: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=100' },
            ].map((item, idx) => (
              <div className="item-row" key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 2 }}>
                  <img src={item.img} alt="" className="item-img" />
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-desc">{item.desc}</div>
                  </div>
                </div>
                <div className="item-price">₦ {item.price.toFixed(2)}</div>
                <div className="item-qty">{item.qty}</div>
                <div className="item-total">₦ {(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="summary-rows">
            <div className="summary-row"><span>Subtotal:</span><span>₦ 73.00</span></div>
            <div className="summary-row"><span>Delivery fee:</span><span>₦ 4.50</span></div>
            <div className="summary-row total"><span>Total:</span><span>₦ 77.50</span></div>
            <div className="summary-row"><span>Amount paid:</span><span style={{ fontWeight: 600 }}>₦ 77.50</span></div>
          </div>

          {/* Order History (timeline) */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Order History</h3>
            <div className="timeline">
              {[
                { title: 'Order Delivered', time: 'Thu, 21 Jul 2026, 12:34 PM', color: 'var(--success)', icon: '✓' },
                { title: 'On Delivery', time: 'Thu, 21 Jul 2026, 12:05 PM', color: 'var(--primary)', icon: '→' },
                { title: 'Payment Success', time: 'Thu, 21 Jul 2026, 11:45 AM', color: 'var(--success)', icon: '$' },
              ].map((step, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-dot-wrap">
                    <div className="timeline-dot" style={{ background: step.color + '20', color: step.color, fontWeight: 700 }}>
                      {step.icon}
                    </div>
                    {idx < 2 && <div className="timeline-line" style={{ background: step.color + '30' }} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{step.title}</div>
                    <div className="timeline-time">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Panel (right side) */}
        <div>
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
                <div className="customer-detail-label">Contact Info</div>
                <div className="customer-detail-value">00143567898</div>
              </div>
              <span className="edit-link">Edit</span>
            </div>
            <div className="customer-detail-row">
              <div>
                <div className="customer-detail-label">Delivery Address</div>
                <div className="customer-detail-value">
                  43, Akin-Osho Oko,<br/>
                  Abisouka Avenue,<br/>
                  Ug.
                </div>
              </div>
              <span className="edit-link">Edit</span>
            </div>
            <div className="customer-detail-row">
              <div>
                <div className="customer-detail-label">Amount paid</div>
                <div className="customer-detail-value" style={{ fontWeight: 700 }}>₦ 77.50</div>
              </div>
            </div>
            <div className="customer-detail-row">
              <div>
                <div className="customer-detail-label">Payment Method</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ color: 'var(--primary)' }}>{Icons.creditCard(16)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Card</span>
                </div>
              </div>
            </div>
            <div className="customer-detail-row">
              <div>
                <div className="customer-detail-label">Date</div>
                <div className="customer-detail-value">Thu, 21 Jul 2026, 12:05 PM</div>
              </div>
            </div>
            <div style={{ padding: '12px 20px' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Add Payment
              </button>
            </div>
          </div>

          {/* Live orders side panel */}
          <div className="card">
            <div className="card-header">
              <h3>{Icons.dot('#EF4444')} Live ({liveOrders.length})</h3>
            </div>
            <div className="activity-feed">
              {liveOrders.map((order) => (
                <div className="activity-item" key={order.id}>
                  <img src={order.customerAvatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="activity-content">
                    <div className="activity-action" style={{ fontSize: 12 }}>{order.id}</div>
                    <div className="activity-detail">{order.customer}</div>
                  </div>
                  <span className={`badge badge-${order.status}`} style={{ fontSize: 10 }}>{STATUS_LABELS[order.status]}</span>
                </div>
              ))}
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
                <div className="bar-value">${d.amount}</div>
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
            <thead><tr><th>Chef</th><th>Orders</th><th>Rating</th></tr></thead>
            <tbody>
              {chefs.filter(c => c.status === 'active').sort((a, b) => b.revenue - a.revenue).slice(0, 4).map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="user-cell">
                      <img src={c.avatar} alt="" className="user-avatar" />
                      <div>
                        <div className="user-name">{c.name}</div>
                        <div className="user-email">{c.restaurant}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.orders}</td>
                  <td style={{ color: 'var(--warning)' }}>{c.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="activity-feed">
            {recentActivities.map((a) => (
              <div className="activity-item" key={a.id}>
                <div className="activity-icon" style={{ background: '#F5F7FA' }}>{activityIcons[a.type]}</div>
                <div className="activity-content">
                  <div className="activity-action">{a.action}</div>
                  <div className="activity-detail">{a.detail}</div>
                </div>
                <div className="activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
