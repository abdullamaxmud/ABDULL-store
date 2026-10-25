import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllOrders({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminService.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success && res.data) {
        showToast(`Order status updated to "${newStatus}"`, 'success');
        setOrders(orders.map((o) => (o._id === orderId ? res.data : o)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Order Fulfillment & Management">
      {/* Filters Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button onClick={fetchOrders} className="btn btn-outline btn-sm">
          🔄 Refresh Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Phone</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '28px' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>#{ord._id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ord.orderItems?.length} items
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ord.shippingAddress?.phone || ord.user?.email}
                      </div>
                    </td>
                    <td>{formatDate(ord.createdAt)}</td>
                    <td style={{ fontWeight: 800 }}>{formatCurrency(ord.totalPrice)}</td>
                    <td>
                      <Badge variant={ord.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {ord.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <select
                        disabled={updatingId === ord._id}
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-active)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
