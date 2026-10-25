import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Gross Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      growth: '+18.4%',
      subtitle: 'vs. last month',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#10b981',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      growth: '+12.1%',
      subtitle: 'Orders placed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#3b82f6',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      growth: 'Catalog Health',
      subtitle: 'Items listed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#8b5cf6',
    },
    {
      title: 'Registered Users',
      value: stats?.totalCustomers || 0,
      growth: '+9.5%',
      subtitle: 'Active shoppers',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#f59e0b',
    },
    {
      title: 'Pending Fulfillment',
      value: stats?.pendingOrders || 0,
      growth: 'Needs Action',
      subtitle: 'Awaiting dispatch',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      color: '#ec4899',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      growth: stats?.lowStockProducts > 0 ? 'Urgent' : 'Healthy',
      subtitle: 'Under minimum threshold',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ef4444',
    },
  ];

  // Visual simulation for weekly volume chart bars
  const weeklyTrends = [
    { day: 'Mon', height: 45, val: '$1,240' },
    { day: 'Tue', height: 65, val: '$2,190' },
    { day: 'Wed', height: 50, val: '$1,800' },
    { day: 'Thu', height: 85, val: '$3,420' },
    { day: 'Fri', height: 95, val: '$4,100' },
    { day: 'Sat', height: 100, val: '$4,850' },
    { day: 'Sun', height: 75, val: '$2,980' },
  ];

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <AdminLayout title="Enterprise Dashboard">
      {/* Hero Welcome Banner */}
      <div
        className="admin-card-glass"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Administrator'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Here is your live store summary for <strong style={{ color: 'var(--text-main)' }}>{todayFormatted}</strong>. All services are active and synced.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/admin/products/new"
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <span>+</span> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="btn btn-outline btn-sm"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
            }}
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/analytics"
            className="btn btn-outline btn-sm"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
            }}
          >
            Full Analytics →
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            className="admin-card-glass"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                  }}
                >
                  {card.title}
                </span>
                <div
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    marginTop: '6px',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {loading ? '...' : card.value}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: card.gradient,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 14px ${card.color}40`,
                }}
              >
                {card.icon}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: card.color,
                  backgroundColor: `${card.color}18`,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {card.growth}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{card.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Weekly Revenue Visualizer & Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Interactive Visual Bar Chart */}
        <div className="admin-card-glass" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Weekly Sales Velocity
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Revenue throughput over the last 7 days
              </p>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              ● Live Tracking
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div
            style={{
              height: '180px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {weeklyTrends.map((bar, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
                title={`${bar.day}: ${bar.val}`}
              >
                <div
                  className="admin-chart-bar"
                  style={{
                    width: '100%',
                    maxWidth: '36px',
                    height: `${bar.height}%`,
                    background:
                      idx === 5
                        ? 'linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)'
                        : 'var(--bg-subtle)',
                    border: idx === 5 ? 'none' : '1px solid var(--border-subtle)',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: idx === 5 ? 'var(--accent)' : 'var(--text-muted)',
                    marginTop: '8px',
                  }}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              Peak Performance: <strong style={{ color: 'var(--text-main)' }}>Saturday ($4,850)</strong>
            </span>
            <Link to="/admin/analytics" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Deep Analytics →
            </Link>
          </div>
        </div>

        {/* Quick Operations Hub */}
        <div className="admin-card-glass" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Operations Quick Launch
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Instantly navigate critical administration tasks
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link
              to="/admin/products/new"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>✨</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Add Product</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Upload new item</span>
            </Link>

            <Link
              to="/admin/orders"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🚚</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Dispatch Orders</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {stats?.pendingOrders || 0} awaiting ship
              </span>
            </Link>

            <Link
              to="/admin/inventory"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>📦</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Stock Health</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audit inventory counts</span>
            </Link>

            <Link
              to="/admin/users"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>👥</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Customer Directory</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Manage accounts & roles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="admin-card-glass" style={{ padding: '26px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
              Recent Customer Transactions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Live incoming customer purchases across all channels
            </p>
          </div>
          <Link
            to="/admin/orders"
            style={{
              color: 'var(--accent)',
              fontSize: '0.86rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All Orders</span>
            <span>→</span>
          </Link>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Date Placed</th>
                <th>Total Value</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ display: 'inline-block', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Loading real-time transactions...
                    </div>
                  </td>
                </tr>
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord) => {
                  const customerName = ord.user?.name || ord.shippingAddress?.fullName || 'Guest Shopper';
                  const initials = customerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 800, letterSpacing: '0.04em' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          #{ord._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{customerName}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {ord.shippingAddress?.city || 'Direct Purchase'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(ord.createdAt)}</td>
                      <td style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '0.94rem' }}>
                        {formatCurrency(ord.totalPrice)}
                      </td>
                      <td>
                        <Badge variant={ord.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {ord.paymentStatus}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            ord.orderStatus === 'Delivered'
                              ? 'success'
                              : ord.orderStatus === 'Shipped'
                              ? 'accent'
                              : 'warning'
                          }
                        >
                          {ord.orderStatus}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to="/admin/orders"
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No customer transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
