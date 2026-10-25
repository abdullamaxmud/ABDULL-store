import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import paymentService from '../services/paymentService';
import { useCart } from '../context/CartContext';
import formatCurrency from '../utils/formatCurrency';
import { useT } from '../context/LanguageContext';

// Stripe can take a moment to report a payment; poll a few times before giving up
const MAX_CHECKS = 6;
const CHECK_INTERVAL_MS = 2000;

const OrderSuccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromStripe = !!searchParams.get('session_id');
  const { refreshCart } = useCart();
  const t = useT();

  // 'confirmed' (COD or paid card) | 'verifying' | 'pending' (still unpaid) | 'cancelled' | 'error'
  const [state, setState] = useState(fromStripe ? 'verifying' : 'confirmed');
  const [order, setOrder] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!fromStripe) return undefined;
    let cancelled = false;
    let attempts = 0;
    let timer;

    const check = async () => {
      attempts += 1;
      try {
        const res = await paymentService.verify(id);
        if (cancelled || !res.success) return;
        const o = res.data;
        setOrder(o);
        if (o.paymentStatus === 'Paid') {
          setState('confirmed');
          refreshCart(); // the server emptied the bag once payment cleared
          return;
        }
        if (o.orderStatus === 'Cancelled') {
          setState('cancelled');
          return;
        }
        if (attempts < MAX_CHECKS) {
          timer = setTimeout(check, CHECK_INTERVAL_MS);
        } else {
          setState('pending');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fromStripe]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const res = await paymentService.retry(id);
      if (res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
      } else if (res.data?.alreadyPaid) {
        setState('confirmed');
        refreshCart();
      }
    } catch {
      setState('error');
    } finally {
      setRetrying(false);
    }
  };

  const content = {
    confirmed: {
      icon: '✓',
      tone: 'success',
      title: t('success.title'),
      text:
        order?.paymentStatus === 'Paid' && order?.paymentMethod === 'Credit Card'
          ? t('success.cardPaid', { amount: formatCurrency(order.totalPrice) })
          : t('success.placed'),
    },
    verifying: {
      icon: '⏳',
      tone: 'accent',
      title: t('success.verifyingTitle'),
      text: t('success.verifyingText'),
    },
    pending: {
      icon: '⏳',
      tone: 'warning',
      title: t('success.pendingTitle'),
      text: t('success.pendingText'),
    },
    cancelled: {
      icon: '✕',
      tone: 'danger',
      title: t('success.cancelledTitle'),
      text: t('success.cancelledText'),
    },
    error: {
      icon: '!',
      tone: 'danger',
      title: t('success.errorTitle'),
      text: t('success.errorText'),
    },
  }[state];

  return (
    <MainLayout>
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="card animate-fade-in" style={{ maxWidth: '560px', width: '100%', textAlign: 'center', padding: '48px 36px' }}>
          <div className={`order-result-icon tone-${content.tone}`}>{content.icon}</div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '12px' }}>
            {content.title}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>{content.text}</p>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('success.reference')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px', wordBreak: 'break-all' }}>#{id}</div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {state === 'pending' && (
              <button className="btn btn-accent" onClick={handleRetry} disabled={retrying}>
                {retrying ? t('checkout.openingPayment') : `💳 ${t('orders.completePayment')}`}
              </button>
            )}
            {state === 'cancelled' ? (
              <Link to="/checkout" className="btn btn-primary">{t('success.backToCheckout')}</Link>
            ) : (
              state !== 'verifying' && (
                <Link to={`/orders/${id}`} className="btn btn-primary">📦 {t('success.viewStatus')}</Link>
              )
            )}
            <Link to="/shop" className="btn btn-outline">{t('cart.continueShopping')}</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
