import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import formatCurrency from '../../utils/formatCurrency';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ limit: 100 });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;

    try {
      setDeleting(true);
      const res = await productService.deleteProduct(deleteModalProduct._id);
      if (res.success) {
        showToast('Product deleted successfully.', 'success');
        setProducts(products.filter((p) => p._id !== deleteModalProduct._id));
        setDeleteModalProduct(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Product Catalog Management">
      {/* Top Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Filter by product name, SKU, or brand..."
          className="input-field"
          style={{ maxWidth: '380px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Link to="/admin/products/new" className="btn btn-primary">
          + Add New Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name & SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Units Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '28px' }}>
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.price;
                  return (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.images && p.images[0] ? p.images[0] : ''}
                          alt={p.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', maxWidth: '240px' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: {p.sku} • {p.brand}
                        </div>
                      </td>
                      <td>
                        <Badge variant="accent">{p.category?.name || 'General'}</Badge>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          {formatCurrency(hasDiscount ? p.discountPrice : p.price)}
                        </div>
                        {hasDiscount && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            {formatCurrency(p.price)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800 }}>{p.stock}</span>
                      </td>
                      <td>{p.soldCount || 0}</td>
                      <td>
                        {p.stock === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : p.stock <= 5 ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/product/${p._id}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="View on site"
                          >
                            👁️
                          </Link>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Edit Product"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => setDeleteModalProduct(p)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Delete Product"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deletion Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalProduct}
        onClose={() => setDeleteModalProduct(null)}
        title="Confirm Product Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteModalProduct(null)}
              className="btn btn-outline btn-sm"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn btn-danger btn-sm"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Product'}
            </button>
          </>
        }
      >
        <p style={{ lineHeight: 1.6 }}>
          Are you sure you want to permanently delete{' '}
          <strong>"{deleteModalProduct?.name}"</strong>?
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          This action will remove the item from all catalog listings and cannot be undone.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
