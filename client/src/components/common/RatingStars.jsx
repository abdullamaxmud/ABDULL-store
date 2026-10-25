import React from 'react';

const RatingStars = ({ rating = 0, numReviews, size = 16, showScore = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <span key={i} style={{ color: '#f59e0b', fontSize: `${size}px` }}>
          ★
        </span>
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <span key={i} style={{ color: '#f59e0b', fontSize: `${size}px` }}>
          ★
        </span>
      );
    } else {
      stars.push(
        <span key={i} style={{ color: 'var(--border-active)', fontSize: `${size}px` }}>
          ★
        </span>
      );
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>
      {showScore && (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {rating.toFixed(1)}
        </span>
      )}
      {numReviews !== undefined && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
