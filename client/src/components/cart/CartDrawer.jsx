import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';
import { useT } from '../../context/LanguageContext';

const CartDrawer = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    shippingFee,
    freeShippingRemaining,
    freeShippingProgress,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();
  const t = useT();

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      {/* Slide-over Drawer */}
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-label={t('cart.bag')}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🛍️</span>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.3px',
              }}
            >
              {t('cart.bagCount', { count: cartCount })}
            </h3>
          </div>
          <button
            onClick={closeCart}
            className="btn-icon"
            style={{ width: '36px', height: '36px', fontSize: '1.1rem' }}
            title={t('cart.closeBag')}
            aria-label={t('cart.closeBag')}
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            <span>
              {freeShippingRemaining === 0 ? (
                <span style={{ color: 'var(--success)' }}>🎉 {t('cart.freeShippingUnlocked')}</span>
              ) : (
                <>
                  {t('cart.addMoreBefore')}<span style={{ color: 'var(--accent)' }}>{formatCurrency(freeShippingRemaining)}</span>{t('cart.addMoreAfter')}
                  <span style={{ color: 'var(--success)' }}>{t('cart.freeDelivery')}</span>
                </>
              )}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {freeShippingProgress}%
            </span>
          </div>
          <div className="free-shipping-progress">
            <div
              className="free-shipping-fill"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {cart.items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '3.5rem', animation: 'pulseGlow 2s infinite' }}>🛒</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {t('cart.emptyTitle')}
              </h4>
              <p style={{ fontSize: '0.9rem', maxWidth: '280px' }}>
                {t('cart.emptyText')}
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="btn btn-accent btn-sm"
                style={{ marginTop: '8px' }}
              >
                🔥 {t('cart.shopDeals')}
              </button>
            </div>
          ) : (
            cart.items.map((item) => {
              const product = item.product || {};
              const price = item.price || product.discountPrice || product.price || 0;
              const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

              return (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${product._id}`}
                    onClick={closeCart}
                    style={{ flexShrink: 0 }}
                  >
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'}
                      alt={product.name}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)',
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <Link
                        to={`/product/${product._id}`}
                        onClick={closeCart}
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0 4px',
                          lineHeight: 1,
                        }}
                        title={t('common.remove')}
                        aria-label={t('common.remove')}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Attributes */}
                    {(item.color || item.size) && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          marginTop: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.color && (
                          <span
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.size}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price and Stepper Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {formatCurrency(price)}
                        </span>
                        {hasDiscount && (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'line-through',
                              marginInlineStart: '6px',
                            }}
                          >
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{
                            padding: '4px 10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            fontWeight: 700,
                          }}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            minWidth: '24px',
                            textAlign: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{
                            padding: '4px 10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            fontWeight: 700,
                          }}
                          disabled={product.stock && item.quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('cart.subtotal')}</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(cartSubtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('cart.shipping')}</span>
              <span style={{ fontWeight: 700, color: shippingFee === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                {shippingFee === 0 ? t('common.free') : formatCurrency(shippingFee)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                marginBottom: '16px',
                fontSize: '1.15rem',
              }}
            >
              <span style={{ fontWeight: 900, color: 'var(--text-main)' }}>{t('cart.estimatedTotal')}</span>
              <span style={{ fontWeight: 900, color: 'var(--text-main)' }}>{formatCurrency(cartTotal)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-flash"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                marginBottom: '10px',
                boxShadow: 'var(--shadow-neon)',
              }}
            >
              🔒 {t('cart.checkoutNow')} • {formatCurrency(cartTotal)}
            </button>

            <button
              onClick={handleViewCart}
              className="btn btn-outline"
              style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
            >
              {t('cart.viewBag')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
