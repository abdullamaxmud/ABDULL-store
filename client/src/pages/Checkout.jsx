import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import couponService from '../services/couponService';
import paymentService from '../services/paymentService';
import formatCurrency from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const Checkout = () => {
  const { cart, cartSubtotal, shippingFee, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const t = useT();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'United States',
    city: user?.city || '',
    address: user?.address || '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Promo codes: the server computes the discount; we only preview it here
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const appliedCodeRef = useRef('');

  // Built-in codes are translated by code; codes created in admin show their own description
  const couponText = (c) => {
    const key = `coupons.${c.code}`;
    const text = t(key);
    return text === key ? c.description : text;
  };

  const [paymentConfig, setPaymentConfig] = useState({ cardEnabled: false, testMode: false });
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentNotice, setPaymentNotice] = useState('');

  useEffect(() => {
    couponService
      .getPublic()
      .then((res) => res.success && setOffers(res.data))
      .catch(() => {});
    paymentService
      .getConfig()
      .then((res) => res.success && setPaymentConfig(res.data))
      .catch(() => {});
  }, []);

  // Back from Stripe without paying: release the unpaid order so its stock and promo use come back
  useEffect(() => {
    const cancelledOrderId = searchParams.get('order');
    if (searchParams.get('payment') !== 'cancelled' || !cancelledOrderId || !isAuthenticated) return;
    setPaymentMethod('Credit Card');
    setPaymentNotice(t('checkout.paymentCancelled'));
    orderService.cancelOrder(cancelledOrderId).catch(() => {});
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, isAuthenticated]);

  const applyCoupon = async (code, { silent = false } = {}) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return;
    if (!isAuthenticated) {
      setCouponError(t('checkout.signInForPromo'));
      return;
    }
    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await couponService.validate(clean, cartSubtotal);
      if (res.success) {
        setAppliedCoupon(res.data);
        appliedCodeRef.current = res.data.code;
        setCouponInput('');
        if (!silent) showToast(t('checkout.promoApplied', { code: res.data.code }), 'success');
      }
    } catch (err) {
      setAppliedCoupon(null);
      appliedCodeRef.current = '';
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    appliedCodeRef.current = '';
    setCouponError('');
  };

  // Re-check the applied code whenever the bag total changes (minimums, caps)
  useEffect(() => {
    if (appliedCodeRef.current) applyCoupon(appliedCodeRef.current, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSubtotal]);

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalShipping = appliedCoupon ? appliedCoupon.shippingPrice : shippingFee;
  const finalTotal = Math.round((cartSubtotal - discount + finalShipping) * 100) / 100;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      showToast(t('checkout.signInToOrder'), 'warning');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      setErrorMsg(t('checkout.fieldsRequired'));
      return;
    }

    if (cart.items.length === 0) {
      setErrorMsg(t('checkout.bagEmpty'));
      return;
    }

    try {
      setLoading(true);
      const orderPayload = {
        orderItems: cart.items.map((item) => ({
          product: item.product._id || item.product,
          quantity: item.quantity,
          color: item.color || '',
          size: item.size || '',
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
        },
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.checkoutUrl) {
        // Card: hand off to Stripe. The bag is emptied only after payment succeeds.
        showToast(t('checkout.redirecting'), 'info');
        window.location.assign(res.checkoutUrl);
        return;
      }
      if (res.success && res.data) {
        await clearCart();
        showToast(t('checkout.orderPlaced'), 'success');
        navigate(`/order-success/${res.data._id}`, { state: { order: res.data } });
      }
    } catch (err) {
      setErrorMsg(err.message || t('checkout.orderFailed'));
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '32px' }}>
          {t('checkout.title')}
        </h1>

        {paymentNotice && (
          <div className="payment-notice" role="status">
            ℹ️ {paymentNotice}
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '24px',
              border: '1px solid var(--danger)',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            {/* Left: Shipping & Payment Address Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Shipping Address */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                  1. {t('checkout.shippingInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">{t('auth.fullName')} *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="input-field"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{t('checkout.phone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="input-field"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">{t('auth.email')} *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">{t('checkout.address')} *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder={t('checkout.addressPlaceholder')}
                    className="input-field"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">{t('checkout.city')} *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="input-field"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{t('checkout.country')} *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      className="input-field"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">{t('checkout.notes')}</label>
                  <textarea
                    name="notes"
                    rows="3"
                    className="input-field"
                    placeholder={t('checkout.notesPlaceholder')}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                  2. {t('checkout.paymentMethod')}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMethod === 'Cash on Delivery' ? 'var(--accent-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                    />
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        💵 {t('checkout.codFull')}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {t('checkout.codText')}
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'Credit Card' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMethod === 'Credit Card' ? 'var(--accent-light)' : 'var(--bg-surface)',
                      opacity: paymentConfig.cardEnabled ? 1 : 0.6,
                      cursor: paymentConfig.cardEnabled ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      disabled={!paymentConfig.cardEnabled}
                      checked={paymentMethod === 'Credit Card'}
                      onChange={() => setPaymentMethod('Credit Card')}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        💳 {t('checkout.card')}
                        {paymentConfig.testMode && <span className="badge badge-warning">{t('checkout.testMode')}</span>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {paymentConfig.cardEnabled
                          ? t('checkout.cardText')
                          : t('checkout.cardUnavailable')}
                      </div>
                      {paymentConfig.testMode && paymentMethod === 'Credit Card' && (
                        <div className="card-test-hint">
                          {t('checkout.testCardBefore')} <strong dir="ltr">4242 4242 4242 4242</strong>{t('checkout.testCardAfter')}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="card" style={{ padding: '28px', position: 'sticky', top: '150px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                {t('checkout.orderItems', { count: cart.items.length })}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '320px', overflowY: 'auto' }}>
                {cart.items.map((item) => {
                  const product = item.product || {};
                  const price = item.price || product.discountPrice || product.price || 0;

                  return (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={product.images && product.images[0] ? product.images[0] : ''}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {t('orders.qty')} {item.quantity} {item.color && `• ${item.color}`}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatCurrency(price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="promo-box">
                {appliedCoupon ? (
                  <div className="promo-applied">
                    <div>
                      <div style={{ fontWeight: 800 }}>🏷️ {appliedCoupon.code}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{couponText(appliedCoupon)}</div>
                    </div>
                    <button type="button" onClick={removeCoupon} className="promo-remove">
                      {t('common.remove')}
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="input-label" htmlFor="promo-code" style={{ display: 'block', marginBottom: '6px' }}>
                      {t('checkout.promoCode')}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="promo-code"
                        className="input-field"
                        placeholder={t('checkout.enterCode')}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyCoupon(couponInput);
                          }
                        }}
                        style={{ padding: '10px 14px', textTransform: 'uppercase' }}
                        maxLength={30}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={couponLoading || !couponInput.trim()}
                        onClick={() => applyCoupon(couponInput)}
                      >
                        {couponLoading ? '…' : t('checkout.apply')}
                      </button>
                    </div>
                    {couponError && <div className="promo-error">{couponError}</div>}
                    {offers.length > 0 && (
                      <div className="promo-offers">
                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          {t('checkout.offers')}
                        </div>
                        {offers.slice(0, 4).map((o) => (
                          <button key={o.code} type="button" className="promo-offer" onClick={() => applyCoupon(o.code)}>
                            <span className="promo-offer-code">{o.code}</span>
                            <span>{couponText(o)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  <span>{t('cart.subtotal')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(cartSubtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  <span>{t('checkout.shippingFee')}</span>
                  <span style={{ fontWeight: 700, color: finalShipping === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                    {finalShipping === 0 ? t('common.free') : formatCurrency(finalShipping)}
                  </span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.92rem' }}>
                    <span>{t('checkout.promoDiscount', { code: appliedCoupon.code })}</span>
                    <span style={{ fontWeight: 800 }}>−{formatCurrency(discount)}</span>
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{t('checkout.totalDue')}</span>
                  <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.items.length === 0}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 900 }}
              >
                {loading
                  ? paymentMethod === 'Credit Card'
                    ? t('checkout.openingPayment')
                    : t('checkout.processing')
                  : paymentMethod === 'Credit Card'
                    ? t('checkout.paySecurely', { amount: formatCurrency(finalTotal) })
                    : t('checkout.placeOrder')}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Checkout;
