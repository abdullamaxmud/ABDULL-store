import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import EmptyState from '../components/common/EmptyState';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const Wishlist = () => {
  const { wishlist, wishlistCount } = useWishlist();
  const t = useT();

  if (wishlistCount === 0) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 20px' }}>
          <EmptyState
            icon="♡"
            title={t('wishlist.emptyTitle')}
            description={t('wishlist.emptyText')}
            actionText={t('wishlist.explore')}
            actionLink="/shop"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {t('wishlist.title', { count: wishlistCount })}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('wishlist.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Wishlist;
