import React, { useState, useEffect } from 'react';
import SmartLink from '../common/SmartLink';
import { useSettings } from '../../context/SettingsContext';
import formatCurrency from '../../utils/formatCurrency';
import { useT } from '../../context/LanguageContext';

// Built-in slides, shown until the admin adds slides in Site Settings → Homepage banners
const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'hero.s1.tag',
    headline: 'hero.s1.headline',
    highlight: 'hero.s1.highlight',
    description: 'hero.s1.description',
    ctaPrimary: 'hero.s1.ctaPrimary',
    linkPrimary: '/shop?hasDiscount=true',
    ctaSecondary: 'hero.s1.ctaSecondary',
    linkSecondary: '/shop?category=electronics',
    badge: 'hero.s1.badge',
    accentColor: '#2563eb',
    gradient: 'radial-gradient(circle at 80% 30%, rgba(37, 99, 235, 0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255, 19, 97, 0.15), transparent 50%)',
    featuredProduct: {
      name: 'Samsung Galaxy S24 Ultra',
      price: '$1,149.99',
      originalPrice: '$1,299.99',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=80',
      badgeText: 'hero.s1.productBadge',
    },
  },
  {
    id: 2,
    tag: 'hero.s2.tag',
    headline: 'hero.s2.headline',
    highlight: 'hero.s2.highlight',
    description: 'hero.s2.description',
    ctaPrimary: 'hero.s2.ctaPrimary',
    linkPrimary: '/shop?category=fashion',
    ctaSecondary: 'hero.s2.ctaSecondary',
    linkSecondary: '/shop?brand=ABDULL+Atelier',
    badge: 'hero.s2.badge',
    accentColor: '#ff1361',
    gradient: 'radial-gradient(circle at 80% 30%, rgba(255, 19, 97, 0.22), transparent 60%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.18), transparent 50%)',
    featuredProduct: {
      name: 'Luxury Classic Quilted Handbag',
      price: '$750.00',
      originalPrice: '$890.00',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80',
      badgeText: 'hero.s2.productBadge',
    },
  },
  {
    id: 3,
    tag: 'hero.s3.tag',
    headline: 'hero.s3.headline',
    highlight: 'hero.s3.highlight',
    description: 'hero.s3.description',
    ctaPrimary: 'hero.s3.ctaPrimary',
    linkPrimary: '/shop?category=gaming',
    ctaSecondary: 'hero.s3.ctaSecondary',
    linkSecondary: '/shop?sort=popular',
    badge: 'hero.s3.badge',
    accentColor: '#10b981',
    gradient: 'radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.2), transparent 50%)',
    featuredProduct: {
      name: 'Sony PlayStation 5 Slim Console',
      price: '$499.99',
      originalPrice: '$549.99',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80',
      badgeText: 'hero.s3.productBadge',
    },
  },
];

const gradientFor = (hex) =>
  `radial-gradient(circle at 80% 30%, ${hex}40, transparent 60%), radial-gradient(circle at 20% 80%, rgba(255, 19, 97, 0.15), transparent 50%)`;

const HeroSlider = () => {
  const t = useT();
  const { settings, localized } = useSettings();

  // Admin slides store their text per language; built-in slides store translation keys
  const slides = settings.heroSlides.length
    ? settings.heroSlides.map((h) => ({
        tag: localized(h.tag),
        headline: localized(h.headline),
        highlight: localized(h.highlight),
        description: localized(h.description),
        badge: localized(h.badge),
        ctaPrimary: localized(h.ctaPrimary),
        linkPrimary: h.linkPrimary || '/shop',
        ctaSecondary: localized(h.ctaSecondary),
        linkSecondary: h.linkSecondary || '/shop',
        accentColor: h.accentColor || '#2563eb',
        gradient: gradientFor(h.accentColor || '#2563eb'),
        featuredProduct: h.productImage
          ? {
              name: h.productName,
              image: h.productImage,
              price: h.productPrice ? formatCurrency(h.productPrice) : '',
              originalPrice: h.productOriginalPrice > h.productPrice ? formatCurrency(h.productOriginalPrice) : '',
              badgeText: localized(h.productBadge),
              link: h.productLink || h.linkPrimary || '/shop',
            }
          : null,
      }))
    : DEFAULT_SLIDES;
  const text = (v) => (typeof v === 'string' && v.startsWith('hero.') ? t(v) : v || '');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = slides[currentSlide % slides.length];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 0',
        background: `${slide.gradient}, var(--bg-surface)`,
        transition: 'background 0.8s ease',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '48px',
          }}
        >
          {/* Left Text Content */}
          <div style={{ maxWidth: '640px', zIndex: 10 }}>
            {/* Tag Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-glass)',
                backdropFilter: 'blur(10px)',
                color: slide.accentColor,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.8px',
                marginBottom: '18px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>{text(slide.tag)}</span>
              <span
                style={{
                  backgroundColor: slide.accentColor,
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}
              >
                {text(slide.badge)}
              </span>
            </div>

            {/* Huge Headline */}
            <h1
              className="hero-headline"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                color: 'var(--text-main)',
                marginBottom: '18px',
              }}
            >
              {text(slide.headline)} <br />
              <span
                style={{
                  backgroundImage: `linear-gradient(135deg, ${slide.accentColor}, #ff1361)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  // keep the gradient box tight to the glyphs (Arabic lines are taller)
                  display: 'inline-block',
                  paddingBlock: '0.05em',
                }}
              >
                {text(slide.highlight)}
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '540px',
              }}
            >
              {text(slide.description)}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              {text(slide.ctaPrimary) && (
              <SmartLink
                to={slide.linkPrimary}
                className="btn btn-flash"
                style={{
                  padding: '16px 36px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-neon)',
                }}
              >
                {text(slide.ctaPrimary)}
              </SmartLink>
              )}
              {text(slide.ctaSecondary) && (
              <SmartLink
                to={slide.linkSecondary}
                className="btn btn-outline"
                style={{
                  padding: '16px 28px',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-glass)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {text(slide.ctaSecondary)} →
              </SmartLink>
              )}
            </div>
          </div>

          {/* Right Product Spotlight Card (admin slides may have no product) */}
          {slide.featuredProduct && (
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '24px',
                backgroundColor: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                animation: 'fadeIn 0.5s ease',
              }}
            >
              {/* Product Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    backgroundColor: '#ff1361',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {text(slide.featuredProduct.badgeText)}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--success)' }}>
                  ● {t('product.inStockReady')}
                </span>
              </div>

              {/* Product Visual */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '260px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  marginBottom: '18px',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <img
                  src={slide.featuredProduct.image}
                  alt={slide.featuredProduct.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                />
              </div>

              {/* Title & Pricing */}
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                  marginBottom: '10px',
                  lineHeight: 1.25,
                }}
              >
                {slide.featuredProduct.name}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {slide.featuredProduct.price}
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {slide.featuredProduct.originalPrice}
                  </span>
                </div>

                <SmartLink
                  to={slide.featuredProduct.link || slide.linkPrimary}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px' }}
                >
                  {t('hero.claimDeal')}
                </SmartLink>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Carousel Slide Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '36px',
          }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '36px' : '10px',
                height: '10px',
                borderRadius: '9999px',
                backgroundColor: currentSlide === index ? slide.accentColor : 'var(--border-active)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
