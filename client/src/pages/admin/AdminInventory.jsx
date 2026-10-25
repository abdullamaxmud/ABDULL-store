import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import Badge from '../../components/common/Badge';
import AdminLayout from '../../layouts/AdminLayout';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        setLoading(true);
        const res = await adminService.getInventory();
        if (res.success && res.data) {
          setInventory(res.data);
        }
      } catch (err) {
        console.error('Failed to load inventory stock:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInv();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Out of Stock') return <Badge variant="danger">Out of Stock</Badge>;
    if (status === 'Low Stock') return <Badge variant="warning">Low Stock (&le; 5)</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <AdminLayout title="Real-Time Inventory & Stock Depletion">
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Product Stock Tracking</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Stock quantities automatically decrement upon verified customer orders
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Department</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Units Sold</th>
                <th>Status</th>
                <th>Restock Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '28px' }}>
                    Loading inventory data...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No inventory items available.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ fontWeight: 800, maxWidth: '240px' }}>{item.name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: item.stock <= 5 ? 'var(--danger)' : 'inherit' }}>
                        {item.stock}
                      </strong>
                    </td>
                    <td>{item.soldCount}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <Link
                        to={`/admin/products/${item._id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      >
                        Adjust Stock
                      </Link>
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

export default AdminInventory;
