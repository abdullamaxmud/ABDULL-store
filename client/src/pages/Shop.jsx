import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';
import { categoryName } from '../i18n/catalog';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [hasDiscount, setHasDiscount] = useState(searchParams.get('hasDiscount') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Sync state with URL query parameters
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setRating(searchParams.get('rating') || '');
    setInStock(searchParams.get('inStock') === 'true');
    setHasDiscount(searchParams.get('hasDiscount') === 'true');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Load Categories for filter sidebar
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) setCategories(res.data);
      } catch (err) {
        console.warn('Could not load categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on current filters
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          sort,
        };
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (rating) params.rating = rating;
        if (inStock) params.inStock = 'true';
        if (hasDiscount) params.hasDiscount = 'true';

        const res = await productService.getProducts(params);
        if (res.success && res.data) {
          setProducts(res.data);
          setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, sort, category, keyword, minPrice, maxPrice, rating, inStock, hasDiscount]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] !== undefined && newParams[key] !== '') {
        updated.set(key, newParams[key]);
      } else {
        updated.delete(key);
      }
    });
    updated.set('page', '1'); // Reset to page 1 on filter modification
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    setHasDiscount(false);
    setSort('newest');
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '32px 20px 60px 20px' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>
              {t('shop.explore')}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('shop.itemCount', { count: pagination.total })}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.5px',
            }}
          >
            {category
              ? t('shop.collection', { name: categoryName(categories.find((c) => c.slug === category), t) || t('shop.department') })
              : keyword
              ? t('shop.resultsFor', { term: keyword })
              : t('shop.catalogTitle')}
          </h1>
        </div>

        {/* Quick Filter Tag Pills (Shein-Style Instant Filtering) */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '24px',
            whiteSpace: 'nowrap',
          }}
          className="no-scrollbar"
        >
          <button
            onClick={() => updateFilters({ hasDiscount: hasDiscount ? '' : 'true' })}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: hasDiscount ? '1px solid #ff1361' : '1px solid var(--border-subtle)',
              backgroundColor: hasDiscount ? '#ff1361' : 'var(--bg-surface)',
              color: hasDiscount ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)',
            }}
          >
            <span>⚡ {t('footer.flashDeals')}</span>
          </button>

          <button
            onClick={() => updateFilters({ inStock: inStock ? '' : 'true' })}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: inStock ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: inStock ? 'var(--accent)' : 'var(--bg-surface)',
              color: inStock ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)',
            }}
          >
            <span>● {t('shop.inStockOnly')}</span>
          </button>

          <button
            onClick={() => updateFilters({ maxPrice: maxPrice === '100' ? '' : '100' })}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: maxPrice === '100' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: maxPrice === '100' ? 'var(--accent)' : 'var(--bg-surface)',
              color: maxPrice === '100' ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            {t('shop.under100')}
          </button>

          <button
            onClick={() => updateFilters({ rating: rating === '4' ? '' : '4' })}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: rating === '4' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: rating === '4' ? 'var(--accent)' : 'var(--bg-surface)',
              color: rating === '4' ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            ★ {t('shop.highRating')}
          </button>

          <button
            onClick={() => updateFilters({ sort: 'popular' })}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: sort === 'popular' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: sort === 'popular' ? 'var(--accent)' : 'var(--bg-surface)',
              color: sort === 'popular' ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            👑 {t('header.bestSellers')}
          </button>
        </div>

        {/* Main Grid: Sidebar + Products */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Sidebar */}
          <aside
            className="card"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('shop.filters')}</h3>
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t('shop.resetAll')}
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="input-group">
              <label className="input-label">Keywords</label>
              <input
                type="text"
                className="input-field"
                placeholder={t('shop.searchPlaceholder')}
                aria-label={t('header.search')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateFilters({ keyword });
                }}
              />
            </div>

            {/* Department Categories */}
            <div style={{ marginBottom: '24px' }}>
              <label className="input-label" style={{ display: 'block', marginBottom: '10px' }}>
                {t('shop.department')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => updateFilters({ category: '' })}
                  style={{
                    textAlign: 'start',
                    background: category === '' ? 'var(--bg-subtle)' : 'none',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: category === '' ? 800 : 500,
                    color: category === '' ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {t('header.allCategories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilters({ category: cat.slug })}
                    style={{
                      textAlign: 'start',
                      background: category === cat.slug ? 'var(--bg-subtle)' : 'none',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      fontWeight: category === cat.slug ? 800 : 500,
                      color: category === cat.slug ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {categoryName(cat, t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '24px' }}>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                {t('shop.priceRange')}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder={t('shop.min')}
                  aria-label={t('shop.min')}
                  className="input-field"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder={t('shop.max')}
                  aria-label={t('shop.max')}
                  className="input-field"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>
              <button
                onClick={() => updateFilters({ minPrice, maxPrice })}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {t('shop.applyPrice')}
              </button>
            </div>

            {/* Ratings Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                {t('shop.customerRating')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateFilters({ rating: rating === stars.toString() ? '' : stars.toString() })}
                    style={{
                      textAlign: 'start',
                      background: rating === stars.toString() ? 'var(--bg-subtle)' : 'none',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      fontWeight: rating === stars.toString() ? 700 : 400,
                    }}
                  >
                    {'★'.repeat(stars)} {t('shop.andUp')}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Listing Area */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Toolbar */}
            <div
              className="card"
              style={{
                padding: '14px 20px',
                marginBottom: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('shop.pageOf', { page: pagination.page, total: pagination.totalPages })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {t('shop.sortBy')}
                </label>
                <select
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-active)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <option value="newest">✨ {t('shop.sortNewest')}</option>
                  <option value="popular">👑 {t('shop.sortPopular')}</option>
                  <option value="price-asc">💵 {t('shop.sortPriceAsc')}</option>
                  <option value="price-desc">💎 {t('shop.sortPriceDesc')}</option>
                  <option value="top-rated">⭐ {t('shop.sortRating')}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={t('shop.noResultsTitle')}
                description={t('shop.noResultsText')}
                actionText={t('shop.clearFilters')}
                onAction={handleClearFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '48px',
                }}
              >
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: (pagination.page - 1).toString() })}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {t('shop.previous')}
                </button>

                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isActive = pagination.page === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateFilters({ page: pNum.toString() })}
                      className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-sm`}
                      style={{ minWidth: '38px', padding: '8px 12px', borderRadius: 'var(--radius-full)' }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilters({ page: (pagination.page + 1).toString() })}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {t('shop.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Shop;
