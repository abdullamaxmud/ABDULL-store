import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import formatCurrency from '../utils/formatCurrency';
import formatDate from '../utils/formatDate';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();
  const t = useT();

  const orderSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(id);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const [paying, setPaying] = useState(false);
  const awaitingCardPayment =
    order && order.paymentMethod === 'Credit Card' && order.paymentStatus === 'Pending' && order.orderStatus === 'Pending';

  const handleCompletePayment = async () => {
    try {
      setPaying(true);
      const res = await paymentService.retry(id);
      if (res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
        return;
      }
      if (res.data?.alreadyPaid) {
        const refreshed = await orderService.getOrderById(id);
        if (refreshed.success) setOrder(refreshed.data);
        showToast(t('orders.alreadyPaid'), 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    const paidByCard = order.paymentMethod === 'Credit Card' && order.paymentStatus === 'Paid';
    if (!window.confirm(paidByCard ? t('orders.confirmCancelRefund') : t('orders.confirmCancel'))) return;

    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(order._id);
      if (res.success && res.data) {
        setOrder(res.data);
        showToast(t('orders.cancelled'), 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>{t('orders.loadingOne')}</h2>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>{t('orders.notFound')}</h2>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>
            {t('orders.back')}
          </Link>
        </div>
      </MainLayout>
    );
  }

  const currentStepIdx = orderSteps.indexOf(order.orderStatus);

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {t('orders.orderNo', { id: order._id })}
              </h1>
              <Badge variant={order.orderStatus === 'Cancelled' ? 'danger' : 'accent'}>
                {t(`status.${order.orderStatus}`)}
              </Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              {t('orders.placedOn', { date: formatDate(order.createdAt) })}
            </p>
          </div>

          {awaitingCardPayment && (
            <button onClick={handleCompletePayment} disabled={paying} className="btn btn-accent btn-sm" style={{ marginRight: 8 }}>
              {paying ? t('checkout.openingPayment') : `💳 ${t('orders.completePayment')}`}
            </button>
          )}
          {['Pending', 'Confirmed'].includes(order.orderStatus) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn btn-danger btn-sm"
            >
              {cancelling ? t('orders.cancelling') : t('orders.cancel')}
            </button>
          )}
        </div>

        {/* Visual Progress Timeline (If not cancelled) */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="card" style={{ padding: '32px', marginBottom: '36px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px' }}>
              {t('orders.progress')}
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {orderSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'var(--accent)' : 'var(--bg-subtle)',
                        color: isPassed ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        border: isCurrent ? '3px solid var(--primary)' : 'none',
                      }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isPassed ? 'var(--text-main)' : 'var(--text-muted)',
                      }}
                    >
                      {t(`status.${step}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Order Items */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px' }}>
              {t('orders.items', { count: order.orderItems.length })}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.color && <span>{t('product.color')} {item.color} </span>}
                        {item.size && <span>• {t('product.size')} {item.size}</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {t('orders.quantity')} <strong>{item.quantity}</strong> × {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Financial Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Shipping Address */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px' }}>
                {t('orders.deliveryInfo')}
              </h3>
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <div><strong>{t('orders.recipient')}</strong> {order.shippingAddress?.fullName}</div>
                <div><strong>{t('orders.phone')}</strong> {order.shippingAddress?.phone}</div>
                <div><strong>{t('orders.address')}</strong> {order.shippingAddress?.address}</div>
                <div><strong>{t('orders.cityCountry')}</strong> {order.shippingAddress?.city}, {order.shippingAddress?.country}</div>
                {order.shippingAddress?.notes && (
                  <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Notes: "{order.shippingAddress.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Charges */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
                {t('orders.payment')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('orders.paymentMethod')}</span>
                  <span style={{ fontWeight: 700 }}>{t(`paymentMethod.${order.paymentMethod}`)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('orders.paymentStatus')}</span>
                  <Badge
                    variant={
                      order.paymentStatus === 'Paid'
                        ? 'success'
                        : order.paymentStatus === 'Failed' || order.paymentStatus === 'Refunded'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {t(`paymentStatus.${order.paymentStatus}`)}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('cart.subtotal')}</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('cart.shipping')}</span>
                  <span style={{ fontWeight: 700 }}>
                    {order.shippingPrice === 0 ? t('common.free') : formatCurrency(order.shippingPrice)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                    <span>{t('orders.discount')}{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                    <span style={{ fontWeight: 700 }}>−{formatCurrency(order.discount)}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{t('orders.total')}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetails;
