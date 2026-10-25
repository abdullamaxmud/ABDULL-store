import React, { useEffect, useState } from 'react';
import productService from '../../services/productService';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { useT } from '../../context/LanguageContext';

const PAGE_SIZE = 12;

/**
 * Shein/Amazon-style endless discovery grid: pages through the full catalog
 * (best sellers first) with a "Load more" button.
 */
const MoreToLove = () => {
  const t = useT();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ page, limit: PAGE_SIZE, sort: 'popular' });
        if (!cancelled && res.success) {
          setProducts((prev) => {
            const seen = new Set(prev.map((p) => p._id));
            return [...prev, ...res.data.filter((p) => !seen.has(p._id))];
          });
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.warn('Could not load discovery feed:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (!loading && products.length === 0) return null;

  return (
    <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 900 }}>
            {t('home.moreToLove')}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('home.moreToLoveText')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid-dense">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {loading && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
        </div>

        {page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button className="btn btn-outline" disabled={loading} onClick={() => setPage((p) => p + 1)} style={{ minWidth: '220px' }}>
              {loading ? t('common.loading') : t('home.loadMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MoreToLove;
