import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import RatingStars from '../components/common/RatingStars';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import formatCurrency from '../utils/formatCurrency';
import formatDate from '../utils/formatDate';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MainLayout from '../layouts/MainLayout';
import RecentlyViewed from '../components/product/RecentlyViewed';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import { useT } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { getFormatLocale } from '../i18n/formatLocale';
import { categoryName } from '../i18n/catalog';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const t = useT();
  const { settings, fillShipping } = useSettings();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          const item = res.data;
          setProduct(item);
          addRecentlyViewed(item);
          document.title = `${item.name} — ABDULL`;
          setSelectedImage(item.images && item.images[0] ? item.images[0] : '');
          if (item.colors && item.colors.length > 0) setSelectedColor(item.colors[0]);
          if (item.sizes && item.sizes.length > 0) setSelectedSize(item.sizes[0]);

          // Fetch reviews & related products
          const [revRes, relRes] = await Promise.all([
            reviewService.getProductReviews(item._id),
            productService.getRelated(item._id),
          ]);

          if (revRes.success) setReviews(revRes.data);
          if (relRes.success) setRelatedProducts(relRes.data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      document.title = t('meta.defaultTitle');
    };
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>{t('product.loading')}</h2>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>{t('product.notFound')}</h2>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
            {t('product.backToShop')}
          </Link>
        </div>
      </MainLayout>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0;
  const inWishlist = isInWishlist(product._id);
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  // Estimated delivery: 3–7 business days from today
  const addBusinessDays = (days) => {
    const d = new Date();
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added += 1;
    }
    return d.toLocaleDateString(getFormatLocale(), { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const deliveryWindow = `${addBusinessDays(3)} – ${addBusinessDays(7)}`;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    return { stars, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast(t('product.linkCopied'), 'success');
    } catch (err) {
      if (err?.name !== 'AbortError') showToast(t('product.shareFailed'), 'warning');
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    // Wait for the bag to update so checkout opens with this item already in it
    await addToCart(product, quantity, selectedColor, selectedSize, { openDrawer: false });
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast(t('product.reviewRequired'), 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewService.createReview(product._id, {
        rating: newRating,
        comment: newComment,
      });

      if (res.success && res.data) {
        showToast(t('product.reviewThanks'), 'success');
        setReviews([res.data, ...reviews]);
        setNewComment('');
        // Refresh product to update average rating
        const refreshed = await productService.getProductById(id);
        if (refreshed.success) setProduct(refreshed.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link to="/">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/shop">{t('footer.shop')}</Link>
          <span>/</span>
          {product.category?.slug && (
            <>
              <Link to={`/shop?category=${product.category.slug}`}>{categoryName(product.category, t)}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--text-main)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            marginBottom: '60px',
          }}
        >
          {/* Left: Image Gallery */}
          <div>
            <div
              className="card"
              style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-surface)',
                overflow: 'hidden',
              }}
            >
              <img
                src={selectedImage || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '460px',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      border: selectedImage === img ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '4px',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer',
                      width: '76px',
                      height: '76px',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={t('product.thumbnail', { n: idx + 1 })}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Attributes & Actions */}
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {product.brand || 'ABDULL'}
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.2, color: 'var(--text-main)', marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* Rating & SKU */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <RatingStars rating={product.rating || 0} numReviews={product.numReviews} size={18} />
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                SKU: <strong>{product.sku}</strong>
              </span>
            </div>

            {/* Price Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatCurrency(product.price)}
                  </span>
                  <Badge variant="danger">
                    {t('product.save', { percent: Math.round(((product.price - product.discountPrice) / product.price) * 100) })}
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Availability */}
            <div style={{ marginBottom: '24px' }}>
              {isOutOfStock ? (
                <Badge variant="danger">{t('product.outOfStock')}</Badge>
              ) : product.stock <= 5 ? (
                <Badge variant="warning">{t('product.lowStock', { count: product.stock })}</Badge>
              ) : (
                <Badge variant="success">✓ {t('product.inStockReady')}</Badge>
              )}
            </div>

            {/* Color Variations */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                  {t('product.color')} <strong>{selectedColor}</strong>
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: selectedColor === color ? '2px solid var(--accent)' : '1px solid var(--border-active)',
                        backgroundColor: selectedColor === color ? 'var(--accent-light)' : 'var(--bg-surface)',
                        color: selectedColor === color ? 'var(--accent)' : 'var(--text-main)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variations */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                  {t('product.sizeOption')} <strong>{selectedSize}</strong>
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: selectedSize === size ? '2px solid var(--accent)' : '1px solid var(--border-active)',
                        backgroundColor: selectedSize === size ? 'var(--accent-light)' : 'var(--bg-surface)',
                        color: selectedSize === size ? 'var(--accent)' : 'var(--text-main)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-active)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  overflow: 'hidden',
                }}
              >
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  −
                </button>
                <span style={{ padding: '0 16px', fontWeight: 800 }}>{quantity}</span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="btn-icon"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: inWishlist ? '#ef4444' : 'var(--bg-subtle)',
                  color: inWishlist ? '#ffffff' : 'var(--text-main)',
                }}
                title={inWishlist ? t('product.removeWishlist') : t('product.addWishlist')}
                aria-label={inWishlist ? t('product.removeWishlist') : t('product.addWishlist')}
              >
                {inWishlist ? '♥' : '♡'}
              </button>
            </div>

            {/* Add to Cart & Buy Now */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '16px 24px', fontSize: '1rem' }}
              >
                🛒 {t('product.addToCart')}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn btn-accent"
                style={{ flexGrow: 1, padding: '16px 24px', fontSize: '1rem' }}
              >
                ⚡ {t('product.buyNow')}
              </button>
            </div>

            {/* Delivery, returns & trust info */}
            <div className="pdp-service-box">
              <div className="pdp-service-row">
                <span className="pdp-service-icon">🚚</span>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {activePrice >= settings.freeShippingThreshold ? t('product.freeDelivery') : fillShipping(t('product.paidDelivery'))}
                  </div>
                  <div className="pdp-service-sub">
                    {t('product.arrivesBefore')} <strong>{deliveryWindow}</strong> {t('product.arrivesAfter')}
                  </div>
                </div>
              </div>
              <div className="pdp-service-row">
                <span className="pdp-service-icon">🔄</span>
                <div>
                  <div style={{ fontWeight: 800 }}>{t('product.freeReturns')}</div>
                  <div className="pdp-service-sub">
                    <Link to="/returns" style={{ textDecoration: 'underline' }}>{t('product.seeReturnPolicy')}</Link>
                  </div>
                </div>
              </div>
              <div className="pdp-service-row">
                <span className="pdp-service-icon">🛡️</span>
                <div>
                  <div style={{ fontWeight: 800 }}>{t('product.authenticCod')}</div>
                  <div className="pdp-service-sub">{t('product.soldBy')}</div>
                </div>
              </div>
            </div>

            <button type="button" onClick={handleShare} className="pdp-share">
              🔗 {t('product.share')}
            </button>
          </div>
        </div>

        {/* Tabbed Content: Description, Specifications, Verified Reviews */}
        <div className="card" style={{ padding: '32px', marginBottom: '60px' }}>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '16px',
              marginBottom: '24px',
            }}
          >
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {tab === 'reviews' ? t('product.reviewsCount', { count: reviews.length }) : t(`product.tab_${tab}`)}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1rem' }}>
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              {product.specifications && product.specifications.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {product.specifications.map((spec, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {spec.key}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>{t('product.noSpecs')}</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {/* Rating summary & star breakdown */}
              <div className="review-summary">
                <div style={{ textAlign: 'center', minWidth: '140px' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                    {(product.rating || 0).toFixed(1)}
                  </div>
                  <RatingStars rating={product.rating || 0} size={16} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('product.ratingsCount', { count: product.numReviews || 0 })}
                  </div>
                </div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {reviews.length > 0
                      ? t('product.breakdown', { count: reviews.length })
                      : t('product.noWrittenReviews')}
                  </div>
                  {ratingBreakdown.map(({ stars, pct }) => (
                    <div key={stars} className="review-bar-row">
                      <span style={{ width: '56px' }}>{t('product.stars', { count: stars })}</span>
                      <div className="review-bar">
                        <div className="review-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ width: '36px', textAlign: 'end' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Submission Form */}
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '32px',
                }}
              >
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>
                  {t('product.writeReview')}
                </h4>
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                      <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>
                        {t('product.starRating')}
                      </label>
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="input-field"
                        style={{ maxWidth: '200px' }}
                      >
                        <option value="5">★★★★★ ({t('product.rating5')})</option>
                        <option value="4">★★★★☆ ({t('product.rating4')})</option>
                        <option value="3">★★★☆☆ ({t('product.rating3')})</option>
                        <option value="2">★★☆☆☆ ({t('product.rating2')})</option>
                        <option value="1">★☆☆☆☆ ({t('product.rating1')})</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>
                        {t('product.yourReview')}
                      </label>
                      <textarea
                        rows="4"
                        required
                        className="input-field"
                        placeholder={t('product.reviewPlaceholder')}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '10px 20px' }}
                    >
                      {submittingReview ? t('product.submitting') : t('product.submitReview')}
                    </button>
                  </form>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {t('product.signInToReviewBefore')}{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      {t('nav.signIn')}
                    </Link>{' '}
                    {t('product.signInToReviewAfter')}
                  </p>
                )}
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  {t('product.noReviews')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '18px',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                            alt={rev.user?.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.user?.name || t('product.customer')}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <RatingStars rating={rev.rating} size={14} showScore={false} />
                      <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px' }}>
              {t('product.related')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <RecentlyViewed excludeId={product._id} />
    </MainLayout>
  );
};

export default ProductDetails;
