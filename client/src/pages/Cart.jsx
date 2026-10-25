import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import formatCurrency from '../utils/formatCurrency';
import EmptyState from '../components/common/EmptyState';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const Cart = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    shippingFee,
    freeShippingRemaining,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const t = useT();

  if (cartCount === 0) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px' }}>
          <EmptyState
            icon="🛒"
            title={t('cart.emptyPageTitle')}
            description={t('cart.emptyPageText')}
            actionText={t('cart.explore')}
            actionLink="/shop"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {t('cart.bagItems', { count: cartCount })}
            </h1>
          </div>
          <button
            onClick={clearCart}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--danger)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('cart.clearBag')}
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        {freeShippingRemaining > 0 ? (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🚚</span>
            <span>
              {t('cart.addMoreBefore')}<strong>{formatCurrency(freeShippingRemaining)}</strong>{t('cart.addMoreAfter')}{' '}
              <strong>{t('cart.freeDelivery')}</strong>
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🎉</span>
            <span>{t('cart.freeShippingUnlocked')}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map((item) => {
              const product = item.product || {};
              const price = item.price || product.discountPrice || product.price || 0;
              const maxStock = product.stock !== undefined ? product.stock : 99;

              return (
                <div
                  key={item._id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={
                        product.images && product.images[0]
                          ? product.images[0]
                          : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={product.name}
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        backgroundColor: 'var(--bg-subtle)',
                      }}
                    />

                    <div>
                      <Link
                        to={`/product/${product._id}`}
                        style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none' }}
                      >
                        {product.name}
                      </Link>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {item.color && <span>{t('product.color')} {item.color} </span>}
                        {item.size && <span>• {t('product.size')} {item.size}</span>}
                      </div>

                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', marginTop: '6px' }}>
                        {formatCurrency(price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-active)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    >
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{
                          padding: '8px 14px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        −
                      </button>
                      <span style={{ padding: '0 12px', fontWeight: 800 }}>{item.quantity}</span>
                      <button
                        disabled={item.quantity >= maxStock}
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{
                          padding: '8px 14px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ minWidth: '80px', textAlign: 'end', fontWeight: 800 }}>
                      {formatCurrency(price * item.quantity)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="btn-icon"
                      style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
                      title={t('common.remove')}
                      aria-label={t('common.remove')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <aside
            className="card"
            style={{
              padding: '28px',
              position: 'sticky',
              top: '90px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              {t('cart.orderSummary')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{t('cart.subtotal')}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(cartSubtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{t('cart.estimatedShipping')}</span>
                <span style={{ fontWeight: 700, color: shippingFee === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                  {shippingFee === 0 ? t('common.free') : formatCurrency(shippingFee)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{t('cart.promo')}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t('cart.promoAtCheckout')}</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('cart.estimatedTotal')}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 800 }}
            >
              {t('cart.proceed')}
            </button>

            <Link
              to="/shop"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              {t('cart.continueShopping')}
            </Link>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
