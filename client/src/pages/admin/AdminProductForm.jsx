import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: 'ABDULL Signature',
    sku: '',
    stock: '10',
    images: ['', '', '', ''],
    colors: '',
    sizes: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    const initForm = async () => {
      try {
        setLoading(true);
        const catRes = await categoryService.getCategories();
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
          if (!isEditMode && catRes.data.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
          }
        }

        if (isEditMode) {
          const prodRes = await productService.getProductById(id);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            const imgs = [...(p.images || [])];
            while (imgs.length < 4) imgs.push('');

            setFormData({
              name: p.name,
              description: p.description,
              price: p.price.toString(),
              discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
              category: p.category?._id || p.category,
              brand: p.brand || '',
              sku: p.sku || '',
              stock: p.stock.toString(),
              images: imgs,
              colors: (p.colors || []).join(', '),
              sizes: (p.sizes || []).join(', '),
              isFeatured: p.isFeatured || false,
              isActive: p.isActive !== undefined ? p.isActive : true,
            });
          }
        }
      } catch (err) {
        showToast('Error loading product data: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [id, isEditMode]);

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validImages = formData.images.filter((img) => img && img.trim() !== '');

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      showToast('Please complete all mandatory fields marked with *', 'warning');
      return;
    }

    if (validImages.length === 0) {
      showToast('Please provide at least one valid image URL', 'warning');
      return;
    }

    if (Number(formData.price) <= 0) {
      showToast('Price must be greater than 0', 'warning');
      return;
    }

    if (Number(formData.stock) < 0) {
      showToast('Stock quantity cannot be negative', 'warning');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
      category: formData.category,
      brand: formData.brand,
      sku: formData.sku || undefined,
      stock: Number(formData.stock),
      images: validImages,
      colors: formData.colors ? formData.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
      sizes: formData.sizes ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await productService.updateProduct(id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await productService.createProduct(payload);
        showToast('New product created successfully!', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Product Form">
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading form...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditMode ? 'Edit Product Catalog Item' : 'Create New Product'}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '960px' }}>
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
            Basic Information
          </h3>

          <div className="input-group">
            <label className="input-label">Product Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Wireless Studio Pro Noise Cancelling Headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Category / Department *</label>
              <select
                required
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Brand</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Sony, Nike, Apple, ABDULL"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description *</label>
            <textarea
              rows="4"
              required
              className="input-field"
              placeholder="Provide a comprehensive description of product specifications, build, and benefits..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="input-group">
              <label className="input-label">Regular Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="input-field"
                placeholder="99.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="Optional promotional price"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Current Stock *</label>
              <input
                type="number"
                min="0"
                required
                className="input-field"
                placeholder="Available quantity"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">SKU (Stock Keeping Unit)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. SNY-WH1000-BLK (leave empty to auto-generate)"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Image Management & Live Previews */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
            Product Images (Up to 4)
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Provide direct image URLs. Image 1 serves as the primary catalog thumbnail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="input-group">
                <label className="input-label">Image {idx + 1} {idx === 0 && '*'}</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="url"
                    placeholder={`https://example.com/product-img-${idx + 1}.jpg`}
                    className="input-field"
                    value={formData.images[idx]}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                  />
                  {formData.images[idx] && (
                    <img
                      src={formData.images[idx]}
                      alt="Preview"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-active)',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variations & Visibility */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
            Variants & Highlight Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Colors (Comma separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Midnight Black, Silver, Titanium Gray"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Sizes / Options (Comma separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. S, M, L, XL or 256GB, 512GB"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px', marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span>Feature on Homepage Spotlight</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Published & Active in Catalog</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: '160px' }}>
            {submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
