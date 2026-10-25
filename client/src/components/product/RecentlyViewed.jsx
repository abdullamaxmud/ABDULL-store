import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useT } from '../../context/LanguageContext';
import { getRecentlyViewed, clearRecentlyViewed, RECENTLY_VIEWED_EVENT } from '../../utils/recentlyViewed';

/**
 * Horizontal strip of the shopper's recently viewed products.
 * Renders nothing when there is no history (or only the excluded product).
 */
const RecentlyViewed = ({ excludeId, title }) => {
  const t = useT();
  const [items, setItems] = useState(() => getRecentlyViewed());

  useEffect(() => {
    const sync = () => setItems(getRecentlyViewed());
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const visible = items.filter((p) => p._id !== excludeId);
  if (visible.length === 0) return null;

  return (
    <section style={{ padding: '48px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px', gap: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900 }}>{title || t('product.recentlyViewed')}</h2>
          <button
            onClick={clearRecentlyViewed}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {t('product.clearHistory')}
          </button>
        </div>
        <div className="product-rail no-scrollbar">
          {visible.map((p) => (
            <div key={p._id} className="product-rail-item">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
