import React, { useState, useEffect } from 'react';
import couponService from '../../services/couponService';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percent',
  value: 10,
  maxDiscount: 0,
  minOrder: 0,
  usageLimit: 0,
  firstOrderOnly: false,
  expiresAt: '',
};

const describeValue = (c) => {
  if (c.discountType === 'percent') return `${c.value}% off${c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ''}`;
  if (c.discountType === 'fixed') return `${formatCurrency(c.value)} off`;
  return 'Free shipping';
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { showToast } = useToast();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAll();
      if (res.success) setCoupons(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (name, value) => setFormData((f) => ({ ...f, [name]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        value: Number(formData.value) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        minOrder: Number(formData.minOrder) || 0,
        usageLimit: Number(formData.usageLimit) || 0,
        expiresAt: formData.expiresAt || null,
      };
      const res = await couponService.create(payload);
      if (res.success) {
        showToast(`Coupon ${res.data.code} created`, 'success');
        setCoupons([res.data, ...coupons]);
        setFormData(emptyForm);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const res = await couponService.update(coupon._id, { isActive: !coupon.isActive });
      if (res.success) {
        setCoupons(coupons.map((c) => (c._id === coupon._id ? res.data : c)));
        showToast(`${coupon.code} ${res.data.isActive ? 'activated' : 'paused'}`, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? Customers will no longer be able to use it.`)) return;
    try {
      const res = await couponService.remove(coupon._id);
      if (res.success) {
        setCoupons(coupons.filter((c) => c._id !== coupon._id));
        showToast(`${coupon.code} deleted`, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <AdminLayout title="Promo Codes & Coupons">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Create Coupon Form */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Create Promo Code</h3>

          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label className="input-label">Code *</label>
              <input
                required
                maxLength={30}
                pattern="[A-Za-z0-9_\-]+"
                title="Letters, numbers, dashes and underscores only"
                className="input-field"
                placeholder="e.g. SUMMER25"
                value={formData.code}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description (shown to customers)</label>
              <input
                maxLength={160}
                className="input-field"
                placeholder="e.g. 25% off summer styles"
                value={formData.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Type</label>
                <select className="input-field" value={formData.discountType} onChange={(e) => setField('discountType', e.target.value)}>
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed amount off</option>
                  <option value="shipping">Free shipping</option>
                </select>
              </div>
              {formData.discountType !== 'shipping' && (
                <div className="input-group">
                  <label className="input-label">{formData.discountType === 'percent' ? 'Percent (%)' : 'Amount ($)'}</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.discountType === 'percent' ? 100 : undefined}
                    step="0.01"
                    className="input-field"
                    value={formData.value}
                    onChange={(e) => setField('value', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Minimum order ($)</label>
                <input type="number" min="0" step="0.01" className="input-field" value={formData.minOrder} onChange={(e) => setField('minOrder', e.target.value)} />
              </div>
              {formData.discountType === 'percent' && (
                <div className="input-group">
                  <label className="input-label">Max discount ($, 0 = none)</label>
                  <input type="number" min="0" step="0.01" className="input-field" value={formData.maxDiscount} onChange={(e) => setField('maxDiscount', e.target.value)} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Usage limit (0 = unlimited)</label>
                <input type="number" min="0" step="1" className="input-field" value={formData.usageLimit} onChange={(e) => setField('usageLimit', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Expires on</label>
                <input type="date" className="input-field" value={formData.expiresAt} onChange={(e) => setField('expiresAt', e.target.value)} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.firstOrderOnly} onChange={(e) => setField('firstOrderOnly', e.target.checked)} />
              First order only
            </label>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>
              {saving ? 'Saving…' : '+ Create Promo Code'}
            </button>
          </form>
        </div>

        {/* Coupons Table */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>All Promo Codes ({coupons.length})</h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Offer</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading promo codes...</td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      No promo codes yet. Create your first one.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span className="promo-offer-code">{c.code}</span>
                        {c.firstOrderOnly && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>First order only</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{describeValue(c)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.minOrder > 0 ? `Min. ${formatCurrency(c.minOrder)}` : 'No minimum'}
                          {c.expiresAt ? ` · Ends ${formatDate(c.expiresAt)}` : ''}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {c.usedCount}
                        {c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}
                      </td>
                      <td>
                        <span className={`badge ${isExpired(c) ? 'badge-danger' : c.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {isExpired(c) ? 'Expired' : c.isActive ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button onClick={() => toggleActive(c)} className="btn btn-outline btn-xs" style={{ marginRight: 6 }}>
                          {c.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(c)} className="btn btn-danger btn-xs">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
