import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';
import RatingStars from '../common/RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useT } from '../../context/LanguageContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const t = useT();

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'
  ];

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const chosenColor = selectedColor || (product.colors?.[0] || '');
    const chosenSize = selectedSize || (product.sizes?.[0] || '');
    addToCart(product, quantity, chosenColor, chosenSize);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '16px',
            insetInlineEnd: '16px',
            width: '36px',
            height: '36px',
            fontSize: '1rem',
            zIndex: 10,
          }}
          title={t('common.close')}
            aria-label={t('common.close')}
        >
          ✕
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Left: Gallery */}
          <div>
            <div
              style={{
                width: '100%',
                height: '340px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-subtle)',
                marginBottom: '12px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImage === i ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {product.brand || 'ABDULL Signature'}
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                marginBottom: '10px',
              }}
            >
              {product.name}
            </h2>

            {/* Rating */}
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RatingStars rating={product.rating || 0} numReviews={product.numReviews} size={15} />
              {product.stock <= 5 && product.stock > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--danger)' }}>
                  🔥 {t('product.onlyUnitsLeft', { count: product.stock })}
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '18px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatCurrency(product.price)}
                </span>
              )}
              {hasDiscount && (
                <span
                  style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  {t('product.save', { percent: Math.round(((product.price - product.discountPrice) / product.price) * 100) })}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {product.description?.slice(0, 160)}...
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  {t('product.selectColor')} <span style={{ color: 'var(--accent)' }}>{selectedColor || product.colors[0]}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.colors.map((color) => {
                    const active = (selectedColor || product.colors[0]) === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`btn ${active ? 'btn-primary' : 'btn-outline'} btn-xs`}
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  {t('product.selectSize')} <span style={{ color: 'var(--accent)' }}>{selectedSize || product.sizes[0]}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => {
                    const active = (selectedSize || product.sizes[0]) === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`btn ${active ? 'btn-primary' : 'btn-outline'} btn-xs`}
                        style={{ minWidth: '40px' }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 800,
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 8px', fontWeight: 800, fontSize: '0.95rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 800,
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-flash"
                style={{ flexGrow: 1, padding: '14px', borderRadius: 'var(--radius-md)' }}
              >
                {isOutOfStock ? t('product.soldOut') : `⚡ ${t('product.addToBag')}`}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="btn-icon"
                style={{
                  width: '46px',
                  height: '46px',
                  backgroundColor: inWishlist ? '#ef4444' : 'var(--bg-subtle)',
                  color: inWishlist ? '#ffffff' : 'var(--text-main)',
                }}
                title={t('nav.wishlist')}
                aria-label={t('nav.wishlist')}
              >
                {inWishlist ? '♥' : '♡'}
              </button>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link
                to={`/product/${product._id}`}
                onClick={onClose}
                style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}
              >
                {t('product.viewFullDetails')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
