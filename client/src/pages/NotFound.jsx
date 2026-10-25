import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const NotFound = () => {
  const t = useT();
  return (
    <MainLayout>
      <div
        className="container"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '8rem',
              fontWeight: 900,
              lineHeight: 1,
              color: 'var(--accent)',
              letterSpacing: '-2px',
              marginBottom: '8px',
            }}
          >
            404
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            {t('notFound.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
            {t('notFound.text')}
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '14px 32px' }}>
            {t('notFound.back')}
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
