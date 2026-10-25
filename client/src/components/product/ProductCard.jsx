import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import formatCurrency from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import QuickViewModal from './QuickViewModal';
import { useT } from '../../context/LanguageContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const t = useT();

  if (!product) return null;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // If product requires color or size selection, open Quick View modal so customer can choose
    if ((product.colors && product.colors.length > 1) || (product.sizes && product.sizes.length > 1)) {
      setShowQuickView(true);
      return;
    }

    setIsAdding(true);
    await addToCart(
      product,
      1,
      product.colors?.[0] || '',
      product.sizes?.[0] || ''
    );
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div className="product-card group">
        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            insetInlineStart: 10,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            pointerEvents: 'none',
          }}
        >
          {hasDiscount && (
            <span
              style={{
                background: 'var(--fire-gradient)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 2px 8px rgba(255, 8, 68, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              -{discountPercent}%
            </span>
          )}

          {product.soldCount > 200 && (
            <span
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              🔥 {t('product.popular')}
            </span>
          )}

          {isOutOfStock ? (
            <Badge variant="warning">{t('product.outOfStock')}</Badge>
          ) : product.stock <= 5 ? (
            <span
              style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {t('product.onlyLeft', { count: product.stock })}
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button with animated pop */}
        <button
          onClick={handleWishlist}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: 10,
            insetInlineEnd: 10,
            zIndex: 10,
            width: '36px',
            height: '36px',
            backgroundColor: inWishlist ? '#ef4444' : 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            color: inWishlist ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '1rem',
          }}
          title={inWishlist ? t('product.removeWishlist') : t('product.addWishlist')}
          aria-label={inWishlist ? t('product.removeWishlist') : t('product.addWishlist')}
        >
          {inWishlist ? '♥' : '♡'}
        </button>

        {/* Image Presentation with Dual-angle Hover Flip */}
        <Link to={`/product/${product._id}`} className="product-img-wrapper">
          <img
            src={primaryImage}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
          {product.images?.length > 1 && (
            <img
              src={secondaryImage}
              alt={product.name}
              className="product-img-secondary"
              loading="lazy"
            />
          )}

          {/* Hover Quick Action Overlay */}
          <div className="product-hover-actions">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isAdding}
              className="btn btn-flash btn-xs"
              style={{ flexGrow: 1, padding: '9px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              {isAdding ? t('product.adding') : isOutOfStock ? t('product.soldOut') : `⚡ ${t('product.quickAdd')}`}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="btn btn-outline btn-xs"
              style={{
                backgroundColor: 'var(--bg-glass)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                padding: '9px 12px',
              }}
              title={t('product.quickView')}
            >
              👁️ {t('product.view')}
            </button>
          </div>
        </Link>

        {/* Content Section */}
        <div className="product-content">
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--text-muted)',
              marginBottom: 4,
              fontWeight: 700,
            }}
          >
            {product.brand || 'ABDULL'}
          </div>

          <Link to={`/product/${product._id}`}>
            <h3
              style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.35,
                marginBottom: 6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.6em',
              }}
            >
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div style={{ marginBottom: 10 }}>
            <RatingStars rating={product.rating || 0} numReviews={product.numReviews} size={13} />
          </div>

          {/* Color Swatches Preview if available */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: 10, alignItems: 'center' }}>
              {product.colors.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: c.toLowerCase().includes('black')
                      ? '#000000'
                      : c.toLowerCase().includes('white')
                      ? '#ffffff'
                      : c.toLowerCase().includes('red')
                      ? '#ef4444'
                      : c.toLowerCase().includes('blue')
                      ? '#2563eb'
                      : c.toLowerCase().includes('grey') || c.toLowerCase().includes('silver')
                      ? '#94a3b8'
                      : 'var(--accent)',
                    border: '1px solid var(--border-subtle)',
                    display: 'inline-block',
                  }}
                  title={c}
                />
              ))}
              {product.colors.length > 4 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Pricing Row */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              paddingTop: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontSize: '1.18rem',
                  fontWeight: 900,
                  color: hasDiscount ? '#ff1361' : 'var(--text-main)',
                }}
              >
                {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {product.soldCount > 0 && (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('product.soldCount', { count: product.soldCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
