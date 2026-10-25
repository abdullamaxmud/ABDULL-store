import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext';
import { categoryName } from '../../i18n/catalog';

const CategoryStories = ({ categories = [] }) => {
  const t = useT();
  // Curated story tags to include special event pills like Flash Sale & New In
  const specialStories = [
    {
      id: 'flash-sale',
      name: t('home.storyFlash'),
      badge: '🔥',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80',
      link: '/shop?hasDiscount=true',
      isHot: true,
    },
    {
      id: 'best-sellers',
      name: t('header.bestSellers'),
      badge: '👑',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80',
      link: '/shop?sort=popular',
      isHot: true,
    },
    {
      id: 'new-in',
      name: t('home.storyNew'),
      badge: '✨',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=300&q=80',
      link: '/shop?sort=newest',
      isHot: true,
    },
  ];

  return (
    <section
      style={{
        padding: '18px 0',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        <div className="story-scroll-container no-scrollbar">
          {/* Special Hot Stories */}
          {specialStories.map((item) => (
            <Link key={item.id} to={item.link} className="story-item">
              <div
                className="story-ring"
                style={{
                  background: 'linear-gradient(135deg, #ff1361, #ff6b08)',
                  boxShadow: '0 4px 14px rgba(255, 19, 97, 0.35)',
                }}
              >
                <img src={item.image} alt={item.name} className="story-avatar" />
              </div>
              <span className="story-label" style={{ color: '#ff1361', fontWeight: 800 }}>
                {item.badge} {item.name}
              </span>
            </Link>
          ))}

          {/* Catalog Categories */}
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="story-item"
            >
              <div
                className="story-ring"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                }}
              >
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80'}
                  alt={categoryName(cat, t)}
                  className="story-avatar"
                />
              </div>
              <span className="story-label">{categoryName(cat, t)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryStories;
